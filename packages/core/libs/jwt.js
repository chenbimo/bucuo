/**
 * JWT 插件 - 使用 fast-jwt 第三方库
 */

import { createSigner, createVerifier } from 'fast-jwt';
import { Plugin } from '../libs/plugin.js';
import { Env } from '../config/env.js';

// 创建签名器和验证器
export const signer = createSigner({
    key: Env.JWT_SECRET,
    expiresIn: Env.JWT_EXPIRES_IN || '7d',
    algorithm: Env.JWT_ALGORITHM || 'HS256',
    ...Env.JWT_SIGNER_OPTIONS
});

export const verifier = createVerifier({
    key: Env.JWT_SECRET,
    algorithms: [Env.JWT_ALGORITHM || 'HS256']
});
