/**
 * 文件上传 API - /core/tool/upload
 */

import { createPostAPI, validators } from '../../libs/validation.js';

export default createPostAPI(validators.empty(), async (data, context) => {
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
