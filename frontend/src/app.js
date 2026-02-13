import {Router} from "./router";
import {StorageUtils} from "./utils/storage-utils";

// Очистка мусора из localStorage (битые токены, повреждённый userInfo и т.д.)
StorageUtils.normalizeLocalStorage(['accessToken', 'refreshToken', 'userInfo'])

class App {
    constructor() {
        new Router();
    }
}

(new App());
