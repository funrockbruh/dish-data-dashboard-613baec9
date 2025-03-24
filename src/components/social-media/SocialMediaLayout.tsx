
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ReactNode } from "react";

interface SocialMediaLayoutProps {
  children: ReactNode;
  title?: string;
}

export const SocialMediaLayout = ({ 
  children, 
  title = "Social Media Links" 
}: SocialMediaLayoutProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="bg-white shadow-sm">
        <div className="max-w-xl mx-auto px-4 py-4 flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)}
            className="mr-3"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">{title}</h1>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 mt-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          {children}
        </div>
      </div>
    </div>
  );
};
