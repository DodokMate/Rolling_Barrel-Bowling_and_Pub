import { renderRegisterForm } from "./auth.js";
import { renderLoginForm } from "./auth.js";

//Initialize the navbar with DOM
export function initNavbar() {
    const token = localStorage.getItem('token');

    const header = document.getElementById("header")

    const nav = document.createElement("nav");
    nav.id = "navbar";
    nav.className = "navbar navbar-expand-lg sticky-top";

    const container = document.createElement("div");
    container.className = "container-fluid";

    const brand = document.createElement("a");
    brand.href = "#";
    brand.className = "navbar-brand d-flex align-items-center m-0";
    brand.innerHTML = "Rolling Barrel <br> Bowling & Pub";

    const logo = document.createElement("img"); 
    logo.src = "./assets/images/logo.png";
    logo.alt = "Rolling Barrel Logo";
    logo.className = "neon mb-2";
    logo.style.height = "80px";
    logo.style.width = "auto";

    brand.appendChild(logo);

    const iconsWrap = document.createElement("div");
    iconsWrap.className = "d-flex align-items-center justify-content-center ms-auto order-lg-3 dropdown";

    const hamburgerBtn = document.createElement("button");
    hamburgerBtn.className = "navbar-toggler p-0";
    hamburgerBtn.id = "hamburgerBtn";
    hamburgerBtn.type = "button";
    hamburgerBtn.setAttribute("data-bs-toggle", "collapse");
    hamburgerBtn.setAttribute("data-bs-target", "#navbarNav");

    const hamburgerIcon = document.createElement("span");
    hamburgerIcon.className = "bi bi-list";

    hamburgerBtn.addEventListener("click", () => { 
        hamburgerIcon.classList.toggle("bi-list"); 
        hamburgerIcon.classList.toggle("bi-x-lg"); 
    });

    hamburgerBtn.appendChild(hamburgerIcon);

    const darkIcon = document.createElement("span");
    darkIcon.id = "darkIcon";
    darkIcon.className = "bi bi-moon mx-2 navIcon d-none";

    const lightIcon = document.createElement("span");
    lightIcon.id = "lightIcon";
    lightIcon.className = "bi bi-sun mx-2 navIcon";

    const profileLink = document.createElement("a");
    profileLink.href = "#";
    profileLink.className = "nav-link";
    profileLink.id = "profileDropdown";
    profileLink.role = "button";
    profileLink.setAttribute("data-bs-toggle", "dropdown");
    profileLink.setAttribute("aria-expanded", "false");

    const profileIcon = document.createElement("span");
    profileIcon.id = "profileIcon";
    profileIcon.className = "bi bi-person-circle ms-1 navIcon";
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
            renderRegisterForm();
        });

        liReg.appendChild(aReg);

        const liLogin = document.createElement("li");
        const aLogin = document.createElement("a");
        aLogin.href = "#";
        aLogin.className = "dropdown-item";
        aLogin.id = "logInBtn";
        aLogin.textContent = "Belépés";

        aLogin.addEventListener("click", () => {
            renderLoginForm();
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

    iconsWrap.append(hamburgerBtn, darkIcon, lightIcon, profileLink, dropdownMenu);

    const collapse = document.createElement("div");
    collapse.className = "collapse navbar-collapse order-lg-1";
    collapse.id = "navbarNav";

    const ulNav = document.createElement("ul");
    ulNav.className = "navbar-nav d-flex m-auto";

    const links = [
        { text: "Főoldal", href: "#" },
        { text: "Foglalás", href: "#" },
        { text: "Menü", href: "#" },
        { text: "Események", href: "#" },
        { text: "Rólunk", href: "#" },
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
    header.appendChild(nav);

    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", logout);
    }
}

//Registration modal
export function regAlert(){
    const regMsgModal = document.getElementById("regMsgModal");
    const Modal = new bootstrap.Modal(regMsgModal);
    Modal.show();
    
    setTimeout(() => {
        location.reload();
    }, 3*1000);
}

//Login modal
export function loginAlert(){
    const loginMsgModal = document.getElementById("loginMsgModal");
    const Modal = new bootstrap.Modal(loginMsgModal);
    Modal.show();
    
    setTimeout(() => {
        location.reload();
    }, 3*1000);
}

//Logout function
function logout() {
    localStorage.removeItem("token");

    const logoutMsgModal = document.getElementById("logoutMsgModal");
    const Modal = new bootstrap.Modal(logoutMsgModal);
    Modal.show();

    setTimeout(() => {
        location.reload();
    }, 3*1000);
}

//Token countdown for automatic logout
export function tokenCountdown(){
    setTimeout(() => {
        systemLogout();
    }, 2*60*60*1000);
}

//Logout function if the system automatically logs the user out
function systemLogout(){
    localStorage.removeItem("token");

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