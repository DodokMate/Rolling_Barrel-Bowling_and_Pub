//Main js file with the components
import { tokenAuthentication } from './api.js';
import { initNavbar, tokenCountdown } from './navbar.js';

document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem("token");

    if(token){
        try{
            const res = await tokenAuthentication(token);

            if (!res.success) {
                localStorage.removeItem("token");
                console.log('Érvénytelen vagy lejárt token, kijelentkeztetés...');
                return;
            } else { 
                console.log('Érvényes token, felhasználó:', res.user);
                tokenCountdown();
            }
        } catch (err) {
            console.log('Hiba:', err); 
            localStorage.removeItem('token');
        }
    }

    initNavbar();
});