import React, { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom';
import {patientService} from '../../services/patientService.js';
import {invoiceService} from '../../services/invoiceService.js';


// Sidebar Nav Item
const NavItem = ({icon, label, active, onClick, danger}) => (
  <button
  onClick={onClick}
  className={`w-full flex items-center gap-3 px-4
    py-3 rounded-xl text-sm font-medium transition-all
    duration-200 ${
      danger
      ? 'text-red-500 hover:bg-red-50'
      : active
      ? 'bg-[#3B82F6] text-white'
      : 'text-[#64748B] hover:bg-gray-50 hover:text-[#1E293B]'
    }`}
  >
    <span className='text-lg'>{icon}</span>
    {label}
  </button>
);

// Stat Card
const StatCard=({title, value, sub, subColor, icon, iconBg}) => (
  <div className='bg-white  rounded-2xl p-5 border border-gray-100 
  hover:shadow-md transition-shadow'>
    <div className='flex items-start justify-between mb-3'>
      <p className='text-sm text-[#64748B] font-medium '>{title}</p>
      <div className={`w-10 h-10 ${iconBg} rounded-xl
      flex items-center justify-center text-lg`}>
        {icon}
      </div>
    </div>

    <p className='text-2xl font-bold text-[#1E293B]'>{value}</p>
    {sub && (
      <p className={`text-xs mt-1 font-medium ${subColor}`}>
        {sub}
      </p>
    )}
  </div>
);

const PatientDashboard = () => {
  const {user,logout} = useAuth();
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState('Dashboard');
  const [stats, setStats] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsRes, invoiceRes]=await Promise.all([
          patientService.getMyDashboard(),
          invoiceService.getMyInvoices(),
        ]);
        setStats(statsRes.data);
        setInvoices(invoiceRes.data.invoices || []);
      } catch (err) {
        console.error(err);        
      }finally{
        setLoading(false);
      }  
    };
    fetchData();
  },[]);

  const navItems = [
    { icon: '⊞',  label: 'Dashboard',       key: 'Dashboard'   },
    { icon: '📅', label: 'Book Appointment', key: 'Book'        },
    { icon: '🗓️', label: 'My Appointments',  key: 'Appointments'},
    { icon: '💳', label: 'Payment History',  key: 'Payment'     },
    { icon: '👤', label: 'Profile',          key: 'Profile'     },
  ];

  const upcomingAppointments = stats?.upcoming_appointments || [];
  const labReports = stats?.recent_lab_reports || [];
  const transactions = stats?.recent_transactions || [];

  const unpaidInvoice = invoices.find(i =>
    i.payment_status === 'unpaid'
  );
  const dueAmount= invoices
  .filter(i => i.payment_status === 'unpaid')
  .reduce((sum,i) => sum + parseFloat(i.invoice_total || 0), 0);

  // Skeleton Loader
  if(loading){
    return (
      <div className='flex h-screen bg-[#F8FAFC]'>
        <div className='w-64 bg-white border-r border-gray-100
        animate-pulse'/>
        <div className='flex-1 p-8 space-y-4 animate-pulse'>
          <div className='h-8 bg-gray-200 rounded w-1/4'/>
          <div className='grid grid-cols-4 gap-4'>
            {[1,2,3,4].map(i => (
              <div key={i} className='h-28 bg-gray-200 rounded-2xl'/>
            ))}
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className='flex h-screen bg-[#F8FAFC] overflow-hidden'>

      {/* Sidebar */}
      <aside className='w-64 bg-white border-r border-gray-100
      flex flex-col flex-shrink-0'>

        { /* Logo */}
        <div className='p-6 border-b border-gray-100'>
          <div className='flex items-center gap-2'>
            <div className='w-8 h-8 rounded-lg flex items-center justify-center bg-[#3B82F6] '>
              <span className='text-white font-bold text-sm'>+</span>
            </div>
            <span className='font-bold text-[#1E293B] text-lg'>MediCore</span>
          </div>
        </div>

        {/* User Info */}
        <div className='border-b border-gray-100 p-4'>
          <div className='flex items-center gap-3'>
            <div className='w-10 h-10 rounded-full flex
            items-center justify-center text-white font-bold
            text-sm flex-shrink-0 bg-[#3B82F6]'>
              {user?.full_name?.charAt(0) || 'J'}
            </div>
            <div className='min-w-0'>
              <p className='font-semibold text-sm truncate text-[#1E293B] '>
                {user?.full_name || 'John Doe'}
              </p>
              <p className='text-xs text-[#64748B]'>
                ID: #PT-{user?.id?.toString().padStart(5, '0') || '88291'}
              </p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className='flex-1 p-4 space-y-1 overflow-y-auto'>
          {navItems.map(item => (
            <NavItem
            key={item.key}
            icon={item.icon}
            label={item.label}
            active={activeNav === item.key}
            onClick={()=> {
              setActiveNav(item.key);
              if(item.key === 'Book')
                navigate('/find-doctor');
            }}
            />
          ))}
        </nav>

        {/* Sign Out */}
        <div className='p-4 border-t border-gray-100'>
          <NavItem
          icon='🚪'
          label= 'Sign Out'
          danger
          onClick={logout}
          />
        </div>
      </aside>

      {/* Main Content */}
      <div className='flex-1 flex flex-col overflow-hidden'>

        {/* Top Bar */}
        <header className='bg-white border-b border-gray-100 px-6 py-4
        flex items-center justify-between flex-shrink-0'>
          <div className='flex items-center gap-3 bg-gray-50
          border border-gray-200 rounded-xl px-4 py-2.5 flex-1 max-w-lg'>
            <svg className="w-4 h-4 text-gray-400"
                 fill="none" viewBox="0 0 24 24"
                 stroke="currentColor">
              <path strokeLinecap="round"
                    strokeLinejoin="round" strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0
                       7 7 0 0114 0z"/>
            </svg>
            <input
            placeholder='Search appointments, doctors, or lab reports...'
            className='bg-transparent text-sm outline-none
            flex-1 placeholder:text-gray-400'
            />
          </div>

          <div className='flex items-center gap-3 ml-4'>
            {/* Notification bell */}
            <button className='w-10 h-10 bg-gray-50
            border border-gray-200 rounded-xl flex
            items-center justify-center relative
            hover:bg-gray-100'>
              <span className='text-lg'>🔔</span>
            </button>

            {/* Settings */}
            <button className='"w-10 h-10 bg-gray-50
                               border border-gray-200
                               rounded-xl flex items-center
                               justify-center
                               hover:bg-gray-100'>
              <span className='text-lg'>⚙️</span>
            </button>

            {/* Patient View badge */}
            <span className='text-[#64748B] bg-gray-100 text-xs font-semibold
            px-4 py-2 rounded-lg'>
              Patient View
            </span>
          </div>
        </header>

        {/* Scrollable Body */}
        <div className='flex-1 overflow-y-auto p-6'>
          <div className='flex gap-6'>

            {/* Left Column */}
            <div className='flex-1 min-w-0 space-y-6'>

              {/* Page Title */}
              <div>
                <h1 className='text-3xl font-bold text-[#1E293B] '>
                  Patient Dashboard
                </h1>
                <p className='text-[#64748B] mt-1 text-sm'>
              Welcome back,{' '}
                  {user?.full_name?.split(' ')[0] || 'John'}.
                  Here is your health and appointment summary
                  for today.    
                </p>
              </div>

              {/* Stat Cards */}
              <div className='grid grid-cols-2 xl:grid-cols-4 gap-4'>
                <StatCard
                title='Total Appointments'
                value={stats?.stats?.total_appointments || 24}
                sub='+2 this month'
                subColor='text-[#10B981]'
                icon='📅'
                iconBg='bg-blue-50'
                />
                <StatCard
                title='Upcoming Visits'
                value={
                  String(stats?.stats?.upcoming_visits || 2).padStart(2, '0')
                }
                sub={`Next: ${
                  stats?.stats?.next_appointment
                  ? new Date(stats.stats.next_appointment)
                  .toLocaleDateString('en-US',{
                    month:'short', day:'numeric'
                  })
                  :'Oct 14'
                }`}
                subColor='text-[#64748B]'
                icon='🗂️'
                iconBg='bg-orange-50'
                />

                <StatCard
                title='Total Spent'
                value={`$${
                  parseFloat(
                    stats?.stats?.total_spent || 1240
                  ).toLocaleString()
                }`}
                sub='All services'
                subColor='text-[#64748B]'
                icon='💰'
                iconBg='bg-green-50'
                />

                <StatCard
                title='Unpaid Invoices'
                value={
                  String(stats?.stats?.unpaid_invoices || 1).padStart(2, '0')
                }
                sub="Action required"
                subColor='text-red-500'
                icon='❗'
                iconBg='bg-red-50'
                />
              </div>

              {/* Upcoming Appointments */}
              <div className='bg-white rounded-2xl p-6 border border-gray-100'>
                <div className='flex items-center justify-between mb-5'>
                  <h2 className='text-[#1E293B] text-lg fot-bold'>
                    Upcoming Appointments
                  </h2>
                  <button className='text-[#3B82F6] text-sm font-semibold hover:underline'>
                    View All
                  </button>
                </div>

                <div className='grid grid-cols-1 xl:grid-cols-2 gap-4'>
                  {upcomingAppointments.length > 0
                  ? upcomingAppointments.map((appt,i)=> (
                    <AppointmentCard
                    key={appt.id || i}
                    appt={appt}
                    />
                  ))
                  : [
                   { doctor_name: 'Dr. Sarah Wilson',
                          speciality: 'Cardiologist',
                          status: 'confirmed',
                          appt_date: '2023-10-14',
                          appt_time: '09:30:00' },
                        { doctor_name: 'Dr. Michael Chen',
                          speciality: 'General Physician',
                          status: 'pending',
                          appt_date: '2023-10-22',
                          appt_time: '14:15:00' }, 
                  ].map((appt,i) => (
                    <AppointmentCard
                    key={i}
                    appt={appt}
                    />
                  ))
                  }
                </div>
              </div>

              {/* Recent Lab Reports */}
              <div className='bg-white rounded-2xl p-6 border border-gray-100'>
                <div className='flex items-center justify-between mb-5'>
                  <h2 className='text-[#1E293B] text-lg font-bold'>
                    Recent Lab Reports
                  </h2>
                  <button className='hover:text-[#1E293B] text-gray-400'>
                      ☰
                  </button>
                </div>

                <div className='space-y-3'>
                  {(labReports.length > 0 ? labReports : [
                  { diagnosis: 'Blood Count Analysis',
                      record_date: '2023-09-28',
                      speciality: 'Hematology' },
                    { diagnosis: 'Lipid Profile Test',
                      record_date: '2023-09-15',
                      speciality: 'Biochemistry' }, 
                  ]).map((report,i) => (
                    <div key={i}
                    className='flex items-center justify-between 
                    py-3 border-b border-gray-50 last:border-0'>
                      <div className='flex items-center gap-3'>
                        <div className={`w-10 h-10 rounded-xl
                        flex items-center justify-center text-lg
                        ${i % 2 === 0 
                          ? 'bg-red-50'
                          : 'bg-blue-50'
                        }`}>
                          {i % 2 === 0 ? '📄' : '📋'}
                      </div>

                      <div>
                        <p className='text-[#1E293B] text-sm font-semibold '>
                          {report.diagnosis}
                        </p>
                        <p className='text-[#64748B] text-xs mt-0.5'>
                          {new Date(report.record_date)
                          .toLocaleDateString('en-US',{
                            month:'long', day:'numeric',
                            year:'numeric'
                          })} {' '}
                          • {report.speciality}
                        </p>
                      </div>
                      </div>
                      <button className='text-[#3B82F6] flex items-center gap-1 text-xs font-semibold hover:underline'>
                         <span>⬇</span> PDF
                      </button>
                      </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column Payment Summary */}
            <div className='w-72 flex-shrink-0 space-y-4'>
              <h2 className='text-[#1E293B] text-lg font-bold pt-1'>
                Payment Summary
              </h2>

              {/* Due Amount Card */}
              <div className='bg-white rounded-2xl p-5 border border-gray-100'>
                <p className='text-[#3B82F6] text-xs font-bold uppercase tracking-wider mb-2'>
                  Due Amount
                </p>
                <p className='text-[#1E293B] text-4xl font-bold mb-1'>
                  ${dueAmount.toFixed(2)}
                  <span className='text-[#64748B] ml-1 text-sm font-normal'>USD</span>
                </p>
                <button
                onClick={()=> unpaidInvoice && 
                  navigate(`/patient/invoice/${unpaidInvoice.invoice_id}`)
                }
                className='bg-[#3B82F6] w-full text-white 
                font-bold py-3 rounded-xl mt-4 hover:bg-[#2563EB] transition-colors
                text-sm'
                >
                  Pay Now
                </button>
              </div>

              {/* Recent Transactions */}
              <div className='bg-white rounded-2xl p-5 border border-gray-200'>
                <p className=' text-[#94A3B8] uppercase text-xs font-bold tracking-wider mb-4'>
                  Recent Transactions
                </p>
                <div className='space-y-3'>
                  {(transactions.length > 0
                    ? transactions
                    : [
                      {doctor_name: 'Consultation Fee',
                          paid_at: '2023-10-02',
                          total: 120},
                      { doctor_name: 'Pharmacy Refill',
                          paid_at: '2023-09-28',
                          total: 32.50 },
                       { doctor_name: 'X-Ray Diagnostics',
                          paid_at: '2023-09-20',
                          total: 210 },        
                    ]
                  ).slice(0,3).map((tx,i)=>(
                    <div key={i}
                    className='flex items-center justify-between'>
                      <div className='flex items-center gap-2'>
                        <div className='w-6 h-6 bg-green-100 rounded-full flex
                        items-center justify-center'>
                          <span className='text-green-500 text-xs'>
                            ✓ 
                          </span>
                        </div>
                        <div>
                          <p className='text-[#1E293B] text-xs font-semibold'>
                            {tx.doctor_name}
                          </p>
                          <p className='text-[#94A3B8] text-[10px]'>
                            {tx.paid_at 
                            ?
                            new Date(tx.paid_at)
                            .toLocaleDateString('en-US',{
                              month:'short', day:'numeric',
                              year:'numeric'
                            })
                            :''
                            }
                          </p>
                        </div>
                      </div>

                      <span className='text-[#1E293B] text-xs font-bold'>
                        -${parseFloat(tx.total).toFixed(2)}
                      </span>
                      </div>
                  ))}
                </div>
              </div>

              {/* Saved Card */}
              <div className='bg-[#1E293B] rounded-2xl p-5 text-white'>
                <p className='text-xs text-gray-400 mb-3 uppercase
                tracking-wider font-semibold'>
                  Saved card
                </p>
                <p className='text-sm tracking-widest mb-4 text-gray-300'>
                 •••• •••• •••• ••••  
                </p>
                <p className='text-xl font-bold tracking-wider'>
                  4291
                </p>
                <div className='flex justify-between mt-4'>
                  <div>
                    <p className='text-[10px] text-gray-400 uppercase'>Card Holder</p>
                    <p className='text-sm font-semibold'>
                      {user.full_name || 'John Doe '}
                    </p>
                  </div>
                  <div className='text-right'>
                    <p className='text-[10px] text-gray-400 uppercase'>Expires</p>
                    <p className='text-sm font-semibold'>08/25</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Appointment Card Component
const AppointmentCard=({appt}) => {
  const statusColors= {
    confirmed: 'bg-green-100 text-green-700',
    pending:   'bg-yellow-100 text-yellow-700',
    cancelled: 'bg-red-100 text-red-700',
    completed: 'bg-blue-100 text-blue-700', 
  };

  const formatTime=(time) => {
    if(!time) return '09:30 AM';
    const [h,m] = time.split(':');
    const hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12= hour % 12 || 12;
    return `${hour12}: ${m} ${ampm}`;
  };

  return(
    <div className='border border-gray-100 rounded-2xl p-4
    hover:border-[#3B82F6] transition-colors'>
      <div className='flex items-start justify-between mb-3'>
        <div className='flex items-center gap-3'>
          <div className='w-10 h-10 bg-blue-50 rounded-xl
           flex items-center justify-center
           text-xl'>
             👨‍⚕️
          </div>
          <div>
            <p className='font-bold text-[#1E293B] text-sm'>
              {appt.doctor_name}
            </p>
            <p className='text-xs text-[#64748B]'>
              {appt.speciality}
            </p>
          </div>
        </div>
        <span className={`text-[10px] font-bold px-2 py-1
          rounded-full uppercase ${
            statusColors[appt.status] || 
            statusColors.pending
          }`}>
          {appt.status}
        </span>
      </div>

      <div className='flex items-center gap-4 mb-4
      text-xs text-[#64748B]'>
        <span className='flex items-center gap-1'>
           📅{' '}
           {appt.appt_date
           ? new Date(appt.appt_date)
           .toLocaleDateString('en-US', {
            month:'short', day:'numeric', year:'numeric'
           })
           : 'Oct 14, 2025'
           }
        </span>
        <span className='flex items-center gap-1'>
           🕐 {formatTime(appt.appt_time)}
        </span>
      </div>

      <div className='flex items-center gap-2'>
        <button className='flex-1 bg-[#3B82F6] text-white
        py-2 rounded-xl text-xs font-semibold
        hover:bg-[#2563EB] transition-colors'>
          {appt.status === 'pending' 
          ? 'Check Status' : 'Reschedule'
          }
        </button>
        <button className='w-9 h-9 border border-gray-200
       rounded-xl flex items-center
         justify-center text-[#64748B]
         hover:bg-gray-50 text-lg'>···</button>
      </div>
    </div>
  );
};

export default PatientDashboard;