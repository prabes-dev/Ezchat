import { useState } from 'react';
import { ChevronDown, User, Globe, Circle, X } from 'lucide-react';


const servers = {
  'US': { name: 'United States', icon: '🇺🇸' },
  'UK': { name: 'United Kingdom', icon: '🇬🇧' },
  'IN': { name: 'Nepal', icon: '🇳🇵' },
  'JP': { name: 'Japan', icon: '🇯🇵' },
  'AU': { name: 'Australia', icon: '🇦🇺' },
};

export const List = ({ 
  username, 
  onServerChange, 
  currentServer, 
  onlineUsers = [],
  isOpen,
  onClose
}) => {
  const [showServerList, setShowServerList] = useState(false);

  const handleServerChange = (server) => {
    if (servers[server]) {
      onServerChange(server);
      setShowServerList(false);
      if (window.innerWidth < 640) {
        onClose?.();
      }
    }
  };
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 sm:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      
      <div className={`
        fixed sm:relative
        inset-y-0 left-0
        h-screen
        bg-gray-900 text-gray-200 border-r border-gray-700/50
        flex flex-col
        transform transition-transform duration-300 ease-in-out
        w-[260px] sm:w-64 
        z-30 shadow-lg
        ${isOpen ? 'translate-x-0' : '-translate-x-full sm:translate-x-0'}
      `}>

        <div className="p-4 border-b border-gray-700/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center shadow-md">
              <User className="w-5 h-5 text-white/90" />
            </div>
            <div className="flex-1 overflow-hidden">
              <h2 className="text-base font-semibold text-gray-100 truncate">{username || 'Guest'}</h2>
              <p className="text-xs text-green-400 flex items-center gap-1">
                <Circle className="w-2 h-2 fill-current" /> Online
              </p>
            </div>
          </div>
          {/* Close button for mobile */}
          <button 
            onClick={onClose}
            className="sm:hidden p-1.5 -mr-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3 border-b border-gray-700/50">
          <button
            className="flex items-center justify-between w-full p-2 cursor-pointer rounded-md hover:bg-gray-700/50 transition text-left"
            onClick={() => setShowServerList(!showServerList)}
            aria-expanded={showServerList}
            aria-controls="server-list"
          >
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <span className="text-sm sm:text-base font-medium truncate">{servers[currentServer]?.name || 'Select Server'}</span>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${showServerList ? 'rotate-180' : ''}`}
            />
          </button>

          {showServerList && (
            <div id="server-list" className="mt-2 bg-gray-800 rounded-md shadow-md overflow-hidden ring-1 ring-black/5">
              {Object.entries(servers).map(([code, { name, icon }]) => (
                <button
                  key={code}
                  onClick={() => handleServerChange(code)}
                  className={`w-full text-left flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-indigo-600/30 transition text-sm ${currentServer === code ? 'bg-indigo-600/50 text-white' : 'text-gray-300 hover:text-white'}`}
                >
                  <span className="text-lg">{icon}</span>
                  <span>{name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        
        <div className="flex-1 p-3 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-800">
          <h3 className="text-xs font-semibold text-gray-400 uppercase mb-3 px-1 tracking-wider">
            Online — {onlineUsers.length}
          </h3>
          <div className="flex flex-col gap-1">
            {onlineUsers.map((user, index) => (
              <div
                // Use index as key only if users don't have unique IDs and list isn't reordered
                key={user.id || user.username || index} 
                className="flex items-center gap-2 p-2 rounded-md cursor-default hover:bg-gray-700/40 transition"
                title={user.username || user}
              >
                <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-medium text-gray-300">{ (user.username || user).substring(0, 1).toUpperCase() }</span>
                </div>
                <span className="text-sm text-gray-300 font-medium truncate">{user.username || user}</span>
                <Circle className="w-2 h-2  text-green-500 ml-auto flex-shrink-0 fill-current" />
              </div>
            ))}
            {onlineUsers.length === 0 && (
              <p className="text-sm text-gray-500 px-2 py-1">No users online.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default List;
