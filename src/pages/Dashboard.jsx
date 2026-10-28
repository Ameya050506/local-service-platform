import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { 
  Clock, 
  CheckCircle2, 
  Wrench, 
  Search, 
  MapPin, 
  Calendar, 
  FileText, 
  User as UserIcon, 
  X, 
  Trash2, 
  Filter, 
  AlertCircle,
  ShieldCheck
} from 'lucide-react';
import { useRequests } from '../hooks/useRequests';
import { useAuth } from '../hooks/useAuth';

// Initialize Socket.IO connection
const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const socket = io(SOCKET_URL, { reconnection: true, reconnectionAttempts: 5 });

// Declared outside components to satisfy ESLint static component rules
function SkeletonRow() {
  return (
    <tr className="animate-pulse border-b border-slate-100 bg-white">
      <td className="px-8 py-5">
        <div className="h-4 bg-slate-200 rounded-md w-3/4 mb-2.5"></div>
        <div className="h-3 bg-slate-100 rounded-md w-1/2"></div>
      </td>
      <td className="px-8 py-5">
        <div className="h-4 bg-slate-200 rounded-md w-full mb-2.5"></div>
        <div className="h-3 bg-slate-100 rounded-md w-2/3"></div>
      </td>
      <td className="px-8 py-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-200 shrink-0"></div>
          <div className="h-4 bg-slate-200 rounded-md w-24"></div>
        </div>
      </td>
      <td className="px-8 py-5">
        <div className="h-6 bg-slate-200 rounded-full w-20"></div>
      </td>
      <td className="px-8 py-5 text-right">
        <div className="h-8 bg-slate-100 rounded-lg w-24 ml-auto"></div>
      </td>
    </tr>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { requests: contextRequests, isLoading, cancelRequest, updateRequestStatus } = useRequests();
  
  const [liveRequests, setLiveRequests] = useState([]);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    setLiveRequests(contextRequests);
  }, [contextRequests]);

  useEffect(() => {
    socket.on('requestUpdated', (updatedData) => {
      setLiveRequests((prevRequests) => 
        prevRequests.map((req) => 
          (req.id || req._id) === (updatedData.id || updatedData._id) ? updatedData : req
        )
      );
    });
    return () => socket.off('requestUpdated');
  }, []);

  if (!user) return <Navigate to="/login" />;

  const panelProps = {
    requests: liveRequests,
    isLoading,
    cancelRequest,
    updateRequestStatus,
    user,
    showToast
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-[calc(100vh-80px)] relative">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-24 right-4 z-[200] animate-in slide-in-from-right-8 fade-in duration-300">
          <div className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border ${
            toast.type === 'success' 
              ? 'bg-slate-950 border-emerald-500/40 text-white' 
              : 'bg-rose-950 border-rose-800 text-white'
          }`}>
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            )}
            <span className="font-bold text-sm tracking-wide">{toast.message}</span>
            <button onClick={() => setToast(null)} className="ml-4 opacity-70 hover:opacity-100 transition-opacity">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Modern Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-6 border-b border-slate-200/80 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1.5">
            <h1 className="text-3xl font-black text-slate-950 tracking-tight">
              {user.role === 'worker' ? 'Partner Operations' : user.role === 'admin' ? 'System Console' : 'My Bookings'}
            </h1>
            <span className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-3 py-1 rounded-full shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              WebSockets Active
            </span>
          </div>
          <p className="text-slate-500 text-sm font-medium">
            Welcome back, <span className="font-extrabold text-slate-900">{user.name}</span>. Manage your service operations in real-time.
          </p>
        </div>
      </div>

      {/* Role-Based Rendering */}
      {user.role === 'client' && <ClientPanel {...panelProps} />}
      {user.role === 'worker' && <WorkerPanel {...panelProps} />}
      {user.role === 'admin' && <AdminPanel {...panelProps} />}
    </div>
  );
}

// ==========================================
// 1. CLIENT PORTAL (Urban Company Style)
// ==========================================
function ClientPanel({ requests, isLoading, cancelRequest, showToast }) {
  const [selectedReq, setSelectedReq] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');

  const pendingCount = requests.filter(r => r.status === 'Pending').length;
  const inProgressCount = requests.filter(r => r.status === 'In Progress').length;
  const completedCount = requests.filter(r => r.status === 'Completed').length;

  const filteredRequests = requests.filter(req => {
    const matchesSearch = req.service.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (req.id || req._id || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'All' || req.status === activeTab;
    return matchesSearch && matchesTab;
  });

  const handleCancel = (id) => {
    if(window.confirm("Are you sure you want to cancel this request?")) {
      cancelRequest(id);
      setSelectedReq(null);
      showToast('Request cancelled successfully', 'error');
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Details Modal */}
      {selectedReq && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-slate-200 my-8">
            <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50/80">
              <div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-2.5 inline-block ${
                  selectedReq.status === 'Pending' ? 'bg-amber-100 text-amber-800' :
                  selectedReq.status === 'In Progress' ? 'bg-brand-100 text-brand-800' :
                  'bg-emerald-100 text-emerald-800'
                }`}>
                  {selectedReq.status}
                </span>
                <h2 className="text-xl font-black text-slate-950">{selectedReq.service}</h2>
                <p className="text-xs text-slate-400 font-mono mt-0.5">Booking ID: {selectedReq.id || selectedReq._id}</p>
              </div>
              <button 
                onClick={() => setSelectedReq(null)} 
                className="p-2 bg-white border border-slate-200 hover:bg-slate-100 rounded-full transition-colors text-slate-500 hover:text-slate-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                    <Calendar className="w-3.5 h-3.5"/> 
                    <span className="text-[10px] font-extrabold uppercase tracking-wider">Scheduled Date</span>
                  </div>
                  <p className="font-bold text-slate-900 text-sm">
                    {selectedReq.date || new Date(selectedReq.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                    <UserIcon className="w-3.5 h-3.5"/> 
                    <span className="text-[10px] font-extrabold uppercase tracking-wider">Assigned Pro</span>
                  </div>
                  <p className="font-bold text-slate-900 text-sm truncate">
                    {selectedReq.provider || 'Assigning soon...'}
                  </p>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-1.5 text-slate-400 mb-1.5">
                  <MapPin className="w-3.5 h-3.5"/> 
                  <span className="text-[10px] font-extrabold uppercase tracking-wider">Service Location</span>
                </div>
                <p className="font-semibold text-slate-800 bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-sm">
                  {selectedReq.location}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-1.5 text-slate-400 mb-1.5">
                  <FileText className="w-3.5 h-3.5"/> 
                  <span className="text-[10px] font-extrabold uppercase tracking-wider">Job Scope</span>
                </div>
                <p className="text-slate-700 bg-amber-50/40 p-4 rounded-xl border border-amber-100 text-sm font-medium">
                  {selectedReq.desc || 'Standard inspection and maintenance.'}
                </p>
              </div>

              <div className="p-3.5 bg-emerald-50 border border-emerald-200/80 rounded-2xl flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                <p className="text-xs font-semibold text-emerald-800">
                  Backed by 30-day rework warranty. Dedicated partner assigned with standard PPE.
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
              {selectedReq.status === 'Pending' ? (
                <button 
                  onClick={() => handleCancel(selectedReq.id || selectedReq._id)} 
                  className="flex items-center gap-2 font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-4 py-2.5 rounded-xl transition-all text-xs"
                >
                  <Trash2 className="w-4 h-4" /> Cancel Booking
                </button>
              ) : (
                <span className="text-xs text-slate-400 font-medium italic">Active/Completed booking.</span>
              )}
              <button 
                onClick={() => setSelectedReq(null)} 
                className="font-bold text-slate-700 hover:text-slate-900 px-4 py-2 text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex items-center gap-5 hover:border-amber-300 transition-all">
          <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 shrink-0 shadow-sm">
            <Clock className="w-7 h-7" />
          </div>
          <div>
            <p className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Pending Bookings</p>
            <p className="text-3xl font-black text-slate-950 mt-0.5">{isLoading ? '-' : pendingCount}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex items-center gap-5 hover:border-brand-300 transition-all">
          <div className="w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center text-brand-600 shrink-0 shadow-sm">
            <Wrench className="w-7 h-7" />
          </div>
          <div>
            <p className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">In Progress</p>
            <p className="text-3xl font-black text-slate-950 mt-0.5">{isLoading ? '-' : inProgressCount}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex items-center gap-5 hover:border-emerald-300 transition-all">
          <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shrink-0 shadow-sm">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <div>
            <p className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Completed Jobs</p>
            <p className="text-3xl font-black text-slate-950 mt-0.5">{isLoading ? '-' : completedCount}</p>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        
        {/* Table Top Controls */}
        <div className="p-6 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0">
            {['All', 'Pending', 'In Progress', 'Completed'].map(tab => (
              <button 
                key={tab} 
                onClick={() => setActiveTab(tab)} 
                disabled={isLoading}
                className={`px-4 py-2 rounded-full text-xs font-extrabold whitespace-nowrap transition-all ${
                  activeTab === tab 
                    ? 'bg-slate-950 text-white shadow-sm' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search service or ID..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              disabled={isLoading}
              className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:border-brand-600 focus:ring-1 focus:ring-brand-500 outline-none w-full lg:w-72 transition-all"
            />
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[11px] uppercase tracking-wider text-slate-400 font-extrabold">
                <th className="px-8 py-4">Service Details</th>
                <th className="px-8 py-4">Location & Date</th>
                <th className="px-8 py-4">Assigned Partner</th>
                <th className="px-8 py-4">Status</th>
                <th className="px-8 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {isLoading ? (
                <>
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                </>
              ) : filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-8 py-16 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
                      <Filter className="w-7 h-7" />
                    </div>
                    <h4 className="text-base font-extrabold text-slate-900">No requests found</h4>
                    <p className="text-slate-400 text-xs mt-1">Book a new service from the home page to get started.</p>
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req, i) => (
                  <tr key={req.id || req._id || i} className="hover:bg-slate-50/70 transition-colors group">
                    <td className="px-8 py-5">
                      <p className="font-extrabold text-slate-950">{req.service}</p>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">{req.id || req._id}</p>
                    </td>
                    <td className="px-8 py-5">
                      <p className="font-semibold text-slate-800 text-sm">{req.location}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{req.date || new Date(req.createdAt).toLocaleDateString()}</p>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-700">
                          {req.provider ? req.provider.charAt(0).toUpperCase() : '?'}
                        </div>
                        <span className="font-medium text-slate-700 text-sm">{req.provider || 'Assigning...'}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                        req.status === 'Pending' ? 'bg-amber-100 text-amber-800' :
                        req.status === 'In Progress' ? 'bg-brand-100 text-brand-800' :
                        'bg-emerald-100 text-emerald-800'
                      }`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button 
                        onClick={() => setSelectedReq(req)} 
                        className="text-brand-600 font-extrabold hover:text-brand-800 text-xs bg-brand-50 hover:bg-brand-100 px-3.5 py-2 rounded-xl transition-all"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}

// ==========================================
// 2. WORKER PORTAL (Service Partner UI)
// ==========================================
function WorkerPanel({ requests, isLoading, updateRequestStatus, user, showToast }) {
  const availableJobs = requests.filter(req => req.status === 'Pending');
  const myActiveJobs = requests.filter(req => req.status === 'In Progress' && req.provider === user.name);

  const handleAcceptJob = (jobId) => {
    updateRequestStatus(jobId, 'In Progress', user.name);
    showToast('Job Accepted! Customer notified via email.', 'success');
  };

  const handleCompleteJob = (jobId) => {
    updateRequestStatus(jobId, 'Completed', user.name);
    showToast('Job marked as completed. Earnings updated!', 'success');
  };

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="w-10 h-10 border-4 border-slate-200 border-t-brand-600 rounded-full animate-spin mb-4"></div>
      <p className="text-slate-500 font-semibold text-sm">Syncing Partner Feed...</p>
    </div>
  );

  return (
    <div className="space-y-8">
      
      {/* Active Jobs */}
      <div className="p-8 bg-white border border-slate-200/80 rounded-3xl shadow-sm">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-black text-slate-950">My Ongoing Jobs</h2>
            <p className="text-slate-500 text-xs font-semibold mt-0.5">Jobs you have accepted and are assigned to complete.</p>
          </div>
          <span className="px-3 py-1 bg-brand-50 text-brand-700 font-black text-xs rounded-full border border-brand-200">
            {myActiveJobs.length} Active
          </span>
        </div>
        
        {myActiveJobs.length === 0 ? (
          <div className="p-10 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
            <p className="font-semibold text-slate-500 text-sm">No ongoing jobs at the moment. Accept an order from the feed below!</p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {myActiveJobs.map((job) => (
              <div key={job.id || job._id} className="p-6 border border-brand-200/80 rounded-2xl bg-brand-50/40 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-black text-slate-950">{job.service}</h3>
                    <span className="px-2.5 py-0.5 text-xs font-black uppercase tracking-wider text-brand-700 bg-brand-100 rounded-full">
                      {job.status}
                    </span>
                  </div>
                  <div className="mb-6 space-y-2 text-xs font-semibold text-slate-600">
                    <p className="flex items-center gap-2"><MapPin className="w-4 h-4 text-brand-600 shrink-0"/> {job.location}</p>
                    <p className="flex items-center gap-2"><Calendar className="w-4 h-4 text-brand-600 shrink-0"/> {job.date}</p>
                    <p className="p-3 bg-white border border-brand-100 rounded-xl mt-3 text-slate-700">{job.desc || 'Standard job requirements'}</p>
                  </div>
                </div>

                <button 
                  onClick={() => handleCompleteJob(job.id || job._id)}
                  className="w-full py-3 text-xs font-black uppercase tracking-wider text-white bg-slate-950 hover:bg-emerald-600 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4" /> Mark Service Completed
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Available Jobs Feed */}
      <div className="p-8 bg-white border border-slate-200/80 rounded-3xl shadow-sm">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-black text-slate-950">Nearby Available Requests</h2>
            <p className="text-slate-500 text-xs font-semibold mt-0.5">Accept new orders in your region for immediate dispatch.</p>
          </div>
          <span className="px-3 py-1 bg-amber-50 text-amber-700 font-black text-xs rounded-full border border-amber-200">
            {availableJobs.length} Available
          </span>
        </div>
        
        {availableJobs.length === 0 ? (
          <div className="p-10 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
            <p className="font-semibold text-slate-500 text-sm">No new requests in the queue right now. Refreshing automatically via WebSockets...</p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {availableJobs.map((job) => (
              <div key={job.id || job._id} className="p-6 border border-slate-200 rounded-2xl hover:border-emerald-500 hover:shadow-xl transition-all bg-white flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-base font-black text-slate-950">{job.service}</h3>
                    <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 rounded-full">
                      New
                    </span>
                  </div>
                  <div className="mb-6 space-y-1.5 text-xs font-semibold text-slate-600">
                    <p className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0"/> {job.location}</p>
                    <p className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0"/> {job.date}</p>
                    <p className="p-3 mt-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-700">{job.desc || 'Standard booking'}</p>
                  </div>
                </div>
                
                <button 
                  onClick={() => handleAcceptJob(job.id || job._id)}
                  className="w-full py-3 text-xs font-black uppercase tracking-wider text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition-all shadow-md shadow-brand-500/20"
                >
                  Accept & Claim Job
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

// ==========================================
// 3. ADMIN PORTAL (Platform Operations)
// ==========================================
function AdminPanel({ requests, isLoading, cancelRequest, showToast }) {
  const handleDelete = (id) => {
    if(window.confirm("ADMIN OVERRIDE: Permanently delete this record?")) {
      cancelRequest(id);
      showToast('System record permanently purged.', 'error');
    }
  };

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="w-10 h-10 border-4 border-slate-200 border-t-purple-600 rounded-full animate-spin mb-4"></div>
      <p className="text-slate-500 font-semibold text-sm">Loading admin metrics...</p>
    </div>
  );

  return (
    <div className="p-8 bg-white border border-slate-200/80 rounded-3xl shadow-sm space-y-8">
      <div>
        <h2 className="text-2xl font-black text-slate-950">Platform Governance</h2>
        <p className="text-slate-500 text-xs font-semibold mt-1">Real-time health, order volume, and system activity logs.</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-6 bg-purple-50/60 rounded-2xl border border-purple-100">
          <h3 className="font-extrabold text-purple-800 uppercase tracking-wider text-xs mb-1">Total System Volume</h3>
          <p className="text-4xl font-black text-purple-900">{requests.length}</p>
        </div>
        <div className="p-6 bg-amber-50/60 rounded-2xl border border-amber-100">
          <h3 className="font-extrabold text-amber-800 uppercase tracking-wider text-xs mb-1">Pending In Queue</h3>
          <p className="text-4xl font-black text-amber-900">{requests.filter(r => r.status === 'Pending').length}</p>
        </div>
        <div className="p-6 bg-emerald-50/60 rounded-2xl border border-emerald-100">
          <h3 className="font-extrabold text-emerald-800 uppercase tracking-wider text-xs mb-1">Completed Fulfilled</h3>
          <p className="text-4xl font-black text-emerald-900">{requests.filter(r => r.status === 'Completed').length}</p>
        </div>
      </div>

      <div>
        <h3 className="text-base font-black text-slate-950 mb-3">Live Dispatch Audit Feed</h3>
        <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
          {requests.map(req => (
            <div key={req.id || req._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
              <div className="mb-2 sm:mb-0">
                <p className="font-extrabold text-slate-900 text-sm">{req.service}</p>
                <p className="text-[11px] text-slate-400 font-mono">ID: {req.id || req._id} • {req.location}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className={`px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-full 
                  ${req.status === 'Pending' ? 'bg-amber-100 text-amber-800' : 
                    req.status === 'In Progress' ? 'bg-brand-100 text-brand-800' : 
                    'bg-emerald-100 text-emerald-800'}`}>
                  {req.status}
                </span>
                <button 
                  onClick={() => handleDelete(req.id || req._id)}
                  className="p-1.5 text-rose-500 hover:text-white hover:bg-rose-500 rounded-lg transition-colors"
                  title="Purge Record"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {requests.length === 0 && (
            <p className="p-8 text-center text-slate-400 text-xs font-semibold">No transactions recorded yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
