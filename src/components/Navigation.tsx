import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { CountdownTimer } from "@/components/payment/CountdownTimer";
import { RenewalPopup } from "@/components/payment/RenewalPopup";
import { ImageWithSkeleton } from "./ui/image-with-skeleton";
export const Navigation = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [restaurantName, setRestaurantName] = useState<string | null>(null);
  const [subdomain, setSubdomain] = useState<string | null>(null);
  const [renewalDate, setRenewalDate] = useState<Date | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  useEffect(() => {
    const checkAuth = async () => {
      const {
        data
      } = await supabase.auth.getSession();
      setIsAuthenticated(!!data.session);
      if (data.session) {
        setUserId(data.session.user.id);

        // Fetch restaurant profile
        const {
          data: profileData
        } = await supabase.from('restaurant_profiles').select('restaurant_name, subdomain').eq('id', data.session.user.id).single();
        if (profileData) {
          setRestaurantName(profileData.restaurant_name);
          setSubdomain(profileData.subdomain);
        }

        // Fetch renewal date
        const {
          data: payments
        } = await supabase.from("payments").select("*").eq("user_id", data.session.user.id).eq("status", "verified").order("created_at", {
          ascending: false
        }).limit(1);
        if (payments && payments.length > 0) {
          const verificationDate = new Date(payments[0].updated_at || payments[0].created_at);
          // Set expiry to 2 minutes after verification
          const expiryDate = new Date(verificationDate);
          expiryDate.setMinutes(expiryDate.getMinutes() + 2);
          setRenewalDate(expiryDate);
        }
      }
    };
    checkAuth();
    const {
      data: {
        subscription
      }
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setIsAuthenticated(!!session);
      if (session) {
        setUserId(session.user.id);

        // Fetch restaurant profile
        const {
          data: profileData
        } = await supabase.from('restaurant_profiles').select('restaurant_name, subdomain').eq('id', session.user.id).single();
        if (profileData) {
          setRestaurantName(profileData.restaurant_name);
          setSubdomain(profileData.subdomain);
        }

        // Fetch renewal date
        const {
          data: payments
        } = await supabase.from("payments").select("*").eq("user_id", session.user.id).eq("status", "verified").order("created_at", {
          ascending: false
        }).limit(1);
        if (payments && payments.length > 0) {
          const verificationDate = new Date(payments[0].updated_at || payments[0].created_at);
          // Set expiry to 2 minutes after verification
          const expiryDate = new Date(verificationDate);
          expiryDate.setMinutes(expiryDate.getMinutes() + 2);
          setRenewalDate(expiryDate);
        }
      } else {
        setRestaurantName(null);
        setSubdomain(null);
        setRenewalDate(null);
        setUserId(null);
      }
    });
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  return <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and brand */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-2">
                <img src="/lovable-uploads/a3769547-5e65-4658-a5f7-7e2784808bd8.png" alt="Logo" className="h-[100px] w-auto mt-[-6px]" />
              </Link>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-8">
              <Link to="/" className="text-gray-600 hover:text-gray-900 transition-colors">
                Personal
              </Link>
              <Link to="/benefits" className="text-gray-600 hover:text-gray-900 transition-colors">
                Benefits
              </Link>
              <Link to="/features" className="text-gray-600 hover:text-gray-900 transition-colors">
                Features
              </Link>
              <Link to="/about" className="text-gray-600 hover:text-gray-900 transition-colors">
                About us
              </Link>
              <Link to="/help" className="text-gray-600 hover:text-gray-900 transition-colors">
                Help
              </Link>
            </div>

            {/* CTA Button or Account Link */}
            <div>
              {isAuthenticated ? <div className="flex items-center gap-3">
                  {restaurantName && <div className="flex items-center">
                      <Link to="/menu" className="text-gray-800 hover:text-gray-900">
                        <span className="font-medium">{restaurantName}</span>
                      </Link>
                      {renewalDate && <Link to="/payment/manage">
                          <CountdownTimer expiryDate={renewalDate} />
                        </Link>}
                    </div>}
                  <Button variant="outline" className="text-red-500 hover:text-red-600 border-red-500 hover:border-red-600 hover:bg-red-50" onClick={() => supabase.auth.signOut()}>
                    Sign Out
                  </Button>
                </div> : <Button className="bg-teal-500 hover:bg-teal-600 text-white">
                  Get started
                </Button>}
            </div>
          </div>
        </div>
      </nav>
      
      {/* Show renewal popup if user is authenticated, has restaurant name, and renewal date is set */}
      {isAuthenticated && restaurantName && renewalDate && userId && <RenewalPopup restaurantName={restaurantName} expiryDate={renewalDate} userId={userId} />}
    </>;
};