import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMyPendingRequests, acceptJoinRequest, rejectJoinRequest } from '../../../shared/services/API';
import { useAuth } from '../../../shared/contexts/AuthContextContext';
import {
  selectRequests,
  selectPending,
  selectInboxActiveTab,
  selectInboxLoading,
  selectInboxError,
  selectProcessingRequest,
  setRequests,
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

  // Fetch requests from API (for Request tab - incoming requests that need action)
  useEffect(() => {
    const fetchRequests = async () => {
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
        const response = await getMyPendingRequests(userEmail);
        const data = response?.data || [];
        const transformedRequests = [];
        data.forEach((communityData) => {
          const { communityId, communityName, requests: communityRequests } = communityData;
          
          communityRequests.forEach((req) => {
            transformedRequests.push({
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

        dispatch(setRequests(transformedRequests));
      } catch (err) {
        dispatch(setError(err.message || 'Failed to load requests'));
      }
    };

    fetchRequests();
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
    const creatorEmail = user?.email || storedEmail;

    if (!creatorEmail) {
      dispatch(setError('User email not found'));
      dispatch(setProcessingRequest(null));
      return;
    }

    try {
      await acceptJoinRequest({
        communityName: request.name,
        creatorEmail: creatorEmail,
        userEmail: request.requesterEmail
      });
      dispatch(removeRequest(requestId));
    } catch (err) {
      dispatch(setError(err.message || 'Failed to accept request'));
    } finally {
      dispatch(setProcessingRequest(null));
    }
  };

  const handleReject = async (requestId) => {
    const request = requests.find(r => r.id === requestId);
    if (!request) return;

    dispatch(setProcessingRequest(requestId));
    
    const storedEmail = JSON.parse(sessionStorage.getItem('userData') || '{}')?.email || '';
    const creatorEmail = user?.email || storedEmail;

    if (!creatorEmail) {
      dispatch(setError('User email not found'));
      dispatch(setProcessingRequest(null));
      return;
    }

    try {
      await rejectJoinRequest({
        communityName: request.name,
        creatorEmail: creatorEmail,
        userEmail: request.requesterEmail
      });

      dispatch(removeRequest(requestId));
    } catch (err) {
      dispatch(setError(err.message || 'Failed to reject request'));
    } finally {
      dispatch(setProcessingRequest(null));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#282828]/50 flex items-start justify-end z-50 pt-14 pr-4">
      <div 
        ref={modalRef}
        className="bg-white rounded-xl shadow-2xl w-[420px] max-h-[calc(100vh-80px)] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="bg-white px-6 py-5 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-6 h-6 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors"
            title="Close"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
          <div className="flex items-center gap-2.5 mb-5">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-700">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M3 9h18M9 21V9" />
            </svg>
            <h2 className="text-xl font-bold text-gray-800">Inbox</h2>
          </div>

          {/* Tabs */}
          <div className="flex gap-8">
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
        <div className="flex-1 overflow-y-auto min-h-[450px] bg-blue-100/90 px-4 py-4">
          {loading ? (
            <div className="text-center text-gray-500 py-12 text-sm">
              Loading...
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
                  <div key={request.id} className="flex items-center gap-4 bg-white rounded-lg p-4 shadow-sm">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
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
                        {request.name}
                        <span className="text-xs font-normal text-gray-500 ml-1">
                          ({request.type})
                        </span>
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {request.requester}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleReject(request.id)}
                        disabled={processingRequest === request.id}
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-red-300 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-md transition-colors"
                      >
                        {processingRequest === request.id ? 'Processing...' : 'Reject'}
                      </button>
                      <button
                        onClick={() => handleAccept(request.id)}
                        disabled={processingRequest === request.id}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-md transition-colors"
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
                pending.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 bg-white rounded-lg p-4 shadow-sm">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                      {item.avatar ? (
                        <img src={item.avatar} alt={item.requester} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                          <span className="text-xs font-semibold text-gray-600">
                            {item.requester?.charAt(0) || 'U'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Request Info */}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-800 leading-tight">
                        {item.name}
                        <span className="text-xs font-normal text-gray-500 ml-1">
                          ({item.type})
                        </span>
                      </div>
                    </div>

                    {/* Requested Button */}
                    <button
                      disabled
                      className="px-4 py-2 bg-white border border-gray-300 text-gray-600 text-xs font-semibold rounded-md flex-shrink-0 cursor-not-allowed"
                    >
                      Requested
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InboxModal;

