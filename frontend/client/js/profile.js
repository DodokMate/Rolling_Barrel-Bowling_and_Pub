import { userData, updateUserProfile, fetchProfileReservations } from './api.js';
import { logout } from './navbar.js';

let profileUser = null;
let profileReservations = {
    lane_reservations: [],
    table_reservations: []
};

export async function renderProfilePage() {
    const profileContainer = document.getElementById("profile-container");
    if (!profileContainer) return;

    const token = localStorage.getItem("token");

    if (!token) {
        localStorage.setItem("currentView", "home");
        location.reload();
        return;
    }

    const userResponse = await userData();

    if (!userResponse.success) {
        localStorage.removeItem("token");
        localStorage.setItem("currentView", "home");
        location.reload();
        return;
    }

    const reservationResponse = await fetchProfileReservations(token);

    profileUser = userResponse.user;
    profileReservations = {
        lane_reservations: reservationResponse.lane_reservations || [],
        table_reservations: reservationResponse.table_reservations || []
    };

    profileContainer.innerHTML = '';
    profileContainer.classList.remove("d-none");

    buildProfileLayout(profileContainer);
}

function buildProfileLayout(container) {
    const section = document.createElement("section");
    section.id = "profile-section";
    section.className = "py-5";

    const innerContainer = document.createElement("div");
    innerContainer.className = "container";

    const title = document.createElement("h2");
    title.className = "main-section-title text-center text-md-start";

    const titleNormal = document.createElement("span");
    titleNormal.className = "no-glow";
    titleNormal.textContent = "Saját ";

    const titleGlow = document.createElement("span");
    titleGlow.className = "glow-text";
    titleGlow.textContent = "Profil";

    title.append(titleNormal, titleGlow);

    const hr = document.createElement("hr");
    hr.className = "mb-4 mt-0 main-section-hr";

    const intro = document.createElement("p");
    intro.id = "profile-intro";
    intro.textContent = "Itt láthatod a fiókadataidat és a legutóbbi foglalásaidat.";

    const topCard = createProfileTopCard();
    const reservationsSection = createProfileReservationsSection();

    innerContainer.append(title, hr, intro, topCard, reservationsSection);
    section.appendChild(innerContainer);
    container.appendChild(section);
}

function createProfileTopCard() {
    const card = document.createElement("div");
    card.className = "card profile-card p-4 p-md-5 mb-5";

    const wrapper = document.createElement("div");
    wrapper.className = "profile-top-wrapper";

    const left = document.createElement("div");
    left.className = "profile-user-side";

    const avatar = document.createElement("div");
    avatar.className = "profile-avatar";
    avatar.textContent = getInitials(profileUser.name);

    const info = document.createElement("div");
    info.className = "profile-user-info";

    const name = document.createElement("h3");
    name.id = "profile-name-display";
    name.textContent = profileUser.name;

    const email = document.createElement("p");
    email.textContent = profileUser.email;

    info.append(name, email);
    left.append(avatar, info);

    const right = document.createElement("div");
    right.className = "profile-actions";

    const editBtn = document.createElement("button");
    editBtn.id = "profile-edit-btn";
    editBtn.type = "button";
    editBtn.textContent = "Szerkesztés";

    editBtn.addEventListener("click", showProfileEditForm);

    const logoutBtn = document.createElement("button");
    logoutBtn.id = "profile-logout-btn";
    logoutBtn.type = "button";
    logoutBtn.textContent = "Kijelentkezés";

    logoutBtn.addEventListener("click", logout);

    right.append(editBtn, logoutBtn);
    wrapper.append(left, right);

    const editForm = createProfileEditForm();

    card.append(wrapper, editForm);

    return card;
}

function createProfileEditForm() {
    const form = document.createElement("div");
    form.id = "profile-edit-form";
    form.className = "profile-edit-form d-none mt-4";

    const row = document.createElement("div");
    row.className = "row g-3 align-items-end";

    const inputCol = document.createElement("div");
    inputCol.className = "col-md-8";

    const label = document.createElement("label");
    label.className = "form-label profile-label";
    label.setAttribute("for", "profile-name-input");
    label.textContent = "Név";

    const input = document.createElement("input");
    input.id = "profile-name-input";
    input.type = "text";
    input.className = "form-control profile-input";
    input.value = profileUser.name;
    input.maxLength = 100;

    inputCol.append(label, input);

    const btnCol = document.createElement("div");
    btnCol.className = "col-md-4";

    const btnWrapper = document.createElement("div");
    btnWrapper.className = "profile-edit-actions";

    const saveBtn = document.createElement("button");
    saveBtn.id = "profile-save-btn";
    saveBtn.type = "button";
    saveBtn.textContent = "Mentés";

    saveBtn.addEventListener("click", saveProfileName);

    const cancelBtn = document.createElement("button");
    cancelBtn.id = "profile-cancel-btn";
    cancelBtn.type = "button";
    cancelBtn.textContent = "Mégse";

    cancelBtn.addEventListener("click", hideProfileEditForm);

    btnWrapper.append(saveBtn, cancelBtn);
    btnCol.appendChild(btnWrapper);

    row.append(inputCol, btnCol);

    const message = document.createElement("p");
    message.id = "profile-message";
    message.className = "mb-0 mt-3";

    form.append(row, message);

    return form;
}

function createProfileReservationsSection() {
    const wrapper = document.createElement("div");
    wrapper.className = "profile-reservations-wrapper";

    const row = document.createElement("div");
    row.className = "row g-4";

    const laneCol = document.createElement("div");
    laneCol.className = "col-lg-6";

    const laneBlock = createReservationBlock(
        "Legutóbbi pályafoglalások",
        "lane",
        profileReservations.lane_reservations
    );

    laneCol.appendChild(laneBlock);

    const tableCol = document.createElement("div");
    tableCol.className = "col-lg-6";

    const tableBlock = createReservationBlock(
        "Legutóbbi asztalfoglalások",
        "table",
        profileReservations.table_reservations
    );

    tableCol.appendChild(tableBlock);

    row.append(laneCol, tableCol);
    wrapper.appendChild(row);

    return wrapper;
}

