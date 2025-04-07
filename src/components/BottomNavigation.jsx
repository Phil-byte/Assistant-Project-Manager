import React from 'react';
import { User, FileText, Folder, CheckSquare, Calendar, Bell, Filter, BarChart2, Grid, Shield } from 'lucide-react';
import Link from 'next/link';

export function BottomNavigation({ activeItem }) {
  const navItems = [
    { icon: User, label: 'Clients', href: '/clients' },
    { icon: FileText, label: 'Briefs', href: '/briefs' },
    { icon: Folder, label: 'Projects', href: '/projects' },
    { icon: CheckSquare, label: 'Tasks', href: '/tasks' },
    { icon: Calendar, label: 'Calendar', href: '/calendar' },
    { icon: Bell, label: 'Tags', href: '/tags' },
    { icon: Filter, label: 'Filters', href: '/filters' },
    { icon: BarChart2, label: 'Dashboard', href: '/dashboard' },
    { icon: Grid, label: 'Kanban', href: '/kanban' },
    { icon: Shield, label: 'Approvals', href: '/approvals' },
  ];

  // Première rangée de navigation (5 premiers éléments)
  const firstRow = navItems.slice(0, 5);
  // Deuxième rangée de navigation (5 derniers éléments)
  const secondRow = navItems.slice(5, 10);

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 pt-2">
      <div className="grid grid-cols-5 gap-1 mb-2">
        {firstRow.map((item) => (
          <Link 
            key={item.href} 
            href={item.href}
            className={`flex flex-col items-center p-2 ${
              activeItem === item.label.toLowerCase() ? 'text-slate-800' : 'text-slate-400'
            }`}
          >
            <item.icon size={24} />
            <span className="text-xs mt-1">{item.label}</span>
          </Link>
        ))}
      </div>
      <div className="grid grid-cols-5 gap-1 mb-2">
        {secondRow.map((item) => (
          <Link 
            key={item.href} 
            href={item.href}
            className={`flex flex-col items-center p-2 ${
              activeItem === item.label.toLowerCase() ? 'text-slate-800' : 'text-slate-400'
            }`}
          >
            <item.icon size={24} />
            <span className="text-xs mt-1">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}

export default BottomNavigation;
