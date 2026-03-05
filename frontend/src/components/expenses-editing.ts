import {CategoryService} from "../services/category-service";
import {showMessage} from "../utils/ui-utils";
import type {ExpenseCategoryType, UpdateExpenseCategoryType} from "../types/expense.types";
import type {OpenNewRouteType} from "../types/common.types";

export class ExpensesEditing {
    private readonly container: HTMLElement | null;
    private readonly inputTitle: HTMLInputElement | null = null;
    private readonly btnSave: HTMLElement | null = null;
    private readonly btnCancel: HTMLElement | null = null;
    private readonly id!: string | null;

    constructor(private readonly openNewRoute: OpenNewRouteType) {
        this.container = document.querySelector('.main__content-block') as HTMLElement | null;
        if (!this.container) return;

        this.inputTitle = this.container.querySelector('.form-control') as HTMLInputElement | null;
        this.btnSave = this.container.querySelector('.btn-success') as HTMLElement | null;
        this.btnCancel = this.container.querySelector('.btn-danger') as HTMLElement | null;

        const urlParams = new URLSearchParams(window.location.search);
        this.id = urlParams.get("id");

        void this.init();
    }

    private async init(): Promise<void> {
        if (!this.id || !this.inputTitle || !this.container) return;

        try {
            const category: ExpenseCategoryType = await CategoryService.getExpenseCategoryById(this.id);
            if (category.error) {
                showMessage(this.container, "Ошибка загрузки категории", "danger");
                return;
            }

            this.inputTitle.value = category.title || "";
            this.bindEvents();
        } catch {
            showMessage(this.container, "Ошибка загрузки категории", "danger");
        }
    }

    private bindEvents(): void {
        if (!this.inputTitle || !this.btnSave || !this.btnCancel || !this.id || !this.container) return;

        const {inputTitle, btnSave, btnCancel, container, id} = this;

        btnSave.addEventListener("click", async () => {
            const title = inputTitle.value.trim();
            if (!title) {
                showMessage(container, "Введите название категории", "danger");
                return;
            }

            try {
                const categories: ExpenseCategoryType[] = await CategoryService.getExpenseCategories();
                const exists = categories.some(cat => cat.title === title && cat.id !== this.id);

                if (exists) {
                    showMessage(container, "Категория с таким названием уже существует!", "danger");
                    return;
                }

                const data: UpdateExpenseCategoryType = {title};
                await CategoryService.updateExpenseCategory(id, data);

                showMessage(container, "Категория успешно обновлена!", "success");
                setTimeout(() => this.openNewRoute("/expenses"), 1000);
            } catch (err: unknown) {
                const message = (err instanceof Error && err.message?.includes("already exists"))
                    ? "Категория с таким названием уже существует!"
                    : "Ошибка при обновлении категории";
                showMessage(container, message, "danger");
            }
        });

        btnCancel.addEventListener("click", () => {
            this.openNewRoute("/expenses");
        });
    }
}
