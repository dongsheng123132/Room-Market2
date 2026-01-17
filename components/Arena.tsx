import React, { useState, useEffect } from 'react';
import { Market, Player } from '../types';
import { MousePointer2, Timer, Zap, Loader2, Trophy, ShieldCheck, Server, RotateCcw } from 'lucide-react';
import { sendTransaction, isDemoAddress } from '../services/web3';
import { MOCK_DELAY_MS } from '../constants';

interface ArenaProps {
  market: Market;
  player: Player | undefined;
  onJoin: () => void;
  onUpdateScore: (score: number) => void;
}

type GameStatus = 'IDLE' | 'PLAYING' | 'SETTLING' | 'RESULT';

const Arena: React.FC<ArenaProps> = ({ market, player, onJoin, onUpdateScore }) => {
  const [status, setStatus] = useState<GameStatus>('IDLE');
  const [timeLeft, setTimeLeft] = useState(15);
  const [localScore, setLocalScore] = useState(0);
  const [pendingTx, setPendingTx] = useState(false);
  const [txStatus, setTxStatus] = useState('');
  
  // Oracle Result State
  const [rank, setRank] = useState(0);
  const [prize, setPrize] = useState(0);
  const [verificationStep, setVerificationStep] = useState(0); // 0: Upload, 1: Node 1, 2: Node 2, 3: Consensus

  useEffect(() => {
    if (status === 'PLAYING' && timeLeft > 0) {
      const timer = setInterval(() => {
          setTimeLeft(t => t - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (status === 'PLAYING' && timeLeft === 0) {
      finishGame();
    }
  }, [status, timeLeft]);

  const finishGame = async () => {
    setStatus('SETTLING');
    onUpdateScore(localScore);
    
    // Simulate Decentralized Oracle Steps
    setVerificationStep(0); // Uploading
    await new Promise(r => setTimeout(r, 800));
    
    setVerificationStep(1); // Node A verifying
    await new Promise(r => setTimeout(r, 800));
    
    setVerificationStep(2); // Node B verifying
    await new Promise(r => setTimeout(r, 800));
    
    setVerificationStep(3); // Consensus Reached
    await new Promise(r => setTimeout(r, 600));

    const calculatedRank = localScore > 100 ? 1 : Math.floor(Math.random() * 10) + 1;
    const calculatedPrize = calculatedRank === 1 ? market.totalPool * 0.8 : 0;
    
    setRank(calculatedRank);
    setPrize(calculatedPrize);
    setStatus('RESULT');
  };

  const handleJoin = async () => {
    setPendingTx(true);
    setTxStatus('请确认支付...');

    const accounts = await (window as any).ethereum?.request({ method: 'eth_accounts' });
    const currentAccount = accounts?.[0] || "Demo";

    if (!isDemoAddress(currentAccount)) {
        const success = await sendTransaction(market.creator, market.entryFee);
        if (!success) {
            setPendingTx(false);
            setTxStatus('');
            return;
        }
        setTxStatus('交易确认中...');
    } else {
        await new Promise(r => setTimeout(r, MOCK_DELAY_MS));
    }
    
    onJoin();
    setPendingTx(false);
    setStatus('PLAYING');
    setTimeLeft(15);
    setLocalScore(0);
  };

  const handleClick = (e: React.MouseEvent) => {
    if (status !== 'PLAYING') return;
    setLocalScore(s => s + 1);
  };
  
  const handleReset = () => {
      setStatus('IDLE');
      setTimeLeft(15);
      setLocalScore(0);
      setVerificationStep(0);
  };

  // 1. IDLE STATE
  if (status === 'IDLE' && !player) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-8 animate-in zoom-in duration-300">
        <h1 className="text-4xl md:text-6xl font-black text-center neon-text">
          {market.title}
        </h1>
        <div className="flex flex-col items-center gap-2">
            <div className="text-2xl text-slate-400">入场费: <span className="text-white font-mono">{market.entryFee} MON</span></div>
            <div className="flex gap-2">
                <div className="bg-slate-800 px-3 py-1 rounded text-xs text-yellow-300 flex items-center gap-1 border border-slate-700">
                    <Trophy size={12} /> 赢家通吃
                </div>
                <div className="bg-slate-800 px-3 py-1 rounded text-xs text-blue-300 flex items-center gap-1 border border-slate-700">
                    <ShieldCheck size={12} /> 三方仲裁保护
                </div>
            </div>
        </div>
        
        <button
          onClick={handleJoin}
          disabled={pendingTx}
          className="group relative px-12 py-6 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full font-black text-2xl hover:scale-105 transition-all active:scale-95 shadow-xl shadow-purple-900/40 disabled:opacity-70 disabled:cursor-wait"
        >
          {pendingTx ? (
            <span className="flex items-center gap-2"><Loader2 className="animate-spin" /> {txStatus || '链上交互中...'}</span>
          ) : (
            <span className="flex items-center gap-2">🔥 支付并开始挑战 <Zap className="group-hover:text-yellow-300 transition-colors" /></span>
          )}
        </button>
      </div>
    );
  }
  
  if (status === 'IDLE' && player) {
       setStatus('PLAYING');
  }

  // 3. SETTLING STATE (ARBITRATION SIMULATION)
  if (status === 'SETTLING') {
      return (
          <div className="flex flex-col items-center justify-center h-full space-y-8 animate-in fade-in">
              <div className="relative">
                  <Server size={80} className={`text-slate-600 transition-colors duration-500 ${verificationStep >= 1 ? 'text-blue-500' : ''}`} />
                  {verificationStep >= 3 && <ShieldCheck size={40} className="absolute -bottom-2 -right-2 text-green-400 animate-in zoom-in" />}
              </div>
              
              <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold">正在进行三方仲裁...</h2>
                  <div className="flex flex-col gap-2 text-sm font-mono text-slate-400 bg-slate-900 p-4 rounded-lg border border-slate-800 w-80">
                      <div className="flex justify-between items-center">
                          <span>1. 上传成绩 (Client)</span>
                          {verificationStep >= 0 && <span className="text-green-500">Done</span>}
                      </div>
                      <div className="flex justify-between items-center">
                          <span>2. 节点 A 验证 (Oracle)</span>
                          {verificationStep === 1 && <Loader2 size={12} className="animate-spin" />}
                          {verificationStep > 1 && <span className="text-green-500">Verified</span>}
                      </div>
                      <div className="flex justify-between items-center">
                          <span>3. 节点 B 验证 (Oracle)</span>
                          {verificationStep === 2 && <Loader2 size={12} className="animate-spin" />}
                          {verificationStep > 2 && <span className="text-green-500">Verified</span>}
                      </div>
                      <div className="flex justify-between items-center border-t border-slate-700 pt-2 mt-2">
                          <span>智能合约最终共识</span>
                          {verificationStep === 3 ? <span className="text-purple-400 font-bold">CONFIRMED</span> : <span className="text-slate-600">Pending</span>}
                      </div>
                  </div>
              </div>
          </div>
      );
  }

  // 4. RESULT STATE
  if (status === 'RESULT') {
      return (
          <div className="flex flex-col items-center justify-center h-full space-y-8 animate-in zoom-in">
              <div className="relative">
                  <div className="absolute inset-0 bg-yellow-500/20 blur-3xl rounded-full"></div>
                  <Trophy size={100} className={rank === 1 ? "text-yellow-400 drop-shadow-lg" : "text-slate-600"} />
              </div>
              
              <div className="text-center space-y-2">
                  <h2 className="text-4xl font-bold">{rank === 1 ? "恭喜夺冠! 🎉" : "挑战完成"}</h2>
                  <p className="text-slate-400">经三方节点确认，您的手速 (CPS) 为: <span className="text-white font-mono text-xl">{(localScore / 15).toFixed(1)}</span></p>
              </div>

              <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 w-full max-w-md">
                   <div className="flex justify-between items-center mb-4">
                      <span className="text-slate-400">获得奖励</span>
                      <span className="text-2xl font-bold text-green-400 font-mono">{prize} MON</span>
                  </div>
                  <div className="text-xs text-center text-slate-500">
                      * 奖励已由智能合约自动分发
                  </div>
              </div>

              <button 
                onClick={handleReset}
                className="flex items-center gap-2 px-8 py-3 bg-slate-700 hover:bg-slate-600 rounded-full font-bold transition-colors"
              >
                  <RotateCcw size={18} /> 再次挑战
              </button>
          </div>
      );
  }

  // 2. PLAYING STATE
  return (
    <div className="flex flex-col items-center justify-center h-full relative overflow-hidden select-none">
      {/* Background Pulse */}
      <div className="absolute inset-0 bg-red-600/5 animate-pulse-fast pointer-events-none" />

      <div className="z-10 text-center space-y-8">
        <div className="flex items-center justify-center gap-8">
            <div className="flex flex-col items-center">
                <span className="text-slate-500 text-sm">剩余时间</span>
                <div className="flex items-center gap-2 text-5xl font-mono font-bold">
                    <Timer className={timeLeft < 5 ? "text-red-500 animate-bounce" : "text-white"} size={40} />
                    <span>{timeLeft}s</span>
                </div>
            </div>
            <div className="flex flex-col items-center">
                <span className="text-slate-500 text-sm">得分</span>
                <div className="text-5xl font-mono font-black text-yellow-400">
                    {localScore}
                </div>
            </div>
        </div>

        <button
          onMouseDown={handleClick} // Better responsiveness than onClick
          className={`
            w-72 h-72 rounded-full border-8 border-white/10 flex flex-col items-center justify-center
            transition-all duration-75 touch-manipulation
            bg-gradient-to-br from-red-500 to-orange-600 active:scale-95 active:bg-red-400 cursor-pointer shadow-[0_0_60px_rgba(239,68,68,0.6)] hover:shadow-[0_0_80px_rgba(239,68,68,0.8)]
          `}
        >
          <MousePointer2 size={80} className="mb-4 animate-bounce" />
          <span className="text-xl font-bold uppercase tracking-widest opacity-80">点击! 点击!</span>
        </button>

        <div className="text-xl font-bold text-purple-300 animate-pulse">
            疯狂点击屏幕 !!!
        </div>
      </div>
    </div>
  );
};

export default Arena;