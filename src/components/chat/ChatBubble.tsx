import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X } from 'lucide-react';

interface ChatBubbleProps {
  isOpen: boolean;
  onClick: () => void;
}

export default function ChatBubble({ isOpen, onClick }: ChatBubbleProps) {
  return (
    <motion.button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-[100] w-14 h-14 bg-emerald-500 text-white rounded-full shadow-2xl flex items-center justify-center"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      aria-label={isOpen ? 'Đóng chat' : 'Mở chat'}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isOpen ? (
          <motion.span
            key="close"
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex items-center justify-center"
          >
            <X size={22} />
          </motion.span>
        ) : (
          <motion.span
            key="open"
            initial={{ rotate: 90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: -90, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex items-center justify-center"
          >
            <MessageCircle size={22} />
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
