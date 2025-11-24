
import React, { useState } from 'react';
import { JournalEntry } from '../types';
import { Music, MapPin, Sparkles, ExternalLink, Tag, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

interface EntryCardProps {
  entry: JournalEntry;
  compact?: boolean;
  onClick?: () => void;
}

export const EntryCard: React.FC<EntryCardProps> = ({ entry, compact = false, onClick }) => {
  const dateObj = new Date(entry.date);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const images = entry.images || [];

  const nextImage = (e: React.MouseEvent) => {
      e.stopPropagation();
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
      e.stopPropagation();
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };
  
  return (
    <div 
      onClick={onClick}
      className={`group relative bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden mb-6 shadow-xl transition-all hover:shadow-2xl hover:border-slate-700 hover:-translate-y-0.5 ${onClick ? 'cursor-pointer' : ''}`}
    >
      {/* Header Section (Matches Screenshot Layout) */}
      <div className="flex flex-col md:flex-row min-h-[80px]">
        {/* Date Box - Distinct Blue Section */}
        <div className="w-full md:w-24 bg-gradient-to-br from-blue-600 to-blue-800 flex flex-row md:flex-col items-center justify-between md:justify-center px-6 py-3 md:p-4 shrink-0 relative overflow-hidden">
             <div className="absolute inset-0 bg-blue-500/10 blur-xl"></div>
             <div className="text-center relative z-10 text-white flex md:block items-baseline gap-2 md:gap-0">
                <span className="block text-xs md:text-[10px] font-bold uppercase tracking-widest opacity-90">{format(dateObj, 'MMM')}</span>
                <span className="block text-2xl md:text-3xl font-black tracking-tighter leading-none md:mt-1">{format(dateObj, 'dd')}</span>
                <span className="md:hidden text-xs opacity-75">{format(dateObj, 'yyyy')}</span>
             </div>
        </div>

        {/* Main Header Content */}
        <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between p-5 bg-slate-900/50 backdrop-blur-sm">
            <div className="flex-1 min-w-0 md:mr-6">
                <h3 className="text-xl font-bold text-white mb-1 leading-tight truncate">{entry.title}</h3>
                <p className="text-slate-400 text-sm truncate font-medium">{entry.content}</p>
            </div>

            {/* Right Metadata Section (Location & Badge) */}
            <div className="flex flex-row md:flex-col items-center md:items-end gap-3 mt-4 md:mt-0 shrink-0 border-t md:border-t-0 border-slate-800/50 pt-3 md:pt-0 w-full md:w-auto justify-between md:justify-center">
                 {entry.location && (
                    <a 
                        href={`https://www.google.com/maps/search/?api=1&query=${entry.location.lat},${entry.location.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center text-xs text-slate-400 font-medium bg-slate-950/50 px-2 py-1 rounded-md border border-slate-800/50 hover:text-blue-400 hover:border-blue-500/30 transition-colors"
                    >
                        <MapPin className="w-3.5 h-3.5 mr-1.5 text-blue-400" />
                        <span className="truncate max-w-[120px]">{entry.location.name?.split(',')[0] || 'Unknown'}</span>
                    </a>
                 )}

                 {entry.theme ? (
                    <div className="flex items-center bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wide shadow-[0_0_15px_rgba(168,85,247,0.4)] border border-white/10">
                        <Sparkles className="w-3 h-3 mr-1.5" />
                        {entry.theme}
                    </div>
                 ) : (
                    <div className="h-6"></div> // Spacer
                 )}
            </div>
        </div>
      </div>

      {/* Full Content Body & Footer */}
      {!compact && (
        <div className="px-6 pb-6">
             <hr className="border-slate-800 mb-5" />
             
             <div className="prose prose-invert prose-sm max-w-none text-slate-300 font-serif leading-relaxed whitespace-pre-wrap">
                {entry.content}
             </div>

             {/* Image Carousel */}
             {images.length > 0 && (
                 <div className="mt-5 rounded-xl overflow-hidden border border-slate-800 shadow-lg relative group select-none">
                     <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none"></div>
                     
                     <img 
                        src={images[currentImageIndex]} 
                        alt={`Attachment ${currentImageIndex + 1}`} 
                        className="w-full h-auto max-h-96 object-cover transition-all duration-300" 
                     />
                     
                     {/* Carousel Controls */}
                     {images.length > 1 && (
                         <>
                            <button 
                                onClick={prevImage}
                                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1.5 rounded-full hover:bg-black/70 transition-colors z-20 opacity-0 group-hover:opacity-100"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button 
                                onClick={nextImage}
                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1.5 rounded-full hover:bg-black/70 transition-colors z-20 opacity-0 group-hover:opacity-100"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                            
                            {/* Dots */}
                            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-1.5 z-20">
                                {images.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(idx); }}
                                        className={`w-1.5 h-1.5 rounded-full transition-colors ${idx === currentImageIndex ? 'bg-white' : 'bg-white/40 hover:bg-white/60'}`}
                                    />
                                ))}
                            </div>
                         </>
                     )}
                     
                     {/* Image Counter Badge */}
                     {images.length > 1 && (
                         <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded-md font-medium pointer-events-none z-10">
                             {currentImageIndex + 1} / {images.length}
                         </div>
                     )}
                 </div>
             )}

             <div className="flex flex-wrap items-center justify-between gap-4 mt-6 pt-4 border-t border-slate-800/50">
                 {/* Tags */}
                 <div className="flex flex-wrap gap-2">
                    {entry.tags && entry.tags.map(tag => (
                        <span key={tag} className="flex items-center text-[10px] uppercase font-bold text-slate-500 bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800/80 hover:border-slate-700 transition-colors">
                          <Tag className="w-3 h-3 mr-1.5 opacity-50" />
                          #{tag}
                        </span>
                    ))}
                 </div>

                 {/* Spotify Link */}
                 {entry.songOfTheDay && (
                     <a
                       href={`https://open.spotify.com/search/${encodeURIComponent(entry.songOfTheDay)}`}
                       target="_blank"
                       rel="noopener noreferrer"
                       className="flex items-center text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors bg-indigo-500/10 px-3 py-1.5 rounded-full border border-indigo-500/20 hover:bg-indigo-500/20"
                     >
                         <Music className="w-3.5 h-3.5 mr-1.5" />
                         {entry.songOfTheDay}
                         <ExternalLink className="w-3 h-3 ml-1.5 opacity-50" />
                     </a>
                 )}
             </div>
        </div>
      )}
    </div>
  );
};