import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { User, Meal } from "@shared/schema";

interface DailyRecommendationsProps {
  user: User;
  todaysMeals: Meal[];
}

export default function DailyRecommendations({ user, todaysMeals }: DailyRecommendationsProps) {
  // Calculate daily totals from meals
  const dailyTotals = todaysMeals.reduce(
    (acc, meal) => ({
      calories: acc.calories + meal.calories,
      protein: acc.protein + meal.protein,
      carbs: acc.carbs + meal.carbs,
      fat: acc.fat + meal.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  // Calculate progress percentages
  const caloriesProgress = (dailyTotals.calories / user.dailyCalories) * 100;
  const proteinProgress = (dailyTotals.protein / user.dailyProtein) * 100;
  const carbsProgress = (dailyTotals.carbs / user.dailyCarbs) * 100;
  const fatProgress = (dailyTotals.fat / user.dailyFat) * 100;

  // Calculate health score (1-10) based on how close we are to targets
  const calculateHealthScore = () => {
    const scores = [
      Math.min(100, caloriesProgress) / 100,
      Math.min(100, proteinProgress) / 100,
      Math.min(100, carbsProgress) / 100,
      Math.min(100, fatProgress) / 100,
    ];
    const avgScore = scores.reduce((a, b) => a + b) / scores.length;
    return Math.round(avgScore * 10);
  };

  const healthScore = calculateHealthScore();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Recommendation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Calories</span>
              <span>{dailyTotals.calories} / {user.dailyCalories}</span>
            </div>
            <Progress value={Math.min(100, caloriesProgress)} className="h-2" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Carbs</span>
              <span>{Math.round(dailyTotals.carbs)}g / {user.dailyCarbs}g</span>
            </div>
            <Progress value={Math.min(100, carbsProgress)} className="h-2" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Protein</span>
              <span>{Math.round(dailyTotals.protein)}g / {user.dailyProtein}g</span>
            </div>
            <Progress value={Math.min(100, proteinProgress)} className="h-2" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Fats</span>
              <span>{Math.round(dailyTotals.fat)}g / {user.dailyFat}g</span>
            </div>
            <Progress value={Math.min(100, fatProgress)} className="h-2" />
          </div>
        </div>

        <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-2xl font-bold text-primary">{healthScore}</span>
          </div>
          <div>
            <div className="font-semibold">Health Score</div>
            <div className="text-sm text-muted-foreground">Based on daily targets</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
