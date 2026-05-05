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

    reservationContainer.innerHTML = "";
    reservationContainer.classList.remove("d-none");

    buildReservationLayout(reservationContainer);
}

function buildReservationLayout(container) {
    container.innerHTML = "";

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

    const contentWrapper = document.createElement("div");
    contentWrapper.className = "reservation-content-wrapper mt-4";

    const form = createReservationForm();
    const resources = createReservationResourcesPanel();

    const message = document.createElement("p");
    message.id = "reservation-message";
    message.className = "reservation-message mb-3";

    const submitBtn = document.createElement("button");
    submitBtn.id = "reservation-submit-btn";
    submitBtn.classList.add("btn");
    submitBtn.type = "button";
    submitBtn.textContent = "Foglalás elküldése";

    submitBtn.addEventListener("click", submitReservation);

    const bottomActions = document.createElement("div");
    bottomActions.className = "reservation-bottom-actions";

    bottomActions.append(message, submitBtn);

    contentWrapper.append(form, resources, bottomActions);
    card.append(switchWrapper, contentWrapper);

    innerContainer.append(title, hr, intro, card);
    section.appendChild(innerContainer);
    container.appendChild(section);

    setMinimumDate();
    updateResourceTitle();
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
    const formWrapper = document.createElement("div");
    formWrapper.className = "reservation-form-inner";

    const title = document.createElement("h3");
    title.id = "reservation-form-title";
    title.textContent = "Foglalási adatok";

    const fieldsRow = document.createElement("div");
    fieldsRow.className = "row g-3";

    const nameGroup = createReservationInputGroup(
        "Név",
        "reservation-name",
        "text",
        currentUser ? currentUser.name : "Bejelentkezés szükséges",
        true
    );

    const emailGroup = createReservationInputGroup(
        "Email",
        "reservation-email",
        "email",
        currentUser ? currentUser.email : "Bejelentkezés szükséges",
        true
    );

    const dateGroup = createReservationInputGroup(
        "Dátum",
        "reservation-date",
        "date",
        "",
        false
    );

    const timeGroup = createReservationSelectGroup(
        "Időpont",
        "reservation-time"
    );

    const guestsGroup = createReservationInputGroup(
        "Hány fő?",
        "reservation-guests",
        "number",
        "1",
        false
    );

    const guestsInput = guestsGroup.querySelector("#reservation-guests");

    if (guestsInput) {
        guestsInput.min = "1";
        guestsInput.max = "6";
    }

    const notesCol = document.createElement("div");
    notesCol.className = "col-12";

    const notesGroup = document.createElement("div");
    notesGroup.className = "mb-3";

    const notesLabel = document.createElement("label");
    notesLabel.className = "form-label reservation-label";
    notesLabel.setAttribute("for", "reservation-notes");
    notesLabel.textContent = "Megjegyzés";

    const notesTextarea = document.createElement("textarea");
    notesTextarea.id = "reservation-notes";
    notesTextarea.className = "form-control reservation-input reservation-textarea";
    notesTextarea.rows = 4;
    notesTextarea.placeholder = "Írj ide bármit, amit fontosnak tartasz...";

    notesGroup.append(notesLabel, notesTextarea);
    notesCol.appendChild(notesGroup);



    fieldsRow.append(
        wrapReservationField(nameGroup),
        wrapReservationField(emailGroup),
        wrapReservationField(dateGroup),
        wrapReservationField(timeGroup),
        wrapReservationField(guestsGroup),
        notesCol
    );

    const dateInput = dateGroup.querySelector("#reservation-date");
    const timeInput = timeGroup.querySelector("#reservation-time");

    [dateInput, timeInput, guestsInput].forEach(input => {
        if (!input) return;

        input.addEventListener("change", () => {
            handleAvailabilityCheck();
        });
    });

    formWrapper.append(title, fieldsRow);

    return formWrapper;
}

function createReservationResourcesPanel() {
    const panel = document.createElement("div");
    panel.className = "reservation-resource-panel mt-4";

    const header = document.createElement("div");
    header.className = "reservation-resource-header";

    const title = document.createElement("h3");
    title.id = "reservation-resource-title";
    title.textContent = selectedReservationType === "lane"
        ? "Szabad pályák"
        : "Szabad asztalok";

    const info = document.createElement("p");
    info.id = "reservation-resource-info";
    info.textContent = selectedReservationType === "lane"
        ? "Válassz dátumot és időpontot a szabad pályák megtekintéséhez."
        : "Válassz dátumot és időpontot a szabad asztalok megtekintéséhez.";

    const resources = document.createElement("div");
    resources.id = "reservation-resources";
    resources.className = "reservation-resources-grid";

    header.append(title, info);
    panel.append(header, resources);

    return panel;
}

function createReservationInputGroup(labelText, inputId, inputType, value = "", disabled = false) {
    const group = document.createElement("div");
    group.className = "mb-3";

    const label = document.createElement("label");
    label.className = "form-label reservation-label";
    label.setAttribute("for", inputId);
    label.textContent = labelText;

    const input = document.createElement("input");
    input.id = inputId;
    input.type = inputType;
    input.className = "form-control reservation-input";
    input.value = value;
    input.disabled = disabled;

    group.append(label, input);

    return group;
}

function createReservationSelectGroup(labelText, selectId) {
    const group = document.createElement("div");
    group.className = "mb-3";

    const label = document.createElement("label");
    label.className = "form-label reservation-label";
    label.setAttribute("for", selectId);
    label.textContent = labelText;

    const select = document.createElement("select");
    select.id = selectId;
    select.className = "form-control reservation-input";

    createTimeOptions(select);

    group.append(label, select);

    return group;
}

function wrapReservationField(field) {
    const col = document.createElement("div");
    col.className = "col-lg-6 col-md-6 col-sm-12";

    col.appendChild(field);

    return col;
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

    resourcesWrapper.innerHTML = "";

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
        button.className = selectedReservationType === "lane"
            ? "reservation-resource-btn resource-lane"
            : "reservation-resource-btn resource-table";

        button.dataset.resourceId = resource.id;

        const name = document.createElement("span");

        if (selectedReservationType === "lane") {
            name.textContent = resource.name;
        } else {
            name.textContent = `${resource.table_number}. asztal`;
        }

        const small = document.createElement("small");

        if (selectedReservationType === "lane") {
            small.textContent = "Bowling pálya";
        } else {
            small.textContent = `${resource.capacity} fős`;
        }

        button.append(name, small);

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
        resourcesWrapper.innerHTML = "";
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
        notes: notesInput ? notesInput.value.trim() : ""
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

function resetReservationForm() {
    const dateInput = document.getElementById("reservation-date");
    const timeInput = document.getElementById("reservation-time");
    const guestsInput = document.getElementById("reservation-guests");
    const notesInput = document.getElementById("reservation-notes");

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