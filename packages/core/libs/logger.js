/**
 * Logger 日志库
 */

import { formatDate, parseRequest } from '../util.js';
import { promises as fs } from 'fs';
import path from 'path';

export class Logger {
    constructor(config = {}) {
        this.level = config.level || 'info';
        this.levels = {
            error: 0,
            warn: 1,
            info: 2,
            debug: 3
        };
        this.colors = {
            error: '\x1b[31m', // 红色
            warn: '\x1b[33m', // 黄色
            info: '\x1b[36m', // 青色
            debug: '\x1b[37m', // 白色
            reset: '\x1b[0m'
        };

        // 文件输出配置
        this.enableFile = config.enableFile !== false; // 默认启用文件输出
        this.enableConsole = config.enableConsole !== false; // 默认启用控制台输出
        this.logDir = config.logDir || 'logs';
        this.maxFileSize = config.maxFileSize || 50 * 1024 * 1024; // 50MB

        // 写入队列和当前文件状态
        this.writeQueue = [];
        this.isWriting = false;
        this.currentLogFile = null;
        this.currentFileSize = 0;
        this.currentDate = null;

        // 初始化日志目录
        if (this.enableFile) {
            this.initLogDir();
        }
    }

    async initLogDir() {
        try {
            await fs.mkdir(this.logDir, { recursive: true });
        } catch (error) {
            console.error('创建日志目录失败:', error);
        }
    }

    shouldLog(level) {
        return this.levels[level] <= this.levels[this.level];
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

    formatConsoleMessage(level, message, meta = {}) {
        const timestamp = formatDate();
        const levelStr = level.toUpperCase().padStart(5);
        const color = this.colors[level] || '';
        const reset = this.colors.reset;

        let msg = `${color}[${timestamp}] ${levelStr}${reset} ${message}`;

        if (Object.keys(meta).length > 0) {
            msg += `\n${JSON.stringify(meta, null, 2)}`;
        }

        return msg;
    }

    getCurrentLogFileName() {
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        return path.join(this.logDir, `app-${today}.log`);
    }

    async getFileSize(filePath) {
        try {
            const stats = await fs.stat(filePath);
            return stats.size;
        } catch {
            return 0;
        }
    }

    async shouldRotateFile() {
        const today = new Date().toISOString().split('T')[0];

        // 日期变更，需要轮转
        if (this.currentDate !== today) {
            this.currentDate = today;
            this.currentLogFile = this.getCurrentLogFileName();
            this.currentFileSize = await this.getFileSize(this.currentLogFile);
            return false; // 新文件，不需要轮转
        }

        // 文件大小超限，需要轮转
        return this.currentFileSize >= this.maxFileSize;
    }

    async rotateLogFile() {
        if (!this.currentLogFile) return;

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const ext = path.extname(this.currentLogFile);
        const base = path.basename(this.currentLogFile, ext);
        const dir = path.dirname(this.currentLogFile);

        const rotatedName = path.join(dir, `${base}-${timestamp}${ext}`);

        try {
            await fs.rename(this.currentLogFile, rotatedName);
            this.currentFileSize = 0;
        } catch (error) {
            console.error('日志文件轮转失败:', error);
        }
    }

    async writeToFile(message) {
        if (!this.enableFile) return;

        try {
            if (await this.shouldRotateFile()) {
                await this.rotateLogFile();
            }

            if (!this.currentLogFile) {
                this.currentDate = new Date().toISOString().split('T')[0];
                this.currentLogFile = this.getCurrentLogFileName();
                this.currentFileSize = await this.getFileSize(this.currentLogFile);
            }

            const logLine = message + '\n';
            await fs.appendFile(this.currentLogFile, logLine);
            this.currentFileSize += Buffer.byteLength(logLine);
        } catch (error) {
            console.error('写入日志文件失败:', error);
        }
    }

    async processWriteQueue() {
        if (this.isWriting || this.writeQueue.length === 0) return;

        this.isWriting = true;

        try {
            while (this.writeQueue.length > 0) {
                const message = this.writeQueue.shift();
                await this.writeToFile(message);
            }
        } finally {
            this.isWriting = false;
        }
    }

    queueWrite(message) {
        this.writeQueue.push(message);
        // 使用 setImmediate 确保不阻塞当前执行
        setImmediate(() => this.processWriteQueue());
    }

    log(level, message, meta = {}) {
        if (!this.shouldLog(level)) return;

        const plainMessage = this.formatMessage(level, message, meta);

        // 控制台输出（带颜色）
        if (this.enableConsole) {
            const coloredMessage = this.formatConsoleMessage(level, message, meta);
            console.log(coloredMessage);
        }

        // 文件输出（异步队列）
        if (this.enableFile) {
            this.queueWrite(plainMessage);
        }
    }

    error(message, meta = {}) {
        this.log('error', message, meta);
    }

    warn(message, meta = {}) {
        this.log('warn', message, meta);
    }

    info(message, meta = {}) {
        this.log('info', message, meta);
    }

    debug(message, meta = {}) {
        this.log('debug', message, meta);
    }

    request(context) {
        const { request } = context;
        const requestInfo = parseRequest(request);

        this.info(`${requestInfo.method} ${requestInfo.pathname}`, {
            ip: requestInfo.ip,
            userAgent: requestInfo.userAgent,
            query: requestInfo.query
        });
    }

    response(context) {
        const { request, response, startTime } = context;
        const duration = Date.now() - startTime;
        const requestInfo = parseRequest(request);

        const level = response.status >= 400 ? 'error' : 'info';
        this.log(level, `${requestInfo.method} ${requestInfo.pathname} ${response.status} ${duration}ms`, {
            ip: requestInfo.ip,
            status: response.status,
            duration: `${duration}ms`
        });
    }

    error_handler(context) {
        const { request, error } = context;
        const requestInfo = parseRequest(request);

        this.error(`${requestInfo.method} ${requestInfo.pathname} ERROR`, {
            ip: requestInfo.ip,
            error: error.message,
            stack: error.stack
        });
    }

    // 优雅关闭，确保队列中的日志都写入完成
    async close() {
        if (this.enableFile) {
            await this.processWriteQueue();
        }
    }
}
