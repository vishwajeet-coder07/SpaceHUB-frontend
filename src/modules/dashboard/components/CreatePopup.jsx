import React, { useState } from 'react';
import CreateMenu from './CreateMenu.jsx';
import CreateGroup from './createComponents/CreateGroup.jsx';
import CreateGroupDescription from './createComponents/CreateGroupDescription.jsx';
import CreateCongrats from './createComponents/CreateCongrats.jsx';
import CreateJoin from './CreateJoin.jsx';
import { createCommunity } from '../../../shared/services/API';
import { useAuth } from '../../../shared/contexts/AuthContextContext';

const CreatePopup = ({ open, onClose }) => {
  if (!open) return null;
  const { user } = useAuth?.() || {};
  const [mode, setMode] = useState('menu'); // 'menu' | 'create' | 'desc' | 'join' | 'done'
  const [kind, setKind] = useState('group'); // 'group' | 'community'
  const [doneSubtitle, setDoneSubtitle] = useState('');
  const [groupData, setGroupData] = useState({
    name: '',
    imageFile: null,
    description: '',
  });
  const [loading, setLoading] = useState(false);

  const storedEmail = (JSON.parse(sessionStorage.getItem('userData'))?.email) || '';
  const userEmail = (user && user.email) || storedEmail || '';

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
    // Client-side validation to avoid 400s
    const trimmedName = (groupData.name || '').trim();
    const trimmedDesc = (description || '').trim();
    const trimmedEmail = (userEmail || '').trim();
    if (!trimmedName || !trimmedDesc || !trimmedEmail) {
      alert('Please fill Name, Description, and make sure your account email is present.');
      return;
    }

    setLoading(true);

    // Debug logging (safe fields only)
    // eslint-disable-next-line no-console
    console.log('Creating community with:', {
      name: trimmedName,
      description: trimmedDesc,
      createdByEmail: trimmedEmail,
      hasImage: !!groupData.imageFile,
    });

    try {
      await createCommunity({
        name: trimmedName,
        description: trimmedDesc,
        createdByEmail: trimmedEmail,
        imageFile: groupData.imageFile,
      });
      setGroupData((prev) => ({ ...prev, description: trimmedDesc }));
      setDoneSubtitle('You have successfully created your ' + (kind === 'community' ? 'Community' : 'Group') + '!');
      setMode('done');
    } catch (err) {
      alert(err.message || 'Failed to create.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Modal Content */}
      {mode === 'menu' && (
        <CreateMenu
          onBack={onClose}
          onFriends={() => { setKind('group'); setMode('create'); setDoneSubtitle(''); }}
          onClubs={() => { setKind('community'); setMode('create'); setDoneSubtitle(''); }}
          onJoin={() => setMode('join')}
        />
      )}
      {mode === 'create' && (
        <CreateGroup
          onBack={goToMenu}
          onConfirm={handleGroupConfirm}
          title={kind === 'community' ? 'Create a community' : 'Create a group'}
          subtitle={kind === 'community' ? 'Create a community.\nBring people together in one shared space.' : 'Start your own group and bring people together. Share ideas, interests, and good vibes in one place.'}
          nameLabel={kind === 'community' ? 'Community name' : 'Group name'}
          placeholder={kind === 'community' ? 'Enter community name' : 'Enter group name'}
          confirmText={'Confirm'}
          initialName={groupData.name}
          initialImageFile={groupData.imageFile}
          onChange={({ name, imageFile }) => setGroupData((prev) => ({ ...prev, name: name ?? prev.name, imageFile: imageFile ?? prev.imageFile }))}
        />
      )}
      {mode === 'desc' && (
        <CreateGroupDescription
          onBack={() => setMode('create')}
          onSkip={() => setMode('done')}
          onConfirm={handleDescriptionConfirm}
          entityLabel={kind === 'community' ? 'Community' : 'group'}
          initialDescription={groupData.description}
          onChange={(value) => setGroupData((prev) => ({ ...prev, description: value }))}
        />
      )}
      {mode === 'done' && (
        <CreateCongrats
          onDone={onClose}
          entityTitle={kind === 'community' ? 'Community' : 'Group'}
          subtitle={doneSubtitle}
        />
      )}
      {mode === 'join' && (
        <CreateJoin onBack={goToMenu} onSend={() => { setDoneSubtitle('Request have been successfully send!'); setMode('done'); }} />
      )}
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-full px-6 py-3 shadow-lg text-lg font-semibold">Creating...</div>
        </div>
      )}
    </div>
  );
};

export default CreatePopup;


