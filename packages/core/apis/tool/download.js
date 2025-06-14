/**
 * 文件下载 API - /core/tool/download/:filename
 */

import path from 'path';
import { createGetAPI, createResponse, ERROR_CODES } from '../../libs/http.js';
import { tool } from '../../schema/index.js';

export default createGetAPI(tool.filename, async (data, context) => {
    const { request, response, config, util } = context;

    const url = new URL(request.url);
    const filename = url.pathname.split('/').pop();

    if (!filename) {
        return createResponse(ERROR_CODES.MISSING_REQUIRED_PARAMS, '文件名是必须的');
    }

    const filePath = path.join(config.upload.uploadDir, filename);
    const exists = await util.fileExists(filePath);

    if (!exists) {
        return createResponse(ERROR_CODES.FILE_NOT_FOUND, '文件未找到');
    }

    try {
        const file = Bun.file(filePath);
        const content = await file.arrayBuffer();

        response.headers.set('Content-Type', file.type || 'application/octet-stream');
        response.headers.set('Content-Disposition', `attachment; filename="${filename}"`);
        response.headers.set('Content-Length', content.byteLength.toString());

        response.body = content;
        response.sent = true;
        return response.send();
    } catch (error) {
        return createResponse(ERROR_CODES.FILE_READ_ERROR, '文件下载失败', error.message);
    }
});
