import React, { useEffect, useMemo, useState } from 'react';
import { getCommunityMembers, getLocalGroupMembers, removeCommunityMember } from '../../../../shared/services/API';
import { useAuth } from '../../../../shared/contexts/AuthContextContext';

const CommunityRightPanel = ({ community, isLocalGroup = false }) => {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [removingMember, setRemovingMember] = useState({});
  const [currentUserRole, setCurrentUserRole] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState(null);
  const communityId = useMemo(() => community?.id || community?.communityId || community?.community_id, [community]);

  const fetchMembers = async () => {
    if (!communityId) return;
    setLoading(true);
    setError('');
    try {
      let list = [];
      if (isLocalGroup) {
        const data = await getLocalGroupMembers(communityId);
        list = data?.data?.members || data?.members || data?.data || [];
      } else {
        const data = await getCommunityMembers(communityId);
        list = data?.data?.members || data?.members || [];
      }
      setMembers(list);

      // Find current user's role
      const userEmail = user?.email || JSON.parse(sessionStorage.getItem('userData') || '{}')?.email;
      if (userEmail) {
        const me = list.find((m) => {
          const memberEmail = m.email || m.username || '';
          return memberEmail.toLowerCase() === userEmail.toLowerCase();
        });
        const role = (me?.role || '').toUpperCase();
        setCurrentUserRole(role);
        console.log('Current user role:', role, 'User email:', userEmail, 'Found member:', me);
      } else {
        console.warn('User email not found for role check');
      }
    } catch (e) {
      setError(e.message || 'Failed to fetch members');
      console.error('Error fetching members:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [communityId, isLocalGroup, user?.email]);

  const handleRemoveMember = async (member) => {
    console.log('handleRemoveMember called with:', member);
    const userEmail = member?.email || member?.username;
    const requesterEmail = user?.email || JSON.parse(sessionStorage.getItem('userData') || '{}')?.email;

    console.log('Remove member params:', { userEmail, requesterEmail, communityId });

    if (!userEmail || !requesterEmail || !communityId) {
      console.error('Missing required info:', { userEmail, requesterEmail, communityId });
      alert('Unable to remove member. Missing required information.');
      return;
    }

    const memberId = member?.memberId || member?.id || userEmail;
    setRemovingMember((prev) => ({ ...prev, [memberId]: true }));

    try {
      console.log('Calling removeCommunityMember API...', {
        url: `community/removeMember`,
        payload: { communityId, userEmail, requesterEmail }
      });
      
      const response = await removeCommunityMember(communityId, userEmail, requesterEmail);
      console.log('Member removed successfully:', response);

      // Optimistically remove member from local state on successful response
      setMembers((prev) => {
        return prev.filter((m) => {
          const prevEmail = m?.email || m?.username;
          const prevId = m?.memberId || m?.id || prevEmail;
          const targetId = member?.memberId || member?.id || userEmail;
          return String(prevId) !== String(targetId);
        });
      });

      try {
        window.dispatchEvent(new CustomEvent('toast', { detail: { message: `Removed ${member?.username || member?.name || userEmail}`, type: 'success' } }));
      } catch {}
    } catch (e) {
      console.error('Failed to remove member - Full error:', e);
      console.error('Error message:', e.message);
      console.error('Error stack:', e.stack);
      try {
        window.dispatchEvent(new CustomEvent('toast', { detail: { message: e.message || 'Failed to remove member', type: 'error' } }));
      } catch {}
    } finally {
      setRemovingMember((prev) => {
        const updated = { ...prev };
        delete updated[memberId];
        return updated;
      });
    }
  };

  const openConfirm = (member) => {
    setConfirmTarget(member);
    setConfirmOpen(true);
  };

  const closeConfirm = () => {
    setConfirmOpen(false);
    setConfirmTarget(null);
  };

  const confirmRemove = async () => {
    if (!confirmTarget) return;
    const target = confirmTarget;
    closeConfirm();
    await handleRemoveMember(target);
  };

  const isAdmin = currentUserRole === 'ADMIN';
  const currentUserEmail = user?.email || JSON.parse(sessionStorage.getItem('userData') || '{}')?.email;

  return (
    <div className="hidden lg:block w-90 bg-white h-[calc(100vh-56px)] overflow-y-auto flex-shrink-0 rounded-xl p-6 border border-gray-500">
      <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
        Members {members?.length ? `(${members.length})` : ''}
      </h3>

      {loading && (
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="flex items-center justify-between gap-4 p-2 rounded-lg">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-12 h-12 rounded-full bg-gray-200 animate-pulse" />
                <div className="flex-1 min-w-0">
                  <div className="h-4 w-40 bg-gray-200 rounded mb-2 animate-pulse" />
                  <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
              <div className="h-7 w-20 bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
      )}
      {error && <div className="text-red-600 text-sm mb-4">{error}</div>}

      {!loading && !error && (
        <div className="space-y-4">
          {members.map((m, idx) => {
            const displayName = m.username || m.name || m.email || `member-${idx+1}`;
            const role = (m.role || '').toString();
            const memberRole = (m.role || '').toUpperCase();
            const avatarUrl = m.avatarUrl || m.avatar || '/avatars/avatar-1.png';
            const memberEmail = m.email || m.username || '';
            const isCurrentUser = memberEmail && currentUserEmail && memberEmail.toLowerCase() === currentUserEmail.toLowerCase();
            const isMemberAdmin = memberRole === 'ADMIN';
            // Only show remove button to admins, and only for non-admin members (not themselves or other admins)
            const canRemove = isAdmin && !isCurrentUser && !isMemberAdmin;
            const memberId = m.memberId || m.id || memberEmail;
            const isRemoving = removingMember[memberId];

            // Debug logging (remove in production)
            if (idx === 0) {
              console.log('Member render check:', {
                isAdmin,
                currentUserRole,
                isCurrentUser,
                isMemberAdmin,
                canRemove,
                memberEmail,
                currentUserEmail
              });
            }

            return (
              <div key={memberId} className="flex items-center justify-between gap-4 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                    <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }} />
                    <div className="w-full h-full bg-gray-300 hidden" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-gray-800 text-base font-medium truncate">{displayName}</div>
                    {role && (
                      <div className="text-xs text-gray-600 mt-0.5">{role}</div>
                    )}
                  </div>
                </div>
                {canRemove && (
                  <button
                    onClick={() => openConfirm(m)}
                    disabled={isRemoving}
                    className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Remove member"
                  >
                    {isRemoving ? 'Removing...' : 'Remove'}
                  </button>
                )}
              </div>
            );
          })}
          {members.length === 0 && (
            <div className="text-gray-600">No members found.</div>
          )}
        </div>
      )}
      {/* Confirm Remove Modal */}
      {confirmOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center pt-24">
          <div className="bg-white rounded-md shadow-lg w-[min(92%,420px)]">
            <div className="px-5 py-4 flex items-center justify-between">
              <h4 className="text-gray-900 font-semibold text-base">Remove member</h4>
              <button onClick={closeConfirm} className="text-gray-500 hover:text-gray-700" title="Close">✕</button>
            </div>
            <div className="px-5 py-4 text-sm text-gray-700">
              Are you sure you want to remove
              {' '}<span className="font-medium">{(confirmTarget?.username || confirmTarget?.name || confirmTarget?.email || confirmTarget?.username || '').toString()}</span>{' '}
              from this community?
            </div>
            <div className="px-5 py-3 border-t border-gray-200 flex items-center justify-end gap-2">
              <button onClick={closeConfirm} className="px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100">Cancel</button>
              <button onClick={confirmRemove} className="px-3 py-2 rounded-md bg-red-600 text-white hover:bg-red-700">Remove</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityRightPanel;
