// book appointment
// from: find doctor page -> "Book Now" button

import db from "../config/db.js";

// Patient Dashboard -> shows booked appointments
export const bookAppointment=async (req,res) => {
    try {
        const {doctor_id,appt_date,appt_time,type}=req.body;

        // validate required fields
        if(!doctor_id || !appt_date || !appt_time){
            return res.status(400).json({
                message:'Doctor, date and time are required'
            });
        }

        // get patient id from logged in user
        const [patientRows]=await db.query(
            'select id from patients where user_id= ?',[req.user.id]
        );
        if(patientRows.length === 0){
          return res.status(404).json({ message: 'Patient profile not found' });   
        }
        const patientId=patientRows[0].id;
        console.log("patientId=patientRows[0].id from appointment controller file is",patientId);

        // check if doctor exist
        const [doctorRows]=await db.query
        ('select id,consultation_fee from doctors where id = ?',[doctor_id]);
        if(doctorRows.length === 0){
          return res.status(404).json({ message: 'Doctor not found' });   
        }

        // check if slot is already booked
        const [existing]=await db.query(
            `select id from appointments 
            where doctor_id = ?
            and appt_date= ?
            and appt_time= ?
            and status not in ('cancelled')
            `,[doctor_id,appt_date,appt_time]
        );

        if(existing.length > 0){
        return res.status(400).json({
        message: 'This time slot is already booked. Please choose another time.'
      });    
        }

        // Book the appointment
        const [result]=await db.query(
            `insert into appointments
            (patient_id,doctor_id,appt_date,appt_time,type,status)
            values(?,?,?,?,?,'pending')
            `,[patientId,doctor_id,appt_date,appt_time,type || 'hospital']
        );
        const appointmentId=result.insertId;
        console.log("appointmentId=result.insertId is",appointmentId);

        // Auto-generate invoice afer booking
        const consultationFee= doctorRows[0].consultation_fee || 0;
        const tax= parseFloat((consultationFee * 0.13).toFixed(2));
        const serviceCharge= 150;
        const subtotal= parseFloat(consultationFee) + serviceCharge;
        const total= parseFloat((subtotal + tax).toFixed(2));

        await db.query(
            `insert into invoices (appointment_id, subtotal,tax,total,status)
            values(?,?,?,?,'unpaid')
            `,[appointmentId,subtotal,tax,total]
        );

        res.status(201).json({
            message: 'Appointment booked successfully',
            appointment_id: appointmentId,
            invoice: {subtotal,tax,total,status:'unpaid'}
        });
    } catch (error) {
    console.error('Book appointment error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });  
    }
    
};

// get all appointments for logged in patient
// from: Patient Dashboard -> "Upcoming Appointments"
export const getPatientAppointments=async (req,res) => {
    try {
        const {status, upcoming}=req.query;

        // get patient id
        const [patientRows]=await db.query(
            'select id from patients where user_id= ?',[req.user.id]
        );
        if(patientRows.length === 0){
         return res.status(404).json({ message: 'Patient not found' });   
        }
        const patientId= patientRows[0].id;
        console.log("patientId= patientRows[0].id from appointment controller is",patientId);

        let query=`
        select a.id, a.appt_date, a.appt_time,
        a.type, a.status, a.created_at,
        d.id as doctor_id,
        d.speciality, d.consultation_fee,
        u.full_name as doctor_name,
        u.profile_image as doctor_image,
        i.id as invoice_id,
        i.total as invoice_total,
        i.status as payment_status
        from appointments a
        join doctors d
        on a.doctor_id= d.id
        join users u
        on d.user_id= u.id
        left join invoices i
        on i.appointment_id= a.id
        where a.patient_id= ?
        `;
        const params= [patientId];

        // filter by status (pending/confirmed/completed/cancelled)
        if(status){
       query += 'and a.status= ?';
       params.push(status);
        }

        // only upcoming appointments
        if(upcoming === 'true'){
        query += ' and a.appt_date >= curdate() and a.status not in (\'cancelled\',\'completed\')';     
        }

        query += 'order by a.appt_date asc, a.appt_time asc';

        const [appointments]=await db.query(query,params);

        res.status(200).json({
            count: appointments.length,
            appointments
        });
    } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });    
    } 
};

