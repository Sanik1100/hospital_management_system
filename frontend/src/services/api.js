import axios from 'axios';

// Base URL pointing to your backend
const API=axios.create({
    baseURL: 'http://localhost:5000/api',
    headers:{
        'Content-Type': 'application/json',
    },
});

// Request Interceptor
// Automatically attach JWT token to every request
API.interceptors.request.use(
    (config)=>{
        const token= localStorage.getItem('token');
        if(token){
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor
// Handle token expiry globally
API.interceptors.response.use(
    (response) => response,
    (error) => {
        if(error.response?.status === 401){
            // Token expired or invalid -> logout
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default API;