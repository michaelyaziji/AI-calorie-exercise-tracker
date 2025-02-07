import { useQuery } from "@tanstack/react-query";
import { Progress } from "@/components/ui/progress";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import ProgressChart from "@/components/progress-chart";
import DailyRecommendations from "@/components/daily-recommendations";
import { Skeleton } from "@/components/ui/skeleton";
import type { User, Meal, Progress as ProgressType } from "@shared/schema";

export default function DashboardPage() {
  const { data: user, isLoading: isLoadingUser } = useQuery<User>({
    queryKey: ["/api/users/1"], // Hardcoded for demo
  });

  const { data: meals, isLoading: isLoadingMeals } = useQuery<Meal[]>({
    queryKey: ["/api/users/1/meals"],
  });

  const { data: progress, isLoading: isLoadingProgress } = useQuery<ProgressType[]>({
    queryKey: ["/api/users/1/progress"],
  });

  if (isLoadingUser || isLoadingMeals || isLoadingProgress) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[100px] w-full" />
        <Skeleton className="h-[300px] w-full" />
        <Skeleton className="h-[200px] w-full" />
      </div>
    );
  }

  if (!user || !meals || !progress) {
    return <div>Error loading data</div>;
  }

  // Filter today's meals
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todaysMeals = meals.filter(meal => {
    const mealDate = new Date(meal.timestamp);
    mealDate.setHours(0, 0, 0, 0);
    return mealDate.getTime() === today.getTime();
  });

  const weightProgress = ((user.weight - user.targetWeight) / (user.weight - user.targetWeight)) * 100;

  return (
    <div className="space-y-6 pb-16">
      <Card>
        <CardHeader>
          <CardTitle>Weight Goal Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Current: {user.weight}kg</span>
              <span>Target: {user.targetWeight}kg</span>
            </div>
            <Progress value={weightProgress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      <DailyRecommendations user={user} todaysMeals={todaysMeals} />

      {progress.length > 0 && (
        <ProgressChart data={progress} />
      )}

      {meals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Latest Meal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{meals[meals.length - 1].protein}g</div>
                <div className="text-sm text-muted-foreground">Protein</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{meals[meals.length - 1].carbs}g</div>
                <div className="text-sm text-muted-foreground">Carbs</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{meals[meals.length - 1].fat}g</div>
                <div className="text-sm text-muted-foreground">Fat</div>
              </div>
            </div>
            <div className="mt-4 text-center">
              <div className="text-3xl font-bold">{meals[meals.length - 1].calories}</div>
              <div className="text-sm text-muted-foreground">Calories</div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}