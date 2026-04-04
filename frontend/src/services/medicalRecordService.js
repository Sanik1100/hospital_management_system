import API from "./api.js";

export const medicalRecordService= {
    // get all records for a patient
    getByPatient: (patient_id) =>
        API.get(`/medical-records/patient/${patient_id}`),

    // get single record
    getById: (id) =>
        API.get(`/medical-records/${id}`),

    // create new record (doctor only)
    create: (data) =>
        API.post('/medical-records', data),

    // Update record (doctor only)
    update: (id,data) =>
        API.put('/medical-records/${id}',data),

    // Upload report file
    uploadFile: (formData) =>
        API.post('/medical-records/upload/file', formData, {
            headers: {'Content-Type': 'multipart/form-data'}
        }),

        // delete report file
        deleteFile: (file_id) =>
            API.delete(`/medical-records/upload/file/${file_id}`),

        // get patient vitals
        getVitals: (patient_id) =>
            API.get(`/medical-records/vitals/${patient_id}`),

        // Add vitals (doctor only)
        addVitals: (data) =>
        API.post('/medical-records/vitals',data),
};

