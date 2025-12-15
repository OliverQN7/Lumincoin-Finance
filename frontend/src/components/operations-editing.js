// components/operations-editing.js
import {OperationService} from "../services/operation-service";
import {CategoryService} from "../services/category-service";
import {showMessage} from "../utils/ui-utils";

export class OperationEditing {
    constructor() {
        this.container = document.querySelector(".main__content-form");
        if (!this.container) return;

        this.typeSelect = this.container.querySelector("#operation-type");
        this.categorySelect = this.container.querySelector( "#operation-category");
        this.newCategoryInput = this.container.querySelector("#operation-new-category");
        this.sumInput = this.container.querySelector("#operation-sum");
        this.dateInput = this.container.querySelector("#operation-date");
        this.commentInput = this.container.querySelector("#operation-comm");

        this.btnSave = this.container.querySelector(".btn-success");
        this.btnCancel = this.container.querySelector(".btn-danger");

        this.urlParams = new URLSearchParams(window.location.search);
        this.id = this.urlParams.get("id");

        this.operation = null;

        this.init();
    }

    async init() {
        if (!this.id) {
            showMessage(this.container, "Не указан id операции", "danger");
            return;
        }

        try {
            // 1. грузим операцию
            this.operation = await OperationService.getOperationById(this.id);

            // 2. выставляем тип
            if (this.operation.type === "income" || this.operation.type === "expense") {
                this.typeSelect.value = this.operation.type;
            }

            // 3. грузим категории этого типа
            await this.loadCategoriesForCurrentType();

            // 4. выбираем категорию
            if (this.operation.category_id) {
                this.categorySelect.value = String(this.operation.category_id);
            }

            // 5. сумма
            if (this.operation.amount != null) {
                this.sumInput.value = this.operation.amount;
            }

            // 6. дата (берём только YYYY-MM-DD)
            if (this.operation.date) {
                const dateOnly = this.operation.date.slice(0, 10);
                this.dateInput.value = dateOnly;
            }

            // 7. комментарий
            if (this.operation.comment) {
                this.commentInput.value = this.operation.comment;
            }

            this.bindEvents();
        } catch (e) {
            showMessage(this.container, e.message || "Ошибка загрузки операции", "danger");
        }
    }

    async loadCategoriesForCurrentType() {
        const type = this.typeSelect.value;
        try {
            const categories = type === "income"
                ? await CategoryService.getIncomeCategories()
                : await CategoryService.getExpenseCategories();

            this.categorySelect.innerHTML = categories.map(cat =>
                `<option value="${cat.id}">${cat.title}</option>`
            ).join("");
        } catch (e) {
            showMessage(this.container, e.message || "Ошибка загрузки категорий", "danger");
        }
    }

    bindEvents() {
        // смена типа => перезагружаем категории
        this.typeSelect.addEventListener("change", async () => {
            await this.loadCategoriesForCurrentType();
        });

        // сохранить
        this.btnSave.addEventListener("click", async () => {
            const type = this.typeSelect.value;
            let categoryId = this.categorySelect.value;
            const newCategoryTitle = this.newCategoryInput.value.trim();
            const amount = Number(this.sumInput.value);
            const date = this.dateInput.value;
            const comment = this.commentInput.value.trim();

            if (!amount || amount <= 0) {
                showMessage(this.container, "Введите корректную сумму", "danger");
                return;
            }
            if (!date) {
                showMessage(this.container, "Выберите дату", "danger");
                return;
            }

            try {
                if (newCategoryTitle) {
                    const newCat = type === "income"
                        ? await CategoryService.createIncomeCategory({title: newCategoryTitle})
                        : await CategoryService.createExpenseCategory({title: newCategoryTitle});
                    categoryId = newCat.id;
                }

                const payload = {
                    type,
                    amount,
                    date,
                    comment,
                    category_id: Number(categoryId)
                };

                await OperationService.updateOperation(this.id, payload);
                showMessage(this.container, "Операция успешно обновлена", "success");
                setTimeout(() => (location.href = "/operations"), 800);
            } catch (e) {
                showMessage(this.container, e.message || "Ошибка при обновлении операции", "danger");
            }
        });

        // отмена
        this.btnCancel.addEventListener("click", () => {
            location.href = "/operations";
        });
    }
}
