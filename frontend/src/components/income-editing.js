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

            const data = {title};

            const result = await CategoryService.updateIncomeCategory(this.id, data);
            if (result.error) {
                showMessage(this.container, "Ошибка при обновлении категории", "danger");
                return;
            }

            showMessage(this.container, "Категория успешно отредактирована!", "success");
            setTimeout(() => (location.href = "/income"), 1000);
        });

        this.btnCancel.addEventListener("click", () => {
            location.href = "/income";
        })
    }
}