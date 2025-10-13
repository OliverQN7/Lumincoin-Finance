import {HttpUtils} from "../utils/http-utils";

export class BalanceService {
    static async fetchBalance() {
        const res = await HttpUtils.request('/balance', 'GET');
        if (res.error || !res.response || typeof res.response.balance !== 'number') {
            throw new Error('Failed to fetch balance');
        }
        return res.response.balance;
    }

    static async updateBalance(newValue) {
        const res = await HttpUtils.request('/balance', 'PUT', {balance: newValue});
        if (res.error || !res.response || typeof res.response.balance !== 'number') {
            throw new Error('Failed to update balance');
        }
        return res.response.balance;
    }
}