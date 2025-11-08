export const BASE_URL = 'https://codewithketan.me/api/v1/';
export async function registerUser(payload) {
  const response = await fetch(`${BASE_URL}registration`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return handleJson(response);
}

export async function loginUser(payload) {
  const response = await fetch(`${BASE_URL}login`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await handleJson(response);
  // console.log('data', data);

  const token = data?.accessToken || data?.token || data?.jwt || data?.data?.accessToken || data?.data?.token;
  // console.log('token', token);
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
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  return handleJson(response);
}

export async function validateOtp(payload) {
  const response = await fetch(`${BASE_URL}validateforgototp`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return handleJson(response);
}

export async function resetPassword(payload) {
  const response = await fetch(`${BASE_URL}resetpassword`, {
    method: 'POST',
    credentials: 'include',
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
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email, sessionToken: registrationToken }),
  });
  return handleJson(response);
}

export async function resendForgotOtp(forgotToken) {
  const response = await fetch(`${BASE_URL}resendforgototp`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({tempToken: forgotToken })
  });
  return handleJson(response);
}

export async function validateRegisterOtp(payload) {
  const response = await fetch(`${BASE_URL}validateregisterotp`, {
    method: 'POST',
    credentials: 'include',
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

// Community: members list
export async function getCommunityMembers(communityId) {
  const response = await authenticatedFetch(`${BASE_URL}community/members`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ communityId })
  });
  let data;
  try { data = await response.json(); } catch { data = null; }
  if (!response.ok) {
    const message = (data && (data.message || data.error)) || `HTTP ${response.status}`;
    throw new Error(message);
  }
  return data;
}

// Change community member role
export async function changeCommunityRole({ communityId, targetUserEmail, requesterEmail, newRole }) {
  const response = await authenticatedFetch(`${BASE_URL}community/changeRole`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ communityId, targetUserEmail, requesterEmail, newRole })
  });
  let data;
  try { data = await response.json(); } catch { data = null; }
  if (!response.ok) {
    const message = (data && (data.message || data.error)) || `HTTP ${response.status}`;
    throw new Error(message);
  }
  return data;
}

// Community: rooms
export async function getCommunityRooms(communityId) {
  const response = await authenticatedFetch(`${BASE_URL}community/${communityId}/rooms/all`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });
  let data;
  try { data = await response.json(); } catch { data = null; }
  if (!response.ok) {
    const message = (data && (data.message || data.error)) || `HTTP ${response.status}`;
    throw new Error(message);
  }
  return data;
}

// Local Group: details by id
export async function getLocalGroupById(groupId) {
  const response = await authenticatedFetch(`${BASE_URL}local-group/${groupId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });
  let data;
  try { data = await response.json(); } catch { data = null; }
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

// Create Local Group Invite Link
export async function createLocalGroupInvite({ groupId, inviterEmail, maxUses = 5, expiresInHours = 24 }) {
  const response = await authenticatedFetch(`${BASE_URL}localgroup/invites/create/${groupId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ inviterEmail, maxUses, expiresInHours })
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

// Get Local Group Invites/Join Requests List
export async function getLocalGroupInvites(groupId) {
  const response = await authenticatedFetch(`${BASE_URL}localgroup/invites/list/${groupId}`, {
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
  const response = await authenticatedFetch(`${BASE_URL}community/acceptRequest`, {
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
  const response = await authenticatedFetch(`${BASE_URL}community/rejectRequest`, {
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

export async function searchUsers(query, email, page = 0, size = 10) {
  const response = await authenticatedFetch(`${BASE_URL}search?query=${encodeURIComponent(query)}&email=${encodeURIComponent(email)}&page=${page}&size=${size}`, {
    method: 'GET'
  });
  return handleJson(response);
}

export async function sendFriendRequest(userEmail, friendEmail) {
  const response = await authenticatedFetch(`${BASE_URL}friends/request`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ userEmail, friendEmail })
  });
  return handleJson(response);
}

// Get friends list
export async function getFriendsList(userEmail) {
  const response = await authenticatedFetch(`${BASE_URL}friends/list`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ userEmail })
  });
  return handleJson(response);
}

// Get incoming friend requests
export async function getIncomingFriendRequests(userEmail) {
  const response = await authenticatedFetch(`${BASE_URL}friends/pending/incoming`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ userEmail })
  });
  return handleJson(response);
}

export async function getOutgoingFriendRequests(userEmail) {
  const response = await authenticatedFetch(`${BASE_URL}friends/pending/outgoing`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ userEmail })
  });
  return handleJson(response);
}

export async function respondToFriendRequest({ userEmail, requesterEmail, accept }) {
  const response = await authenticatedFetch(`${BASE_URL}friends/respond`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ userEmail, requesterEmail, accept })
  });
  return handleJson(response);
}

// Remove friend
export async function removeFriend({ userEmail, friendEmail }) {
  const response = await authenticatedFetch(`${BASE_URL}friends/remove`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ userEmail, friendEmail })
  });
  return handleJson(response);
}

// Send message to a friend
export async function sendFriendMessage({ userEmail, friendEmail, message, images }) {
  const response = await authenticatedFetch(`${BASE_URL}friends/message/send`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ userEmail, friendEmail, message, images })
  });
  return handleJson(response);
}

// Get messages with a friend
export async function getFriendMessages({ userEmail, friendEmail, page = 0, size = 50 }) {
  const response = await authenticatedFetch(`${BASE_URL}friends/messages?userEmail=${encodeURIComponent(userEmail)}&friendEmail=${encodeURIComponent(friendEmail)}&page=${page}&size=${size}`, {
    method: 'GET'
  });
  return handleJson(response);
}


