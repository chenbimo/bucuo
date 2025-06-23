import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import infoHandler from '../../../../core/apis/health/info.js';
import { Code } from '../../../../core/config/code.js';

// 模拟 Bun 全局对象（如果在测试环境中不存在）
if (typeof globalThis.Bun === 'undefined') {
    globalThis.Bun = {
        version: '1.0.0',
        revision: 'test-revision'
    };
}

describe('健康信息 API 测试 - /core/health/info', () => {
    let mockBunPii;
    let mockReq;

    beforeAll(() => {
        // 模拟 bunpii 实例
        mockBunPii = {
            // 可以在这里添加需要的 bunpii 方法和属性
        };

        // 模拟请求对象
        mockReq = {
            method: 'GET',
            url: '/core/health/info',
            headers: {}
        };
    });

    afterAll(() => {
        // 清理测试环境
    });

    describe('接口基本信息', () => {
        it('应该有正确的接口配置', () => {
            expect(infoHandler.name).toBe('系统信息');
            expect(infoHandler.method).toBe('get');
            expect(infoHandler.schema).toBeDefined();
            expect(infoHandler.schema.fields).toEqual([]);
            expect(infoHandler.schema.required).toEqual([]);
            expect(typeof infoHandler.handler).toBe('function');
        });
    });

    describe('接口响应测试', () => {
        it('应该返回成功的响应结构', async () => {
            const response = await infoHandler.handler(mockBunPii, mockReq);

            // 验证响应结构
            expect(response).toBeDefined();
            expect(response.code).toBe(Code.SUCCESS.code);
            expect(response.msg).toBe('系统信息获取成功');
            expect(response.data).toBeDefined();
        });

        it('应该返回正确的系统信息数据', async () => {
            const response = await infoHandler.handler(mockBunPii, mockReq);
            const { data } = response;

            // 验证基本信息
            expect(data.name).toBe('BunPii');
            expect(data.description).toBe('A universal JS backend API framework for Bun');
            expect(data.version).toBe('1.0.0');
            expect(data.timestamp).toBeDefined();
            expect(new Date(data.timestamp)).toBeInstanceOf(Date);
        });

        it('应该返回正确的运行时信息', async () => {
            const response = await infoHandler.handler(mockBunPii, mockReq);
            const { data } = response;

            // 验证运行时信息
            expect(data.runtime).toBeDefined();
            expect(data.runtime.name).toBe('Bun');
            expect(typeof data.runtime.version).toBe('string');
            expect(data.runtime.revision).toBeDefined();

            // revision 应该是字符串类型
            expect(typeof data.runtime.revision).toBe('string');

            // 验证版本号格式（应该是类似 "1.0.0" 的格式）
            expect(data.runtime.version).toMatch(/^\d+\.\d+\.\d+/);
        });

        it('应该返回正确的功能特性列表', async () => {
            const response = await infoHandler.handler(mockBunPii, mockReq);
            const { data } = response;

            // 验证功能特性
            expect(data.features).toBeDefined();
            expect(Array.isArray(data.features)).toBe(true);
            expect(data.features.length).toBeGreaterThan(0);

            // 验证预期的功能特性
            const expectedFeatures = ['Zero dependencies', 'Plugin system', 'JWT authentication', 'File upload', 'CORS support', 'Structured logging', 'Redis cache support', 'Simple routing'];

            expectedFeatures.forEach((feature) => {
                expect(data.features).toContain(feature);
            });
        });

        it('应该返回当前时间戳', async () => {
            const beforeCall = new Date().toISOString();
            const response = await infoHandler.handler(mockBunPii, mockReq);
            const afterCall = new Date().toISOString();

            const { data } = response;
            expect(data.timestamp).toBeDefined();

            // 验证时间戳在合理范围内（调用前后的时间范围内）
            expect(data.timestamp >= beforeCall).toBe(true);
            expect(data.timestamp <= afterCall).toBe(true);
        });
    });

    describe('接口性能测试', () => {
        it('应该在合理时间内响应', async () => {
            const startTime = performance.now();
            await infoHandler.handler(mockBunPii, mockReq);
            const endTime = performance.now();

            const responseTime = endTime - startTime;
            // 响应时间应该少于100毫秒
            expect(responseTime).toBeLessThan(100);
        });

        it('应该支持并发调用', async () => {
            const promises = Array.from({ length: 10 }, () => infoHandler.handler(mockBunPii, mockReq));

            const responses = await Promise.all(promises);

            // 所有响应都应该成功
            responses.forEach((response) => {
                expect(response.code).toBe(Code.SUCCESS.code);
                expect(response.data).toBeDefined();
            });
        });
    });

    describe('边界条件测试', () => {
        it('应该处理空的 bunpii 实例', async () => {
            const response = await infoHandler.handler(null, mockReq);

            // 即使 bunpii 为空，也应该返回正确的响应
            expect(response.code).toBe(Code.SUCCESS.code);
            expect(response.data).toBeDefined();
        });

        it('应该处理空的请求对象', async () => {
            const response = await infoHandler.handler(mockBunPii, null);

            // 即使请求对象为空，也应该返回正确的响应
            expect(response.code).toBe(Code.SUCCESS.code);
            expect(response.data).toBeDefined();
        });

        it('应该处理无参数调用', async () => {
            const response = await infoHandler.handler();

            // 即使没有参数，也应该返回正确的响应
            expect(response.code).toBe(Code.SUCCESS.code);
            expect(response.data).toBeDefined();
        });
    });

    describe('数据一致性测试', () => {
        it('多次调用应该返回一致的静态信息', async () => {
            const response1 = await infoHandler.handler(mockBunPii, mockReq);
            const response2 = await infoHandler.handler(mockBunPii, mockReq);

            // 静态信息应该保持一致
            expect(response1.data.name).toBe(response2.data.name);
            expect(response1.data.description).toBe(response2.data.description);
            expect(response1.data.version).toBe(response2.data.version);
            expect(response1.data.runtime.name).toBe(response2.data.runtime.name);
            expect(response1.data.runtime.version).toBe(response2.data.runtime.version);
            expect(response1.data.features).toEqual(response2.data.features);
        });

        it('时间戳应该在每次调用时更新', async () => {
            const response1 = await infoHandler.handler(mockBunPii, mockReq);

            // 等待一小段时间确保时间戳不同
            await new Promise((resolve) => setTimeout(resolve, 10));

            const response2 = await infoHandler.handler(mockBunPii, mockReq);

            // 时间戳应该不同
            expect(response1.data.timestamp).not.toBe(response2.data.timestamp);
            expect(new Date(response2.data.timestamp).getTime()).toBeGreaterThan(new Date(response1.data.timestamp).getTime());
        });
    });
});
