import React, { useState, useEffect, useRef } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { AVAILABLE_BLOCKS, BLOCK_SUGGESTIONS } from '../data';
import { PromptBlock, PromptTemplate, AiPersona } from '../types';
import { GripVertical, Plus, Trash2, Copy, Check, X, Layers, Save, Sparkles, Wand2, Square, ChevronDown, AlignLeft, Minimize2, Briefcase, Smile, Menu, ChevronRight, User, Pin, SplitSquareHorizontal, Image as ImageIcon, Upload, Loader2 } from 'lucide-react';
import { generateAutoBlockStream, autoFillVariables, generateContentForExistingBlocks, generatePromptFromImage, type AiActionType } from '../services/aiService';

interface BuilderTabProps {
  initialTemplate: PromptTemplate | null;
  personas: AiPersona[];
  activePersonaId: string;
  setActivePersonaId: (id: string) => void;
  onSaveTemplate?: (template: PromptTemplate) => void;
}

const TYPE_STYLES: Record<string, { badge: string, border: string }> = {
  role: { badge: 'text-blue-700 bg-blue-50 ring-blue-500/30', border: 'border-l-blue-500' },
  task: { badge: 'text-orange-700 bg-orange-50 ring-orange-500/30', border: 'border-l-orange-500' },
  context: { badge: 'text-emerald-700 bg-emerald-50 ring-emerald-500/30', border: 'border-l-emerald-500' },
  input_data: { badge: 'text-indigo-700 bg-indigo-50 ring-indigo-500/30', border: 'border-l-indigo-500' },
  thinking: { badge: 'text-amber-700 bg-amber-50 ring-amber-500/30', border: 'border-l-amber-500' },
  format: { badge: 'text-purple-700 bg-purple-50 ring-purple-500/30', border: 'border-l-purple-500' },
  tone: { badge: 'text-pink-700 bg-pink-50 ring-pink-500/30', border: 'border-l-pink-500' },
  constraints: { badge: 'text-rose-700 bg-rose-50 ring-rose-500/30', border: 'border-l-rose-500' },
  example: { badge: 'text-cyan-700 bg-cyan-50 ring-cyan-500/30', border: 'border-l-cyan-500' },
  self_correction: { badge: 'text-fuchsia-700 bg-fuchsia-50 ring-fuchsia-500/30', border: 'border-l-fuchsia-500' },
  anchor: { badge: 'text-teal-700 bg-teal-50 ring-teal-500/30', border: 'border-l-teal-500' },
  objective: { badge: 'text-rose-700 bg-rose-50 ring-rose-500/30', border: 'border-l-rose-500' },
  audience: { badge: 'text-amber-700 bg-amber-50 ring-amber-500/30', border: 'border-l-amber-500' },
  experience: { badge: 'text-lime-700 bg-lime-50 ring-lime-500/30', border: 'border-l-lime-500' },
  challenge: { badge: 'text-red-700 bg-red-50 ring-red-500/30', border: 'border-l-red-500' },
  steps: { badge: 'text-emerald-700 bg-emerald-50 ring-emerald-500/30', border: 'border-l-emerald-500' },
  custom: { badge: 'text-slate-700 bg-slate-50 ring-slate-500/30', border: 'border-l-slate-400' },
};