export async function getChatHistory(user1, user2) {
  const response = await authenticatedFetch(`${BASE_URL}messages/chat?user1=${encodeURIComponent(user1)}&user2=${encodeURIComponent(user2)}`, {
    method: 'GET'
  });
  return handleJson(response);
}


export async function searchCommunities({ query, requesterEmail, page = 0, size = 10 }) {
  const params = new URLSearchParams();
  params.set('q', query);
  if (requesterEmail) params.set('requesterEmail', requesterEmail);
  params.set('page', String(page));
  params.set('size', String(size));
  const response = await authenticatedFetch(`${BASE_URL}community/search?${params.toString()}`, {
    method: 'GET'
  });
  return handleJson(response);
}

export async function setUsername({ email, username }) {
  const payload = { email, username };
  const response = await authenticatedFetch(`${BASE_URL}dashboard/set-username`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return handleJson(response);
}

export async function uploadProfileImage({ imageFile, email }) {
  const formData = new FormData();
  formData.append('image', imageFile);
  if (email) {
    formData.append('email', email);
  }
  const response = await authenticatedFetch(`${BASE_URL}dashboard/upload-profile-image`, {
    method: 'POST',
    body: formData
  });
  return handleJson(response);
}

export async function deleteAccount({ email, currentPassword }) {
  const response = await authenticatedFetch(`${BASE_URL}profile/delete`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, currentPassword })
  });
  return handleJson(response);
}

// Get profile summary (profile image, username, etc.)
export async function getProfileSummary(email) {
  const response = await authenticatedFetch(`${BASE_URL}dashboard/profile-summary?email=${encodeURIComponent(email)}`, {
    method: 'GET'
  });
  return handleJson(response);
}
export async function removeCommunityMember(communityId, userEmail, requesterEmail) {
  const url = `${BASE_URL}community/removeMember`;
  const payload = { communityId, userEmail, requesterEmail };  
  try {
    const response = await authenticatedFetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
  }catch (error) {
    console.error('removeCommunityMember API error:', error);
    throw error;
  }
}

export async function deleteCommunityRoom(communityId, roomId, requesterEmail) {
  const response = await authenticatedFetch(`${BASE_URL}community/${communityId}/rooms/${roomId}?requesterEmail=${encodeURIComponent(requesterEmail)}`, {
    method: 'DELETE'
  });
  return handleJson(response);
}

// Local-Group: members lis
export async function getLocalGroupMembers(groupId) {
  const response = await authenticatedFetch(`${BASE_URL}local-group/${groupId}/members`, {
    method: 'GET'
  });
  return handleJson(response);
}

// Local-Group: setting
export async function getLocalGroupSettings(groupId) {
  const response = await authenticatedFetch(`${BASE_URL}local-group/${groupId}/settings`, {
    method: 'GET'
  });
  return handleJson(response);
}

// Rooms: join by roomCode
export async function joinRoom(roomCode, userId) {
  const response = await authenticatedFetch(`${BASE_URL}rooms/join`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ roomCode, email: userId })
  });
  return handleJson(response);
}

// Join local group via invite link
export async function joinLocalGroup({ groupId, userEmail }) {
  const response = await authenticatedFetch(`${BASE_URL}local-group/join`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ groupId, userEmail })
  });
  return handleJson(response);
}

// Create new chatroom
export async function createNewChatroom(roomCode, name) {
  const formData = new FormData();
  formData.append('roomCode', roomCode);
  formData.append('name', name);
  
  const response = await authenticatedFetch(`${BASE_URL}new-chatroom/create`, {
    method: 'POST',
    body: formData
  });
  return handleJson(response);
}

export async function getChatroomsSummary(roomCode) {
  const response = await authenticatedFetch(`${BASE_URL}new-chatroom/list/summary?roomCode=${encodeURIComponent(roomCode)}`, {
    method: 'GET'
  });
  return handleJson(response);
}

// Get voice rooms list for a room
export async function getVoiceRoomsList(roomId) {
  const response = await authenticatedFetch(`${BASE_URL}voice-room/list/${roomId}`, {
    method: 'GET'
  });
  return handleJson(response);
}

// Create voice room
export async function createVoiceRoom(chatRoomId, roomName, createdBy) {
  const params = new URLSearchParams();
  params.set('chatRoomId', chatRoomId);
  params.set('roomName', roomName);
  params.set('createdBy', createdBy);
  
  const response = await authenticatedFetch(`${BASE_URL}voice-room/create?${params.toString()}`, {
    method: 'POST'
  });
  return handleJson(response);
}

// Join voice room
export async function joinVoiceRoom(janusRoomId, displayName) {
  const params = new URLSearchParams();
  params.set('janusRoomId', janusRoomId);
  params.set('displayName', displayName);
  
  const response = await authenticatedFetch(`${BASE_URL}voice-room/join?${params.toString()}`, {
    method: 'POST'
  });
  return handleJson(response);
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
    // ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

export const authenticatedFetch = async (url, options = {}) => {
  const isFormData = options.body instanceof FormData;
  const headers = getAuthHeaders(isFormData);
  
  const response = await fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      ...headers,
      ...options.headers
    }
  });
// console.log('response', response);

  if (response.status === 401) {
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('userData');
    window.location.href = '/login';
  }
  
  return response;
};


