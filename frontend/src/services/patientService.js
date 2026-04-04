import API from "./api.js";

export const patientService= {
    // get logged in patients profile
    getMyProfile: () =>
        API.get('/patients/my/profile'),

    // Update logged in patients profile
    updateMyProfile: (data)=>
        API.put('/patients/my/profile',data),

    // Get patient dashboard stats
    getMyDashboard: () =>
API.get('/patients/my/dashboard'),
};