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
        message: 'Welcome to Bunfly API',
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
        logger.error('Unhandled error:', { error: error.message, stack: error.stack });
    }

    response.status = 500;
    response.json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
        timestamp: new Date().toISOString()
    });
});

// 优雅关闭
process.on('SIGINT', () => {
    console.log('\n👋 Gracefully shutting down...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n👋 Gracefully shutting down...');
    process.exit(0);
});

// 启动服务器
app.start().catch((error) => {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
});
