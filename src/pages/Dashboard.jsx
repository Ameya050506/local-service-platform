import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { Clock, CheckCircle2, Wrench, Search, MapPin, Calendar, FileText, User as UserIcon, X, Trash2, Filter, AlertCircle } from 'lucide-react';
import { useRequests } from '../hooks/useRequests';
import { useAuth } from '../hooks/useAuth';

// Initialize Socket.IO connection (with auto-reconnect disabled if you prefer less console spam when backend is down)
const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const socket = io(SOCKET_URL, { reconnection: true, reconnectionAttempts: 5 });

export default function Dashboard() {
  const { user } = useAuth();
  const { requests: contextRequests, isLoading, cancelRequest, updateRequestStatus } = useRequests();
  
  const [liveRequests, setLiveRequests] = useState([]);
  
  // NEW: Global Toast State
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
      console.log('Real-time update received:', updatedData);
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
    showToast // Passing the toast function to all panels
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen relative overflow-hidden">
      
      {/* GLOBAL TOAST NOTIFICATION UI */}
      {toast && (
        <div className="fixed top-24 right-4 z-[200] animate-in slide-in-from-right-8 fade-in duration-300">
          <div className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border ${
            toast.type === 'success' ? 'bg-emerald-900 border-emerald-800 text-white' : 'bg-red-900 border-red-800 text-white'
          }`}>
            {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <AlertCircle className="w-5 h-5 text-red-400" />}
            <span className="font-bold text-sm tracking-wide">{toast.message}</span>
            <button onClick={() => setToast(null)} className="ml-4 opacity-70 hover:opacity-100 transition-opacity">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Universal Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl md:text-4xl font-black text-slate-900">Workspace</h1>
            <span className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Live Sync
            </span>
          </div>
          <p className="text-slate-500 text-lg">
            Welcome back, <span className="font-bold text-brand-600">{user.name}</span>.
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
// 1. THE CLIENT PORTAL (Upgraded with Skeletons)
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
                          (req.id || req._id).toLowerCase().includes(searchQuery.toLowerCase());
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

  // PREMIUM SKELETON ROW COMPONENT
  const SkeletonRow = () => (
    <tr className="animate-pulse border-b border-gray-100 bg-white">
      <td className="px-8 py-6">
        <div className="h-4 bg-gray-200 rounded-md w-3/4 mb-3"></div>
        <div className="h-3 bg-gray-100 rounded-md w-1/2"></div>
      </td>
      <td className="px-8 py-6">
        <div className="h-4 bg-gray-200 rounded-md w-full mb-3"></div>
        <div className="h-3 bg-gray-100 rounded-md w-2/3"></div>
      </td>
      <td className="px-8 py-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gray-200 shrink-0"></div>
          <div className="h-4 bg-gray-200 rounded-md w-24"></div>
        </div>
      </td>
      <td className="px-8 py-6">
        <div className="h-6 bg-gray-200 rounded-full w-20"></div>
      </td>
      <td className="px-8 py-6 text-right">
        <div className="h-8 bg-gray-100 rounded-lg w-24 ml-auto"></div>
      </td>
    </tr>
  );

  return (
    <div className="space-y-8">
      {/* Details Modal */}
      {selectedReq && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-gray-50/50">
              <div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold mb-3 inline-block ${
                  selectedReq.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                  selectedReq.status === 'In Progress' ? 'bg-brand-100 text-brand-800' :
                  'bg-emerald-100 text-emerald-800'
                }`}>{selectedReq.status}</span>
                <h2 className="text-2xl font-bold text-slate-900">{selectedReq.service}</h2>
                <p className="text-sm text-slate-500 mt-1 font-mono">{selectedReq.id || selectedReq._id}</p>
              </div>
              <button onClick={() => setSelectedReq(null)} className="p-2 bg-white border border-gray-200 hover:bg-gray-100 rounded-full transition-colors"><X className="w-5 h-5 text-gray-600" /></button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <div className="flex items-center gap-2 text-slate-500 mb-1"><Calendar className="w-4 h-4"/> <span className="text-xs font-bold uppercase tracking-wider">Date</span></div>
                  <p className="font-semibold text-slate-800">{selectedReq.date || new Date(selectedReq.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <div className="flex items-center gap-2 text-slate-500 mb-1"><UserIcon className="w-4 h-4"/> <span className="text-xs font-bold uppercase tracking-wider">Provider</span></div>
                  <p className="font-semibold text-slate-800">{selectedReq.provider || 'Unassigned'}</p>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 text-slate-500 mb-2"><MapPin className="w-4 h-4"/> <span className="text-xs font-bold uppercase tracking-wider">Location</span></div>
                <p className="font-medium text-slate-800 bg-gray-50 p-3 rounded-xl border border-gray-100">{selectedReq.location}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-slate-500 mb-2"><FileText className="w-4 h-4"/> <span className="text-xs font-bold uppercase tracking-wider">Issue Description</span></div>
                <p className="text-slate-700 bg-yellow-50/50 p-4 rounded-xl border border-yellow-100">{selectedReq.desc || 'No description provided.'}</p>
              </div>
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
              {selectedReq.status === 'Pending' ? (
                <button onClick={() => handleCancel(selectedReq.id || selectedReq._id)} className="flex items-center gap-2 font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-4 py-2.5 rounded-xl transition-all">
                  <Trash2 className="w-4 h-4" /> Cancel Request
                </button>
              ) : (
                <span className="text-sm text-slate-400 font-medium italic">Cannot cancel active requests.</span>
              )}
              <button onClick={() => setSelectedReq(null)} className="font-bold text-slate-600 hover:text-slate-900 px-4 py-2.5">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-5 hover:border-yellow-200 transition-colors">
          <div className="bg-yellow-50 p-4 rounded-2xl text-yellow-600"><Clock className="w-8 h-8" /></div>
          <div><p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Pending</p><p className="text-3xl font-black text-slate-900">{isLoading ? '-' : pendingCount}</p></div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-5 hover:border-brand-200 transition-colors">
          <div className="bg-brand-50 p-4 rounded-2xl text-brand-600"><Wrench className="w-8 h-8" /></div>
          <div><p className="text-sm font-bold text-gray-400 uppercase tracking-wider">In Progress</p><p className="text-3xl font-black text-slate-900">{isLoading ? '-' : inProgressCount}</p></div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-5 hover:border-emerald-200 transition-colors">
          <div className="bg-emerald-50 p-4 rounded-2xl text-emerald-600"><CheckCircle2 className="w-8 h-8" /></div>
          <div><p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Completed</p><p className="text-3xl font-black text-slate-900">{isLoading ? '-' : completedCount}</p></div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden min-h-[400px]">
        <div className="px-8 py-6 border-b border-gray-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white">
          <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0 hide-scrollbar">
            {['All', 'Pending', 'In Progress', 'Completed'].map(tab => (
              <button 
                key={tab} onClick={() => setActiveTab(tab)} disabled={isLoading}
                className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${activeTab === tab ? 'bg-slate-900 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50'}`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" placeholder="Search Service or ID..." 
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} disabled={isLoading}
              className="pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none w-full lg:w-72 transition-all disabled:opacity-50"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-bold">
                <th className="px-8 py-5">Service Info</th>
                <th className="px-8 py-5">Location & Date</th>
                <th className="px-8 py-5">Provider</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <>
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                </>
              ) : filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-8 py-20 text-center">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4"><Filter className="w-8 h-8 text-gray-400" /></div>
                    <h4 className="text-lg font-bold text-slate-800">No matching requests found</h4>
                    <p className="text-slate-500 mt-1">Try adjusting your filters or search term.</p>
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req, i) => (
                  <tr key={i} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-8 py-5">
                      <p className="font-bold text-slate-900">{req.service}</p>
                      <p className="text-xs text-slate-400 font-mono mt-1">{req.id || req._id}</p>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-sm font-medium text-slate-700">{req.location}</p>
                      <p className="text-xs text-slate-500 mt-1">{req.date || new Date(req.createdAt).toLocaleDateString()}</p>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                          {req.provider ? req.provider.charAt(0).toUpperCase() : '?'}
                        </div>
                        <span className="text-sm font-medium text-slate-700">{req.provider || 'Unassigned'}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                        req.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        req.status === 'In Progress' ? 'bg-brand-100 text-brand-800' :
                        'bg-emerald-100 text-emerald-800'
                      }`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button onClick={() => setSelectedReq(req)} className="opacity-0 group-hover:opacity-100 text-brand-600 font-bold hover:text-brand-800 text-sm bg-brand-50 px-4 py-2 rounded-lg transition-all">
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
// 2. THE WORKER PORTAL (Upgraded with Toasts)
// ==========================================
function WorkerPanel({ requests, isLoading, updateRequestStatus, user, showToast }) {
  const availableJobs = requests.filter(req => req.status === 'Pending');
  const myActiveJobs = requests.filter(req => req.status === 'In Progress' && req.provider === user.name);

  const handleAcceptJob = (jobId) => {
    updateRequestStatus(jobId, 'In Progress', user.name);
    showToast('Job Accepted! Contacting client...', 'success');
  };

  const handleCompleteJob = (jobId) => {
    updateRequestStatus(jobId, 'Completed', user.name);
    showToast('Job marked as completed. Great work!', 'success');
  };

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="w-12 h-12 border-4 border-gray-200 border-t-brand-500 rounded-full animate-spin mb-4"></div>
      <p className="text-slate-500 font-medium animate-pulse">Syncing jobs feed...</p>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="p-8 bg-white border-t-4 border-brand-500 rounded-3xl shadow-sm">
        <h2 className="mb-2 text-2xl font-bold text-slate-900">My Active Jobs</h2>
        <p className="mb-6 text-slate-600">Jobs you have accepted and are currently working on.</p>
        
        {myActiveJobs.length === 0 ? (
          <div className="p-8 text-center border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
            <p className="font-medium text-slate-500">You have no active jobs. Accept one below!</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {myActiveJobs.map((job) => (
              <div key={job.id || job._id} className="p-6 border border-brand-100 rounded-2xl bg-brand-50/30">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold text-slate-900">{job.service}</h3>
                  <span className="px-3 py-1 text-xs font-bold text-brand-700 bg-brand-100 rounded-full">{job.status}</span>
                </div>
                <div className="mb-6 space-y-2 text-sm text-slate-600">
                  <p className="flex items-center gap-2"><MapPin className="w-4 h-4 text-brand-500"/> {job.location}</p>
                  <p className="flex items-center gap-2"><FileText className="w-4 h-4 text-brand-500"/> {job.desc || 'No details provided.'}</p>
                </div>
                <button 
                  onClick={() => handleCompleteJob(job.id || job._id)}
                  className="w-full px-4 py-3 text-sm font-bold text-white transition-colors bg-brand-600 rounded-xl hover:bg-brand-700 flex items-center justify-center gap-2 shadow-lg shadow-brand-500/20 hover:-translate-y-0.5"
                >
                  <CheckCircle2 className="w-4 h-4" /> Mark as Completed
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-8 bg-white border-t-4 border-emerald-500 rounded-3xl shadow-sm">
        <h2 className="mb-2 text-2xl font-bold text-slate-900">Available Jobs Feed</h2>
        <p className="mb-6 text-slate-600">Accept new service requests in your area.</p>
        
        {availableJobs.length === 0 ? (
          <div className="p-8 text-center border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
            <p className="font-medium text-slate-500">No pending jobs available right now.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {availableJobs.map((job) => (
              <div key={job.id || job._id} className="p-6 border border-gray-200 rounded-2xl hover:border-emerald-300 hover:shadow-lg transition-all group bg-white">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold text-slate-900">{job.service}</h3>
                  <span className="px-3 py-1 text-xs font-bold text-yellow-700 bg-yellow-100 rounded-full">{job.status}</span>
                </div>
                <div className="mb-6 space-y-2 text-sm text-slate-600">
                  <p className="flex items-center gap-2"><MapPin className="w-4 h-4 text-emerald-500"/> {job.location}</p>
                  <p className="p-3 mt-2 bg-yellow-50 border border-yellow-100 rounded-xl">{job.desc || 'No details provided.'}</p>
                </div>
                
                <button 
                  onClick={() => handleAcceptJob(job.id || job._id)}
                  className="w-full px-4 py-3 text-sm font-bold text-emerald-700 transition-colors bg-emerald-50 border border-emerald-200 rounded-xl hover:bg-emerald-600 hover:text-white group-hover:shadow-lg group-hover:shadow-emerald-500/20"
                >
                  Accept Job
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
// 3. THE ADMIN PORTAL (Upgraded with Toasts)
// ==========================================
function AdminPanel({ requests, isLoading, cancelRequest, showToast }) {
  const handleDelete = (id) => {
    if(window.confirm("ADMIN OVERRIDE: Are you sure you want to permanently delete this request?")) {
      cancelRequest(id);
      showToast('System record permanently deleted.', 'error');
    }
  };

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="w-12 h-12 border-4 border-gray-200 border-t-purple-500 rounded-full animate-spin mb-4"></div>
      <p className="text-slate-500 font-medium animate-pulse">Syncing system records...</p>
    </div>
  );

  return (
    <div className="p-8 bg-white border-t-4 border-purple-500 rounded-3xl shadow-sm">
      <h2 className="mb-4 text-2xl font-bold text-slate-900">Platform Overview</h2>
      <p className="mb-8 text-slate-600">Manage users and monitor real-time platform health.</p>
      
      <div className="grid grid-cols-1 gap-6 mb-10 md:grid-cols-3">
        <div className="p-6 bg-purple-50 rounded-2xl border border-purple-100">
          <h3 className="font-bold text-purple-800 uppercase tracking-wider text-xs mb-2">Total Requests</h3>
          <p className="text-4xl font-black text-purple-700">{requests.length}</p>
        </div>
        <div className="p-6 bg-yellow-50 rounded-2xl border border-yellow-100">
          <h3 className="font-bold text-yellow-800 uppercase tracking-wider text-xs mb-2">Pending Jobs</h3>
          <p className="text-4xl font-black text-yellow-700">{requests.filter(r => r.status === 'Pending').length}</p>
        </div>
        <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
          <h3 className="font-bold text-emerald-800 uppercase tracking-wider text-xs mb-2">Completed Jobs</h3>
          <p className="text-4xl font-black text-emerald-700">{requests.filter(r => r.status === 'Completed').length}</p>
        </div>
      </div>

      <h3 className="mb-4 text-lg font-bold text-slate-900">System Activity Log</h3>
      <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm">
        {requests.map(req => (
          <div key={req.id || req._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
            <div className="mb-3 sm:mb-0">
              <p className="font-bold text-slate-900">{req.service}</p>
              <p className="text-xs text-slate-500 font-mono mt-1">ID: {req.id || req._id}</p>
            </div>
            <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
              <span className={`px-3 py-1.5 text-xs font-bold rounded-full 
                ${req.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                  req.status === 'In Progress' ? 'bg-brand-100 text-brand-800' : 
                  'bg-emerald-100 text-emerald-800'}`}>
                {req.status}
              </span>
              <button 
                onClick={() => handleDelete(req.id || req._id)}
                className="p-2 text-red-500 hover:text-white hover:bg-red-500 rounded-lg transition-all border border-transparent hover:border-red-600"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
        {requests.length === 0 && (
          <p className="p-8 text-center text-slate-500 italic bg-gray-50/50">No system activity found.</p>
        )}
      </div>
    </div>
  );
}