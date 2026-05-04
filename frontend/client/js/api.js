//ALL FETCH
const BASE_URL = "http://127.0.0.1:3000";

//REGISTRATION
export async function registerUser(data) {
    const res = await fetch(`${BASE_URL}/api/registration`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });

    return await res.json();
}

//LOGIN
export async function loginUser(data) {
    const res = await fetch(`${BASE_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });

    return await res.json();
}

//AUTHENTICATION TOKEN
export async function tokenAuthentication(token) {
    const res = await fetch(`${BASE_URL}/api/authToken`, {
        method: "GET",
        headers: { "Authorization": "Bearer " + token }
    });

    let data;

    try {
        data = await res.json();
    } catch {
        return {
            success: false,
            message: "Nem sikerült értelmezni a szerver válaszát."
        };
    }

    if (!res.ok) {
        return {
            success: false,
            message: data.message || 'Token ellenőrzés sikertelen!'
        };
    }

    return await data;
}

//USER PROFILE DATA
export async function userData() {
    const token = localStorage.getItem("token");

    const res = await fetch(`${BASE_URL}/api/profile`, {
        method: "GET",
        headers: { "Authorization": "Bearer " + token }
    });

    let data;

    try {
        data = await res.json();
    } catch {
        return {
            success: false,
            message: "Nem sikerült értelmezni a szerver válaszát."
        };
    }

    if (!res.ok) {
        return {
            success: false,
            message: data.message || 'Token ellenőrzés sikertelen!'
        };
    }

    return await data;
}

//ALL EVENTS
export async function fetchEvents() {
    try {
        const res = await fetch(`${BASE_URL}/api/allEvents`);
        const data = await res.json();

        return data.results;
    } catch (err) {
        console.error("Fetch hiba:", err);
        return [];
    }
}

//TOGGLE JOIN
export async function toggleJoin(eventId, token) {
    const res = await fetch(`${BASE_URL}/api/toggleJoin`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ event_id: eventId })
    });

    return await res.json();
}

//FETCH REVIEWS
export async function fetchReviews() {
    try {
        const res = await fetch(`${BASE_URL}/api/reviews`);
        const data = await res.json();

        return data.results || [];
    } catch (err) {
        console.error("Fetch hiba:", err);
        return [];
    }
}

//SUBMIT REVIEW
export async function submitReview(rating, comment, token) {
    try {
        const res = await fetch(`${BASE_URL}/api/reviews`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ rating, comment })
        });

        return await res.json();
    } catch (err) {
        console.error("Küldés hiba:", err);

        return {
            success: false,
            message: "Nem sikerült elküldeni a véleményt."
        };
    }
}

// FETCH MENU ITEMS
export async function fetchMenuItems() {
    try {
        const res = await fetch(`${BASE_URL}/api/menu`);
        const data = await res.json();

        if (!data.success) {
            console.error("Menu fetch failed:", data.message);
            return [];
        }

        return data.results || [];
    } catch (err) {
        console.error("Fetch menu error:", err);
        return [];
    }
}

// FETCH MENU FAVOURITES
export async function fetchMenuFavourites(token) {
    if (!token) return [];

    try {
        const res = await fetch(`${BASE_URL}/api/menu/favourites`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await res.json();

        if (!data.success) {
            console.error("Menu favourites fetch failed:", data.message);
            return [];
        }

        return data.results || [];
    } catch (err) {
        console.error("Fetch menu favourites error:", err);
        return [];
    }
}

// TOGGLE MENU FAVOURITE
export async function toggleMenuFavourite(menuItemId, token) {
    try {
        const res = await fetch(`${BASE_URL}/api/menu/favourites/toggle`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                menu_item_id: menuItemId
            })
        });

        return await res.json();
    } catch (err) {
        console.error("Toggle menu favourite error:", err);

        return {
            success: false,
            message: "Nem sikerült módosítani a kedvencet."
        };
    }
}

// FETCH AVAILABLE RESERVATION RESOURCES
export async function fetchAvailableReservationResources(type, date, time, guests, token) {
    try {
        const query = new URLSearchParams({
            type,
            date,
            time,
            guests
        });

        const res = await fetch(`${BASE_URL}/api/reservations/available?${query.toString()}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        return await res.json();
    } catch (err) {
        console.error("Fetch available reservation resources error:", err);

        return {
            success: false,
            message: "Nem sikerült lekérni a szabad helyeket.",
            results: []
        };
    }
}

// CREATE RESERVATION
export async function createReservation(reservationData, token) {
    try {
        const res = await fetch(`${BASE_URL}/api/reservations`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(reservationData)
        });

        return await res.json();
    } catch (err) {
        console.error("Create reservation error:", err);

        return {
            success: false,
            message: "Nem sikerült elküldeni a foglalást."
        };
    }
}

// UPDATE USER PROFILE
export async function updateUserProfile(name, token) {
    try {
        const res = await fetch(`${BASE_URL}/api/profile`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ name })
        });

        return await res.json();
    } catch (err) {
        console.error("Update profile error:", err);

        return {
            success: false,
            message: "Nem sikerült frissíteni a profilt."
        };
    }
}

// FETCH PROFILE RESERVATIONS
export async function fetchProfileReservations(token) {
    try {
        const res = await fetch(`${BASE_URL}/api/profile/reservations`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        return await res.json();
    } catch (err) {
        console.error("Fetch profile reservations error:", err);

        return {
            success: false,
            message: "Nem sikerült lekérni a foglalásokat.",
            lane_reservations: [],
            table_reservations: []
        };
    }
}

// ADMIN DASHBOARD
export async function fetchAdminDashboard(token) {
    try {
        const res = await fetch(`${BASE_URL}/api/admin/dashboard`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        return await res.json();
    } catch (err) {
        console.error("Fetch admin dashboard error:", err);

        return {
            success: false,
            message: "Nem sikerült lekérni az admin dashboard adatait."
        };
    }
}

// ADMIN USERS
export async function fetchAdminUsers(token) {
    try {
        const res = await fetch(`${BASE_URL}/api/admin/users`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        return await res.json();
    } catch (err) {
        console.error("Fetch admin users error:", err);

        return {
            success: false,
            message: "Nem sikerült lekérni a felhasználókat.",
            results: []
        };
    }
}

// ADMIN MENU
export async function fetchAdminMenuItems(token) {
    try {
        const res = await fetch(`${BASE_URL}/api/admin/menu`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        return await res.json();
    } catch (err) {
        console.error("Fetch admin menu error:", err);

        return {
            success: false,
            message: "Nem sikerült lekérni a menüelemeket.",
            results: []
        };
    }
}

// ADMIN EVENTS
export async function fetchAdminEvents(token) {
    try {
        const res = await fetch(`${BASE_URL}/api/admin/events`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        return await res.json();
    } catch (err) {
        console.error("Fetch admin events error:", err);

        return {
            success: false,
            message: "Nem sikerült lekérni az eseményeket.",
            results: []
        };
    }
}