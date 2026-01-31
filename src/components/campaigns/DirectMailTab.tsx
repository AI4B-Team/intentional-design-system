import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, Plus, ExternalLink } from 'lucide-react';

export function DirectMailTab() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">
          Send postcards and letters to your leads
        </p>
        <Button onClick={() => navigate('/mail')}>
          <ExternalLink className="h-4 w-4 mr-2" />
          Open Direct Mail
        </Button>
      </div>

      <Card>
        <CardContent className="text-center py-12">
          <Mail className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Direct Mail Campaigns</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Design and send physical mail campaigns to property owners.
          </p>
          <Button onClick={() => navigate('/mail')}>
            <Plus className="h-4 w-4 mr-2" />
            Go to Direct Mail
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
