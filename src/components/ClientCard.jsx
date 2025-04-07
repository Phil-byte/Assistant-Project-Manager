import React from 'react';

export function ClientCard({ client }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 mb-3 mx-4">
      <div className="flex items-center">
        <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center text-white text-xl font-bold mr-3">
          {client.name.charAt(0)}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-lg">{client.name}</h3>
          <p className="text-slate-500">{client.email}</p>
        </div>
        <button className="text-slate-400">
          <svg
            width="24"
            height="24"
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
      </div>
    </div>
  );
}

export default ClientCard;
