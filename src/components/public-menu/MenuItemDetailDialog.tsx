
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
      <DialogContent className="p-0 gap-0 bg-black sm:rounded-lg max-w-md overflow-hidden border border-gray-800">
        <div className="relative">
          {item.image_url && (
            <img
              src={item.image_url}
              alt={item.name}
              className="w-full aspect-video object-cover"
            />
          )}
          <button 
            onClick={onClose}
            className="absolute top-2 right-2 p-2 rounded-full bg-black/70 text-white hover:bg-black/90"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="p-4">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-bold text-white">{item.name}</h2>
            <p className="text-2xl font-bold text-white">{formatPrice(item.price)}</p>
          </div>
          
          {item.description && (
            <p className="text-gray-300 whitespace-pre-wrap">{item.description}</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
