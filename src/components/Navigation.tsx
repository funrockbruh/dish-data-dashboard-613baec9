
import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export const Navigation = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [restaurantName, setRestaurantName] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setIsAuthenticated(!!data.session);
      
      if (data.session) {
        // Fetch restaurant profile
        const { data: profileData } = await supabase
          .from('restaurant_profiles')
          .select('restaurant_name')
          .eq('id', data.session.user.id)
          .single();
          
        if (profileData) {
          setRestaurantName(profileData.restaurant_name);
        }
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setIsAuthenticated(!!session);
      
      if (session) {
        // Fetch restaurant profile
        const { data: profileData } = await supabase
          .from('restaurant_profiles')
          .select('restaurant_name')
          .eq('id', session.user.id)
          .single();
          
        if (profileData) {
          setRestaurantName(profileData.restaurant_name);
        }
      } else {
        setRestaurantName(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
                DishData
              </span>
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
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                {restaurantName && (
                  <Link to="/menu" className="text-gray-800 hover:text-gray-900">
                    <span className="font-medium">{restaurantName}</span>
                  </Link>
                )}
                <Button 
                  variant="outline" 
                  className="text-red-500 hover:text-red-600 border-red-500 hover:border-red-600 hover:bg-red-50"
                  onClick={() => supabase.auth.signOut()}
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <Button className="bg-teal-500 hover:bg-teal-600 text-white">
                Get started
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
