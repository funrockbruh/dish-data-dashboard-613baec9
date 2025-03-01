
import { Plus } from "lucide-react";

interface AddFeaturedButtonProps {
  onClick: () => void;
}

export const AddFeaturedButton = ({ onClick }: AddFeaturedButtonProps) => {
  return (
    <div 
      className="border border-gray-300 rounded-xl p-4 aspect-video flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors gap-2"
      onClick={onClick}
    >
      <div className="bg-[#23c55e] h-12 w-12 rounded-full flex items-center justify-center">
        <Plus className="h-6 w-6 text-white" />
      </div>
      <span className="text-gray-500 font-medium">Add Featured Item</span>
    </div>
  );
};
