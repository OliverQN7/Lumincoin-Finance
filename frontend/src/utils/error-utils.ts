import type {ApiErrorType} from "../types/api-error.types";

export function getErrorMessage(resp: unknown, fallback: string): string {
    if (resp && typeof resp === 'object' && 'message' in resp) {
        const message = (resp as ApiErrorType).message;
        if (typeof message === 'string' && message.trim()) return message;
    }
    return fallback;
}