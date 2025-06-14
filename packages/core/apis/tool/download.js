/**
 * 文件下载 API - /core/tool/download/:filename
 */

import path from 'path';

export default async (context) => {
    const { request, response, config, util } = context;

    // 只支持 GET 请求
    if (request.method !== 'GET') {
        response.status = 405;
        return { error: '不允许的请求方法', allowedMethods: ['GET'] };
    }

    const url = new URL(request.url);
    const filename = url.pathname.split('/').pop();

    if (!filename) {
        response.status = 400;
        return { error: 'Filename is required' };
    }

    const filePath = path.join(config.upload.uploadDir, filename);
    const exists = await util.fileExists(filePath);

    if (!exists) {
        response.status = 404;
        return { error: '文件未找到' };
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
        response.status = 500;
        return { error: 'Failed to download file' };
    }
};
