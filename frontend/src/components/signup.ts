import {AuthUtils} from "../utils/auth-utils";
import {HttpUtils} from "../utils/http-utils";
import type {OpenNewRouteType} from "../types/common.types";
import type {SignupRequestType, SignupResponseType} from "../types/signup.types";
import type {LoginRequestType, LoginResponseType} from "../types/login.types";

export class SignUp {
    private firstNameElement: HTMLInputElement | null = null;
    private lastNameElement: HTMLInputElement | null = null;
    private emailElement: HTMLInputElement | null = null;
    private passwordElement: HTMLInputElement | null = null;
    private passwordRepeatElement: HTMLInputElement | null = null;
    private commonErrorElement: HTMLElement | null = null;
    private processButton: HTMLElement | null = null;

    private readonly openNewRoute: OpenNewRouteType;

    constructor(openNewRoute: OpenNewRouteType) {
        this.openNewRoute = openNewRoute;

        const token = AuthUtils.getAuthInfo(AuthUtils.accessTokenKey);
        if (typeof token === 'string' && token) {
            this.openNewRoute('/');
            return;
        }

        this.firstNameElement = document.getElementById('input-firstName') as HTMLInputElement | null;
        this.lastNameElement = document.getElementById('input-lastName') as HTMLInputElement | null;
        this.emailElement = document.getElementById('input-email') as HTMLInputElement | null;
        this.passwordElement = document.getElementById('input-password') as HTMLInputElement | null;
        this.passwordRepeatElement = document.getElementById('input-passwordRepeat') as HTMLInputElement | null;
        this.commonErrorElement = document.getElementById('common-error') as HTMLElement | null;
        this.processButton = document.getElementById('process-button') as HTMLElement | null;

        this.processButton?.addEventListener('click', this.handleSignup.bind(this));
    }

    private validateForm(): boolean {
        let isValid = true;

        if (this.firstNameElement?.value) {
            const nameRegex = /^[А-ЯЁ][а-яё\s\-]*[а-яё]$/;
            if (nameRegex.test(this.firstNameElement.value)) {
                this.firstNameElement.classList.remove('is-invalid');
            } else {
                this.firstNameElement.classList.add('is-invalid');
                isValid = false;
            }
        } else {
            this.firstNameElement?.classList.add('is-invalid');
            isValid = false;
        }

        if (this.lastNameElement?.value) {
            const lastNameRegex = /^[А-ЯЁ][а-яё\s\-]*[а-яё]$/;
            if (lastNameRegex.test(this.lastNameElement.value)) {
                this.lastNameElement.classList.remove('is-invalid');
            } else {
                this.lastNameElement.classList.add('is-invalid');
                isValid = false;
            }
        } else {
            this.lastNameElement?.classList.add('is-invalid');
            isValid = false;
        }

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
            const passwordRegex = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
            if (passwordRegex.test(this.passwordElement.value)) {
                this.passwordElement.classList.remove('is-invalid');
            } else {
                this.passwordElement.classList.add('is-invalid');
                isValid = false;
            }
        } else {
            this.passwordElement?.classList.add('is-invalid');
            isValid = false;
        }

        if (this.passwordRepeatElement?.value && this.passwordRepeatElement.value === this.passwordElement?.value) {
            this.passwordRepeatElement.classList.remove('is-invalid');
        } else {
            this.passwordRepeatElement?.classList.add('is-invalid');
            isValid = false;
        }

        return isValid;
    }

    private async handleSignup(): Promise<void> {
        this.commonErrorElement?.style.setProperty('display', 'none');

        if (!this.validateForm()) return;

        const signupData: SignupRequestType = {
            name: this.firstNameElement!.value,
            lastName: this.lastNameElement!.value,
            email: this.emailElement!.value,
            password: this.passwordElement!.value,
            passwordRepeat: this.passwordRepeatElement!.value,
        }

        const loginData: LoginRequestType = {
            email: this.emailElement!.value,
            password: this.passwordElement!.value,
            rememberMe: false,
        }

        try {
            // 1. Регистрация
            const signupResult = await HttpUtils.request<SignupResponseType>('/signup', 'POST', signupData);
            if (signupResult.error || !signupResult.response?.user) {
                this.showError();
                return;
            }

            // 2. Авто-логин
            const loginResult = await HttpUtils.request<LoginResponseType>('/login', 'POST', loginData);
            if (loginResult.error || !loginResult.response) {
                this.showError();
                return;
            }

            const loginResponse = loginResult.response;

            // 3. Сохраняем данные
            if (!loginResponse.tokens?.accessToken || !loginResponse.tokens?.refreshToken) {
                this.showError();
                return;
            }

            AuthUtils.setAuthInfo(
                loginResponse.tokens.accessToken,
                loginResponse.tokens.refreshToken,
                {
                    id: signupResult.response.user.id,     // из signup
                    email: signupResult.response.user.email,
                    name: signupResult.response.user.name,
                    lastName: signupResult.response.user.lastName,
                }
            );

            this.openNewRoute('/login');
        } catch (error) {
            console.error('Signup error:', error);
            this.showError();
        }
    }

    private showError(): void {
        this.commonErrorElement?.style.setProperty('display', 'block');
    }
}


