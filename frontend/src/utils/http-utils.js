import config from "../config/config";
import {AuthUtils} from "./auth-utils";

export class HttpUtils {
    static async request(url, method = "GET", body = null) {
        // Структура результата
        const result = {
            error: false,
            response: null,
        }

        // Заголовки
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        };

        // Добавляем токен авторизации, если есть
        const token = AuthUtils.getAuthInfo(AuthUtils.accessTokenKey);
        if (token) {
            headers['x-auth-token'] = token;
            console.log('Token:', token);
        }

        const params = {
            method,
            headers
        }

        if (body) {
            params.body = JSON.stringify(body);
        }

        let response = null;
        try {
            response = await fetch(config.api + url, params);
            console.log('Response:', response);
            result.response = await response.json();
        } catch (e) {
            result.error = true;
            return result;
        }

        // Проверяем статус
        if (!response || response.status < 200 || response.status >= 300) {
            result.error = true;
        }

        return result;
    }
}