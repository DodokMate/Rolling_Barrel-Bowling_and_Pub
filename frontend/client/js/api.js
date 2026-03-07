//ALL FETCH
const BASE_URL = "http://127.0.0.1:3000";

//REGISTRATION
export async function registerUser(data){
    const res = await fetch(`${BASE_URL}/api/registration`, {
        method: "POST",
        headers: {"Content-Type" : "application/json"},
        body: JSON.stringify(data)
    });

    return await res.json();
}

//LOGIN
export async function loginUser(data){
    const res = await fetch(`${BASE_URL}/api/login`, {
        method: "POST",
        headers: {"Content-Type" : "application/json"},
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