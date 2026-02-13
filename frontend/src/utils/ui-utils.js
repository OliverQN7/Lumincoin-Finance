import {AuthUtils} from "./auth-utils";

export function InitUserProfileName() {
    const nameElement = document.getElementById("profile-name");
    if (!nameElement) return;

    const user = AuthUtils.getParsedUser();
    const fullName = user ? `${user.name ?? ""}  ${user.lastName ?? ""}`.trim() : "";
    nameElement.textContent = fullName || "Гость";
}

export function InitSidebarActiveState(currentRoute) {
    const sidebarLinks = document.querySelectorAll('#sidebar .sidebar-link');
    sidebarLinks.forEach(link => link.classList.remove('active'));
    const sidebarCategoriesBtn = document.querySelector('#sidebar .btn-toggle, #sidebar .has-dropdown');
    const categoryRoutes = ['/income', '/expenses'];

    if (sidebarCategoriesBtn) {
        sidebarCategoriesBtn.classList.remove('active');
    }
    const sidebarDropdown = document.querySelector('.sidebar-dropdown');
    if (sidebarDropdown) {
        sidebarDropdown.classList.remove('show');
    }

    if (categoryRoutes.includes(currentRoute)) {
        if (sidebarCategoriesBtn) {
            sidebarCategoriesBtn.classList.remove('collapsed');
            sidebarCategoriesBtn.setAttribute('aria-expanded', 'true');
        }

        let activeLink = document.querySelector(`.sidebar-dropdown .sidebar-link[href='${currentRoute}']`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
        if (sidebarDropdown) {
            sidebarDropdown.classList.add('show');
        }
    } else {
        let activeLink = document.querySelector(`#sidebar .sidebar-link[href='${currentRoute}']`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }
}

export function showMessage(container, message, type = 'danger') {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} mt-3 fade show`;
    alert.role = 'alert';
    alert.textContent = message;

    // Удаляем предыдущие уведомления
    container.querySelectorAll('.alert').forEach(a => a.remove());
    container.appendChild(alert);

    // Убираем через 3 секунды
    setTimeout(() => alert.remove(), 2000);
}