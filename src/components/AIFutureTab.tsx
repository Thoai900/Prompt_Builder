import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Bot, Code, Cpu, Globe, Image as ImageIcon, Video, 
  Workflow, Zap, Shield, Search, ChevronRight, Copy, Check, Lock, Unlock,
  Layers, BarChart3, Clock, Rocket, Smile
} from 'lucide-react';

type TabType = 'big3' | 'opensource' | 'specialized' | 'trends';

export default function AIFutureTab() {
  const [activeTab, setActiveTab] = useState<TabType>('big3');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="h-full bg-[#0a0a0f] text-slate-50 overflow-y-auto custom-scrollbar relative">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-6xl mx-auto px-6 py-12 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-slate-300 mb-6 backdrop-blur-md"
          >
            <Sparkles size={14} className="text-indigo-400" />
            AI Landscape 2026
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4"
          >
            Kỷ Nguyên <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">Trí Tuệ Nhân Tạo</span> & Tương Lai
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 max-w-2xl mx-auto text-lg"
          >
            Khám phá bức tranh toàn cảnh về các mô hình AI thống trị, mã nguồn mở mạnh mẽ và xu hướng định hình thế giới công nghệ.
          </motion.p>
        </div>

        {/* Navigation & Search */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-10">
          <div className="flex bg-white/5 p-1 rounded-xl backdrop-blur-md border border-white/10 w-full md:w-auto">
            <NavButton active={activeTab === 'big3'} onClick={() => setActiveTab('big3')} icon={<Lock size={14} />}>The Big Three</NavButton>
            <NavButton active={activeTab === 'opensource'} onClick={() => setActiveTab('opensource')} icon={<Unlock size={14} />}>Mã Nguồn Mở</NavButton>
            <NavButton active={activeTab === 'specialized'} onClick={() => setActiveTab('specialized')} icon={<Layers size={14} />}>Chuyên Dụng</NavButton>
            <NavButton active={activeTab === 'trends'} onClick={() => setActiveTab('trends')} icon={<Rocket size={14} />}>Xu Hướng 2026</NavButton>
          </div>
        </div>

        {/* Content Area */}
        <div className="min-h-[500px]">
          <AnimatePresence mode="wait">
            {activeTab === 'big3' && <BigThreeSection key="big3" />}
            {activeTab === 'opensource' && <OpenSourceSection key="opensource" />}
            {activeTab === 'specialized' && <SpecializedSection key="specialized" />}
            {activeTab === 'trends' && <TrendsSection key="trends" />}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}

function NavButton({ children, active, onClick, icon }: { children: React.ReactNode, active: boolean, onClick: () => void, icon?: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap flex-1 md:flex-auto justify-center ${
        active 
          ? 'bg-white/10 text-white shadow-lg border border-white/5' 
          : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
      }`}
    >
      {icon}
      {children}
    </button>
  );
}

// -------------------------------------------------------------
// SECTIONS
// -------------------------------------------------------------

function BigThreeSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col gap-10"
    >
      {/* Bento Grid layout */}
      <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-6">
        
        {/* Gemini Card */}
        <div className="col-span-1 md:col-span-3 lg:col-span-4 bg-[#0d121f] rounded-3xl p-6 border border-[#4285F4]/20 relative overflow-hidden group hover:border-[#4285F4]/50 transition-all hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(66,133,244,0.15)] flex flex-col">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-[#4285F4]"></div>
          <div className="absolute -right-20 -top-20 w-40 h-40 bg-[#4285F4]/10 rounded-full blur-3xl group-hover:bg-[#4285F4]/20 transition-all"></div>
          
          <div className="flex items-center gap-3 mb-6 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center border border-blue-500/30">
              <Sparkles className="text-blue-400" size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold">Google Gemini</h3>
              <p className="text-xs text-blue-400 font-mono tracking-wider">GEMINI 3.1 PRO & FLASH</p>
            </div>
          </div>
          <div className="space-y-4 flex-1 relative z-10">
            <div className="bg-white/5 p-3 rounded-xl border border-white/5">
              <h4 className="text-sm font-semibold text-slate-200 mb-1 flex items-center gap-2">
                <Globe size={14} className="text-blue-400" /> Ngữ cảnh cực lớn
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">Xử lý hàng triệu token, đọc toàn bộ thư viện tài liệu hoặc video dài trong chớp mắt.</p>
            </div>
            <div className="bg-white/5 p-3 rounded-xl border border-white/5">
              <h4 className="text-sm font-semibold text-slate-200 mb-1 flex items-center gap-2">
                <Search size={14} className="text-blue-400" /> Deep Research
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">AI tự thực hiện nghiên cứu phức tạp trên Internet và viết báo cáo chuyên sâu.</p>
            </div>
          </div>
        </div>

        {/* OpenAI Card (Center - Largest in Bento) */}
        <div className="col-span-1 md:col-span-6 lg:col-span-4 bg-[#0d1411] rounded-3xl p-6 border border-[#10a37f]/20 relative overflow-hidden group hover:border-[#10a37f]/50 transition-all hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(16,163,127,0.15)] flex flex-col">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-[#10a37f]"></div>
          <div className="absolute -right-20 -top-20 w-40 h-40 bg-[#10a37f]/10 rounded-full blur-3xl group-hover:bg-[#10a37f]/20 transition-all"></div>
          
          <div className="flex items-center gap-3 mb-6 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/30">
              <Bot className="text-emerald-400" size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold">OpenAI</h3>
              <p className="text-xs text-emerald-400 font-mono tracking-wider">GPT-5.4 & O3</p>
            </div>
          </div>
          <div className="space-y-4 flex-1 relative z-10">
            <div className="bg-white/5 p-3 rounded-xl border border-white/5">
              <h4 className="text-sm font-semibold text-slate-200 mb-1 flex items-center gap-2">
                <Cpu size={14} className="text-emerald-400" /> Cốt lõi GPT-5.4
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">Mô hình chủ lực với suy luận logic vượt trội, tích hợp Canvas để cộng tác viết code và soạn bản.</p>
            </div>
            <div className="bg-white/5 p-3 rounded-xl border border-white/5">
              <h4 className="text-sm font-semibold text-slate-200 mb-1 flex items-center gap-2">
                <Workflow size={14} className="text-emerald-400" /> Hệ Reasoning (o1 & o3)
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">Dòng mô hình "suy nghĩ chậm", cực kỳ mạnh trong toán học, lập trình và giải quyết vấn đề hóc búa.</p>
            </div>
          </div>
        </div>

        {/* Claude Card */}
        <div className="col-span-1 md:col-span-3 lg:col-span-4 bg-[#140e0c] rounded-3xl p-6 border border-[#d97757]/20 relative overflow-hidden group hover:border-[#d97757]/50 transition-all hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(217,119,87,0.15)] flex flex-col">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 to-[#d97757]"></div>
          <div className="absolute -right-20 -top-20 w-40 h-40 bg-[#d97757]/10 rounded-full blur-3xl group-hover:bg-[#d97757]/20 transition-all"></div>
          
          <div className="flex items-center gap-3 mb-6 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center border border-orange-500/30">
              <Bot className="text-orange-400" size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold">Anthropic</h3>
              <p className="text-xs text-orange-400 font-mono tracking-wider">CLAUDE 4.7 OPUS</p>
            </div>
          </div>
          <div className="space-y-4 flex-1 relative z-10">
            <div className="bg-white/5 p-3 rounded-xl border border-white/5">
              <h4 className="text-sm font-semibold text-slate-200 mb-1 flex items-center gap-2">
                <Smile size={14} className="text-orange-400" /> Tính chất "Người" nhất
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">Viết lách tự nhiên tuyệt đối, thân thiện, và khả năng lập trình đứng đầu bảng xếp hạng hiện tại.</p>
            </div>
            <div className="bg-white/5 p-3 rounded-xl border border-white/5">
              <h4 className="text-sm font-semibold text-slate-200 mb-1 flex items-center gap-2">
                <Globe size={14} className="text-orange-400" /> Computer Use
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">Tính năng tương lai cho phép AI tự động điều khiển máy tính (di chuột, click, gõ phím).</p>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="mt-8 bg-white/5 rounded-3xl border border-white/10 overflow-hidden backdrop-blur-sm">
        <div className="px-6 py-4 border-b border-white/10 bg-white/5">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <BarChart3 size={18} className="text-indigo-400" /> Bảng So Sánh The Big Three
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="bg-white/5 text-slate-400">
                <th className="px-6 py-4 font-medium border-b border-white/10 w-1/4">Tiêu chí</th>
                <th className="px-6 py-4 font-medium border-b border-white/10 text-blue-400 w-1/4">Google Gemini</th>
                <th className="px-6 py-4 font-medium border-b border-white/10 text-emerald-400 w-1/4">OpenAI GPT</th>
                <th className="px-6 py-4 font-medium border-b border-white/10 text-orange-400 w-1/4">Claude</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              <tr className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-200">Thế mạnh cốt lõi</td>
                <td className="px-6 py-4">Tích hợp sinh thái, Cửa sổ ngữ cảnh khổng lồ</td>
                <td className="px-6 py-4">Suy luận sâu (Reasoning), Hệ sinh thái mở rộng</td>
                <td className="px-6 py-4">Viết văn tự nhiên, Lập trình (Coding), An toàn</td>
              </tr>
              <tr className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-200">Phiên bản hiện tại</td>
                <td className="px-6 py-4">3.1 Pro / Flash</td>
                <td className="px-6 py-4">GPT-5.4 / o3</td>
                <td className="px-6 py-4">4.7 Opus / Sonnet</td>
              </tr>
              <tr className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-200">Tính năng Killer</td>
                <td className="px-6 py-4">Deep Research</td>
                <td className="px-6 py-4">Canvas, Strawberry (o-series)</td>
                <td className="px-6 py-4">Computer Use</td>
              </tr>
              <tr className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-200">Tốc độ & Chi phí</td>
                <td className="px-6 py-4">Tốc độ cực cao (Flash), Rẻ</td>
                <td className="px-6 py-4">Trung bình, Chi phí cao cho bản Pro</td>
                <td className="px-6 py-4">Nhanh (Haiku), Đắt (Opus)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}

function OpenSourceSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm mb-8">
        <p className="text-slate-300 text-sm leading-relaxed">
          Mô hình nguồn mở (Open Source & Open Weights) cho phép cộng đồng nhà phát triển tự do tinh chỉnh (fine-tune) và vận hành trên cơ sở hạ tầng hoặc thiết bị cá nhân, đảm bảo quyền riêng tư và tùy biến tối đa.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Meta Llama */}
        <div className="bg-[#0b101e] rounded-2xl p-6 border border-[#0668E1]/20 hover:border-[#0668E1]/50 transition-colors group">
          <div className="flex items-center gap-3 mb-4">
             <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/30 text-blue-400">
                <Globe size={20} />
             </div>
             <h3 className="text-lg font-bold">Meta (Llama 4)</h3>
          </div>
          <p className="text-sm text-slate-400 mb-4 h-20">
            Tiêu chuẩn vàng cho mã nguồn mở hiện nay. Hiệu suất của dòng Llama 4 đã hoàn toàn tiệm cận với các mô hình trả phí lớn như OpenAI hay Google.
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[10px] uppercase text-slate-300 font-bold">Standard</span>
            <span className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[10px] uppercase text-slate-300 font-bold">Llama 4 400B</span>
          </div>
        </div>

        {/* Mistral */}
        <div className="bg-[#120f0a] rounded-2xl p-6 border border-yellow-500/20 hover:border-yellow-500/50 transition-colors group">
          <div className="flex items-center gap-3 mb-4">
             <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center border border-yellow-500/30 text-yellow-400">
                <Zap size={20} />
             </div>
             <h3 className="text-lg font-bold">Mistral AI</h3>
          </div>
          <p className="text-sm text-slate-400 mb-4 h-20">
            Ngôi sao siêu ưu việt từ Pháp. Mistral Large 3 và Pixtral nổi tiếng với khả năng nhồi nhét hiệu năng cực khủng vào một kích thước mô hình siêu nhỏ, hiệu quả tài nguyên.
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[10px] uppercase text-slate-300 font-bold">Efficiency</span>
            <span className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[10px] uppercase text-slate-300 font-bold">Mistral Large 3</span>
          </div>
        </div>

        {/* DeepSeek */}
        <div className="bg-[#140b0b] rounded-2xl p-6 border border-rose-500/20 hover:border-rose-500/50 transition-colors group">
          <div className="flex items-center gap-3 mb-4">
             <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center border border-rose-500/30 text-rose-400">
                <Cpu size={20} />
             </div>
             <h3 className="text-lg font-bold">DeepSeek AI</h3>
          </div>
          <p className="text-sm text-slate-400 mb-4 h-20">
            Đại diện mạnh mẽ từ Trung Quốc (V3/V4), chuyên biệt đột phá về năng lực giải Toán và Lập trình. Đặc biệt nổi tiếng với mức chi phí vận hành API cực rẻ.
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[10px] uppercase text-slate-300 font-bold">Math & Code</span>
            <span className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[10px] uppercase text-slate-300 font-bold">DeepSeek V4</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function SpecializedSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-8"
    >
      {/* Visual AI */}
      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <ImageIcon className="text-purple-400" /> Tạo Hình Ảnh & Video
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors">
            <h3 className="text-lg font-bold text-slate-100 mb-2">Midjourney v7</h3>
            <p className="text-sm text-slate-400">Độc tôn dẫn đầu thị trường về tính nghệ thuật, sáng tạo concept và độ chi tiết siêu thực cho ảnh tĩnh.</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors">
            <h3 className="text-lg font-bold text-slate-100 mb-2 flex items-center gap-2">
              Sora (OpenAI) <span className="text-slate-500 text-sm font-normal">vs</span> Veo 2 (Google)
            </h3>
            <p className="text-sm text-slate-400">Cuộc cạnh tranh khốc liệt nhất trong mảng chuyển hóa văn bản thành Video chất lượng điện ảnh, chân thực và tuân thủ vật lý.</p>
          </div>
        </div>
      </div>

      {/* Coding AI */}
      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Code className="text-emerald-400" /> Lập trình (Coding Assistants)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors relative overflow-hidden">
             
            <h3 className="text-lg font-bold text-slate-100 mb-2">GitHub Copilot</h3>
            <p className="text-sm text-slate-400 mb-4">Trợ lý lập trình phổ biến và được tin dùng nhất trong các doanh nghiệp, sử dụng sức mạnh lõi từ GPT-5 và Claude 4.</p>
            <div className="flex bg-slate-900 border border-slate-700 rounded-lg p-3 items-center justify-between group">
              <code className="text-xs text-blue-300 font-mono">/explain "how this function works"</code>
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors relative">
            <span className="absolute top-4 right-4 px-2 py-0.5 bg-rose-500 text-white text-[10px] font-bold rounded uppercase animate-pulse">Hot</span>
            <h3 className="text-lg font-bold text-slate-100 mb-2">Cursor IDE</h3>
            <p className="text-sm text-slate-400 mb-4">Trình soạn thảo mã nguồn tích hợp AI đang định hình lại cách Developer code nhờ khả năng đọc hiểu toàn bộ kho lưu trữ (Codebase) dự án.</p>
            <div className="flex bg-slate-900 border border-slate-700 rounded-lg p-3 items-center justify-between group">
              <code className="text-xs text-emerald-300 font-mono">Cmd + K: Generate user authentication</code>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function TrendsSection() {
  const trends = [
    {
      icon: <Shield className="text-blue-400" size={24} />,
      title: "On-device AI (Small Language Models)",
      desc: "Các mô hình ngôn ngữ kích thước nhỏ chạy mượt mà trực tiếp trên điện thoại và laptop mà không cần kết nối internet. Đảm bảo tốc độ phản hồi tính bằng mili-giây và bảo mật dữ liệu tuyệt đối (Zero-data policy).",
      color: "from-blue-500/20"
    },
    {
      icon: <Workflow className="text-purple-400" size={24} />,
      title: "AI Agents (Đại lý tự trị)",
      desc: "Sự tiến hóa từ AI 'chỉ trả lời' sang AI 'thực thi'. Agents có thể tự động duyệt web, đặt vé máy bay, quản lý lịch trình phức tạp hoặc thậm chí là AI kỹ sư tự viết code, tự kiểm thử và tự triển khai lên server.",
      color: "from-purple-500/20"
    },
    {
      icon: <Clock className="text-emerald-400" size={24} />,
      title: "System 2 Reasoning (Suy nghĩ chậm)",
      desc: "Mô hình được thiết kế để 'suy nghĩ' nội tại, lập vạch kế hoạch các bước trước khi bắt đầu phun ra câu trả lời. Giúp càn quét các bài toán logic phức tạp và giảm thiểu tối đa hiện tượng AI 'ảo giác' (nói dối).",
      color: "from-emerald-500/20"
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="max-w-3xl mx-auto"
    >
      <div className="relative border-l border-white/10 pl-8 space-y-12 py-4">
        {trends.map((trend, i) => (
          <div key={i} className="relative group">
            {/* Timeline dot */}
            <div className={`absolute -left-[41px] w-5 h-5 rounded-full border-[4px] border-[#0a0a0f] bg-slate-400 group-hover:scale-125 transition-transform duration-300 flex items-center justify-center`}>
              <div className="w-2 h-2 rounded-full bg-white"></div>
            </div>
            
            <div className={`bg-gradient-to-r ${trend.color} to-transparent p-[1px] rounded-2xl`}>
              <div className="bg-white/5 border border-white/5 rounded-2xl p-6 backdrop-blur-sm group-hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-4 mb-3">
                  <div className="bg-white/5 p-2 rounded-xl">
                    {trend.icon}
                  </div>
                  <h3 className="text-xl font-bold">{trend.title}</h3>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed pl-14">
                  {trend.desc}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
