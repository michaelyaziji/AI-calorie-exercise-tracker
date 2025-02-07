import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import MealCamera from "@/components/meal-camera";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Flame } from "lucide-react";
import type { Meal } from "@shared/schema";
import type { ProductInfo } from "@/lib/barcode-service";
import { format } from "date-fns";

export default function MealLogPage() {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [productInfo, setProductInfo] = useState<ProductInfo | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [timestamp] = useState(() => new Date());

  const analyzeMeal = useMutation({
    mutationFn: async (imageBase64: string) => {
      const res = await apiRequest("POST", "/api/meals", {
        imageBase64,
        userId: 1, // Hardcoded for demo
        ...(productInfo && {
          calories: productInfo.calories,
          protein: productInfo.protein,
          carbs: productInfo.carbs,
          fat: productInfo.fat,
          name: productInfo.name,
        }),
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

  const handleCapture = (imageBase64: string, productInfo?: ProductInfo) => {
    setCapturedImage(imageBase64);
    if (productInfo) {
      setProductInfo(productInfo);
    }
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
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-xl">
                {productInfo?.name || "New Meal"}
              </h3>
              <span className="text-sm text-muted-foreground">
                {format(timestamp, "h:mm a")}
              </span>
            </div>
            <img
              src={`data:image/jpeg;base64,${capturedImage}`}
              alt="Captured meal"
              className="w-full rounded-lg mb-4"
            />
            {productInfo && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-lg">
                  <Flame className="h-5 w-5 text-orange-500" />
                  <span className="font-semibold">{productInfo.calories} calories</span>
                </div>
                <div className="grid grid-cols-3 gap-6">
                  <div className="space-y-1">
                    <span className="text-red-500">🥩</span>
                    <div className="font-semibold">{productInfo.protein}g</div>
                    <div className="text-xs text-muted-foreground">protein</div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-amber-500">🌾</span>
                    <div className="font-semibold">{productInfo.carbs}g</div>
                    <div className="text-xs text-muted-foreground">carbs</div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-blue-500">💧</span>
                    <div className="font-semibold">{productInfo.fat}g</div>
                    <div className="text-xs text-muted-foreground">fat</div>
                  </div>
                </div>
              </div>
            )}
            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={() => {
                setCapturedImage(null);
                setProductInfo(null);
              }}>
                Retake
              </Button>
              <Button
                onClick={handleAnalyze}
                disabled={analyzeMeal.isPending}
              >
                {analyzeMeal.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {productInfo ? 'Saving...' : 'Analyzing...'}
                  </>
                ) : (
                  productInfo ? 'Save Meal' : 'Analyze Meal'
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