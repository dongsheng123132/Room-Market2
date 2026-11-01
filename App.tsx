import React, { useState, useRef } from 'react';
import { connectWallet, shortenAddress } from './services/web3';
import Generator from './components/Generator';
import Arena from './components/Arena';
import Prediction from './components/Prediction';
import RedPacket from './components/RedPacket';
import BigScreen from './components/BigScreen';
import ShareModal from './components/ShareModal';
import { Market, Player, MarketType } from './types';
import { Wallet, Tv, ArrowLeft, TrendingUp, Clock, PlusCircle, Zap, Dice5, Trophy, Gift, Share2, QrCode } from 'lucide-react';

// Default Demo Markets (High Frequency & Interactive)
const VALID_DUMMY_ADDRESS = "0x000000000000000000000000000000000000dEaD"; 

// Generate exactly 30 generic project options
const generateProjectOptions = () => {
    return Array.from({ length: 30 }, (_, i) => `项目 #${String(i + 1).padStart(2, '0')}`);
};

const INITIAL_MARKETS: Market[] = [
  {
    id: 'arena-speed-1',
    type: MarketType.ARENA,
    title: '⚡️ 现场手速大乱斗 (15秒决胜)',
    options: [], 
    entryFee: 0.1,
    totalPool: 120.5,
    createdAt: Date.now(),
    status: 'OPEN',
    creator: VALID_DUMMY_ADDRESS
  },
  {
    id: 'red-packet-1',
    type: MarketType.RED_PACKET,
    title: '🧧 开工大吉！Monad 链上红包 (随机金额)',
    options: [],
    entryFee: 0, // 0 means Gas only
    totalPool: 100, // 100 MON in the packet
    createdAt: Date.now(),
    status: 'OPEN',
    creator: VALID_DUMMY_ADDRESS
  },
  {
    id: 'hackathon-winner-main',
    type: MarketType.PREDICTION,
    title: '🏆 谁是今晚 Monad 黑客松的最终冠军？',
    options: generateProjectOptions(),
    entryFee: 2.0,
    totalPool: 2880,
    createdAt: Date.now(),
    status: 'OPEN',
    creator: VALID_DUMMY_ADDRESS
  },
  {
    id: 'btc-hash',
    type: MarketType.PREDICTION,
    title: '🔢 BTC 下一个区块哈希尾数 (0-9) 是几？',
    options: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
    entryFee: 0.5,
    totalPool: 300,
    createdAt: Date.now(),
    status: 'OPEN',
    creator: VALID_DUMMY_ADDRESS
  }
];

