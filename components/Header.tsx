import React from 'react';
import { ChartBarIcon } from './icons';

const Header: React.FC = () => {
  return (
    <header className="mb-12">
      <div className="text-center space-y-6">
        {/* Logo & Title */}
        <div className="flex items-center justify-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 blur-2xl opacity-50 animate-pulse"></div>
            <div className="relative w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/50 transform hover:scale-110 transition-all duration-300">
              <ChartBarIcon className="w-10 h-10 text-white" />
            </div>
          </div>
        </div>

        <div>
          <h1 className="text-5xl md:text-6xl font-bold mb-3">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient">
              Boursier Data Scraper
            </span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Extraction automatisée de données boursières en temps réel
          </p>
        </div>

        {/* Features Pills */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <div className="bg-slate-800/50 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-700/50 flex items-center gap-2 hover:border-blue-500/50 transition-all duration-300">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-slate-300">Direct Scrape</span>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-700/50 flex items-center gap-2 hover:border-pink-500/50 transition-all duration-300">
            <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-slate-300">Export Excel</span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes gradient {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </header>
  );
};

export default Header;