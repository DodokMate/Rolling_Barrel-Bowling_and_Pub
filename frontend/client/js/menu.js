import { fetchMenuItems, fetchMenuFavourites, toggleMenuFavourite } from './api.js';

let allMenuItems = [];
let favouriteMenuItems = [];
let currentMenuFilter = 'all';

export async function renderMenuPage() {
    const menuContainer = document.getElementById("menu-container");
    if (!menuContainer) return;

    menuContainer.innerHTML = '';
    menuContainer.classList.remove("d-none");

    const token = localStorage.getItem("token");

    allMenuItems = await fetchMenuItems();
    favouriteMenuItems = await fetchMenuFavourites(token);

    buildMenuLayout(menuContainer);
    renderMenuItems(allMenuItems);
}

function buildMenuLayout(container) {
    const section = document.createElement("section");
    section.id = "menu-section";
    section.className = "py-5";

    const innerContainer = document.createElement("div");
    innerContainer.className = "container";

    const title = document.createElement("h2");
    title.className = "main-section-title text-center text-md-start";

    const titleNormal = document.createElement("span");
    titleNormal.className = "no-glow";
    titleNormal.textContent = "Rolling ";

    const titleGlow = document.createElement("span");
    titleGlow.className = "glow-text";
    titleGlow.textContent = "Menü";

    title.append(titleNormal, titleGlow);

    const hr = document.createElement("hr");
    hr.className = "mb-4 mt-0 main-section-hr";

    const intro = document.createElement("p");
    intro.id = "menu-intro";
    intro.textContent = "Válogass neon hangulatú pub ételeink és frissítő italaink közül. Burgerek, pizzák, tészták, koktélok és alkoholmentes italok egy helyen.";

    const filterWrapper = document.createElement("div");
    filterWrapper.className = "menu-tags mt-4 mb-5";

    const filters = [
        { label: "Összes", value: "all" },
        { label: "Étel", value: "food" },
        { label: "Ital", value: "drink" },
        { label: "Burgerek", value: "burger" },
        { label: "Pizzák", value: "pizza" },
        { label: "Tészták", value: "pasta" },
        { label: "Alkoholos italok", value: "alcoholic" },
        { label: "Alkoholmentes italok", value: "non_alcoholic" }
    ];

    filters.forEach(filter => {
        const badge = document.createElement("span");
        badge.className = "badge menu-filter-badge";
        badge.dataset.filter = filter.value;
        badge.textContent = filter.label;

        if (filter.value === currentMenuFilter) {
            badge.classList.add("active");
        }

        badge.addEventListener("click", () => {
            currentMenuFilter = filter.value;
            updateActiveMenuBadge();
            filterMenuItems(filter.value);
        });

        filterWrapper.appendChild(badge);
    });

    const foodSection = document.createElement("div");
    foodSection.id = "menu-food-section";
    foodSection.className = "menu-category-section";

    const foodTitle = document.createElement("h3");
    foodTitle.className = "menu-category-title";
    foodTitle.textContent = "Kaják";

    const foodRow = document.createElement("div");
    foodRow.id = "menu-food-row";
    foodRow.className = "row g-4";

    foodSection.append(foodTitle, foodRow);

    const drinkSection = document.createElement("div");
    drinkSection.id = "menu-drink-section";
    drinkSection.className = "menu-category-section mt-5";

    const drinkTitle = document.createElement("h3");
    drinkTitle.className = "menu-category-title";
    drinkTitle.textContent = "Italok";

    const drinkRow = document.createElement("div");
    drinkRow.id = "menu-drink-row";
    drinkRow.className = "row g-4";

    drinkSection.append(drinkTitle, drinkRow);

    innerContainer.append(
        title,
        hr,
        intro,
        filterWrapper,
        foodSection,
        drinkSection
    );

    section.appendChild(innerContainer);
    container.appendChild(section);
}

function renderMenuItems(items) {
    const foodRow = document.getElementById("menu-food-row");
    const drinkRow = document.getElementById("menu-drink-row");
    const foodSection = document.getElementById("menu-food-section");
    const drinkSection = document.getElementById("menu-drink-section");

    if (!foodRow || !drinkRow || !foodSection || !drinkSection) return;

    foodRow.innerHTML = '';
    drinkRow.innerHTML = '';

    const foodItems = items.filter(item => item.category === 'food');
    const drinkItems = items.filter(item => item.category === 'drink');

    if (foodItems.length) {
        foodSection.classList.remove("d-none");

        foodItems.forEach(item => {
            foodRow.appendChild(createMenuCard(item));
        });
    } else {
        foodSection.classList.add("d-none");
    }

    if (drinkItems.length) {
        drinkSection.classList.remove("d-none");

        drinkItems.forEach(item => {
            drinkRow.appendChild(createMenuCard(item));
        });
    } else {
        drinkSection.classList.add("d-none");
    }

    if (!items.length) {
        renderEmptyMenuState(foodRow, foodSection, drinkSection);
    }
}

