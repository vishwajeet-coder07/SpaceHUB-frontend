import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/contexts/AuthContextContext';
import { setUsername as apiSetUsername, uploadProfileImage } from '../../../shared/services/API';

const InputRow = ({ label, type = 'text', value, setValue, placeholder, rightIcon, onRightIconClick, readOnly = false }) => {
  return (
    <div className="mb-5">
      <div className="text-sm text-gray-300 mb-2">{label}</div>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={(e) => setValue?.(e.target.value)}
          placeholder={placeholder}
          readOnly={readOnly}
          className="w-full bg-transparent border border-gray-600 rounded-md px-4 py-3 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        {rightIcon && (
          <button type="button" onClick={onRightIconClick} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white">
            {rightIcon}
          </button>
        )}
      </div>
    </div>
  );
};

const SettingPage = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();

  const initialUser = useMemo(() => {
    const sessionUser = JSON.parse(sessionStorage.getItem('userData') || '{}');
    return {
      email: user?.email || sessionUser?.email || '',
      username: user?.username || sessionUser?.username || '',
      avatarUrl: user?.avatarUrl || sessionUser?.avatarUrl || '/avatars/avatar-1.png',
    };
  }, [user]);
  const [username, setUsername] = useState(initialUser.username);
  const [email, setEmail] = useState(initialUser.email);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [saving, setSaving] = useState(false);

  const usernameTooLong = (username || '').length > 15;
  const isUsernameChanged = (username || '') !== (initialUser.username || '');
  const isImageChanged = !!selectedImage;

  const handleImageChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSave = async () => {
    if (saving) return;
    if (usernameTooLong) {
      alert('Username must be 15 characters or fewer');
      return;
    }

    const ops = [];
    try {
      setSaving(true);
      // Update username if changed and non-empty
      if (isUsernameChanged && (username || '').trim()) {
        ops.push(
          apiSetUsername({ email: initialUser.email, username: username.trim() })
        );
      }
      // Upload image if selected
      if (isImageChanged) {
        ops.push(
          uploadProfileImage({ imageFile: selectedImage })
        );
      }

      if (ops.length === 0) {
        return;
      }

      const results = await Promise.all(ops);

      // Merge updates into local user and persist
      const nextUser = { ...JSON.parse(sessionStorage.getItem('userData') || '{}') };
      if (isUsernameChanged && (username || '').trim()) {
        nextUser.username = username.trim();
      }
      if (isImageChanged) {
        const imgRes = results.find((r) => r && (r.data?.imageUrl || r.imageUrl || r.url));
        const newUrl = imgRes?.data?.imageUrl || imgRes?.imageUrl || imgRes?.url;
        if (newUrl) nextUser.avatarUrl = newUrl;
      }
      sessionStorage.setItem('userData', JSON.stringify(nextUser));
      updateUser?.(nextUser);
      try {
        window.dispatchEvent(new CustomEvent('toast', { detail: { message: 'Changes saved', type: 'success' } }));
      } catch {}
    } catch (e) {
      console.error('Failed to save settings:', e);
      try {
        window.dispatchEvent(new CustomEvent('toast', { detail: { message: e.message || 'Failed to save settings', type: 'error' } }));
      } catch {}
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="h-screen bg-gray-100 flex flex-col ">
      {/* Top Navbar */}
      <div className="sticky top-0 z-20 bg-gray-200 border-b border-gray-300 h-14 flex items-center px-4 rounded-b-lg">
        <div className="flex-1 text-center">
          <h1 className="text-lg font-semibold text-gray-800">Settings</h1>
        </div>
      </div>


      <div className="max-w-6xl w-full mx-auto bg-white rounded-xl border border-gray-300 overflow-hidden mt-4">
        <div className="flex p-5 bg-gray-300 rounded-xl">
          {/* Left dark sidebar */}
          <div className="w-72 bg-[#1f1f1f] text-white p-5 rounded-l-xl border-r border-gray-700">
            <div className="flex items-center mb-6">
              <button onClick={() => navigate('/dashboard')} className="w-9 h-9 flex items-center justify-center rounded-md hover:bg-white/10">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <div className="ml-3 bg-white text-black rounded-md px-3 py-1 text-sm">Main profile</div>
            </div>

             <div className='ml-6'>  
            <button className="flex items-center gap-3 text-red-500 hover:text-red-400 mb-4">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h7l5 5v7a2 2 0 0 1-2 2H6z"/></svg>
              <span>Delete Account</span>
            </button>
            <button className="flex items-center gap-3 text-red-500 hover:text-red-400">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></svg>
              <span>Log out</span>
            </button>
             </div>
          </div>

          {/* Right dark content area */}
          <div className="flex-1 bg-[#1f1f1f] text-white p-6 rounded-r-xl">
            {/* Top bar */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">Main profile</h2>
              <div className="flex items-center gap-3">
                <button onClick={() => navigate(-1)} className="px-4 py-2 rounded-md bg-white/10 text-white hover:bg-white/20">Back</button>
                <button onClick={handleSave} disabled={saving || usernameTooLong} className="px-4 py-2 rounded-md bg-indigo-200 text-black hover:bg-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed">{saving ? 'Saving...' : 'Save changes'}</button>
              </div>
            </div>

            {/* Profile section */}
            <div className="mb-4 text-gray-300">Profile</div>
            <div className="mb-6">
              <div className="w-16 h-16 rounded-md overflow-hidden bg-gray-600">
                <img src={previewUrl || initialUser.avatarUrl || '/avatars/avatar-1.png'} alt="avatar" className="w-full h-full object-cover" />
              </div>
              <div className="mt-3">
                <label className="inline-block cursor-pointer bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-md text-sm">
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                  Upload new photo
                </label>
              </div>
            </div>

            <InputRow
              label="Username"
              value={username}
              setValue={(v) => {
                if (v.length <= 15) setUsername(v);
              }}
              placeholder="Username"
              rightIcon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>}
            />
            {usernameTooLong && <div className="text-red-400 text-xs -mt-4 mb-4">Max 15 characters.</div>}

            <InputRow
              label="Email"
              value={email}
              setValue={setEmail}
              placeholder="Email"
              readOnly
              rightIcon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16v16H4z"/><path d="M22 6l-10 7L2 6"/></svg>}
            />

            {/* Optional password section can be implemented later */}
          </div>
        </div>
      </div>
    </div>

  );
};

export default SettingPage;


