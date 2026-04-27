import React from 'react';
import ReactMarkdown, { Components } from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { Brain, Sparkles, Copy, Check } from 'lucide-react';

interface AIResponseRendererProps {
  content: string;
}

const CodeBlock = ({ node, inline, className, children, ...props }: any) => {
  const [copied, setCopied] = React.useState(false);
  const match = /language-(\w+)/.exec(className || '');
  
  const handleCopy = () => {
    navigator.clipboard.writeText(String(children).replace(/\n$/, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!inline && match) {
    return (
      <div className="relative group mt-4 mb-6 rounded-lg overflow-hidden bg-[#1E1E1E]">
        <div className="flex items-center justify-between px-4 py-1.5 bg-[#2D2D2D] text-slate-300 text-xs font-mono">
          <span>{match[1]}</span>
          <button 
            onClick={handleCopy}
            className="flex items-center gap-1.5 hover:text-white transition-colors p-1"
          >
            {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
        <pre className="m-0 overflow-x-auto p-4 text-sm leading-6 text-slate-100">
          <code {...props}>{String(children).replace(/\n$/, '')}</code>
        </pre>
      </div>
    );
  }

  return (
    <code className={`${className} bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded-md font-mono text-sm`} {...props}>
      {children}
    </code>
  );
};

export default function AIResponseRenderer({ content }: AIResponseRendererProps) {
  // Regex fixer: auto-close common tags if missing during streaming
  let processedContent = content;
  
  // Basic check to see if <thinking> exists but not </thinking>
  if (processedContent.includes('<thinking>') && !processedContent.includes('</thinking>')) {
    processedContent += '\n</thinking>';
  }
  if (processedContent.includes('<response>') && !processedContent.includes('</response>')) {
    processedContent += '\n</response>';
  }

  const components: Components = {
    code: CodeBlock,
    // Custom elements (TypeScript complains, so we cast to any or use standard strings for unknown elements if rehype-raw handles them, but React needs to know)
    // Actually, react-markdown supports custom tags if provided in components, but types might be strict.
    // We can cast `components` as any to bypass strict type checking for custom elements.
    thinking: ({ children }: any) => (
      <div className="bg-slate-50 border-l-4 border-indigo-400 p-4 my-4 rounded-r-lg text-slate-600 text-sm">
        <div className="font-bold flex items-center gap-2 mb-2 text-indigo-700">
          <Brain size={16} />
          <span>Suy luận hệ thống</span>
        </div>
        <div className="space-y-2">{children}</div>
      </div>
    ),
    response: ({ children }: any) => (
      <div className="bg-white border border-emerald-100 p-5 mt-6 rounded-xl shadow-sm">
        <div className="font-bold flex items-center gap-2 mb-3 text-emerald-600 border-b border-emerald-50 pb-2">
          <Sparkles size={16} className="text-amber-500" />
          <span>Kết quả trả về</span>
        </div>
        <div className="space-y-3">{children}</div>
      </div>
    )
  } as any;

  return (
    <div className="prose prose-sm md:prose-base prose-slate max-w-none 
      prose-headings:font-bold prose-headings:text-slate-900 
      prose-h1:text-2xl prose-h2:text-xl
      prose-a:text-emerald-600 prose-a:no-underline hover:prose-a:underline
      prose-strong:text-slate-900 prose-strong:font-semibold
      prose-p:leading-relaxed prose-li:leading-relaxed">
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]} 
        components={components}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
}
