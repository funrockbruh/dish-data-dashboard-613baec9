
import { X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { MenuItem, ThemeSettings } from "@/hooks/public-menu/types";

interface MenuItemDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  item: MenuItem | null;
  formatPrice: (price: number) => string;
  themeSettings?: ThemeSettings;
}

export const MenuItemDetailDialog = ({
  isOpen,
  onClose,
  item,
  formatPrice,
  themeSettings
}: MenuItemDetailDialogProps) => {
  if (!item) return null;

  const template = themeSettings?.template || "template1";
  
  // Get dialog style based on template
  const getDialogStyle = () => {
    const baseStyle = "p-0 gap-0 bg-black sm:rounded-xl overflow-hidden border border-gray-800 max-w-md rounded-3xl";
    
    switch (template) {
      case "template2": // Modern Grid
        return `${baseStyle} max-w-lg`;
      case "template3": // Elegant List
        return `${baseStyle} bg-gray-900`;
      case "template4": // Card View
        return `${baseStyle} max-w-lg bg-gray-900`;
      case "template5": // Compact Layout
        return `${baseStyle} max-w-sm`;
      default:
        return baseStyle;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className={getDialogStyle()}>
        {/* Close button positioned at the top right */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-10 rounded-full bg-transparent text-white"
          aria-label="Close dialog"
        >
          <X size={32} strokeWidth={2.5} className="text-white" />
        </button>
        
        {/* Product image with rounded corners */}
        <div className="w-full px-4 pt-14">
          {item.image_url && (
            <img 
              src={item.image_url} 
              alt={item.name} 
              className={`w-full object-cover rounded-[10px] ${template === "template3" ? "aspect-[2/1]" : "aspect-[4/3]"}`} 
            />
          )}
        </div>
        
        {/* Content section with black background and proper padding */}
        <div className="p-4 bg-black">
          {/* Product name row with RTL support */}
          <div className="flex justify-between items-center mb-2">
            <h2 className={`text-white font-bold ${template === "template5" ? "text-xl" : "text-2xl"}`}>
              {item.name}
            </h2>
            
            {/* RTL name if available */}
            <span className="text-xl text-gray-200 font-medium text-right">
              {/* This is where RTL text would go */}
            </span>
          </div>
          
          {/* Description with proper font size and spacing */}
          {item.description && (
            <p className={`text-white ${template === "template4" ? "text-base" : "text-lg"} mb-4 leading-tight`}>
              {item.description.split('\n').join(' / ')}
            </p>
          )}
          
          {/* Price in large format at the bottom right */}
          <div className="flex justify-end mt-4">
            <p className="font-bold text-white text-2xl">
              {formatPrice(item.price)}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