function createMenuCard(item) {
    const col = document.createElement("div");
    col.className = "col-lg-4 col-md-6 col-sm-12";

    const card = document.createElement("div");
    card.className = `card menu-card p-4 ${item.category === "food" ? "menu-card-food" : "menu-card-drink"}`;
    card.dataset.id = item.id;
    card.dataset.category = item.category;

    if (item.subcategory) {
        card.dataset.subcategory = item.subcategory;
    }

    const top = document.createElement("div");
    top.className = "menu-card-top";

    const leftSide = document.createElement("div");
    leftSide.className = "menu-card-left";

    const icon = document.createElement("div");
    icon.className = `menu-card-icon ${item.category === "food" ? "menu-icon-food" : "menu-icon-drink"}`;

    const iconElement = document.createElement("i");
    iconElement.className = getMenuIcon(item);

    icon.appendChild(iconElement);

    if (item.subcategory) {
        const badge = document.createElement("span");
        badge.className = "menu-card-badge";
        badge.textContent = getSubcategoryLabel(item.subcategory);

        leftSide.append(icon, badge);
    } else {
        leftSide.appendChild(icon);
    }

    const favouriteBtn = document.createElement("button");
    favouriteBtn.type = "button";
    favouriteBtn.className = "menu-favourite-btn";
    favouriteBtn.dataset.menuItemId = item.id;
    favouriteBtn.setAttribute("aria-label", "Kedvenc jelölése");

    const favouriteIcon = document.createElement("i");
    favouriteIcon.className = isFavourite(item.id)
        ? "bi bi-heart-fill"
        : "bi bi-heart";

    favouriteBtn.appendChild(favouriteIcon);

    if (isFavourite(item.id)) {
        favouriteBtn.classList.add("active");
    }

    top.append(leftSide, favouriteBtn);

    const name = document.createElement("h4");
    name.className = "menu-card-title";
    name.textContent = item.name;

    const description = document.createElement("p");
    description.className = "menu-card-description";
    description.textContent = item.description || "Nincs leírás ehhez a menüelemhez.";

    const bottom = document.createElement("div");
    bottom.className = "menu-card-bottom";

    const price = document.createElement("span");
    price.className = "menu-card-price";
    price.textContent = formatPrice(item.price);

    bottom.appendChild(price);

    card.append(top, name, description, bottom);
    col.appendChild(card);

    return col;
}

function filterMenuItems(filter) {
    if (filter === 'all') {
        renderMenuItems(allMenuItems);
        return;
    }

    if (filter === 'food' || filter === 'drink') {
        const filteredItems = allMenuItems.filter(item => item.category === filter);
        renderMenuItems(filteredItems);
        return;
    }

    const filteredItems = allMenuItems.filter(item => item.subcategory === filter);
    renderMenuItems(filteredItems);
}

function updateActiveMenuBadge() {
    document.querySelectorAll(".menu-filter-badge").forEach(badge => {
        if (badge.dataset.filter === currentMenuFilter) {
            badge.classList.add("active");
        } else {
            badge.classList.remove("active");
        }
    });
}

function renderEmptyMenuState(foodRow, foodSection, drinkSection) {
    foodSection.classList.remove("d-none");
    drinkSection.classList.add("d-none");

    const emptyCol = document.createElement("div");
    emptyCol.className = "col-12";

    const emptyCard = document.createElement("div");
    emptyCard.className = "card menu-card p-4 text-center";

    const emptyTitle = document.createElement("h4");
    emptyTitle.className = "menu-card-title";
    emptyTitle.textContent = "Nincs találat";

    const emptyText = document.createElement("p");
    emptyText.className = "menu-card-description mb-0";
    emptyText.textContent = "Ebben a kategóriában jelenleg nincs megjeleníthető menüelem.";

    emptyCard.append(emptyTitle, emptyText);
    emptyCol.appendChild(emptyCard);
    foodRow.appendChild(emptyCol);
}

function getSubcategoryLabel(subcategory) {
    const labels = {
        burger: "Burger",
        pizza: "Pizza",
        pasta: "Tészta",
        alcoholic: "Alkoholos",
        non_alcoholic: "Alkoholmentes"
    };

    return labels[subcategory] || "Menü";
}

function getMenuIcon(item) {
    const icons = {
        food: "bi bi-fork-knife",
        drink: "bi bi-cup-straw"
    };

    return icons[item.category] || "bi bi-menu-button-wide";
}

function formatPrice(price) {
    const numberPrice = Number(price);

    if (Number.isNaN(numberPrice)) {
        return `${price} Ft`;
    }

    return `${numberPrice.toLocaleString('hu-HU')} Ft`;
}

function isFavourite(menuItemId) {
    return favouriteMenuItems.includes(Number(menuItemId));
}

function updateFavouriteButton(button, isActive) {
    const icon = button.querySelector("i");

    if (!icon) return;

    if (isActive) {
        button.classList.add("active");
        icon.className = "bi bi-heart-fill";
    } else {
        button.classList.remove("active");
        icon.className = "bi bi-heart";
    }
}

document.addEventListener("click", async (e) => {
    const favouriteBtn = e.target.closest(".menu-favourite-btn");
    if (!favouriteBtn) return;

    const token = localStorage.getItem("token");

    if (!token) {
        const loginRequiredModal = document.getElementById("loginRequiredModal");

        if (loginRequiredModal) {
            const modalText = loginRequiredModal.querySelector("p");

            if (modalText) {
                modalText.textContent = "A kedvencek használatához előbb be kell jelentkezned.";
            }

            const modal = new bootstrap.Modal(loginRequiredModal);
            modal.show();
        }

        return;
    }

    const menuItemId = Number(favouriteBtn.dataset.menuItemId);
    const response = await toggleMenuFavourite(menuItemId, token);

    if (!response.success) {
        console.error(response.message || "Nem sikerült módosítani a kedvencet.");
        return;
    }

    favouriteMenuItems = response.results || [];

    const active = favouriteMenuItems.includes(menuItemId);
    updateFavouriteButton(favouriteBtn, active);
});