//Regex for registration form (frontend)
export function validateRegisterForm(name, email, password) {

    if (!name || !email || !password) {
        console.log("Hiányzó szükséges adatok!");
        return{ success: false, message: "Hiányzó szükséges adatok!" };
    }

    const nameRegex = /^[A-Za-zÁÉÍÓÖŐÚÜŰáéíóöőúüű-]+( [A-Za-zÁÉÍÓÖŐÚÜŰáéíóöőúüű-]+)*$/;
    const emailRegex = /^[a-z0-9.]+@[a-z0-9.]+\.[a-z]{2,}$/;
    const passwordRegex = /^[^\s]{8,12}$/;

    if (name !== name.trim() || email !== email.trim() || password !== password.trim()) {
        console.log("A mezők elején és végén nem lehet szóköz!");
        return { success: false, message: "A mezők elején és végén nem lehet szóköz!" };
    }

    if (!nameRegex.test(name) || name.length > 20) {
        console.log("A név csak betűt, esetenként kötőjelet és szóközt tartalmazhat, nem lehet egynél több szóköz, max. 20 karakter hosszan!");
        return { success: false, message: "A név csak betűt, esetenként kötőjelet és szóközt tartalmazhat, nem lehet egynél több szóköz, max. 20 karakter hosszan!" };
    }

    if (!emailRegex.test(email)) {
        console.log("Az email formátuma hibás. Csak kisbetű, szám, pont engedélyezett!");
        return { success: false, message: "Az email formátuma hibás. Csak kisbetű, szám, pont engedélyezett!" };
    }

    if (!passwordRegex.test(password)) {
        console.log("A jelszónak 8–12 karakter hosszúnak kell lennie, szóköz nélkül!");
        return { success: false, message: "A jelszónak 8–12 karakter hosszúnak kell lennie, szóköz nélkül!" };
    }

    return { success: true };
}