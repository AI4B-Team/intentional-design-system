import * as React from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";

export default function ForgotPassword() {
  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [sent, setSent] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      toast.error(error.message || "Failed to send reset email");
    } else {
      setSent(true);
      toast.success("Password reset email sent!");
    }
    setLoading(false);
  };

  return (
    <AuthLayout>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          {sent ? "Check Your Email" : "Reset Password"}
        </h1>
        <p className="text-slate-500">
          {sent
            ? `We've sent a reset link to ${email}`
            : "Enter your email and we'll send you a reset link"}
        </p>
      </div>

      {sent ? (
        <div className="space-y-6">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </div>
          <Button
            variant="outline"
            fullWidth
            onClick={() => setSent(false)}
            className="h-12"
          >
            Try a different email
          </Button>
        </div>
      ) : (
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

          <Button
            type="submit"
            fullWidth
            disabled={loading}
            className="h-12 bg-brand hover:bg-brand/90 text-white"
          >
            {loading ? <Spinner size="sm" className="mr-2" /> : null}
            {loading ? "Sending..." : "Send Reset Link"}
          </Button>
        </form>
      )}

      <p className="text-center mt-6 text-sm text-slate-600">
        <Link to="/login" className="text-brand hover:underline font-medium inline-flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" />
          Back to Login
        </Link>
      </p>
    </AuthLayout>
  );
}
