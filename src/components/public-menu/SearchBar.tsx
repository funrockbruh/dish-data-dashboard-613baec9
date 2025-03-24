
import { Search, X } from "lucide-react";
import { useState, FormEvent } from "react";

interface SearchBarProps {
  isVisible: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onToggleVisibility: () => void;
  onSubmit: (e: FormEvent) => void;
}

export const SearchBar = ({
  isVisible,
  searchQuery,
  onSearchChange,
  onToggleVisibility,
  onSubmit
}: SearchBarProps) => {
  if (!isVisible) {
    return (
      <div 
        className="rounded-full bg-white/10 p-2 cursor-pointer" 
        onClick={onToggleVisibility}
      >
        <Search className="h-6 w-6 text-white" />
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex items-center gap-2">
      <div className="flex-1 flex items-center gap-2 bg-gray-800/80 rounded-full px-3 py-2">
        <input 
          type="text" 
          placeholder="Search" 
          value={searchQuery} 
          onChange={e => onSearchChange(e.target.value)} 
          className="flex-1 bg-transparent text-white border-none outline-none" 
          autoFocus 
        />
        <Search className="h-6 w-6 text-white" />
      </div>
      <button 
        type="button" 
        onClick={onToggleVisibility} 
        className="rounded-full bg-white/10 p-2"
      >
        <X className="h-6 w-6 text-white" />
      </button>
    </form>
  );
};
