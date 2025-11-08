import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '../../../shared/contexts/AuthContextContext';
import CreateGroup from '../components/createComponents/CreateGroup';
import CreateGroupDescription from '../components/createComponents/CreateGroupDescription';
import CreateCongrats from '../components/createComponents/CreateCongrats';
import CreateJoin from '../components/CreateJoin';
import { createCommunity, createLocalGroup } from '../../../shared/services/API';
import { addCommunity, addLocalGroup } from '../../../shared/store/slices/dashboardSlice';
import MobileHamburgerMenu from '../components/MobileHamburgerMenu';
import InboxModal from '../components/InboxModal';
import { selectShowInbox, setShowInbox } from '../../../shared/store/slices/uiSlice';

const CreateJoinPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const showInbox = useSelector(selectShowInbox);
  const [mode, setMode] = useState('menu'); // 'menu', 'create', 'desc', 'done', 'join'
  const [kind, setKind] = useState('group'); // 'group' or 'community'
  const [doneSubtitle, setDoneSubtitle] = useState('');
  const [groupData, setGroupData] = useState({
    name: '',
    imageFile: null,
    description: '',
  });
  const [loading, setLoading] = useState(false);

  const storedEmail = (JSON.parse(sessionStorage.getItem('userData')) || {})?.email || '';
  const userEmail = (user && user.email) || storedEmail || '';

  // Listen for openInbox event
  useEffect(() => {
    const handleOpenInbox = () => {
      dispatch(setShowInbox(true));
    };
    window.addEventListener('openInbox', handleOpenInbox);
    return () => {
      window.removeEventListener('openInbox', handleOpenInbox);
    };
  }, [dispatch]);

  const handleJoinSuccess = (communityData) => {
    const communityId = communityData?.id || communityData?.communityId;
    
    if (communityId) {
      // Add the new community to Redux store if it's provided
      if (communityData) {
        dispatch(addCommunity(communityData));
      }
      // Trigger refresh for backwards compatibility
      window.dispatchEvent(new Event('refresh:communities'));
      navigate(`/dashboard/community/${communityId}`);
    } else {
      setDoneSubtitle('Successfully joined the community!');
      setMode('done');
    }
  };

  const goToMenu = () => {
    setMode('menu');
    setGroupData({ name: '', imageFile: null, description: '' });
    setDoneSubtitle('');
  };

  const handleGroupConfirm = ({ groupName, imageFile }) => {
    setGroupData((prev) => ({ ...prev, name: groupName, imageFile }));
    setMode('desc');
  };

  const handleDescriptionConfirm = async ({ description }) => {
    const trimmedName = (groupData.name || '').trim();
    const trimmedDesc = (description || '').trim();
    const trimmedEmail = (userEmail || '').trim();
    if (!trimmedName || !trimmedDesc || !trimmedEmail) {
      alert('Please fill Name, Description, and make sure your account email is present.');
      return;
    }

    setLoading(true);
    console.log('Creating entity with:', { kind, name: trimmedName, description: trimmedDesc, email: trimmedEmail, hasImage: !!groupData.imageFile });

    try {
      let response;
      if (kind === 'community') {
        response = await createCommunity({
          name: trimmedName,
          description: trimmedDesc,
          createdByEmail: trimmedEmail,
          imageFile: groupData.imageFile,
        });
        const communityData = response?.data || response;
        if (communityData) {
          dispatch(addCommunity(communityData));
        }
        window.dispatchEvent(new Event('refresh:communities'));
      } else {
        response = await createLocalGroup({
          name: trimmedName,
          description: trimmedDesc,
          createdByEmail: trimmedEmail,
          imageFile: groupData.imageFile,
        });
       
        const localGroupData = response?.data || response;
        if (localGroupData) {
          dispatch(addLocalGroup(localGroupData));
        }
        window.dispatchEvent(new Event('refresh:local-groups'));
      }

      const entityId = response?.data?.id || 
                       response?.data?.communityId || 
                       response?.data?.groupId || 
                       response?.data?.localGroupId ||
                       response?.id ||
                       response?.communityId ||
                       response?.groupId ||
                       response?.localGroupId;

      if (entityId) {
        if (kind === 'community') {
          navigate(`/dashboard/community/${entityId}`);
        } else {
          navigate(`/dashboard/local-group/${entityId}`);
        }
      } else {
        setGroupData((prev) => ({ ...prev, description: trimmedDesc }));
        setDoneSubtitle('You have successfully created your ' + (kind === 'community' ? 'Community' : 'Local-Group') + '!');
        setMode('done');
      }
    } catch (err) {
      alert(err.message || 'Failed to create.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen md:hidden bg-[#E6E6E6]">
      {/* Mobile Header */}
      <div className="md:hidden sticky top-0 z-20 bg-white border-b border-gray-200 h-14 flex items-center px-4">
        <button
          onClick={() => {
            if (mode === 'menu') {
              setIsMenuOpen(true);
            } else {
              goToMenu();
            }
          }}
          className="p-2 -ml-2 text-gray-700 hover:text-gray-900"
        >
          {mode === 'menu' ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          )}
        </button>
        <div className="flex-1 text-center">
          <h1 className="text-lg font-semibold text-gray-800">Create/join</h1>
        </div>
        <button 
          onClick={() => dispatch(setShowInbox(true))}
          className="p-2 -mr-2 text-gray-700 hover:text-gray-900"
          title="Inbox"
        >
          <img src="/avatars/inbox.png" alt="Inbox" className="w-6 h-6" />
        </button>
      </div>

      {/* Content */}
      <div className={`${mode === 'menu' ? 'px-4 py-6' : 'px-0 py-0'}`}>
        {mode === 'menu' && (
          <div className="flex flex-col items-center">
            {/* Plus Icon and Title */}
            <div className="flex flex-col items-center mb-8">
              <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Create/join</h1>
            </div>

            {/* Two Buttons */}
            <div className="w-full space-y-4 mb-8">
              <button
                onClick={() => { setKind('group'); setMode('create'); setDoneSubtitle(''); }}
                className="w-full bg-white rounded-lg border border-gray-200 p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16 14c2.21 0 4 1.79 4 4v1H12v-1c0-2.21 1.79-4 4-4Z" fill="#111827"/>
                    <path d="M8 14c2.21 0 4 1.79 4 4v1H0v-1c0-2.21 1.79-4 4-4Z" fill="#111827"/>
                    <circle cx="16" cy="8" r="3" fill="#111827"/>
                    <circle cx="8" cy="8" r="3" fill="#111827"/>
                  </svg>
                </div>
                <span className="font-semibold text-gray-900">For me and my Friends</span>
              </button>

              <button
                onClick={() => { setKind('community'); setMode('create'); setDoneSubtitle(''); }}
                className="w-full bg-white rounded-lg border border-gray-200 p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 15c2.76 0 5 2.24 5 5v1H7v-1c0-2.76 2.24-5 5-5Z" fill="#111827"/>
                    <circle cx="12" cy="8" r="3" fill="#111827"/>
                    <path d="M19 8h-2V6h-2V4h2V2h2v2h2v2h-2v2Z" fill="#111827"/>
                  </svg>
                </div>
                <span className="font-semibold text-gray-900">For clubs and community</span>
              </button>
            </div>

            {/* Join Section */}
            <div className="w-full">
              <p className="text-center text-gray-900 font-medium mb-3">Have an invite link?</p>
              <button
                onClick={() => setMode('join')}
                className="w-full px-5 py-3 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-700 transition-colors"
              >
                Join a group or a community
              </button>
            </div>
          </div>
        )}

        {mode === 'create' && (
          <div className="md:hidden -mx-4">
            <CreateGroup
              onBack={goToMenu}
              onConfirm={handleGroupConfirm}
              title={kind === 'community' ? 'Create a community' : 'Create a Local-Group'}
              subtitle={kind === 'community' ? 'Create a community.\nBring people together in one shared space.' : 'Start your own Local-Group and bring people together. Share ideas, interests, and good vibes in one place.'}
              nameLabel={kind === 'community' ? 'Community name' : 'Local-Group name'}
              placeholder={kind === 'community' ? 'Enter community name' : 'Enter Local-Group name'}
              confirmText={'Confirm'}
              initialName={groupData.name}
              initialImageFile={groupData.imageFile}
              onChange={({ name, imageFile }) => setGroupData((prev) => ({ ...prev, name: name ?? prev.name, imageFile: imageFile ?? prev.imageFile }))}
            />
          </div>
        )}

        {mode === 'desc' && (
          <div className="md:hidden -mx-4">
            <CreateGroupDescription
              onBack={() => setMode('create')}
              onSkip={() => setMode('done')}
              onConfirm={handleDescriptionConfirm}
              entityLabel={kind === 'community' ? 'Community' : 'Local-Group'}
              initialDescription={groupData.description}
              onChange={(value) => setGroupData((prev) => ({ ...prev, description: value }))}
            />
          </div>
        )}

        {mode === 'done' && (
          <div className="md:hidden -mx-4">
            <CreateCongrats
              onDone={() => navigate('/dashboard')}
              entityTitle={kind === 'community' ? 'Community' : 'Local-Group'}
              subtitle={doneSubtitle}
            />
          </div>
        )}

        {mode === 'join' && (
          <div className="md:hidden -mx-4">
            <CreateJoin onBack={goToMenu} onSuccess={handleJoinSuccess} />
          </div>
        )}

        {loading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-full px-6 py-3 shadow-lg text-lg font-semibold">Creating...</div>
          </div>
        )}
      </div>

      {/* Mobile Hamburger Menu */}
      <MobileHamburgerMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onNavigate={(view) => {
          if (view === 'direct-message') {
            navigate('/dashboard/direct-message');
          } else if (view === 'discover') {
            navigate('/dashboard');
            // Dispatch will be handled by Dashboard component
          } else if (view === 'dashboard') {
            navigate('/dashboard');
          }
        }}
      />

      {/* Inbox Modal */}
      <InboxModal isOpen={showInbox} onClose={() => dispatch(setShowInbox(false))} />
    </div>
  );
};

export default CreateJoinPage;

