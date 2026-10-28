export const initialState = {
  services: [],
  requests: [],
  isLoading: false,
};

export const serviceReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { 
        ...state, 
        isLoading: action.payload 
      };
    
    case 'INITIALIZE_DATA':
      return {
        ...state,
        services: action.payload.services,
        requests: action.payload.requests,
        isLoading: false,
      };
      
    case 'ADD_REQUEST': {
      if (!action.payload) return state;
      const newId = action.payload.id || action.payload._id;
      const safeRequests = Array.isArray(state.requests) ? state.requests : [];
      const exists = safeRequests.some((req) => {
        const id = req.id || req._id;
        return id && newId && id === newId;
      });
      if (exists) {
        return {
          ...state,
          requests: safeRequests.map((req) => 
            ((req.id || req._id) === newId ? { ...req, ...action.payload } : req)
          )
        };
      }
      return {
        ...state,
        requests: [action.payload, ...safeRequests],
      };
    }

    case 'CANCEL_REQUEST':
      if (!action.payload) return state; 
      return {
        ...state,
        requests: (Array.isArray(state.requests) ? state.requests : []).filter((req) => {
          const id = req.id || req._id;
          return id && id !== action.payload; 
        }),
      };
      
    case 'UPDATE_REQUEST': {
      if (!action.payload) return state;
      const targetId = action.payload.id || action.payload._id;
      return {
        ...state,
        requests: (Array.isArray(state.requests) ? state.requests : []).map((req) => {
          const reqId = req.id || req._id;
          if (reqId && targetId && reqId === targetId) {
            return { ...req, ...action.payload };
          }
          return req;
        }),
      };
    }

    default:
      return state;
  }
};
