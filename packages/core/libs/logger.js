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
            // 确保日志目录存在
            try {
                await Bun.mkdir(this.logDir, { recursive: true });
            } catch (err) {
                if (err.code !== 'EEXIST') {
                    console.error('创建日志目录失败:', err);
                }
            }

            // 获取当前日志文件名
            const today = new Date().toISOString().split('T')[0];
            const baseLogFile = path.join(this.logDir, `${today}.log`);

            // 先检查基础日志文件
            let currentLogFile = baseLogFile;
            const baseFile = Bun.file(baseLogFile);

            if ((await baseFile.exists()) && baseFile.size >= this.maxFileSize) {
                // 基础文件已满，查找今天日期的最大序号文件
                let maxIndex = 0;
                const files = await Bun.readdir(this.logDir);
                const fileNamePattern = `${today}\\.(\\d+)\\.log`;

                for (const fileName of files) {
                    const match = fileName.match(new RegExp(fileNamePattern));
                    if (match) {
                        const index = parseInt(match[1], 10);
                        if (index > maxIndex) maxIndex = index;
                    }
                }

                if (maxIndex > 0) {
                    // 检查最大序号文件是否已满
                    const maxIndexFile = Bun.file(path.join(this.logDir, `${today}.${maxIndex}.log`));
                    if ((await maxIndexFile.exists()) && maxIndexFile.size < this.maxFileSize) {
                        // 最大序号文件未满，继续使用它
                        currentLogFile = path.join(this.logDir, `${today}.${maxIndex}.log`);
                    } else {
                        // 最大序号文件已满，创建新的序号文件
                        currentLogFile = path.join(this.logDir, `${today}.${maxIndex + 1}.log`);
                    }
                } else {
                    // 没有序号文件，创建第一个序号文件
                    currentLogFile = path.join(this.logDir, `${today}.1.log`);
                }
            }

            // 追加日志
            await Bun.write(currentLogFile, {
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
