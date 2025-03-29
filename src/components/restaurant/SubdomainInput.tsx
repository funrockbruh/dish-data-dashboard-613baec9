
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

interface SubdomainInputProps {
  subdomain: string;
  onSubdomainChange: (value: string) => void;
  error: string | null;
  onErrorChange: (error: string | null) => void;
}

export const SubdomainInput = ({ 
  subdomain, 
  onSubdomainChange, 
  error, 
  onErrorChange 
}: SubdomainInputProps) => {
  const [isChecking, setIsChecking] = useState(false);

  const checkSubdomainAvailability = async (value: string) => {
    if (!value) {
      onErrorChange(null);
      return;
    }
    
    setIsChecking(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      
      // First check if subdomain exists in restaurant_profiles
      const { data: existingSubdomain, error: subdError } = await supabase
        .from('restaurant_profiles')
        .select('id')
        .eq('subdomain', value)
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
          onErrorChange(null);
          return;
        }
        
        onErrorChange("This subdomain is already taken. Please choose another one.");
      } else {
        onErrorChange(null);
      }
    } catch (error) {
      console.error('Error checking subdomain:', error);
      onErrorChange("Error checking subdomain availability");
    } finally {
      setIsChecking(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const sanitizedValue = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    onSubdomainChange(sanitizedValue);
    
    if (sanitizedValue) {
      checkSubdomainAvailability(sanitizedValue);
    } else {
      onErrorChange(null);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="subdomain">Subdomain</Label>
      <div className="flex items-center">
        <div className="relative flex-1">
          <Input 
            id="subdomain" 
            value={subdomain} 
            onChange={handleChange} 
            placeholder="your-restaurant" 
            className={error ? "border-red-500 pr-10" : ""} 
          />
          {isChecking && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
            </div>
          )}
        </div>
        <span className="ml-2 text-zinc-950">.websitely.app</span>
      </div>
      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
      <p className="text-xs text-gray-500 mt-1">This will be your unique URL for sharing your menu.</p>
    </div>
  );
};
