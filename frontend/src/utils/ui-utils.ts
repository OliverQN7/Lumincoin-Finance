import {AuthUtils} from "./auth-utils";
import type {AlertType, UserProfileType} from "../types/ui-util.types";

export function InitUserProfileName(): void {
    const nameElement = document.getElementById("profile-name") as HTMLElement | null;
    if (!nameElement) return;

    const user = AuthUtils.getParsedUser() as UserProfileType | null;
    const fullName = user ? `${user.name ?? ""} ${user.lastName ?? ""}`.trim() : "";

    nameElement.textContent = fullName || "Гость";
}

export function InitSidebarActiveState(currentRoute: string): void {
    const sidebarLinks = document.querySelectorAll('#sidebar .sidebar-link') as NodeListOf<HTMLElement>;
    sidebarLinks.forEach(link => link.classList.remove('active'));

    const sidebarCategoriesBtn = document.querySelector('#sidebar .btn-toggle, #sidebar .has-dropdown') as HTMLElement | null;
    const sidebarDropdown = document.querySelector('.sidebar-dropdown') as HTMLElement | null;
    const categoryRoutes = ['/income', '/expenses'];
    //
    if (sidebarCategoriesBtn) {
        sidebarCategoriesBtn.classList.remove('active', 'collapsed');
        sidebarCategoriesBtn.setAttribute('aria-expanded', 'false');

    }

    if (sidebarDropdown) {
        sidebarDropdown.classList.remove('show');
    }

    if (categoryRoutes.includes(currentRoute)) {
        if (sidebarCategoriesBtn) {
            sidebarCategoriesBtn.classList.remove('collapsed');
            sidebarCategoriesBtn.setAttribute('aria-expanded', 'true');
        }

        const activeLink = document.querySelector(`.sidebar-dropdown .sidebar-link[href='${currentRoute}']`) as HTMLElement | null;
        if (activeLink) {
            activeLink.classList.add('active');
        }
        if (sidebarDropdown) {
            sidebarDropdown.classList.add('show');
        }
    } else {
        const activeLink = document.querySelector(`#sidebar .sidebar-link[href='${currentRoute}']`) as HTMLElement | null;
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }
}

export function showMessage(container: HTMLElement, message: string, type: AlertType = 'danger'): void {
    const existingAlerts = container.querySelectorAll('.alert') as NodeListOf<HTMLElement>;
    existingAlerts.forEach(alert => alert.remove());

    const alert = document.createElement('div') as HTMLDivElement;
    alert.className = `alert alert-${type} mt-3 fade show`;
    alert.role = 'alert';
    alert.textContent = message;

    container.appendChild(alert);


    setTimeout(() => {
        if (alert.parentNode) {
            alert.remove();
        }
    }, 2000);
}