const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const API_BASE_URL = `${baseURL}/api`;

// Certificate Requests
export const fetchRequests = async (status = 'all') => {
  try {
    const url = status === 'all' 
      ? `${API_BASE_URL}/requests/` 
      : `${API_BASE_URL}/requests/?status=${status}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch requests');
    return await response.json();
  } catch (error) {
    console.error('Error fetching requests:', error);
    return [];
  }
};

export const createRequest = async (data) => {
  try {
    const response = await fetch(`${API_BASE_URL}/requests/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create request');
    return await response.json();
  } catch (error) {
    console.error('Error creating request:', error);
    throw error;
  }
};

export const updateRequestStatus = async (id, status) => {
  try {
    const response = await fetch(`${API_BASE_URL}/requests/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) throw new Error('Failed to update request');
    return await response.json();
  } catch (error) {
    console.error('Error updating request:', error);
    throw error;
  }
};

export const deleteRequest = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/requests/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete request');
    return await response.json();
  } catch (error) {
    console.error('Error deleting request:', error);
    throw error;
  }
};

// Appointments
export const fetchAppointments = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/appointments/`);
    if (!response.ok) throw new Error('Failed to fetch appointments');
    return await response.json();
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return [];
  }
};

export const createAppointment = async (data) => {
  try {
    const response = await fetch(`${API_BASE_URL}/appointments/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create appointment');
    return await response.json();
  } catch (error) {
    console.error('Error creating appointment:', error);
    throw error;
  }
};

export const updateAppointmentStatus = async (id, status) => {
  try {
    const response = await fetch(`${API_BASE_URL}/appointments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) throw new Error('Failed to update appointment');
    return await response.json();
  } catch (error) {
    console.error('Error updating appointment:', error);
    throw error;
  }
};

export const deleteAppointment = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/appointments/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete appointment');
    return await response.json();
  } catch (error) {
    console.error('Error deleting appointment:', error);
    throw error;
  }
};

// Auth
export const loginAdmin = async (username, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!response.ok) throw new Error('Login failed');
    return await response.json();
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

export const registerAdmin = async (username, password, name) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, name }),
    });
    if (!response.ok) throw new Error('Registration failed');
    return await response.json();
  } catch (error) {
    console.error('Error registering:', error);
    throw error;
  }
};
