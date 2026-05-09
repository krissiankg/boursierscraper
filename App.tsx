import React, { useState, useCallback, useRef } from 'react';
import { ScrapeResult, ProcessStatus } from './types';
import Header from './components/Header';
import IsinForm from './components/IsinForm';
import ResultsDisplay from './components/ResultsDisplay';
import { fetchStockDataForIsin } from './services/scrapingService';
import StatsCards from './components/StatsCards';

const MAX_RETRIES = 3;
const DELAY_BETWEEN_ISINS_MS = 5000;
const DELAY_BETWEEN_RETRIES_MS = 1000;

const App: React.FC = () => {
  const [results, setResults] = useState<ScrapeResult[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [status, setStatus] = useState<ProcessStatus>(ProcessStatus.Idle);
  const [processedCount, setProcessedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const isStoppingRef = useRef(false);

  const handleScrape = useCallback(async (isins: string[]) => {
    isStoppingRef.current = false;
    // Keep existing results if we are relaunching failed ones
    if (status !== ProcessStatus.Running) {
      setResults([]);
    }
    setErrors([]);
    setStatus(ProcessStatus.Running);
    setProcessedCount(0);
    setTotalCount(isins.length);

    // Get the current successful results to avoid losing them
    const currentResults = results.filter(r => r.status === 'success');
    const newResults: ScrapeResult[] = [...currentResults];
    const newErrors: string[] = [];

    for (const isin of isins) {
      if (isStoppingRef.current) {
        setStatus(ProcessStatus.Stopped);
        break;
      }

      let result: ScrapeResult | null = null;
      let lastError: string | null = null;

      for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
          const data = await fetchStockDataForIsin(isin);
          result = { ...data, status: 'success' };
          break; // Success, exit retry loop
        } catch (error) {
          lastError = error instanceof Error ? error.message : String(error);
          console.warn(`Tentative ${attempt}/${MAX_RETRIES} échouée pour ${isin}: ${lastError}`);
          if (attempt < MAX_RETRIES) {
            await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_RETRIES_MS));
          }
        }
      }

      if (result) {
        newResults.push(result);
      } else {
        // All retries failed
        const finalErrorMessage = lastError || 'Une erreur inconnue est survenue';
        const fullErrorForLog = `Erreur pour ${isin}: ${finalErrorMessage}`;
        newErrors.push(fullErrorForLog);
        
        const errorResult: ScrapeResult = {
            isin,
            companyName: 'N/A',
            high1y: 'N/A',
            high1yDate: 'N/A',
            low1y: 'N/A',
            low1yDate: 'N/A',
            status: 'error',
            errorMessage: finalErrorMessage,
        };
        newResults.push(errorResult);
      }
      
      // Update state after each ISIN is fully processed (success or final failure)
      setResults([...newResults]);
      setErrors(prev => [...prev, ...newErrors]);
      setProcessedCount(prev => prev + 1);
      
      // Delay between processing different ISINs
      if (isins.indexOf(isin) < isins.length - 1) {
        await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_ISINS_MS));
      }
    }

    if (!isStoppingRef.current) {
        setStatus(ProcessStatus.Finished);
    }
  }, [results, status]);

  const handleStop = useCallback(() => {
    isStoppingRef.current = true;
    setStatus(ProcessStatus.Stopped);
  }, []);

  const handleRelaunchFailed = useCallback(() => {
    const failedIsins = results.filter(r => r.status === 'error').map(r => r.isin);
    if (failedIsins.length > 0) {
      // Keep successful results and only re-run failed ones
      const successfulResults = results.filter(r => r.status === 'success');
      setResults(successfulResults);
      handleScrape(failedIsins);
    }
  }, [results, handleScrape]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative container mx-auto p-4 md:p-8">
        <Header />
        
        {/* Statistics Cards */}
        {status !== ProcessStatus.Idle && (
          <StatsCards 
            results={results}
            processedCount={processedCount}
            totalCount={totalCount}
            status={status}
          />
        )}

        <main className="space-y-8">
          <IsinForm 
            onScrape={handleScrape} 
            onStop={handleStop}
            isRunning={status === ProcessStatus.Running}
          />
          <ResultsDisplay
            results={results}
            status={status}
            processedCount={processedCount}
            totalCount={totalCount}
            onRelaunchFailed={handleRelaunchFailed}
          />
        </main>

        <footer className="text-center text-slate-500 mt-16 py-8 border-t border-slate-800/50">
          <p className="font-medium mb-2">Powered by Aniquestore</p>
          <a 
            href="mailto:aniquestoreinfo@gmail.com" 
            className="text-slate-400 hover:text-blue-400 transition-colors duration-300"
          >
            aniquestoreinfo@gmail.com
          </a>
        </footer>
      </div>
    </div>
  );
};

export default App;