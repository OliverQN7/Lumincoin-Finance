export type ExpenseCategoryType = {
    id: string | number;
    title: string;
    error?: boolean;
}

export type CreateExpenseCategoryType = {
    title: string;
}

export type UpdateExpenseCategoryType = {
    title: string;
}