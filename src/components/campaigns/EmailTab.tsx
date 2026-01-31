import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AtSign, Plus, ExternalLink } from 'lucide-react';

export function EmailTab() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">
          Create and manage email marketing campaigns
        </p>
        <Button onClick={() => navigate('/marketing/email')}>
          <ExternalLink className="h-4 w-4 mr-2" />
          Open Email
        </Button>
      </div>

      <Card>
        <CardContent className="text-center py-12">
          <AtSign className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Email Marketing</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Send targeted email campaigns to your leads and contacts.
          </p>
          <Button onClick={() => navigate('/marketing/email')}>
            <Plus className="h-4 w-4 mr-2" />
            Go to Email
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
