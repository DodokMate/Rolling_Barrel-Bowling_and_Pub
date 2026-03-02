//Regex for registration form (backend)
function regFormValidate(req, res, next) {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        console.log("Hiányzó szükséges adatok!");
        return res.status(400).json({
            success: false,
            message: "Hiányzó szükséges adatok!"
        });
    }

    const nameRegex = /^[A-Za-zÁÉÍÓÖŐÚÜŰáéíóöőúüű-]+( [A-Za-zÁÉÍÓÖŐÚÜŰáéíóöőúüű-]+)*$/;
    const emailRegex = /^[a-z0-9._]+@[a-z0-9.-]+\.[a-z]{2,}$/;
    const passwordRegex = /^[^\s]{8,12}$/;

    if (!nameRegex.test(name) || name.length > 20) {
        console.log("Hibás név formátum!");
        return res.status(400).json({
            success: false,
            message: "Hibás név formátum!"
        });
    }

    if (!emailRegex.test(email)) {
        console.log("Hibás email formátum!");
        return res.status(400).json({
            success: false,
            message: "Hibás email formátum!"
        });
    }

    if (!passwordRegex.test(password)) {
        console.log("Nem megfelelő hosszúságú jelszó!");
        return res.status(400).json({
            success: false,
            message: "Nem megfelelő hosszúságú jelszó!"
        });
    }

    next();
}

module.exports = regFormValidate;