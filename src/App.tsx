/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { TabType, PromptTemplate, Workspace, AiPersona } from './types';
import { Layers, Library, Sparkles, Home, LogIn, LogOut } from 'lucide-react';
import LibraryTab from './components/LibraryTab';
import BuilderTab from './components/BuilderTab';
import EnhancerTab from './components/EnhancerTab';
import HomeTab from './components/HomeTab';
import AIFutureTab from './components/AIFutureTab';
import { auth, db, loginWithGoogle, logoutUser, handleFirestoreError } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, query, where, getDocs, setDoc, doc, serverTimestamp, getDocFromServer } from 'firebase/firestore';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [loadedTemplate, setLoadedTemplate] = useState<PromptTemplate | null>(null);
  const [customTemplates, setCustomTemplates] = useState<PromptTemplate[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);

  // Hardcoded UI for Workspaces & Personas to demonstrate the concept (Direction 1 & 4)
  const defaultWorkspaces: Workspace[] = [
    { id: 'w1', name: '🏢 Công Sở (Dự án chính)' },
    { id: 'w2', name: '🏠 Cá Nhân (Freelance)' }
  ];
  const defaultPersonas: AiPersona[] = [
    { id: 'p1', name: 'Senior Coder', systemInstructions: 'Bạn là chuyên gia lập trình 15 năm kinh nghiệm.\n- Luôn viết code bằng TypeScript.\n- Bỏ qua các giải thích rườm rà (ví dụ: "Vâng, tôi hiểu rồi...").\n- Xử lý lỗi (error handling) đầy đủ trong code.' },
    { id: 'p2', name: 'Copywriter Xuất sắc', systemInstructions: 'Bạn là bậc thầy viết quảng cáo và Copywriter.\n- Hành văn lôi cuốn, hiện đại, không sử dụng từ ngữ sáo rỗng.\n- Bài viết luôn kết thúc bằng một Lời Kêu Gọi Hành Động (CTA).\n- Sử dụng Markdown để in đậm từ khóa quan trọng.' },
    { id: 'p3', name: 'Nhà Phân Tích Data', systemInstructions: 'Bạn là nhà phân tích dữ liệu vô cảm và chính xác tuyệt đối.\n- Dựa trên dữ liệu được cho, không suy diễn.\n- Trình bày tất cả kết quả bằng Bảng (Markdown Table).' }
  ];

  const [workspaces] = useState<Workspace[]>(defaultWorkspaces);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState('w1');
  
  const [personas] = useState<AiPersona[]>(defaultPersonas);
  const [activePersonaId, setActivePersonaId] = useState<string>('');

  useEffect(() => {
    // Connection test as per instructions
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if(error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration.");
        }
      }
    }
    testConnection();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!authReady) return;

    // Fetch templates (both public and personal)
    const fetchTemplates = async () => {
      try {
        // Build an array of queries to run
        const queriesToRun = [];
        
        // 1. Always fetch public templates
        queriesToRun.push(query(collection(db, 'templates'), where('isPublic', '==', true)));
        
        // 2. If logged in, fetch personal templates that might NOT be public
        if (user) {
          queriesToRun.push(query(collection(db, 'templates'), where('userId', '==', user.uid), where('isPublic', '==', false)));
        }

        const templatesData: PromptTemplate[] = [];
        const seenIds = new Set(); // Prevent duplicates

        for (const q of queriesToRun) {
           const querySnapshot = await getDocs(q);
           querySnapshot.forEach((docSnap) => {
             if (!seenIds.has(docSnap.id)) {
               seenIds.add(docSnap.id);
               const data = docSnap.data();
               templatesData.push({
                 id: docSnap.id,
                 title: data.title,
                 description: data.description || '',
                 category: data.category,
                 blocks: data.blocks || [],
                 tags: data.tags || [],
                 language: data.language,
                 isPublic: data.isPublic,
                 status: data.status,
                 version: data.version,
                 metrics: data.metrics,
                 variables: data.variables,
                 aiConfig: data.aiConfig,
                 authorName: data.authorName,
               });
             }
           });
        }
        setCustomTemplates(templatesData);
      } catch (err) {
        try {
          handleFirestoreError(err, 'list');
        } catch (handlerErr: any) {
          console.error("Failed to load templates:", handlerErr.message);
        }
      }
    };

    fetchTemplates();
  }, [user, authReady]);

  const handleSelectTemplate = (template: PromptTemplate) => {
    setLoadedTemplate(template);
    setActiveTab('builder');
  };

  const handleSaveTemplate = async (template: PromptTemplate) => {
    if (!user) {
      alert("Please login to save templates.");
      return;
    }

    try {
      const templateId = template.id; // comes from local generation
      const templateRef = doc(db, 'templates', templateId);
      
      const firestoreData = {
        userId: user.uid,
        title: template.title,
        description: template.description || '',
        category: template.category || 'Mẫu của tôi',
        blocks: template.blocks,
        tags: template.tags || [],
        language: template.language || 'vi',
        isPublic: template.isPublic || false,
        status: template.status || 'Published',
        version: template.version || 'v1.0',
        authorId: user.uid,
        authorName: user.displayName || user.email?.split('@')[0] || 'Unknown',
        metrics: template.metrics || { usageCount: 0, upvotes: 0 },
        variables: template.variables || [],
        aiConfig: template.aiConfig || { recommendedModels: ['gemini-1.5-pro'], temperature: 0.7 },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await setDoc(templateRef, firestoreData);
      
      setCustomTemplates([...customTemplates, template]);
      setActiveTab('library');
    } catch (err) {
      try {
        handleFirestoreError(err, 'create', `templates/${template.id}`);
      } catch (handlerErr: any) {
        console.error("Failed to save template:", handlerErr.message);
        alert("Có lỗi xảy ra khi lưu template.");
      }
    }
  };

  if (activeTab === 'home') {
    return <HomeTab onStart={() => setActiveTab('builder')} />;
  }

  return (
    <div className="flex flex-col flex-1 h-full w-full bg-slate-50 text-slate-900 font-sans overflow-hidden md:flex-row">
      {/* Header/Sidebar Navigation */}
      <nav className="w-full border-b border-slate-200 bg-white flex p-3 shrink-0 z-[60] transition-all duration-300 md:w-64 md:border-b-0 md:border-r md:flex-col md:p-4 justify-between items-center md:items-stretch md:justify-start">
        <div className="flex items-center space-x-3 cursor-pointer md:mb-6 md:px-2" onClick={() => setActiveTab('home')}>
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white font-bold text-lg shadow-sm">
            <span className="text-sm">P</span>
          </div>
          <h1 className="text-lg md:text-xl font-bold tracking-tight">Prompt<span className="text-emerald-500">Builder</span></h1>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex flex-col space-y-1 flex-1">
          <div className="mb-4 px-2">
            <h3 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">Workspace</h3>
            <select
               value={activeWorkspaceId}
               onChange={(e) => setActiveWorkspaceId(e.target.value)}
               className="w-full text-xs bg-slate-100 border border-slate-200 text-slate-700 font-semibold rounded-md px-2 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            >
               {workspaces.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </div>
          
          <NavItem 
            icon={<Home size={18} />} 
            label="Home" 
            isActive={activeTab === 'home'} 
            onClick={() => setActiveTab('home')} 
          />
          <NavItem 
            icon={<Layers size={18} />} 
            label="Prompt Builder" 
            isActive={activeTab === 'builder'} 
            onClick={() => setActiveTab('builder')} 
          />
          <NavItem 
            icon={<Library size={18} />} 
            label="Template Library" 
            isActive={activeTab === 'library'} 
            onClick={() => setActiveTab('library')} 
          />
          <NavItem 
            icon={<Sparkles size={18} />} 
            label="AI Enhancer" 
            isActive={activeTab === 'enhancer'} 
            onClick={() => setActiveTab('enhancer')} 
          />
          <NavItem 
            icon={<Sparkles size={18} />} 
            label="AI and Future" 
            isActive={activeTab === 'aifuture'} 
            onClick={() => setActiveTab('aifuture')} 
          />
        </div>

        {/* Mobile Nav */}
        <div className="flex items-center gap-1 md:hidden">
             <button 
                onClick={() => setActiveTab('builder')}
                className={`p-2 rounded-lg touch-manipulation ${activeTab === 'builder' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-500 hover:bg-slate-50'}`}
             >
                <Layers size={20} />
             </button>
             <button 
                onClick={() => setActiveTab('library')}
                className={`p-2 rounded-lg touch-manipulation ${activeTab === 'library' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-500 hover:bg-slate-50'}`}
             >
                <Library size={20} />
             </button>
             <button 
                onClick={() => setActiveTab('enhancer')}
                className={`p-2 rounded-lg touch-manipulation ${activeTab === 'enhancer' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-500 hover:bg-slate-50'}`}
             >
                <Sparkles size={20} />
             </button>
             <button 
                onClick={() => setActiveTab('aifuture')}
                className={`p-2 rounded-lg touch-manipulation ${activeTab === 'aifuture' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-500 hover:bg-slate-50'}`}
             >
                <Sparkles size={20} />
             </button>
        </div>
        
        <div className="hidden md:block mt-auto px-2 border-t border-slate-100 pt-4">
          {user ? (
            <div className="flex flex-col gap-2">
              <div className="text-xs font-semibold text-slate-700 truncate px-1">
                {user.email}
              </div>
              <button 
                onClick={logoutUser}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors w-full"
              >
                <LogOut size={14} />
                Đăng xuất
              </button>
            </div>
          ) : (
            <button 
              onClick={loginWithGoogle}
              className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-white bg-slate-900 shadow-sm hover:bg-slate-800 rounded-lg transition-colors w-full justify-center"
            >
              <LogIn size={15} />
              Đăng nhập lưu Data
            </button>
          )}
          <p className="text-[10px] font-medium text-slate-400 mt-4 px-1">V2.4 INTERNATIONAL STD</p>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative bg-slate-50 w-full h-full overflow-hidden">
        {activeTab === 'builder' && <BuilderTab initialTemplate={loadedTemplate} personas={personas} activePersonaId={activePersonaId} setActivePersonaId={setActivePersonaId} onSaveTemplate={handleSaveTemplate} />}
        {activeTab === 'library' && <LibraryTab onSelectTemplate={handleSelectTemplate} customTemplates={customTemplates} />}
        {activeTab === 'enhancer' && <EnhancerTab onApplyTemplate={handleSelectTemplate} />}
        {activeTab === 'aifuture' && <AIFutureTab />}
      </main>
    </div>
  );
}

function NavItem({ icon, label, isActive, onClick }: { icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md transition-colors text-xs font-medium
        ${isActive 
          ? 'bg-emerald-50 text-emerald-700' 
          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 cursor-pointer'
        }
      `}
    >
      <span className={isActive ? 'text-emerald-600' : 'text-slate-400'}>{icon}</span>
      <span>{label}</span>
    </button>
  );
}

