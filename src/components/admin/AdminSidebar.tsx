
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  CreditCard, 
  FileText, 
  Home, 
  ShieldCheck, 
  Users 
} from "lucide-react";

export const AdminSidebar = () => {
  return (
    <div className="w-64 bg-gray-900 text-white h-screen flex flex-col">
      <div className="p-6 border-b border-gray-800">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <ShieldCheck className="h-6 w-6" />
          Admin Control
        </h2>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          <li>
            <Link to="/admin-panel">
              <Button variant="ghost" className="w-full justify-start text-white">
                <Home className="mr-2 h-5 w-5" />
                Dashboard
              </Button>
            </Link>
          </li>
          <li>
            <Link to="/admin-panel?tab=payments">
              <Button variant="ghost" className="w-full justify-start text-white">
                <CreditCard className="mr-2 h-5 w-5" />
                Payments
              </Button>
            </Link>
          </li>
          <li>
            <Link to="/admin-panel?tab=subscriptions">
              <Button variant="ghost" className="w-full justify-start text-white">
                <BarChart3 className="mr-2 h-5 w-5" />
                Subscriptions
              </Button>
            </Link>
          </li>
          <li>
            <Link to="/admin-panel?tab=users">
              <Button variant="ghost" className="w-full justify-start text-white">
                <Users className="mr-2 h-5 w-5" />
                Users
              </Button>
            </Link>
          </li>
          <li>
            <Link to="/admin-panel?tab=audit">
              <Button variant="ghost" className="w-full justify-start text-white">
                <FileText className="mr-2 h-5 w-5" />
                Audit Logs
              </Button>
            </Link>
          </li>
        </ul>
      </nav>
      
      <div className="p-4 border-t border-gray-800">
        <p className="text-xs text-gray-400">© 2023 DishData Admin</p>
      </div>
    </div>
  );
};
