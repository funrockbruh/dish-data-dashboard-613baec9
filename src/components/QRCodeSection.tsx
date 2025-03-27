import { ArrowRight } from "lucide-react";
export const QRCodeSection = () => {
  return <section className="">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-4xl font-bold mb-4 text-orange-500">
          Have a Unique QR Code
        </h2>
        <p className="text-gray-600 max-w-3xl mx-auto mb-12 text-base">
          Beautiful QR code that not only customers can Scan, but also Tap to open your Menu
        </p>

        <div className="flex flex-col md:flex-row justify-center items-center gap-6 md:gap-12 mb-8">
          <div className="w-full max-w-xs">
            <img src="/lovable-uploads/d3b635b6-24d8-475e-af61-c4d5b602c28a.png" alt="Simple QR code example" className="w-full rounded-xl shadow-lg" />
          </div>

          

          <div className="w-full max-w-xs">
            <img src="/lovable-uploads/d7a41966-125f-4378-a8c8-6b7b5af61311.png" alt="Special QR code example" className="w-full rounded-xl shadow-lg" />
          </div>
        </div>

        <h2 className="text-3xl font-bold mb-8 flex justify-center items-center gap-6 text-orange-500">
          
          
          
        </h2>

        
      </div>
    </section>;
};