// get all appointments for logged in doctor
// from: doctor dashboard -> "Upcoming" section
export const getDoctorAppointments=async (req,res) => {
    try {
       const {status, date, upcoming}=req.query;
       
       // get doctor id
       const [doctorRows]=await db.query(
        'select id from doctors where user_id= ?',[req.user.id]
       );
       if(doctorRows.length === 0){
        return res.status(404).json({ message: 'Doctor not found' });
       }
       const doctorId=doctorRows[0].id;
       console.log("doctorId= doctorRows[0].id from doctor appointment controller is",doctorId);

       let query=`
       select a.id, a.appt_date, a.appt_time,
       a.type, a.status, a.created_at,
       p.id as patient_id,
       u.full_name as patient_name,
       u.phone as patient_phone,
       u.profile_image as patient_image,
       p.blood_group,
       i.id as invoice_id,
       i.total as invoice_total,
       i.status as payment_status
       from appointments a
       join patients p on a.patient_id= p.id
       join users u on p.user_id= u.id
       left join invoices i on i.appointment_id= a.id
       where a.doctor_id= ? 
       `;
       const params=[doctorId];

      if(status){
       query += 'and a.status= ?';
       params.push(status);
        }

    if (date) {
      query += ' AND a.appt_date = ?';
      params.push(date);
    }

    if(upcoming === 'true'){
        query += ' and a.appt_date >= curdate() and a.status not in (\'cancelled\',\'completed\')';     
        }

        query += 'order by a.appt_date asc, a.appt_time asc';

        const [appointments]=await db.query(query,params);

        res.status(200).json({
            count: appointments.length,
            appointments
        });
    } catch (error) {
     res.status(500).json({ message: 'Server error', error: error.message });    
    }    
};

// get single appointment by id
export const getAppointmentById=async (req,res) => {
    try {
        const {id}=req.params;

        const [rows]=await db.query(`
            select a.id, a.appt_date, a.appt_time, a.type, a.status,
            d.id as doctor_id,
            d.speciality, d.consultation_fee,

            du.full_name as doctor_name,
            du.profile_image as doctor_image,

            p.id  as patient_id,
            pu.full_name as patient_name,
            pu.phone as patient_phone,
            p.blood_group,

            i.id as invoice_id,
            i.subtotal, i.tax, i.total, i.status  as payment_status,
            i.paid_at
            from appointments a
            join doctors d on a.doctor_id= d.id
            join users du on d.user_id= du.id
            join patients p on a.patient_id= p.id
            join users pu on p.user_id = pu.id
            left join invoices i on i.appointment_id= a.id
            where a.id= ?
            `,[id]);

             if (rows.length === 0) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    res.status(200).json({ appointment: rows[0] });

    } catch (error) {
       res.status(500).json({ message: 'Server error', error: error.message });  
    } 
};

// update appointment status
// doctor dashboard-> confirm/complete
// patient dashboard -> Cancel
export const updateAppointmentStatus=async (req,res) => {
    try {
        const {id}=req.params;
        const {status}=req.body;

        const validStatuses=['pending','confirmed','completed','cancelled'];

        if(!validStatuses.includes(status)){
         return res.status(400).json({
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });   
        }

        // check appointment exists
        const [apptRows]=await db.query(
            'select * from appointments where id =?',[id]
        );
        if(apptRows.length === 0){
            return res.status(404).json({message:'Appointment not found'});
        }
// appointment patients in appt
        const appt=apptRows[0];
        // role-based permission check
        if(req.user.role === 'patient'){
            // Patient can only cancel
            if(status !== 'cancelled'){
                return res.status(403).json({
                    message: 'Patients can only cancel appointments'
                });
            }

            // check this appointment belongs to this patient
            const [patRows]=await db.query(
                'select id from patients where user_id= ?',[req.user.id]
            );
            if(patRows[0].id !== appt.patient_id){
return res.status(403).json({ message: 'Not your appointment' });
            }
        }

        if(req.user.role === 'doctor'){
            // doctor can confirm or complete
            if(!['confirmed','completed','cancelled'].includes(status)){
                return res.status(403).json({
                    message:'Doctors can confirm, complete or cancel appointments'
                });
            }

            // check this appointment belongs to this doctor
            const [docRows]=await db.query(
              'select id from doctors where user_id= ?',[req.user.id]  
            );
            if(docRows[0].id !== appt.doctor_id){
                return res.status(403).json({message:'Not your appointment'});
            }
        }

        // Update status
        await db.query(
            'update appointments set status = ? where id = ?',[status,id]
        );

        // if appointment is cancelled then mark invoice as cancelled too
        if(status === 'cancelled'){
            await db.query(
                'update invoices set status = ? where appointment_id = ?',['unpaid',id]
            );
        }

        res.status(200).json({
            message: `Appointment ${status} successfully`
        });
    } catch (error) {
       res.status(500).json({ message: 'Server error', error: error.message });     
    }
};

// reschedule appointment
// Patient Dashboard -> "Reschedule" button

