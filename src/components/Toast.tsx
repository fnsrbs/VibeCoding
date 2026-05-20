interface Props {
  message: string
  type: 'correct' | 'incorrect'
  visible: boolean
}

export default function Toast({ message, type, visible }: Props) {
  return (
    <div
      className={`fixed top-6 z-50 px-6 py-3 rounded-full font-bold text-white shadow-xl pointer-events-none transition-all duration-300 ${
        type === 'correct' ? 'bg-green-500' : 'bg-red-500'
      }`}
      style={{
        left: '50%',
        transform: `translateX(-50%) translateY(${visible ? '0px' : '-16px'})`,
        opacity: visible ? 1 : 0,
      }}
    >
      {message}
    </div>
  )
}
