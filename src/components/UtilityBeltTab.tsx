import React, { Suspense, lazy, useMemo, useState } from 'react';
import { Sparkles, Zap, Package, Send, Loader2, ArrowRight, Save, FolderKanban } from 'lucide-react';
import { DAILY_PACKS, PROJECT_SETUP_PACKS } from '../data';
import { PromptTemplate } from '../types';
import { generateQuickResponse } from '../services/aiService';
import { User } from 'firebase/auth';

const AIResponseRenderer = lazy(() => import('./AIResponseRenderer'));

interface UtilityBeltTabProps {
  user: User | null;
  onSaveTemplate?: (template: PromptTemplate) => Promise<void>;
}

type PackGroup = 'project' | 'daily';

const packGroupMeta: Record<
  PackGroup,
  {
    title: string;
    description: string;
    icon: React.ReactNode;
    saveLabel: string;
    emptyPrompt: string;
  }
> = {
  project: {
    title: 'Project Setup Packs',
    description: 'Bo setup packs cho cac project ChatGPT de giu context, quy tac lam viec va cach phoi hop voi AI mot cach chuyen nghiep.',
    icon: <FolderKanban size={18} />,
    saveLabel: 'Luu Project Packs',
    emptyPrompt: 'Nhap mo ta project hoac task dau tien cua ban...'
  },
  daily: {
    title: 'Daily Setup Packs',
    description: 'Nhung pack nho gon cho cac tac vu thuong ngay, vao viec nhanh voi mot input ngan va mot bo khung ngam.',
    icon: <Package size={18} />,
    saveLabel: 'Luu Daily Packs',
    emptyPrompt: 'Nhap cau lenh ngan (vd: Len lich tap gym 3 ngay)...'
  }
};

