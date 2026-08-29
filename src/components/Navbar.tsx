import { CheckSquare, FileText, Timer, Wrench, Sparkles, LayoutGrid } from 'lucide-react';
import { TabType } from '../types';

interface NavbarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  taskCount: number;
  noteCount: number;
}

export function Navbar({ activeTab, setActiveTab, taskCount, noteCount }: NavbarProps) {
  const tabs = [
    { id: 'tasks' as TabType, label: 'Task Board', icon: CheckSquare, count: taskCount },
    { id: 'notes' as TabType, label: 'Notes & Memos', icon: FileText, count: noteCount },
    { id: 'timer' as TabType, label: 'Focus Timer', icon: Timer },
    { id: 'tools' as TabType, label: 'Quick Utilities', icon: Wrench },
    { id: 'blueprints' as TabType, label: 'App Blueprints', icon: Sparkles },
  ];

  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-200">
              <LayoutGrid className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 leading-tight">Web Workspace</h1>
              <p className="text-xs text-slate-500 hidden sm:block">Productivity, Notes & Prototyping Suite</p>
            </div>
          </div>

          <nav className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto py-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`nav-tab-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-150 whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                        isActive ? 'bg-slate-800 text-slate-200' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
