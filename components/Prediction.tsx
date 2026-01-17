import React, { useState } from 'react';
import { Market } from '../types';
import { sendTransaction, isDemoAddress } from '../services/web3';
import { MOCK_DELAY_MS } from '../constants';
import { TrendingUp, CheckCircle, Wallet, Loader2 } from 'lucide-react';

interface PredictionProps {
  market: Market;
  onBet: (optionIdx: number, amount: number) => void;
  optionsPools: number[];
}

const Prediction: React.FC<PredictionProps> = ({ market, onBet, optionsPools }) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [amount, setAmount] = useState<number>(market.entryFee);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>(''); // For UX feedback
  const [success, setSuccess] = useState(false);

  const handleBet = async () => {
    if (selectedOption === null) return;
    setLoading(true);
    setStatus('请在钱包中确认交易...');

    // 1. Get current user address from window (or passed prop, but window is safer for direct tx)
    const accounts = await (window as any).ethereum?.request({ method: 'eth_accounts' });
    const currentAccount = accounts?.[0] || "Demo";

    if (!isDemoAddress(currentAccount)) {
        // Real Transaction
        const txSuccess = await sendTransaction(market.creator, amount);
        if (!txSuccess) {
            setLoading(false);
            setStatus('交易取消或失败');
            return;
        }
        setStatus('交易已广播，等待确认...');
    } else {
        // Demo Mode Simulation
        await new Promise(r => setTimeout(r, MOCK_DELAY_MS));
    }

    // 2. UI Update
    onBet(selectedOption, amount);
    setLoading(false);
    setSuccess(true);
    setStatus('');
    setTimeout(() => setSuccess(false), 2000);
  };

  const totalPool = optionsPools.reduce((a, b) => a + b, 0);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-2">{market.title}</h1>
      <div className="flex items-center gap-4 text-slate-400 mb-8">
        <span>当前奖池: <span className="text-green-400 font-mono">{market.totalPool.toFixed(1)} MON</span></span>
        <span>•</span>
        <span>结束时间: 10分钟后</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {market.options.map((option, idx) => {
          const pool = optionsPools[idx] || 0;
          const percentage = totalPool > 0 ? (pool / totalPool) * 100 : 0;
          const odds = pool > 0 ? (totalPool / pool).toFixed(2) : '2.00';

          return (
            <button
              key={idx}
              onClick={() => setSelectedOption(idx)}
              className={`relative p-6 rounded-xl border-2 text-left transition-all hover:scale-[1.02]
                ${selectedOption === idx 
                  ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20' 
                  : 'border-slate-700 bg-slate-800 hover:border-slate-600'}
              `}
            >
              <div className="flex justify-between items-start mb-4">
                <span className="font-bold text-lg">{option}</span>
                <span className="bg-slate-700 text-xs px-2 py-1 rounded text-blue-300">赔率 {odds}x</span>
              </div>
              
              <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden mb-2">
                <div 
                  className="bg-blue-500 h-full transition-all duration-500" 
                  style={{ width: `${percentage}%` }} 
                />
              </div>
              <div className="text-xs text-slate-400 flex justify-between">
                <span>{pool.toFixed(1)} MON</span>
                <span>{percentage.toFixed(0)}%</span>
              </div>
            </button>
          );
        })}
      </div>

      {selectedOption !== null && (
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-slate-900 border-t border-slate-700 animate-in slide-in-from-bottom-full z-50">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex-1 w-full">
              <div className="text-sm text-slate-400 mb-1">投注金额 (MON)</div>
              <input 
                type="number" 
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white font-mono"
              />
            </div>
            <button
              onClick={handleBet}
              disabled={loading}
              className={`w-full md:w-auto px-8 py-4 rounded-xl font-bold text-xl flex items-center gap-2 justify-center transition-all
                ${success ? 'bg-green-600' : 'bg-blue-600 hover:bg-blue-500'}
                ${loading ? 'opacity-80 cursor-wait' : ''}
              `}
            >
              {loading ? (
                  <><Loader2 className="animate-spin" /> {status || '处理中...'}</>
              ) : success ? (
                  <><CheckCircle /> 投注成功!</>
              ) : (
                  <><Wallet size={20} /> 确认投注</>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Prediction;