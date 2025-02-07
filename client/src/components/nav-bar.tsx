import { Link, useLocation } from "wouter";
import { Home, Camera, ChartLine } from "lucide-react";

export default function NavBar() {
  const [location] = useLocation();

  const isActive = (path: string) => location === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border h-16 px-4">
      <div className="container mx-auto h-full">
        <div className="flex justify-around items-center h-full">
          <Link href="/dashboard">
            <a className={`flex flex-col items-center ${isActive("/dashboard") ? "text-primary" : "text-muted-foreground"}`}>
              <Home className="h-6 w-6" />
              <span className="text-xs mt-1">Home</span>
            </a>
          </Link>
          <Link href="/meal-log">
            <a className={`flex flex-col items-center ${isActive("/meal-log") ? "text-primary" : "text-muted-foreground"}`}>
              <Camera className="h-6 w-6" />
              <span className="text-xs mt-1">Log Meal</span>
            </a>
          </Link>
          <Link href="/progress">
            <a className={`flex flex-col items-center ${isActive("/progress") ? "text-primary" : "text-muted-foreground"}`}>
              <ChartLine className="h-6 w-6" />
              <span className="text-xs mt-1">Progress</span>
            </a>
          </Link>
        </div>
      </div>
    </nav>
  );
}
