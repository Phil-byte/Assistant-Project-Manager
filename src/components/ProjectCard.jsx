import React from 'react';

export function ProjectCard({ project }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 mb-3 mx-4">
      <div className="flex justify-between items-start">
        <h3 className="font-semibold text-lg">{project.title}</h3>
        <span className="text-slate-500">Due {project.dueDate}</span>
      </div>
      <div className="mt-2">
        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
          {project.status}
        </span>
      </div>
    </div>
  );
}

export default ProjectCard;
