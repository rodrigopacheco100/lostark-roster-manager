import { cva, type VariantProps } from "class-variance-authority"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        primary: "bg-primary text-white hover:bg-primary-hover active:brightness-90",
        secondary: "bg-surface-elevated text-gray-200 hover:bg-surface-hover border border-gray-700",
        danger: "bg-danger text-white hover:bg-danger-hover active:brightness-90",
        ghost: "text-gray-400 hover:text-gray-200 hover:bg-surface-hover",
      },
      size: {
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
)

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  icon?: React.ReactNode
}

export function Button({ variant, size, icon, children, className, ...props }: ButtonProps) {
  return (
    <button type="button" className={buttonVariants({ variant, size, className })} {...props}>
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </button>
  )
}
