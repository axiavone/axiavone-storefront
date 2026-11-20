import ReactMarkdown from 'react-markdown';

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const normalizedContent = content.replace(/\\r\\n/g, '\n').replace(/\\n/g, '\n');

  return (
    <div className="space-y-4 text-[15px] leading-relaxed text-zinc-300">
      <ReactMarkdown
        components={{
          h2: ({ children }) => (
            <h2 className="font-display text-2xl font-semibold tracking-tight text-white pt-4 pb-1 [text-wrap:balance]">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="font-display text-lg font-semibold tracking-tight text-white pt-3 pb-1">
              {children}
            </h3>
          ),
          p: ({ children }) => <p className="text-zinc-300 leading-7">{children}</p>,
          ul: ({ children }) => <ul className="space-y-2.5 pl-5 list-disc marker:text-[#3B82F6]">{children}</ul>,
          ol: ({ children }) => (
            <ol className="space-y-2.5 pl-5 list-decimal marker:text-zinc-400 marker:font-mono">{children}</ol>
          ),
          li: ({ children }) => <li className="text-zinc-300 leading-relaxed">{children}</li>,
          strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
          code: ({ children }) => (
            <code className="rounded bg-[#18181B] px-1.5 py-0.5 font-mono text-[13px] text-zinc-100 border border-white/10">
              {children}
            </code>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#60A5FA] underline underline-offset-4 hover:text-white transition-colors"
            >
              {children}
            </a>
          ),
        }}
      >
        {normalizedContent}
      </ReactMarkdown>
    </div>
  );
}
