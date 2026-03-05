export type BalanceMountOptionsType = {
    withPolling?: boolean;
    interval?: number;
};

export type BalanceElementsType = {
    balance: HTMLElement | null;
    balanceValue: HTMLElement | null;
    balanceInput: HTMLInputElement | null;
    editBalanceModal: HTMLElement | null;
    balanceSuccess: HTMLElement | null;
    saveBalanceBtn: HTMLElement | null;
}

export interface BalanceStateType {
    isMounted: boolean;
    timer: number | null;
}