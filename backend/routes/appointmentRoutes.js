import {  bookAppointment, getAllApointments, getAppointmentById, getAvailableSlots, getDoctorAppointments, getPatientAppointments, rescheduleAppointment, updateAppointmentStatus } from "../controllers/appointmentController.js";
import {protect,restrictTo} from '../middleware/authMiddleware.js'
import express from 'express'


const router=express.Router();

// public
// check available slots before booking
router.get('/available-slots',getAvailableSlots);

// patient routes
// book a new appointment
router.post('/',protect,restrictTo('patient'),bookAppointment);
// get all my appointments
router.get('/my/patient',protect,restrictTo('patient'),getPatientAppointments);
// reschdeule my appointment
router.put('/:id/reschedule',protect,restrictTo('patient'),rescheduleAppointment);

// doctor routes
// get all my appointments
router.get('/my/doctor',protect,restrictTo('doctor'),getDoctorAppointments);

// Shared (patient + doctor) 
// Get single appointment detail
router.get('/:id',protect,getAppointmentById);
// update appointment status
router.put('/:id/status',protect,updateAppointmentStatus);

// Admin routes
router.get('/',protect,restrictTo('admin'),getAllApointments);

export default router;


