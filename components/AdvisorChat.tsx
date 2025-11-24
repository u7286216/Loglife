import React, { useState, useRef, useEffect } from 'react';
import { JournalEntry } from '../types';
import { Send, User, Bot, Sparkles } from 'lucide-react';
import { streamAdvisorChat, ChatMessage } from '../services/geminiService';
import clsx from 'clsx';

interface AdvisorChatProps {
  entries: JournalEntry[];
}

export const AdvisorChat: React.FC<AdvisorChatProps> = ({ entries }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: "Hi! I'm your LifeLog Advisor. I've read through your recent entries. How are you feeling today? Need any advice?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    // Add user message immediately
    const newHistory: ChatMessage[] = [...messages, { role: 'user', text: userMessage }];
    setMessages(newHistory);

    // Add placeholder for AI response
    setMessages(prev => [...prev, { role: 'model', text: '' }]);

    try {
      const stream = streamAdvisorChat(entries, newHistory.slice(0, -1), userMessage); // Pass history excluding the latest user message which is sent as 'message' param technically, but SDK handles history. actually, SDK takes history BEFORE the new message.
      
      let fullResponse = '';
      
      for await (const chunk of stream) {
        fullResponse += chunk;
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: 'model', text: fullResponse };
          return updated;
        });
      }
    } catch (error) {
      console.error("Chat error", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-100px)] bg-slate-900 rounded-xl overflow-hidden border border-slate-800 shadow-2xl">
      {/* Header */}
      <div className="bg-slate-900/50 backdrop-blur-md p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-white text-lg">LifeLog Advisor</h3>
            <p className="text-xs text-slate-400 flex items-center">
              <span className="w-2 h-2 bg-emerald-500 rounded-full mr-1.5 animate-pulse"></span>
              Online & Context Aware
            </p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg, index) => (
          <div 
            key={index} 
            className={clsx(
              "flex w-full",
              msg.role === 'user' ? "justify-end" : "justify-start"
            )}
          >
            <div className={clsx(
              "flex max-w-[85%] md:max-w-[70%] rounded-2xl p-4 shadow-sm",
              msg.role === 'user' 
                ? "bg-indigo-600 text-white rounded-tr-sm" 
                : "bg-slate-800 text-slate-200 rounded-tl-sm border border-slate-700"
            )}>
              <div className="mr-3 mt-1 shrink-0">
                {msg.role === 'user' ? <User className="w-4 h-4 opacity-70" /> : <Bot className="w-4 h-4 text-indigo-400" />}
              </div>
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {msg.text || <span className="animate-pulse">Thinking...</span>}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-slate-900 border-t border-slate-800">
        <div className="relative flex items-center bg-slate-950 rounded-xl border border-slate-800 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask for advice, patterns, or just vent..."
            className="flex-1 bg-transparent border-none text-white placeholder:text-slate-600 focus:ring-0 resize-none py-3 px-4 max-h-32 min-h-[50px]"
            rows={1}
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="p-2 mr-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50 disabled:bg-slate-800 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[10px] text-center text-slate-600 mt-2">
          AI can make mistakes. Please use discretion.
        </p>
      </div>
    </div>
  );
};
