import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X, Pencil, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface AddCategoryDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
  onDelete?: () => void;
  categoryName: string;
  onCategoryNameChange: (name: string) => void;
  imagePreview?: string;
  onImageChange: (file: File) => void;
  isEditing?: boolean;
}

export const AddCategoryDialog = ({
  isOpen,
  onOpenChange,
  onSave,
  onDelete,
  categoryName,
  onCategoryNameChange,
  imagePreview,
  onImageChange,
  isEditing = false
}: AddCategoryDialogProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizedImageUrl, setOptimizedImageUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const handleImageUpload = async (file: File) => {
    try {
      setIsOptimizing(true);
      const formData = new FormData();
      formData.append('file', file);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/optimize-image`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to optimize image');
      }

      const { url } = await response.json();
      setOptimizedImageUrl(url);
      
      // Create a temporary URL for preview
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        onImageChange(file);
      };
      reader.readAsDataURL(file);

    } catch (error) {
      console.error('Error optimizing image:', error);
      toast({
        title: "Error",
        description: "Failed to optimize image",
        variant: "destructive"
      });
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleSave = async () => {
    if (optimizedImageUrl) {
      // Pass the optimized URL to the parent component
      const fakeFile = new File([""], "optimized.jpg", { type: "image/jpeg" });
      onImageChange(fakeFile, optimizedImageUrl);
    }
    onSave();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-3xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold font-inter">
              {isEditing ? 'Edit category:' : 'Add category:'}
            </DialogTitle>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <h3 className="text-xl font-bold font-inter">Add image:</h3>
            <div 
              onClick={() => fileInputRef.current?.click()} 
              className="relative w-full h-48 rounded-xl flex items-center justify-center cursor-pointer bg-gray-300 hover:bg-gray-200 group"
            >
              {imagePreview ? (
                <>
                  <img src={imagePreview} alt="Category preview" className="w-full h-full object-cover rounded-xl" />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                    <Pencil className="h-6 w-6 text-white" />
                  </div>
                </>
              ) : (
                <Plus className="h-10 w-10 text-gray-500" />
              )}
              {isOptimizing && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-xl">
                  <div className="text-white">Optimizing...</div>
                </div>
              )}
            </div>
            <Input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  await handleImageUpload(file);
                }
              }} 
            />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-bold font-inter">Name:</h3>
            <Input 
              value={categoryName} 
              onChange={e => onCategoryNameChange(e.target.value)} 
              placeholder="Name category" 
              className="w-full font-inter" 
            />
          </div>

          <div className="space-y-3">
            <Button 
              onClick={handleSave} 
              className="w-full bg-green-500 hover:bg-green-600 text-white h-12 font-inter rounded-xl"
              disabled={isOptimizing}
            >
              {isEditing ? 'Update' : 'Add'}
            </Button>
            
            {isEditing && onDelete && (
              <Button 
                onClick={onDelete} 
                variant="destructive" 
                className="w-full h-12 font-inter rounded-xl"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Category
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
