
import { Search, X } from "lucide-react";

interface SearchBarProps {
  isVisible: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onToggleVisibility: () => void;
  onSubmit: (e: React.FormEvent) => void;
  textColor?: string;
}

export const SearchBar = ({
  isVisible,
  searchQuery,
  onSearchChange,
  onToggleVisibility,
  onSubmit,
  textColor = "text-white"
}: SearchBarProps) => {
  if (!isVisible) {
    return (
      <button
        onClick={onToggleVisibility}
        className={`p-2 rounded-full ${textColor} hover:bg-white/10`}
        aria-label="Search menu"
      >
        <Search className="h-5 w-5" />
      </button>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="relative flex-1 mr-4"
    >
      <div className="relative">
        <input
          type="text"
          placeholder="Search menu..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className={`w-full pl-10 pr-10 py-2 rounded-full bg-white/20 backdrop-blur-sm ${textColor} placeholder-gray-300 focus:outline-none`}
          autoFocus
        />
        <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${textColor}`} />
        <button
          type="button"
          onClick={onToggleVisibility}
          className="absolute right-3 top-1/2 transform -translate-y-1/2"
        >
          <X className={`h-5 w-5 ${textColor}`} />
        </button>
      </div>
    </form>
  );
};
