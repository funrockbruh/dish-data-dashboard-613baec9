
import { Edit, Info, MessageSquare, Phone, Settings } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import type { Restaurant } from "@/hooks/public-menu/types";
import { useEffect, useState } from "react";
import { ImageWithSkeleton } from "@/components/ui/image-with-skeleton";
import { CountdownTimer } from "@/components/payment/CountdownTimer";

interface MenuSidebarProps {
  restaurant: Restaurant | null;
  isAuthenticated: boolean;
}

export const MenuSidebar = ({
  restaurant,
  isAuthenticated
}: MenuSidebarProps) => {
  const navigate = useNavigate();
  const [socialMedia, setSocialMedia] = useState({
    whatsapp: false,
    instagram: false,
    facebook: false,
    tiktok: false
  });
  const [renewalDate, setRenewalDate] = useState<Date | null>(null);

  useEffect(() => {
    if (restaurant) {
      setSocialMedia({
        whatsapp: !!restaurant.social_whatsapp,
        instagram: !!restaurant.social_instagram,
        facebook: !!restaurant.social_facebook,
        tiktok: !!restaurant.social_tiktok
      });

      console.log("Restaurant social media fields:", {
        social_whatsapp: restaurant.social_whatsapp,
        social_instagram: restaurant.social_instagram,
        social_facebook: restaurant.social_facebook,
        social_tiktok: restaurant.social_tiktok
      });
      console.log("Updated social media state:", {
        whatsapp: !!restaurant.social_whatsapp,
        instagram: !!restaurant.social_instagram,
        facebook: !!restaurant.social_facebook,
        tiktok: !!restaurant.social_tiktok
      });
    }
  }, [restaurant]);

  // Fetch renewal date if user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const fetchRenewalDate = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          // Get the latest verified payment
          const { data: payments } = await supabase
            .from("payments")
            .select("*")
            .eq("user_id", session.user.id)
            .eq("status", "verified")
            .order("created_at", { ascending: false })
            .limit(1);
            
          if (payments && payments.length > 0) {
            const verificationDate = new Date(payments[0].updated_at || payments[0].created_at);
            // Set expiry to 2 minutes after verification
            const expiryDate = new Date(verificationDate);
            expiryDate.setMinutes(expiryDate.getMinutes() + 2);
            setRenewalDate(expiryDate);
          }
        }
      };
      
      fetchRenewalDate();
    }
  }, [isAuthenticated]);

  const formatPhoneNumber = (phone: string | undefined | null): string => {
    if (!phone) return "";

    return phone.replace(/^\+\d{1,3}/, '');
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const handleSignIn = () => {
    window.location.href = "/";
  };

  const handleContactClick = () => {
    if (restaurant?.social_whatsapp) {
      const formattedNumber = restaurant.social_whatsapp.replace(/\D/g, '');
      window.open(`https://wa.me/${formattedNumber}`, '_blank');
    } else if (restaurant?.owner_number) {
      const formattedNumber = restaurant.owner_number.replace(/\D/g, '');
      window.open(`https://wa.me/${formattedNumber}`, '_blank');
    }
  };

  const handleSettingsClick = () => {
    navigate('/settings');
  };

  const handleEmailClick = () => {
    if (restaurant?.social_email) {
      window.location.href = `mailto:${restaurant.social_email}`;
    } else if (restaurant?.owner_email) {
      window.location.href = `mailto:${restaurant.owner_email}`;
    }
  };

  const handleSocialClick = (url: string | null | undefined) => {
    if (url) {
      const formattedUrl = url.startsWith('http') ? url : `https://${url}`;
      window.open(formattedUrl, '_blank');
    }
  };

  return <Sheet>
      <SheetTrigger asChild>
        <button className="rounded-full bg-white/10 p-2">
          <Menu className="h-6 w-6 text-white" />
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] p-0 bg-black text-white border-gray-800">
        <div className="flex flex-col h-full rounded-2xl">
          <div className="p-6 border-b border-gray-800 flex flex-col items-center space-y-4 rounded-2xl">
            {restaurant?.logo_url ? (
              <div className="h-24 w-24 rounded-full overflow-hidden">
                <ImageWithSkeleton 
                  src={restaurant.logo_url} 
                  alt={restaurant.restaurant_name || "Restaurant logo"} 
                  className="h-24 w-24 object-cover"
                  fallbackClassName="h-24 w-24 rounded-full"
                />
              </div>
            ) : (
              <div className="bg-green-100 rounded-full h-24 w-24 flex items-center justify-center border-4 border-green-300">
                <span className="text-gray-700 text-sm font-bold">
                  {restaurant?.restaurant_name || "Menu"}
                </span>
              </div>
            )}
            <div className="flex items-center">
              <h2 className="text-2xl font-bold text-center">{restaurant?.restaurant_name}</h2>
              {isAuthenticated && renewalDate && (
                <CountdownTimer expiryDate={renewalDate} />
              )}
            </div>
            {(restaurant?.social_whatsapp || restaurant?.owner_number) && (
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>{formatPhoneNumber(restaurant?.social_whatsapp || restaurant?.owner_number)}</span>
              </div>
            )}
          </div>
          
          <nav className="flex-1 overflow-y-auto">
            <ul className="py-4">
              <li className="px-6 py-3 hover:bg-white/10 cursor-pointer flex items-center space-x-3" onClick={handleContactClick}>
                <MessageSquare className="h-5 w-5" />
                <span>Contact us</span>
              </li>
              <li className="px-6 py-3 hover:bg-white/10 cursor-pointer flex items-center space-x-3">
                <Info className="h-5 w-5" />
                <span>About us</span>
              </li>
              
              {isAuthenticated && <>
                  <li className="px-6 py-3 hover:bg-white/10 cursor-pointer flex items-center space-x-3">
                    <Edit className="h-5 w-5" />
                    <span>Edit Prices</span>
                  </li>
                  <li className="px-6 py-3 hover:bg-white/10 cursor-pointer flex items-center space-x-3" onClick={handleSettingsClick}>
                    <Settings className="h-5 w-5" />
                    <span>Settings</span>
                  </li>
                </>}
            </ul>
          </nav>
          
          {(socialMedia.instagram || socialMedia.facebook || socialMedia.tiktok || socialMedia.whatsapp) && <div className="flex justify-center gap-4 py-4 border-t border-gray-800 rounded-t-2xl">
              {restaurant?.social_instagram && <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className="h-10 w-10 text-white cursor-pointer hover:text-white/80 transition-colors" onClick={() => handleSocialClick(restaurant.social_instagram)}>
                  <path fill="currentColor" d="M17.34 5.46a1.2 1.2 0 1 0 1.2 1.2a1.2 1.2 0 0 0-1.2-1.2m4.6 2.42a7.6 7.6 0 0 0-.46-2.43a4.9 4.9 0 0 0-1.16-1.77a4.7 4.7 0 0 0-1.77-1.15a7.3 7.3 0 0 0-2.43-.47C15.06 2 14.72 2 12 2s-3.06 0-4.12.06a7.3 7.3 0 0 0-2.43.47a4.8 4.8 0 0 0-1.77 1.15a4.7 4.7 0 0 0-1.15 1.77a7.3 7.3 0 0 0-.47 2.43C2 8.94 2 9.28 2 12s0 3.06.06 4.12a7.3 7.3 0 0 0 .47 2.43a4.7 4.7 0 0 0 1.15 1.77a4.8 4.8 0 0 0 1.77 1.15a7.3 7.3 0 0 0 2.43.47C8.94 22 9.28 22 12 22s3.06 0 4.12-.06a7.3 7.3 0 0 0 2.43-.47a4.7 4.7 0 0 0 1.77-1.15a4.85 4.85 0 0 0 1.16-1.77a7.6 7.6 0 0 0 .46-2.43c0-1.06.06-1.4.06-4.12s0-3.06-.06-4.12M20.14 16a5.6 5.6 0 0 1-.34 1.86a3.06 3.06 0 0 1-.75 1.15a3.2 3.2 0 0 1-1.15.75a5.6 5.6 0 0 1-1.86.34c-1 .05-1.37.06-4 .06s-3 0-4-.06a5.7 5.7 0 0 1-1.94-.3a3.3 3.3 0 0 1-1.1-.75a3 3 0 0 1-.74-1.15a5.5 5.5 0 0 1-.4-1.9c0-1-.06-1.37-.06-4s0-3 .06-4a5.5 5.5 0 0 1 .35-1.9A3 3 0 0 1 5 5a3.1 3.1 0 0 1 1.1-.8A5.7 5.7 0 0 1 8 3.86c1 0 1.37-.06 4-.06s3 0 4 .06a5.6 5.6 0 0 1 1.86.34a3.06 3.06 0 0 1 1.19.8a3.1 3.1 0 0 1 .75 1.1a5.6 5.6 0 0 1 .34 1.9c.05 1 .06 1.37.06 4s-.01 3-.06 4M12 6.87A5.13 5.13 0 1 0 17.14 12A5.12 5.12 0 0 0 12 6.87m0 8.46A3.33 3.33 0 1 1 15.33 12A3.33 3.33 0 0 1 12 15.33" />
                </svg>}
              
              {restaurant?.social_facebook && <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className="h-10 w-10 text-white cursor-pointer hover:text-white/80 transition-colors" onClick={() => handleSocialClick(restaurant.social_facebook)}>
                  <path fill="currentColor" fillRule="evenodd" d="M12 3.8a8.25 8.25 0 0 0-2.096 16.232v-4.607H8.762a1.2 1.2 0 0 1-1.199-1.199v-1.701a1.2 1.2 0 0 1 1.199-1.199h1.114c-.013-.347-.039-.696-.039-1.043c0-.889.15-2.658 1.553-3.662c.435-.31.844-.516 1.294-.637c.441-.117.883-.143 1.355-.143c.834 0 1.411.083 1.778.136l.165.023a.93.93 0 0 1 .806.92v1.883a.93.93 0 0 1-.97.93c-.153.006-.675.026-1.126.026c-.31 0-.402.071-.434.106c-.045.048-.162.224-.162.764v.697h1.273a1.2 1.2 0 0 1 1.184 1.39l-.259 1.707a1.2 1.2 0 0 1-1.182 1.002h-1.016v4.607A8.25 8.25 0 0 0 12 3.8m-9.75 8.25C2.25 6.665 6.615 2.3 12 2.3s9.75 4.365 9.75 9.75c0 4.89-3.599 8.938-8.293 9.642a.75.75 0 0 1-.86-.742v-6.275a.75.75 0 0 1 .75-.75h1.506l.166-1.099h-1.673a.75.75 0 0 1-.75-.75V10.63c0-.705.145-1.339.567-1.79c.435-.464 1.017-.58 1.53-.58c.196 0 .409-.004.595-.01v-.83a10 10 0 0 0-1.249-.078c-.427 0-.715.025-.967.093c-.243.064-.49.179-.809.407c-.747.535-.924 1.58-.926 2.428l.066 1.78a.75.75 0 0 1-.75.777h-1.59v1.099h1.59a.75.75 0 0 1 .75.75v6.275a.75.75 0 0 1-.86.742C5.849 20.988 2.25 16.94 2.25 12.05" clipRule="evenodd" />
                </svg>}
              
              {restaurant?.social_tiktok && <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className="h-10 w-10 text-white cursor-pointer hover:text-white/80 transition-colors" onClick={() => handleSocialClick(restaurant.social_tiktok)}>
                  <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20.2 10.1c0 .22-.18.401-.4.39a8 8 0 0 1-3.362-.93c-.281-.15-.638.045-.638.364V15.5a6 6 0 1 1-6.4-5.987a.38.38 0 0 1 .4.387v2.8c0 .22-.18.397-.398.433A2.4 2.4 0 1 0 12.2 15.5V2.9a.4.4 0 0 1 .4-.4h2.8a.43.43 0 0 1 .418.4a4.4 4.4 0 0 0 3.983 3.982c.22.02.4.197.4.418z" />
                </svg>}
              
              {restaurant?.social_whatsapp && <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className="h-10 w-10 text-white cursor-pointer hover:text-white/80 transition-colors" onClick={handleContactClick}>
                  <g fill="currentColor">
                    <path fillRule="evenodd" d="M12 4a8 8 0 0 0-6.895 12.06l.569.718l-.697 2.359l2.32-.648l.379.243A8 8 0 1 0 12 4M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10s-4.477 10-10 10a9.96 9.96 0 0 1-5.016-1.347l-4.948 1.382l1.426-4.829l-.006-.007l-.033-.055A9.96 9.96 0 0 1 2 12" clipRule="evenodd" />
                    <path d="M16.735 13.492c-.038-.018-1.497-.736-1.756-.83a1 1 0 0 0-.34-.075c-.196 0-.362.098-.49.291c-.146.217-.587.732-.723.886c-.018.02-.042.045-.057.045c-.013 0-.239-.093-.307-.123c-1.564-.68-2.751-2.313-2.914-2.589c-.023-.04-.024-.057-.024-.057c.005-.021.058-.074.085-.101c.08-.079.166-.182.249-.283l.117-.14c.121-.14.175-.25.237-.375l.033-.066a.68.68 0 0 0-.02-.64c-.034-.069-.65-1.555-.715-1.711c-.158-.377-.366-.552-.655-.552c-.027 0 0 0-.112.005c-.137.005-.883.104-1.213.311c-.35.22-.94.924-.94 2.16c0 1.112.705 2.162 1.008 2.561l.041.06c1.161 1.695 2.608 2.951 4.074 3.537c1.412.564 2.081.63 2.461.63c.16 0 .288-.013.4-.024l.072-.007c.488-.043 1.56-.599 1.804-1.276c.192-.534.243-1.117.115-1.329c-.088-.144-.239-.216-.43-.308" />
                  </g>
                </svg>}
            </div>}
          
          <div className="p-6 border-t border-gray-800 rounded-2xl">
            {isAuthenticated ? <button className="w-full py-2 px-4 rounded-lg bg-red-600 hover:bg-red-700 text-white" onClick={handleSignOut}>
                Sign Out
              </button> : <button className="w-full py-2 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white" onClick={handleSignIn}>
                Sign In
              </button>}
          </div>
        </div>
      </SheetContent>
    </Sheet>;
};
