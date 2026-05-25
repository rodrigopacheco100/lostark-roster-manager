interface SkeletonProps {
  width?: string
  height?: string
  rounded?: boolean
  className?: string
}

export function Skeleton({ width = "100%", height = "1rem", rounded = true, className }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-surface-hover ${rounded ? "rounded-lg" : ""} ${className ?? ""}`}
      style={{ width, height, minHeight: height }}
    />
  )
}
