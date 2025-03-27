
import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Verify from "./pages/Verify";
import Settings from "./pages/Settings";
import Theme from "./pages/Theme";
import SocialMedia from "./pages/SocialMedia";
import { RestaurantSetup } from "./components/RestaurantSetup";
import { CategorySetup } from "./components/CategorySetup";
import { MenuItemsList } from "./components/menu/MenuItemsList";
import { FeaturedItems } from "./components/menu/FeaturedItems";
import PublicMenu from "./pages/PublicMenu";
import AdminPanel from "./pages/AdminPanel";
import AdminLogin from "./pages/AdminLogin";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/setup" element={<RestaurantSetup />} />
          <Route path="/categories" element={<CategorySetup />} />
          <Route path="/menu" element={<MenuItemsList />} />
          <Route path="/featured" element={<FeaturedItems />} />
          <Route path="/menu/:subdomain" element={<PublicMenu />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/theme" element={<Theme />} />
          <Route path="/social-media" element={<SocialMedia />} />
          <Route path="/admin-panel" element={<AdminPanel />} />
          <Route path="/admin-login" element={<AdminLogin />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
