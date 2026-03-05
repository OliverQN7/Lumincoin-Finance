import {AuthUtils} from "../utils/auth-utils";
import {HttpUtils} from "../utils/http-utils";
import type {LoginRequestType, LoginResponseType} from "../types/login.types";
import type {OpenNewRouteType} from "../types/common.types";

export class Login {
    private readonly emailElement: HTMLInputElement | null = null;
    private readonly passwordElement: HTMLInputElement | null = null;
    private readonly rememberMeElement: HTMLInputElement | null = null;
    private readonly commonErrorElement: HTMLElement | null = null;
    private readonly processButton: HTMLElement | null = null;

    private readonly openNewRoute: OpenNewRouteType;

    constructor(openNewRoute: OpenNewRouteType) {
        this.openNewRoute = openNewRoute;

        const token = AuthUtils.getAuthInfo(AuthUtils.accessTokenKey);
        if (typeof token === "string" && token) {
            this.openNewRoute('/');
            return
        }

        this.emailElement = document.getElementById('input-email') as HTMLInputElement | null;
        this.passwordElement = document.getElementById('input-password') as HTMLInputElement | null;
        this.rememberMeElement = document.getElementById('remember') as HTMLInputElement | null;
        this.commonErrorElement = document.getElementById('common-error') as HTMLElement | null;
        this.processButton = document.getElementById('process-button') as HTMLElement | null;

        this.processButton?.addEventListener('click', this.handleLogin.bind(this));
    }

    private validateForm(): boolean {
        let isValid = true;

        if (this.emailElement?.value) {
            const emailRegex = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
            if (emailRegex.test(this.emailElement.value)) {
                this.emailElement.classList.remove('is-invalid');
            } else {
                this.emailElement.classList.add('is-invalid');
                isValid = false;
            }
        } else {
            this.emailElement?.classList.add('is-invalid');
            isValid = false;
        }

        if (this.passwordElement?.value) {
            this.passwordElement.classList.remove('is-invalid');
        } else {
            this.passwordElement?.classList.add('is-invalid');
            isValid = false;
        }

        return isValid;
    }

    private async handleLogin(): Promise<void> {
        this.commonErrorElement?.style.setProperty('display', 'none');

        if (!this.validateForm()) return;

        const requestData: LoginRequestType = {
            email: this.emailElement!.value,
            password: this.passwordElement!.value,
            rememberMe: Boolean(this.rememberMeElement?.checked)
        }

        try {
            const result = await HttpUtils.request<LoginResponseType>('/login', 'POST', requestData);
            if (result.error || !result.response) {
                this.showError();
                return;
            }

            const response = result.response;

            if (
                !response?.tokens?.accessToken ||
                !response?.tokens?.refreshToken ||
                !response?.user?.id
            ) {
                this.showError();
                return;
            }

            AuthUtils.setAuthInfo(
                response.tokens.accessToken,
                response.tokens.refreshToken,
                {
                    id: response.user.id,
                    name: response.user.name ?? '',
                    lastName: response.user.lastName ?? '',
                }
            );

            this.openNewRoute('/');

        } catch (error) {
            console.error('Login error', error);
            this.showError();
        }
    }

    private showError(): void {
        this.commonErrorElement?.style.setProperty('display', 'block');
    }
}