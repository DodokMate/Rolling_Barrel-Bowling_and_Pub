//Main js file with the components
import { initNavbar, tokenCountdown } from './navbar.js';
import { userData, fetchEvents, toggleJoin, tokenAuthentication } from './api.js';
import { renderEvents, filterByCategory } from './events.js';

let allEvents = [];
let registeredEvents = [];
let currentFilter = 'all';

document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem("token");
    const res = await tokenAuthentication(token);

    if (token) {
        try {
            if (!res.success) {
                localStorage.removeItem("token");
                console.log('Érvénytelen vagy lejárt token, kijelentkeztetés...');
                return;
            } else {
                console.log('Érvényes token, felhasználó:', res.user);
                tokenCountdown();
            }
        } catch (err) {
            console.log('Hiba:', err);
            localStorage.removeItem('token');
        }
    }

    initNavbar();
    await loadEvents();

    function showLoginModal() {
        console.log(`[${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}] - Regisztráljon vagy jelentkezzen be fiókjába az eseményre való jelentkezéshez.`);

        const loginRequiredModal = document.getElementById("loginRequiredModal");
        const modal = new bootstrap.Modal(loginRequiredModal);

        modal.show();

        document.getElementById("loginRequiredModalX").addEventListener("click", () => {
            modal.hide();
        });
    }

    document.querySelectorAll(".filter-badge").forEach(badge => {
        badge.addEventListener("click", () => {
            const cat = badge.dataset.cat;
            currentFilter = cat;
            filterByCategory(cat, allEvents, registeredEvents);
        });
    });

    document.getElementById("reset-badges").addEventListener("click", () => {
        const cards = document.querySelectorAll(".event-card");
        cards.forEach(card => card.style.display = "flex");
    });

    document.addEventListener("click", async (e) => {
        const btn = e.target.closest(".event-join-btn");
        if (!btn) return;

        const eventId = Number(btn.dataset.eventId);
        const token = localStorage.getItem("token");

        if (!token) {
            showLoginModal();
            return;
        }

        const data = await toggleJoin(eventId, token);

        if (!data.success) {
            console.error("toggleJoin failed:", data.message);
            return;
        }

        if (data.action === "added") {
            registeredEvents.push(eventId);
        } else {
            registeredEvents = registeredEvents.filter(id => id !== eventId);
        }

        const event = allEvents.find(ev => Number(ev.id) === eventId);
        if (event && typeof data.free_slots === 'number') {
            event.free_slots = data.free_slots;
        }

        if (currentFilter === 'all') {
            renderEvents(allEvents, registeredEvents);
        } else {
            filterByCategory(currentFilter, allEvents, registeredEvents);
        }
    });


    const row = document.getElementById("events-row");
    const left = document.getElementById("events-left");
    const right = document.getElementById("events-right");

    function updateArrows() {
        const maxScroll = row.scrollWidth - row.clientWidth;

        if (row.scrollLeft <= 5) {
            left.style.opacity = "0";
            left.style.pointerEvents = "none";
        } else {
            left.style.opacity = "1";
            left.style.pointerEvents = "auto";
        }

        if (row.scrollLeft >= maxScroll - 5) {
            right.style.opacity = "0";
            right.style.pointerEvents = "none";
        } else {
            right.style.opacity = "1";
            right.style.pointerEvents = "auto";
        }
    }

    left.addEventListener("click", () => {
        row.scrollBy({ left: -350, behavior: "smooth" });
    });

    right.addEventListener("click", () => {
        row.scrollBy({ left: 350, behavior: "smooth" });
    });

    row.addEventListener("scroll", updateArrows);

    setTimeout(updateArrows, 300);

    const view = localStorage.getItem("currentView");

    if (view === "logreg") {
        document.getElementById("headerNavbar").classList.add("d-none");
        document.getElementById("header").classList.add("d-none");
        document.getElementById("main-content").classList.add("d-none");

        document.getElementById("profile-container").classList.add("d-none");

        import("./auth.js").then(module => {
            module.renderLoginForm();
        });

        document.body.classList.remove("preload");
        return;
    }

    if (view === "profile") {
        if (!token) {
            localStorage.setItem("currentView", "home");

            document.getElementById("headerNavbar").classList.remove("d-none");
            document.getElementById("header").classList.remove("d-none");
            document.getElementById("main-content").classList.remove("d-none");
            document.getElementById("auth-container").classList.add("d-none");
            document.getElementById("profile-container").classList.add("d-none");

            await loadEvents();

            document.body.classList.remove("preload");
            return;
        }

        if (!res.success) {
            localStorage.removeItem("token");
            localStorage.setItem("currentView", "home");

            document.getElementById("headerNavbar").classList.remove("d-none");
            document.getElementById("header").classList.remove("d-none");
            document.getElementById("main-content").classList.remove("d-none");
            document.getElementById("profile-container").classList.add("d-none");

            await loadEvents();

            document.body.classList.remove("preload");
            return;
        }

        document.getElementById("headerNavbar").classList.add("d-none");
        document.getElementById("header").classList.add("d-none");
        document.getElementById("main-content").classList.add("d-none");
        document.getElementById("auth-container").classList.add("d-none");
        document.getElementById("profile-container").classList.remove("d-none");

        import("./profile.js").then(module => {
            module.renderProfilePage();
        });
    }

    document.body.classList.remove("preload");
});

//LOAD EVENTS
export async function loadEvents() {
    const token = localStorage.getItem("token");

    if (token) {
        const user = await userData();
        registeredEvents = user.user.registered_events 
            ? JSON.parse(user.user.registered_events).map(Number)
            : [];
    } else {
        registeredEvents = [];
    }

    allEvents = await fetchEvents();
    renderEvents(allEvents, registeredEvents);
}