
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { X, Plus, Image as ImageIcon, Pencil, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string | null;
  category_id: string;
}

interface AddMenuItemDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Array<{ id: string; name: string; }>;
  onSuccess: () => void;
  editItem?: MenuItem | null;
}

export const AddMenuItemDialog = ({
  isOpen,
  onOpenChange,
  categories,
  onSuccess,
  editItem
}: AddMenuItemDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    categoryId: categories[0]?.id || "",
    image: null as File | null,
    imagePreview: null as string | null
  });
  const { toast } = useToast();

  useEffect(() => {
    if (editItem) {
      setFormData({
        name: editItem.name,
        description: editItem.description || "",
        price: (editItem.price / 100).toString(),
        categoryId: editItem.category_id,
        image: null,
        imagePreview: editItem.image_url
      });
    } else {
      setFormData({
        name: "",
        description: "",
        price: "",
        categoryId: categories[0]?.id || "",
        image: null,
        imagePreview: null
      });
    }
  }, [editItem, categories]);

  const optimizeImage = async (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      img.onload = () => {
        // Calculate dimensions while maintaining aspect ratio
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
        
        canvas.width = width;
        canvas.height = height;
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            console.log(`Optimized image: Original: ${(file.size / 1024).toFixed(2)}KB, New: ${(blob.size / 1024).toFixed(2)}KB`);
            resolve(blob);
          } else {
            reject(new Error('Could not create blob'));
          }
        }, 'image/jpeg', 0.75); // 75% quality
      };
      
      img.onerror = () => reject(new Error('Error loading image'));
      img.src = URL.createObjectURL(file);
    });
  };

  const handleImageChange = (file: File) => {
    setFormData(prev => {
      const updated = { ...prev, image: file };
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(current => ({
          ...current,
          imagePreview: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
      return updated;
    });
  };

  const handleImageUpload = async (file: File) => {
    try {
      setIsLoading(true);
      
      // Optimize image using canvas-based approach
      const optimizedBlob = await optimizeImage(file);
      
      // Create a new file from the optimized blob
      const optimizedFile = new File(
        [optimizedBlob], 
        `${file.name.split('.')[0]}_optimized.jpg`,
        { type: 'image/jpeg' }
      );
      
      // Get authenticated session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');
      
      // Upload directly to Supabase Storage
      const fileExt = 'jpg';
      const filePath = `${session.user.id}/${crypto.randomUUID()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('menu-items')
        .upload(filePath, optimizedFile, {
          contentType: 'image/jpeg',
          upsert: true,
        });
        
      if (uploadError) throw uploadError;
      
      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('menu-items')
        .getPublicUrl(filePath);
        
      console.log('Image uploaded successfully:', publicUrl);
      
      return publicUrl;
    } catch (error) {
      console.error('Error optimizing/uploading image:', error);
      toast({
        title: "Error",
        description: "Failed to process image",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter an item name",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.price) {
      toast({
        title: "Error",
        description: "Please enter a price",
        variant: "destructive"
      });
      return false;
    }

    const price = parseFloat(formData.price);
    if (isNaN(price) || price <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid price greater than 0",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.categoryId) {
      toast({
        title: "Error",
        description: "Please select a category",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleDelete = async () => {
    if (!editItem) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', editItem.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Menu item deleted successfully"
      });
      
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error deleting menu item:', error);
      toast({
        title: "Error",
        description: "Failed to delete menu item",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error("Not authenticated");

      let image_url = editItem?.image_url || null;
      if (formData.image) {
        image_url = await handleImageUpload(formData.image);
      }

      const price = parseFloat(formData.price);
      const priceInCents = Math.round(price * 100);

      if (editItem) {
        const { error: updateError } = await supabase
          .from('menu_items')
          .update({
            name: formData.name,
            description: formData.description,
            price: priceInCents,
            category_id: formData.categoryId,
            ...(image_url && { image_url })
          })
          .eq('id', editItem.id);

        if (updateError) throw updateError;

        toast({
          title: "Success",
          description: "Menu item updated successfully"
        });
      } else {
        const { error: insertError } = await supabase
          .from('menu_items')
          .insert({
            name: formData.name,
            description: formData.description,
            price: priceInCents,
            category_id: formData.categoryId,
            image_url,
            restaurant_id: session.user.id
          });

        if (insertError) throw insertError;

        toast({
          title: "Success",
          description: "Menu item added successfully"
        });
      }
      
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error with menu item:', error);
      toast({
        title: "Error",
        description: error.message || `Failed to ${editItem ? 'update' : 'add'} menu item`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold font-inter">
              {editItem ? 'Edit menu item' : 'Add menu item'}
            </DialogTitle>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label className="font-inter">Image</Label>
            <div 
              onClick={() => document.getElementById('menu-item-image')?.click()}
              className="relative w-full h-48 rounded-xl flex items-center justify-center cursor-pointer bg-gray-100 hover:bg-gray-50 transition-colors"
            >
              {formData.imagePreview ? (
                <img 
                  src={formData.imagePreview} 
                  alt="Preview" 
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-gray-400">
                  <ImageIcon className="h-8 w-8" />
                  <span className="text-sm font-inter">Click to upload image</span>
                </div>
              )}
              {isLoading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-xl">
                  <div className="text-white">Optimizing...</div>
                </div>
              )}
            </div>
            <Input
              id="menu-item-image"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageChange(file);
              }}
            />
          </div>

          <div className="space-y-2">
            <Label className="font-inter">Category</Label>
            <select
              value={formData.categoryId}
              onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label className="font-inter">Name</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Item name"
              className="font-inter"
            />
          </div>

          <div className="space-y-2">
            <Label className="font-inter">Description (optional)</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe your item..."
              className="font-inter"
            />
          </div>

          <div className="space-y-2">
            <Label className="font-inter">Price</Label>
            <Input
              type="text"
              inputMode="decimal"
              pattern="[0-9]*[.,]?[0-9]*"
              value={formData.price}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9.]/g, '');
                setFormData(prev => ({ ...prev, price: value }));
              }}
              placeholder="0.00"
              className="font-inter"
            />
          </div>

          <div className="space-y-3">
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full bg-green-500 hover:bg-green-600 text-white h-12 font-inter rounded-xl"
            >
              {isLoading ? (editItem ? "Updating..." : "Adding...") : (
                <>
                  {editItem ? <Pencil className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                  {editItem ? 'Update Item' : 'Add Item'}
                </>
              )}
            </Button>

            {editItem && (
              <Button
                onClick={handleDelete}
                disabled={isLoading}
                variant="destructive"
                className="w-full h-12 font-inter rounded-xl"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Item
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
