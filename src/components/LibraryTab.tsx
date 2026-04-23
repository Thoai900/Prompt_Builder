import React, { useState, useMemo } from 'react';
import { TEMPLATES } from '../data';
import { PromptTemplate } from '../types';
import { Search, Filter } from 'lucide-react';

interface LibraryTabProps {
  onSelectTemplate: (template: PromptTemplate) => void;
  customTemplates?: PromptTemplate[];
}

const CATEGORIES = ['Tất cả', 'Học sinh/Sinh viên', 'Người đi làm', 'Sáng tạo nội dung', 'Phát triển cá nhân', 'Mẫu của tôi'];

export default function LibraryTab({ onSelectTemplate, customTemplates = [] }: LibraryTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');

  // Process custom templates to always have a category
  const processedCustomTemplates = customTemplates.map(t => ({
    ...t,
    category: t.category || 'Mẫu của tôi'
  }));

  const allTemplates = [...processedCustomTemplates, ...TEMPLATES];

  const filteredTemplates = useMemo(() => {
    return allTemplates.filter(template => {
      const matchesSearch = template.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            template.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === 'Tất cả' || template.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [allTemplates, searchTerm, selectedCategory]);

  return (
    <div className="flex-1 p-6 flex flex-col overflow-y-auto">
      <div className="mb-6 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Thư viện Prompt Mẫu</h2>
          <p className="text-sm text-slate-500 mt-1">
            Khám phá các bộ khung đã được tối ưu sẵn cho từng mục đích.
          </p>
        </div>
        <div className="relative w-full md:w-72">
          <input 
            type="text" 
            placeholder="Tìm kiếm mẫu prompt..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all" 
          />
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-6 pb-2 border-b border-slate-200">
        <Filter className="w-4 h-4 text-slate-400 mr-2" />
        {CATEGORIES.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all ${
              selectedCategory === category
                ? 'bg-emerald-100 text-emerald-800 border-emerald-200 border'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filteredTemplates.map((template) => (
          <div 
            key={template.id}
            className="group cursor-pointer bg-white p-5 rounded-2xl border border-slate-200 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:border-emerald-300 hover:shadow-lg transition-all relative overflow-hidden flex flex-col"
            onClick={() => onSelectTemplate(template)}
          >
            {template.category && (
               <span className="absolute top-0 right-0 bg-slate-100 text-slate-500 text-[9px] font-bold px-2 py-1 rounded-bl-lg">
                 {template.category.toUpperCase()}
               </span>
            )}
            <h3 className="text-base font-bold text-slate-900 line-clamp-1 mb-2 pr-12">{template.title}</h3>
            <p className="text-xs text-slate-500 mb-2 line-clamp-3 min-h-[48px] leading-relaxed">{template.description}</p>
            
            {(template.tags && template.tags.length > 0) && (
              <div className="flex flex-wrap gap-1 mb-3">
                {template.tags.slice(0, 3).map(tag => (
                  <span key={tag} className="text-[9px] font-medium px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            <div className="flex flex-wrap gap-1.5 mb-4 border-t border-slate-100 pt-3 flex-1 content-start">
              {template.blocks.slice(0, 3).map(block => (
                <span key={block.id} className="text-[10px] uppercase tracking-wider font-bold px-2 py-1 bg-slate-50 text-slate-500 rounded border border-slate-100">
                  {block.title.split(' ')[0]} {/* Shorter label for theme */}
                </span>
              ))}
              {template.blocks.length > 3 && (
                <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-1 bg-slate-50 text-slate-500 rounded border border-slate-100">
                  +{template.blocks.length - 3}
                </span>
              )}
            </div>

            <div className="flex items-center text-xs font-bold text-emerald-600 mt-auto group-hover:text-emerald-500">
              Sử dụng mẫu này
              <svg className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-1.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>
          </div>
        ))}
        
        {filteredTemplates.length === 0 && (
          <div className="col-span-full py-12 flex flex-col items-center justify-center text-slate-400">
             <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-slate-300" />
             </div>
             <p className="text-sm font-medium">Không tìm thấy mẫu nào phù hợp với bộ lọc hiện tại.</p>
          </div>
        )}
      </div>
    </div>
  );
}
