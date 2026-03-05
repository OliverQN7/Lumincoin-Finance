import type {OperationCreateUpdateType, OperationType} from "../types/operation.types";
import {CategoryService} from "../services/category-service";

export interface FormElements {
    typeSelect: HTMLSelectElement;
    categorySelect: HTMLSelectElement;
    newCategoryInput: HTMLInputElement;
    sumInput: HTMLInputElement;
    dateInput: HTMLInputElement;
    commentInput: HTMLInputElement;
}

export async function preparePayload(elements: FormElements): Promise<OperationCreateUpdateType> {
    let categoryId = elements.categorySelect.value;
    const newCategoryTitle = elements.newCategoryInput.value.trim();
    const type = elements.typeSelect.value as OperationType;

    if (newCategoryTitle) {
        const newCat = type === "income"
            ? await CategoryService.createIncomeCategory({title: newCategoryTitle})
            : await CategoryService.createExpenseCategory({title: newCategoryTitle});
        categoryId = String(newCat.id);
    }

    return {
        type,
        amount: Number(elements.sumInput.value),
        date: elements.dateInput.value,
        comment: elements.commentInput.value.trim() || '',
        category_id: Number(categoryId)
    };
}