import { userData, fetchAvailableReservationResources, createReservation } from './api.js';

let selectedReservationType = 'lane';
let selectedResourceId = null;
let currentUser = null;

export async function renderReservationPage() {
    const reservationContainer = document.getElementById("reservation-container");
    if (!reservationContainer) return;

    const token = localStorage.getItem("token");

    if (!token) {
        showLoginRequiredModal("A foglaláshoz előbb be kell jelentkezned.");
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

    currentUser = userResponse.user;

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

function createReservationForm() {
    const form = document.createElement("div");
    form.id = "reservation-form";

    const userRow = document.createElement("div");
    userRow.className = "row g-3 mb-3";

    const nameCol = document.createElement("div");
    nameCol.className = "col-md-6";

    const nameLabel = document.createElement("label");
    nameLabel.className = "form-label reservation-label";
    nameLabel.textContent = "Név";

    const nameInput = document.createElement("input");
    nameInput.className = "form-control reservation-input";
    nameInput.type = "text";
    nameInput.value = currentUser.name || "";
    nameInput.disabled = true;

    nameCol.append(nameLabel, nameInput);

    const emailCol = document.createElement("div");
    emailCol.className = "col-md-6";

    const emailLabel = document.createElement("label");
    emailLabel.className = "form-label reservation-label";
    emailLabel.textContent = "Email";

    const emailInput = document.createElement("input");
    emailInput.className = "form-control reservation-input";
    emailInput.type = "email";
    emailInput.value = currentUser.email || "";
    emailInput.disabled = true;

    emailCol.append(emailLabel, emailInput);
    userRow.append(nameCol, emailCol);

    const detailsRow = document.createElement("div");
    detailsRow.className = "row g-3 mb-4";

    const dateCol = document.createElement("div");
    dateCol.className = "col-md-4";

    const dateLabel = document.createElement("label");
    dateLabel.className = "form-label reservation-label";
    dateLabel.setAttribute("for", "reservation-date");
    dateLabel.textContent = "Dátum";

    const dateInput = document.createElement("input");
    dateInput.id = "reservation-date";
    dateInput.className = "form-control reservation-input";
    dateInput.type = "date";

    dateCol.append(dateLabel, dateInput);

    const timeCol = document.createElement("div");
    timeCol.className = "col-md-4";

    const timeLabel = document.createElement("label");
    timeLabel.className = "form-label reservation-label";
    timeLabel.setAttribute("for", "reservation-time");
    timeLabel.textContent = "Időpont";

    const timeSelect = document.createElement("select");
    timeSelect.id = "reservation-time";
    timeSelect.className = "form-select reservation-input";

    createTimeOptions(timeSelect);

    timeCol.append(timeLabel, timeSelect);

    const guestsCol = document.createElement("div");
    guestsCol.className = "col-md-4";

    const guestsLabel = document.createElement("label");
    guestsLabel.className = "form-label reservation-label";
    guestsLabel.setAttribute("for", "reservation-guests");
    guestsLabel.textContent = "Hány fő?";

    const guestsSelect = document.createElement("select");
    guestsSelect.id = "reservation-guests";
    guestsSelect.className = "form-select reservation-input";

    for (let i = 1; i <= 6; i += 1) {
        const option = document.createElement("option");
        option.value = i;
        option.textContent = `${i} fő`;
        guestsSelect.appendChild(option);
    }

    guestsCol.append(guestsLabel, guestsSelect);
    detailsRow.append(dateCol, timeCol, guestsCol);

    const resourceHeader = document.createElement("div");
    resourceHeader.className = "reservation-resource-header";

    const resourceTitle = document.createElement("h3");
    resourceTitle.id = "reservation-resource-title";
    resourceTitle.textContent = "Szabad pályák";

    const resourceInfo = document.createElement("p");
    resourceInfo.id = "reservation-resource-info";
    resourceInfo.textContent = "Válassz dátumot és időpontot a szabad pályák megtekintéséhez.";

    resourceHeader.append(resourceTitle, resourceInfo);

    const resources = document.createElement("div");
    resources.id = "reservation-resources";
    resources.className = "reservation-resources-grid mb-4";

    const notesWrapper = document.createElement("div");
    notesWrapper.className = "mb-4";

    const notesLabel = document.createElement("label");
    notesLabel.className = "form-label reservation-label";
    notesLabel.setAttribute("for", "reservation-notes");
    notesLabel.textContent = "Megjegyzés";

    const notesTextarea = document.createElement("textarea");
    notesTextarea.id = "reservation-notes";
    notesTextarea.className = "form-control reservation-input reservation-textarea";
    notesTextarea.rows = 3;
    notesTextarea.placeholder = "Opcionális megjegyzés...";

    notesWrapper.append(notesLabel, notesTextarea);

    const message = document.createElement("p");
    message.id = "reservation-message";
    message.className = "mb-3";

    const submitBtn = document.createElement("button");
    submitBtn.id = "reservation-submit-btn";
    submitBtn.classList.add("btn");
    submitBtn.type = "button";
    submitBtn.textContent = "Foglalás elküldése";

    submitBtn.addEventListener("click", submitReservation);

    form.append(
        userRow,
        detailsRow,
        resourceHeader,
        resources,
        notesWrapper,
        message,
        submitBtn
    );

    dateInput.addEventListener("change", handleAvailabilityCheck);
    timeSelect.addEventListener("change", handleAvailabilityCheck);
    guestsSelect.addEventListener("change", handleAvailabilityCheck);

    return form;
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

    const token = localStorage.getItem("token");

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