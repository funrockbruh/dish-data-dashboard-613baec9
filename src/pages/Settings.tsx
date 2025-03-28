
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, PaintRoller, Tag, List, Star, Link as LinkIcon, CreditCard, HelpCircle, LogOut } from "lucide-react";
import { toast } from "sonner";

const Settings = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [restaurantName, setRestaurantName] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      
      if (!data.session) {
        navigate('/');
        return;
      }
      
      // Fetch restaurant profile
      const { data: profileData } = await supabase
        .from('restaurant_profiles')
        .select('restaurant_name')
        .eq('id', data.session.user.id)
        .single();
        
      if (profileData) {
        setRestaurantName(profileData.restaurant_name);
      }
    };

    checkAuth();
  }, [navigate]);

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      navigate('/');
      toast.success("Signed out successfully");
    } catch (error) {
      toast.error("Failed to sign out");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const navigateTo = (path: string, state?: any) => {
    navigate(path, { state });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="bg-white shadow-sm">
        <div className="max-w-xl mx-auto px-4 py-4 flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)}
            className="mr-3"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">Settings</h1>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 mt-6">
        {restaurantName && (
          <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
            <h2 className="text-lg font-medium">{restaurantName}</h2>
            <p className="text-sm text-gray-500">Manage your restaurant settings</p>
          </div>
        )}

        <div className="space-y-4">
          <Button 
            variant="outline" 
            className="w-full justify-start h-14 text-lg border-2 rounded-xl" 
            onClick={() => navigateTo("/setup", { from: 'settings' })}
          >
            <User className="mr-3 h-5 w-5" />
            Edit Profile
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full justify-start h-14 text-lg border-2 rounded-xl" 
            onClick={() => navigateTo("/theme", { from: 'settings' })}
          >
            <PaintRoller className="mr-3 h-5 w-5" />
            Edit Theme
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full justify-start h-14 text-lg border-2 rounded-xl" 
            onClick={() => navigateTo("/menu", { from: 'settings' })}
          >
            <Tag className="mr-3 h-5 w-5" />
            Edit Prices
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full justify-start h-14 text-lg border-2 rounded-xl" 
            onClick={() => navigateTo("/categories", { from: 'settings' })}
          >
            <List className="mr-3 h-5 w-5" />
            Edit Category
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full justify-start h-14 text-lg border-2 rounded-xl" 
            onClick={() => navigateTo("/featured", { from: 'settings' })}
          >
            <Star className="mr-3 h-5 w-5" />
            Featured
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full justify-start h-14 text-lg border-2 rounded-xl" 
            onClick={() => navigateTo("/social-media")}
          >
            <LinkIcon className="mr-3 h-5 w-5" />
            Social Media Links
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full justify-start h-14 text-lg border-2 rounded-xl" 
            onClick={() => navigateTo("/payment/manage")}
          >
            <CreditCard className="mr-3 h-5 w-5" />
            Payment Management
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full justify-start h-14 text-lg border-2 rounded-xl" 
            onClick={() => toast.info("Contact support coming soon")}
          >
            <HelpCircle className="mr-3 h-5 w-5" />
            Contact Support
          </Button>
          
          <Button 
            variant="destructive" 
            className="w-full justify-center h-14 text-lg rounded-xl mt-8"
            onClick={handleSignOut}
            disabled={loading}
          >
            <LogOut className="mr-3 h-5 w-5" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
