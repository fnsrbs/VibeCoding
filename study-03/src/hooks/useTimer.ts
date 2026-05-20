import { useCallback, useEffect, useRef, useState } from 'react'

export function useTimer(durationSeconds: number, onExpire: () => void) {
  const [remaining, setRemaining] = useState(durationSeconds)
  const [resetKey, setResetKey] = useState(0)
  const onExpireRef = useRef(onExpire)
  onExpireRef.current = onExpire

  const reset = useCallback(() => setResetKey((k) => k + 1), [])

  useEffect(() => {
    setRemaining(durationSeconds)
    let expired = false
    const id = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(id)
          if (!expired) {
            expired = true
            onExpireRef.current()
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [durationSeconds, resetKey])

  return { remaining, reset }
}
