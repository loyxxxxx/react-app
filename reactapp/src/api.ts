import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5175/api', // Keep your existing URL here
    withCredentials: true,                 // Important: Keep this so cookies are sent
    xsrfCookieName: 'XSRF-TOKEN',          // Tell Axios to look for this cookie
    xsrfHeaderName: 'X-XSRF-TOKEN'         // Tell Axios to attach it to this header
});

export default api;