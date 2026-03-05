import {HttpUtils} from "../utils/http-utils";
import type {BalanceResponseType, BalanceUpdateRequestType} from "../types/balance.types";
import {getErrorMessage} from "../utils/error-utils";

export class BalanceService {
    // Получаем баланс с сервера
    static async getBalance(): Promise<number> {
        const res = await HttpUtils.request<BalanceResponseType>('/balance', 'GET');

        // Проверяем корректность ответа: должен быть объект с числом
        if (res.error || !res.response || typeof res.response.balance !== 'number') {
            throw new Error(getErrorMessage(res.response, 'Ошибка при получении баланса'));
        }

        return res.response.balance;
    }

    // Отправляем новый баланс на сервер
    static async setBalance(value: number): Promise<number> {
        const payload: BalanceUpdateRequestType = {newBalance: value};

        const res = await HttpUtils.request<BalanceResponseType>('/balance', 'PUT', {newBalance: value});

        // Проверяем, что сервер действительно вернул обновлённое значение
        if (res.error || !res.response || typeof res.response.balance !== 'number') {
            throw new Error(getErrorMessage(res.response, 'Ошибка при обновлении баланса'));
        }

        return res.response.balance;
    }
}