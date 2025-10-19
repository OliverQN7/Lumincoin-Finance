import {CategoryService} from "../services/category-service.js";
import {showMessage} from "../utils/ui-utils";

export class IncomeCreate {
    constructor() {
        // Контейнер формы
        this.container = document.querySelector(".main__content-block");
        if (!this.container) return;

        // Инпуты
        this.inputTitle = this.container.querySelector(".form-control");

        // Кнопки
        this.btnCreate = this.container.querySelector(".btn-success");
        this.btnCancel = this.container.querySelector(".btn-danger");

        this.bindEvents();
    }

    bindEvents() {
        if (!this.inputTitle || !this.btnCreate) return;

        // Создать категорию
        this.btnCreate.addEventListener("click", async () => {
            const title = this.inputTitle.value.trim();
            if (!title) {
                showMessage(this.container, "Введите название категории", "danger");
                return;
            }

            const data = {title};

            const result = await CategoryService.createIncomeCategory(data);
            if (result.error) {
                showMessage(this.container, "Ошибка при создании категории", "danger");
                return;
            }

            showMessage(this.container, "Категория успешно создана!", "success");
            setTimeout(() => (location.href = "/income"), 1000);
        });

        // Отмена
        this.btnCancel.addEventListener("click", () => {
            location.href = "/income";
        });
    }


}
