import { useContext } from 'react';
import { ServiceContext } from '../context/ServiceContext';

export const useRequests = () => {
  const context = useContext(ServiceContext);
  
  if (!context) {
    throw new Error("useRequests must be used within a ServiceProvider");
  }
  
  return context;
};