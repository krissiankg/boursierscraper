
import React, { useState } from 'react';
import { PlayIcon, SpinnerIcon, StopIcon } from './icons';

interface IsinFormProps {
  onScrape: (isins: string[]) => void;
  onStop: () => void;
  isRunning: boolean;
}

// FIX: Updated to the full list of 162 ISINs provided by the user.
const defaultIsins = [
  'FR0011040500', 'FR0010557264', 'FR0004040608', 'FR0000120404', 'FR0011184241', 'FR0010340141', 
  'FR001400J770', 'NL0000235190', 'FR0000053027', 'FR0010220475', 'FR0000053837', 'FR0000033219', 
  'FR0000071946', 'FR0004125920', 'FR0010481960', 'FR0010313833', 'FR0000074783', 'FR0000074148', 
  'FR001400X2S4', 'FR0000063737', 'FR001400CFI7', 'FR0000120628', 'FR0013258662', 'FR0000035370', 
  'FR0000035164', 'FR0000120966', 'FR0000074072', 'FR0013280286', 'FR0000131104', 'FR0000061129', 
  'FR0000039299', 'FR0000063935', 'FR0000120503', 'FR0006174348', 'FR0000125338', 'FR0010828137', 
  'FR0000120172', 'FR001400OKR3', 'FR0010193052', 'FR0000053506', 'FR0000130403', 'FR0000053324', 
  'FR0000064446', 'FR0013426004', 'FR0010386334', 'FR0010667147', 'FR0000064578', 'FR0000045072', 
  'FR0000120644', 'FR0014004L86', 'FR0010417345', 'FR0010908533', 'FR0000130452', 'FR0011466069', 
  'FR0011950732', 'FR0012435121', 'FR001400NLM4', 'FR0010208488', 'FR0000131757', 'FR0000121667', 
  'FR0000121121', 'FR0014008VX5', 'FR0014000MR3', 'NL0006294274', 'FR0010490920', 'FR0010221234', 
  'FR0000062671', 'FR001400Q9V2', 'FR0013451333', 'FR001400SU99', 'FR0000121147', 'FR0010040865', 
  'FR0004163111', 'FR0010533075', 'FR0011726835', 'FR0000032526', 'FR0000066750', 'FR0000052292', 
  'FR0000035081', 'FR0000120859', 'FR0000071797', 'FR0010331421', 'FR0013233012', 'FR0010259150', 
  'FR0000073298', 'FR0000077919', 'FR0000121485', 'FR0000121485', 'FR0000121964', 'FR0013030152', 
  'FR0010307819', 'FR0000120321', 'FR0000038242', 'FR0000121014', 'FR0000053225', 'FR0013153541', 
  'FR0000060878', 'FR0000051070', 'FR0004065605', 'FR0010298620', 'FR0010241638', 'FR0000039620', 
  'FR0000121261', 'FR0013482791', 'FR0011341205', 'FR0000044448', 'FR0010112524', 'FI0009000681', 
  'FR0000124570', 'FR0000133308', 'FR0012127173', 'FR0000120693', 'FR0000073041', 'FR0000075317', 
  'FR0000130577', 'FR0000130577', 'FR0000120560', 'FR0000130395', 'FR0000131906', 'FR0010451203', 
  'FR0000039091', 'FR0013269123', 'FR0000073272', 'FR0000125007', 'FR0000120578', 'FR0000121972', 
  'FR0010411983', 'FR0010411983', 'FR0000121709', 'FR0000039109', 'FR0010221234', 'FR0013214145', 
  'FR0000130809', 'FR0000121220', 'FR0013227113', 'FR0013379484', 'FR0000050809', 'FR0012757854', 
  'NL00150001Q9', 'NL0000226223', 'FR0000131708', 'FR0000051807', 'FR0000054900', 'FR0000121329', 
  'FR0000120271', 'FR0005691656', 'FR0000054470', 'FR0013326246', 'FR0013176526', 'FR0010095596', 
  'FR0013506730', 'FR0004056851', 'FR0000124141', 'FR0010291245', 'FR0000125486', 'FR0000031577', 
  'FR001400PVN6', 'FR0011995588', 'FR0010282822', 'FR0000121204', 'FR0011981968', 'BE0974310428'
].join(', ');

const IsinForm: React.FC<IsinFormProps> = ({ onScrape, onStop, isRunning }) => {
  const [isinInput, setIsinInput] = useState(defaultIsins);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isins = isinInput.split(/[\s,]+/).map(s => s.trim()).filter(Boolean);
    if (isins.length > 0) {
      onScrape(isins);
    }
  };

  const isinCount = isinInput.split(/[\s,]+/).filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Manual Extraction Card */}
      <div className="bg-gradient-to-br from-slate-800/60 to-slate-800/40 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-slate-700/50 transform transition-all duration-300 hover:border-blue-500/50">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
            <PlayIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Extraction Manuelle</h2>
            <p className="text-sm text-slate-400">Lancer une extraction immédiate</p>
          </div>
        </div>

        <form onSubmit={handleManualSubmit}>
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <label htmlFor="isin-input" className="text-lg font-medium text-slate-300">
                Codes ISIN
              </label>
              <div className="bg-blue-500/20 px-3 py-1 rounded-lg border border-blue-500/30">
                <span className="text-blue-300 text-sm font-semibold">{isinCount} codes</span>
              </div>
            </div>
            <p className="text-sm text-slate-400 mb-4">
              Liste pré-chargée de 162 actions françaises. Modifiez ou remplacez selon vos besoins.
            </p>
            <textarea
              id="isin-input"
              value={isinInput}
              onChange={(e) => setIsinInput(e.target.value)}
              placeholder="ex: FR0000120404, US0378331005"
              rows={8}
              className="w-full bg-slate-900/80 border border-slate-600/50 rounded-xl p-4 text-slate-200 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 font-mono text-sm backdrop-blur-sm"
              disabled={isRunning}
            />
          </div>

          <div className="flex justify-end items-center gap-4">
            {isRunning && (
              <button
                type="button"
                onClick={onStop}
                className="group relative inline-flex items-center px-6 py-3 text-base font-medium rounded-xl shadow-lg text-white bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-red-500 transition-all duration-300 transform hover:scale-105 hover:shadow-red-500/25"
              >
                <StopIcon className="-ml-1 mr-2 h-5 w-5" />
                Arrêter
              </button>
            )}
            <button
              type="submit"
              disabled={isRunning || !isinInput.trim()}
              className="group relative inline-flex items-center px-8 py-3 text-base font-medium rounded-xl shadow-lg text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-blue-500 disabled:from-slate-600 disabled:to-slate-600 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 hover:shadow-blue-500/25 disabled:hover:scale-100"
            >
              {isRunning ? (
                <>
                  <SpinnerIcon className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                  Traitement en cours...
                </>
              ) : (
                <>
                  <PlayIcon className="-ml-1 mr-2 h-5 w-5" />
                  Lancer l'extraction
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IsinForm;