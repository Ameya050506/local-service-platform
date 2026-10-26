import { useState } from 'react';
import { ChevronRight, Loader2, X, ShieldCheck, Clock, Star, ArrowLeft, CheckCircle, MapPin, Wrench, Users, Quote, Globe, Mail, MessageCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useRequests } from '../hooks/useRequests';

export default function Home() {
  const { services, isLoading, addRequest } = useRequests();
  const navigate = useNavigate();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ service: '', location: '', date: '', desc: '' });

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const handleBookService = (e) => {
    e.preventDefault();
    addRequest({
      service: formData.service, location: formData.location, date: formData.date, desc: formData.desc, provider: 'Assigning soon...'
    });
    setIsModalOpen(false);
    setStep(1);
    setFormData({ service: '', location: '', date: '', desc: '' });
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-white overflow-hidden flex flex-col">
      
      {/* Multi-Step Booking Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-white/20">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/80 backdrop-blur-md">
              <div className="flex items-center gap-3">
                {step > 1 && (
                  <button onClick={handleBack} className="p-1.5 bg-white border border-gray-200 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft className="w-4 h-4 text-gray-600" />
                  </button>
                )}
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Book a Service</h2>
                  <p className="text-xs text-brand-600 font-bold uppercase tracking-wider">Step {step} of 3</p>
                </div>
              </div>
              <button onClick={() => { setIsModalOpen(false); setStep(1); }} className="p-2 bg-white border border-gray-200 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <form onSubmit={step === 3 ? handleBookService : (e) => { e.preventDefault(); handleNext(); }} className="p-6 bg-white">
              {/* STEP 1 */}
              {step === 1 && (
                <div className="space-y-4 animate-in slide-in-from-right-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">What do you need help with?</label>
                  <div className="grid grid-cols-1 gap-3 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                    {!isLoading && services.map((s, i) => (
                      <div 
                        key={i} onClick={() => setFormData({...formData, service: s.name})}
                        className={`p-4 border rounded-2xl cursor-pointer transition-all flex items-center gap-4 ${formData.service === s.name ? 'border-brand-500 bg-brand-50 shadow-md shadow-brand-100 ring-1 ring-brand-500' : 'border-gray-100 hover:border-brand-200 hover:shadow-sm'}`}
                      >
                        <div className={`p-2 rounded-xl ${formData.service === s.name ? 'bg-brand-100' : 'bg-gray-50'}`}>
                          <s.icon className={`w-5 h-5 ${formData.service === s.name ? 'text-brand-600' : 'text-gray-500'}`} />
                        </div>
                        <span className={`font-bold text-lg ${formData.service === s.name ? 'text-brand-900' : 'text-slate-700'}`}>{s.name}</span>
                        {formData.service === s.name && <CheckCircle className="w-5 h-5 text-brand-600 ml-auto" />}
                      </div>
                    ))}
                  </div>
                  <button type="button" onClick={handleNext} disabled={!formData.service} className="w-full mt-6 bg-slate-900 disabled:bg-gray-200 disabled:text-gray-400 hover:bg-slate-800 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-slate-900/20">
                    Continue
                  </button>
                </div>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                <div className="space-y-5 animate-in slide-in-from-right-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Your Location <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input type="text" placeholder="e.g. Bandra West, Mumbai" required className="w-full border border-gray-200 rounded-2xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-brand-500 outline-none transition-all font-medium" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Preferred Date <span className="text-red-500">*</span></label>
                    <input type="date" required className="w-full border border-gray-200 rounded-2xl p-3 focus:ring-2 focus:ring-brand-500 outline-none text-gray-700 font-medium transition-all" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Describe the issue (Optional)</label>
                    <textarea rows="3" placeholder="Tell us more about the problem..." className="w-full border border-gray-200 rounded-2xl p-3 focus:ring-2 focus:ring-brand-500 outline-none resize-none transition-all font-medium" value={formData.desc} onChange={(e) => setFormData({...formData, desc: e.target.value})}></textarea>
                  </div>
                  <button type="submit" className="w-full mt-4 bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-slate-900/20">
                    Continue to Review
                  </button>
                </div>
              )}

              {/* STEP 3 */}
              {step === 3 && (
                <div className="space-y-4 animate-in slide-in-from-right-4">
                  <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                    <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
                      <div className="bg-brand-100 p-3 rounded-full text-brand-600"><Wrench className="w-6 h-6" /></div>
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Service Selected</p>
                        <p className="font-black text-slate-900 text-xl">{formData.service}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Location</p>
                        <p className="font-bold text-slate-800 text-sm truncate">{formData.location}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Date</p>
                        <p className="font-bold text-slate-800 text-sm">{formData.date}</p>
                      </div>
                    </div>
                  </div>
                  <button type="submit" className="w-full mt-6 bg-brand-600 hover:bg-brand-700 text-white font-bold py-4 rounded-2xl shadow-xl shadow-brand-500/30 transition-all hover:-translate-y-1 flex justify-center items-center gap-2">
                    <CheckCircle className="w-5 h-5" /> Confirm & Book Expert
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* PREMIUM HERO SECTION */}
      <section className="relative pt-20 lg:pt-32 pb-20 lg:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-300/20 rounded-full blur-[100px] -z-10 animate-float" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-400/10 rounded-full blur-[100px] -z-10 animate-float-delayed" />
        
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          <div className="text-center lg:text-left z-10">
            <div className="inline-flex items-center gap-2 py-2 px-4 rounded-full bg-white/80 backdrop-blur-sm border border-brand-100 text-brand-700 text-sm font-black tracking-widest mb-8 shadow-sm">
              <Star className="w-4 h-4 fill-brand-600" /> TOP RATED PLATFORM
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-slate-900 tracking-tight mb-6 leading-[1.1]">
              Fix your home problems <br className="hidden lg:block"/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600">
                without the headache.
              </span>
            </h1>
            <p className="mt-4 text-xl text-slate-600 mb-10 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-medium">
              Stop searching for reliable repairmen. Book verified local experts for plumbing, electrical, and cleaning in under 60 seconds.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto bg-brand-600 hover:bg-brand-700 text-white px-8 py-4 rounded-2xl text-lg font-bold transition-all shadow-xl shadow-brand-500/30 hover:-translate-y-1">
                Book a Service Now
              </button>
              <Link to="/dashboard" className="w-full sm:w-auto bg-white hover:bg-gray-50 text-slate-800 px-8 py-4 rounded-2xl text-lg font-bold transition-all border-2 border-gray-200 hover:border-gray-300 shadow-sm flex items-center justify-center gap-2 hover:-translate-y-1">
                Track Request <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
          </div>

          <div className="relative hidden lg:block h-[500px] w-full z-10">
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[420px] bg-white/70 backdrop-blur-xl border border-white rounded-3xl shadow-2xl p-6 animate-float z-20">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Live Request</p>
                  <h3 className="text-xl font-black text-slate-900">AC Repair & Service</h3>
                </div>
                <div className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold animate-pulse">Assigned</div>
              </div>
              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-3 bg-white p-3 rounded-2xl shadow-sm border border-gray-50">
                  <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center text-brand-600 font-bold">R</div>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">Rajesh Cooling Co.</p>
                    <p className="text-xs text-slate-500 font-medium">Expert Technician • 4.9 ★</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white p-3 rounded-2xl shadow-sm border border-gray-50">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500"><Clock className="w-5 h-5" /></div>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">Arriving Today</p>
                    <p className="text-xs text-slate-500 font-medium">Between 2:00 PM - 4:00 PM</p>
                  </div>
                </div>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                <div className="bg-brand-500 h-2.5 rounded-full w-2/3 relative">
                  <div className="absolute top-0 right-0 bottom-0 left-0 bg-white/20 animate-[pulse_2s_ease-in-out_infinite]"></div>
                </div>
              </div>
              <p className="text-center text-xs font-bold text-brand-600 mt-3 uppercase tracking-widest">Technician is on the way</p>
            </div>
          </div>
        </div>
      </section>

      {/* NEW: TRUST METRICS BANNER */}
      <section className="bg-slate-900 py-16 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-slate-700">
            <div className="flex flex-col items-center pt-8 md:pt-0">
              <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center mb-4 text-white">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Background Verified</h3>
              <p className="text-slate-400 text-sm max-w-xs">Every professional undergoes a strict background check before joining our platform.</p>
            </div>
            <div className="flex flex-col items-center pt-8 md:pt-0">
              <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center mb-4 text-white">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">10,000+ Professionals</h3>
              <p className="text-slate-400 text-sm max-w-xs">A massive network of skilled experts ready to solve your problems instantly.</p>
            </div>
            <div className="flex flex-col items-center pt-8 md:pt-0">
              <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center mb-4 text-white">
                <Star className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">4.8/5 Average Rating</h3>
              <p className="text-slate-400 text-sm max-w-xs">Consistently delivering high-quality, reliable service to households across the city.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Service Discovery Section */}
      <section className="bg-slate-50 py-24 border-b border-gray-100 flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-4">Explore Services</h2>
            <p className="text-slate-500 text-lg font-medium">From minor repairs to major installations, select a category below to get matched with a top-rated professional.</p>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-20"><Loader2 className="w-12 h-12 text-brand-500 animate-spin" /></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service, index) => {
                const Icon = service.icon;
                return (
                  <div 
                    key={index} onClick={() => { setFormData({...formData, service: service.name}); setStep(2); setIsModalOpen(true); }}
                    className="group bg-white border border-gray-200 p-8 rounded-[2rem] shadow-sm hover:shadow-2xl hover:shadow-brand-500/10 hover:border-brand-300 transition-all duration-300 cursor-pointer flex flex-col items-start gap-4 hover:-translate-y-2 relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-brand-50 to-transparent rounded-bl-full -z-10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className={`w-16 h-16 shrink-0 rounded-2xl ${service.bg} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className={`w-8 h-8 ${service.color}`} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900 mb-2">{service.name}</h3>
                      <p className="text-sm text-slate-500 font-medium leading-relaxed">{service.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* NEW: TESTIMONIALS SECTION */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-4">Loved by Thousands</h2>
            <p className="text-slate-500 text-lg font-medium">Don't just take our word for it. Here is what our customers have to say.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-50 p-8 rounded-3xl border border-gray-100 relative mt-4 md:mt-0 hover:-translate-y-2 transition-transform">
              <div className="absolute -top-5 left-8 bg-brand-500 w-10 h-10 rounded-full flex items-center justify-center text-white shadow-lg">
                <Quote className="w-5 h-5 fill-current" />
              </div>
              <div className="flex gap-1 mb-4 pt-2">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
              </div>
              <p className="text-slate-700 mb-6 italic leading-relaxed">"My AC broke down in the middle of summer. I booked through QuickFix and a professional arrived within 2 hours. Incredibly fast and transparent pricing."</p>
              <div className="flex items-center gap-4 border-t border-gray-200 pt-6">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-700">AK</div>
                <div>
                  <p className="font-bold text-slate-900">Anil Kapoor</p>
                  <p className="text-xs text-slate-500 font-medium">Bandra West</p>
                </div>
              </div>
            </div>
            <div className="bg-slate-50 p-8 rounded-3xl border border-gray-100 relative mt-4 md:mt-8 hover:-translate-y-2 transition-transform">
              <div className="absolute -top-5 left-8 bg-brand-500 w-10 h-10 rounded-full flex items-center justify-center text-white shadow-lg">
                <Quote className="w-5 h-5 fill-current" />
              </div>
              <div className="flex gap-1 mb-4 pt-2">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
              </div>
              <p className="text-slate-700 mb-6 italic leading-relaxed">"The UI is so simple to use. I needed an electrician urgently for a short circuit. The tracking feature showed exactly when he was arriving. Highly recommended!"</p>
              <div className="flex items-center gap-4 border-t border-gray-200 pt-6">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center font-bold text-purple-700">SM</div>
                <div>
                  <p className="font-bold text-slate-900">Sneha Mehta</p>
                  <p className="text-xs text-slate-500 font-medium">Andheri East</p>
                </div>
              </div>
            </div>
            <div className="bg-slate-50 p-8 rounded-3xl border border-gray-100 relative mt-4 md:mt-0 hover:-translate-y-2 transition-transform">
              <div className="absolute -top-5 left-8 bg-brand-500 w-10 h-10 rounded-full flex items-center justify-center text-white shadow-lg">
                <Quote className="w-5 h-5 fill-current" />
              </div>
              <div className="flex gap-1 mb-4 pt-2">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
              </div>
              <p className="text-slate-700 mb-6 italic leading-relaxed">"I've tried other platforms, but the professionals here are much more polite and actually clean up after the carpentry work is done. 10/10 experience."</p>
              <div className="flex items-center gap-4 border-t border-gray-200 pt-6">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center font-bold text-emerald-700">RD</div>
                <div>
                  <p className="font-bold text-slate-900">Rahul Desai</p>
                  <p className="text-xs text-slate-500 font-medium">Juhu</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* NEW: PROFESSIONAL FOOTER */}
      <footer className="bg-slate-950 text-slate-300 py-16 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            
            {/* Brand Column */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="bg-brand-500 p-2 rounded-lg"><Wrench className="w-6 h-6 text-white" /></div>
                <span className="text-2xl font-black text-white tracking-tight">QuickFix</span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Your trusted partner for home services. We connect you with verified local professionals to solve your everyday problems instantly.
              </p>
              <div className="flex gap-4">
                <button className="text-slate-400 hover:text-white transition-colors"><Globe className="w-5 h-5" /></button>
                <button className="text-slate-400 hover:text-white transition-colors"><MessageCircle className="w-5 h-5" /></button>
                <button className="text-slate-400 hover:text-white transition-colors"><Mail className="w-5 h-5" /></button>
              </div>
            </div>

            {/* Links Column 1 */}
            <div>
              <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Customers</h4>
              <ul className="space-y-4 text-sm font-medium">
                <li><a href="#" className="hover:text-brand-400 transition-colors">How to Book</a></li>
                <li><a href="#" className="hover:text-brand-400 transition-colors">Safety Guarantee</a></li>
                <li><a href="#" className="hover:text-brand-400 transition-colors">Pricing Estimates</a></li>
                <li><a href="#" className="hover:text-brand-400 transition-colors">Help Center / FAQ</a></li>
              </ul>
            </div>

            {/* Links Column 2 */}
            <div>
              <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Professionals</h4>
              <ul className="space-y-4 text-sm font-medium">
                <li><a href="#" className="hover:text-brand-400 transition-colors">Register as a Pro</a></li>
                <li><a href="#" className="hover:text-brand-400 transition-colors">Worker Guidelines</a></li>
                <li><a href="#" className="hover:text-brand-400 transition-colors">Success Stories</a></li>
                <li><a href="#" className="hover:text-brand-400 transition-colors">Partner Support</a></li>
              </ul>
            </div>

            {/* Links Column 3 */}
            <div>
              <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Company</h4>
              <ul className="space-y-4 text-sm font-medium">
                <li><a href="#" className="hover:text-brand-400 transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-brand-400 transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-brand-400 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-brand-400 transition-colors">Terms of Service</a></li>
              </ul>
            </div>

          </div>
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-500 text-sm font-medium">© 2026 QuickFix Services. All rights reserved.</p>
            <p className="text-slate-500 text-sm font-medium flex items-center gap-1">Designed with <Star className="w-4 h-4 text-brand-500" /> in Mumbai</p>
          </div>
        </div>
      </footer>

    </div>
  );
}