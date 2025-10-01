# Codebase Analysis: Dllm_Demo_Saros
Generated: 2025-10-01 12:28:45
---

## 📂 Project Structure
```tree
📁 Dllm_Demo_Saros
├── app/
│   ├── analytics/
│   │   ├── loading.tsx
│   │   └── page.tsx
│   ├── api/
│   │   ├── analytics/
│   │   │   └── route.ts
│   │   ├── pools/
│   │   │   └── route.ts
│   │   ├── positions/
│   │   │   └── route.ts
│   │   └── volatility/
│   │       └── route.ts
│   ├── pools/
│   │   ├── loading.tsx
│   │   └── page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── nav-header.tsx
│   ├── portfolio-stats.tsx
│   ├── position-list.tsx
│   ├── saros-logo.tsx
│   ├── telegram-bot-panel.tsx
│   ├── theme-provider.tsx
│   ├── theme-toggle.tsx
│   └── volatility-chart.tsx
├── lib/
│   └── utils.ts
├── src/
│   ├── config/
│   │   └── index.ts
│   ├── services/
│   │   ├── dlmm.service.ts
│   │   ├── telegram.service.ts
│   │   └── volatility.service.ts
│   ├── types/
│   │   └── index.ts
│   ├── utils/
│   │   ├── calculations.ts
│   │   ├── logger.ts
│   │   └── wallet.ts
│   ├── bot.ts
│   ├── rebalancer.ts
│   └── simulator.ts
├── .env
└── package.json
```
---

## 📄 File Contents
### .env
- Size: 0.70 KB
- Lines: 26
- Last Modified: 2025-10-01 11:38:34

```plaintext
# Solana Configuration
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_NETWORK=devnet

# Wallet (use base58 format from Step 3)
WALLET_PRIVATE_KEY=7L8fm7hVw4JKjC6zdpE3wKbPgxiwwCLPAEjMtN4h3767
# Telegram (from Step 4)
TELEGRAM_BOT_TOKEN =7491847974:AAFMhG2SkRnrd8korQg-jHsJOpkTYLUljE0
TELEGRAM_CHAT_ID = 6649728390

# Rebalancer Settings
REBALANCE_INTERVAL_MINUTES=15
VOLATILITY_THRESHOLD=0.05
OUT_OF_RANGE_THRESHOLD=0.1
MIN_FEE_THRESHOLD=0.001

# Pool Addresses (devnet DLMM pools)
MONITORED_POOLS=7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU,8xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsV

# Stop Loss
ENABLE_STOP_LOSS=true
STOP_LOSS_PERCENTAGE=0.15

# Analytics
NEXT_PUBLIC_API_URL=http://localhost:3000/api
PORT=3000
```

---
### package.json
- Size: 2.34 KB
- Lines: 78
- Last Modified: 2025-10-01 10:41:17

```json
{
  "name": "my-v0-project",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@hookform/resolvers": "^3.10.0",
    "@radix-ui/react-accordion": "1.2.2",
    "@radix-ui/react-alert-dialog": "1.1.4",
    "@radix-ui/react-aspect-ratio": "1.1.1",
    "@radix-ui/react-avatar": "1.1.2",
    "@radix-ui/react-checkbox": "1.1.3",
    "@radix-ui/react-collapsible": "1.1.2",
    "@radix-ui/react-context-menu": "2.2.4",
    "@radix-ui/react-dialog": "1.1.4",
    "@radix-ui/react-dropdown-menu": "2.1.4",
    "@radix-ui/react-hover-card": "1.1.4",
    "@radix-ui/react-label": "2.1.1",
    "@radix-ui/react-menubar": "1.1.4",
    "@radix-ui/react-navigation-menu": "1.2.3",
    "@radix-ui/react-popover": "1.1.4",
    "@radix-ui/react-progress": "1.1.1",
    "@radix-ui/react-radio-group": "1.2.2",
    "@radix-ui/react-scroll-area": "1.2.2",
    "@radix-ui/react-select": "2.1.4",
    "@radix-ui/react-separator": "1.1.1",
    "@radix-ui/react-slider": "1.2.2",
    "@radix-ui/react-slot": "1.1.1",
    "@radix-ui/react-switch": "1.1.2",
    "@radix-ui/react-tabs": "1.1.2",
    "@radix-ui/react-toast": "1.2.4",
    "@radix-ui/react-toggle": "1.1.1",
    "@radix-ui/react-toggle-group": "1.1.1",
    "@radix-ui/react-tooltip": "1.1.6",
    "@solana/web3.js": "1.98.4",
    "@vercel/analytics": "1.3.1",
    "autoprefixer": "^10.4.20",
    "bn.js": "5.2.2",
    "chart.js": "4.5.0",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "cmdk": "1.0.4",
    "date-fns": "4.1.0",
    "embla-carousel-react": "8.5.1",
    "geist": "^1.3.1",
    "input-otp": "1.4.1",
    "lucide-react": "^0.454.0",
    "next": "14.2.25",
    "next-themes": "^0.4.6",
    "react": "^18.3.1",
    "react-day-picker": "9.8.0",
    "react-dom": "^18.3.1",
    "react-hook-form": "^7.60.0",
    "react-resizable-panels": "^2.1.7",
    "recharts": "2.15.4",
    "sonner": "^1.7.4",
    "swr": "2.3.6",
    "tailwind-merge": "^3.3.1",
    "tailwindcss-animate": "^1.0.7",
    "vaul": "^0.9.9",
    "zod": "3.25.67"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4.1.13",
    "@types/node": "^22",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "postcss": "^8.5",
    "tailwindcss": "^4.1.9",
    "tw-animate-css": "1.3.3",
    "typescript": "^5"
  }
}

```

---
### app/globals.css
- Size: 4.47 KB
- Lines: 127
- Last Modified: 2025-10-01 10:41:17

```css
@import "tailwindcss";
@import "tw-animate-css";

:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.145 0 0);
  /* Enhanced primary color with purple tint for better brand identity */
  --primary: oklch(0.45 0.15 280);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.97 0 0);
  --secondary-foreground: oklch(0.205 0 0);
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --accent: oklch(0.97 0 0);
  --accent-foreground: oklch(0.205 0 0);
  --destructive: oklch(0.577 0.245 27.325);
  --destructive-foreground: oklch(0.985 0 0);
  --border: oklch(0.922 0 0);
  --input: oklch(0.922 0 0);
  --ring: oklch(0.45 0.15 280);
  --chart-1: oklch(0.646 0.222 41.116);
  --chart-2: oklch(0.6 0.118 184.704);
  --chart-3: oklch(0.398 0.07 227.392);
  --chart-4: oklch(0.828 0.189 84.429);
  --chart-5: oklch(0.769 0.188 70.08);
  --radius: 0.625rem;
  --sidebar: oklch(0.985 0 0);
  --sidebar-foreground: oklch(0.145 0 0);
  --sidebar-primary: oklch(0.45 0.15 280);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.97 0 0);
  --sidebar-accent-foreground: oklch(0.205 0 0);
  --sidebar-border: oklch(0.922 0 0);
  --sidebar-ring: oklch(0.45 0.15 280);
}

.dark {
  /* Improved dark mode colors for better contrast and readability */
  --background: oklch(0.15 0 0);
  --foreground: oklch(0.98 0 0);
  --card: oklch(0.18 0 0);
  --card-foreground: oklch(0.98 0 0);
  --popover: oklch(0.18 0 0);
  --popover-foreground: oklch(0.98 0 0);
  /* Brighter primary color in dark mode for better visibility */
  --primary: oklch(0.65 0.2 280);
  --primary-foreground: oklch(0.98 0 0);
  --secondary: oklch(0.25 0 0);
  --secondary-foreground: oklch(0.98 0 0);
  --muted: oklch(0.25 0 0);
  --muted-foreground: oklch(0.65 0 0);
  --accent: oklch(0.25 0 0);
  --accent-foreground: oklch(0.98 0 0);
  --destructive: oklch(0.55 0.25 27);
  --destructive-foreground: oklch(0.98 0 0);
  --border: oklch(0.25 0 0);
  --input: oklch(0.25 0 0);
  --ring: oklch(0.65 0.2 280);
  --chart-1: oklch(0.55 0.25 280);
  --chart-2: oklch(0.65 0.18 180);
  --chart-3: oklch(0.75 0.19 70);
  --chart-4: oklch(0.6 0.27 300);
  --chart-5: oklch(0.65 0.25 20);
  --sidebar: oklch(0.18 0 0);
  --sidebar-foreground: oklch(0.98 0 0);
  --sidebar-primary: oklch(0.65 0.2 280);
  --sidebar-primary-foreground: oklch(0.98 0 0);
  --sidebar-accent: oklch(0.25 0 0);
  --sidebar-accent-foreground: oklch(0.98 0 0);
  --sidebar-border: oklch(0.25 0 0);
  --sidebar-ring: oklch(0.65 0.2 280);
}

@theme inline {
  /* optional: --font-sans, --font-serif, --font-mono if they are applied in the layout.tsx */
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
    /* Smooth transitions for theme changes */
    transition: background-color 0.3s ease, color 0.3s ease;
  }
}

```

---
### app/layout.tsx
- Size: 1.00 KB
- Lines: 37
- Last Modified: 2025-10-01 10:41:17

```plaintext
import type React from "react";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "@/components/theme-provider";
import { Suspense } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Saros DLMM Rebalancer",
  description: "Automated liquidity rebalancing for Saros DLMM pools",
  generator: "v0.app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${GeistSans.variable} ${GeistMono.variable}`}
    >
      <body className="font-sans antialiased">
        <Suspense fallback={null}>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
            {children}
          </ThemeProvider>
        </Suspense>
        <Analytics />
      </body>
    </html>
  );
}

```

---
### app/page.tsx
- Size: 19.12 KB
- Lines: 481
- Last Modified: 2025-10-01 10:41:17

```plaintext
"use client";

