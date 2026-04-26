import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';

interface MessageInputProps {
  onSend: (text: string) => void;
}

export default function MessageInput({ onSend }: MessageInputProps) {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 112) + 'px';
  };

  const handleSend = () => {
    if (!text.trim()) return;
    onSend(text);
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="shrink-0 border-t border-slate-200 p-3 bg-white">
      <div className="flex items-end gap-2 bg-slate-50 rounded-xl border border-slate-200 px-3 py-2 focus-within:border-emerald-400 focus-within:ring-1 focus-within:ring-emerald-400 transition-all">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Nhập tin nhắn..."
          className="flex-1 bg-transparent resize-none text-sm text-slate-800 placeholder:text-slate-400 outline-none leading-relaxed py-0.5"
          rows={1}
          style={{ maxHeight: '112px', scrollbarWidth: 'none' }}
        />
        <button
          onClick={handleSend}
          disabled={!text.trim()}
          className="w-8 h-8 rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white flex items-center justify-center transition-colors shrink-0"
          aria-label="Gửi tin nhắn"
        >
          <Send size={14} />
        </button>
      </div>
      <p className="text-[10px] text-slate-400 text-center mt-1.5">Enter để gửi · Shift+Enter xuống dòng</p>
    </div>
  );
}
