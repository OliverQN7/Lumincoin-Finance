import {AuthUtils} from "./auth-utils";

export function InitUserProfileName() {
    const nameElement = document.getElementById("profile-name");
    if (!nameElement) return;

    const user = AuthUtils.getParsedUser();
    const fullName = user ? `${user.name ?? ""}  ${user.lastName ?? ""}`.trim() : "";
    nameElement.textContent = fullName || "Гость";
}