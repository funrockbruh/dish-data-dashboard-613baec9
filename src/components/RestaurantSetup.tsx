
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { LogoUploader } from "./restaurant/LogoUploader";
import { SubdomainInput } from "./restaurant/SubdomainInput";
import { RestaurantInfoForm } from "./restaurant/RestaurantInfoForm";
import { useRestaurantForm } from "@/hooks/use-restaurant-form";

export const RestaurantSetup = () => {
  const [isInitialSetup, setIsInitialSetup] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  
  const { 
    formData, 
    isLoading, 
    logoPreview, 
    subdomainError,
    handleLogoChange,
    handleFormChange,
    handleRestaurantNameChange,
    handleSubdomainChange,
    setSubdomainError,
    handleSubmit 
  } = useRestaurantForm({
    initialSetup: isInitialSetup,
    returnPath: location.state?.from
  });

  useEffect(() => {
    const checkSetupState = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate('/');
        return;
      }
      
      if (location.state?.from === 'settings') {
        setIsInitialSetup(false);
      } else {
        const { count } = await supabase
          .from('menu_categories')
          .select('*', { count: 'exact', head: true })
          .eq('restaurant_id', session.user.id);
          
        setIsInitialSetup(count === 0);
      }
    };
    
    checkSetupState();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate('/');
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, location.state]);

  const handleBack = () => {
    if (location.state?.from) {
      navigate(location.state.from);
    } else {
      navigate(-1);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto p-6">
      <div className="flex items-center mb-4">
        <Button variant="ghost" size="icon" className="rounded-full mr-2" onClick={handleBack}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h2 className="text-2xl font-bold">Restaurant Profile Setup</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <LogoUploader 
          logoPreview={logoPreview} 
          onLogoChange={handleLogoChange} 
        />

        <RestaurantInfoForm 
          formData={formData} 
          onFormChange={handleFormChange}
          onRestaurantNameChange={handleRestaurantNameChange}
        />

        <SubdomainInput 
          subdomain={formData.subdomain}
          onSubdomainChange={handleSubdomainChange}
          error={subdomainError}
          onErrorChange={setSubdomainError}
        />

        <Button 
          type="submit" 
          disabled={isLoading || !!subdomainError} 
          className="w-full bg-green-600 hover:bg-green-500"
        >
          {isLoading ? "Saving..." : "Save Profile"}
        </Button>
      </form>
    </Card>
  );
};
