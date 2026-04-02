import db from '../config/db.js'
// get all invoices for logged in patient
// from: Patient Dashboard -> "Unpaid Invoices" + "Recent Transactions" + "Payment History"
// Show due amount, Pay Now Button , transaction list
export const getPatientInvoices=async (req,res) => {
    try {
        const {status}=req.query;

        // Get patient id
        const [patientRows]=await db.query(
            `select id from patients where user_id = ?`,[req.user.id]
        );

        if(patientRows.length === 0){
            return res.status(404).json({ message: 'Patient not found'});
        }
        const patientId= patientRows[0].id;
        console.log("patientId = patientRows[0].id is",patientId);

        let query=`
        select i.id as invoice_id,
        i.subtotal,i.tax,
        i.total,
        i.status as payment_status,
        i.paid_at,
        i.transaction_id,
        i.payment_method,
        a.id as appointment_id,
        a.appt_date,
        a.appt_time,
        a.type as appointment_type,
        d.id as doctor_id,
        d.speciality,
        d.consultation_fee,
        u.full_name as doctor_name,
        u.profile_image as doctor_image
        from invoices i
        join appointments a on i.appointment_id= a.id
        join doctors d on a.doctor_id= d.id
        join users u on d.user_id=u.id
        where a.patient_id = ?
        `;
        const params=[patientId];

        if(status){
            query += 'and i.status = ?';
            params.push(status);
        }

        query += 'order by i.paid_at desc, a.appt_date desc';

        const [invoices]=await db.query(query,params);

        // Summary counts for Patient Dashboard stats
        const [summary]=await db.query(`
        select
        count(*)  as total_invoices,
        sum(case when i.status='unpaid' then 1 else 0 end) as unpaid_count,
        sum(case when i.status='paid' then 1 else 0 end) as paid_count,
        coalesce(sum(case when i.status='unpaid' then i.total else 0 end),0) as total_due,
        coalesce(sum(case when i.status='paid' then i.total else 0 end),0) as total_paid
        from invoices i
        join appointments a on i.appointment_id= a.id
        where a.patient_id = ?
            `,[patientId]);

            res.status(200).json({
                summary: summary[0],
                count: invoices.length,
                invoices
            })
    } catch (error) {
       console.error('Get patient invoices error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });   
    } 
};

// get single invoice by id (Invoice Receipt page)
// From -> Patient Dashboard -> click invoice -> Invoice page
// Full receipt with doctor info, fee breakdown, payment status, patient info, transaction ID
export const getInvoiceById=async (req,res) => {
    try {
        const {id}=req.params;

        const [rows]=await db.query(`
            select i.id as invoice_id,
            i.subtotal,
            i.tax,
            i.total,
            i.status as payment_status,
            i.paid_at,
            i.transaction_id,
            i.payment_method,
            a.id as appointment_id,
            a.appt_time,
            a.appt_date,
            a.type as appointment_type,
            d.id as doctor_id,
            d.speciality,
            d.consultation_fee,
            d.bio,
            du.full_name as doctor_name,
            du.profile_image as doctor_image,
            p.id as patient_id,
            pu.full_name as patient_name,
            pu.phone as patient_phone,
            pu.email as patient_email,
            pat.blood_group,
            pat.dob
            from invoices i
            join appointments a on i.appointment_id = a.id
            join doctors d on a.doctor_id = d.id
            join users du on d.user_id= du.id
            join patients pat on a.patient_id= pat.id
            join users pu on pat.user_id= pu.id
            left join patients p on a.patient_id = p.id
            where i.id= ?
            `,[id]);

            if(rows.length === 0){
            return res.status(404).json({ message: 'Invoice not found' });      
            }

            const invoice= rows[0];

            // Consultation fee + Service Charge + Vat(13%) = Total
            const feeBreakdown={
                consultation_fee: parseFloat(invoice.consultation_fee)  || 0,
                service_charge: 150,
                vat_percentage: 13,
                vat_amount: parseFloat(invoice.tax) || 0,
                subtotal: parseFloat(invoice.subtotal) || 0,
                total: parseFloat(invoice.total) || 0
            };

            res.status(200).json({
                invoice:{
                    ...invoice,
                    fee_breakdown: feeBreakdown
                }
            })
    } catch (error) {
      console.error('Get invoice error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });  
    }
};

// Auto-creation happens in bookAppointment controller
// manually create invoice (Admin use)
// this is for manually generating missed invoices

export const createInvoice=async (req,res) => {
    try {
        const {appointment_id, consultation_fee}=req.body;

        if(!appointment_id){
            return res.status(400).json({ message: 'Appointment ID is required' });
        }
    
        // check if appointment exists or not
        const [apptRows]=await db.query(
            `select a.*, d.consultation_fee as doctor_fee
            from appointments a
            join doctors d 
            on a.doctor_id=d.id
            where a.id = ?`,[appointment_id]
        );

        if(apptRows.length === 0){
            return res.status(404).json({ message: 'Appointment not found' });
        }

        // check invoice doesn't already exist
        const [existingInvoice]=await db.query(
            `select id from invoices where appointment_id = ?`,[appointment_id]
        );
        if(existingInvoice.length > 0){
            return res.status(400).json({
                message:'Invoice already exists for this appointment'
            });
        }

        // Calculate fees matching UI
        // Consultation fee + Service Charge + VAT(13%)

        const fee =parseFloat(consultation_fee || apptRows[0].doctor_fee || 0);
        const serviceCharge=150;
        const subtotal= fee + serviceCharge;
        const tax= parseFloat((subtotal * 0.13).toFixed(2));
        const total=parseFloat((subtotal + tax).toFixed(2));

        const [result]=await db.query(
            `insert into invoices (appointment_id, subtotal,tax,total,status) 
            values (?,?,?,?,'unpaid)`,
            [appointment_id, subtotal, tax,total]
        );

        res.status(201).json({
            message: 'Invoice created successfully',
            invoice_id: result.insertId,
            breakdown:{
                consultation_fee: fee,
                service_charge: serviceCharge,
                tax_13_percent: tax,
                subtotal,
                total
            }
        }
        );
    } catch (error) {
        console.error('Create invoice error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });   
    }
};

// PAY INVOICE
// From : Patient Dashboard -> "Pay Now" button
// UI: Payment Status shows "Paid via esewa Digital Wallet"
// Transaction ID: ESW-9821-xKB
export const payInvoice=async (req,res) => {
    try {
        const {id}=req.params;
        const {payment_method, transaction_id}=req.body;

        if(!payment_method){
            return res.status(400).json({
                message:'Payment method is required'
            });
        }

        // check invoice exists
        const [invoiceRows]=await db.query(
            `select i.*, a.patient_id 
            from invoices i
            join appointments a on i.appointment_id= a.id where i.id= ?`,
            [id]
        );
        if(invoiceRows.length === 0){
            return res.status(404).json({message:'Invoice not found'});
        }

        const invoice=invoiceRows[0];

        // check invoice belongs to this patient
        const [patRows]=await db.query(
            `select id from patients where user_id= ?`,[req.user.id]
        );
        if(patRows.length === 0 || patRows[0].id !== invoice.patient_id){
            return res.status(403).json({message:'Access denied to this invoice'});
        }

        // check if already paid
        if(invoice.status === 'paid'){
            return res.status(400).json({
                message:'Invoice is already paid'
            });
        }

        // generate transaction ID if not provided
        // Format matching ESW-9821-XKB
        const generatedTxnId= transaction_id || `TXN-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2,5).toUpperCase()}`;

        // Update invoice to paid
        await db.query(
            `update invoices set
            status= 'paid',
            paid_at = now(),
            transaction_id = ?,
            payment_method= ?
            where id= ?            
            `,[generatedTxnId,payment_method,id]
        );

        // Mark appointment as confirmed if still pending
        await db.query(
            `update appointments
             set status ='confirmed'
             where id= ? and status= 'pending'`,[invoice.appointment_id]
        );

        res.status(200).json({
            message: 'Payment successful',
            transaction_id: generatedTxnId,
            payment_method,
            paid_at: new Date().toISOString(),
            amount_paid: invoice.total
        });
    } catch (error) {
        console.error('Pay invoice error', error);
        res.status(500).json({message: 'Server error', error: error.message});
    }
};

// get doctor earnings
// From: Doctor Dashboard -> "Total Earnings" + "Earnings Performance" chart
// UI:   $45,200 total, $12,400 monthly average,
//       6-month earnings performance chart

export const getDoctorEarnings=async (req,res) => {
    try {
        // Get doctor id
        const [doctorRows]=await db.query(
            `select id from doctors where user_id = ?`,[req.user.id]
        );
        if(doctorRows.length === 0){
            return res.status(404).json({message: 'Doctor not found'});
        }
        const doctorId=doctorRows[0].id;

        // Total earnings (all time)
        const [totalEarnings]=await db.query(`
            select coalesce(sum(i.total),0) as total_earnings 
            from invoices i
            join appointments a on i.appointment_id = a.id
            where a.doctor_id = ? and i.status= 'paid' `,[doctorId]);
// Monthly average
const [monthlyAvg]=await db.query(`
    select coalesce (avg(monthly_total),0) as monthly_avg
    from (
    select sum(i.total) as monthly_total
    from invoices i
    join appointments a on i.appointment_id=a.id
    where a.doctor_id= ? and i.status= 'paid'
    group by year(i.paid_at), month(i.paid_at)) 
    as monthly_data
    `,[doctorId]);

    // Last 6 months earnings for chart
    // Matches UI: JAN FEB MAR APR MAY JUN chart
const [monthlyChart]=await db.query(
    `select date_format(i.paid_at,'%b') as month,
    date_format(i.paid_at, '%Y-%m') as month_key,
    coalesce(sum(i.total),0) as earnings from invoices i
    join appointments a on i.appointment_id= a.id
    where a.doctor_id= ?
    and i.status= 'paid'
    and i.paid_at >=date_sub(now(),interval 6 month)
    group by year(i.paid_at), month(i.paid_at),
    date_format(i.paid_at, '%b'),
    date_format(i.paid_at,'%Y-%m')
    order by month_key asc
    `,[doctorId]
);

// last 12 months earnings for chart
const [yearlyChart]=await db.query(`
    select date_format(i.paid_at, '%b') as month,
    date_format(i.paid_at, '%Y-%m') as month_key,
    coalesce(sum(i.total),0) as earnings 
    from invoices i
    join appointments a on i.appointment_id= a.id
    where a.doctor_id = ?
    and i.status= 'paid'
    and i.paid_at >= date_sub(now(), interval 12 month)
    group by year(i.paid_at), month(i.paid_at),
    date_format(i.paid_at, '%b'),
    date_format(i.paid_at, '%Y-%m')
    order by month_key asc
    `,[doctorId]);

    // recent payment transactions
    const [recentPayments]=await db.query(`
        select i.id, i.total, i.paid_at, i.transaction_id, i.payment_method, 
        pu.full_name as patient_name
        from invoices i
        join appointments a on i.appointment_id= a.id
        join patients pat on a.patient_id=pat.id
        join users pu on pat.user_id= pu.id
        where a.doctor_id= ? and i.status= 'paid'
        order by i.paid_at desc
        limit 5
        `,[doctorId]);

        res.status(200).json({
            earnings: {
                total_earnings: parseFloat(totalEarnings[0].total_earnings),
                monthly_average: parseFloat(monthlyAvg[0].monthly_avg).toFixed(2)
            },
            charts: {
                six_months: monthlyChart,
                twelve_months: yearlyChart
            },
            recentPayments: recentPayments
        });
    } catch (error) {
       console.error('Get doctor earnings error:',error);
       res.status(500).json({message: 'Server error', error: error.message}); 
    }  
};

// get all invoices (admin)
// from : Hospital Overview -> Monthly Revenue 
// revenue Analysis -> Latest Financial Activity
export const getAllInvoicesAdmin=async (req,res) => {
    try {
        const {status, page=1, limit=10}=req.query;
        const offset=(page-1)*limit;

        let query=`
        select i.id as invoice_id,
        i.subtotal, i.tax,i.total,
        i.status as payment_status,
        i.paid_at,
        i.transaction_id,
        i.payment_method,
        a.appt_date,
        d.speciality,
        du.full_name as doctor_name,
        pu.full_name as patient_name
        from invoices i
        join appointments a on i.appointment_id=a.id
        join doctors d on a.doctor_id=d.id
        join users du on d.user_id=du.id
        join patients pat on a.patient_id=pat.id
        join users pu on pat.user_id=pu.id
        where 1=1
        `;
       
        const params=[];

        if(status){
            query +=' and i.status= ?';
            params.push(status);
        }

        query += 'order by i.paid_at desc limit ? offset ?';
        params.push(parseInt(limit),parseInt(offset));

        const [invoices]=await db.query(query, params);

        // Overall billing summary for admin
        const [adminSummary]=await db.query(`
            select count(*) as total_invoices,
            coalesce(sum(total),0) as total_billed,
            coalesce(sum(case when status='paid' then total else 0 end),0) as total_collected,
            coalesce(sum(case when status='unpaid' then total else 0 end),0) as total_pending,
            coalesce(sum(case when month(paid_at)=month(now()) and year(paid_at)=year(now()) and status='paid' then total else 0 end),0) as this_month_revenue
            from invoices
            `);

            res.status(200).json({
                summary: adminSummary[0],
                count: invoices.length,
                invoices
            });

    } catch (error) {
        console.error('Get all invoices error:', error);
        res.status(500).json({message: 'Server error', error: error.message});
    }
};

// get payment history for a patient (for Patient Dashboard "Payment History" section)
// from: Patient Dashboard -> "Payment History" sidebar
// UI:   Consultation Fee -$120, Pharmacy Refill -$32.50
export const getPaymentHistory=async (req,res) => {
    try {
        // get patient id
        const [patientRows]=await db.query(`select id from patients where user_id = ?`,[req.user.id]);

        if(patientRows.length === 0){
            return res.status(404).json({message:'Patient not found'});
        }
        const patientId= patientRows[0].id;

        const [history]=await db.query(`
            select i.id, i.status, i.total, i.paid_at,i.transaction_id,
            i.payment_method, d.speciality,
            du.full_name as doctor_name,
            a.appt_date
            from invoices i
            join appointments a on i.appointment_id=a.id
            join doctors d on a.doctor_id=d.id
            join users du on d.user_id=du.id
            where a.patient_id= ? 
            order by i.paid_at desc, a.appt_date desc
            limit 20
            `,[patientId]);

            res.status(200).json({
                count: history.length,
                history
            });
    } catch (error) {
        console.error('Get payment history error:', error);
        res.status(500).json({message: 'Server error', error: error.message});

    }  
};

// Issue refund (Admin only)
// from: Revenue Analysis -> "Refund Issued "
export const issueRefund=async (req,res) => {
    try {
        const {id}=req.params;
        const {reason}=req.body;

        const [invoiceRows]=await db.query(`
            select * from invoices where id= ?
            `,[id]);

            if(invoiceRows.length === 0){
                return res.status(404).json({message:"Invoice not found"});
            }

            const invoice=invoiceRows[0];
            if(invoice.status !== 'paid'){
                return res.status(400).json({message: 'Only paid invoices can be refunded'});
            }
            await db.query(`
                update invoices set status='refunded' where id= ?`,[id]);

                res.status(200).json({
                    message: 'Refund issued successfully',
                    invoice_id: id,
                    refunded_amount: invoice.total,
                    reason: reason || 'Refund processed by admin'
                });
    } catch (error) {
        res.status(500).json({message: 'Server error', error: error.message});
    }
};