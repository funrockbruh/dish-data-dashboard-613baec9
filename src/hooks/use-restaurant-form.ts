
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { generateSubdomain } from "@/hooks/use-subdomain";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useLogoUpload } from "@/hooks/use-logo-upload";
import { useSubdomainValidation } from "@/hooks/use-subdomain-validation";
import { useRestaurantProfileManagement, RestaurantFormData } from "@/hooks/use-restaurant-profile-management";

interface UseRestaurantFormProps {
  initialSetup?: boolean;
  returnPath?: string;
}

export type { RestaurantFormData };

export const useRestaurantForm = ({ initialSetup = true, returnPath }: UseRestaurantFormProps = {}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { 
    logo,
    logoPreview, 
    setLogoPreview, 
    handleLogoChange, 
    uploadLogo 
  } = useLogoUpload();

  const { 
    subdomainError, 
    setSubdomainError, 
    isLoading, 
    setIsLoading, 
    checkSubdomainAvailability 
  } = useSubdomainValidation();

  const { 
    formData, 
    setFormData, 
    loadProfile, 
    saveProfile, 
    handleFormChange 
  } = useRestaurantProfileManagement();

  useEffect(() => {
    const initializeProfile = async () => {
      const logoUrl = await loadProfile();
      if (logoUrl) {
        setLogoPreview(logoUrl);
      }
    };
    
    initializeProfile();
  }, [navigate, toast]);

  const handleRestaurantNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const newSubdomain = generateSubdomain(value);
    
    setFormData(prevFormData => ({
      ...prevFormData,
      restaurant_name: value,
      subdomain: prevFormData.subdomain === generateSubdomain(prevFormData.restaurant_name) 
        ? newSubdomain 
        : prevFormData.subdomain
    }));
    
    if (newSubdomain && formData.subdomain === generateSubdomain(formData.restaurant_name)) {
      checkSubdomainAvailability(newSubdomain);
    }
  };

  const handleSubdomainChange = (value: string) => {
    setFormData(prevFormData => ({
      ...prevFormData,
      subdomain: value
    }));

    if (value) {
      checkSubdomainAvailability(value);
    } else {
      setSubdomainError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.subdomain) {
      const isSubdomainAvailable = await checkSubdomainAvailability(formData.subdomain);
      if (!isSubdomainAvailable) return;
    }

    setIsLoading(true);
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw new Error("Authentication error");
      if (!session?.user) throw new Error("Not authenticated");

      // Upload logo if changed and get URL
      const logo_url = await uploadLogo(session.user.id);
      
      // Save profile data
      const success = await saveProfile(logo_url, session.user.id, true);
      
      if (success) {
        toast({
          title: "Success",
          description: "Restaurant profile updated successfully"
        });
        
        if (initialSetup) {
          navigate('/categories');
        } else if (returnPath) {
          navigate(`/${returnPath}`);
        } else {
          navigate('/settings');
        }
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
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
  };
};
