import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { Pricing } from "@/components/Pricing";
import { Footer } from "@/components/Footer";
import { Navigation } from "@/components/Navigation";
import { QRCodeCarousel } from "@/components/QRCodeCarousel";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <Hero />
      <Features />
      <QRCodeCarousel />
      <Pricing />
      <Footer />
    </div>
  );
};

export default Index;