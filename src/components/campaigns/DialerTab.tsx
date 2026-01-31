import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Phone, Plus, ExternalLink } from 'lucide-react';

export function DialerTab() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">
          Manage your calling campaigns and dialer queues
        </p>
        <Button onClick={() => navigate('/dialer')}>
          <ExternalLink className="h-4 w-4 mr-2" />
          Open Dialer
        </Button>
      </div>

      <Card>
        <CardContent className="text-center py-12">
          <Phone className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Dialer System</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Cold call leads with our integrated dialer and call tracking.
          </p>
          <Button onClick={() => navigate('/dialer')}>
            <Plus className="h-4 w-4 mr-2" />
            Go to Dialer
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
