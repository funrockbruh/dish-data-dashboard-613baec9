
import { X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { MenuItem } from "@/hooks/public-menu/types";

interface MenuItemDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  item: MenuItem | null;
  formatPrice: (price: number) => string;
}

export const MenuItemDetailDialog = ({ 
  isOpen, 
  onClose, 
  item, 
  formatPrice 
}: MenuItemDetailDialogProps) => {
  if (!item) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="p-0 gap-0 bg-black sm:rounded-xl max-w-md overflow-hidden border border-gray-800">
        {/* Close button placed at the top right corner with a larger hit area */}
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 z-10 p-1 rounded-full bg-black/60 hover:bg-black/80 transition-colors"
          aria-label="Close dialog"
        >
          <X size={28} className="text-white" />
        </button>
        
        {/* Product image */}
        <div className="relative w-full">
          {item.image_url && (
            <img
              src={item.image_url}
              alt={item.name}
              className="w-full aspect-[4/3] object-cover"
            />
          )}
        </div>
        
        {/* Content section with dark background */}
        <div className="p-6 bg-black">
          {/* Product name with potential RTL support */}
          <div className="flex justify-between items-start mb-1">
            <h2 className="text-2xl font-bold text-white">{item.name}</h2>
            
            {/* This would be the RTL text if available */}
            <span className="text-xl text-gray-300 font-medium">
              {/* If we had RTL name it would go here */}
            </span>
          </div>
          
          {/* Description styled as in the image */}
          {item.description && (
            <p className="text-gray-300 text-lg font-medium mb-4 leading-relaxed">
              {item.description.split('\n').join(' / ')}
            </p>
          )}
          
          {/* Price in large format at the bottom right */}
          <div className="flex justify-end mt-2">
            <p className="text-4xl font-bold text-white">
              {formatPrice(item.price)}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
