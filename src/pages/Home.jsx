import { useState, useMemo } from 'react';
import { 
  Sparkles, 
  ShieldCheck, 
  Clock, 
  Star, 
  CheckCircle, 
  MapPin, 
  Wrench, 
  Globe, 
  Mail, 
  MessageCircle, 
  ArrowRight, 
  ArrowLeft,
  X, 
  Check, 
  Search, 
  Zap, 
  Droplets, 
  Fan, 
  Paintbrush, 
  Car, 
  Award, 
  PhoneCall, 
  ChevronRight,
  Tag,
  CheckCircle2
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useRequests } from '../hooks/useRequests';
import { useAuth } from '../hooks/useAuth';

// Rich Trending Services Data with Urban Company style details
const FEATURED_SERVICES = [
  {
    id: 'ac-repair',
    name: 'AC Foam Jet Deep Clean',
    category: 'Appliances',
    rating: 4.89,
    reviews: '38K',
    price: 599,
    originalPrice: 899,
    duration: '45 mins',
    tag: 'BESTSELLER',
    tagColor: 'bg-amber-500 text-white',
    icon: Fan,
    iconBg: 'bg-cyan-50 text-cyan-600',
    features: ['Deep jet foam coil clean', 'Gas pressure checkup', '30-day rework warranty']
  },
  {
    id: 'deep-cleaning',
    name: 'Bathroom & Kitchen Deep Clean',
    category: 'Cleaning',
    rating: 4.86,
    reviews: '24K',
    price: 799,
    originalPrice: 1199,
    duration: '60 mins',
    tag: 'POPULAR',
    tagColor: 'bg-indigo-600 text-white',
    icon: Droplets,
    iconBg: 'bg-blue-50 text-blue-600',
    features: ['Hard stain removal', 'Tile & fixture sanitization', 'Eco-friendly cleaning agents']
  },
  {
    id: 'electrical-help',
    name: 'Switchboard & Wiring Repair',
    category: 'Repairs & Wiring',
    rating: 4.92,
    reviews: '52K',
    price: 199,
    originalPrice: 349,
    duration: '30 mins',
    tag: 'INSTANT 15-MIN ARRIVAL',
    tagColor: 'bg-emerald-600 text-white',
    icon: Zap,
    iconBg: 'bg-yellow-50 text-yellow-600',
    features: ['Certified electrician', 'Short circuit diagnosis', 'Zero damage guarantee']
  },
  {
    id: 'plumbing-works',
    name: 'Leakage Fix & Pipe Fitting',
    category: 'Repairs & Wiring',
    rating: 4.88,
    reviews: '31K',
    price: 249,
    originalPrice: 449,
    duration: '40 mins',
    tag: 'TRENDING',
    tagColor: 'bg-purple-600 text-white',
    icon: Wrench,
    iconBg: 'bg-indigo-50 text-indigo-600',
    features: ['Heavy-duty sealing', 'Tap & drain replacement', 'Standard rate card']
  },
  {
    id: 'house-painting',
    name: 'Waterproofing & Wall Painting',
    category: 'Painting',
    rating: 4.94,
    reviews: '12K',
    price: 1499,
    originalPrice: 2299,
    duration: 'Full Day',
    tag: 'FREE ESTIMATE',
    tagColor: 'bg-rose-500 text-white',
    icon: Paintbrush,
    iconBg: 'bg-purple-50 text-purple-600',
    features: ['Laser moisture inspection', 'Royal luxury finish', '1-year waterproofing warranty']
  },
  {
    id: 'carpentry',
    name: 'Furniture Assembly & Woodwork',
    category: 'Repairs & Wiring',
    rating: 4.83,
    reviews: '19K',
    price: 349,
    originalPrice: 599,
    duration: '45 mins',
    tag: 'HIGHLY RATED',
    tagColor: 'bg-slate-800 text-white',
    icon: Wrench,
    iconBg: 'bg-orange-50 text-orange-600',
    features: ['IKEA & modular assembly', 'Lock & hinge replacement', 'Precision alignment']
  }
];

const TIME_SLOTS = [
  '09:00 AM - 12:00 PM (Morning)',
  '12:00 PM - 03:00 PM (Afternoon)',
  '03:00 PM - 06:00 PM (Evening)',
  '06:00 PM - 09:00 PM (Night)'
];

