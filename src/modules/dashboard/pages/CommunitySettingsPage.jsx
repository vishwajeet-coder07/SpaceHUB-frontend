import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import logo from '../../../assets/landing/logo-removebg-preview.svg';
import { getAllCommunities, deleteCommunity, leaveCommunity, authenticatedFetch, BASE_URL, deleteCommunityRoom, getCommunityMembers, changeCommunityRole } from '../../../shared/services/API';
import { setShowInbox } from '../../../shared/store/slices/uiSlice';

const CommunitySettingsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [community, setCommunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState('profile');
  const [imageError, setImageError] = useState(false);
  const [bannerError, setBannerError] = useState(false);

  // Form state
  const [communityName, setCommunityName] = useState('');
  const [description, setDescription] = useState('');
  const [groups, setGroups] = useState([]);
  const [originalGroups, setOriginalGroups] = useState([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [hasGroupChanges, setHasGroupChanges] = useState(false);
  const [editingGroupId, setEditingGroupId] = useState(null);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [showDeleteGroupModal, setShowDeleteGroupModal] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState(null);
  const [deletingGroup, setDeletingGroup] = useState(false);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [bannerImageFile, setBannerImageFile] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [bannerImagePreview, setBannerImagePreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);
  const bannerInputRef = useRef(null);
  const deleteModalRef = useRef(null);
  const leaveModalRef = useRef(null);
  const deleteGroupModalRef = useRef(null);
  const [communityNameError, setCommunityNameError] = useState('');
  
  // Roles section state
  const [members, setMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [hasRoleChanges, setHasRoleChanges] = useState(false);
  const [roleChanges, setRoleChanges] = useState({}); // { userEmail: newRole }
  const [communityOwner, setCommunityOwner] = useState(null);
  const [showOwnerSection, setShowOwnerSection] = useState(true);
  const dropdownRefs = useRef({});

  useEffect(() => {
    const fetchCommunity = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await getAllCommunities();
        const list = res?.data?.communities || res?.communities || res?.data || [];
        const found = list.find(
          (c) => 
            String(c.id) === String(id) || 
            String(c.communityId) === String(id) || 
            String(c.community_id) === String(id) ||
            c.id === Number(id) ||
            c.communityId === Number(id) ||
            c.community_id === Number(id)
        );
        if (found) {
          setCommunity(found);
          setCommunityName(found.name || '');
          setDescription(found.description || '');
        } else {
          setError('Community not found');
        }
      } catch (e) {
        setError(e.message || 'Failed to load community');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCommunity();
    }
  }, [id]);

  useEffect(() => {
    setImageError(false);
    setBannerError(false);
  }, [community?.imageUrl, community?.bannerUrl]);

  // Track changes for profile
  useEffect(() => {
    if (community) {
      const nameChanged = communityName !== (community.name || '');
      const descChanged = description !== (community.description || '');
      const imageChanged = profileImageFile !== null;
      const bannerChanged = bannerImageFile !== null;
      setHasChanges(nameChanged || descChanged || imageChanged || bannerChanged);
    }
  }, [communityName, description, community, profileImageFile, bannerImageFile]);

  useEffect(() => {
    const groupsChanged = JSON.stringify(groups) !== JSON.stringify(originalGroups);
    setHasGroupChanges(groupsChanged);
  }, [groups, originalGroups]);

  useEffect(() => {
    const fetchGroups = async () => {
      if (!id || activeSection !== 'channels') return;

      setLoadingGroups(true);
      try {
        const response = await authenticatedFetch(`${BASE_URL}community/${id}/rooms/all`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch groups');
        }

        const roomsList = data?.data || [];
        const transformedGroups = roomsList.map((room) => ({
          id: room.id,
          name: room.name || room.roomName,
          roomCode: room.roomCode,
        }));

        setGroups(transformedGroups);
        setOriginalGroups([...transformedGroups]);
      } catch (err) {
        console.error('Error fetching groups:', err);
      } finally {
        setLoadingGroups(false);
      }
    };

    fetchGroups();
  }, [id, activeSection]);

  // Fetch members when roles section is active
  useEffect(() => {
    const fetchMembers = async () => {
      if (!id || activeSection !== 'roles') return;

      setLoadingMembers(true);
      try {
        const data = await getCommunityMembers(id);
        
        // Save response to sessionStorage
        try {
          sessionStorage.setItem(`communityMembers:${id}`, JSON.stringify(data));
        } catch (e) {
          console.warn('Failed to save members to sessionStorage:', e);
        }

        const membersList = data?.data?.members || data?.members || [];
        
        // Find community owner (usually has role "OWNER" or "WORKSPACE_OWNER")
        const owner = membersList.find(m => 
          (m.role || '').toUpperCase() === 'OWNER' || 
          (m.role || '').toUpperCase() === 'WORKSPACE_OWNER' ||
          (m.role || '').toUpperCase() === 'COMMUNITY_OWNER'
        );
        
        if (owner) {
          setCommunityOwner(owner);
          // Filter out owner from members list
          const regularMembers = membersList.filter(m => 
            m.email !== owner.email && 
            (m.role || '').toUpperCase() !== 'OWNER' && 
            (m.role || '').toUpperCase() !== 'WORKSPACE_OWNER' &&
            (m.role || '').toUpperCase() !== 'COMMUNITY_OWNER'
          );
          setMembers(regularMembers);
        } else {
          setCommunityOwner(null);
          setMembers(membersList);
        }
      } catch (err) {
        console.error('Error fetching members:', err);
        try {
          window.dispatchEvent(new CustomEvent('toast', {
            detail: { message: err.message || 'Failed to load members', type: 'error' }
          }));
        } catch {}
      } finally {
        setLoadingMembers(false);
      }
    };

    fetchMembers();
  }, [id, activeSection]);

  // Track role changes
  useEffect(() => {
    setHasRoleChanges(Object.keys(roleChanges).length > 0);
  }, [roleChanges]);

  const handleBack = () => {
    navigate(`/dashboard/community/${id}`);
  };

  const containsEmoji = (value) => {
    if (!value) return false;
    const emojiRegex = /[\u{1F300}-\u{1FAFF}\u{1F000}-\u{1F02F}\u{1F0A0}-\u{1F0FF}\u{1F100}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{27BF}]/u;
    return emojiRegex.test(value);
  };

  const handleCommunityNameChange = (value) => {
    if (value.length > 30) return;
    if (containsEmoji(value)) {
      setCommunityNameError('Emojis are not allowed.');
      return;
    }
    setCommunityNameError('');
    setCommunityName(value);
  };

  const handleSave = async () => {
    if (!id) return;

    const userData = JSON.parse(sessionStorage.getItem('userData') || '{}');
    const userEmail = userData?.email;

    if (!userEmail) {
      alert('User email not found');
      return;
    }

    if (!communityName.trim()) {
      setCommunityNameError('Community name is required.');
      return;
    }
    if (communityName.length > 30) {
      setCommunityNameError('Community name cannot exceed 30 characters.');
      return;
    }
    if (containsEmoji(communityName)) {
      setCommunityNameError('Emojis are not allowed.');
      return;
    }

    setSaving(true);
    try {
      // Create FormData
      const formData = new FormData();
      formData.append('requesterEmail', userEmail);
      formData.append('name', communityName.trim());
      formData.append('description', description.trim());

      if (profileImageFile) {
        formData.append('avatarFile', profileImageFile);
      }

      if (bannerImageFile) {
        formData.append('imageFile', bannerImageFile);
      }


      const response = await authenticatedFetch(`${BASE_URL}community/${id}/upload-banner`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update community profile');
      }

      if (profileImagePreview) {
        URL.revokeObjectURL(profileImagePreview);
      }
      if (bannerImagePreview) {
        URL.revokeObjectURL(bannerImagePreview);
      }
      setProfileImageFile(null);
      setBannerImageFile(null);
      setProfileImagePreview(null);
      setBannerImagePreview(null);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      if (bannerInputRef.current) {
        bannerInputRef.current.value = '';
      }

      // Refresh community data
      const res = await getAllCommunities();
      const list = res?.data?.communities || res?.communities || res?.data || [];
      const found = list.find(
        (c) => 
          String(c.id) === String(id) || 
          String(c.communityId) === String(id) || 
          String(c.community_id) === String(id) ||
          c.id === Number(id) ||
          c.communityId === Number(id) ||
          c.community_id === Number(id)
      );
      if (found) {
        setCommunity(found);
        setCommunityName(found.name || '');
        setDescription(found.description || '');
      }

      setHasChanges(false);
    } catch (err) {
      console.error('Error saving community profile:', err);
      alert(err.message || 'Failed to update community profile');
    } finally {
      setSaving(false);
    }
  };

  const handleDonSave = () => {
    if (community) {
      setCommunityName(community.name || '');
      setDescription(community.description || '');
      setGroups([...originalGroups]);
    }
    if (profileImagePreview) {
      URL.revokeObjectURL(profileImagePreview);
    }
    if (bannerImagePreview) {
      URL.revokeObjectURL(bannerImagePreview);
    }
    setProfileImageFile(null);
    setBannerImageFile(null);
    setProfileImagePreview(null);
    setBannerImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (bannerInputRef.current) {
      bannerInputRef.current.value = '';
    }
    setHasChanges(false);
    setHasGroupChanges(false);
    setEditingGroupId(null);
  };

  const handleSaveGroups = async () => {
    if (!id) return;

    const userData = JSON.parse(sessionStorage.getItem('userData') || '{}');
    const userEmail = userData?.email;

    if (!userEmail) {
      alert('User email not found');
      return;
    }

    try {
      const renamePromises = groups.map(async (group) => {
        const originalGroup = originalGroups.find((g) => g.id === group.id);
        if (!originalGroup || originalGroup.name === group.name) {
          return; 
        }

        if (!group.id) {
          console.warn('Group ID not found, skipping:', group);
          return;
        }

        if (!group.name || group.name.trim().length === 0) {
          alert('Group name cannot be empty');
          return;
        }

        if (group.name.length > 20) {
          alert('Group name cannot exceed 20 characters');
          return;
        }

        const response = await authenticatedFetch(`${BASE_URL}community/${id}/rooms/${group.id}/rename`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            requesterEmail: userEmail,
            newRoomName: group.name.trim()
          })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to rename group');
        }
      });

      await Promise.all(renamePromises);

      // Refresh groups list after successful updates
      const response = await authenticatedFetch(`${BASE_URL}community/${id}/rooms/all`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (response.ok) {
        const roomsList = data?.data || [];
        const transformedGroups = roomsList.map((room) => ({
          id: room.id,
          name: room.name || room.roomName,
          roomCode: room.roomCode,
        }));
        setGroups(transformedGroups);
        setOriginalGroups(transformedGroups);
      }

      setHasGroupChanges(false);
      setEditingGroupId(null);
    } catch (err) {
      console.error('Error saving groups:', err);
      alert(err.message || 'Failed to save group changes');
    }
  };

  const handleEditGroup = (index) => {
    setEditingGroupId(index);
  };

  const handleGroupChange = (index, value) => {
    // Limit to 30 characters and block emojis
    if (value.length > 30) return;
    if (containsEmoji(value)) return;
    const newGroups = [...groups];
    newGroups[index] = { ...newGroups[index], name: value };
    setGroups(newGroups);
  };

  const handleGroupBlur = (index) => {
    const newGroups = [...groups];
    const trimmed = newGroups[index].name.trim();
    if (!trimmed) {
      newGroups[index] = { ...newGroups[index], name: 'Untitled Group' };
    } else {
      newGroups[index] = { ...newGroups[index], name: trimmed };
    }
    setGroups(newGroups);
    setEditingGroupId(null);
  };

  const handleDeleteGroupClick = (index) => {
    const group = groups[index];
    if (!group || !group.id) {
      console.warn('Group or group ID not found');
      return;
    }
    setGroupToDelete({ index, group });
    setShowDeleteGroupModal(true);
  };

  const handleConfirmDeleteGroup = async () => {
    if (!groupToDelete || !groupToDelete.group || !groupToDelete.group.id) {
      return;
    }

    if (!id) return;

    const userData = JSON.parse(sessionStorage.getItem('userData') || '{}');
    const userEmail = userData?.email;

    if (!userEmail) {
      alert('User email not found');
      return;
    }

    setDeletingGroup(true);
    try {
      // Use the new API endpoint
      const response = await deleteCommunityRoom(id, groupToDelete.group.id, userEmail);
      console.log('Group deleted successfully:', response);

      const newGroups = groups.filter((_, i) => i !== groupToDelete.index);
      setGroups(newGroups);
      setOriginalGroups(newGroups);
      setEditingGroupId(null);

      // Refresh groups list
      const refreshResponse = await authenticatedFetch(`${BASE_URL}community/${id}/rooms/all`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const refreshData = await refreshResponse.json();
      if (refreshResponse.ok) {
        const roomsList = refreshData?.data || [];
        const transformedGroups = roomsList.map((room) => ({
          id: room.id,
          name: room.name || room.roomName,
          roomCode: room.roomCode,
        }));
        setGroups(transformedGroups);
        setOriginalGroups(transformedGroups);
      }

      setShowDeleteGroupModal(false);
      try {
        window.dispatchEvent(new CustomEvent('toast', { detail: { message: 'Group deleted', type: 'success' } }));
      } catch {}
      setGroupToDelete(null);
    } catch (err) {
      console.error('Error deleting group:', err);
      try {
        window.dispatchEvent(new CustomEvent('toast', { detail: { message: err.message || 'Failed to delete group', type: 'error' } }));
      } catch {}
    } finally {
      setDeletingGroup(false);
    }
  };

  const handleDeleteCommunity = async () => {
    if (!community?.name || !community) {
      return;
    }

    const userData = JSON.parse(sessionStorage.getItem('userData') || '{}');
    const userEmail = userData?.email;

    if (!userEmail) {
      alert('User email not found');
      return;
    }

    setDeleting(true);
    try {
      await deleteCommunity({
        name: community.name,
        userEmail: userEmail
      });
      try { window.dispatchEvent(new CustomEvent('toast', { detail: { message: 'Community deleted', type: 'success' } })); } catch {}
      navigate('/dashboard');
    } catch (err) {
      console.error('Error deleting community:', err);
      try { window.dispatchEvent(new CustomEvent('toast', { detail: { message: err.message || 'Failed to delete community', type: 'error' } })); } catch {}
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleLeaveCommunity = async () => {
    if (!community?.name || !community) {
      return;
    }

    const userData = JSON.parse(sessionStorage.getItem('userData') || '{}');
    const userEmail = userData?.email;

    if (!userEmail) {
      alert('User email not found');
      return;
    }

    setLeaving(true);
    try {
      await leaveCommunity({
        communityName: community.name,
        userEmail: userEmail
      });
      try { window.dispatchEvent(new CustomEvent('toast', { detail: { message: 'Left community', type: 'success' } })); } catch {}
      navigate('/dashboard');
    } catch (err) {
      console.error('Error leaving community:', err);
      try { window.dispatchEvent(new CustomEvent('toast', { detail: { message: err.message || 'Failed to leave community', type: 'error' } })); } catch {}
    } finally {
      setLeaving(false);
      setShowLeaveModal(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (deleteModalRef.current && !deleteModalRef.current.contains(event.target)) {
        setShowDeleteModal(false);
      }
      if (leaveModalRef.current && !leaveModalRef.current.contains(event.target)) {
        setShowLeaveModal(false);
      }
      if (deleteGroupModalRef.current && !deleteGroupModalRef.current.contains(event.target)) {
        setShowDeleteGroupModal(false);
      }
      
      // Close dropdown menus when clicking outside
      if (openDropdownId) {
        const dropdownRef = dropdownRefs.current[openDropdownId];
        if (dropdownRef && !dropdownRef.contains(event.target)) {
          setOpenDropdownId(null);
        }
      }
    };

    if (showDeleteModal || showLeaveModal || showDeleteGroupModal || openDropdownId) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDeleteModal, showLeaveModal, showDeleteGroupModal, openDropdownId]);

  // Handle role change
  const handleRoleChange = (userEmail, newRole) => {
    setRoleChanges(prev => ({
      ...prev,
      [userEmail]: newRole
    }));
    setOpenDropdownId(null);
  };

  // Save role changes
  const handleSaveRoles = async () => {
    if (!id || Object.keys(roleChanges).length === 0) return;

    const userData = JSON.parse(sessionStorage.getItem('userData') || '{}');
    const requesterEmail = userData?.email;

    if (!requesterEmail) {
      try {
        window.dispatchEvent(new CustomEvent('toast', {
          detail: { message: 'User email not found', type: 'error' }
        }));
      } catch {}
      return;
    }

    setSaving(true);
    try {
      const changePromises = Object.entries(roleChanges).map(([targetUserEmail, newRole]) =>
        changeCommunityRole({
          communityId: id,
          targetUserEmail,
          requesterEmail,
          newRole: newRole.toUpperCase()
        })
      );

      await Promise.all(changePromises);

      // Refresh members list
      const data = await getCommunityMembers(id);
      const membersList = data?.data?.members || data?.members || [];
      
      const owner = membersList.find(m => 
        (m.role || '').toUpperCase() === 'OWNER' || 
        (m.role || '').toUpperCase() === 'WORKSPACE_OWNER' ||
        (m.role || '').toUpperCase() === 'COMMUNITY_OWNER'
      );
      
      if (owner) {
        setCommunityOwner(owner);
        const regularMembers = membersList.filter(m => 
          m.email !== owner.email && 
          (m.role || '').toUpperCase() !== 'OWNER' && 
          (m.role || '').toUpperCase() !== 'WORKSPACE_OWNER' &&
          (m.role || '').toUpperCase() !== 'COMMUNITY_OWNER'
        );
        setMembers(regularMembers);
      } else {
        setCommunityOwner(null);
        setMembers(membersList);
      }

      setRoleChanges({});
      setHasRoleChanges(false);
      
      try {
        window.dispatchEvent(new CustomEvent('toast', {
          detail: { message: 'Roles updated successfully', type: 'success' }
        }));
      } catch {}
    } catch (err) {
      console.error('Error saving role changes:', err);
      try {
        window.dispatchEvent(new CustomEvent('toast', {
          detail: { message: err.message || 'Failed to update roles', type: 'error' }
        }));
      } catch {}
    } finally {
      setSaving(false);
    }
  };

  // Don't save role changes
  const handleDontSaveRoles = () => {
    setRoleChanges({});
    setHasRoleChanges(false);
  };

  const handleImageUpload = () => {
    fileInputRef.current?.click();
  };

  const handleBannerUpload = () => {
    bannerInputRef.current?.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (profileImagePreview) {
        URL.revokeObjectURL(profileImagePreview);
      }
      setProfileImageFile(file);
      setProfileImagePreview(URL.createObjectURL(file));
    }
  };

  const handleBannerChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (bannerImagePreview) {
        URL.revokeObjectURL(bannerImagePreview);
      }
      setBannerImageFile(file);
      setBannerImagePreview(URL.createObjectURL(file));
    }
  };

  useEffect(() => {
    return () => {
      if (profileImagePreview) {
        URL.revokeObjectURL(profileImagePreview);
      }
      if (bannerImagePreview) {
        URL.revokeObjectURL(bannerImagePreview);
      }
    };
  }, [profileImagePreview, bannerImagePreview]);

  if (loading) {
    return (
      <div className="h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-700">Loading...</div>
      </div>
    );
  }

  if (error || !community) {
    return (
      <div className="h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">{error || 'Community not found'}</div>
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Back to Community
          </button>
        </div>
      </div>
    );
  }

  const title = community.name || 'Community';
  const safeUrl = (rawUrl) => {
    if (!rawUrl) return '';
    if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
      return rawUrl;
    }
    return `${BASE_URL}${rawUrl}`;
  };

  return (
    <div className="h-screen bg-gray-100 flex flex-col overflow-x-hidden">
      {/* Top Navbar */}
      <div className="sticky top-0 z-20 bg-gray-200 border-b border-gray-300 h-20 flex items-center px-4 rounded-b-xl">
        <div className="flex items-center gap-2">
          <img src={logo} alt="Logo" className="w-7 h-7 object-contain" />
        </div>
         <div className="flex-1 text-center">
           <h1 className="text-lg font-semibold text-gray-800">Settings</h1>
         </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => dispatch(setShowInbox(true))}
            title='Inbox'
            className="w-7 h-7 flex items-center justify-center hover:bg-gray-300 rounded-md transition-colors">
            <img src="/avatars/inbox.png" alt="Inbox" className="w-5 h-5" />
          </button>
        </div>
      </div>

       {/* Main Content */}
       <div className="flex-1 bg-gray-100 flex items-center justify-center p-6">
         <div className="bg-gray-200 rounded-2xl w-full max-w-6xl h-full flex flex-col shadow-lg">
           {/* Settings Container */}
           <div className="flex-1 flex bg-[#282828] rounded-2xl overflow-hidden">
            {/* Left Sidebar */}
            <div className="w-64 bg-[#282828] border-r border-gray-700 flex flex-col">
              {/* Back Button */}
              <div className="p-4">
                <button
                  onClick={handleBack}
                  className="text-white hover:text-gray-300 transition-colors"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                  </svg>
                </button>
              </div>

              {/* Community Title */}
              <div className="px-4 pb-4">
                <h3 className="text-lg font-semibold text-white">{title}</h3>
              </div>

              {/* Settings Categories */}
              <div className="flex-1 px-2 space-y-1">
                <button
                  onClick={() => setActiveSection('profile')}
                  className={`w-full text-left px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeSection === 'profile'
                      ? 'bg-white text-gray-900'
                      : 'text-white hover:bg-gray-700'
                  }`}
                >
                  Community profile
                </button>
                <button
                  onClick={() => setActiveSection('channels')}
                  className={`w-full text-left px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeSection === 'channels'
                      ? 'bg-white text-gray-900'
                      : 'text-white hover:bg-gray-700'
                  }`}
                >
                  Groups
                </button>
                <button
                  onClick={() => setActiveSection('roles')}
                  className={`w-full text-left px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeSection === 'roles'
                      ? 'bg-gray-600 text-white'
                      : 'text-white hover:bg-gray-700'
                  }`}
                >
                  Roles
                </button>
              </div>

              {/* Danger Zone */}
              <div className="px-4 py-4 border-t border-gray-700 space-y-2">
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="w-full text-left px-4 py-2 rounded-md text-sm font-medium text-orange-500 hover:bg-gray-700 transition-colors flex items-center gap-2"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                  </svg>
                  Delete community
                </button>
                <button
                  onClick={() => setShowLeaveModal(true)}
                  className="w-full text-left px-4 py-2 rounded-lg text-sm font-medium text-orange-500 hover:bg-gray-700 transition-colors flex items-center gap-2"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
                  </svg>
                  Leave community
                </button>
              </div>
            </div>

            {/* Main Content Area */}
            <div className={`flex-1 bg-[#282828] ${activeSection === 'profile' ? 'overflow-hidden' : 'overflow-y-auto'}`}>
              {activeSection === 'profile' && (
                <div className="p-6 h-full flex flex-col">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4 flex-shrink-0">
                    <h2 className="text-3xl font-bold text-white">Community profile</h2>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleBack}
                        className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                      >
                        Back
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={!hasChanges || saving}
                        className={`px-6 py-2 rounded-md font-semibold transition-colors ${
                          hasChanges && !saving
                            ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                            : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {saving ? 'Saving...' : 'Save changes'}
                      </button>
                    </div>
                  </div>

                  {/* Content - no scroll needed */}
                  <div className="flex-1 flex flex-col justify-start">
                    {/* Profile Section */}
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-white mb-2">Profile</h3>
                      <div className="flex items-center gap-4">
                        <div className="w-20 h-20 rounded-xl overflow-hidden bg-zinc-400 flex-shrink-0">
                          {profileImagePreview ? (
                            <img
                              src={profileImagePreview}
                              alt="Preview"
                              className="w-full h-full object-cover"
                            />
                          ) : community.imageUrl && !imageError ? (
                            <img
                              src={safeUrl(community.imageUrl)}
                              alt={title}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                              onError={() => setImageError(true)}
                            />
                          ) : (
                            <div className="w-full h-full bg-zinc-400 flex items-center justify-center">
                              <div className="text-2xl font-bold text-gray-800">
                                {title.charAt(0).toUpperCase()}
                              </div>
                            </div>
                          )}
                        </div>
                        <button
                          onClick={handleImageUpload}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-semibold transition-colors text-sm"
                        >
                          {profileImageFile ? 'Change image' : 'Upload image'}
                        </button>
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </div>

                    {/* Community Name Section */}
                    <div className="mb-4">
                      <label className="block text-white text-sm font-medium mb-2">Community name</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={communityName}
                          onChange={(e) => handleCommunityNameChange(e.target.value)}
                          className={`w-full bg-gray-700 text-white px-4 py-2.5 rounded-md outline-none placeholder:text-gray-400 pr-10 ${communityNameError ? 'ring-1 ring-red-500' : ''}`}
                          placeholder="Enter community name"
                          maxLength={30}
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </div>
                      </div>
                      {communityNameError ? (
                        <p className="text-red-400 text-sm mt-1">{communityNameError}</p>
                      ) : (
                        <p className="text-gray-400 text-xs mt-1">{communityName.length}/30 characters</p>
                      )}
                    </div>

                    {/* Banner Section */}
                    <div className="mb-4">
                      <label className="block text-white text-sm font-medium mb-2">Banner</label>
                      <div className="rounded-xl overflow-hidden bg-gray-700 mb-2">
                        {bannerImagePreview ? (
                          <img
                            src={bannerImagePreview}
                            alt="Banner Preview"
                            className="w-full h-32 object-cover"
                          />
                        ) : community.bannerUrl && !bannerError ? (
                          <img
                            src={safeUrl(community.bannerUrl)}
                            alt="Banner"
                            className="w-full h-32 object-cover"
                            referrerPolicy="no-referrer"
                            onError={() => setBannerError(true)}
                          />
                        ) : (
                          <div className="w-full h-32 bg-gray-700 flex items-center justify-center">
                            <span className="text-gray-500 text-sm">No banner image</span>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={handleBannerUpload}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md font-semibold transition-colors"
                      >
                        {bannerImageFile ? 'Change banner' : 'Upload your own'}
                      </button>
                      <input
                        ref={bannerInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleBannerChange}
                        className="hidden"
                      />
                    </div>

                    {/* Description Section */}
                    <div className="flex-1">
                      <label className="block text-white text-sm font-medium mb-2">Description</label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full bg-gray-700 text-white px-4 py-2.5 rounded-md outline-none placeholder:text-gray-400 resize-none"
                        rows={3}
                        placeholder="Enter community description"
                        maxLength={80}
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'channels' && (
                <div className="p-8">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-bold text-white">Groups</h2>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleBack}
                        className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                      >
                        Back
                      </button>
                      <button
                        onClick={handleSaveGroups}
                        disabled={!hasGroupChanges}
                        className={`px-6 py-2 rounded-md font-semibold transition-colors ${
                          hasGroupChanges
                            ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                            : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        Save changes
                      </button>
                    </div>
                  </div>

                  {/* Groups Section */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Group names</h3>
                    {loadingGroups ? (
                      <div className="text-gray-400 text-sm">Loading groups...</div>
                    ) : (
                      <>
                        <div className="space-y-3">
                          {groups.map((group, index) => {
                            const charCount = (group.name || '').length;
                            return (
                              <div key={group.id || index} className="flex flex-col gap-1">
                                <div className="flex items-center gap-3">
                                  <div className="flex-1 relative">
                                    <input
                                      type="text"
                                      value={group.name || ''}
                                      onChange={(e) => handleGroupChange(index, e.target.value)}
                                      onBlur={() => handleGroupBlur(index)}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          handleGroupBlur(index);
                                        }
                                      }}
                                      className="w-full bg-gray-700 text-white px-4 py-3 rounded-md outline-none placeholder:text-gray-400"
                                      placeholder="Group name"
                                      autoFocus={editingGroupId === index}
                                      maxLength={30}
                                    />
                                  </div>
                                  <button
                                    onClick={() => handleEditGroup(index)}
                                    className="text-white hover:text-gray-300 transition-colors p-2"
                                    title="Edit group"
                                  >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                    </svg>
                                  </button>
                                  <button
                                    onClick={() => handleDeleteGroupClick(index)}
                                    className="text-orange-500 hover:text-orange-400 transition-colors p-2"
                                    title="Delete group"
                                  >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                                    </svg>
                                  </button>
                                </div>
                                <div className="flex items-center justify-end pr-12">
                                  <p className="text-sm text-gray-400">{charCount}/30 characters</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        {groups.length === 0 && (
                          <div className="text-gray-400 text-sm mt-4">No groups yet.</div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}

              {activeSection === 'roles' && (
                <div className="p-8">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-bold text-white">Roles</h2>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleDontSaveRoles}
                        disabled={!hasRoleChanges}
                        className={`px-4 py-2 rounded-md font-semibold transition-colors ${
                          hasRoleChanges
                            ? 'bg-gray-700 hover:bg-gray-600 text-white'
                            : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        Don't save
                      </button>
                      <button
                        onClick={handleSaveRoles}
                        disabled={!hasRoleChanges || saving}
                        className={`px-6 py-2 rounded-md font-semibold transition-colors ${
                          hasRoleChanges && !saving
                            ? 'bg-indigo-200 hover:bg-indigo-300 text-black'
                            : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {saving ? 'Saving...' : 'Save changes'}
                      </button>
                    </div>
                  </div>

                  {/* Community Owner Section */}
                  {communityOwner && (
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-white">Community owner</h3>
                        <button
                          onClick={() => setShowOwnerSection(!showOwnerSection)}
                          className="text-gray-400 hover:text-white transition-colors"
                        >
                          <svg 
                            className={`w-5 h-5 transition-transform ${showOwnerSection ? 'rotate-180' : ''}`}
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>
                      {showOwnerSection && (
                        <div className="bg-gray-700 rounded-lg px-4 py-3 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center flex-shrink-0">
                            {communityOwner.avatarUrl || communityOwner.profileImage ? (
                              <img 
                                src={communityOwner.avatarUrl || communityOwner.profileImage} 
                                alt={communityOwner.username || communityOwner.email}
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-gray-800 font-semibold text-sm">
                                {(communityOwner.username || communityOwner.email || 'U').charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="text-white font-medium">
                              {communityOwner.username || communityOwner.email}
                              {communityOwner.role && (
                                <span className="ml-2 text-gray-300 text-sm">
                                  {communityOwner.role === 'OWNER' || communityOwner.role === 'WORKSPACE_OWNER' 
                                    ? 'Admin' 
                                    : communityOwner.role}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Search Bar */}
                  <div className="mb-6">
                    <div className="relative">
                      <svg 
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <input
                        type="text"
                        placeholder="Search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-gray-700 text-white px-10 py-2.5 rounded-md outline-none placeholder:text-gray-400"
                      />
                    </div>
                  </div>

                  {/* Community Members Section */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Community Members</h3>
                    {loadingMembers ? (
                      <div className="text-gray-400 text-sm">Loading members...</div>
                    ) : (
                      <div className="space-y-2">
                        {(() => {
                          const userData = JSON.parse(sessionStorage.getItem('userData') || '{}');
                          const currentUserEmail = userData?.email || '';
                          
                          return members
                            .filter(member => {
                              if (!searchQuery.trim()) return true;
                              const query = searchQuery.toLowerCase();
                              const username = (member.username || member.email || '').toLowerCase();
                              const email = (member.email || '').toLowerCase();
                              return username.includes(query) || email.includes(query);
                            })
                            .map((member) => {
                              const memberId = member.email || member.id;
                              const originalRole = (member.role || 'MEMBER').toUpperCase();
                              const pendingRole = roleChanges[member.email];
                              const currentRole = pendingRole ? pendingRole.toUpperCase() : originalRole;
                              const roleUpper = currentRole;
                              const isAdmin = roleUpper === 'ADMIN';
                              const isWorkspaceOwner = roleUpper === 'WORKSPACE_OWNER' || roleUpper === 'OWNER';
                              const isMember = roleUpper === 'MEMBER';
                              
                              // Check if this member is the current user
                              const isCurrentUser = member.email && currentUserEmail && 
                                member.email.toLowerCase() === currentUserEmail.toLowerCase();
                              
                              return (
                                <div 
                                  key={memberId}
                                  className="bg-gray-700 rounded-lg px-4 py-3 flex items-center gap-3 relative"
                                >
                                  <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center flex-shrink-0">
                                    {member.avatarUrl || member.profileImage ? (
                                      <img 
                                        src={member.avatarUrl || member.profileImage} 
                                        alt={member.username || member.email}
                                        className="w-full h-full rounded-full object-cover"
                                      />
                                    ) : (
                                      <span className="text-gray-800 font-semibold text-sm">
                                        {(member.username || member.email || 'U').charAt(0).toUpperCase()}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    <div className="text-white font-medium">
                                      {member.username || member.email}
                                      {currentRole && (
                                        <span className="ml-2 text-gray-300 text-sm">
                                          {roleUpper === 'ADMIN' 
                                            ? 'Admin' 
                                            : roleUpper === 'WORKSPACE_OWNER' || roleUpper === 'OWNER'
                                            ? 'Workspace Owner'
                                            : 'Member'}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  {/* Only show three-dot menu if this is NOT the current user */}
                                  {!isCurrentUser && (
                                    <div className="relative" ref={el => dropdownRefs.current[memberId] = el}>
                                      <button
                                        onClick={() => setOpenDropdownId(openDropdownId === memberId ? null : memberId)}
                                        className="text-gray-400 hover:text-white transition-colors p-1"
                                      >
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                          <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                                        </svg>
                                      </button>
                                      {openDropdownId === memberId && (
                                        <div className="absolute right-0 top-full mt-1 bg-gray-800 rounded-md shadow-lg z-50 min-w-[200px] border border-gray-700">
                                          {!isAdmin && (
                                            <button
                                              onClick={() => handleRoleChange(member.email, 'ADMIN')}
                                              className="w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700 transition-colors"
                                            >
                                              Change role to Admin
                                            </button>
                                          )}
                                          {!isWorkspaceOwner && (
                                            <button
                                              onClick={() => handleRoleChange(member.email, 'WORKSPACE_OWNER')}
                                              className="w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700 transition-colors"
                                            >
                                              Change role to Workspace Owner
                                            </button>
                                          )}
                                          {!isMember && (
                                            <button
                                              onClick={() => handleRoleChange(member.email, 'MEMBER')}
                                              className="w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700 transition-colors"
                                            >
                                              Change role to Member
                                            </button>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            });
                        })()}
                        {members.filter(member => {
                          if (!searchQuery.trim()) return true;
                          const query = searchQuery.toLowerCase();
                          const username = (member.username || member.email || '').toLowerCase();
                          const email = (member.email || '').toLowerCase();
                          return username.includes(query) || email.includes(query);
                        }).length === 0 && (
                          <div className="text-gray-400 text-sm text-center py-8">
                            {searchQuery.trim() ? 'No members found' : 'No members yet'}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Community Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-[#282828]/50 flex items-center justify-center z-50">
          <div
            ref={deleteModalRef}
            className="bg-[#282828] rounded-xl p-8 max-w-md w-full mx-4 relative"
          >
            <button
              onClick={() => setShowDeleteModal(false)}
              className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors p-1"
              title="Close"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
            <h2 className="text-2xl font-bold text-white mb-4">Delete community</h2>
            <p className="text-white text-sm mb-6">
              Deleting this community will remove all its data. Make sure you really want to continue.
            </p>
            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCommunity}
                disabled={deleting}
                className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Leave Community Confirmation Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 bg-[#282828]/50 flex items-center justify-center z-50">
            <div
            ref={leaveModalRef}
            className="bg-[#282828] rounded-xl p-8 max-w-md w-full mx-4 relative"
          >
            <button
              onClick={() => setShowLeaveModal(false)}
              className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors p-1"
              title="Close"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
            <h2 className="text-2xl font-bold text-white mb-4">Leave community</h2>
            <p className="text-white text-sm mb-6">
              Are you sure you want to leave this community? You will lose access to all channels and conversations.
            </p>
            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={() => setShowLeaveModal(false)}
                disabled={leaving}
                className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleLeaveCommunity}
                disabled={leaving}
                className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {leaving ? 'Leaving...' : 'Leave'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Group Confirmation Modal */}
      {showDeleteGroupModal && groupToDelete && (
        <div className="fixed inset-0 bg-[#282828]/50 flex items-center justify-center z-50">
            <div
            ref={deleteGroupModalRef}
            className="bg-[#282828] rounded-xl p-8 max-w-md w-full mx-4 relative"
          >
            <button
              onClick={() => {
                setShowDeleteGroupModal(false);
                setGroupToDelete(null);
              }}
              className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors p-1"
              title="Close"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
            <h2 className="text-2xl font-bold text-white mb-4">Delete group</h2>
            <p className="text-white text-sm mb-6">
              Are you sure you want to delete the group "{groupToDelete.group.name}"? This action cannot be undone.
            </p>
            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={() => {
                  setShowDeleteGroupModal(false);
                  setGroupToDelete(null);
                }}
                disabled={deletingGroup}
                className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteGroup}
                disabled={deletingGroup}
                className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deletingGroup ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunitySettingsPage;

