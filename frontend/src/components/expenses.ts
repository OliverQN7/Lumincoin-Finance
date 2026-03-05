import {CategoryService} from "../services/category-service";
import * as bootstrap from 'bootstrap';
import type {OpenNewRouteType} from "../types/common.types";
import type {ExpenseCategoryType} from "../types/expense.types";

export class Expenses {
    private readonly container: HTMLElement | null;
    private readonly modalDelete: HTMLElement | null;
    private modalInstance: bootstrap.Modal | null = null;
    private confirmDeleteBtn: HTMLElement | null = null;


    constructor(private readonly openNewRoute: OpenNewRouteType) {
        this.container = document.querySelector(".main__content-block") as HTMLElement | null;
        this.modalDelete = document.querySelector("#deleteModal") as HTMLElement | null;

        if (!this.container) return;

        void this.init();
    }

    private async init(): Promise<void> {
        await this.renderCategories();
        this.initModal();
        this.bindEvents();
    }

    private initModal(): void {
        if (this.modalDelete) {
            this.modalInstance = bootstrap.Modal.getOrCreateInstance(this.modalDelete);
            this.confirmDeleteBtn = this.modalDelete.querySelector(".btn-success") as HTMLElement | null;
        }
    }

    private async renderCategories(): Promise<void> {
        if (!this.container) return;

        try {
            const categories: ExpenseCategoryType[] = await CategoryService.getExpenseCategories();

            if (!categories.length) {
                this.renderEmptyState();
                return;
            }

            this.container.innerHTML = categories.map(cat => `
                <div class="card" data-id="${cat.id}">
                    <div class="card-body">
                        <h5 class="card-title">${cat.title}</h5>
                        <button class="card-btn btn btn-primary" data-edit="${cat.id}">Редактировать</button>
                        <button class="card-btn btn btn-danger" data-delete="${cat.id}" data-bs-toggle="modal" data-bs-target="#deleteModal">Удалить</button>
                    </div>
                </div>
            `).join('') + `
                <div class="card">
                    <div class="card__add card-body text-center" id="addCategory">
                        <button class="card__add-text card-title">+</button>
                    </div>
                </div>
            `;
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Неизвестная ошибка';
            this.container.innerHTML = `<p class="text-danger text-center">${message}</p>`;
        }
    }

    private bindEvents(): void {
        if (!this.container) return;

        document.addEventListener("click", async (e: MouseEvent) => {
            const target = e.target as HTMLElement;

            const addBtn = target.closest("#addCategory") as HTMLElement | null;
            if (addBtn) {
                this.openNewRoute("/expenses-create");
                return;
            }

            const editBtn = target.closest("[data-edit]") as HTMLElement | null;
            if (editBtn && editBtn.dataset.edit) {
                this.openNewRoute(`/expenses-editing?id=${editBtn.dataset.edit}`);
                return;
            }

            const deleteBtn = target.closest("[data-delete]") as HTMLElement | null;
            if (deleteBtn && deleteBtn.dataset.delete) {
                this.prepareDelete(deleteBtn.dataset.delete);
                return;
            }

            const cancelBtn = target.closest("#deleteModal .btn-danger") as HTMLElement | null;
            if (cancelBtn) {
                this.modalInstance?.hide();
            }
        });
    }

    private prepareDelete(id: string): void {
        if (!this.confirmDeleteBtn) return;

        this.confirmDeleteBtn.onclick = null;
        this.confirmDeleteBtn.onclick = async () => {
            await this.handleDelete(id);
        };
    }

    private async handleDelete(id: string): Promise<void> {
        try {
            await CategoryService.deleteExpenseCategory(id);

            const card = document.querySelector(`.card[data-id="${id}"]`) as HTMLElement | null;
            if (card) card.remove();

            this.modalInstance?.hide();

            const remaining = this.container?.querySelectorAll(".card[data-id]");
            if (this.container && !remaining?.length) this.renderEmptyState();
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Ошибка удаления';
            alert(message);
        }
    }

    private renderEmptyState(): void {
        if (!this.container) return;

        this.container.innerHTML = `
        <div class="empty-state text-center">
            <p class="text-muted mb-3">Категории отсутствуют</p>
            <div class="card mx-auto">
                <div class="card__add card-body text-center" id="addCategory">
                    <button class="card__add-text card-title">+</button>
                </div>
            </div>
        </div>`;
    }
}
