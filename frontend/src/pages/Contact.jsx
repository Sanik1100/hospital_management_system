import { useState }        from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast               from 'react-hot-toast';
import API                 from '../services/api.js';

const Contact = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    full_name: '',
    email:     '',
    subject:   'General Inquiry',
    message:   '',
  });
  const [sending, setSending] = useState(false);
  const [errors,  setErrors]  = useState({});

  const validate = () => {
    const errs = {};
    if (!formData.full_name.trim())
      errs.full_name = 'Name is required';
    if (!formData.email)
      errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      errs.email = 'Enter a valid email';
    if (!formData.message.trim())
      errs.message = 'Message is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name])
      setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setSending(true);
      await API.post('/contact', formData);
      toast.success('Message sent successfully! We\'ll get back to you soon. 📬');
      setFormData({
        full_name: '', email: '',
        subject: 'General Inquiry', message: ''
      });
    } catch {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const contactInfo = [
    {
      icon:  '📍',
      iconBg: 'bg-blue-100',
      title: 'Our Location',
      lines: ['123 Health Ave, Medical District',
              'New York, NY 10001'],
    },
    {
      icon:  '📞',
      iconBg: 'bg-blue-100',
      title: 'Phone Support',
      lines: ['+1 (555) 123-4567',
              'Toll Free: 1-800-MEDI-HELP'],
    },
    {
      icon:  '✉️',
      iconBg: 'bg-blue-100',
      title: 'Email Address',
      lines: ['info@medihealth.hospital',
              'support@medihealth.hospital'],
    },
  ];

  const workingHours = [
    { day: 'Mon - Fri:', hours: '8:00 AM - 9:00 PM' },
    { day: 'Saturday:',  hours: '9:00 AM - 6:00 PM' },
    { day: 'Sunday:',    hours: 'Closed'             },
    { day: 'Emergency:', hours: '24/7 Available',
      highlight: true },
  ];

  return (
    <div className="min-h-screen bg-white">

      {/* ── Navbar ───────────────────────────────── */}
      <nav className="bg-white border-b border-gray-100
                      sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4
                        flex items-center justify-between">
          <Link to="/"
                className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#3B82F6] rounded-lg
                            flex items-center justify-center">
              <span className="text-white text-xs font-bold">+</span>
            </div>
            <span className="font-bold text-[#1E293B]">
              MediHealth
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {['Home','Doctors','Services','Contact'].map(l => (
              <Link key={l} to={l==='Home' ? '/' :
                               l==='Contact' ? '/contact' :
                               '/find-doctor'}
                    className={`text-sm font-medium
                                transition-colors ${
                      l === 'Contact'
                        ? 'text-[#3B82F6]'
                        : 'text-[#64748B] hover:text-[#1E293B]'
                    }`}>
                {l}
              </Link>
            ))}
          </div>

          <Link
            to="/login"
            className="bg-[#3B82F6] text-white text-sm
                       font-semibold px-5 py-2 rounded-xl
                       hover:bg-[#2563EB] transition-colors"
          >
            Patient Portal
          </Link>
        </div>
      </nav>

      {/* ── Main Content ─────────────────────────── */}
      <div className="max-w-6xl mx-auto px-6 py-14">

        {/* Page Header */}
        <div className="mb-10">
          <h1 className="text-5xl font-black text-[#1E293B]">
            Contact Us
          </h1>
          <p className="text-[#64748B] mt-3 max-w-xl
                        leading-relaxed">
            We're dedicated to providing exceptional care.
            Whether you have a question about our services or
            need to schedule a consultation, our team is here
            for you 24/7.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-10">

          {/* ── Contact Form ───────────────────── */}
          <div className="bg-white border border-gray-100
                          rounded-2xl p-8 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <span className="text-[#3B82F6]">✉️</span>
              <h2 className="text-lg font-bold text-[#1E293B]">
                Send us a Message
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Name + Email side by side */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="input-label">Full Name</label>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className={`input-field ${
                      errors.full_name ? 'border-red-400' : ''
                    }`}
                  />
                  {errors.full_name && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.full_name}
                    </p>
                  )}
                </div>
                <div>
                  <label className="input-label">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    className={`input-field ${
                      errors.email ? 'border-red-400' : ''
                    }`}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.email}
                    </p>
                  )}
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="input-label">Subject</label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="input-field appearance-none
                             cursor-pointer"
                >
                  {['General Inquiry',
                    'Appointment Booking',
                    'Billing & Payments',
                    'Medical Records',
                    'Technical Support',
                    'Complaint'].map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              {/* Message */}
              <div>
                <label className="input-label">
                  Your Message
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={5}
                  placeholder="How can we help you?"
                  className={`input-field resize-none ${
                    errors.message ? 'border-red-400' : ''
                  }`}
                />
                {errors.message && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.message}
                  </p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={sending}
                className="bg-[#3B82F6] text-white font-bold
                           px-8 py-3 rounded-xl
                           hover:bg-[#2563EB] transition-colors
                           text-sm disabled:opacity-60
                           flex items-center gap-2"
              >
                {sending ? (
                  <>
                    <div className="w-4 h-4 border-2
                                    border-white
                                    border-t-transparent
                                    rounded-full animate-spin"/>
                    Sending...
                  </>
                ) : (
                  'Send Message'
                )}
              </button>
            </form>
          </div>

          {/* ── Right Column ───────────────────── */}
          <div className="space-y-6">

            {/* Direct Contact Info */}
            <div>
              <h2 className="text-xl font-bold text-[#1E293B]
                             mb-5">
                Direct Contact
              </h2>

              <div className="space-y-5">
                {contactInfo.map((info, i) => (
                  <div key={i}
                       className="flex items-start gap-4">
                    <div className={`w-11 h-11 ${info.iconBg}
                                     rounded-xl flex items-center
                                     justify-center text-xl
                                     flex-shrink-0`}>
                      {info.icon}
                    </div>
                    <div>
                      <p className="font-bold text-[#1E293B]
                                    text-sm mb-1">
                        {info.title}
                      </p>
                      {info.lines.map((line, j) => (
                        <p key={j}
                           className="text-sm text-[#64748B]">
                          {line}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Map placeholder */}
            <div className="bg-gradient-to-br from-blue-50
                            to-cyan-50 rounded-2xl h-44
                            flex items-center justify-center
                            border border-blue-100 relative
                            overflow-hidden">
              <div className="absolute inset-0 opacity-20"
                   style={{
                     backgroundImage: `
                       linear-gradient(#3B82F6 1px, transparent 1px),
                       linear-gradient(90deg, #3B82F6 1px, transparent 1px)
                     `,
                     backgroundSize: '30px 30px'
                   }}
              />
              <div className="relative text-center">
                <span className="text-4xl">📍</span>
                <div className="bg-white rounded-xl
                                shadow-md px-4 py-2 mt-2">
                  <p className="text-xs font-bold
                                text-[#1E293B]">
                    MediHealth Center
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer ───────────────────────────────── */}
      <footer className="bg-white border-t border-gray-100
                         py-12 mt-10">
        <div className="max-w-6xl mx-auto px-6
                        grid grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-[#3B82F6] rounded-lg
                              flex items-center justify-center">
                <span className="text-white text-xs font-bold">
                  +
                </span>
              </div>
              <span className="font-bold text-[#1E293B]">
                MediHealth
              </span>
            </div>
            <p className="text-sm text-[#64748B] leading-relaxed
                          mb-4">
              Leading the way in medical excellence with
              state-of-the-art facilities and compassionate care.
            </p>
            <div className="flex gap-2">
              {['🌐','🔗','👍'].map((icon, i) => (
                <button key={i}
                        className="w-9 h-9 bg-gray-100
                                   rounded-full flex items-center
                                   justify-center text-sm
                                   hover:bg-gray-200
                                   transition-colors">
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-[#1E293B] mb-4 text-sm">
              Quick Links
            </h4>
            <ul className="space-y-2">
              {['Our Services','Find a Doctor',
                'Emergency Care','Book Appointment'].map(l => (
                <li key={l}>
                  <a href="#"
                     className="text-sm text-[#64748B]
                                hover:text-[#3B82F6]
                                transition-colors">
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Working Hours */}
          <div>
            <h4 className="font-bold text-[#1E293B] mb-4 text-sm">
              Working Hours
            </h4>
            <div className="space-y-2">
              {workingHours.map((wh, i) => (
                <div key={i}
                     className="flex justify-between text-sm">
                  <span className="text-[#64748B]">{wh.day}</span>
                  <span className={`font-medium ${
                    wh.highlight
                      ? 'text-[#3B82F6]'
                      : 'text-[#1E293B]'
                  }`}>
                    {wh.hours}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 mt-8
                        pt-6 border-t border-gray-100
                        text-center text-xs text-[#94A3B8]">
          © 2024 MEDIHEALTH HOSPITAL MANAGEMENT SYSTEM.
          ALL RIGHTS RESERVED.
        </div>
      </footer>
    </div>
  );
};

export default Contact;