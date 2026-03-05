import type {StorageKeyType, ParsedUserInfoType, InvalidValuesType} from "../types/storage-utils.types";

export class StorageUtils {
    static normalizeLocalStorage(keys: StorageKeyType[], invalidValues: InvalidValuesType = ['null', 'undefined', ""]): void {
        keys.forEach((key) => {
            const storedValue = localStorage.getItem(key)?.trim();

            const isInvalid = !storedValue || invalidValues.includes(storedValue);

            const isInvalidJson = key === 'userInfo' && (() => {
                if (!storedValue) return true;

                try {
                    const parsed = JSON.parse(storedValue) as ParsedUserInfoType;
                    return !parsed || typeof parsed !== 'object' || !parsed.id == null || parsed.id === '';
                } catch {
                    return true;
                }
            })();

            if (isInvalid || isInvalidJson) {
                localStorage.removeItem(key);
            }
        });
    }


    // static getItem<T = string>(key: StorageKeyType): T | null {
    //     const value = localStorage.getItem(key);
    //     if (!value) return null;
    //
    //     try {
    //         return JSON.parse(value) as T;
    //     } catch {
    //         return value as T;
    //     }
    // }
    //
    // static setItem(key: StorageKeyType, value: unknown): void {
    //     if (value == null) {
    //         localStorage.removeItem(key);
    //         return
    //     }
    //
    //     localStorage.setItem(key, JSON.stringify(value));
    // }
}