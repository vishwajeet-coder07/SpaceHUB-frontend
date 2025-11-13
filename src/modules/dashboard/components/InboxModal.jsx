import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMyPendingRequests, acceptJoinRequest, rejectJoinRequest, getIncomingFriendRequests, getOutgoingFriendRequests, respondToFriendRequest } from '../../../shared/services/API';
import { useAuth } from '../../../shared/contexts/AuthContextContext';
import {
  selectRequests,
  selectPending,
  selectInboxActiveTab,
  selectInboxLoading,
  selectInboxError,
  selectProcessingRequest,
  setRequests,
  setPending,
  setActiveTab,
  setLoading,
  setError,
  setProcessingRequest,
  removeRequest,
} from '../../../shared/store/slices/inboxSlice';

const InboxModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const modalRef = useRef(null);
  const { user } = useAuth();
  
  const activeTab = useSelector(selectInboxActiveTab);
  const requests = useSelector(selectRequests);
  const pending = useSelector(selectPending);
  const loading = useSelector(selectInboxLoading);
  const error = useSelector(selectInboxError);
  const processingRequest = useSelector(selectProcessingRequest);

  // Fetch friend requests from API (for Request tab - incoming friend requests that need action)
  useEffect(() => {
    const fetchFriendRequests = async () => {
      if (!isOpen) return;

      dispatch(setLoading(true));
      dispatch(setError(''));

      const storedEmail = JSON.parse(sessionStorage.getItem('userData') || '{}')?.email || '';
      const userEmail = user?.email || storedEmail;

      if (!userEmail) {
        dispatch(setError('User email not found'));
        dispatch(setLoading(false));
        return;
      }

      try {
        // Fetch incoming friend requests
        const friendResponse = await getIncomingFriendRequests(userEmail);
        const friendRequests = friendResponse?.data || friendResponse?.friends || friendResponse || [];
        
        const transformedFriendRequests = Array.isArray(friendRequests) ? friendRequests.map((req, idx) => {
          // Prefer username for DM display; fall back to name, then first/last, then email prefix
          let displayName = 'Unknown User';
          if (req.username) {
            displayName = req.username;
          }
          
          return {
            id: `friend-${req.id || req.requesterEmail || req.email || idx}`,
            type: 'friend',
            name: displayName,
            requester: displayName,
            requesterEmail: req.email || req.requesterEmail,
            userId: req.id || req.userId,
            firstName: req.firstName,
            lastName: req.lastName,
            avatar: req.avatar || req.avatarUrl || req.profileImage || null
          };
        }) : [];
        let communityRequests = [];
        try {
          const communityResponse = await getMyPendingRequests(userEmail);
          const communityData = communityResponse?.data || [];
          communityData.forEach((communityData) => {
            const { communityId, communityName, requests: commRequests } = communityData;
            
            commRequests.forEach((req) => {
              communityRequests.push({
                id: `${communityId}-${req.userId}`,
                communityId,
                type: 'community',
                name: communityName,
                requester: req.username || req.email?.split('@')[0] || 'Unknown',
                requesterEmail: req.email,
                userId: req.userId,
                avatar: req.avatar || null
              });
            });
          });
        } catch (err) {
          console.error('Error fetching community requests:', err);
          window.dispatchEvent(new CustomEvent('toast', {
            detail: { message: err.message || 'Failed to fetch community requests', type: 'error' }
          }));
        }

       
        let transformedPendingRequests = [];
        try {
          const outgoingResponse = await getOutgoingFriendRequests(userEmail);
          const outgoingRequests = outgoingResponse?.data || outgoingResponse?.requests || outgoingResponse?.friends || outgoingResponse?.pending || outgoingResponse || [];

          transformedPendingRequests = Array.isArray(outgoingRequests)
            ? outgoingRequests.map((req, idx) => {
                let displayName = 'Pending user';
                const candidateName = req.friendName || req.username || req.name || req.receiverName || req.receiverUsername;
                if (candidateName) {
                  displayName = candidateName;
                } else if (req.friendEmail || req.receiverEmail || req.email) {
                  const rawEmail = req.friendEmail || req.receiverEmail || req.email;
                  displayName = rawEmail.split('@')[0];
                }

                return {
                  id: `pending-${req.id || req.friendEmail || req.receiverEmail || idx}`,
                  type: req.type || 'friend',
                  name: displayName,
                  requester: displayName,
                  avatar: req.avatar || req.avatarUrl || req.profileImage || null,
                  raw: req,
                  rawJson: JSON.stringify(req, null, 2),
                };
              })
            : [];
        } catch (pendingErr) {
          console.error('Error fetching pending friend requests:', pendingErr);
          window.dispatchEvent(new CustomEvent('toast', {
            detail: { message: pendingErr.message || 'Failed to fetch pending requests', type: 'error' }
          }));
        }

        dispatch(setPending(transformedPendingRequests));

        // Combine friend requests and community requests
        dispatch(setRequests([...transformedFriendRequests, ...communityRequests]));
        dispatch(setLoading(false));
      } catch (err) {
        console.error('Error fetching friend requests:', err);
        const errorMsg = err.message || 'Failed to load requests';
        dispatch(setError(errorMsg));
        dispatch(setLoading(false));
        window.dispatchEvent(new CustomEvent('toast', {
          detail: { message: errorMsg, type: 'error' }
        }));
      }
    };

    fetchFriendRequests();
  }, [isOpen, user, dispatch]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleAccept = async (requestId) => {
    const request = requests.find(r => r.id === requestId);
    if (!request) return;

    dispatch(setProcessingRequest(requestId));
    
    const storedEmail = JSON.parse(sessionStorage.getItem('userData') || '{}')?.email || '';
    const userEmail = user?.email || storedEmail;

    if (!userEmail) {
      dispatch(setError('User email not found'));
      dispatch(setProcessingRequest(null));
      return;
    }

    try {
      if (request.type === 'friend') {
        // Handle friend request accept
        await respondToFriendRequest({
          userEmail: userEmail,
          requesterEmail: request.requesterEmail,
          accept: true
        });
        // Show toast notification
        window.dispatchEvent(new CustomEvent('toast', {
          detail: { message: 'Friend request accepted!', type: 'success' }
        }));
        try { window.dispatchEvent(new Event('friends:refresh')); } catch {}
      } else {
        await acceptJoinRequest({
          communityName: request.name,
          creatorEmail: userEmail,
          userEmail: request.requesterEmail
        });
      }
      dispatch(removeRequest(requestId));
    } catch (err) {
      console.error('Error accepting request:', err);
      dispatch(setError(err.message || 'Failed to accept request'));
      window.dispatchEvent(new CustomEvent('toast', {
        detail: { message: err.message || 'Failed to accept request', type: 'error' }
      }));
    } finally {
      dispatch(setProcessingRequest(null));
    }
  };

  const handleReject = async (requestId) => {
    const request = requests.find(r => r.id === requestId);
    if (!request) return;

    dispatch(setProcessingRequest(requestId));
    
    const storedEmail = JSON.parse(sessionStorage.getItem('userData') || '{}')?.email || '';
    const userEmail = user?.email || storedEmail;

    if (!userEmail) {
      dispatch(setError('User email not found'));
      dispatch(setProcessingRequest(null));
      return;
    }

    try {
      if (request.type === 'friend') {
        // Handle friend request reject
        await respondToFriendRequest({
          userEmail: userEmail,
          requesterEmail: request.requesterEmail,
          accept: false
        });
        // Show toast notification
        window.dispatchEvent(new CustomEvent('toast', {
          detail: { message: 'Friend request rejected', type: 'info' }
        }));
      } else {
        // Handle community join request reject (existing functionality)
        await rejectJoinRequest({
          communityName: request.name,
          creatorEmail: userEmail,
          userEmail: request.requesterEmail
        });
      }

      dispatch(removeRequest(requestId));
    } catch (err) {
      console.error('Error rejecting request:', err);
      dispatch(setError(err.message || 'Failed to reject request'));
      window.dispatchEvent(new CustomEvent('toast', {
        detail: { message: err.message || 'Failed to reject request', type: 'error' }
      }));
    } finally {
      dispatch(setProcessingRequest(null));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#282828]/50 flex items-start justify-center md:justify-end z-50 p-0 md:pt-10 md:pr-6">
      <div 
        ref={modalRef}
        className="bg-white rounded-none md:rounded-xl shadow-2xl w-full h-full md:w-[420px] md:max-h-[calc(100vh-80px)] md:h-auto flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="bg-white px-4 md:px-6 py-4 md:py-5 relative">
          <button
            onClick={onClose}
            className="absolute top-3 md:top-4 right-3 md:right-4 w-6 h-6 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors"
            title="Close"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
          <div className="flex items-center gap-2.5 mb-4 md:mb-5">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-700">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M3 9h18M9 21V9" />
            </svg>
            <h2 className="text-lg md:text-xl font-bold text-gray-800">Inbox</h2>
          </div>

          {/* Tabs */}
          <div className="flex gap-6 md:gap-8">
            <button
              onClick={() => dispatch(setActiveTab('request'))}
              className={`pb-2.5 text-sm font-medium transition-colors relative ${
                activeTab === 'request'
                  ? 'text-gray-800'
                  : 'text-gray-400'
              }`}
            >
              Request
              {activeTab === 'request' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"></span>
              )}
            </button>
            <button
              onClick={() => dispatch(setActiveTab('pending'))}
              className={`pb-2.5 text-sm font-medium transition-colors relative ${
                activeTab === 'pending'
                  ? 'text-purple-600 font-semibold'
                  : 'text-gray-400'
              }`}
            >
              Pending
              {activeTab === 'pending' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600"></span>
              )}
            </button>
          </div>
        </div>

        {/* Content Area for requests and pending requests */}
        <div className="flex-1 overflow-y-auto min-h-0 md:min-h-[450px] bg-blue-100/90 px-3 md:px-4 py-3 md:py-4">
          {loading ? (
            // Shimmer loading effect
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, idx) => (
                <div key={idx} className="flex items-center gap-4 bg-white rounded-lg p-4 shadow-sm animate-pulse">
                  <div className="w-12 h-12 rounded-full bg-gray-300" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 bg-gray-300 rounded" />
                    <div className="h-3 w-1/2 bg-gray-200 rounded" />
                  </div>
                  <div className="flex gap-2">
                    <div className="w-16 h-8 bg-gray-300 rounded" />
                    <div className="w-16 h-8 bg-gray-300 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center text-red-500 py-12 text-sm">
              {error}
            </div>
          ) : activeTab === 'request' ? (
            <div className="space-y-3">
              {requests.length === 0 ? (
                <div className="text-center text-gray-500 py-12 text-sm">
                  No requests
                </div>
              ) : (
                requests.map((request) => (
                  <div key={request.id} className="flex items-center gap-3 md:gap-4 bg-white rounded-lg p-3 md:p-4 shadow-sm">
                    {/* Avatar */}
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                      {request.avatar ? (
                        <img src={request.avatar} alt={request.requester} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                          <span className="text-xs font-semibold text-gray-600">
                            {request.requester?.charAt(0) || 'U'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Request Info */}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-800 leading-tight">
                        {request.type === 'friend' ? (
                          <span>{request.requester} wants to be your friend</span>
                        ) : (
                          <>
                            {request.name}
                            <span className="text-xs font-normal text-gray-500 ml-1">
                              ({request.type})
                            </span>
                          </>
                        )}
                      </div>
                      {request.type !== 'friend' && (
                        <div className="text-xs text-gray-600 mt-1">
                          {request.requester}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-1.5 md:gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleReject(request.id)}
                        disabled={processingRequest === request.id}
                        className="px-2.5 md:px-4 py-1.5 md:py-2 bg-red-500 hover:bg-red-600 disabled:bg-red-300 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-md transition-colors"
                      >
                        {processingRequest === request.id ? 'Processing...' : 'Reject'}
                      </button>
                      <button
                        onClick={() => handleAccept(request.id)}
                        disabled={processingRequest === request.id}
                        className="px-2.5 md:px-4 py-1.5 md:py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-md transition-colors"
                      >
                        {processingRequest === request.id ? 'Processing...' : 'Accept'}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {pending.length === 0 ? (
                <div className="text-center text-gray-500 py-12 text-sm">
                  No pending requests
                </div>
              ) : (
                pending.map((item) => {
                  const displayName = item.requester || item.username || item.name || 'Unknown';
                  return (
                    <div key={item.id} className="flex items-center gap-3 md:gap-4 bg-white rounded-lg p-3 md:p-4 shadow-sm">
                      {/* Avatar */}
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                        {item.avatar ? (
                          <img src={item.avatar} alt={displayName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                            <span className="text-xs font-semibold text-gray-600">
                              {displayName?.charAt(0) || 'U'}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Request Info */}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-gray-800 leading-tight truncate">
                          {displayName}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InboxModal;

