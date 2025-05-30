import { useState } from "react";
import { User, LogIn } from "lucide-react";

export const Login = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (username.trim()) {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 500));
      onLogin(username);
      setIsLoading(false);}
  };

  
  return (
    <div className="min-h-screen  flex items-center justify-center p-4 bg-gray-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black z-0"></div>
      <div className="absolute inset-0 backdrop-blur-lg z-0"></div>
      <div className="w-full max-w-sm transform transition-all duration-500 ease-out hover:scale-[1.02] relative z-10">
        <div className="bg-gray-800/60 backdrop-blur-md rounded-xl p-6 sm:p-8 shadow-xl border border-gray-700/50">
          <div className="text-center mb-6 sm:mb-8">
            <div className="mx-auto w-14 h-14 sm:w-16 sm:h-16 mb-4 sm:mb-5 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg transform transition-transform duration-300 hover:rotate-6">
              <User className="w-7 h-7 sm:w-8 sm:h-8 text-white/90" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-100 mb-1">
              Welcome Back{" "}
            </h1>
            <p className="text-gray-400 text-sm sm:text-base">
              We're excited to see you again!
            </p>
          </div>

          {/* Form Section */}
          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            <div>
              <label
                htmlFor="username"
                className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2"
              >
                Username
              </label>
              <div className="relative">
                <input
                  id="username"
                  type="text"
                  required
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-white placeholder-gray-500 transition-all duration-200 text-sm sm:text-base shadow-inner"
                  aria-label="Username input"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !username.trim()} 
              className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium transition-all duration-300 ease-in-out hover:shadow-lg hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900 flex items-center justify-center space-x-2 disabled:opacity-60 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  <span>Enter Chat</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
