// components/operations-create.js
import {CategoryService} from "../services/category-service";
import {OperationService} from "../services/operation-service";
import {showMessage} from "../utils/ui-utils";
import type {OpenNewRouteType} from "../types/common.types";
import type {OperationCreateUpdateType, OperationType} from "../types/operation.types";
import {preparePayload} from "../utils/form-utils";
import type {FormElements} from "../utils/form-utils";

export class OperationCreate {
    private readonly container: HTMLElement | null;
    private readonly typeSelect: HTMLSelectElement | null = null;
    private readonly categorySelect: HTMLSelectElement | null = null;
    private readonly newCategoryInput: HTMLInputElement | null = null;
    private readonly sumInput: HTMLInputElement | null = null;
    private readonly dateInput: HTMLInputElement | null = null;
    private readonly commentInput: HTMLInputElement | null = null;
    private readonly btnCreate: HTMLElement | null = null;
    private readonly btnCancel: HTMLElement | null = null;

    constructor(private readonly openNewRoute: OpenNewRouteType) {
        this.container = document.querySelector(".main__content-form") as HTMLElement | null;
        if (!this.container) return;

        this.typeSelect = this.container.querySelector("#operation-type") as HTMLSelectElement | null;
        this.categorySelect = this.container.querySelector("#operation-category") as HTMLSelectElement | null;
        this.newCategoryInput = this.container.querySelector("#operation-new-category") as HTMLInputElement | null;
        this.sumInput = this.container.querySelector("#operation-sum") as HTMLInputElement | null;
        this.dateInput = this.container.querySelector("#operation-date") as HTMLInputElement | null;
        this.commentInput = this.container.querySelector("#operation-comm") as HTMLInputElement | null;
        this.btnCreate = this.container.querySelector(".btn-success") as HTMLElement | null;
        this.btnCancel = this.container.querySelector(".btn-danger") as HTMLElement | null;

        this.initUrlParams();
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
            this.btnCreate &&
            this.btnCancel
        );
    }

    private initUrlParams(): void {
        if (!this.elementsReady) return;

        // тип из query (?type=income/expense)
        const params = new URLSearchParams(window.location.search);
        const initialType = params.get("type");
        if (initialType === "income" || initialType === "expense") {
            this.typeSelect!.value = initialType;
        }
    }

    private async init(): Promise<void> {
        await this.loadCategoriesForCurrentType();
        this.bindEvents();
    }

    private async loadCategoriesForCurrentType(): Promise<void> {
        if (!this.elementsReady) return;
        const type = this.typeSelect!.value as OperationType;

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
        this.typeSelect!.addEventListener("change", () =>
            void this.loadCategoriesForCurrentType());

        // создать
        this.btnCreate!.addEventListener("click", async () => {
            void this.handleCreate();
        });

        // отмена
        this.btnCancel!.addEventListener("click", () => {
            this.openNewRoute("/operations");
        });
    }

    private async handleCreate(): Promise<void> {
        if (!this.elementsReady) return;

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
            await OperationService.createOperation(payload);
            showMessage(this.container!, "Операция успешно создана", "success");
            setTimeout(() => (this.openNewRoute("/operations")), 800);
        } catch (e: unknown) {
            showMessage(this.container!, (e as Error).message || "Ошибка при создании операции", "danger");
        }
    }
}
