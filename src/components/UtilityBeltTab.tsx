import React, { useState } from 'react';
import { Sparkles, Zap, Package, Send, Loader2, ArrowRight, Save } from 'lucide-react';
import { DAILY_PACKS } from '../data';
import { PromptTemplate } from '../types';
import { generateQuickResponse } from '../services/aiService';
import AIResponseRenderer from './AIResponseRenderer';
import { User } from 'firebase/auth';

interface UtilityBeltTabProps {
  user: User | null;
  onSaveTemplate?: (template: PromptTemplate) => Promise<void>;
}

export default function UtilityBeltTab({ user, onSaveTemplate }: UtilityBeltTabProps) {
  const [inputText, setInputText] = useState('');
  const [selectedPack, setSelectedPack] = useState<PromptTemplate | null>(null);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [response, setResponse] = useState('');

  const handleSeed = async () => {
    if (!user || !onSaveTemplate) return;
    setIsSeeding(true);
    let successCount = 0;
    try {
      for (const pack of DAILY_PACKS) {
        // Clone pack with unique ID for current user
        const newPack = { ...pack, id: `pack-${user.uid}-${pack.id}`, version: 'v1.0' };
        await onSaveTemplate(newPack);
        successCount++;
      }
      alert(`Đã lưu thành công ${successCount} Daily Packs vào thư viện cá nhân của bạn!`);
    } catch (err) {
      console.error(err);
      alert("Đã có lỗi xảy ra khi lưu. Vui lòng thử lại.");
    } finally {
      setIsSeeding(false);
    }
  };

  const handleSelectPack = (pack: PromptTemplate) => {
    setSelectedPack(pack);
    const taskBlock = pack.blocks.find(b => b.type === 'task');
    if (taskBlock) {
      // Find the keyword enclosed in {{...}}
      const match = taskBlock.content.match(/\{\{([^}]+)\}\}/);
      if (match) {
        setInputText(`[Thay thế ở đây: ${match[1]}]`);
      } else {
        setInputText('');
      }
    } else {
      setInputText('');
    }
  };

  const handleSubmit = async () => {
    if (!inputText.trim() || isGenerating) return;

    let finalPrompt = inputText;
    if (selectedPack) {
      const taskBlock = selectedPack.blocks.find(b => b.type === 'task');
      if (taskBlock) {
        // Simple string replacement if the user replaced the placeholder or just typed something.
        // We will just let the system prompt handle it by injecting the packs. 
        // We append the user input to tell AI the context.
        finalPrompt = `Dựa trên thiết lập: ${selectedPack.title}. Thông tin thêm/Từ khoá: ${inputText}`;
      }
    }

    setIsGenerating(true);
    setResponse('');
    
    try {
      const packBlocks = selectedPack ? selectedPack.blocks.map(b => ({
        type: b.type,
        title: b.title,
        content: b.content
      })) : undefined;

      await generateQuickResponse(finalPrompt, packBlocks, (chunk) => {
        setResponse(prev => prev + chunk);
      });
    } catch (error) {
       console.error("Lỗi AI:", error);
       setResponse("Đã xảy ra lỗi khi tạo phản hồi. Vui lòng thử lại.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#FAFAFA] overflow-y-auto">
      <div className="flex-none p-6 md:p-8 2xl:px-12 2xl:py-10 mx-auto w-full max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-2 flex items-center gap-3">
             <Zap className="text-amber-500 fill-amber-500" size={32} />
             The Utility Belt
          </h1>
          <p className="text-slate-500 font-medium">Thắt lưng tiện ích: Nhập 1 câu lệnh ngắn, hệ thống bơm cấu trúc ngầm, nhận kết quả xịn ngay lập tức.</p>
        </div>

        {/* Quick Build Section */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-1.5 md:p-2 flex flex-col mb-10 ring-1 ring-black/5 hover:ring-emerald-500/30 transition-all focus-within:ring-emerald-500 focus-within:shadow-md">
          {selectedPack && (
            <div className="flex items-center gap-2 px-4 pt-3 pb-1">
               <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5 border border-emerald-200">
                  <Package size={14} />
                  Gói: {selectedPack.title}
                  <button onClick={() => { setSelectedPack(null); setInputText(''); }} className="ml-1 hover:text-rose-600 rounded-full bg-emerald-200/50 p-0.5">
                     <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                  </button>
               </span>
            </div>
          )}
          
          <div className="flex bg-white rounded-xl relative pl-2 pr-2">
            <textarea 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={selectedPack ? `Thay thế từ khoá cho gói ${selectedPack.title}...` : "Nhập câu lệnh ngắn (vd: Lên lịch tập gym 3 ngày)..."}
              className="flex-1 resize-none bg-transparent py-4 px-2 text-slate-700 outline-none placeholder:text-slate-400 font-medium leading-relaxed min-h-[60px]"
              rows={2}
            />
            <div className="flex items-end pb-2 pr-1">
              <button
                onClick={handleSubmit}
                disabled={isGenerating || !inputText.trim()}
                className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl p-3 flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {isGenerating ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} className="ml-0.5" />}
              </button>
            </div>
          </div>
          
          {!selectedPack && (
            <div className="px-4 pb-3 flex items-center gap-2 text-xs text-slate-400 font-medium">
               <Sparkles size={14} className="text-amber-500" />
               Cấu trúc ngầm (Invisible Structure) sẽ tự động được thêm vào.
            </div>
          )}
        </div>

        {/* AI Response Output */}
        {response && (
           <div className="mb-10">
             <AIResponseRenderer content={response} />
           </div>
        )}

        {/* Daily Setup Packs */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Package className="text-emerald-500" size={24} />
              Daily Setup Packs
            </h2>
            {user && (
              <button 
                 onClick={handleSeed}
                 disabled={isSeeding}
                 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider bg-slate-900 text-white px-3 py-1.5 rounded-lg hover:bg-slate-800 disabled:opacity-50 transition-colors"
              >
                {isSeeding ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} 
                Lưu vào Firebase
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {DAILY_PACKS.map(pack => (
              <div 
                key={pack.id}
                onClick={() => handleSelectPack(pack)}
                className="bg-white border text-left border-slate-200 rounded-2xl p-5 hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer group flex flex-col h-full"
              >
                <h3 className="font-bold text-slate-900 mb-2 truncate group-hover:text-emerald-600 transition-colors uppercase text-sm tracking-wide">{pack.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-4 flex-1 line-clamp-3">
                  {pack.description}
                </p>
                <div className="flex items-center text-xs font-semibold text-emerald-600 justify-between mt-auto pt-4 border-t border-slate-100">
                   <span>Sử dụng gói</span>
                   <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
