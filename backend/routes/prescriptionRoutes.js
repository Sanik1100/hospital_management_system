import express from 'express'

import { addPrescription, deletePrescription, getActivePrescriptionsForPatient, getPrescriptionsByRecord, updatePrescriptionStatus } from "../controllers/prescriptionController.js";
import { protect, restrictTo } from "../middleware/authMiddleware.js";

const router=express.Router();

// Doctor: add + delete prescriptions
router.post('/',protect,restrictTo('doctor'),addPrescription);
router.delete('/:id',protect,restrictTo('doctor'),deletePrescription);

// doctor + Patient : view prescriptions
router.get('/record/:record_id',protect,getPrescriptionsByRecord);
router.get('/patient/:patient_id/active',protect,getActivePrescriptionsForPatient);

// doctor: update prescriptions status
router.put('/:id/status',protect, restrictTo('doctor'),updatePrescriptionStatus);

export default router;