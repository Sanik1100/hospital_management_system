import API from "./api.js";

export const doctorService={

    // get all doctors with optional filters
    // params: {speciality, search}
    getAll: (params) =>
        API.get('/doctors', {params}),

    // get single doctor by id
    getById: (id) =>
        API.get(`/doctors/${id}`),

    // get all specialities for filter dropdown
    getSpecialities: ()=>
        API.get('/doctors/specialities'),

    // get logged in doctor's profile
    getMyProfile: () =>
        API.get('/doctors/my/profile'),

    // Update logged in doctor's profile
    updateMyProfile: (data) =>
        API.put('/doctors/my/profile',data),

    // get doctor dashboard stats
    getMyDashboard: () =>
        API.get('/doctors/my/dashboard'),
};