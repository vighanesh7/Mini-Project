import axios from 'axios';

// One shared Axios client. Every request in the app goes through it.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Turn every failure into two easy-to-use fields:
//   error.userMessage  -> text we can show to the person
//   error.fieldErrors  -> { fieldName: "message" } from the backend validation
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const body = error.response?.data;
    let message = body?.message;
    if (!message) {
      if (error.code === 'ECONNABORTED') message = 'The request timed out. Please try again.';
      else if (!error.response) message = 'Cannot reach the server. Is the backend running on port 5000?';
      else message = error.message;
    }
    error.userMessage = message;
    error.fieldErrors = {};
    (body?.errors || []).forEach((e) => {
      if (e.field && !error.fieldErrors[e.field]) error.fieldErrors[e.field] = e.message;
    });
    return Promise.reject(error);
  }
);

// Axios wraps the reply in { data: ... }. We only want the API's own JSON body.
export const unwrap = (response) => response.data;

export default api;
