import db from '../config/db.js';
import fs from 'fs';
import path from 'path';

// create medical record
// from: Medical Records page -> Doctor adds new diagnosis
export const createMedicalRecord=async (req,res) => {
    try {
        const {patient_id,diagnosis,notes,record_date,record_type}=req.body;

        // validate requiring fields
        if(!patient_id || !diagnosis){
            return res.status(400).json({
                message:'Patient ID and diagnosis are required'
            });
        }

        // get doctor id from logged in user
        const [doctorRows]=await db.query(
            'select id from doctors where user_id = ?',[req.user.id]
        );
        if(doctorRows.length === 0){
          return res.status(404).json({ message: 'Doctor profile not found' });    
        }

        const doctorId=doctorRows[0].id;
        console.log("doctorId= doctorRows[0].id is",doctorId);

        // check patient exists
        const [patientRows]=await db.query(
            'select id from patients where id = ?',[patient_id]
        );
        if(patientRows[0].length === 0){
         return res.status(404).json({ message: 'Patient not found' });    
        }

        // insert medical record
        const [result]=await db.query(
            `insert into medical_records (patient_id, doctor_id, diagnosis, notes, record_date)
            values(?,?,?,?,?)
            `,[patient_id,doctorId,diagnosis,notes || null, record_date || new Date().toISOString().split('T')[0]]
        );

        res.status(201).json({
            message:'Medical record created successfully',
            record_id: result.insertId
        });
    } catch (error) {
    console.error('Create medical record error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });  
    } 
};

// get all medical records for a patient
// from: Medical Records page -> Diagnosis Timeline tab
// Shows diagnosis list with dates + status tags
export const getPatientMedicalRecords=async (req,res) => {
    try {
        const {patient_id}=req.params;

        // role based access check
        // Doctor can view any patients records
        // patient can only view own records
        if(req.user.role === 'patient'){
            const [patRows]=await db.query(
                'select id from patients where user_id = ?',[req.user.id]
            );
            if(patRows.length === 0 || patRows[0].id !== parseInt(patient_id)){
                return res.status(403).json({
                    message:'You can only view your own medical records'
                });
            }
        }

        // get all records with doctor info
        const [records]=await db.query(
            `select mr.id, mr.diagnosis, mr.notes, mr.record_date, mr.created_at,
            d.id as doctor_id, d.speciality, 
            u.full_name as doctor_name, u.profile_image as doctor_image
            from medical_records mr
            join doctors d on mr.doctor_id= d.id
            join users u on d.user_id= u.id
            where mr.patient_id = ?
            order by mr.record_date desc
            `,[patient_id]
        );

        // for each record, get its prescriptions and reports
        const recordsWithDetails=await Promise.all(
            records.map(async(record)=>{
                // get prescriptions for this record
                const [prescriptions]=await db.query(
                    `select id, medicine, dosage, duration, status from prescriptions where record_id = ?`,[record.id]
                );

                // get uploaded report files for this record
                const [reports]=await db.query(
                    `select id, file_name, file_url, file_size, file_type, uploaded_at
                    from medical_report_files where record_id = ?
                    order by uploaded_at desc
                    `,[record.id]
                );

                return {
                    ...record,
                    prescriptions,
                    reports
                };
            })
        );

        res.status(200).json({
            count: recordsWithDetails.length,
            records: recordsWithDetails
        });
    } catch (error) {
       console.error('Get records error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });  
    }  
};

// get single medical records by id
// from: Medical Records page ->clicking a record
// show full diagnosis details + prescriptions + files
export const getMedicalRecordById=async (req,res) => {
    try {
        const {id}=req.params;

        const [records]=await db.query(
            `select mr.id,mr.diagnosis,mr.notes, mr.record_date,mr.created_at,
            mr.patient_id,mr.doctor_id, d.speciality, du.full_name as doctor_name,
            du.profile_image as doctor_image,
            pu.full_name as patient_name,
            pat.blood_group, pat.dob
            from medical_records mr
            join doctors d on mr.doctor_id = d.id
            join users du on d.user_id= du.id
            join patients pat on mr.patient_id= pat.id
            join users pu on pat.user_id= pu.id
            where mr.id = ?
            `,[id]
        );

        if(records.length === 0){
       return res.status(404).json({ message: 'Medical record not found' });      
        }

        const record=records[0];
        console.log("get single medical record :",record);

        // get prescriptions
        const [prescriptions]=await db.query(
            `select id, medicine,dosage,duration,status from prescriptions where record_id = ?`,[id]
        );

        // get uploaded files
        const [reports]=await db.query(
            `select id,file_name,file_url,file_size,file_type,uploaded_at from
             medical_report_files where record_id = ? order by uploaded_at desc
            `,[id]
        );

        res.status(200).json({
            record:{
                ...record,
                prescriptions,
                reports
            }
        });
    } catch (error) {
     res.status(500).json({ message: 'Server error', error: error.message });   
    }  
};

// update medical record
// from: medical records page -> Doctor edits a record
export const updateMedicalRecord=async (req,res) => {
try {
    const {id}=req.params;
    const {diagnosis, notes,record_date}=req.body;

    // check record exists
    const [rows]=await db.query(
        `select * from medical_records where id = ?`,[id]
    );
    if(rows.length === 0){
    return res.status(404).json({ message: 'Record not found' });   
    }

    // only the doctor who created it can update
    const [docRows]=await db.query(
        `select id from doctors where user_id = ? `,[req.user.id]
    );
    if(docRows.length === 0 || docRows[0].id !== rows[0].doctor_id){
        return res.status(403).json({
            message:'Only the treating doctor can update this record'
        });
    }

    await db.query(`
    update medical_records set diagnosis = ?, notes = ?, record_date = ? where id = ? `,
    [diagnosis || rows[0].diagnosis, notes || rows[0].notes, record_date || rows[0].record_date, id]);

    res.status(200).json({message:'Medical records updated successfully'});
} catch (error) {
   res.status(500).json({ message: 'Server error', error: error.message });   
}    
};

// upload medical report file
// from: Medical Records page -> "Upload" button
// Shows file cards (pdf,jpg,docx) with size + date
export const uploadReportFile=async (req,res) => {
    try {

         console.log("BODY:",req.body);
        console.log("FILE:",req.file);

        const {record_id}=req.body;

        if(!req.file){
            return res.status(400).json({message:'No file uploaded'});
        }
        if(!record_id){
            return res.status(400).json({message:'Record ID is required'});
        }

        // check  record exists
        const [recordRows]=await db.query(`
            select id,patient_id from medical_records where id = ?
            `,[record_id]);
            if(recordRows.length === 0){
                // delete uploaded file if record not found
                fs.unlinkSync(req.file.path);
                return res.status(404).json({message:'Medical record not found'});
            }
            const fileUrl=`/uploads/medical-reports/${req.file.filename}`;
            // /uploads/medical-reports/3_171923984234.pdf
            //  This URL will be used by frontend to view or download the file.
            const fileSize = (req.file.size / 1024).toFixed(2) + ' KB';

            // Save file info to DB
            const [result]=await db.query(
                `insert into medical_report_files (record_id, file_name, file_url, file_size, file_type) values (?,?,?,?,?)`,
                [record_id,req.file.originalname,fileUrl,fileSize,req.file.mimetype]
            );

            res.status(201).json({
                message:'File uploaded successfully',
                file:{
                    id: result.insertId,
                    file_name: req.file.originalname,
                    file_url: fileUrl,
                    file_size: fileSize,
                    file_type: req.file.mimetype
                }
            });
    } catch (error) {
         console.error('File upload error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
    }
    
};

// delete uploaded report file
// from: Medical Records page -> delete file icon
export const deleteReportFile=async (req,res) => {
    try {
        const {file_id}=req.params;

        const [fileRows]=await db.query(
        `select * from medical_report_files where id = ?`,[file_id]
        );
        {/* 
fileRows = [
  {
    id: 5,
    record_id: 21,
    file_url: "/uploads/medical-reports/report1.pdf"
  }
]
*/}

        if(fileRows.length === 0){
            return res.status(404).json({ message:'File not found'});
        }

        const filePath= `.${fileRows[0].file_url}`;
        // filePath = "./uploads/medical-reports/report1.pdf"

        // delete from filesystem
        if(fs.existsSync(filePath)){
            fs.unlinkSync(filePath);
            {/* unlink → delete file
             Sync   → synchronous operation */}
             // Server waits until file is deleted.
        }

        // delete from DB
        await db.query(
            'delete from medical_report_files where id = ? ',[file_id]
        );
        res.status(200).json({
            message:'File deleted successfully'
        });
    } catch (error) {
       res.status(500).json({ message: 'Server error', error: error.message });    
    }
    
};

// get patient vitals
// from: Medical Records page -> Vitals tab
// this function retrieves the latest vital signs of a patient from the database
export const getPatientVitals=async (req,res) => {
    try {
        const {patient_id}=req.params;

        const [vitals]=await db.query(
        `select * from patient_vitals
         where patient_id = ? 
         order by recorded_at desc
          limit 10`,[patient_id]
        );
        res.status(200).json({vitals});
    } catch (error) {
     res.status(500).json({ message: 'Server error', error: error.message });    
    }  
};

{/*
    vitals = [
  {
    id: 1,
    patient_id: 5,
    blood_pressure: "120/80",
    heart_rate: 72,
    temperature: 36.8,
    recorded_at: "2026-03-05"
  },
  {
    id: 2,
    patient_id: 5,
    blood_pressure: "118/79",
    heart_rate: 70,
    temperature: 36.7,
    recorded_at: "2026-03-04"
  }
]
    */}

    // add patient vitals
    // from: Medical Records page -> Vitals tab -> Doctor adds
    export const addPatientVitals=async (req,res) => {
        try {
            const {patient_id,blood_pressure, heart_rate, temperature, weight, height,oxygen_level}=req.body;

            if(!patient_id){
                return res.status(400).json({message:'Patient ID is required'});
            }

            const [result]=await db.query(
                `insert into patient_vitals
                (patient_id, blood_pressure, heart_rate,temperature,weight, height,oxygen_level)
                values (?,?,?,?,?,?,?)
                `,[patient_id,blood_pressure,heart_rate,temperature,weight,height,oxygen_level]
            );

            res.status(201).json({
                message:'Vitals recorded successfully',
                vital_id: result.insertId
            })
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });   
        }
        
    };


