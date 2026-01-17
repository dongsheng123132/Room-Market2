import React, { useState } from 'react';
import { Market } from '../types';
import { X, Copy, Check, Share2, Facebook, Twitter, Smartphone } from 'lucide-react';

interface ShareModalProps {
  market: Market;
  onClose: () => void;
}

const ShareModal: React.FC<ShareModalProps> = ({ market, onClose }) => {
  const [copied, setCopied] = useState(false);
  
  // In a real app, this would be the actual URL path to this specific market ID
  const shareUrl = `${window.location.origin}/?market=${market.id}`;
  
  // Using a public API for QR Code generation for the demo
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(shareUrl)}&bgcolor=1e293b&color=ffffff&margin=10`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm shadow-2xl relative overflow-hidden">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
          <h3 className="font-bold flex items-center gap-2">
            <Share2 size={18} className="text-purple-400" /> 邀请好友参与
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col items-center text-center space-y-6">
          <div className="space-y-1">
             <div className="text-sm text-slate-400 uppercase tracking-wider">正在进行</div>
             <div className="font-bold text-xl leading-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                {market.title}
             </div>
          </div>

          <div className="relative group p-2 bg-white rounded-xl">
             <img 
                src={qrUrl} 
                alt="QR Code" 
                className="w-48 h-48 rounded-lg"
             />
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 <div className="bg-slate-900/80 p-2 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                     <Smartphone className="text-white" />
                 </div>
             </div>
          </div>
          <p className="text-xs text-slate-500">观众扫描二维码即可加入房间</p>

          {/* Copy Link */}
          <div className="w-full flex gap-2">
            <input 
                type="text" 
                readOnly 
                value={shareUrl}
                className="flex-1 bg-slate-950 border border-slate-800 rounded px-3 text-xs text-slate-400 focus:outline-none"
            />
            <button 
                onClick={handleCopy}
                className={`px-3 py-2 rounded font-bold text-sm transition-all flex items-center gap-2
                    ${copied ? 'bg-green-600 text-white' : 'bg-purple-600 hover:bg-purple-500 text-white'}
                `}
            >
                {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>
          
          {/* Social Row (Mock) */}
          <div className="flex gap-4 pt-2 border-t border-slate-800 w-full justify-center">
             <button className="p-2 bg-[#1DA1F2]/10 text-[#1DA1F2] rounded hover:bg-[#1DA1F2]/20"><Twitter size={20}/></button>
             <button className="p-2 bg-[#4267B2]/10 text-[#4267B2] rounded hover:bg-[#4267B2]/20"><Facebook size={20}/></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
