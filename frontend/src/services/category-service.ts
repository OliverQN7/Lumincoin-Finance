import {HttpUtils} from "../utils/http-utils";
import type {CategoryCreateUpdateType, CategoryIdType, CategoryTypeItem} from "../types/category.types";

function getErrorMessage(resp: unknown, fallback: string): string {
    if (resp && typeof resp === "object" && "message" in resp) {
        const msg = (resp as Record<string, unknown>).message;
        if (typeof msg === "string" && msg.trim()) return msg;
    }
    return fallback;
}

export class CategoryService {

    // --- Доходы ---
    static async getIncomeCategories(): Promise<CategoryTypeItem[]> {
        const result = await HttpUtils.request<CategoryTypeItem[]>("/categories/income", "GET");

        if (result.error) {
            throw new Error(getErrorMessage(result.response, "Ошибка загрузки категорий доходов"));
        }
        return result.response ?? [];
    }

    static async getIncomeCategoryById(id: CategoryIdType): Promise<CategoryTypeItem> {
        const result = await HttpUtils.request<CategoryTypeItem>(`/categories/income/${id}`, 'GET');

        if (result.error || !result.response) {
            throw new Error(getErrorMessage(result.response, "Ошибка при получении категории дохода"));
        }

        return result.response;
    }

    static async createIncomeCategory(data: CategoryCreateUpdateType): Promise<CategoryTypeItem> {
        const result = await HttpUtils.request<CategoryTypeItem>(`/categories/income`, 'POST', data);

        if (result.error || !result.response) {
            throw new Error(getErrorMessage(result.response, "Ошибка при создании категории дохода"));
        }
        return result.response;
    }

    static async updateIncomeCategory(id: CategoryIdType, data: CategoryCreateUpdateType): Promise<CategoryTypeItem> {
        const result = await HttpUtils.request<CategoryTypeItem>(`/categories/income/${id}`, 'PUT', data);

        if (result.error || !result.response) {
            throw new Error(getErrorMessage(result.response, "Ошибка при обновлении категории дохода"));
        }
        return result.response;
    }

    static async deleteIncomeCategory(id: CategoryIdType): Promise<unknown> {
        const result = await HttpUtils.request<unknown>(`/categories/income/${id}`, 'DELETE');

        if (result.error) {
            throw new Error(getErrorMessage(result.response, "Ошибка при удалении категории дохода"));
        }
        return result.response;
    }

    // --- Расходы ---
    static async getExpenseCategories(): Promise<CategoryTypeItem[]> {
        const result = await HttpUtils.request<CategoryTypeItem[]>("/categories/expense", "GET");
        if (result.error) {
            throw new Error(getErrorMessage(result.response, "Ошибка загрузки категорий расходов"));
        }
        return result.response ?? [];
    }

    static async getExpenseCategoryById(id: CategoryIdType): Promise<CategoryTypeItem> {
        const result = await HttpUtils.request<CategoryTypeItem>(`/categories/expense/${id}`, 'GET');
        if (result.error || !result.response) {
            throw new Error(getErrorMessage(result.response, "Ошибка при получении категории расхода"));
        }
        return result.response;
    }

    static async createExpenseCategory(data: CategoryCreateUpdateType): Promise<CategoryTypeItem> {
        const result = await HttpUtils.request<CategoryTypeItem>(`/categories/expense`, 'POST', data);
        if (result.error || !result.response) {
            throw new Error(getErrorMessage(result.response, "Ошибка при создании категории расхода"));
        }
        return result.response;
    }

    static async updateExpenseCategory(id: CategoryIdType, data: CategoryCreateUpdateType): Promise<CategoryTypeItem> {
        const result = await HttpUtils.request<CategoryTypeItem>(`/categories/expense/${id}`, 'PUT', data);
        if (result.error || !result.response) {
            throw new Error(getErrorMessage(result.response, "Ошибка при обновлении категории расхода"));
        }
        return result.response;
    }

    static async deleteExpenseCategory(id: CategoryIdType): Promise<unknown> {
        const result = await HttpUtils.request<CategoryTypeItem>(`/categories/expense/${id}`, 'DELETE');
        if (result.error) {
            throw new Error(getErrorMessage(result.response, "Ошибка при удалении категории расхода"));
        }
        return result.response;
    }
}