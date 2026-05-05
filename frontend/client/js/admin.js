import {
    userData,
    fetchAdminDashboard,
    fetchAdminUsers,
    fetchAdminMenuItems,
    fetchAdminEvents,
    fetchAdminReviews,
    createAdminMenuItem,
    updateAdminMenuItem,
    deleteAdminMenuItem,
    deleteAdminReview,
    createAdminEvent,
    updateAdminEvent,
    deleteAdminEvent,
    deleteAdminReservation
} from './api.js';

let adminUser = null;
let adminDashboard = null;
let adminUsers = [];
let adminMenuItems = [];
let adminEvents = [];
let editingMenuItemId = null;
let adminReviews = [];
let editingEventId = null;

export async function renderAdminPage() {
    const adminContainer = document.getElementById("admin-container");
    if (!adminContainer) return;

    const token = localStorage.getItem("token");

    if (!token) {
        localStorage.setItem("currentView", "home");
        location.reload();
        return;
    }

    const userResponse = await userData();

    if (!userResponse.success || userResponse.user.role !== "admin") {
        localStorage.setItem("currentView", "home");
        location.reload();
        return;
    }

    adminUser = userResponse.user;

    const dashboardResponse = await fetchAdminDashboard(token);
    const usersResponse = await fetchAdminUsers(token);
    const menuResponse = await fetchAdminMenuItems(token);
    const eventsResponse = await fetchAdminEvents(token);
    const reviewsResponse = await fetchAdminReviews(token);

    if (!dashboardResponse.success) {
        adminContainer.innerHTML = '';
        adminContainer.classList.remove("d-none");
        renderAdminError(adminContainer, dashboardResponse.message || "Nem sikerült betölteni az admin oldalt.");
        return;
    }

    adminDashboard = dashboardResponse;
    adminUsers = usersResponse.results || [];
    adminMenuItems = menuResponse.results || [];
    adminEvents = eventsResponse.results || [];
    adminReviews = reviewsResponse.results || [];

    adminContainer.innerHTML = '';
    adminContainer.classList.remove("d-none");

    buildAdminLayout(adminContainer);
}

function buildAdminLayout(container) {
    const section = document.createElement("section");
    section.id = "admin-section";
    section.className = "py-5";

    const innerContainer = document.createElement("div");
    innerContainer.className = "container";

    const title = document.createElement("h2");
    title.className = "main-section-title text-center text-md-start";

    const titleNormal = document.createElement("span");
    titleNormal.className = "no-glow";
    titleNormal.textContent = "Admin ";

    const titleGlow = document.createElement("span");
    titleGlow.className = "glow-text";
    titleGlow.textContent = "Felület";

    title.append(titleNormal, titleGlow);

    const hr = document.createElement("hr");
    hr.className = "mb-4 mt-0 main-section-hr";

    const intro = document.createElement("p");
    intro.id = "admin-intro";
    intro.textContent = `Bejelentkezve adminként: ${adminUser.name}. Itt láthatod a rendszer főbb adatait és legfontosabb listáit.`;

    const stats = createStatsGrid();
    const tabs = createAdminTabs();
    const content = createAdminContent();

    const menuModal = createMenuModal();
    const eventModal = createEventModal();

    innerContainer.append(title, hr, intro, stats, tabs, content, menuModal, eventModal);
    section.appendChild(innerContainer);
    container.appendChild(section);
}

function createStatsGrid() {
    const stats = adminDashboard.stats || {};

    const grid = document.createElement("div");
    grid.className = "admin-stats-grid mb-5";

    const cards = [
        {
            label: "Felhasználók",
            value: stats.total_users || 0,
            icon: "bi bi-people",
            type: "cyan"
        },
        {
            label: "Aktív foglalások",
            value: stats.total_active_reservations || 0,
            icon: "bi bi-calendar-check",
            type: "magenta"
        },
        {
            label: "Menüelemek",
            value: stats.total_menu_items || 0,
            icon: "bi bi-cup-straw",
            type: "cyan"
        },
        {
            label: "Események",
            value: stats.total_events || 0,
            icon: "bi bi-calendar3-event",
            type: "magenta"
        }
    ];

    cards.forEach(cardData => {
        const card = document.createElement("div");
        card.className = `admin-stat-card admin-stat-${cardData.type}`;

        const icon = document.createElement("div");
        icon.className = "admin-stat-icon";

        const iconElement = document.createElement("i");
        iconElement.className = cardData.icon;

        icon.appendChild(iconElement);

        const text = document.createElement("div");

        const value = document.createElement("h3");
        value.textContent = cardData.value;

        const label = document.createElement("p");
        label.textContent = cardData.label;

        text.append(value, label);
        card.append(icon, text);
        grid.appendChild(card);
    });

    return grid;
}

