import {CategoryService} from "../services/category-service";
import {showMessage} from "../utils/ui-utils";
import type {CreateIncomeCategoryType} from "../types/income.types";
import type {OpenNewRouteType} from "../types/common.types";

export class IncomeCreate {
    private readonly container: HTMLElement | null;
    private inputTitle: HTMLInputElement | null = null;
    private btnCreate: HTMLElement | null = null;
    private btnCancel: HTMLElement | null = null;


    constructor(private readonly openNewRoute: OpenNewRouteType) {
        // Контейнер формы
        this.container = document.querySelector(".main__content-block") as HTMLElement | null;
        if (!this.container) return;

        // Инпуты
        this.inputTitle = this.container.querySelector(".form-control") as HTMLInputElement | null;

        // Кнопки
        this.btnCreate = this.container.querySelector(".btn-success") as HTMLElement | null;
        this.btnCancel = this.container.querySelector(".btn-danger") as HTMLElement | null;

        this.bindEvents();
    }

    private bindEvents(): void {
        if (!this.inputTitle || !this.btnCreate || !this.btnCancel || !this.container) return;

        const { inputTitle, btnCreate, btnCancel, container } = this;

        // Создать категорию
        btnCreate.addEventListener("click", async () => {
            const title = inputTitle.value.trim();
            if (!title) {
                showMessage(container, "Введите название категории", "danger");
                return;
            }

            const data: CreateIncomeCategoryType = {title};

            try {
                await CategoryService.createIncomeCategory(data);
                showMessage(container, "Категория успешно создана!", "success");
                setTimeout(() => (this.openNewRoute("/income")), 1000);
            } catch (e: unknown) {
                const message = (e as Error).message?.includes("already exists")
                    ? "Категория с таким названием уже существует!"
                    : "Ошибка при создании категории";
                showMessage(this.container!, message, "danger");
            }
        });

        // Отмена
        btnCancel.addEventListener("click", () => {
            this.openNewRoute("/income");
        });
    }


}
