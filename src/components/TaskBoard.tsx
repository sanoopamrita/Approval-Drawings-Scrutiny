import { useState, FormEvent, ComponentType } from 'react';
import { Plus, Trash2, CheckCircle2, Clock, AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { Task, TaskStatus, Priority } from '../types';

interface TaskBoardProps {
  tasks: Task[];
  onAddTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  onUpdateStatus: (id: string, status: TaskStatus) => void;
  onDeleteTask: (id: string) => void;
}

export function TaskBoard({ tasks, onAddTask, onUpdateStatus, onDeleteTask }: TaskBoardProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // New task form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [category, setCategory] = useState('General');
  const [dueDate, setDueDate] = useState('');

  const categories = ['all', ...Array.from(new Set(tasks.map((t) => t.category)))];

  const handleCreate = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddTask({
      title: title.trim(),
      description: description.trim(),
      status: 'todo',
      priority,
      category: category.trim() || 'General',
      dueDate: dueDate || undefined,
    });

    setTitle('');
    setDescription('');
    setPriority('medium');
    setDueDate('');
    setShowAddModal(false);
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesCategory = filterCategory === 'all' || task.category === filterCategory;
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const columns: { id: TaskStatus; title: string; color: string; icon: ComponentType<{ className?: string }> }[] = [
    { id: 'todo', title: 'To Do', color: 'border-amber-400/80 bg-amber-50/50', icon: Clock },
    { id: 'in-progress', title: 'In Progress', color: 'border-blue-400/80 bg-blue-50/50', icon: AlertCircle },
    { id: 'done', title: 'Completed', color: 'border-emerald-400/80 bg-emerald-50/50', icon: CheckCircle2 },
  ];

  const getPriorityBadge = (p: Priority) => {
    switch (p) {
      case 'high':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded bg-rose-100 text-rose-700">High</span>;
      case 'medium':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded bg-amber-100 text-amber-700">Medium</span>;
      case 'low':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded bg-slate-100 text-slate-600">Low</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent w-full sm:w-64"
          />
          <div className="flex items-center gap-1.5 text-sm text-slate-600">
            <span>Category:</span>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-2.5 py-1.5 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          id="btn-add-task"
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add Task</span>
        </button>
      </div>

      {/* Task Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map((col) => {
          const colTasks = filteredTasks.filter((t) => t.status === col.id);
          const Icon = col.icon;

          return (
            <div key={col.id} className="flex flex-col bg-slate-50 border border-slate-200 rounded-xl p-4 min-h-[420px]">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-slate-600" />
                  <h3 className="font-semibold text-slate-800 text-sm">{col.title}</h3>
                  <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-medium">
                    {colTasks.length}
                  </span>
                </div>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto">
                {colTasks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 border border-dashed border-slate-200 rounded-lg text-slate-400 text-xs p-4 text-center">
                    <span>No tasks in {col.title.toLowerCase()}</span>
                  </div>
                ) : (
                  colTasks.map((task) => (
                    <div
                      key={task.id}
                      className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs hover:border-slate-300 transition-all space-y-2.5 group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-medium text-slate-900 text-sm leading-snug">{task.title}</h4>
                        <button
                          onClick={() => onDeleteTask(task.id)}
                          className="text-slate-400 hover:text-rose-600 transition-colors opacity-80 group-hover:opacity-100 p-1"
                          title="Delete task"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {task.description && (
                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{task.description}</p>
                      )}

                      <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                        <div className="flex items-center gap-2">
                          {getPriorityBadge(task.priority)}
                          <span className="text-slate-400 text-[11px]">{task.category}</span>
                        </div>
                        {task.dueDate && (
                          <span className="text-[11px] text-slate-500 font-medium">{task.dueDate}</span>
                        )}
                      </div>

                      {/* Status quick mover */}
                      <div className="flex items-center justify-end gap-1 pt-1">
                        {col.id !== 'todo' && (
                          <button
                            onClick={() =>
                              onUpdateStatus(task.id, col.id === 'done' ? 'in-progress' : 'todo')
                            }
                            className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 text-xs flex items-center gap-1"
                            title="Move backwards"
                          >
                            <ArrowLeft className="w-3 h-3" />
                          </button>
                        )}
                        {col.id !== 'done' && (
                          <button
                            onClick={() =>
                              onUpdateStatus(task.id, col.id === 'todo' ? 'in-progress' : 'done')
                            }
                            className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 text-xs flex items-center gap-1"
                            title="Move forwards"
                          >
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Create New Task</h3>
            <form onSubmit={handleCreate} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Design homepage layout"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Additional context or checklist..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Priority)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Category</label>
                  <input
                    type="text"
                    placeholder="e.g. Work, Personal"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium bg-slate-900 text-white rounded-lg hover:bg-slate-800"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
