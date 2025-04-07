import React from 'react';

export function TaskCard({ task }) {
  const priorityClasses = {
    high: "bg-red-100 text-red-800",
    medium: "bg-yellow-100 text-yellow-800",
    low: "bg-green-100 text-green-800"
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 mb-3 mx-4">
      <div className="flex items-start">
        <span className={`inline-block px-3 py-1 rounded-full text-sm mr-3 ${priorityClasses[task.priority.toLowerCase()]}`}>
          {task.priority}
        </span>
        <h3 className="font-semibold text-lg">{task.title}</h3>
      </div>
    </div>
  );
}

export default TaskCard;
