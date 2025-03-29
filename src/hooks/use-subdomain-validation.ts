
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
      
      // First check if subdomain exists in restaurant_profiles
      const { data: existingSubdomain, error: subdError } = await supabase
        .from('restaurant_profiles')
        .select('id')
        .eq('subdomain', subdomain)
        .neq('id', session.user.id)
        .maybeSingle();
        
      if (subdError) throw subdError;
      
      // If subdomain exists, check if the user still exists in auth
      if (existingSubdomain) {
        // Use the edge function to verify if the owner of this subdomain still exists
        const { data: verificationData, error: verificationError } = await supabase.functions.invoke('verify-user-exists', {
          body: { userId: existingSubdomain.id },
        });
        
        if (verificationError) throw verificationError;
        
        // If user doesn't exist, the subdomain is actually available
        if (verificationData && !verificationData.exists) {
          setSubdomainError(null);
          return true;
        }
        
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