export const rescheduleAppointment=async (req,res) => {
    try {
        const {id}= req.params;
        const {appt_date,appt_time}=req.body;

        if(!appt_date || !appt_time){
            return res.status(400).json({
                message:'New date and time are required'
            });
        }

        // check appointment exists and belongs to patient
        const [apptRows]=await db.query(
            'select * from appointments where id = ?',[id]
        );
        if(apptRows.length === 0){
            return res.status(404).json({
                message:'Appointment not found'
            });
        }

        const appt=apptRows[0];
        // Only pending or confirmed can be rescheduled
        if(!['pending','confirmed'].includes(appt.status)){
          return res.status(400).json({
        message: 'Only pending or confirmed appointments can be rescheduled'
      });   
    }

    // check new slot availability
    const [slotCheck]=await db.query(
        `select id from appointments 
        where doctor_id = ?
        and appt_date = ?
        and appt_time= ?
        and status not in ('cancelled')
        and id != ?
        `,[appt.doctor_id,appt_date,appt_time,id]
    );
    if(slotCheck.length > 0){
        return res.status(400).json({
            message: 'This time slot is already taken'
        });
    }

    await db.query(
    'update appointments set appt_date = ?, appt_time = ?, status = ? where id = ?',[appt_date,appt_time,'pending',id]
    );
    res.status(200).json({ message: 'Appointment rescheduled successfully' }); 
    } catch (error) {
       res.status(500).json({ message: 'Server error', error: error.message });   
    }
};

// get available time slots for a doctor on a date
// from:Find Doctor -> Book now -> date picker
export const getAvailableSlots=async (req,res) => {
    try {
        const {doctor_id,date}=req.query;

        if(!doctor_id || !date){
            return res.status(400).json({
                message:'Doctor ID and date are required'
            });
        }

        // get doctor's available time range
        const [doctorRows]=await db.query(
            'select available_days, available_time from doctors where id = ?',[doctor_id]
        );
        if(doctorRows.length === 0){
         return res.status(404).json({ message: 'Doctor not found' });    
        }

        // All possible time slots  (every 30 mins, 9AM to 5PM) 
          const allSlots = [
      '09:00', '09:30', '10:00', '10:30',
      '11:00', '11:30', '12:00', '12:30',
      '13:00', '13:30', '14:00', '14:30',
      '15:00', '15:30', '16:00', '16:30'
    ];

    // get already booked slots for this doctor on this date
    const [bookedSlots]=await db.query(
        `select appt_time from appointments where doctor_id = ? and appt_date= ?
        and status not in ('cancelled')
        `,[doctor_id,date]
    );

    const bookedTimes=bookedSlots.map(row => {
        // format time from mysql (HH:MM:SS → HH:MM)
        return row.appt_time.toString().substring(0,5);
    });

    // filter out booked slots
    const availableSlots=allSlots.filter(
        slot => !bookedTimes.includes(slot)
    );

    res.status(200).json({
        date,
        doctor_id,
        available_slots: availableSlots,
        booked_slots: bookedTimes
    })

    } catch (error) {
       res.status(500).json({ message: 'Server error', error: error.message });  
    }  
};

// get all appointments (Admin)
// from: Hospital Overview -> Recent Appointments table
export const getAllApointments=async (req,res) => {
    try {
        const {status, date, limit=10, page=1}=req.query;
        const offset=(page-1) *limit;

        let query = `
      SELECT 
        a.id, a.appt_date, a.appt_time, a.type, a.status,
        du.full_name  AS doctor_name,
        d.speciality   AS department,
        pu.full_name  AS patient_name,
        i.total, i.status AS payment_status
      FROM appointments a
      JOIN doctors  d  ON a.doctor_id  = d.id
      JOIN users    du ON d.user_id    = du.id
      JOIN patients p  ON a.patient_id = p.id
      JOIN users    pu ON p.user_id    = pu.id
      LEFT JOIN invoices i ON i.appointment_id = a.id
      WHERE 1=1
    `;
    const params=[];

    if(status){
      query += ' AND a.status = ?';
      params.push(status);  
    }
    if (date) {
      query += ' AND a.appt_date = ?';
      params.push(date);
    }

    query += ' ORDER BY a.appt_date DESC, a.appt_time DESC';
    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit),parseInt(offset));

     const [appointments] = await db.query(query, params);

      // Total count for pagination
    const [countResult] = await db.query(
      'SELECT COUNT(*) AS total FROM appointments'
    );

     res.status(200).json({
      total: countResult[0].total,
      page:  parseInt(page),
      limit: parseInt(limit),
      appointments
    });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });     
    }
    
};