export default function BuilderTab({ initialTemplate, personas, activePersonaId, setActivePersonaId, onSaveTemplate }: BuilderTabProps) {
  const [blocks, setBlocks] = useState<PromptBlock[]>([]);
  const [copied, setCopied] = useState(false);
  const [copiedRaw, setCopiedRaw] = useState(false);
  const [copiedSystem, setCopiedSystem] = useState(false);
  const [copiedUser, setCopiedUser] = useState(false);
  const [globalTheme, setGlobalTheme] = useState<string>('empty');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [templateTitle, setTemplateTitle] = useState('');
  const [templateDesc, setTemplateDesc] = useState('');
  const [templateCategory, setTemplateCategory] = useState('Mẫu của tôi');
  const [templateTags, setTemplateTags] = useState('');
  const [templateLanguage, setTemplateLanguage] = useState('vi');
  const [isPublicTemplate, setIsPublicTemplate] = useState(false);

  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  const [generatingBlocks, setGeneratingBlocks] = useState<Record<string, boolean>>({});
  const [detailLevel, setDetailLevel] = useState<number>(3);
  const [openAiMenuId, setOpenAiMenuId] = useState<string | null>(null);

  // Quick prompt states
  const [isQuickPromptModalOpen, setIsQuickPromptModalOpen] = useState(false);
  const [quickPromptTopic, setQuickPromptTopic] = useState('');
  const [quickPromptFramework, setQuickPromptFramework] = useState('claude_xmd');
  const [isGeneratingQuickPrompt, setIsGeneratingQuickPrompt] = useState(false);

  // Image to prompt states
  const [isImagePromptModalOpen, setIsImagePromptModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedImageMime, setSelectedImageMime] = useState<string | null>(null);
  const [isGeneratingFromImage, setIsGeneratingFromImage] = useState(false);

  // Auto-fill and profile states
  const [isAutoFilling, setIsAutoFilling] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [userProfile, setUserProfile] = useState(() => localStorage.getItem('userProfile') || '');

  // Mobile specific state
  const [showMobilePanel, setShowMobilePanel] = useState<'build' | 'preview'>('build');
  const [previewMode, setPreviewMode] = useState<'combined' | 'split'>('combined');
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [expandedBlocks, setExpandedBlocks] = useState<Record<string, boolean>>({});

  const toggleBlockExpansion = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setExpandedBlocks(prev => ({ ...prev, [id]: !prev[id] }));
  };

  useEffect(() => {
    // When a new block is added, expand it by default
    const latestBlock = blocks[blocks.length - 1];
    if (latestBlock && expandedBlocks[latestBlock.id] === undefined) {
      setExpandedBlocks(prev => ({ ...prev, [latestBlock.id]: true }));
    }
  }, [blocks.length]);

  interface ExtractedVar {
    name: string;
    options?: string[];
    raw: string;
  }

  // Helper to extract variables like {{Language:Vi,En}} or {{Name}}
  const getVariablesFromBlocks = (blocksArgs: PromptBlock[]): ExtractedVar[] => {
    const list: ExtractedVar[] = [];
    const seen = new Set<string>();
    
    blocksArgs.forEach(b => {
      const matches = b.content.match(/\{\{([^}]+)\}\}/g);
      if (matches) {
        matches.forEach(m => {
          const inner = m.slice(2, -2).trim();
          const parts = inner.split(':');
          const name = parts[0].trim();
          if (!seen.has(name)) {
            seen.add(name);
            const options = parts.length > 1 ? parts[1].split(',').map(o => o.trim()) : undefined;
            list.push({ name, options, raw: m });
          }
        });
      }
    });
    return list;
  };

  const allVariables = getVariablesFromBlocks(blocks);

  // Helper to replace variables with user values
  const injectVariables = (text: string) => {
    return text.replace(/\{\{([^}]+)\}\}/g, (match, varInner) => {
      const parts = varInner.trim().split(':');
      const name = parts[0].trim();
      return variableValues[name] || (parts.length > 1 ? parts[1].split(',')[0].trim() : match);
    });
  };

  const handleSaveProfile = (newProfile: string) => {
    setUserProfile(newProfile);
    localStorage.setItem('userProfile', newProfile);
    setIsProfileModalOpen(false);
  };

  const handleAutoFill = async () => {
    if (allVariables.length === 0 || blocks.length === 0) return;
    setIsAutoFilling(true);
    try {
      const templateContext = blocks.map(b => `[${b.title}]: ${b.content}`).join('\n');
      const varNames = allVariables.map(v => v.name);
      const filledData = await autoFillVariables(userProfile, templateContext, varNames);
      
      setVariableValues(prev => ({
        ...prev,
        ...filledData
      }));
    } catch (err) {
      console.error("Auto Fill Failed", err);
      alert("Tính năng điền tự động AI đang gặp lỗi, vui lòng thử lại sau.");
    } finally {
      setIsAutoFilling(false);
    }
  };

  useEffect(() => {
    if (initialTemplate) {
      const newBlocks = initialTemplate.blocks.map(b => ({...b, id: `${b.id}-${Date.now()}`}));
      setBlocks(prev => {
        // Keep pinned blocks and append the new template blocks
        const pinned = prev.filter(p => p.isPinned);
        return [...pinned, ...newBlocks];
      });
      const expandState: Record<string, boolean> = {};
      newBlocks.forEach(b => expandState[b.id] = true);
      setExpandedBlocks(prev => ({ ...prev, ...expandState }));
    }
  }, [initialTemplate]);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    if (result.source.droppableId === 'available-blocks' && result.destination.droppableId === 'builder-area') {
      // Adding new block
      const itemToAdd = AVAILABLE_BLOCKS[result.source.index];
      addBlock(itemToAdd.type, result.destination.index);
    } else if (result.source.droppableId === 'builder-area' && result.destination.droppableId === 'builder-area') {
      // Reordering
      const newBlocks = Array.from(blocks);
      const [reorderedItem] = newBlocks.splice(result.source.index, 1);
      newBlocks.splice(result.destination.index, 0, reorderedItem);
      setBlocks(newBlocks);
    }
  };

  const addBlock = (blockType: string, atIndex?: number) => {
    const itemToAdd = AVAILABLE_BLOCKS.find(b => b.type === blockType);
    if (!itemToAdd) return;

    const initialContent = globalTheme !== 'empty' && BLOCK_SUGGESTIONS[blockType] 
      ? BLOCK_SUGGESTIONS[blockType][globalTheme] || ''
      : '';

    const newBlock: PromptBlock = {
      id: `${itemToAdd.type}-${Date.now()}`,
      type: itemToAdd.type,
      title: itemToAdd.title,
      content: initialContent
    };

    setBlocks(prev => {
        const newBlocks = [...prev];
        if (atIndex !== undefined) {
             newBlocks.splice(atIndex, 0, newBlock);
        } else {
             newBlocks.push(newBlock);
        }
        return newBlocks;
    });
    setExpandedBlocks(prev => ({ ...prev, [newBlock.id]: true }));
    setIsBottomSheetOpen(false); // Close bottom sheet on mobile if open
  };

  const removeBlock = (id: string) => {
    setBlocks(blocks.filter(b => b.id !== id));
  };

  const togglePin = (id: string) => {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, isPinned: !b.isPinned } : b));
  };

  const updateBlockContent = (id: string, content: string) => {
    setBlocks(blocks.map(b => b.id === id ? { ...b, content } : b));
  };

  const handleAiAssist = async (block: PromptBlock, actionType: AiActionType = 'auto') => {
    setGeneratingBlocks(prev => ({ ...prev, [block.id]: true }));
    setExpandedBlocks(prev => ({ ...prev, [block.id]: true })); // Expand if collapsed
    setOpenAiMenuId(null);
    const contextBlocks = blocks.filter(b => b.id !== block.id).map(b => ({ title: b.title, content: b.content }));
    
    let accumulatedText = "";
    let isFirstChunk = true;
    
    // Do NOT clear immediately, show a small visual queue that AI is thinking by fading text temporarily
    // The actual replacing happens on the very first chunk

    try {
      await generateAutoBlockStream(
        block.type, 
        block.title, 
        block.content, 
        contextBlocks,
        actionType,
        detailLevel,
        (chunk) => {
          if (isFirstChunk) {
            isFirstChunk = false;
            accumulatedText = chunk; // Override whatever was there
          } else {
            accumulatedText += chunk;
          }
          setBlocks(prev => prev.map(b => b.id === block.id ? { ...b, content: accumulatedText } : b));
        }
      );
    } catch (error) {
       console.error(error);
    } finally {
      setGeneratingBlocks(prev => ({ ...prev, [block.id]: false }));
    }
  };

  const handleGenerateQuickPrompt = async () => {
    if (!quickPromptTopic.trim() || blocks.length === 0) return;
    setIsGeneratingQuickPrompt(true);
    
    try {
      const blocksInfo = blocks.map(b => ({ id: b.id, type: b.type, title: b.title }));
      const resultObj = await generateContentForExistingBlocks(quickPromptTopic, blocksInfo);
      
      setBlocks(prevBlocks => prevBlocks.map(b => {
        if (resultObj[b.id]) {
          return { ...b, content: resultObj[b.id] };
        }
        return b;
      }));
      
      const expandState: Record<string, boolean> = {};
      blocks.forEach(b => {
        if (resultObj[b.id]) expandState[b.id] = true;
      });
      setExpandedBlocks(prev => ({ ...prev, ...expandState }));
      setIsQuickPromptModalOpen(false);
      setQuickPromptTopic('');
    } catch (e) {
      console.error(e);
      alert("Đã có lỗi xảy ra khi tự động điền. Vui lòng thử lại.");
    } finally {
      setIsGeneratingQuickPrompt(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn một tệp hình ảnh (JPEG, PNG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      const base64Data = result.split(',')[1];
      setSelectedImage(base64Data);
      setSelectedImageMime(file.type);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateFromImage = async () => {
    if (!selectedImage || !selectedImageMime || blocks.length === 0) return;
    setIsGeneratingFromImage(true);
    
    try {
      const blocksInfo = blocks.map(b => ({ id: b.id, type: b.type, title: b.title }));
      const resultObj = await generatePromptFromImage(selectedImage, selectedImageMime, blocksInfo);
      
      setBlocks(prevBlocks => prevBlocks.map(b => {
        if (resultObj[b.id]) {
          return { ...b, content: resultObj[b.id] };
        }
        return b;
      }));
      
      const expandState: Record<string, boolean> = {};
      blocks.forEach(b => {
        if (resultObj[b.id]) expandState[b.id] = true;
      });
      setExpandedBlocks(prev => ({ ...prev, ...expandState }));
      setIsImagePromptModalOpen(false);
      setSelectedImage(null);
      setSelectedImageMime(null);
    } catch (e) {
      console.error(e);
      alert("Đã có lỗi xảy ra khi phân tích hình ảnh. Vui lòng thử lại.");
    } finally {
      setIsGeneratingFromImage(false);
    }
  };

  const generatePromptText = (raw = false) => {
    return blocks.filter(b => b.content.trim() !== '').map(b => `### ${b.title}\n${raw ? b.content : injectVariables(b.content)}`).join('\n\n');
  };

  const activePersona = personas.find(p => p.id === activePersonaId);
  const systemBlocks = blocks.filter(b => ['role', 'context', 'tone', 'constraints'].includes(b.type));
  const userBlocks = blocks.filter(b => ['task', 'format', 'example'].includes(b.type));
  
  const generatePreviewContent = (isRaw: boolean = false, type: 'combined' | 'system' | 'user' = 'combined') => {
    let output = "";
    
    const renderBlock = (b: PromptBlock) => {
      if (b.content.trim() === '') return '';
      let result = '';
      if (isRaw) {
        result += `[${b.title}]\n${b.content}\n\n`;
      } else {
        result += `[${b.title}]\n${injectVariables(b.content)}\n\n`;
      }
      return result;
    }

    if (type === 'combined' || type === 'system') {
      if (activePersona?.systemInstructions) {
        output += `[SYSTEM RULES]\n${activePersona.systemInstructions}\n\n`;
      }
      if (type === 'combined') {
        blocks.forEach(b => { output += renderBlock(b); });
      } else {
        systemBlocks.forEach(b => { output += renderBlock(b); });
      }
    }
    
    if (type === 'user') {
      userBlocks.forEach(b => { output += renderBlock(b); });
    }

    return output.trim();
  };

  const handleCopy = (isRaw: boolean, copyType: 'combined' | 'system' | 'user' = 'combined') => {
    const text = generatePreviewContent(isRaw, copyType);
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      if (copyType === 'system') {
        setCopiedSystem(true);
        setTimeout(() => setCopiedSystem(false), 2000);
      } else if (copyType === 'user') {
        setCopiedUser(true);
        setTimeout(() => setCopiedUser(false), 2000);
      } else {
        if (isRaw) {
          setCopiedRaw(true);
          setTimeout(() => setCopiedRaw(false), 2000);
        } else {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }
      }
    });
  };

  const handleQuickAddSet = () => {
    if (globalTheme === 'empty') return;
    const typesToPull = ['role', 'task', 'context', 'format'];
    const newBlocks = typesToPull.map((type, idx) => {
      const blockDef = AVAILABLE_BLOCKS.find(b => b.type === type);
      const newBlock = {
        id: `${type}-${Date.now()}-${idx}`,
        type: type as any,
        title: blockDef?.title || '',
        content: BLOCK_SUGGESTIONS[type]?.[globalTheme] || ''
      };
      return newBlock;
    });
    setBlocks(prev => [...prev, ...newBlocks]);
    
    const expandState: Record<string, boolean> = {};
    newBlocks.forEach(b => expandState[b.id] = true);
    setExpandedBlocks(prev => ({ ...prev, ...expandState }));
  };

  const handleSaveModal = () => {
    if (blocks.length === 0) return;
    setIsModalOpen(true);
  };

  const handleConfirmSave = () => {
    if (!onSaveTemplate || !templateTitle.trim()) return;
    
    // Auto extract variables from blocks
    const parsedVars = allVariables.map(v => ({
      name: v.name,
      type: v.options ? 'dropdown' as const : 'text' as const,
      required: true,
      options: v.options
    }));

    const newTemplate: PromptTemplate = {
      id: `custom-${Date.now()}`,
      title: templateTitle,
      description: templateDesc || 'Custom template created by you.',
      category: templateCategory,
      tags: templateTags.split(',').map(t => t.trim()).filter(Boolean),
      language: templateLanguage,
      isPublic: isPublicTemplate,
      version: 'v1.0',
      status: 'Published',
      metrics: { usageCount: 0, upvotes: 0 },
      variables: parsedVars,
      blocks: [...blocks]
    };
    onSaveTemplate(newTemplate);
    setIsModalOpen(false);
    setTemplateTitle('');
    setTemplateDesc('');
    setTemplateTags('');
  };

  const FRAMEWORKS = [
    { 
      id: 'role', 
      name: 'R.O.L.E Framework', 
      blocks: [
        { type: 'role', title: 'Vai trò (Role)', content: 'Bạn là {{Chuyên gia/Vai trò cụ thể}}' },
        { type: 'objective', title: 'Mục tiêu (Objective)', content: 'Tôi cần {{Hành động cụ thể}}' },
        { type: 'context', title: 'Ngữ cảnh (Context)', content: 'Trong tình huống {{Bối cảnh chi tiết}}' },
        { type: 'format', title: 'Kỳ vọng (Expectation)', content: 'Kết quả cần {{Định dạng/Phong cách/Độ dài}}' }
      ] 
    },
    { 
      id: 'create', 
      name: 'C.R.E.A.T.E Framework', 
      blocks: [
        { type: 'context', title: 'Context (Ngữ cảnh)', content: '{{Mô tả tình huống/vấn đề}}' },
        { type: 'role', title: 'Role (Vai trò)', content: 'Hãy đóng vai {{Chuyên gia/nhân vật}}' },
        { type: 'example', title: 'Examples (Ví dụ)', content: 'Tham khảo phong cách {{Mẫu cụ thể}}' },
        { type: 'objective', title: 'Action (Hành động)', content: 'Hãy {{tạo/viết/phân tích/tối ưu}}' },
        { type: 'format', title: 'Type (Kiểu dáng)', content: 'Dưới dạng {{Format cụ thể}}' },
        { type: 'constraints', title: 'Extras (Thêm)', content: 'Lưu ý {{Ràng buộc/yêu cầu đặc biệt}}' }
      ] 
    },
    { 
      id: 'persona', 
      name: 'P.E.R.S.O.N.A Framework', 
      blocks: [
        { type: 'objective', title: 'Purpose (Mục đích)', content: 'Tôi muốn {{Kết quả cuối cùng}}' },
        { type: 'experience', title: 'Experience (Kinh nghiệm)', content: 'Trình độ của tôi là {{Level}}' },
        { type: 'example', title: 'Reference (Tham chiếu)', content: 'Tôi thích phong cách {{Mẫu/Tác giả}}' },
        { type: 'constraints', title: 'Specifics (Chi tiết)', content: 'Bao gồm {{Yêu cầu cụ thể}}' },
        { type: 'format', title: 'Output (Đầu ra)', content: 'Cho tôi {{Định dạng}}' },
        { type: 'tone', title: 'Nuance (Sắc thái)', content: 'Giọng điệu {{Tone mong muốn}}' },
        { type: 'audience', title: 'Audience (Đối tượng)', content: 'Người đọc/nghe là {{Ai}}' }
      ] 
    },
    { 
      id: 'task_fw', 
      name: 'T.A.S.K Framework', 
      blocks: [
        { type: 'task', title: 'Task (Nhiệm vụ)', content: '{{Động từ hành động}} {{Đối tượng cụ thể}}' },
        { type: 'audience', title: 'Audience (Đối tượng)', content: 'Dành cho {{Ai}}' },
        { type: 'tone', title: 'Style (Phong cách)', content: 'Theo kiểu {{Mô tả}}' },
        { type: 'constraints', title: 'Key points (Điểm chính)', content: 'Phải có {{Yêu cầu bắt buộc}}' }
      ] 
    },
    { 
      id: 'chain', 
      name: 'C.H.A.I.N Framework', 
      blocks: [
        { type: 'challenge', title: 'Challenge (Thách thức)', content: 'Vấn đề tôi đang gặp là {{Mô tả}}' },
        { type: 'objective', title: 'Help needed (Cần giúp)', content: 'Tôi cần bạn giúp {{Hành động}}' },
        { type: 'steps', title: 'Approach (Cách tiếp cận)', content: 'Hãy làm theo các bước:\n- Bước 1: {{Phân tích/Nghiên cứu}}\n- Bước 2: {{Đề xuất/Tạo}}\n- Bước 3: {{Tối ưu/Tinh chỉnh}}' },
        { type: 'input_data', title: 'Input (Đầu vào)', content: 'Thông tin tôi có: {{Dữ liệu}}' },
        { type: 'task', title: 'Next steps (Bước tiếp theo)', content: 'Sau đó hãy {{Yêu cầu cuối}}' }
      ] 
    },
    { 
      id: 'claude_xmd', 
      name: 'Claude Pro XMD', 
      blocks: [
        { type: 'role', title: 'Vai trò (Role)' },
        { type: 'task', title: 'Nhiệm vụ (Task)' },
        { type: 'input_data', title: 'Dữ liệu đầu vào (Input)' },
        { type: 'thinking', title: 'Suy luận (Thinking)' },
        { type: 'format', title: 'Định dạng (Format)' },
        { type: 'constraints', title: 'Ràng buộc (Constraints)' },
        { type: 'self_correction', title: 'Tự xem xét (Self-Correction)' },
        { type: 'anchor', title: 'Mỏ neo (Anchor)' }
      ] 
    },
    { 
      id: 'costar', 
      name: 'CO-STAR Framework', 
      blocks: [
        { type: 'context', title: 'Context (Ngữ cảnh)' },
        { type: 'task', title: 'Objective (Mục tiêu)' },
        { type: 'tone', title: 'Style (Phong cách)' },
        { type: 'tone', title: 'Tone (Giọng điệu)' },
        { type: 'context', title: 'Audience (Đối tượng)' },
        { type: 'format', title: 'Response (Phản hồi)' }
      ] 
    },
    { 
      id: 'rtf', 
      name: 'RTF Framework', 
      blocks: [
        { type: 'role', title: 'Role (Vai trò)' },
        { type: 'task', title: 'Task (Nhiệm vụ)' },
        { type: 'format', title: 'Format (Định dạng)' }
      ] 
    },
    { 
      id: 'race', 
      name: 'RACE Framework', 
      blocks: [
        { type: 'role', title: 'Role (Vai trò)' },
        { type: 'task', title: 'Action (Nhiệm vụ)' },
        { type: 'context', title: 'Context (Ngữ cảnh)' },
        { type: 'format', title: 'Expectation (Kỳ vọng)' }
      ] 
    },
  ];

  const handleApplyFramework = (fwBlocks: any[]) => {
    const newBlocks = fwBlocks.map((blockData, idx) => {
      const isString = typeof blockData === 'string';
      const type = isString ? blockData : blockData.type;
      const blockDef = AVAILABLE_BLOCKS.find(b => b.type === type);
      return {
        id: `${type}-${Date.now()}-${idx}`,
        type: type as any,
        title: isString ? (blockDef?.title || '') : (blockData.title || blockDef?.title || ''),
        content: isString ? '' : (blockData.content || '')
      };
    });
    setBlocks(prev => {
      const pinned = prev.filter(p => p.isPinned);
      return [...pinned, ...newBlocks];
    });
    const expandState: Record<string, boolean> = {};
    newBlocks.forEach(b => expandState[b.id] = true);
    setExpandedBlocks(prev => ({ ...prev, ...expandState }));
  };

  const getPromptScore = () => {
    if (blocks.length === 0) return { score: 0, msg: '' };
    const hasRole = blocks.some(b => b.type === 'role');
    const hasTask = blocks.some(b => b.type === 'task');
    const hasContextOrInput = blocks.some(b => b.type === 'context' || b.type === 'input_data');
    const hasFormat = blocks.some(b => b.type === 'format');
    const hasThinking = blocks.some(b => b.type === 'thinking');
    
    let score = 30;
    let missing = [];
    if (hasRole) score += 10; else missing.push('Vai trò');
    if (hasTask) score += 20; else missing.push('Nhiệm vụ');
    if (hasContextOrInput) score += 10; else missing.push('Ngữ cảnh/Dữ liệu');
    if (hasFormat) score += 10; else missing.push('Format');
    if (hasThinking) score += 20; else missing.push('Suy luận');
    
    let msg = score >= 90 ? 'Tuyệt vời, prompt rất chuẩn!' : `Gợi ý thêm: ${missing.join(', ')}`;
    return { score, msg };
  };
  const { score, msg } = getPromptScore();

  return (
    <div className="flex flex-col lg:flex-row flex-1 overflow-hidden relative w-full h-full">
      <DragDropContext onDragEnd={onDragEnd}>
        
        {/* Left Column: Available Blocks (Hidden on Mobile) */}
        <div className="hidden lg:flex w-64 border-r border-slate-200 bg-white flex-col shrink-0 h-full overflow-hidden pt-2 pb-14 lg:pb-0">
          <div className="p-4 border-b border-slate-100 flex flex-col gap-4 shrink-0">
            <div>
               <h3 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">Cài đặt bộ</h3>
               <div className="relative mb-2">
                 <select 
                   value={globalTheme}
                   onChange={(e) => setGlobalTheme(e.target.value)}
                   className="w-full text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-md px-4 py-2.5 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-colors cursor-pointer appearance-none shadow-sm"
                 >
                    <option value="empty">✏️ Tự do (Trống)</option>
                    <option value="math">🧮 Giải toán</option>
                    <option value="writing">✍️ Viết bài dài</option>
                    <option value="coding">💻 Lập trình</option>
                    <option value="self_dev">🌱 Phát triển bản thân</option>
                    <option value="roadmap">🗺️ Lộ trình học tập</option>
                 </select>
                 <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-indigo-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                 </div>
               </div>
               
               <div className="grid grid-cols-2 gap-2 mt-1 hidden md:grid">
                 <button
                   onClick={handleQuickAddSet}
                   disabled={globalTheme === 'empty'}
                   className="w-full px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white bg-indigo-600 rounded flex justify-center items-center h-10 shadow-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                 >
                   + TẠO BỘ
                 </button>
                 <button
                   onClick={() => setBlocks(blocks.filter(b => b.isPinned))}
                   className="w-full px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-white border border-slate-300 rounded flex justify-center items-center h-10 shadow-sm hover:bg-slate-50 transition-colors"
                 >
                   XÓA TẤT CẢ
                 </button>
               </div>

               <div className="mt-5 border-t border-slate-100 pt-3">
                 <div className="flex justify-between items-center mb-1">
                     <h3 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Mức độ chi tiết AI</h3>
                     <span className="text-[10px] font-bold text-indigo-600">{detailLevel === 1 ? 'Ngắn gọn' : detailLevel === 2 ? 'Tiêu chuẩn' : 'Rất chi tiết'}</span>
                 </div>
                 <input 
                     type="range" 
                     min="1" max="3" step="1"
                     value={detailLevel}
                     onChange={(e) => setDetailLevel(Number(e.target.value))}
                     className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer mt-1"
                 />
                 <div className="flex justify-between mt-1 text-[9px] text-slate-400 font-medium">
                     <span>Ngắn</span>
                     <span>Vừa</span>
                     <span>Dài</span>
                 </div>
               </div>
               
               <div className="mt-4 border-t border-slate-100 pt-3 flex flex-col min-h-0">
                 <h3 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2 shrink-0">Framework Chuẩn</h3>
                 <div className="flex flex-col gap-1.5 overflow-y-auto custom-scrollbar pr-1 max-h-[180px]">
                   {FRAMEWORKS.map(fw => (
                     <button
                       key={fw.id}
                       onClick={() => handleApplyFramework(fw.blocks)}
                       className="text-left px-3 py-2 text-[11px] font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded-lg hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 transition-colors flex items-center shrink-0"
                     >
                       {fw.name}
                     </button>
                   ))}
                 </div>
               </div>
            </div>
          </div>
          
          <div className="p-3 pb-1 border-b border-slate-100 flex items-center justify-between">
             <h3 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Thành phần (Blocks)</h3>
          </div>

          <Droppable droppableId="available-blocks" isDropDisabled={true}>
            {(provided) => (
              <div 
                ref={provided.innerRef} 
                {...provided.droppableProps}
                className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar"
              >
                {AVAILABLE_BLOCKS.map((block, index) => (
                  // @ts-ignore
                  <Draggable key={block.type} draggableId={`available-${block.type}`} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="group"
                      >
                         <div className={`p-3 border border-slate-200 rounded-lg hover:border-indigo-300 bg-white transition-all
                          ${snapshot.isDragging ? 'shadow-md border-indigo-400 ring-1 ring-indigo-400' : ''}`}
                        >
                          <div className="flex justify-between items-center min-h-[28px]">
                             <div className="flex flex-col">
                               <p className="text-xs font-semibold truncate text-slate-900">{block.title}</p>
                               <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2">{block.description}</p>
                             </div>
                             <button 
                               onClick={(e) => {
                                 e.stopPropagation();
                                 addBlock(block.type);
                               }}
                               className="text-slate-400 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0 bg-white border border-slate-200 rounded shadow-sm w-8 h-8 flex items-center justify-center p-0"
                               aria-label="Thêm vào"
                             >
                               <Plus size={16} />
                             </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>

        {/* Middle Column: Builder Area */}
        <div className={`flex-1 bg-slate-50 flex flex-col overflow-hidden w-full h-full min-w-0 ${showMobilePanel === 'build' ? 'flex' : 'hidden lg:flex'}`}>
          <div className="p-4 md:p-6 border-b border-slate-200 shrink-0 flex items-center justify-between flex-wrap gap-4 bg-white">
            <div>
              <h2 className="text-lg font-bold">The Workshop (Xưởng chế tác)</h2>
              <div className="flex items-center gap-3 mt-1 text-sm text-slate-500 hidden lg:flex">
                <span>Kéo thả để sắp xếp. Gợi ý: Gõ <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-600 font-mono text-xs">{"{{Tên}}"}</code> để tạo biến.</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
               <button 
                 onClick={() => setIsImagePromptModalOpen(true)}
                 className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 hover:border-indigo-300 px-3 py-1.5 rounded text-sm font-semibold shadow-sm transition-all whitespace-nowrap"
               >
                 <ImageIcon size={16} /> Quét Ảnh
               </button>
               <button 
                 onClick={() => setIsQuickPromptModalOpen(true)}
                 className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white px-3 py-1.5 rounded text-sm font-semibold shadow-sm transition-all whitespace-nowrap"
               >
                 <Sparkles size={16} /> Tạo nhanh
               </button>
               {personas && personas.length > 0 && (
                  <select 
                    value={activePersonaId} 
                    onChange={(e) => setActivePersonaId(e.target.value)}
                    className="text-xs bg-slate-900 text-white font-semibold px-3 py-1.5 border border-slate-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer max-w-[200px] truncate"
                  >
                    <option value="">Làm việc Tự do</option>
                    {personas.map(p => (
                      <option key={p.id} value={p.id}>👤 {p.name}</option>
                    ))}
                  </select>
                )}
              {blocks.length > 0 && onSaveTemplate && (
                <button 
                  onClick={handleSaveModal}
                  className="hidden lg:flex items-center gap-2 px-3 py-1.5 min-h-[44px] text-xs font-semibold bg-white border border-slate-200 text-slate-700 rounded-lg hover:border-emerald-300 hover:text-emerald-700 hover:bg-emerald-50 transition-colors shadow-sm"
                >
                  <Save size={14} />
                  Lưu Thành Template
                </button>
              )}
            </div>

             {/* Mobile View Toggle & Global Settings Bar */}
            <div className="flex lg:hidden items-center justify-between bg-white px-3 py-2 rounded-xl shadow-sm border border-slate-200 mb-4 cursor-default">
               <button 
                  onClick={() => setIsBottomSheetOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-indigo-50 text-indigo-700 font-bold text-xs rounded-lg min-h-[40px] border border-indigo-100"
               >
                 <Plus size={16} />
                 Thêm khối
               </button>
               
               <div className="flex items-center gap-2">
                 <select 
                   value={globalTheme}
                   onChange={(e) => setGlobalTheme(e.target.value)}
                   className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-2 py-2 min-h-[40px] max-w-[120px] focus:outline-none appearance-none"
                 >
                    <option value="empty">Cài bộ: Trống</option>
                    <option value="math">🧮 Giải toán</option>
                    <option value="writing">✍️ Viết bài dài</option>
                    <option value="coding">💻 Lập trình</option>
                 </select>
                 <button onClick={() => setShowMobilePanel('preview')} className="flex items-center p-2 rounded-lg bg-slate-800 text-white min-h-[40px]">
                   <span className="text-[10px] font-bold uppercase tracking-wider mr-1">Preview</span>
                   <ChevronRight size={14} />
                 </button>
               </div>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto px-4 lg:px-6 custom-scrollbar pb-32 lg:pb-8 relative">
            <Droppable droppableId="builder-area">
              {(provided, snapshot) => (
                <div 
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`flex-1 flex flex-col gap-3 transition-colors min-h-[200px] ${snapshot.isDraggingOver ? 'bg-indigo-50/50 rounded-xl' : ''}`}
                >
                  {blocks.length === 0 && (
                    <div className="p-4 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-2 text-slate-400 py-12 mt-4">
                      <Layers className="w-8 h-8 text-slate-300 mb-2" />
                      <span className="text-sm font-semibold">Chưa có thành phần nào</span>
                      <span className="text-xs text-slate-400 text-center max-w-xs">{`Chạm '+ Thêm khối' để bắt đầu.`}</span>
                    </div>
                  )}
                  
                  {blocks.map((block, index) => {
                    const style = TYPE_STYLES[block.type] || { badge: 'text-slate-700 bg-slate-50 ring-slate-500/30', border: 'border-l-slate-400' };
                    const isGenerating = generatingBlocks[block.id];
                    const isExpanded = expandedBlocks[block.id];

                    return (
                      // @ts-ignore
                      <Draggable key={block.id} draggableId={block.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`bg-white border-y border-r border-l-[4px] rounded-xl flex items-start gap-2 lg:gap-3 transition-all duration-300 group relative overflow-hidden
                              ${style.border}
                              ${snapshot.isDragging 
                                ? 'shadow-xl shadow-slate-200/50 border-r-indigo-400 border-y-indigo-400 rotate-2 scale-[1.02] z-50' 
                                : isGenerating
                                  ? 'border-indigo-400 border-y-[1.5px] border-r-[1.5px] shadow-[0_0_15px_rgba(99,102,241,0.25)] bg-indigo-50/20'
                                  : 'border-y-slate-200 border-r-slate-200 shadow-sm hover:shadow-md hover:-translate-y-1 hover:border-r-slate-300 hover:border-y-slate-300'}`}
                          >
                            {isGenerating && (
                              <div className="absolute inset-0 bg-indigo-400/5 animate-[pulse_1.5s_ease-in-out_infinite] pointer-events-none" />
                            )}
                            <div {...provided.dragHandleProps} className="w-8 lg:w-8 py-4 flex flex-col items-center gap-1 opacity-20 cursor-grab active:cursor-grabbing hover:opacity-60 transition-opacity z-10 hidden lg:flex">
                              <div className="w-1 h-1 bg-slate-900 rounded-full"></div>
                              <div className="w-1 h-1 bg-slate-900 rounded-full"></div>
                              <div className="w-1 h-1 bg-slate-900 rounded-full"></div>
                            </div>
                            
                            {/* Mobile Drag Handle */}
                            <div {...provided.dragHandleProps} className="lg:hidden pt-4 pl-3 flex flex-col items-center opacity-40 cursor-grab active:cursor-grabbing z-10 touch-manipulation pb-1 flex-shrink-0">
                              <Menu size={16} />
                            </div>

                            <div className="flex-1 w-full min-w-0 py-3 pr-3 lg:pr-4 z-10 relative">
                                <div className="flex justify-between items-center mb-1 flex-wrap gap-y-2">
                                 <div 
                                    className="flex items-center gap-2 cursor-pointer touch-manipulation min-h-[32px] pl-1 pr-2 rounded hover:bg-slate-50 transition-colors"
                                    onClick={(e) => toggleBlockExpansion(block.id, e)}
                                 >
                                     <ChevronDown size={14} className={`text-slate-400 transition-transform ${isExpanded ? '' : '-rotate-90'}`} />
                                     <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded ring-1 ring-inset whitespace-nowrap ${style.badge}`}>
                                       {block.title}
                                     </span>
                                     {!isExpanded && block.content && (
                                       <span className="text-xs text-slate-400 truncate max-w-[80px] sm:max-w-[120px] ml-1">{block.content}</span>
                                     )}
                                 </div>

                                 <div className={`flex items-center gap-1 transition-opacity ${isExpanded ? 'opacity-100' : 'opacity-100 lg:opacity-0 lg:group-hover:opacity-100'}`}>
                                   {isGenerating ? (
                                     <div className="p-1 px-2 flex items-center gap-1.5 text-indigo-600 bg-indigo-100 rounded-lg animate-pulse h-8" title="Đang tạo văn bản...">
                                       <Sparkles size={12} className="animate-spin" />
                                       <span className="text-[10px] font-bold uppercase tracking-wider hidden lg:inline">Đang viết...</span>
                                     </div>
                                   ) : (
                                     <>
                                       <div className="relative">
                                         <button 
                                            onClick={(e) => { e.stopPropagation(); setOpenAiMenuId(openAiMenuId === block.id ? null : block.id); }}
                                            disabled={isGenerating}
                                            className={`flex items-center justify-center min-w-[32px] h-8 lg:w-auto lg:h-auto gap-1 lg:p-1 lg:px-1.5 hover:text-indigo-700 hover:bg-indigo-100 rounded-lg transition-colors disabled:opacity-50 touch-manipulation z-20 ${openAiMenuId === block.id ? 'bg-indigo-100 text-indigo-700' : 'text-indigo-500'}`}
                                            title="Tùy chọn AI"
                                          >
                                            <Sparkles size={16} className="lg:w-3.5 lg:h-[14px]" />
                                            <ChevronDown size={12} className="hidden lg:block" />
                                          </button>
                                          {openAiMenuId === block.id && (
                                            <>
                                              <div 
                                                className="fixed inset-0 z-40" 
                                                onClick={(e) => { e.stopPropagation(); setOpenAiMenuId(null); }}
                                              />
                                              <div className="absolute top-full right-0 mt-1 w-52 lg:w-48 bg-white border border-slate-200 shadow-xl rounded-lg py-1 z-50 flex flex-col overflow-hidden">
                                                <button onClick={(e) => { e.stopPropagation(); handleAiAssist(block, 'auto'); }} className="flex items-center gap-2 px-4 lg:px-3 py-3 lg:py-2 text-[13px] lg:text-xs text-slate-700 hover:bg-slate-50 border-b border-slate-100 text-left touch-manipulation min-h-[44px]"><Sparkles size={14} className="text-indigo-500"/> Hoàn thiện tự động</button>
                                                <button onClick={(e) => { e.stopPropagation(); handleAiAssist(block, 'longer'); }} className="flex items-center gap-2 px-4 lg:px-3 py-3 lg:py-2 text-[13px] lg:text-xs text-slate-700 hover:bg-slate-50 text-left touch-manipulation min-h-[44px]"><AlignLeft size={14} className="text-emerald-500"/> Viết chi tiết hơn</button>
                                                <button onClick={(e) => { e.stopPropagation(); handleAiAssist(block, 'shorter'); }} className="flex items-center gap-2 px-4 lg:px-3 py-3 lg:py-2 text-[13px] lg:text-xs text-slate-700 hover:bg-slate-50 border-b border-slate-100 text-left touch-manipulation min-h-[44px]"><Minimize2 size={14} className="text-rose-500"/> Rút gọn súc tích</button>
                                                <button onClick={(e) => { e.stopPropagation(); handleAiAssist(block, 'professional'); }} className="flex items-center gap-2 px-4 lg:px-3 py-3 lg:py-2 text-[13px] lg:text-xs text-slate-700 hover:bg-slate-50 text-left touch-manipulation min-h-[44px]"><Briefcase size={14} className="text-blue-500"/> Giọng chuyên nghiệp</button>
                                                <button onClick={(e) => { e.stopPropagation(); handleAiAssist(block, 'casual'); }} className="flex items-center gap-2 px-4 lg:px-3 py-3 lg:py-2 text-[13px] lg:text-xs text-slate-700 hover:bg-slate-50 text-left touch-manipulation min-h-[44px]"><Smile size={14} className="text-orange-500"/> Giọng gần gũi</button>
                                                <button onClick={(e) => { e.stopPropagation(); handleAiAssist(block, 'fix_contradiction'); }} className="flex items-center gap-2 px-4 lg:px-3 py-3 lg:py-2 text-[13px] lg:text-xs text-slate-700 hover:bg-slate-50 text-left touch-manipulation min-h-[44px]"><Wand2 size={14} className="text-purple-500"/> Sửa lỗi mâu thuẫn</button>
                                              </div>
                                            </>
                                          )}
                                        </div>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); togglePin(block.id); }}
                                            className={`w-8 h-8 lg:w-auto lg:h-auto flex items-center justify-center p-0 lg:p-1.5 rounded-lg transition-colors touch-manipulation shrink-0 ${block.isPinned ? 'text-amber-500 bg-amber-50 hover:bg-amber-100' : 'text-slate-400 hover:text-amber-500 hover:bg-amber-50'}`}
                                            title="Ghim block này lại"
                                          >
                                            <Pin size={16} className={`lg:w-3.5 lg:h-[14px] ${block.isPinned ? 'fill-current' : ''}`} />
                                        </button>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); removeBlock(block.id); }}
                                            className="w-8 h-8 lg:w-auto lg:h-auto flex items-center justify-center p-0 lg:p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors touch-manipulation shrink-0"
                                            title="Xóa"
                                          >
                                            <Trash2 size={16} className="lg:w-3.5 lg:h-[14px]" />
                                        </button>
                                     </>
                                   )}
                                 </div>
                              </div>
                              
                              {isExpanded && (
                                <textarea
                                  value={block.content}
                                  onChange={(e) => updateBlockContent(block.id, e.target.value)}
                                  placeholder={isGenerating ? "AI đang gõ..." : "Nhập nội dung ở đây..."}
                                  disabled={isGenerating}
                                  className={`w-full text-[15px] lg:text-sm font-medium focus:outline-none resize-y min-h-[80px] bg-transparent leading-relaxed transition-all duration-300 mt-2 ${
                                    isGenerating ? 'text-indigo-400 placeholder-indigo-300 cursor-wait opacity-60' : 'text-slate-700 placeholder-slate-400 opacity-100'
                                  }`}
                                />
                              )}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
          
          {/* Mobile Bottom Action Bar (Sticky) */}
          <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-3 pb-safe shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.1)] z-40 transform transition-transform duration-300">
             <div className="flex justify-between items-center gap-3 w-full max-w-md mx-auto">
                 <div className="flex gap-2 flex-1">
                     <button
                        onClick={() => handleCopy(false)}
                        disabled={blocks.length === 0}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-slate-900 text-white rounded-xl text-sm font-bold h-12 shadow-sm disabled:opacity-50 touch-manipulation"
                      >
                        {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                        Copy
                      </button>
                 </div>
                 <div className="flex items-center justify-end w-[130px] border-l border-slate-200 pl-4 h-12">
                     <div className="flex flex-col w-full">
                       <span className="text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">AI Lvl</span>
                       <input 
                           type="range" 
                           min="1" max="3" step="1"
                           value={detailLevel}
                           onChange={(e) => setDetailLevel(Number(e.target.value))}
                           className="w-full accent-indigo-600 h-1bg-slate-200 rounded-lg appearance-none cursor-pointer"
                       />
                     </div>
                 </div>
             </div>
          </div>
        </div>
      </DragDropContext>

      {/* Right Column: Preview (Hidden on Mobile unless toggled) */}
      <div className={`w-full lg:w-80 border-l border-slate-200 bg-white flex-col shrink-0 h-full lg:z-10 shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)] absolute lg:relative inset-0 lg:inset-auto z-[45] ${showMobilePanel === 'preview' ? 'flex' : 'hidden lg:flex'}`}>
        <div className="p-4 border-b border-slate-100 flex items-center justify-between min-h-[60px] shrink-0">
          <div className="flex items-center gap-1">
            <button onClick={() => setShowMobilePanel('build')} className="lg:hidden p-2 -ml-2 text-slate-500 hover:text-slate-800 touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0 rounded-full hover:bg-slate-100">
               <ChevronRight size={20} className="rotate-180" />
            </button>
            <h3 className="text-xs lg:text-[10px] font-bold uppercase tracking-wider text-slate-600 lg:text-slate-400">Xem trước kết quả</h3>
          </div>
          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded">LIVE</span>
        </div>
        
        {blocks.length > 0 && (
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <span className="text-[10px] uppercase font-bold text-slate-500">Điểm Prompt:</span>
              <span className={`text-xs font-bold ${score >= 80 ? 'text-green-600' : score >= 60 ? 'text-yellow-600' : 'text-orange-500'}`}>
                {score}/100
              </span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div className={`h-full ${score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-yellow-400' : 'bg-orange-500'}`} style={{ width: `${score}%` }}></div>
            </div>
            <span className="text-[10px] text-slate-500 truncate">{msg}</span>
          </div>
        )}
        
        <div className="flex-1 p-4 overflow-hidden flex flex-col gap-4">
          
          {/* Variables and Personalization Section */}
          <div className="bg-white border border-emerald-100 rounded-xl overflow-hidden shadow-sm shrink-0 flex flex-col">
             <div className="bg-emerald-50/50 px-3 py-2 border-b border-emerald-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-emerald-800">
                   <Wand2 size={14} className="text-emerald-500" />
                   <span className="text-[11px] font-bold uppercase tracking-wider">Tùy chỉnh Biến số</span>
                </div>
                <button 
                   onClick={() => setIsProfileModalOpen(true)}
                   className="text-[10px] bg-white border border-emerald-200 text-emerald-600 px-2 py-0.5 rounded text-xs hover:bg-emerald-50 transition-colors flex items-center gap-1"
                >
                   <User size={12} />
                   Hồ sơ
                </button>
             </div>
             
             {allVariables.length > 0 ? (
               <>
                 <div className="p-3 bg-white max-h-48 overflow-y-auto custom-scrollbar flex flex-col gap-3">
                   {allVariables.map(v => (
                      <div key={v.name} className="flex flex-col gap-1">
                        <label className="text-[11px] font-semibold text-slate-700">{v.name}</label>
                        {v.options ? (
                          <select
                            className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50 transition-all font-medium text-slate-800"
                            value={variableValues[v.name] || v.options[0]}
                            onChange={e => setVariableValues(prev => ({...prev, [v.name]: e.target.value}))}
                          >
                            {v.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                          </select>
                        ) : (
                          <input 
                            type="text"
                            className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50 transition-all text-slate-800 placeholder-slate-400"
                            placeholder={`Nhập thông tin cho ${v.name}...`}
                            value={variableValues[v.name] || ''}
                            onChange={e => setVariableValues(prev => ({...prev, [v.name]: e.target.value}))}
                          />
                        )}
                      </div>
                    ))}
                 </div>

                 <div className="p-2 border-t border-emerald-50 bg-emerald-50/20">
                    <button
                       onClick={handleAutoFill}
                       disabled={isAutoFilling}
                       className="w-full py-2 bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-[0_2px_10px_rgba(16,185,129,0.2)] flex items-center justify-center gap-2 hover:bg-emerald-600 transition-colors disabled:opacity-70 disabled:cursor-wait"
                    >
                       {isAutoFilling ? (
                         <>
                           <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                           AI Đang điền...
                         </>
                       ) : (
                         <>
                           <Sparkles size={14} />
                           Điền nhanh bằng AI
                         </>
                       )}
                    </button>
                 </div>
               </>
             ) : (
               <div className="p-4 text-center">
                 <p className="text-[11px] text-slate-500 italic">
                   Hãy thêm block chứa biến (ví dụ: <code className="bg-slate-100 px-1 rounded text-emerald-600 font-mono">{"{{Tên}}"}</code>) để tùy chỉnh tự động.
                 </p>
               </div>
             )}
          </div>

          {/* Preview Output */}
          <div className="flex-1 flex flex-col min-h-0 bg-slate-50 rounded-lg border border-slate-200">
            <div className="px-3 py-2 bg-slate-100 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2">
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Raw Output</span>
               <div className="flex bg-slate-200/50 p-0.5 rounded-lg">
                  <button 
                    onClick={() => setPreviewMode('combined')}
                    className={`px-3 py-1 text-[10px] font-semibold rounded-md transition-colors ${previewMode === 'combined' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    GỘP CHUNG
                  </button>
                  <button 
                    onClick={() => setPreviewMode('split')}
                    className={`px-3 py-1 text-[10px] font-semibold rounded-md transition-colors flex items-center gap-1 ${previewMode === 'split' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    <SplitSquareHorizontal size={12} /> TÁCH API
                  </button>
               </div>
            </div>
            <div className="flex-1 p-4 overflow-y-auto text-xs leading-relaxed text-slate-700 font-mono custom-scrollbar relative">
              {blocks.length === 0 && !activePersona ? (
                 <p className="text-slate-400 italic">Bắt đầu xây dựng để xem kết quả...</p>
              ) : previewMode === 'combined' ? (
                <div className="whitespace-pre-wrap">
                  {activePersona && (
                    <div className="mb-4">
                      <span className="text-emerald-600 font-bold uppercase tracking-widest text-[10px]">[SYSTEM RULES] (Từ Persona: {activePersona.name})</span>
                      <br/>
                      <span className="text-slate-600 break-words italic">{activePersona.systemInstructions}</span>
                    </div>
                  )}
                  {blocks.map((b, i) => (
                    <div key={b.id} className="mb-4">
                      {b.content.trim() !== '' && (
                        <>
                          <span className="text-indigo-600 font-bold uppercase tracking-widest text-[10px]">[{b.title}]</span>
                          <br/>
                          <span className="text-slate-800 break-words">{injectVariables(b.content)}</span>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  {/* SYSTEM PROMPT */}
                  <div className="bg-emerald-50/50 border border-emerald-100 rounded-lg p-3">
                    <h4 className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider mb-2 pb-2 border-b border-emerald-200/50 flex justify-between items-center">
                      <span>System Instructions (Thiết lập AI)</span>
                      <button onClick={() => handleCopy(false, 'system')} className="text-emerald-600 hover:bg-emerald-100 px-2 py-1 rounded transition-colors flex items-center gap-1">
                        {copiedSystem ? <Check size={12}/> : <Copy size={12}/>}
                      </button>
                    </h4>
                    <div className="whitespace-pre-wrap text-[11px]">
                      {activePersona && (
                        <div className="mb-3">
                           <span className="text-slate-500 italic block mb-1">Quy tắc Persona ({activePersona.name}):</span>
                           <span className="text-slate-800">{activePersona.systemInstructions}</span>
                        </div>
                      )}
                      {systemBlocks.length > 0 ? systemBlocks.map(b => (
                        <div key={b.id} className="mb-3">
                          <span className="text-emerald-600 font-bold text-[9px] uppercase">[{b.title}]</span><br/>
                          <span className="text-slate-800">{injectVariables(b.content)}</span>
                        </div>
                      )) : !activePersona && <span className="text-slate-400 italic">Chưa có các khối Role, Context, Constraints...</span>}
                    </div>
                  </div>

                  {/* USER PROMPT */}
                  <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-3">
                    <h4 className="text-[10px] font-bold text-blue-700 uppercase tracking-wider mb-2 pb-2 border-b border-blue-200/50 flex justify-between items-center">
                      <span>User Task (Nhiệm vụ nhắn gửi)</span>
                      <button onClick={() => handleCopy(false, 'user')} className="text-blue-600 hover:bg-blue-100 px-2 py-1 rounded transition-colors flex items-center gap-1">
                        {copiedUser ? <Check size={12}/> : <Copy size={12}/>}
                      </button>
                    </h4>
                    <div className="whitespace-pre-wrap text-[11px]">
                      {userBlocks.length > 0 ? userBlocks.map(b => (
                        <div key={b.id} className="mb-3">
                          <span className="text-blue-600 font-bold text-[9px] uppercase">[{b.title}]</span><br/>
                          <span className="text-slate-800">{injectVariables(b.content)}</span>
                        </div>
                      )) : <span className="text-slate-400 italic">Chưa có các khối Task, Format, Example...</span>}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-1 flex flex-col pb-6 lg:pb-0 shrink-0">
            <div className="flex gap-2">
              <button
                onClick={() => handleCopy(false, 'combined')}
                disabled={blocks.length === 0 && !activePersona}
                className="flex-1 py-2.5 bg-slate-900 text-white rounded-lg text-xs font-bold shadow-md flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
              >
                {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                Copy (Gộp Chung)
              </button>
              <button
                onClick={() => handleCopy(true, 'combined')}
                disabled={blocks.length === 0}
                className="flex-[0.8] py-2.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-bold shadow-sm flex items-center justify-center gap-2 hover:bg-indigo-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                title="Copy Raw Code Template"
              >
                {copiedRaw ? <Check size={14} /> : <Copy size={14} />}
                Copy Code
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Mobile Bottom Sheet for adding blocks */}
      {isBottomSheetOpen && (
        <div className="lg:hidden fixed inset-0 z-[60] flex flex-col justify-end">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsBottomSheetOpen(false)}></div>
          <div className="bg-white w-full rounded-t-3xl max-h-[85vh] flex flex-col relative z-10 animate-in slide-in-from-bottom duration-300 shadow-[0_-15px_40px_rgba(0,0,0,0.1)]">
            <div className="flex justify-center pt-3 pb-2 w-full touch-pan-y" onClick={() => setIsBottomSheetOpen(false)}>
              <div className="w-12 h-1.5 bg-slate-200 rounded-full"></div>
            </div>
            
            <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
               <h3 className="text-sm uppercase font-bold text-slate-800 tracking-wider">Thêm Component</h3>
               <button onClick={() => setIsBottomSheetOpen(false)} className="p-2 -mr-2 text-slate-400 hover:text-slate-600 bg-slate-50 rounded-full w-8 h-8 flex items-center justify-center shadow-sm touch-manipulation">
                 <X size={16} />
               </button>
            </div>
            
            <div className="overflow-y-auto p-5 custom-scrollbar pb-12">
              {/* Quick Add Frameworks in Mobile */}
              <div className="mb-6">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Tạo bộ nhanh</h4>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => { handleApplyFramework(FRAMEWORKS[0].blocks); setIsBottomSheetOpen(false); }} className="p-3 border border-slate-200 rounded-xl text-left bg-slate-50 hover:bg-indigo-50 border-indigo-100 transition-colors active:scale-95 touch-manipulation">
                    <span className="block text-xs font-bold text-slate-800 mb-1">{FRAMEWORKS[0].name}</span>
                    <span className="block text-[10px] text-slate-500">Chuẩn hóa cho phân tích</span>
                  </button>
                  <button onClick={() => { handleApplyFramework(FRAMEWORKS[1].blocks); setIsBottomSheetOpen(false); }} className="p-3 border border-slate-200 rounded-xl text-left bg-slate-50 hover:bg-indigo-50 border-indigo-100 transition-colors active:scale-95 touch-manipulation">
                    <span className="block text-xs font-bold text-slate-800 mb-1">{FRAMEWORKS[1].name}</span>
                    <span className="block text-[10px] text-slate-500">Chuẩn hóa cho giao tiếp cơ bản</span>
                  </button>
                </div>
              </div>

              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Blocks đơn lẻ (Chạm để thêm)</h4>
              <div className="grid grid-cols-1 gap-3">
                {AVAILABLE_BLOCKS.map((block) => (
                  <button
                    key={block.type}
                    onClick={() => addBlock(block.type)}
                    className="flex flex-col items-start p-4 border border-slate-200 bg-white rounded-xl active:bg-slate-50 active:scale-[0.98] transition-all text-left touch-manipulation shadow-sm"
                  >
                    <div className="flex items-center gap-2 mb-1 w-full justify-between">
                       <span className={`text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded ring-1 ring-inset ${TYPE_STYLES[block.type]?.badge || 'text-slate-700 bg-slate-50 ring-slate-500'}`}>
                         {block.title}
                       </span>
                       <div className="bg-slate-100 p-1.5 rounded-full text-slate-400">
                         <Plus size={16} />
                       </div>
                    </div>
                    <p className="text-xs text-slate-500 mt-2 pr-4">{block.description}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Save Modal */}
      {isModalOpen && (
        <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6 border border-slate-100 flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold mb-1 text-slate-900">Lưu Template Mới</h3>
            <p className="text-xs text-slate-500 mb-6">Template của bạn sẽ được lưu vào Thư viện riêng và có thể tái sử dụng bất cứ lúc nào.</p>
            
            <div className="flex flex-col gap-4 mb-8">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 block">Tên Template</label>
                <input 
                  type="text" 
                  value={templateTitle}
                  onChange={e => setTemplateTitle(e.target.value)}
                  placeholder="Vd: Template Chuyên gia Tối ưu SEO"
                  className="w-full text-sm py-2 px-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors bg-slate-50"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 block">Mô tả (Không bắt buộc)</label>
                <textarea 
                  value={templateDesc}
                  onChange={e => setTemplateDesc(e.target.value)}
                  placeholder="Mô tả cụ thể mục đích của template này..."
                  className="w-full text-sm py-2 px-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors bg-slate-50 min-h-[60px] resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 block">Ngôn ngữ</label>
                  <select 
                    value={templateLanguage}
                    onChange={e => setTemplateLanguage(e.target.value)}
                    className="w-full text-sm py-2 px-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-colors bg-slate-50"
                  >
                    <option value="vi">Tiếng Việt</option>
                    <option value="en">English</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 block">Tags (phẩy để tách)</label>
                  <input 
                    type="text" 
                    value={templateTags}
                    onChange={e => setTemplateTags(e.target.value)}
                    placeholder="vd: seo, marketing"
                    className="w-full text-sm py-2 px-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-colors bg-slate-50"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <input 
                  type="checkbox" 
                  id="isPublicToggle"
                  checked={isPublicTemplate}
                  onChange={e => setIsPublicTemplate(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                />
                <label htmlFor="isPublicToggle" className="text-sm font-semibold text-slate-700 cursor-pointer">
                  Chia sẻ cho cộng đồng (Public)
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-auto">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors border border-transparent"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={handleConfirmSave}
                disabled={!templateTitle.trim()}
                className="px-5 py-2 text-sm font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-emerald-600/20 flex items-center gap-2"
              >
                <Save size={14} />
                Lưu vào thư viện
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Profile Settings Modal */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6 border border-slate-100 flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-2">
               <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                  <User size={20} />
               </div>
               <h3 className="text-xl font-bold text-slate-900">Hồ Sơ Cá Nhân</h3>
            </div>
            <p className="text-xs text-slate-500 mb-6">Mô tả bản thân để AI có thể tự động điền biến nhanh chóng và phân tích cấu trúc prompt tốt hơn.</p>
            
            <div className="flex flex-col gap-4 mb-8">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 block">Bạn là ai? Ngữ cảnh của bạn?</label>
                <textarea 
                  value={userProfile}
                  onChange={e => setUserProfile(e.target.value)}
                  placeholder="Vd: Tôi là học sinh lớp 12, đang ôn thi khối A. Điểm yếu là môn Lý. Thích lối giao tiếp hài hước..."
                  rows={4}
                  className="w-full text-sm py-2 px-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors bg-slate-50 resize-y min-h-[100px]"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-auto">
              <button 
                onClick={() => setIsProfileModalOpen(false)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors border border-transparent"
              >
                Đóng
              </button>
              <button 
                onClick={() => handleSaveProfile(userProfile)}
                className="px-5 py-2 text-sm font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-[0_2px_10px_rgba(16,185,129,0.2)] flex items-center gap-2"
              >
                <Save size={14} />
                Lưu hồ sơ
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Quick Prompt Modal */}
      {isQuickPromptModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
          <div 
            className="bg-white rounded-xl shadow-2xl p-6 md:p-8 w-full max-w-lg border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600">
                  <Wand2 size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Tự động hoàn thiện</h3>
                  <p className="text-xs text-slate-500 font-medium">Bơm nội dung thông minh vào các khối hiện có</p>
                </div>
              </div>
              <button 
                onClick={() => setIsQuickPromptModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                disabled={isGeneratingQuickPrompt}
              >
                <X size={18} />
              </button>
            </div>

            {blocks.length === 0 ? (
                <div className="text-center py-8">
                   <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                      <Layers size={32} />
                   </div>
                   <h3 className="text-slate-800 font-bold mb-2">Chưa có khối nào</h3>
                   <p className="text-slate-500 text-sm mb-6">Vui lòng kéo thả các khối vào khu vực xây dựng trước khi sử dụng tính năng này.</p>
                   <button 
                      onClick={() => setIsQuickPromptModalOpen(false)}
                      className="px-6 py-2 text-sm font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                      Đã hiểu
                    </button>
                </div>
            ) : (
                <>
                  <div className="space-y-5">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 block">Chủ đề / Yêu cầu</label>
                      <textarea 
                        value={quickPromptTopic}
                        onChange={e => setQuickPromptTopic(e.target.value)}
                        placeholder="Vd: Viết email xin việc chuyên nghiệp, Lên kịch bản video TikTok viral..."
                        className="w-full text-sm py-3 px-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-colors bg-slate-50 resize-none min-h-[100px]"
                        autoFocus
                      />
                    </div>
                    
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 block">Gợi ý nhanh</label>
                      <div className="flex flex-wrap gap-2">
                         {["Viết email xin việc chuyên nghiệp", "Lên kịch bản video TikTok", "Lập kế hoạch Digital Marketing", "Giải bài toán lập trình"].map((suggestion, idx) => (
                           <button 
                             key={idx}
                             onClick={() => setQuickPromptTopic(suggestion)}
                             className="text-xs px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors border border-slate-200/50"
                           >
                             {suggestion}
                           </button>
                         ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 mt-8">
                    <button 
                      onClick={() => setIsQuickPromptModalOpen(false)}
                      className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors border border-transparent"
                      disabled={isGeneratingQuickPrompt}
                    >
                      Hủy
                    </button>
                    <button 
                      onClick={handleGenerateQuickPrompt}
                      disabled={!quickPromptTopic.trim() || isGeneratingQuickPrompt}
                      className="px-5 py-2.5 text-sm font-semibold bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-lg transition-all shadow-md shadow-purple-500/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isGeneratingQuickPrompt ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Đang bơm nội dung...
                        </>
                      ) : (
                        <>
                          <Wand2 size={16} /> Bắt đầu hoàn thiện
                        </>
                      )}
                    </button>
                  </div>
                </>
            )}
          </div>
        </div>
      )}
      {/* Image Prompt Modal */}
      {isImagePromptModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
          <div 
            className="bg-white rounded-xl shadow-2xl p-6 md:p-8 w-full max-w-lg border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
                  <ImageIcon size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Quét Ảnh & Sinh Prompt</h3>
                  <p className="text-xs text-slate-500 font-medium">Bóc tách cấu trúc từ hình ảnh tự động</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setIsImagePromptModalOpen(false);
                  setSelectedImage(null);
                  setSelectedImageMime(null);
                }}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                disabled={isGeneratingFromImage}
              >
                <X size={18} />
              </button>
            </div>

            {blocks.length === 0 ? (
                <div className="text-center py-8">
                   <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                      <Layers size={32} />
                   </div>
                   <h3 className="text-slate-800 font-bold mb-2">Chưa có khối nào</h3>
                   <p className="text-slate-500 text-sm mb-6">Vui lòng kéo thả các khối vào khu vực xây dựng trước khi sử dụng tính năng này.</p>
                   <button 
                      onClick={() => setIsImagePromptModalOpen(false)}
                      className="px-6 py-2 text-sm font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                      Đã hiểu
                    </button>
                </div>
            ) : (
                <>
                  <div className="space-y-5">
                    
                    <div className="w-full">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 block">Tải ảnh lên (Flowchart, UI/UX, Bảng dữ liệu)</label>
                      <label htmlFor="image-prompt-upload" className="flex flex-col items-center justify-center w-full h-48 border-2 border-slate-300 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100/50 hover:border-indigo-400 overflow-hidden relative transition-all">
                        {selectedImage ? (
                          <div className="absolute inset-0 w-full h-full p-2">
                             <img src={`data:${selectedImageMime};base64,${selectedImage}`} alt="Selected" className="w-full h-full object-contain rounded-lg" />
                             <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg m-2">
                               <p className="text-white text-sm font-bold bg-black/50 px-3 py-1.5 rounded-lg flex items-center gap-2"><Upload size={16}/> Đổi ảnh khác</p>
                             </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-10 h-10 mb-3 text-slate-400" />
                            <p className="mb-2 text-sm text-slate-500 font-semibold"><span className="text-indigo-600">Nhấn để tải lên</span> hoặc kéo thả</p>
                            <p className="text-xs text-slate-400">PNG, JPG, WebP (Tối đa 5MB)</p>
                          </div>
                        )}
                        <input id="image-prompt-upload" type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleImageSelect} disabled={isGeneratingFromImage} />
                      </label>
                    </div>

                    <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-800">
                      <strong>Mẹo:</strong> Máy quét cấu trúc AI sẽ nhận diện nội dung ảnh (sơ đồ, giao diện, ý tưởng) và tự động rải dữ liệu vào các khối hiện có (Role, Task, Constraints, v.v).
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 mt-8">
                    <button 
                      onClick={() => {
                        setIsImagePromptModalOpen(false);
                        setSelectedImage(null);
                        setSelectedImageMime(null);
                      }}
                      className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors border border-transparent"
                      disabled={isGeneratingFromImage}
                    >
                      Hủy
                    </button>
                    <button 
                      onClick={handleGenerateFromImage}
                      disabled={!selectedImage || isGeneratingFromImage}
                      className="px-5 py-2.5 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all shadow-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isGeneratingFromImage ? (
                        <>
                          <Loader2 className="animate-spin w-4 h-4" />
                          Đang phân tích ảnh...
                        </>
                      ) : (
                        <>
                          <ImageIcon size={16} /> Bắt đầu bóc tách
                        </>
                      )}
                    </button>
                  </div>
                </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
