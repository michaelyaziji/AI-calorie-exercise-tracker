import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import OnboardingPage from "@/pages/onboarding";
import LoginPage from "@/pages/login";
import DashboardPage from "@/pages/dashboard";
import MealLogPage from "@/pages/meal-log";
import ExerciseLogPage from "@/pages/exercise-log";
import NavBar from "@/components/nav-bar";
import { FloatingActionButton } from "@/components/floating-action-button";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/components/protected-route";
import { Loader2 } from "lucide-react";
import { Redirect } from "wouter";

function Router() {
  const { user, isLoading } = useAuth();

  return (
    <Switch>
      <Route path="/">
        {isLoading ? (
          <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="h-8 w-8 animate-spin text-border" />
          </div>
        ) : user ? (
          <Redirect to="/dashboard" />
        ) : (
          <OnboardingPage />
        )}
      </Route>
      <Route path="/login" component={LoginPage} />
      <ProtectedRoute path="/dashboard" component={DashboardPage} />
      <ProtectedRoute path="/meal-log" component={MealLogPage} />
      <ProtectedRoute path="/exercise-log" component={ExerciseLogPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="min-h-screen bg-background text-foreground">
          <Router />
          <NavBar />
          <FloatingActionButton />
        </div>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}