import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  Mail, 
  Lock, 
  User, 
  Briefcase, 
  Loader2, 
  AlertCircle, 
  ArrowRight, 
  Sparkles, 
  Star, 
  CheckCircle2,
  Eye,
  EyeOff,
  UserCheck
} from 'lucide-react';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('client');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const result = await register(name, email, password, role);
    
    if (result.success) {
      navigate('/login');
    } else {
      setError(result.message || 'Registration failed');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-slate-50">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden grid lg:grid-cols-12">
        
        {/* Left Side: Brand Showcase */}
        <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 p-12 text-white flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/20 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10">
            <Link to="/" className="flex items-center gap-2.5 mb-12">
              <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-md">
                <Sparkles className="w-5 h-5 fill-white/20" />
              </div>
              <span className="text-2xl font-black tracking-tight text-white">
                Quick<span className="text-brand-400">Fix</span>
              </span>
            </Link>

            <span className="px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-bold uppercase tracking-wider border border-brand-400/20">
              Join the Network
            </span>

            <h2 className="text-3xl font-black mt-4 mb-4 tracking-tight leading-snug">
              {role === 'worker' ? 'Earn up to ₹60,000 / month as a Service Partner.' : 'Fix your home problems in 60 seconds.'}
            </h2>

            <p className="text-slate-400 text-sm leading-relaxed mb-8">
              {role === 'worker'
                ? 'Join thousands of certified electricians, plumbers, and technicians enjoying weekly payouts, flexible hours, and free equipment.'
                : 'Experience effortless doorstep services with standardized transparent pricing, certified experts, and 30-day rework warranty.'}
            </p>

            <div className="space-y-3.5">
              {(role === 'worker' 
                ? ['Weekly instant direct bank payouts', 'Zero commission on first 30 orders', 'Free high-grade safety toolkit & uniform']
                : ['Instant 15-minute pro assignment', 'Upfront rate cards with zero hidden fees', 'Verified police-checked specialists']
              ).map((text, i) => (
                <div key={i} className="flex items-center gap-2.5 text-xs font-semibold text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800 flex items-center gap-3 relative z-10">
            <div className="flex gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="text-xs font-bold text-slate-300">
              Trusted by 10,000+ Partners
            </span>
          </div>
        </div>

        {/* Right Side: Registration Form */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center">
          <div className="max-w-md w-full mx-auto">
            
            <div className="mb-6">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                Create your Account
              </h2>
              <p className="text-slate-500 text-sm mt-1.5 font-medium">
                Choose your role to get started with QuickFix
              </p>
            </div>

            {/* Role Switcher Tabs */}
            <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-2xl mb-6">
              <button
                type="button"
                onClick={() => setRole('client')}
                className={`py-2.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all ${
                  role === 'client'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <UserCheck className="w-4 h-4 text-brand-600" />
                <span>Customer</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('worker')}
                className={`py-2.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all ${
                  role === 'worker'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Briefcase className="w-4 h-4 text-amber-600" />
                <span>Service Partner</span>
              </button>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-700 text-sm font-semibold animate-in fade-in">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 outline-none focus:bg-white focus:border-brand-600 focus:ring-1 focus:ring-brand-500 transition-all"
                    placeholder="e.g. Ramesh Kumar"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 outline-none focus:bg-white focus:border-brand-600 focus:ring-1 focus:ring-brand-500 transition-all"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input 
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-11 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 outline-none focus:bg-white focus:border-brand-600 focus:ring-1 focus:ring-brand-500 transition-all"
                    placeholder="Minimum 6 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-slate-950 hover:bg-brand-600 text-white font-extrabold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-md hover:shadow-brand-500/25 text-sm"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <span>Complete Registration</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-100 text-center">
              <p className="text-slate-500 text-xs sm:text-sm font-medium">
                Already registered?{' '}
                <Link to="/login" className="text-brand-600 font-extrabold hover:underline">
                  Sign in here
                </Link>
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
