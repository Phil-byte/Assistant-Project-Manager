import React from 'react';
import { Header } from '@/components/Header';
import { SectionTitle } from '@/components/SectionTitle';
import { ProjectCard } from '@/components/ProjectCard';
import { BottomNavigation } from '@/components/BottomNavigation';

export default function ProjectsPage() {
  // Données fictives pour la démonstration
  const projects = [
    { id: 1, title: 'Website Redesign', status: 'In Progress', dueDate: 'May 20' },
    { id: 2, title: 'Social Media Campaign', status: 'Pending', dueDate: 'June 15' },
    { id: 3, title: 'Product Brochure', status: 'Completed', dueDate: 'April 10' },
    { id: 4, title: 'Annual Report', status: 'On Hold', dueDate: 'July 30' }
  ];

  return (
    <div className="pb-32">
      <Header />
      
      <main>
        <SectionTitle title="Projects" actionLabel="Filters" onAction={() => {}} />
        
        {projects.map(project => (
          <ProjectCard key={project.id} project={project} />
        ))}
        
        <div className="fixed right-6 bottom-32">
          <button className="bg-orange-500 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg">
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
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
        </div>
      </main>
      
      <BottomNavigation activeItem="projects" />
    </div>
  );
}
