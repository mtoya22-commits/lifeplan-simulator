import { type ReactNode, useEffect } from 'react'

interface Props {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
}

export function BottomSheet({ open, title, onClose, children }: Props) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    // シート表示中は背景のスクロールを止める
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="sheet-overlay" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal>
        <div className="sheet-handle" />
        <div className="sheet-head">
          <h3>{title}</h3>
          <button className="link-btn" onClick={onClose}>
            閉じる
          </button>
        </div>
        <div className="sheet-body">{children}</div>
      </div>
    </div>
  )
}
