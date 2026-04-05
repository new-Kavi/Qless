import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Automatically attach JWT token to every request if it exists
API.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('qlUser'));
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

// Auth
export const loginUser = (data) => API.post('/auth/login', data);
export const registerUser = (data) => API.post('/auth/register', data);
export const fetchMe = () => API.get('/auth/me');

// Services
export const fetchServices = () => API.get('/services');
export const fetchServiceById = (id) => API.get(`/services/${id}`);
export const updateService = (id, data) => API.put(`/services/${id}`, data);
export const fetchMyServices = () => API.get('/services/mine');

// Queue
export const joinQueue = (serviceId) => API.post(`/queue/join/${serviceId}`);
export const joinEmergencyQueue = (serviceId, data) => API.post(`/queue/emergency/${serviceId}`, data);
export const getQueueStatus = (serviceId) => API.get(`/queue/status/${serviceId}`);
export const getServiceQueue = (serviceId) => API.get(`/queue/${serviceId}`);
export const callNextInQueue = (serviceId) => API.put(`/queue/next/${serviceId}`);
export const markNoShow = (tokenId) => API.delete(`/queue/noshow/${tokenId}`);

// Bookings
export const createBooking = (data) => API.post('/bookings', data);
export const fetchMyBookings = () => API.get('/bookings/mine');
export const fetchServiceBookings = (serviceId) => API.get(`/bookings/service/${serviceId}`);
export const completeBooking = (id) => API.put(`/bookings/${id}/complete`);
export const cancelBooking = (id) => API.put(`/bookings/${id}/cancel`);

// Admin
export const fetchAdminAnalytics = () => API.get('/admin/analytics');
export const fetchAllUsers = () => API.get('/admin/users');
export const toggleUserSuspension = (id) => API.put(`/admin/users/${id}/suspend`);
export const fetchAllServices = () => API.get('/admin/services');
export const toggleServiceSuspension = (id) => API.put(`/admin/services/${id}/suspend`);

export default API;
