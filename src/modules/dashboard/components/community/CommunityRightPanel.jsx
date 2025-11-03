import React, { useEffect, useMemo, useState } from 'react';
import { getCommunityMembers } from '../../../../shared/services/API';

const CommunityRightPanel = ({ community, isLocalGroup = false }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const communityId = useMemo(() => community?.id || community?.communityId || community?.community_id, [community]);

  useEffect(() => {
    if (!communityId || isLocalGroup) return;
    let mounted = true;
    const fetchMembers = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getCommunityMembers(communityId);
        const list = data?.data?.members || data?.members || [];
        if (mounted) setMembers(list);
      } catch (e) {
        if (mounted) setError(e.message || 'Failed to fetch members');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchMembers();
    return () => { mounted = false; };
  }, [communityId, isLocalGroup]);

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

      {loading && <div className="text-gray-600">Loading members...</div>}
      {error && <div className="text-red-600 text-sm mb-4">{error}</div>}

      {!loading && !error && (
        <div className="space-y-4">
          {members.map((m, idx) => {
            const displayName = m.username || m.name || m.email || `member-${idx+1}`;
            const role = (m.role || '').toString();
            return (
              <div key={m.memberId || m.id || displayName} className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                  <div className="w-full h-full bg-gray-300" />
                </div>
                <div className="flex-1">
                  <div className="text-gray-800 text-base font-medium">{displayName}</div>
                  {role && (
                    <div className="text-xs text-gray-600 mt-0.5">{role}</div>
                  )}
                </div>
              </div>
            );
          })}
          {members.length === 0 && (
            <div className="text-gray-600">No members found.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default CommunityRightPanel;