function App() {
  const [account, setAccount] = useState<string | null>(null);
  const [view, setView] = useState<'HOME' | 'MARKET' | 'BIGSCREEN'>('HOME');
  
  // App State
  const [markets, setMarkets] = useState<Market[]>(INITIAL_MARKETS);
  const [activeMarketId, setActiveMarketId] = useState<string | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [showShare, setShowShare] = useState(false);

  const generatorRef = useRef<HTMLDivElement>(null);

  // Helpers
  const activeMarket = markets.find(m => m.id === activeMarketId) || null;

  const handleConnect = () => {
    const run = async () => {
      const addr = await connectWallet();
      if (addr) setAccount(addr);
    };

    if (typeof window === 'undefined' || typeof window.requestAnimationFrame === 'undefined') {
      void run();
      return;
    }

    window.requestAnimationFrame(() => {
      void run();
    });
  };

  const handleDisconnect = () => {
    setAccount(null);
    setActiveMarketId(null);
    setPlayers([]);
    setHistory([]);
    setView('HOME');
  };

  // Create Market
  const handleCreateMarket = (market: Market) => {
    setMarkets(prev => [market, ...prev]); 
    setActiveMarketId(market.id);
    setPlayers([]);
    setHistory([]);
    setView('MARKET'); 
  };

  const handleSelectMarket = (id: string) => {
    if (!account) {
        handleConnect();
    }
    setActiveMarketId(id);
    setPlayers([]);
    setHistory([]);
    setView('MARKET');
  };

  const scrollToCreate = () => {
    if (view !== 'HOME') setView('HOME');
    setTimeout(() => {
        generatorRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Interaction Handlers
  const handleJoinArena = () => {
    if (!account || !activeMarket) {
        if (!account) handleConnect();
        return;
    }
    const newPlayer: Player = { address: account, score: 0 };
    setPlayers(prev => [...prev, newPlayer]);
    
    // Update local market pool state
    setMarkets(prev => prev.map(m => m.id === activeMarket.id ? { ...m, totalPool: m.totalPool + m.entryFee } : m));
    setHistory(prev => [...prev, { timestamp: Date.now(), type: '玩家加入', data: account }]);
  };

  const handleUpdateScore = (score: number) => {
    if (!account) return;
    setPlayers(prev => prev.map(p => p.address === account ? { ...p, score } : p));
  };

  const handleBet = (optionIdx: number, amount: number) => {
    if (!account || !activeMarket) {
        if (!account) handleConnect();
        return;
    }
    const newPlayer: Player = { address: account, score: 0, betOption: optionIdx, betAmount: amount };
    setPlayers(prev => [...prev, newPlayer]);
    
    // Update local market pool state
    setMarkets(prev => prev.map(m => m.id === activeMarket.id ? { ...m, totalPool: m.totalPool + amount } : m));
    setHistory(prev => [...prev, { timestamp: Date.now(), type: `投注选项_${optionIdx}`, data: amount }]);
  };

  const handleGrabPacket = (amount: number) => {
    if (!account || !activeMarket) {
        if (!account) handleConnect();
        return;
    }
    const newPlayer: Player = { address: account, score: 0, claimedAmount: amount };
    setPlayers(prev => [...prev, newPlayer]);
    setMarkets(prev => prev.map(m => m.id === activeMarket.id ? { ...m, totalPool: Math.max(0, m.totalPool - amount) } : m));
    setHistory(prev => [...prev, { timestamp: Date.now(), type: '领取红包', data: amount }]);
  }

  // --- Views ---

  if (view === 'BIGSCREEN' && activeMarket) {
    return (
        <>
            <button onClick={() => setView('HOME')} className="fixed top-4 left-4 z-50 p-2 bg-slate-800 rounded-full opacity-50 hover:opacity-100 text-white"><ArrowLeft /></button>
            <BigScreen state={{ market: activeMarket, players, history }} />
        </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-purple-500 selection:text-white pb-20 relative">
      {/* Share Modal Overlay */}
      {showShare && activeMarket && (
        <ShareModal 
            market={activeMarket} 
            onClose={() => setShowShare(false)} 
        />
      )}

      {/* Navbar */}
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => { setView('HOME'); setActiveMarketId(null); }}>
            <div className="w-8 h-8 bg-purple-600 rounded flex items-center justify-center font-bold">R</div>
            <span className="font-bold text-xl tracking-tight">Room<span className="text-purple-400">Market</span></span>
          </div>

          <div className="flex items-center gap-4">
             <button 
                onClick={scrollToCreate}
                className="hidden md:flex items-center gap-2 px-4 py-2 text-sm bg-purple-600/20 text-purple-300 hover:bg-purple-600 hover:text-white rounded-lg border border-purple-500/50 transition-all"
             >
                <PlusCircle size={16} /> 新建玩法
             </button>

             {activeMarket && view === 'MARKET' && (
                 <>
                    <button 
                        onClick={() => setShowShare(true)}
                        className="flex items-center gap-2 px-3 py-2 text-sm bg-slate-800 hover:bg-slate-700 text-blue-400 rounded-lg border border-slate-700 transition-colors"
                    >
                        <QrCode size={16} /> <span className="hidden sm:inline">分享/大屏</span>
                    </button>
                     <button 
                        onClick={() => setView('BIGSCREEN')}
                        className="flex items-center gap-2 px-3 py-2 text-sm bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors"
                     >
                        <Tv size={16} /> <span className="hidden sm:inline">投屏模式</span>
                     </button>
                 </>
             )}

            {account ? (
              <button
                onClick={handleDisconnect}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-full border border-slate-700 font-mono text-sm hover:bg-slate-700 transition-colors"
                title="点击断开当前钱包连接"
              >
                <div className={`w-2 h-2 rounded-full animate-pulse ${account.includes('Demo') ? 'bg-yellow-500' : 'bg-green-500'}`} />
                {shortenAddress(account)}
              </button>
            ) : (
              <button
                onClick={handleConnect}
                className="flex items-center gap-2 px-6 py-2 bg-white text-slate-900 rounded-full font-bold hover:bg-slate-200 transition-colors"
              >
                <Wallet size={18} /> 连接钱包
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        
        {/* HOME VIEW: Trending Markets + Generator */}
        {view === 'HOME' && (
          <div className="space-y-16 animate-in fade-in duration-500">
            
            {/* Hero Section - UPDATED FOR PITCH */}
            <div className="text-center space-y-4 pt-10 pb-4">
              <h1 className="text-6xl md:text-8xl font-black bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400 tracking-tighter">
                Room-Market
              </h1>
              
              <p className="text-slate-200 text-2xl md:text-3xl max-w-2xl mx-auto font-bold tracking-wide">
                人人皆可做市，从一个房间开始
              </p>
              
              <div className="flex items-center justify-center gap-3 text-slate-500 text-sm font-mono mt-4 border border-slate-800 bg-slate-900/50 inline-flex px-4 py-2 rounded-full">
                 <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]"></span>
                 <span>Powered by Monad · 即时结算 · 为现场而生</span>
              </div>
            </div>

            {/* Trending Markets List */}
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center gap-2 mb-6">
                    <TrendingUp className="text-purple-400" />
                    <h2 className="text-2xl font-bold">现场热门 (Live)</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {markets.slice(0, 20).map((market) => (
                        <div 
                            key={market.id}
                            onClick={() => handleSelectMarket(market.id)}
                            className={`group relative bg-slate-900 border hover:border-purple-500/50 rounded-2xl p-6 cursor-pointer transition-all hover:transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-900/20 ${market.type === MarketType.RED_PACKET ? 'border-red-900/50 bg-red-950/20' : 'border-slate-800'}`}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className={`bg-slate-800 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider flex items-center gap-1 
                                    ${market.type === MarketType.ARENA ? 'text-yellow-300' : 
                                      market.type === MarketType.RED_PACKET ? 'text-red-400' : 'text-purple-300'}`}>
                                    {market.type === MarketType.ARENA ? <Zap size={12}/> : 
                                     market.type === MarketType.RED_PACKET ? <Gift size={12} /> : 
                                     market.title.includes('BTC') ? <TrendingUp size={12}/> : 
                                     market.title.includes('哈希') ? <Dice5 size={12}/> : <Trophy size={12}/>}
                                    
                                    {market.type === MarketType.ARENA ? '互动竞技' : 
                                     market.type === MarketType.RED_PACKET ? '链上红包' : '预测市场'}
                                </div>
                                <div className="flex items-center gap-1 text-slate-400 font-mono text-xs">
                                    <Clock size={12} /> {market.type === MarketType.ARENA ? <span className="text-red-400 animate-pulse">进行中</span> : '进行中'}
                                </div>
                            </div>
                            
                            <h3 className="text-2xl font-bold mb-4 group-hover:text-purple-200 transition-colors">
                                {market.title}
                            </h3>

                            <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-800">
                                <div className="flex items-center gap-4">
                                    <div className="text-sm text-slate-400">
                                        {market.type === MarketType.RED_PACKET ? '剩余:' : '奖池:'} <span className="text-white font-mono">{market.totalPool.toFixed(1)} MON</span>
                                    </div>
                                    <div className="text-sm text-slate-400">
                                        门票: <span className={`font-mono ${market.entryFee === 0 ? 'text-green-400' : 'text-white'}`}>
                                            {market.entryFee === 0 ? 'Free (Gas)' : `${market.entryFee} MON`}
                                        </span>
                                    </div>
                                </div>
                                <div className={`px-4 py-2 rounded-lg font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity text-white
                                    ${market.type === MarketType.RED_PACKET ? 'bg-red-600' : 'bg-purple-600'}
                                `}>
                                    {market.type === MarketType.ARENA ? '开始挑战' : 
                                     market.type === MarketType.RED_PACKET ? '立即开抢' : '立即下注'} &rarr;
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Generator Section */}
            <div ref={generatorRef} className="max-w-3xl mx-auto pt-8 border-t border-slate-800">
                <h2 className="text-2xl font-bold mb-6 text-center text-slate-400">或者，做你自己的 Room-Market</h2>
                {account ? (
                    <Generator onCreate={handleCreateMarket} account={account} />
                ) : (
                    <div className="text-center p-8 bg-slate-900/50 rounded-2xl border border-slate-800 border-dashed">
                         <div className="mb-4 text-slate-500">连接钱包即可使用 AI 生成任意预测主题</div>
                         <button onClick={handleConnect} className="px-6 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg font-bold border border-slate-700">
                            连接钱包
                         </button>
                    </div>
                )}
            </div>
          </div>
        )}

        {/* MARKET VIEW */}
        {view === 'MARKET' && activeMarket && (
            <div className="h-full animate-in slide-in-from-right duration-300">
                 <button 
                    onClick={() => { setView('HOME'); setActiveMarketId(null); }}
                    className="mb-4 flex items-center gap-2 text-slate-400 hover:text-white"
                 >
                    <ArrowLeft size={16} /> 返回大厅
                 </button>

                {activeMarket.type === MarketType.ARENA ? (
                    <Arena 
                        market={activeMarket}
                        player={players.find(p => p.address === account)}
                        onJoin={handleJoinArena}
                        onUpdateScore={handleUpdateScore}
                    />
                ) : activeMarket.type === MarketType.RED_PACKET ? (
                    <RedPacket 
                        market={activeMarket}
                        onGrab={handleGrabPacket}
                        players={players}
                    />
                ) : (
                    <Prediction 
                        market={activeMarket}
                        onBet={handleBet}
                        optionsPools={activeMarket.options.map((_, i) => 
                            players.filter(p => p.betOption === i).reduce((sum, p) => sum + (p.betAmount || 0), 0)
                        )}
                    />
                )}
            </div>
        )}
      </main>
    </div>
  );
}

export default App;
