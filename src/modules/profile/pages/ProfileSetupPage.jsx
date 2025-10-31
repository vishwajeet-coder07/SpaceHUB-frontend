import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authenticatedFetch } from '../../../shared/services/API';

const BASE_URL = 'https://codewithketan.me/api/v1/';
const USERNAME_API = `${BASE_URL}dashboard/set-username`;
const UPLOAD_API = `${BASE_URL}dashboard/upload-profile-image`;

// interests removed per new simplified profile setup

// Preset avatar images placed in public/avatars
const presetAvatarUrls = [
  '/avatars/avatar-1.png',
  '/avatars/avatar-2.png',
  '/avatars/avatar-3.png',
  '/avatars/avatar-4.png',
  '/avatars/avatar-5.png',
  '/avatars/avatar-6.png',
  '/avatars/avatar-7.png',
  '/avatars/avatar-8.png',
];

const MAX_UPLOAD_BYTES = 2 * 1024 * 1024; // 2MB

const AvatarPlaceholder = ({ src }) => (
  <div className="w-56 h-56 rounded-full bg-white shadow-inner flex items-center justify-center overflow-hidden">
    {src ? (
      <img src={src} alt="avatar" className="w-full h-full object-cover" />
    ) : (
      <div className="w-40 h-40 rounded-full bg-gray-200" />
    )}
  </div>
);

const ProfileSetupPage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [uploadPreview, setUploadPreview] = useState('');
  const [uploadFile, setUploadFile] = useState(null);
  const [selectedAvatarUrl, setSelectedAvatarUrl] = useState('');
  // interests removed per design
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const userDataRaw = localStorage.getItem('userData');
    if (userDataRaw) {
      try {
        const data = JSON.parse(userDataRaw);
        setDisplayName(data?.name || '');
        setEmail(data?.email || '');
      } catch {
        // JSON parse error ko ignore ke liye
      }
    }
  }, []);

  // interests removed per design

  const onPickFile = () => fileInputRef.current?.click();

  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_UPLOAD_BYTES) {
      setError('Image must be 2MB or smaller');
      e.target.value = '';
      return;
    }
    setUploadFile(file);
    const url = URL.createObjectURL(file);
    setUploadPreview(url);
    setSelectedAvatarUrl('');
  };

  const onSelectPresetAvatar = (url) => {
    setSelectedAvatarUrl(url);
    setUploadFile(null);
    setUploadPreview(url);
  };

  const uploadAvatar = async () => {
    // If a file was manually chosen, upload that
    if (uploadFile) {
      const formData = new FormData();
      let emailToSend = (email && email.trim()) || '';
      if (!emailToSend) {
        try {
          const raw = localStorage.getItem('userData');
          if (raw) emailToSend = JSON.parse(raw)?.email || '';
        } catch {
          //for errors
        }
      }
      formData.append('email', emailToSend);
      formData.append('image', uploadFile);
      const response = await authenticatedFetch(UPLOAD_API, { method: 'POST', body: formData });
      if (!response.ok) {
        const text = await response.text().catch(() => '');
        let data = null;
        try { data = JSON.parse(text); } catch {//for errors
        }
        throw new Error((data && (data.message || data.error)) || text || 'Upload failed');
      }
      return;
    }

    // If a preset was selected, fetch it and upload as Blob
    if (selectedAvatarUrl) {
      const res = await fetch(selectedAvatarUrl);
      const blob = await res.blob();
      if (blob.size > MAX_UPLOAD_BYTES) {
        throw new Error('Selected avatar exceeds 2MB limit');
      }
      const fileFromBlob = new File([blob], 'avatar.png', { type: blob.type || 'image/png' });
      const formData = new FormData();
      let emailToSend = (email && email.trim()) || '';
      if (!emailToSend) {
        try {
          const raw = localStorage.getItem('userData');
          if (raw) emailToSend = JSON.parse(raw)?.email || '';
        } catch { //for errors
        }
      }
      formData.append('email', emailToSend);
      formData.append('image', fileFromBlob);
      const response = await authenticatedFetch(UPLOAD_API, { method: 'POST', body: formData });
      if (!response.ok) {
        const text = await response.text().catch(() => '');
        let data = null;
        try { data = JSON.parse(text); } catch {//for errors
        }
        throw new Error((data && (data.message || data.error)) || text || 'Upload failed');
      }
    }
  };

  const setUserName = async () => {
    const response = await authenticatedFetch(USERNAME_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, username: username }),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => null);
      throw new Error((data && (data.message || data.error)) || 'Save failed');
    }
  };

  const handleConfirm = async () => {
    if (!username.trim()) {
      setError('Username is required');
      return;
    }
    setError('');
    setSaving(true);
    try {
      if (uploadFile || selectedAvatarUrl) await uploadAvatar();
      await setUserName();
      navigate('/dashboard');
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundImage: "url('/profileBg.png')", backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}>
      <div className="w-full max-w-6xl bg-white/95 backdrop-blur rounded-2xl shadow border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between p-4 sm:p-6 bg-gray-100 border-b">
          <h1 className="text-2xl font-semibold">Set-up your <span className="font-bold">Profile</span></h1>
          <button onClick={handleConfirm} disabled={saving} className="px-4 py-2 rounded-lg bg-indigo-500 text-white disabled:opacity-60">{saving ? 'Saving...' : 'Confirm'}</button>
        </div>
        {error && (
          <div className="px-6 pt-4 text-sm text-red-600">{error}</div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          <div className="p-6 md:p-8 bg-gray-100 border-r">
            <div className="flex flex-col items-center gap-6">
              <AvatarPlaceholder src={uploadPreview} />
              <div className="grid grid-cols-5 gap-4">
                {presetAvatarUrls.map((url) => (
                  <button
                    key={url}
                    type="button"
                    onClick={() => onSelectPresetAvatar(url)}
                    className={`w-12 h-12 rounded-full overflow-hidden border ${selectedAvatarUrl === url ? 'border-indigo-500' : 'border-transparent'} focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                    aria-label="Select preset avatar"
                  >
                    <img src={url} alt="avatar option" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
              <button onClick={onPickFile} className="px-4 py-2 bg-gray-900 text-white rounded-lg">Upload your profile</button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={onFileChange} className="hidden" />
            </div>
          </div>
          <div className="p-6 md:p-8 bg-gray-100">
            <div className="space-y-4 max-w-xl">
              <div>
                <label className="block text-sm font-medium mb-1">Username</label>
                <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Enter username" className="w-full h-10 rounded-lg border border-gray-300 px-3 bg-white" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Date of birth</label>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  
                  className="w-full h-10 rounded-lg border border-gray-300 px-3 bg-white"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetupPage;



