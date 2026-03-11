'use client'
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface CodeProps {
  node?: any,
  inline?: any,
  className?: any,
  children?: any,
}

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const CodeBlock = useCallback(({ inline, className, children, ...props }: CodeProps) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [copied, setCopied] = useState(false);
    
    // Simple copy function
    const handleCopy = async () => {
      try {
        await navigator.clipboard.writeText(String(children).replace(/\n$/, ''));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy: ', err);
      }
    };
    
    return !inline ? (
      <pre className="my-2 rounded-md overflow-x-auto bg-gray-900 text-gray-100 p-4 text-sm">
        <code className={className} {...props}>
          {children}
        </code>
      </pre>
    ) : (
      <code className="px-1.5 py-0.5 rounded-sm bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-xs font-mono" {...props}>
        {children}
      </code>
    );
  }, []);

  return (
    <div className="markdown-renderer prose dark:prose-invert prose-sm max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code: CodeBlock,
          p: ({ children, ...props }) => (
            <p className="my-2 leading-relaxed text-gray-800 dark:text-gray-200" {...props}>{children}</p>
          ),
          h1: ({ children, ...props }) => (
            <h1 className="text-xl font-bold mb-3 mt-4 text-gray-900 dark:text-gray-100 border-b pb-1 border-gray-200 dark:border-gray-800" {...props}>
              {children}
            </h1>
          ),
          h2: ({ children, ...props }) => (
            <h2 className="text-lg font-semibold mb-2 mt-4 text-gray-900 dark:text-gray-100" {...props}>
              {children}
            </h2>
          ),
          h3: ({ children, ...props }) => (
            <h3 className="text-base font-semibold mb-2 mt-3 text-gray-900 dark:text-gray-100" {...props}>
              {children}
            </h3>
          ),
          a: ({ children, href, ...props }) => (
            <a 
              href={href}
              {...props} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-orange-600 hover:text-orange-700 underline underline-offset-2 transition-colors"
            >
              {children}
              <span className="inline-block ml-0.5" aria-hidden="true">↗</span>
            </a>
          ),
          ul: ({ children, ...props }) => (
            <ul className="list-disc pl-5 my-2 space-y-1 text-gray-800 dark:text-gray-200" {...props}>{children}</ul>
          ),
          ol: ({ children, ...props }) => (
            <ol className="list-decimal pl-5 my-2 space-y-1 text-gray-800 dark:text-gray-200" {...props}>{children}</ol>
          ),
          li: ({ children, ...props }) => (
            <li className="my-0.5" {...props}>{children}</li>
          ),
          blockquote: ({ children, ...props }) => (
            <blockquote className="pl-4 border-l-4 border-orange-500 text-gray-700 dark:text-gray-300 my-3 bg-orange-50 dark:bg-gray-800/50 py-2 rounded-r-md" {...props}>
              {children}
            </blockquote>
          ),
          hr: ({ ...props }) => (
            <hr className="my-4 border-gray-200 dark:border-gray-700" {...props} />
          ),
          table: ({ children, ...props }) => (
            <div className="overflow-x-auto my-3 border border-gray-200 dark:border-gray-700 rounded-md">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-gray-800 dark:text-gray-200" {...props}>{children}</table>
            </div>
          ),
          thead: ({ children, ...props }) => (
            <thead className="bg-gray-50 dark:bg-gray-800" {...props}>{children}</thead>
          ),
          tr: ({ children, ...props }) => (
            <tr className="even:bg-gray-50 dark:even:bg-gray-800/50" {...props}>{children}</tr>
          ),
          th: ({ children, ...props }) => (
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider" {...props}>
              {children}
            </th>
          ),
          td: ({ children, ...props }) => (
            <td className="px-3 py-2 text-sm whitespace-normal" {...props}>{children}</td>
          ),
          strong: ({ children, ...props }) => (
            <strong className="font-bold text-gray-900 dark:text-gray-100" {...props}>{children}</strong>
          ),
          em: ({ children, ...props }) => (
            <em className="italic text-gray-800 dark:text-gray-200" {...props}>{children}</em>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}