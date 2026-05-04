import { fetchReviews } from './api.js';

//LOAD REVIEWS
export async function loadReviews() {
    const reviews = await fetchReviews();
    renderReviews(reviews);
}

//RENDER REVIEWS
export function renderReviews(reviews) {
    const reviewsList = document.getElementById("reviews-list");
    if (!reviewsList) return;

    reviewsList.innerHTML = '';

    if (!reviews.length) {
        const emptyCol = document.createElement("div");
        emptyCol.className = "col-12";

        const emptyCard = document.createElement("div");
        emptyCard.className = "card review-card p-4 text-center justify-content-center";

        const emptyTitle = document.createElement("h5");
        emptyTitle.className = "mb-3";
        emptyTitle.textContent = "Még nincs értékelés";

        const emptyText = document.createElement("p");
        emptyText.className = "mb-0";
        emptyText.textContent = "Legyél te az első, aki elmondja a véleményét!";

        emptyCard.append(emptyTitle, emptyText);
        emptyCol.appendChild(emptyCard);
        reviewsList.appendChild(emptyCol);

        return;
    }

    reviews.forEach(review => {
        const reviewCol = document.createElement("div");
        reviewCol.className = "col-lg-4 col-md-6 col-sm-12";

        const card = document.createElement("div");
        card.className = "card review-card p-4";

        const header = document.createElement("div");
        header.className = "review-header";

        const avatar = document.createElement("div");
        avatar.className = "review-avatar";

        const firstName = getFirstName(review.user_name);

        avatar.textContent = firstName ? firstName.charAt(0).toUpperCase() : "U";

        const meta = document.createElement("div");
        meta.className = "review-meta";

        const name = document.createElement("h5");
        name.textContent = firstName || "Felhasználó";

        const date = document.createElement("small");
        date.textContent = formatReviewDate(review.created_at);

        meta.append(name, date);

        const stars = document.createElement("div");
        stars.className = "review-rating";

        for (let i = 1; i <= 5; i += 1) {
            const star = document.createElement("i");
            star.className = i <= Number(review.rating)
                ? "bi bi-star-fill"
                : "bi bi-star";
            stars.appendChild(star);
        }

        const content = document.createElement("p");
        content.className = "review-text mt-3 mb-0";
        content.textContent = review.comment || "Nincs további megjegyzés.";

        header.append(avatar, meta, stars);
        card.append(header, content);
        reviewCol.appendChild(card);
        reviewsList.appendChild(reviewCol);
    });
}

//FORMAT REVIEW DATE
export function formatReviewDate(dateString) {
    if (!dateString) return '';

    try {
        const date = new Date(dateString);

        return date.toLocaleDateString('hu-HU', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    } catch {
        return dateString;
    }
}

//FIRST NAME ONLY
export function getFirstName(fullName) {
    if (!fullName) return '';
    return fullName.trim().split(' ')[1];
}