

import db from "../config/db.js";


// get all doctors (with search + filters)
// used by find Doctor page of frontend
export const getAllDoctors=async (req,res) => {
    try {
        const {speciality,search,available_today}=req.query;
        // example of request is GET /api/doctors?specialty=Cardiologist&search=ram

        let query=`
        select
        d.id, d.speciality,d.experience_years,d.consultation_fee,d.bio,d.available_days,d.available_time,
        u.full_name, u.email,u.phone,u.profile_image 
        from doctors d 
        join users u 
        on d.user_id=u.id 
        where 1=1 
        `;
        const params=[];

        // filter by speciality
        if(speciality && speciality !=='All Specialists'){
            query += ' AND d.speciality = ?';
            params.push(speciality);
            // example: GET /api/doctors?specialty=Dentist
            // then sql becomes AND d.specialty = 'Dentist'

        }

        // search by name or speciality
        if(search){
            query += ' AND (u.full_name like ? or d.speciality like ?)';
            params.push(`%${search}%`, `%${search}%`);
        }

        const [doctors]=await db.query(query,params);  // runs the sql and returns doctor data

        res.status(200).json({
            message:'Doctors fetched successfully',
            count: doctors.length,
            doctors
        });
    } catch (error) {
        res.status(500).json({message:'Server error', error:error.message});  
    }
    
};

// get a single doctor by id
export const getDoctorById=async (req,res) => {
    try {
        const {id}=req.params;

        const [doctors]=await db.query(
            `
            select
            d.id, d.speciality, d.experience_years,
            d.consultation_fee, d.bio, d.available_days,
            d.available_time,
            u.id as user_id, u.full_name, u.email, u.phone, u.profile_image
            from doctors d
            join users u
            on d.user_id=u.id
            where d.id= ?
            `, [id]
        );

        if(doctors.length === 0){
            return res.status(404).json({ message: 'Doctor not found' }); 
        }

        res.status(200).json({ doctor: doctors[0]});
    } catch (error) {
     res.status(500).json({ message: 'Server error', error: error.message });    
    } 
};

// get doctor's own profile
// used by: Doctor Dashboard (logged in doctor)
export const getMyDoctorProfile=async (req,res) => {
    try {
        const [doctors]=await db.query(
            `
            select
            d.id, d.speciality, d.experience_years,d.consultation_fee,
            d.bio,d.available_days,d.available_time,
            u.full_name, u.email, u.phone, u.profile_image
            from doctors d
            join users u
            on d.user_id=u.id
            where d.user_id= ?
            `,[req.user.id]
        );

        if (doctors.length === 0) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }
    res.status(200).json({doctor: doctors[0]});

    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });   
    }    
};

