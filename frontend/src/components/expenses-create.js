import {showMessage} from "../utils/ui-utils";
import {CategoryService} from "../services/category-service";

export class ExpensesCreate {
    constructor() {
        this.container = document.querySelector(".main__content-block");
        if (!this.container) return;

        this.inputTitle = this.container.querySelector(".form-control");
        this.btnCreate = this.container.querySelector(".btn-success");
        this.btnCancel = this.container.querySelector(".btn-danger");

        this.bindEvents()
    }

    bindEvents() {
        if (!this.inputTitle || !this.btnCreate) return;

        this.btnCreate.addEventListener("click", async () => {
            const title = this.inputTitle.value.trim();
            if (!title) {
                showMessage(this.container, "Введите название категории", "danger");
                return;
            }

            const data = {title};

            try {
                await CategoryService.createExpenseCategory(data);
                showMessage(this.container, "Категория успешно создана!", "success");
                setTimeout(() => location.href = "/expenses", 1000);
            } catch (e) {
                if (e.message.includes("already exists")) {
                    showMessage(this.container, "Категория с таким названием уже существует!", "danger");
                } else {
                    showMessage(this.container, "Ошибка при создании категории", "danger");
                }
            }
        });

        this.btnCancel.addEventListener("click", () => {
            location.href = "/expenses";
        });
    }
}