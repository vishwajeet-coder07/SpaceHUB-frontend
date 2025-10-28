import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authenticatedFetch } from '../../../shared/services/API';
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const USERNAME_API = `${BASE_URL}dashboard/set-username`;
const UPLOAD_API = `${BASE_URL}dashboard/upload-profile-image`;

const interestsSeed = [
  'Technology','Science','Art','Music','Sports','Gaming','Travel','Food','Books','Movies','Finance','Fitness'
];

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
  const [uploadPreview, setUploadPreview] = useState('');
  const [uploadFile, setUploadFile] = useState(null);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const userDataRaw = localStorage.getItem('userData');
    if (userDataRaw) {
      try {
        const data = JSON.parse(userDataRaw);
        setDisplayName(data?.name || '');
      } catch {
        // JSON parse error ko ignore ke liye
      }
    }
  }, []);

  const toggleInterest = (label) => {
    setSelectedInterests((prev) => {
      if (prev.includes(label)) return prev.filter((l) => l !== label);
      return [...prev, label];
    });
  };

  const onPickFile = () => fileInputRef.current?.click();

  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadFile(file);
    const url = URL.createObjectURL(file);
    setUploadPreview(url);
  };

  const uploadAvatar = async () => {
    if (!uploadFile) return;
    const form = new FormData();
    form.append('image', uploadFile);
    const response = await authenticatedFetch(UPLOAD_API, { method: 'POST', body: form });
    if (!response.ok) {
      const data = await response.json().catch(() => null);
      throw new Error((data && (data.message || data.error)) || 'Upload failed');
    }
  };

  const setUserName = async () => {
    const response = await authenticatedFetch(USERNAME_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, displayName, interests: selectedInterests }),
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
    if (selectedInterests.length < 3) {
      setError('Please select at least 3 interests');
      return;
    }
    setError('');
    setSaving(true);
    try {
      if (uploadFile) await uploadAvatar();
      await setUserName();
      navigate('/dashboard');
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center p-6">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow border border-gray-200 overflow-hidden">
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
                {Array.from({ length: 10 }).map((_, idx) => (
                  <div key={idx} className="w-12 h-12 rounded-full bg-white" />
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
                <label className="block text-sm font-medium mb-1">Display name</label>
                <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Enter display name" className="w-full h-10 rounded-lg border border-gray-300 px-3 bg-white" />
              </div>
              <div className="pt-2">
                <div className="flex items-end justify-between">
                  <p className="font-semibold">Your interests!</p>
                  <p className="text-sm text-gray-500">(select atleast 3)</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-3">
                  {interestsSeed.map((label) => {
                    const active = selectedInterests.includes(label);
                    return (
                      <button type="button" key={label} onClick={() => toggleInterest(label)} className={`h-20 rounded-xl border ${active ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 bg-white'} flex items-center justify-center text-sm font-medium`}>
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetupPage;


