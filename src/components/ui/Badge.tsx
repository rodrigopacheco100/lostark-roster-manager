import { cva, type VariantProps } from "class-variance-authority"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      color: {
        blue: "bg-blue-500/20 text-blue-300",
        green: "bg-green-500/20 text-green-300",
        red: "bg-red-500/20 text-red-300",
        gray: "bg-gray-500/20 text-gray-300",
        yellow: "bg-yellow-500/20 text-yellow-300",
      },
    },
    defaultVariants: {
      color: "gray",
    },
  },
)

interface BadgeProps extends VariantProps<typeof badgeVariants> {
  children: React.ReactNode
  className?: string
}

export function Badge({ color, children, className }: BadgeProps) {
  return <span className={badgeVariants({ color, className })}>{children}</span>
}
