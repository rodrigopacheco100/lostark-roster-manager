"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState } from "react"
import { Toaster } from "react-hot-toast"
import { ConfirmProvider } from "@/hooks/useConfirm"

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      <ConfirmProvider>
        {children}
        <Toaster
          position="top-center"
          gutter={8}
          toastOptions={{
            duration: 4000,
            style: {
              background: "#1e1e1e",
              color: "#e5e5e5",
              border: "1px solid #374151",
            },
          }}
        />
      </ConfirmProvider>
    </QueryClientProvider>
  )
}
