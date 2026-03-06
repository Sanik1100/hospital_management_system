import express from 'express';
import { addPatientVitals, createMedicalRecord, deleteReportFile, getMedicalRecordById, getPatientMedicalRecords, getPatientVitals, updateMedicalRecord, uploadReportFile } from "../controllers/medicalRecordController.js";
import {protect,restrictTo} from '../middleware/authMiddleware.js';
import upload from '../config/multer.js';

const router=express.Router();

// Doctor: create + update records
router.post('/', protect,restrictTo('doctor'),createMedicalRecord);
router.put('/:id',protect,restrictTo('doctor'),updateMedicalRecord);

// doctor + patient : view records
router.get('/patient/:patient_id',protect,getPatientMedicalRecords);
router.get('/:id',protect,getMedicalRecordById);

// file upload (doctor only)
router.post('/upload/file',protect,restrictTo('doctor'),upload.single('report'),uploadReportFile);  // report = form field name
router.delete('/upload/file/:file_id',protect,restrictTo('doctor'),deleteReportFile);

// Vitals
router.get('/vitals/:patient_id',protect,getPatientVitals);
router.post('/vitals',protect,restrictTo('doctor'),addPatientVitals);

export default router;