function createAdminTabs() {
    const tabs = document.createElement("div");
    tabs.className = "admin-tabs mb-4";

    const tabItems = [
        { label: "Foglalások", target: "reservations" },
        { label: "Felhasználók", target: "users" },
        { label: "Menü", target: "menu" },
        { label: "Események", target: "events" },
        { label: "Vélemények", target: "reviews" }
    ];

    tabItems.forEach((item, index) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = index === 0 ? "admin-tab-btn active" : "admin-tab-btn";
        button.dataset.target = item.target;
        button.textContent = item.label;

        button.addEventListener("click", () => {
            switchAdminTab(item.target);
        });

        tabs.appendChild(button);
    });

    return tabs;
}

function createAdminContent() {
    const wrapper = document.createElement("div");
    wrapper.id = "admin-content";

    const reservationsPanel = createPanel("reservations", true);
    reservationsPanel.appendChild(createReservationsTable(adminDashboard.recent_reservations || []));

    const usersPanel = createPanel("users", false);
    usersPanel.appendChild(createUsersTable(adminUsers));

    const menuPanel = createPanel("menu", false);
    menuPanel.appendChild(createMenuTable(adminMenuItems));

    const eventsPanel = createPanel("events", false);
    eventsPanel.appendChild(createEventsTable(adminEvents));

    const reviewsPanel = createPanel("reviews", false);
    reviewsPanel.appendChild(createReviewsTable(adminReviews));

    wrapper.append(reservationsPanel, usersPanel, menuPanel, eventsPanel, reviewsPanel);

    return wrapper;
}

function createPanel(name, active) {
    const panel = document.createElement("div");
    panel.className = active ? "admin-panel active" : "admin-panel";
    panel.dataset.panel = name;

    return panel;
}

