import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageLayout } from '@/components/layout/page-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ArrowLeft,
  Edit,
  Copy,
  Send,
  Mail,
  Eye,
  MousePointer,
  AlertCircle,
  UserMinus,
  CheckCircle,
  Clock,
  FileText,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { useDispoCampaign, useCampaignRecipients } from '@/hooks/useDispoCampaigns';
import { format } from 'date-fns';

const statusConfig: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  draft: { label: 'Draft', icon: <FileText className="h-4 w-4" />, color: 'bg-muted text-muted-foreground' },
  scheduled: { label: 'Scheduled', icon: <Clock className="h-4 w-4" />, color: 'bg-blue-500 text-white' },
  sending: { label: 'Sending', icon: <Loader2 className="h-4 w-4 animate-spin" />, color: 'bg-amber-500 text-white' },
  sent: { label: 'Sent', icon: <CheckCircle className="h-4 w-4" />, color: 'bg-green-500 text-white' },
};

const recipientStatusIcons: Record<string, React.ReactNode> = {
  pending: <Clock className="h-4 w-4 text-muted-foreground" />,
  sent: <Mail className="h-4 w-4 text-blue-500" />,
  opened: <Eye className="h-4 w-4 text-green-500" />,
  clicked: <MousePointer className="h-4 w-4 text-purple-500" />,
  bounced: <AlertCircle className="h-4 w-4 text-red-500" />,
  unsubscribed: <UserMinus className="h-4 w-4 text-amber-500" />,
};

export default function DispoCampaignDetail() {
  const navigate = useNavigate();
  const { id } = useParams();

  const { data: campaign, isLoading } = useDispoCampaign(id);
  const { data: recipients } = useCampaignRecipients(id);

  if (isLoading) {
    return (
      <PageLayout title="Campaign Details">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PageLayout>
    );
  }

  if (!campaign) {
    return (
      <PageLayout title="Campaign Not Found">
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">This campaign could not be found.</p>
          <Button onClick={() => navigate('/dispo/campaigns')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Campaigns
          </Button>
        </div>
      </PageLayout>
    );
  }

  const status = statusConfig[campaign.status] || statusConfig.draft;
  const openRate = campaign.sent_count > 0
    ? ((campaign.opened_count / campaign.sent_count) * 100).toFixed(1)
    : '0';
  const clickRate = campaign.sent_count > 0
    ? ((campaign.clicked_count / campaign.sent_count) * 100).toFixed(1)
    : '0';
  const bounceRate = campaign.sent_count > 0
    ? ((campaign.bounced_count / campaign.sent_count) * 100).toFixed(1)
    : '0';

  return (
    <PageLayout
      title={campaign.name}
      headerActions={
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate('/dispo/campaigns')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          {campaign.status === 'draft' && (
            <>
              <Button variant="outline" onClick={() => navigate(`/dispo/campaigns/${id}/edit`)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button>
                <Send className="h-4 w-4 mr-2" />
                Send Now
              </Button>
            </>
          )}
          {campaign.status === 'sent' && (
            <Button variant="outline" onClick={() => navigate(`/dispo/campaigns/new?duplicate=${id}`)}>
              <Copy className="h-4 w-4 mr-2" />
              Duplicate
            </Button>
          )}
        </div>
      }
    >
      <div className="space-y-6">
        {/* Status & Deal Info */}
        <div className="flex items-center gap-4">
          <Badge className={`${status.color} border-0 gap-1`}>
            {status.icon}
            {status.label}
          </Badge>
          {campaign.sent_at && (
            <span className="text-sm text-muted-foreground">
              Sent {format(new Date(campaign.sent_at), 'MMM d, yyyy h:mm a')}
            </span>
          )}
          {campaign.deal && (
            <Button
              variant="link"
              className="p-0 h-auto"
              onClick={() => navigate(`/dispo/deals/${(campaign.deal as any).id}`)}
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              {(campaign.deal as any).address}
            </Button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Send className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{campaign.sent_count || campaign.recipient_count}</p>
                  <p className="text-xs text-muted-foreground">Recipients</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Eye className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{campaign.opened_count}</p>
                  <p className="text-xs text-muted-foreground">Opens ({openRate}%)</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <MousePointer className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{campaign.clicked_count}</p>
                  <p className="text-xs text-muted-foreground">Clicks ({clickRate}%)</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500/10 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{campaign.bounced_count}</p>
                  <p className="text-xs text-muted-foreground">Bounced ({bounceRate}%)</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 rounded-lg">
                  <UserMinus className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{campaign.unsubscribed_count}</p>
                  <p className="text-xs text-muted-foreground">Unsubscribed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Email Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Email Content</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Subject</p>
              <p className="font-medium">{campaign.subject}</p>
            </div>
            {campaign.preview_text && (
              <div>
                <p className="text-sm text-muted-foreground">Preview Text</p>
                <p>{campaign.preview_text}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground mb-2">Body</p>
              <div
                className="p-4 border rounded-lg bg-white prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: campaign.body_html }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Recipients */}
        {recipients && recipients.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recipients ({recipients.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Buyer</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Sent</TableHead>
                    <TableHead>Opened</TableHead>
                    <TableHead>Clicked</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recipients.map((r: any) => {
                    const buyerName = r.buyer?.full_name ||
                      `${r.buyer?.first_name || ''} ${r.buyer?.last_name || ''}`.trim() ||
                      r.email;

                    return (
                      <TableRow key={r.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{buyerName}</p>
                            {r.buyer?.company_name && (
                              <p className="text-sm text-muted-foreground">{r.buyer.company_name}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{r.email}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {recipientStatusIcons[r.status] || recipientStatusIcons.pending}
                            <span className="capitalize">{r.status}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {r.sent_at ? format(new Date(r.sent_at), 'MMM d, h:mm a') : '-'}
                        </TableCell>
                        <TableCell>
                          {r.opened_at ? format(new Date(r.opened_at), 'MMM d, h:mm a') : '-'}
                        </TableCell>
                        <TableCell>
                          {r.clicked_at ? format(new Date(r.clicked_at), 'MMM d, h:mm a') : '-'}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </PageLayout>
  );
}
