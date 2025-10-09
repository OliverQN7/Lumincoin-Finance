import {AuthUtils} from "../utils/auth-utils";
import {HttpUtils} from "../utils/http-utils";

export class SignUp {
    constructor(openNewRoute) {
        this.openNewRoute = openNewRoute;

        if (AuthUtils.getAuthInfo(AuthUtils.accessTokenKey)) {
            return this.openNewRoute('/');
        }


        this.firstNameElement = document.getElementById('input-firstName');
        this.lastNameElement = document.getElementById('input-lastName');
        this.emailElement = document.getElementById('input-email');
        this.passwordElement = document.getElementById('input-password');
        this.passwordRepeatElement = document.getElementById('input-passwordRepeat');
        this.commonErrorElement = document.getElementById('common-error');

        document.getElementById('process-button').addEventListener('click', this.signUp.bind(this));
    }

    validateForm() {

        let isValid = true;

        if (this.firstNameElement.value && this.firstNameElement.value.match(/^[А-ЯЁ][а-яё\s\-]*[а-яё]$/)) {
            this.firstNameElement.classList.remove('is-invalid');
        } else {
            this.firstNameElement.classList.add('is-invalid');
            isValid = false;
        }

        if (this.lastNameElement.value && this.lastNameElement.value.match(/^[А-ЯЁ][а-яё\s\-]*[а-яё]$/)) {
            this.lastNameElement.classList.remove('is-invalid');
        } else {
            this.lastNameElement.classList.add('is-invalid');
            isValid = false;
        }

        if (this.emailElement.value && this.emailElement.value.match(/^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/)) {
            this.emailElement.classList.remove('is-invalid');
        } else {
            this.emailElement.classList.add('is-invalid');
            isValid = false;
        }

        if (this.passwordElement.value && this.passwordElement.value.match(/^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/)) {
            this.passwordElement.classList.remove('is-invalid');
        } else {
            this.passwordElement.classList.add('is-invalid');
            isValid = false;
        }

        if (this.passwordRepeatElement.value && this.passwordRepeatElement.value === this.passwordElement.value) {
            this.passwordRepeatElement.classList.remove('is-invalid');
        } else {
            this.passwordRepeatElement.classList.add('is-invalid');
            isValid = false;
        }

        return isValid;
    }

    async signUp() {
        this.commonErrorElement.style.display = 'none';
        if (this.validateForm()) {
            const response = await fetch('http://localhost:3000/api/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    name: this.firstNameElement.value,
                    lastName: this.lastNameElement.value,
                    email: this.emailElement.value,
                    password: this.passwordElement.value,
                    passwordRepeat: this.passwordRepeatElement.value,
                })
            });

            const result = await response.json();


            if (result.error || !result.user) {
                this.commonErrorElement.style.display = 'block';
                return;
            }

            const loginResult = await HttpUtils.request('/login', 'POST', {
                email: this.emailElement.value,
                password: this.passwordElement.value,
            })

            const loginResponse = await loginResult.response;

            if (loginResponse.error || !loginResponse ||!loginResponse.tokens?.accessToken || !loginResponse.tokens?.refreshToken || !loginResponse.user) {
                return this.openNewRoute('/login');
            }


            AuthUtils.setAuthInfo(
                loginResponse.tokens.accessToken,
                loginResponse.tokens.refreshToken,
                {
                    id: result.user.id,
                    email: result.user.email,
                    name: result.user.name,
                    lastName: result.user.lastName,
                }
            )

            this.openNewRoute('/login');
        }
    }
}


