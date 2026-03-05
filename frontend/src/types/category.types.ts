export type CategoryType = 'income' | 'expense';

export type CategoryIdType = number | string;

export type CategoryTypeItem = {
    id: CategoryIdType;
    title: string;
}

export type CategoryMapType = Record<string, string>;

export type CategoryCreateUpdateType = {
    title: string;
};