import React, { useState } from 'react';
import { Market, Player } from '../types';
import { sendTransaction, isDemoAddress } from '../services/web3';
import { MOCK_DELAY_MS } from '../constants';
import { Gift, Coins, Loader2, PartyPopper } from 'lucide-react';

interface RedPacketProps {
  market: Market;
  onGrab: (amount: number) => void;
  players: Player[];
}

const RedPacket: React.FC<RedPacketProps> = ({ market, onGrab, players }) => {
  const [opening, setOpening] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  
  const myGrab = players.find(p => p.address === "ME" || p.betAmount === -1); // specific logic would check actual address

  const handleOpen = async () => {
    setOpening(true);

    const accounts = await (window as any).ethereum?.request({ method: 'eth_accounts' });
    const currentAccount = accounts?.[0] || "Demo";

    // Payment Logic (Pay entry fee to grab)
    if (market.entryFee > 0 && !isDemoAddress(currentAccount)) {
        const success = await sendTransaction(market.creator, market.entryFee);
        if (!success) {
            setOpening(false);
            return;
        }
    } else {
        await new Promise(r => setTimeout(r, MOCK_DELAY_MS));
    }

    // Simulate On-chain Randomness (VRF)
    // In real contract: uint amount = (randomness % remaining_pool)
    const randomAmount = (Math.random() * (market.totalPool / 5)).toFixed(2);
    const amount = parseFloat(randomAmount);
    
    setResult(amount);
    onGrab(amount);
    setOpening(false);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full animate-in zoom-in duration-300">
      <div className={`relative w-80 h-[450px] bg-red-600 rounded-3xl shadow-2xl overflow-hidden flex flex-col items-center border-4 border-yellow-500 transition-all ${opening ? 'scale-105' : ''}`}>
        
        {/* Top Arch */}
        <div className="absolute top-0 w-[150%] h-48 bg-red-700 rounded-b-[100%] shadow-lg -translate-y-20 z-10"></div>
        
        {/* Content */}
        <div className="z-20 mt-16 text-center text-yellow-100 px-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Gift size={24} />
            <span className="font-bold">链上拼手气红包</span>
          </div>
          <h2 className="text-2xl font-bold leading-tight mb-4">{market.title}</h2>
          
          <div className="text-sm opacity-80 mb-8">
            发起人: {market.creator.slice(0,6)}...
            <br />
            {market.entryFee === 0 ? (
                <span className="bg-yellow-400 text-red-900 px-2 py-1 rounded font-bold text-xs mt-1 inline-block">无需门票 (Gas Only)</span>
            ) : (
                <>入场费: {market.entryFee} MON</>
            )}
          </div>
        </div>

        {/* The Button */}
        <div className="z-20 mt-auto mb-16">
          {!result ? (
            <button 
                onClick={handleOpen}
                disabled={opening}
                className={`w-24 h-24 rounded-full bg-yellow-400 border-4 border-yellow-200 shadow-[0_0_20px_rgba(250,204,21,0.6)] flex items-center justify-center text-red-600 font-black text-4xl transition-all hover:scale-110 active:scale-95 ${opening ? 'animate-[spin_1s_linear_infinite]' : ''}`}
            >
                {opening ? <Loader2 size={40} /> : "抢"}
            </button>
          ) : (
            <div className="text-center animate-in zoom-in">
                <div className="text-yellow-300 text-lg font-bold mb-1">恭喜抢到</div>
                <div className="text-5xl font-black text-white drop-shadow-md">{result} <span className="text-xl">MON</span></div>
            </div>
          )}
        </div>

        {/* Bottom Decoration */}
        <div className="absolute bottom-0 w-full p-4 bg-red-800/30 text-center text-xs text-red-200 z-10">
            {players.length} 人已领取 • 剩余奖池 {(market.totalPool).toFixed(1)} MON
        </div>
      </div>

      {result && (
         <div className="mt-8 text-center animate-in slide-in-from-bottom-4">
             <div className="flex items-center gap-2 justify-center text-green-400 mb-2">
                 <PartyPopper /> <span>交易已确认 (Hash: 0x8a...2b)</span>
             </div>
             <p className="text-slate-400 text-sm">不可抵赖：资产已直接划转至您的钱包</p>
         </div>
      )}
    </div>
  );
};

export default RedPacket;
