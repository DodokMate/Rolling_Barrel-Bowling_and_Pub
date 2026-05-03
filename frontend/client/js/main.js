//Main js file with the components
import { tokenAuthentication } from './api.js';
import { initNavbar, tokenCountdown } from './navbar.js';

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