// update doctor profile
// used by: Doctor dashboard settings
export const updateDoctorProfile=async (req,res) => {
    try {
        const {
            speciality,experience_years,
            consultation_fee, bio,
            available_days, available_time}=req.body;

            await db.query(`
                update doctors set
                speciality = ?,
                experience_years= ?,
                consultation_fee= ?,
                bio= ?,
                available_days= ?,
                available_time= ?
                where user_id= ?
                `,[speciality,experience_years,consultation_fee,bio,available_days,available_time,req.user.id]
            );
            res.status(200).json({ message: 'Doctor profile updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }  
};

// get doctor dashboard stats
// used by: Doctor Dashboard (total appointments, earnings)
export const getDoctorDashboardStats=async (req,res) => {
    try {
        // get doctor id from user id
        const [doctorRows]=await db.query(
            'select id from doctors where user_id= ?',[req.user.id]
        );
        if(doctorRows.length === 0){
            return res.status(404).json({message:'Doctor not found'});
        }
        const doctorId= doctorRows[0].id;
        console.log("the doctorId=doctorRows[0].id= ",doctorId);

        // total appointments
        const [totalAppts]=await db.query(
            'select count(*) as total from appointments where doctor_id= ?',[doctorId]
        );

        // today's appointments
        const [todayAppts]=await db.query(
            `SELECT COUNT(*) AS total FROM appointments 
       WHERE doctor_id = ? AND appt_date = CURDATE()`,[doctorId]
        );

        // total earnings
        const [earnings]=await db.query(
            `select coalesce(sum(i.total), 0) as total_earnings 
            from invoices i
            join appointments a
            on i.appointment_id=a.id
            where a.doctor_id= ? and 
            i.status='paid'
            `,[doctorId]
        );
        {/*
This SQL query calculates the total amount of money earned by 
a specific doctor from their successfully paid appointments.
            */}

            // monthly average earnings
            const [monthlyAvg]=await db.query(
                `
        SELECT COALESCE(AVG(monthly_total), 0) AS monthly_avg
        FROM (
        SELECT SUM(i.total) AS monthly_total
        FROM invoices i
        JOIN appointments a
         ON i.appointment_id = a.id
        WHERE a.doctor_id = ? AND i.status = 'paid'
        GROUP BY MONTH(i.paid_at), YEAR(i.paid_at)
      ) AS monthly
    `, [doctorId]
            );
    {/* The database first looks at all paid invoices for the doctor and 
        bundles them into "buckets" based on the month and year they were
         paid. 
         Result: You get a list of totals, like: Jan 2024: $5,000, Feb 2024: $4,000, March 2024: $6,000.
        The database then takes that list of monthly totals ($5k, $4k, $6k) and calculates the mean average ($5,000).
         */}

         // upcoming appointments with patient info
         const [upcoming]=await db.query(`
            select a.id, a.appt_date,a.appt_time,a.type,a.status,
            u.full_name as patient_name, u.profile_image 
            from appointments a
            join patients p
            on a.patient_id= p.id
            join users u 
            on p.user_id= u.id
            where a.doctor_id= ?
            and a.appt_date >= curdate()
            and a.status not in('cancelled','completed')
            order by a.appt_date asc, a.appt_time asc
            limit 5 
            `,[doctorId]);

            // recent patients
            const [recentPatients]=await db.query(
                `select
                u.full_name, u.profile_image,
                mr.diagnosis, a.status,
                max(a.appt_date) as last_visit,
                coalesce(sum(i.total),0) as total_spent
                from appointments a
                join patients p 
                on a.patient_id= p.id
                join users u
                on p.user_id= u.id
                left join  medical_records mr 
                on mr.patient_id=p.id
                and mr.doctor_id= ?
                left join invoices i
                on i.appointment_id=a.id
                where a.doctor_id= ?
                group by p.id, u.full_name,u.profile_image,mr.diagnosis,a.status
                order by last_visit desc
                limit 5                
                `,[doctorId,doctorId]
            );

            res.status(200).json({
                stats:{
                    total_appointments: totalAppts[0].total,
                    todays_appointments: todayAppts[0].total,
                    total_earnings: earnings[0].total_earnings,
                    monthly_average: monthlyAvg[0].monthly_average
                },
                upcoming_appointments: upcoming,
                recent_patients: recentPatients
            });

    } catch (error) {
         res.status(500).json({ message: 'Server error', error: error.message }); 
    }
    
};

// admin: Add new doctor  POST /api/admin/doctors
export const addDoctor=async (req,res) => {
    try {
        const {
            full_name,email,password,phone,
            speciality,experience_years,consultation_fee,
            bio,available_days,available_time
        }=req.body;

        // check if email exists
        const [existing]=await db.query(
            'select id from users where email= ?',[email]
        );
        if(existing.length > 0){
          return res.status(400).json({ message: 'Email already registered' });   
        }

        const bcrypt = await import('bcryptjs');
        const hashedPassword=await bcrypt.default.hash(password,10);

        // create user with doctor role
        const [userResult]=await db.query(
            'insert into users(full_name, email,password,phone,role) values(?,?,?,?,?)',
            [full_name,email,hashedPassword,phone,'doctor']
        );
        const userId=userResult.insertId;
        console.log("this userId is from adding doctor by admin=",userId);

        // create doctor profile
        await db.query(`
            insert into doctors
            (user_id,speciality,experience_years,consultation_fee,bio,available_days,available_time)
            values(?,?,?,?,?,?,?)
            `,[userId,speciality,experience_years,consultation_fee,bio,available_days,available_time]);
             res.status(201).json({ message: 'Doctor added successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    } 
};

// get all specialities (for filter dropdown)
export const getSpecialities=async (req,res) => {
    try {
        const [rows]=await db.query(
            'select distinct speciality from doctors where speciality is not null'
        );
        const specialities=rows.map(r => r.speciality);
        res.status(200).json({specialities});
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    } 
};