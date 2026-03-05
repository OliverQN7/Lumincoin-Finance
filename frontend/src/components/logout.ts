import {AuthUtils} from "../utils/auth-utils";
import type {OpenNewRouteType} from "../types/common.types";
import type {LogoutRequestType} from "../types/logout.types";
import {HttpUtils} from "../utils/http-utils";

export class Logout {
    private readonly openNewRoute: OpenNewRouteType;

    constructor(openNewRoute: OpenNewRouteType) {
        this.openNewRoute = openNewRoute;

        if (!AuthUtils.isAuthenticated()) {
            this.openNewRoute('/login');
            return;
        }

        void this.handleLogout();
    }

    async handleLogout(): Promise<void> {
        const requestData: LogoutRequestType = {
            refreshToken: AuthUtils.getAuthInfo(AuthUtils.refreshTokenKey) || null,
        };

        try {
            await HttpUtils.request('/logout', 'POST', requestData);
        } catch (error) {
            console.warn('Logout request failed:', error);
        }

        AuthUtils.removeAuthInfo();
        this.openNewRoute('/login');
    }
}