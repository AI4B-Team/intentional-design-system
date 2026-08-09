import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";
import { useFamilyApps, useLaunchFamilyApp } from "@/hooks/useAppFamily";
import { ExternalLink, Loader2, Boxes } from "lucide-react";

interface SendToAppMenuProps {
  /** Deep-link path inside the satellite app, e.g. "/leads?address=123+Main+St". */
  next?: string;
  label?: string;
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "default" | "sm" | "icon";
}

/**
 * Contextual App Family handoff: opens a satellite app signed in as the current
 * Real Elite user, optionally deep-linked to a matching record.
 */
export function SendToAppMenu({
  next,
  label = "Open In App",
  variant = "outline",
  size = "sm",
}: SendToAppMenuProps) {
  const { data: apps = [] } = useFamilyApps();
  const launch = useLaunchFamilyApp();
  const [pending, setPending] = React.useState<string | null>(null);

  const enabled = apps.filter((a) => a.enabled);
  if (enabled.length === 0) return null;

  const handleOpen = async (slug: string) => {
    setPending(slug);
    try {
      const url = await launch.mutateAsync({ appSlug: slug, next });
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (e: unknown) {
      toast({
        title: "Could Not Open App",
        description: e instanceof Error ? e.message : "Handoff link failed.",
        variant: "destructive",
      });
    } finally {
      setPending(null);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size}>
          {pending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Boxes className="mr-2 h-4 w-4" />
          )}
          {label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>App Family</DropdownMenuLabel>
        {enabled.map((app) => (
          <DropdownMenuItem
            key={app.slug}
            onSelect={(e) => {
              e.preventDefault();
              handleOpen(app.slug);
            }}
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            {app.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default SendToAppMenu;
