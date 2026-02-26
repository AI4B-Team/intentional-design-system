import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['Sora', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
        display: ['Sora', 'sans-serif'],
      },
      fontSize: {
        'display': ['56px', { lineHeight: '1.08', letterSpacing: '-0.04em', fontWeight: '800' }],
        'h1': ['32px', { lineHeight: '1.15', letterSpacing: '-0.03em', fontWeight: '700' }],
        'h2': ['24px', { lineHeight: '1.25', letterSpacing: '-0.025em', fontWeight: '600' }],
        'h3': ['18px', { lineHeight: '1.4', letterSpacing: '-0.015em', fontWeight: '600' }],
        'body': ['15px', { lineHeight: '1.65', letterSpacing: '-0.005em' }],
        'small': ['13px', { lineHeight: '1.55' }],
        'tiny': ['11px', { lineHeight: '1.45', letterSpacing: '0.04em' }],
      },
      colors: {
        // Semantic design tokens (CSS variables)
        border: "hsl(var(--border))",
        "border-subtle": "hsl(var(--border-subtle))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: {
          DEFAULT: "hsl(var(--background))",
          secondary: "hsl(var(--background-secondary))",
          tertiary: "hsl(var(--background-tertiary))",
        },
        foreground: {
          DEFAULT: "hsl(var(--foreground))",
          secondary: "hsl(var(--foreground-secondary))",
          tertiary: "hsl(var(--foreground-tertiary))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
          muted: "hsl(var(--destructive-muted))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
          muted: "hsl(var(--success-muted))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
          muted: "hsl(var(--warning-muted))",
        },
        info: {
          DEFAULT: "hsl(var(--info))",
          foreground: "hsl(var(--info-foreground))",
          muted: "hsl(var(--info-muted))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
          hover: "hsl(var(--accent-hover))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        // Heat/Score colors
        heat: {
          hot: "hsl(var(--heat-hot))",
          warm: "hsl(var(--heat-warm))",
          moderate: "hsl(var(--heat-moderate))",
          cool: "hsl(var(--heat-cool))",
          cold: "hsl(var(--heat-cold))",
        },
        score: {
          hot: "#DC2626",
          warm: "#F97316",
          moderate: "#EAB308",
          cool: "#10B981",
          cold: "#6B7280",
        },
        // Surface colors (direct values for convenience)
        surface: {
          DEFAULT: "#FFFFFF",
          secondary: "#FAFAFA",
          tertiary: "#F5F5F7",
        },
        // Content/text colors (direct values)
        content: {
          DEFAULT: "#1A1A2E",
          secondary: "#64748B",
          tertiary: "#94A3B8",
        },
        // Brand colors (direct values)
        brand: {
          DEFAULT: "#10B981",
          light: "#34D399",
          accent: "#10B981",
        },
        // Chart colors
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
      },
      spacing: {
        '4xs': '2px',
        '3xs': '4px',
        '2xs': '8px',
        'xs': '12px',
        'sm': '16px',
        'md': '24px',
        'lg': '32px',
        'xl': '48px',
        '2xl': '64px',
        '3xl': '96px',
      },
      borderRadius: {
        tiny: "4px",
        small: "6px",
        medium: "8px",
        large: "12px",
        xl: "16px",
        full: "9999px",
      },
      boxShadow: {
        'xs': '0 1px 2px rgba(0,0,0,0.05)',
        'sm': '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.05)',
        'md': '0 4px 8px rgba(0,0,0,0.06), 0 2px 4px rgba(0,0,0,0.04)',
        'lg': '0 12px 24px rgba(0,0,0,0.08), 0 4px 8px rgba(0,0,0,0.04)',
        'xl': '0 24px 48px rgba(0,0,0,0.10), 0 12px 24px rgba(0,0,0,0.06)',
        '2xl': '0 40px 80px rgba(0,0,0,0.12), 0 20px 40px rgba(0,0,0,0.08)',
        'glow-sm': '0 0 0 1px hsl(160 84% 39% / 0.15), 0 4px 12px hsl(160 84% 39% / 0.2)',
        'glow-md': '0 0 0 1px hsl(160 84% 39% / 0.2), 0 8px 24px hsl(160 84% 39% / 0.25)',
        'glow-lg': '0 0 0 1px hsl(160 84% 39% / 0.25), 0 16px 40px hsl(160 84% 39% / 0.3)',
        'card': '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'card-hover': '0 8px 24px rgba(0,0,0,0.08), 0 3px 8px rgba(0,0,0,0.04)',
        'card-active': '0 2px 8px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
        'inner-sm': 'inset 0 1px 2px rgba(0,0,0,0.06)',
        'inner-md': 'inset 0 2px 4px rgba(0,0,0,0.08)',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-out": {
          "0%": { opacity: "1", transform: "translateY(0)" },
          "100%": { opacity: "0", transform: "translateY(10px)" },
        },
        "scale-in": {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "slide-in-right": {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-down": {
          "0%": { opacity: "0", transform: "translateY(-8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "spin": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "pulse-subtle": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        "pulse-slow": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.2s ease-out",
        "fade-out": "fade-out 0.2s ease-out",
        "scale-in": "scale-in 0.2s ease-out",
        "slide-in-right": "slide-in-right 0.3s ease-out",
        "slide-up": "slide-up 0.2s ease-out",
        "slide-down": "slide-down 0.15s ease-out",
        "shimmer": "shimmer 1.5s infinite",
        "spin": "spin 1s linear infinite",
        "pulse-subtle": "pulse-subtle 2s ease-in-out infinite",
        "pulse-slow": "pulse-slow 5s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
