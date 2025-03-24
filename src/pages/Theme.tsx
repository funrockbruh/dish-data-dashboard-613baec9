
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { ThemeTemplateSelector } from "@/components/theme/ThemeTemplateSelector";

const Theme = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLightTheme, setIsLightTheme] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("template1");
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
      
      try {
        // Fetch restaurant profile
        const { data: profileData, error: profileError } = await supabase
          .from('restaurant_profiles')
          .select('restaurant_name, theme')
          .eq('id', data.session.user.id)
          .single();
          
        if (profileError) {
          console.error("Error fetching profile:", profileError);
          return;
        }
          
        if (profileData) {
          setRestaurantName(profileData.restaurant_name);
          
          // Initialize theme settings if available
          if (profileData.theme) {
            try {
              const themeData = typeof profileData.theme === 'string' 
                ? JSON.parse(profileData.theme) 
                : profileData.theme;
                
              setIsLightTheme(themeData.isLightTheme !== false);
              if (themeData.template) {
                setSelectedTemplate(themeData.template);
              }
            } catch (err) {
              console.error("Error parsing theme data:", err);
            }
          }
        }
      } catch (error) {
        console.error("Error in auth check:", error);
      }
    };

    checkAuth();
  }, [navigate]);

  const handleTemplateChange = (template: string) => {
    setSelectedTemplate(template);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        toast.error("Not authenticated");
        return;
      }
      
      const themeSettings = JSON.stringify({
        isLightTheme,
        template: selectedTemplate
      });
      
      const { error } = await supabase
        .from('restaurant_profiles')
        .update({
          theme: themeSettings
        })
        .eq('id', sessionData.session.user.id);
        
      if (error) throw error;
      
      toast.success("Theme settings saved successfully");
      
      if (fromSettings) {
        navigate('/settings');
      } else {
        navigate('/featured');
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
            
            <div className="h-6"></div>
            
            <ThemeTemplateSelector 
              initialTemplate={selectedTemplate}
              onTemplateChange={handleTemplateChange}
            />
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
