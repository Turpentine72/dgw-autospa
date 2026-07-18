// Use the Vite env variable for the backend URL. No hardcoded fallback here —
// set VITE_API_URL in your .env (and in your hosting provider's env vars)
// whenever you deploy. In dev, an empty value works via the Vite proxy in
// vite.config.js (which forwards /api to localhost:5000).
const API_BASE = import.meta.env.VITE_API_URL || '';
const API_URL = `${API_BASE}/api`;

// Helper function to handle responses
const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }
  return data;
};

// Get all services (for booking form)
export const getServices = async () => {
  try {
    console.log('Fetching services from:', `${API_URL}/services`);
    const response = await fetch(`${API_URL}/services`);
    console.log('Response status:', response.status);
    const data = await handleResponse(response);
    console.log('Services data:', data);
    return data;
  } catch (error) {
    console.error('getServices error:', error);
    throw error;
  }
};

// Create a new booking (from your booking form)
export const createBooking = async (bookingData) => {
  try {
    console.log('Creating booking:', bookingData);
    const response = await fetch(`${API_URL}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingData),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('createBooking error:', error);
    throw error;
  }
};