function createReservationBlock(titleText, type, reservations) {
    const block = document.createElement("div");
    block.className = `profile-reservation-block ${type === "lane" ? "profile-lane-block" : "profile-table-block"}`;

    const title = document.createElement("h3");
    title.className = "profile-reservation-title";
    title.textContent = titleText;

    const list = document.createElement("div");
    list.className = "profile-reservation-list";

    if (!reservations.length) {
        const empty = document.createElement("div");
        empty.className = "profile-empty-card";

        const emptyText = document.createElement("p");
        emptyText.className = "mb-0";
        emptyText.textContent = type === "lane"
            ? "Még nincs pályafoglalásod."
            : "Még nincs asztalfoglalásod.";

        empty.appendChild(emptyText);
        list.appendChild(empty);
    } else {
        reservations.forEach(reservation => {
            list.appendChild(createReservationMiniCard(reservation, type));
        });
    }

    block.append(title, list);

    return block;
}

function createReservationMiniCard(reservation, type) {
    const card = document.createElement("div");
    card.className = `profile-reservation-card ${type === "lane" ? "profile-lane-card" : "profile-table-card"}`;

    const top = document.createElement("div");
    top.className = "profile-reservation-card-top";

    const icon = document.createElement("div");
    icon.className = `profile-reservation-icon ${type === "lane" ? "profile-lane-icon" : "profile-table-icon"}`;

    const iconElement = document.createElement("i");
    iconElement.className = type === "lane"
        ? "bi bi-circle"
        : "bi bi-cup-straw";

    icon.appendChild(iconElement);

    const main = document.createElement("div");

    const name = document.createElement("h4");
    name.textContent = type === "lane"
        ? reservation.lane_name
        : `${reservation.table_number}. asztal`;

    const sub = document.createElement("p");
    sub.textContent = type === "lane"
        ? "Bowling pálya"
        : `${reservation.capacity} fős asztal`;

    main.append(name, sub);

    const status = document.createElement("span");
    status.className = reservation.status === "active"
        ? "profile-status active"
        : "profile-status cancelled";

    status.textContent = reservation.status === "active"
        ? "Aktív"
        : "Lemondva";

    top.append(icon, main, status);

    const details = document.createElement("div");
    details.className = "profile-reservation-details";

    const date = document.createElement("span");
    date.innerHTML = `<i class="bi bi-calendar3"></i> ${formatProfileDate(reservation.reservation_date)}`;

    const time = document.createElement("span");
    time.innerHTML = `<i class="bi bi-clock"></i> ${formatTime(reservation.start_time)} - ${formatTime(reservation.end_time)}`;

    const guests = document.createElement("span");
    guests.innerHTML = `<i class="bi bi-people"></i> ${reservation.guests} fő`;

    details.append(date, time, guests);

    card.append(top, details);

    return card;
}

function showProfileEditForm() {
    const form = document.getElementById("profile-edit-form");
    const input = document.getElementById("profile-name-input");
    const message = document.getElementById("profile-message");

    if (form) {
        form.classList.remove("d-none");
    }

    if (input) {
        input.value = profileUser.name;
        input.focus();
    }

    if (message) {
        message.textContent = "";
        message.className = "mb-0 mt-3";
    }
}

function hideProfileEditForm() {
    const form = document.getElementById("profile-edit-form");
    const input = document.getElementById("profile-name-input");
    const message = document.getElementById("profile-message");

    if (form) {
        form.classList.add("d-none");
    }

    if (input) {
        input.value = profileUser.name;
    }

    if (message) {
        message.textContent = "";
        message.className = "mb-0 mt-3";
    }
}

async function saveProfileName() {
    const input = document.getElementById("profile-name-input");
    const message = document.getElementById("profile-message");
    const nameDisplay = document.getElementById("profile-name-display");
    const avatar = document.querySelector(".profile-avatar");

    if (!input) return;

    const newName = input.value.trim();

    if (newName.length < 2) {
        setProfileMessage("A név legalább 2 karakter hosszú legyen.", false);
        return;
    }

    const token = localStorage.getItem("token");
    const response = await updateUserProfile(newName, token);

    if (!response.success) {
        setProfileMessage(response.message || "Nem sikerült menteni a módosítást.", false);
        return;
    }

    profileUser = response.user;

    if (nameDisplay) {
        nameDisplay.textContent = profileUser.name;
    }

    if (avatar) {
        avatar.textContent = getInitials(profileUser.name);
    }

    setProfileMessage("Profil sikeresen frissítve.", true);

    setTimeout(() => {
        hideProfileEditForm();
    }, 900);
}

function setProfileMessage(text, success) {
    const message = document.getElementById("profile-message");
    if (!message) return;

    message.textContent = text;
    message.className = success
        ? "profile-message success mb-0 mt-3"
        : "profile-message error mb-0 mt-3";
}

function getInitials(name) {
    if (!name) return "U";

    const parts = name.trim().split(" ").filter(Boolean);

    if (parts.length === 1) {
        return parts[0].slice(0, 2).toUpperCase();
    }

    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function formatProfileDate(dateString) {
    if (!dateString) return "";

    try {
        const date = new Date(dateString);

        return date.toLocaleDateString("hu-HU", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit"
        });
    } catch {
        return dateString;
    }
}

function formatTime(timeString) {
    if (!timeString) return "";

    return String(timeString).slice(0, 5);
}
