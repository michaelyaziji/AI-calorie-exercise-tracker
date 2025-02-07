import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
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

  // Helper function to check if a goal is met (between 90-110% of target)
  const isGoalMet = (progress: number) => progress >= 90 && progress <= 110;

  const ProgressWithAnimation = ({ value, total, label }: { value: number, total: number, label: string }) => {
    const progress = (value / total) * 100;
    const goalMet = isGoalMet(progress);

    return (
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>{label}</span>
          <div className="flex items-center gap-2">
            <span>{Math.round(value)} / {total}{label === "Calories" ? "" : "g"}</span>
            <AnimatePresence>
              {goalMet && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="text-yellow-500"
                >
                  <Sparkles className="w-4 h-4" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        <div className="relative h-2">
          <Progress
            value={Math.min(100, progress)}
            className={`h-2 ${goalMet ? 'bg-primary/20' : 'bg-muted'}`}
          />
          {goalMet && (
            <motion.div
              className="absolute inset-0 bg-primary/30 rounded-full"
              animate={{ opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Recommendation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="grid grid-cols-2 gap-4">
          <ProgressWithAnimation
            value={dailyTotals.calories}
            total={user.dailyCalories}
            label="Calories"
          />
          <ProgressWithAnimation
            value={dailyTotals.carbs}
            total={user.dailyCarbs}
            label="Carbs"
          />
          <ProgressWithAnimation
            value={dailyTotals.protein}
            total={user.dailyProtein}
            label="Protein"
          />
          <ProgressWithAnimation
            value={dailyTotals.fat}
            total={user.dailyFat}
            label="Fats"
          />
        </div>

        <motion.div
          className="flex items-center gap-4 p-4 bg-muted rounded-lg"
          animate={healthScore >= 7 ? {
            scale: [1, 1.02, 1],
            transition: { duration: 1, repeat: Infinity }
          } : {}}
        >
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-2xl font-bold text-primary">{healthScore}</span>
          </div>
          <div>
            <div className="font-semibold">Health Score</div>
            <div className="text-sm text-muted-foreground">Based on daily targets</div>
          </div>
          <AnimatePresence>
            {healthScore >= 7 && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                className="ml-auto"
              >
                <Sparkles className="w-6 h-6 text-yellow-500" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </CardContent>
    </Card>
  );
}