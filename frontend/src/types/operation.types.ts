import type {CategoryType} from "./category.types";

export type PeriodType = 'all' | 'today' | 'week' | 'month' | 'year' | 'interval';

export type OperationFilterParamsType = | { period: Exclude<PeriodType, 'interval'> }
    | { period: 'interval'; dateFrom?: string; dateTo?: string };

export type OperationType = CategoryType;

export type OperationIdType = number | string;

export type OperationTypeItem = {
    id: number | string;
    type: OperationType;
    amount?: number | string | null;

    category?: string | null;
    category_id?: number | string | null;

    date?: string;
    comment?: string | null;
}


export type OperationCreateUpdateType = {
    type: OperationType;
    amount: number;
    date: string;
    category_id: number;
    comment?: string;
}