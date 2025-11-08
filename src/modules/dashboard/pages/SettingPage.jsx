import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/contexts/AuthContextContext';
import { setUsername as apiSetUsername, uploadProfileImage } from '../../../shared/services/API';

const InputRow = ({ label, type = 'text', value, setValue, placeholder, rightIcon, onRightIconClick, readOnly = false, isMobile = false }) => {
  const inputClasses = isMobile
    ? "w-full bg-white border border-gray-300 rounded-md px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
    : "w-full bg-transparent border border-gray-600 rounded-md px-4 py-3 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500";
  
  const labelClasses = isMobile
    ? "text-sm text-gray-500 mb-1.5"
    : "text-sm text-gray-300 mb-2";

  return (
    <div className={isMobile ? "mb-3" : "mb-5"}>
      <div className={labelClasses}>{label}</div>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={(e) => setValue?.(e.target.value)}
          placeholder={placeholder}
          readOnly={readOnly}
          className={inputClasses}
        />
        {rightIcon && (
          <button type="button" onClick={onRightIconClick} className={`absolute right-3 top-1/2 -translate-y-1/2 ${isMobile ? 'text-gray-500 hover:text-gray-700' : 'text-gray-300 hover:text-white'}`}>
            {rightIcon}
          </button>
        )}
      </div>
    </div>
  );
};

const SettingPage = () => {
  const navigate = useNavigate();
  const { user, updateUser, logout } = useAuth();

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
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
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

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSave = async () => {
    if (saving) return;
    if (usernameTooLong) {
      window.dispatchEvent(new CustomEvent('toast', {
        detail: { message: 'Username must be 15 characters or fewer', type: 'error' }
      }));
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
      if (isImageChanged) {
        ops.push(
          uploadProfileImage({ imageFile: selectedImage })
        );
      }

      if (ops.length === 0) {
        return;
      }

      const results = await Promise.all(ops);

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
    <div className="h-screen bg-gray-100 flex flex-col">
      {/* Mobile Header */}
      <div className="md:hidden sticky top-0 z-20 bg-white border-b border-gray-200 h-14 flex items-center px-4">
        <button 
          onClick={() => navigate('/dashboard')} 
          className="p-2 -ml-2 text-gray-700 hover:text-gray-900"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1 text-center">
          <h1 className="text-lg font-semibold text-gray-800">Settings</h1>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:block sticky top-0 z-20 bg-gray-200 border-b border-gray-300 h-14 flex items-center px-4 rounded-b-lg">
        <div className="flex-1 text-center">
          <h1 className="text-lg font-semibold text-gray-800">Settings</h1>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden flex-1 overflow-hidden bg-[#E6E6E6]">
        <div className="h-full flex flex-col">
          <div className="flex-1 overflow-y-auto px-4 py-3">
            {/* Profile Avatar and Upload Section */}
            <div className="flex flex-col items-center mb-4">
              <div className="relative mb-3">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                  <img 
                    src={previewUrl || initialUser.avatarUrl || '/avatars/avatar-1.png'} 
                    alt="avatar" 
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Edit icon overlay */}
                <div className="absolute bottom-0 right-0 w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white">
                  <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </div>
              </div>
              <label className="cursor-pointer">
                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                <button className="bg-gray-700 text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors">
                  Upload
                </button>
              </label>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 mb-4"></div>

            {/* Input Fields */}
            <div className="space-y-0">
              <InputRow
                label="Username"
                value={username}
                setValue={(v) => {
                  if (v.length <= 15) setUsername(v);
                }}
                placeholder="Username"
                isMobile={true}
              />
              {usernameTooLong && <div className="text-red-500 text-xs -mt-2 mb-1">Max 15 characters.</div>}

              <InputRow
                label="Email"
                value={email}
                setValue={setEmail}
                placeholder="Email"
                readOnly
                isMobile={true}
              />

              <InputRow
                label="Old password"
                type={showOldPassword ? 'text' : 'password'}
                value={oldPassword}
                setValue={setOldPassword}
                placeholder="Old password"
                isMobile={true}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    {showOldPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                }
              />

              <InputRow
                label="New password"
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                setValue={setNewPassword}
                placeholder="New password"
                isMobile={true}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    {showNewPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                }
              />
        </div>
      </div>

          {/* Save Profile Button - Fixed at bottom */}
          <div className="px-4 py-3 border-t border-gray-200 bg-white">
            <button
              onClick={handleSave}
              disabled={saving || usernameTooLong}
              className="w-full bg-purple-600 text-white py-3 rounded-md font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? 'Saving...' : 'Save profile'}
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:block max-w-6xl w-full mx-auto bg-white rounded-xl border border-gray-300 overflow-hidden mt-4">
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
              <button 
                onClick={handleLogout}
                className="flex items-center gap-3 text-red-500 hover:text-red-400"
              >
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

            <InputRow
              label="Old password"
              type={showOldPassword ? 'text' : 'password'}
              value={oldPassword}
              setValue={setOldPassword}
              placeholder="Old password"
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  className="text-gray-300 hover:text-white"
                >
                  {showOldPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              }
            />

            <InputRow
              label="New password"
              type={showNewPassword ? 'text' : 'password'}
              value={newPassword}
              setValue={setNewPassword}
              placeholder="New password"
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="text-gray-300 hover:text-white"
                >
                  {showNewPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingPage;


