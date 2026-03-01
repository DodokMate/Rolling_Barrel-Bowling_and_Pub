//Checking admin privileges
function isAdmin(req, res, next) {
    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Admin jogosultság szükséges!'
        });
    }
    next();
}

module.exports = isAdmin;