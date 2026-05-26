"use client"

import toast from "react-hot-toast"

export function useToast() {
  function show(message: string, type?: "success" | "error" | "info") {
    if (type === "success") {
      toast.success(message, { duration: 4000 })
    } else if (type === "error") {
      toast.error(message, { duration: 4000 })
    } else {
      toast(message, {
        duration: 4000,
        icon: "ℹ️",
      })
    }
  }

  function promise<T>(
    promise: Promise<T>,
    messages: {
      loading: string
      success: string | ((data: T) => string)
      error: string | ((err: Error) => string)
    },
  ) {
    toast.promise(promise, messages, { duration: 4000 })
    return promise
  }

  return { toast: show, promise }
}
