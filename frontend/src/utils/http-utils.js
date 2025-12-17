// utils/http-utils.js
import config from "../config/config";
import { AuthUtils } from "./auth-utils";

export class HttpUtils {
    static async request(url, method = "GET", body = null) {
        const result = {
            error: false,
            response: null,
        };

        const headers = {
            "Content-Type": "application/json",
            Accept: "application/json",
        };

        // Добавляем токен авторизации, если есть
        const token = AuthUtils.getAuthInfo(AuthUtils.accessTokenKey);
        if (token) {
            headers["x-auth-token"] = token;
        }

        const params = {
            method,
            headers,

            // ИСПРАВЛЕНО: отключаем кеширование для API (особенно важно для GET)
            // чтобы не получать 304 и пустое тело.
            cache: "no-store",
        };

        if (body) {
            params.body = JSON.stringify(body);
        }

        let response = null;

        try {
            response = await fetch(config.api + url, params);

            // ИСПРАВЛЕНО: безопасно читаем тело (304/204 могут быть без body)
            // 304 Not Modified не должен содержать body. [web:191]
            const text = await response.text();
            result.response = text ? JSON.parse(text) : null;
        } catch (e) {
            result.error = true;
            return result;
        }

        // Статус != 2xx => ошибка
        if (!response || response.status < 200 || response.status >= 300) {
            result.error = true;
        }

        return result;
    }
}
