import { useState } from 'react';
import { Link }     from 'react-router-dom';
import { useAuth }  from '../../context/AuthContext.jsx';

const Register = () => {
  const { register, loading } = useAuth();

  const [formData, setFormData] = useState({
    full_name:        '',
    email:            '',
    phone:            '',
    password:         '',
    confirm_password: '',
  });
  const [errors,       setErrors]       = useState({});
  const [showPass,     setShowPass]     = useState(false);
  const [showConfirm,  setShowConfirm]  = useState(false);

  // ── Validation ──────────────────────────────────
  const validate = () => {
    const errs = {};
    if (!formData.full_name.trim())
      errs.full_name = 'Full name is required';
    if (!formData.email)
      errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      errs.email = 'Enter a valid email';
    if (!formData.phone)
      errs.phone = 'Phone number is required';
    if (!formData.password)
      errs.password = 'Password is required';
    else if (formData.password.length < 6)
      errs.password = 'Password must be at least 6 characters';
    if (!formData.confirm_password)
      errs.confirm_password = 'Please confirm your password';
    else if (formData.password !== formData.confirm_password)
      errs.confirm_password = 'Passwords do not match';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await register({
        full_name: formData.full_name,
        email:     formData.email,
        phone:     formData.phone,
        password:  formData.password,
        role:      'patient',
      });
    } catch {
      // handled in AuthContext
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F4F8]">

      {/* ── Navbar ───────────────────────────────── */}
      <nav className="bg-white border-b border-gray-100
                      px-6 py-4 flex items-center
                      justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#3B82F6] rounded-lg
                          flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="currentColor"
                 viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m5.618-4.016A11.955
                       11.955 0 0112 2.944a11.955 11.955 0
                       01-8.618 3.04A12.02 12.02 0 003 9c0
                       5.591 3.824 10.29 9 11.622 5.176-1.332
                       9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
            </svg>
          </div>
          <span className="font-bold text-[#1E293B] text-lg">
           MediCore
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <span className="text-sm text-[#64748B]">
            Already have an account?
          </span>
          <Link
            to="/login"
            className="text-sm font-semibold text-[#3B82F6]
                       hover:underline"
          >
            Log In
          </Link>
          <button className="bg-[#F1F5F9] text-[#64748B]
                             font-medium text-sm px-4 py-2
                             rounded-lg hover:bg-gray-200
                             transition-colors">
            Help
          </button>
        </div>
      </nav>

      {/* ── Form Card ────────────────────────────── */}
      <div className="flex items-center justify-center
                      px-4 py-12">
        <div className="bg-white rounded-2xl shadow-md
                        w-full max-w-lg p-8">

          {/* Header */}
          <h1 className="text-3xl font-bold text-[#1E293B] mb-2">
            Patient Registration
          </h1>
          <p className="text-[#64748B] text-sm mb-8">
            Join MediCore to securely manage your medical
            records and appointments.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Full Name */}
            <div>
              <label className="flex items-center gap-1.5
                                text-sm font-medium text-[#1E293B]
                                mb-1.5">
                <svg className="w-4 h-4 text-[#64748B]"
                     fill="none" viewBox="0 0 24 24"
                     stroke="currentColor">
                  <path strokeLinecap="round"
                        strokeLinejoin="round" strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018
                           0zM12 14a7 7 0 00-7 7h14a7 7
                           0 00-7-7z"/>
                </svg>
                Full Name
              </label>
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

            {/* Email + Phone (side by side) */}
            <div className="grid grid-cols-2 gap-4">
              {/* Email */}
              <div>
                <label className="flex items-center gap-1.5
                                  text-sm font-medium
                                  text-[#1E293B] mb-1.5">
                  <svg className="w-4 h-4 text-[#64748B]"
                       fill="none" viewBox="0 0 24 24"
                       stroke="currentColor">
                    <path strokeLinecap="round"
                          strokeLinejoin="round" strokeWidth={2}
                          d="M3 8l7.89 5.26a2 2 0 002.22
                             0L21 8M5 19h14a2 2 0 002-2V7a2
                             2 0 00-2-2H5a2 2 0 00-2 2v10a2
                             2 0 002 2z"/>
                  </svg>
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
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

              {/* Phone */}
              <div>
                <label className="flex items-center gap-1.5
                                  text-sm font-medium
                                  text-[#1E293B] mb-1.5">
                  <svg className="w-4 h-4 text-[#64748B]"
                       fill="none" viewBox="0 0 24 24"
                       stroke="currentColor">
                    <path strokeLinecap="round"
                          strokeLinejoin="round" strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0
                             01.948.684l1.498 4.493a1 1 0
                             01-.502 1.21l-2.257 1.13a11.042
                             11.042 0 005.516 5.516l1.13-2.257a1
                             1 0 011.21-.502l4.493 1.498a1 1 0
                             01.684.949V19a2 2 0 01-2 2h-1C9.716
                             21 3 14.284 3 6V5z"/>
                  </svg>
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 000-0000"
                  className={`input-field ${
                    errors.phone ? 'border-red-400' : ''
                  }`}
                />
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.phone}
                  </p>
                )}
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="flex items-center gap-1.5
                                text-sm font-medium text-[#1E293B]
                                mb-1.5">
                <svg className="w-4 h-4 text-[#64748B]"
                     fill="none" viewBox="0 0 24 24"
                     stroke="currentColor">
                  <path strokeLinecap="round"
                        strokeLinejoin="round" strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2
                           2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0
                           002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`input-field pr-10 ${
                    errors.password ? 'border-red-400' : ''
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2
                             -translate-y-1/2 text-gray-400
                             hover:text-gray-600"
                >
                  {showPass ? (
                    <svg className="w-4 h-4" fill="none"
                         viewBox="0 0 24 24"
                         stroke="currentColor">
                      <path strokeLinecap="round"
                            strokeLinejoin="round" strokeWidth={2}
                            d="M13.875 18.825A10.05 10.05 0
                               0112 19c-4.478 0-8.268-2.943-9.543-7a9.97
                               9.97 0 011.563-3.029m5.858.908a3 3 0
                               114.243 4.243M9.878 9.878l4.242
                               4.242M9.88 9.88l-3.29-3.29m7.532
                               7.532l3.29 3.29M3 3l3.59 3.59m0
                               0A9.953 9.953 0 0112 5c4.478 0
                               8.268 2.943 9.543 7a10.025 10.025
                               0 01-4.132 5.411m0 0L21 21"/>
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none"
                         viewBox="0 0 24 24"
                         stroke="currentColor">
                      <path strokeLinecap="round"
                            strokeLinejoin="round" strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016
                               0z"/>
                      <path strokeLinecap="round"
                            strokeLinejoin="round" strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5
                               12 5c4.478 0 8.268 2.943 9.542
                               7-1.274 4.057-5.064 7-9.542
                               7-4.477 0-8.268-2.943-9.542-7z"/>
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="flex items-center gap-1.5
                                text-sm font-medium text-[#1E293B]
                                mb-1.5">
                <svg className="w-4 h-4 text-[#64748B]"
                     fill="none" viewBox="0 0 24 24"
                     stroke="currentColor">
                  <path strokeLinecap="round"
                        strokeLinejoin="round" strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001
                           0 004.582 9m0 0H9m11 11v-5h-.581m0
                           0a8.003 8.003 0 01-15.357-2m15.357
                           2H15"/>
                </svg>
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  name="confirm_password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`input-field pr-10 ${
                    errors.confirm_password ? 'border-red-400' : ''
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3.5 top-1/2
                             -translate-y-1/2 text-gray-400
                             hover:text-gray-600"
                >
                  <svg className="w-4 h-4" fill="none"
                       viewBox="0 0 24 24"
                       stroke="currentColor">
                    <path strokeLinecap="round"
                          strokeLinejoin="round" strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path strokeLinecap="round"
                          strokeLinejoin="round" strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5
                             12 5c4.478 0 8.268 2.943 9.542
                             7-1.274 4.057-5.064 7-9.542
                             7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                </button>
              </div>
              {errors.confirm_password && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.confirm_password}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#3B82F6] hover:bg-[#2563EB]
                         text-white font-semibold py-3.5
                         rounded-xl transition-all duration-200
                         text-sm disabled:opacity-60
                         disabled:cursor-not-allowed
                         flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white
                                  border-t-transparent rounded-full
                                  animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none"
                       viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round"
                          strokeLinejoin="round" strokeWidth={2}
                          d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4
                             4 0 11-8 0 4 4 0 018 0zM3 20a6 6
                             0 0112 0v1H3v-1z"/>
                  </svg>
                  Create My Account
                </>
              )}
            </button>

            {/* Terms */}
            <p className="text-xs text-center text-[#94A3B8]">
              By clicking Register, you agree to our{' '}
              <Link to="/terms"
                    className="text-[#3B82F6] hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy"
                    className="text-[#3B82F6] hover:underline">
                Privacy Policy
              </Link>
              .
            </p>
          </form>

          {/* Divider + Login Link */}
          <div className="border-t border-gray-100 mt-6 pt-6
                          text-center">
            <p className="text-sm text-[#64748B]">
              Already a member?{' '}
              <Link
                to="/login"
                className="text-[#3B82F6] font-semibold
                           hover:underline"
              >
                Log in to your dashboard
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs
                        text-[#94A3B8] space-y-1 pb-8">
          <p>© 2026 MediCore  Medical Systems.
             All rights reserved.</p>
          <p className="flex items-center justify-center gap-3">
            <span className="hover:text-[#64748B] cursor-pointer">
              HIPAA Compliance
            </span>
            <span>•</span>
            <span className="hover:text-[#64748B] cursor-pointer">
              Security
            </span>
            <span>•</span>
            <span className="hover:text-[#64748B] cursor-pointer">
              Contact
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;