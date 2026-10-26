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
      
    case 'ADD_REQUEST':
      return {
        ...state,
        requests: [...state.requests, action.payload],
      };
      
    case 'CANCEL_REQUEST':
      // Safety check: Don't do anything if no ID was passed
      if (!action.payload) return state; 
      
      return {
        ...state,
        requests: state.requests.filter((req) => {
          const id = req._id || req.id;
          // Must have a real ID, and it must NOT match the deleted one
          return id && id !== action.payload; 
        }),
      };
      
    case 'UPDATE_REQUEST':
      if (!action.payload) return state;

      return {
        ...state,
        requests: state.requests.map((req) => {
          const reqId = req._id || req.id;
          const payloadId = action.payload._id || action.payload.id;

          // STRICT CHECK: Only update if BOTH have real IDs and they match exactly
          if (reqId && payloadId && reqId === payloadId) {
            return action.payload;
          }
          return req; // Otherwise, leave the job alone
        }),
      };

    default:
      return state;
  }
};