const SIZE = 80
const STROKE = 6
const RADIUS = (SIZE - STROKE * 2) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

interface Props {
  remaining: number
  total: number
}

export default function CircularTimer({ remaining, total }: Props) {
  const progress = total > 0 ? remaining / total : 0
  const offset = CIRCUMFERENCE * (1 - progress)
  const isLow = remaining <= 10
  const isWarn = remaining <= 15 && !isLow
  const fillColor = isLow ? '#ef4444' : isWarn ? '#f59e0b' : '#3b82f6'

  return (
    <div className="relative flex-shrink-0" style={{ width: SIZE, height: SIZE }}>
      <svg
        width={SIZE}
        height={SIZE}
        style={{ transform: 'rotate(-90deg)' }}
      >
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={STROKE}
        />
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke={fillColor}
          strokeWidth={STROKE}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.9s linear, stroke 0.3s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className="text-lg font-bold"
          style={{ color: isLow ? '#ef4444' : '#374151' }}
        >
          {remaining}
        </span>
      </div>
    </div>
  )
}
