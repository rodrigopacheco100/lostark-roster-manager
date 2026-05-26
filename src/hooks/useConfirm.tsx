"use client"

import { AlertTriangle, Trash2 } from "lucide-react"
import { createContext, useCallback, useContext, useState } from "react"
import { Modal } from "@/components/ui"

interface ConfirmOptions {
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>
}

const ConfirmContext = createContext<ConfirmContextType | null>(null)

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{
    options: ConfirmOptions
    resolve: (value: boolean) => void
  } | null>(null)

  const confirm = useCallback(async (options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setState({ options, resolve })
    })
  }, [])

  function handleClose(result: boolean) {
    state?.resolve(result)
    setState(null)
  }

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {state && (
        <Modal isOpen onClose={() => handleClose(false)} title={state.options.title}>
          <div className="space-y-6">
            <div className="flex items-start gap-3">
              {state.options.destructive ? (
                <Trash2 className="mt-0.5 h-5 w-5 shrink-0 text-danger" />
              ) : (
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
              )}
              <p className="text-sm text-gray-300">{state.options.message}</p>
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => handleClose(false)}
                className="rounded-lg border border-gray-600 px-4 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-surface-hover"
              >
                {state.options.cancelLabel ?? "Cancel"}
              </button>
              <button
                type="button"
                onClick={() => handleClose(true)}
                className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors ${
                  state.options.destructive ? "bg-danger hover:bg-danger-hover" : "bg-primary hover:bg-primary-hover"
                }`}
              >
                {state.options.confirmLabel ?? "Confirm"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </ConfirmContext.Provider>
  )
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext)
  if (!ctx) throw new Error("useConfirm must be used within ConfirmProvider")
  return ctx
}
