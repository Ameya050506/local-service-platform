import { createContext, useReducer, useEffect, useCallback, useMemo } from 'react';
import { io } from 'socket.io-client';
import { Zap, Wrench, Paintbrush, Droplets, Fan, Car } from 'lucide-react';
import { serviceReducer, initialState } from './serviceReducer';
import { useAuth } from '../hooks/useAuth';

export const ServiceContext = createContext();

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_URL = `${SOCKET_URL}/api/requests`;

const socket = io(SOCKET_URL, { reconnection: true, reconnectionAttempts: 5 });

export function ServiceProvider({ children }) {
  const [state, dispatch] = useReducer(serviceReducer, initialState);
  const { user } = useAuth();

  // Helper to attach JWT token
  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }, []);

  // 1. Fetch data from MongoDB
  const fetchData = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      // If no token exists, don't spam protected route
      if (!token) {
        return;
      }

      dispatch({ type: 'SET_LOADING', payload: true });
      const res = await fetch(API_URL, { headers: getAuthHeaders() });
      if (!res.ok) {
        dispatch({ type: 'SET_LOADING', payload: false });
        return;
      }

      let dbRequests = await res.json();
      const mockServices = [
        { name: 'Electrical Help', icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-50', desc: 'Wiring, repairs, and installations.' },
        { name: 'Plumbing Works', icon: Droplets, color: 'text-blue-500', bg: 'bg-blue-50', desc: 'Leakages, pipes, and fittings.' },
        { name: 'AC Repair', icon: Fan, color: 'text-cyan-500', bg: 'bg-cyan-50', desc: 'Servicing, gas filling, and fixes.' },
        { name: 'House Painting', icon: Paintbrush, color: 'text-purple-500', bg: 'bg-purple-50', desc: 'Interior and exterior painting.' },
        { name: 'Carpentry', icon: Wrench, color: 'text-orange-500', bg: 'bg-orange-50', desc: 'Furniture repair and assembly.' },
        { name: 'Vehicle Repair', icon: Car, color: 'text-slate-700', bg: 'bg-slate-100', desc: 'On-spot breakdown assistance.' },
      ];

      const requestsArray = Array.isArray(dbRequests) ? dbRequests : [];

      dispatch({ 
        type: 'INITIALIZE_DATA', 
        payload: { services: mockServices, requests: requestsArray } 
      });

    } catch (error) {
      console.error("Failed to fetch from database. Is backend running?", error);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [getAuthHeaders]);

  // Initial fetch on mount or whenever user state changes (login / switch account)
  useEffect(() => {
    fetchData();
  }, [user, fetchData]);

  // 2. Real-time WebSockets synchronization (Experiment 8)
  useEffect(() => {
    socket.on('requestUpdated', (updated) => {
      dispatch({ type: 'UPDATE_REQUEST', payload: updated });
    });

    socket.on('newRequest', (newReq) => {
      dispatch({ type: 'ADD_REQUEST', payload: newReq });
    });

    socket.on('requestDeleted', ({ id }) => {
      dispatch({ type: 'CANCEL_REQUEST', payload: id });
    });

    return () => {
      socket.off('requestUpdated');
      socket.off('newRequest');
      socket.off('requestDeleted');
    };
  }, []);

  // 3. POST: Send new request to MongoDB
  const addRequest = useCallback(async (newRequest) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(newRequest)
      });
      
      const savedRequest = await response.json();
      
      if (response.ok && savedRequest && (savedRequest._id || savedRequest.id)) {
        dispatch({ type: 'ADD_REQUEST', payload: savedRequest });
        return { success: true, data: savedRequest };
      }
      return { success: false, message: savedRequest.message };
    } catch (error) {
      console.error("Failed to save request to database", error);
      return { success: false, error };
    }
  }, [getAuthHeaders]);

  // 4. DELETE: Remove request from MongoDB
  const cancelRequest = useCallback(async (id) => {
    try {
      await fetch(`${API_URL}/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
      dispatch({ type: 'CANCEL_REQUEST', payload: id });
    } catch (error) {
      console.error("Failed to delete request from database", error);
    }
  }, [getAuthHeaders]);

  // 5. PUT: Update Request Status (For Workers)
  const updateRequestStatus = useCallback(async (id, newStatus, providerName) => {
    try {
      const response = await fetch(`${API_URL}/${id}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: newStatus, provider: providerName }),
      });
      
      const updatedData = await response.json();

      if (response.ok && updatedData) {
        dispatch({ 
          type: 'UPDATE_REQUEST', 
          payload: updatedData 
        });
      }
    } catch (error) {
      console.error('Error updating request status:', error);
    }
  }, [getAuthHeaders]);

  const value = useMemo(() => ({
    ...state,
    addRequest,
    cancelRequest,
    updateRequestStatus,
    refetchRequests: fetchData
  }), [state, addRequest, cancelRequest, updateRequestStatus, fetchData]);

  return (
    <ServiceContext.Provider value={value}>
      {children}
    </ServiceContext.Provider>
  );
}
