import React from 'react';
import { Header } from '@/components/Header';
import { SectionTitle } from '@/components/SectionTitle';
import { ClientCard } from '@/components/ClientCard';
import { BottomNavigation } from '@/components/BottomNavigation';

export default function ClientsPage() {
  // Données fictives pour la démonstration
  const clients = [
    { id: 1, name: 'Acme Corporation', email: 'acme@example.com' },
    { id: 2, name: 'Globex Industries', email: 'contact@globex.com' },
    { id: 3, name: 'Initech', email: 'info@initech.com' },
    { id: 4, name: 'Massive Dynamic', email: 'hello@massive.org' }
  ];

  return (
    <div className="pb-32">
      <Header />
      
      <main>
        <SectionTitle title="Clients" actionLabel="Filters" onAction={() => {}} />
        
        {clients.map(client => (
          <ClientCard key={client.id} client={client} />
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
      
      <BottomNavigation activeItem="clients" />
    </div>
  );
}
