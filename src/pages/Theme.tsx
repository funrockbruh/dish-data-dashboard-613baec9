
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { ThemeColorSelector } from "@/components/theme/ThemeColorSelector";
import { ThemeTemplateSelector } from "@/components/theme/ThemeTemplateSelector";

const Theme = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLightTheme, setIsLightTheme] = useState(true);
  const [loading, setLoading] = useState(false);
  const [restaurantName, setRestaurantName] = useState<string | null>(null);
  const fromSettings = location.state?.from === 'settings';

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      
      if (!data.session) {
        navigate('/');
        return;
      }
      
      // Fetch restaurant profile and theme settings
      const { data: profileData } = await supabase
        .from('restaurant_profiles')
        .select('restaurant_name, theme_settings')
        .eq('id', data.session.user.id)
        .single();
        
      if (profileData) {
        setRestaurantName(profileData.restaurant_name);
        
        // Initialize theme settings if available
        if (profileData.theme_settings) {
          setIsLightTheme(profileData.theme_settings.isLightTheme !== false);
        }
      }
    };

    checkAuth();
  }, [navigate]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        toast.error("Not authenticated");
        return;
      }
      
      const { error } = await supabase
        .from('restaurant_profiles')
        .update({
          theme_settings: {
            isLightTheme,
            // Add other theme settings here
          }
        })
        .eq('id', sessionData.session.user.id);
        
      if (error) throw error;
      
      toast.success("Theme settings saved successfully");
      
      if (fromSettings) {
        navigate('/settings');
      }
    } catch (error) {
      console.error("Error saving theme settings:", error);
      toast.error("Failed to save theme settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="bg-white shadow-sm">
        <div className="max-w-xl mx-auto px-4 py-4 flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(fromSettings ? '/settings' : '/')}
            className="mr-3"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">Theme Settings</h1>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 mt-6">
        {restaurantName && (
          <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
            <h2 className="text-lg font-medium">{restaurantName}</h2>
            <p className="text-sm text-gray-500">Customize your menu appearance</p>
          </div>
        )}

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-bold">Light Theme</h3>
                <p className="text-gray-500 text-sm">Toggle between light and dark mode</p>
              </div>
              <Switch
                checked={isLightTheme}
                onCheckedChange={setIsLightTheme}
              />
            </div>

            <ThemeColorSelector 
              title="Background" 
              description="Choose a background color or image"
              type="background"
            />
            
            <div className="h-4"></div>
            
            <ThemeColorSelector 
              title="Pop up" 
              description="Choose a color or image for popups"
              type="popup"
            />
            
            <div className="h-6"></div>
            
            <ThemeTemplateSelector />
          </div>
          
          <Button 
            className="w-full py-6 text-lg rounded-xl mt-4"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? "Saving..." : fromSettings ? "Save" : "Save & Continue"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Theme;
