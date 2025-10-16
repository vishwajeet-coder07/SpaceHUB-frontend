export async function registerUser(payload) {
  const response = await fetch('https://codewithketan.me/api/v1/registration', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return handleJson(response);
}

export async function loginUser(payload) {
  const response = await fetch('http://codewithketan.me/api/v1/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return handleJson(response);
}

export async function requestForgotPassword(email) {
  const url = `http://codewithketan.me/api/v1/forgotpassword?email=${encodeURIComponent(email)}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });
  return handleJson(response);
}

// Validate OTP uses the login endpoint per spec
export async function validateOtp(payload) {
  const response = await fetch('https://codewithketan.me/api/v1/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return handleJson(response);
}

export async function resetPassword(payload) {
  const response = await fetch('http://codewithketan.me/api/v1/resetpassword', {
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


