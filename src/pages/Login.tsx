import * as React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signInWithGoogle, user } = useAuth();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [googleLoading, setGoogleLoading] = React.useState(false);

  const from = (location.state as any)?.from?.pathname || "/dashboard";

  React.useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      toast.error(error.message || "Failed to sign in");
      setLoading(false);
    } else {
      toast.success("Welcome back!");
      navigate(from, { replace: true });
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    const { error } = await signInWithGoogle();
    if (error) {
      toast.error(error.message || "Failed to sign in with Google");
      setGoogleLoading(false);
    }
  };

  return (
    <AuthLayout>
      {/* Tab Switcher */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex bg-slate-100 rounded-full p-1">
          <Link
            to="/login"
            className="px-6 py-2 rounded-full text-sm font-medium bg-white text-slate-900 shadow-sm"
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="px-6 py-2 rounded-full text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            Sign Up
          </Link>
        </div>
      </div>

      {/* Welcome Text */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Welcome</h1>
        <p className="text-slate-500">Please Enter Your Details</p>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="sr-only">Email</Label>
          <div className="relative">
            <Input
              id="email"
              type="email"
              placeholder="Enter Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 pr-10"
              required
            />
            <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-brand" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="sr-only">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 pr-20"
              required
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <Mail className="h-5 w-5 text-brand" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-sm text-brand hover:underline">
            Forgot Password?
          </Link>
        </div>

        <Button
          type="submit"
          fullWidth
          disabled={loading}
          className="h-12 bg-brand hover:bg-brand/90 text-white"
        >
          {loading ? <Spinner size="sm" className="mr-2" /> : null}
          {loading ? "Signing in..." : "Sign In"}
        </Button>
      </form>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white text-slate-500">OR</span>
        </div>
      </div>

      {/* Google Sign In */}
      <Button
        type="button"
        variant="outline"
        fullWidth
        onClick={handleGoogleSignIn}
        disabled={googleLoading}
        className="h-12 border-slate-200 hover:bg-slate-50"
      >
        {googleLoading ? (
          <Spinner size="sm" className="mr-2" />
        ) : (
          <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
        )}
        Sign In With Google
      </Button>

      {/* Sign Up Link */}
      <p className="text-center mt-6 text-sm text-slate-600">
        Don't Have An Account?{" "}
        <Link to="/signup" className="text-brand hover:underline font-medium">
          Create Your Account
        </Link>
      </p>
    </AuthLayout>
  );
}
