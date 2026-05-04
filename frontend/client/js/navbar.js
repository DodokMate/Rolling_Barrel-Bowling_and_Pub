import { renderRegisterForm } from "./auth.js";
import { renderLoginForm } from "./auth.js";
import { renderProfilePage } from "./profile.js";

//Initialize the navbar with DOM
export function initNavbar() {
    const token = localStorage.getItem('token');

    const headerNavbar = document.getElementById("headerNavbar")

    const nav = document.createElement("nav");
    nav.id = "navbar";
    nav.className = "navbar navbar-expand-lg";

    const container = document.createElement("div");
    container.className = "container-fluid";

    const brand = document.createElement("a");
    brand.href = "#";
    brand.className = "navbar-brand d-flex align-items-center m-0";

    const logo = document.createElement("img");
    logo.src = "./assets/images/logo.png";
    logo.alt = "Rolling Barrel Logo";
    logo.className = "neon mb-2";
    logo.id = "logo";
    logo.style.height = "65px";
    logo.style.width = "auto";

    brand.appendChild(logo);

    const iconsWrap = document.createElement("div");
    iconsWrap.className = "d-flex align-items-center justify-content-center ms-auto order-lg-3 dropdown";

    const hamburgerBtn = document.createElement("button");
    hamburgerBtn.className = "navbar-toggler p-0";
    hamburgerBtn.id = "hamburgerBtn";
    hamburgerBtn.type = "button";

    const hamburgerIcon = document.createElement("span");
    hamburgerIcon.className = "bi bi-list";

    hamburgerBtn.appendChild(hamburgerIcon);

    const profileLink = document.createElement("a");
    profileLink.href = "#";
    profileLink.className = "nav-link";
    profileLink.id = "profileDropdown";
    profileLink.role = "button";
    profileLink.setAttribute("data-bs-toggle", "dropdown");
    profileLink.setAttribute("aria-expanded", "false");

    const profileIcon = document.createElement("span");
    profileIcon.id = "profileIcon";
    profileIcon.className = "bi bi-person-circle mx-1 navIcon";
    profileLink.appendChild(profileIcon);

    const dropdownMenu = document.createElement("ul");
    dropdownMenu.className = "dropdown-menu dropdown-menu-end dropdown-wide mt-3 p-2";

    if (!token) {
        const liReg = document.createElement("li");
        const aReg = document.createElement("a");
        aReg.href = "#";
        aReg.className = "dropdown-item";
        aReg.id = "regBtn";
        aReg.textContent = "Regisztráció";

        aReg.addEventListener("click", () => {
            localStorage.setItem("currentView", "logreg");
            location.reload();
        });

        liReg.appendChild(aReg);

        const liLogin = document.createElement("li");
        const aLogin = document.createElement("a");
        aLogin.href = "#";
        aLogin.className = "dropdown-item";
        aLogin.id = "logInBtn";
        aLogin.textContent = "Belépés";

        aLogin.addEventListener("click", () => {
            localStorage.setItem("currentView", "logreg");
            location.reload();
        });

        liLogin.appendChild(aLogin);

        dropdownMenu.append(liReg, liLogin);
    } else {
        const liProfile = document.createElement("li");

        const aProfile = document.createElement("a");
        aProfile.href = "#";
        aProfile.className = "dropdown-item d-flex align-items-center gap-2";
        aProfile.id = "profileBtn";

        const iconProfile = document.createElement("span");
        iconProfile.className = "bi bi-person";

        const textProfile = document.createTextNode("Profilom");

        aProfile.addEventListener("click", async () => {
            localStorage.setItem("currentView", "profile");

            document.getElementById("headerNavbar").classList.add("d-none");
            document.getElementById("header").classList.add("d-none");
            document.getElementById("main-content").classList.add("d-none");
            document.getElementById("profile-container").classList.remove("d-none");

            await renderProfilePage();
        });

        aProfile.append(iconProfile, textProfile)
        liProfile.appendChild(aProfile);

        const topLine = document.createElement("hr");
        topLine.className = "dropdown-divider";

        const liBooking = document.createElement("li");

        const aBooking = document.createElement("a");
        aBooking.href = "#";
        aBooking.className = "dropdown-item d-flex align-items-center gap-2";
        aBooking.id = "bookingBtn";

        const iconBooking = document.createElement("span");
        iconBooking.className = "bi bi-journal";

        const textBooking = document.createTextNode("Foglalásaim");

        aBooking.append(iconBooking, textBooking)
        liBooking.appendChild(aBooking);

        const liFavourites = document.createElement("li");

        const aFavourites = document.createElement("a");
        aFavourites.href = "#";
        aFavourites.className = "dropdown-item d-flex align-items-center gap-2";
        aFavourites.id = "favouritesBtn";

        const iconFavourites = document.createElement("span");
        iconFavourites.className = "bi bi-heart";

        const textFavourites = document.createTextNode("Kedvenceim");

        aFavourites.append(iconFavourites, textFavourites)
        liFavourites.appendChild(aFavourites);

        const liEvents = document.createElement("li");

        const aEvents = document.createElement("a");
        aEvents.href = "#";
        aEvents.className = "dropdown-item d-flex align-items-center gap-2";
        aEvents.id = "eventsBtn";

        const iconEvents = document.createElement("span");
        iconEvents.className = "bi bi-calendar3-event";

        const textEvents = document.createTextNode("Eseményeim");

        aEvents.append(iconEvents, textEvents)
        liEvents.appendChild(aEvents);

        const bottomLine = document.createElement("hr");
        bottomLine.className = "dropdown-divider";

        const liLogOut = document.createElement("li");

        const aLogOut = document.createElement("a");
        aLogOut.href = "#";
        aLogOut.className = "dropdown-item d-flex align-items-center gap-2";
        aLogOut.id = "logoutBtn";

        const iconLogOut = document.createElement("span");
        iconLogOut.className = "bi bi-box-arrow-right";

        const textLogOut = document.createTextNode("Kijelentkezés");

        aLogOut.append(iconLogOut, textLogOut)
        liLogOut.appendChild(aLogOut);

        dropdownMenu.append(liProfile, topLine, liBooking, liFavourites, liEvents, bottomLine, liLogOut);
    }

    iconsWrap.append(hamburgerBtn, profileLink, dropdownMenu);

    const collapse = document.createElement("div");
    collapse.className = "nav-menu";
    collapse.id = "navMenu";

    const ulNav = document.createElement("ul");
    ulNav.className = "navbar-nav d-flex m-auto";

    const links = [
        { text: "Főoldal", href: "#" },
        { text: "Rólunk", href: "#" },
        { text: "Foglalás", href: "#" },
        { text: "Menü", href: "#" },
        { text: "Események", href: "#" },
        { text: "Kapcsolat", href: "#" },
    ];

    links.forEach(link => {
        const li = document.createElement("li");
        li.className = "nav-item mx-2";

        const a = document.createElement("a");
        a.className = "nav-link px-2";
        a.href = link.href;
        a.textContent = link.text;

        li.appendChild(a);
        ulNav.appendChild(li);
    });

    collapse.appendChild(ulNav);

    container.append(brand, iconsWrap, collapse);
    nav.appendChild(container);
    headerNavbar.appendChild(nav);

    updateNavbarBackground();

    const navMenu = document.getElementById("navMenu");
    const navbar = document.getElementById("navbar");

    hamburgerBtn.addEventListener("click", () => {
        navMenu.classList.toggle("open");
        navbar.classList.toggle("menu-open");

        hamburgerIcon.classList.toggle("bi-list");
        hamburgerIcon.classList.toggle("bi-x-lg");

        if (navMenu.classList.contains("open")) {
            document.body.style.overflowY = "hidden";
        } else {
            document.body.style.overflowY = "auto";
        }
    });

    window.addEventListener("resize", () => {
        if (window.innerWidth >= 992) {
            navMenu.classList.remove("open");
            navbar.classList.remove("menu-open");
            hamburgerIcon.classList.add("bi-list");
            hamburgerIcon.classList.remove("bi-x-lg");
            document.body.style.overflowY = "auto";
        }
    });

    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", logout);
    }

    window.addEventListener("scroll", updateNavbarBackground);
    window.addEventListener("DOMContentLoaded", updateNavbarBackground);

}

