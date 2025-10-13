export class StorageUtils {

    static normalizeLocalStorage(keys, invalidValues = ['null', 'undefined', ""]) {
        keys.forEach((key) => {
            const storedValue = localStorage.getItem(key)?.trim();

            const isInvalid = !storedValue || invalidValues.includes(storedValue);
            const isInvalidJson = key === 'userInfo' && (() => {
                try {
                    const parsed = JSON.parse(storedValue);
                    return !parsed || typeof parsed !== 'object' || !parsed.id;
                } catch {
                    return true;
                }
            })();

            if (isInvalid || isInvalidJson) {
                localStorage.removeItem(key);
            }
        });
    }
}