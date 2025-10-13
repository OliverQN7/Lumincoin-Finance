export class AuthUtils {
    static accessTokenKey = 'accessToken';
    static refreshTokenKey = 'refreshToken';
    static userInfoTokenKey = 'userInfo';

    static setAuthInfo(accessToken, refreshToken, userInfo) {
        if (typeof accessToken === 'string' && accessToken.length > 0) {
            localStorage.setItem(this.accessTokenKey, accessToken);
        }
        if (typeof refreshToken === 'string' && refreshToken.length > 0) {
            localStorage.setItem(this.refreshTokenKey, refreshToken);
        }
        if (userInfo && typeof userInfo === 'object') {
            localStorage.setItem(this.userInfoTokenKey, JSON.stringify(userInfo));
        }
    }

    static removeAuthInfo() {
        localStorage.removeItem(this.accessTokenKey);
        localStorage.removeItem(this.refreshTokenKey);
        localStorage.removeItem(this.userInfoTokenKey);
    }

    static getAuthInfo(key = null) {
        const keys = [this.accessTokenKey, this.refreshTokenKey, this.userInfoTokenKey];
        if (key && keys.includes(key)) {
            return localStorage.getItem(key);
        }
        return {
            [this.accessTokenKey]: localStorage.getItem(this.accessTokenKey),
            [this.refreshTokenKey]: localStorage.getItem(this.refreshTokenKey),
            [this.userInfoTokenKey]: localStorage.getItem(this.userInfoTokenKey),
        };
    }

    static getParsedUser() {
        const raw = localStorage.getItem(this.userInfoTokenKey);
        try {
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    }

    // Сделал валидацию токенов, если вдруг есть userInfо без токенов не проходил на Главную. Раньше было так, что при
    // accessToken === null или refreshToken все равно пропускало на Главную из-за userInfo.
    static tokenIsValid(str) {
        return typeof str === "string" && !!str.trim() && !['null', 'undefined'].includes(str.trim());
    }

    static isAuthenticated() {
        const clean = key => {
            const token = localStorage.getItem(key);
            const valid = this.tokenIsValid(token);

            if (!valid && token !== null) {
                localStorage.removeItem(key)
            }
            return valid;
        };

        return clean(this.accessTokenKey) && clean(this.refreshTokenKey);
    }
}