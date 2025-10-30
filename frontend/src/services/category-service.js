import {HttpUtils} from "../utils/http-utils";

export class CategoryService {

    // --- Доходы ---
    static async getIncomeCategories() {
        const result = await HttpUtils.request("/categories/income", "GET");

        if (result.error) {
            throw new Error(result.response?.message || "Ошибка загрузки категорий доходов");
        }
        return result.response;
    }

    static async getIncomeCategoryById(id) {
        const result = await HttpUtils.request(`/categories/income/${id}`, 'GET');

        if (result.error) {
            throw new Error(result.response?.message || "Ошибка при получении категории дохода");
        }
        return result.response;
    }

    static async createIncomeCategory(data) {
        const result = await HttpUtils.request(`/categories/income`, 'POST', data);

        if (result.error) {
            throw new Error(result.response?.message || "Ошибка при создании категории дохода");
        }
        return result.response;
    }

    static async updateIncomeCategory(id, data) {
        const result = await HttpUtils.request(`/categories/income/${id}`, 'PUT', data);

        if (result.error) {
            throw new Error(result.response?.message || "Ошибка при обновлении категории дохода");
        }
        return result.response;
    }

    static async deleteIncomeCategory(id) {
        const result = await HttpUtils.request(`/categories/income/${id}`, 'DELETE');

        if (result.error) {
            throw new Error(result.response?.message || "Ошибка при удалении категории дохода");
        }
        return result.response;
    }

    // --- Расходы ---
    static async getExpenseCategories() {
        const result = await HttpUtils.request("/categories/expense", "GET");
        if (result.error) {
            throw new Error(result.response?.message || "Ошибка загрузки категорий расходов");
        }
        return result.response;
    }

    static async getExpenseCategoryById(id) {
        const result = await HttpUtils.request(`/categories/expense/${id}`, 'GET');
        if (result.error) {
            throw new Error(result.response?.message || "Ошибка при получении категории расхода");
        }
        return result.response;
    }

    static async createExpenseCategory(data) {
        const result = await HttpUtils.request(`/categories/expense`, 'POST', data);
        if (result.error) {
            throw new Error(result.response?.message || "Ошибка при создании категории расхода");
        }
        return result.response;
    }

    static async updateExpenseCategory(id, data) {
        const result = await HttpUtils.request(`/categories/expense/${id}`, 'PUT', data);
        if (result.error) {
            throw new Error(result.response?.message || "Ошибка при обновлении категории расхода");
        }
        return result.response;
    }

    static async deleteExpenseCategory(id) {
        const result = await HttpUtils.request(`/categories/expense/${id}`, 'DELETE');
        if (result.error) {
            throw new Error(result.response?.message || "Ошибка при удалении категории расхода");
        }
        return result.response;
    }
}