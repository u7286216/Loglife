
import { Goal, JournalTemplate } from "./types";

export const APP_NAME = "LifeLog";

export const INITIAL_TEMPLATES: JournalTemplate[] = [
  {
    id: 't1',
    name: "Daily Reflection",
    content: `## 🌅 Morning Intentions
- 

## 🧠 What did I learn today?
- 

## 🎯 Progress on Goals
- 
`
  },
  {
    id: 't2',
    name: "Problem Solving",
    content: `## 🚧 The Challenge
- 

## 💡 Possible Solutions
1. 
2. 
3. 

## 🎬 Action Plan
- 
`
  },
  {
    id: 't3',
    name: "Gratitude",
    content: `## ✨ Highlights
- 

## 🙏 I am grateful for...
1. 
2. 
3. 
`
  }
];

export const INITIAL_GOALS: Goal[] = [
  {
    id: '1',
    title: 'Reading',
    targetValue: 50,
    currentValue: 12,
    unit: 'Books',
    streak: 4,
    lastUpdated: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Workouts',
    targetValue: 200,
    currentValue: 45,
    unit: 'Sessions',
    streak: 2,
    lastUpdated: new Date().toISOString()
  },
  {
    id: '3',
    title: 'Meditation',
    targetValue: 1000,
    currentValue: 850,
    unit: 'Minutes',
    streak: 15,
    lastUpdated: new Date().toISOString()
  }
];
