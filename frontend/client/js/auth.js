import { registerUser } from "./api.js";
import { loginUser } from "./api.js";
import { tokenCountdown } from "./navbar.js";
import { regAlert } from "./navbar.js";
import { loginAlert } from "./navbar.js";
import { validateRegisterForm } from "./utils/formValidation.js";

//REGISTER AND LOGIN FORM
//REGISTRATION 
export function renderRegisterForm() {
    localStorage.setItem("currentView", "logreg");

    document.getElementById("headerNavbar").classList.add("d-none");
    document.getElementById("header").classList.add("d-none");
    document.getElementById("profile-container").classList.add("d-none");

    const authContainer = document.getElementById("auth-container");
    authContainer.classList.remove("d-none");
    authContainer.innerHTML = "";

    const backBtn = document.createElement("button");
    backBtn.className = "btn logreg-back-btn mt-3";
    backBtn.innerHTML = `<i class="bi bi-arrow-bar-left me-2"></i> Főoldal`;

    backBtn.addEventListener("click", () => {
        localStorage.setItem("currentView", "home");

        document.getElementById("headerNavbar").classList.remove("d-none");
        document.getElementById("header").classList.remove("d-none");
        document.getElementById("main-content").classList.remove("d-none");
        document.getElementById("profile-container").classList.add("d-none");

        authContainer.classList.add("d-none");
    });

    const row = document.createElement("div");
    row.className = "row auth-row";

    const colLeft = document.createElement("div");
    colLeft.className = "col-lg-5 col-md-5 col-sm-12 auth-left";

    const overlay = document.createElement("div");
    overlay.className = "auth-left-overlay";

    const neonTitle = document.createElement("h2");
    neonTitle.className = "neon-title";
    neonTitle.innerHTML = "A <span class='auth-neon-title'>NEON</span> PÁLYÁK <br> VILÁGA MÁR VÁR";

    const neonSubtitle = document.createElement("p");
    neonSubtitle.className = "neon-subtitle";
    neonSubtitle.innerHTML = "A fények ritmusa és a mozgás energiája körülölel, ahogy belépsz a neon világába. Itt minden gurítás egy új impulzus, minden pillanat egy villanásnyi élmény.";

    overlay.append(neonTitle, neonSubtitle, backBtn);
    colLeft.append(overlay);

    const colRight = document.createElement("div");
    colRight.className = "col-lg-7 col-md-7 col-sm-12 auth-right d-flex flex-column justify-content-center align-items-center";

    const card = document.createElement("div");
    card.className = "reg-card";

    const header = document.createElement("div");
    header.className = "auth-card-header";

    const title = document.createElement("h1");
    title.className = "auth-card-title";
    title.textContent = "Hozd létre saját fiókod";

    const subtitle = document.createElement("p");
    subtitle.className = "auth-card-subtitle";
    subtitle.textContent = "Regisztrálj fiókot, hogy igénybe vehesd a Rolling Barrel szolgáltatásait";

    header.append(title, subtitle);

    const form = document.createElement("form");
    form.id = "register-form";
    form.className = "auth-card-form";

    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.placeholder = "Felhasználónév";
    nameInput.className = "reg-input";
    nameInput.id = "regInput-name";

    const emailInput = document.createElement("input");
    emailInput.type = "email";
    emailInput.placeholder = "Email cím";
    emailInput.className = "reg-input";
    emailInput.id = "regInput-email";

    const passwordInput = document.createElement("input");
    passwordInput.type = "password";
    passwordInput.placeholder = "Jelszó";
    passwordInput.className = "reg-input";
    passwordInput.id = "regInput-password";

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const name = nameInput.value;
        const email = emailInput.value;
        const password = passwordInput.value;

        const validation = validateRegisterForm(name, email, password);
        if (!validation.success) {
            alert(validation.message);
            return;
        }

        const response = await registerUser({ name, email, password });

        if (response.success) {
            form.reset();
            localStorage.setItem("token", response.token);
            localStorage.setItem("currentView", "home");
            regAlert();
            tokenCountdown();
        } else {
            alert(response.message);
        }
    });

    [nameInput, emailInput, passwordInput].forEach(input => {
        const group = document.createElement("div");
        group.className = "auth-field-group";
        group.appendChild(input);
        form.appendChild(group);
    });

    const btn = document.createElement("button");
    btn.type = "submit";
    btn.className = "reg-btn";
    btn.textContent = "Regisztráció";

    const helper = document.createElement("div");
    helper.className = "helper";

    const helperText = document.createElement("p");
    helperText.className = "auth-helper";
    helperText.textContent = "Már van fiókod?";

    const goToLogin = document.createElement("button");
    goToLogin.type = "button";
    goToLogin.id = "go-to-login";
    goToLogin.textContent = "Belépés";

    goToLogin.addEventListener("click", () => {
        renderLoginForm();
    });

    helper.append(helperText, goToLogin);
    form.append(btn, helper);

    card.append(header, form);
    colRight.append(card);

    row.append(colLeft, colRight);
    authContainer.append(row);
}

