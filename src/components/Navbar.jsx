import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  Sparkles, 
  MapPin, 
  ChevronDown, 
  Menu, 
  X, 
  LogOut, 
  LayoutDashboard, 
  Briefcase, 
  Check
} from 'lucide-react';

const CITIES = [
  'Mumbai',
  'Bengaluru',
  'Delhi NCR',
  'Hyderabad',
  'Pune',
  'Chennai',
  'Kolkata'
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [cityDropdown, setCityDropdown] = useState(false);
  const [selectedCity, setSelectedCity] = useState('Mumbai');
  const [userDropdown, setUserDropdown] = useState(false);

  const cityRef = useRef(null);
  const userRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (cityRef.current && !cityRef.current.contains(event.target)) {
        setCityDropdown(false);
      }
      if (userRef.current && !userRef.current.contains(event.target)) {
        setUserDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    setUserDropdown(false);
    navigate('/');
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'worker':
        return { label: 'Service Partner', bg: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'admin':
        return { label: 'Admin', bg: 'bg-purple-50 text-purple-700 border-purple-200' };
      default:
        return { label: 'Customer', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
    }
  };

  const roleBadge = user ? getRoleBadge(user.role) : null;

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Left: Logo & City Picker */}
          <div className="flex items-center gap-6 lg:gap-8">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-brand-500/25 group-hover:scale-105 transition-transform duration-200">
                <Sparkles className="w-5 h-5 fill-white/20" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black tracking-tight text-slate-900 group-hover:text-brand-600 transition-colors">
                  Quick<span className="text-brand-600">Fix</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 -mt-1">
                  On-Demand Services
                </span>
              </div>
            </Link>

            {/* Urban Company Style Location Selector */}
            <div className="relative hidden md:block" ref={cityRef}>
              <button
                onClick={() => setCityDropdown(!cityDropdown)}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-slate-200 bg-slate-50/80 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-all"
              >
                <MapPin className="w-3.5 h-3.5 text-brand-600" />
                <span>{selectedCity}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${cityDropdown ? 'rotate-180' : ''}`} />
              </button>

              {cityDropdown && (
                <div className="absolute left-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Select Your City
                  </div>
                  {CITIES.map((city) => (
                    <button
                      key={city}
                      onClick={() => {
                        setSelectedCity(city);
                        setCityDropdown(false);
                      }}
                      className="w-full flex items-center justify-between px-3.5 py-2 text-sm text-slate-700 hover:bg-brand-50 hover:text-brand-600 transition-colors text-left"
                    >
                      <span className="font-medium">{city}</span>
                      {selectedCity === city && <Check className="w-4 h-4 text-brand-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Center Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#services" className="hover:text-brand-600 transition-colors">
              Services
            </a>
            <a href="#why-us" className="hover:text-brand-600 transition-colors">
              Why Us
            </a>
            <a href="#how-it-works" className="hover:text-brand-600 transition-colors">
              How It Works
            </a>
            <a href="#reviews" className="hover:text-brand-600 transition-colors">
              Customer Stories
            </a>
            <Link 
              to={user?.role === 'worker' ? '/dashboard' : '/register'} 
              className="text-slate-500 hover:text-brand-600 transition-colors flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider"
            >
              <Briefcase className="w-3.5 h-3.5 text-brand-500" />
              Become a Partner
            </Link>
          </nav>

          {/* Right: Auth & User Menu */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="relative" ref={userRef}>
                <button
                  onClick={() => setUserDropdown(!userDropdown)}
                  className="flex items-center gap-3 p-1.5 pr-3 rounded-full border border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm transition-all"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-500 text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                    {user.name ? user.name.charAt(0) : 'U'}
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-slate-900 leading-tight">
                      {user.name}
                    </p>
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full border inline-block ${roleBadge.bg}`}>
                      {roleBadge.label}
                    </span>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${userDropdown ? 'rotate-180' : ''}`} />
                </button>

                {userDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-xs text-slate-400">Signed in as</p>
                      <p className="text-sm font-bold text-slate-900 truncate">{user.email || user.name}</p>
                    </div>

                    <Link
                      to="/dashboard"
                      onClick={() => setUserDropdown(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-brand-600 transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4 text-slate-400" />
                      Dashboard
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4 text-red-500" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-bold text-slate-700 hover:text-brand-600 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2.5 text-sm font-bold text-white bg-slate-900 hover:bg-brand-600 rounded-full transition-all shadow-md hover:shadow-brand-500/25 hover:-translate-y-0.5"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 px-4 pt-3 pb-6 space-y-4 animate-in slide-in-from-top-2 duration-200">
          {/* City selector in mobile */}
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <MapPin className="w-4 h-4 text-brand-600" />
              <span>City: {selectedCity}</span>
            </div>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="bg-white border border-slate-200 text-xs font-bold rounded-lg px-2 py-1 outline-none text-slate-700"
            >
              {CITIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col space-y-2 text-sm font-semibold text-slate-700">
            <a 
              href="#services" 
              onClick={() => setMobileOpen(false)}
              className="p-2.5 hover:bg-slate-50 rounded-xl transition-colors"
            >
              Explore Services
            </a>
            <a 
              href="#why-us" 
              onClick={() => setMobileOpen(false)}
              className="p-2.5 hover:bg-slate-50 rounded-xl transition-colors"
            >
              Why QuickFix
            </a>
            <a 
              href="#how-it-works" 
              onClick={() => setMobileOpen(false)}
              className="p-2.5 hover:bg-slate-50 rounded-xl transition-colors"
            >
              How It Works
            </a>
            <a 
              href="#reviews" 
              onClick={() => setMobileOpen(false)}
              className="p-2.5 hover:bg-slate-50 rounded-xl transition-colors"
            >
              Customer Reviews
            </a>
            <Link
              to="/register"
              onClick={() => setMobileOpen(false)}
              className="p-2.5 hover:bg-slate-50 rounded-xl transition-colors flex items-center gap-2 text-brand-600 font-bold"
            >
              <Briefcase className="w-4 h-4" />
              Register as Partner
            </Link>
          </div>

          <div className="pt-3 border-t border-slate-100">
            {user ? (
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-3 bg-brand-50 rounded-2xl border border-brand-100">
                  <div className="w-10 h-10 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-sm">
                    {user.name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{user.name}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${roleBadge.bg}`}>
                      {roleBadge.label}
                    </span>
                  </div>
                </div>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="block w-full text-center py-2.5 bg-slate-900 text-white font-bold rounded-xl text-sm"
                >
                  Go to Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-center py-2 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="w-full py-2.5 text-center text-sm font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="w-full py-2.5 text-center text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition-colors shadow-md shadow-brand-500/20"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
