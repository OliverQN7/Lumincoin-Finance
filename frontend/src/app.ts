import {Router} from "./router";
import {StorageUtils} from "./utils/storage-utils";
import * as bootstrap from 'bootstrap';

(window as any).bootstrap = bootstrap;
StorageUtils.normalizeLocalStorage(['accessToken', 'refreshToken', 'userInfo'])

class App {
    constructor() {
        new Router();
    }
}

(new App());