function switchAdminTab(target) {
    document.querySelectorAll(".admin-tab-btn").forEach(button => {
        if (button.dataset.target === target) {
            button.classList.add("active");
        } else {
            button.classList.remove("active");
        }
    });

    document.querySelectorAll(".admin-panel").forEach(panel => {
        if (panel.dataset.panel === target) {
            panel.classList.add("active");
        } else {
            panel.classList.remove("active");
        }
    });
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

    ["Felhasználó", "Típus", "Dátum", "Időpont", "Fő", "Státusz", "Műveletek"].forEach(text => {
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
        userName.textContent = reservation.user_name || "Ismeretlen felhasználó";

        const userEmail = document.createElement("small");
        userEmail.textContent = reservation.user_email || "Nincs email";

        userInfo.append(userName, userEmail);
        userBox.append(avatar, userInfo);
        user.appendChild(userBox);

        const type = document.createElement("td");

        const isLane = Boolean(reservation.lane_name);

        const typeBadge = document.createElement("span");
        typeBadge.className = isLane
            ? "admin-type-badge lane"
            : "admin-type-badge table";

        const typeIcon = document.createElement("i");
        typeIcon.className = isLane
            ? "bi bi-bullseye"
            : "bi bi-cup-straw";

        const typeText = document.createTextNode(
            isLane
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

        const guestsIcon = document.createElement("i");
        guestsIcon.className = "bi bi-people";

        const guestsText = document.createTextNode(` ${reservation.guests} fő`);

        guestsBadge.append(guestsIcon, guestsText);
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

        const actions = document.createElement("td");

        const actionWrapper = document.createElement("div");
        actionWrapper.className = "admin-action-wrapper";

        const deleteBtn = document.createElement("button");
        deleteBtn.type = "button";
        deleteBtn.className = "admin-delete-btn";
        deleteBtn.textContent = "Törlés";

        deleteBtn.addEventListener("click", () => {
            deleteReservationFromAdmin(reservation.id);
        });

        actionWrapper.appendChild(deleteBtn);
        actions.appendChild(actionWrapper);

        tr.append(user, type, date, time, guests, status, actions);
        tbody.appendChild(tr);
    });

    table.append(thead, tbody);
    block.appendChild(tableWrapper);

    return block;
}

function createUsersTable(users) {
    const block = createAdminBlock("Felhasználók");

    if (!users.length) {
        block.appendChild(createEmptyText("Nincs felhasználó."));
        return block;
    }

    const tableWrapper = createTable();
    const table = tableWrapper.querySelector("table");

    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");

    ["ID", "Felhasználó", "Szerepkör"].forEach(text => {
        const th = document.createElement("th");
        th.textContent = text;
        headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);

    const tbody = document.createElement("tbody");

    users.forEach(userItem => {
        const tr = document.createElement("tr");

        const id = document.createElement("td");

        const idBadge = document.createElement("span");
        idBadge.className = "admin-id-badge";
        idBadge.textContent = `#${userItem.id}`;

        id.appendChild(idBadge);

        const user = document.createElement("td");

        const userBox = document.createElement("div");
        userBox.className = "admin-user-cell";

        const avatar = document.createElement("div");
        avatar.className = userItem.role === "admin"
            ? "admin-user-avatar admin"
            : "admin-user-avatar";

        avatar.textContent = getInitials(userItem.name);

        const userInfo = document.createElement("div");

        const userName = document.createElement("strong");
        userName.textContent = userItem.name;

        const userEmail = document.createElement("small");
        userEmail.textContent = userItem.email;

        userInfo.append(userName, userEmail);
        userBox.append(avatar, userInfo);
        user.appendChild(userBox);

        const role = document.createElement("td");

        const roleBadge = document.createElement("span");
        roleBadge.className = userItem.role === "admin"
            ? "admin-role admin"
            : "admin-role user";

        roleBadge.textContent = userItem.role === "admin"
            ? "Admin"
            : "Felhasználó";

        role.appendChild(roleBadge);

        tr.append(id, user, role);
        tbody.appendChild(tr);
    });

    table.append(thead, tbody);
    block.appendChild(tableWrapper);

    return block;
}

function createEventsTable(events) {
    const block = createAdminBlock("Események");

    const topBar = document.createElement("div");
    topBar.className = "admin-menu-topbar";

    const addBtn = document.createElement("button");
    addBtn.type = "button";
    addBtn.className = "admin-add-menu-btn";
    addBtn.textContent = "Új esemény hozzáadása";

    addBtn.addEventListener("click", () => {
        openEventModal();
    });

    topBar.appendChild(addBtn);
    block.appendChild(topBar);

    if (!events.length) {
        block.appendChild(createEmptyText("Nincs esemény."));
        return block;
    }

    const tableWrapper = createTable();
    const table = tableWrapper.querySelector("table");

    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");

    ["ID", "Esemény", "Dátum", "Időpont", "Szabad hely", "Kategória", "Műveletek"].forEach(text => {
        const th = document.createElement("th");
        th.textContent = text;
        headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);

    const tbody = document.createElement("tbody");

    events.forEach(eventItem => {
        const tr = document.createElement("tr");

        const id = document.createElement("td");

        const idBadge = document.createElement("span");
        idBadge.className = "admin-id-badge";
        idBadge.textContent = `#${eventItem.id}`;

        id.appendChild(idBadge);

        const name = document.createElement("td");

        const eventBox = document.createElement("div");
        eventBox.className = "admin-event-cell";

        const eventIcon = document.createElement("div");
        eventIcon.className = `admin-event-icon ${eventItem.category || "bowling"}`;

        const icon = document.createElement("i");
        icon.className = getAdminEventIcon(eventItem.category);

        eventIcon.appendChild(icon);

        const eventInfo = document.createElement("div");

        const eventName = document.createElement("strong");
        eventName.textContent = eventItem.name;

        const eventDescription = document.createElement("small");
        eventDescription.textContent = eventItem.description || "Nincs leírás.";

        eventInfo.append(eventName, eventDescription);
        eventBox.append(eventIcon, eventInfo);
        name.appendChild(eventBox);

        const date = document.createElement("td");
        date.textContent = formatDate(eventItem.event_date);

        const time = document.createElement("td");
        time.textContent = `${formatTime(eventItem.start_time)} - ${formatTime(eventItem.end_time)}`;

        const slots = document.createElement("td");

        const slotsBadge = document.createElement("span");
        slotsBadge.className = "admin-soft-badge";

        const slotsIcon = document.createElement("i");
        slotsIcon.className = "bi bi-ticket-perforated";

        const slotsText = document.createTextNode(` ${eventItem.free_slots} hely`);

        slotsBadge.append(slotsIcon, slotsText);
        slots.appendChild(slotsBadge);

        const category = document.createElement("td");

        const categoryBadge = document.createElement("span");
        categoryBadge.className = `admin-category-badge ${eventItem.category || "bowling"}`;
        categoryBadge.textContent = getAdminEventCategoryLabel(eventItem.category);

        category.appendChild(categoryBadge);

        const actions = document.createElement("td");

        const actionWrapper = document.createElement("div");
        actionWrapper.className = "admin-action-wrapper";

        const editBtn = document.createElement("button");
        editBtn.type = "button";
        editBtn.className = "admin-edit-btn";
        editBtn.textContent = "Szerkesztés";

        editBtn.addEventListener("click", () => {
            openEventModal(eventItem);
        });

        const deleteBtn = document.createElement("button");
        deleteBtn.type = "button";
        deleteBtn.className = "admin-delete-btn";
        deleteBtn.textContent = "Törlés";

        deleteBtn.addEventListener("click", () => {
            deleteEventFromAdmin(eventItem.id);
        });

        actionWrapper.append(editBtn, deleteBtn);
        actions.appendChild(actionWrapper);

        tr.append(id, name, date, time, slots, category, actions);
        tbody.appendChild(tr);
    });

    table.append(thead, tbody);
    block.appendChild(tableWrapper);

    return block;
}

function getSubcategoryLabel(subcategory) {
    const labels = {
        burger: "Burger",
        pizza: "Pizza",
        pasta: "Tészta",
        alcoholic: "Alkoholos",
        non_alcoholic: "Alkoholmentes"
    };

    return labels[subcategory] || "-";
}

function formatDate(dateString) {
    if (!dateString) return "-";

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
    if (!timeString) return "-";
    return String(timeString).slice(0, 5);
}

function createMenuModal() {
    const modal = document.createElement("div");
    modal.id = "admin-menu-modal";
    modal.className = "admin-custom-modal d-none";

    const overlay = document.createElement("div");
    overlay.className = "admin-modal-overlay";

    const card = document.createElement("div");
    card.className = "admin-modal-card";

    const header = document.createElement("div");
    header.className = "admin-modal-header";

    const title = document.createElement("h3");
    title.id = "admin-menu-modal-title";
    title.textContent = "Új menüelem";

    const closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.className = "admin-modal-close";
    closeBtn.innerHTML = "&times;";

    closeBtn.addEventListener("click", closeMenuModal);

    header.append(title, closeBtn);

    const form = document.createElement("div");
    form.className = "admin-menu-form";

    const nameGroup = createAdminInputGroup("Név", "admin-menu-name", "text");
    const descriptionGroup = createAdminTextareaGroup("Leírás", "admin-menu-description");
    const priceGroup = createAdminInputGroup("Ár", "admin-menu-price", "number");

    const categoryGroup = createAdminSelectGroup("Kategória", "admin-menu-category", [
        { value: "food", label: "Étel" },
        { value: "drink", label: "Ital" }
    ]);

    const subcategoryGroup = createAdminSelectGroup("Alkategória", "admin-menu-subcategory", [
        { value: "", label: "Nincs" },
        { value: "burger", label: "Burger" },
        { value: "pizza", label: "Pizza" },
        { value: "pasta", label: "Tészta" },
        { value: "alcoholic", label: "Alkoholos ital" },
        { value: "non_alcoholic", label: "Alkoholmentes ital" }
    ]);

    const message = document.createElement("p");
    message.id = "admin-menu-modal-message";

    const actions = document.createElement("div");
    actions.className = "admin-modal-actions";

    const saveBtn = document.createElement("button");
    saveBtn.type = "button";
    saveBtn.id = "admin-menu-save-btn";
    saveBtn.textContent = "Mentés";

    saveBtn.addEventListener("click", saveMenuItemFromModal);

    const cancelBtn = document.createElement("button");
    cancelBtn.type = "button";
    cancelBtn.id = "admin-menu-cancel-btn";
    cancelBtn.textContent = "Mégse";

    cancelBtn.addEventListener("click", closeMenuModal);

    actions.append(saveBtn, cancelBtn);

    form.append(
        nameGroup,
        descriptionGroup,
        priceGroup,
        categoryGroup,
        subcategoryGroup,
        message,
        actions
    );

    card.append(header, form);
    overlay.appendChild(card);
    modal.appendChild(overlay);

    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) {
            closeMenuModal();
        }
    });

    return modal;
}

