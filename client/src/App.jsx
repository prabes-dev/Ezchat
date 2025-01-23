import { useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import './App.css';
import { Login } from './pages/Login';
import { Chat } from './components/chat';
import { List } from './components/list';


  const socket = io(import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000', {
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

function App() {
  const [user, setUser] = useState({ isLoggedIn: false, username: '' });
  const [currentRoom, setCurrentRoom] = useState({ server: 'US', group: 'General' });
  const [messageHistory, setMessageHistory] = useState({});
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const handleReceiveMessage = (message) => {
      const roomKey = `${currentRoom.server}-${currentRoom.group}`;
      setMessageHistory((prev) => ({
        ...prev,
        [roomKey]: [...(prev[roomKey] || []), message],
      }));
    };

    const handleLoadHistory = (messages) => {
      const roomKey = `${currentRoom.server}-${currentRoom.group}`;
      setMessageHistory((prev) => ({
        ...prev,
        [roomKey]: messages,
      }));
    };

    const handlePinUpdate = ({ messageId, roomKey, isPinned }) => {
      setMessageHistory((prev) => ({
        ...prev,
        [roomKey]: (prev[roomKey] || []).map((msg) =>
          msg._id === messageId ? { ...msg, isPinned } : msg
        ),
      }));
    };

    const handleUsersUpdate = (users) => {
      setOnlineUsers(users);
    };

    socket.on('receive_message', handleReceiveMessage);
    socket.on('load_message_history', handleLoadHistory);
    socket.on('pin_update', handlePinUpdate);
    socket.on('users_update', handleUsersUpdate);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
      socket.off('load_message_history', handleLoadHistory);
      socket.off('pin_update', handlePinUpdate);
      socket.off('users_update', handleUsersUpdate);
    };
  }, [currentRoom]);

  const handleRoomChange = useCallback((newServer, newGroup = 'General') => {
    setCurrentRoom({ server: newServer, group: newGroup });
    socket.emit('join_server', {
      server: newServer,
      group: newGroup,
      username: user.username,
    });
  }, [user.username]);

  const handleLogin = useCallback((username) => {
    setUser({ isLoggedIn: true, username });
  }, []);

  const handleNewMessage = useCallback((message) => {
    const newMessage = {
      id: Date.now(),
      user: user.username,
      text: message,
      timestamp: new Date().toISOString(),
      isPinned: false,
    };

    socket.emit('send_message', {
      server: currentRoom.server,
      group: currentRoom.group,
      ...newMessage,
    });
  }, [currentRoom, user.username]);

  const handlePinMessage = useCallback((messageId) => {
    const roomKey = `${currentRoom.server}-${currentRoom.group}`;
    const message = messageHistory[roomKey]?.find(msg => msg._id === messageId);
    
    if (message) {
      const newPinnedState = !message.isPinned;
      socket.emit('pin_message', {
        messageId,
        roomKey,
        isPinned: newPinnedState
      });
    }
  }, [currentRoom, messageHistory]);
  
  const getCurrentMessages = useCallback(() => {
    const roomKey = `${currentRoom.server}-${currentRoom.group}`;
    return messageHistory[roomKey] || [];
  }, [currentRoom, messageHistory]);

  if (!user.isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="app-container">
      <List
        username={user.username}
        onServerChange={(server) => {
          handleRoomChange(server);
          setIsSidebarOpen(false);
        }}
        onGroupChange={(group) => {
          handleRoomChange(currentRoom.server, group);
          setIsSidebarOpen(false);
        }}
        currentServer={currentRoom.server}
        currentGroup={currentRoom.group}
        socket={socket}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
       <Chat
        username={user.username}
        messages={getCurrentMessages()}
        onNewMessage={handleNewMessage}
        currentServer={currentRoom.server}
        currentGroup={currentRoom.group}
        onPinMessage={handlePinMessage}
        // Add these new props
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />
    </div>
  );
}

export default App;
