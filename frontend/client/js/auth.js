//Register and login form
//Registration 
export function renderRegisterForm() {
    const main = document.getElementById("main-content");
    main.innerHTML = "";

    const wrapper = document.createElement("div");
    wrapper.className = "auth-page";

    const card = document.createElement("div");
    card.className = "reg-card";

    const header = document.createElement("div");
    header.className = "auth-card-header";

    const title = document.createElement("h1");
    title.className = "auth-card-title";
    title.textContent = "Hozd létre saját fiókod";

    const subtitle = document.createElement("p");
    subtitle.className = "auth-card-subtitle";
    subtitle.textContent = "Regisztrálj fiókot, hogy igénybe vehesd a Rolling Barrel - Bowling & Pub szolgáltatásait";

    header.append(title, subtitle);

    const form = document.createElement("form");
    form.id = "register-form";
    form.className = "auth-card-form";

    const fields = [
        { type: "text", placeholder: "Felhasználónév" },
        { type: "email", placeholder: "Email cím" },
        { type: "password", placeholder: "Jelszó" }
    ];

    fields.forEach(f => {
        const group = document.createElement("div");
        group.className = "auth-field-group";

        const input = document.createElement("input");
        input.type = f.type;
        input.placeholder = f.placeholder;
        input.className = "reg-input";

        group.appendChild(input);
        form.appendChild(group);
    });

    const btn = document.createElement("button");
    btn.type = "submit";
    btn.className = "reg-btn";
    btn.textContent = "Regisztráció";

    const helper = document.createElement("p");
    helper.className = "auth-helper";
    helper.innerHTML = `Már van fiókod? <button type="button" class="reg-link" id="go-to-login">Belépés</button>`;

    form.append(btn, helper);
    card.append(header, form);
    wrapper.append(card);
    main.append(wrapper);
}

//Login
export function renderLoginForm() {
    const main = document.getElementById("main-content");
    main.innerHTML = "";

    const wrapper = document.createElement("div");
    wrapper.className = "auth-page";

    const card = document.createElement("div");
    card.className = "login-card";

    const header = document.createElement("div");
    header.className = "auth-card-header";

    const title = document.createElement("h1");
    title.className = "auth-card-title";
    title.textContent = "Lépj be saját fiókodba";

    const subtitle = document.createElement("p");
    subtitle.className = "auth-card-subtitle";
    subtitle.textContent = "Foglalj pályákat, asztalokat, tekintsd meg kedvencid, és élvezd a kínálatot";

    header.append(title, subtitle);

    const form = document.createElement("form");
    form.id = "login-form";
    form.className = "auth-card-form";

    const fields = [
        { type: "email", placeholder: "Email cím" },
        { type: "password", placeholder: "Jelszó" }
    ];

    fields.forEach(f => {
        const group = document.createElement("div");
        group.className = "auth-field-group";

        const input = document.createElement("input");
        input.type = f.type;
        input.placeholder = f.placeholder;
        input.className = "login-input";

        group.appendChild(input);
        form.appendChild(group);
    });

    const btn = document.createElement("button");
    btn.type = "submit";
    btn.className = "login-btn";
    btn.textContent = "Belépés";

    const helper = document.createElement("p");
    helper.className = "auth-helper";
    helper.innerHTML = `Még nincs fiókod? <button type="button" class="login-link" id="go-to-reg">Regisztráció</button>`;

    form.append(btn, helper);
    card.append(header, form);
    wrapper.append(card);
    main.append(wrapper);
}