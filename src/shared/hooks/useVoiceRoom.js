import { useEffect, useRef, useState, useCallback } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

const BASE_URL = 'https://codewithketan.me';
const WS_URL = `${BASE_URL}/ws`;

export const useVoiceRoom = (janusRoomId, sessionId, handleId, userId, enabled = false) => {
  const [isConnected, setIsConnected] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState(null);

  const stompClientRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const audioContainerRef = useRef(null);
  const pendingCandidatesRef = useRef([]);
  const remoteStreamsRef = useRef(new Map()); 

  const log = useCallback((msg) => {
    console.log(`[VoiceRoom] ${msg}`);
  }, []);

  useEffect(() => {
    if (enabled && janusRoomId) {
      // Create or get audio container
      let container = document.getElementById('voice-room-audio-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'voice-room-audio-container';
        container.style.display = 'none'; 
        document.body.appendChild(container);
      }
      audioContainerRef.current = container;
    }
  }, [enabled, janusRoomId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  const cleanup = useCallback(() => {
    log('Cleaning up voice room connection...');
    
    if (stompClientRef.current) {
      try {
        stompClientRef.current.deactivate();
      } catch (e) {
        log(`Error deactivating STOMP: ${e.message}`);
      }
      stompClientRef.current = null;
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }

    // Clean up audio elements
    if (audioContainerRef.current) {
      audioContainerRef.current.innerHTML = '';
    }

    remoteStreamsRef.current.clear();
    pendingCandidatesRef.current = [];
    setIsConnected(false);
    setParticipants([]);
  }, [log]);

  const connectWebSocket = useCallback(() => {
    if (!janusRoomId || !sessionId || !handleId || !userId) {
      log('Missing required parameters for WebSocket connection');
      return;
    }

    if (stompClientRef.current) {
      log('WebSocket already connected');
      return;
    }

    log('Connecting to WebSocket...');
    const socket = new SockJS(WS_URL);
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        log('✅ WebSocket connected');
        setIsConnected(true);
        setError(null);

        // Subscribe to room events
        client.subscribe(`/topic/room/${janusRoomId}/events`, (message) => {
          try {
            const event = JSON.parse(message.body);
            log(`📢 Room Event: ${event.type} - ${event.userId}`);
            handleRoomEvent(event);
          } catch (e) {
            log(`Error parsing room event: ${e.message}`);
          }
        });

        // Subscribe to Janus events (SDP answers, ICE candidates)
        client.subscribe(`/topic/room/${janusRoomId}/answer/${userId}`, (message) => {
          try {
            const resp = JSON.parse(message.body);
            handleJanusEvent(resp);
          } catch (e) {
            log(`Error parsing Janus event: ${e.message}`);
          }
        });

        // Register with the server
        client.publish({
          destination: '/app/register',
          body: JSON.stringify({
            userId,
            sessionId,
            handleId,
            roomId: String(janusRoomId)
          })
        });

        log('🚀 Registration sent. Starting WebRTC connection...');
        startPeerConnection();
      },
      onStompError: (frame) => {
        log(`❌ STOMP error: ${frame.headers['message'] || 'Unknown error'}`);
        setError(frame.headers['message'] || 'WebSocket connection error');
        setIsConnected(false);
      },
      onWebSocketClose: () => {
        log('🔌 WebSocket closed');
        setIsConnected(false);
      },
      onDisconnect: () => {
        log('👋 Disconnected from WebSocket');
        setIsConnected(false);
      }
    });

    client.activate();
    stompClientRef.current = client;
  }, [janusRoomId, sessionId, handleId, userId, log]);

  const handleRoomEvent = useCallback((event) => {
    if (event.type === 'joined') {
      log(`A new user joined: ${event.userId}`);
      setParticipants(prev => {
        const exists = prev.find(p => p.userId === event.userId);
        if (!exists) {
          return [...prev, { userId: event.userId, name: event.userId, muted: false, isSpeaking: false }];
        }
        return prev;
      });
    } else if (event.type === 'left') {
      log(`User left: ${event.userId}`);
      setParticipants(prev => prev.filter(p => p.userId !== event.userId));
      // Remove audio element for this user
      const audioId = `remote-audio-${event.userId}`;
      const audio = document.getElementById(audioId);
      if (audio) {
        audio.remove();
        remoteStreamsRef.current.delete(event.userId);
      }
    }
  }, [log]);

  const handleJanusEvent = useCallback((resp) => {
    try {
      if (resp.jsep) {
        log('✅ Received SDP Answer');
        const pc = peerConnectionRef.current;
        if (!pc) {
          log('⚠️ Peer connection not initialized');
          return;
        }

        if (pc.remoteDescription && pc.remoteDescription.type) {
          log('⚠️ SDP Answer already set. Ignoring.');
          return;
        }

        pc.setRemoteDescription(new RTCSessionDescription(resp.jsep))
          .then(() => {
            log('✅ SDP Answer set successfully');
            pendingCandidatesRef.current.forEach(candidate => {
              pc.addIceCandidate(candidate).catch(e => 
                log(`addIceCandidate error (queued): ${e.message}`)
              );
            });
            pendingCandidatesRef.current = [];
          })
          .catch(e => log(`❌ setRemoteDescription error: ${e.message}`));
      }

      if (resp.candidate) {
        const c = resp.candidate;
        const pc = peerConnectionRef.current;

        if (!pc) {
          log('⚠️ Peer connection not initialized for ICE candidate');
          return;
        }

        if (c.completed) {
          log('🧊 ICE gathering complete signal received');
          return;
        }

        if (c.candidate && c.sdpMid != null && c.sdpMLineIndex != null) {
          const ice = new RTCIceCandidate({
            candidate: c.candidate,
            sdpMid: c.sdpMid,
            sdpMLineIndex: c.sdpMLineIndex
          });

          if (pc.remoteDescription && pc.remoteDescription.type) {
            pc.addIceCandidate(ice).catch(e => 
              log(`addIceCandidate error: ${e.message}`)
            );
          } else {
            log('🕐 Queuing ICE candidate until remote desc is set');
            pendingCandidatesRef.current.push(ice);
          }
        } else {
          log('⚠️ Received invalid candidate object, ignoring');
        }
      }

      if (resp.plugindata && resp.plugindata.data && resp.plugindata.data.leaving) {
        log(`👋 Remote peer left: ${resp.plugindata.data.leaving}`);
        const userId = resp.plugindata.data.leaving;
        setParticipants(prev => prev.filter(p => p.userId !== userId));
        const audioId = `remote-audio-${userId}`;
        const audio = document.getElementById(audioId);
        if (audio) {
          audio.remove();
          remoteStreamsRef.current.delete(userId);
        }
      }
    } catch (e) {
      log(`❌ handleJanusEvent processing error: ${e.message}`);
    }
  }, [log]);

  const startPeerConnection = useCallback(async () => {
    if (peerConnectionRef.current) {
      log('⚠️ Peer connection already exists. Closing old one.');
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    try {
      // Get user media
      localStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      log('🎤 Microphone access granted');
    } catch (err) {
      log(`❌ Audio Error: ${err.message}`);
      setError(`Failed to access microphone: ${err.message}`);
      return;
    }

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    // Add local tracks
    localStreamRef.current.getTracks().forEach(track => {
      pc.addTrack(track, localStreamRef.current);
    });

    // Handle remote tracks
    pc.ontrack = (event) => {
      log('🎁 pc.ontrack fired! Received remote stream.');
      
      const stream = event.streams[0];
      if (!stream) return;

      const streamId = stream.id;
      const audioId = `remote-audio-${streamId}`;
      let audio = document.getElementById(audioId);

      if (audio) {
        log(`Updating existing audio stream: ${audioId}`);
        audio.srcObject = stream;
      } else {
        log(`Creating new audio element: ${audioId}`);
        audio = document.createElement('audio');
        audio.id = audioId;
        audio.autoplay = true;
        audio.playsInline = true;
        audio.controls = true;
        audio.srcObject = stream;
        
        if (audioContainerRef.current) {
          audioContainerRef.current.appendChild(audio);
        }

        remoteStreamsRef.current.set(streamId, { audio, stream });
      }

      audio.play().catch(e => {
        log(`❌ Audio autoplay failed for ${audioId}: ${e.message}`);
        log('👉 Please click the play button on the audio player.');
      });
    };

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate && stompClientRef.current) {
        stompClientRef.current.publish({
          destination: '/app/ice',
          body: JSON.stringify({
            userId,
            roomId: janusRoomId,
            candidate: event.candidate
          })
        });
      }
    };

    peerConnectionRef.current = pc;

    try {
      // Create and send offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      if (stompClientRef.current) {
        stompClientRef.current.publish({
          destination: '/app/offer',
          body: JSON.stringify({
            userId,
            roomId: janusRoomId,
            sdp: offer.sdp
          })
        });
        log('📤 WebRTC offer sent');
      }
    } catch (err) {
      log(`❌ Error creating offer: ${err.message}`);
      setError(`Failed to create WebRTC offer: ${err.message}`);
    }
  }, [janusRoomId, userId, log]);

  const toggleMute = useCallback(() => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      if (audioTracks.length > 0) {
        const newMutedState = !isMuted;
        audioTracks[0].enabled = !newMutedState;
        setIsMuted(newMutedState);
        log(newMutedState ? '🔇 Muted' : '🔊 Unmuted');
      }
    }
  }, [isMuted, log]);

  const leave = useCallback(() => {
    cleanup();
  }, [cleanup]);

  // Connect when enabled and all required params are available
  useEffect(() => {
    if (enabled && janusRoomId && sessionId && handleId && userId) {
      connectWebSocket();
    } else if (!enabled) {
      cleanup();
    }

    return () => {
      if (!enabled) {
        cleanup();
      }
    };
  }, [enabled, janusRoomId, sessionId, handleId, userId, connectWebSocket, cleanup]);

  return {
    isConnected,
    participants,
    isMuted,
    error,
    toggleMute,
    leave
  };
};