function createAdminInputGroup(labelText, inputId, type) {
    const group = document.createElement("div");
    group.className = "admin-form-group";

    const label = document.createElement("label");
    label.setAttribute("for", inputId);
    label.textContent = labelText;

    const input = document.createElement("input");
    input.id = inputId;
    input.type = type;
    input.className = "admin-form-control";

    if (type === "number") {
        input.min = "0";
        input.step = "1";
    }

    group.append(label, input);

    return group;
}

function createAdminTextareaGroup(labelText, textareaId) {
    const group = document.createElement("div");
    group.className = "admin-form-group";

    const label = document.createElement("label");
    label.setAttribute("for", textareaId);
    label.textContent = labelText;

    const textarea = document.createElement("textarea");
    textarea.id = textareaId;
    textarea.className = "admin-form-control";
    textarea.rows = 4;

    group.append(label, textarea);

    return group;
}

function createAdminSelectGroup(labelText, selectId, options) {
    const group = document.createElement("div");
    group.className = "admin-form-group";

    const label = document.createElement("label");
    label.setAttribute("for", selectId);
    label.textContent = labelText;

    const select = document.createElement("select");
    select.id = selectId;
    select.className = "admin-form-control";

    options.forEach(optionData => {
        const option = document.createElement("option");
        option.value = optionData.value;
        option.textContent = optionData.label;

        select.appendChild(option);
    });

    group.append(label, select);

    return group;
}

function openMenuModal(item = null) {
    const modal = document.getElementById("admin-menu-modal");
    const title = document.getElementById("admin-menu-modal-title");
    const nameInput = document.getElementById("admin-menu-name");
    const descriptionInput = document.getElementById("admin-menu-description");
    const priceInput = document.getElementById("admin-menu-price");
    const categoryInput = document.getElementById("admin-menu-category");
    const subcategoryInput = document.getElementById("admin-menu-subcategory");
    const message = document.getElementById("admin-menu-modal-message");

    if (!modal) return;

    editingMenuItemId = item ? Number(item.id) : null;

    if (title) {
        title.textContent = item ? "Menüelem szerkesztése" : "Új menüelem";
    }

    if (nameInput) {
        nameInput.value = item ? item.name : "";
    }

    if (descriptionInput) {
        descriptionInput.value = item ? item.description || "" : "";
    }

    if (priceInput) {
        priceInput.value = item ? Number(item.price) : "";
    }

    if (categoryInput) {
        categoryInput.value = item ? item.category : "food";
    }

    if (subcategoryInput) {
        subcategoryInput.value = item && item.subcategory ? item.subcategory : "";
    }

    if (message) {
        message.textContent = "";
        message.className = "";
    }

    modal.classList.remove("d-none");
    document.body.style.overflowY = "hidden";
}

