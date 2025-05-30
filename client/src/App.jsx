import { useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import './App.css';
import { Login } from './pages/Login';
import { Chat } from './components/chat';
import { List } from './components/list';

const socket = io(); 

function App() {
  const [user, setUser] = useState({ isLoggedIn: false, username: '' });
  const [currentServer, setCurrentServer] = useState('US'); 
  const [messageHistory, setMessageHistory] = useState({});
  const [onlineUsers, setOnlineUsers] = useState({});
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);

  useEffect(() => {
    console.log('Setting up socket listeners...');
    
    const handleConnect = () => {
      console.log('Socket connected:', socket.id);
      setSocketConnected(true);
      
      // Join server after connection is established
      if (user.isLoggedIn && currentServer) {
        console.log('Auto-joining server after connection:', currentServer);
        socket.emit('join_server', {
          server: currentServer,
          username: user.username,
        });
      }
    };

    const handleDisconnect = () => {
      console.log('Socket disconnected');
      setSocketConnected(false);
    };

    const handleReceiveMessage = (message) => {
      console.log('Received message:', message);
      
      // Handle different message formats
      const serverKey = message.server || message.room || currentServer;
      
      // Ensure message has required fields
      const processedMessage = {
        _id: message._id || message.id || Date.now(),
        user: message.user || message.username || 'Unknown',
        text: message.text || message.message || '',
        timestamp: message.timestamp || message.createdAt || new Date().toISOString(),
        server: serverKey
      };
      
      setMessageHistory((prev) => ({
        ...prev,
        [serverKey]: [...(prev[serverKey] || []), processedMessage],
      }));
    };

    const handleLoadHistory = (data) => {
      console.log('Loading message history:', data);
      
      // Handle different data formats
      let server, messages;
      
      if (data.server && data.messages) {
        server = data.server;
        messages = data.messages;
      } else if (Array.isArray(data)) {
        server = currentServer;
        messages = data;
      } else {
        console.warn('Unexpected message history format:', data);
        return;
      }
      
      // Process messages to ensure consistent format
      const processedMessages = messages.map(msg => ({
        _id: msg._id || msg.id || Date.now() + Math.random(),
        user: msg.user || msg.username || 'Unknown',
        text: msg.text || msg.message || '',
        timestamp: msg.timestamp || msg.createdAt || new Date().toISOString(),
        server: server
      }));
      
      setMessageHistory((prev) => ({
        ...prev,
        [server]: processedMessages,
      }));
    };

    const handleUsersUpdate = (data) => {
      console.log('Users update received:', data);
      
      if (data.server && data.users) {
        setOnlineUsers(prev => ({
          ...prev,
          [data.server]: data.users
        }));
      } else if (Array.isArray(data)) {
        setOnlineUsers(prev => ({
          ...prev,
          [currentServer]: data
        }));
      } else {
        console.warn('Unexpected users_update format:', data);
      }
    };

    const handleError = (error) => {
      console.error('Socket error:', error);
    };

    // Register all socket listeners
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('receive_message', handleReceiveMessage);
    socket.on('message', handleReceiveMessage); // Alternative event name
    socket.on('new_message', handleReceiveMessage); // Another alternative
    socket.on('load_message_history', handleLoadHistory);
    socket.on('message_history', handleLoadHistory); // Alternative event name
    socket.on('users_update', handleUsersUpdate);
    socket.on('error', handleError);

    return () => {
      console.log('Cleaning up socket listeners...');
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('receive_message', handleReceiveMessage);
      socket.off('message', handleReceiveMessage);
      socket.off('new_message', handleReceiveMessage);
      socket.off('load_message_history', handleLoadHistory);
      socket.off('message_history', handleLoadHistory);
      socket.off('users_update', handleUsersUpdate);
      socket.off('error', handleError);
    };
  }, [currentServer, user.isLoggedIn, user.username]);

  // Separate effect for joining server when conditions change
  useEffect(() => {
    if (socketConnected && user.isLoggedIn && currentServer) {
      console.log('Joining server:', currentServer, 'as', user.username);
      socket.emit('join_server', {
        server: currentServer,
        username: user.username,
      });
      
      // Request message history for this server
      socket.emit('get_message_history', {
        server: currentServer
      });
    }
  }, [socketConnected, user.isLoggedIn, user.username, currentServer]);

  const handleServerChange = useCallback((newServer) => {
    console.log('Changing server from', currentServer, 'to', newServer);
    
    // Leave current server if connected
    if (socketConnected && currentServer && user.isLoggedIn) {
      socket.emit('leave_server', {
        server: currentServer,
        username: user.username,
      });
    }
    
    setCurrentServer(newServer);
  }, [socketConnected, currentServer, user.username, user.isLoggedIn]); 

  const handleLogin = useCallback((username) => {
    console.log('User logging in:', username);
    setUser({ isLoggedIn: true, username });
  }, []);

  const handleNewMessage = useCallback((messageText) => {
    console.log('handleNewMessage called with:', messageText);
    console.log('Current server:', currentServer);
    console.log('Socket connected:', socketConnected);
    console.log('User:', user);
    
    if (!currentServer) {
      console.error('No current server selected');
      return;
    }
    
    if (!socketConnected) {
      console.error('Socket not connected');
      return;
    }
    
    if (!user.username) {
      console.error('No username available');
      return;
    }

    const messageData = {
      server: currentServer,
      user: user.username,
      text: messageText,
      timestamp: new Date().toISOString(),
    };

    console.log('Emitting message:', messageData);
    socket.emit('send_message', messageData);
    
    // Optionally add message to local state immediately (optimistic update)
    // This will be replaced when the server sends it back
    const optimisticMessage = {
      ...messageData,
      _id: 'temp-' + Date.now(),
      pending: true
    };
    
    setMessageHistory(prev => ({
      ...prev,
      [currentServer]: [...(prev[currentServer] || []), optimisticMessage]
    }));
  }, [currentServer, user.username, socketConnected]);

  const getCurrentMessages = useCallback(() => {
    const messages = messageHistory[currentServer] || [];
    console.log('getCurrentMessages for server', currentServer, ':', messages);
    return messages;
  }, [currentServer, messageHistory]);

  const getCurrentOnlineUsers = useCallback(() => {
    const users = onlineUsers[currentServer] || [];
    console.log('getCurrentOnlineUsers for server', currentServer, ':', users);
    return users;
  }, [currentServer, onlineUsers]);

  if (!user.isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="app-container flex h-screen bg-gray-800">
      <List
        username={user.username}
        onServerChange={(server) => {
          handleServerChange(server);
          setIsSidebarOpen(false); 
        }}
        currentServer={currentServer}
        socket={socket}
        onlineUsers={getCurrentOnlineUsers()}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      
      <Chat
        username={user.username}
        messages={getCurrentMessages()}
        onNewMessage={handleNewMessage}
        currentServer={currentServer}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />
    </div>
  );
}

export default App;