import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Layers, Brain, CheckCircle, ChevronRight, Zap, Target, Lock, Play, Sparkles } from 'lucide-react';

interface HomeTabProps {
  onStart: () => void;
}

const TYPEWRITER_WORDS = ['GPT-5.4', 'Claude Opus 4.7', 'Gemini 3.1 Pro'];

export default function HomeTab({ onStart }: HomeTabProps) {
  const [wordIndex, setWordIndex] = useState(0);
  const [text, setText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Typewriter Effect
  useEffect(() => {
    const timeout = setTimeout(() => {
      const currentFullWord = TYPEWRITER_WORDS[wordIndex];
      
      if (isDeleting) {
        setText(currentFullWord.substring(0, text.length - 1));
        if (text.length === 0) {
          setIsDeleting(false);
          setWordIndex((prev) => (prev + 1) % TYPEWRITER_WORDS.length);
        }
      } else {
        setText(currentFullWord.substring(0, text.length + 1));
        if (text.length === currentFullWord.length) {
          setTimeout(() => setIsDeleting(true), 2000); // Pause full word for 2s
          return;
        }
      }
    }, isDeleting ? 30 : 60);

    return () => clearTimeout(timeout);
  }, [text, isDeleting, wordIndex]);

  return (
    <div className="bg-slate-950 text-slate-50 w-full h-full overflow-x-hidden overflow-y-auto custom-scrollbar font-sans selection:bg-emerald-500/30 flex flex-col items-center relative">
      {/* Navigation */}
      <div className="sticky top-0 z-50 w-full bg-slate-950/80 backdrop-blur-md border-b border-white/5 flex justify-center">
        <nav className="flex items-center justify-between px-6 py-4 w-full max-w-7xl">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 font-bold shadow-[0_0_15px_rgba(16,185,129,0.5)]">
              <span className="text-sm">P</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-white">Prompt<span className="text-emerald-500">Builder</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#" className="hover:text-emerald-400 transition-colors">Tổng quan</a>
            <a href="#" className="hover:text-emerald-400 transition-colors">Công nghệ</a>
            <a href="#" className="hover:text-emerald-400 transition-colors">Tài nguyên</a>
          </div>
          <div>
            <button 
              onClick={onStart}
              className="px-5 py-2 text-sm font-semibold text-slate-950 bg-white rounded-full hover:bg-slate-200 transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
            >
              Bắt đầu trải nghiệm
            </button>
          </div>
        </nav>
      </div>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 md:pt-48 flex flex-col items-center text-center px-4 w-full">
        {/* Abstract Glowing Backgrounds */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-emerald-500/20 blur-[120px] rounded-[100%] pointer-events-none z-0"></div>
        <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-indigo-500/20 blur-[100px] rounded-[100%] pointer-events-none z-0"></div>

        {/* Headlines */}
        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 z-10 leading-tight max-w-4xl"
        >
          Tạo prompt siêu việt cho <br className="hidden md:block"/>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-indigo-400 relative">
            {text}
            <span className="inline-block w-[3px] md:w-[4px] h-[40px] md:h-[60px] lg:h-[70px] bg-white translate-y-2 md:translate-y-3 ml-1 animate-pulse"></span>
          </span>
        </motion.h1>
        
        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="text-lg md:text-xl text-slate-400 max-w-2xl mb-10 z-10"
        >
          Khám phá nghệ thuật Prompt Engineering thông minh. Cấu trúc hóa, kiểm chứng và nâng cấp quy trình làm việc của bạn trong kỷ nguyên Trí Tuệ Nhân Tạo.
        </motion.p>

        <motion.button 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          onClick={onStart}
          className="group relative px-8 py-4 bg-emerald-500 text-slate-950 font-bold text-lg rounded-full overflow-hidden shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:shadow-[0_0_50px_rgba(16,185,129,0.6)] transition-all z-10"
        >
          <div className="absolute inset-0 w-full h-full bg-emerald-400 group-hover:scale-x-105 transition-transform origin-left"></div>
          <span className="relative flex items-center gap-2">
            Bắt đầu Xây dựng Miễn phí
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </span>
        </motion.button>
        
        {/* Mockup Mini-Builder */}
        <motion.div
           initial={{ opacity: 0, y: 60 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.6, duration: 1, type: "spring", bounce: 0.3 }}
           className="mt-16 w-full max-w-4xl h-[360px] md:h-[480px] bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl relative overflow-hidden flex flex-col z-10"
        >
           {/* Mockup Header window */}
           <div className="h-12 border-b border-white/5 flex items-center px-4 gap-2 bg-slate-950/50">
             <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
             <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
             <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
             <div className="mx-auto flex items-center gap-2 opacity-50">
               <Lock className="w-3 h-3 text-slate-400" />
               <span className="text-xs font-mono text-slate-400">promptbuilder.ai/workspace</span>
             </div>
           </div>
           
           {/* Mockup Body area */}
           <div className="flex-1 p-4 md:p-6 flex flex-col md:flex-row gap-4 relative">
             {/* Source Blocks area */}
             <div className="w-full md:w-1/3 flex flex-col gap-3">
               <motion.div animate={{ y: [0, -4, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="w-full h-24 bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 relative overflow-hidden">
                 <div className="w-16 h-4 bg-rose-500/20 rounded mb-2"></div>
                 <div className="w-full h-2 bg-slate-700/50 rounded mb-1"></div>
                 <div className="w-4/5 h-2 bg-slate-700/50 rounded"></div>
               </motion.div>
               <motion.div animate={{ y: [0, -4, 0] }} transition={{ duration: 4, delay: 0.5, repeat: Infinity, ease: "easeInOut" }} className="w-full h-24 bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 relative overflow-hidden">
                 <div className="w-20 h-4 bg-blue-500/20 rounded mb-2"></div>
                 <div className="w-full h-2 bg-slate-700/50 rounded mb-1"></div>
                 <div className="w-3/5 h-2 bg-slate-700/50 rounded mb-1"></div>
                 <div className="w-4/5 h-2 bg-slate-700/50 rounded"></div>
               </motion.div>
             </div>
             
             {/* Center AI compiler animation */}
             <div className="hidden md:flex flex-col items-center justify-center w-12 shrink-0">
                <ChevronRight className="w-6 h-6 text-slate-600 mb-2" />
                <motion.div 
                  animate={{ rotate: 360 }} 
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  className="w-8 h-8 rounded-full border border-emerald-500/30 flex items-center justify-center text-emerald-400"
                >
                  <Sparkles className="w-4 h-4" />
                </motion.div>
                <ChevronRight className="w-6 h-6 text-slate-600 mt-2" />
             </div>

             {/* Output Area */}
             <div className="flex-1 bg-slate-950/50 border border-white/5 rounded-xl p-4 flex flex-col">
               <div className="flex justify-between items-center mb-4">
                 <div className="text-sm font-semibold text-emerald-400 flex items-center gap-2"><Play className="w-3 h-3 fill-emerald-400" /> Compiled Output</div>
                 <div className="text-xs text-slate-500 font-mono">1.2s</div>
               </div>
               <div className="flex-1 relative">
                 {/* Simulated typing output */}
                 <motion.div 
                   initial={{ height: "0%" }}
                   animate={{ height: "100%" }}
                   transition={{ duration: 5, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
                   className="w-full overflow-hidden"
                 >
                    <div className="space-y-3">
                      <div className="w-full h-2 bg-slate-600 rounded"></div>
                      <div className="w-full h-2 bg-slate-600 rounded"></div>
                      <div className="w-5/6 h-2 bg-slate-600 rounded"></div>
                      <div className="w-full h-2 bg-slate-600 rounded mt-4"></div>
                      <div className="w-4/5 h-2 bg-slate-600 rounded"></div>
                      <div className="w-full h-2 bg-slate-600 rounded"></div>
                    </div>
                 </motion.div>
               </div>
             </div>
           </div>
        </motion.div>
      </section>

      {/* Feature Section 1 */}
      <section className="py-24 px-4 bg-slate-950 relative border-t border-white/5 w-full">
        <div className="max-w-5xl mx-auto text-center mb-16">
           <motion.h2 
             initial={{ opacity: 0, y: 30 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true, margin: "-100px" }}
             className="text-3xl md:text-5xl font-bold tracking-tight mb-4"
           >
             Cấu Trúc Tốt Tạo Ra <span className="text-emerald-500">Kết Quả Chuẩn</span>
           </motion.h2>
           <motion.p
             initial={{ opacity: 0, y: 30 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true, margin: "-100px" }}
             transition={{ delay: 0.2 }}
             className="text-slate-400"
           >
             Xây dựng luồng công việc AI đáng tin cậy với hệ thống chuẩn hóa chuyên nghiệp.
           </motion.p>
        </div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: <Layers className="w-6 h-6" />, title: "Thiết Kế Dạng Khối", desc: "Kéo thả, ghép nối và xây dựng các khối thành phần (Blocks) theo đúng ý tưởng của bạn." },
            { icon: <Zap className="w-6 h-6" />, title: "Nâng Cấp Bằng AI", desc: "Chuyển hóa nhanh chóng các ý tưởng thô thành siêu prompt sắc nét chỉ trong tíc tắc." },
            { icon: <CheckCircle className="w-6 h-6" />, title: "Nhất Quán Dữ Liệu", desc: "Kiểm soát độ ổn định của dữ liệu đầu ra với sự thiết lập biến số độc quyền và mạnh mẽ." }
          ].map((feat, idx) => (
             <motion.div
               key={idx}
               initial={{ opacity: 0, y: 40 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true, margin: "-100px" }}
               transition={{ delay: idx * 0.2 }}
               className="bg-slate-900/50 border border-white/10 rounded-2xl p-8 backdrop-blur-sm hover:bg-slate-800/50 transition-colors group relative overflow-hidden"
             >
               <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
               <div className="w-12 h-12 rounded-xl bg-slate-800 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-6 mx-auto group-hover:scale-110 group-hover:text-emerald-300 transition-all shadow-[0_0_15px_rgba(16,185,129,0)] group-hover:shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                 {feat.icon}
               </div>
               <h3 className="text-lg font-semibold text-center mb-2">{feat.title}</h3>
               <p className="text-sm text-slate-400 text-center leading-relaxed">{feat.desc}</p>
             </motion.div>
          ))}
        </div>
      </section>

      {/* Split Section */}
      <section className="py-24 px-4 bg-slate-900 border-t border-white/5 relative overflow-hidden w-full">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Abstract Orbs */}
          <div className="relative h-[400px] w-full flex items-center justify-center">
             <motion.div 
               animate={{ 
                 scale: [1, 1.1, 1],
                 rotate: [0, 90, 0]
               }}
               transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
               className="absolute w-64 h-64 bg-emerald-500/20 blur-[60px] rounded-full top-10 left-10" 
             />
             <motion.div 
               animate={{ 
                 scale: [1, 1.2, 1],
                 rotate: [0, -90, 0]
               }}
               transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
               className="absolute w-72 h-72 bg-indigo-500/20 blur-[60px] rounded-full bottom-10 right-10" 
             />
             <div className="relative z-10 text-center">
               <motion.h3 
                 initial={{ opacity: 0, scale: 0.9 }}
                 whileInView={{ opacity: 1, scale: 1 }}
                 viewport={{ once: true }}
                 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-white to-slate-400"
               >
                 Siêu Năng Lực AI
               </motion.h3>
             </div>
          </div>

          {/* Right Content */}
          <div>
            <motion.div
               initial={{ opacity: 0, y: 30 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-semibold tracking-wider text-slate-300 uppercase mb-6"
            >
               Giải pháp kiến trúc
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold tracking-tight mb-6"
            >
              Quy trình AI mới cần <span className="text-emerald-500">Tư Duy Mới</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-lg text-slate-400 mb-10"
            >
              Những câu lệnh phi cấu trúc dẫn đến các kết quả mông lung khó đoán. Bằng cách chia tách ý định thành từng mảnh ghép (Vai Trò, Nhiệm Vụ, Bối Cảnh, ĐỊnh Dạng), bạn sẽ khắc chế được ảo giác (hallucination) và tạo ra một siêu công cụ kiếm tiền.
            </motion.p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               {[
                 "Kiểm soát chính xác", "Giảm thiểu 'ảo giác AI'", "Cấu trúc hóa Ngữ cảnh", 
                 "Ngôn ngữ hóa Vai trò", "Nhất quán Format", "Thiết lập Ràng buộc số"
               ].map((item, id) => (
                 <motion.div 
                   key={id}
                   initial={{ opacity: 0, x: -20 }}
                   whileInView={{ opacity: 1, x: 0 }}
                   viewport={{ once: true }}
                   transition={{ delay: id * 0.1 }}
                   className="flex items-center gap-3"
                 >
                   <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                     <ChevronRight className="w-3 h-3" />
                   </div>
                   <span className="text-sm font-medium text-slate-300">{item}</span>
                 </motion.div>
               ))}
            </div>
          </div>

        </div>
      </section>

      {/* AI Compatibility / Models Showcased */}
      <section className="py-24 px-4 bg-slate-950/80 relative border-t border-white/5 w-full">
         <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <motion.div
                 initial={{ opacity: 0, y: 30 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs font-semibold tracking-wider text-slate-300 uppercase mb-6"
              >
                 Kiến trúc phổ quát
              </motion.div>
              <motion.h2 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-3xl md:text-5xl font-bold tracking-tight mb-4"
              >
                Tối ưu hóa cho <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-400 via-amber-400 to-indigo-400">Siêu Mô Hình</span>
              </motion.h2>
              <motion.p
                 initial={{ opacity: 0, y: 30 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ delay: 0.2 }}
                 className="text-slate-400 max-w-2xl mx-auto"
              >
                 Mỗi khung trí tuệ nhân tạo lại có một "khẩu vị" khác nhau. Công cụ của chúng tôi được thiết kế để điều trị và tận dụng tối đa sức mạnh của 3 siêu công cụ này.
              </motion.p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* ChatGPT Card */}
                <motion.div 
                   initial={{ opacity: 0, y: 40 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   viewport={{ once: true, margin: "-100px" }}
                   className="bg-slate-900 border border-teal-500/20 rounded-2xl p-8 relative overflow-hidden group hover:border-teal-500/50 transition-colors"
                >
                   <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 blur-[50px] rounded-full group-hover:bg-teal-500/20 transition-colors"></div>
                   <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center border border-teal-500/30 text-teal-400 font-bold text-xl mb-6 shadow-[0_0_15px_rgba(20,184,166,0.15)]">
                     <Brain className="w-6 h-6" />
                   </div>
                   <h3 className="text-xl font-bold mb-1">OpenAI - ChatGPT</h3>
                   <p className="text-teal-400/80 text-sm font-semibold mb-4">Bộ não Logic (GPT-5.4)</p>
                   <p className="text-slate-400 text-sm leading-relaxed mb-6">
                     Kẻ thống trị đa dụng. Xử lý suy luận logic phức tạp và tư duy toán học cực tốt. Yêu cầu sự rõ ràng tuyệt đối trong mệnh lệnh.
                   </p>
                   <div className="bg-slate-950 rounded-lg p-4 border border-teal-500/10">
                      <p className="text-xs text-slate-500 font-mono mb-2 uppercase tracking-wider">Bí quyết Prompt</p>
                      <ul className="text-sm text-slate-300 space-y-2">
                        <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5"></div> Chỉ thị đa lớp, rõ ràng như mệnh lệnh lập trình.</li>
                        <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5"></div> Khai báo định dạng đầu ra tường minh (Markdown, JSON).</li>
                      </ul>
                   </div>
                </motion.div>

                {/* Claude Card */}
                <motion.div 
                   initial={{ opacity: 0, y: 40 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   viewport={{ once: true, margin: "-100px" }}
                   transition={{ delay: 0.1 }}
                   className="bg-slate-900 border border-amber-500/20 rounded-2xl p-8 relative overflow-hidden group hover:border-amber-500/50 transition-colors"
                >
                   <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-[50px] rounded-full group-hover:bg-amber-500/20 transition-colors"></div>
                   <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center border border-amber-500/30 text-amber-500 font-bold text-xl mb-6 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
                     <Layers className="w-6 h-6" />
                   </div>
                   <h3 className="text-xl font-bold mb-1">Anthropic - Claude</h3>
                   <p className="text-amber-500/80 text-sm font-semibold mb-4">Bậc thầy Ngôn ngữ (Opus 4.7)</p>
                   <p className="text-slate-400 text-sm leading-relaxed mb-6">
                     Văn phong mượt mà như con người, không sáo rỗng. Coding siêu việt. Khả năng tuân thủ cấu trúc nghiêm ngặt nhất.
                   </p>
                   <div className="bg-slate-950 rounded-lg p-4 border border-amber-500/10">
                      <p className="text-xs text-slate-500 font-mono mb-2 uppercase tracking-wider">Bí quyết Prompt</p>
                      <ul className="text-sm text-slate-300 space-y-2">
                        <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5"></div> Phân tách thành phần cấu trúc bằng thẻ &lt;XML&gt;.</li>
                        <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5"></div> Yêu cầu bối cảnh rành mạch, tách biệt hướng dẫn.</li>
                      </ul>
                   </div>
                </motion.div>

                {/* Gemini Card */}
                <motion.div 
                   initial={{ opacity: 0, y: 40 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   viewport={{ once: true, margin: "-100px" }}
                   transition={{ delay: 0.2 }}
                   className="bg-slate-900 border border-indigo-500/20 rounded-2xl p-8 relative overflow-hidden group hover:border-indigo-500/50 transition-colors"
                >
                   <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[50px] rounded-full group-hover:bg-indigo-500/20 transition-colors"></div>
                   <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center border border-indigo-500/30 text-indigo-400 font-bold text-xl mb-6 shadow-[0_0_15px_rgba(99,102,241,0.15)]">
                     <Target className="w-6 h-6" />
                   </div>
                   <h3 className="text-xl font-bold mb-1">Google - Gemini</h3>
                   <p className="text-indigo-400/80 text-sm font-semibold mb-4">Gã khổng lồ Ngữ cảnh (3.1 Pro)</p>
                   <p className="text-slate-400 text-sm leading-relaxed mb-6">
                     Vô địch nhờ bộ nhớ khổng lồ (2 triệu token), phân tích file PDF trăm trang, video, âm thanh dễ dàng không bỏ sót chi tiết.
                   </p>
                   <div className="bg-slate-950 rounded-lg p-4 border border-indigo-500/10">
                      <p className="text-xs text-slate-500 font-mono mb-2 uppercase tracking-wider">Bí quyết Prompt</p>
                      <ul className="text-sm text-slate-300 space-y-2">
                        <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5"></div> Tạo vài ví dụ mẫu (Few-shot prompting).</li>
                        <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5"></div> Đặt câu hỏi truy vấn ở vị trí cuối cùng của chuỗi cấu trúc.</li>
                      </ul>
                   </div>
                </motion.div>
            </div>
         </div>
      </section>

      {/* Footer / CTA Section */}
      <section className="py-24 px-4 bg-slate-950 text-center relative overflow-hidden w-full">
        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
             <motion.div
               key={`particle-${i}`}
               initial={{ opacity: 0, y: "100vh" }}
               animate={{ opacity: [0, 1, 0], y: "-100vh" }}
               transition={{ 
                 duration: Math.random() * 10 + 10,
                 repeat: Infinity,
                 delay: Math.random() * 5,
                 ease: "linear"
               }}
               className="absolute w-2 h-2 rounded-full bg-emerald-500/40"
               style={{ left: `${Math.random() * 100}%` }}
             />
          ))}

        <div className="max-w-3xl mx-auto relative z-10">
          <motion.h2 
             initial={{ opacity: 0, y: 30 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             className="text-4xl font-bold mb-6"
          >
             Viết lại tương lai của sự chính xác với <span className="text-emerald-500">Verifiable Compose</span>
          </motion.h2>
          <motion.p
             initial={{ opacity: 0, y: 30 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             transition={{ delay: 0.1 }}
             className="text-slate-400 mb-10"
          >
             Tham gia ngay vào xu hướng phát triển ứng dụng trí tuệ nhân tạo. Bắt đầu thiết kế những siêu prompt ngày hôm nay.
          </motion.p>
          <motion.button 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            onClick={onStart}
            className="px-8 py-4 bg-white text-slate-950 font-bold rounded-full overflow-hidden shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:scale-105 transition-transform"
          >
            Mở Giao Diện Thiết Kế Ngay
          </motion.button>
        </div>
      </section>
    </div>
  );
}
