import path from 'node:path';
import { ruleSplit } from '../utils/ruleSplit.js';

export default async () => {
    try {
        const schemaGlob = new Bun.Glob('*.json');
        const schemaDir = path.join(import.meta.dir, '..', 'schema');

        // 统计信息
        let totalFiles = 0;
        let totalRules = 0;
        let validFiles = 0;
        let invalidFiles = 0;

        for await (const file of schemaGlob.scan({
            cwd: schemaDir,
            absolute: true,
            onlyFiles: true
        })) {
            totalFiles++;
            const fileName = path.basename(file);

            try {
                // 读取并解析 JSON 文件
                const schema = await Bun.file(file).json();
                let fileValid = true;
                let fileRules = 0;

                // 检查 schema 中的每个验证规则
                for (const [fieldName, rule] of Object.entries(schema)) {
                    fileRules++;
                    totalRules++;

                    // 验证规则格式
                    const ruleParts = ruleSplit(rule);

                    if (ruleParts.length !== 5) {
                        console.error(`❌ 字段 ${fieldName} 的验证规则错误，应包含5个部分，但包含 ${ruleParts.length} 个部分`);
                        fileValid = false;
                        continue;
                    }

                    const [name, type, minStr, maxStr, spec] = ruleParts;

                    // 验证类型（必须严格使用小写类型名称）
                    const validTypes = ['number', 'string', 'array'];
                    if (!validTypes.includes(type)) {
                        console.error(`❌ 字段 ${fieldName} 的类型 ${type} 不支持，应为小写的 number、string 或 array`);
                        fileValid = false;
                        continue;
                    }

                    // 验证最小值/最大值
                    if (minStr !== 'null' && isNaN(parseInt(minStr))) {
                        console.error(`❌ 字段 ${fieldName} 的最小值 ${minStr} 应为数字或 "null"`);
                        fileValid = false;
                        continue;
                    }

                    if (maxStr !== 'null' && isNaN(parseInt(maxStr))) {
                        console.error(`❌ 字段 ${fieldName} 的最大值 ${maxStr} 应为数字或 "null"`);
                        fileValid = false;
                        continue;
                    }

                    // 验证特殊规则
                    if (spec !== 'null') {
                        if (type === 'number' && spec.includes('=')) {
                            // 数字计算表达式应包含安全字符
                            const safePattern = /^[x\d\+\-\*\/\(\)\.\s\%]+$/;
                            const expressionPart = spec.split('=')[0].trim();

                            if (!safePattern.test(expressionPart)) {
                                console.error(`❌ 字段 ${fieldName} 的表达式 ${expressionPart} 包含不安全的字符`);
                                fileValid = false;
                                continue;
                            }

                            // 验证等号右侧是否为数字
                            const rightPart = spec.split('=')[1].trim();
                            if (isNaN(parseFloat(rightPart))) {
                                console.error(`❌ 字段 ${fieldName} 的计算规则右边必须是数字，而不是 ${rightPart}`);
                                fileValid = false;
                                continue;
                            }
                        } else if (type === 'string' || type === 'array') {
                            // 尝试编译正则表达式以检查是否有效
                            try {
                                new RegExp(spec);
                            } catch (e) {
                                console.error(`❌ 字段 ${fieldName} 的正则表达式 ${spec} 无效: ${e.message}`);
                                fileValid = false;
                                continue;
                            }
                        }
                    }
                }

                if (fileValid) {
                    console.log(`✅ Schema ${fileName} 验证通过 (${fileRules} 条规则)`);
                    validFiles++;
                } else {
                    console.error(`❌ Schema ${fileName} 验证失败`);
                    invalidFiles++;
                }
            } catch (error) {
                console.error(`❌ Schema ${fileName} 解析失败: ${error.message}`);
                invalidFiles++;
            }
        }

        console.log('📊 Schema 文件检查统计:');
        console.log(`总文件数: ${totalFiles}, 有效: ${validFiles}, 无效: ${invalidFiles}`);
        console.log(`总规则数: ${totalRules}`);

        if (invalidFiles > 0) {
            console.error('⚠️ 存在无效的 schema 文件，请修正后再启动服务');
            // 您可以根据需要决定是否抛出异常阻止服务启动
            // throw new Error('Schema 验证失败');
            return false;
        } else {
            console.log('🎉 所有 Schema 文件验证通过!');
            return true;
        }
    } catch (error) {
        console.error('❌ Schema 检查过程中出错:', error);
        return false;
    }
};
