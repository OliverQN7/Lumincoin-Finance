import {CategoryService} from "../services/category-service";
import {showMessage} from "../utils/ui-utils";

export class IncomeEditing {
    constructor() {
        // Контейнер формы
        this.container = document.querySelector('.main__content-block');
        if (!this.container) return;

        // Инпуты
        this.inputTitle = this.container.querySelector('.form-control');

        // Кнопки
        this.btnSave = this.container.querySelector('.btn-success');
        this.btnCancel = this.container.querySelector('.btn-danger');

        //
        this.urlParams = new URLSearchParams(window.location.search);
        this.id = this.urlParams.get("id");

        this.init();
    }

    async init() {
        if (!this.id) return;

        const category = await CategoryService.getIncomeCategoryById(this.id);
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

            // Проверка дубликата
            const categories = await CategoryService.getIncomeCategories();
            const exists = categories.some(cat => cat.title === title && cat.id !== this.id);

            if (exists) {
                showMessage(this.container, "Категория с таким названием уже существует!", "danger");
                return;
            }

            const data = {title};

            try {
                await CategoryService.updateIncomeCategory(this.id, data);
                showMessage(this.container, "Категория успешно обновлена!", "success");
                setTimeout(() => location.href = "/income", 1000);
            } catch (err) {
                if (err.message.includes("already exists")) {
                    showMessage(this.container, "Категория с таким названием уже существует!", "danger");
                } else {
                    showMessage(this.container, "Ошибка при обновлении категории", "danger");
                }
            }
        });

        this.btnCancel.addEventListener("click", () => {
            location.href = "/income";
        })
    }
}