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

// Create Local Group
export async function createLocalGroup({ name, description, createdByEmail, imageFile }) {
  const formData = new FormData();
  formData.append('name', name);
  formData.append('description', description);
  formData.append('creatorEmail', createdByEmail);
  if (imageFile) {
    formData.append('imageFile', imageFile);
  }
  const response = await authenticatedFetch(`${BASE_URL}local-group/create`, {
    method: 'POST',
    body: formData
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

export const createRoom = (args) => createLocalGroup({
  name: args.name,
  description: args.description,
  createdByEmail: args.createdByEmail || args.creatorEmail || args.creatByEmail,
  imageFile: args.imageFile,
});

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

export async function getMyCommunities(requesterEmail) {
  const response = await authenticatedFetch(`${BASE_URL}community/my-communities?requesterEmail=${encodeURIComponent(requesterEmail)}`, {
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

export async function getAllLocalGroups(requesterEmail) {
  const url = requesterEmail 
    ? `${BASE_URL}local-group/all?requesterEmail=${encodeURIComponent(requesterEmail)}`
    : `${BASE_URL}local-group/all`;
  const response = await authenticatedFetch(url, {
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

export async function deleteCommunity({ name, userEmail }) {
  const response = await authenticatedFetch(`${BASE_URL}community/delete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ name, userEmail })
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

export async function leaveCommunity({ communityName, userEmail }) {
  const response = await authenticatedFetch(`${BASE_URL}community/leave`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ communityName, userEmail })
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

export async function createCommunityInvite({ communityId, inviterEmail, email }) {
  const response = await authenticatedFetch(`${BASE_URL}community/invites/${communityId}/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ inviterEmail, email })
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

export async function acceptCommunityInvite({ communityId, inviteCode, acceptorEmail }) {
  const response = await authenticatedFetch(`${BASE_URL}community/invites/accept`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ communityId, inviteCode, acceptorEmail })
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

export async function joinCommunity(communityName, userEmail) {
  const response = await authenticatedFetch(`${BASE_URL}community/requestJoin`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ 
      communityName: communityName,
      userEmail: userEmail
    })
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

export const getAllRooms = (requesterEmail) => getAllLocalGroups(requesterEmail);

export async function getMyPendingRequests(requesterEmail) {
  const response = await authenticatedFetch(`${BASE_URL}community/my-pending-requests?requesterEmail=${encodeURIComponent(requesterEmail)}`, {
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

export async function acceptJoinRequest({ communityName, creatorEmail, userEmail }) {
  const response = await authenticatedFetch(`${BASE_URL}community/request/accept`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ communityName, creatorEmail, userEmail })
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

export async function rejectJoinRequest({ communityName, creatorEmail, userEmail }) {
  const response = await authenticatedFetch(`${BASE_URL}community/request/reject`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ communityName, creatorEmail, userEmail })
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


