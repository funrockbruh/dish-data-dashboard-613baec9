
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
  onSave: (optimizedUrl?: string) => void;
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
  
  // Function to optimize image size using canvas before uploading
  const optimizeImage = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      try {
        // Create an image element
        const img = new Image();
        img.onload = () => {
          // Create a canvas
          const canvas = document.createElement('canvas');
          
          // Calculate new dimensions (max 800px width/height while maintaining aspect ratio)
          let width = img.width;
          let height = img.height;
          const maxSize = 800;
          
          if (width > height) {
            if (width > maxSize) {
              height = Math.round(height * (maxSize / width));
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width = Math.round(width * (maxSize / height));
              height = maxSize;
            }
          }
          
          // Set canvas dimensions
          canvas.width = width;
          canvas.height = height;
          
          // Draw image on canvas
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }
          
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to blob with compression
          canvas.toBlob((blob) => {
            if (blob) {
              console.log(`Original size: ${file.size} bytes, Optimized size: ${blob.size} bytes`);
              resolve(blob);
            } else {
              reject(new Error('Failed to create blob from canvas'));
            }
          }, 'image/jpeg', 0.8); // 80% quality JPEG
        };
        
        img.onerror = () => {
          reject(new Error('Failed to load image'));
        };
        
        // Load image from file
        img.src = URL.createObjectURL(file);
      } catch (error) {
        reject(error);
      }
    });
  };

  const handleImageUpload = async (file: File) => {
    try {
      setIsOptimizing(true);
      
      // Create a temporary preview before the upload
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          onImageChange(file);
        }
      };
      reader.readAsDataURL(file);

      // Get the session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      // Optimize the image
      const optimizedBlob = await optimizeImage(file);
      
      // Create a new file from the optimized blob
      const optimizedFile = new File(
        [optimizedBlob], 
        file.name.split('.')[0] + '_optimized.jpg', 
        { type: 'image/jpeg' }
      );

      // Upload to storage
      const fileExt = 'jpg'; // Always jpg after optimization
      const filePath = `${session.user.id}/${crypto.randomUUID()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('menu-category-images')
        .upload(filePath, optimizedFile, {
          contentType: 'image/jpeg',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(`Failed to upload image: ${uploadError.message}`);
      }

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('menu-category-images')
        .getPublicUrl(filePath);

      if (!publicUrl) {
        throw new Error('No URL returned from image upload');
      }

      console.log('Image uploaded successfully:', publicUrl);
      setOptimizedImageUrl(publicUrl);

    } catch (error) {
      console.error('Error optimizing image:', error);
      toast({
        title: "Error optimizing image",
        description: error.message || "Failed to optimize image",
        variant: "destructive"
      });
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleSave = () => {
    if (isOptimizing) {
      toast({
        title: "Please wait",
        description: "Image is still being processed",
        variant: "destructive"
      });
      return;
    }
    
    if (!optimizedImageUrl && imagePreview && !isEditing) {
      toast({
        title: "Error",
        description: "Image upload failed. Please try again or continue without an image.",
        variant: "destructive"
      });
      return;
    }
    
    onSave(optimizedImageUrl || undefined);
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
