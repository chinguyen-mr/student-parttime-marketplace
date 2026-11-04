const MIN_SECRET_LENGTH = 32;

function getJwtSecret() {
    const secret = process.env.JWT_SECRET;
    if (!secret || !secret.trim()) {
        throw new Error('[AUTH] Thiếu JWT_SECRET trong .env. Backend không thể khởi động.');
    }
    if (secret.length < MIN_SECRET_LENGTH) {
        throw new Error(
            `[AUTH] JWT_SECRET phải có ít nhất ${MIN_SECRET_LENGTH} ký tự (hiện có ${secret.length}).`
        );
    }
    return secret;
}

function isJwtSecretConfigured() {
    try {
        getJwtSecret();
        return true;
    } catch {
        return false;
    }
}

module.exports = { getJwtSecret, isJwtSecretConfigured, MIN_SECRET_LENGTH };
