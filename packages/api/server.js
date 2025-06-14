#!/usr/bin/env bun

/**
 * Bunfly API 服务器启动脚本
 */

import { BunflyAPI } from './main.js';

// 配置服务器
const app = new BunflyAPI({
    port: process.env.PORT || 3000,
    host: process.env.HOST || 'localhost'
});

// 添加一些自定义路由
app.get('/', async (context) => {
    return {
        message: '欢迎使用 Bunfly API',
        version: '1.0.0',
        docs: '/api/docs',
        health: '/health',
        status: '/status'
    };
});

// 错误处理
app.onError(async (context) => {
    const { error, response, logger } = context;

    if (logger) {
        logger.error('未处理的错误:', { error: error.message, stack: error.stack });
    }

    response.status = 500;
    response.json({
        error: '内部服务器错误',
        message: process.env.NODE_ENV === 'development' ? error.message : '出现了问题',
        timestamp: new Date().toISOString()
    });
});

// 优雅关闭
process.on('SIGINT', () => {
    console.log('\n👋 正在优雅关闭...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n👋 正在优雅关闭...');
    process.exit(0);
});

// 启动服务器
app.start().catch((error) => {
    console.error('❌ 服务器启动失败:', error);
    process.exit(1);
});
