import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  User,
  Settings,
  CreditCard,
  Mail,
  Languages,
  Sun,
  SunMoon,
  Moon,
  Power,
  UserPlus,
  Zap,
  ChevronRight,
  Crown,
  Gift,
  Check,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

const LANGUAGES = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "es", name: "Spanish", flag: "🇪🇸" },
  { code: "fr", name: "French", flag: "🇫🇷" },
  { code: "de", name: "German", flag: "🇩🇪" },
  { code: "pt", name: "Portuguese", flag: "🇧🇷" },
  { code: "it", name: "Italian", flag: "🇮🇹" },
  { code: "zh", name: "Chinese", flag: "🇨🇳" },
  { code: "ja", name: "Japanese", flag: "🇯🇵" },
];

type ThemeOption = "light" | "dark" | "split";

const THEMES: { value: ThemeOption; label: string; icon: React.ReactNode }[] = [
  { value: "light", label: "Light", icon: <Sun className="h-5 w-5 text-muted-foreground" /> },
  { value: "dark", label: "Dark", icon: <Moon className="h-5 w-5 text-muted-foreground" /> },
  { value: "split", label: "Split", icon: <SunMoon className="h-5 w-5 text-muted-foreground" /> },
];

interface ProfileDropdownProps {
  className?: string;
}

