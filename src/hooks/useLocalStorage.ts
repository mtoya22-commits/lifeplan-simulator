import { useCallback, useEffect, useState } from 'react'

/** localStorage と同期する state。入力途中の自動保存に使う。 */
export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key)
      return raw ? (JSON.parse(raw) as T) : initial
    } catch {
      return initial
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // 保存に失敗しても致命的ではないので無視
    }
  }, [key, value])

  const clear = useCallback(() => {
    try {
      localStorage.removeItem(key)
    } catch {
      // ignore
    }
  }, [key])

  return [value, setValue, clear] as const
}
