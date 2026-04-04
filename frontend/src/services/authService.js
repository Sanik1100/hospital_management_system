import API from "./api.js";


// authService is an object that groups all authentication related API calls in one place
export const authService={
    // Register new patient
    register: (data)=>
        API.post('/auth/register', data),

    // Login (patient/doctor/admin)
    login: (data)=>
        API.post('/auth/login', data),

    // get logged in user profile
    getMe: ()=>
        API.get('/auth/me'),

    // forgot password
    forgotPassword: (email)=>
        API.post('/auth/forgot-password', {email}),

    // reset password
    resetPassword: (data) =>
        API.post('/auth/reset-password', data),
};