// components/operations-create.js
import {CategoryService} from "../services/category-service";
import {OperationService} from "../services/operation-service";
import {showMessage} from "../utils/ui-utils";

export class OperationCreate {
    constructor() {
        this.container = document.querySelector(".main__content-form");
        if (!this.container) return;

        this.typeSelect = this.container.querySelector("#operation-type");
        this.categorySelect = this.container.querySelector("#operation-category");
        this.newCategoryInput = this.container.querySelector("#operation-new-category");
        this.sumInput = this.container.querySelector("#operation-sum");
        this.dateInput = this.container.querySelector("#operation-date");
        this.commentInput = this.container.querySelector("#operation-comm");

        this.btnCreate = this.container.querySelector(".btn-success");
        this.btnCancel = this.container.querySelector(".btn-danger");

        // тип из query (?type=income/expense)
        const params = new URLSearchParams(window.location.search);
        const initialType = params.get("type");
        if (initialType === "income" || initialType === "expense") {
            this.typeSelect.value = initialType;
        }

        this.init();
    }

    async init() {
        await this.loadCategoriesForCurrentType();
        this.bindEvents();
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
        this.typeSelect.addEventListener("change", () => this.loadCategoriesForCurrentType());

        // создать
        this.btnCreate.addEventListener("click", async () => {
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
                // если введена новая категория — создаём её
                if (newCategoryTitle) {
                    const newCat = type === "income"
                        ? await CategoryService.createIncomeCategory({title: newCategoryTitle})
                        : await CategoryService.createExpenseCategory({title: newCategoryTitle});

                    categoryId = newCat.id;
                }

                const payload = {
                    type,                // 'income' | 'expense'
                    amount,
                    date,                // 'YYYY-MM-DD' из input[type=date]
                    comment,
                    category_id: Number(categoryId)
                };

                await OperationService.createOperation(payload);
                showMessage(this.container, "Операция успешно создана", "success");
                setTimeout(() => (location.href = "/operations"), 800);
            } catch (e) {
                showMessage(this.container, e.message || "Ошибка при создании операции", "danger");
            }
        });

        // отмена
        this.btnCancel.addEventListener("click", () => {
            location.href = "/operations";
        });
    }
}
