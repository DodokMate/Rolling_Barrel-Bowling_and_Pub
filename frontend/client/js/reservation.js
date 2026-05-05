import { userData, fetchAvailableReservationResources, createReservation } from './api.js';

let selectedReservationType = 'lane';
let selectedResourceId = null;
let currentUser = null;

export async function renderReservationPage() {
    const reservationContainer = document.getElementById("reservation-container");
    if (!reservationContainer) return;

    const token = localStorage.getItem("token");

    currentUser = null;

    if (token) {
        const userResponse = await userData();

        if (userResponse.success) {
            currentUser = userResponse.user;
        } else {
            localStorage.removeItem("token");
        }
    }

    reservationContainer.innerHTML = '';
    reservationContainer.classList.remove("d-none");

    buildReservationLayout(reservationContainer);
}

function buildReservationLayout(container) {
    const section = document.createElement("section");
    section.id = "reservation-section";
    section.className = "py-5";

    const innerContainer = document.createElement("div");
    innerContainer.className = "container";

    const title = document.createElement("h2");
    title.className = "main-section-title text-center text-md-start";

    const titleNormal = document.createElement("span");
    titleNormal.className = "no-glow";
    titleNormal.textContent = "Online ";

    const titleGlow = document.createElement("span");
    titleGlow.className = "glow-text";
    titleGlow.textContent = "Foglalás";

    title.append(titleNormal, titleGlow);

    const hr = document.createElement("hr");
    hr.className = "mb-4 mt-0 main-section-hr";

    const intro = document.createElement("p");
    intro.id = "reservation-intro";
    intro.textContent = "Válaszd ki, hogy bowling pályát vagy asztalt szeretnél foglalni, majd nézd meg az adott időpontban elérhető helyeket.";

    const card = document.createElement("div");
    card.className = "card reservation-card p-4 p-md-5";

    const switchWrapper = createTypeSwitch();
    const form = createReservationForm();

    card.append(switchWrapper, form);

    innerContainer.append(title, hr, intro, card);
    section.appendChild(innerContainer);
    container.appendChild(section);

    setMinimumDate();
    handleAvailabilityCheck();
}

function createTypeSwitch() {
    const wrapper = document.createElement("div");
    wrapper.className = "reservation-type-switch mb-4";

    const laneBtn = document.createElement("button");
    laneBtn.type = "button";
    laneBtn.className = "reservation-type-btn active lane-type";
    laneBtn.dataset.type = "lane";
    laneBtn.textContent = "Pályát foglalok";

    const tableBtn = document.createElement("button");
    tableBtn.type = "button";
    tableBtn.className = "reservation-type-btn table-type";
    tableBtn.dataset.type = "table";
    tableBtn.textContent = "Asztalt foglalok";

    laneBtn.addEventListener("click", () => {
        selectedReservationType = "lane";
        selectedResourceId = null;
        updateTypeButtons();
        updateResourceTitle();
        clearResources();
        handleAvailabilityCheck();
    });

    tableBtn.addEventListener("click", () => {
        selectedReservationType = "table";
        selectedResourceId = null;
        updateTypeButtons();
        updateResourceTitle();
        clearResources();
        handleAvailabilityCheck();
    });

    wrapper.append(laneBtn, tableBtn);

    return wrapper;
}

