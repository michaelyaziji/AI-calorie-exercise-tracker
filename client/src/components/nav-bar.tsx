import { Link, useLocation } from "wouter";
import { Home, Camera, ChartLine, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

export default function NavBar() {
  const [location] = useLocation();
  const { logoutMutation } = useAuth();
  const { toast } = useToast();

  const isActive = (path: string) => location === path;

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      toast({
        title: "Logged out successfully",
        description: "See you next time!",
      });
    } catch (error) {
      toast({
        title: "Logout failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border h-16 px-4">
      <div className="container mx-auto h-full">
        <div className="flex justify-around items-center h-full">
          <Link href="/dashboard" className={`flex flex-col items-center ${isActive("/dashboard") ? "text-primary" : "text-muted-foreground"}`}>
            <Home className="h-6 w-6" />
            <span className="text-xs mt-1">Home</span>
          </Link>
          <Link href="/meal-log" className={`flex flex-col items-center ${isActive("/meal-log") ? "text-primary" : "text-muted-foreground"}`}>
            <Camera className="h-6 w-6" />
            <span className="text-xs mt-1">Log Meal</span>
          </Link>
          <Link href="/progress" className={`flex flex-col items-center ${isActive("/progress") ? "text-primary" : "text-muted-foreground"}`}>
            <ChartLine className="h-6 w-6" />
            <span className="text-xs mt-1">Progress</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex flex-col items-center text-muted-foreground hover:text-primary transition-colors"
            disabled={logoutMutation.isPending}
          >
            <LogOut className="h-6 w-6" />
            <span className="text-xs mt-1">Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
