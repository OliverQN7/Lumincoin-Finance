// utils/http-utils.js
import config from "../config/config";
import {AuthUtils} from "./auth-utils";
import type {HttpMethodType, HttpResultType} from "../types/http-utils.types";

export class HttpUtils {
    static async request<T = unknown>(
        url: string,
        method: HttpMethodType = "GET",
        body?: unknown
    ): Promise<HttpResultType<T>> {
        const headers: Record<string, string> = {
            "Content-Type": "application/json",
            Accept: "application/json",
        };

        // Добавляем токен авторизации, если есть
        const token = AuthUtils.getAuthInfo(AuthUtils.accessTokenKey);
        if (token) {
            headers["x-auth-token"] = token;
        }

        const params: RequestInit = {
            method,
            headers,
            cache: "no-store",
        };

        if (body !== undefined && body !== null) {
            params.body = JSON.stringify(body);
        }

        let response: Response;

        try {
            response = await fetch(config.api + url, params);
            const text = await response.text();
            const parsed = text ? (JSON.parse(text) as T) : null;

            return {
                error: !response.ok,
                response: parsed,
                status: response.status,
            }
        } catch (e) {
            return {
                error: true,
                response: null,
                status: 0,
            }

        }
    }
}
