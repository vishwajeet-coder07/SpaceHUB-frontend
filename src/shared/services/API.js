export const BASE_URL = 'https://codewithketan.me/api/v1/';
export async function registerUser(payload) {
  const response = await fetch(`${BASE_URL}registration`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return handleJson(response);
}

export async function loginUser(payload) {
  const response = await fetch(`${BASE_URL}login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...payload, type: 'LOGIN' })
  });
  const data = await handleJson(response);
  console.log('data', data);

  const token = data?.accessToken || data?.token || data?.jwt || data?.data?.accessToken || data?.data?.token;
  console.log('token', token);
  if (token) {
    sessionStorage.setItem('accessToken', token);
    if (data.user || data.data?.user) {
      const userObj = data.user || data.data?.user;
      sessionStorage.setItem('userData', JSON.stringify(userObj));
    }
  }

  return data;
}

export async function requestForgotPassword(email) {
  const response = await fetch(`${BASE_URL}forgotpassword`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  return handleJson(response);
}

export async function validateOtp(payload) {
  const response = await fetch(`${BASE_URL}validateforgototp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return handleJson(response);
}

export async function resetPassword(payload) {
  const response = await fetch(`${BASE_URL}resetpassword`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await handleJson(response);

  const token = data?.accessToken || data?.token || data?.jwt || data?.data?.accessToken || data?.data?.token;
  if (token) {
    sessionStorage.setItem('accessToken', token);
    if (data.user || data.data?.user) {
      const userObj = data.user || data.data?.user;
      sessionStorage.setItem('userData', JSON.stringify(userObj));
    }
  }

  return data;
} 

export async function resendRegisterOtp(email, registrationToken) {
  const response = await fetch(`${BASE_URL}resendotp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email, sessionToken: registrationToken }),
  });
  return handleJson(response);
}

export async function resendForgotOtp(forgotToken) {
  const response = await fetch(`${BASE_URL}resendforgototp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({tempToken: forgotToken })
  });
  return handleJson(response);
}

export async function validateRegisterOtp(payload) {
  const response = await fetch(`${BASE_URL}validateregisterotp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return handleJson(response);
}

export async function createCommunity({ name, description, createdByEmail, imageFile }) {
  const formData = new FormData();
  formData.append('name', name);
  formData.append('description', description);
  formData.append('createdByEmail', createdByEmail);
  if (imageFile) {
    formData.append('imageFile', imageFile);
  }
  const response = await authenticatedFetch(`${BASE_URL}community/create`, {
    method: 'POST',
    body: formData
  });
  // Try parse JSON (using handleJson or inline)
  let data;
  try {
    data = await response.json();
  } catch {
    data = null;
  }
  if (!response.ok) {
    const message = (data && (data.message || data.error)) || `HTTP ${response.status}`;
    throw new Error(message);
  }
  return data;
}

export async function getAllCommunities() {
  const response = await authenticatedFetch(`${BASE_URL}community/all`, {
    method: 'GET'
  });
  let data;
  try {
    data = await response.json();
  } catch {
    data = null;
  }
  if (!response.ok) {
    const message = (data && (data.message || data.error)) || `HTTP ${response.status}`;
    throw new Error(message);
  }
  return data;
}

async function handleJson(response) {
  let data;
  try {
    data = await response.json();
  } catch {
    data = null;
  }
  if (!response.ok) {
    const message = (data && (data.message || data.error)) || `HTTP ${response.status}`;
    throw new Error(message);
  }
  return data;
}

export const getAuthHeaders = (isFormData = false) => {
  const token = sessionStorage.getItem('accessToken');
  return {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

export const authenticatedFetch = async (url, options = {}) => {
  // Check if body is FormData to determine headers
  const isFormData = options.body instanceof FormData;
  const headers = getAuthHeaders(isFormData);
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...options.headers
    }
  });
  
  if (response.status === 401) {
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('userData');
    window.location.href = '/login';
  }
  
  return response;
};


