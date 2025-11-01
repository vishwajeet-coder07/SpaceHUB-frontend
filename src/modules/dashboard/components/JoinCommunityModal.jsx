import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../shared/contexts/AuthContextContext';
import { joinCommunity } from '../../../shared/services/API';

const JoinCommunityModal = ({ isOpen, onClose, community }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const modalRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setError('');
      setSuccess(false);
      setLoading(false);
    }
  }, [isOpen]);

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

  const handleJoin = async () => {
    if (!community) return;

    const storedEmail = JSON.parse(sessionStorage.getItem('userData') || '{}')?.email || '';
    const userEmail = user?.email || storedEmail;

    if (!userEmail) {
      setError('User email not found');
      return;
    }

    const communityName = community.name || '';
    if (!communityName) {
      setError('Community name not found');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await joinCommunity(communityName, userEmail);
      setSuccess(true);
      
      // Refresh communities list
      window.dispatchEvent(new Event('refresh:communities'));
      
      // After a short delay, close the modal
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Error joining community:', err);
      setError(err.message || 'Failed to send join request');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !community) return null;

  const communityName = community.name || 'Community';
  const communityDescription = community.description || '';
  const communityImage = community.imageUrl || community.bannerUrl || community.imageURL || '';

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div ref={modalRef} className="bg-[#282828] rounded-xl p-8 shadow-2xl max-w-md w-full mx-4">
        {/* Community Image */}
        {communityImage && (
          <div className="w-full h-32 mb-4 rounded-lg overflow-hidden bg-gray-700">
            <img 
              src={communityImage} 
              alt={communityName} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        )}

        <h2 className="text-2xl font-bold text-white text-center mb-2">{communityName}</h2>
        
        {communityDescription && (
          <p className="text-white/70 text-center text-sm mb-6 line-clamp-3">{communityDescription}</p>
        )}
        
        {error && (
          <p className="text-red-400 text-sm mb-4 text-center">{error}</p>
        )}

        {success ? (
          <div className="text-center">
            <div className="text-green-400 text-lg font-semibold mb-4">✓ Request sent!</div>
            <p className="text-white/80 text-sm">Your join request has been sent to the community.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <button
              onClick={handleJoin}
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Joining...' : 'Join Community'}
            </button>
            <button
              onClick={onClose}
              disabled={loading}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default JoinCommunityModal;

