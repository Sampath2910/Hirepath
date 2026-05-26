"use client";

import { ReactNode } from "react";

interface ResumePreviewProps {
  text: string;
}

export default function ResumePreview({ text }: ResumePreviewProps) {
  const lines = text.split(/\r?\n/);
  const nodes: ReactNode[] = [];
  let listItems: ReactNode[] = [];

  const flushList = () => {
    if (listItems.length > 0) {
      nodes.push(
        <ul key={`list-${nodes.length}`} className="list-disc list-inside ml-5 mb-4 space-y-1 text-sm text-slate-700">
          {listItems}
        </ul>
      );
      listItems = [];
    }
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed) {
      flushList();
      nodes.push(<div key={`spacer-${index}`} className="h-2" />);
      return;
    }

    const markdownHeadingMatch = trimmed.match(/^#{1,6}\s*(.*)$/);
    if (markdownHeadingMatch) {
      const headingText = markdownHeadingMatch[1].trim();
      nodes.push(
        <div key={`heading-${index}`} className="mt-4 mb-2 text-sm font-semibold uppercase tracking-[0.12em] text-slate-800">
          {headingText}
        </div>
      );
      return;
    }

    const listMatch = trimmed.match(/^[-*+•]\s+(.*)$/);
    if (listMatch) {
      listItems.push(<li key={`item-${index}`}>{listMatch[1]}</li>);
      return;
    }

    flushList();

    const cleanLine = trimmed.replace(/^>\s*/, "");
    const headingCandidate = cleanLine.replace(/[: ]+$/, "");
    if (/^[A-Z0-9][A-Z0-9\s&\-\/]{3,}$/.test(headingCandidate) && headingCandidate === headingCandidate.toUpperCase()) {
      nodes.push(
        <div key={`heading-${index}`} className="mt-4 mb-2 text-sm font-semibold uppercase tracking-[0.12em] text-slate-800">
          {headingCandidate}
        </div>
      );
      return;
    }

    if (trimmed.endsWith(":") || /^(Summary|Skills|Experience|Education|Projects|Certifications):?/i.test(trimmed)) {
      nodes.push(
        <div key={`section-${index}`} className="mt-4 mb-2 text-sm font-semibold uppercase tracking-[0.08em] text-slate-800">
          {trimmed.replace(/:$/, "")}
        </div>
      );
      return;
    }

    nodes.push(
      <p key={`line-${index}`} className="text-sm leading-6 text-slate-700 mb-2">
        {trimmed}
      </p>
    );
  });

  flushList();

  if (nodes.length === 0) {
    return <p className="text-sm leading-6 text-slate-700">No preview available.</p>;
  }

  return <div>{nodes}</div>;
}
