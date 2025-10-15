import {BalanceService} from "../services/balance-service";

let balanceTimer = null;
let isMounted = false;

function formatCurrency(value) {
    if (!Number.isFinite(value)) return '-';
    return `${Math.round(value)}$`;
}

async function updateBalanceOne() {
    const el = document.querySelector('[data-balance]');
    if (!el) return;

    el.textContent = '...';

    try {
        const value = await BalanceService.getBalance();
        if (!Number.isFinite(value)) {
            throw new Error('Invalid balance');
        }

        el.textContent = formatCurrency(value);
        el.dataset.currentBalance = String(value);
    } catch {
        el.textContent = "0$";
    }
}

function startBalancePolling(interval = 15000) {
    stopBalancePolling();
    balanceTimer = setInterval(updateBalanceOne, interval);
}

function stopBalancePolling() {
    if (balanceTimer) {
        clearInterval(balanceTimer);
        balanceTimer = null;
    }
}

export function mountBalance({withPolling = true, interval = 15000} = {}) {
    if (isMounted) {
        updateBalanceOne();
        return;
    }

    isMounted = true;
    updateBalanceOne();

    if (withPolling) {
        startBalancePolling(interval);
    }
}

export function unmountBalance() {
    stopBalancePolling();
    isMounted = false;
}

export function handleBalanceClickToEdit() {
    const el = document.querySelector('#balance-value');
    if (!el) return;

    const current = Number(el.dataset.currentBalance || '0');
    const input = document.getElementById('balanceInput');
    const modalEl = document.getElementById('editBalanceModal');
    const modal = new bootstrap.Modal(modalEl);
    const successEl = document.getElementById('balanceSuccess');
    const saveBtn = document.getElementById('saveBalanceBtn');

    input.value = current;
    successEl.style.display = 'none';
    successEl.style.opacity = '0';

    modal.show();

    saveBtn.onclick = async () => {
        const value = parseFloat(input.value.replace(/\s+/g, ''));
        if (!Number.isFinite(value)) {
            input.classList.add('is-invalid');
            return;
        }

        try {
            stopBalancePolling();
            const updated = await BalanceService.setBalance(value);

            el.textContent = formatCurrency(updated);
            el.dataset.currentBalance = String(updated);

            successEl.style.display = 'block';
            requestAnimationFrame(() => successEl.style.opacity = '1');

            setTimeout(() => {
                successEl.style.opacity = '0';
                document.activeElement.blur();
                modal.hide();
            }, 1000);
        } catch {
            input.classList.add('is-invalid');
        } finally {
            startBalancePolling();
        }
    };
}
