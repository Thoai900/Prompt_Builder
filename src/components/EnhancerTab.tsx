import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Sparkles, ArrowRight, Loader2, Copy, Check, ExternalLink } from 'lucide-react';
import { PromptBlock, PromptTemplate } from '../types';

interface EnhancerTabProps {
  onApplyTemplate?: (template: PromptTemplate) => void;
}

export default function EnhancerTab({ onApplyTemplate }: EnhancerTabProps) {
  const [inputPrompt, setInputPrompt] = useState('');
  const [optimizedBlocks, setOptimizedBlocks] = useState<PromptBlock[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleEnhance = async () => {
    if (!inputPrompt.trim()) return;
    
    setIsLoading(true);
    setErrorMsg('');
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
         setErrorMsg("Lỗi: Không tìm thấy API Key của Gemini. Vui lòng kiểm tra lại cấu hình.");
         setIsLoading(false);
         return;
      }
      
      const ai = new GoogleGenAI({ apiKey });
      
      const systemInstruction = `Bạn là một chuyên gia Prompt Engineer đẳng cấp quốc tế.
Nhiệm vụ của bạn là nhận một prompt cơ bản từ người dùng và nâng cấp nó thành một prompt chuyên nghiệp, rõ ràng, và mang lại hiệu quả cao nhất.
BẠN PHẢI TRẢ VỀ ĐÚNG MỘT CHUỖI JSON THEO CẤU TRÚC BÊN DƯỚI, KHÔNG ĐƯỢC CHỨA TEXT NÀO KHÁC BÊN NGOÀI JSON (Không dùng markdown \`\`\`json):
{
  "blocks": [
    {
      "type": "role", 
      "title": "Vai trò",
      "content": "Nội dung..."
    }
  ]
}
Chú ý, trường 'type' bắt buộc phải là MỘT TRONG CÁC GIÁ TRỊ SAU: 'role', 'task', 'context', 'format', 'tone', 'constraints', 'example'.
Cố gắng phân tích prompt của người dùng và chia nhỏ ra thành ít nhất 3 block trở lên để cấu trúc rõ ràng.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Hãy phân tích và tối ưu hoá prompt cơ bản sau:\n\n${inputPrompt}`,
        config: {
          systemInstruction,
          temperature: 0.7,
          responseMimeType: "application/json",
        }
      });

      const jsonStr = response.text || "{}";
      const parsed = JSON.parse(jsonStr);
      
      if (parsed && parsed.blocks && Array.isArray(parsed.blocks)) {
        // give them unique ids
        const blocksWithIds = parsed.blocks.map((b: any, idx: number) => ({
          ...b,
          id: `ai-${b.type}-${Date.now()}-${idx}`
        }));
        setOptimizedBlocks(blocksWithIds);
      } else {
        throw new Error("Invalid output format.");
      }
    } catch (error) {
      console.error(error);
      setErrorMsg("Đã có lỗi xảy ra trong quá trình nâng cấp prompt, hãy thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const generateRawText = () => {
    if (!optimizedBlocks) return "";
    return optimizedBlocks.map(b => `### ${b.title}\n${b.content}`).join('\n\n');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateRawText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApplyToBuilder = () => {
    if (!optimizedBlocks || !onApplyTemplate) return;
    const template: PromptTemplate = {
      id: `ai-enhanced-${Date.now()}`,
      title: "AI Enhanced Prompt",
      description: "Prompt đã được tối ưu hóa cấu trúc bởi AI.",
      blocks: optimizedBlocks
    };
    onApplyTemplate(template);
  };

  return (
    <div className="flex-1 p-6 flex flex-col overflow-y-auto w-full max-w-5xl mx-auto pb-safe">
      <div className="mb-6">
        <h2 className="text-lg font-bold">AI Prompt Upgrader</h2>
        <p className="text-sm text-slate-500">Transform basic ideas into professional, optimized structures.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-[500px]">
        {/* Input */}
        <div className="flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
             <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Original Concept</h3>
          </div>
          <div className="flex-1 p-0 relative">
            <textarea
              className="w-full h-full p-6 resize-none focus:outline-none text-sm text-slate-700 leading-relaxed placeholder-slate-300"
              placeholder="Enter your basic prompt here...&#10;e.g. Write a Facebook post selling t-shirts."
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
            />
          </div>
          <div className="p-4 border-t border-slate-100 flex justify-end bg-slate-50/50">
             <button
              onClick={handleEnhance}
              disabled={!inputPrompt.trim() || isLoading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md text-xs font-semibold shadow-sm hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
              <span>{isLoading ? 'Enhancing...' : 'Enhance Precision'}</span>
            </button>
          </div>
        </div>

        {/* Output */}
        <div className="flex flex-col bg-slate-50 rounded-xl border border-indigo-200 shadow-sm overflow-hidden flex-1 p-4 h-full relative">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
             <h3 className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">Cấu trúc Tối ưu</h3>
             {optimizedBlocks && optimizedBlocks.length > 0 && (
               <div className="flex items-center gap-2 w-full md:w-auto">
                 <button
                    onClick={handleCopy}
                    className="flex-1 md:flex-none justify-center px-3 py-2 bg-white border border-slate-200 rounded-md text-xs font-semibold text-slate-600 hover:bg-slate-50 flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                    <span>{copied ? 'Đã Copy' : 'Copy'}</span>
                  </button>
                  {onApplyTemplate && (
                    <button
                      onClick={handleApplyToBuilder}
                      className="flex-[2] md:flex-none justify-center px-3 py-2 bg-indigo-600 border border-indigo-600 rounded-md text-xs font-semibold text-white hover:bg-indigo-700 flex items-center gap-1.5 transition-colors shadow-sm"
                    >
                      <ExternalLink size={14} />
                      <span>Áp dụng vào Builder</span>
                    </button>
                  )}
               </div>
             )}
          </div>
          
          <div className="flex-1 bg-white border border-slate-200 rounded-lg p-4 overflow-y-auto custom-scrollbar">
             {errorMsg ? (
               <div className="text-sm text-rose-500 font-medium p-4 bg-rose-50 rounded text-center">
                 {errorMsg}
               </div>
             ) : optimizedBlocks && optimizedBlocks.length > 0 ? (
               <div className="flex flex-col gap-4">
                 {optimizedBlocks.map(block => (
                   <div key={block.id} className="border border-slate-100 rounded-lg p-3 bg-slate-50/50">
                     <h4 className="text-xs font-bold text-indigo-700 uppercase tracking-widest mb-1.5">
                       [{block.title}]
                     </h4>
                     <p className="text-sm text-slate-700 leading-relaxed font-mono whitespace-pre-wrap">
                       {block.content}
                     </p>
                   </div>
                 ))}
               </div>
             ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center mb-2">
                     <ArrowRight size={16} className="text-slate-300" />
                  </div>
                  <p className="text-xs">Nhập prompt của bạn và nhấp nút Upgrade<br/>để cấu trúc hóa và nâng cấp sức mạnh.</p>
                </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
