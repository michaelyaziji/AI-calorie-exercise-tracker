import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dumbbell, UtensilsCrossed } from "lucide-react";

export function FloatingActionButton() {
  return (
    <div className="fixed bottom-20 right-4 z-50">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="icon"
            className="h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem asChild>
            <Link href="/meal-log" className="flex items-center gap-2 cursor-pointer">
              <UtensilsCrossed className="h-4 w-4" />
              <span>Log Meal</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/exercise-log" className="flex items-center gap-2 cursor-pointer">
              <Dumbbell className="h-4 w-4" />
              <span>Log Exercise</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