export default function UtilityBeltTab({ user, onSaveTemplate }: UtilityBeltTabProps) {
  const [inputText, setInputText] = useState('');
  const [selectedPack, setSelectedPack] = useState<PromptTemplate | null>(null);
  const [activePackGroup, setActivePackGroup] = useState<PackGroup>('project');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [response, setResponse] = useState('');

  const activePacks = useMemo(
    () => (activePackGroup === 'project' ? PROJECT_SETUP_PACKS : DAILY_PACKS),
    [activePackGroup]
  );

  const activeMeta = packGroupMeta[activePackGroup];

  const handleSeed = async () => {
    if (!user || !onSaveTemplate) return;

    setIsSeeding(true);
    let successCount = 0;

    try {
      for (const pack of activePacks) {
        const newPack = { ...pack, id: `pack-${user.uid}-${pack.id}`, version: 'v1.0' };
        await onSaveTemplate(newPack);
        successCount++;
      }
      alert(`Da luu thanh cong ${successCount} packs vao thu vien ca nhan cua ban.`);
    } catch (error) {
      console.error(error);
      alert('Da co loi xay ra khi luu. Vui long thu lai.');
    } finally {
      setIsSeeding(false);
    }
  };

  const handleSelectPack = (pack: PromptTemplate) => {
    setSelectedPack(pack);
    const taskBlock = pack.blocks.find((block) => block.type === 'task' || block.type === 'objective');
    if (!taskBlock) {
      setInputText('');
      return;
    }

    const match = taskBlock.content.match(/\{\{([^}]+)\}\}/);
    setInputText(match ? `[Thay the o day: ${match[1]}]` : '');
  };

  const handleSubmit = async () => {
    if (!inputText.trim() || isGenerating) return;

    let finalPrompt = inputText;
    if (selectedPack) {
      finalPrompt = `Dua tren setup pack: ${selectedPack.title}. Thong tin them/brief cua toi: ${inputText}`;
    }

    setIsGenerating(true);
    setResponse('');

    try {
      const packBlocks = selectedPack
        ? selectedPack.blocks.map((block) => ({
            type: block.type,
            title: block.title,
            content: block.content
          }))
        : undefined;

      await generateQuickResponse(finalPrompt, packBlocks, (chunk) => {
        setResponse((previous) => previous + chunk);
      });
    } catch (error) {
      console.error('Loi AI:', error);
      setResponse('Da xay ra loi khi tao phan hoi. Vui long thu lai.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#FAFAFA] overflow-y-auto">
      <div className="flex-none p-6 md:p-8 2xl:px-12 2xl:py-10 mx-auto w-full max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-2 flex items-center gap-3">
            <Zap className="text-amber-500 fill-amber-500" size={32} />
            The Utility Belt
          </h1>
          <p className="text-slate-500 font-medium">
            Chon setup pack phu hop, boi context ngam vao prompt va bien mot chat session thanh mot workflow lam viec co cau truc.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-1.5 md:p-2 flex flex-col mb-10 ring-1 ring-black/5 hover:ring-emerald-500/30 transition-all focus-within:ring-emerald-500 focus-within:shadow-md">
          {selectedPack && (
            <div className="flex items-center gap-2 px-4 pt-3 pb-1">
              <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5 border border-emerald-200">
                <Package size={14} />
                Goi: {selectedPack.title}
                <button
                  onClick={() => {
                    setSelectedPack(null);
                    setInputText('');
                  }}
                  className="ml-1 hover:text-rose-600 rounded-full bg-emerald-200/50 p-0.5"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </svg>
                </button>
              </span>
            </div>
          )}

          <div className="flex bg-white rounded-xl relative pl-2 pr-2">
            <textarea
              value={inputText}
              onChange={(event) => setInputText(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={selectedPack ? `Thay the brief cho goi ${selectedPack.title}...` : activeMeta.emptyPrompt}
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
              Invisible structure se tu dong duoc them vao de giu chat session chat che hon.
            </div>
          )}
        </div>

        {response && (
          <div className="mb-10">
            <Suspense fallback={<ResponseRendererSkeleton />}>
              <AIResponseRenderer content={response} />
            </Suspense>
          </div>
        )}

        <div>
          <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <PackGroupButton
                  active={activePackGroup === 'project'}
                  onClick={() => {
                    setActivePackGroup('project');
                    setSelectedPack(null);
                    setInputText('');
                  }}
                >
                  Project Packs
                </PackGroupButton>
                <PackGroupButton
                  active={activePackGroup === 'daily'}
                  onClick={() => {
                    setActivePackGroup('daily');
                    setSelectedPack(null);
                    setInputText('');
                  }}
                >
                  Daily Packs
                </PackGroupButton>
              </div>
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <span className="text-emerald-500">{activeMeta.icon}</span>
                {activeMeta.title}
              </h2>
              <p className="text-sm text-slate-500 mt-1 max-w-3xl">{activeMeta.description}</p>
            </div>
            {user && (
              <button
                onClick={handleSeed}
                disabled={isSeeding}
                className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider bg-slate-900 text-white px-3 py-2 rounded-lg hover:bg-slate-800 disabled:opacity-50 transition-colors"
              >
                {isSeeding ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                {activeMeta.saveLabel}
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {activePacks.map((pack) => (
              <div
                key={pack.id}
                onClick={() => handleSelectPack(pack)}
                className="bg-white border text-left border-slate-200 rounded-2xl p-5 hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer group flex flex-col h-full"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="font-bold text-slate-900 group-hover:text-emerald-600 transition-colors uppercase text-sm tracking-wide">
                    {pack.title}
                  </h3>
                  <span className="shrink-0 text-[10px] font-bold px-2 py-1 rounded-full bg-slate-100 text-slate-500">
                    {activePackGroup === 'project' ? 'PROJECT' : 'DAILY'}
                  </span>
                </div>
                <p className="text-slate-500 text-sm leading-relaxed mb-4 flex-1 line-clamp-4">
                  {pack.description}
                </p>
                {(pack.tags && pack.tags.length > 0) && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {pack.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="text-[10px] font-semibold px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex items-center text-xs font-semibold text-emerald-600 justify-between mt-auto pt-4 border-t border-slate-100">
                  <span>Su dung goi</span>
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

function PackGroupButton({
  active,
  onClick,
  children
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-2 rounded-full text-xs font-semibold transition-colors ${
        active
          ? 'bg-slate-900 text-white'
          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
      }`}
    >
      {children}
    </button>
  );
}

function ResponseRendererSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="h-5 w-40 rounded-full bg-slate-200" />
      <div className="mt-4 space-y-3">
        <div className="h-4 w-full rounded-full bg-slate-100" />
        <div className="h-4 w-11/12 rounded-full bg-slate-100" />
        <div className="h-4 w-9/12 rounded-full bg-slate-100" />
        <div className="mt-6 h-40 rounded-xl bg-slate-100" />
      </div>
    </div>
  );
}
