import {CategoryService} from "../services/category-service.js";

export class Expenses {
    constructor() {
        this.container = document.querySelector(".main__content-block");
        this.modalDelete = document.querySelector("#deleteModal");
        this.modalInstance = null;
        this.confirmDeleteBtn = null;

        this.init();
    }

    async init() {
        await this.renderCategories();
        this.initModal();
        this.bindEvents();
    }

    initModal() {
        if (this.modalDelete) {
            this.modalInstance = bootstrap.Modal.getOrCreateInstance(this.modalDelete);
            this.confirmDeleteBtn = this.modalDelete.querySelector(".btn-success");
        }
    }

    async renderCategories() {
        try {
            const categories = await CategoryService.getExpenseCategories();

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
        } catch (err) {
            this.container.innerHTML = `<p class="text-danger text-center">${err.message}</p>`;
        }
    }

    bindEvents() {
        document.addEventListener("click", async (e) => {
            const addBtn = e.target.closest("#addCategory");
            if (addBtn) {
                location.href = "/expenses-create";
                return;
            }

            const editBtn = e.target.closest("[data-edit]");
            if (editBtn) {
                const id = editBtn.dataset.edit;
                location.href = `/expenses-editing?id=${id}`;
                return;
            }

            const deleteBtn = e.target.closest("[data-delete]");
            if (deleteBtn) {
                const id = deleteBtn.dataset.delete;
                this.prepareDelete(id);
                return;
            }

            const cancelBtn = e.target.closest("#deleteModal .btn-danger");
            if (cancelBtn) {
                this.modalInstance?.hide();
            }
        });
    }

    prepareDelete(id) {
        if (!this.confirmDeleteBtn) return;
        this.confirmDeleteBtn.onclick = null;

        this.confirmDeleteBtn.onclick = async () => {
            await this.handleDelete(id);
        };
    }

    async handleDelete(id) {
        try {
            await CategoryService.deleteExpenseCategory(id);
            const card = document.querySelector(`.card[data-id="${id}"]`);
            if (card) card.remove();

            this.modalInstance?.hide();

            const remaining = this.container.querySelectorAll(".card[data-id]");
            if (!remaining.length) this.renderEmptyState();
        } catch (err) {
            alert(err.message);
        }
    }

    renderEmptyState() {
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