function closeMenuModal() {
    const modal = document.getElementById("admin-menu-modal");

    if (!modal) return;

    modal.classList.add("d-none");
    document.body.style.overflowY = "auto";
    editingMenuItemId = null;
}

async function saveMenuItemFromModal() {
    const token = localStorage.getItem("token");

    const nameInput = document.getElementById("admin-menu-name");
    const descriptionInput = document.getElementById("admin-menu-description");
    const priceInput = document.getElementById("admin-menu-price");
    const categoryInput = document.getElementById("admin-menu-category");
    const subcategoryInput = document.getElementById("admin-menu-subcategory");

    const name = nameInput ? nameInput.value.trim() : "";
    const description = descriptionInput ? descriptionInput.value.trim() : "";
    const price = priceInput ? Number(priceInput.value) : 0;
    const category = categoryInput ? categoryInput.value : "food";
    const subcategory = subcategoryInput ? subcategoryInput.value : "";

    if (!name) {
        setAdminMenuModalMessage("A név megadása kötelező.", false);
        return;
    }

    if (!price || price <= 0) {
        setAdminMenuModalMessage("Az árnak nagyobbnak kell lennie nullánál.", false);
        return;
    }

    const menuItem = {
        name,
        description,
        price,
        category,
        subcategory: subcategory || null
    };

    let response;

    if (editingMenuItemId) {
        response = await updateAdminMenuItem(editingMenuItemId, menuItem, token);
    } else {
        response = await createAdminMenuItem(menuItem, token);
    }

    if (!response.success) {
        setAdminMenuModalMessage(response.message || "Nem sikerült menteni a menüelemet.", false);
        return;
    }

    adminMenuItems = response.results || [];

    closeMenuModal();
    refreshAdminMenuPanel();
}

function setAdminMenuModalMessage(text, success) {
    const message = document.getElementById("admin-menu-modal-message");
    if (!message) return;

    message.textContent = text;
    message.className = success
        ? "admin-modal-message success"
        : "admin-modal-message error";
}

async function deleteMenuItemFromAdmin(id) {
    const confirmDelete = confirm("Biztosan törölni szeretnéd ezt a menüelemet?");

    if (!confirmDelete) return;

    const token = localStorage.getItem("token");
    const response = await deleteAdminMenuItem(id, token);

    if (!response.success) {
        alert(response.message || "Nem sikerült törölni a menüelemet.");
        return;
    }

    adminMenuItems = response.results || [];
    refreshAdminMenuPanel();
}

function refreshAdminMenuPanel() {
    const menuPanel = document.querySelector('.admin-panel[data-panel="menu"]');

    if (!menuPanel) return;

    menuPanel.innerHTML = "";
    menuPanel.appendChild(createMenuTable(adminMenuItems));
}

