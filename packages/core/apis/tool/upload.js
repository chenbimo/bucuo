/**
 * 文件上传 API - /core/tool/upload
 */

import { createAPI, createResponse, ERROR_CODES } from '../../libs/http.js';
import { loadSchema } from '../../libs/simple-schema.js';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const toolSchemaPath = join(__dirname, '../../schema/tool.json');
const { upload } = loadSchema(toolSchemaPath);

export default createAPI({
    name: '文件上传',
    schema: upload,
    method: 'post',
    handler: async (data, context) => {
    const { request, files, fields } = context;

    if (!files || files.length === 0) {
        throw new Error('没有上传文件');
    }

    return {
        message: '文件上传成功',
        files: files.map((file) => ({
            fieldName: file.fieldName,
            originalName: file.originalName,
            filename: file.filename,
            size: file.size,
            mimetype: file.mimetype,
            url: `/core/tool/files/${file.filename}`
        })),
        fields
    };
});
