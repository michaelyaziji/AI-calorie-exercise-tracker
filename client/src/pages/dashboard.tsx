import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Progress } from "@/components/ui/progress";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import ProgressChart from "@/components/progress-chart";
import DailyRecommendations from "@/components/daily-recommendations";
import DateSelector from "@/components/date-selector";
import { Skeleton } from "@/components/ui/skeleton";
import type { User, Meal, Progress as ProgressType, Exercise } from "@shared/schema";
import { format, isSameDay } from "date-fns";

export default function DashboardPage() {
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });

  const { data: user, isLoading: isLoadingUser } = useQuery<User>({
    queryKey: ["/api/users/me"],
  });

  const { data: meals, isLoading: isLoadingMeals } = useQuery<Meal[]>({
    queryKey: ["/api/meals"],
  });

  const { data: exercises, isLoading: isLoadingExercises } = useQuery<Exercise[]>({
    queryKey: ["/api/exercises"],
  });

  const { data: progress, isLoading: isLoadingProgress } = useQuery<ProgressType[]>({
    queryKey: ["/api/progress"],
  });

  if (isLoadingUser || isLoadingMeals || isLoadingProgress || isLoadingExercises) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[100px] w-full" />
        <Skeleton className="h-[300px] w-full" />
        <Skeleton className="h-[200px] w-full" />
      </div>
    );
  }

  if (!user || !meals || !progress || !exercises) {
    return <div>Error loading data</div>;
  }

  // Filter data for selected date
  const selectedMeals = meals.filter(meal => {
    const mealDate = new Date(meal.timestamp);
    mealDate.setHours(0, 0, 0, 0);
    return isSameDay(mealDate, selectedDate);
  });

  const selectedExercises = exercises.filter(exercise => {
    const exerciseDate = new Date(exercise.timestamp);
    exerciseDate.setHours(0, 0, 0, 0);
    return isSameDay(exerciseDate, selectedDate);
  });

  const weightProgress = ((user.weight - user.targetWeight) / (user.weight - user.targetWeight)) * 100;

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
              <span>Current: {user.weight}kg</span>
              <span>Target: {user.targetWeight}kg</span>
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
        {meals.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Latest Meals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedMeals.map((meal) => (
                <div key={meal.id} className="flex gap-4 border-b pb-4 last:border-0 last:pb-0">
                  <img
                    src={meal.imageUrl}
                    alt="Meal"
                    className="w-24 h-24 rounded-lg object-cover"
                  />
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

        {exercises.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Exercises</CardTitle>
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