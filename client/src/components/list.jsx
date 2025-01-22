import React, { useState, useEffect } from 'react';
import { Hash, ChevronDown, User, Globe, Circle } from 'lucide-react';

const servers = {
  'US': { name: 'United States', groups: ['General'] },
  'UK': { name: 'United Kingdom', groups: ['General'] },
  'IN': { name: 'India', groups: ['General'] },
  'JP': { name: 'Japan', groups: ['General'] },
  'AU': { name: 'Australia', groups: ['General'] },
};

export const List = ({ 
  username, 
  onServerChange, 
  onGroupChange, 
  currentServer, 
  currentGroup, 
  socket,
  isOpen,
  onClose
}) => {
  const [showServerList, setShowServerList] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    if (socket) {
      socket.on('users_update', (users) => {
        setOnlineUsers(users);
      });

      return () => {
        socket.off('users_update');
      };
    }
  }, [socket]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        try {
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}`
          );
          const data = await response.json();
          const countryCode = data.countryCode;
          handleServerChange(countryCode in servers ? countryCode : 'US');
        } catch (error) {
          handleServerChange('US');
        }
      });
    }
  }, []);

  const handleServerChange = (server) => {
    if (servers[server]) {
      onServerChange(server);
      setShowServerList(false);
    }
  };

  const handleGroupChange = (group) => {
    onGroupChange(group);
    if (window.innerWidth < 640) {
      onClose?.();
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 sm:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed sm:relative
        inset-y-0 left-0
        h-screen
        bg-gray-900 text-white
        flex flex-col
        transform transition-transform duration-300 ease-in-out
        w-[280px] sm:w-64
        z-30
        ${isOpen ? 'translate-x-0' : '-translate-x-full sm:translate-x-0'}
      `}>
        {/* Profile Section */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-gray-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-medium">{username || 'Guest'}</h2>
              <p className="text-sm text-gray-400">Online</p>
            </div>
            <button 
              onClick={onClose}
              className="sm:hidden p-2 hover:bg-gray-800 rounded-full"
            >
              <ChevronDown className="w-5 h-5 rotate-90" />
            </button>
          </div>
        </div>

        {/* Server Selection */}
        <div className="p-4 border-b border-gray-700">
          <div
            className="flex items-center justify-between p-2 cursor-pointer rounded-md hover:bg-gray-700 transition"
            onClick={() => setShowServerList(!showServerList)}
          >
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-gray-400" />
              <span className="text-sm sm:text-base">{servers[currentServer].name}</span>
            </div>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${
                showServerList ? 'rotate-180' : ''
              }`}
            />
          </div>

          {showServerList && (
            <div className="mt-2 bg-gray-800 rounded-md overflow-hidden">
              {Object.entries(servers).map(([code, { name }]) => (
                <div
                  key={code}
                  onClick={() => handleServerChange(code)}
                  className={`p-2 cursor-pointer hover:bg-gray-600 ${
                    currentServer === code ? 'bg-gray-600' : ''
                  }`}
                >
                  {name}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Groups */}
        <div className="flex-initia p-4 overflow-y-auto">
          <h3 className="text-sm font-semibold text-gray-400 uppercase mb-2">
            Channels
          </h3>
          <div className="flex flex-col gap-1">
            {servers[currentServer].groups.map((group) => (
              <div
                key={group}
                onClick={() => handleGroupChange(group)}
                className={`flex items-center gap-2 p-2 cursor-pointer rounded-md hover:bg-gray-700 transition ${
                  currentGroup === group ? 'bg-gray-800' : ''
                }`}
              >
                <Hash className="w-4 h-4 text-gray-400" />
                <span className="text-sm sm:text-base">{group}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Online Users */}
        <div className="p-4 border-t  border-gray-700 ">
          <h3 className="text-sm font-semibold text-gray-400 uppercase mb-3">
            Online — {onlineUsers.length}
          </h3>
          <div className="flex flex-col gap-2">
            {onlineUsers.map((user) => (
              <div
                key={user}
                className="flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-gray-700 transition"
              >
                <Circle className="w-2 h-2 text-green-500" />
                <span className="text-sm text-green-600 font-medium">{user}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default List;