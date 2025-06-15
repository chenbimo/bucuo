/**
 * Logger 日志库
 */

import { formatDate, parseRequest } from '../util.js';

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
    }

    shouldLog(level) {
        return this.levels[level] <= this.levels[this.level];
    }

    formatMessage(level, message, meta = {}) {
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

    log(level, message, meta = {}) {
        if (this.shouldLog(level)) {
            console.log(this.formatMessage(level, message, meta));
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
}
