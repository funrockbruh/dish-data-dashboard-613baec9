
import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { AddFeaturedDialog } from "./AddFeaturedDialog";
import { FeaturedRestaurantHeader } from "./FeaturedRestaurantHeader";
import { FeaturedItem } from "./FeaturedItem";
import { AddFeaturedButton } from "./AddFeaturedButton";
import { useFeaturedItems } from "@/hooks/use-featured-items";
import { useRestaurantProfile } from "@/hooks/use-restaurant-profile";

export const FeaturedItems = () => {
  const { 
    items, 
    featuredItems, 
    isLoading, 
    featuredEnabled, 
    setFeaturedEnabled,
    loadData,
    toggleFeatured,
    saveFeatured,
    addFeaturedItem
  } = useFeaturedItems();
  
  const { profile } = useRestaurantProfile();
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <FeaturedRestaurantHeader profile={profile} />

      <div className="flex items-center justify-between">
        <h2 className="text-4xl font-bold">Featured</h2>
        <div className="flex items-center gap-2">
          <Switch 
            checked={featuredEnabled} 
            onCheckedChange={setFeaturedEnabled} 
            className="data-[state=checked]:bg-green-500"
          />
        </div>
      </div>

      <div className="space-y-4">
        {/* Add featured item button */}
        <AddFeaturedButton onClick={() => setDialogOpen(true)} />

        {/* Featured items */}
        {featuredItems.map((item) => (
          <FeaturedItem 
            key={item.id} 
            item={item} 
            onToggle={toggleFeatured}
          />
        ))}
      </div>

      <div className="flex justify-end">
        <Button 
          onClick={saveFeatured}
          disabled={isLoading}
          className="px-6 py-6 rounded-xl bg-[#23c55e]"
        >
          {isLoading ? "Saving..." : "Save & Continue"}
        </Button>
      </div>

      <AddFeaturedDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        items={items}
        featuredItems={featuredItems}
        onAddFeatured={addFeaturedItem}
      />
    </div>
  );
};