function createReviewsTable(reviews) {
    const block = createAdminBlock("Vélemények");

    if (!reviews.length) {
        block.appendChild(createEmptyText("Nincs vélemény."));
        return block;
    }

    const tableWrapper = createTable();
    const table = tableWrapper.querySelector("table");

    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");

    ["ID", "Felhasználó", "Értékelés", "Vélemény", "Dátum", "Műveletek"].forEach(text => {
        const th = document.createElement("th");
        th.textContent = text;
        headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);

    const tbody = document.createElement("tbody");

    reviews.forEach(review => {
        const tr = document.createElement("tr");

        const id = document.createElement("td");
        id.textContent = review.id;

        const user = document.createElement("td");
        user.textContent = `${review.user_name} (${review.user_email})`;

        const rating = document.createElement("td");
        rating.appendChild(createAdminStars(review.rating));

        const comment = document.createElement("td");

        const commentBox = document.createElement("div");
        commentBox.className = "admin-review-comment";
        commentBox.textContent = review.comment || "Nincs megjegyzés.";

        comment.appendChild(commentBox);

        const date = document.createElement("td");
        date.textContent = formatDate(review.created_at);

        const actions = document.createElement("td");

        const actionWrapper = document.createElement("div");
        actionWrapper.className = "admin-action-wrapper";

        const deleteBtn = document.createElement("button");
        deleteBtn.type = "button";
        deleteBtn.className = "admin-delete-btn";
        deleteBtn.textContent = "Törlés";

        deleteBtn.addEventListener("click", () => {
            deleteReviewFromAdmin(review.id);
        });

        actionWrapper.appendChild(deleteBtn);
        actions.appendChild(actionWrapper);

        tr.append(id, user, rating, comment, date, actions);
        tbody.appendChild(tr);
    });

    table.append(thead, tbody);
    block.appendChild(tableWrapper);

    return block;
}

function createAdminStars(rating) {
    const wrapper = document.createElement("div");
    wrapper.className = "admin-review-stars";

    const ratingNumber = Number(rating);

    for (let i = 1; i <= 5; i += 1) {
        const star = document.createElement("i");
        star.className = i <= ratingNumber
            ? "bi bi-star-fill"
            : "bi bi-star";

        wrapper.appendChild(star);
    }

    return wrapper;
}

async function deleteReviewFromAdmin(id) {
    const confirmDelete = confirm("Biztosan törölni szeretnéd ezt a véleményt?");

    if (!confirmDelete) return;

    const token = localStorage.getItem("token");
    const response = await deleteAdminReview(id, token);

    if (!response.success) {
        alert(response.message || "Nem sikerült törölni a véleményt.");
        return;
    }

    adminReviews = response.results || [];
    refreshAdminReviewsPanel();
}

function refreshAdminReviewsPanel() {
    const reviewsPanel = document.querySelector('.admin-panel[data-panel="reviews"]');

    if (!reviewsPanel) return;

    reviewsPanel.innerHTML = "";
    reviewsPanel.appendChild(createReviewsTable(adminReviews));
}

function getInitials(name) {
    if (!name) return "U";

    const parts = name.trim().split(" ").filter(Boolean);

    if (parts.length === 1) {
        return parts[0].slice(0, 2).toUpperCase();
    }

    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function getAdminEventIcon(category) {
    const icons = {
        bowling: "bi bi-bullseye",
        pub: "bi bi-cup-straw",
        competition: "bi bi-trophy",
        music: "bi bi-music-note-beamed"
    };

    return icons[category] || "bi bi-calendar3-event";
}

function getAdminEventCategoryLabel(category) {
    const labels = {
        bowling: "Bowling",
        pub: "Pub",
        competition: "Verseny",
        music: "Zene"
    };

    return labels[category] || category || "-";
}

function createAdminBlock(titleText) {
    const block = document.createElement("div");
    block.className = "admin-block";

    const title = document.createElement("h3");
    title.className = "admin-block-title";
    title.textContent = titleText;

    block.appendChild(title);

    return block;
}

function createTable() {
    const responsive = document.createElement("div");
    responsive.className = "admin-table-responsive";

    const table = document.createElement("table");
    table.className = "admin-table";

    responsive.appendChild(table);

    return responsive;
}

function createMenuTable(menuItems) {
    const block = createAdminBlock("Menüelemek");

    const topBar = document.createElement("div");
    topBar.className = "admin-menu-topbar";

    const addBtn = document.createElement("button");
    addBtn.type = "button";
    addBtn.className = "admin-add-menu-btn";
    addBtn.textContent = "Új menüelem hozzáadása";

    addBtn.addEventListener("click", () => {
        openMenuModal();
    });

    topBar.appendChild(addBtn);
    block.appendChild(topBar);

    if (!menuItems.length) {
        block.appendChild(createEmptyText("Nincs menüelem."));
        return block;
    }

    const tableWrapper = createTable();
    const table = tableWrapper.querySelector("table");

    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");

    ["ID", "Név", "Ár", "Kategória", "Alkategória", "Műveletek"].forEach(text => {
        const th = document.createElement("th");
        th.textContent = text;
        headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);

    const tbody = document.createElement("tbody");

    menuItems.forEach(item => {
        const tr = document.createElement("tr");

        const id = document.createElement("td");

        const idBadge = document.createElement("span");
        idBadge.className = "admin-id-badge";
        idBadge.textContent = `#${item.id}`;

        id.appendChild(idBadge);

        const name = document.createElement("td");

        const menuBox = document.createElement("div");
        menuBox.className = "admin-menu-cell";

        const iconBox = document.createElement("div");
        iconBox.className = item.category === "food"
            ? "admin-menu-icon food"
            : "admin-menu-icon drink";

        const icon = document.createElement("i");
        icon.className = item.category === "food"
            ? "bi bi-fork-knife"
            : "bi bi-cup-straw";

        iconBox.appendChild(icon);

        const menuInfo = document.createElement("div");

        const menuName = document.createElement("strong");
        menuName.textContent = item.name;

        const menuDescription = document.createElement("small");
        menuDescription.textContent = item.description || "Nincs leírás.";

        menuInfo.append(menuName, menuDescription);
        menuBox.append(iconBox, menuInfo);
        name.appendChild(menuBox);

        const price = document.createElement("td");

        const priceBadge = document.createElement("span");
        priceBadge.className = "admin-soft-badge";
        priceBadge.textContent = `${Number(item.price).toLocaleString("hu-HU")} Ft`;

        price.appendChild(priceBadge);

        const category = document.createElement("td");

        const categoryBadge = document.createElement("span");
        categoryBadge.className = item.category === "food"
            ? "admin-type-badge food"
            : "admin-type-badge drink";

        categoryBadge.textContent = item.category === "food" ? "Étel" : "Ital";
        category.appendChild(categoryBadge);

        const subcategory = document.createElement("td");

        const subcategoryBadge = document.createElement("span");
        subcategoryBadge.className = "admin-soft-badge";
        subcategoryBadge.textContent = getSubcategoryLabel(item.subcategory);

        subcategory.appendChild(subcategoryBadge);

        const actions = document.createElement("td");

        const actionWrapper = document.createElement("div");
        actionWrapper.className = "admin-action-wrapper";

        const editBtn = document.createElement("button");
        editBtn.type = "button";
        editBtn.className = "admin-edit-btn";
        editBtn.textContent = "Szerkesztés";

        editBtn.addEventListener("click", () => {
            openMenuModal(item);
        });

        const deleteBtn = document.createElement("button");
        deleteBtn.type = "button";
        deleteBtn.className = "admin-delete-btn";
        deleteBtn.textContent = "Törlés";

        deleteBtn.addEventListener("click", () => {
            deleteMenuItemFromAdmin(item.id);
        });

        actionWrapper.append(editBtn, deleteBtn);
        actions.appendChild(actionWrapper);

        tr.append(id, name, price, category, subcategory, actions);
        tbody.appendChild(tr);
    });

    table.append(thead, tbody);
    block.appendChild(tableWrapper);

    return block;
}

function openEventModal(eventItem = null) {
    const modal = document.getElementById("admin-event-modal");
    const title = document.getElementById("admin-event-modal-title");

    const nameInput = document.getElementById("admin-event-name");
    const descriptionInput = document.getElementById("admin-event-description");
    const dateInput = document.getElementById("admin-event-date");
    const startTimeInput = document.getElementById("admin-event-start-time");
    const endTimeInput = document.getElementById("admin-event-end-time");
    const freeSlotsInput = document.getElementById("admin-event-free-slots");
    const categoryInput = document.getElementById("admin-event-category");
    const message = document.getElementById("admin-event-modal-message");

    if (!modal) return;

    editingEventId = eventItem ? Number(eventItem.id) : null;

    if (title) {
        title.textContent = eventItem ? "Esemény szerkesztése" : "Új esemény";
    }

    if (nameInput) {
        nameInput.value = eventItem ? eventItem.name : "";
    }

    if (descriptionInput) {
        descriptionInput.value = eventItem ? eventItem.description || "" : "";
    }

    if (dateInput) {
        dateInput.value = eventItem ? formatDateInputValue(eventItem.event_date) : "";
    }

    if (startTimeInput) {
        startTimeInput.value = eventItem ? formatTimeInputValue(eventItem.start_time) : "";
    }

    if (endTimeInput) {
        endTimeInput.value = eventItem ? formatTimeInputValue(eventItem.end_time) : "";
    }

    if (freeSlotsInput) {
        freeSlotsInput.value = eventItem ? Number(eventItem.free_slots) : "100";
    }

    if (categoryInput) {
        categoryInput.value = eventItem ? eventItem.category : "bowling";
    }

    if (message) {
        message.textContent = "";
        message.className = "";
    }

    modal.classList.remove("d-none");
    document.body.style.overflowY = "hidden";
}

function createEventModal() {
    const modal = document.createElement("div");
    modal.id = "admin-event-modal";
    modal.className = "admin-custom-modal d-none";

    const overlay = document.createElement("div");
    overlay.className = "admin-modal-overlay";

    const card = document.createElement("div");
    card.className = "admin-modal-card";

    const header = document.createElement("div");
    header.className = "admin-modal-header";

    const title = document.createElement("h3");
    title.id = "admin-event-modal-title";
    title.textContent = "Új esemény";

    const closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.className = "admin-modal-close";
    closeBtn.innerHTML = "&times;";

    closeBtn.addEventListener("click", closeEventModal);

    header.append(title, closeBtn);

    const form = document.createElement("div");
    form.className = "admin-menu-form";

    const nameGroup = createAdminInputGroup("Esemény neve", "admin-event-name", "text");
    const descriptionGroup = createAdminTextareaGroup("Leírás", "admin-event-description");
    const dateGroup = createAdminInputGroup("Dátum", "admin-event-date", "date");
    const startTimeGroup = createAdminInputGroup("Kezdés", "admin-event-start-time", "time");
    const endTimeGroup = createAdminInputGroup("Befejezés", "admin-event-end-time", "time");
    const slotsGroup = createAdminInputGroup("Szabad helyek", "admin-event-free-slots", "number");

    const categoryGroup = createAdminSelectGroup("Kategória", "admin-event-category", [
        { value: "bowling", label: "Bowling" },
        { value: "pub", label: "Pub" },
        { value: "competition", label: "Verseny" },
        { value: "music", label: "Zene" }
    ]);

    const message = document.createElement("p");
    message.id = "admin-event-modal-message";

    const actions = document.createElement("div");
    actions.className = "admin-modal-actions";

    const saveBtn = document.createElement("button");
    saveBtn.type = "button";
    saveBtn.id = "admin-event-save-btn";
    saveBtn.textContent = "Mentés";

    saveBtn.addEventListener("click", saveEventFromModal);

    const cancelBtn = document.createElement("button");
    cancelBtn.type = "button";
    cancelBtn.id = "admin-event-cancel-btn";
    cancelBtn.textContent = "Mégse";

    cancelBtn.addEventListener("click", closeEventModal);

    actions.append(saveBtn, cancelBtn);

    form.append(
        nameGroup,
        descriptionGroup,
        dateGroup,
        startTimeGroup,
        endTimeGroup,
        slotsGroup,
        categoryGroup,
        message,
        actions
    );

    card.append(header, form);
    overlay.appendChild(card);
    modal.appendChild(overlay);

    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) {
            closeEventModal();
        }
    });

    return modal;
}

