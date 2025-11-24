
import React, { useState, useRef, useEffect } from 'react';
import { JournalEntry, VibeCheckResult, JournalTemplate } from '../types';
import { generateVibeCheck, getCityFromCoordinates } from '../services/geminiService';
import { Save, Sparkles, Image as ImageIcon, Music, RefreshCw, X, MapPin, Tag as TagIcon, Trash2 } from 'lucide-react';

interface EntryFormProps {
  onSave: (entry: Omit<JournalEntry, 'id'>) => void;
  onCancel: () => void;
  templates: JournalTemplate[];
}

export const EntryForm: React.FC<EntryFormProps> = ({ onSave, onCancel, templates }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [song, setSong] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // New State for Tags & Location
  const [tags, setTags] = useState<string[]>([]);
  const [currentTagInput, setCurrentTagInput] = useState('');
  const [location, setLocation] = useState<{lat: number, lng: number, name?: string} | undefined>(undefined);
  const [gettingLocation, setGettingLocation] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-fetch location on mount with AI reverse geocoding
  useEffect(() => {
    if ('geolocation' in navigator) {
        setGettingLocation(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                
                // Initial fallback: coordinates
                let locationName = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
                setLocation({ lat, lng, name: locationName });

                // Attempt to get city name via AI
                if (process.env.API_KEY) {
                    const cityName = await getCityFromCoordinates(lat, lng);
                    if (cityName) {
                        locationName = cityName;
                        setLocation({ lat, lng, name: cityName });
                    }
                }
                
                setGettingLocation(false);
            },
            (error) => {
                console.error("Error getting location", error);
                setGettingLocation(false);
            }
        );
    }
  }, []);

  const handleTemplateSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const template = templates.find(t => t.id === e.target.value);
    if (template) {
      setContent(template.content);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
        const fileArray = Array.from(files);
        const promises = fileArray.map(file => {
            return new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.readAsDataURL(file);
            });
        });

        Promise.all(promises).then(newImages => {
            setImages(prev => [...prev, ...newImages]);
        });
    }
  };

  const removeImage = (index: number) => {
      setImages(images.filter((_, i) => i !== index));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' || e.key === ',') {
          e.preventDefault();
          const trimmed = currentTagInput.trim().replace(',', '');
          if (trimmed && !tags.includes(trimmed)) {
              setTags([...tags, trimmed]);
              setCurrentTagInput('');
          }
      }
  };

  const removeTag = (tagToRemove: string) => {
      setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async () => {
    if (!title || !content) {
      alert("Please provide at least a title and content.");
      return;
    }

    let aiResult: VibeCheckResult | null = null;

    if (process.env.API_KEY) {
        setIsAnalyzing(true);
        aiResult = await generateVibeCheck(title, content, song);
        setIsAnalyzing(false);
    }

    const newEntry: Omit<JournalEntry, 'id'> = {
      date: new Date().toISOString(),
      title,
      content,
      songOfTheDay: song,
      images: images,
      tags: tags,
      location: location,
      theme: aiResult?.theme || 'Manual Entry',
      hexColor: aiResult?.hexColor || '#64748b',
      sentiment: aiResult?.sentiment || 'neutral'
    };

    onSave(newEntry);
  };

  return (
    <div className="bg-slate-900 min-h-[calc(100vh-80px)] md:rounded-xl md:shadow-xl md:border md:border-slate-800 p-4 md:p-8 relative pb-24">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">New Entry</h2>
        <button onClick={onCancel} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
        </button>
      </div>

      <div className="space-y-4">
        {/* Templates */}
        <div className="flex justify-between items-center">
            <div className="flex items-center text-xs text-slate-500 space-x-2">
                <MapPin className="w-3 h-3" />
                <span>
                    {gettingLocation ? 'Locating...' : location ? `Synced: ${location.name}` : 'Location off'}
                </span>
            </div>
            <select 
                onChange={handleTemplateSelect}
                className="text-sm border-none bg-slate-800 text-slate-300 rounded-md py-1 px-3 focus:ring-1 focus:ring-indigo-500 cursor-pointer hover:bg-slate-700 transition-colors"
                defaultValue=""
            >
                <option value="" disabled>✨ Load Template</option>
                {templates.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
                ))}
            </select>
        </div>

        {/* Title */}
        <input
          type="text"
          placeholder="Title of the day..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full text-2xl font-bold placeholder:text-slate-600 bg-transparent text-white border-none focus:ring-0 px-0 pb-2 border-b border-slate-700 focus:border-indigo-500 transition-colors"
        />

        {/* Content */}
        <textarea
          placeholder="Write your thoughts..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full h-64 md:h-80 resize-none p-4 bg-slate-800/50 rounded-lg text-slate-300 font-serif leading-relaxed focus:ring-2 focus:ring-indigo-500/50 focus:bg-slate-800 transition-colors border-none placeholder:text-slate-600"
        />

        {/* Tags Input */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-800/30 p-2 rounded-lg border border-slate-800">
            <TagIcon className="w-4 h-4 text-slate-500 ml-2" />
            {tags.map(tag => (
                <span key={tag} className="bg-indigo-900/50 text-indigo-200 text-xs px-2 py-1 rounded-md flex items-center">
                    #{tag}
                    <button onClick={() => removeTag(tag)} className="ml-1 hover:text-white"><X className="w-3 h-3" /></button>
                </span>
            ))}
            <input 
                type="text" 
                value={currentTagInput}
                onChange={(e) => setCurrentTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder={tags.length === 0 ? "Add tags (press Enter)" : ""}
                className="bg-transparent border-none focus:ring-0 text-sm text-white placeholder:text-slate-600 flex-1 min-w-[100px]"
            />
        </div>

        {/* Metadata Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="relative group">
            <Music className="absolute top-3 left-3 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400" />
            <input
              type="text"
              placeholder="Song of the day"
              value={song}
              onChange={(e) => setSong(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm text-white placeholder:text-slate-500 transition-all"
            />
          </div>
          
          <div className="relative">
             <input 
                type="file" 
                multiple
                ref={fileInputRef}
                className="hidden" 
                accept="image/*"
                onChange={handleImageUpload}
             />
             <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center space-x-2 py-2.5 border border-dashed border-slate-600 rounded-lg text-slate-400 hover:bg-slate-800 hover:border-indigo-500 hover:text-indigo-400 transition-all text-sm"
             >
                <ImageIcon className="w-4 h-4" />
                <span>{images.length > 0 ? 'Add More Photos' : 'Add Photos'}</span>
             </button>
          </div>
        </div>

        {/* Image Preview Grid */}
        {images.length > 0 && (
            <div className="grid grid-cols-3 gap-2 pt-2">
                {images.map((img, index) => (
                    <div key={index} className="relative aspect-square bg-slate-800 rounded-lg overflow-hidden border border-slate-700 group">
                        <img src={img} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                        <button 
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 bg-black/60 text-white p-1 rounded-full hover:bg-red-500/80 transition-colors opacity-0 group-hover:opacity-100"
                        >
                            <Trash2 className="w-3 h-3" />
                        </button>
                    </div>
                ))}
            </div>
        )}

        {/* Action Bar */}
        <div className="flex items-center justify-between pt-6 mt-4 border-t border-slate-800">
            <div className="flex items-center space-x-2 text-xs text-slate-400">
                {process.env.API_KEY ? (
                    <span className="flex items-center text-emerald-400 bg-emerald-900/20 px-2 py-1 rounded border border-emerald-900/30">
                        <Sparkles className="w-3 h-3 mr-1" /> AI Active
                    </span>
                ) : (
                    <span className="text-amber-400 bg-amber-900/20 px-2 py-1 rounded border border-amber-900/30">AI Key Missing</span>
                )}
            </div>

            <button
                onClick={handleSubmit}
                disabled={isAnalyzing}
                className="flex items-center space-x-2 bg-indigo-600 text-white px-6 py-2.5 rounded-full hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-900/40 disabled:opacity-70 disabled:cursor-not-allowed"
            >
                {isAnalyzing ? (
                    <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Analyzing...</span>
                    </>
                ) : (
                    <>
                        <Save className="w-4 h-4" />
                        <span>Save Entry</span>
                    </>
                )}
            </button>
        </div>
      </div>
    </div>
  );
};