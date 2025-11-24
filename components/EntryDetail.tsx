
import React, { useState } from 'react';
import { JournalEntry } from '../types';
import { EntryCard } from './EntryCard';
import { ArrowLeft, RefreshCw, Sparkles, Trash2 } from 'lucide-react';
import { generateVibeCheck } from '../services/geminiService';

interface EntryDetailProps {
  entry: JournalEntry;
  onBack: () => void;
  onUpdate: (entry: JournalEntry) => void;
  onDelete: (id: string) => void;
}

export const EntryDetail: React.FC<EntryDetailProps> = ({ entry, onBack, onUpdate, onDelete }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleReanalyze = async () => {
    if (!process.env.API_KEY) {
        // Fallback or alert if key happens to be missing in env, though it should be handled externally
        alert("API Key unavailable.");
        return;
    }

    setIsAnalyzing(true);
    const result = await generateVibeCheck(entry.title, entry.content, entry.songOfTheDay);
    setIsAnalyzing(false);

    if (result) {
      const updatedEntry = {
        ...entry,
        ...result
      };
      onUpdate(updatedEntry);
    } else {
        alert("Failed to analyze entry. Please try again.");
    }
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this entry? This action cannot be undone.")) {
      onDelete(entry.id);
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-4">
            <button 
            onClick={onBack}
            className="p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
            >
            <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-white">Entry Details</h2>
        </div>

        <div className="flex items-center space-x-2">
            <button 
                onClick={handleDelete}
                className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                title="Delete Entry"
            >
                <Trash2 className="w-5 h-5" />
            </button>
            <button
                onClick={handleReanalyze}
                disabled={isAnalyzing}
                className="flex items-center space-x-2 bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 px-4 py-2 rounded-lg hover:bg-indigo-600/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isAnalyzing ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                    <Sparkles className="w-4 h-4" />
                )}
                <span className="text-sm font-medium">{isAnalyzing ? 'Analyzing...' : 'Refresh Vibe'}</span>
            </button>
        </div>
      </div>

      <EntryCard entry={entry} compact={false} />
    </div>
  );
};
