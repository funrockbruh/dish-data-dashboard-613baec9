
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

export const useSubdomainValidation = () => {
  const [subdomainError, setSubdomainError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const checkSubdomainAvailability = async (subdomain: string) => {
    if (!subdomain) {
      setSubdomainError(null);
      return false;
    }
    
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error("Not authenticated");
      
      const { data: existingSubdomain } = await supabase
        .from('restaurant_profiles')
        .select('id')
        .eq('subdomain', subdomain)
        .neq('id', session.user.id)
        .maybeSingle();
        
      if (existingSubdomain) {
        setSubdomainError("This subdomain is already taken. Please choose another one.");
        return false;
      }
      setSubdomainError(null);
      return true;
    } catch (error) {
      console.error('Subdomain check error:', error);
      toast({
        title: "Error",
        description: "Failed to check subdomain availability",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    subdomainError,
    setSubdomainError,
    isLoading,
    setIsLoading,
    checkSubdomainAvailability
  };
};
