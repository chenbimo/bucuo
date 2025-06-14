/**
 * 文件上传 API - /core/tool/upload
 */

import { createPostAPI } from '../../libs/validation.js';
import { tool } from '../../schema/index.js';

export default createPostAPI(tool.upload(), async (data, context) => {
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
