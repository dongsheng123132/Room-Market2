import React, { useState } from 'react';
import { MarketType, Market } from '../types';
import { generateMarketData } from '../services/geminiService';
import { Sparkles, Zap, Trophy, Loader2, AlertTriangle, Gift } from 'lucide-react';

interface GeneratorProps {
  onCreate: (market: Market) => void;
  account: string;
}

const Generator: React.FC<GeneratorProps> = ({ onCreate, account }) => {
  const [mode, setMode] = useState<MarketType>(MarketType.PREDICTION);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [options, setOptions] = useState<string[]>(['', '']);
  const [entryFee, setEntryFee] = useState(1);
  const [isMock, setIsMock] = useState(false);

  const handleMagicGenerate = async () => {
    if (!prompt) return;
    setLoading(true);
    // Call service
    const data = await generateMarketData(prompt);
    
    setTitle(data.title);
    setOptions((data.options || []).slice(0, 20));
    setIsMock(!!data.isMock);
    setLoading(false);
  };

  const handleCreate = () => {
    let finalTitle = title;
    if (!finalTitle) {
        if (mode === MarketType.ARENA) finalTitle = "极速竞技场";
        if (mode === MarketType.RED_PACKET) finalTitle = "大吉大利红包";
        if (mode === MarketType.PREDICTION) finalTitle = "未命名市场";
    }

    const newMarket: Market = {
      id: Math.random().toString(36).substr(2, 9),
      type: mode,
      title: finalTitle,
      options: mode === MarketType.PREDICTION ? options.filter(o => o) : [],
      entryFee,
      totalPool: mode === MarketType.RED_PACKET ? 10 : 0, // Mock init pool for red packet
      createdAt: Date.now(),
      status: 'OPEN',
      creator: account
    };
    onCreate(newMarket);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-slate-800 rounded-xl shadow-2xl border border-slate-700">
      <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <Sparkles className="text-yellow-400" /> 创建新市场
      </h2>

      {/* Mode Selection */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <button
          onClick={() => setMode(MarketType.ARENA)}
          className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2
            ${mode === MarketType.ARENA ? 'border-purple-500 bg-purple-500/20' : 'border-slate-600 hover:bg-slate-700'}`}
        >
          <Zap size={24} className="text-purple-400" />
          <div className="font-bold">手速竞技</div>
        </button>

        <button
          onClick={() => setMode(MarketType.PREDICTION)}
          className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2
            ${mode === MarketType.PREDICTION ? 'border-blue-500 bg-blue-500/20' : 'border-slate-600 hover:bg-slate-700'}`}
        >
          <Trophy size={24} className="text-blue-400" />
          <div className="font-bold">预测市场</div>
        </button>

        <button
          onClick={() => setMode(MarketType.RED_PACKET)}
          className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2
            ${mode === MarketType.RED_PACKET ? 'border-red-500 bg-red-500/20' : 'border-slate-600 hover:bg-slate-700'}`}
        >
          <Gift size={24} className="text-red-400" />
          <div className="font-bold">链上红包</div>
        </button>
      </div>

      {/* Generator Form */}
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {mode === MarketType.PREDICTION && (
          <div className="bg-slate-900 p-4 rounded-lg border border-slate-700">
            <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-slate-300">AI 一键生成 (Gemini)</label>
                {isMock && (
                    <span className="text-xs text-yellow-500 flex items-center gap-1">
                        <AlertTriangle size={12} /> 演示模式 (无 API Key)
                    </span>
                )}
            </div>
            
            <div className="flex gap-2">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="例如：黑客松谁赢？比特币价格？今晚球赛..."
                className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <button
                onClick={handleMagicGenerate}
                disabled={loading || !prompt}
                className="bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-2 rounded-lg font-bold hover:opacity-90 disabled:opacity-50 flex items-center gap-2 transition-all active:scale-95 whitespace-nowrap"
              >
                {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={18} />}
                生成
              </button>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">标题</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-lg font-bold text-white focus:ring-2 focus:ring-purple-500 outline-none"
            placeholder={
                mode === MarketType.ARENA ? "例如：Monad 极速手速测试 #1" : 
                mode === MarketType.RED_PACKET ? "例如：恭喜发财，Monad 拿来" :
                "例如：谁会赢得大选？"
            }
          />
        </div>

        {mode === MarketType.PREDICTION && (
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">选项</label>
            {options.slice(0, 20).map((opt, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input
                  value={opt}
                  onChange={(e) => {
                    const newO = [...options];
                    newO[i] = e.target.value;
                    setOptions(newO);
                  }}
                  className="flex-1 bg-slate-800 border border-slate-600 rounded px-3 py-2 focus:ring-1 focus:ring-blue-500 outline-none"
                  placeholder={`选项 ${i + 1}`}
                />
                <button 
                  onClick={() => setOptions(options.filter((_, idx) => idx !== i))}
                  className="text-red-400 hover:bg-slate-700 p-2 rounded transition-colors"
                >
                  ✕
                </button>
              </div>
            ))}
            <button 
              onClick={() => {
                if (options.length >= 20) return;
                setOptions([...options, '']);
              }}
              className="text-sm text-blue-400 hover:underline mt-1"
            >
              + 添加选项
            </button>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
              {mode === MarketType.RED_PACKET ? "抢红包门票 (设置为 0 即仅需 Gas)" : "入场费 / 投注额 (MON)"}
          </label>
          <div className="relative">
              <input
                type="number"
                step="0.1"
                min="0"
                value={entryFee}
                onChange={(e) => setEntryFee(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 font-mono focus:ring-2 focus:ring-green-500 outline-none"
              />
              {entryFee === 0 && (
                  <span className="absolute right-4 top-3 text-green-400 text-sm font-bold flex items-center gap-1">
                      <Zap size={14} /> Free (Gas Only)
                  </span>
              )}
          </div>
        </div>

        <button
          onClick={handleCreate}
          disabled={!title && mode === MarketType.PREDICTION}
          className={`w-full py-4 rounded-xl font-bold text-xl hover:scale-[1.02] transition-transform shadow-lg disabled:opacity-50 disabled:cursor-not-allowed
             ${mode === MarketType.RED_PACKET ? 'bg-gradient-to-r from-red-600 to-orange-500 shadow-red-900/50' : 'bg-gradient-to-r from-purple-600 to-blue-600 shadow-purple-900/50'}
          `}
        >
          {mode === MarketType.RED_PACKET ? "🧧 塞进红包并发布" : "🚀 发布市场"}
        </button>
      </div>
    </div>
  );
};

export default Generator;
