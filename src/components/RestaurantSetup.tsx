import { useEffect, useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useNavigate, useLocation } from "react-router-dom";
import { Pencil, ArrowLeft, Loader2 } from "lucide-react";
export const RestaurantSetup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [isInitialSetup, setIsInitialSetup] = useState(true);
  const [subdomainError, setSubdomainError] = useState<string | null>(null);
  const [isCheckingSubdomain, setIsCheckingSubdomain] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    owner_name: "",
    restaurant_name: "",
    owner_number: "",
    owner_email: "",
    about: "",
    subdomain: ""
  });
  const {
    toast
  } = useToast();
  useEffect(() => {
    const loadProfile = async () => {
      const {
        data: {
          session
        }
      } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate('/');
        return;
      }
      const {
        data,
        error
      } = await supabase.from('restaurant_profiles').select('*').eq('id', session.user.id).maybeSingle();
      if (data && !error) {
        setFormData({
          owner_name: data.owner_name || "",
          restaurant_name: data.restaurant_name || "",
          owner_number: data.owner_number || "",
          owner_email: data.owner_email || "",
          about: data.about || "",
          subdomain: data.subdomain || ""
        });
        if (data.logo_url) {
          setLogoPreview(data.logo_url);
        }
        if (location.state?.from === 'settings') {
          setIsInitialSetup(false);
        } else {
          const {
            count
          } = await supabase.from('menu_categories').select('*', {
            count: 'exact',
            head: true
          }).eq('restaurant_id', session.user.id);
          setIsInitialSetup(count === 0);
        }
      }
    };
    loadProfile();
    const {
      data: {
        subscription
      }
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate('/');
      }
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, location.state]);
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogo(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };
  const generateSubdomain = (restaurantName: string) => {
    if (!restaurantName) return "";
    return restaurantName.toLowerCase().replace(/[^a-z0-9]/g, '-') // Replace non-alphanumeric with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with a single one
    .replace(/^-|-$/g, ''); // Remove hyphens at start and end
  };
  const handleRestaurantNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const newSubdomain = generateSubdomain(value);
    setFormData(prevFormData => ({
      ...prevFormData,
      restaurant_name: value,
      subdomain: prevFormData.subdomain === generateSubdomain(prevFormData.restaurant_name) ? newSubdomain : prevFormData.subdomain
    }));
    if (newSubdomain && formData.subdomain === generateSubdomain(formData.restaurant_name)) {
      checkSubdomainAvailability(newSubdomain);
    }
  };
  const checkSubdomainAvailability = async (subdomain: string) => {
    if (!subdomain) {
      setSubdomainError(null);
      return;
    }
    setIsCheckingSubdomain(true);
    try {
      const {
        data: {
          session
        }
      } = await supabase.auth.getSession();
      if (!session?.user) return;
      const {
        data: existingSubdomain,
        error: subdomainError
      } = await supabase.from('restaurant_profiles').select('id').eq('subdomain', subdomain).neq('id', session.user.id).maybeSingle();
      if (existingSubdomain) {
        setSubdomainError("This subdomain is already taken. Please choose another one.");
      } else {
        setSubdomainError(null);
      }
    } catch (error) {
      console.error('Error checking subdomain:', error);
    } finally {
      setIsCheckingSubdomain(false);
    }
  };
  const handleSubdomainChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const sanitizedValue = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setFormData(prevFormData => ({
      ...prevFormData,
      subdomain: sanitizedValue
    }));
    if (sanitizedValue) {
      checkSubdomainAvailability(sanitizedValue);
    } else {
      setSubdomainError(null);
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check subdomain one more time before submission
    if (formData.subdomain) {
      setIsLoading(true);
      try {
        const {
          data: {
            session
          }
        } = await supabase.auth.getSession();
        if (!session?.user) throw new Error("Not authenticated");
        const {
          data: existingSubdomain
        } = await supabase.from('restaurant_profiles').select('id').eq('subdomain', formData.subdomain).neq('id', session.user.id).maybeSingle();
        if (existingSubdomain) {
          setSubdomainError("This subdomain is already taken. Please choose another one.");
          setIsLoading(false);
          return;
        }
      } catch (error) {
        console.error('Subdomain check error:', error);
        toast({
          title: "Error",
          description: "Failed to check subdomain availability",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }
    }
    try {
      const {
        data: {
          session
        },
        error: sessionError
      } = await supabase.auth.getSession();
      if (sessionError) throw new Error("Authentication error");
      if (!session?.user) throw new Error("Not authenticated");
      let logo_url = logoPreview;
      if (logo) {
        const fileExt = logo.name.split('.').pop();
        const filePath = `${session.user.id}/logo.${fileExt}`;
        const {
          error: uploadError
        } = await supabase.storage.from('restaurant-logos').upload(filePath, logo, {
          upsert: true,
          cacheControl: '3600'
        });
        if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);
        const {
          data: {
            publicUrl
          }
        } = supabase.storage.from('restaurant-logos').getPublicUrl(filePath);
        logo_url = publicUrl;
      }
      const {
        error: updateError
      } = await supabase.from('restaurant_profiles').upsert({
        id: session.user.id,
        ...formData,
        logo_url
      });
      if (updateError) throw updateError;
      toast({
        title: "Success",
        description: "Restaurant profile updated successfully"
      });
      if (isInitialSetup) {
        navigate('/categories');
      } else {
        navigate('/settings');
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
  const handleBack = () => {
    if (location.state?.from) {
      navigate(location.state.from);
    } else {
      navigate(-1);
    }
  };
  return <Card className="max-w-2xl mx-auto p-6">
      <div className="flex items-center mb-4">
        <Button variant="ghost" size="icon" className="rounded-full mr-2" onClick={handleBack}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h2 className="text-2xl font-bold">Restaurant Profile Setup</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-col items-center mb-6">
          <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-gray-200 mb-4 relative cursor-pointer group" onClick={handleUploadClick}>
            {logoPreview ? <>
                <img src={logoPreview} alt="Restaurant logo" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Pencil className="w-6 h-6 text-white" />
                </div>
              </> : <div className="w-full h-full bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                <span className="text-gray-400">Click to upload</span>
              </div>}
          </div>
          <Input ref={fileInputRef} id="logo" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="owner_name">Owner Name</Label>
            <Input id="owner_name" value={formData.owner_name} onChange={e => setFormData(prev => ({
            ...prev,
            owner_name: e.target.value
          }))} placeholder="Enter owner name" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="restaurant_name">Restaurant Name</Label>
            <Input id="restaurant_name" value={formData.restaurant_name} onChange={handleRestaurantNameChange} placeholder="Enter restaurant name" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="owner_number">Phone Number</Label>
            <Input id="owner_number" value={formData.owner_number} onChange={e => setFormData(prev => ({
            ...prev,
            owner_number: e.target.value
          }))} placeholder="Enter phone number" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="owner_email">Email</Label>
            <Input id="owner_email" type="email" value={formData.owner_email} onChange={e => setFormData(prev => ({
            ...prev,
            owner_email: e.target.value
          }))} placeholder="Enter email" required />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="subdomain">Subdomain</Label>
          <div className="flex items-center">
            <div className="relative flex-1">
              <Input id="subdomain" value={formData.subdomain} onChange={handleSubdomainChange} placeholder="your-restaurant" className={subdomainError ? "border-red-500 pr-10" : ""} />
              {isCheckingSubdomain && <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                </div>}
            </div>
            <span className="ml-2 text-zinc-950">.websitely.app</span>
          </div>
          {subdomainError && <p className="text-sm text-red-500 mt-1">{subdomainError}</p>}
          <p className="text-xs text-gray-500 mt-1">This will be your unique URL for sharing your menu.</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="about">About Restaurant</Label>
          <Textarea id="about" value={formData.about} onChange={e => setFormData(prev => ({
          ...prev,
          about: e.target.value
        }))} placeholder="Tell us about your restaurant" className="h-32" />
        </div>

        <Button type="submit" disabled={isLoading || !!subdomainError || isCheckingSubdomain} className="w-full bg-green-600 hover:bg-green-500">
          {isLoading ? "Saving..." : "Save Profile"}
        </Button>
      </form>
    </Card>;
};