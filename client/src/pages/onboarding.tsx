import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema, InsertUser } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { SiInstagram, SiFacebook, SiTiktok, SiYoutube, SiGoogle } from "react-icons/si";
import { Tv } from "lucide-react";
import { nanoid } from 'nanoid';

type OnboardingStep = "gender" | "measurements" | "activity" | "social";

const STEPS = ["gender", "measurements", "activity", "social"] as const;

export default function OnboardingPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [step, setStep] = useState<OnboardingStep>("gender");

  const currentStepIndex = STEPS.indexOf(step);
  const progress = ((currentStepIndex + 1) / STEPS.length) * 100;

  // Generate secure random credentials
  const generateSecureCredentials = () => ({
    username: `user_${nanoid(10)}`,
    password: nanoid(16),  // 16 character random string for better security
  });

  const form = useForm({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      ...generateSecureCredentials(),
      gender: "",
      height: 170,
      weight: 70,
      targetWeight: 65,
      activityLevel: "",
      workoutsPerWeek: 0,
      socialSource: "",
    },
  });

  const createUser = useMutation({
    mutationFn: async (data: InsertUser) => {
      try {
        const res = await apiRequest("POST", "/api/users", data);
        if (!res.ok) {
          throw new Error('Failed to create user');
        }
        return res.json();
      } catch (error) {
        throw new Error(error instanceof Error ? error.message : 'Unknown error occurred');
      }
    },
    onSuccess: (data) => {
      // Store credentials securely
      localStorage.setItem('userId', data.id.toString());
      toast({
        title: "Welcome!",
        description: "Your account has been created successfully. Please save your credentials.",
        duration: 10000, // 10 seconds
      });
      navigate("/dashboard");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = form.handleSubmit((data) => {
    if (step !== "social") {
      const nextSteps: Record<OnboardingStep, OnboardingStep> = {
        gender: "measurements",
        measurements: "activity",
        activity: "social",
        social: "social",
      };
      setStep(nextSteps[step]);
    } else {
      createUser.mutate(data);
    }
  });

  return (
    <div className="container max-w-md mx-auto px-4 pt-8">
      <div className="mb-8">
        <Progress value={progress} className="h-2" />
        <p className="text-sm text-muted-foreground mt-2">
          Step {currentStepIndex + 1} of {STEPS.length}
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={onSubmit} className="space-y-8">
          {step === "gender" && (
            <Card>
              <CardContent className="pt-6">
                <h1 className="text-2xl font-bold mb-6">Choose your Gender</h1>
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col gap-4"
                        >
                          {["Male", "Female", "Other"].map((option) => (
                            <FormItem
                              key={option}
                              className="flex items-center space-x-3 space-y-0"
                            >
                              <FormControl>
                                <RadioGroupItem value={option.toLowerCase()} />
                              </FormControl>
                              <FormLabel className="font-normal">{option}</FormLabel>
                            </FormItem>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          )}

          {step === "measurements" && (
            <Card>
              <CardContent className="pt-6">
                <h1 className="text-2xl font-bold mb-6">Your Measurements</h1>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="height"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Height (cm)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            value={field.value}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="weight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Weight (kg)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            value={field.value}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="targetWeight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Target Weight (kg)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            value={field.value}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {step === "activity" && (
            <Card>
              <CardContent className="pt-6">
                <h1 className="text-2xl font-bold mb-6">How active are you?</h1>
                <FormField
                  control={form.control}
                  name="workoutsPerWeek"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <RadioGroup
                          onValueChange={(val) => field.onChange(parseInt(val))}
                          defaultValue={field.value.toString()}
                          className="flex flex-col gap-4"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="0" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              0-2 (Workouts now and then)
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="3" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              3-5 (A few workouts per week)
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="6" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              6+ (Dedicated athlete)
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          )}

          {step === "social" && (
            <Card>
              <CardContent className="pt-6">
                <h1 className="text-2xl font-bold mb-6">Where did you hear about us?</h1>
                <FormField
                  control={form.control}
                  name="socialSource"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col gap-4"
                        >
                          {[
                            { value: "instagram", icon: SiInstagram, label: "Instagram" },
                            { value: "facebook", icon: SiFacebook, label: "Facebook" },
                            { value: "tiktok", icon: SiTiktok, label: "TikTok" },
                            { value: "youtube", icon: SiYoutube, label: "Youtube" },
                            { value: "google", icon: SiGoogle, label: "Google" },
                            { value: "tv", icon: Tv, label: "TV" },
                          ].map(({ value, icon: Icon, label }) => (
                            <FormItem
                              key={value}
                              className="flex items-center space-x-3 space-y-0"
                            >
                              <FormControl>
                                <RadioGroupItem value={value} />
                              </FormControl>
                              <FormLabel className="font-normal flex items-center gap-2">
                                <Icon className="w-5 h-5" />
                                {label}
                              </FormLabel>
                            </FormItem>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={createUser.isPending}
          >
            {step === "social" ? "Get Started" : "Next"}
          </Button>
        </form>
      </Form>
    </div>
  );
}