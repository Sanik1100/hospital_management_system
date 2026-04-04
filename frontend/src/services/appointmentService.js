import API from './api.js';

export const appointmentService= {
    // book appointment
    book:(data) =>
        API.post('/appointments',data),

    // get available slots
    getAvailableSlots: (doctor_id, date) =>
        API.get('/appointments/available-slots', {
            params: {doctor_id, date}
        }),

        // get patient appointments
        // params: {status, upcoming}
        getMyPatientAppointments: (params) =>
            API.get('/appointments/my/patient', {params}),

        // get doctor appointments
        // params: {status,date,upcoming}
        getMyDoctorAppointments: (params) =>
            API.get('/appointments/my/doctor', {params}),

        // get single appointment
        getById: (id) =>
            API.get(`/appointments/${id}`),

        // Update status (confirm/complete/cancel)
        updateStatus: (id,status) =>
            API.put(`/appointments/${id}/status`, {status}),

        // Reschedule appointment
        reschedule: (id,data) =>
            API.put(`/appointments/${id}/reschedule`, data),
};