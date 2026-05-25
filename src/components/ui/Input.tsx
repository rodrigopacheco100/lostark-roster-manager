interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, className, id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-")

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-gray-300">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`rounded-lg border bg-surface-elevated px-3 py-2 text-sm text-gray-100 placeholder-gray-500 transition-colors duration-200 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary ${
          error ? "border-danger" : "border-gray-700"
        } ${className ?? ""}`}
        {...props}
      />
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  )
}
