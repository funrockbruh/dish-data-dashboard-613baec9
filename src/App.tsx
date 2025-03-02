
import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Verify from "./pages/Verify";
import { RestaurantSetup } from "./components/RestaurantSetup";
import { CategorySetup } from "./components/CategorySetup";
import { MenuItemsList } from "./components/menu/MenuItemsList";
import { FeaturedItems } from "./components/menu/FeaturedItems";

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
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
