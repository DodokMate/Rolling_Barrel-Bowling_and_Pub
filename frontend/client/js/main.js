//Main js file with the components
import { initNavbar, tokenCountdown } from './navbar.js';
import { userData, fetchEvents, toggleJoin, tokenAuthentication, fetchReviews, submitReview } from './api.js';
import { renderEvents, filterByCategory } from './events.js';
import { loadReviews } from './reviews.js';

let allEvents = [];
let registeredEvents = [];
let currentFilter = 'all';
let selectedRating = 0;

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
    await loadReviews();

    function showLoginModal() {
        console.log(`[${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}] - Regisztráljon vagy jelentkezzen be fiókjába az eseményre való jelentkezéshez.`);

        const loginRequiredModal = document.getElementById("loginRequiredModal");
        const modal = new bootstrap.Modal(loginRequiredModal);

        modal.show();

        document.getElementById("loginRequiredModalX").addEventListener("click", () => {
            modal.hide();
        });
    }

    function showLoginModalReview() {
        console.log(`[${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}] - Regisztráljon vagy jelentkezzen be fiókjába az értékelés leadásához.`);

        const loginRequiredModalReview = document.getElementById("loginRequiredModalReview");
        const modal = new bootstrap.Modal(loginRequiredModalReview);

        modal.show();

        document.getElementById("loginRequiredModalReviewX").addEventListener("click", () => {
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
        const reviewStar = e.target.closest(".star-btn");
        if (reviewStar) {
            const value = Number(reviewStar.dataset.value);
            updateReviewStars(value);
            return;
        }

        const reviewSubmit = e.target.closest("#review-submit-btn");
        if (reviewSubmit) {
            const token = localStorage.getItem("token");
            const reviewComment = document.getElementById("review-comment");
            const reviewText = document.getElementById("review-rating-text");

            if (!token) {
                if (reviewText) reviewText.textContent = 'Be kell jelentkezned a vélemény beküldéséhez.';
                showLoginModalReview();
                return;
            }

            if (!selectedRating) {
                if (reviewText) reviewText.textContent = 'Válassz legalább egy csillagot.';
                return;
            }

            const response = await submitReview(selectedRating, reviewComment.value.trim(), token);
            if (!response.success) {
                if (reviewText) reviewText.textContent = response.message || 'Nem sikerült elküldeni a véleményedet.';
                return;
            }

            reviewComment.value = '';
            updateReviewStars(0);
            if (reviewText) reviewText.textContent = 'Köszönjük az értékelésedet!';
            await loadReviews();
            return;
        }

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
            console.error("toggleJoin hiba:", data.message);
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
        document.getElementById("menu-container").classList.add("d-none");

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
            document.getElementById("menu-container").classList.add("d-none");

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
            document.getElementById("auth-container").classList.add("d-none");
            document.getElementById("profile-container").classList.add("d-none");
            document.getElementById("reservation-container").classList.add("d-none");
            document.getElementById("menu-container").classList.add("d-none");

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

    if (view === "reservation") {
        if (!token) {
            localStorage.setItem("currentView", "home");

            document.getElementById("headerNavbar").classList.remove("d-none");
            document.getElementById("header").classList.remove("d-none");
            document.getElementById("main-content").classList.remove("d-none");
            document.getElementById("auth-container").classList.add("d-none");
            document.getElementById("profile-container").classList.add("d-none");
            document.getElementById("reservation-container").classList.add("d-none");
            document.getElementById("menu-container").classList.add("d-none");

            document.body.classList.remove("preload");
            return;
        }

        document.getElementById("headerNavbar").classList.remove("d-none");
        document.getElementById("header").classList.add("d-none");
        document.getElementById("main-content").classList.add("d-none");

        document.getElementById("auth-container").classList.add("d-none");
        document.getElementById("profile-container").classList.add("d-none");
        document.getElementById("menu-container").classList.add("d-none");
        document.getElementById("reservation-container").classList.remove("d-none");

        import("./reservation.js").then(module => {
            module.renderReservationPage();
        });

        document.body.classList.remove("preload");
        return;
    }

    if (view === "menu") {
        document.getElementById("headerNavbar").classList.remove("d-none");
        document.getElementById("header").classList.add("d-none");
        document.getElementById("main-content").classList.add("d-none");
        document.getElementById("auth-container").classList.add("d-none");
        document.getElementById("profile-container").classList.add("d-none");
        document.getElementById("reservation-container").classList.add("d-none");
        document.getElementById("menu-container").classList.remove("d-none");

        import("./menu.js").then(module => {
            module.renderMenuPage();
        });

        document.body.classList.remove("preload");
        return;
    }

    document.body.classList.remove("preload");
});

const bookingCta = document.getElementById("booking-ctab");

if (bookingCta) {
    bookingCta.addEventListener("click", () => {
        localStorage.setItem("currentView", "reservation");
        location.reload();
    });
}

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

// UPDATE REVIEW STARS
export function updateReviewStars(rating) {
    selectedRating = rating;

    document.querySelectorAll("#review-stars .star-btn").forEach(button => {
        const value = Number(button.dataset.value);
        const icon = button.querySelector("i");

        if (icon) {
            icon.className = value <= rating
                ? "bi bi-star-fill"
                : "bi bi-star";
        }
    });

    const ratingText = document.getElementById("review-rating-text");

    if (ratingText) {
        ratingText.textContent = rating
            ? `${rating} / 5 csillag`
            : 'Válassz csillagot';
    }
}