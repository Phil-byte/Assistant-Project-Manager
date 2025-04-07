import React from 'react';
import { Header } from '@/components/Header';
import { SectionTitle } from '@/components/SectionTitle';
import { ClientCard } from '@/components/ClientCard';
import { BriefCard } from '@/components/BriefCard';
import { ProjectCard } from '@/components/ProjectCard';
import { TaskCard } from '@/components/TaskCard';
import { BottomNavigation } from '@/components/BottomNavigation';

export default function HomePage() {
  // Données fictives pour la démonstration
  const clients = [
    { id: 1, name: 'Acme Corporation', email: 'acme@example.com' }
  ];
  
  const briefs = [
    { id: 1, title: 'New Product Launch' }
  ];
  
  const projects = [
    { id: 1, title: 'Website Redesign', status: 'In Progress', dueDate: 'May 20' }
  ];
  
  const tasks = [
    { id: 1, title: 'Create assets', priority: 'High' }
  ];

  return (
    <div className="pb-32"> {/* Padding bottom pour éviter que le contenu soit caché par la navigation */}
      <Header />
      
      <main>
        <SectionTitle title="Clients" actionLabel="Filters" onAction={() => {}} />
        {clients.map(client => (
          <ClientCard key={client.id} client={client} />
        ))}
        
        <SectionTitle title="Briefs" actionLabel="All" onAction={() => {}} />
        {briefs.map(brief => (
          <BriefCard key={brief.id} brief={brief} />
        ))}
        
        <SectionTitle title="Projects" actionLabel="All" onAction={() => {}} />
        {projects.map(project => (
          <ProjectCard key={project.id} project={project} />
        ))}
        
        <SectionTitle title="My Tasks" actionLabel="Today" onAction={() => {}} />
        {tasks.map(task => (
          <TaskCard key={task.id} task={task} />
        ))}
      </main>
      
      <BottomNavigation activeItem="dashboard" />
    </div>
  );
}
