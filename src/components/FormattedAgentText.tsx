import React from 'react';

interface FormattedAgentTextProps {
  text: string;
}

export const FormattedAgentText: React.FC<FormattedAgentTextProps> = ({ text }) => {
  if (!text) return null;

  // Split content by lines to process block elements like headings, dividers, and list items
  const lines = text.split('\n');

  const formattedElements: React.ReactNode[] = [];

  lines.forEach((line, lineIdx) => {
    let trimmed = line.trim();

    // 1. Check for Horizontal Dividers (--- or *** or ___)
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      formattedElements.push(
        <hr key={`hr-${lineIdx}`} className="border-slate-700/60 my-3" />
      );
      return;
    }

    // 2. Check for Headings (###, ##, #)
    const headingMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      const headingContent = cleanInlineMarkdown(headingMatch[2]);
      formattedElements.push(
        <h4
          key={`h-${lineIdx}`}
          className="text-base font-bold text-cyan-300 mt-3 mb-1.5 flex items-center gap-1.5 border-b border-slate-700/50 pb-1"
        >
          <span>{headingContent}</span>
        </h4>
      );
      return;
    }

    // 3. Check for Bullet List Items (* , - , • )
    const bulletMatch = trimmed.match(/^([*\-•])\s+(.*)$/);
    if (bulletMatch) {
      const bulletContent = renderInlineFormatted(bulletMatch[2]);
      formattedElements.push(
        <div key={`li-${lineIdx}`} className="flex items-start gap-2 my-1 pl-1">
          <span className="text-cyan-400 font-bold shrink-0 text-xs mt-0.5">•</span>
          <span className="text-slate-200 text-sm">{bulletContent}</span>
        </div>
      );
      return;
    }

    // 4. Empty Line / Paragraph Spacing
    if (!trimmed) {
      formattedElements.push(<div key={`empty-${lineIdx}`} className="h-2" />);
      return;
    }

    // 5. Standard Paragraphs with inline bold/italic cleaning
    const paragraphContent = renderInlineFormatted(trimmed);
    formattedElements.push(
      <p key={`p-${lineIdx}`} className="my-1 text-slate-200 text-sm leading-relaxed">
        {paragraphContent}
      </p>
    );
  });

  return <div className="space-y-0.5">{formattedElements}</div>;
};

// Helper function to strip raw markdown symbols and parse inline bold/italics
function cleanInlineMarkdown(raw: string): string {
  return raw
    .replace(/\*\*(.*?)\*\*/g, '$1') // remove **
    .replace(/\*(.*?)\*/g, '$1')     // remove *
    .replace(/__(.*?)__/g, '$1')     // remove __
    .replace(/_(.*?)_/g, '$1')       // remove _
    .replace(/`([^`]+)`/g, '$1')     // remove inline code ticks
    .replace(/^#+\s*/, '')           // remove leading hashes
    .replace(/---/g, '')             // remove triple dashes
    .trim();
}

// Render string with inline <strong> and clean typography
function renderInlineFormatted(raw: string): React.ReactNode[] {
  // First strip any leftover hashes or triple dashes at edges
  const cleanedText = raw.replace(/---/g, '').replace(/^#+\s*/, '');

  // Split by bold pattern **text**
  const parts = cleanedText.split(/(\*\*.*?\*\*)/g);

  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      const inner = part.slice(2, -2);
      return (
        <strong key={idx} className="font-bold text-white">
          {inner}
        </strong>
      );
    }
    // Handle *italic* or _italic_
    if ((part.startsWith('*') && part.endsWith('*')) || (part.startsWith('_') && part.endsWith('_'))) {
      const inner = part.slice(1, -1);
      return (
        <em key={idx} className="italic text-slate-100">
          {inner}
        </em>
      );
    }
    return <span key={idx}>{part}</span>;
  });
}
