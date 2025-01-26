import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card } from "./ui/card";

const qrCodeItems = [
  {
    title: "Basic Menu QR",
    description: "Perfect for small restaurants",
    color: "from-blue-500 to-purple-500",
  },
  {
    title: "Dynamic QR",
    description: "Updates in real-time",
    color: "from-teal-500 to-emerald-500",
  },
  {
    title: "Custom Branded QR",
    description: "With your logo and colors",
    color: "from-orange-500 to-red-500",
  },
  {
    title: "Multi-language QR",
    description: "Support multiple languages",
    color: "from-pink-500 to-rose-500",
  },
];

export const QRCodeCarousel = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12 gradient-text">
          Choose Your QR Code Style
        </h2>
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full max-w-5xl mx-auto"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {qrCodeItems.map((item, index) => (
              <CarouselItem key={index} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                <div className="p-1">
                  <Card className="glass-card p-6 h-[300px] flex flex-col items-center justify-center hover-lift">
                    <div className={`w-32 h-32 mb-6 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center`}>
                      <div className="w-24 h-24 bg-white/90 rounded-lg flex items-center justify-center">
                        <span className="text-4xl">QR</span>
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                    <p className="text-muted-foreground text-center">{item.description}</p>
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