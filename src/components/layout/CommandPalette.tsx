import * as React from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { COMMAND_NAVIGATION_ITEMS } from "./navigation";
import {
  Plus, Search, Settings, Sparkles, BarChart3, Car,
  LogOut, ExternalLink,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAIVA } from "@/contexts/AIVAContext";
import { useFamilyApps, useLaunchFamilyApp } from "@/hooks/useAppFamily";
import { toast } from "@/hooks/use-toast";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const QUICK_ACTIONS = [
  { label: "Add New Property", href: "/properties/new", icon: Plus },
  { label: "Start Driving Session", href: "/d4d", icon: Car },
  { label: "Analyze a Deal", href: "/market-analyzer?tab=deals", icon: BarChart3 },
  { label: "Search Properties & Markets", href: "/intel", icon: Search },
];

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { openAIVA } = useAIVA();
  const [search, setSearch] = React.useState("");
  const { data: familyApps = [] } = useFamilyApps();
  const launchApp = useLaunchFamilyApp();
  const enabledApps = familyApps.filter((a) => a.enabled);

  const runCommand = React.useCallback((command: () => void) => {
    onOpenChange(false);
    command();
  }, [onOpenChange]);

  const openFamilyApp = React.useCallback(
    async (slug: string) => {
      try {
        const url = await launchApp.mutateAsync({ appSlug: slug });
        window.open(url, "_blank", "noopener,noreferrer");
      } catch (e: unknown) {
        toast({
          title: "Could Not Open App",
          description: e instanceof Error ? e.message : "Handoff link failed.",
          variant: "destructive",
        });
      }
    },
    [launchApp],
  );


  React.useEffect(() => {
    if (!open) setSearch("");
  }, [open]);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Search pages, actions, tools..."
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Quick Actions">
          <CommandItem onSelect={() => runCommand(() => openAIVA())}>
            <Sparkles className="mr-2 h-4 w-4 text-primary" />
            <span>Ask AIVA</span>
            <CommandShortcut>AI</CommandShortcut>
          </CommandItem>
          {QUICK_ACTIONS.map((action) => (
            <CommandItem
              key={action.href}
              onSelect={() => runCommand(() => navigate(action.href))}
            >
              <action.icon className="mr-2 h-4 w-4" />
              <span>{action.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Navigate">
          {COMMAND_NAVIGATION_ITEMS.map((item) => (
            <CommandItem
              key={item.href}
              onSelect={() => runCommand(() => navigate(item.href))}
            >
              <item.icon className="mr-2 h-4 w-4" />
              <span>{item.label}</span>
              {item.shortcut && <CommandShortcut>{item.shortcut}</CommandShortcut>}
            </CommandItem>
          ))}
        </CommandGroup>

        {enabledApps.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="App Family">
              {enabledApps.map((app) => (
                <CommandItem
                  key={app.slug}
                  value={`open ${app.name}`}
                  onSelect={() => runCommand(() => openFamilyApp(app.slug))}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  <span>Open {app.name}</span>
                  <CommandShortcut>SSO</CommandShortcut>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        <CommandSeparator />


        <CommandGroup heading="Account">
          <CommandItem onSelect={() => runCommand(() => navigate("/settings"))}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => signOut())}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sign Out</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
