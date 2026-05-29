"use client"

interface CircularProgressProps {
  percent: number
  size?: number
  strokeWidth?: number
}

function getProgressColor(pct: number): string {
  if (pct <= 0) return "#6b7280"

  const colors = [
    { stop: 0, r: 0xef, g: 0x44, b: 0x44 },
    { stop: 50, r: 0xea, g: 0xb3, b: 0x08 },
    { stop: 100, r: 0x22, g: 0xc5, b: 0x5e },
  ]

  let from = colors[0]
  let to = colors[colors.length - 1]

  for (let i = 0; i < colors.length - 1; i++) {
    if (pct >= colors[i].stop && pct <= colors[i + 1].stop) {
      from = colors[i]
      to = colors[i + 1]
      break
    }
  }

  const range = to.stop - from.stop
  const t = range === 0 ? 0 : (pct - from.stop) / range
  const r = Math.round(from.r + (to.r - from.r) * t)
  const g = Math.round(from.g + (to.g - from.g) * t)
  const b = Math.round(from.b + (to.b - from.b) * t)

  return `rgb(${r},${g},${b})`
}

export function CircularProgress({ percent, size = 36, strokeWidth = 3 }: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - Math.max(0, Math.min(100, percent)) / 100)
  const color = getProgressColor(percent)
  const center = size / 2

  return (
    <svg width={size} height={size} className="shrink-0 -rotate-90" role="progressbar" aria-valuenow={percent}>
      <circle cx={center} cy={center} r={radius} fill="none" stroke="#2a2a2e" strokeWidth={strokeWidth} />
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{ transition: "stroke-dashoffset 0.6s ease, stroke 0.3s ease" }}
      />
      <text
        x={center}
        y={center}
        textAnchor="middle"
        dominantBaseline="central"
        className="fill-gray-300"
        style={{ fontSize: size * 0.3, fontWeight: 600 }}
        transform={`rotate(90, ${center}, ${center})`}
      >
        {Math.round(percent)}
      </text>
    </svg>
  )
}
