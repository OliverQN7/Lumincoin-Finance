import {HttpUtils} from "../utils/http-utils";

export class CategoryService {
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
}