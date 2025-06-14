/**
 * 文件下载 API - /core/tool/download/:filename
 */

import path from 'path';
import { createGetAPI, validators } from 'bunfly';

export default createGetAPI(validators.filename, async (data, context) => {
    const { request, response, config, util } = context;

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
});
