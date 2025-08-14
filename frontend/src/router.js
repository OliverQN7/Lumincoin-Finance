import {Dashboard} from "./components/dashboard";
import {Income} from "./components/income";
import {Expenses} from "./components/expenses";
import {Login} from "./components/login";
import {SignUp} from "./components/signup";
import {Logout} from "./components/logout";
import {initSidebarEvents} from './components/common';

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
                route: '/expenses',
                title: 'Расходы',
                filePathTemplate: '/templates/expenses.html',
                useLayout: '/templates/layout.html',
                load: () => {
                    new Expenses();
                }
            },
            {
                route: '/operations',
                title: 'Доходы и расходы',
                filePathTemplate: '/templates/operations.html',
                useLayout: '/templates/layout.html',
                load: () => {
                    new Expenses();
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
            console.log(currentRoute);
        }

        const urlRoute = window.location.pathname;
        const newRoute = this.routes.find(item => item.route === urlRoute);

        if (newRoute) {
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
                    contentBlock = document.getElementById('content-layout')
                }
                contentBlock.innerHTML = await fetch(newRoute.filePathTemplate).then(response => response.text());
            }

            // --- Запуск JS-компонента
            if (newRoute.load && typeof newRoute.load === 'function') {
                newRoute.load();
            }

            initSidebarEvents();
        }
    }
}