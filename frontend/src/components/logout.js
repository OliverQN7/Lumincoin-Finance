import {AuthUtils} from "../utils/auth-utils";

export class Logout {
    constructor(openNewRoute) {
        this.openNewRoute = openNewRoute;

        if (!AuthUtils.isAuthenticated()) {
            return this.openNewRoute('/login')
        }

        this.logout().then();
    }

    async logout() {
        try {
            await fetch('http://localhost:3000/api/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    refreshToken: localStorage.getItem('refreshToken'),
                })
            }).catch(() => null);
        } finally {
            AuthUtils.removeAuthInfo();
            this.openNewRoute('/login');
        }
    }
}