/**
 * 文件上传插件
 */

import path from 'path';
import { uuid, ensureDir } from '../util.js';
import { Plugin } from '../libs/plugin.js';

export default Plugin({
    name: 'upload',
    order: 5,

    async onRequest(context) {
        const { request, config } = context;

        // 只处理文件上传请求
        const contentType = request.headers.get('content-type') || '';
        if (!contentType.includes('multipart/form-data')) {
            return;
        }

        try {
            const formData = await request.formData();
            const files = [];
            const fields = {};

            for (const [key, value] of formData.entries()) {
                if (value instanceof File) {
                    // 验证文件大小
                    if (value.size > uploadConfig.maxSize) {
                        context.response.status = 413;
                        context.response.json({
                            error: '文件过大',
                            message: `文件大小超过 ${uploadConfig.maxSize} 字节`
                        });
                        context.response.sent = true;
                        return;
                    }

                    // 验证文件类型
                    if (uploadConfig.allowedTypes && uploadConfig.allowedTypes.length > 0) {
                        const isAllowed = uploadConfig.allowedTypes.some((type) => {
                            if (type.endsWith('/*')) {
                                return value.type.startsWith(type.slice(0, -1));
                            }
                            return value.type === type;
                        });

                        if (!isAllowed) {
                            context.response.status = 415;
                            context.response.json({
                                error: '不支持的媒体类型',
                                message: `不允许的文件类型 ${value.type}`
                            });
                            context.response.sent = true;
                            return;
                        }
                    }

                    // 生成唯一文件名
                    const ext = path.extname(value.name);
                    const filename = `${uuid()}${ext}`;
                    const filePath = path.join(uploadConfig.uploadDir, filename);

                    // 确保上传目录存在
                    await ensureDir(uploadConfig.uploadDir);

                    // 保存文件 - 使用 Bun 的文件 API
                    const buffer = await value.arrayBuffer();
                    const success = await Bun.write(filePath, new Uint8Array(buffer));

                    if (success) {
                        files.push({
                            fieldName: key,
                            originalName: value.name,
                            filename: filename,
                            path: filePath,
                            size: value.size,
                            mimetype: value.type
                        });
                    } else {
                        context.response.status = 500;
                        context.response.json({
                            error: '上传失败',
                            message: '保存文件失败'
                        });
                        context.response.sent = true;
                        return;
                    }
                } else {
                    // 普通字段
                    fields[key] = value;
                }
            }

            // 将文件和字段信息添加到上下文
            context.files = files;
            context.fields = fields;
            context.body = { ...fields, files };
        } catch (error) {
            context.response.status = 400;
            context.response.json({
                error: '上传错误',
                message: error.message
            });
            context.response.sent = true;
        }
    }
});
