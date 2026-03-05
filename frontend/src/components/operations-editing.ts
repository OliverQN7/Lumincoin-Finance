// components/operations-editing.js
import {OperationService} from "../services/operation-service";
import {CategoryService} from "../services/category-service";
import {showMessage} from "../utils/ui-utils";
import type {
    OperationCreateUpdateType,
    OperationIdType,
    OperationType,
    OperationTypeItem
} from "../types/operation.types";
import type {OpenNewRouteType} from "../types/common.types";
import {type FormElements, preparePayload} from "../utils/form-utils";

export class OperationEditing {
    private readonly container: HTMLElement | null;
    private readonly typeSelect: HTMLSelectElement | null = null
    private readonly categorySelect: HTMLSelectElement | null = null;
    private readonly newCategoryInput: HTMLInputElement | null = null;
    private readonly sumInput: HTMLInputElement | null = null;
    private readonly dateInput: HTMLInputElement | null = null;
    private readonly commentInput: HTMLInputElement | null = null;
    private readonly btnSave: HTMLElement | null = null;
    private readonly btnCancel: HTMLElement | null = null;

    private readonly urlParams: URLSearchParams;
    private readonly id: string | null;
    private operation: OperationTypeItem | null = null;

    constructor(private readonly openNewRoute: OpenNewRouteType) {
        this.urlParams = new URLSearchParams(window.location.search);
        this.id = this.urlParams.get("id");

        this.container = document.querySelector(".main__content-form");
        if (!this.container) return;

        this.typeSelect = this.container.querySelector("#operation-type");
        this.categorySelect = this.container.querySelector("#operation-category");
        this.newCategoryInput = this.container.querySelector("#operation-new-category");
        this.sumInput = this.container.querySelector("#operation-sum");
        this.dateInput = this.container.querySelector("#operation-date");
        this.commentInput = this.container.querySelector("#operation-comm");

        this.btnSave = this.container.querySelector(".btn-success");
        this.btnCancel = this.container.querySelector(".btn-danger");

        this.operation = null;

        void this.init();
    }

    private get elementsReady(): boolean {
        return !!(
            this.container &&
            this.typeSelect &&
            this.categorySelect &&
            this.newCategoryInput &&
            this.sumInput &&
            this.dateInput &&
            this.commentInput &&
            this.btnSave &&
            this.btnCancel
        );
    }

    private async init(): Promise<void> {
        if (!this.id) {
            showMessage(this.container!, "Не указан id операции", "danger");
            return;
        }

        try {
            // 1. грузим операцию
            this.operation = await OperationService.getOperationById(this.id as OperationIdType);

            if (!this.elementsReady) return;

            // 2. выставляем тип
            if (this.operation.type === "income" || this.operation.type === "expense") {
                this.typeSelect!.value = this.operation.type;
            }

            // 3. грузим категории этого типа
            await this.loadCategoriesForCurrentType();

            // 4. выбираем категорию
            if (this.operation.category_id) {
                this.categorySelect!.value = String(this.operation.category_id);
            }

            // 5. сумма
            if (this.operation.amount != null) {
                this.sumInput!.value = String(this.operation.amount);
            }

            // 6. дата (берём только YYYY-MM-DD)
            if (this.operation.date) {
                const dateOnly = this.operation.date.slice(0, 10);
                this.dateInput!.value = dateOnly;
            }

            // 7. комментарий
            if (this.operation.comment) {
                this.commentInput!.value = this.operation.comment;
            }

            this.bindEvents();
        } catch (e: unknown) {
            showMessage(this.container!, (e as Error).message || "Ошибка загрузки операции", "danger");
        }
    }

    private async loadCategoriesForCurrentType(): Promise<void> {
        if (!this.elementsReady) return;

        const type: OperationType = this.typeSelect!.value as OperationType;

        try {
            const categories = type === "income"
                ? await CategoryService.getIncomeCategories()
                : await CategoryService.getExpenseCategories();

            this.categorySelect!.innerHTML = categories.map(cat =>
                `<option value="${cat.id}">${cat.title}</option>`
            ).join("");
        } catch (e: unknown) {
            showMessage(this.container!, (e as Error).message || "Ошибка загрузки категорий", "danger");
        }
    }

    private bindEvents(): void {
        if (!this.elementsReady) return;

        // смена типа => перезагружаем категории
        this.typeSelect!.addEventListener("change", async () => {
            await this.loadCategoriesForCurrentType();
        });

        // сохранить
        this.btnSave!.addEventListener("click", async () => {

        });

        // отмена
        this.btnCancel!.addEventListener("click", () => {
            this.openNewRoute("/operations");
        });
    }

    private async handleSave(): Promise<void> {
        if (!this.elementsReady) {
            showMessage(this.container!, "Ошибка: недоступны данные операции", "danger");
            return;
        }

        const elements: FormElements = {
            typeSelect: this.typeSelect!,
            categorySelect: this.categorySelect!,
            newCategoryInput: this.newCategoryInput!,
            sumInput: this.sumInput!,
            dateInput: this.dateInput!,
            commentInput: this.commentInput!
        };

        const amount = Number(this.sumInput!.value);
        if (!amount || amount <= 0) {
            showMessage(this.container!, "Введите корректную сумму", "danger");
            return;
        }

        if (!this.dateInput!.value) {
            showMessage(this.container!, "Выберите дату", "danger");
            return;
        }

        try {
            const payload = await preparePayload(elements);
            await OperationService.updateOperation(this.id!, payload);
            showMessage(this.container!, "Операция успешно обновлена", "success");
            setTimeout(() => this.openNewRoute("/operations"), 800);
        } catch (e) {
            showMessage(this.container!, (e as Error).message || "Ошибка при обновлении операции", "danger");
        }

    }

}
