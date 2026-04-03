import db from "../config/db.js";

// get hospital overview stats
export const getHospitalOverview = async (req, res) => {
  try {
    // Top 4 stat cards
    const [totalDoctors] = await db.query(
      `select count(*) as total from doctors`,
    );
    const [totalPatients] = await db.query(
      `select count(*) as total from patients`,
    );
    const [todayAppointments] = await db.query(
      `select count(*) as total from appointments
             where appt_date= curdate()`,
    );
    const [monthlyRevenue] = await db.query(
      `select coalesce(sum(total),0) as total from invoices 
            where status='paid' 
            and month(paid_at)= month(now())
            and year(paid_at)= year(now())
            `,
    );

    // growth percentages (vs last month)
    const [lastMonthDoctors] = await db.query(
      `select count(*) as total from doctors d
            join users u on d.user_id=u.id
            where month(u.created_at) = month(now() - interval 1 month)
            and year(u.created_at) = year(now() - interval 1 month)
            `,
    );

    const [lastMonthPatients] = await db.query(`
            select count(*) as total from patients p
            join users u on p.user_id=u.id
            where month(u.created_at) = month(now() - interval 1 month)
            and year(u.created_at) = year(now() - interval 1 month)
            `);

    const [lastMonthRevenue] = await db.query(
      `select coalesce(sum(total),0) as total from invoices
                where status='paid'
                and month(paid_at)= month(now() - interval 1 month)
                and year(paid_at)= year(now() - interval 1 month)`,
    );

    const [lastMonthAppts] = await db.query(`
                select count(*) as total from appointments
                where month(created_at)= month(now() - interval 1 month)
                and year(created_at)= year(now() - interval 1 month)
                `);

    const [thisMonthAppts] = await db.query(`
                    select count(*) as total from appointments
                    where month(created_at) = month(now())
                    and year(created_at) =year(now())
                    `);

    // calculate growth %
    const calcGrowth = (current, previous) => {
      if (previous === 0) return 100; // if no previous, consider it 100% growth
      return parseFloat((((current - previous) / previous) * 100).toFixed(1));
    };

    const currentRevenue = parseFloat(monthlyRevenue[0].total);
    const previousRevenue = parseFloat(lastMonthRevenue[0].total);

    const growth = {
      doctors: calcGrowth(totalDoctors[0].total, lastMonthDoctors[0].total),
      patients: calcGrowth(totalPatients[0].total, lastMonthPatients[0].total),
      revenue: calcGrowth(currentRevenue, previousRevenue),
      appointments: calcGrowth(
        thisMonthAppts[0].total,
        lastMonthAppts[0].total,
      ),
    };

    // Patient Inflow - Weekly chart
    const [weeklyInflow] = await db.query(`
                        select
                        dayname(appt_date) as day_name,
                        dayofweek(appt_date) as day_number,
                        count(*) as count
                        from appointments
                        where appt_date >=date_sub(curdate(), interval 7 day)
                        and appt_date <= curdate()
                        group by dayname(appt_date), dayofweek(appt_date)
                        order by dayofweek(appt_date)
                        `);

    // fill in missing days with 0
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const inflowMap = {};
    weeklyInflow.forEach((row) => {
      inflowMap[row.day_name] = row.count;
    });
    const patientInflow = days.map((day) => ({
      day: day.substring(0, 3).toUpperCase(),
      count: inflowMap[day] || 0,
    }));
    {
      /*
                            the above code will produce an array like this (assuming we had 5 appts on Monday, 3 on Wednesday and 7 on Friday in the last week):
                            [
  { day: "SUN", count: 0 },  if count is 0, it means no appointments were made on that day in the last week.
  { day: "MON", count: 5 },
  { day: "TUE", count: 0 },
  { day: "WED", count: 3 },
  { day: "THU", count: 0 },
  { day: "FRI", count: 7 },
  { day: "SAT", count: 0 }
]
 */
    }

    // revenue by department
    const [deptRevenue] = await db.query(
      `select d.speciality as department,
    coalesce(sum(i.total),0) as revenue,
    count(a.id) as appointments
    from appointments a
    join doctors d on a.doctor_id= d.id
    join invoices i on i.appointment_id= a.id
    where i.status='paid'
    and month(i.paid_at)= month(now())
    and year(i.paid_at)= year(now())
    group by d.speciality
    order by revenue desc
    limit 5
    `,
    );

    // recent appointments table
    // UI: Patient Name | Department | Doctor | Time | Status
    const [recentAppointments] = await db.query(`
        select 
        a.id, a.appt_date, a.appt_time, 
        a.status,a.type, 
        pu.full_name as patient_name,
        du.full_name as doctor_name,
        d.speciality as department
        from appointments a
        join patients p on a.patient_id=p.id
        join users pu on p.user_id=pu.id
        join doctors d on a.doctor_id=d.id
        join users du on d.user_id=du.id
        order by a.created_at desc
        limit 10
        `);

    res.status(200).json({
      stats: {
        total_doctors: totalDoctors[0].total,
        total_patients: totalPatients[0].total,
        todays_appointments: todayAppointments[0].total,
        monthly_revenue: currentRevenue,
        growth,
      },
      patient_inflow: patientInflow,
      revenue_by_department: deptRevenue,
      recent_appointments: recentAppointments,
    });
  } catch (error) {
    console.error("Error fetching hospital overview:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// get revenue analysis
// UI:   Total Revenue $482,900 | Appointments 2,840
//       New Patients 412 | Cancellation Rate 3.8%
//       Monthly Revenue Trend chart (Actual vs Projected)
//       Appointment Distribution (pie/bar)
//       Top Performing Doctors table
//       Daily Appointment Frequency chart
//       Latest Financial Activity
export const getRevenueAnalysis = async (req, res) => {
  try {
    const { period = "7D" } = req.query;
    // period options: 7D | 1M | 3M | 1Y

    // Data range based on period
    const periodMap = {
      "7D": "Interval 7 day",
      "1M": "Interval 1 month",
      "3M": "Interval 3 month",
      "1Y": "Interval 1 year",
    };
    const interval = periodMap[period] || "Interval 7 day";

    // top 4 KPI cards
    const [totalRevenue] = await db.query(
      `select coalesce(sum(total),0) as total
            from invoices
            where status='paid'
            and paid_at >= date_sub(now(), ${interval})
            `,
    );

    const [totalAppointments] = await db.query(
      `select count(*) as total from appointments
            where created_at >= date_sub(now(), ${interval})
            `,
    );

    const [newPatients] = await db.query(
      `select count(*) as total from patients p
            join users u on p.user_id= u.id
            where u.created_at >=date_sub(now(), ${interval})  `,
    );

    const [cancelledAppts] = await db.query(
      `select count(*) as total from appointments
            where status='cancelled'
            and created_at >= date_sub(now(), ${interval})
          `,
    );

    const cancellationRate =
      totalAppointments[0].total > 0
        ? parseFloat(
            (
              (cancelledAppts[0].total / totalAppointments[0].total) *
              100
            ).toFixed(1),
          )
        : 0;

    // Growth vs previous period
    const [prevRevenue] = await db.query(
      `select coalesce(sum(total),0) as total
            from invoices
            where status ='paid'
            and paid_at >= date_sub(date_sub(now(), ${interval}), ${interval})
            and paid_at < date_sub(now(), ${interval})
            `,
    );
    // revenue from the previous time period (not the current one)

    const [prevAppts] = await db.query(
      `select count(*) as total from appointments
            where created_at >= date_sub(date_sub(now(), ${interval}), ${interval})
            and created_at < date_sub(now(), ${interval})
            `,
    );

    const [prevPatients] = await db.query(
      `select count(*) as total from patients p
            join users u on p.user_id= u.id
            where u.created_at >= date_sub(date_sub(now(), ${interval}), ${interval})
            and u.created_at < date_sub(now(), ${interval})
            `,
    );

    const calcGrowth = (curr, prev) => {
      if (prev === 0) return "+100%";
      const g = (((curr - prev) / prev) * 100).toFixed(1);
      return `${g > 0 ? "+" : ""}${g}%`;
    };

    // monthly revenue trend (actual vs projected)
    // UI: 6-month line chart with actual + projected lines
    const [monthlyTrend] = await db.query(
      `select 
            date_format(paid_at, '%b') as month,
            date_format(paid_at, '%Y-%m') as month_key,
            coalesce(sum(total),0) as actual_revenue
            from invoices
            where status='paid'
            and paid_at >= date_sub(now(), interval 6 month)
            group by month_key, month
            order by month_key asc
            `,
    );
    {
      /*
            monthlyTrend = [
   { month: "Nov", month_key: "2025-11", actual_revenue: 10000 },
  { month: "Dec", month_key: "2025-12", actual_revenue: 15000 },
  { month: "Jan", month_key: "2026-01", actual_revenue: 20000 }
]
            */
    }

    // Projected = actual * 1.1 (10% growth projection)
    const revenueWithProjection = monthlyTrend.map((row) => ({
      month: row.month,
      actual_revenue: parseFloat(row.actual_revenue),
      projected_revenue: parseFloat((row.actual_revenue * 1.1).toFixed(2)),
    }));

    // Appointment Distribution
    // UI: Completed 72% | Rescheduled 18% |
    // Cancelled 6%  | No-Show 4%
    const [apptDistribution] = await db.query(
      `select status, count(*) as count
        from appointments
        where created_at >= date_sub(now(), ${interval})
        group by status
        `,
    );

    const totalApptCount = apptDistribution.reduce(
      (sum, row) => sum + row.count,
      0
    );
    const distribution = apptDistribution.map((row) => ({
      status: row.status,
      count: row.count,
      percentage:
        totalApptCount > 0
          ? parseFloat(((row.count / totalApptCount) * 100).toFixed(1))
          : 0,
    }));

    // Top Performing Doctors table 
    // UI: Practitioner | Appts | Total Revenue | Growth% | Rating
const [topDoctors]=await db.query(
    `select 
    du.full_name as doctor_name,
    du.profile_image as doctor_image,
    d.speciality,
    count(a.id) as total_appointments,
    coalesce(sum(i.total),0) as total_revenue,
    d.id as doctor_id
    from doctors d
    join users du on d.user_id= du.id
    join appointments a on a.doctor_id= d.id
    left join invoices i on i.appointment_id= a.id
    and i.status='paid'
    where a.created_at >=date_sub(now(), ${interval})
    group by d.id, du.full_name, du.profile_image, d.speciality
    order by total_revenue desc
    limit 5
    `
);

// calculate growth for each doctor vs previous period
const topDoctorsWithGrowth= await Promise.all(
    topDoctors.map(async (doctor) => {
        const [prevDoctorRevenue]= await db.query(
            `select coalesce(sum(i.total),0) as prev_revenue
            from invoices i
            join appointments a on i.appointment_id= a.id
            where a.doctor_id = ?
            and i.status='paid'
            and i.paid_at >= date_sub(date_sub(now(), ${interval}), ${interval})
            and i.paid_at < date_sub(now(), ${interval})
            `,[doctor.doctor_id]
        );

        const prevRev= parseFloat(prevDoctorRevenue[0].prev_revenue);
        const currRev= parseFloat(doctor.total_revenue);
        const growthPct= prevRev === 0
        ? 100
        : parseFloat((((currRev-prevRev)/prevRev)* 100).toFixed(1));

        return {
            ...doctor,
            total_revenue: currRev,
            growth_percentage: growthPct,
            rating: (4 + Math.random()).toFixed(1)  // placeholder random rating between 4.0 and 5.0
        };
    })
);

// ── Daily Appointment Frequency chart ────────
    // UI: MON TUE WED THU FRI SAT SUN bar chart
    const [dailyFrequency]=await db.query(
        `select
        dayname(appt_date) as day_name,
        dayofweek(appt_date) as day_order,
        count(*) as count
        from appointments
        where appt_date >= date_sub(curdate(), interval 7 day)
        group by dayname(appt_date), dayofweek(appt_date)
        order by dayofweek(appt_date)
        `
    );

    const allDays=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const freqMap= {};
    dailyFrequency.forEach(r =>{
        freqMap[r.day_name]= r.count;
    });
    const dailyChart= allDays.map(day =>({
        day: day.substring(0,3).toUpperCase(),
        count: freqMap[day] || 0
    }));

    // latest financial activity
        // UI: Payment Received #INV-294 $245
    //     Insurance Claim $1,850
    //     Refund Issued #INV-281 -$120
    const [financialActivity]=await db.query(
      `select i.id, i.total, i.status, i.paid_at,
      i.transaction_id, i.payment_method, 
      pu.full_name as patient_name,
      d.speciality as department
      from invoices i
      join appointments a on i.appointment_id= a.id
      join patients pat on a.patient_id=pat.id
      join users pu on pat.user_id=pu.id
      join doctors d on a.doctor_id=d.id
      where i.paid_at >= date_sub(now(), ${interval})
      order by i.paid_at desc
      limit 10
      `
    );

    res.status(200).json({
      kpis:{
        total_revenue: parseFloat(totalRevenue[0].total),
        total_appointments: totalAppointments[0].total,
        new_patients: newPatients[0].total,
        cancellation_rate: cancellationRate,
        growth:{
          revenue: calcGrowth(
            parseFloat(totalRevenue[0].total),
            parseFloat(prevRevenue[0].total)
          ),
          appointments: calcGrowth(
            totalAppointments[0].total,
            prevAppts[0].total
          )
        }
      },

      monthly_revenue_trend: revenueWithProjection,
      appointment_distrivution: distribution,
      top_performing_doctors: topDoctorsWithGrowth,
      daily_appointment_frequency: dailyChart,
      latest_financial_activity: financialActivity
    });
    
  } catch (error) {
    console.error("Error fetching revenue analysis:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// manage doctors (admin)
// from Hospital Overview to Doctors sidebar menu

export const getAllDoctorsAdmin=async (req,res) => {
  try {
    const [doctors]=await db.query(
      `select d.id, d.speciality, d.experience_years,
      d.consultation_fee, d.available_days,
      u.full_name, u.email, u.phone,
      u.profile_image, u.created_at,
      count(a.id) as total_appointments
      from doctors d
      join users u on d.user_id= u.id
      left join appointments a on a.doctor_id= d.id
      group by d.id, d.speciality, d.experience_years,
      d.consultation_fee, d.available_days,
      u.full_name, u.email, u.phone,
      u.profile_image, u.created_at
      order by u.created_at desc
      `
    );

    res.status(200).json({
      count: doctors.length,
      doctors
    });
  } catch (error) {
    console.error("Error fetching doctors:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// manage patients (admin)
export const getAllPatientsAdmin=async (req,res) => {
  try {
    const {search}= req.query;

    let query=`
    select p.id, p.dob, p.blood_group, p.address,
    u.full_name, u.email,u.phone,
    u.created_at,
    count(a.id) as total_appointments,
    coalesce(sum(i.total),0) as total_spent
    from patients p
    join users u on p.user_id= u.id
    left join appointments a on a.patient_id= p.id
    left join invoices i on i.appointment_id= a.id
    and i.status='paid'
    where 1=1
    `;
    const params=[];

    if(search){
      query += `and (u.full_name like ? or u.email like ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ` group by p.id, p.dob, p.blood_group, p.address,
    u.full_name, u.email, u.phone, u.created_at
    order by u.created_at desc
    `;

    const [patients]= await db.query(query,params);

    res.status(200).json({
      count: patients.length,
      patients
    });
  } catch (error) {
    res.status(500).json({message: 'Server error', error: error.message});
  }
};

// delete user (Admin)
// from Hospital Overview -> manage users
export const deleteUser=async (req,res) => {
  try {
    const {id}=req.params;

    // prevent admin from deleting themselves
    if(parseInt(id) === req.user.id){
      return res.status(400).json({
        message: 'You cannot delete your own account'
      });
    }

    const [userRows]=await db.query(
      `select * from users where id = ?`,[id]
    );
    if(userRows.length === 0){
      return res.status(404).json({message: 'User not found'});
    }

    await db.query('delete from users where id = ?',[id]);

    res.status(200).json({
      message: `${userRows[0].role} delete successfully`
    });
  } catch (error) {
    res.status(500).json({message: 'Server error', error:error.message});
  }
};

// get admin dashboard full stats
// single endpoint that powers the whole

export const getAdminStats=async (req,res) => {
  try {
   const [[doctors]]= await db.query(`select count(*) as total from doctors`);
   const [[patients]]= await db.query(`select count(*) as total from patients`);
   const [[appointments]]= await db.query(`select count(*) as total from appointments`);
   const [[revenue]]= await db.query(
    `select coalesce(sum(total),0) as total from invoices where status='paid'`
   );
   const [[pendingAppts]]= await db.query(
    `select count(*) as total from appointments where status='pending'`
   );
   const [[todayAppts]]=await db.query(
    `select count(*) as total from appointments where appt_date=curdate()`
   );
   const [[unpaidInvoices]]= await db.query(
    `select count(*) as total from invoices where status='unpaid' `
   );
   const [[newPatientsThisMonth]]=await db.query(
    `select count(*) as total from patients p
    join users u on p.user_id = u.id
    where month(u.created_at)= month(now())
    and year(u.created_at)= year(now())
    `
   );

   res.status(200).json({
    stats:{
      total_doctors: doctors.total,
      total_patients: patients.total,
      total_appointments: appointments.total,
      total_revenue: parseFloat(revenue.total),
      pending_appointments: pendingAppts.total,
      todays_appointments: todayAppts.total,
      unpaid_invoices: unpaidInvoices.total,
      new_patients_this_month: newPatientsThisMonth.total
    }
   });
  } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
  } 
};

// export revenue data as pdf report
export const exportRevenueReport=async (req,res) => {
  try {
    const {period= '1M'}= req.query;

    const periodMap = {
      '7D': 'INTERVAL 7 DAY',
      '1M': 'INTERVAL 1 MONTH',
      '3M': 'INTERVAL 3 MONTH',
      '1Y': 'INTERVAL 1 YEAR'
    };
    const interval= periodMap[period] || 'INTERVAL 1 MONTH';

    // Revenue summary
    const [revenueSummary]= await db.query(
      `select 
      coalesce(sum(total),0) as total_revenue,
      count(*) as total_transactions,
      coalesce(avg(total),0) as avg_transaction,
      coalesce(max(total),0) as highest_transaction
      from invoices
      where status = 'paid'
      and paid_at >= date_sub(now(), ${interval})
      `
    );

    // by department
    const [byDepartment]= await db.query(
      `select 
      d.speciality as department,
      count(a.id) as appointments,
      coalesce(sum(i.total),0) as revenue
      from appointments a
      join doctors d on a.doctor_id=d.id
      join invoices i on i.appointment_id= a.id
      where i.status= 'paid'
      and i.paid_at >= date_sub(now(), ${interval})
      group by d.speciality
      order by revenue desc
      `
    );

    res.status(200).json({
      report:{
        generated_at: new Date().toISOString(),
      period,
    summary: revenueSummary[0],
    by_department: byDepartment     
    }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message }); 
  } 
};