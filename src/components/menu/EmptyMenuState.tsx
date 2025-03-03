
import { Info, PlusCircle, ArrowRight, Utensils } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface EmptyMenuStateProps {
  restaurantId: string;
  restaurantName: string;
  debugInfo?: any;
}

export const EmptyMenuState = ({ restaurantId, restaurantName, debugInfo }: EmptyMenuStateProps) => {
  return (
    <div className="space-y-6">
      <Card className="p-4 bg-gray-800 rounded-lg mb-4">
        <CardContent className="pt-4">
          <div className="flex items-start gap-2 mb-3">
            <Info className="h-5 w-5 text-yellow-400 mt-0.5 flex-shrink-0" />
            <h3 className="text-yellow-400 font-bold">No Menu Available</h3>
          </div>
          <p className="text-gray-200">
            {restaurantName} hasn't added any menu items or categories yet.
          </p>
          
          {debugInfo && (
            <div className="mt-6 pt-4 border-t border-gray-700">
              <details className="text-sm">
                <summary className="text-gray-400 cursor-pointer mb-2">Debug Information</summary>
                <div className="pl-3 text-gray-300 space-y-2 text-xs">
                  <p>Restaurant ID: {restaurantId}</p>
                  <div>
                    <p className="font-semibold mt-2">Categories Response:</p>
                    <p className="text-gray-400">
                      {debugInfo.categoriesResponse?.data ? 
                        `Found ${debugInfo.categoriesResponse.data.length} categories` : 
                        'No categories found'}
                    </p>
                  </div>
                  
                  <div>
                    <p className="font-semibold mt-2">Menu Items Response:</p>
                    <p className="text-gray-400">
                      {debugInfo.itemsResponse?.data ? 
                        `Found ${debugInfo.itemsResponse.data.length} menu items` : 
                        'No menu items found'}
                    </p>
                  </div>
                </div>
              </details>
            </div>
          )}
        </CardContent>
      </Card>
      
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
    </div>
  );
};
