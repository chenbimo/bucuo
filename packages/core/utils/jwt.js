import { createSigner, createVerifier } from 'fast-jwt';
import { Env } from '../config/env.js';

// 创建签名器和验证器
export const jwtSigner = createSigner({
    key: Env.JWT_SECRET,
    expiresIn: Env.JWT_EXPIRES_IN || '7d',
    algorithm: Env.JWT_ALGORITHM || 'HS256'
});

export const jwtVerifier = createVerifier({
    key: Env.JWT_SECRET,
    algorithms: [Env.JWT_ALGORITHM || 'HS256']
});
