import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        // 测试环境
        environment: 'node',

        // 测试文件匹配模式
        include: ['test/**/*{.,-}{test,spec}.{js,ts}'],

        // 排除的文件
        exclude: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/.{idea,git,cache,output,temp}/**'],

        // 全局测试设置
        globals: true,

        // 并发测试
        pool: 'threads',
        poolOptions: {
            threads: {
                singleThread: false
            }
        },

        // 超时设置
        testTimeout: 10000,
        hookTimeout: 10000,

        // 覆盖率配置
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            exclude: ['coverage/**', 'dist/**', '**/node_modules/**', '**/*.{test,spec}.{js,ts}', '**/tests/**']
        },

        // 监听模式配置
        watch: false,

        // 输出配置
        reporter: ['verbose', 'json'],
        outputFile: {
            json: './test-results.json'
        }
    }
});
