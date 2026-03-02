require('dotenv').config();

//SETTINGS
const app = require('./app');
const PORT = process.env.PORT;

//RUN SERVER
app.listen(PORT, () => {
    console.log(`Server running on http://127.0.0.1:${PORT}`);
});