import React from 'react';
import { Bell } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-slate-800 text-white p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Communication<br />Project Manager</h1>
        <button className="p-2">
          <Bell size={24} />
        </button>
      </div>
      <div className="mt-4 relative">
        <input
          type="text"
          placeholder="Search"
          className="w-full p-3 pl-10 rounded-lg bg-white text-slate-800"
        />
        <svg
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      </div>
    </header>
  );
}

export default Header;