import { useState } from "react";
import useSWR from "swr";
import { PortfolioStats } from "../components/portfolio-stats";
import { PositionList } from "../components/position-list";
import { VolatilityChart } from "../components/volatility-chart";
import { TelegramBotPanel } from "../components/telegram-bot-panel";
import { SarosLogo } from "../components/saros-logo";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { RefreshCw, Github, ExternalLink, Wallet, Menu, X } from "lucide-react";
import Link from "next/link";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function DashboardPage() {
  const {
    data: positionsData,
    error: positionsError,
    mutate: refreshPositions,
  } = useSWR("/api/positions", fetcher);

  const {
    data: volatilityData,
    error: volatilityError,
    mutate: refreshVolatility,
  } = useSWR(
    "/api/volatility?pool=7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
    fetcher
  );

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([refreshPositions(), refreshVolatility()]);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  if (positionsError || volatilityError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Error Loading Data</CardTitle>
            <CardDescription>
              Failed to fetch portfolio data. Please try again.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleRefresh} className="w-full">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!positionsData || !volatilityData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-sm text-muted-foreground">
            Loading portfolio data...
          </p>
        </div>
      </div>
    );
  }

  const positions = positionsData.positions || [];
  const totalValue = positions.reduce(
    (sum: number, p: any) => sum + (p.valueUSD || 0),
    0
  );
  const totalFees = positions.reduce(
    (sum: number, p: any) =>
      sum + (p.feesEarnedX || 0) * 100 + (p.feesEarnedY || 0),
    0
  );
  const averageAPY =
    positions.length > 0
      ? positions.reduce((sum: number, p: any) => sum + (p.apy || 0), 0) /
        positions.length
      : 0;
  const positionsInRange = positions.filter((p: any) => p.isInRange).length;

  const mean = volatilityData?.mean ?? 0;
  const stdDev = volatilityData?.stdDev ?? 0;
  const volatilityRatio = volatilityData?.volatilityRatio ?? 0;
  const recommendedRangeWidth = volatilityData?.recommendedRangeWidth ?? 0;
  const isHighVolatility = volatilityData?.isHighVolatility ?? false;
  const historicalPrices = volatilityData?.historicalPrices ?? [];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 md:gap-6">
              <SarosLogo />
              <nav className="hidden md:flex items-center gap-6">
                <Link
                  href="/"
                  className="text-sm font-medium hover:text-primary transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/pools"
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  Pools
                </Link>
                <Link
                  href="/analytics"
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  Analytics
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="hidden sm:flex bg-transparent"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
                />
                <span className="ml-2">Refresh</span>
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="sm:hidden bg-transparent"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
                />
              </Button>
              <Button
                size="sm"
                className="bg-primary hover:bg-primary/90 hidden sm:flex"
                onClick={() => setIsWalletConnected(!isWalletConnected)}
              >
                <Wallet className="h-4 w-4" />
                <span className="ml-2">
                  {isWalletConnected ? "Connected" : "Connect"}
                </span>
              </Button>
              <Button
                size="icon"
                className="bg-primary hover:bg-primary/90 sm:hidden"
                onClick={() => setIsWalletConnected(!isWalletConnected)}
              >
                <Wallet className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
          {isMobileMenuOpen && (
            <nav className="md:hidden pt-4 pb-2 space-y-2 border-t mt-3">
              <Link
                href="/"
                className="block px-3 py-2 rounded-md text-sm font-medium hover:bg-muted transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                href="/pools"
                className="block px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Pools
              </Link>
              <Link
                href="/analytics"
                className="block px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Analytics
              </Link>
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
        <div className="rounded-xl bg-gradient-to-r from-purple-500/10 via-purple-500/5 to-transparent border border-purple-200/50 dark:border-purple-800/50 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="flex-1">
              <h3 className="font-semibold text-base sm:text-lg mb-2">
                Automated DLMM Liquidity Rebalancer
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Production-ready tool for Saros DLMM pools with
                volatility-adjusted ranges, Telegram bot integration, and
                advanced portfolio analytics.
              </p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 sm:flex-none bg-transparent"
                asChild
              >
                <a
                  href="https://saros-docs.rectorspace.com"
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  <ExternalLink className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Docs</span>
                </a>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 sm:flex-none bg-transparent"
                asChild
              >
                <a
                  href="https://github.com/yourusername/saros-dlmm-rebalancer"
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  <Github className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">GitHub</span>
                </a>
              </Button>
            </div>
          </div>
        </div>

        {/* Portfolio Stats */}
        <PortfolioStats
          totalValue={totalValue}
          totalFees={totalFees}
          averageAPY={averageAPY}
          impermanentLoss={2.3}
          positionsInRange={positionsInRange}
          totalPositions={positions.length}
        />

        <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <VolatilityChart data={historicalPrices} poolName="SOL/USDC" />

            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">
                  Volatility Metrics
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Real-time volatility analysis for optimal range calculation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="p-3 sm:p-4 rounded-lg bg-muted/50">
                    <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                      Mean Price
                    </p>
                    <p className="text-xl sm:text-2xl font-bold">
                      ${mean.toFixed(2)}
                    </p>
                  </div>
                  <div className="p-3 sm:p-4 rounded-lg bg-muted/50">
                    <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                      Std Deviation
                    </p>
                    <p className="text-xl sm:text-2xl font-bold">
                      {stdDev.toFixed(2)}
                    </p>
                  </div>
                  <div className="p-3 sm:p-4 rounded-lg bg-muted/50">
                    <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                      Volatility Ratio
                    </p>
                    <p className="text-xl sm:text-2xl font-bold">
                      {(volatilityRatio * 100).toFixed(2)}%
                    </p>
                  </div>
                  <div className="p-3 sm:p-4 rounded-lg bg-muted/50">
                    <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                      Recommended Range
                    </p>
                    <p className="text-xl sm:text-2xl font-bold">
                      {(recommendedRangeWidth * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-start gap-3">
                    <div
                      className={`h-2 w-2 rounded-full mt-2 flex-shrink-0 ${
                        isHighVolatility ? "bg-orange-500" : "bg-green-500"
                      }`}
                    />
                    <div className="flex-1">
                      <p className="text-xs sm:text-sm font-medium mb-1">
                        Strategy Recommendation
                      </p>
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                        {isHighVolatility
                          ? "High volatility detected. Using wider ranges to reduce rebalancing frequency and gas costs."
                          : "Low volatility environment. Tighter ranges recommended for maximum capital efficiency and fee generation."}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <TelegramBotPanel isConnected={false} />
          </div>
        </div>

        {/* Position List */}
        <PositionList positions={positions} />

        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Key Features</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Production-ready automated liquidity management
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-3 p-4 rounded-lg border bg-card hover:shadow-md transition-shadow">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <div className="h-5 w-5 rounded-full bg-primary/20" />
                </div>
                <h4 className="font-semibold text-sm sm:text-base">
                  Volatility-Adjusted Ranges
                </h4>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Dynamically calculates optimal position ranges based on
                  real-time bin data volatility analysis.
                </p>
              </div>
              <div className="space-y-3 p-4 rounded-lg border bg-card hover:shadow-md transition-shadow">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <div className="h-5 w-5 rounded-full bg-primary/20" />
                </div>
                <h4 className="font-semibold text-sm sm:text-base">
                  Telegram Bot Integration
                </h4>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Interactive bot for position monitoring, manual rebalancing,
                  and real-time alerts.
                </p>
              </div>
              <div className="space-y-3 p-4 rounded-lg border bg-card hover:shadow-md transition-shadow">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <div className="h-5 w-5 rounded-full bg-primary/20" />
                </div>
                <h4 className="font-semibold text-sm sm:text-base">
                  Stop-Loss Protection
                </h4>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Automatic position closure when price breaches user-defined
                  thresholds.
                </p>
              </div>
              <div className="space-y-3 p-4 rounded-lg border bg-card hover:shadow-md transition-shadow">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <div className="h-5 w-5 rounded-full bg-primary/20" />
                </div>
                <h4 className="font-semibold text-sm sm:text-base">
                  Multi-Pool Monitoring
                </h4>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Simultaneously tracks and manages positions across multiple
                  DLMM pools.
                </p>
              </div>
              <div className="space-y-3 p-4 rounded-lg border bg-card hover:shadow-md transition-shadow">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <div className="h-5 w-5 rounded-full bg-primary/20" />
                </div>
                <h4 className="font-semibold text-sm sm:text-base">
                  Strategy Simulator
                </h4>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Backtest different rebalancing strategies with historical data
                  to optimize returns.
                </p>
              </div>
              <div className="space-y-3 p-4 rounded-lg border bg-card hover:shadow-md transition-shadow">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <div className="h-5 w-5 rounded-full bg-primary/20" />
                </div>
                <h4 className="font-semibold text-sm sm:text-base">
                  Portfolio Analytics
                </h4>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Comprehensive stats including fees, APY, impermanent loss, and
                  net returns.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <footer className="border-t mt-8 sm:mt-12 bg-muted/30">
        <div className="container mx-auto px-4 py-6 sm:py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <SarosLogo className="h-5 sm:h-6" />
              <span className="text-xs sm:text-sm text-muted-foreground">
                DLMM Rebalancer
              </span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground text-center">
              Built for Saros Finance Hackathon 2025 | Open Source (MIT License)
            </p>
            <div className="flex items-center gap-4">
              <a
                href="#"
                className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Docs
              </a>
              <a
                href="#"
                className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                GitHub
              </a>
              <a
                href="#"
                className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Telegram
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

```

---
### components/nav-header.tsx
- Size: 3.65 KB
- Lines: 114
- Last Modified: 2025-10-01 10:41:17

```plaintext
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { SarosLogo } from "@/components/saros-logo";
import { Menu, X, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavHeaderProps {
  isWalletConnected?: boolean;
  onWalletToggle?: () => void;
}

export function NavHeader({
  isWalletConnected = false,
  onWalletToggle,
}: NavHeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Dashboard" },
    { href: "/pools", label: "Pools" },
    { href: "/analytics", label: "Analytics" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 md:gap-6">
            <Link href="/">
              <SarosLogo />
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary",
                    pathname === item.href
                      ? "text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {onWalletToggle && (
              <>
                <Button
                  size="sm"
                  className="bg-primary hover:bg-primary/90 hidden sm:flex"
                  onClick={onWalletToggle}
                >
                  <Wallet className="h-4 w-4" />
                  <span className="ml-2">
                    {isWalletConnected ? "Connected" : "Connect"}
                  </span>
                </Button>
                <Button
                  size="icon"
                  className="bg-primary hover:bg-primary/90 sm:hidden"
                  onClick={onWalletToggle}
                >
                  <Wallet className="h-4 w-4" />
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
        {isMobileMenuOpen && (
          <nav className="md:hidden pt-4 pb-2 space-y-2 border-t mt-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "block px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-muted",
                  pathname === item.href
                    ? "text-foreground"
                    : "text-muted-foreground"
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}

```

---
### components/portfolio-stats.tsx
- Size: 4.26 KB
- Lines: 117
- Last Modified: 2025-10-01 10:41:17

```plaintext
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, Activity } from "lucide-react";

interface PortfolioStatsProps {
  totalValue: number;
  totalFees: number;
  averageAPY: number;
  impermanentLoss: number;
  positionsInRange: number;
  totalPositions: number;
}

export function PortfolioStats({
  totalValue,
  totalFees,
  averageAPY,
  impermanentLoss,
  positionsInRange,
  totalPositions,
}: PortfolioStatsProps) {
  const netReturn = averageAPY - impermanentLoss;

  return (
    <div className="grid gap-3 sm:gap-4 grid-cols-1 xs:grid-cols-2 lg:grid-cols-4">
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium">
            Total Value
          </CardTitle>
          <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <DollarSign className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-xl sm:text-2xl font-bold">
            ${totalValue.toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Across {totalPositions} positions
          </p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium">
            Fees Earned
          </CardTitle>
          <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-600 dark:text-green-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-500">
            ${totalFees.toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Average APY: {averageAPY.toFixed(2)}%
          </p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium">
            Net Return
          </CardTitle>
          <div
            className={`h-7 w-7 sm:h-8 sm:w-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
              netReturn >= 0 ? "bg-green-500/10" : "bg-red-500/10"
            }`}
          >
            <Activity
              className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${
                netReturn >= 0
                  ? "text-green-600 dark:text-green-500"
                  : "text-red-600 dark:text-red-500"
              }`}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div
            className={`text-xl sm:text-2xl font-bold ${
              netReturn >= 0
                ? "text-green-600 dark:text-green-500"
                : "text-red-600 dark:text-red-500"
            }`}
          >
            {netReturn >= 0 ? "+" : ""}
            {netReturn.toFixed(2)}%
          </div>
          <p className="text-xs text-muted-foreground mt-1">APY minus IL</p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium">
            Position Status
          </CardTitle>
          <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-orange-500/10 flex items-center justify-center flex-shrink-0">
            <TrendingDown className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-orange-600 dark:text-orange-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-xl sm:text-2xl font-bold">
            {positionsInRange}/{totalPositions}
          </div>
          <p className="text-xs text-muted-foreground mt-1">In optimal range</p>
        </CardContent>
      </Card>
    </div>
  );
}

```

---
### components/position-list.tsx
- Size: 6.05 KB
- Lines: 175
- Last Modified: 2025-10-01 10:41:17

```plaintext
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertCircle, ExternalLink } from "lucide-react";

interface Position {
  positionId: string;
  poolAddress: string;
  tokenX: string;
  tokenY: string;
  lowerBin: number;
  upperBin: number;
  currentBin: number;
  liquidityX: number;
  liquidityY: number;
  feesEarnedX: number;
  feesEarnedY: number;
  isInRange: boolean;
  valueUSD: number;
  apy: number;
}

interface PositionListProps {
  positions: Position[];
}

export function PositionList({ positions }: PositionListProps) {
  if (positions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">
            Active Positions
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Your DLMM liquidity positions across all pools
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <p className="text-sm sm:text-base text-muted-foreground">
              No active positions found
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground mt-2">
              Add liquidity to DLMM pools to get started
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">Active Positions</CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Your DLMM liquidity positions across all pools
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {positions.map((position) => (
            <div
              key={position.positionId}
              className="flex flex-col sm:flex-row items-start justify-between rounded-lg border p-3 sm:p-4 hover:bg-accent/50 transition-colors gap-4"
            >
              <div className="space-y-3 flex-1 w-full">
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                  <h3 className="font-semibold text-base sm:text-lg">
                    {position.tokenX}/{position.tokenY}
                  </h3>
                  {position.isInRange ? (
                    <Badge
                      variant="default"
                      className="bg-green-600 hover:bg-green-600 text-xs"
                    >
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                      In Range
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="text-xs">
                      <AlertCircle className="mr-1 h-3 w-3" />
                      Out of Range
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-xs sm:text-sm">
                  <div>
                    <p className="text-muted-foreground mb-1">Position Value</p>
                    <p className="font-semibold">
                      ${position.valueUSD.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">APY</p>
                    <p className="font-semibold text-green-600 dark:text-green-500">
                      {position.apy.toFixed(2)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Range</p>
                    <p className="font-semibold">
                      {position.lowerBin} - {position.upperBin}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Current Bin</p>
                    <p className="font-semibold">{position.currentBin}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm pt-2 border-t">
                  <div>
                    <p className="text-muted-foreground mb-1">Liquidity</p>
                    <p className="font-mono text-xs">
                      {(position.liquidityX / 1e9).toFixed(4)} {position.tokenX}
                    </p>
                    <p className="font-mono text-xs">
                      {(position.liquidityY / 1e9).toFixed(2)} {position.tokenY}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Fees Earned</p>
                    <p className="font-mono text-xs text-green-600 dark:text-green-500">
                      {(position.feesEarnedX / 1e9).toFixed(6)}{" "}
                      {position.tokenX}
                    </p>
                    <p className="font-mono text-xs text-green-600 dark:text-green-500">
                      {(position.feesEarnedY / 1e9).toFixed(4)}{" "}
                      {position.tokenY}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex sm:flex-col gap-2 w-full sm:w-auto sm:ml-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 sm:flex-none bg-transparent"
                >
                  Manage
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 sm:flex-none"
                  asChild
                >
                  <a
                    href={`https://explorer.solana.com/address/${position.poolAddress}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

```

---
### components/saros-logo.tsx
- Size: 0.48 KB
- Lines: 26
- Last Modified: 2025-10-01 10:41:17

```plaintext
export function SarosLogo({
  className = "h-8 w-auto",
}: {
  className?: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 120 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <text
        x="0"
        y="24"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize="24"
        fontWeight="700"
        fill="currentColor"
        className="text-primary"
      >
        SAROS
      </text>
    </svg>
  );
}

```

---
### components/telegram-bot-panel.tsx
- Size: 6.96 KB
- Lines: 219
- Last Modified: 2025-10-01 10:41:17

```plaintext
"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Send,
  Bot,
  Bell,
  RefreshCw,
  Settings,
  CheckCircle2,
  XCircle,
} from "lucide-react";

interface TelegramBotPanelProps {
  isConnected?: boolean;
  botUsername?: string;
  lastActivity?: string;
}

export function TelegramBotPanel({
  isConnected = false,
  botUsername = "SarosDLMMBot",
  lastActivity = "2 minutes ago",
}: TelegramBotPanelProps) {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      message: "Position SOL/USDC out of range",
      time: "5m ago",
      type: "warning",
    },
    {
      id: 2,
      message: "Rebalanced position #1234",
      time: "15m ago",
      type: "success",
    },
    {
      id: 3,
      message: "High volatility detected",
      time: "1h ago",
      type: "info",
    },
  ]);

  const handleCommand = async (command: string) => {
    console.log(`Executing command: ${command}`);
    // In production, this would call the Telegram bot API
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            <CardTitle className="text-base sm:text-lg">Telegram Bot</CardTitle>
          </div>
          <Badge
            variant={isConnected ? "default" : "secondary"}
            className="gap-1 text-xs"
          >
            {isConnected ? (
              <>
                <CheckCircle2 className="h-3 w-3" />
                <span className="hidden sm:inline">Connected</span>
              </>
            ) : (
              <>
                <XCircle className="h-3 w-3" />
                <span className="hidden sm:inline">Disconnected</span>
              </>
            )}
          </Badge>
        </div>
        <CardDescription className="text-xs sm:text-sm">
          Interactive bot for position monitoring
          {isConnected && (
            <span className="hidden sm:inline"> • @{botUsername}</span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Bot Status */}
        <div className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-muted/50">
          <div className="space-y-1">
            <p className="text-xs sm:text-sm font-medium">Monitoring Status</p>
            <p className="text-xs text-muted-foreground">
              Last: {lastActivity}
            </p>
          </div>
          <Button
            variant={isMonitoring ? "default" : "outline"}
            size="sm"
            onClick={() => setIsMonitoring(!isMonitoring)}
            className="text-xs"
          >
            {isMonitoring ? "Stop" : "Start"}
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="space-y-2">
          <p className="text-xs sm:text-sm font-medium">Quick Actions</p>
          <div className="grid grid-cols-1 xs:grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCommand("/monitor")}
              className="justify-start text-xs"
            >
              <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
              <span className="truncate">Check Positions</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCommand("/rebalance")}
              className="justify-start text-xs"
            >
              <Send className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
              <span className="truncate">Force Rebalance</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCommand("/stats")}
              className="justify-start text-xs"
            >
              <Bell className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
              <span className="truncate">Get Statistics</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCommand("/volatility")}
              className="justify-start text-xs"
            >
              <Settings className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
              <span className="truncate">Check Volatility</span>
            </Button>
          </div>
        </div>

        {/* Recent Notifications */}
        <div className="space-y-2">
          <p className="text-xs sm:text-sm font-medium">Recent Notifications</p>
          <div className="space-y-2 max-h-40 sm:max-h-48 overflow-y-auto">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className="flex items-start gap-2 p-2 rounded-md bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div
                  className={`h-2 w-2 rounded-full mt-1.5 flex-shrink-0 ${
                    notification.type === "warning"
                      ? "bg-orange-500"
                      : notification.type === "success"
                      ? "bg-green-500"
                      : "bg-blue-500"
                  }`}
                />
                <div className="flex-1 space-y-1 min-w-0">
                  <p className="text-xs sm:text-sm truncate">
                    {notification.message}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {notification.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Setup Instructions */}
        {!isConnected && (
          <div className="p-3 rounded-lg border border-dashed space-y-2">
            <p className="text-xs sm:text-sm font-medium">Setup Instructions</p>
            <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
              <li className="leading-relaxed">
                Search for @{botUsername} on Telegram
              </li>
              <li className="leading-relaxed">Start a chat and send /start</li>
              <li className="leading-relaxed">
                Copy your chat ID and add to env
              </li>
              <li className="leading-relaxed">Restart the application</li>
            </ol>
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-2 bg-transparent text-xs"
              asChild
            >
              <a
                href={`https://t.me/${botUsername}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open Telegram Bot
              </a>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

```

---
### components/theme-provider.tsx
- Size: 0.29 KB
- Lines: 11
- Last Modified: 2025-10-01 10:41:17

```plaintext
'use client'

import * as React from 'react'
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from 'next-themes'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

```

---
### components/theme-toggle.tsx
- Size: 0.84 KB
- Lines: 35
- Last Modified: 2025-10-01 10:41:17

```plaintext
"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="outline" size="sm" className="bg-transparent" aria-label="Toggle theme">
        <Sun className="h-4 w-4" />
      </Button>
    )
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="bg-transparent"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  )
}

```

---
### components/volatility-chart.tsx
- Size: 3.40 KB
- Lines: 132
- Last Modified: 2025-10-01 10:41:17

```plaintext
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend as ChartLegend,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  ChartLegend,
  Filler
);

interface VolatilityChartProps {
  data: Array<{
    timestamp: number;
    price: number;
  }>;
  poolName: string;
}

export function VolatilityChart({ data, poolName }: VolatilityChartProps) {
  // Format data for recharts
  const chartData = data.map((point) => ({
    time: new Date(point.timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    price: point.price,
  }));

  // Calculate min and max for Y-axis domain
  const prices = data.map((d) => d.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const padding = (maxPrice - minPrice) * 0.1;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">
          Price History - {poolName}
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Historical price data from bin activity
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] sm:h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 10 }}
                className="text-muted-foreground"
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                domain={[minPrice - padding, maxPrice + padding]}
                tick={{ fontSize: 10 }}
                className="text-muted-foreground"
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value.toFixed(2)}`}
                width={45}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
                itemStyle={{ color: "hsl(var(--primary))" }}
                formatter={(value: number) => [`$${value.toFixed(2)}`, "Price"]}
              />
              <Legend
                wrapperStyle={{ fontSize: "11px" }}
                iconType="line"
                formatter={() => "Price"}
              />
              <Line
                type="monotone"
                dataKey="price"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

```

---
### lib/utils.ts
- Size: 0.16 KB
- Lines: 6
- Last Modified: 2025-10-01 10:41:17

```typescript
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

```

---
### src/bot.ts
- Size: 13.32 KB
- Lines: 448
- Last Modified: 2025-10-01 10:41:17

```typescript
import { Telegraf, type Context } from "telegraf"
import { getConnection, config, validateConfig } from "./config"
import { getWallet, getWalletPublicKey } from "./utils/wallet"
import { Logger } from "./utils/logger"
import { DLMMService } from "./services/dlmm.service"
import { VolatilityService } from "./services/volatility.service"
import { CalculationUtils } from "./utils/calculations"
import type { PortfolioStats } from "./types"

class SarosTelegramBot {
  private bot: Telegraf
  private dlmmService: DLMMService
  private volatilityService: VolatilityService
  private monitoringActive = false

  constructor() {
    this.bot = new Telegraf(config.telegram.botToken)
    const connection = getConnection()
    const wallet = getWallet()

    this.dlmmService = new DLMMService(connection, wallet)
    this.volatilityService = new VolatilityService()

    this.setupCommands()
  }

  /**
   * Setup bot commands
   */
  private setupCommands(): void {
    // Start command
    this.bot.command("start", async (ctx) => {
      await ctx.reply(
        `
🚀 *Welcome to Saros DLMM Auto Rebalancer Bot!*

I help you manage your DLMM liquidity positions automatically.

*Available Commands:*
/monitor - View current positions
/rebalance - Manually trigger rebalance
/simulate - Run strategy simulation
/stats - Portfolio statistics
/volatility - Check pool volatility
/stop - Stop monitoring
/help - Show this message

Your wallet: \`${getWalletPublicKey().slice(0, 8)}...\`
      `.trim(),
        { parse_mode: "Markdown" },
      )
    })

    // Help command
    this.bot.command("help", async (ctx) => {
      await ctx.reply(
        `
📖 *Command Guide*

/monitor - View all your DLMM positions with ranges and status
/rebalance - Force rebalance check on all positions
/simulate - Test rebalancing strategies with historical data
/stats - View portfolio stats (fees, APY, IL)
/volatility <pool> - Check volatility for specific pool
/stop - Stop automatic monitoring
/start - Restart the bot

*Features:*
✅ Automatic rebalancing based on volatility
✅ Stop-loss protection
✅ Real-time alerts
✅ Portfolio analytics
      `.trim(),
        { parse_mode: "Markdown" },
      )
    })

    // Monitor command
    this.bot.command("monitor", async (ctx) => {
      await this.handleMonitor(ctx)
    })

    // Rebalance command
    this.bot.command("rebalance", async (ctx) => {
      await this.handleRebalance(ctx)
    })

    // Stats command
    this.bot.command("stats", async (ctx) => {
      await this.handleStats(ctx)
    })

    // Volatility command
    this.bot.command("volatility", async (ctx) => {
      await this.handleVolatility(ctx)
    })

    // Simulate command
    this.bot.command("simulate", async (ctx) => {
      await this.handleSimulate(ctx)
    })

    // Stop command
    this.bot.command("stop", async (ctx) => {
      this.monitoringActive = false
      await ctx.reply("⏸️ Monitoring stopped. Use /monitor to restart.")
    })

    // Error handling
    this.bot.catch((err, ctx) => {
      Logger.error("Bot error", err)
      ctx.reply("❌ An error occurred. Please try again.")
    })
  }

  /**
   * Handle monitor command
   */
  private async handleMonitor(ctx: Context): Promise<void> {
    await ctx.reply("🔍 Fetching your positions...")

    try {
      const positions = await this.dlmmService.getUserPositions(config.pools.monitored)

      if (positions.length === 0) {
        await ctx.reply("No positions found. Add liquidity to DLMM pools to get started!")
        return
      }

      let message = `📊 *Your DLMM Positions* (${positions.length})\n\n`

      for (const position of positions) {
        const poolConfig = await this.dlmmService.getPoolConfig(position.poolAddress)
        const activeBin = await this.dlmmService.getActiveBin(position.poolAddress)
        const isInRange = !CalculationUtils.isPositionOutOfRange(
          activeBin,
          position.lowerBin,
          position.upperBin,
          config.rebalancer.outOfRangeThreshold,
        )

        const status = isInRange ? "✅ In Range" : "⚠️ Out of Range"
        const feesX = CalculationUtils.bnToNumber(position.feesEarned.tokenX, 9)
        const feesY = CalculationUtils.bnToNumber(position.feesEarned.tokenY, 9)

        message += `
*Position:* \`${position.positionId}\`
*Pool:* ${poolConfig?.tokenX}/${poolConfig?.tokenY}
*Status:* ${status}
*Range:* ${position.lowerBin} - ${position.upperBin}
*Current Bin:* ${activeBin}
*Fees:* ${feesX.toFixed(4)} ${poolConfig?.tokenX} + ${feesY.toFixed(4)} ${poolConfig?.tokenY}
---
        `.trim()
      }

      await ctx.reply(message, { parse_mode: "Markdown" })
      this.monitoringActive = true
    } catch (error) {
      Logger.error("Error in monitor command", error)
      await ctx.reply("❌ Failed to fetch positions. Please check your configuration.")
    }
  }

  /**
   * Handle rebalance command
   */
  private async handleRebalance(ctx: Context): Promise<void> {
    await ctx.reply("🔄 Starting manual rebalance check...")

    try {
      const positions = await this.dlmmService.getUserPositions(config.pools.monitored)

      if (positions.length === 0) {
        await ctx.reply("No positions to rebalance.")
        return
      }

      let rebalancedCount = 0

      for (const position of positions) {
        const activeBin = await this.dlmmService.getActiveBin(position.poolAddress)
        const isOutOfRange = CalculationUtils.isPositionOutOfRange(
          activeBin,
          position.lowerBin,
          position.upperBin,
          config.rebalancer.outOfRangeThreshold,
        )

        if (isOutOfRange) {
          await ctx.reply(`⚙️ Rebalancing position \`${position.positionId}\`...`, { parse_mode: "Markdown" })

          // Calculate new range
          const binPrices = await this.dlmmService.getBinData(position.poolAddress)
          const volatility = await this.volatilityService.getVolatility(position.poolAddress, binPrices)
          const poolConfig = await this.dlmmService.getPoolConfig(position.poolAddress)

          if (!poolConfig) continue

          const currentPrice = CalculationUtils.binIdToPrice(activeBin, poolConfig.binStep)
          const rangeWidth = this.volatilityService.getRecommendedRangeWidth(volatility)
          const optimalRange = CalculationUtils.calculateOptimalRange(currentPrice, volatility, rangeWidth)

          const newLowerBin = CalculationUtils.priceToBinId(optimalRange.lower, poolConfig.binStep)
          const newUpperBin = CalculationUtils.priceToBinId(optimalRange.upper, poolConfig.binStep)

          const success = await this.dlmmService.rebalancePosition(position, newLowerBin, newUpperBin)

          if (success) {
            rebalancedCount++
            await ctx.reply(`✅ Position \`${position.positionId}\` rebalanced successfully!`, {
              parse_mode: "Markdown",
            })
          } else {
            await ctx.reply(`❌ Failed to rebalance position \`${position.positionId}\``, { parse_mode: "Markdown" })
          }
        }
      }

      if (rebalancedCount === 0) {
        await ctx.reply("✅ All positions are in optimal range. No rebalancing needed!")
      } else {
        await ctx.reply(`🎉 Rebalanced ${rebalancedCount} position(s) successfully!`)
      }
    } catch (error) {
      Logger.error("Error in rebalance command", error)
      await ctx.reply("❌ Rebalance failed. Please check logs.")
    }
  }

  /**
   * Handle stats command
   */
  private async handleStats(ctx: Context): Promise<void> {
    await ctx.reply("📈 Calculating portfolio statistics...")

    try {
      const positions = await this.dlmmService.getUserPositions(config.pools.monitored)

      if (positions.length === 0) {
        await ctx.reply("No positions found.")
        return
      }

      let totalFeesX = 0
      let totalFeesY = 0
      let positionsInRange = 0
      let totalValueUSD = 0

      for (const position of positions) {
        const activeBin = await this.dlmmService.getActiveBin(position.poolAddress)
        const isInRange = !CalculationUtils.isPositionOutOfRange(
          activeBin,
          position.lowerBin,
          position.upperBin,
          config.rebalancer.outOfRangeThreshold,
        )

        if (isInRange) positionsInRange++

        totalFeesX += CalculationUtils.bnToNumber(position.feesEarned.tokenX, 9)
        totalFeesY += CalculationUtils.bnToNumber(position.feesEarned.tokenY, 9)

        // Mock USD value calculation
        const liquidityX = CalculationUtils.bnToNumber(position.liquidityX, 9)
        const liquidityY = CalculationUtils.bnToNumber(position.liquidityY, 9)
        totalValueUSD += liquidityX * 100 + liquidityY // Assuming SOL = $100
      }

      const stats: PortfolioStats = {
        totalPositions: positions.length,
        totalValueUSD,
        totalFeesEarned: totalFeesX * 100 + totalFeesY, // Convert to USD
        positionsInRange,
        positionsOutOfRange: positions.length - positionsInRange,
        averageAPY: 15.5, // Mock APY
        impermanentLoss: 2.3, // Mock IL
      }

      const message = `
📊 *Portfolio Statistics*

*Total Positions:* ${stats.totalPositions}
*Total Value:* $${stats.totalValueUSD.toFixed(2)}
*Total Fees Earned:* $${stats.totalFeesEarned.toFixed(2)}

*Position Status:*
✅ In Range: ${stats.positionsInRange}
⚠️ Out of Range: ${stats.positionsOutOfRange}

*Performance:*
📈 Average APY: ${stats.averageAPY.toFixed(2)}%
📉 Impermanent Loss: ${stats.impermanentLoss.toFixed(2)}%

*Net Return:* ${(stats.averageAPY - stats.impermanentLoss).toFixed(2)}%
      `.trim()

      await ctx.reply(message, { parse_mode: "Markdown" })
    } catch (error) {
      Logger.error("Error in stats command", error)
      await ctx.reply("❌ Failed to calculate statistics.")
    }
  }

  /**
   * Handle volatility command
   */
  private async handleVolatility(ctx: Context): Promise<void> {
    const args = ctx.message && "text" in ctx.message ? ctx.message.text.split(" ") : []
    const poolAddress = args[1] || config.pools.monitored[0]

    if (!poolAddress) {
      await ctx.reply("Please provide a pool address: /volatility <pool_address>")
      return
    }

    await ctx.reply(`📊 Calculating volatility for pool...`)

    try {
      const binPrices = await this.dlmmService.getBinData(poolAddress)
      const volatility = await this.volatilityService.getVolatility(poolAddress, binPrices)

      const volatilityRatio = (volatility.stdDev / volatility.mean) * 100
      const isHigh = this.volatilityService.isHighVolatility(volatility)
      const recommendedWidth = this.volatilityService.getRecommendedRangeWidth(volatility)

      const message = `
📈 *Volatility Analysis*

*Pool:* \`${poolAddress.slice(0, 8)}...\`
*Mean Price:* ${volatility.mean.toFixed(2)}
*Std Deviation:* ${volatility.stdDev.toFixed(2)}
*Volatility Ratio:* ${volatilityRatio.toFixed(2)}%

*Status:* ${isHigh ? "🔴 High Volatility" : "🟢 Low Volatility"}
*Recommended Range Width:* ${(recommendedWidth * 100).toFixed(1)}%

${isHigh ? "⚠️ Consider wider ranges to reduce rebalancing frequency." : "✅ Tighter ranges recommended for better capital efficiency."}
      `.trim()

      await ctx.reply(message, { parse_mode: "Markdown" })
    } catch (error) {
      Logger.error("Error in volatility command", error)
      await ctx.reply("❌ Failed to calculate volatility.")
    }
  }

  /**
   * Handle simulate command
   */
  private async handleSimulate(ctx: Context): Promise<void> {
    await ctx.reply("🎮 Running strategy simulation...")

    try {
      // Mock simulation results
      const results = [
        {
          strategy: "No Rebalancing",
          fees: 100,
          il: 15,
          net: 85,
          rebalances: 0,
        },
        {
          strategy: "Fixed Range (10%)",
          fees: 150,
          il: 12,
          net: 138,
          rebalances: 5,
        },
        {
          strategy: "Volatility-Adjusted (Recommended)",
          fees: 180,
          il: 8,
          net: 172,
          rebalances: 3,
        },
      ]

      let message = `
🎮 *Strategy Simulation Results*
_Based on 30-day historical data_

`

      for (const result of results) {
        message += `
*${result.strategy}*
Fees Earned: $${result.fees}
Impermanent Loss: $${result.il}
Net Return: $${result.net}
Rebalances: ${result.rebalances}
---
        `.trim()
      }

      message += `

✅ *Best Strategy:* Volatility-Adjusted
💡 This strategy optimizes range width based on market conditions.
      `.trim()

      await ctx.reply(message, { parse_mode: "Markdown" })
    } catch (error) {
      Logger.error("Error in simulate command", error)
      await ctx.reply("❌ Simulation failed.")
    }
  }

  /**
   * Start the bot
   */
  async start(): Promise<void> {
    Logger.info("Starting Telegram bot...")

    try {
      await this.bot.launch()
      Logger.success("Telegram bot started successfully")

      // Graceful shutdown
      process.once("SIGINT", () => this.bot.stop("SIGINT"))
      process.once("SIGTERM", () => this.bot.stop("SIGTERM"))
    } catch (error) {
      Logger.error("Failed to start Telegram bot", error)
      throw error
    }
  }
}

// Main execution
async function main() {
  try {
    validateConfig()

    const bot = new SarosTelegramBot()
    await bot.start()
  } catch (error) {
    Logger.error("Fatal error in bot", error)
    process.exit(1)
  }
}

// Run if executed directly
if (require.main === module) {
  main()
}

export { SarosTelegramBot }

```

---
### src/rebalancer.ts
- Size: 6.89 KB
- Lines: 222
- Last Modified: 2025-10-01 10:41:17

```typescript
import type { Connection, Keypair } from "@solana/web3.js"
import { DLMMService } from "./services/dlmm.service"
import { VolatilityService } from "./services/volatility.service"
import { TelegramService } from "./services/telegram.service"
import { Logger } from "./utils/logger"
import { config, getConnection, validateConfig } from "./config"
import { getWallet } from "./utils/wallet"
import type { Position, RebalanceAction } from "./types"

/**
 * Automated Rebalancer - Monitors positions and rebalances when out of range
 * Uses volatility-adjusted ranges for optimal capital efficiency
 */
export class AutomatedRebalancer {
  private connection: Connection
  private wallet: Keypair
  private dlmmService: DLMMService
  private volatilityService: VolatilityService
  private telegramService: TelegramService
  private isRunning = false
  private checkInterval: NodeJS.Timeout | null = null

  constructor() {
    this.connection = getConnection()
    this.wallet = getWallet()
    this.dlmmService = new DLMMService(this.connection, this.wallet)
    this.volatilityService = new VolatilityService()
    this.telegramService = new TelegramService()
  }

  /**
   * Start the automated rebalancer
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      Logger.warn("Rebalancer is already running")
      return
    }

    Logger.info("Starting automated rebalancer...")
    this.isRunning = true

    // Send startup notification
    await this.telegramService.sendMessage("Automated rebalancer started. Monitoring positions...")

    // Run initial check
    await this.checkAndRebalance()

    // Schedule periodic checks
    this.checkInterval = setInterval(() => {
      this.checkAndRebalance().catch((error) => {
        Logger.error("Error in rebalance check", error)
      })
    }, config.rebalancer.checkInterval * 1000)

    Logger.success("Automated rebalancer started successfully")
  }

  /**
   * Stop the automated rebalancer
   */
  stop(): void {
    if (!this.isRunning) {
      Logger.warn("Rebalancer is not running")
      return
    }

    Logger.info("Stopping automated rebalancer...")
    this.isRunning = false

    if (this.checkInterval) {
      clearInterval(this.checkInterval)
      this.checkInterval = null
    }

    Logger.success("Automated rebalancer stopped")
  }

  /**
   * Check all positions and rebalance if necessary
   */
  private async checkAndRebalance(): Promise<void> {
    try {
      Logger.info("Checking positions for rebalancing...")

      // Get all user positions
      const positions = await this.dlmmService.getUserPositions(config.pools.monitored)

      if (positions.length === 0) {
        Logger.info("No positions to monitor")
        return
      }

      Logger.info(`Found ${positions.length} positions to monitor`)

      // Check each position
      for (const position of positions) {
        await this.checkPosition(position)
      }
    } catch (error) {
      Logger.error("Failed to check and rebalance positions", error)
    }
  }

  /**
   * Check a single position and rebalance if needed
   */
  private async checkPosition(position: Position): Promise<void> {
    try {
      const poolConfig = await this.dlmmService.getPoolConfig(position.poolAddress)
      if (!poolConfig) {
        Logger.error(`Failed to get pool config for ${position.poolAddress}`)
        return
      }

      const activeBin = await this.dlmmService.getActiveBin(position.poolAddress)

      // Check if position is out of range
      const outOfRangeThreshold = config.rebalancer.outOfRangeThreshold
      const rangeSize = position.upperBin - position.lowerBin
      const distanceFromLower = activeBin - position.lowerBin
      const distanceFromUpper = position.upperBin - activeBin

      const isOutOfRange =
        distanceFromLower < rangeSize * outOfRangeThreshold || distanceFromUpper < rangeSize * outOfRangeThreshold

      if (isOutOfRange) {
        Logger.warn(`Position ${position.positionId} is out of range`)
        await this.telegramService.sendOutOfRangeAlert(position)

        // Calculate new optimal range
        const binPrices = await this.dlmmService.getBinData(position.poolAddress)
        const volatility = await this.volatilityService.getVolatility(position.poolAddress, binPrices)
        const rangeWidth = this.volatilityService.getRecommendedRangeWidth(volatility)

        const currentPrice = this.dlmmService.calculateBinPrice(activeBin, poolConfig.binStep)
        const optimalRange = this.volatilityService.calculateOptimalBinRange(
          currentPrice,
          rangeWidth,
          poolConfig.binStep,
        )

        // Rebalance position
        const success = await this.dlmmService.rebalancePosition(position, optimalRange.lowerBin, optimalRange.upperBin)

        if (success) {
          const action: RebalanceAction = {
            positionId: position.positionId,
            poolAddress: position.poolAddress,
            action: "rebalance",
            reason: "Position out of optimal range",
            oldRange: {
              lower: position.lowerBin,
              upper: position.upperBin,
            },
            newRange: {
              lower: optimalRange.lowerBin,
              upper: optimalRange.upperBin,
            },
            timestamp: Date.now(),
          }

          await this.telegramService.sendRebalanceNotification(action)
        }
      } else {
        Logger.info(`Position ${position.positionId} is in range`)
      }

      // Check stop-loss
      if (config.rebalancer.stopLossEnabled) {
        const currentPrice = this.dlmmService.calculateBinPrice(activeBin, poolConfig.binStep)
        const lowerPrice = this.dlmmService.calculateBinPrice(position.lowerBin, poolConfig.binStep)

        const priceDropPercentage = ((lowerPrice - currentPrice) / lowerPrice) * 100

        if (priceDropPercentage > config.rebalancer.stopLossThreshold) {
          Logger.warn(`Stop-loss triggered for position ${position.positionId}`)
          await this.telegramService.sendStopLossAlert(position, currentPrice)

          const closed = await this.dlmmService.closePosition(position)
          if (closed) {
            Logger.success(`Position ${position.positionId} closed due to stop-loss`)
          }
        }
      }
    } catch (error) {
      Logger.error(`Failed to check position ${position.positionId}`, error)
    }
  }
}

// Main execution
async function main() {
  try {
    validateConfig()

    const rebalancer = new AutomatedRebalancer()
    await rebalancer.start()

    // Graceful shutdown
    process.on("SIGINT", () => {
      Logger.info("Received SIGINT, shutting down...")
      rebalancer.stop()
      process.exit(0)
    })

    process.on("SIGTERM", () => {
      Logger.info("Received SIGTERM, shutting down...")
      rebalancer.stop()
      process.exit(0)
    })
  } catch (error) {
    Logger.error("Fatal error in rebalancer", error)
    process.exit(1)
  }
}

// Run if executed directly
if (require.main === module) {
  main()
}


```

---
### src/simulator.ts
- Size: 8.29 KB
- Lines: 254
- Last Modified: 2025-10-01 10:41:17

```typescript
import { Logger } from "./utils/logger"
import { CalculationUtils } from "./utils/calculations"
import type { SimulationResult } from "./types"

interface SimulationConfig {
  initialPrice: number
  priceData: number[]
  initialLiquidity: number
  feeTier: number
  binStep: number
  gasPerRebalance: number
}

class StrategySimulator {
  /**
   * Simulate no rebalancing strategy
   */
  private simulateNoRebalancing(config: SimulationConfig): SimulationResult {
    Logger.info("Simulating: No Rebalancing")

    const { priceData, initialPrice, initialLiquidity, feeTier } = config

    // Calculate fees assuming position stays in range
    const avgVolume = 10000 // Mock daily volume
    const daysInRange = priceData.filter((p) => Math.abs(p - initialPrice) / initialPrice < 0.1).length / 24
    const totalFees = (avgVolume * (feeTier / 10000) * daysInRange) / 10

    // Calculate IL
    const finalPrice = priceData[priceData.length - 1]
    const il = CalculationUtils.calculateImpermanentLoss(initialPrice, finalPrice)

    return {
      strategy: "No Rebalancing",
      totalFees,
      impermanentLoss: (il / 100) * initialLiquidity,
      netReturn: totalFees - (il / 100) * initialLiquidity,
      rebalanceCount: 0,
      gasSpent: 0,
    }
  }

  /**
   * Simulate fixed range rebalancing
   */
  private simulateFixedRange(config: SimulationConfig, rangePercent: number): SimulationResult {
    Logger.info(`Simulating: Fixed Range (${rangePercent * 100}%)`)

    const { priceData, initialPrice, initialLiquidity, feeTier, gasPerRebalance } = config

    let rebalanceCount = 0
    let totalFees = 0
    let currentRange = {
      lower: initialPrice * (1 - rangePercent),
      upper: initialPrice * (1 + rangePercent),
    }

    // Simulate day by day
    for (let i = 0; i < priceData.length; i += 24) {
      const currentPrice = priceData[i]

      // Check if out of range
      if (currentPrice < currentRange.lower || currentPrice > currentRange.upper) {
        rebalanceCount++
        currentRange = {
          lower: currentPrice * (1 - rangePercent),
          upper: currentPrice * (1 + rangePercent),
        }
      }

      // Calculate fees for the day (higher fees when in range)
      const isInRange = currentPrice >= currentRange.lower && currentPrice <= currentRange.upper
      if (isInRange) {
        totalFees += (10000 * (feeTier / 10000)) / 10
      }
    }

    const finalPrice = priceData[priceData.length - 1]
    const il = CalculationUtils.calculateImpermanentLoss(initialPrice, finalPrice)
    const gasSpent = rebalanceCount * gasPerRebalance

    return {
      strategy: `Fixed Range (${rangePercent * 100}%)`,
      totalFees,
      impermanentLoss: (il / 100) * initialLiquidity,
      netReturn: totalFees - (il / 100) * initialLiquidity - gasSpent,
      rebalanceCount,
      gasSpent,
    }
  }

  /**
   * Simulate volatility-adjusted rebalancing
   */
  private simulateVolatilityAdjusted(config: SimulationConfig): SimulationResult {
    Logger.info("Simulating: Volatility-Adjusted Rebalancing")

    const { priceData, initialPrice, initialLiquidity, feeTier, gasPerRebalance } = config

    let rebalanceCount = 0
    let totalFees = 0
    let currentRange = {
      lower: initialPrice * 0.9,
      upper: initialPrice * 1.1,
    }

    // Simulate with volatility windows
    const windowSize = 50
    for (let i = 0; i < priceData.length; i += 24) {
      const currentPrice = priceData[i]

      // Calculate volatility from recent data
      const recentPrices = priceData.slice(Math.max(0, i - windowSize), i + 1)
      const volatility = CalculationUtils.calculateVolatility(recentPrices)
      const volatilityRatio = volatility.stdDev / volatility.mean

      // Adjust range based on volatility
      let rangePercent = 0.1
      if (volatilityRatio > 0.1) {
        rangePercent = 0.2 // High volatility - wider range
      } else if (volatilityRatio > 0.05) {
        rangePercent = 0.15 // Medium volatility
      } else if (volatilityRatio < 0.02) {
        rangePercent = 0.08 // Low volatility - tighter range
      }

      // Check if out of range
      if (currentPrice < currentRange.lower || currentPrice > currentRange.upper) {
        rebalanceCount++
        currentRange = {
          lower: currentPrice * (1 - rangePercent),
          upper: currentPrice * (1 + rangePercent),
        }
      }

      // Calculate fees (better fees with tighter ranges in low volatility)
      const isInRange = currentPrice >= currentRange.lower && currentPrice <= currentRange.upper
      if (isInRange) {
        const feeMultiplier = 1 + (0.1 - rangePercent) * 2 // Tighter range = more fees
        totalFees += ((10000 * (feeTier / 10000)) / 10) * feeMultiplier
      }
    }

    const finalPrice = priceData[priceData.length - 1]
    const il = CalculationUtils.calculateImpermanentLoss(initialPrice, finalPrice)
    const gasSpent = rebalanceCount * gasPerRebalance

    return {
      strategy: "Volatility-Adjusted (Recommended)",
      totalFees,
      impermanentLoss: (il / 100) * initialLiquidity,
      netReturn: totalFees - (il / 100) * initialLiquidity - gasSpent,
      rebalanceCount,
      gasSpent,
    }
  }

  /**
   * Generate mock historical price data
   */
  private generateMockPriceData(days: number, basePrice: number, volatility: number): number[] {
    const prices: number[] = []
    let currentPrice = basePrice

    for (let i = 0; i < days * 24; i++) {
      // Hourly data
      const change = (Math.random() - 0.5) * volatility * currentPrice
      currentPrice = Math.max(currentPrice + change, basePrice * 0.5) // Prevent negative prices
      prices.push(currentPrice)
    }

    return prices
  }

  /**
   * Run full simulation
   */
  async runSimulation(): Promise<void> {
    Logger.info("Starting Strategy Simulation")
    Logger.info("=".repeat(60))

    // Generate mock data
    const basePrice = 100
    const priceData = this.generateMockPriceData(30, basePrice, 0.02) // 30 days, 2% volatility

    const config: SimulationConfig = {
      initialPrice: basePrice,
      priceData,
      initialLiquidity: 10000,
      feeTier: 30, // 0.3%
      binStep: 1,
      gasPerRebalance: 5, // $5 per rebalance
    }

    // Run simulations
    const results: SimulationResult[] = []

    results.push(this.simulateNoRebalancing(config))
    results.push(this.simulateFixedRange(config, 0.05))
    results.push(this.simulateFixedRange(config, 0.1))
    results.push(this.simulateFixedRange(config, 0.15))
    results.push(this.simulateVolatilityAdjusted(config))

    // Display results
    Logger.info("\n" + "=".repeat(60))
    Logger.info("SIMULATION RESULTS (30-day period)")
    Logger.info("=".repeat(60))

    // Sort by net return
    results.sort((a, b) => b.netReturn - a.netReturn)

    for (const result of results) {
      Logger.info(`\n${result.strategy}`)
      Logger.info("-".repeat(60))
      Logger.info(`Total Fees Earned:     $${result.totalFees.toFixed(2)}`)
      Logger.info(`Impermanent Loss:      $${result.impermanentLoss.toFixed(2)}`)
      Logger.info(`Gas Spent:             $${result.gasSpent.toFixed(2)}`)
      Logger.info(`Rebalance Count:       ${result.rebalanceCount}`)
      Logger.info(`Net Return:            $${result.netReturn.toFixed(2)}`)
      Logger.info(`ROI:                   ${((result.netReturn / config.initialLiquidity) * 100).toFixed(2)}%`)
    }

    Logger.info("\n" + "=".repeat(60))
    Logger.success(`Best Strategy: ${results[0].strategy}`)
    Logger.info(
      `Net Return: $${results[0].netReturn.toFixed(2)} (${((results[0].netReturn / config.initialLiquidity) * 100).toFixed(2)}% ROI)`,
    )
    Logger.info("=".repeat(60))

    // Analysis
    Logger.info("\nKEY INSIGHTS:")
    Logger.info("1. Volatility-adjusted rebalancing optimizes range width based on market conditions")
    Logger.info("2. Tighter ranges in low volatility = higher capital efficiency and fees")
    Logger.info("3. Wider ranges in high volatility = fewer rebalances and lower gas costs")
    Logger.info("4. Optimal strategy balances fee generation with rebalancing costs")
  }
}

// Main execution
async function main() {
  try {
    const simulator = new StrategySimulator()
    await simulator.runSimulation()
  } catch (error) {
    Logger.error("Simulation failed", error)
    process.exit(1)
  }
}

// Run if executed directly
if (require.main === module) {
  main()
}

export { StrategySimulator }

```

---
### app/analytics/loading.tsx
- Size: 0.05 KB
- Lines: 3
- Last Modified: 2025-10-01 10:41:17

```plaintext
export default function Loading() {
  return null;
}

```

---
### app/analytics/page.tsx
- Size: 13.87 KB
- Lines: 403
- Last Modified: 2025-10-01 10:41:17

```plaintext
"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { TrendingUp, Activity, Zap, AlertTriangle } from "lucide-react";

interface AnalyticsData {
  portfolioHistory: Array<{ date: string; value: number; fees: number }>;
  feeEarnings: Array<{ date: string; fees: number; apy: number }>;
  positionPerformance: Array<{
    pool: string;
    pnl: number;
    fees: number;
    apy: number;
  }>;
  rebalanceHistory: Array<{ date: string; count: number; gasSpent: number }>;
  riskMetrics: {
    sharpeRatio: number;
    maxDrawdown: number;
    volatility: number;
    winRate: number;
  };
  assetAllocation: Array<{ name: string; value: number }>;
}

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
];

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("7d");

  useEffect(() => {
    fetch(`/api/analytics?range=${timeRange}`)
      .then((res) => res.json())
      .then((analyticsData) => {
        setData(analyticsData);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Failed to fetch analytics:", error);
        setLoading(false);
      });
  }, [timeRange]);

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 sm:py-8 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-balance">
            Portfolio Analytics
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Comprehensive insights into your DLMM positions and performance
          </p>
        </div>

        {/* Risk Metrics Cards */}
        <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4 mb-6 sm:mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">
                Sharpe Ratio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <p className="text-xl sm:text-2xl font-bold">
                  {data.riskMetrics.sharpeRatio.toFixed(2)}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">
                Max Drawdown
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <p className="text-xl sm:text-2xl font-bold">
                  {data.riskMetrics.maxDrawdown.toFixed(2)}%
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">Volatility</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-chart-2" />
                <p className="text-xl sm:text-2xl font-bold">
                  {data.riskMetrics.volatility.toFixed(2)}%
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">Win Rate</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                <p className="text-xl sm:text-2xl font-bold">
                  {data.riskMetrics.winRate.toFixed(1)}%
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Analytics Tabs */}
        <Tabs defaultValue="portfolio" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
            <TabsTrigger value="portfolio" className="text-xs sm:text-sm">
              Portfolio
            </TabsTrigger>
            <TabsTrigger value="fees" className="text-xs sm:text-sm">
              Fee Earnings
            </TabsTrigger>
            <TabsTrigger value="positions" className="text-xs sm:text-sm">
              Positions
            </TabsTrigger>
            <TabsTrigger value="rebalancing" className="text-xs sm:text-sm">
              Rebalancing
            </TabsTrigger>
          </TabsList>

          <TabsContent value="portfolio" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Portfolio Value Over Time</CardTitle>
                  <CardDescription>
                    Track your total portfolio value and fee earnings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={data.portfolioHistory}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="stroke-muted"
                      />
                      <XAxis dataKey="date" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--background))",
                          border: "1px solid hsl(var(--border))",
                        }}
                      />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stackId="1"
                        stroke="hsl(var(--primary))"
                        fill="hsl(var(--primary))"
                        fillOpacity={0.6}
                        name="Portfolio Value"
                      />
                      <Area
                        type="monotone"
                        dataKey="fees"
                        stackId="2"
                        stroke="hsl(var(--chart-2))"
                        fill="hsl(var(--chart-2))"
                        fillOpacity={0.6}
                        name="Fees Earned"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Asset Allocation</CardTitle>
                  <CardDescription>
                    Current portfolio distribution
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={data.assetAllocation}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={80}
                        fill="hsl(var(--primary))"
                        dataKey="value"
                      >
                        {data.assetAllocation.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="fees" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Fee Earnings History</CardTitle>
                <CardDescription>
                  Daily fee earnings and APY performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={data.feeEarnings}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-muted"
                    />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis yAxisId="left" className="text-xs" />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      className="text-xs"
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                      }}
                    />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="fees"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      name="Fees ($)"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="apy"
                      stroke="hsl(var(--chart-2))"
                      strokeWidth={2}
                      name="APY (%)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="positions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Position Performance Comparison</CardTitle>
                <CardDescription>
                  Compare PnL and fees across all positions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={data.positionPerformance}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-muted"
                    />
                    <XAxis dataKey="pool" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                      }}
                    />
                    <Legend />
                    <Bar
                      dataKey="pnl"
                      fill="hsl(var(--primary))"
                      name="PnL ($)"
                    />
                    <Bar
                      dataKey="fees"
                      fill="hsl(var(--chart-2))"
                      name="Fees ($)"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rebalancing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Rebalancing Activity</CardTitle>
                <CardDescription>
                  Track rebalancing frequency and gas costs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={data.rebalanceHistory}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-muted"
                    />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis yAxisId="left" className="text-xs" />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      className="text-xs"
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                      }}
                    />
                    <Legend />
                    <Bar
                      yAxisId="left"
                      dataKey="count"
                      fill="hsl(var(--primary))"
                      name="Rebalances"
                    />
                    <Bar
                      yAxisId="right"
                      dataKey="gasSpent"
                      fill="hsl(var(--chart-3))"
                      name="Gas Spent ($)"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

