#!/usr/bin/env bun

/**
 * 测试 Bunfly API 导入
 */

console.log('测试开始...');

try {
    console.log('导入 BunflyAPI...');
    const { BunflyAPI } = await import('./main.js');

    console.log('创建 BunflyAPI 实例...');
    const app = new BunflyAPI({
        port: 3001,
        host: 'localhost'
    });

    console.log('✅ 导入和实例化成功！');
    process.exit(0);
} catch (error) {
    console.error('❌ 错误:', error.message);
    console.error('详细错误:', error);
    process.exit(1);
}
