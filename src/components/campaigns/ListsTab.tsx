import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ListFilter, Plus, ExternalLink } from 'lucide-react';

export function ListsTab() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">
          Manage your marketing lists and segments
        </p>
        <Button onClick={() => navigate('/marketing/lists')}>
          <ExternalLink className="h-4 w-4 mr-2" />
          Open Lists
        </Button>
      </div>

      <Card>
        <CardContent className="text-center py-12">
          <ListFilter className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Lists Management</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Create and manage segmented lists for your marketing campaigns.
          </p>
          <Button onClick={() => navigate('/marketing/lists')}>
            <Plus className="h-4 w-4 mr-2" />
            Go to Lists
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
