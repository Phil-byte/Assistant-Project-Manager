import React from 'react';
import { Header } from '@/components/Header';
import { SectionTitle } from '@/components/SectionTitle';
import { TaskCard } from '@/components/TaskCard';
import { BottomNavigation } from '@/components/BottomNavigation';

export default function TasksPage() {
  // Données fictives pour la démonstration
  const tasks = [
    { id: 1, title: 'Create assets', priority: 'High' },
    { id: 2, title: 'Review content', priority: 'Medium' },
    { id: 3, title: 'Update documentation', priority: 'Low' },
    { id: 4, title: 'Prepare presentation', priority: 'High' }
  ];

  return (
    <div className="pb-32">
      <Header />
      
      <main>
        <SectionTitle title="My Tasks" actionLabel="Filters" onAction={() => {}} />
        
        {tasks.map(task => (
          <TaskCard key={task.id} task={task} />
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
      
      <BottomNavigation activeItem="tasks" />
    </div>
  );
}
