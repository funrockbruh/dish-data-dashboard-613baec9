
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { Pricing } from "@/components/Pricing";
import { Footer } from "@/components/Footer";
import { Navigation } from "@/components/Navigation";
import { QRCodeSection } from "@/components/QRCodeSection";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <Hero />
      <Features />
      <QRCodeSection />
      <Pricing />
      <Footer />
    </div>
  );
};

export default Index;
