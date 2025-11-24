import React from 'react';
import { Goal, JournalEntry } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie
} from 'recharts';
import { CheckCircle2, Flame, TrendingUp, BookOpen } from 'lucide-react';

interface DashboardProps {
  goals: Goal[];
  entries: JournalEntry[];
}

export const Dashboard: React.FC<DashboardProps> = ({ goals, entries }) => {
  
  const sentimentData = [
    { name: 'Positive', value: entries.filter(e => e.sentiment === 'positive').length, color: '#4ade80' },
    { name: 'Neutral', value: entries.filter(e => !e.sentiment || e.sentiment === 'neutral').length, color: '#94a3b8' },
    { name: 'Negative', value: entries.filter(e => e.sentiment === 'negative').length, color: '#f87171' },
  ].filter(d => d.value > 0);

  const totalEntries = entries.length;

  return (
    <div className="space-y-6 pb-20">
      <header className="mb-6">
        <h2 className="text-2xl font-bold text-white">Overview</h2>
        <p className="text-slate-400">Track your progress and vibes.</p>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 p-4 rounded-xl shadow-lg border border-slate-800">
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500 uppercase">Total Entries</span>
                <BookOpen className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-slate-100">{totalEntries}</div>
        </div>
        <div className="bg-slate-900 p-4 rounded-xl shadow-lg border border-slate-800">
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500 uppercase">Longest Streak</span>
                <Flame className="w-4 h-4 text-orange-400" />
            </div>
            <div className="text-2xl font-bold text-slate-100">12 Days</div>
        </div>
        <div className="bg-slate-900 p-4 rounded-xl shadow-lg border border-slate-800">
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500 uppercase">Active Goals</span>
                <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-slate-100">{goals.length}</div>
        </div>
        <div className="bg-slate-900 p-4 rounded-xl shadow-lg border border-slate-800">
             <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500 uppercase">Words Written</span>
                <CheckCircle2 className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl font-bold text-slate-100">
                {(entries.reduce((acc, curr) => acc + curr.content.length, 0) / 5).toFixed(0)}
            </div>
        </div>
      </div>

      {/* Goals Section */}
      <div className="bg-slate-900 p-6 rounded-xl shadow-lg border border-slate-800">
        <h3 className="text-lg font-bold text-white mb-4">Goal Tracker</h3>
        <div className="space-y-6">
          {goals.map((goal) => {
            const percentage = Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100));
            return (
              <div key={goal.id}>
                <div className="flex justify-between items-end mb-2">
                  <span className="font-medium text-slate-300">{goal.title}</span>
                  <span className="text-xs font-bold text-slate-500">
                    {goal.currentValue} / {goal.targetValue} {goal.unit} ({percentage}%)
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className="bg-indigo-500 h-2.5 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" 
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Vibe Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 p-6 rounded-xl shadow-lg border border-slate-800">
            <h3 className="text-lg font-bold text-white mb-4">Mood Distribution</h3>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={sentimentData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                        >
                            {sentimentData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                            itemStyle={{ color: '#fff' }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <div className="flex justify-center space-x-4 mt-2">
                {sentimentData.map(d => (
                    <div key={d.name} className="flex items-center text-xs text-slate-400">
                        <div className="w-3 h-3 rounded-full mr-1" style={{ backgroundColor: d.color }}></div>
                        {d.name}
                    </div>
                ))}
            </div>
        </div>
        
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-6 rounded-xl shadow-lg text-white border border-indigo-500/20">
            <h3 className="text-lg font-bold mb-2">AI Insight</h3>
            <p className="text-indigo-100 italic mb-4">"Your entries this week show a strong focus on mindfulness, though Monday showed signs of burnout. Great progress on reading goals!"</p>
            <button className="bg-white/10 hover:bg-white/20 text-white text-sm py-2 px-4 rounded-lg transition-colors backdrop-blur-md border border-white/10">
                Generate Weekly Report
            </button>
        </div>
      </div>
    </div>
  );
};