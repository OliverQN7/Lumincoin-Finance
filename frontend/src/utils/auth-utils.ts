import type {AuthInfoMapType, AuthKeyType} from "../types/auth-utils.types";
import type {UserInfoType} from "../types/user-info.types";

export class AuthUtils {
    static accessTokenKey: AuthKeyType = 'accessToken';
    static refreshTokenKey: AuthKeyType = 'refreshToken';
    static userInfoTokenKey: AuthKeyType = 'userInfo';

    static setAuthInfo(accessToken: string, refreshToken: string, userInfo: UserInfoType): void {
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

    static removeAuthInfo(): void {
        localStorage.removeItem(this.accessTokenKey);
        localStorage.removeItem(this.refreshTokenKey);
        localStorage.removeItem(this.userInfoTokenKey);
    }

    // Перегрузки:
    static getAuthInfo(): AuthInfoMapType;
    static getAuthInfo(key: AuthKeyType): string | null;

    static getAuthInfo(key?: AuthKeyType): AuthInfoMapType | (string | null) {
        if (key) {
            return localStorage.getItem(key);
        }

        return {
            accessToken: localStorage.getItem(this.accessTokenKey),
            refreshToken: localStorage.getItem(this.refreshTokenKey),
            userInfo: localStorage.getItem(this.userInfoTokenKey),
        };
    }

    static getParsedUser(): UserInfoType | null {
        const raw = localStorage.getItem(this.userInfoTokenKey);
        if (!raw) return null;

        try {
            return JSON.parse(raw) as UserInfoType;
        } catch {
            return null;
        }
    }

    // Сделал валидацию токенов, если вдруг есть userInfо без токенов не проходил на Главную. Раньше было так, что при
    // accessToken === null или refreshToken все равно пропускало на Главную из-за userInfo.
    static tokenIsValid(str: unknown): str is string {
        return typeof str === "string" && !!str.trim() && !['null', 'undefined'].includes(str.trim());
    }

    static isAuthenticated():boolean {
        const clean = (key: AuthKeyType): boolean => {
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