import React from 'react';
import { ScrapeResult, ProcessStatus } from '../types';

interface StatsCardsProps {
  results: ScrapeResult[];
  processedCount: number;
  totalCount: number;
  status: ProcessStatus;
}

const StatsCards: React.FC<StatsCardsProps> = ({ results, processedCount, totalCount, status }) => {
  const successCount = results.filter(r => r.status === 'success').length;
  const errorCount = results.filter(r => r.status === 'error').length;
  const progressPercentage = totalCount > 0 ? (processedCount / totalCount) * 100 : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* Total Card */}
      <div className="bg-gradient-to-br from-slate-800/50 to-slate-800/30 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50 shadow-xl transform transition-all duration-300 hover:scale-105 hover:border-blue-500/50">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wide">Total</h3>
          <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        </div>
        <p className="text-3xl font-bold text-white mb-1">{totalCount}</p>
        <p className="text-xs text-slate-500">ISINs à traiter</p>
      </div>

      {/* Processed Card */}
      <div className="bg-gradient-to-br from-slate-800/50 to-slate-800/30 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50 shadow-xl transform transition-all duration-300 hover:scale-105 hover:border-purple-500/50">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wide">Traités</h3>
          <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        </div>
        <p className="text-3xl font-bold text-white mb-1">{processedCount}</p>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 to-purple-400 transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <span className="text-xs text-slate-500">{Math.round(progressPercentage)}%</span>
        </div>
      </div>

      {/* Success Card */}
      <div className="bg-gradient-to-br from-slate-800/50 to-slate-800/30 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50 shadow-xl transform transition-all duration-300 hover:scale-105 hover:border-green-500/50">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wide">Succès</h3>
          <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        <p className="text-3xl font-bold text-green-400 mb-1">{successCount}</p>
        <p className="text-xs text-slate-500">Extractions réussies</p>
      </div>

      {/* Errors Card */}
      <div className="bg-gradient-to-br from-slate-800/50 to-slate-800/30 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50 shadow-xl transform transition-all duration-300 hover:scale-105 hover:border-red-500/50">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wide">Erreurs</h3>
          <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        <p className="text-3xl font-bold text-red-400 mb-1">{errorCount}</p>
        <p className="text-xs text-slate-500">Échecs d'extraction</p>
      </div>
    </div>
  );
};

export default StatsCards;