import { createContext, useReducer, useEffect } from 'react';
import { Zap, Wrench, Paintbrush, Droplets, Fan, Car } from 'lucide-react';
import { serviceReducer, initialState } from './serviceReducer';

export const ServiceContext = createContext();

// The URL of our Express backend
const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/requests`;

export function ServiceProvider({ children }) {
  const [state, dispatch] = useReducer(serviceReducer, initialState);

  // Get auth token for API calls
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  };

  // 1. POST: Send new request to MongoDB
  const addRequest = async (newRequest) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(newRequest)
      });
      
      const savedRequest = await response.json();
      
      // Tell the reducer to add the database-saved request to the UI
      dispatch({ type: 'ADD_REQUEST', payload: savedRequest });
    } catch (error) {
      console.error("Failed to save request to database", error);
    }
  };

  // 2. DELETE: Remove request from MongoDB
  const cancelRequest = async (id) => {
    try {
      await fetch(`${API_URL}/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
      
      // Tell the reducer to remove it from the UI
      dispatch({ type: 'CANCEL_REQUEST', payload: id });
    } catch (error) {
      console.error("Failed to delete request from database", error);
    }
  };

  // 3. PUT: Update Request Status (For Workers)
  const updateRequestStatus = async (id, newStatus, providerName) => {
    try {
      const response = await fetch(`${API_URL}/${id}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: newStatus, provider: providerName }),
      });
      
      const updatedData = await response.json();

      // Dispatch to useReducer to update the global state instantly
      dispatch({ 
        type: 'UPDATE_REQUEST', 
        payload: updatedData 
      });
    } catch (error) {
      console.error('Error updating request status:', error);
    }
  };

  // 4. GET: Fetch data when the app loads
  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      try {
        // Fetch real data from MongoDB
        const res = await fetch(API_URL, { headers: getAuthHeaders() });
        const dbRequests = await res.json();

        // (We keep services hardcoded since they don't change and we didn't build a DB table for them)
        const mockServices = [
          { name: 'Electrical Help', icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-50', desc: 'Wiring, repairs, and installations.' },
          { name: 'Plumbing Works', icon: Droplets, color: 'text-blue-500', bg: 'bg-blue-50', desc: 'Leakages, pipes, and fittings.' },
          { name: 'AC Repair', icon: Fan, color: 'text-cyan-500', bg: 'bg-cyan-50', desc: 'Servicing, gas filling, and fixes.' },
          { name: 'House Painting', icon: Paintbrush, color: 'text-purple-500', bg: 'bg-purple-50', desc: 'Interior and exterior painting.' },
          { name: 'Carpentry', icon: Wrench, color: 'text-orange-500', bg: 'bg-orange-50', desc: 'Furniture repair and assembly.' },
          { name: 'Vehicle Repair', icon: Car, color: 'text-slate-700', bg: 'bg-slate-100', desc: 'On-spot breakdown assistance.' },
        ];

        dispatch({ 
          type: 'INITIALIZE_DATA', 
          payload: { services: mockServices, requests: dbRequests } 
        });

      } catch (error) {
        console.error("Failed to fetch from database. Is the backend running?", error);
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    fetchData();
  }, []);

  return (
    <ServiceContext.Provider value={{ ...state, addRequest, cancelRequest, updateRequestStatus }}>
      {children}
    </ServiceContext.Provider>
  );
}