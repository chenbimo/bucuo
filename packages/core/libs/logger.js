/**
 * Logger 通用日志库 - 极简版
 */

import { formatDate } from '../utils/formatDate.js';
import path from 'path';
import { mkdir, readdir } from 'node:fs/promises';

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
            const today = new Date().toISOString().split('T')[0];

            // 使用 Bun.glob() 一次性查找所有相关文件并排序
            const glob = new Bun.Glob(`${today}.*.log`);
            const files = await Array.fromAsync(glob.scan(this.logDir));
            files.sort(); // 按文件名排序，自然排序会正确处理数字

            let currentLogFile = path.join(this.logDir, `${today}.0.log`);

            // 从最后一个文件开始检查
            for (let i = files.length - 1; i >= 0; i--) {
                const filePath = path.join(this.logDir, files[i]);
                const file = Bun.file(filePath);

                if (file.size < this.maxFileSize) {
                    currentLogFile = filePath;
                    break;
                }

                // 如果是最后一个文件且已满，创建新文件
                if (i === files.length - 1) {
                    const match = files[i].match(/\.(\d+)\.log$/);
                    const nextIndex = match ? parseInt(match[1]) + 1 : 1;
                    currentLogFile = path.join(this.logDir, `${today}.${nextIndex}.log`);
                }
            }

            // 使用 Bun 的 append 模式直接写入
            await Bun.write(currentLogFile, message + '\n', { append: true });
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