const CITIES_LIST = [
  'Mumbai', 'Bengaluru', 'Delhi NCR', 'Hyderabad', 'Pune', 'Chennai', 'Kolkata', 'Ahmedabad', 'Chandigarh', 'Jaipur'
];

export default function Home() {
  const { addRequest } = useRequests();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Booking Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    service: 'AC Foam Jet Deep Clean',
    location: 'Bandra West, Mumbai',
    date: new Date().toISOString().split('T')[0],
    timeSlot: TIME_SLOTS[0],
    customerEmail: user?.email || '',
    desc: ''
  });

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredFeatured = useMemo(() => {
    return FEATURED_SERVICES.filter(service => {
      const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            service.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'All' || service.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => setStep(prev => prev - 1);

  const openBookingFor = (serviceName) => {
    setFormData(prev => ({
      ...prev,
      service: serviceName,
      customerEmail: user?.email || prev.customerEmail
    }));
    setStep(2);
    setIsModalOpen(true);
  };

  const handleBookService = async (e) => {
    e.preventDefault();
    await addRequest({
      service: formData.service,
      location: formData.location,
      date: `${formData.date} (${formData.timeSlot.split(' ')[0]} ${formData.timeSlot.split(' ')[1]})`,
      desc: formData.desc || `Booking for ${formData.service}`,
      customerEmail: formData.customerEmail || user?.email || '',
      provider: 'Assigning verified pro...'
    });
    setIsModalOpen(false);
    setStep(1);
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-brand-500 selection:text-white">
      
      {/* ======================================================== */}
      {/* 1. URBAN COMPANY STYLE HERO SECTION                      */}
      {/* ======================================================== */}
      <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-32 overflow-hidden bg-gradient-to-b from-white via-indigo-50/30 to-slate-50">
        {/* Soft Background Glows */}
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-brand-200/40 rounded-full blur-[120px] -z-10 animate-float" />
        <div className="absolute bottom-10 left-10 w-[450px] h-[450px] bg-indigo-200/30 rounded-full blur-[100px] -z-10 animate-float-delayed" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Headline, Search, Category Pills */}
            <div className="lg:col-span-7 text-center lg:text-left">
              
              {/* Trust Badge */}
              <div className="inline-flex items-center gap-2.5 py-1.5 px-4 rounded-full bg-indigo-50 border border-indigo-100/80 text-brand-700 text-xs font-bold tracking-wide mb-6 shadow-sm">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-600"></span>
                </span>
                <span className="font-extrabold">Urban Quality Guaranteed</span>
                <span className="text-slate-300">•</span>
                <span className="flex items-center gap-1 text-slate-700 font-semibold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> 4.88 (2.5M+ Bookings)
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-slate-950 tracking-tight leading-[1.08] mb-6">
                Expert home services,{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600">
                  on demand.
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-slate-600 mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-medium">
                Vetted professionals for AC repair, deep cleaning, electrical, and plumbing. Transparent upfront pricing, zero hidden charges.
              </p>

              {/* Hero Search & Instant Booking Bar */}
              <div className="bg-white p-2.5 rounded-2xl sm:rounded-full shadow-xl shadow-slate-200/80 border border-slate-200/80 max-w-2xl mx-auto lg:mx-0 flex flex-col sm:flex-row items-center gap-2 mb-8">
                <div className="flex items-center gap-3 w-full sm:w-auto flex-1 px-3 py-1">
                  <Search className="w-5 h-5 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder='Search "AC Service", "Plumber", "Deep Clean"...'
                    className="w-full bg-transparent text-sm sm:text-base font-semibold text-slate-800 placeholder-slate-400 outline-none"
                  />
                </div>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="w-full sm:w-auto px-7 py-3.5 bg-slate-950 hover:bg-brand-600 text-white font-bold rounded-xl sm:rounded-full transition-all duration-200 shadow-md hover:shadow-brand-500/25 flex items-center justify-center gap-2 shrink-0"
                >
                  Book a Service
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Quick Category Chips */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 pt-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-1">Trending:</span>
                {[
                  { name: 'AC Jet Clean', icon: Fan },
                  { name: 'Bathroom Clean', icon: Droplets },
                  { name: 'Wiring & Fixes', icon: Zap },
                  { name: 'Waterproofing', icon: Paintbrush },
                ].map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => openBookingFor(item.name)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200/90 hover:border-brand-500 hover:text-brand-600 text-xs font-semibold text-slate-700 transition-all shadow-sm hover:shadow"
                  >
                    <item.icon className="w-3.5 h-3.5 text-brand-600" />
                    <span>{item.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Right Column: Live Interactive Urban Company Job Card Preview */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md w-full">
                
                {/* Floating Glow Card */}
                <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 shadow-2xl shadow-indigo-500/10 border border-slate-100 relative z-20">
                  
                  {/* Card Header */}
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                      </span>
                      <span className="text-xs font-black uppercase tracking-wider text-emerald-600">
                        Live Tracking • Arriving Soon
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-slate-400">Order #QF-8942</span>
                  </div>

                  {/* Service Title & Pricing */}
                  <div className="py-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-lg font-black text-slate-900 leading-snug">
                          AC Deep Clean & Foam Jet
                        </h4>
                        <p className="text-xs font-medium text-slate-500 mt-0.5">
                          Power Jet Servicing • 1 Unit
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-xl font-black text-slate-900">₹599</span>
                        <span className="block text-[10px] font-bold text-slate-400 line-through">₹899</span>
                      </div>
                    </div>
                  </div>

                  {/* Technician Profile Card */}
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 flex items-center justify-between gap-3 mb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white font-black flex items-center justify-center text-sm shadow-md shadow-brand-500/20">
                        RS
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="font-extrabold text-slate-900 text-sm">Ramesh Sharma</p>
                          <ShieldCheck className="w-4 h-4 text-brand-600 fill-brand-100" />
                        </div>
                        <p className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> 4.92 • 1,420+ jobs completed
                        </p>
                      </div>
                    </div>
                    <div className="bg-white border border-slate-200 p-2 rounded-xl text-brand-600 shadow-sm">
                      <PhoneCall className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Step Timeline */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                      <span className="text-brand-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Booked
                      </span>
                      <span className="text-brand-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Assigned
                      </span>
                      <span className="text-brand-600 font-extrabold flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 animate-spin" /> In Transit
                      </span>
                      <span className="text-slate-300">Complete</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div className="bg-gradient-to-r from-brand-500 to-indigo-600 h-2 rounded-full w-3/4 relative">
                        <div className="absolute inset-0 bg-white/30 animate-[shimmer_2s_infinite]"></div>
                      </div>
                    </div>
                    
                    <p className="text-center text-xs font-bold text-slate-600">
                      ⚡ Partner is <span className="text-brand-600">12 mins away</span> (Near Bandra Linking Rd)
                    </p>
                  </div>

                  {/* Action CTA */}
                  <button
                    onClick={() => openBookingFor('AC Foam Jet Deep Clean')}
                    className="w-full py-3.5 bg-slate-950 hover:bg-brand-600 text-white font-bold rounded-2xl transition-all shadow-lg hover:shadow-brand-500/20 text-sm flex items-center justify-center gap-2"
                  >
                    <span>Instant Booking Experience</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Decorative floating badges */}
                <div className="absolute -bottom-6 -left-6 bg-white p-3.5 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3 z-30 animate-float hidden sm:flex">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-900">30-Day Warranty</p>
                    <p className="text-[11px] font-semibold text-slate-500">Free rework guarantee</p>
                  </div>
                </div>

                <div className="absolute -top-6 -right-6 bg-white p-3 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-2.5 z-30 animate-float-delayed hidden sm:flex">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center font-bold">
                    <Star className="w-4 h-4 fill-amber-400" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-900">10,000+ Pros</p>
                    <p className="text-[10px] font-semibold text-slate-400">Police verified</p>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 2. URBAN COMPANY STYLE 6-CATEGORY ROUNDED GRID           */}
      {/* ======================================================== */}
      <section id="services" className="py-16 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <p className="text-xs font-black tracking-widest text-brand-600 uppercase mb-1">
                Explore Categories
              </p>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
                What are you looking for today?
              </h2>
            </div>
            <p className="text-sm font-semibold text-slate-500 max-w-md">
              Tap any category to get connected to a verified professional at standard transparent rates.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { name: 'AC Repair', icon: Fan, count: '12 Services', color: 'text-cyan-600', bg: 'bg-cyan-50 group-hover:bg-cyan-600 group-hover:text-white' },
              { name: 'Cleaning & Pest', icon: Droplets, count: '18 Services', color: 'text-blue-600', bg: 'bg-blue-50 group-hover:bg-blue-600 group-hover:text-white' },
              { name: 'Electrician', icon: Zap, count: '24 Services', color: 'text-amber-600', bg: 'bg-amber-50 group-hover:bg-amber-600 group-hover:text-white' },
              { name: 'Plumber', icon: Wrench, count: '15 Services', color: 'text-indigo-600', bg: 'bg-indigo-50 group-hover:bg-indigo-600 group-hover:text-white' },
              { name: 'Wall Painting', icon: Paintbrush, count: '8 Services', color: 'text-purple-600', bg: 'bg-purple-50 group-hover:bg-purple-600 group-hover:text-white' },
              { name: 'Vehicle Care', icon: Car, count: '6 Services', color: 'text-slate-800', bg: 'bg-slate-100 group-hover:bg-slate-900 group-hover:text-white' },
            ].map((cat, idx) => (
              <div
                key={idx}
                onClick={() => openBookingFor(cat.name)}
                className="group p-5 rounded-3xl bg-slate-50/80 hover:bg-white border border-slate-100 hover:border-brand-200 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 cursor-pointer flex flex-col items-center text-center hover:-translate-y-1.5"
              >
                <div className={`w-16 h-16 rounded-2xl ${cat.bg} flex items-center justify-center transition-all duration-300 mb-4 shadow-sm group-hover:scale-110`}>
                  <cat.icon className="w-8 h-8 transition-colors" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-sm group-hover:text-brand-600 transition-colors">
                  {cat.name}
                </h3>
                <span className="text-[11px] font-semibold text-slate-400 mt-1">
                  {cat.count}
                </span>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ======================================================== */}
      {/* 3. THE "QUICKFIX PROMISE" (URBAN COMPANY GUARANTEE)      */}
      {/* ======================================================== */}
      <section id="why-us" className="py-20 bg-slate-950 text-white relative overflow-hidden">
        {/* Subtle decorative grid background */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="px-3.5 py-1.5 rounded-full bg-brand-500/20 text-brand-300 text-xs font-black uppercase tracking-widest border border-brand-500/30">
              The QuickFix Guarantee
            </span>
            <h2 className="text-3xl sm:text-5xl font-black mt-4 mb-4 tracking-tight">
              Why 5 Million+ households trust us
            </h2>
            <p className="text-slate-400 text-base sm:text-lg">
              We eliminated the uncertainty of hiring local handymen with strict verification, transparent rate cards, and post-service warranty.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: ShieldCheck,
                title: 'Police & Vetting Verified',
                desc: 'Strict 5-stage background verification & identity checks for every single professional.',
                accent: 'text-emerald-400',
                border: 'border-emerald-500/20'
              },
              {
                icon: Tag,
                title: 'Fixed & Transparent Rates',
                desc: 'Upfront rates with itemized billing. No surprise charges or on-spot negotiation headaches.',
                accent: 'text-amber-400',
                border: 'border-amber-500/20'
              },
              {
                icon: Award,
                title: '30-Day Free Warranty',
                desc: 'Complete peace of mind. If anything goes wrong within 30 days, we fix it at no additional cost.',
                accent: 'text-brand-400',
                border: 'border-brand-500/20'
              },
              {
                icon: Clock,
                title: '60-Min Doorstep Arrival',
                desc: 'On-demand dispatch with live GPS tracking so you always know exactly when your expert arrives.',
                accent: 'text-purple-400',
                border: 'border-purple-500/20'
              }
            ].map((item, idx) => (
              <div 
                key={idx}
                className={`p-8 rounded-3xl bg-slate-900/80 border ${item.border} hover:bg-slate-900 transition-all duration-300 hover:-translate-y-1.5`}
              >
                <div className={`w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center ${item.accent} mb-6 shadow-inner`}>
                  <item.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-white mb-2.5">{item.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 4. TRENDING SERVICES WITH PRICING & BOOKING BUTTONS      */}
      {/* ======================================================== */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-brand-600">
                Most Booked Services
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight mt-1">
                Trending in your neighbourhood
              </h2>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-200/80 shadow-sm">
              {['All', 'Appliances', 'Cleaning', 'Repairs & Wiring', 'Painting'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveCategory(tab)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeCategory === tab
                      ? 'bg-slate-950 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredFeatured.map(service => {
              const Icon = service.icon;
              return (
                <div
                  key={service.id}
                  className="bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 hover:border-brand-300 transition-all duration-300 overflow-hidden flex flex-col justify-between group"
                >
                  <div className="p-7">
                    {/* Card Top: Tag & Category */}
                    <div className="flex items-center justify-between mb-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${service.tagColor}`}>
                        {service.tag}
                      </span>
                      <span className="text-xs font-bold text-slate-400">
                        {service.duration}
                      </span>
                    </div>

                    {/* Icon & Title */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`w-14 h-14 rounded-2xl ${service.iconBg} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-200`}>
                        <Icon className="w-7 h-7" />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-slate-950 leading-snug group-hover:text-brand-600 transition-colors">
                          {service.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="flex items-center gap-1 text-xs font-extrabold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-md">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            {service.rating}
                          </span>
                          <span className="text-xs font-semibold text-slate-400">
                            ({service.reviews} bookings)
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Features list */}
                    <div className="space-y-2 pt-2 border-t border-slate-100 mt-4 mb-6">
                      {service.features.map((feat, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs font-medium text-slate-600">
                          <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Card Bottom: Price & Booking Action */}
                  <div className="px-7 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Starts at</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-slate-950">₹{service.price}</span>
                        <span className="text-xs font-bold text-slate-400 line-through">₹{service.originalPrice}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => openBookingFor(service.name)}
                      className="px-5 py-2.5 bg-slate-950 hover:bg-brand-600 text-white font-bold rounded-xl transition-all shadow-sm hover:shadow-md text-sm flex items-center gap-1.5"
                    >
                      <span>Book Now</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ======================================================== */}
      {/* 5. "HOW IT WORKS" - 3 EASY STEPS                         */}
      {/* ======================================================== */}
      <section id="how-it-works" className="py-24 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-black uppercase tracking-widest text-brand-600">
              Seamless Experience
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight mt-1 mb-4">
              Book in 3 simple steps
            </h2>
            <p className="text-slate-500 text-base sm:text-lg font-medium">
              No calling back and forth. No haggling. Instant booking directly from your phone.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {[
              {
                step: '01',
                title: 'Choose Service & Slot',
                desc: 'Select from 50+ home services, view fixed upfront prices, and pick your preferred arrival date & time slot.'
              },
              {
                step: '02',
                title: 'Expert Matches & Arrives',
                desc: 'A background-verified pro is assigned instantly. Track their live GPS arrival with standard toolkits.'
              },
              {
                step: '03',
                title: 'Pay & Relax with Warranty',
                desc: 'Review the finished job, pay securely online or via cash, and enjoy our 30-day free rework guarantee.'
              }
            ].map((s, idx) => (
              <div
                key={idx}
                className="bg-slate-50 p-8 rounded-3xl border border-slate-200/80 relative flex flex-col justify-between hover:shadow-lg transition-shadow"
              >
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 text-brand-600 flex items-center justify-center font-black text-xl mb-6 shadow-sm">
                    {s.step}
                  </div>
                  <h3 className="text-xl font-black text-slate-950 mb-3">{s.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ======================================================== */}
      {/* 6. VERIFIED CUSTOMER REVIEWS (URBAN COMPANY TIER)        */}
      {/* ======================================================== */}
      <section id="reviews" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-black uppercase tracking-widest text-brand-600">
              Real Stories
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight mt-1 mb-4">
              Loved by homeowners everywhere
            </h2>
            <p className="text-slate-500 text-base sm:text-lg font-medium">
              See what verified customers across India say about their QuickFix experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Ananya Deshmukh',
                city: 'Bandra West, Mumbai',
                service: 'AC Jet Clean',
                rating: 5,
                text: 'The technician arrived exactly on time with a full professional kit. Cleaned both split ACs without dropping a single splash of water on the floor. 10/10 service!',
                avatar: 'AD',
                avatarBg: 'bg-indigo-100 text-indigo-700'
              },
              {
                name: 'Vikramaditya Roy',
                city: 'Indiranagar, Bengaluru',
                service: 'Switchboard Repair',
                rating: 5,
                text: 'Had an emergency short circuit right before a major family dinner. QuickFix matched an electrician in 15 minutes. Very polite, upfront billing, no negotiations.',
                avatar: 'VR',
                avatarBg: 'bg-emerald-100 text-emerald-700'
              },
              {
                name: 'Pooja Singhania',
                city: 'Gurugram, Delhi NCR',
                service: 'Bathroom Deep Clean',
                rating: 5,
                text: 'Unbelievable transformation. The tiles and fixtures look like brand new. Booking on QuickFix is now my regular monthly routine. Worth every rupee.',
                avatar: 'PS',
                avatarBg: 'bg-purple-100 text-purple-700'
              }
            ].map((review, idx) => (
              <div
                key={idx}
                className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex gap-1 text-amber-400">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                      {review.service}
                    </span>
                  </div>

                  <p className="text-slate-700 text-sm sm:text-base leading-relaxed mb-6 font-medium">
                    "{review.text}"
                  </p>
                </div>

                <div className="flex items-center gap-3.5 pt-4 border-t border-slate-100">
                  <div className={`w-11 h-11 rounded-full ${review.avatarBg} font-black flex items-center justify-center text-sm shadow-sm`}>
                    {review.avatar}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm">{review.name}</h4>
                    <p className="text-xs font-semibold text-slate-400">{review.city}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ======================================================== */}
      {/* 7. BECOME A SERVICE PARTNER CALLOUT BANNER               */}
      {/* ======================================================== */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 rounded-3xl p-8 sm:p-14 text-white relative overflow-hidden shadow-2xl">
            <div className="absolute right-0 top-0 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl pointer-events-none" />

            <div className="grid lg:grid-cols-12 gap-8 items-center relative z-10">
              <div className="lg:col-span-8">
                <span className="px-3.5 py-1.5 rounded-full bg-brand-500/30 text-brand-300 text-xs font-black uppercase tracking-widest border border-brand-400/20">
                  Partner With QuickFix
                </span>
                <h2 className="text-3xl sm:text-5xl font-black mt-4 mb-4 tracking-tight">
                  Earn up to ₹60,000 / month as a Certified Partner
                </h2>
                <p className="text-slate-300 text-base sm:text-lg max-w-2xl leading-relaxed">
                  Join 10,000+ electricians, plumbers, painters, and technicians. Enjoy guaranteed weekly payouts, flexible hours, and free toolkits.
                </p>
              </div>

              <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3">
                <Link
                  to="/register"
                  className="px-8 py-4 bg-brand-600 hover:bg-brand-500 text-white font-extrabold rounded-2xl text-center transition-all shadow-lg shadow-brand-600/30 text-base"
                >
                  Register as a Partner
                </Link>
                <Link
                  to="/login"
                  className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-extrabold rounded-2xl text-center transition-all border border-white/10 text-base"
                >
                  Partner Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 8. URBAN COMPANY STYLE MEGA FOOTER                       */}
      {/* ======================================================== */}
      <footer className="bg-slate-950 text-slate-400 pt-16 pb-12 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Main Footer Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
            
            {/* Brand Column */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-md">
                  <Sparkles className="w-5 h-5 fill-white/20" />
                </div>
                <span className="text-2xl font-black tracking-tight text-white">
                  Quick<span className="text-brand-500">Fix</span>
                </span>
              </div>
              <p className="text-sm text-slate-400 max-w-sm mb-6 leading-relaxed font-medium">
                India's premier on-demand home services platform. Delivering verified, standardized, and safe household repairs with a 30-day rework warranty.
              </p>
              <div className="flex items-center gap-3 text-slate-400">
                <a href="#" className="p-2.5 rounded-full bg-slate-900 hover:bg-brand-600 hover:text-white transition-colors">
                  <Globe className="w-4 h-4" />
                </a>
                <a href="#" className="p-2.5 rounded-full bg-slate-900 hover:bg-brand-600 hover:text-white transition-colors">
                  <MessageCircle className="w-4 h-4" />
                </a>
                <a href="#" className="p-2.5 rounded-full bg-slate-900 hover:bg-brand-600 hover:text-white transition-colors">
                  <Mail className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Column 1: For Customers */}
            <div>
              <h4 className="text-white font-extrabold text-xs uppercase tracking-wider mb-4">
                For Customers
              </h4>
              <ul className="space-y-2.5 text-sm font-medium">
                <li><a href="#services" className="hover:text-white transition-colors">Explore Services</a></li>
                <li><a href="#why-us" className="hover:text-white transition-colors">Safety Standards</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">How Booking Works</a></li>
                <li><Link to="/dashboard" className="hover:text-white transition-colors">Track Request</Link></li>
                <li><a href="#" className="hover:text-white transition-colors">Customer Help Desk</a></li>
              </ul>
            </div>

            {/* Column 2: For Partners */}
            <div>
              <h4 className="text-white font-extrabold text-xs uppercase tracking-wider mb-4">
                For Partners
              </h4>
              <ul className="space-y-2.5 text-sm font-medium">
                <li><Link to="/register" className="hover:text-white transition-colors">Register as Worker</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Partner Dashboard</Link></li>
                <li><a href="#" className="hover:text-white transition-colors">Earnings Calculator</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Partner Community</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Safety Guidelines</a></li>
              </ul>
            </div>

            {/* Column 3: Company */}
            <div>
              <h4 className="text-white font-extrabold text-xs uppercase tracking-wider mb-4">
                Company
              </h4>
              <ul className="space-y-2.5 text-sm font-medium">
                <li><a href="#" className="hover:text-white transition-colors">About QuickFix</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Support</a></li>
              </ul>
            </div>

          </div>

          {/* Cities Pills (Urban Company Style) */}
          <div className="py-8 border-b border-slate-800">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Serving Across Major Indian Metro Cities:
            </h5>
            <div className="flex flex-wrap gap-2">
              {CITIES_LIST.map((city) => (
                <span
                  key={city}
                  className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-400 hover:text-white cursor-pointer transition-colors"
                >
                  {city}
                </span>
              ))}
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-slate-400">
            <p>© {new Date().getFullYear()} QuickFix Technologies India Pvt Ltd. All rights reserved.</p>
            <div className="flex items-center gap-1 text-slate-400">
              Built with <Sparkles className="w-3.5 h-3.5 text-brand-500 fill-brand-500" /> for Indian Homes
            </div>
          </div>

        </div>
      </footer>

      {/* ======================================================== */}
      {/* 9. URBAN COMPANY MULTI-STEP BOOKING MODAL                */}
      {/* ======================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-slate-200 my-8">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100 bg-slate-50/80">
              <div className="flex items-center gap-3">
                {step > 1 && (
                  <button
                    onClick={handleBack}
                    className="p-1.5 bg-white border border-slate-200 hover:bg-slate-100 rounded-full transition-colors text-slate-700"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                )}
                <div>
                  <h3 className="text-lg font-black text-slate-900">Book Professional Service</h3>
                  <p className="text-xs text-brand-600 font-bold uppercase tracking-wider">
                    Step {step} of 3 • {step === 1 ? 'Select Service' : step === 2 ? 'Schedule & Location' : 'Order Summary'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => { setIsModalOpen(false); setStep(1); }}
                className="p-2 bg-white border border-slate-200 hover:bg-slate-100 rounded-full transition-colors text-slate-500 hover:text-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={step === 3 ? handleBookService : (e) => { e.preventDefault(); handleNext(); }}>
              
              {/* STEP 1: SELECT SERVICE */}
              {step === 1 && (
                <div className="p-6 space-y-4">
                  <label className="block text-sm font-extrabold text-slate-800 mb-2">
                    Which service do you need today?
                  </label>
                  <div className="grid grid-cols-1 gap-2.5 max-h-[50vh] overflow-y-auto pr-1">
                    {FEATURED_SERVICES.map((s) => (
                      <div
                        key={s.id}
                        onClick={() => setFormData({ ...formData, service: s.name })}
                        className={`p-4 border rounded-2xl cursor-pointer transition-all flex items-center justify-between gap-4 ${
                          formData.service === s.name
                            ? 'border-brand-600 bg-brand-50/60 ring-2 ring-brand-500 shadow-sm'
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                        }`}
                      >
                        <div className="flex items-center gap-3.5">
                          <div className={`p-2.5 rounded-xl ${formData.service === s.name ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                            <s.icon className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-extrabold text-slate-900 text-sm">{s.name}</p>
                            <p className="text-xs font-semibold text-slate-400">{s.duration} • {s.category}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="font-black text-slate-900 text-sm">₹{s.price}</span>
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                            formData.service === s.name ? 'border-brand-600 bg-brand-600 text-white' : 'border-slate-300'
                          }`}>
                            {formData.service === s.name && <Check className="w-3 h-3" />}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={!formData.service}
                    className="w-full mt-4 bg-slate-950 hover:bg-brand-600 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold py-3.5 rounded-2xl transition-all shadow-md text-sm"
                  >
                    Continue to Schedule
                  </button>
                </div>
              )}

              {/* STEP 2: LOCATION & TIME */}
              {step === 2 && (
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                      Service Address & Landmark <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="e.g. Flat 402, Sea Green Apts, Bandra West, Mumbai"
                        className="w-full border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm font-semibold text-slate-800 outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-500 transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                        Preferred Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.date}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="w-full border border-slate-200 rounded-xl py-3 px-3.5 text-sm font-semibold text-slate-800 outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-500 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                        Time Slot <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.timeSlot}
                        onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
                        className="w-full border border-slate-200 rounded-xl py-3 px-3.5 text-sm font-semibold text-slate-800 outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-500 transition-all bg-white"
                      >
                        {TIME_SLOTS.map((slot) => (
                          <option key={slot} value={slot}>{slot}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                      Your Email (for Booking Confirmation Email)
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        value={formData.customerEmail}
                        onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                        placeholder="you@example.com"
                        className="w-full border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm font-semibold text-slate-800 outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-500 transition-all"
                      />
                    </div>
                    <p className="text-[11px] font-medium text-slate-400 mt-1">
                      Confirmation email will be initiated automatically upon acceptance (Experiment 8).
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                      Special Instructions (Optional)
                    </label>
                    <textarea
                      rows="2"
                      value={formData.desc}
                      onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
                      placeholder="e.g. Please bring a high ladder or extra pipes..."
                      className="w-full border border-slate-200 rounded-xl p-3 text-sm font-semibold text-slate-800 outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-500 resize-none transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-2 bg-slate-950 hover:bg-brand-600 text-white font-bold py-3.5 rounded-2xl transition-all shadow-md text-sm"
                  >
                    Review Order Summary
                  </button>
                </div>
              )}

              {/* STEP 3: ORDER SUMMARY & CONFIRMATION */}
              {step === 3 && (
                <div className="p-6 space-y-5">
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200/80">
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Service</p>
                        <p className="text-base font-black text-slate-900">{formData.service}</p>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center font-bold">
                        <Wrench className="w-5 h-5" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                      <div>
                        <p className="text-slate-400 uppercase tracking-wider text-[10px]">Location</p>
                        <p className="text-slate-800 truncate mt-0.5">{formData.location}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 uppercase tracking-wider text-[10px]">Scheduled Slot</p>
                        <p className="text-slate-800 mt-0.5">{formData.date} • {formData.timeSlot.split(' ')[0]}</p>
                      </div>
                    </div>

                    {/* Bill Breakdown */}
                    <div className="pt-3 border-t border-slate-200/80 space-y-2 text-xs">
                      <div className="flex justify-between text-slate-600 font-medium">
                        <span>Standard Service Charge</span>
                        <span>₹499</span>
                      </div>
                      <div className="flex justify-between text-slate-600 font-medium">
                        <span>Safety & Tech Fee</span>
                        <span>₹49</span>
                      </div>
                      <div className="flex justify-between text-emerald-600 font-bold">
                        <span>Welcome Discount (WELCOME100)</span>
                        <span>-₹100</span>
                      </div>
                      <div className="flex justify-between text-sm font-black text-slate-950 pt-2 border-t border-slate-200">
                        <span>Total Payable (Post-Service)</span>
                        <span>₹448</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-xs font-medium text-brand-700">
                    <ShieldCheck className="w-4 h-4 shrink-0 text-brand-600" />
                    <span>Protected by 30-day rework warranty. Pay safely after inspection.</span>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-brand-600 hover:bg-brand-700 text-white font-extrabold py-4 rounded-2xl shadow-xl shadow-brand-500/25 transition-all text-sm flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Confirm & Book Professional</span>
                  </button>
                </div>
              )}

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
