interface Props {
  remaining: number
  total: number
}

export default function TimerBar({ remaining, total }: Props) {
  const pct = (remaining / total) * 100
  const color = pct > 50 ? 'bg-green-500' : pct > 25 ? 'bg-yellow-400' : 'bg-red-500'

  return (
    <div className="w-full bg-gray-200 rounded-full h-3">
      <div
        className={`${color} h-3 rounded-full transition-all duration-1000`}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
