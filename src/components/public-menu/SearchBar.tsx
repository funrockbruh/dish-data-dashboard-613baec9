
import { Search, X } from "lucide-react";
import { useState, FormEvent } from "react";

interface SearchBarProps {
  isVisible: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onToggleVisibility: () => void;
  onSubmit: (e: FormEvent) => void;
  isLightTheme?: boolean;
}

export const SearchBar = ({
  isVisible,
  searchQuery,
  onSearchChange,
  onToggleVisibility,
  onSubmit,
  isLightTheme = true
}: SearchBarProps) => {
  if (!isVisible) {
    return (
      <div 
        className={`rounded-full ${isLightTheme ? 'bg-gray-200/80' : 'bg-white/10'} p-2 cursor-pointer`}
        onClick={onToggleVisibility}
      >
        <Search className={`h-6 w-6 ${isLightTheme ? 'text-gray-700' : 'text-white'}`} />
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex items-center gap-2">
      <div className={`flex-1 flex items-center gap-2 ${isLightTheme ? 'bg-gray-200/80 text-gray-800' : 'bg-gray-800/80 text-white'} rounded-full px-3 py-2`}>
        <input 
          type="text" 
          placeholder="Search" 
          value={searchQuery} 
          onChange={e => onSearchChange(e.target.value)} 
          className={`flex-1 bg-transparent ${isLightTheme ? 'text-gray-800' : 'text-white'} border-none outline-none`}
          autoFocus 
        />
        <Search className={`h-6 w-6 ${isLightTheme ? 'text-gray-700' : 'text-white'}`} />
      </div>
      <button 
        type="button" 
        onClick={onToggleVisibility} 
        className={`rounded-full ${isLightTheme ? 'bg-gray-200/80' : 'bg-white/10'} p-2`}
      >
        <X className={`h-6 w-6 ${isLightTheme ? 'text-gray-700' : 'text-white'}`} />
      </button>
    </form>
  );
};
