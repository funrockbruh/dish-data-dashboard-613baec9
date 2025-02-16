import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
interface AddCategoryDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
  categoryName: string;
  onCategoryNameChange: (name: string) => void;
  imagePreview?: string;
  onImageChange: (file: File) => void;
}
export const AddCategoryDialog = ({
  isOpen,
  onOpenChange,
  onSave,
  categoryName,
  onCategoryNameChange,
  imagePreview,
  onImageChange
}: AddCategoryDialogProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  return <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-3xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold font-inter">Add category:</DialogTitle>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <h3 className="text-xl font-bold font-inter">Add image:</h3>
            <div onClick={() => fileInputRef.current?.click()} className="w-full h-48 rounded-xl flex items-center justify-center cursor-pointer bg-gray-300 hover:bg-gray-200">
              {imagePreview ? <img src={imagePreview} alt="Category preview" className="w-full h-full object-cover rounded-xl" /> : <Plus className="h-10 w-10 text-gray-500" />}
            </div>
            <Input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={e => {
            const file = e.target.files?.[0];
            if (file) onImageChange(file);
          }} />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-bold font-inter">Name:</h3>
            <Input value={categoryName} onChange={e => onCategoryNameChange(e.target.value)} placeholder="Name category" className="w-full font-inter" />
          </div>

          <Button onClick={onSave} className="w-full bg-green-500 hover:bg-green-600 text-white h-12 font-inter rounded-xl">
            Add
          </Button>
        </div>
      </DialogContent>
    </Dialog>;
};