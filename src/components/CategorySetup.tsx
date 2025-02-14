
import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Plus, Upload, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const CategorySetup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newCategory, setNewCategory] = useState<{
    name: string;
    image?: File;
    imagePreview?: string;
  }>({ name: "" });
  const [categories, setCategories] = useState<Array<{
    id?: string;
    name: string;
    image?: File;
    imagePreview?: string;
  }>>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleAddCategory = () => {
    setIsDialogOpen(true);
  };

  const handleNewCategoryImageChange = (file: File) => {
    setNewCategory(prev => {
      const updated = { ...prev, image: file };
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewCategory(current => ({
          ...current,
          imagePreview: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
      
      return updated;
    });
  };

  const handleSaveNewCategory = () => {
    if (newCategory.name.trim()) {
      setCategories([...categories, newCategory]);
      setNewCategory({ name: "" }); // Reset form
      setIsDialogOpen(false);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error("Not authenticated");

      for (const category of categories) {
        if (!category.name.trim()) continue;

        let image_url = null;
        if (category.image) {
          const fileExt = category.image.name.split('.').pop();
          const filePath = `${session.user.id}/${crypto.randomUUID()}.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage
            .from('menu-category-images')
            .upload(filePath, category.image);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('menu-category-images')
            .getPublicUrl(filePath);
          
          image_url = publicUrl;
        }

        const { error: insertError } = await supabase
          .from('menu_categories')
          .insert({
            name: category.name,
            image_url,
            restaurant_id: session.user.id
          });

        if (insertError) throw insertError;
      }

      toast({
        title: "Success",
        description: "Categories saved successfully",
      });
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save categories",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Card className="max-w-2xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Set Up Menu Categories</h2>
          <Button onClick={handleAddCategory} variant="outline" size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4">
          {categories.map((category, index) => (
            <div key={index} className="flex items-center gap-4">
              <div className="w-16 h-16 border rounded-lg overflow-hidden flex items-center justify-center">
                {category.imagePreview ? (
                  <img 
                    src={category.imagePreview} 
                    alt={category.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Upload className="w-6 h-6 text-gray-400" />
                )}
              </div>
              <Input
                value={category.name}
                readOnly
                className="flex-1"
              />
            </div>
          ))}

          {categories.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Click the + button to add categories
            </div>
          )}
        </div>

        {categories.length > 0 && (
          <Button 
            onClick={handleSave} 
            className="w-full mt-6" 
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Save Categories"}
          </Button>
        )}
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md rounded-3xl">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-2xl font-bold">Add category:</DialogTitle>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setIsDialogOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <h3 className="text-xl font-bold">Add image:</h3>
              <div 
                className="w-full h-48 bg-gray-100 rounded-xl flex items-center justify-center cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                {newCategory.imagePreview ? (
                  <img 
                    src={newCategory.imagePreview} 
                    alt="Category preview" 
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <Plus className="h-8 w-8 text-gray-400" />
                )}
              </div>
              <Input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleNewCategoryImageChange(file);
                }}
              />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold">Name:</h3>
              <Input
                value={newCategory.name}
                onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Name category"
                className="w-full"
              />
            </div>

            <Button 
              className="w-full bg-green-500 hover:bg-green-600 text-white rounded-full h-12"
              onClick={handleSaveNewCategory}
            >
              Add
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
