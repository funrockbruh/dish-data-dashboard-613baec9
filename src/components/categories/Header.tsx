
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const Header = () => {
  return (
    <div className="flex items-center gap-4 mb-8">
      <Button variant="ghost" size="icon" className="rounded-full">
        <ArrowLeft className="h-6 w-6" />
      </Button>
      <div className="flex-1">
        <h1 className="text-2xl font-bold font-inter">Just Fajita</h1>
        <p className="text-gray-500 font-inter">by Kassem Zaiter</p>
      </div>
    </div>
  );
};
