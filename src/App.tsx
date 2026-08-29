import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Navbar } from './components/Navbar';
import { TaskBoard } from './components/TaskBoard';
import { NotesPad } from './components/NotesPad';
import { FocusTimer } from './components/FocusTimer';
import { QuickTools } from './components/QuickTools';
import { Blueprints } from './components/Blueprints';
import { TabType, Task, Note, TaskStatus } from './types';

const INITIAL_TASKS: Task[] = [
  {
    id: 't-1',
    title: 'Explore Web Workspace features',
    description: 'Check out the task board, markdown notes, focus timer, and calculation utilities.',
    status: 'in-progress',
    priority: 'high',
    category: 'Productivity',
    dueDate: '2026-08-30',
    createdAt: Date.now() - 3600000,
  },
  {
    id: 't-2',
    title: 'Customize notes with markdown',
    description: 'Write quick memos, checklists, code blocks, or draft project documentation.',
    status: 'todo',
    priority: 'medium',
    category: 'Docs',
    createdAt: Date.now() - 7200000,
  },
  {
    id: 't-3',
    title: 'Complete a 25-minute Pomodoro focus session',
    description: 'Use the built-in timer with acoustic chimes to maintain deep focus.',
    status: 'done',
    priority: 'low',
    category: 'Wellness',
    createdAt: Date.now() - 10800000,
  },
];

const INITIAL_NOTES: Note[] = [
  {
    id: 'n-1',
    title: 'Welcome to your Web Workspace',
    content: `## Quick Start Guide

This workspace is designed to be your instant all-in-one productivity hub:

- **Task Board**: Organize tasks by status (To Do, In Progress, Done), filter by category, and assign priorities.
- **Notes & Memos**: Write quick markdown thoughts, tag them, pin important items, and export as \`.md\`.
- **Focus Timer**: Boost concentration with customizable Pomodoro intervals and gentle chimes.
- **Quick Utilities**: Math scratchpad, unit conversions, JSON validator, and word counters.
- **App Blueprints**: Explore architectures and copy tailored prompts to build any web app idea next.

Everything is stored locally on your device!`,
    tags: ['welcome', 'guide'],
    color: '#ffffff',
    isPinned: true,
    updatedAt: Date.now(),
  },
  {
    id: 'n-2',
    title: 'Project Ideas & Inspiration',
    content: `Ideas to build or explore:
- Real-time collaborative canvas
- AI-assisted resume builder
- Fitness routine generator
- Interactive SQL playground`,
    tags: ['ideas', 'brainstorm'],
    color: '#ffffff',
    isPinned: false,
    updatedAt: Date.now() - 1800000,
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('tasks');
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem('web_workspace_tasks');
      return saved ? JSON.parse(saved) : INITIAL_TASKS;
    } catch {
      return INITIAL_TASKS;
    }
  });

  const [notes, setNotes] = useState<Note[]>(() => {
    try {
      const saved = localStorage.getItem('web_workspace_notes');
      return saved ? JSON.parse(saved) : INITIAL_NOTES;
    } catch {
      return INITIAL_NOTES;
    }
  });

  // Local storage persistence
  useEffect(() => {
    try {
      localStorage.setItem('web_workspace_tasks', JSON.stringify(tasks));
    } catch {
      // ignore storage errors
    }
  }, [tasks]);

  useEffect(() => {
    try {
      localStorage.setItem('web_workspace_notes', JSON.stringify(notes));
    } catch {
      // ignore storage errors
    }
  }, [notes]);

  // Task Handlers
  const handleAddTask = (newTask: Omit<Task, 'id' | 'createdAt'>) => {
    const task: Task = {
      ...newTask,
      id: 't-' + Date.now(),
      createdAt: Date.now(),
    };
    setTasks((prev) => [task, ...prev]);
  };

  const handleUpdateStatus = (id: string, status: TaskStatus) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
  };

  const handleDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  // Note Handlers
  const handleAddNote = (newNote: Omit<Note, 'id' | 'updatedAt'>) => {
    const note: Note = {
      ...newNote,
      id: 'n-' + Date.now(),
      updatedAt: Date.now(),
    };
    setNotes((prev) => [note, ...prev]);
  };

  const handleUpdateNote = (id: string, updates: Partial<Note>) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, ...updates, updatedAt: Date.now() } : n))
    );
  };

  const handleDeleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        taskCount={tasks.filter((t) => t.status !== 'done').length}
        noteCount={notes.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            {activeTab === 'tasks' && (
              <TaskBoard
                tasks={tasks}
                onAddTask={handleAddTask}
                onUpdateStatus={handleUpdateStatus}
                onDeleteTask={handleDeleteTask}
              />
            )}

            {activeTab === 'notes' && (
              <NotesPad
                notes={notes}
                onAddNote={handleAddNote}
                onUpdateNote={handleUpdateNote}
                onDeleteNote={handleDeleteNote}
              />
            )}

            {activeTab === 'timer' && <FocusTimer />}

            {activeTab === 'tools' && <QuickTools />}

            {activeTab === 'blueprints' && (
              <Blueprints />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Subtle Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-400">
        <p>Web Workspace · Built with React, Tailwind CSS & Motion</p>
      </footer>
    </div>
  );
}
