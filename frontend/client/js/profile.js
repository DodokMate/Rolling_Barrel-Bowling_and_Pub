import { userData } from "./api.js";

export async function renderProfilePage() {
    const profileContainer = document.getElementById("profile-container");
    const headerNavbar = document.getElementById("headerNavbar");
    const header = document.getElementById("header");
    const main = document.getElementById("main-content");

    profileContainer.innerHTML = "";

    const response = await userData();

    // Ha nincs érvényes token → vissza főoldalra
    if (!response.success) {
        localStorage.setItem("currentView", "home");
        localStorage.removeItem("token");

        profileContainer.classList.add("d-none");
        profileContainer.innerHTML = "";

        headerNavbar.classList.remove("d-none");
        header.classList.remove("d-none");
        main.classList.remove("d-none");

        return;
    }

    const user = response.user;

    const container = document.createElement("div");
    container.className = "container profile-page";

    // --- VISSZA GOMB ---
    const backBtn = document.createElement("button");
    backBtn.className = "btn btn-outline-neon profile-back-btn mb-3";
    backBtn.textContent = "Főoldal";

    backBtn.addEventListener("click", () => {
        localStorage.setItem("currentView", "home");

        profileContainer.classList.add("d-none");
        headerNavbar.classList.remove("d-none");
        header.classList.remove("d-none");
        main.classList.remove("d-none");
        
        profileContainer.innerHTML = "";
    });

    container.append(backBtn);

    // --- FELSŐ RÉSZ ---
    const topRow = document.createElement("div");
    topRow.className = "row mb-4";

    const topCol = document.createElement("div");
    topCol.className = "col-12";

    // --- PROFILKÁRTYA ---
    const profileCard = document.createElement("div");
    profileCard.className = "profile-card neon-box p-4";

    const profileRow = document.createElement("div");
    profileRow.className = "row align-items-center";

    // --- PROFILKÉP ---
    let profileElement;
    if (user.profilePicture) {
        profileElement = document.createElement("img");
        profileElement.src = user.profilePicture;
        profileElement.alt = "Profilkép";
        profileElement.className = "profile-img";
    } else {
        profileElement = document.createElement("div");
        profileElement.className = "profile-placeholder";

        const icon = document.createElement("span");
        icon.className = "bi bi-pencil profile-pencil-icon";
        profileElement.append(icon);
    }

    const colImg = document.createElement("div");
    colImg.className = "col-lg-3 col-md-4 col-sm-12 d-flex justify-content-center mb-3";
    colImg.append(profileElement);

    // --- NÉV + EMAIL ---
    const name = document.createElement("h1");
    name.className = "profile-name";
    name.textContent = user.name;

    const email = document.createElement("p");
    email.className = "profile-email";
    email.textContent = user.email;

    const colInfo = document.createElement("div");
    colInfo.className = "col-lg-5 col-md-4 col-sm-12 text-center text-md-start mb-3";
    colInfo.append(name, email);

    // --- GOMBOK ---
    const editBtn = document.createElement("button");
    editBtn.className = "btn btn-outline-neon";
    editBtn.textContent = "Profil szerkesztése";

    const logoutBtn = document.createElement("button");
    logoutBtn.className = "btn btn-outline-neon";
    logoutBtn.textContent = "Kijelentkezés";

    const colActions = document.createElement("div");
    colActions.className = "col-lg-4 col-md-4 col-sm-12 d-flex justify-content-center justify-content-md-end gap-2 mb-3";
    colActions.append(editBtn, logoutBtn);

    // --- ÖSSZERAKÁS ---
    profileRow.append(colImg, colInfo, colActions);
    profileCard.append(profileRow);
    topCol.append(profileCard);
    topRow.append(topCol);

    // --- ALSÓ RÉSZ ---
    const bottomRow = document.createElement("div");
    bottomRow.className = "row";

    // Bal oszlop
    const colLeft = document.createElement("div");
    colLeft.className = "col-lg-7 col-md-7 col-sm-12 mb-4";

    const bookingsBox = document.createElement("div");
    bookingsBox.className = "activity-box neon-box p-4 mb-4";
    const bookingsTitle = document.createElement("h3");
    bookingsTitle.className = "section-title";
    bookingsTitle.textContent = "Aktív foglalásaim";
    const bookingsContent = document.createElement("div");
    bookingsContent.id = "active-bookings";
    bookingsBox.append(bookingsTitle, bookingsContent);

    const eventsBox = document.createElement("div");
    eventsBox.className = "activity-box neon-box p-4";
    const eventsTitle = document.createElement("h3");
    eventsTitle.className = "section-title";
    eventsTitle.textContent = "Aktív eseményeim";
    const eventsContent = document.createElement("div");
    eventsContent.id = "active-events";
    eventsBox.append(eventsTitle, eventsContent);

    colLeft.append(bookingsBox, eventsBox);

    // Jobb oszlop
    const colRight = document.createElement("div");
    colRight.className = "col-lg-5 col-md-5 col-sm-12 mb-4";

    const placeholderBox = document.createElement("div");
    placeholderBox.className = "activity-box neon-box p-4";
    const placeholderTitle = document.createElement("h3");
    placeholderTitle.className = "section-title";
    placeholderTitle.textContent = "További szekciók";
    const placeholderContent = document.createElement("div");
    placeholderContent.id = "future-section";
    placeholderBox.append(placeholderTitle, placeholderContent);

    colRight.append(placeholderBox);

    bottomRow.append(colLeft, colRight);

    // Összerakás
    container.append(topRow, bottomRow);
    profileContainer.append(container);
}