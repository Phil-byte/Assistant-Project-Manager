import React from 'react';

export function BriefCard({ brief }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 mb-3 mx-4">
      <h3 className="font-semibold text-lg">{brief.title}</h3>
    </div>
  );
}

export default BriefCard;
