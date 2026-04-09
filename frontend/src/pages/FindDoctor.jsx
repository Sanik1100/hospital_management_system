import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { doctorService } from "../services/doctorService.js";

const Stars = ({ rating = 4.8 }) => (
  <div className="flex items-center gap-1">
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <svg
          key={i}
          className={`w-3.5 h-3.5 ${
            i < Math.floor(rating) ? "text-yellow-400" : "text-gray-200"
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            d="M9.049 2.927c.3-.921 1.603-.921 1.902
                   0l1.07 3.292a1 1 0 00.95.69h3.462c.969
                   0 1.371 1.24.588 1.81l-2.8 2.034a1 1
                   0 00-.364 1.118l1.07 3.292c.3.921-.755
                   1.688-1.54 1.118l-2.8-2.034a1 1 0
                   00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1
                   1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1
                   1 0 00.951-.69l1.07-3.292z"
          />
        </svg>
      ))}
    </div>
    <span className="text-xs text-[#64748B] font-medium">{rating}</span>
  </div>
);

{
  /* Doctor Card */
}
const DoctorCard = ({ doctor, onBook }) => (
  <div
    className="bg-white rounded-2xl border border-gray-100
  hover:shadow-md transition-shadow p-5"
  >
    <div className="flex gap-4">
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <div
          className="w-16 h-16 rounded-xl 
        bg-gradient-to-br from-blue-100 to-indigo-100
        flex items-center justify-center overflow-hidden"
        >
          {doctor.profile_image ? (
            <img
              src={doctor.profile_image}
              alt={doctor.full_name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-2xl">👨‍⚕️</span>
          )}
        </div>
        {/* Online indicator */}
        <div
          className="absolute -bottom-0.5 -right-0.5
        w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white"
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-bold text-[#1E293B] text-sm">
              {doctor.full_name}
            </h3>
            <p className="text-[#3B82F6] text-xs font-medium mt-0.5">
              {doctor.speciality}
            </p>
          </div>
          <Stars rating={parseFloat((4 + Math.random()).toFixed(1))} />
        </div>

        <div className="flex items-center gap-3 mt-2">
          <span className="flex items-center gap-1 text-xs text-[#64748B]">
            🗓️ {doctor.experience_years || 10}+ years
          </span>
          <span className="flex items-center gap-1 text-xs text-[#64748B]">
            📍 {(Math.random() * 5 + 0.5).toFixed(1)} miles
          </span>
        </div>
      </div>
    </div>

    {/* Fee + Availability */}
    <div
      className="mt-4 pt-4 border-t border-gray-50
    flex items-center justify-between"
    >
      <div>
        <p className="text-xs text-[#94A3B8] uppercase tracking-wider font-medium">
          Consultation Fee
        </p>
        <p className="text-lg font-bold text-[#1E293B]">
          ${doctor.consultation_fee || 85}.00
        </p>
      </div>

      <div className="text-right">
        <p className="text-xs text-[#94A3B8] uppercase tracking-wider font-medium">
          Next Available
        </p>
        <p className="text-xs font-semibold text-[#10B981]"> Today, 4:30 PM</p>
      </div>
    </div>

    {/** Buttons */}
      <div className="flex gap-3 mt-4">
        <button className="flex-1 py-2.5
        border border-gray-200 rounded-xl text-sm
        font-medium  text-[#1E293B] hover:border-[#3B82F6]
        hover:text-[#3B82F6] transition-all">View Profile</button>
        <button
        onClick={()=> onBook(doctor)}
        className="flex-1 py-2.5 bg-[#3B82F6] text-white
                   rounded-xl text-sm font-semibold
                   hover:bg-[#2563EB] transition-colors"
        >Book Now
        </button>
      </div>
  </div>
);

const FindDoctor = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [specialities, setSpecialities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeSpec, setActiveSpec] = useState("All Specialists");
  const [feeRange, setFeeRange] = useState("");
  const [gender, setGender] = useState("Any");
  const [availability, setAvailability] = useState([]);

  const specTabs = [
    "All Specialists",
    "Cardiology",
    "Pediatrics",
    "Psychology",
    "Available Today",
    "Top Rated",
  ];

  // fetch doctors
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        const params = {};
        if (search) params.search = search;
        if (
          activeSpec !== "All Specialists" &&
          activeSpec !== "Available Today" &&
          activeSpec !== "Top Rated"
        )
          params.speciality = activeSpec;

        const res = await doctorService.getAll(params);
        setDoctors(res.data.doctors || []);
      } catch {
        setDoctors([]);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, [search, activeSpec]);

  // fetch specialities
  useEffect(() => {
    doctorService
      .getSpecialities()
      .then((res) => setSpecialities(res.data.specialities || []))
      .catch(() => {});
  }, []);

  const handleBook = (doctor) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    navigate("/patient/dashboard", {
      state: { bookDoctor: doctor },
    });
  };

  const handleAvailability = (val) => {
    setAvailability((prev) =>
      prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val],
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="border-b border-gray-100 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-[#3B82F6] rounded-lg flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    d="M9 12l2 2 4-4m5.618-4.016A11.955
                           11.955 0 0112 2.944a11.955 11.955 0
                           01-8.618 3.04A12.02 12.02 0 003 9c0
                           5.591 3.824 10.29 9 11.622
                           5.176-1.332 9-6.03
                           9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <span className="font-bold text-[#1E293B]">MediCore HMS</span>
            </div>

            {/* NavLinks */}
            <div className="hidden md:flex items-center gap-6">
              {["Find Doctors", "Appointments", "Records", "Medicines"].map(
                (item) => (
                  <a
                    key={item}
                    href="#"
                    className={`text-sm font-medium transition-colors ${
                      item === "Find Doctors"
                        ? "text-[#3B82F6]"
                        : "text-[#64748B] hover:text-[#1E293B]"
                    }`}
                  >
                    {item}
                  </a>
                ),
              )}
            </div>
          </div>

          {/* Search + Avatar */}
          <div className="flex items-center gap-3">
            <div
              className="flex items-center gap-2 bg-gray-50
            border border-gray-200 rounded-lg px-3 py-2"
            >
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
                placeholder="Search appointments"
                className="bg-transparent text-sm outline-none w-40 placeholder:text-gray-400"
              />
            </div>
            {isAuthenticated ? (
              <div
                className="w-9 h-9 bg-[#3B82F6] rounded-full
              flex items-center justify-center text-white text-sm font-bold cursor-pointer"
              >
                U
              </div>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="text-white text-sm font-semibold
              px-4 py-2 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] transition-colors"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#1E293B]">
            {" "}
            Find your specialist
          </h1>
          <p className="mt-2 text-[#64748B] ">
            Access 1,000+ certified doctors and book your visit instantly.
          </p>
        </div>

        {/* Search Bar */}
        <div className="flex gap-3 mb-6">
          <div
            className="flex-1 flex items-center gap-3 bg-white border border-gray-200
          rounded-xl px-4 py-3.5 shadow-sm"
          >
            <svg
              className="w-5 h-5 text-gray-400 flex-shrink-0"
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
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, speciality or clinic"
              className="flex-1 text-sm outline-none placeholder:text-gray-400 text-[#1E293B]"
            />
          </div>

          {/* Location */}
          <div
            className="flex items-center gap-2 border border-gray-200 rounded-xl
          px-4 py-3.5 bg-white shadow-sm min-w-[140px]"
          >
            <span className="text-gray-400">📍</span>
            <span className="text-sm text-[#1E293B]"> New York, NY</span>
          </div>

          {/* search button */}
          <button
            className="bg-[#3B82F6] text-white px-6
          rounded-xl font-semibold text-sm hover:bg-[#2563EB]
          transition-colors flex items-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 010 2H4a1
                       1 0 01-1-1zm3 6a1 1 0 011-1h10a1 1
                       0 010 2H7a1 1 0 01-1-1zm4 6a1 1 0
                       011-1h2a1 1 0 010 2h-2a1 1 0 01-1-1z"
              />
            </svg>
            Search
          </button>
        </div>

        {/* Speciality Tabs */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {specTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveSpec(tab)}
              className={`px-4 py-2 rounded-full text-sm
              font-medium transition-all border ${
                activeSpec === tab
                  ? "bg-[#3B82F6] text-white border-[#3B82F6]"
                  : "bg-white text-[#64748B] border-gray-200 hover:border-[#3B82F6] hover:text-[#3B82F6]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <div className="hidden lg:block w-64 flex-shrink-0 space-y-6">
            {/* Availability */}
            <div>
              <h4 className="font-semibold text-[#1E293B] text-sm mb-3">
                Availability
              </h4>
              <div className="space-y-2.5">
                {["Available Today", "Next 3 Days", "Weekends"].map((opt) => (
                  <label
                    key={opt}
                    className="flex items-center gap-2.5 cursor-pointer group"
                  >
                    <input
                      type="checkbox"
                      checked={availability.includes(opt)}
                      onChange={() => handleAvailability(opt)}
                      className="w-4 h-4 rounded accent-[#3B82F6]"
                    />
                    <span className="text-sm text-[#64748B] group-hover:text-[#1E293B]">
                      {opt}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Consultation Fee */}
            <div>
              <h4 className="font-semibold text-[#1E293B] text-sm mb-3">
                Consultation Fee
              </h4>
              <div className="space-y-2.5">
                {["Free/Covered", "Under $50", "$50 - $100", "$100+"].map(
                  (opt) => (
                    <label
                      key={opt}
                      className="flex items-center gap-2.5
                  cursor-pointer group"
                    >
                      <input
                        type="radio"
                        name="fee"
                        checked={feeRange === opt}
                        onChange={() => setFeeRange(opt)}
                        className="w-4 h-4 accent-[#3B82F6]"
                      />
                      <span className="text-sm text-[#64748B] group-hover:text-[#1E293B] ">
                        {opt}
                      </span>
                    </label>
                  ),
                )}
              </div>
            </div>

            {/* Gender */}
            <div>
              <h4 className="font-semibold text-[#1E293B] text-sm mb-3">
                Gender
              </h4>
              <div className="flex gap-2">
                {["Male", "Female", "Any"].map((g) => (
                  <button
                    key={g}
                    onClick={() => setGender(g)}
                    className={`flex-1 py-2 rounded-lg text-xs
                    font-medium transition-all border ${
                      gender === g
                        ? "bg-[#3B82F6] text-white border-[#3B82F6]"
                        : "border-gray-200 text-[#64748B] hover:border-[#3B82F6]"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Insurance Box */}
            <div
              className="bg-blue-50 rounded-xl p-4
            border border-blue-100"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[#3B82F6]">🛡️</span>
                <span
                  className="text-sm font-semibold
                                 text-[#1E293B]"
                >
                  Insurance
                </span>
              </div>
              <p className="text-xs text-[#64748B] mb-3">
                Add your insurance to see providers covered by your plan.
              </p>
              <button
                className="w-full bg-[#3B82F6] text-white
                                 text-xs font-semibold py-2
                                 rounded-lg hover:bg-[#2563EB]
                                 transition-colors"
              >
                Add Insurance
              </button>
            </div>
          </div>

          {/* Doctor Results */}
          <div className="flex-1">
            {/* Results count + sort */}
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm text-[#64748B]">
                Showing {""}
                <span className="font-semibold text-[#1E293B] ">
                  {doctors.length}
                </span>{" "}
                {""}
                Results
                {activeSpec !== "All Specialists" && `for ${activeSpec}`}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#64748B]">Sort by:</span>
                <select
                  className="text-sm font-medium text-[#1E293B]
                             border border-gray-200 rounded-lg
                             px-3 py-1.5 outline-none
                             focus:border-[#3B82F6]"
                >
                  <option>Most Popular</option>
                  <option>Lowest Fee</option>
                  <option>Highest Rated</option>
                  <option>Nearest</option>
                </select>
              </div>
            </div>

            {/* Loading */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl border
                  border-gray-100 p-5 animate-pulse"
                  >
                    <div className="flex gap-4">
                      <div className="w-16 h-16 bg-gray-200 rounded-xl" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                        <div className="h-3 bg-gray-200 rounded w-1/2" />
                        <div className="h-3 bg-gray-200 rounded w-1/3" />
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-50 flex gap-3">
                      <div className="flex-1 h-10 bg-gray-200 rounded-xl" />
                      <div className="flex-1 h-10 bg-gray-200 rounded-xl" />
                    </div>
                  </div>
                ))}
              </div>
            ) : doctors.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="font-semibold text-[#1E293B] mb-2">
                  No doctors found
                </h3>
                <p className="text-sm text-[#64748B]">
                  Try adjusting your search or filters
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {doctors.map((doc) => (
                  <DoctorCard key={doc.id} doctor={doc} onBook={handleBook} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {!loading && doctors.length > 0 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button className="w-9 h-9 rounded-lg border border-gray-200
                flex items-center justify-center text-[#64748B]  hover:border-[#3B82F6] hover:text-[#3B82F6] transition-colors">
                  ‹
                </button>
                {[1,2,3,'...',12].map((p,i)=>(
                  <button
                  key={i}
                  className={`w-9 h-9 rounded-lg text-sm
                    font-medium transition-colors ${
                      p === 1
                      ? 'bg-[#3B82F6] text-white'
                      : 'border border-gray-200 text-[#64748B] hover:border-[#3B82F6] hover:text-[#3B82F6]'
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button className="w-9 h-9 rounded-lg border border-gray-200
                flex items-center justify-center text-[#64748B] hover:border-[#3B82F6] hover:text-[#3B82F6] transition-colors">
                   ›
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* footer */}
      <footer className="border-t border-gray-100 mt-16 py-12 bg-white">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-[#3B82F6] rounded-lg
              flex items-center justify-center">
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
              <span className="font-bold text-[#1E293B]">MediCore HMS</span>
            </div>
            <p className="text-xs text-[#64748B] leading-relaxed">
            Empowering you to take control of your health
              with instant access to the best healthcare
              providers worldwide.
            </p>
          </div>

          <div>
            <h5 className="font-semibold text-sm text-[#1E293B] mb-3">Platform</h5>
            <ul className="space-y-2">
              {['Find Doctors','Medicines','Medical Records','Insurance Plans'].map(l => (
                <li key={l}>
                  <a href="#"
                  className="text-xs text-[#64748B] hover:text-[#3B82F6]
transition-colors">
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h5 className="font-semibold text-sm  text-[#1E293B] mb-3">
              Support
            </h5>
            <ul className="space-y-2">
              {['Help Center','Contact Us','Privacy Policy',"Terms of Use"].map(l =>(
                <li>
                  <a href="#"
                  className="text-xs text-[#64748B] hover:text-[#3B82F6] transition-colors">
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h5 className="font-semibold text-sm text-[#1E293B] mb-3">App Download</h5>
            <div className="space-y-2">
              <button className="w-full bg-[#1E293B] text-white
                                 text-xs font-medium py-2.5 px-3
                                 rounded-lg flex items-center
                                 gap-2 hover:bg-gray-800
                                 transition-colors">
                <span className="text-base">▶</span>
                <div className="text-left">
                  <div className="text-[10px] opacity-70">
                    GET IT ON
                  </div>
                  <div>Google Play</div>
                </div>
              </button>
              <button className="w-full bg-[#1E293B] text-white
                                 text-xs font-medium py-2.5 px-3
                                 rounded-lg flex items-center
                                 gap-2 hover:bg-gray-800
                                 transition-colors">
                <span className="text-base"></span>
                <div className="text-left">
                  <div className="text-[10px] opacity-70">
                    DOWNLOAD ON THE 
                  </div>
                  <div>App Store</div>
                </div>
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 mt-10
                        pt-6 border-t border-gray-100
                        flex items-center justify-between">
          <p className="text-xs text-[#94A3B8]">
         © 2026 MediCore Medical Solutions.
            All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-[#94A3B8]">
            <a href="#" className="hover:text-[#3B82F6]">
              Cookie Settings
            </a>
            <a href="#" className="hover:text-[#3B82F6]">
             SiteMap
            </a>
            <a href="#" className="hover:text-[#3B82F6]">
             Security
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default FindDoctor;
