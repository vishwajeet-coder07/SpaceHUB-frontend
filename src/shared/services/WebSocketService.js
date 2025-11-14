class WebSocketService {
  constructor() {
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000; // 3 seconds
    this.reconnectTimer = null;
    this.isConnecting = false;
    this.listeners = new Set();
    this.userEmail = null;
  }
  connect(email) {
    if (!email) {
      console.error('WebSocket: Email is required to connect');
      return;
    }

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log('WebSocket: Already connected');
      return;
    }

    if (this.isConnecting) {
      console.log('WebSocket: Connection already in progress');
      return;
    }

    this.userEmail = email;
    this.isConnecting = true;

    try {
      const wsUrl = `wss://codewithketan.me/notification?email=${encodeURIComponent(email)}`;
      console.log('WebSocket: Connecting to', wsUrl);
      
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('WebSocket: Connected successfully');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.notifyListeners('connected', { email });
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('WebSocket: Message received', data);
          this.handleMessage(data);
        } catch (error) {
          console.error('WebSocket: Error parsing message', error, event.data);
          if (typeof event.data === 'string' && event.data.includes('Connected')) {
            console.log('WebSocket: Connection confirmed');
            this.notifyListeners('connected', { message: event.data });
          }
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket: Error occurred', error);
        this.isConnecting = false;
        this.notifyListeners('error', { error });
      };

      this.ws.onclose = (event) => {
        console.log('WebSocket: Connection closed', event.code, event.reason);
        this.isConnecting = false;
        this.ws = null;
        this.notifyListeners('disconnected', { code: event.code, reason: event.reason });        
        if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.scheduleReconnect();
        }
      };
    } catch (error) {
      console.error('WebSocket: Failed to create connection', error);
      this.isConnecting = false;
      this.notifyListeners('error', { error });
    }
  }
  handleMessage(data) {
    // Handle arrays of notifications
    if (Array.isArray(data)) {
      // Group notifications by type and scope
      const friendRequests = [];
      const communityRequests = [];
      const pendingRequests = [];
      
      data.forEach(item => {
        const notificationType = item.type?.toUpperCase();
        
        if (notificationType === 'FRIEND_REQUEST') {
          if (item.scope === 'friend' && item.actionable) {
            friendRequests.push(item);
          } else if (item.scope === 'community') {
            communityRequests.push(item);
          } else if (!item.actionable) {
            pendingRequests.push(item);
          }
        } else if (notificationType === 'COMMUNITY_JOIN_REQUEST' || notificationType === 'COMMUNITY_REQUEST') {
          communityRequests.push(item);
        }
      });
      
      if (friendRequests.length > 0) {
        this.notifyListeners('friend_requests_bulk', friendRequests);
      }
      if (communityRequests.length > 0) {
        this.notifyListeners('community_requests_bulk', communityRequests);
      }
      if (pendingRequests.length > 0) {
        this.notifyListeners('pending_requests_bulk', pendingRequests);
      }
      
      // If no notifications found, still notify with empty arrays
      if (friendRequests.length === 0 && communityRequests.length === 0 && pendingRequests.length === 0) {
        this.notifyListeners('notification', { friendRequests: [], communityRequests: [], pendingRequests: [] });
      }
      return;
    }
    
    // Handle single notification
    if (data.type) {
      const notificationType = data.type.toUpperCase();
      
      switch (notificationType) {
        case 'FRIEND_REQUEST':
          if (data.scope === 'friend' && data.actionable) {
            this.notifyListeners('friend_request', data);
          } else if (data.scope === 'community') {
            this.notifyListeners('community_request', data);
          } else if (!data.actionable) {
            this.notifyListeners('pending_friend_request', data);
          } else {
            this.notifyListeners('friend_request', data);
          }
          break;
        
        case 'COMMUNITY_JOIN_REQUEST':
        case 'COMMUNITY_REQUEST':
          this.notifyListeners('community_request', data);
          break;
        
        case 'FRIEND_REQUEST_ACCEPTED':
        case 'FRIEND_REQUEST_REJECTED':
          this.notifyListeners('friend_request_response', data);
          break;
        
        case 'COMMUNITY_REQUEST_ACCEPTED':
        case 'COMMUNITY_REQUEST_REJECTED':
          this.notifyListeners('community_request_response', data);
          break;
        
        default:
          this.notifyListeners('notification', data);
      }
    } else if (data.friendRequests || data.communityRequests || data.pendingRequests) {
      // Handle structured bulk data
      if (data.friendRequests) {
        this.notifyListeners('friend_requests_bulk', data.friendRequests);
      }
      if (data.communityRequests) {
        this.notifyListeners('community_requests_bulk', data.communityRequests);
      }
      if (data.pendingRequests) {
        this.notifyListeners('pending_requests_bulk', data.pendingRequests);
      }
    } else {
      this.notifyListeners('notification', data);
    }
  }

  scheduleReconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.min(this.reconnectAttempts, 3);
    
    console.log(`WebSocket: Scheduling reconnect attempt ${this.reconnectAttempts} in ${delay}ms`);
    
    this.reconnectTimer = setTimeout(() => {
      if (this.userEmail) {
        this.connect(this.userEmail);
      }
    }, delay);
  }
  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.close(1000, 'User disconnected');
      this.ws = null;
    }

    this.isConnecting = false;
    this.reconnectAttempts = 0;
    this.userEmail = null;
    console.log('WebSocket: Disconnected');
  }
  send(message) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket: Cannot send message, connection not open');
    }
  }
  requestNotifications() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.send({ type: 'get_notifications' });
    }
  }
  addListener(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  removeListener(callback) {
    this.listeners.delete(callback);
  }
  notifyListeners(eventType, data) {
    this.listeners.forEach(callback => {
      try {
        callback(eventType, data);
      } catch (error) {
        console.error('WebSocket: Error in listener callback', error);
      }
    });
  }  
  isConnected() {
    return this.ws && this.ws.readyState === WebSocket.OPEN;
  }
  getReadyState() {
    if (!this.ws) return WebSocket.CLOSED;
    return this.ws.readyState;
  }
}
export const webSocketService = new WebSocketService();
export default webSocketService;
