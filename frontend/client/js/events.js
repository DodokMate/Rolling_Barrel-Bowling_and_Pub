export function renderEvents(events, registeredEvents) {
    const container = document.getElementById("events-row");
    container.innerHTML = "";

    events.forEach(ev => {
        const date = new Date(ev.event_date).toLocaleDateString("hu-HU");
        const start = ev.start_time.slice(0, 5);
        const end = ev.end_time.slice(0, 5);

        const card = document.createElement("div");
        card.classList.add("card", "event-card", "p-3", `event-card-${ev.category}`);

        const body = document.createElement("div");
        body.classList.add("card-body", "d-flex", "flex-column", "justify-content-between");

        const tags = document.createElement("div");
        tags.classList.add("event-tags", "mb-3");

        const badge = document.createElement("span");
        badge.classList.add("badge", `event-tag-${ev.category}`);
        badge.textContent = ev.category.toUpperCase();

        tags.appendChild(badge);

        const title = document.createElement("h5");
        title.classList.add("card-title");
        title.textContent = ev.title;

        const desc = document.createElement("p");
        desc.classList.add("card-text");
        desc.textContent = ev.description;

        const meta = document.createElement("div");
        meta.classList.add("event-meta", "mt-3");

        const dateP = document.createElement("p");
        dateP.innerHTML = `<strong>Dátum:</strong> ${date}`;

        const startP = document.createElement("p");
        startP.innerHTML = `<strong>Kezdés:</strong> ${start}`;

        const endP = document.createElement("p");
        endP.innerHTML = `<strong>Vége:</strong> ${end}`;

        const freeP = document.createElement("p");
        freeP.innerHTML = `<strong>Szabad helyek:</strong> ${ev.free_slots}`;

        meta.append(dateP, startP, endP, freeP);

        const btn = document.createElement("button");
        btn.classList.add("btn", "event-join-btn", "mt-3", `event-btn-${ev.category}`);
        const eventId = Number(ev.id);
        btn.dataset.eventId = eventId;

        if (registeredEvents.includes(eventId)) {
            btn.classList.add("joined");
            btn.textContent = "Visszavonás";
            btn.disabled = false;
        } else if (ev.free_slots <= 0) {
            btn.classList.remove("joined");
            btn.textContent = "Minden hely elfogyott";
            btn.disabled = true;
        } else {
            btn.classList.remove("joined");
            btn.textContent = "Ott leszek";
            btn.disabled = false;
        }

        body.append(tags, title, desc, meta, btn);
        card.append(body);
        container.append(card);
    });
}

export function filterByCategory(category, allEvents, registeredEvents) {
    let filtered = [];

    if (category === "all") {
        filtered = allEvents;
    } else {
        filtered = allEvents.filter(ev => ev.category === category);
    }

    renderEvents(filtered, registeredEvents);
}