import React, { useState } from 'react';
import { User, LogIn } from 'lucide-react';

export const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (username.trim()) {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      onLogin(username);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen min-h-[100dvh] h-[-webkit-fill-available] flex items-center justify-center relative p-4">
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(17,24,39,0.7),rgba(17,24,39,0.9))]" />
        <div className="absolute inset-0 backdrop-blur-[100px]" />
      </div>

      {/* Login Form Container */}
      <div className="w-full max-w-[90%] sm:max-w-md transform transition-all duration-300 ease-in-out hover:scale-[1.01] relative z-10">
        <div className="bg-white/10 rounded-2xl p-4 sm:p-8 shadow-2xl border border-white/10">
          {/* Header Section */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 mb-4 sm:mb-6 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center transform transition-transform duration-300 hover:rotate-12">
              <User className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-400 text-xs sm:text-sm">
              We're excited to see you again!
            </p>
          </div>

          {/* Form Section */}
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div>
              <label 
                htmlFor="username" 
                className="block text-xs font-medium text-gray-300 uppercase tracking-wider mb-2"
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
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-black/20 border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white placeholder-gray-500 transition-all duration-200 text-sm sm:text-base"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 sm:py-3 px-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-medium transition-all duration-200 hover:opacity-90 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              {isLoading ? (
                <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Join Chat</span>
                </>
              )}
            </button>
          </form>

          {/* Footer Section */}
          <div className="mt-6 sm:mt-8 text-center">
            <p className="text-gray-400 text-xs sm:text-sm">
              Need help?{' '}
              <a href="#" className="text-blue-400 hover:text-blue-300 transition-colors duration-200">
                Contact Support
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;