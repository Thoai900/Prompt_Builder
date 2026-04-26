import React, { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { User, Bot } from 'lucide-react';
import type { Message } from './ChatWidget';

interface MessageListProps {
  messages: Message[];
  isBotTyping: boolean;
}

function formatTime(date: Date) {
  return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

export default function MessageList({ messages, isBotTyping }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isBotTyping]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 custom-scrollbar">
      {messages.map(message => (
        <motion.div
          key={message.id}
          className={`flex items-end gap-2 ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mb-1
              ${message.sender === 'user'
                ? 'bg-emerald-100 text-emerald-600'
                : 'bg-slate-100 text-slate-500'
              }`}
          >
            {message.sender === 'user' ? <User size={14} /> : <Bot size={14} />}
          </div>

          <div className={`flex flex-col gap-0.5 max-w-[75%] ${message.sender === 'user' ? 'items-end' : 'items-start'}`}>
            <div
              className={`px-3.5 py-2.5 text-sm leading-relaxed
                ${message.sender === 'user'
                  ? 'bg-emerald-500 text-white rounded-2xl rounded-br-sm'
                  : 'bg-slate-100 text-slate-800 rounded-2xl rounded-bl-sm'
                }`}
            >
              {message.text}
            </div>
            <span className="text-[10px] text-slate-400 px-1">{formatTime(message.timestamp)}</span>
          </div>
        </motion.div>
      ))}

      {isBotTyping && (
        <motion.div
          className="flex items-end gap-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
            <Bot size={14} />
          </div>
          <div className="px-4 py-3 bg-slate-100 rounded-2xl rounded-bl-sm flex items-center gap-1">
            {[0, 1, 2].map(i => (
              <motion.span
                key={i}
                className="w-1.5 h-1.5 bg-slate-400 rounded-full block"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 0.55, repeat: Infinity, delay: i * 0.14, ease: 'easeInOut' }}
              />
            ))}
          </div>
        </motion.div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
