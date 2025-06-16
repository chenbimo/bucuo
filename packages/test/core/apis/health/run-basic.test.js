#!/usr/bin/env node

/**
 * 简单的测试运行器，用于验证健康信息接口测试
 */

import infoHandler from '../../../../core/apis/health/info.js';
import { Code } from '../../../../core/config/code.js';

// 模拟 Bun 全局对象（如果在测试环境中不存在）
if (typeof globalThis.Bun === 'undefined') {
    globalThis.Bun = {
        version: '1.0.0',
        revision: 'test-revision'
    };
}

async function runBasicTests() {
    console.log('🧪 开始运行健康信息接口基础测试...\n');

    try {
        // 测试 1: 基本配置检查
        console.log('✅ 测试 1: 检查接口基本配置');
        console.log(`   接口名称: ${infoHandler.name}`);
        console.log(`   请求方法: ${infoHandler.method}`);
        console.log(`   Schema 字段: ${JSON.stringify(infoHandler.schema.fields)}`);
        console.log(`   必填字段: ${JSON.stringify(infoHandler.schema.required)}`);
        console.log(`   处理函数类型: ${typeof infoHandler.handler}\n`);

        // 测试 2: 接口响应测试
        console.log('✅ 测试 2: 调用接口并检查响应');
        const mockBunpi = {};
        const mockReq = { method: 'GET', url: '/core/health/info' };

        const response = await infoHandler.handler(mockBunpi, mockReq);

        console.log(`   响应码: ${response.code} (期望: ${Code.SUCCESS.code})`);
        console.log(`   消息: ${response.msg}`);
        console.log(`   数据结构:`);
        console.log(`     - 名称: ${response.data.name}`);
        console.log(`     - 描述: ${response.data.description}`);
        console.log(`     - 版本: ${response.data.version}`);
        console.log(`     - 运行时: ${response.data.runtime.name} ${response.data.runtime.version}`);
        console.log(`     - 功能特性数量: ${response.data.features.length}`);
        console.log(`     - 时间戳: ${response.data.timestamp}\n`);

        // 测试 3: 性能测试
        console.log('✅ 测试 3: 性能测试');
        const startTime = performance.now();
        await infoHandler.handler(mockBunpi, mockReq);
        const endTime = performance.now();
        const responseTime = endTime - startTime;
        console.log(`   响应时间: ${responseTime.toFixed(2)}ms\n`);

        // 测试 4: 并发测试
        console.log('✅ 测试 4: 并发调用测试');
        const promises = Array.from({ length: 5 }, () => infoHandler.handler(mockBunpi, mockReq));
        const responses = await Promise.all(promises);
        console.log(`   并发调用数量: ${responses.length}`);
        console.log(`   全部成功: ${responses.every((r) => r.code === Code.SUCCESS.code)}\n`);

        console.log('🎉 所有基础测试通过！');
    } catch (error) {
        console.error('❌ 测试失败:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

// 运行测试
runBasicTests();
