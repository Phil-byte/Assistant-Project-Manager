import React from 'react';

export function PriorityBadge({ priority }) {
  const priorityClasses = {
    'high': "bg-red-100 text-red-800",
    'medium': "bg-yellow-100 text-yellow-800",
    'low': "bg-green-100 text-green-800",
  };

  const priorityClass = priorityClasses[priority.toLowerCase()] || "bg-gray-100 text-gray-800";

  return (
    <span className={`inline-block px-3 py-1 rounded-full text-sm ${priorityClass}`}>
      {priority}
    </span>
  );
}

export default PriorityBadge;
