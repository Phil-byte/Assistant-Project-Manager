import React from 'react';

export function StatusBadge({ status }) {
  const statusClasses = {
    'in progress': "bg-blue-100 text-blue-800",
    'completed': "bg-green-100 text-green-800",
    'pending': "bg-yellow-100 text-yellow-800",
    'cancelled': "bg-red-100 text-red-800",
    'on hold': "bg-purple-100 text-purple-800",
  };

  const statusClass = statusClasses[status.toLowerCase()] || "bg-gray-100 text-gray-800";

  return (
    <span className={`inline-block px-3 py-1 rounded-full text-sm ${statusClass}`}>
      {status}
    </span>
  );
}

export default StatusBadge;
