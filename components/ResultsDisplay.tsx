import React from 'react';
import { ScrapeResult, ProcessStatus } from '../types';
import { exportToXlsx } from '../utils/export';
import { DownloadIcon, CheckCircleIcon, XCircleIcon, LinkIcon, RefreshIcon, StopCircleIcon } from './icons';

interface ResultsDisplayProps {
  results: ScrapeResult[];
  status: ProcessStatus;
  processedCount: number;
  totalCount: number;
  onRelaunchFailed: () => void;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ 
  results, 
  status, 
  processedCount, 
  totalCount, 
  onRelaunchFailed 
}) => {
  if (status === ProcessStatus.Idle) {
    return null;
  }

  const progressPercentage = totalCount > 0 ? (processedCount / totalCount) * 100 : 0;
  const hasErrors = results.some(r => r.status === 'error');

  return (
    <div className="space-y-6">
      {/* Progress Card */}
      <div className="bg-gradient-to-br from-slate-800/60 to-slate-800/40 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-slate-700/50">
        <div className="flex items-center gap-3 mb-6">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${
            status === ProcessStatus.Stopped 
              ? 'bg-gradient-to-br from-yellow-500 to-yellow-600 shadow-yellow-500/25' 
              : status === ProcessStatus.Finished
              ? 'bg-gradient-to-br from-green-500 to-green-600 shadow-green-500/25'
              : 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-blue-500/25 animate-pulse'
          }`}>
            {status === ProcessStatus.Running ? (
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" />
            ) : status === ProcessStatus.Finished ? (
              <CheckCircleIcon className="w-6 h-6 text-white" />
            ) : (
              <StopCircleIcon className="w-6 h-6 text-white" />
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white">
              {status === ProcessStatus.Running ? 'Extraction en cours...' : 
               status === ProcessStatus.Finished ? 'Extraction terminée' : 
               'Extraction arrêtée'}
            </h2>
            <p className="text-sm text-slate-400">
              {processedCount} / {totalCount} ISINs traités
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="relative w-full h-3 bg-slate-700/50 rounded-full overflow-hidden backdrop-blur-sm">
            <div
              className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ease-out ${
                status === ProcessStatus.Stopped 
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-500' 
                  : 'bg-gradient-to-r from-green-400 via-blue-500 to-purple-500'
              }`}
              style={{ width: `${progressPercentage}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse" />
            </div>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">{Math.round(progressPercentage)}% complété</span>
            <span className="text-slate-400">
              {status === ProcessStatus.Running ? 'En traitement...' : 'Terminé'}
            </span>
          </div>
        </div>

        {status === ProcessStatus.Finished && (
          <div className="mt-6 p-4 bg-green-900/30 border border-green-700/50 rounded-xl flex items-center gap-3 backdrop-blur-sm">
            <CheckCircleIcon className="h-6 w-6 text-green-400 flex-shrink-0"/>
            <p className="text-green-300 text-sm">
              Extraction terminée avec succès ! Vous pouvez maintenant télécharger les résultats.
            </p>
          </div>
        )}

        {status === ProcessStatus.Stopped && (
          <div className="mt-6 p-4 bg-yellow-900/30 border border-yellow-700/50 rounded-xl flex items-center gap-3 backdrop-blur-sm">
            <StopCircleIcon className="h-6 w-6 text-yellow-400 flex-shrink-0"/>
            <p className="text-yellow-300 text-sm">
              Extraction arrêtée par l'utilisateur. Les résultats partiels sont disponibles.
            </p>
          </div>
        )}
      </div>

      {/* Results Table */}
      {results.length > 0 && (
        <div className="bg-gradient-to-br from-slate-800/60 to-slate-800/40 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700/50 overflow-hidden">
          <div className="p-6 border-b border-slate-700/50">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Données Extraites</h2>
                <p className="text-sm text-slate-400">{results.length} résultats disponibles</p>
              </div>
              
              <div className="flex flex-wrap gap-3">
                {(status === ProcessStatus.Finished || status === ProcessStatus.Stopped) && hasErrors && (
                  <button
                    onClick={onRelaunchFailed}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-xl shadow-lg text-white bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-orange-500 transition-all duration-300 transform hover:scale-105 hover:shadow-orange-500/25"
                  >
                    <RefreshIcon className="-ml-1 mr-2 h-5 w-5" />
                    Relancer les échecs
                  </button>
                )}
                <button
                  onClick={() => exportToXlsx(results)}
                  disabled={status === ProcessStatus.Running}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-xl shadow-lg text-white bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-green-500 disabled:from-slate-600 disabled:to-slate-600 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 hover:shadow-green-500/25 disabled:hover:scale-100"
                >
                  <DownloadIcon className="-ml-1 mr-2 h-5 w-5" />
                  Télécharger Excel
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-700/50">
              <thead className="bg-slate-800/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">ISIN</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Entreprise</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Haut 1A</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Bas 1A</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30">
                {results.map((result, index) => (
                  <tr
                    key={`${result.isin}-${index}`}
                    className={`transition-colors duration-200 ${
                      result.status === 'error'
                        ? 'bg-red-900/10'
                        : 'hover:bg-slate-700/30'
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap align-top">
                      {result.status === 'success' ? (
                        <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                          <CheckCircleIcon className="h-5 w-5 text-green-400" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
                          <XCircleIcon className="h-5 w-5 text-red-400" />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-slate-300 align-top">{result.isin}</td>
                    
                    {result.status === 'success' ? (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{result.companyName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-400 font-semibold">{result.high1y}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{result.high1yDate}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-400 font-semibold">{result.low1y}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{result.low1yDate}</td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">N/A</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">N/A</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">N/A</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">N/A</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">N/A</td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultsDisplay;