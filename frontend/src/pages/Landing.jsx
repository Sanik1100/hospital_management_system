import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { doctorService } from "../services/doctorService.js";

/* ── Reusable star rating ─────────────────────── */
const Stars = ({ rating = 5 }) => (
  <div className="flex gap-0.5">
    {[...Array(5)].map((_, i) => (
      <svg key={i}
           className={`w-3.5 h-3.5 ${
             i < Math.floor(rating)
               ? 'text-yellow-400'
               : 'text-gray-200'
           }`}
           fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902
                 0l1.07 3.292a1 1 0 00.95.69h3.462c.969
                 0 1.371 1.24.588 1.81l-2.8 2.034a1 1
                 0 00-.364 1.118l1.07 3.292c.3.921-.755
                 1.688-1.54 1.118l-2.8-2.034a1 1 0
                 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1
                 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1
                 1 0 00.951-.69l1.07-3.292z"/>
      </svg>
    ))}
  </div>
);

const Landing = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    doctorService
      .getAll()
      .then((res) => setDoctors(res.data.doctors?.slice(0, 3) || []))
      .catch(() => {});
  }, []);

  const specializations = [
    {
      icon: "🫀",
      name: "Cardiology",
      desc: "Comprehensive heart care focusing on prevention, diagnosis and treatment.",
    },
    {
      icon: "🧠",
      name: "Neurology",
      desc: "Advanced treatment for brain, spine, and neurological disorders.",
    },
    {
      icon: "👶",
      name: "Pediatrics",
      desc: "Dedicated medical care for infants, children, and adolescents.",
    },
    {
      icon: "🦴",
      name: "Orthopedics",
      desc: "Expert care for musculoskeletal systems, joints, and sports injuries.",
    },
  ];

  const steps = [
    {
      num: 1,
      title: "Search Your Doctor",
      desc: "Filter by specialization, experience, or location to find your perfect match.",
    },
    {
      num: 2,
      title: "Book Appointment",
      desc: "Choose a convenient time slot and confirm your booking instantly.",
    },
    {
      num: 3,
      title: "Get Your Treatment",
      desc: "Visit the clinic or join a teleconsultation for personalized care.",
    },
  ];

  const testimonials = [
    {
      text: "The booking process was incredibly smooth. I found a great specialist and got an appointment for the next day. The facility is top-notch.",
      name: "John D.",
      avatar: "JD",
    },
    {
      text: "Dr. Jenkins was wonderful with my daughter. She made the entire experience comfortable and stress-free. Highly recommend HealthCare Plus!",
      name: "Sarah M.",
      avatar: "SM",
    },
    {
      text: "Having my medical history available online and being able to message my doctor digitally has completely changed how I manage my health.",
      name: "Robert K.",
      avatar: "RK",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#3B82F6] rounded-lg flex items-center justify-center ">
              <svg
                className="w-4 h-4 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  d="M9 12l2 2 4-4m5.618-4.016A11.955
                         11.955 0 0112 2.944a11.955 11.955 0
                         01-8.618 3.04A12.02 12.02 0 003 9c0
                         5.591 3.824 10.29 9 11.622 5.176-1.332
                         9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <span className="font-bold text-[#1E293B] text-lg ">
              MediCore HMS
            </span>
          </div>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-8">
            {["Services", "Doctors", "Process", "Reviews"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-sm
      text-[#64748B] hover:text-[#1E293B] transition-colors
      "
              >
                {item}
              </a>
            ))}
          </div>

          {/*Right Side of navbar */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7
                         0 0114 0z"
                />
              </svg>
              <input
                placeholder="Search doctors..."
                className="bg-transparent text-sm outline-none w-32 text-[#1E293B] placeholder:text-gray-400 "
              />
            </div>
            <Link
              to="/login"
              className="bg-[#3B82F6] text-white text-sm font-semibold px-5 py-2 rounded-lg
    hover:bg-[#2563EB] transition-colors"
            >
              Login
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-12 items-center">
        <div>
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-blue-50 text-[#3B82F6] text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
            <div className="w-1.5 h-1.5 bg-[#3B82F6] rounded-full" />
            Trusted by 50,000+ Patients
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-[#1E293B] leading-tight mb-4">
            Your Health is Our {""}
            <span className="text-[#3B82F6]">Top Priority</span>
          </h1>
          <p className="text-[#64748B] text-base leading-relaxed mb-8 max-w-md">
            Experience world-class healthcare with our expert team of doctors,
            simplified appointment booking, and state-of-the-art medical
            facilities.
          </p>

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/find-doctor")}
              className="bg-[#3B82F6] text-white font-semibold px-6 py-3 rounded-xl hover:bg-[#2563EB] transition-all duration-200 text-sm"
            >
              Book Appointment
            </button>
            <button
              className="flex items-center gap-2 text-[#1E293B]
            font-semibold text-sm hover:text-[#3B82F6] transition-colors"
            >
              <div
                className="w-9 h-9 bg-gray-100 rounded-full
              flex items-center justify-center"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000
                           16zM9.555 7.168A1 1 0 008 8v4a1
                           1 0 001.555.832l3-2a1 1 0
                           000-1.664l-3-2z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              See How It Works
            </button>
          </div>
        </div>

        {/* Hero Image placeholder */}
        <div className="hidden md:flex items-center justify-center">
          <div
            className="w-full max-w-sm h-72 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl
          flex items-center justify-center"
          >
            <div className="text-center">
              <div className="text-6xl mb-3">🏥</div>
              <p className="text-[#64748B] text-sm font-medium">
                Modern Healthcare Facility
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Specializations */}
      <section id="services" className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#1E293B]">
              Our Specializations
            </h2>
            <p className="text-[#64748B] mt-2">
              Specialized care for every stage of your life
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {specializations.map((spec) => (
              <div
                key={spec.name}
                className="bg-white rounded-2xl p-6
              hover:shadow-md transition-shadow 
              cursor-pointer group"
              >
                <div className="text-3xl mb-3">{spec.icon}</div>
                <h3 className="font-semibold text-[#1E293B] mb-2 group-hover:text-[#3B82F6] transition-colors">
                  {spec.name}
                </h3>
                <p className="text-xs leading-relaxed text-[#64748B] ">
                  {spec.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="process" className="py-16">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-3 text-[#1E293B] ">
              How It Works
            </h2>
            <p className="text-[#64748B] mb-8">
              Getting the care you need is simpler than ever with our digital
              healthcare platform.
            </p>

            <div className="space-y-6">
              {steps.map((step) => (
                <div key={step.num} className="flex items-start gap-4">
                  <div
                    className="w-8 h-8 bg-[#3B82F6] text-white rounded-full
                  flex items-center justify-center text-sm font-bold flex-shrink-0"
                  >
                    {step.num}
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#1E293B] mb-1">
                      {step.title}
                    </h4>
                    <p className="text-sm text-[#64748B] leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* How it works image */}
          <div className="hidden md:flex items-center justify-center">
            <div className="w-72 h-72 bg-[#10B981] rounded-2xl flex items-center justify-center">
              <div className="text-center text-white">
                <div className="text-6xl mb-3">📋</div>
                <p className="font-semibold">Simple Process</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Doctor */}
      <section id="doctors" className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-[#1E293B]">
                Meet Our Featured Doctors
              </h2>
              <p className="mt-1 text-[#64748B]">
                Work with the best in the medical field
              </p>
            </div>
            <Link
              to="/find-doctor"
              className="text-sm font-semibold hover:underline flex items-center gap-1 text-[#3B82F6]"
            >
              View All Doctors →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {doctors.length > 0
              ? doctors.map((doc, i) => (
                  <div
                    key={doc.id || i}
                    className="bg-white rounded-2xl overflow-hidden
              hover:shadow-md transition-shadow"
                  >
                    {/* Doctor image */}
                    <div
                      className="h-52 bg-gradient-to-br
                from-blue-50 to-indigo-100 flex
                items-center justify-center"
                    >
                      {doc.profile_image ? (
                        <img
                          src={doc.profile_image}
                          alt={doc.full_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div
                          className="w-20 h-20 bg-[#3B82F6] rounded-full
                    flex items-center justify-center text-white
                    text-2xl font-bold"
                        >
                          {doc.full_name?.charAt(0) || "D"}
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <span className="text-xs font-semibold text-[#3B82F6] uppercase tracking-wider">
                        {doc.speciality || "General"}
                      </span>
                      <h3 className="font-bold mt-1 mb-1 text-[#1E293B]">
                        {doc.full_name}
                      </h3>
                      <p className="text-xs mb-3 text-[#64748B]">
                        {doc.experience_years || 10}+ Years Experience
                      </p>
                      <Stars rating={4.8} />
                    </div>
                  </div>
                ))
              : // Placeholder cards when no API data
                ["Cardiology", "Pediatrics", "Neurology"].map((spec, i) => (
                  <div key={i} className="bg-white rounded-2xl overflow-hidden">
                    <div
                      className="h-52 bg-gradient-to-br
                  from-blue-50 to-indigo-100 flex items-center
                  justify-center"
                    >
                      <div
                        className="w-20 h-20 bg-[#3B82F6] rounded-full flex 
                    items-center justify-center text-white text-2xl"
                      >
                        👨‍⚕️
                      </div>
                    </div>
                    <div className="p-5">
                      <span className="text-xs font-semibold uppercase tracking-wider text-[#3B82F6]">{spec}</span>
                      <h3 className="text-[#1E293B] font-bold mt-1">
                        Dr.
                        {["James Wilson", "Sarah Jenkins", "Michael Chen"][i]}
                      </h3>
                      <p className="text-xs mb-3 text-[#64748B] ">{[15, 10, 20][i]}+ Years Experience</p>
                      <Stars rating={4.8} />
                    </div>
                  </div>
                ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="reviews" className="py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12 text-[#1E293B]">
            What Our Patients Say
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t,i)=> (
              <div key={i}
              className="bg-white border border-gray-100 rounded-2xl
              p-6 hover:shadow-md transition-shadow"
              >
                <Stars rating={5}/>
                <p className="text-sm mt-4 mb-6 leading-relaxed italic text-[#64748B]">
                  "{t.text}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-[#3B82F6] rounded-full
                  flex items-center justify-center text-white text-xs font-bold">
                    {t.avatar}
                  </div>
                  <span className="text-sm font-semibold  text-[#1E293B]">{t.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-[#3B82F6] py-16 mx-6 mb-16 rounded-3xl
      max-w-6xl md:mx-auto">
        <div className="text-center text-white px-6">
          <h2 className="text-3xl font-semibold mb-3">
            Ready to Start Your Health Journey?
          </h2>
          <p className="text-blue-100 mb-8 max-w-md mx-auto">
          Book your first appointment today and get 20% off
            on your first consultation.  
          </p>
          <button
          onClick={()=> navigate('/find-doctor')}
          className="bg-white font-bold px-8 py-3.5 rounded-xl
          hover:bg-blue-50 transition-colors text-[#3B82F6]"
          >
            Book Now
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1E293B] text-white py-12">
        <div className="max-w-6xl mx-auto px-6
        grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-[#3B82F6]">
             <svg className="w-4 h-4 text-white"
                     fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m5.618-4.016A11.955
                           11.955 0 0112 2.944a11.955 11.955 0
                           01-8.618 3.04A12.02 12.02 0 003 9c0
                           5.591 3.824 10.29 9 11.622
                           5.176-1.332 9-6.03
                           9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                </svg>   
              </div>
              <span className="font-bold">MediCore HMS</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
             Providing top-tier medical solutions through a
              unified management platform designed for the
              future of healthcare.  
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4 text-sm">Quick Links</h4>
            <ul className="space-y-2">
              {['About Us','Our Doctors','Services','Careers'].map(l => (
                <li key={l}>
                  <a href="#"
                  className="text-sm text-gray-400 hover:text-white transition-colors">{l}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Patient Support */}
          <div>
            <h4 className="font-semibold mb-4 text-sm">
              Patient Support
            </h4>
            <ul className="space-y-2">
              {['Help Center','Contact Support','Privacy Policy','Terms of Use'].map(l => (
                <li key={l}>
                  <a href="#"
                  className="text-sm text-gray-400
                  hover:text-white transition-colors"
                  >
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4 text-sm">
              Contact
            </h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>📧 info@healthcareplus.com</li>
              <li>📞 +1 (555) 123-4567</li>
              <li>📍 123 Medical District, NY 10001</li>
            </ul>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 mt-10
        pt-6 border-t border-gray-700 text-center text-xs text-gray-500">
         © 2026 MediCore Plus Hospital Management System.
          All rights reserved.  
        </div>
      </footer>
    </div>
  );
};

export default Landing;
