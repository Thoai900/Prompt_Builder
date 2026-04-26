import React, { useState, useCallback } from 'react';
import { AnimatePresence } from 'motion/react';
import ChatBubble from './ChatBubble';
import ChatWindow from './ChatWindow';

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const BOT_RESPONSES = [
  'Cảm ơn bạn đã nhắn tin! Tôi có thể giúp bạn tạo và tối ưu hóa prompt hiệu quả hơn. Bạn muốn bắt đầu từ đâu?',
  'Gợi ý: Hãy thử dùng **The Workshop** để xây dựng prompt theo từng khối có cấu trúc. Tôi sẽ hỗ trợ bạn từng bước!',
  'Thú vị đấy! Bạn có thể dùng **AI Enhancer** để tự động cải thiện chất lượng prompt. Muốn tôi hướng dẫn không?',
  'Đã nhận được yêu cầu! Để tạo ra một prompt chuyên nghiệp, hãy chú ý đến: Vai trò (Role), Nhiệm vụ (Task), và Ngữ cảnh (Context).',
  'Bạn có thể lưu prompt vào **Template Library** để sử dụng lại sau. Đăng nhập để đồng bộ trên mọi thiết bị nhé!',
  'Một mẹo hay: Thêm ví dụ cụ thể vào prompt sẽ giúp AI hiểu ý định của bạn chính xác hơn đến 40%.',
];

let botResponseIndex = 0;

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init',
      text: 'Xin chào! 👋 Tôi là trợ lý AI của PromptBuilder. Tôi có thể giúp bạn xây dựng và tối ưu prompt hiệu quả. Hỏi tôi bất cứ điều gì nhé!',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [isBotTyping, setIsBotTyping] = useState(false);

  const handleSendMessage = useCallback((text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text: text.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsBotTyping(true);

    setTimeout(() => {
      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        text: BOT_RESPONSES[botResponseIndex % BOT_RESPONSES.length],
        sender: 'bot',
        timestamp: new Date(),
      };
      botResponseIndex++;
      setMessages(prev => [...prev, botMessage]);
      setIsBotTyping(false);
    }, 1000);
  }, []);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <ChatWindow
            key="chat-window"
            messages={messages}
            isBotTyping={isBotTyping}
            onSendMessage={handleSendMessage}
            onClose={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>
      <ChatBubble isOpen={isOpen} onClick={() => setIsOpen(prev => !prev)} />
    </>
  );
}
