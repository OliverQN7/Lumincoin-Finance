import {BalanceService} from "../services/balance-service";
import * as bootstrap from 'bootstrap';
import type {BalanceElementsType, BalanceMountOptionsType, BalanceStateType} from "../types/balance-ui.types";

class BalanceUI {
    private state: BalanceStateType = {
        isMounted: false,
        timer: null
    }

    private readonly elements: BalanceElementsType = {
        balance: document.querySelector('[data-balance]'),
        balanceValue: document.getElementById('balance-value'),
        balanceInput: document.getElementById('balanceInput') as HTMLInputElement | null,
        editBalanceModal: document.getElementById('editBalanceModal'),
        balanceSuccess: document.getElementById('balanceSuccess'),
        saveBalanceBtn: document.getElementById('saveBalanceBtn'),
    }

    private formatCurrency(value: number): string {
        if (!Number.isFinite(value)) return '-';
        return `${Math.round(value)}$`;
    }

    private async updateBalanceOne(): Promise<void> {
        const el = this.elements.balance;
        if (!el) return;

        el.textContent = '...';

        try {
            const value = await BalanceService.getBalance();
            if (!Number.isFinite(value)) {
                throw new Error('Invalid balance');
            }

            el.textContent = this.formatCurrency(value);
            el.dataset.currentBalance = String(value);
        } catch {
            el.textContent = "0$";
        }
    }

    private startBalancePolling(interval: number = 15000): void {
        this.stopBalancePolling();
        this.state.timer = window.setInterval(() => this.updateBalanceOne(), interval);
    }


    private stopBalancePolling(): void {
        if (this.state.timer) {
            window.clearInterval(this.state.timer);
            this.state.timer = null;
        }
    }

    mountBalance(options: BalanceMountOptionsType = {}): void {
        const {withPolling = true, interval = 15000} = options;

        if (this.state.isMounted) {
            void this.updateBalanceOne();
            return;
        }

        this.state.isMounted = true;
        void this.updateBalanceOne();

        if (withPolling) {
            this.startBalancePolling(interval);
        }
    }

    unmountBalance(): void {
        this.stopBalancePolling();
        this.state.isMounted = false;
    }

    handleBalanceClickToEdit(): void {
        const el = this.elements.balanceValue;
        if (!el) return;

        const current = Number(el.dataset.currentBalance || '0');
        const input = this.elements.balanceInput;
        const modalEl = this.elements.editBalanceModal;
        const successEl = this.elements.balanceSuccess;
        const saveBtn = this.elements.saveBalanceBtn;

        if (!input || !modalEl || !successEl || !saveBtn) return;

        const modal = new bootstrap.Modal(modalEl);
        input.value = String(current);

        successEl.style.display = 'none';
        successEl.style.opacity = '0';

        modal.show();

        const prevHandler = (saveBtn.onclick as (() => void) | null);
        saveBtn.onclick = null;

        const handler = async (): Promise<void> => {
            const value = parseFloat(input.value.replace(/\s+/g, ''));
            if (!Number.isFinite(value)) {
                input.classList.add('is-invalid');
                return;
            }

            try {
                this.stopBalancePolling();
                const updated = await BalanceService.setBalance(value);

                el.textContent = this.formatCurrency(updated);
                el.dataset.currentBalance = String(updated);

                successEl.style.display = 'block';
                requestAnimationFrame(() => successEl.style.opacity = '1');

                setTimeout(() => {
                    successEl.style.opacity = '0';
                    if (document.activeElement) {
                        (document.activeElement as HTMLElement).blur();
                    }
                    modal.hide();
                }, 1000);
            } catch {
                input.classList.add('is-invalid');
            } finally {
                this.startBalancePolling();
            }
        };

        saveBtn.onclick = handler;

        modalEl.addEventListener('hidden.bs.modal', () => {
            input.classList.remove('is-invalid');
            saveBtn.onclick = prevHandler || null;
        }, {once: true});
    }
}

const balanceUI = new BalanceUI();

export function mountBalance(options: BalanceMountOptionsType = {}): void {
    balanceUI.mountBalance(options);
}

export function unmountBalance(): void {
    balanceUI.unmountBalance();
}

export function handleBalanceClickToEdit(): void {
    balanceUI.handleBalanceClickToEdit();
}



