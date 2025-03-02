
import React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card } from "./ui/card";
import Autoplay from "embla-carousel-autoplay";

const qrCodeItems = [
  {
    title: "Pancake QR",
    description: "Sweet & Scannable",
    color: "from-amber-400 to-yellow-500",
    pattern: "bg-[url('/lovable-uploads/bbe9ac98-0871-4b41-868a-dcce6b495e43.png')] bg-cover bg-center",
  },
  {
    title: "Coffee QR",
    description: "Latte Art Style",
    color: "from-brown-500 to-amber-700",
    pattern: "bg-[radial-gradient(circle_at_center,rgba(141,85,36,0.5)_0%,rgba(141,85,36,0.2)_50%,transparent_100%)]",
  },
  {
    title: "Sushi Roll QR",
    description: "Japanese Inspired",
    color: "from-red-500 to-red-700",
    pattern: "bg-[linear-gradient(45deg,rgba(0,0,0,0.1)_25%,transparent_25%,transparent_75%,rgba(0,0,0,0.1)_75%)]",
  },
  {
    title: "Pizza QR",
    description: "Italian Style",
    color: "from-orange-400 to-red-500",
    pattern: "bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.2)_0%,transparent_70%)]",
  },
];

export const QRCodeCarousel = () => {
  // Create the autoplay plugin with type assertion to resolve the type conflict
  const autoplayPlugin = React.useRef(
    Autoplay({ delay: 2000, stopOnInteraction: true }) as any
  );

  return (
    <section className="py-20 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 overflow-hidden">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12 gradient-text">
          Delicious QR Code Styles
        </h2>
        <Carousel
          opts={{
            align: "center",
            loop: true,
          }}
          plugins={[autoplayPlugin.current]}
          className="w-full max-w-6xl mx-auto"
        >
          <CarouselContent className="-ml-2 md:-ml-4 [perspective:1500px] relative" 
            style={{
              transform: "rotateX(10deg)",
            }}>
            {qrCodeItems.map((item, index) => (
              <CarouselItem 
                key={index} 
                className="pl-2 md:pl-4 md:basis-1/3 lg:basis-1/4 transition-all duration-500"
                style={{
                  transform: `rotateY(${index * 15}deg) translateZ(100px) translateX(${index * 5}px)`,
                }}
              >
                <div className="p-1">
                  <Card className="glass-card p-4 h-[280px] flex flex-col items-center justify-center hover-lift group transform transition-all duration-300 hover:scale-105 hover:rotate-0">
                    <div className={`w-36 h-36 mb-4 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center relative overflow-hidden transition-transform group-hover:scale-105`}>
                      <div className={`absolute inset-0 ${item.pattern} opacity-70`}></div>
                      <div className="w-28 h-28 bg-white/90 rounded-lg flex items-center justify-center relative z-10">
                        <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-gray-700 to-gray-900">QR</span>
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold">{item.title}</h3>
                    <p className="text-muted-foreground text-xs">{item.description}</p>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex -left-12" />
          <CarouselNext className="hidden md:flex -right-12" />
        </Carousel>
      </div>
    </section>
  );
};