//Registration modal
export function regAlert() {
    const regMsgModal = document.getElementById("regMsgModal");
    const Modal = new bootstrap.Modal(regMsgModal);
    Modal.show();

    setTimeout(() => {
        location.reload();
    }, 1.5 * 1000);
}

//Login modal
export function loginAlert() {
    const loginMsgModal = document.getElementById("loginMsgModal");
    const Modal = new bootstrap.Modal(loginMsgModal);
    Modal.show();

    setTimeout(() => {
        location.reload();
    }, 1.5 * 1000);
}

//Logout function
export function logout() {
    localStorage.removeItem("token");
    console.log(`[${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}] - Sikeres kijelentkezés!`);

    const logoutMsgModal = document.getElementById("logoutMsgModal");
    const Modal = new bootstrap.Modal(logoutMsgModal);
    Modal.show();

    setTimeout(() => {
        location.reload();
    }, 1.5 * 1000);
}

//Token countdown for automatic logout
export function tokenCountdown() {
    setTimeout(() => {
        systemLogout();
    }, 2 * 60 * 60 * 1000);
}

//Logout function if the system automatically logs the user out
function systemLogout() {
    localStorage.removeItem("token");
    console.log(`[${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}] - Lejárt a munkamenet, automatikus kijelentkezés...`);

    const sessionExpModal = document.getElementById("sessionExpModal");
    const Modal = new bootstrap.Modal(sessionExpModal);

    Modal.show();

    document.getElementById("sessionExpBtn").addEventListener("click", () => {
        Modal.hide();
        location.reload();
    });

    document.getElementById("sessionExpX").addEventListener("click", () => {
        Modal.hide();
        location.reload();
    });
}

//Adding a scroll effect to the navbar
function updateNavbarBackground() {
    const navbar = document.getElementById("navbar");

    if (window.scrollY > 10) {
        navbar.classList.add("scrolled");
    } else {
        navbar.classList.remove("scrolled");
    }
}