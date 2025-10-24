export async function registerUser(payload) {
  const response = await fetch('https://codewithketan.me/api/v1/registration', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return handleJson(response);
}

export async function loginUser(payload) {
  const response = await fetch('https://codewithketan.me/api/v1/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...payload, type: 'LOGIN' })
  });
  const data = await handleJson(response);
  
  // Store authentication data if login is successful
  if (data && data.accessToken) {
    localStorage.setItem('accessToken', data.accessToken);
    if (data.user) {
      localStorage.setItem('userData', JSON.stringify(data.user));
    }
  }
  
  return data;
}

export async function requestForgotPassword(email) {
  const response = await fetch('https://codewithketan.me/api/v1/forgotpassword', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  return handleJson(response);
}

export async function validateOtp(payload) {
  const response = await fetch('https://codewithketan.me/api/v1/validateforgototp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return handleJson(response);
}

export async function resetPassword(payload) {
  const response = await fetch('https://codewithketan.me/api/v1/resetpassword', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await handleJson(response);
  
  // Store authentication data if reset is successful
  if (data && data.accessToken) {
    localStorage.setItem('accessToken', data.accessToken);
    if (data.user) {
      localStorage.setItem('userData', JSON.stringify(data.user));
    }
  }
  
  return data;
}

export async function resendRegisterOtp(email, registrationToken) {
  const response = await fetch('https://codewithketan.me/api/v1/resendotp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email, sessionToken: registrationToken }),
  });
  return handleJson(response);
}

export async function resendForgotOtp(forgotToken) {
  const response = await fetch('https://codewithketan.me/api/v1/resendforgototp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({tempToken: forgotToken })
  });
  return handleJson(response);
}

export async function validateRegisterOtp(payload) {
  const response = await fetch('https://codewithketan.me/api/v1/validateregisterotp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return handleJson(response);
}

async function handleJson(response) {
  let data;
  try {
    data = await response.json();
  } catch (e) {
    data = null;
  }
  if (!response.ok) {
    const message = (data && (data.message || data.error)) || `HTTP ${response.status}`;
    throw new Error(message);
  }
  return data;
}

export const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

export const authenticatedFetch = async (url, options = {}) => {
  const headers = getAuthHeaders();
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...options.headers
    }
  });
  
  if (response.status === 401) {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userData');
    window.location.href = '/login';
  }
  
  return response;
};


