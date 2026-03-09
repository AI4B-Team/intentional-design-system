import * as React from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { Lock, Eye, EyeOff } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      toast.error(error.message || "Failed to update password");
    } else {
      toast.success("Password updated successfully!");
      navigate("/login");
    }
    setLoading(false);
  };

  return (
    <AuthLayout>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-2">Set New Password</h1>
        <p className="text-muted-foreground">Enter your new password below</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password" className="sr-only">New Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 pr-12"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground-secondary"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="sr-only">Confirm Password</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="h-12 pr-12"
              required
            />
            <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-brand" />
          </div>
        </div>

        <Button
          type="submit"
          fullWidth
          disabled={loading}
          className="h-12 bg-brand hover:bg-brand/90 text-white"
        >
          {loading ? <Spinner size="sm" className="mr-2" /> : null}
          {loading ? "Updating..." : "Update Password"}
        </Button>
      </form>
    </AuthLayout>
  );
}