export function ProfileDropdown({ className }: ProfileDropdownProps) {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const [showLanguages, setShowLanguages] = useState(false);
  const [showThemes, setShowThemes] = useState(false);
  const [langSearch, setLangSearch] = useState("");
  const [selectedLang, setSelectedLang] = useState(() => 
    localStorage.getItem("app-language") || "en"
  );
  const [selectedTheme, setSelectedTheme] = useState<ThemeOption>(() => 
    (localStorage.getItem("app-theme") as ThemeOption) || "light"
  );
  
  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";
  const userEmail = user?.email || "user@example.com";
  const selectedLangObj = LANGUAGES.find(l => l.code === selectedLang) || LANGUAGES[0];

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
    setOpen(false);
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    setOpen(false);
  };

  const handleSelectTheme = (value: ThemeOption) => {
    setSelectedTheme(value);
    localStorage.setItem("app-theme", value);
    // Apply theme to document
    const root = document.documentElement;
    if (value === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    setShowThemes(false);
  };

  // Apply theme on mount
  useEffect(() => {
    const saved = localStorage.getItem("app-theme") as ThemeOption;
    if (saved === "dark") {
      document.documentElement.classList.add("dark");
    }
  }, []);

  const handleSelectLanguage = (code: string) => {
    setSelectedLang(code);
    localStorage.setItem("app-language", code);
    setShowLanguages(false);
    setLangSearch("");
  };

  const filteredLanguages = LANGUAGES.filter(l =>
    l.name.toLowerCase().includes(langSearch.toLowerCase())
  );

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setShowLanguages(false);
      setShowThemes(false);
      setLangSearch("");
    }
  };

  const selectedThemeObj = THEMES.find(t => t.value === selectedTheme) || THEMES[0];

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button className={cn(
          "flex items-center justify-center p-1 hover:bg-surface-secondary rounded-full transition-colors border-2 border-primary",
          className
        )}>
          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
            <User className="h-5 w-5 text-muted-foreground" />
          </div>
        </button>
      </PopoverTrigger>
      <PopoverContent 
        side="bottom"
        align="end" 
        className="w-80 p-0 bg-background shadow-xl border z-[100]"
        sideOffset={8}
      >
        {showLanguages ? (
          <div className="flex flex-col">
            <div className="flex items-center gap-2 p-3 border-b border-border">
              <button
                onClick={() => { setShowLanguages(false); setLangSearch(""); }}
                className="p-1 hover:bg-muted rounded-md transition-colors"
              >
                <ArrowLeft className="h-4 w-4 text-muted-foreground" />
              </button>
              <span className="text-sm font-semibold text-foreground">Select Language</span>
            </div>
            <div className="p-2">
              <input
                type="text"
                placeholder="Search languages..."
                value={langSearch}
                onChange={e => setLangSearch(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                autoFocus
              />
            </div>
            <div className="max-h-[280px] overflow-y-auto py-1">
              {filteredLanguages.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => handleSelectLanguage(lang.code)}
                  className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-muted transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{lang.flag}</span>
                    <span className="text-sm font-medium text-foreground">{lang.name}</span>
                  </div>
                  {selectedLang === lang.code && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </button>
              ))}
              {filteredLanguages.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No languages found</p>
              )}
            </div>
          </div>
        ) : showThemes ? (
          <div className="flex flex-col">
            <div className="flex items-center gap-2 p-3 border-b border-border">
              <button
                onClick={() => setShowThemes(false)}
                className="p-1 hover:bg-muted rounded-md transition-colors"
              >
                <ArrowLeft className="h-4 w-4 text-muted-foreground" />
              </button>
              <span className="text-sm font-semibold text-foreground">Select Theme</span>
            </div>
            <div className="py-1">
              {THEMES.map(t => (
                <button
                  key={t.value}
                  onClick={() => handleSelectTheme(t.value)}
                  className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-muted transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    {t.icon}
                    <span className="text-sm font-medium text-foreground">{t.label}</span>
                  </div>
                  {selectedTheme === t.value && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* User Info */}
            <div className="p-4 flex items-center gap-3">
              <div className="relative">
                <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center">
                  <User className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="absolute -top-1 -right-1 h-5 w-5 bg-amber-400 rounded-full flex items-center justify-center">
                  <Crown className="h-3 w-3 text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground truncate">{userName}</p>
                <p className="text-sm text-muted-foreground truncate">{userEmail}</p>
              </div>
            </div>

            {/* Primary Actions */}
            <div className="px-4 pb-4 space-y-2">
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2"
                onClick={() => handleNavigate("/settings/billing")}
              >
                <Zap className="h-4 w-4" />
                Upgrade
              </Button>
              <Button 
                variant="outline" 
                className="w-full gap-2"
                onClick={() => handleNavigate("/settings/team")}
              >
                <UserPlus className="h-4 w-4" />
                Add Members
              </Button>
            </div>

            {/* Menu Items */}
            <div className="border-t border-border py-2">
              <button
                onClick={() => handleNavigate("/settings")}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted transition-colors text-left"
              >
                <Settings className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium">Account</span>
              </button>
              <button
                onClick={() => handleNavigate("/settings/billing")}
                className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm font-medium">Subscription</span>
                </div>
                <span className="text-sm text-muted-foreground">Pro</span>
              </button>
              <button
                onClick={() => handleNavigate("/settings/team")}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted transition-colors text-left"
              >
                <Mail className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium">Invites</span>
              </button>
            </div>

            {/* Settings Section */}
            <div className="border-t border-border py-2 px-4 space-y-1">
              <button
                onClick={() => setShowLanguages(true)}
                className="w-full flex items-center justify-between py-2.5 hover:bg-muted px-2 rounded-md transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Languages className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm font-medium">Language:</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <span className="text-sm">{selectedLangObj.name}</span>
                  <ChevronRight className="h-4 w-4" />
                </div>
              </button>
              <button
                onClick={toggleTheme}
                className="w-full flex items-center justify-between py-2.5 hover:bg-muted px-2 rounded-md transition-colors"
              >
                <div className="flex items-center gap-3">
                  {theme === "light" ? (
                    <Sun className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <Moon className="h-5 w-5 text-muted-foreground" />
                  )}
                  <span className="text-sm font-medium">Theme:</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <span className="text-sm capitalize">{theme}</span>
                  <ChevronRight className="h-4 w-4" />
                </div>
              </button>
              
              {/* Affiliate Button */}
              <Button 
                variant="outline" 
                className="w-full mt-2 text-amber-600 border-amber-300 hover:bg-amber-50 hover:text-amber-700"
                onClick={() => handleNavigate("/affiliate")}
              >
                <Gift className="h-4 w-4 mr-2" />
                Join Affiliate Program
              </Button>
            </div>

            <div className="border-t border-border p-4">
              <Button 
                variant="destructive" 
                className="w-full gap-2 bg-red-500 hover:bg-red-600 text-white"
                onClick={handleSignOut}
              >
                <Power className="h-4 w-4" />
                Log Out
              </Button>
            </div>

            {/* Footer */}
            <div className="border-t border-border px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <button className="hover:text-foreground transition-colors">Terms</button>
                <span>|</span>
                <button className="hover:text-foreground transition-colors">Privacy</button>
              </div>
              <div className="flex items-center gap-2">
                <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="p-1.5 text-muted-foreground hover:text-foreground transition-colors">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="p-1.5 text-muted-foreground hover:text-foreground transition-colors">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="p-1.5 text-muted-foreground hover:text-foreground transition-colors">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="p-1.5 text-muted-foreground hover:text-foreground transition-colors">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </a>
              </div>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}