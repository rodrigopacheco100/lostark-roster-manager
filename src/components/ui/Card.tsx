interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  onClick?: () => void
}

export function Card({ children, className, hover = false, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`rounded-xl border border-gray-800 bg-surface-elevated p-4 transition-all duration-200 ${
        hover ? "cursor-pointer hover:bg-surface-hover hover:border-gray-700" : ""
      } ${className ?? ""}`}
    >
      {children}
    </div>
  )
}
