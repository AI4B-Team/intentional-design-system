import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Mail, Loader2, CheckCircle, Building } from 'lucide-react';
import { useBuyerAuth } from '@/contexts/BuyerAuthContext';
import { toast } from 'sonner';

export default function BuyerLogin() {
  const navigate = useNavigate();
  const { login } = useBuyerAuth();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter your email');
      return;
    }

    setIsLoading(true);

    const result = await login(email);

    if (result.success) {
      setIsSent(true);
      toast.success('Magic link sent! Check your email.');
    } else {
      toast.error(result.error || 'Failed to send login link');
    }

    setIsLoading(false);
  };

  if (isSent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-8 pb-8">
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Check Your Email</h2>
            <p className="text-muted-foreground mb-6">
              We've sent a magic link to <strong>{email}</strong>. Click the link in the email to log in.
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              The link will expire in 15 minutes.
            </p>
            <Button variant="outline" onClick={() => setIsSent(false)}>
              Use a different email
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Access Your Buyer Account</CardTitle>
          <CardDescription>
            Enter your email and we'll send you a secure login link
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Mail className="h-4 w-4 mr-2" />
              )}
              Send Magic Link
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              We'll email you a secure login link. No password needed.
            </p>
          </form>

          <div className="mt-6 pt-6 border-t text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Button variant="link" className="p-0 h-auto" onClick={() => navigate('/register/buyer')}>
                Register here
              </Button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