function createReservationsTable(reservations) {
    const block = createAdminBlock("Legutóbbi foglalások");

    if (!reservations.length) {
        block.appendChild(createEmptyText("Még nincs foglalás."));
        return block;
    }

    const tableWrapper = createTable();
    const table = tableWrapper.querySelector("table");

    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");

    ["Felhasználó", "Típus", "Dátum", "Időpont", "Fő", "Státusz"].forEach(text => {
        const th = document.createElement("th");
        th.textContent = text;
        headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);

    const tbody = document.createElement("tbody");

    reservations.forEach(reservation => {
        const tr = document.createElement("tr");

        const user = document.createElement("td");

        const userBox = document.createElement("div");
        userBox.className = "admin-user-cell";

        const avatar = document.createElement("div");
        avatar.className = "admin-user-avatar";
        avatar.textContent = getInitials(reservation.user_name);

        const userInfo = document.createElement("div");

        const userName = document.createElement("strong");
        userName.textContent = reservation.user_name;

        const userEmail = document.createElement("small");
        userEmail.textContent = reservation.user_email;

        userInfo.append(userName, userEmail);
        userBox.append(avatar, userInfo);
        user.appendChild(userBox);

        const type = document.createElement("td");

        const typeBadge = document.createElement("span");
        typeBadge.className = reservation.lane_name
            ? "admin-type-badge lane"
            : "admin-type-badge table";

        const typeIcon = document.createElement("i");
        typeIcon.className = reservation.lane_name
            ? "bi bi-circle"
            : "bi bi-cup-straw";

        const typeText = document.createTextNode(
            reservation.lane_name
                ? reservation.lane_name
                : `${reservation.table_number}. asztal`
        );

        typeBadge.append(typeIcon, typeText);
        type.appendChild(typeBadge);

        const date = document.createElement("td");
        date.textContent = formatDate(reservation.reservation_date);

        const time = document.createElement("td");
        time.textContent = `${formatTime(reservation.start_time)} - ${formatTime(reservation.end_time)}`;

        const guests = document.createElement("td");

        const guestsBadge = document.createElement("span");
        guestsBadge.className = "admin-soft-badge";
        guestsBadge.innerHTML = `<i class="bi bi-people"></i> ${reservation.guests} fő`;

        guests.appendChild(guestsBadge);

        const status = document.createElement("td");

        const statusBadge = document.createElement("span");
        statusBadge.className = reservation.status === "active"
            ? "admin-status active"
            : "admin-status cancelled";

        statusBadge.textContent = reservation.status === "active"
            ? "Aktív"
            : "Lemondva";

        status.appendChild(statusBadge);

        tr.append(user, type, date, time, guests, status);
        tbody.appendChild(tr);
    });

    table.append(thead, tbody);
    block.appendChild(tableWrapper);

    return block;
}

function createTimeOptions(select) {
    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "Válassz időpontot";
    select.appendChild(placeholder);

    for (let hour = 10; hour <= 22; hour += 1) {
        const option = document.createElement("option");
        const value = `${String(hour).padStart(2, "0")}:00`;

        option.value = value;
        option.textContent = value;

        select.appendChild(option);
    }
}

function setMinimumDate() {
    const dateInput = document.getElementById("reservation-date");
    if (!dateInput) return;

    const today = new Date();
    const formattedToday = today.toISOString().split("T")[0];

    dateInput.min = formattedToday;
}

async function handleAvailabilityCheck() {
    const dateInput = document.getElementById("reservation-date");
    const timeInput = document.getElementById("reservation-time");
    const guestsInput = document.getElementById("reservation-guests");
    const info = document.getElementById("reservation-resource-info");

    if (!dateInput || !timeInput || !guestsInput) return;

    selectedResourceId = null;
    clearResources();

    if (!dateInput.value || !timeInput.value) {
        if (info) {
            info.textContent = selectedReservationType === "lane"
                ? "Válassz dátumot és időpontot a szabad pályák megtekintéséhez."
                : "Válassz dátumot és időpontot a szabad asztalok megtekintéséhez.";
        }

        return;
    }

    const token = localStorage.getItem("token");

    const response = await fetchAvailableReservationResources(
        selectedReservationType,
        dateInput.value,
        timeInput.value,
        guestsInput.value,
        token
    );

    if (!response.success) {
        if (info) {
            info.textContent = response.message || "Nem sikerült lekérni a szabad helyeket.";
        }

        return;
    }

    renderAvailableResources(response.results || []);
}

function renderAvailableResources(resources) {
    const resourcesWrapper = document.getElementById("reservation-resources");
    const info = document.getElementById("reservation-resource-info");

    if (!resourcesWrapper) return;

    resourcesWrapper.innerHTML = '';

    if (!resources.length) {
        if (info) {
            info.textContent = selectedReservationType === "lane"
                ? "Ebben az időpontban nincs szabad pálya."
                : "Ebben az időpontban nincs megfelelő szabad asztal.";
        }

        return;
    }

    if (info) {
        info.textContent = selectedReservationType === "lane"
            ? "Válaszd ki a szabad pályák közül azt, amelyiket foglalni szeretnéd."
            : "Válaszd ki a megfelelő szabad asztalt.";
    }

    resources.forEach(resource => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = `reservation-resource-btn ${selectedReservationType === "lane" ? "resource-lane" : "resource-table"}`;
        button.dataset.resourceId = resource.id;

        if (selectedReservationType === "lane") {
            button.textContent = resource.name;
        } else {
            button.textContent = `${resource.table_number}. asztal`;
        }

        const small = document.createElement("small");

        if (selectedReservationType === "lane") {
            small.textContent = "Bowling pálya";
        } else {
            small.textContent = `${resource.capacity} fős`;
        }

        button.appendChild(small);

        button.addEventListener("click", () => {
            selectedResourceId = Number(resource.id);
            updateSelectedResourceButton();
        });

        resourcesWrapper.appendChild(button);
    });
}

function updateSelectedResourceButton() {
    document.querySelectorAll(".reservation-resource-btn").forEach(button => {
        if (Number(button.dataset.resourceId) === selectedResourceId) {
            button.classList.add("selected");
        } else {
            button.classList.remove("selected");
        }
    });
}

