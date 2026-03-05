// services/operation-service.js
import {HttpUtils} from "../utils/http-utils";
import type {
    OperationCreateUpdateType,
    OperationFilterParamsType, OperationIdType,
    OperationType,
    OperationTypeItem
} from "../types/operation.types";
import {getErrorMessage} from "../utils/error-utils";
import type {OperationCreate} from "../components/operations-create";

export class OperationService {
    static async getOperations(): Promise<OperationTypeItem[]> {
        const result = await HttpUtils.request<OperationTypeItem[]>('/operations', 'GET');

        if (result.error) {
            throw new Error(getErrorMessage(result.response, "Ошибка загрузки операций"));
        }
        return result.response ?? [];
    }

    static async getOperationsWithFilter(params: OperationFilterParamsType): Promise<OperationTypeItem[]> {
        const search = new URLSearchParams();

        search.set("period", String(params.period));

        if (params.period === 'interval') {
            if (params.dateFrom) {
                search.set("dateFrom", params.dateFrom);
            }
            if (params.dateTo) {
                search.set("dateTo", params.dateTo);
            }
        }

        const query = search.toString();
        const url = query ? `/operations?${query}` : "/operations";

        const result = await HttpUtils.request<OperationTypeItem[]>(url, "GET");

        if (result.error) {
            throw new Error(getErrorMessage(result.response, "Ошибка загрузки операций с фильтрами"));
        }
        return result.response ?? [];
    }

    static async getOperationById(id: OperationIdType): Promise<OperationTypeItem> {
        const result = await HttpUtils.request<OperationTypeItem>(`/operations/${id}`, "GET");

        if (result.error || !result.response) {
            throw new Error(getErrorMessage(result.response, "Ошибка при получении операции"));
        }
        return result.response;
    }

    static async createOperation(data: OperationCreateUpdateType): Promise<OperationTypeItem> {
        const result = await HttpUtils.request<OperationTypeItem>("/operations", "POST", data);

        if (result.error || !result.response) {
            throw new Error(getErrorMessage(result.response, "Ошибка при создании операции"));
        }
        return result.response;
    }

    static async updateOperation(id: OperationIdType, data: OperationCreateUpdateType): Promise<OperationTypeItem> {
        const result = await HttpUtils.request<OperationTypeItem>(`/operations/${id}`, "PUT", data);

        if (result.error || !result.response) {
            throw new Error(getErrorMessage(result.response, "Ошибка при обновлении операции"));
        }
        return result.response;
    }

    static async deleteOperation(id: OperationIdType): Promise<unknown> {
        const result = await HttpUtils.request<unknown>(`/operations/${id}`, "DELETE");

        if (result.error) {
            throw new Error(getErrorMessage(result.response, "Ошибка при удалении операции"));
        }
        return result.response;
    }
}
