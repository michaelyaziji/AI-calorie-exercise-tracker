import { useState } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Timer, Dumbbell, Pencil, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertExerciseSchema } from "@shared/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Exercise } from "@shared/schema";
import { z } from "zod";

// Map frontend exercise types to backend types
const exerciseTypeMap = {
  run: "cardio",
  weightlifting: "strength",
  custom: "other",
} as const;

type ExerciseType = keyof typeof exerciseTypeMap;
type IntensityLevel = "high" | "medium" | "low";
type ExerciseFormData = z.infer<typeof insertExerciseSchema>;

export default function ExerciseLogPage() {
  const [selectedType, setSelectedType] = useState<ExerciseType | null>(null);
  const [intensity, setIntensity] = useState<IntensityLevel>("medium");
  const [duration, setDuration] = useState(15);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();

  const form = useForm<ExerciseFormData>({
    resolver: zodResolver(insertExerciseSchema),
    defaultValues: {
      userId: 1, // Hardcoded for demo
      type: "other",
      intensity: "medium",
      duration: 15,
      description: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: ExerciseFormData) => {
      const response = await apiRequest("POST", '/api/exercises', data);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to log exercise");
      }
      return response.json() as Promise<Exercise>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users/1/exercises"] });
      toast({
        title: "Exercise logged successfully!",
        description: "Your workout has been recorded.",
      });
      navigate("/dashboard");
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to log exercise",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ExerciseFormData) => {
    const exerciseData = {
      ...data,
      userId: 1, // Hardcoded for demo
      type: selectedType ? exerciseTypeMap[selectedType] : "other",
    };

    console.log("Submitting exercise data:", exerciseData);
    mutation.mutate(exerciseData);
  };

  const renderExerciseTypeSelection = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Button
        variant="outline"
        className="h-32 flex flex-col gap-2"
        onClick={() => {
          setSelectedType("run");
          form.setValue("type", "cardio");
        }}
      >
        <Timer className="h-8 w-8" />
        <span>Run</span>
        <span className="text-xs text-muted-foreground">Running, jogging, sprinting, etc.</span>
      </Button>

      <Button
        variant="outline"
        className="h-32 flex flex-col gap-2"
        onClick={() => {
          setSelectedType("weightlifting");
          form.setValue("type", "strength");
        }}
      >
        <Dumbbell className="h-8 w-8" />
        <span>Weight lifting</span>
        <span className="text-xs text-muted-foreground">Machines, free weights, etc.</span>
      </Button>

      <Button
        variant="outline"
        className="h-32 flex flex-col gap-2"
        onClick={() => {
          setSelectedType("custom");
          form.setValue("type", "other");
        }}
      >
        <Pencil className="h-8 w-8" />
        <span>Describe</span>
        <span className="text-xs text-muted-foreground">Write your workout in text</span>
      </Button>
    </div>
  );

  const renderIntensitySelection = () => (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4">Set intensity</h2>
      <div className="space-y-2">
        {["high", "medium", "low"].map((level) => (
          <div
            key={level}
            className={`p-4 rounded-lg cursor-pointer ${
              intensity === level ? "bg-primary/10" : "bg-muted"
            }`}
            onClick={() => {
              setIntensity(level as IntensityLevel);
              form.setValue("intensity", level as IntensityLevel);
            }}
          >
            <div className="font-medium capitalize">{level}</div>
            <div className="text-sm text-muted-foreground">
              {level === "high" && "Training to failure, breathing heavily"}
              {level === "medium" && "Breaking a sweat, many reps"}
              {level === "low" && "Not breaking a sweat, giving little effort"}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );

  const renderDurationSelection = () => (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4">Duration</h2>
      <div className="flex gap-2">
        {[15, 30, 60, 90].map((mins) => (
          <Button
            key={mins}
            type="button"
            variant={duration === mins ? "default" : "outline"}
            onClick={(e) => {
              e.preventDefault();
              setDuration(mins);
              form.setValue("duration", mins);
            }}
          >
            {mins} mins
          </Button>
        ))}
      </div>
    </Card>
  );

  const renderCustomExercise = () => (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4">Describe Exercise</h2>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <Input
          placeholder="Describe workout time, intensity, etc..."
          {...form.register("description")}
        />
        <div className="text-sm text-muted-foreground">
          Example: Pilates for 50 mins, core and flexibility improved
        </div>
        <Button 
          type="submit" 
          className="w-full"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Add Exercise"
          )}
        </Button>
      </form>
    </Card>
  );

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 pb-32">
      <h1 className="text-2xl font-bold">Log Exercise</h1>

      {!selectedType && renderExerciseTypeSelection()}

      {selectedType && selectedType !== "custom" && (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {renderIntensitySelection()}
          {renderDurationSelection()}
          <Button 
            type="submit" 
            className="w-full sticky bottom-20 mt-6"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Add Exercise"
            )}
          </Button>
        </form>
      )}

      {selectedType === "custom" && renderCustomExercise()}
    </div>
  );
}