import db from '../config/db.js'
// get patient profile
export const getPatientProfile=async (req,res) => {
    try {
        const [rows]=await db.query(
            `select p.id,p.dob,p.blood_group,
            p.address,p.emergency_contact,
            u.full_name,u.email,u.phone,u.profile_image
            from patients p
            join users u 
            on p.user_id= u.id
            where p.user_id= ?
            `,[req.user.id]
        );

        if(rows.length === 0){
             return res.status(404).json({ message: 'Patient not found' });

        }
        res.status(200).json({patient: rows[0]});
    } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
    }  
};

// update patient profile
export const updatePatientProfile=async (req,res) => {
    try {
        const {full_name, phone,dob,blood_group,address,emergency_contact}=req.body;

        // update users table
        await db.query(
            'update users set full_name= ?, phone= ? where id= ?', [full_name,phone,req.user.id]
        );

        // update patients table
        await db.query(`
            update patients set
            dob  = ?,
            blood_group  = ?,
            address = ?,
            emergency_contact= ?
            where  user_id= ?
            `,[dob,blood_group,address,emergency_contact,req.user.id]);

            res.status(200).json({ message: 'Profile updated successfully' });
    } catch (error) {
       res.status(500).json({ message: 'Server error', error: error.message }); 
    }
};

// get patient dashboard stats
// used by: Patient Dashboard screen
export const getPatientDashboardStats=async (req,res) => {
    try{
        // get patient id
        const [patientRows]=await db.query(
            'select id from patients where user_id= ?',[req.user.id]
        );
        if(patientRows.length === 0){
           return res.status(404).json({ message: 'Patient not found' });  
        }
        const patientId=patientRows[0].id;
        console.log("patientId= patientRows[0].id",patientId);

        // total appointments
        const [totalAppts]=await db.query(
            'select count(*) as total from appointments where patient_id= ?',[patientId]
        );
        
        // upcoming visits
        const [upcomingCount]=await db.query(`
            select count(*) as total from appointments
            where patient_id= ?
            and appt_date >= curdate()
            and status not in ('cancelled','completed') 
            `,[patientId]);

            // Next appointment date
            const [nextAppt]=await db.query(
                `select appt_date from appointments
                where patient_id= ?
                and appt_date >= curdate()
                and status not in('cancelled','completed')
                order by appt_date asc limit 1
                `,[patientId]
            );

            // total spent
            const [totalSpent]=await db.query(
                `select coalesce(sum(i.total),0) as total
                 from invoices i
                 join appointments a
                 on i.appointment_id=a.id
                 where a.patient_id= ?
                 and i.status= 'paid'
                 `,[patientId]
            );

            // Unpaid invoices count
            const [unpaidCount]=await db.query(`
                select count(*) as total
                from invoices i
                join appointments a
                on i.appointment_id=a.id
                where a.patient_id= ?
                and i.status= 'unpaid'
                `,[patientId]);

                // upcoming appointments details
                const [upcomingAppts]=await db.query(`
                    select 
                    a.id,a.appt_date,a.appt_time,a.type,a.status,
                    d.speciality,d.consultation_fee,
                    u.full_name as doctor_name, u.profile_image
                    from appointments a
                    join doctors d
                    on a.doctor_id= d.id
                    join users u
                    on d.user_id=u.id
                    where a.patient_id= ?
                    and a.appt_date >= curdate() 
                    and a.status not in('cancelled','completed')
                    order by a.appt_date asc
                    limit 3
                    `,[patientId]);

                    // recent lab reports(medical records)
                    const [labReports]=await db.query(`
                        select 
                        mr.id, mr.diagnosis, mr.record_date,
                        u.full_name as doctor_name, d.speciality
                        from medical_records mr
                        join doctors d
                        on mr.doctor_id=d.id
                        join users u
                        on d.user_id=u.id
                        where mr.patient_id= ?
                        order by mr.record_date desc
                        limit 3
                        `,[patientId]);

                        // recent transactions
                        const [transactions]=await db.query(`
                            select i.id,i.total,i.status,i.paid_at,
                            d.speciality,u.full_name as doctor_name
                            from invoices i
                            join appointments a
                            on i.appointment_id=a.id
                            join doctors d
                            on a.doctor_id=d.id
                            join users u
                            on d.user_id=u.id
                            where a.patient_id= ?
                            order by i.paid_at desc
                            limit 5
                            `,[patientId]);

      res.status(200).json({
        stats:{
            total_appointments: totalAppts[0].total,
            upcoming_visits: upcomingCount[0].total,
            next_appointment: nextAppt[0]?.appt_date || null,
            total_spent: totalSpent[0].total,
            unpaid_invoices: unpaidCount[0].total
        },
        upcoming_appointments: upcomingAppts,
        recent_lab_reports: labReports,
        recent_transactions: transactions 
      });                      
    }catch(error){
       res.status(500).json({ message: 'Server error', error: error.message });   
    }   
};

// admin: get all patients
export const getAllPatients=async (req,res) => {
    try {
        const[patients]=await db.query(`
            select p.id,p.dob,p.blood_group,p.address,
            u.full_name, u.email,u.phone,u.created_at
            from patients p
            join users u
            on p.user_id=u.id
            order by u.created_at desc
            `);
            res.status(200).json({count: patients.length, patients});
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message })   
    } 
};