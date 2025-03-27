
import { ArrowRight } from "lucide-react";

export const QRCodeSection = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 overflow-hidden">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-4xl font-bold mb-4 text-orange-500">
          Have a Unique QR Code
        </h2>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-12">
          Beautiful QR code that not only customers can Scan, but also Tap to open your Menu
        </p>

        <div className="flex flex-col md:flex-row justify-center items-center gap-6 md:gap-12 mb-8">
          <div className="w-full max-w-xs">
            <img
              src="/lovable-uploads/d3b635b6-24d8-475e-af61-c4d5b602c28a.png"
              alt="Simple QR code example"
              className="w-full rounded-xl shadow-lg"
            />
          </div>

          <div className="text-xl font-semibold text-orange-500">
            To
          </div>

          <div className="w-full max-w-xs">
            <img
              src="/lovable-uploads/d7a41966-125f-4378-a8c8-6b7b5af61311.png"
              alt="Special QR code example"
              className="w-full rounded-xl shadow-lg"
            />
          </div>
        </div>

        <h2 className="text-3xl font-bold mb-8 flex justify-center items-center gap-6 text-orange-500">
          <span>Simple</span>
          <span>To</span>
          <span>Special</span>
        </h2>

        <div className="relative h-24 flex justify-center items-center">
          <ArrowRight className="h-24 w-24 text-orange-400 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:block" style={{ 
            transform: "translateX(-50%) translateY(-50%) rotate(30deg) scale(3)",
            stroke: "#f97316",
            strokeWidth: 3
          }} />
          <div className="w-32 h-12 transform rotate-12 bg-orange-400 rounded-full absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 block md:hidden" style={{
            clipPath: "polygon(0 0, 100% 0, 80% 100%, 0% 100%)"
          }}></div>
          <div className="w-6 h-6 transform rotate-45 bg-orange-400 absolute left-[70%] top-[30%] block md:hidden"></div>
        </div>
      </div>
    </section>
  );
};
