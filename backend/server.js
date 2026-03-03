import express from 'express';
import cors from 'cors';
import db from './config/db.js';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import doctorRoutes from './routes/doctorRoutes.js'
import patientRoutes from './routes/patientRoutes.js'

dotenv.config();

const app=express();

// middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth',authRoutes);
app.use('/api/doctors',doctorRoutes);
app.use('/api/patients',patientRoutes);

// test route
app.get('/',(req,res)=>{
    res.json({message: 'HMS is running'});
});

// start the server
const PORT=process.env.PORT || 5000;
app.listen(PORT,()=>{
    console.log(`Server running on http://localhost:${PORT}`);
});
