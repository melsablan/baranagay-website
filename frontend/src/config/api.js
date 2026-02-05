// API Base URL - Updated for Production
// For local development, use: http://127.0.0.1:5000
// For production, use your Elastic Beanstalk URL
const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
export const API_BASE_URL = `${baseURL}/api`;

// Helper function for API calls
export const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  // Add body if it exists and is not FormData
  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }
  
  return response.json();
};

// Specific API functions
export const authAPI = {
  register: (userData) => apiCall('/auth/register', {
    method: 'POST',
    body: userData,
  }),
  
  login: (credentials) => apiCall('/auth/login', {
    method: 'POST',
    body: credentials,
  }),
};

export const certificateAPI = {
  create: (data) => apiCall('/certificates', {
    method: 'POST',
    body: data,
  }),
  
  track: (trackingId) => apiCall(`/certificates/track/${trackingId}`),
  
  getUserCertificates: () => apiCall('/certificates/user'),
  
  updateStatus: (certId, data) => apiCall(`/certificates/${certId}`, {
    method: 'PUT',
    body: data,
  }),
};

export const appointmentAPI = {
  create: (data) => apiCall('/appointments', {
    method: 'POST',
    body: data,
  }),
  
  track: (trackingId) => apiCall(`/appointments/track/${trackingId}`),
  
  getAvailableSlots: (date, service) => 
    apiCall(`/appointments/available-slots?date=${date}&service=${encodeURIComponent(service)}`),
};

export const newsAPI = {
  getAll: (category) => 
    apiCall(category && category !== 'all' ? `/news?category=${category}` : '/news'),
  
  getById: (id) => apiCall(`/news/${id}`),
};

export const contactAPI = {
  submit: (data) => apiCall('/contact', {
    method: 'POST',
    body: data,
  }),
};

export const adminAPI = {
  getDashboard: () => apiCall('/admin/dashboard'),
};
