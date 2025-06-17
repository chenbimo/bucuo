/**
 * Logger 通用日志库 - 极简版
 */

import { formatDate } from '../utils/formatDate.js';
import path from 'path';

export class Logger {
    constructor(config = {}) {
        // 基础配置
        this.level = config.level || 'info';
        this.levels = {
            error: 0,
            warn: 1,
            info: 2,
            debug: 3
        };

        // 输出配置
        this.enableConsole = config.enableConsole !== false;
        this.logDir = config.logDir || 'logs';
        this.maxFileSize = config.maxFileSize || 50 * 1024 * 1024; // 50MB

        // 初始化日志目录
        try {
            Bun.write(path.join(this.logDir, '.gitkeep'), '');
        } catch (error) {
            console.error('创建日志目录失败:', error);
        }
    }

    formatMessage(level, message, meta = {}) {
        const timestamp = formatDate();
        const levelStr = level.toUpperCase().padStart(5);

        let msg = `[${timestamp}] ${levelStr} ${message}`;

        if (Object.keys(meta).length > 0) {
            msg += `\n${JSON.stringify(meta, null, 2)}`;
        }

        return msg;
    }

    async log(level, message, meta = {}) {
        // 内联 shouldLog 逻辑，检查日志级别
        if (this.levels[level] > this.levels[this.level]) return;

        const formattedMessage = this.formatMessage(level, message, meta);

        // 控制台输出
        if (this.enableConsole) {
            console.log(formattedMessage);
        }

        await this.writeToFile(formattedMessage);
    }

    async writeToFile(message) {
        try {
            // 获取当前日志文件名
            const today = new Date().toISOString().split('T')[0];
            const logFile = path.join(this.logDir, `app-${today}.log`);

            // 检查文件大小
            let fileSize = 0;
            try {
                const file = Bun.file(logFile);
                if (await file.exists()) {
                    fileSize = file.size;
                }
            } catch {
                // 文件不存在，忽略错误
            }

            // 文件大小超过限制则轮转
            if (fileSize >= this.maxFileSize) {
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                const rotatedName = logFile.replace(/\.log$/, `-${timestamp}.log`);

                try {
                    const content = await Bun.file(logFile).text();
                    await Bun.write(rotatedName, content);
                    await Bun.write(logFile, ''); // 清空原文件
                } catch (error) {
                    console.error('日志文件轮转失败:', error);
                }
            }

            // 追加日志
            await Bun.write(logFile, {
                text: message + '\n',
                mode: 'append'
            });
        } catch (error) {
            console.error('写入日志文件失败:', error);
        }
    }

    // 便捷方法
    async error(message, meta = {}) {
        await this.log('error', message, meta);
    }

    async warn(message, meta = {}) {
        await this.log('warn', message, meta);
    }

    async info(message, meta = {}) {
        await this.log('info', message, meta);
    }

    async debug(message, meta = {}) {
        await this.log('debug', message, meta);
    }
}
