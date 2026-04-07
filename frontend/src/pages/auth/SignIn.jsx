import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

const SignIn = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState('patient');
  const [formData, setFormData]         = useState({
    email:      '',
    password:   '',
    rememberMe: false,
  });
  const [errors,      setErrors]      = useState({});
  const [showPassword, setShowPassword] = useState(false);

  // ── Validation ──────────────────────────────────
  const validate = () => {
    const errs = {};
    if (!formData.email)
      errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      errs.email = 'Enter a valid email';
    if (!formData.password)
      errs.password = 'Password is required';
    else if (formData.password.length < 6)
      errs.password = 'Password must be at least 6 characters';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear error on change
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await login({
        email:    formData.email,
        password: formData.password,
        role:     selectedRole,
      });
    } catch {
      // error handled in AuthContext
    }
  };

  const roles = ['patient', 'doctor', 'admin'];

  return (
    <div className="min-h-screen bg-[#F0F4F8] flex flex-col
                    items-center justify-center px-4 py-10">

      {/* ── Logo + Title ─────────────────────────── */}
      <div className="flex flex-col items-center mb-8">
        {/* Blue icon box */}
        <div className="w-16 h-16 bg-[#3B82F6] rounded-2xl
                        flex items-center justify-center
                        shadow-lg mb-4">
          <svg className="w-8 h-8 text-white" fill="none"
               viewBox="0 0 24 24" stroke="currentColor"
               strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round"
                  d="M12 4v16m8-8H4" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-[#1E293B]">
          MediCore HMS
        </h1>
        <p className="text-[#64748B] text-sm mt-1">
          Manage your health journey with ease
        </p>
      </div>

      {/* ── Card ─────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-md w-full
                      max-w-md p-8">

        {/* Role Selector */}
        <p className="text-center text-sm text-[#64748B] mb-4">
          Select your role
        </p>

        <div className="flex bg-[#F1F5F9] rounded-xl p-1 mb-6">
          {roles.map((role) => (
            <button
              key={role}
              onClick={() => setSelectedRole(role)}
              className={`flex-1 py-2.5 rounded-lg text-sm
                          font-medium capitalize transition-all
                          duration-200 ${
                selectedRole === role
                  ? 'bg-[#3B82F6] text-white shadow-sm'
                  : 'text-[#64748B] hover:text-[#1E293B]'
              }`}
            >
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Email */}
          <div>
            <label className="input-label">Email Address</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2
                               -translate-y-1/2 text-gray-400">
                <svg className="w-4 h-4" fill="none"
                     viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round"
                        strokeLinejoin="round" strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21
                           8M5 19h14a2 2 0 002-2V7a2 2 0
                           00-2-2H5a2 2 0 00-2 2v10a2 2 0
                           002 2z"/>
                </svg>
              </span>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@hospital.com"
                className={`input-field pl-10 ${
                  errors.email ? 'border-red-400' : ''
                }`}
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">
                {errors.email}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="input-label mb-0">Password</label>
              <Link
                to="/forgot-password"
                className="text-xs text-[#3B82F6] hover:underline
                           font-medium"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2
                               -translate-y-1/2 text-gray-400">
                <svg className="w-4 h-4" fill="none"
                     viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round"
                        strokeLinejoin="round" strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2
                           2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0
                           002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className={`input-field pl-10 pr-10 ${
                  errors.password ? 'border-red-400' : ''
                }`}
              />
              {/* Show/hide toggle */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2
                           -translate-y-1/2 text-gray-400
                           hover:text-gray-600"
              >
                {showPassword ? (
                  <svg className="w-4 h-4" fill="none"
                       viewBox="0 0 24 24" stroke="currentColor">
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
                       viewBox="0 0 24 24" stroke="currentColor">
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

          {/* Remember Me */}
          <label className="flex items-center gap-2.5
                            cursor-pointer group">
            <input
              type="checkbox"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleChange}
              className="w-4 h-4 rounded border-gray-300
                         accent-[#3B82F6] cursor-pointer"
            />
            <span className="text-sm text-[#64748B]
                             group-hover:text-[#1E293B]
                             transition-colors">
              Remember me on this device
            </span>
          </label>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#3B82F6] hover:bg-[#2563EB]
                       text-white font-semibold py-3.5 rounded-xl
                       transition-all duration-200 text-sm
                       disabled:opacity-60 disabled:cursor-not-allowed
                       flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white
                                border-t-transparent rounded-full
                                animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-[#94A3B8]">
            New to MediCore?
          </span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Create Account */}
        <Link
          to="/register"
          className="flex items-center justify-center gap-1
                     text-[#3B82F6] font-semibold text-sm
                     hover:gap-2 transition-all duration-200"
        >
          Create an account
          <span>→</span>
        </Link>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-xs text-[#94A3B8]
                      space-y-1">
        <p>© 2024 MediCore Healthcare Solutions.
           All rights reserved.</p>
        <p className="flex items-center justify-center gap-2">
          <Link to="/privacy"
                className="hover:text-[#64748B] transition-colors">
            Privacy Policy
          </Link>
          <span>•</span>
          <Link to="/terms"
                className="hover:text-[#64748B] transition-colors">
            Terms of Service
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignIn;