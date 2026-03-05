export type HttpMethodType  = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type HttpResultType<T> = {
    error: boolean;
    response: T | null;
    status: number;
}