function closeEventModal() {
    const modal = document.getElementById("admin-event-modal");

    if (!modal) return;

    modal.classList.add("d-none");
    document.body.style.overflowY = "auto";
    editingEventId = null;
}

async function saveEventFromModal() {
    const token = localStorage.getItem("token");

    const nameInput = document.getElementById("admin-event-name");
    const descriptionInput = document.getElementById("admin-event-description");
    const dateInput = document.getElementById("admin-event-date");
    const startTimeInput = document.getElementById("admin-event-start-time");
    const endTimeInput = document.getElementById("admin-event-end-time");
    const freeSlotsInput = document.getElementById("admin-event-free-slots");
    const categoryInput = document.getElementById("admin-event-category");

    const name = nameInput ? nameInput.value.trim() : "";
    const description = descriptionInput ? descriptionInput.value.trim() : "";
    const eventDate = dateInput ? dateInput.value : "";
    const startTime = startTimeInput ? startTimeInput.value : "";
    const endTime = endTimeInput ? endTimeInput.value : "";
    const freeSlots = freeSlotsInput ? Number(freeSlotsInput.value) : 0;
    const category = categoryInput ? categoryInput.value : "bowling";

    if (!name) {
        setAdminEventModalMessage("Az esemény neve kötelező.", false);
        return;
    }

    if (!eventDate) {
        setAdminEventModalMessage("A dátum megadása kötelező.", false);
        return;
    }

    if (!freeSlots || freeSlots < 1) {
        setAdminEventModalMessage("A szabad helyek száma legalább 1 legyen.", false);
        return;
    }

    const eventData = {
        name,
        description,
        event_date: eventDate,
        start_time: startTime || null,
        end_time: endTime || null,
        free_slots: freeSlots,
        category
    };

    let response;

    if (editingEventId) {
        response = await updateAdminEvent(editingEventId, eventData, token);
    } else {
        response = await createAdminEvent(eventData, token);
    }

    if (!response.success) {
        setAdminEventModalMessage(response.message || "Nem sikerült menteni az eseményt.", false);
        return;
    }

    adminEvents = response.results || [];

    closeEventModal();
    refreshAdminEventsPanel();
}

