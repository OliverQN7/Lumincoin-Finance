// services/operation-service.js
import {HttpUtils} from "../utils/http-utils";

export class OperationService {
    static async getOperations() {
        const result = await HttpUtils.request('/operations', 'GET');

        if (result.error) {
            throw new Error(result.response?.message || "Ошибка загрузки операций");
        }
        return result.response;
    }

    static async getOperationsWithFilter({period, dateFrom, dateTo}) {
        const params = new URLSearchParams();

        if (period) {
            params.set("period", period);
        }
        if (dateFrom) {
            params.set("dateFrom", dateFrom);
        }
        if (dateTo) {
            params.set("dateTo", dateTo);
        }

        const query = params.toString();
        const url = query ? `/operations?${query}` : "/operations";

        const result = await HttpUtils.request(url, "GET");

        if (result.error) {
            throw new Error(result.response?.message || "Ошибка загрузки операций с фильтрами");
        }
        return result.response;
    }

    static async getOperationById(id) {
        const result = await HttpUtils.request(`/operations/${id}`, "GET");

        if (result.error) {
            throw new Error(result.response?.message || "Ошибка при получении операции");
        }
        return result.response;
    }

    static async createOperation(data) {
        const result = await HttpUtils.request("/operations", "POST", data);

        if (result.error) {
            throw new Error(result.response?.message || "Ошибка при создании операции");
        }
        return result.response;
    }

    static async updateOperation(id, data) {
        const result = await HttpUtils.request(`/operations/${id}`, "PUT", data);

        if (result.error) {
            throw new Error(result.response?.message || "Ошибка при обновлении операции");
        }
        return result.response;
    }

    static async deleteOperation(id) {
        const result = await HttpUtils.request(`/operations/${id}`, "DELETE");

        if (result.error) {
            throw new Error(result.response?.message || "Ошибка при удалении операции");
        }
        return result.response;
    }
}
