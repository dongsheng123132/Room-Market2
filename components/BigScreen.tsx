import React, { useEffect, useState } from 'react';
import { Market, MarketState } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Users, Coins, Activity } from 'lucide-react';

interface BigScreenProps {
  state: MarketState;
}

const BigScreen: React.FC<BigScreenProps> = ({ state }) => {
  const [data, setData] = useState<any[]>([]);

  // Transform state to chart data
  useEffect(() => {
    if (state.market.type === 'PREDICTION') {
      const chartData = state.market.options.slice(0, 20).map((opt, idx) => ({
        name: opt,
        value: state.players.filter(p => p.betOption === idx).reduce((acc, p) => acc + (p.betAmount || 0), 0)
      }));
      setData(chartData);
    } else {
      // Arena: Top 5 players
      const sortedPlayers = [...state.players].sort((a, b) => b.score - a.score).slice(0, 5);
      setData(sortedPlayers.map(p => ({
        name: p.address.slice(0, 6),
        value: p.score
      })));
    }
  }, [state]);

  return (
    <div className="h-screen bg-slate-900 flex flex-col p-8 overflow-hidden">
      <div className="flex justify-between items-start mb-12">
        <div>
          <h2 className="text-xl text-purple-400 font-mono mb-2 uppercase tracking-widest">Live Oracle Market</h2>
          <h1 className="text-6xl font-black text-white neon-text">{state.market.title}</h1>
        </div>
        <div className="flex flex-col items-end">
          <div className="text-sm text-slate-400">Monad Testnet • Block Time: 400ms</div>
          <div className="flex gap-2 mt-2">
            <span className="bg-green-900 text-green-300 px-3 py-1 rounded-full text-sm font-bold animate-pulse">进行中</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-8 flex-1">
        {/* Stats Panel */}
        <div className="col-span-1 space-y-6">
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
            <div className="flex items-center gap-3 text-slate-400 mb-2">
              <Users size={20} /> 参与人数
            </div>
            <div className="text-5xl font-mono font-bold">{state.players.length}</div>
          </div>

          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
            <div className="flex items-center gap-3 text-slate-400 mb-2">
              <Coins size={20} /> 总奖池
            </div>
            <div className="text-5xl font-mono font-bold text-yellow-400">
              {state.market.totalPool.toFixed(1)} <span className="text-xl">MON</span>
            </div>
          </div>

          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
             <div className="flex items-center gap-3 text-slate-400 mb-2">
              <Activity size={20} /> 网络 TPS
            </div>
            <div className="text-5xl font-mono font-bold text-blue-400">
              {Math.floor(Math.random() * 500 + 2000)}
            </div>
          </div>
          
          <div className="h-full bg-slate-800/50 rounded-2xl p-4 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900 z-10"></div>
            <h3 className="font-bold mb-4 text-slate-500">最近动态</h3>
            <div className="space-y-3">
                {state.history.slice(-6).reverse().map((h, i) => (
                    <div key={i} className="flex justify-between text-sm animate-in slide-in-from-left duration-300">
                        <span className="font-mono text-purple-300">{h.type}</span>
                        <span className="text-slate-400">刚刚</span>
                    </div>
                ))}
            </div>
          </div>
        </div>

        {/* Main Visualization */}
        <div className="col-span-3 bg-slate-800/50 rounded-3xl p-8 border border-slate-700 backdrop-blur-sm">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis 
                dataKey="name" 
                stroke="#94a3b8" 
                fontSize={14}
                angle={-45}
                textAnchor="end"
                interval={0}
                height={80}
              />
              <YAxis stroke="#94a3b8" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                cursor={{fill: 'rgba(255,255,255,0.05)'}}
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={state.market.type === 'ARENA' ? '#a855f7' : '#3b82f6'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default BigScreen;
