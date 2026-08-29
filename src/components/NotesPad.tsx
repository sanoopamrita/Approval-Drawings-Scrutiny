import { useState } from 'react';
import { Plus, Pin, Trash2, Tag, Download, Search } from 'lucide-react';
import { Note } from '../types';

interface NotesPadProps {
  notes: Note[];
  onAddNote: (note: Omit<Note, 'id' | 'updatedAt'>) => void;
  onUpdateNote: (id: string, updates: Partial<Note>) => void;
  onDeleteNote: (id: string) => void;
}

export function NotesPad({ notes, onAddNote, onUpdateNote, onDeleteNote }: NotesPadProps) {
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(notes[0]?.id || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTag, setActiveTag] = useState<string>('all');

  // Collect unique tags
  const allTags = ['all', ...Array.from(new Set(notes.flatMap((n) => n.tags || [])))];

  const handleNewNote = () => {
    const newNoteObj = {
      title: 'Untitled Note',
      content: '',
      tags: ['general'],
      color: '#f8fafc',
      isPinned: false,
    };
    onAddNote(newNoteObj);
  };

  const filteredNotes = notes
    .filter((note) => {
      const matchesSearch =
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTag = activeTag === 'all' || (note.tags && note.tags.includes(activeTag));
      return matchesSearch && matchesTag;
    })
    .sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return b.updatedAt - a.updatedAt;
    });

  const currentNote = notes.find((n) => n.id === selectedNoteId) || filteredNotes[0] || null;

  const exportCurrentNote = () => {
    if (!currentNote) return;
    const blob = new Blob([`# ${currentNote.title}\n\n${currentNote.content}`], {
      type: 'text/markdown;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentNote.title.toLowerCase().replace(/\s+/g, '_') || 'note'}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[560px]">
      {/* Sidebar Note List */}
      <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-4 flex flex-col space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">All Notes</h3>
          <button
            id="btn-new-note"
            onClick={handleNewNote}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-medium hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Note</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
          />
        </div>

        {/* Tags */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs text-slate-500">
          <Tag className="w-3 h-3 shrink-0" />
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag)}
              className={`px-2 py-0.5 rounded-md text-[11px] whitespace-nowrap cursor-pointer ${
                activeTag === tag
                  ? 'bg-slate-900 text-white font-medium'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* List of notes */}
        <div className="space-y-2 flex-1 overflow-y-auto max-h-[460px] pr-1">
          {filteredNotes.length === 0 ? (
            <div className="text-center py-10 text-xs text-slate-400">No notes found</div>
          ) : (
            filteredNotes.map((note) => {
              const isSelected = currentNote?.id === note.id;
              return (
                <div
                  key={note.id}
                  onClick={() => setSelectedNoteId(note.id)}
                  className={`p-3 rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-slate-900 bg-slate-50/90 shadow-xs'
                      : 'border-slate-100 hover:border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-1 mb-1">
                    <h4 className="font-semibold text-slate-900 text-xs truncate">
                      {note.title || 'Untitled Note'}
                    </h4>
                    {note.isPinned && <Pin className="w-3 h-3 text-amber-500 fill-amber-500 shrink-0" />}
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                    {note.content || 'Empty note...'}
                  </p>
                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100 text-[10px] text-slate-400">
                    <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
                    <div className="flex gap-1">
                      {note.tags?.slice(0, 2).map((t) => (
                        <span key={t} className="bg-slate-100 text-slate-500 px-1.5 py-0.2 rounded">
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Note Editor */}
      <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-6 flex flex-col space-y-4 shadow-xs">
        {currentNote ? (
          <>
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <input
                type="text"
                value={currentNote.title}
                onChange={(e) =>
                  onUpdateNote(currentNote.id, { title: e.target.value, updatedAt: Date.now() })
                }
                placeholder="Note title..."
                className="text-lg font-bold text-slate-900 focus:outline-none w-full mr-4 bg-transparent"
              />
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() =>
                    onUpdateNote(currentNote.id, { isPinned: !currentNote.isPinned, updatedAt: Date.now() })
                  }
                  className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                    currentNote.isPinned
                      ? 'border-amber-200 bg-amber-50 text-amber-600'
                      : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                  }`}
                  title={currentNote.isPinned ? 'Unpin note' : 'Pin note'}
                >
                  <Pin className="w-4 h-4" />
                </button>
                <button
                  onClick={exportCurrentNote}
                  className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer"
                  title="Export Markdown"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDeleteNote(currentNote.id)}
                  className="p-2 rounded-lg border border-slate-200 text-rose-500 hover:bg-rose-50 hover:border-rose-200 transition-colors cursor-pointer"
                  title="Delete note"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Tag input */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 font-medium">Tags (comma separated):</span>
              <input
                type="text"
                value={currentNote.tags?.join(', ') || ''}
                onChange={(e) => {
                  const tags = e.target.value
                    .split(',')
                    .map((t) => t.trim())
                    .filter(Boolean);
                  onUpdateNote(currentNote.id, { tags, updatedAt: Date.now() });
                }}
                placeholder="ideas, work, personal..."
                className="px-2 py-1 border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-900 w-64"
              />
            </div>

            {/* Note text area */}
            <div className="flex-1 flex flex-col">
              <textarea
                value={currentNote.content}
                onChange={(e) =>
                  onUpdateNote(currentNote.id, { content: e.target.value, updatedAt: Date.now() })
                }
                placeholder="Start writing thoughts, markdown, snippets, or checklists..."
                className="w-full flex-1 min-h-[360px] p-3 text-sm text-slate-800 focus:outline-none resize-none font-sans leading-relaxed border border-slate-100 rounded-lg bg-slate-50/50"
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-100">
              <span>{currentNote.content.split(/\s+/).filter(Boolean).length} words · {currentNote.content.length} characters</span>
              <span>Last edited: {new Date(currentNote.updatedAt).toLocaleTimeString()}</span>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-2">
            <p className="text-sm">No note selected</p>
            <button
              onClick={handleNewNote}
              className="px-4 py-2 bg-slate-900 text-white text-xs rounded-lg font-medium"
            >
              Create your first note
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