async function deleteReservationFromAdmin(id) {
    const confirmDelete = confirm("Biztosan törölni szeretnéd ezt a foglalást?");

    if (!confirmDelete) return;

    const token = localStorage.getItem("token");
    const response = await deleteAdminReservation(id, token);

    if (!response.success) {
        alert(response.message || "Nem sikerült törölni a foglalást.");
        return;
    }

    if (adminDashboard) {
        adminDashboard.reservations = response.results || [];
    }

    refreshAdminReservationsPanel();
}

function refreshAdminReservationsPanel() {
    const reservationsPanel = document.querySelector('.admin-panel[data-panel="reservations"]');

    if (!reservationsPanel) return;

    reservationsPanel.innerHTML = "";
    reservationsPanel.appendChild(createReservationsTable(adminDashboard.reservations || []));
}

function formatDateInputValue(dateString) {
    if (!dateString) return "";

    try {
        const date = new Date(dateString);

        if (Number.isNaN(date.getTime())) {
            return String(dateString).slice(0, 10);
        }

        return date.toISOString().split("T")[0];
    } catch {
        return String(dateString).slice(0, 10);
    }
}

function formatTimeInputValue(timeString) {
    if (!timeString) return "";

    return String(timeString).slice(0, 5);
}

async function deleteEventFromAdmin(id) {
    const confirmDelete = confirm("Biztosan törölni szeretnéd ezt az eseményt?");

    if (!confirmDelete) return;

    const token = localStorage.getItem("token");
    const response = await deleteAdminEvent(id, token);

    if (!response.success) {
        alert(response.message || "Nem sikerült törölni az eseményt.");
        return;
    }

    adminEvents = response.results || [];

    refreshAdminEventsPanel();
}

function refreshAdminEventsPanel() {
    const eventsPanel = document.querySelector('.admin-panel[data-panel="events"]');

    if (!eventsPanel) return;

    eventsPanel.innerHTML = "";
    eventsPanel.appendChild(createEventsTable(adminEvents));
}