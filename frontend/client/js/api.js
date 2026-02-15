//ALL FETCH
const BASE_URL = "http://127.0.0.1:3000";

//REGISTRATION
export async function registerUser(data){
    const res = await fetch(`${BASE_URL}/api/registration`, {
        method: "POST",
        headers: {"Content-Type" : "application/json"},
        body: JSON.stringify(data)
    });

    return res.json();
}

//LOGIN
export async function loginUser(data){
    const res = await fetch(`${BASE_URL}/api/login`, {
        method: "POST",
        headers: {"Content-Type" : "application/json"},
        body: JSON.stringify(data)
    });

    return res.json();
}