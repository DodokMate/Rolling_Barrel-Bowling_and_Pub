//User profile site
import { userData } from "./api.js";

export async function renderProfilePage() {
    const main = document.getElementById("main-content");
    main.innerHTML = "";

    const response = await userData();

    if (!response.success) {
        const p = document.createElement("p");
        p.textContent = "Nem sikerült betölteni a profil adatokat.";
        main.append(p);
        return;
    }

    const user = response.user;

    const wrapper = document.createElement("div");
    wrapper.className = "profile-page";

    const card = document.createElement("div");
    card.className = "profile-card";

    const header = document.createElement("div");
    header.className = "profile-header";

    const initials = document.createElement("div");
    initials.className = "profile-initials";
    initials.textContent = getInitials(user.name);

    const title = document.createElement("h1");
    title.className = "profile-title";
    title.textContent = "Üdvözlünk, " + user.name + "!";

    header.append(initials, title);

    const form = document.createElement("form");
    form.className = "profile-form";

    const nameGroup = document.createElement("div");
    nameGroup.className = "profile-field-group";

    const nameLabel = document.createElement("label");
    nameLabel.textContent = "Név";

    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.value = user.name;
    nameInput.className = "profile-input";
    nameInput.disabled = true;

    nameGroup.append(nameLabel, nameInput);

    const emailGroup = document.createElement("div");
    emailGroup.className = "profile-field-group";

    const emailLabel = document.createElement("label");
    emailLabel.textContent = "Email";

    const emailInput = document.createElement("input");
    emailInput.type = "email";
    emailInput.value = user.email;
    emailInput.className = "profile-input";
    emailInput.disabled = true;

    emailGroup.append(emailLabel, emailInput);

    form.append(nameGroup, emailGroup);

    card.append(header, form);
    wrapper.append(card);
    main.append(wrapper);
}

function getInitials(name) {
    const parts = name.trim().split(/\s+/);

    if (parts.length === 1) {
        return parts[0][0].toUpperCase();
    }

    const first = parts[0][0].toUpperCase();
    const last = parts[parts.length - 1][0].toUpperCase();

    return first + last;
}
