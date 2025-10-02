import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { QueryClientProvider } from "@tanstack/react-query"
import { queryClient } from "./lib/queryClient"
import { WalletContextProvider } from "./lib/wallet-provider"
import { ThemeProvider } from "next-themes"
import { Toaster } from "@/components/ui/sonner"
import App from "./App"
import "./index.css"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <WalletContextProvider>
        <QueryClientProvider client={queryClient}>
          <App />
          <Toaster />
        </QueryClientProvider>
      </WalletContextProvider>
    </ThemeProvider>
  </StrictMode>,
)
