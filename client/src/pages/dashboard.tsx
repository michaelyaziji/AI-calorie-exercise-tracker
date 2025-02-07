import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Progress } from "@/components/ui/progress";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ProgressChart from "@/components/progress-chart";
import DailyRecommendations from "@/components/daily-recommendations";
import DateSelector from "@/components/date-selector";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";
import type { Meal, Progress as ProgressType, Exercise } from "@shared/schema";
import { format, isSameDay } from "date-fns";
import { useAuth } from "@/hooks/use-auth";

export default function DashboardPage() {
  const [, navigate] = useLocation();
  const { user } = useAuth();

  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });

  const { data: meals = [], isLoading: isLoadingMeals } = useQuery<Meal[]>({
    queryKey: ["/api/meals"],
    enabled: !!user,
  });

  const { data: exercises = [], isLoading: isLoadingExercises } = useQuery<Exercise[]>({
    queryKey: ["/api/exercises"],
    enabled: !!user,
  });

  const { data: progress = [], isLoading: isLoadingProgress } = useQuery<ProgressType[]>({
    queryKey: ["/api/progress"],
    enabled: !!user,
  });

  // Show loading state
  if (isLoadingMeals || isLoadingProgress || isLoadingExercises) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Loader2 className="h-8 w-8 animate-spin mb-4" />
        <p className="text-muted-foreground">Loading your data...</p>
      </div>
    );
  }

  // Filter data for selected date
  const selectedMeals = meals.filter(meal => {
    const mealDate = new Date(meal.timestamp);
    return isSameDay(mealDate, selectedDate);
  });

  const selectedExercises = exercises.filter(exercise => {
    const exerciseDate = new Date(exercise.timestamp);
    return isSameDay(exerciseDate, selectedDate);
  });

  const weightProgress = user?.targetWeight
    ? Math.max(0, Math.min(100, ((user.weight - user.targetWeight) / (user.targetWeight - user.weight)) * 100))
    : 0;

  return (
    <div className="space-y-6 pb-16">
      <DateSelector
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
      />

      <Card>
        <CardHeader>
          <CardTitle>Weight Goal Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Current: {user?.weight}kg</span>
              <span>Target: {user?.targetWeight}kg</span>
            </div>
            <Progress value={weightProgress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      <DailyRecommendations user={user} todaysMeals={selectedMeals} />

      {progress.length > 0 && (
        <ProgressChart data={progress} />
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {selectedMeals.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Today's Meals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedMeals.map((meal) => (
                <div key={meal.id} className="flex gap-4 border-b pb-4 last:border-0 last:pb-0">
                  {meal.imageUrl && (
                    <img
                      src={meal.imageUrl}
                      alt="Meal"
                      className="w-24 h-24 rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(meal.timestamp), "h:mm a")}
                    </div>
                    <div className="grid grid-cols-4 gap-2 mt-2 text-center">
                      <div>
                        <div className="text-lg font-bold">{meal.calories}</div>
                        <div className="text-xs text-muted-foreground">cal</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold">{meal.protein}g</div>
                        <div className="text-xs text-muted-foreground">protein</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold">{meal.carbs}g</div>
                        <div className="text-xs text-muted-foreground">carbs</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold">{meal.fat}g</div>
                        <div className="text-xs text-muted-foreground">fat</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {selectedExercises.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Today's Exercises</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedExercises.map((exercise) => (
                <div key={exercise.id} className="border-b pb-4 last:border-0 last:pb-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium capitalize">{exercise.type}</div>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(exercise.timestamp), "h:mm a")}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{exercise.duration} mins</div>
                      <div className="text-xs text-muted-foreground capitalize">
                        {exercise.intensity} intensity
                      </div>
                    </div>
                  </div>
                  {exercise.description && (
                    <div className="mt-2 text-sm text-muted-foreground">
                      {exercise.description}
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}