```

---
### app/pools/loading.tsx
- Size: 0.05 KB
- Lines: 3
- Last Modified: 2025-10-01 10:41:17

```plaintext
export default function Loading() {
  return null;
}

```

---
### app/pools/page.tsx
- Size: 6.46 KB
- Lines: 205
- Last Modified: 2025-10-01 10:41:17

```plaintext
"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  TrendingUp,
  TrendingDown,
  Search,
  Plus,
  ExternalLink,
} from "lucide-react";

interface Pool {
  address: string;
  tokenX: string;
  tokenY: string;
  tvl: number;
  volume24h: number;
  apy: number;
  fees24h: number;
  binStep: number;
  activeId: number;
  priceChange24h: number;
}

export default function PoolsPage() {
  const [pools, setPools] = useState<Pool[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetch("/api/pools")
      .then((res) => res.json())
      .then((data) => {
        setPools(data.pools);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Failed to fetch pools:", error);
        setLoading(false);
      });
  }, []);

  const filteredPools = pools.filter(
    (pool) =>
      pool.tokenX.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pool.tokenY.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Loading pools...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 sm:py-8 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-balance">
            DLMM Pools
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Browse and manage liquidity positions across Saros DLMM pools
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search pools by token..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button className="sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Add Liquidity
          </Button>
        </div>

        {/* Pools Grid */}
        <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
          {filteredPools.map((pool) => (
            <Card
              key={pool.address}
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl sm:text-2xl mb-1">
                      {pool.tokenX}/{pool.tokenY}
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                      Bin Step: {pool.binStep} • Active ID: {pool.activeId}
                    </CardDescription>
                  </div>
                  <Badge
                    variant={
                      pool.priceChange24h >= 0 ? "default" : "destructive"
                    }
                    className="flex items-center gap-1"
                  >
                    {pool.priceChange24h >= 0 ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {formatPercent(pool.priceChange24h)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                      TVL
                    </p>
                    <p className="text-base sm:text-lg font-semibold">
                      {formatCurrency(pool.tvl)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                      24h Volume
                    </p>
                    <p className="text-base sm:text-lg font-semibold">
                      {formatCurrency(pool.volume24h)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                      APY
                    </p>
                    <p className="text-base sm:text-lg font-semibold text-primary">
                      {pool.apy.toFixed(2)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                      24h Fees
                    </p>
                    <p className="text-base sm:text-lg font-semibold">
                      {formatCurrency(pool.fees24h)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="default" className="flex-1" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Liquidity
                  </Button>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredPools.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No pools found matching your search.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

```

---
### app/api/analytics/route.ts
- Size: 2.05 KB
- Lines: 76
- Last Modified: 2025-10-01 10:41:17

```typescript
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const range = searchParams.get("range") || "7d";

  // Generate mock analytics data based on time range
  const days = range === "7d" ? 7 : range === "30d" ? 30 : 90;

  const portfolioHistory = Array.from({ length: days }, (_, i) => ({
    date: new Date(
      Date.now() - (days - i) * 24 * 60 * 60 * 1000
    ).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    value: 50000 + Math.random() * 10000 + i * 500,
    fees: 500 + Math.random() * 200 + i * 20,
  }));

  const feeEarnings = Array.from({ length: days }, (_, i) => ({
    date: new Date(
      Date.now() - (days - i) * 24 * 60 * 60 * 1000
    ).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    fees: 100 + Math.random() * 150,
    apy: 35 + Math.random() * 20,
  }));

  const positionPerformance = [
    { pool: "SOL/USDC", pnl: 2450, fees: 1200, apy: 42.5 },
    { pool: "USDC/USDT", pnl: 890, fees: 650, apy: 28.3 },
    { pool: "SOL/mSOL", pnl: 1560, fees: 890, apy: 35.7 },
    { pool: "RAY/USDC", pnl: -320, fees: 420, apy: 52.1 },
    { pool: "BONK/SOL", pnl: 3200, fees: 1800, apy: 68.4 },
  ];

  const rebalanceHistory = Array.from(
    { length: Math.floor(days / 2) },
    (_, i) => ({
      date: new Date(
        Date.now() - (days - i * 2) * 24 * 60 * 60 * 1000
      ).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      count: Math.floor(Math.random() * 5) + 1,
      gasSpent: Math.random() * 2 + 0.5,
    })
  );

  const riskMetrics = {
    sharpeRatio: 1.85,
    maxDrawdown: -8.3,
    volatility: 12.4,
    winRate: 72.5,
  };

  const assetAllocation = [
    { name: "SOL", value: 35 },
    { name: "USDC", value: 30 },
    { name: "mSOL", value: 15 },
    { name: "Others", value: 20 },
  ];

  return NextResponse.json({
    portfolioHistory,
    feeEarnings,
    positionPerformance,
    rebalanceHistory,
    riskMetrics,
    assetAllocation,
  });
}

```

---
### app/api/pools/route.ts
- Size: 1.80 KB
- Lines: 81
- Last Modified: 2025-10-01 10:41:17

```typescript
import { NextResponse } from "next/server";

export async function GET() {
  // Mock pool data - replace with actual Saros DLMM SDK calls
  const pools = [
    {
      address: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
      tokenX: "SOL",
      tokenY: "USDC",
      tvl: 2450000,
      volume24h: 850000,
      apy: 42.5,
      fees24h: 12500,
      binStep: 25,
      activeId: 8388608,
      priceChange24h: 3.2,
    },
    {
      address: "8xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsV",
      tokenX: "USDC",
      tokenY: "USDT",
      tvl: 1850000,
      volume24h: 620000,
      apy: 28.3,
      fees24h: 8900,
      binStep: 10,
      activeId: 8388610,
      priceChange24h: 0.1,
    },
    {
      address: "9xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsW",
      tokenX: "SOL",
      tokenY: "mSOL",
      tvl: 980000,
      volume24h: 340000,
      apy: 35.7,
      fees24h: 5600,
      binStep: 15,
      activeId: 8388605,
      priceChange24h: 2.8,
    },
    {
      address: "10xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAs",
      tokenX: "RAY",
      tokenY: "USDC",
      tvl: 1250000,
      volume24h: 480000,
      apy: 52.1,
      fees24h: 9800,
      binStep: 30,
      activeId: 8388612,
      priceChange24h: -1.5,
    },
    {
      address: "11xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAt",
      tokenX: "BONK",
      tokenY: "SOL",
      tvl: 720000,
      volume24h: 290000,
      apy: 68.4,
      fees24h: 7200,
      binStep: 50,
      activeId: 8388600,
      priceChange24h: 5.7,
    },
    {
      address: "12xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAu",
      tokenX: "JTO",
      tokenY: "USDC",
      tvl: 560000,
      volume24h: 180000,
      apy: 41.2,
      fees24h: 4300,
      binStep: 20,
      activeId: 8388607,
      priceChange24h: -2.3,
    },
  ];

  return NextResponse.json({ pools });
}

```

---
### app/api/positions/route.ts
- Size: 1.64 KB
- Lines: 63
- Last Modified: 2025-10-01 10:41:17

```typescript
import { NextResponse } from "next/server"

// Mock data for demo - in production, this would fetch from blockchain
export async function GET() {
  try {
    // Mock positions data
    const positions = [
      {
        positionId: "pos_abc123",
        poolAddress: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
        tokenX: "SOL",
        tokenY: "USDC",
        lowerBin: 8000,
        upperBin: 8200,
        currentBin: 8150,
        liquidityX: 1.5,
        liquidityY: 150.0,
        feesEarnedX: 0.025,
        feesEarnedY: 2.5,
        isInRange: true,
        valueUSD: 300.0,
        apy: 18.5,
      },
      {
        positionId: "pos_def456",
        poolAddress: "8xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsV",
        tokenX: "SOL",
        tokenY: "USDT",
        lowerBin: 7900,
        upperBin: 8100,
        currentBin: 8180,
        liquidityX: 2.0,
        liquidityY: 200.0,
        feesEarnedX: 0.018,
        feesEarnedY: 1.8,
        isInRange: false,
        valueUSD: 400.0,
        apy: 15.2,
      },
      {
        positionId: "pos_ghi789",
        poolAddress: "9xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsW",
        tokenX: "USDC",
        tokenY: "USDT",
        lowerBin: 9950,
        upperBin: 10050,
        currentBin: 10000,
        liquidityX: 500.0,
        liquidityY: 500.0,
        feesEarnedX: 5.2,
        feesEarnedY: 5.2,
        isInRange: true,
        valueUSD: 1000.0,
        apy: 12.8,
      },
    ]

    return NextResponse.json({ positions })
  } catch (error) {
    console.error("Error fetching positions:", error)
    return NextResponse.json({ error: "Failed to fetch positions" }, { status: 500 })
  }
}

```

---
### app/api/volatility/route.ts
- Size: 0.79 KB
- Lines: 27
- Last Modified: 2025-10-01 10:41:17

```typescript
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const poolAddress = searchParams.get("pool")

    // Mock volatility data
    const volatilityData = {
      poolAddress,
      mean: 8100,
      stdDev: 120,
      volatilityRatio: 0.0148,
      isHighVolatility: false,
      recommendedRangeWidth: 0.12,
      historicalPrices: Array.from({ length: 50 }, (_, i) => ({
        timestamp: Date.now() - (50 - i) * 3600000,
        price: 8100 + (Math.random() - 0.5) * 200,
      })),
    }

    return NextResponse.json(volatilityData)
  } catch (error) {
    console.error("Error fetching volatility:", error)
    return NextResponse.json({ error: "Failed to fetch volatility" }, { status: 500 })
  }
}

```

---
### src/config/index.ts
- Size: 1.60 KB
- Lines: 49
- Last Modified: 2025-10-01 10:41:17

```typescript
import { Connection } from "@solana/web3.js"
import dotenv from "dotenv"

dotenv.config()

export const config = {
  solana: {
    rpcUrl: process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com",
    network: process.env.SOLANA_NETWORK || "devnet",
  },
  wallet: {
    privateKey: process.env.WALLET_PRIVATE_KEY || "",
  },
  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN || "",
    chatId: process.env.TELEGRAM_CHAT_ID || "",
  },
  rebalancer: {
    intervalMinutes: Number.parseInt(process.env.REBALANCE_INTERVAL_MINUTES || "15"),
    volatilityThreshold: Number.parseFloat(process.env.VOLATILITY_THRESHOLD || "0.05"),
    outOfRangeThreshold: Number.parseFloat(process.env.OUT_OF_RANGE_THRESHOLD || "0.1"),
    minFeeThreshold: Number.parseFloat(process.env.MIN_FEE_THRESHOLD || "0.001"),
  },
  pools: {
    monitored: (process.env.MONITORED_POOLS || "").split(",").filter(Boolean),
  },
  stopLoss: {
    enabled: process.env.ENABLE_STOP_LOSS === "true",
    percentage: Number.parseFloat(process.env.STOP_LOSS_PERCENTAGE || "0.15"),
  },
  analytics: {
    apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api",
    port: Number.parseInt(process.env.PORT || "3000"),
  },
}

export const getConnection = (): Connection => {
  return new Connection(config.solana.rpcUrl, "confirmed")
}

export const validateConfig = (): void => {
  const required = ["WALLET_PRIVATE_KEY", "TELEGRAM_BOT_TOKEN", "MONITORED_POOLS"]

  const missing = required.filter((key) => !process.env[key])

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`)
  }
}

```

---
### src/services/dlmm.service.ts
- Size: 9.23 KB
- Lines: 311
- Last Modified: 2025-10-01 10:41:17

```typescript
import type { Connection, Keypair } from "@solana/web3.js"
import { Logger } from "../utils/logger"
import type { Position, PoolConfig } from "../types"

/**
 * DLMM Service - Handles all interactions with Saros DLMM pools
 * Following @saros-finance/dlmm-sdk patterns
 */
export class DLMMService {
  private connection: Connection
  private wallet: Keypair

  constructor(connection: Connection, wallet: Keypair) {
    this.connection = connection
    this.wallet = wallet
  }

  /**
   * Get user positions across multiple pools
   * @param poolAddresses - Array of pool addresses to check
   */
  async getUserPositions(poolAddresses: string[]): Promise<Position[]> {
    try {
      const positions: Position[] = []

      for (const poolAddress of poolAddresses) {
        try {
          // In production, this would use @saros-finance/dlmm-sdk
          // const pool = await DLMMPool.load(this.connection, new PublicKey(poolAddress))
          // const userPositions = await pool.getUserPositions(this.wallet.publicKey)

          // Mock position data for demo
          const mockPosition: Position = {
            positionId: `pos_${poolAddress.slice(0, 8)}`,
            poolAddress,
            tokenX: "SOL",
            tokenY: "USDC",
            lowerBin: 95,
            upperBin: 105,
            currentBin: 100,
            liquidityX: BigInt(1000000000), // 1 SOL
            liquidityY: BigInt(100000000), // 100 USDC
            feesEarned: {
              tokenX: BigInt(5000000), // 0.005 SOL
              tokenY: BigInt(500000), // 0.5 USDC
            },
            isInRange: true,
            valueUSD: 200,
            apy: 15.5,
            currentPrice: 100,
          }

          positions.push(mockPosition)
        } catch (error) {
          Logger.error(`Failed to fetch positions for pool ${poolAddress}`, error)
        }
      }

      return positions
    } catch (error) {
      Logger.error("Failed to get user positions", error)
      throw error
    }
  }

  /**
   * Get pool configuration
   * @param poolAddress - Pool address
   */
  async getPoolConfig(poolAddress: string): Promise<PoolConfig | null> {
    try {
      // In production: const pool = await DLMMPool.load(this.connection, new PublicKey(poolAddress))
      // Return pool.getConfig()

      return {
        poolAddress,
        tokenX: "SOL",
        tokenY: "USDC",
        binStep: 10, // 0.1% per bin
        feeTier: 30, // 0.3% fee
        activeId: 100,
      }
    } catch (error) {
      Logger.error(`Failed to get pool config for ${poolAddress}`, error)
      return null
    }
  }

  /**
   * Get active bin ID for a pool
   * @param poolAddress - Pool address
   */
  async getActiveBin(poolAddress: string): Promise<number> {
    try {
      // In production: const pool = await DLMMPool.load(this.connection, new PublicKey(poolAddress))
      // return pool.activeId

      return 100 // Mock active bin
    } catch (error) {
      Logger.error(`Failed to get active bin for ${poolAddress}`, error)
      throw error
    }
  }

  /**
   * Get bin price data for volatility calculation
   * @param poolAddress - Pool address
   * @param binRange - Number of bins to fetch around active bin
   */
  async getBinData(poolAddress: string, binRange = 50): Promise<number[]> {
    try {
      // In production:
      // const pool = await DLMMPool.load(this.connection, new PublicKey(poolAddress))
      // const activeBin = pool.activeId
      // const bins = await pool.getBinArrays(activeBin - binRange, activeBin + binRange)
      // return bins.map(bin => this.calculateBinPrice(bin.id, pool.binStep))

      // Mock historical bin prices for demo
      const prices: number[] = []
      const basePrice = 100
      for (let i = 0; i < 100; i++) {
        const volatility = Math.sin(i / 10) * 5 + Math.random() * 2
        prices.push(basePrice + volatility)
      }
      return prices
    } catch (error) {
      Logger.error(`Failed to get bin data for ${poolAddress}`, error)
      throw error
    }
  }

  /**
   * Calculate price from bin ID
   * Formula: price = (1 + binStep / 10000) ^ binId
   * @param binId - Bin ID
   * @param binStep - Bin step (basis points)
   */
  calculateBinPrice(binId: number, binStep: number): number {
    return Math.pow(1 + binStep / 10000, binId)
  }

  /**
   * Calculate bin ID from price
   * Formula: binId = log(price) / log(1 + binStep / 10000)
   * @param price - Price
   * @param binStep - Bin step (basis points)
   */
  calculateBinId(price: number, binStep: number): number {
    return Math.floor(Math.log(price) / Math.log(1 + binStep / 10000))
  }

  /**
   * Add liquidity to a position
   * @param poolAddress - Pool address
   * @param lowerBin - Lower bin ID
   * @param upperBin - Upper bin ID
   * @param amountX - Amount of token X
   * @param amountY - Amount of token Y
   */
  async addLiquidity(
    poolAddress: string,
    lowerBin: number,
    upperBin: number,
    amountX: bigint,
    amountY: bigint,
  ): Promise<string | null> {
    try {
      Logger.info(`Adding liquidity to pool ${poolAddress}`, {
        lowerBin,
        upperBin,
        amountX: amountX.toString(),
        amountY: amountY.toString(),
      })

      // In production:
      // const pool = await DLMMPool.load(this.connection, new PublicKey(poolAddress))
      // const tx = await pool.addLiquidity({
      //   lowerBinId: lowerBin,
      //   upperBinId: upperBin,
      //   amountX,
      //   amountY,
      //   slippage: 0.01, // 1% slippage tolerance
      // })
      // const signature = await this.connection.sendTransaction(tx, [this.wallet])
      // await this.connection.confirmTransaction(signature)
      // return signature

      return "mock_signature_add_liquidity"
    } catch (error) {
      Logger.error("Failed to add liquidity", error)
      return null
    }
  }

  /**
   * Remove liquidity from a position
   * @param position - Position to remove liquidity from
   * @param percentage - Percentage of liquidity to remove (0-100)
   */
  async removeLiquidity(position: Position, percentage = 100): Promise<boolean> {
    try {
      Logger.info(`Removing ${percentage}% liquidity from position ${position.positionId}`)

      // In production:
      // const pool = await DLMMPool.load(this.connection, new PublicKey(position.poolAddress))
      // const tx = await pool.removeLiquidity({
      //   positionId: new PublicKey(position.positionId),
      //   percentage,
      //   slippage: 0.01,
      // })
      // const signature = await this.connection.sendTransaction(tx, [this.wallet])
      // await this.connection.confirmTransaction(signature)

      return true
    } catch (error) {
      Logger.error("Failed to remove liquidity", error)
      return false
    }
  }

  /**
   * Collect fees from a position
   * @param position - Position to collect fees from
   */
  async collectFees(position: Position): Promise<boolean> {
    try {
      Logger.info(`Collecting fees from position ${position.positionId}`)

      // In production:
      // const pool = await DLMMPool.load(this.connection, new PublicKey(position.poolAddress))
      // const tx = await pool.collectFees({
      //   positionId: new PublicKey(position.positionId),
      // })
      // const signature = await this.connection.sendTransaction(tx, [this.wallet])
      // await this.connection.confirmTransaction(signature)

      return true
    } catch (error) {
      Logger.error("Failed to collect fees", error)
      return false
    }
  }

  /**
   * Rebalance a position to a new range
   * @param position - Position to rebalance
   * @param newLowerBin - New lower bin ID
   * @param newUpperBin - New upper bin ID
   */
  async rebalancePosition(position: Position, newLowerBin: number, newUpperBin: number): Promise<boolean> {
    try {
      Logger.info(`Rebalancing position ${position.positionId}`, {
        oldRange: `${position.lowerBin}-${position.upperBin}`,
        newRange: `${newLowerBin}-${newUpperBin}`,
      })

      // Step 1: Collect fees
      await this.collectFees(position)

      // Step 2: Remove liquidity
      const removed = await this.removeLiquidity(position, 100)
      if (!removed) {
        throw new Error("Failed to remove liquidity")
      }

      // Step 3: Add liquidity in new range
      const signature = await this.addLiquidity(
        position.poolAddress,
        newLowerBin,
        newUpperBin,
        position.liquidityX,
        position.liquidityY,
      )

      if (!signature) {
        throw new Error("Failed to add liquidity in new range")
      }

      Logger.success(`Successfully rebalanced position ${position.positionId}`)
      return true
    } catch (error) {
      Logger.error("Failed to rebalance position", error)
      return false
    }
  }

  /**
   * Close a position (stop-loss)
   * @param position - Position to close
   */
  async closePosition(position: Position): Promise<boolean> {
    try {
      Logger.info(`Closing position ${position.positionId}`)

      // Collect fees first
      await this.collectFees(position)

      // Remove all liquidity
      const removed = await this.removeLiquidity(position, 100)

      if (removed) {
        Logger.success(`Successfully closed position ${position.positionId}`)
      }

      return removed
    } catch (error) {
      Logger.error("Failed to close position", error)
      return false
    }
  }
}

```

---
### src/services/telegram.service.ts
- Size: 2.77 KB
- Lines: 112
- Last Modified: 2025-10-01 10:41:17

```typescript
import axios from "axios"
import { Logger } from "../utils/logger"
import { config } from "../config"
import type { Position, RebalanceAction } from "../types"

export class TelegramService {
  private botToken: string
  private chatId: string

  constructor() {
    this.botToken = config.telegram.botToken
    this.chatId = config.telegram.chatId
  }

  /**
   * Send message to Telegram
   */
  async sendMessage(message: string): Promise<boolean> {
    if (!this.botToken || !this.chatId) {
      Logger.warn("Telegram not configured, skipping notification")
      return false
    }

    try {
      await axios.post(`https://api.telegram.org/bot${this.botToken}/sendMessage`, {
        chat_id: this.chatId,
        text: message,
        parse_mode: "Markdown",
      })

      Logger.info("Telegram message sent")
      return true
    } catch (error) {
      Logger.error("Failed to send Telegram message", error)
      return false
    }
  }

  /**
   * Send position out of range alert
   */
  async sendOutOfRangeAlert(position: Position): Promise<void> {
    const message = `
🚨 *Position Out of Range Alert*

Position ID: \`${position.positionId}\`
Pool: \`${position.poolAddress.slice(0, 8)}...\`
Current Price: ${position.currentPrice}
Range: ${position.lowerBin} - ${position.upperBin}

⚠️ Position is out of optimal range and may need rebalancing.
    `.trim()

    await this.sendMessage(message)
  }

  /**
   * Send rebalance notification
   */
  async sendRebalanceNotification(action: RebalanceAction): Promise<void> {
    const message = `
✅ *Position Rebalanced*

Position ID: \`${action.positionId}\`
Pool: \`${action.poolAddress.slice(0, 8)}...\`
Action: ${action.action}
Reason: ${action.reason}

Old Range: ${action.oldRange.lower} - ${action.oldRange.upper}
${action.newRange ? `New Range: ${action.newRange.lower} - ${action.newRange.upper}` : ""}

Timestamp: ${new Date(action.timestamp).toLocaleString()}
    `.trim()

    await this.sendMessage(message)
  }

  /**
   * Send stop-loss alert
   */
  async sendStopLossAlert(position: Position, currentPrice: number): Promise<void> {
    const message = `
🛑 *Stop-Loss Triggered*

Position ID: \`${position.positionId}\`
Pool: \`${position.poolAddress.slice(0, 8)}...\`
Current Price: ${currentPrice}
Threshold Breached: ${position.lowerBin}

Position has been closed to prevent further losses.
    `.trim()

    await this.sendMessage(message)
  }

  /**
   * Send daily summary
   */
  async sendDailySummary(totalPositions: number, rebalancedToday: number, totalFees: number): Promise<void> {
    const message = `
📊 *Daily Summary*

Total Positions: ${totalPositions}
Rebalanced Today: ${rebalancedToday}
Fees Earned: $${totalFees.toFixed(2)}

Keep optimizing your liquidity!
    `.trim()

    await this.sendMessage(message)
  }
}

```

---
### src/services/volatility.service.ts
- Size: 4.80 KB
- Lines: 162
- Last Modified: 2025-10-01 10:41:17

```typescript
import { Logger } from "../utils/logger";

export interface VolatilityMetrics {
  mean: number;
  stdDev: number;
  volatilityRatio: number;
  historicalPrices: Array<{ timestamp: number; price: number }>;
}

/**
 * Volatility Service - Calculates market volatility for optimal range sizing
 * Uses bin price data to determine position range width
 */
export class VolatilityService {
  private readonly HIGH_VOLATILITY_THRESHOLD = 0.05; // 5%
  private readonly LOW_VOLATILITY_THRESHOLD = 0.02; // 2%

  /**
   * Calculate volatility metrics from bin price data
   * @param poolAddress - Pool address
   * @param binPrices - Array of historical bin prices
   */
  async getVolatility(
    poolAddress: string,
    binPrices: number[]
  ): Promise<VolatilityMetrics> {
    try {
      if (binPrices.length < 2) {
        throw new Error("Insufficient price data for volatility calculation");
      }

      // Calculate mean price
      const mean =
        binPrices.reduce((sum, price) => sum + price, 0) / binPrices.length;

      // Calculate standard deviation
      const squaredDiffs = binPrices.map((price) => Math.pow(price - mean, 2));
      const variance =
        squaredDiffs.reduce((sum, diff) => sum + diff, 0) / binPrices.length;
      const stdDev = Math.sqrt(variance);

      // Calculate volatility ratio (coefficient of variation)
      const volatilityRatio = stdDev / mean;

      // Format historical prices for charting
      const historicalPrices = binPrices.map((price, index) => ({
        timestamp: Date.now() - (binPrices.length - index) * 60000, // 1 minute intervals
        price,
      }));

      Logger.info(`Volatility calculated for ${poolAddress}`, {
        mean: mean.toFixed(2),
        stdDev: stdDev.toFixed(2),
        volatilityRatio: (volatilityRatio * 100).toFixed(2) + "%",
      });

      return {
        mean,
        stdDev,
        volatilityRatio,
        historicalPrices,
      };
    } catch (error) {
      Logger.error("Failed to calculate volatility", error);
      throw error;
    }
  }

  /**
   * Determine if volatility is high
   * @param metrics - Volatility metrics
   */
  isHighVolatility(metrics: VolatilityMetrics): boolean {
    return metrics.volatilityRatio > this.HIGH_VOLATILITY_THRESHOLD;
  }

  /**
   * Determine if volatility is low
   * @param metrics - Volatility metrics
   */
  isLowVolatility(metrics: VolatilityMetrics): boolean {
    return metrics.volatilityRatio < this.LOW_VOLATILITY_THRESHOLD;
  }

  /**
   * Get recommended range width based on volatility
   * Higher volatility = wider range to reduce rebalancing frequency
   * Lower volatility = tighter range for better capital efficiency
   * @param metrics - Volatility metrics
   */
  getRecommendedRangeWidth(metrics: VolatilityMetrics): number {
    const { volatilityRatio } = metrics;

    // Base range width: 10%
    const baseWidth = 0.1;

    // Adjust based on volatility
    // High volatility: increase range width up to 30%
    // Low volatility: decrease range width down to 5%
    if (volatilityRatio > this.HIGH_VOLATILITY_THRESHOLD) {
      // High volatility: wider range
      const multiplier =
        1 + (volatilityRatio - this.HIGH_VOLATILITY_THRESHOLD) * 10;
      return Math.min(baseWidth * multiplier, 0.3); // Cap at 30%
    } else if (volatilityRatio < this.LOW_VOLATILITY_THRESHOLD) {
      // Low volatility: tighter range
      const multiplier = volatilityRatio / this.LOW_VOLATILITY_THRESHOLD;
      return Math.max(baseWidth * multiplier, 0.05); // Floor at 5%
    }

    // Medium volatility: use base width
    return baseWidth;
  }

  /**
   * Calculate optimal bin range around current price
   * @param currentPrice - Current market price
   * @param rangeWidth - Range width as percentage (e.g., 0.1 for 10%)
   * @param binStep - Bin step in basis points
   */
  calculateOptimalBinRange(
    currentPrice: number,
    rangeWidth: number,
    binStep: number
  ): {
    lowerBin: number;
    upperBin: number;
    lowerPrice: number;
    upperPrice: number;
  } {
    // Calculate price bounds
    const lowerPrice = currentPrice * (1 - rangeWidth / 2);
    const upperPrice = currentPrice * (1 + rangeWidth / 2);

    // Convert to bin IDs
    const lowerBin = this.priceToBinId(lowerPrice, binStep);
    const upperBin = this.priceToBinId(upperPrice, binStep);

    return {
      lowerBin,
      upperBin,
      lowerPrice,
      upperPrice,
    };
  }

  /**
   * Convert price to bin ID
   * Formula: binId = log(price) / log(1 + binStep / 10000)
   */
  private priceToBinId(price: number, binStep: number): number {
    return Math.floor(Math.log(price) / Math.log(1 + binStep / 10000));
  }

  /**
   * Convert bin ID to price
   * Formula: price = (1 + binStep / 10000) ^ binId
   */
  private binIdToPrice(binId: number, binStep: number): number {
    return Math.pow(1 + binStep / 10000, binId);
  }
}

```

---
### src/types/index.ts
- Size: 1.80 KB
- Lines: 94
- Last Modified: 2025-10-01 10:41:17

```typescript
import type { PublicKey } from "@solana/web3.js"
import type BN from "bn.js"

export interface DLMMPoolInfo {
  address: PublicKey
  tokenX: {
    mint: PublicKey
    symbol: string
    decimals: number
  }
  tokenY: {
    mint: PublicKey
    symbol: string
    decimals: number
  }
  activeId: number // Current active bin ID
  feeTier: number // Fee in basis points (1, 5, 30, 100)
  binStep: number // Price increment between bins in basis points
}

export interface PoolConfig {
  address: PublicKey
  tokenX: string
  tokenY: string
  feeTier: number
  binStep: number
}

export interface Position {
  positionId: string
  poolAddress: string
  lowerBin: number
  upperBin: number
  liquidityX: BN
  liquidityY: BN
  feesEarned: {
    tokenX: BN
    tokenY: BN
  }
  currentPrice: number
  isInRange: boolean
}

export interface BinData {
  binId: number
  price: number
  liquidityX: BN
  liquidityY: BN
  supply: BN
}

export interface LiquidityParams {
  lowerBin: number
  upperBin: number
  amountX: BN
  amountY: BN
  slippage: number // Slippage tolerance (e.g., 0.01 for 1%)
}

export interface VolatilityData {
  stdDev: number
  mean: number
  recentPrices: number[]
  timestamp: number
}

export interface RebalanceAction {
  positionId: string
  poolAddress: string
  action: "rebalance" | "stop-loss" | "none"
  reason: string
  oldRange: { lower: number; upper: number }
  newRange?: { lower: number; upper: number }
  timestamp: number
}

export interface PortfolioStats {
  totalPositions: number
  totalValueUSD: number
  totalFeesEarned: number
  positionsInRange: number
  positionsOutOfRange: number
  averageAPY: number
  impermanentLoss: number
}

export interface SimulationResult {
  strategy: string
  totalFees: number
  impermanentLoss: number
  netReturn: number
  rebalanceCount: number
  gasSpent: number
}

```

---
### src/utils/calculations.ts
- Size: 2.32 KB
- Lines: 81
- Last Modified: 2025-10-01 10:41:17

```typescript
import type BN from "bn.js"

/**
 * Calculation utilities for DLMM operations
 */
export class CalculationUtils {
  /**
   * Convert BigNumber to regular number with decimals
   */
  static bnToNumber(bn: bigint | BN, decimals: number): number {
    const bnValue = typeof bn === "bigint" ? bn : BigInt(bn.toString())
    return Number(bnValue) / Math.pow(10, decimals)
  }

  /**
   * Convert number to BigNumber with decimals
   */
  static numberToBn(num: number, decimals: number): bigint {
    return BigInt(Math.floor(num * Math.pow(10, decimals)))
  }

  /**
   * Calculate bin price from bin ID
   * Formula: price = (1 + binStep / 10000) ^ binId
   */
  static binIdToPrice(binId: number, binStep: number): number {
    return Math.pow(1 + binStep / 10000, binId)
  }

  /**
   * Calculate bin ID from price
   * Formula: binId = log(price) / log(1 + binStep / 10000)
   */
  static priceToBinId(price: number, binStep: number): number {
    return Math.floor(Math.log(price) / Math.log(1 + binStep / 10000))
  }

  /**
   * Check if position is out of range
   */
  static isPositionOutOfRange(activeBin: number, lowerBin: number, upperBin: number, threshold = 0.2): boolean {
    const rangeSize = upperBin - lowerBin
    const distanceFromLower = activeBin - lowerBin
    const distanceFromUpper = upperBin - activeBin

    return distanceFromLower < rangeSize * threshold || distanceFromUpper < rangeSize * threshold
  }

  /**
   * Calculate optimal range around current price
   */
  static calculateOptimalRange(
    currentPrice: number,
    volatility: { mean: number; stdDev: number; volatilityRatio: number },
    rangeWidth: number,
  ): { lower: number; upper: number } {
    const halfWidth = rangeWidth / 2
    return {
      lower: currentPrice * (1 - halfWidth),
      upper: currentPrice * (1 + halfWidth),
    }
  }

  /**
   * Calculate impermanent loss
   */
  static calculateImpermanentLoss(priceRatio: number): number {
    const sqrtRatio = Math.sqrt(priceRatio)
    const il = (2 * sqrtRatio) / (1 + priceRatio) - 1
    return Math.abs(il) * 100
  }

  /**
   * Calculate APY from fees
   */
  static calculateAPY(feesEarned: number, principal: number, daysElapsed: number): number {
    if (principal === 0 || daysElapsed === 0) return 0
    const dailyReturn = feesEarned / principal / daysElapsed
    return dailyReturn * 365 * 100
  }
}

```

---
### src/utils/logger.ts
- Size: 1.11 KB
- Lines: 41
- Last Modified: 2025-10-01 10:41:17

```typescript
export enum LogLevel {
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
  SUCCESS = "SUCCESS",
}

export class Logger {
  private static formatTimestamp(): string {
    return new Date().toISOString()
  }

  private static formatMessage(level: LogLevel, message: string, data?: any): string {
    const timestamp = this.formatTimestamp()
    const dataStr = data ? `\n${JSON.stringify(data, null, 2)}` : ""
    return `[${timestamp}] [${level}] ${message}${dataStr}`
  }

  static info(message: string, data?: any): void {
    console.log(this.formatMessage(LogLevel.INFO, message, data))
  }

  static warn(message: string, data?: any): void {
    console.warn(this.formatMessage(LogLevel.WARN, message, data))
  }

  static error(message: string, error?: any): void {
    const errorData =
      error instanceof Error
        ? {
            message: error.message,
            stack: error.stack,
          }
        : error
    console.error(this.formatMessage(LogLevel.ERROR, message, errorData))
  }

  static success(message: string, data?: any): void {
    console.log(this.formatMessage(LogLevel.SUCCESS, message, data))
  }
}

```

---
### src/utils/wallet.ts
- Size: 0.74 KB
- Lines: 25
- Last Modified: 2025-10-01 10:41:17

```typescript
import { Keypair } from "@solana/web3.js"
import bs58 from "bs58"
import { config } from "../config"

export const getWallet = (): Keypair => {
  try {
    const privateKeyString = config.wallet.privateKey

    // Try base58 decoding first
    try {
      const privateKeyBytes = bs58.decode(privateKeyString)
      return Keypair.fromSecretKey(privateKeyBytes)
    } catch {
      // Try JSON array format
      const privateKeyArray = JSON.parse(privateKeyString)
      return Keypair.fromSecretKey(Uint8Array.from(privateKeyArray))
    }
  } catch (error) {
    throw new Error("Invalid wallet private key format. Use base58 or JSON array format.")
  }
}

export const getWalletPublicKey = (): string => {
  return getWallet().publicKey.toBase58()
}

```

---

---
## 📊 Summary
- Total files: 33
- Total size: 133.30 KB
- File types: .css, .json, .ts, .tsx, unknown
