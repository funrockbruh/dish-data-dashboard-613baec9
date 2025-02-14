
import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Plus, Upload } from "lucide-react";

export const CategorySetup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Array<{
    id?: string;
    name: string;
    image?: File;
    imagePreview?: string;
  }>>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleAddCategory = () => {
    setCategories([...categories, { name: "" }]);
  };

  const handleNameChange = (index: number, value: string) => {
    const updatedCategories = [...categories];
    updatedCategories[index].name = value;
    setCategories(updatedCategories);
  };

  const handleImageChange = (index: number, file: File) => {
    const updatedCategories = [...categories];
    updatedCategories[index].image = file;
    
    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      updatedCategories[index].imagePreview = reader.result as string;
      setCategories([...updatedCategories]);
    };
    reader.readAsDataURL(file);
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
            <div 
              className="w-16 h-16 border rounded-lg overflow-hidden flex items-center justify-center cursor-pointer hover:bg-gray-50"
              onClick={() => fileInputRef.current?.click()}
            >
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
              onChange={(e) => handleNameChange(index, e.target.value)}
              placeholder="Category name"
              className="flex-1"
            />
            <Input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageChange(index, file);
              }}
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
  );
};
