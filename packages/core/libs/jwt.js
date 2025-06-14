/**
 * JWT 库 - 使用 Bun 的加密 API
 */

export class JWT {
    constructor(secret = 'bunfly-secret', options = {}) {
        this.secret = secret;
        this.algorithm = options.algorithm || 'HS256';
        this.expiresIn = options.expiresIn || '1h';
        this.issuer = options.issuer || 'bunfly';
    }

    base64UrlEncode(str) {
        return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    }

    base64UrlDecode(str) {
        str += '='.repeat((4 - (str.length % 4)) % 4);
        return atob(str.replace(/-/g, '+').replace(/_/g, '/'));
    }

    sign(payload, options = {}) {
        const header = {
            alg: this.algorithm,
            typ: 'JWT'
        };

        const now = Math.floor(Date.now() / 1000);
        const exp = options.expiresIn || this.expiresIn;

        let expirationTime;
        if (typeof exp === 'string') {
            const match = exp.match(/^(\d+)([smhd])$/);
            if (match) {
                const value = parseInt(match[1]);
                const unit = match[2];
                const multiplier = { s: 1, m: 60, h: 3600, d: 86400 };
                expirationTime = now + value * multiplier[unit];
            } else {
                expirationTime = now + 3600; // 默认1小时
            }
        } else {
            expirationTime = now + exp;
        }

        const claims = {
            ...payload,
            iat: now,
            exp: expirationTime,
            iss: options.issuer || this.issuer
        };

        const headerEncoded = this.base64UrlEncode(JSON.stringify(header));
        const payloadEncoded = this.base64UrlEncode(JSON.stringify(claims));
        const data = `${headerEncoded}.${payloadEncoded}`;

        // 使用 Bun 的 CryptoHasher 进行 HMAC
        const hasher = new Bun.CryptoHasher('sha256', this.secret);
        hasher.update(data);
        const signature = hasher.digest('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

        return `${data}.${signature}`;
    }

    verify(token) {
        try {
            const parts = token.split('.');
            if (parts.length !== 3) {
                throw new Error('Invalid token format');
            }

            const [headerEncoded, payloadEncoded, signature] = parts;
            const data = `${headerEncoded}.${payloadEncoded}`;

            // 验证签名 - 使用 Bun 的 CryptoHasher
            const hasher = new Bun.CryptoHasher('sha256', this.secret);
            hasher.update(data);
            const expectedSignature = hasher.digest('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

            if (signature !== expectedSignature) {
                throw new Error('Invalid signature');
            }

            // 解析载荷
            const payload = JSON.parse(this.base64UrlDecode(payloadEncoded));

            // 检查过期时间
            const now = Math.floor(Date.now() / 1000);
            if (payload.exp && payload.exp < now) {
                throw new Error('Token expired');
            }

            return payload;
        } catch (error) {
            throw new Error(`JWT verification failed: ${error.message}`);
        }
    }

    decode(token) {
        try {
            const parts = token.split('.');
            if (parts.length !== 3) {
                return null;
            }

            const header = JSON.parse(this.base64UrlDecode(parts[0]));
            const payload = JSON.parse(this.base64UrlDecode(parts[1]));

            return { header, payload };
        } catch {
            return null;
        }
    }
}
