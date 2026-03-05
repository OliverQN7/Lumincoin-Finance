import {showMessage} from "../utils/ui-utils";
import {CategoryService} from "../services/category-service";
import type {OpenNewRouteType} from "../types/common.types";
import type {CreateExpenseCategoryType} from "../types/expense.types";

export class ExpensesCreate {
    private readonly container: HTMLElement | null;
    private readonly inputTitle: HTMLInputElement | null = null;
    private readonly btnCreate: HTMLElement | null = null;
    private readonly btnCancel: HTMLElement | null = null;

    constructor(private readonly openNewRoute: OpenNewRouteType) {
        this.container = document.querySelector(".main__content-block") as HTMLElement | null;
        if (!this.container) return;

        this.inputTitle = this.container.querySelector(".form-control") as HTMLInputElement | null;
        this.btnCreate = this.container.querySelector(".btn-success") as HTMLElement | null;
        this.btnCancel = this.container.querySelector(".btn-danger") as HTMLElement | null;

        this.bindEvents()
    }

    private bindEvents(): void {
        if (!this.inputTitle || !this.btnCreate || !this.btnCancel || !this.container) return;

        const {inputTitle, btnCreate, btnCancel, container} = this;

        btnCreate.addEventListener("click", async () => {
            const title = inputTitle.value.trim();
            if (!title) {
                showMessage(container, "Введите название категории", "danger");
                return;
            }

            const data: CreateExpenseCategoryType = {title};

            try {
                await CategoryService.createExpenseCategory(data);
                showMessage(container, "Категория успешно создана!", "success");
                setTimeout(() => this.openNewRoute("/expenses"), 1000);
            } catch (err: unknown) {
                const message = (err instanceof Error && err.message?.includes("already exists"))
                    ? "Категория с таким названием уже существует!"
                    : "Ошибка при создании категории";
                showMessage(container, message, "danger");
            }
        });

        btnCancel.addEventListener("click", () => {
            this.openNewRoute("/expenses");
        });
    }
}