//LOGIN
export function renderLoginForm() {
    localStorage.setItem("currentView", "logreg");

    document.getElementById("headerNavbar").classList.add("d-none");
    document.getElementById("header").classList.add("d-none");
    document.getElementById("profile-container").classList.add("d-none");

    const authContainer = document.getElementById("auth-container");
    authContainer.classList.remove("d-none");
    authContainer.innerHTML = "";

    const backBtn = document.createElement("button");
    backBtn.className = "btn logreg-back-btn mt-3";
    backBtn.innerHTML = `<i class="bi bi-arrow-bar-left me-2"></i> Főoldal`;

    backBtn.addEventListener("click", () => {
        localStorage.setItem("currentView", "home");

        document.getElementById("headerNavbar").classList.remove("d-none");
        document.getElementById("header").classList.remove("d-none");
        document.getElementById("main-content").classList.remove("d-none");
        document.getElementById("profile-container").classList.add("d-none");

        authContainer.classList.add("d-none");
    });

    const row = document.createElement("div");
    row.className = "row auth-row";

    const colLeft = document.createElement("div");
    colLeft.className = "col-lg-5 col-md-5 col-sm-12 auth-left";

    const overlay = document.createElement("div");
    overlay.className = "auth-left-overlay";

    const neonTitle = document.createElement("h2");
    neonTitle.className = "neon-title";
    neonTitle.innerHTML = "A <span class='auth-neon-title'>NEON</span> PÁLYÁK <br> VILÁGA MÁR VÁR";

    const neonSubtitle = document.createElement("p");
    neonSubtitle.className = "neon-subtitle";
    neonSubtitle.textContent = "A fények ritmusa és a mozgás energiája körülölel, ahogy belépsz a neon világába. Itt minden gurítás egy új impulzus, minden pillanat egy villanásnyi élmény.";

    overlay.append(neonTitle, neonSubtitle, backBtn);
    colLeft.append(overlay);

    const colRight = document.createElement("div");
    colRight.className = "col-lg-7 col-md-7 col-sm-12 auth-right d-flex flex-column justify-content-center align-items-center";

    const card = document.createElement("div");
    card.className = "login-card";

    const header = document.createElement("div");
    header.className = "auth-card-header";

    const title = document.createElement("h1");
    title.className = "auth-card-title";
    title.textContent = "Lépj be saját fiókodba";

    const subtitle = document.createElement("p");
    subtitle.className = "auth-card-subtitle";
    subtitle.textContent = "Foglalj pályákat, asztalokat, kedvenceket és még sok mást";

    header.append(title, subtitle);

    const form = document.createElement("form");
    form.id = "login-form";
    form.className = "auth-card-form";

    const emailInput = document.createElement("input");
    emailInput.type = "email";
    emailInput.placeholder = "Email cím";
    emailInput.className = "login-input";

    const passwordInput = document.createElement("input");
    passwordInput.type = "password";
    passwordInput.placeholder = "Jelszó";
    passwordInput.className = "login-input";

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const response = await loginUser({
            email: emailInput.value,
            password: passwordInput.value
        });

        if (response.success) {
            form.reset();
            localStorage.setItem("token", response.token);
            localStorage.setItem("currentView", "home");
            loginAlert();
            tokenCountdown();
        } else {
            alert(`Hiba történt: ${response.message}`);
        }
    });

    [emailInput, passwordInput].forEach(input => {
        const group = document.createElement("div");
        group.className = "auth-field-group";
        group.appendChild(input);
        form.appendChild(group);
    });

    const btn = document.createElement("button");
    btn.type = "submit";
    btn.className = "login-btn";
    btn.textContent = "Belépés";

    const helper = document.createElement("div");
    helper.className = "helper";

    const helperText = document.createElement("p");
    helperText.className = "auth-helper";
    helperText.textContent = "Nincs még fiókod?";

    const goToReg = document.createElement("button");
    goToReg.type = "button";
    goToReg.id = "go-to-reg";
    goToReg.textContent = "Regisztráció";

    goToReg.addEventListener("click", () => {
        renderRegisterForm();
    });

    helper.append(helperText, goToReg);
    form.append(btn, helper);

    card.append(header, form);
    colRight.append(card);

    row.append(colLeft, colRight);
    authContainer.append(row);
}