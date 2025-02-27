
import { Search, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";

interface MenuSearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onAddClick: () => void;
}

export const MenuSearchBar = ({ searchQuery, setSearchQuery, onAddClick }: MenuSearchBarProps) => {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          placeholder="Search menu items by name or description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>
      <button 
        onClick={onAddClick} 
        className="aspect-square w-12 h-12 rounded-xl flex items-center justify-center transition-colors bg-white border-2 border-dashed border-gray-300 hover:border-gray-400"
      >
        <Plus className="h-6 w-6 text-gray-500" />
      </button>
    </div>
  );
};
