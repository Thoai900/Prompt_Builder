import React from 'react';
import { motion } from 'motion/react';
import { X, Bot } from 'lucide-react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import type { Message } from './ChatWidget';

interface ChatWindowProps {
  messages: Message[];
  isBotTyping: boolean;
  onSendMessage: (text: string) => void;
  onClose: () => void;
}

export default function ChatWindow({ messages, isBotTyping, onSendMessage, onClose }: ChatWindowProps) {
  return (
    <motion.div
      className="fixed z-[99] flex flex-col bg-white overflow-hidden shadow-2xl border border-slate-200 rounded-2xl
                 bottom-[5.5rem] right-4 left-4 max-h-[calc(100vh-7rem)]
                 sm:left-auto sm:w-96 sm:max-h-[600px]"
      style={{ transformOrigin: 'bottom right' }}
      initial={{ opacity: 0, scale: 0.75, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.75, y: 16 }}
      transition={{ type: 'spring', stiffness: 340, damping: 26 }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-emerald-500 text-white shrink-0">
        <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center shrink-0">
          <Bot size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm leading-tight">PromptBuilder AI</p>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-emerald-300 rounded-full animate-pulse" />
            <p className="text-xs text-emerald-100">Luôn sẵn sàng hỗ trợ</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
          aria-label="Đóng chat"
        >
          <X size={18} />
        </button>
      </div>

      <MessageList messages={messages} isBotTyping={isBotTyping} />
      <MessageInput onSend={onSendMessage} />
    </motion.div>
  );
}
