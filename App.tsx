
import React, { useState, useEffect, useMemo } from 'react';
import { AppView, JournalEntry, Goal, JournalTemplate } from './types';
import { INITIAL_GOALS, INITIAL_TEMPLATES } from './constants';
import { EntryCard } from './components/EntryCard';
import { EntryForm } from './components/EntryForm';
import { Dashboard } from './components/Dashboard';
import { Settings } from './components/Settings';
import { EntryDetail } from './components/EntryDetail';
import { AdvisorChat } from './components/AdvisorChat';
import { 
  Plus,
  LayoutGrid,
  Book,
  Settings as SettingsIcon,
  Search,
  MessageSquare,
  ArrowUpDown,
  X
} from 'lucide-react';
import clsx from 'clsx';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.FEED);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'desc' | 'asc'>('desc');
  
  // Customizable State
  const [goals, setGoals] = useState<Goal[]>([]);
  const [templates, setTemplates] = useState<JournalTemplate[]>([]);

  // Load Data on Mount
  useEffect(() => {
    // Entries
    const savedEntries = localStorage.getItem('lifelog_entries');
    if (savedEntries) {
      const parsed = JSON.parse(savedEntries);
      // MIGRATION: Handle conversion from old 'image' field to 'images' array
      const migratedEntries = parsed.map((e: any) => ({
        ...e,
        images: e.images || (e.image ? [e.image] : [])
      }));
      setEntries(migratedEntries);
    } else {
        // Seed data if empty
        const seed: JournalEntry = {
            id: 'seed-1',
            date: new Date().toISOString(),
            title: 'Starting LifeLog',
            content: "Today I switched from Day One to my own custom solution. It feels good to own my data. I'm excited to see how the Gemini integration works for analyzing my daily moods.\n\n## Progress on Goals\n- Reading: 10 pages\n- Meditation: 15 mins\n\n## Learning\nReact hooks are powerful for managing view states like this one.",
            songOfTheDay: 'Space Oddity - Bowie',
            images: [], 
            tags: ['dev', 'journaling', 'new-beginnings'],
            location: { lat: 37.7749, lng: -122.4194, name: 'San Francisco, CA' },
            theme: 'New Beginnings',
            hexColor: '#6366f1',
            sentiment: 'positive'
        };
        setEntries([seed]);
    }

    // Goals
    const savedGoals = localStorage.getItem('lifelog_goals');
    if (savedGoals) {
        setGoals(JSON.parse(savedGoals));
    } else {
        setGoals(INITIAL_GOALS);
    }

    // Templates
    const savedTemplates = localStorage.getItem('lifelog_templates');
    if (savedTemplates) {
        setTemplates(JSON.parse(savedTemplates));
    } else {
        setTemplates(INITIAL_TEMPLATES);
    }
  }, []);

  // Persist State Changes
  useEffect(() => {
      if (entries.length > 0) localStorage.setItem('lifelog_entries', JSON.stringify(entries));
  }, [entries]);

  useEffect(() => {
      if (goals.length > 0) localStorage.setItem('lifelog_goals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
      if (templates.length > 0) localStorage.setItem('lifelog_templates', JSON.stringify(templates));
  }, [templates]);

  const tagFilters = useMemo(() => {
      const counts: Record<string, number> = {};
      entries.forEach(entry => {
          entry.tags?.forEach(tag => {
              counts[tag] = (counts[tag] || 0) + 1;
          });
      });

      return Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .map(([tag, count]) => ({ tag, count }));
  }, [entries]);

  const filteredEntries = useMemo(() => {
      const normalizedQuery = searchQuery.trim().toLowerCase();

      return [...entries]
        .filter(entry => {
            const matchesTag = activeTag ? entry.tags?.includes(activeTag) : true;
            if (!matchesTag) return false;

            if (!normalizedQuery) return true;

            const haystack = `${entry.title} ${entry.content} ${entry.tags?.join(' ')}`.toLowerCase();
            return haystack.includes(normalizedQuery);
        })
        .sort((a, b) => {
            const diff = new Date(a.date).getTime() - new Date(b.date).getTime();
            return sortDirection === 'desc' ? -diff : diff;
        });
  }, [activeTag, entries, searchQuery, sortDirection]);


  const handleSaveEntry = (entryData: Omit<JournalEntry, 'id'>) => {
    const newEntry: JournalEntry = {
      ...entryData,
      id: crypto.randomUUID(),
    };
    
    const updatedEntries = [newEntry, ...entries];
    setEntries(updatedEntries);
    setCurrentView(AppView.FEED);
  };

  const handleUpdateEntry = (updatedEntry: JournalEntry) => {
    const updatedEntries = entries.map(e => e.id === updatedEntry.id ? updatedEntry : e);
    setEntries(updatedEntries);
    setSelectedEntry(updatedEntry);
  };

  const handleDeleteEntry = (id: string) => {
    const updatedEntries = entries.filter(e => e.id !== id);
    setEntries(updatedEntries);
    // Update local storage immediately for deletion to avoid sync issues if array becomes empty
    localStorage.setItem('lifelog_entries', JSON.stringify(updatedEntries));
    
    setSelectedEntry(null);
    setCurrentView(AppView.FEED);
  };

  const handleEntryClick = (entry: JournalEntry) => {
      setSelectedEntry(entry);
      setCurrentView(AppView.ENTRY_DETAIL);
  };

  const handleBackToFeed = () => {
      setSelectedEntry(null);
      setCurrentView(AppView.FEED);
  };

  const NavButton = ({ view, icon: Icon, label }: { view: AppView, icon: any, label: string }) => (
    <button
      onClick={() => setCurrentView(view)}
      className={clsx(
        "flex flex-col items-center justify-center w-full py-3 space-y-1 transition-colors",
        currentView === view && view !== AppView.ENTRY_DETAIL ? "text-indigo-400" : "text-slate-500 hover:text-slate-300"
      )}
    >
      <Icon className={clsx("w-6 h-6", currentView === view && view !== AppView.ENTRY_DETAIL && "fill-current opacity-20")} />
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col md:flex-row max-w-7xl mx-auto shadow-2xl shadow-black relative">
      
      {/* Sidebar (Desktop) / Hidden Mobile */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 border-r border-slate-800 h-screen sticky top-0">
        <div className="p-6 border-b border-slate-800">
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center">
                <span className="w-8 h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center mr-2 text-lg">L</span>
                LifeLog
            </h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
            <button 
                onClick={() => setCurrentView(AppView.FEED)}
                className={clsx("flex items-center w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors", (currentView === AppView.FEED || currentView === AppView.ENTRY_DETAIL) ? "bg-slate-800 text-indigo-400" : "text-slate-400 hover:bg-slate-800 hover:text-slate-200")}
            >
                <Book className="w-4 h-4 mr-3" /> Journal Feed
            </button>
            <button 
                onClick={() => setCurrentView(AppView.CHAT)}
                className={clsx("flex items-center w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors", currentView === AppView.CHAT ? "bg-slate-800 text-indigo-400" : "text-slate-400 hover:bg-slate-800 hover:text-slate-200")}
            >
                <MessageSquare className="w-4 h-4 mr-3" /> AI Advisor
            </button>
            <button 
                onClick={() => setCurrentView(AppView.DASHBOARD)}
                className={clsx("flex items-center w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors", currentView === AppView.DASHBOARD ? "bg-slate-800 text-indigo-400" : "text-slate-400 hover:bg-slate-800 hover:text-slate-200")}
            >
                <LayoutGrid className="w-4 h-4 mr-3" /> Dashboard
            </button>
            <button 
                onClick={() => setCurrentView(AppView.SETTINGS)}
                className={clsx("flex items-center w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors", currentView === AppView.SETTINGS ? "bg-slate-800 text-indigo-400" : "text-slate-400 hover:bg-slate-800 hover:text-slate-200")}
            >
                <SettingsIcon className="w-4 h-4 mr-3" /> Settings
            </button>
        </nav>

        <div className="p-4">
            <button 
                onClick={() => setCurrentView(AppView.NEW_ENTRY)}
                className="w-full flex items-center justify-center space-x-2 bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-900/20"
            >
                <Plus className="w-4 h-4" />
                <span>New Entry</span>
            </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 md:h-screen md:overflow-y-auto bg-slate-950">
        {/* Mobile Header */}
        <div className="md:hidden sticky top-0 z-10 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-4 py-3 flex justify-between items-center">
             <h1 className="text-xl font-black text-white tracking-tight">LifeLog</h1>
             <button className="p-2 text-slate-400"><Search className="w-5 h-5" /></button>
        </div>

        <div className="p-4 md:p-8 max-w-3xl mx-auto">
          {currentView === AppView.FEED && (
            <div className="space-y-6 pb-20 md:pb-0">
               <div className="flex items-start justify-between mb-4 flex-col md:flex-row md:items-center md:space-y-0 space-y-2">
                 <div>
                   <h2 className="text-3xl font-bold text-white">Journal</h2>
                   <p className="text-slate-500 text-sm">Search and filter to revisit past reflections quickly.</p>
                 </div>
                 <span className="text-slate-500 text-sm font-medium bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">{filteredEntries.length} / {entries.length} entries</span>
               </div>

               <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3 shadow-lg shadow-black/20">
                 <div className="flex flex-col md:flex-row md:items-center gap-3">
                   <div className="relative flex-1">
                     <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                     <input
                       type="text"
                       value={searchQuery}
                       onChange={(e) => setSearchQuery(e.target.value)}
                       placeholder="Search by title, content, or tags"
                       className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-9 py-2.5 text-sm text-white placeholder:text-slate-600 focus:ring-2 focus:ring-indigo-500/60 focus:border-indigo-500"
                     />
                     {searchQuery && (
                       <button
                         onClick={() => setSearchQuery('')}
                         className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white p-1 rounded"
                         aria-label="Clear search"
                       >
                         <X className="w-4 h-4" />
                       </button>
                     )}
                   </div>

                   <div className="flex items-center gap-2">
                     <button
                       onClick={() => setSortDirection(prev => prev === 'desc' ? 'asc' : 'desc')}
                       className="flex items-center space-x-2 px-3 py-2 rounded-lg border border-slate-800 text-slate-200 bg-slate-950 hover:border-indigo-500/60 hover:text-white transition-colors"
                     >
                       <ArrowUpDown className="w-4 h-4" />
                       <span className="text-xs font-semibold uppercase tracking-wide">{sortDirection === 'desc' ? 'Newest' : 'Oldest'} first</span>
                     </button>
                     <button
                       onClick={() => { setActiveTag(null); setSearchQuery(''); setSortDirection('desc'); }}
                       className="px-3 py-2 rounded-lg border border-slate-800 text-slate-300 hover:text-white hover:border-indigo-500/60 transition-colors text-xs font-semibold"
                     >
                       Reset filters
                     </button>
                   </div>
                 </div>

                 {tagFilters.length > 0 && (
                   <div className="flex flex-wrap gap-2">
                     {tagFilters.map(({ tag, count }) => (
                       <button
                         key={tag}
                         onClick={() => setActiveTag(prev => prev === tag ? null : tag)}
                         className={clsx(
                           "px-3 py-1.5 rounded-full border text-xs font-semibold flex items-center gap-2 transition-colors",
                           activeTag === tag
                             ? "bg-indigo-600/20 border-indigo-500/60 text-indigo-200"
                             : "bg-slate-950 border-slate-800 text-slate-300 hover:border-indigo-500/40 hover:text-white"
                         )}
                       >
                         <span>#{tag}</span>
                         <span className="text-[10px] text-slate-400">{count}</span>
                       </button>
                     ))}
                   </div>
                 )}
               </div>

               {filteredEntries.map(entry => (
                 <EntryCard
                    key={entry.id}
                    entry={entry}
                    compact={true}
                    onClick={() => handleEntryClick(entry)}
                 />
               ))}

               {entries.length === 0 && (
                 <div className="text-center py-20">
                    <p className="text-slate-500">No entries yet. Start writing!</p>
                 </div>
               )}

               {entries.length > 0 && filteredEntries.length === 0 && (
                  <div className="text-center py-16 border border-dashed border-slate-800 rounded-xl bg-slate-900/60">
                    <p className="text-slate-400 font-medium">No entries match your filters.</p>
                    <button
                      onClick={() => { setActiveTag(null); setSearchQuery(''); setSortDirection('desc'); }}
                      className="mt-3 text-sm text-indigo-300 hover:text-white"
                    >
                      Clear filters
                    </button>
                  </div>
               )}
            </div>
          )}

          {currentView === AppView.ENTRY_DETAIL && selectedEntry && (
             <EntryDetail 
                entry={selectedEntry} 
                onBack={handleBackToFeed}
                onUpdate={handleUpdateEntry}
                onDelete={handleDeleteEntry}
             />
          )}

          {currentView === AppView.DASHBOARD && (
            <Dashboard goals={goals} entries={entries} />
          )}

          {currentView === AppView.CHAT && (
            <AdvisorChat entries={entries} />
          )}

          {currentView === AppView.NEW_ENTRY && (
            <EntryForm 
                onSave={handleSaveEntry} 
                onCancel={() => setCurrentView(AppView.FEED)}
                templates={templates}
            />
          )}

          {currentView === AppView.SETTINGS && (
              <Settings 
                goals={goals}
                setGoals={setGoals}
                templates={templates}
                setTemplates={setTemplates}
              />
          )}
        </div>
      </main>

      {/* Mobile Floating Action Button (FAB) */}
      <button 
          onClick={() => setCurrentView(AppView.NEW_ENTRY)}
          className="md:hidden fixed bottom-20 right-4 bg-indigo-600 text-white p-4 rounded-full shadow-2xl shadow-indigo-900/50 hover:bg-indigo-500 transition-transform active:scale-95 z-50 flex items-center justify-center"
          aria-label="New Entry"
      >
          <Plus className="w-6 h-6" />
      </button>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 flex justify-around items-center px-2 pb-safe z-40">
        <NavButton view={AppView.FEED} icon={Book} label="Journal" />
        <NavButton view={AppView.CHAT} icon={MessageSquare} label="Advisor" />
        <NavButton view={AppView.DASHBOARD} icon={LayoutGrid} label="Stats" />
        <NavButton view={AppView.SETTINGS} icon={SettingsIcon} label="Settings" />
      </div>

    </div>
  );
};

export default App;
