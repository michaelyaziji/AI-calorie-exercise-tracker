import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import MealCamera from "@/components/meal-camera";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import type { Meal } from "@shared/schema";

export default function MealLogPage() {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const analyzeMeal = useMutation({
    mutationFn: async (imageBase64: string) => {
      const res = await apiRequest("POST", "/api/meals", {
        imageBase64,
        userId: 1, // Hardcoded for demo
      });
      return res.json() as Promise<Meal>;
    },
    onSuccess: () => {
      toast({
        title: "Meal logged successfully",
        description: "Your meal has been analyzed and saved.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/users/1/meals"] });
      navigate("/dashboard");
    },
    onError: (error) => {
      toast({
        title: "Error logging meal",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCapture = (imageBase64: string) => {
    setCapturedImage(imageBase64);
  };

  const handleAnalyze = () => {
    if (capturedImage) {
      analyzeMeal.mutate(capturedImage);
    }
  };

  return (
    <div className="space-y-4 pb-16">
      <h1 className="text-2xl font-bold">Log Your Meal</h1>

      {!capturedImage ? (
        <MealCamera onCapture={handleCapture} />
      ) : (
        <Card>
          <CardContent className="pt-6">
            <img
              src={`data:image/jpeg;base64,${capturedImage}`}
              alt="Captured meal"
              className="w-full rounded-lg"
            />
            <div className="flex justify-between mt-4">
              <Button variant="outline" onClick={() => setCapturedImage(null)}>
                Retake
              </Button>
              <Button
                onClick={handleAnalyze}
                disabled={analyzeMeal.isPending}
              >
                {analyzeMeal.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  "Analyze Meal"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <p className="text-center text-sm text-muted-foreground">
        Take a photo of your meal and our AI will analyze its nutritional content
      </p>
    </div>
  );
}