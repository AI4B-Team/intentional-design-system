import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useBuyerAuth } from '@/contexts/BuyerAuthContext';

export default function BuyerAuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { verifyToken } = useBuyerAuth();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setStatus('error');
      setErrorMessage('No authentication token provided.');
      return;
    }

    const verify = async () => {
      const result = await verifyToken(token);
      
      if (result.success) {
        setStatus('success');
        setTimeout(() => {
          navigate('/buyer/dashboard');
        }, 1500);
      } else {
        setStatus('error');
        setErrorMessage(result.error || 'Authentication failed.');
      }
    };

    verify();
  }, [searchParams, verifyToken, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center">
        <CardContent className="pt-8 pb-8">
          {status === 'verifying' && (
            <>
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Verifying your login...</h2>
              <p className="text-muted-foreground">Please wait while we authenticate you.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
              <h2 className="text-xl font-bold mb-2">Login Successful!</h2>
              <p className="text-muted-foreground">Redirecting to your dashboard...</p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="h-8 w-8 text-destructive" />
              </div>
              <h2 className="text-xl font-bold mb-2">Login Failed</h2>
              <p className="text-muted-foreground mb-6">{errorMessage}</p>
              <div className="space-y-2">
                <Button onClick={() => navigate('/buyer/login')} className="w-full">
                  Try Again
                </Button>
                <Button variant="outline" onClick={() => navigate('/register/buyer')} className="w-full">
                  Create Account
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
