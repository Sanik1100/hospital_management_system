import API from "./api.js";

export const adminService= {
    
    getOverview: () =>
        API.get('/admin/overview'),

    // Revenue Analysis
    getRevenue: (period = '1M') =>
        API.get('/admin/revenue', {params: {period}}),

    // Quick stats
    getStats: () =>
        API.get('/admin/stats'),

    // All doctors
    getAllDoctors: () =>
        API.get('/admin/doctors'),

    // All patients
    getAllPatients: (search) =>
        API.get('/admin/patients', {params: {search}}),

    // delete user
    deleteUser: (id) =>
        API.delete(`/admin/users/${id}`),

    // export revenue report
    exportRevenue: (period) =>
        API.get('/admin/export-revenue',{ params: {period}}),
};