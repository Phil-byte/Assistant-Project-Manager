import React from 'react';
import { Header } from '@/components/Header';
import { SectionTitle } from '@/components/SectionTitle';
import { BriefCard } from '@/components/BriefCard';
import { BottomNavigation } from '@/components/BottomNavigation';

export default function BriefsPage() {
  // Données fictives pour la démonstration
  const briefs = [
    { id: 1, title: 'New Product Launch' },
    { id: 2, title: 'Annual Report Design' },
    { id: 3, title: 'Social Media Campaign' },
    { id: 4, title: 'Corporate Event Planning' }
  ];

  return (
    <div className="pb-32">
      <Header />
      
      <main>
        <SectionTitle title="Briefs" actionLabel="Filters" onAction={() => {}} />
        
        {briefs.map(brief => (
          <BriefCard key={brief.id} brief={brief} />
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
      
      <BottomNavigation activeItem="briefs" />
    </div>
  );
}
