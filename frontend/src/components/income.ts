import {CategoryService} from "../services/category-service";
import type {IncomeCategoryType} from "../types/income.types";
import type {OpenNewRouteType} from "../types/common.types";
import * as bootstrap from 'bootstrap';


export class Income {
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

    // Инициализация модалки
    private initModal(): void {
        if (this.modalDelete) {
            this.modalInstance = bootstrap.Modal.getOrCreateInstance(this.modalDelete);
            this.confirmDeleteBtn = this.modalDelete.querySelector(".btn-success") as HTMLElement | null;
        }
    }

    // Рендер списка категорий доходов
    private async renderCategories(): Promise<void> {
        if (!this.container) return;

        try {
            const categories: IncomeCategoryType[] = await CategoryService.getIncomeCategories();

            if (!categories.length) {
                this.renderEmptyState();
                return;
            }

            // Рендерим категории
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

    // Навешиваем события
    private bindEvents(): void {
        if (!this.container) return;

        document.addEventListener("click", async (e: MouseEvent) => {
            const target = e.target as HTMLElement;

            const addBtn = target.closest("#addCategory") as HTMLElement | null;
            if (addBtn) {
                this.openNewRoute("/income-create");
                return;
            }

            const editBtn = target.closest("[data-edit]") as HTMLElement | null;
            if (editBtn) {
                const id = editBtn.dataset.edit;
                this.openNewRoute(`/income-editing?id=${id}`);
                return;
            }

            const deleteBtn = target.closest("[data-delete]") as HTMLElement | null;
            if (deleteBtn && deleteBtn.dataset.delete) {  // ✅ Проверка dataset!
                const id = deleteBtn.dataset.delete;
                this.prepareDelete(id);
                return;
            }

            const cancelBtn = target.closest("#deleteModal .btn-danger") as HTMLElement | null;
            if (cancelBtn) {
                this.modalInstance?.hide();
            }
        });
    }

    // Настройка кнопки подтверждения удаления
    private prepareDelete(id: string): void {
        if (!this.confirmDeleteBtn) return;

        // Сбрасываем прошлое событие
        this.confirmDeleteBtn.onclick = null;

        this.confirmDeleteBtn.onclick = async () => {
            await this.handleDelete(id);
        };
    }

    // Удаление категории
    private async handleDelete(id: string): Promise<void> {
        try {
            await CategoryService.deleteIncomeCategory(id);

            // Убираем карточку из DOM
            const card = document.querySelector(`.card[data-id="${id}"]`) as HTMLElement | null;
            card?.remove();

            // Закрываем модалку
            this.modalInstance?.hide();

            // Если не осталось категорий — показываем сообщение и кнопку "+"
            const remaining = this.container?.querySelectorAll(".card[data-id]");
            if (this.container && !remaining?.length) {
                this.renderEmptyState();
            }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Ошибка удаления';
            alert(message);
        }
    }

    // Новый метод для пустого состояния
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
            </div>
        `;
    }
}
