require('dotenv').config();

//SETTINGS
const app = require('./app');
const PORT = process.env.PORT;

//RUN SERVER
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});