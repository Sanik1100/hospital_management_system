import React, { useEffect, useState,useRef } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext';
import { invoiceService } from '../../services/invoiceService.js';
import toast from 'react-hot-toast';

const Invoice = () => {
  const {id}=useParams();
  const navigate = useNavigate();
  const {user} = useAuth();
  const printRef = useRef(null);

  const [invoice,setInvoice] = useState(null);
  const [loading, setLoading]= useState(true);
  const [paying, setPaying]= useState(false);

  useEffect(() => {
const fetchInvoice = async () => {
  try {
    setLoading(true);
    const res= await invoiceService.getById(id);
    setInvoice(res.data.invoice);
  } catch (err) {
    console.error(err);
    // Use placeholder for preview
setInvoice(null);
  }finally{
    setLoading(false); 
   }
};
if(id) fetchInvoice();
else setLoading(false);
  },[id]);

  const handlePay= async () => {
    try {
      setPaying(true);
      await invoiceService.pay(id, {
        payment_method: 'eSewa Digital Wallet',
      });
      toast.success('Payment successfull! ');

      const res = await invoiceService.getById(id);
      setInvoice(res.data.invoice);
    } catch{
      toast.error('Payment Failed. Please try again.');
    }finally {
      setPaying(false);
    }
  };

  const handlePrint= () => window.print();

  const data = invoice || {
    invoice_id:       'INV-2023-8912',
    doctor_name:      'Dr. Aradhana Sharma',
    speciality:        'Senior Cardiologist',
    doctor_bio:       'NMC No: 4567 • Specialist in Interventional Cardiology',
    appointment_type: 'in-clinic',
    appt_date:        '2023-10-23',
    appt_time:        '10:30:00',
    location:         'City Hospital, Kathmandu',
    payment_status:   'paid',
    payment_method:   'eSewa Digital Wallet',
    transaction_id:   'ESW-9821-XKB',
    paid_at:          '2023-10-24T09:45:00',
    patient_name:     user?.full_name || 'Bikash Thapa',
    patient_id:       `HL-${user?.id?.toString().padStart(5,'0') || '89122'}`,
    patient_phone:    user?.phone || '+977 9841234567',
    fee_breakdown: {
      consultation_fee: 1500,
      service_charge:   150,
      vat_percentage:   13,
      vat_amount:       214.50,
      subtotal:         1650,
      total:            1864.50,
    },
  };

  const feeBreakdown= data.fee_breakdown || {};
  const isPaid= data.payment_status === 'paid';

  const formatDate = (dateStr) =>{
    if(!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday:'long', month:'short',
      day:'numeric', year:'numeric'
    });
  };

   const formatTime = (timeStr) => {
    if (!timeStr) return '—';
    const [h, m] = timeStr.split(':');
    const hr   = parseInt(h);
    const ampm = hr >= 12 ? 'PM' : 'AM';
    return `${hr % 12 || 12}:${m} ${ampm}`;
  };

  const formatDateTime = (dtStr) => {
    if (!dtStr) return '—';
    return new Date(dtStr).toLocaleDateString('en-US', {
      month:'short', day:'numeric', year:'numeric',
      hour:'2-digit', minute:'2-digit'
    });
  };

  if(loading){
    return (
      <div className='min-h-screen  bg-[#F8FAFC] flex items-center justify-center'>
        <div className='w-10 h-10 border-4 border-[#F97316] border-t-transparent
        rounded-full animate-spin'/>   
      </div>
    );
  }
  return (
    <div className=' bg-[#F8FAFC] min-h-screen py-8 px-4'>
      <div className='max-w-4xl mx-auto'>

        {/* Top Bar */}
        <div className='flex items-center justify-between mb-8'>
          <div className='flex items-center gap-3'>
            <div className='bg-[#F97316] w-11 h-11 rounded-xl
            flex items-center justify-center'>
              <span className='text-white text-xl'>🧾</span>
            </div>
            <div>
              <h1 className='text-[#1E293B] text-xl font-bold'>Appointment Receipt</h1>
              <p className='text-[#64748B] text-sm'>
                Invoice #{data.invoice_id || id}
              </p>
            </div>
          </div>

          <div className='flex items-center gap-3'>
            <button
            onClick={handlePrint}
            className='flex items-center gap-2 border
            border-gray-200 bg-white px-5 py-2.5 rounded-xl
            text-sm font-semibold text-[#64748B] hover:border-gray-400
            transition-colors'
            >
                ⬇ Download PDF
            </button>
            <button 
            onClick={handlePrint}
            className='flex items-center gap-2 bg-[#F97316]
            text-white px-5 py-2.5 rounded-xl text-sm font-semibold
            hover:bg-orange-600 transition-colors'>
              🖨️ Print
            </button>
          </div>
        </div>

        <div className='grid grid-cols-3 gap-6'>

          {/* Left Column */}
          <div className='col-span-2 space-y-4'
           ref={printRef}>

            {/* Doctor Info Card */}
            <div className='bg-white rounded-2xl p-6
            border border-gray-100'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-4'>

                  {/* Doctor Avatar */}
                  <div className='w-16 h-16 bg-teal-100 rounded-full
                  flex items-center justify-center text-3xl flex-shrink-0'>
                    👨‍⚕️
                  </div>
                  <div>
                    <h2 className='text-[#1E293B] text-xl font-bold'>
                      {data.doctor_name}
                    </h2>
                    <p className='text-[#F97316] font-semibold text-sm mt-0.5'>
                      {data.speciality}
                    </p>
                    <p className='"text-xs text-[#64748B] mt-1'>
                      {data.doctor_bio}
                    </p>
                  </div>
                </div>
                <span className='bg-green-100 text-green-700 text-xs
                font-bold px-3 py-1.5 rounded-full uppercase'>
                  Confirmed
                </span>
              </div>
            </div>

            {/* Appointment Details */}
            <div className='bg-white rounded-2xl p-6 border border-gray-100'>
              <div className='flex items-center gap-2 mb-5'>
                <span className='text-[#F97316]'>📅</span>
                <h3 className='font-bold text-[#1E293B]'>Appointment Details</h3>
              </div>

              <div className='grid grid-cols-3 gap-6'>
                <div>
                  <p className='text-xs font-bold text-[#94A3B8]
uppercase tracking-wider mb-2'>Date</p>
                  <p className='font-semibold text-[#1E293B]'>
                    {formatDate(data.appt_date)}
                  </p>
                </div>
                <div>
                  <p className='text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-2'>Time</p>
                  <p className='font-semibold text-[#1E293B]'>
                    {formatTime(data.appt_time)} -{' '}
                    {formatTime(
                      data.appt_time?.replace(
                        /(\d+):/,
                        (_, h) => `${parseInt(h)+1}:` 
                      )
                    )}
                  </p>
                </div>
                <div>
                  <p className='text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-2'>
                    Location
                  </p>
                  <p className='font-semibold text-[#1E293B]'>
                    {data.location || 'City Hospital, Kathmandu'}
                  </p>
                </div>
              </div>
            </div>

            {/* Fee BreakDown */}
            <div className='bg-white rounded-2xl p-6
            border border-gray-100'>
              <div className='flex items-center gap-2 mb-5'>
                <span className='text-[#F97316]'>💳</span>
                <h3 className='font-bold text-[#1E293B]'>Fee Breakdown</h3>
              </div>

              <div className='space-y-3'>
                <div className='flex justify-between py-2
                border-b border-gray-50'>
                  <span className='text-sm text-[#64748B]'>Consultation Fee</span>
                  <span className='text-sm font-medium text-[#1E293B]'>
                    NPR {(feeBreakdown.consultation_fee || 1500).toLocaleString()}.00
                  </span>
                </div>
                <div className='flex justify-between py-2 border-b border-gray-50'>
                  <span className='text-sm text-[#64748B]'>
                    Service Charge
                  </span>
                  <span className='text-sm font-medium text-[#1E293B]'>
                    NPR {(feeBreakdown.service_charge || 150).toLocaleString()}.00
                  </span>
                </div>
                <div className='flex justify-between py-2 border-b border-gray-50 '>
                  <span className='text-sm text-[#64748B]'>
                    VAT ({feeBreakdown.vat_percentage || 13}%)
                  </span>
                  <span className='text-sm font-medium text-[#1E293B]'>
                    NPR {parseFloat(feeBreakdown.vat_amount || 214.50).toFixed(2)}
                  </span>
                </div>

                {/* Total */}
                <div className='flex justify-between pt-3'>
                  <span className='font-bold text-[#1E293B]'>
                    Total Amount
                  </span>
                  <span className='font-bold text-[#F97316] text-xl'>
                    NPR {parseFloat(feeBreakdown.total || 1864.50).toLocaleString()}.
                    {String(
                      (feeBreakdown.total || 1864.50)
                      .toFixed(2)
                    ).split('.')[1]}
                  </span>
                </div>
              </div>

              {/* Pay Now button (only if unpaid) */}
              {!isPaid && (
                <button
                onClick={handlePay}
                disabled={paying}
                className='w-full mt-6 bg-[#F97316] text-white font-bold py-3.5 rounded-xl 
                 hover:bg-orange-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-2 '
                >
                  {paying ? (
                    <>                  
                    <div className='w-4 h-4 border-2
border-white  border-t-transparent rounded-full animate-spin '/>
                    Processing...
                    </>
                  ):(
                   '💳 Pay Now' 
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className='space-y-4'>

            {/* Payment Status */}
            <div className='bg-white rounded-2xl p-5
            border border-gray-100'>
              <p className='text-xs font-bold uppercase tracking-wider mb-4
             text-[#94A3B8]'>
                Payment Status
              </p>

              <div className='flex items-center gap-3 mb-4'>
                <div className={`w-10 h-10 rounded-full
                  flex items-center justify-center 
                  text-lg font-bold ${
                    isPaid 
                    ? 'bg-green-100 text-green-600'
                    : 'bg-yellow-100 text-yellow-600'
                  }`}>
                    {isPaid ? '✓' : '!'}
                </div>
                <div>
                  <p className={`font-bold text-lg ${
                    isPaid ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {isPaid ? 'Paid' : 'Unpaid'}
                  </p>
                  {data.payment_method && (
                    <p className='text-xs text-[#64748B]'>
                      via {data.payment_method}
                    </p>
                  )}
                </div>
              </div>

              {isPaid && (
                <div className='space-y-2 pt-3 border-t border-gray-50'>
                  <div className='flex justify-between'>
                    <span className='text-xs text-[#94A3B8]'>
                      Transaction ID
                    </span>
                  <span className='text-xs font-bold  text-[#1E293B]'>
                    {data.transaction_id || 'ESW-9821-XKB' }
                  </span>
                </div>

                <div className='flex justify-between'>
                  <span className='text-xs text-[#94A3B8]'>Paid on</span>
                  <span className='text-xs font-medium text-[#1E293B]'>
                    {formatDateTime(data.paid_at)}
                  </span>
                </div>
                </div>
              )}
            </div>

            {/* Patient Information */}
            <div className='bg-white rounded-2xl p-5 border border-gray-100'>
              <p className='text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-4'>
                Patient Information
              </p>

              <div className='space-y-3'>
                <div>
                  <p className='text-xs text-[#94A3B8]'>Name</p>
                  <p className='font-semibold text-[#1E293B] text-sm'>{data.patient_name}</p>
                </div>
                <div>
                  <p className='text-xs text-[#94A3B8]'>
                    Patient iD
                  </p>
                  <p className='font-semibold text-[#1E293B] text-sm'>
                    #{data.patient_id}
                  </p>
                </div>
                <div>
                  <p className='text-xs text-[#94A3B8]'>
                    Contact
                  </p>
                  <p className='font-semibold text-[#1E293B] text-sm'>
                    {data.patient_phone}
                  </p>
                </div>
              </div>
            </div>

            {/* Need Assistance */}
            <div className='bg-orange-50 rounded-2xl p-5
            border border-orange-100'>
              <div className='flex items-center gap-2 mb-2'>
                <span className='text-[#F97316]'>❓</span>
                <p className='font-bold text-[#1E293B] text-sm'>Need Assistance?</p>
              </div>
              <p className='text-xs text-[#64748B] leading-relaxed mb-3'>
               If you have any issues with your booking or
                payment, please contact our support.  
              </p>
              <Link to='/contact'
              className='text-xs font-bold text-[#F97316] hover:underline flex items-center gap-1'>
                Contact Support  → 
              </Link>
            </div>   
          </div>
        </div>

        {/* Footer */}
        <div className='text-center mt-10 space-y-2'>
          <p className='text-sm text-[#64748B]'>
             © 2026 HealthLink Nepal. All rights reserved.
          </p>
          <p className='text-xs text-[#94A3B8]'>
            This is a computer-generated receipt and does not
            require a physical signature. 
          </p>
          <div className='flex items-center justify-center
           gap-4 text-xs text-[#94A3B8]'>
            <Link to='/privacy'
            className='hover:text-[#F97316]'>
              Privacy Policy
            </Link>
            <span>•</span>
            <Link to='/terms'
            className='hover:text-[#F97316]'>Terms of Service</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Invoice;