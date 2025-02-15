import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertUserSchema } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import bcrypt from "bcryptjs";
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
import { Tv, Loader2 } from "lucide-react";

type OnboardingStep = "credentials" | "gender" | "measurements" | "activity" | "social";

const SOCIAL_OPTIONS = [
  { value: "instagram", icon: SiInstagram, label: "Instagram" },
  { value: "facebook", icon: SiFacebook, label: "Facebook" },
  { value: "tiktok", icon: SiTiktok, label: "TikTok" },
  { value: "youtube", icon: SiYoutube, label: "Youtube" },
  { value: "google", icon: SiGoogle, label: "Google" },
  { value: "tv", icon: Tv, label: "TV" },
] as const;

// Create step-specific schemas
const credentialsSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const genderSchema = z.object({
  gender: z.enum(["male", "female", "other"]),
});

const measurementsSchema = z.object({
  height: z.number().min(50, "Height must be at least 50cm").max(300, "Height must be less than 300cm"),
  weight: z.number().min(20, "Weight must be at least 20kg").max(500, "Weight must be less than 500kg"),
  targetWeight: z.number().min(20, "Target weight must be at least 20kg").max(500, "Target weight must be less than 500kg"),
});

const activitySchema = z.object({
  activityLevel: z.enum(["sedentary", "light", "moderate", "active", "very_active"]),
  workoutsPerWeek: z.number().min(0, "Must be at least 0").max(14, "Must be less than 14"),
});

const socialSchema = z.object({
  socialSource: z.enum(["instagram", "facebook", "tiktok", "youtube", "google", "tv"]),
});

type FormData = z.infer<typeof insertUserSchema>;

const STEPS = ["credentials", "gender", "measurements", "activity", "social"] as const;

export default function OnboardingPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [step, setStep] = useState<OnboardingStep>("credentials");

  const currentStepIndex = STEPS.indexOf(step);
  const progress = ((currentStepIndex + 1) / STEPS.length) * 100;

  const form = useForm<FormData>({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      gender: "male",
      height: 170,
      weight: 70,
      targetWeight: 65,
      activityLevel: "moderate",
      workoutsPerWeek: 3,
      socialSource: "instagram",
    },
    mode: "onChange",
  });

  const createUser = useMutation({
    mutationFn: async (data: FormData) => {
      const { confirmPassword, ...userData } = {
        ...data,
        password: data.password, // Password will be hashed on the server
      };
      const response = await apiRequest("POST", "/api/register", userData);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create user");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Welcome!",
        description: "Your account has been created successfully.",
      });
      // Add a small delay to ensure the server has processed the session
      setTimeout(() => {
        navigate("/dashboard");
      }, 500);
    },
    onError: (error: Error) => {
      toast({
        title: "Error creating account",
        description: error.message,
        variant: "destructive",
      });
      if (error.message.includes("already exists")) {
        setStep("credentials");
      }
    },
  });

  const validateCurrentStep = async () => {
    const values = form.getValues();
    try {
      switch (step) {
        case "credentials":
          await credentialsSchema.parseAsync({
            username: values.username,
            password: values.password,
            confirmPassword: values.confirmPassword,
          });
          break;
        case "gender":
          await genderSchema.parseAsync({ gender: values.gender });
          break;
        case "measurements":
          await measurementsSchema.parseAsync({
            height: values.height,
            weight: values.weight,
            targetWeight: values.targetWeight,
          });
          break;
        case "activity":
          await activitySchema.parseAsync({
            activityLevel: values.activityLevel,
            workoutsPerWeek: values.workoutsPerWeek,
          });
          break;
        case "social":
          await socialSchema.parseAsync({ socialSource: values.socialSource });
          break;
      }
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.errors.forEach((err) => {
          form.setError(err.path[0] as any, {
            type: "manual",
            message: err.message,
          });
        });
      }
      return false;
    }
  };

  const onSubmit = async (data: FormData) => {
    const isValid = await validateCurrentStep();
    if (!isValid) return;

    if (step !== "social") {
      const nextSteps: Record<OnboardingStep, OnboardingStep> = {
        credentials: "gender",
        gender: "measurements",
        measurements: "activity",
        activity: "social",
        social: "social",
      };
      setStep(nextSteps[step]);
    } else {
      try {
        await createUser.mutateAsync(data);
      } catch (error) {
        console.error("Error creating user:", error);
      }
    }
  };

  return (
    <div className="container max-w-md mx-auto px-4 pt-8">
      <div className="mb-8">
        <Progress value={progress} className="h-2" />
        <p className="text-sm text-muted-foreground mt-2">
          Step {currentStepIndex + 1} of {STEPS.length}
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {step === "credentials" && (
            <Card>
              <CardContent className="pt-6">
                <h1 className="text-2xl font-bold mb-6">Create Your Account</h1>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input {...field} autoComplete="username" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            {...field}
                            autoComplete="new-password"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            {...field}
                            autoComplete="new-password"
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
                  name="activityLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Activity Level</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col gap-4"
                        >
                          {["Sedentary", "Light", "Moderate", "Active", "Very Active"].map((option) => (
                            <FormItem
                              key={option}
                              className="flex items-center space-x-3 space-y-0"
                            >
                              <FormControl>
                                <RadioGroupItem value={option.toLowerCase().replace(" ", "_")} />
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
                <FormField
                  control={form.control}
                  name="workoutsPerWeek"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Workouts per Week</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
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
                          {SOCIAL_OPTIONS.map(({ value, icon: Icon, label }) => (
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
            {createUser.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please wait
              </>
            ) : (
              step === "social" ? "Get Started" : "Next"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}