import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Timer, Dumbbell, Pencil } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertExerciseSchema } from "@shared/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type ExerciseType = "run" | "weightlifting" | "custom";
type IntensityLevel = "high" | "medium" | "low";

export default function ExerciseLogPage() {
  const [selectedType, setSelectedType] = useState<ExerciseType | null>(null);
  const [intensity, setIntensity] = useState<IntensityLevel>("medium");
  const [duration, setDuration] = useState(15);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(insertExerciseSchema),
    defaultValues: {
      userId: 1, // Hardcoded for demo
      type: "",
      intensity: "medium",
      duration: 15,
      description: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('/api/exercises', 'POST', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/exercises"] });
      toast({
        title: "Exercise logged successfully!",
        description: "Your workout has been recorded.",
      });
      setSelectedType(null);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to log exercise",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    if (selectedType === "custom") {
      mutation.mutate(data);
    } else {
      mutation.mutate({
        userId: 1, // Hardcoded for demo
        type: selectedType,
        intensity,
        duration,
        description: `${selectedType} workout for ${duration} minutes at ${intensity} intensity`,
      });
    }
  };

  const renderExerciseTypeSelection = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Button
        variant="outline"
        className="h-32 flex flex-col gap-2"
        onClick={() => setSelectedType("run")}
      >
        <Timer className="h-8 w-8" />
        <span>Run</span>
        <span className="text-xs text-muted-foreground">Running, jogging, sprinting, etc.</span>
      </Button>

      <Button
        variant="outline"
        className="h-32 flex flex-col gap-2"
        onClick={() => setSelectedType("weightlifting")}
      >
        <Dumbbell className="h-8 w-8" />
        <span>Weight lifting</span>
        <span className="text-xs text-muted-foreground">Machines, free weights, etc.</span>
      </Button>

      <Button
        variant="outline"
        className="h-32 flex flex-col gap-2"
        onClick={() => setSelectedType("custom")}
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
              form.setValue("intensity", level);
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
            variant={duration === mins ? "default" : "outline"}
            onClick={() => {
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
        <Button type="submit" className="w-full">
          Add Exercise
        </Button>
      </form>
    </Card>
  );

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Log Exercise</h1>

      {!selectedType && renderExerciseTypeSelection()}

      {selectedType && selectedType !== "custom" && (
        <div className="space-y-6">
          {renderIntensitySelection()}
          {renderDurationSelection()}
          <Button 
            onClick={form.handleSubmit(onSubmit)} 
            className="w-full"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Saving..." : "Add Exercise"}
          </Button>
        </div>
      )}

      {selectedType === "custom" && renderCustomExercise()}
    </div>
  );
}