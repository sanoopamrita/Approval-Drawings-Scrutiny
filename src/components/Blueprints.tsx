import { useState } from 'react';
import { Copy, Check, ArrowRight, Sparkles, Layers, Terminal } from 'lucide-react';
import { AppIdeaTemplate } from '../types';

const APP_BLUEPRINTS: AppIdeaTemplate[] = [
  {
    id: 'habit-tracker',
    title: 'Habit & Daily Routine Tracker',
    category: 'Productivity & Wellness',
    description: 'A visual daily habit streak tracker with calendar heatmaps, completion rates, and customizable reminder logs.',
    keyFeatures: ['Daily streak counters', 'GitHub-style activity heatmap', 'Category grouping', 'Weekly performance stats'],
    techStack: ['React', 'Tailwind CSS', 'Recharts / SVG Heatmap', 'Local Storage'],
    promptExample: 'Build a full-featured Habit & Daily Routine Tracker with streak counters, category tags, weekly analytics bar charts, and a GitHub-style activity grid.',
  },
  {
    id: 'personal-finance',
    title: 'Expense & Budgeting Dashboard',
    category: 'Finance & Analytics',
    description: 'Smart income & expense manager with category breakdown, budget targets, receipt itemizer, and monthly savings forecasting.',
    keyFeatures: ['Income/Expense logging', 'Category pie & bar charts', 'Monthly budget limit alerts', 'CSV export'],
    techStack: ['React', 'Tailwind CSS', 'Chart.js / Recharts', 'Client-side analytics'],
    promptExample: 'Create a clean personal finance and budget tracker with income/expense log, category breakdown charts, monthly savings goal progress, and transaction filters.',
  },
  {
    id: 'markdown-studio',
    title: 'Interactive Markdown & Diagram Studio',
    category: 'Developer & Writing Tools',
    description: 'Live split-screen markdown editor with Mermaid flowchart preview, syntax highlighting, word metrics, and PDF/HTML exporter.',
    keyFeatures: ['Side-by-side live preview', 'Table generator', 'Mermaid diagram rendering', 'Code snippet copying'],
    techStack: ['React', 'React-Markdown', 'Tailwind CSS', 'Mermaid.js'],
    promptExample: 'Build an interactive Markdown & Documentation Studio with split-pane live preview, table formatting helper, character stats, and instant export.',
  },
  {
    id: 'flashcard-quiz',
    title: 'Spaced Repetition Flashcard App',
    category: 'Education & Learning',
    description: 'Interactive flashcards with spaced-repetition algorithm (Leitner system), custom deck creator, and timed quiz mode.',
    keyFeatures: ['Custom deck creation', 'Flip card animation', 'Score retention tracker', 'Quiz timer'],
    techStack: ['React', 'Motion Animations', 'Tailwind CSS', 'Audio FX'],
    promptExample: 'Create a spaced repetition study deck app with 3D card flip animations, deck creator, quiz scoring, and mastery progress meters.',
  },
  {
    id: 'kanban-scrum',
    title: 'Agile Project & Sprint Board',
    category: 'Collaboration & Management',
    description: 'Feature-packed project board with sprint milestones, priority matrices, subtasks checklists, and member avatar assignments.',
    keyFeatures: ['Sprint milestone tracking', 'Subtasks checklist', 'Custom labels & tags', 'Filter by assignee'],
    techStack: ['React', 'Tailwind CSS', 'Local persistence'],
    promptExample: 'Build an Agile Scrum Project Board with sprint goals, story points estimation, drag-and-drop tasks, and burndown chart metrics.',
  },
];

interface BlueprintsProps {
  onSelectPrompt?: (prompt: string) => void;
}

export function Blueprints({ onSelectPrompt }: BlueprintsProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['all', ...Array.from(new Set(APP_BLUEPRINTS.map((b) => b.category)))];

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filtered = APP_BLUEPRINTS.filter(
    (b) => selectedCategory === 'all' || b.category === selectedCategory
  );

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ready-to-Build Concepts</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">App Blueprints & Idea Starter</h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            Explore ready-to-build web app architectures. Click any prompt below to copy it or instruct the assistant to build it next!
          </p>
        </div>
      </div>

      {/* Category filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap cursor-pointer transition-colors ${
              selectedCategory === cat
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {cat === 'all' ? 'All Blueprints' : cat}
          </button>
        ))}
      </div>

      {/* Blueprint Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((item) => {
          const isCopied = copiedId === item.id;
          return (
            <div
              key={item.id}
              className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2.5 py-0.5 rounded-md">
                    {item.category}
                  </span>
                  <div className="flex items-center gap-1 text-slate-400 text-xs">
                    <Layers className="w-3.5 h-3.5" />
                    <span>Modular</span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">{item.description}</p>

                {/* Key Features */}
                <div className="space-y-1.5 pt-2">
                  <div className="text-[11px] font-semibold text-slate-500">Key Capabilities:</div>
                  <ul className="grid grid-cols-2 gap-1 text-xs text-slate-700">
                    {item.keyFeatures.map((feat, idx) => (
                      <li key={idx} className="flex items-center gap-1.5">
                        <div className="w-1 h-1 rounded-full bg-indigo-600" />
                        <span className="truncate">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Prompt box */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs font-mono text-slate-700 leading-relaxed flex items-start gap-2">
                  <Terminal className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{item.promptExample}</span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleCopy(item.id, item.promptExample)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isCopied ? 'Prompt Copied!' : 'Copy Prompt'}</span>
                  </button>
                  {onSelectPrompt && (
                    <button
                      onClick={() => onSelectPrompt(item.promptExample)}
                      className="flex items-center gap-1 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <span>Use Prompt</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
