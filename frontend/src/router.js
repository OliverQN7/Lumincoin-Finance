import {Dashboard} from "./components/dashboard";
import {Income} from "./components/income";
import {Expenses} from "./components/expenses";
import {Login} from "./components/login";
import {SignUp} from "./components/signup";
import {Logout} from "./components/logout";
import {InitSidebarActiveState, InitUserProfileName} from "./utils/ui-utils";
import {AuthUtils} from "./utils/auth-utils";
import {mountBalance, unmountBalance, handleBalanceClickToEdit} from "./utils/balance-ui";

export class Router {
    constructor() {
        this.titlePageElement = document.getElementById('title');
        this.contentPageElement = document.getElementById('content');
        this.lastStyleElement = document.getElementById('last-styles');

        this.initEvents();
        this.routes = [
            {
                route: '/signup',
                title: 'Регистрация',
                filePathTemplate: '/templates/signup.html',
                useLayout: false,
                load: () => {
                    new SignUp(this.openNewRoute.bind(this))
                },
                styles: ['signup.css']
            },
            {
                route: '/login',
                title: 'Авторизация',
                filePathTemplate: '/templates/login.html',
                useLayout: false,
                load: () => {
                    new Login(this.openNewRoute.bind(this));
                },
                styles: ['login.css']
            },
            {
                route: '/logout',
                load: () => {
                    new Logout(this.openNewRoute.bind(this));
                }
            },
            {
                route: '/',
                title: 'Главная',
                filePathTemplate: '/templates/dashboard.html',
                useLayout: '/templates/layout.html',
                load: () => {
                    new Dashboard();
                }
            },
            {
                route: '/income',
                title: 'Доходы',
                filePathTemplate: '/templates/income.html',
                useLayout: '/templates/layout.html',
                load: () => {
                    new Income();
                }
            },
            {
                route: '/income-create',
                title: 'Создание категории доходов',
                filePathTemplate: '/templates/income-create.html',
                useLayout: '/templates/layout.html',
                load: () => {
                    // все операции делать в Income(через new Income(); или сделать новый экземпляр класса new IncomeCreate?)
                },
                styles: ['income-create.css']
            },
            {
                route: '/income-editing',
                title: 'Редактирование категории доходов',
                filePathTemplate: '/templates/income-editing.html',
                useLayout: '/templates/layout.html',
                load: () => {
                    // все операции делать в Income(через new Income(); или сделать новый экземпляр класса new IncomeEditing?)
                },
                styles: ['income-create.css']
            },
            {
                route: '/expenses',
                title: 'Расходы',
                filePathTemplate: '/templates/expenses.html',
                useLayout: '/templates/layout.html',
                load: () => {
                    new Expenses();
                }
            },
            {
                route: '/expenses-create',
                title: 'Создание категории расходов',
                filePathTemplate: '/templates/expenses-create.html',
                useLayout: '/templates/layout.html',
                load: () => {
                    // все операции делать в Income(через new Income(); или сделать новый экземпляр класса new IncomeCreate?)
                },
                styles: ['income-create.css']
            },
            {
                route: '/expenses-editing',
                title: 'Редактирование категории расходов',
                filePathTemplate: '/templates/expenses-editing.html',
                useLayout: '/templates/layout.html',
                load: () => {
                    // все операции делать в Income(через new Income(); или сделать новый экземпляр класса new IncomeEditing?)
                },
                styles: ['income-create.css']
            },
            {
                route: '/operations',
                title: 'Доходы и расходы',
                filePathTemplate: '/templates/operations.html',
                useLayout: '/templates/layout.html',
                load: () => {
                }
            },
            {
                route: '/operations-create',
                title: 'Создание дохода/расхода',
                filePathTemplate: '/templates/operations-create.html',
                useLayout: '/templates/layout.html',
                load: () => {
                }
            },
            {
                route: '/operations-editing',
                title: 'Редактирование дохода/расхода',
                filePathTemplate: '/templates/operations-editing.html',
                useLayout: '/templates/layout.html',
                load: () => {
                }
            },
        ]
    }

    initEvents() {
        window.addEventListener('DOMContentLoaded', this.activateRoute.bind(this));
        window.addEventListener('popstate', this.activateRoute.bind(this));
        document.addEventListener('click', this.clickHandler.bind(this));
    }

    async openNewRoute(url) {
        const currentRoute = window.location.pathname;
        history.pushState({}, '', url);
        await this.activateRoute(null, currentRoute);
    }

    async clickHandler(e) {
        let element = null;
        if (e.target.nodeName === 'A') {
            element = e.target;
        } else if (e.target.parentNode.nodeName === 'A') {
            element = e.target.parentNode;
        }

        if (element) {
            e.preventDefault();

            const url = element.href.replace(window.location.origin, '');
            if (!url || url === '/#' || url.startsWith('javascript:void(0)')) {
                return;
            }
            this.openNewRoute(url);
        }
    }

    isPrivateRoute(routeObj) {
        return !!routeObj.useLayout;
    }

    async activateRoute(e, oldRoute = null) {
        if (oldRoute) {
            const currentRoute = this.routes.find(item => item.route === oldRoute);
            if (currentRoute.styles && currentRoute.styles.length > 0) {
                currentRoute.styles.forEach(style => {
                    console.log("Ищу для удаления:", `/css/${style}`, document.querySelector(`link[href='/css/${style}']`));
                    const linkEl = document.querySelector(`link[href='/css/${style}']`);
                    if (linkEl) {
                        linkEl.remove();
                    }
                });
            }

            const prev = this.routes.find(r => r.route === oldRoute);
            if (prev && prev.useLayout) {
                unmountBalance();
            }
        }

        const urlRoute = window.location.pathname;
        const newRoute = this.routes.find(item => item.route === urlRoute);

        if (newRoute) {
            if (this.isPrivateRoute(newRoute) && !AuthUtils.isAuthenticated()) {
                if (window.location.pathname !== 'login') {
                    return this.openNewRoute('/login');
                }
            }

            if (newRoute.styles && newRoute.styles.length > 0) {
                newRoute.styles.forEach(style => {
                    const link = document.createElement("link");
                    link.rel = 'stylesheet';
                    link.href = '/css/' + style;

                    if (this.lastStyleElement && document.head.contains(this.lastStyleElement)) {
                        this.lastStyleElement.after(link);
                    } else {
                        document.head.appendChild(link);
                    }

                    this.lastStyleElement = link; // Обновляем ссылку на последний стиль
                });
            }
            // --- Заголовок страницы
            if (newRoute.title) {
                this.titlePageElement.innerText = newRoute.title;
            }

            // --- Загрузка контента
            if (newRoute.filePathTemplate) {
                let contentBlock = this.contentPageElement;
                if (newRoute.useLayout) {
                    this.contentPageElement.innerHTML = await fetch(newRoute.useLayout).then(response => response.text());

                    InitUserProfileName();
                    if (AuthUtils.isAuthenticated()) {
                        mountBalance({withPolling: true, interval: 15000});
                        const balanceEl = document.querySelector('[data-balance]');
                        if (balanceEl) balanceEl.addEventListener('click', handleBalanceClickToEdit);
                    }

                    contentBlock = document.getElementById('content-layout')
                }
                contentBlock.innerHTML = await fetch(newRoute.filePathTemplate).then(response => response.text());

            }

            // --- Запуск JS-компонента
            if (newRoute.load && typeof newRoute.load === 'function') {
                newRoute.load();
            }

            InitSidebarActiveState(urlRoute);

        }
    }
}