
import { Utensils, ArrowRight, PlusCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const MenuCreationCard = () => {
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <Card className="bg-gray-900 border border-gray-800 w-full max-w-md overflow-hidden">
        <div className="p-6 text-center">
          <Utensils className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold mb-2">Ready to create your menu?</h3>
          <p className="text-gray-400 mb-6">
            If you own this restaurant, log in to add your menu items, categories and featured dishes.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Button variant="outline" className="border-gray-700 hover:bg-gray-800" asChild>
              <Link to="/">
                Return to Homepage <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button className="bg-green-600 hover:bg-green-500" asChild>
              <Link to="/menu">
                <PlusCircle className="mr-2 h-4 w-4" /> Create Menu
              </Link>
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
