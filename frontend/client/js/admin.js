import {
    userData,
    fetchAdminDashboard,
    fetchAdminUsers,
    fetchAdminMenuItems,
    fetchAdminEvents
} from './api.js';

let adminUser = null;
let adminDashboard = null;
let adminUsers = [];
let adminMenuItems = [];
let adminEvents = [];

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

    innerContainer.append(title, hr, intro, stats, tabs, content);
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
        { label: "Események", target: "events" }
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

    wrapper.append(reservationsPanel, usersPanel, menuPanel, eventsPanel);

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

    const table = createTable();

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
        user.textContent = `${reservation.user_name} (${reservation.user_email})`;

        const type = document.createElement("td");
        type.textContent = reservation.lane_name
            ? reservation.lane_name
            : `${reservation.table_number}. asztal`;

        const date = document.createElement("td");
        date.textContent = formatDate(reservation.reservation_date);

        const time = document.createElement("td");
        time.textContent = `${formatTime(reservation.start_time)} - ${formatTime(reservation.end_time)}`;

        const guests = document.createElement("td");
        guests.textContent = `${reservation.guests} fő`;

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
    block.appendChild(table);

    return block;
}

function createUsersTable(users) {
    const block = createAdminBlock("Felhasználók");

    if (!users.length) {
        block.appendChild(createEmptyText("Nincs felhasználó."));
        return block;
    }

    const table = createTable();

    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");

    ["ID", "Név", "Email", "Szerepkör"].forEach(text => {
        const th = document.createElement("th");
        th.textContent = text;
        headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);

    const tbody = document.createElement("tbody");

    users.forEach(userItem => {
        const tr = document.createElement("tr");

        const id = document.createElement("td");
        id.textContent = userItem.id;

        const name = document.createElement("td");
        name.textContent = userItem.name;

        const email = document.createElement("td");
        email.textContent = userItem.email;

        const role = document.createElement("td");

        const roleBadge = document.createElement("span");
        roleBadge.className = userItem.role === "admin"
            ? "admin-role admin"
            : "admin-role user";

        roleBadge.textContent = userItem.role;

        role.appendChild(roleBadge);

        tr.append(id, name, email, role);
        tbody.appendChild(tr);
    });

    table.append(thead, tbody);
    block.appendChild(table);

    return block;
}

function createMenuTable(menuItems) {
    const block = createAdminBlock("Menüelemek");

    if (!menuItems.length) {
        block.appendChild(createEmptyText("Nincs menüelem."));
        return block;
    }

    const table = createTable();

    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");

    ["ID", "Név", "Ár", "Kategória", "Alkategória"].forEach(text => {
        const th = document.createElement("th");
        th.textContent = text;
        headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);

    const tbody = document.createElement("tbody");

    menuItems.forEach(item => {
        const tr = document.createElement("tr");

        const id = document.createElement("td");
        id.textContent = item.id;

        const name = document.createElement("td");
        name.textContent = item.name;

        const price = document.createElement("td");
        price.textContent = `${Number(item.price).toLocaleString("hu-HU")} Ft`;

        const category = document.createElement("td");
        category.textContent = item.category === "food" ? "Étel" : "Ital";

        const subcategory = document.createElement("td");
        subcategory.textContent = getSubcategoryLabel(item.subcategory);

        tr.append(id, name, price, category, subcategory);
        tbody.appendChild(tr);
    });

    table.append(thead, tbody);
    block.appendChild(table);

    return block;
}

function createEventsTable(events) {
    const block = createAdminBlock("Események");

    if (!events.length) {
        block.appendChild(createEmptyText("Nincs esemény."));
        return block;
    }

    const table = createTable();

    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");

    ["ID", "Név", "Dátum", "Időpont", "Szabad hely", "Kategória"].forEach(text => {
        const th = document.createElement("th");
        th.textContent = text;
        headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);

    const tbody = document.createElement("tbody");

    events.forEach(eventItem => {
        const tr = document.createElement("tr");

        const id = document.createElement("td");
        id.textContent = eventItem.id;

        const name = document.createElement("td");
        name.textContent = eventItem.name;

        const date = document.createElement("td");
        date.textContent = formatDate(eventItem.event_date);

        const time = document.createElement("td");
        time.textContent = `${formatTime(eventItem.start_time)} - ${formatTime(eventItem.end_time)}`;

        const slots = document.createElement("td");
        slots.textContent = eventItem.free_slots;

        const category = document.createElement("td");
        category.textContent = eventItem.category;

        tr.append(id, name, date, time, slots, category);
        tbody.appendChild(tr);
    });

    table.append(thead, tbody);
    block.appendChild(table);

    return block;
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

function createEmptyText(text) {
    const empty = document.createElement("p");
    empty.className = "admin-empty-text";
    empty.textContent = text;

    return empty;
}

function renderAdminError(container, message) {
    const section = document.createElement("section");
    section.id = "admin-section";
    section.className = "py-5";

    const innerContainer = document.createElement("div");
    innerContainer.className = "container";

    const card = document.createElement("div");
    card.className = "admin-error-card";

    const title = document.createElement("h2");
    title.textContent = "Admin oldal nem elérhető";

    const text = document.createElement("p");
    text.textContent = message;

    card.append(title, text);
    innerContainer.appendChild(card);
    section.appendChild(innerContainer);
    container.appendChild(section);
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