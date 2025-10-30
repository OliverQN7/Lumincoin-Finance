import {CategoryService} from "../services/category-service.js";
import {showMessage} from "../utils/ui-utils.js";

export class ExpensesEditing {
    constructor() {
        this.container = document.querySelector('.main__content-block');

        this.inputTitle = this.container.querySelector('.form-control');
        this.btnSave = this.container.querySelector('.btn-success');
        this.btnCancel = this.container.querySelector('.btn-danger');

        this.urlParams = new URLSearchParams(window.location.search);
        this.id = this.urlParams.get("id");

        this.init();
    }

    async init() {
        if (!this.id) return;

        const category = await CategoryService.getExpenseCategoryById(this.id);
        if (!category || category.error) {
            showMessage(this.container, "Ошибка загрузки категории", "danger");
            return;
        }

        this.inputTitle.value = category.title || "";
        this.bindEvents();
    }

    bindEvents() {
        if (!this.inputTitle || !this.btnSave) return;

        this.btnSave.addEventListener("click", async () => {
            const title = this.inputTitle.value.trim();
            if (!title) {
                showMessage(this.container, "Введите название категории", "danger");
                return;
            }

            const categories = await CategoryService.getExpenseCategories();
            const exists = categories.some(cat => cat.title === title && cat.id !== this.id);

            if (exists) {
                showMessage(this.container, "Категория с таким названием уже существует!", "danger");
                return;
            }

            const data = {title};

            try {
                await CategoryService.updateExpenseCategory(this.id, data);
                showMessage(this.container, "Категория успешно обновлена!", "success");
                setTimeout(() => location.href = "/expenses", 1000);
            } catch (err) {
                showMessage(this.container, "Ошибка при обновлении категории", "danger");
            }
        });

        this.btnCancel.addEventListener("click", () => {
            location.href = "/expenses";
        });
    }
}
