const API_BASE = 'http://localhost:8081/api';

async function handleResponse(response) {
  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const body = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const message = (body && typeof body === 'object' && (body.message || body.error))
      || (typeof body === 'string' ? body : null)
      || 'Đã có lỗi xảy ra.';
    throw new Error(message);
  }

  return body;
}

export async function getEvents({ page = 0, size = 12, sort = 'dateTime,asc', keyword = '' } = {}) {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
    sort,
  });

  if (keyword.trim()) {
    params.set('keyword', keyword.trim());
  }

  const response = await fetch(`${API_BASE}/events?${params.toString()}`);
  const data = await handleResponse(response);
  return data;
}

export async function getBookings(token) {
  const response = await fetch(`${API_BASE}/bookings/my-bookings?page=0&size=20`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return handleResponse(response);
}

export async function loginUser(email, password) {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  return handleResponse(response);
}

export async function registerUser(userData) {
  const response = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  return handleResponse(response);
}

export async function getUserProfile(token) {
  const response = await fetch(`${API_BASE}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return handleResponse(response);
}

export async function updateUserProfile(token, profileData) {
  const response = await fetch(`${API_BASE}/auth/me`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(profileData),
  });

  return handleResponse(response);
}

export async function createEvent(token, eventData) {
  const response = await fetch(`${API_BASE}/events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(eventData),
  });

  return handleResponse(response);
}

export async function updateEvent(token, eventId, eventData) {
  const response = await fetch(`${API_BASE}/events/${eventId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(eventData),
  });

  return handleResponse(response);
}

export async function deleteEvent(token, eventId) {
  const response = await fetch(`${API_BASE}/events/${eventId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return handleResponse(response);
}

export async function createBooking(token, eventId, quantity) {
  const response = await fetch(`${API_BASE}/bookings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ eventId, quantity }),
  });

  return handleResponse(response);
}

export async function createPayment(token, bookingId, clientIp = '127.0.0.1') {
  const response = await fetch(`${API_BASE}/bookings/${bookingId}/pay?clientIp=${encodeURIComponent(clientIp)}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return handleResponse(response);
}

export async function completePayment(token, bookingId) {
  const response = await fetch(`${API_BASE}/bookings/${bookingId}/complete`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return handleResponse(response);
}

export async function cancelBooking(token, bookingId, reason) {
  const response = await fetch(`${API_BASE}/bookings/${bookingId}/cancel`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ reason }),
  });

  return handleResponse(response);
}

export async function getAdminStats(token) {
  const response = await fetch(`${API_BASE}/admin/stats`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return handleResponse(response);
}

export async function sendChatMessage(message) {
  const response = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message }),
  });

  return handleResponse(response);
}

export const API = {
  API_BASE,
};
