import {HttpUtils} from "../utils/http-utils";

export class BalanceService {
    // Получаем баланс с сервера
    static async getBalance() {
        const res = await HttpUtils.request('/balance', 'GET');

        // Проверяем корректность ответа: должен быть объект с числом
        if (res.error || !res.response || typeof res.response.balance     !== 'number') {
            throw new Error('Ошибка при получении баланса');
        }

        return res.response.balance;
    }

    // Отправляем новый баланс на сервер
    static async setBalance(value) {
        const res = await HttpUtils.request('/balance', 'PUT', {newBalance: value});

        // Проверяем, что сервер действительно вернул обновлённое значение
        if (res.error || !res.response || typeof res.response.balance !== 'number') {
            throw new Error('Ошибка при обновлении баланса');
        }

        return res.response.balance;
    }
}