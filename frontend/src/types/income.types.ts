export type IncomeCategoryType = {
    id: string | number;
    title: string;
    error?: boolean;
}

export type CreateIncomeCategoryType = {
    title: string;
}

export type UpdateIncomeCategoryType = {
    title: string;
}