function updateTypeButtons() {
    document.querySelectorAll(".reservation-type-btn").forEach(button => {
        if (button.dataset.type === selectedReservationType) {
            button.classList.add("active");
        } else {
            button.classList.remove("active");
        }
    });
}

function updateResourceTitle() {
    const title = document.getElementById("reservation-resource-title");
    const info = document.getElementById("reservation-resource-info");

    if (title) {
        title.textContent = selectedReservationType === "lane"
            ? "Szabad pályák"
            : "Szabad asztalok";
    }

    if (info) {
        info.textContent = selectedReservationType === "lane"
            ? "Válassz dátumot és időpontot a szabad pályák megtekintéséhez."
            : "Válassz dátumot és időpontot a szabad asztalok megtekintéséhez.";
    }
}

function clearResources() {
    const resourcesWrapper = document.getElementById("reservation-resources");

    if (resourcesWrapper) {
        resourcesWrapper.innerHTML = '';
    }
}

async function submitReservation() {
    const token = localStorage.getItem("token");

    if (!token) {
        setReservationMessage("A foglalás elküldéséhez előbb be kell jelentkezned.", false);
        showReservationLoginModal();
        return;
    }

    const dateInput = document.getElementById("reservation-date");
    const timeInput = document.getElementById("reservation-time");
    const guestsInput = document.getElementById("reservation-guests");
    const notesInput = document.getElementById("reservation-notes");
    const message = document.getElementById("reservation-message");

    if (!dateInput.value || !timeInput.value) {
        setReservationMessage("Válassz dátumot és időpontot.", false);
        return;
    }

    if (!selectedResourceId) {
        setReservationMessage(
            selectedReservationType === "lane"
                ? "Válassz egy szabad pályát."
                : "Válassz egy szabad asztalt.",
            false
        );

        return;
    }

    const reservationData = {
        type: selectedReservationType,
        reservation_date: dateInput.value,
        start_time: timeInput.value,
        guests: Number(guestsInput.value),
        resource_id: selectedResourceId,
        notes: notesInput.value.trim()
    };

    const response = await createReservation(reservationData, token);

    if (!response.success) {
        setReservationMessage(response.message || "Nem sikerült rögzíteni a foglalást.", false);
        await handleAvailabilityCheck();
        return;
    }

    setReservationMessage("Sikeres foglalás! Várunk szeretettel.", true);

    resetReservationForm();
}

function setReservationMessage(text, success) {
    const message = document.getElementById("reservation-message");
    if (!message) return;

    message.textContent = text;
    message.className = success
        ? "reservation-message success"
        : "reservation-message error";
}

function showLoginRequiredModal(message) {
    const loginRequiredModal = document.getElementById("loginRequiredModal");

    if (!loginRequiredModal) return;

    const modalText = loginRequiredModal.querySelector("p");

    if (modalText) {
        modalText.textContent = message;
    }

    const modal = new bootstrap.Modal(loginRequiredModal);
    modal.show();
}

function resetReservationForm() {
    const dateInput = document.getElementById("reservation-date");
    const timeInput = document.getElementById("reservation-time");
    const guestsInput = document.getElementById("reservation-guests");
    const notesInput = document.getElementById("reservation-notes");
    const info = document.getElementById("reservation-resource-info");

    if (dateInput) {
        dateInput.value = "";
    }

    if (timeInput) {
        timeInput.value = "";
    }

    if (guestsInput) {
        guestsInput.value = "1";
    }

    if (notesInput) {
        notesInput.value = "";
    }

    selectedResourceId = null;
    clearResources();
    updateResourceTitle();

    if (info) {
        info.textContent = selectedReservationType === "lane"
            ? "Válassz dátumot és időpontot a szabad pályák megtekintéséhez."
            : "Válassz dátumot és időpontot a szabad asztalok megtekintéséhez.";
    }
}

function showReservationLoginModal() {
    const loginRequiredModal = document.getElementById("loginRequiredModal");

    if (!loginRequiredModal) return;

    const modalText = loginRequiredModal.querySelector("p");

    if (modalText) {
        modalText.textContent = "A foglalás elküldéséhez előbb be kell jelentkezned.";
    }

    const modal = new bootstrap.Modal(loginRequiredModal);
    modal.show();

    const closeBtn = document.getElementById("loginRequiredModalX");

    if (closeBtn) {
        closeBtn.addEventListener("click", () => {
            modal.hide();
        }, { once: true });
    }
}

function createTable() {
    const responsive = document.createElement("div");
    responsive.className = "admin-table-responsive";

    const table = document.createElement("table");
    table.className = "admin-table";

    responsive.appendChild(table);

    return responsive;
}