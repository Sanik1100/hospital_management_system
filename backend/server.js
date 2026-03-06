import express from 'express';
import cors from 'cors';
import db from './config/db.js';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import doctorRoutes from './routes/doctorRoutes.js'
import patientRoutes from './routes/patientRoutes.js'
import appointmentRoutes from './routes/appointmentRoutes.js'
import medicalRecordRoutes from './routes/medicalRecordRoutes.js'
import prescriptionRoutes from './routes/prescriptionRoutes.js'

dotenv.config();

// needed for __dirname in ES modules
const __filename=fileURLToPath(import.meta.url);
const __dirname=path.dirname(__filename);

const app=express();

// middleware
app.use(cors());
app.use(express.json());

// Serve uploaded files as static 
app.use('/uploads',express.static(path.join(__dirname,'uploads')));

// Routes
app.use('/api/auth',authRoutes);
app.use('/api/doctors',doctorRoutes);
app.use('/api/patients',patientRoutes);
app.use('/api/appointments',appointmentRoutes);
app.use('/api/medical-records',medicalRecordRoutes);
app.use('/api/prescriptions',prescriptionRoutes);

// test route
app.get('/',(req,res)=>{
    res.json({message: 'HMS is running'});
});

// start the server
const PORT=process.env.PORT || 5000;
app.listen(PORT,()=>{
    console.log(`Server running on http://localhost:${PORT}`);
});
