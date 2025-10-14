import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, Brain, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuthStore } from "@/stores/authStore";
import { useToast } from "@/hooks/use-toast";

interface LoginForm {
  username: string;
  password: string;
}

export const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading } = useAuthStore();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();

  const from = location.state?.from?.pathname || "/dashboard";

  const onSubmit = async (data: LoginForm) => {
    try {
      setError("");
      await login(data.username, data.password);
      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      });
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error("Login error:", err);
      
      // Handle different types of errors
      let errorMessage = "Login failed. Please try again.";
      
      if (err.response?.status === 401) {
        errorMessage = "Invalid username or password. Please try again.";
      } else if (err.response?.status === 422) {
        // Handle validation errors
        const validationErrors = err.response.data?.detail;
        if (Array.isArray(validationErrors)) {
          errorMessage = validationErrors.map(e => e.msg || e.message || "Validation error").join(", ");
        } else if (typeof validationErrors === 'string') {
          errorMessage = validationErrors;
        } else {
          errorMessage = "Please check your input data.";
        }
      } else if (err.response?.status === 400) {
        errorMessage = err.response.data?.detail || "Invalid login data. Please check your information.";
      } else if (err.response?.data?.detail && typeof err.response.data.detail === 'string') {
        errorMessage = err.response.data.detail;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      
      // Also show toast for better visibility
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: errorMessage,
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-surface p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-primary shadow-glow">
              <Brain className="h-7 w-7 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground">AI Campus Admin</h1>
          <p className="text-muted-foreground mt-2">Sign in to your account</p>
        </div>

        {/* Login Form */}
        <Card className="shadow-custom-lg border-0 bg-card/50 backdrop-blur">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Sign In</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access the admin portal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  {...register("username", { required: "Username is required" })}
                  className="h-11"
                />
                {errors.username && (
                  <p className="text-sm text-destructive">{errors.username.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    {...register("password", { required: "Password is required" })}
                    className="h-11 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-11 w-10 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-gradient-primary hover:bg-gradient-primary/90 text-white font-medium"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  className="font-medium text-primary hover:underline"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-muted-foreground">
            © 2024 AI Campus Admin. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};