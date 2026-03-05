import {Dashboard} from "./components/dashboard";
import {Income} from "./components/income";
import {Expenses} from "./components/expenses";
import {Login} from "./components/login";
import {SignUp} from "./components/signup";
import {Logout} from "./components/logout";
import {InitSidebarActiveState, InitUserProfileName} from "./utils/ui-utils";
import {AuthUtils} from "./utils/auth-utils";
import {mountBalance, unmountBalance, handleBalanceClickToEdit} from "./utils/balance-ui";
import {IncomeCreate} from "./components/income-create";
import {IncomeEditing} from "./components/income-editing";
import {ExpensesCreate} from "./components/expenses-create";
import {ExpensesEditing} from "./components/expenses-editing";
import {Operations} from "./components/operations";
import {OperationCreate} from "./components/operations-create";
import {OperationEditing} from "./components/operations-editing";
import type {RouteType} from "./types/route.types";

export class Router {
    readonly titlePageElement: HTMLElement | null;
    readonly contentPageElement: HTMLElement | null;
    private lastStyleElement: HTMLElement | null;

    private routes: RouteType[];

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
                    new Income(this.openNewRoute.bind(this));
                }
            },
            {
                route: '/income-create',
                title: 'Создание категории доходов',
                filePathTemplate: '/templates/income-create.html',
                useLayout: '/templates/layout.html',
                load: () => {
                    new IncomeCreate(this.openNewRoute.bind(this));
                },
                styles: ['income-create.css']
            },
            {
                route: '/income-editing',
                title: 'Редактирование категории доходов',
                filePathTemplate: '/templates/income-editing.html',
                useLayout: '/templates/layout.html',
                load: () => {
                    new IncomeEditing(this.openNewRoute.bind(this));
                },
                styles: ['income-create.css']
            },
            {
                route: '/expenses',
                title: 'Расходы',
                filePathTemplate: '/templates/expenses.html',
                useLayout: '/templates/layout.html',
                load: () => {
                    new Expenses(this.openNewRoute.bind(this));

                }
            },
            {
                route: '/expenses-create',
                title: 'Создание категории расходов',
                filePathTemplate: '/templates/expenses-create.html',
                useLayout: '/templates/layout.html',
                load: () => {
                    new ExpensesCreate(this.openNewRoute.bind(this));
                },
                styles: ['income-create.css']
            },
            {
                route: '/expenses-editing',
                title: 'Редактирование категории расходов',
                filePathTemplate: '/tempcdlates/expenses-editing.html',
                useLayout: '/templates/layout.html',
                load: () => {
                    new ExpensesEditing(this.openNewRoute.bind(this));
                },
                styles: ['income-create.css']
            },
            {
                route: '/operations',
                title: 'Доходы и расходы',
                filePathTemplate: '/templates/operations.html',
                useLayout: '/templates/layout.html',
                load: () => {
                    new Operations(this.openNewRoute.bind(this));
                }
            },
            {
                route: '/operations-create',
                title: 'Создание дохода/расхода',
                filePathTemplate: '/templates/operations-create.html',
                useLayout: '/templates/layout.html',
                load: () => {
                    new OperationCreate(this.openNewRoute.bind(this));
                }
            },
            {
                route: '/operations-editing',
                title: 'Редактирование дохода/расхода',
                filePathTemplate: '/templates/operations-editing.html',
                useLayout: '/templates/layout.html',
                load: () => {
                    new OperationEditing(this.openNewRoute.bind(this));
                }
            },
        ]
    }

    private initEvents(): void {
        window.addEventListener('DOMContentLoaded', () => {
            void this.activateRoute();
        });
        window.addEventListener('popstate', () => {
            void this.activateRoute();
        });
        document.addEventListener('click', (e) => {
            void this.clickHandler(e);
        });
    }

    private async openNewRoute(url: string): Promise<void> {
        const currentRoute = window.location.pathname;
        history.pushState({}, '', url);
        await this.activateRoute(currentRoute);
    }

    private async clickHandler(e: MouseEvent): Promise<void> {
        const a = (e.target instanceof Element) ? e.target.closest('a') : null;
        if (!a) return;

        e.preventDefault();

        const url = a.getAttribute('href') ?? '';
        if (!url || url === '/#' || url.startsWith('javascript:void(0)')) return;

        await this.openNewRoute(url);
    }

    private isPrivateRoute(routeObj: RouteType): routeObj is RouteType & { useLayout: string } {
        return typeof routeObj.useLayout === 'string' && routeObj.useLayout.length > 0;
    }

    private async activateRoute(oldRoute?: string): Promise<void> {
        if (!this.titlePageElement || !this.contentPageElement) {
            throw new Error('Router: missing #title or #content');
        }

        if (oldRoute) {
            const currentRoute = this.routes.find(item => item.route === oldRoute);

            if (currentRoute?.styles?.length) {
                currentRoute.styles.forEach(style => {
                    const linkEl = document.querySelector<HTMLLinkElement>(`link[href='/css/${style}']`);
                    linkEl?.remove();
                });
            }

            const prev = this.routes.find(r => r.route === oldRoute);
            if (prev?.useLayout) unmountBalance();
        }

        const urlRoute = window.location.pathname;
        const newRoute = this.routes.find(item => item.route === urlRoute);

        if (!newRoute) return;

        if (this.isPrivateRoute(newRoute) && !AuthUtils.isAuthenticated()) {
            if (window.location.pathname !== '/login') {
                return this.openNewRoute('/login');
            }
            return;
        }

        if (newRoute.styles?.length) {
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

        if (newRoute.title) {
            this.titlePageElement.innerText = newRoute.title;
        }

        if (!newRoute.filePathTemplate) return;

        let contentBlock: HTMLElement | null = this.contentPageElement;

        if (this.isPrivateRoute(newRoute)) {
            const layoutResp = await fetch(newRoute.useLayout);
            this.contentPageElement.innerHTML = await layoutResp.text();

            InitUserProfileName();

            if (AuthUtils.isAuthenticated()) {
                mountBalance({
                    withPolling: true,
                    interval: 15000
                });

                const balanceEl = document.querySelector<HTMLElement>('[data-balance]');
                balanceEl?.addEventListener('click', handleBalanceClickToEdit);
            }

            contentBlock = document.getElementById('content-layout');
        }

        if (!contentBlock) {
            throw new Error('Router: missing #content-layout (layout template mismatch?)');
        }

        newRoute.load();
        InitSidebarActiveState(urlRoute);
    }
}