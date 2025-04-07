import React from 'react';

export function SectionTitle({ title, actionLabel, onAction }) {
  return (
    <div className="flex justify-between items-center px-4 py-3">
      <h2 className="text-xl font-semibold">{title}</h2>
      {actionLabel && (
        <button 
          onClick={onAction} 
          className="text-slate-800 flex items-center"
        >
          {actionLabel}
          <svg
            className="ml-1"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>
      )}
    </div>
  );
}

export default SectionTitle;
