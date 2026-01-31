import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Globe, Plus, ExternalLink } from 'lucide-react';

export function WebsiteTab() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">
          Manage your seller websites and landing pages
        </p>
        <Button onClick={() => navigate('/websites')}>
          <ExternalLink className="h-4 w-4 mr-2" />
          Open Website Builder
        </Button>
      </div>

      <Card>
        <CardContent className="text-center py-12">
          <Globe className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Website Builder</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Create seller websites to capture motivated seller leads.
          </p>
          <Button onClick={() => navigate('/websites')}>
            <Plus className="h-4 w-4 mr-2" />
            Go to Website Builder
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
