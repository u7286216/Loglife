
import React, { useState } from 'react';
import { Goal, JournalTemplate } from '../types';
import { Plus, Trash2, Save, Target, FileText, X } from 'lucide-react';

interface SettingsProps {
  goals: Goal[];
  setGoals: (goals: Goal[]) => void;
  templates: JournalTemplate[];
  setTemplates: (templates: JournalTemplate[]) => void;
}

export const Settings: React.FC<SettingsProps> = ({ goals, setGoals, templates, setTemplates }) => {
  const [activeTab, setActiveTab] = useState<'goals' | 'templates'>('goals');
  
  // Goal State
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState('');
  const [newGoalUnit, setNewGoalUnit] = useState('');

  // Template State
  const [isEditingTemplate, setIsEditingTemplate] = useState<string | null>(null);
  const [editTemplateName, setEditTemplateName] = useState('');
  const [editTemplateContent, setEditTemplateContent] = useState('');

  // --- Goal Handlers ---
  const addGoal = () => {
    if (!newGoalTitle || !newGoalTarget) return;
    const newGoal: Goal = {
      id: crypto.randomUUID(),
      title: newGoalTitle,
      targetValue: Number(newGoalTarget),
      currentValue: 0,
      unit: newGoalUnit || 'units',
      streak: 0,
      lastUpdated: new Date().toISOString()
    };
    setGoals([...goals, newGoal]);
    setNewGoalTitle('');
    setNewGoalTarget('');
    setNewGoalUnit('');
  };

  const deleteGoal = (id: string) => {
    setGoals(goals.filter(g => g.id !== id));
  };

  const updateGoalProgress = (id: string, val: string) => {
      const updatedGoals = goals.map(g => {
          if (g.id === id) return { ...g, currentValue: Number(val) };
          return g;
      });
      setGoals(updatedGoals);
  };

  // --- Template Handlers ---
  const startNewTemplate = () => {
      setIsEditingTemplate('new');
      setEditTemplateName('');
      setEditTemplateContent('');
  };

  const editTemplate = (t: JournalTemplate) => {
      setIsEditingTemplate(t.id);
      setEditTemplateName(t.name);
      setEditTemplateContent(t.content);
  };

  const saveTemplate = () => {
      if (!editTemplateName) return;

      if (isEditingTemplate === 'new') {
          const newTemplate: JournalTemplate = {
              id: crypto.randomUUID(),
              name: editTemplateName,
              content: editTemplateContent
          };
          setTemplates([...templates, newTemplate]);
      } else {
          setTemplates(templates.map(t => 
              t.id === isEditingTemplate 
                  ? { ...t, name: editTemplateName, content: editTemplateContent }
                  : t
          ));
      }
      setIsEditingTemplate(null);
  };

  const deleteTemplate = (id: string) => {
      setTemplates(templates.filter(t => t.id !== id));
      if (isEditingTemplate === id) setIsEditingTemplate(null);
  };

  return (
    <div className="space-y-6 pb-32">
      <header className="mb-6">
        <h2 className="text-2xl font-bold text-white">Settings</h2>
        <p className="text-slate-400">Customize your tracking and writing experience.</p>
      </header>

      {/* Tabs */}
      <div className="flex space-x-4 border-b border-slate-800 pb-1">
        <button 
          onClick={() => setActiveTab('goals')}
          className={`pb-3 px-2 text-sm font-medium flex items-center ${activeTab === 'goals' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-slate-400 hover:text-slate-200'}`}
        >
          <Target className="w-4 h-4 mr-2" /> Goals
        </button>
        <button 
          onClick={() => setActiveTab('templates')}
          className={`pb-3 px-2 text-sm font-medium flex items-center ${activeTab === 'templates' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-slate-400 hover:text-slate-200'}`}
        >
          <FileText className="w-4 h-4 mr-2" /> Templates
        </button>
      </div>

      {/* --- GOALS TAB --- */}
      {activeTab === 'goals' && (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Add Goal */}
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                <h3 className="text-lg font-bold text-white mb-4">Add New Goal</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                    <input 
                        className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500 outline-none md:col-span-2"
                        placeholder="Goal Title (e.g., Read Books)"
                        value={newGoalTitle}
                        onChange={e => setNewGoalTitle(e.target.value)}
                    />
                    <input 
                        className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="Target (e.g. 50)"
                        type="number"
                        value={newGoalTarget}
                        onChange={e => setNewGoalTarget(e.target.value)}
                    />
                     <input 
                        className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="Unit (e.g. Books)"
                        value={newGoalUnit}
                        onChange={e => setNewGoalUnit(e.target.value)}
                    />
                </div>
                <button onClick={addGoal} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded-lg font-medium transition-colors flex items-center justify-center">
                    <Plus className="w-4 h-4 mr-2" /> Create Goal
                </button>
            </div>

            {/* List Goals */}
            <div className="space-y-4">
                {goals.map(goal => (
                    <div key={goal.id} className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex-1">
                            <div className="font-bold text-slate-200">{goal.title}</div>
                            <div className="text-xs text-slate-500">Target: {goal.targetValue} {goal.unit}</div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div className="text-xs text-slate-400 uppercase font-semibold">Current Progress:</div>
                            <input 
                                type="number" 
                                value={goal.currentValue}
                                onChange={(e) => updateGoalProgress(goal.id, e.target.value)}
                                className="w-20 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white text-center focus:ring-1 focus:ring-indigo-500"
                            />
                            <button onClick={() => deleteGoal(goal.id)} className="text-slate-600 hover:text-red-400 p-2">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      )}

      {/* --- TEMPLATES TAB --- */}
      {activeTab === 'templates' && (
         <div className="space-y-6 animate-in fade-in duration-300">
            
            {/* Editor Overlay / Mode */}
            {isEditingTemplate ? (
                <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-2xl">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-white">{isEditingTemplate === 'new' ? 'Create Template' : 'Edit Template'}</h3>
                        <button onClick={() => setIsEditingTemplate(null)} className="text-slate-400 hover:text-white"><X className="w-5 h-5"/></button>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1 uppercase">Template Name</label>
                            <input 
                                value={editTemplateName}
                                onChange={e => setEditTemplateName(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="e.g., Weekly Review"
                            />
                        </div>
                        <div>
                             <label className="block text-xs font-medium text-slate-500 mb-1 uppercase">Content Structure</label>
                             <textarea 
                                value={editTemplateContent}
                                onChange={e => setEditTemplateContent(e.target.value)}
                                className="w-full h-64 bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-300 font-mono text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="# Heading&#10;- Bullet point"
                             />
                        </div>
                        <div className="flex justify-end space-x-3">
                            <button onClick={() => setIsEditingTemplate(null)} className="px-4 py-2 text-slate-400 hover:text-white">Cancel</button>
                            <button onClick={saveTemplate} className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-lg flex items-center">
                                <Save className="w-4 h-4 mr-2" /> Save Template
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    <button onClick={startNewTemplate} className="w-full bg-slate-800 hover:bg-slate-700 text-indigo-400 border border-dashed border-indigo-500/30 py-4 rounded-xl font-medium transition-all flex items-center justify-center">
                        <Plus className="w-4 h-4 mr-2" /> Create New Template
                    </button>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {templates.map(t => (
                            <div key={t.id} className="bg-slate-900 p-4 rounded-xl border border-slate-800 hover:border-indigo-500/50 transition-colors group">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold text-white">{t.name}</h4>
                                    <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => editTemplate(t)} className="p-1.5 hover:bg-slate-800 rounded text-indigo-400">Edit</button>
                                        <button onClick={() => deleteTemplate(t.id)} className="p-1.5 hover:bg-slate-800 rounded text-red-400"><Trash2 className="w-4 h-4"/></button>
                                    </div>
                                </div>
                                <div className="text-xs text-slate-500 font-mono bg-slate-950 p-2 rounded line-clamp-3 border border-slate-800/50">
                                    {t.content}
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
         </div>
      )}
    </div>
  );
};
