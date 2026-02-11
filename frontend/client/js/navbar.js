//Initialize the navbar with DOM
export function initNavbar() {
    const token = localStorage.getItem('token');

    const header = document.getElementById("header")

    //nav
    const nav = document.createElement("nav");
    nav.id = "navbar";
    nav.className = "navbar navbar-expand-lg sticky-top";

    //<div class="container-fluid">
    const container = document.createElement("div");
    container.className = "container-fluid";

    //brand
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

    //hamburger button + icons
    const iconsWrap = document.createElement("div");
    iconsWrap.className = "d-flex align-items-center justify-content-center ms-auto order-lg-3 dropdown";

    //hamburger button
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

    //dark/light icons
    const darkIcon = document.createElement("span");
    darkIcon.id = "darkIcon";
    darkIcon.className = "bi bi-moon mx-2 navIcon d-none";

    const lightIcon = document.createElement("span");
    lightIcon.id = "lightIcon";
    lightIcon.className = "bi bi-sun mx-2 navIcon";

    //profile dropdown
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

    //---dropdown menu---
    const dropdownMenu = document.createElement("ul");
    dropdownMenu.className = "dropdown-menu dropdown-menu-end dropdown-wide mt-3 p-2";

    if (!token) {
        //dropdown menu before login
        //registration link
        const liReg = document.createElement("li");
        const aReg = document.createElement("a");
        aReg.href = "#";
        aReg.className = "dropdown-item";
        aReg.id = "regBtn";
        aReg.textContent = "Regisztráció";
        liReg.appendChild(aReg);

        //login link
        const liLogin = document.createElement("li");
        const aLogin = document.createElement("a");
        aLogin.href = "#";
        aLogin.className = "dropdown-item";
        aLogin.id = "logInBtn";
        aLogin.textContent = "Belépés";
        liLogin.appendChild(aLogin);

        dropdownMenu.append(liReg, liLogin);
    } else {
        //dropdown menu after login
        //profile link
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

        //top line
        const topLine = document.createElement("hr");
        topLine.className = "dropdown-divider";

        //booking link
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

        //favourites link
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

        //bottom line
        const bottomLine = document.createElement("hr");
        bottomLine.className = "dropdown-divider";

        //logout
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

        //Append all into dropdown menu
        dropdownMenu.append(liProfile, topLine, liBooking, liFavourites, bottomLine, liLogOut);
    }

    //append all icon
    iconsWrap.append(hamburgerBtn, darkIcon, lightIcon, profileLink, dropdownMenu);

    //nav links (collapse)
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

    //concatenation
    container.append(brand, iconsWrap, collapse);
    nav.appendChild(container);
    header.appendChild(nav);

    //logout event listener
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", logout);
    }
}