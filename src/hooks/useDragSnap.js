import { useRef, useState, useCallback } from 'react'

const SNAP_DISTANCE = 120

export function useDragSnap({ targetRef, onSnap }) {
  const [dragState, setDragState] = useState(null) // { x, y, snapped, itemId }
  const offsetRef = useRef({ x: 0, y: 0 })

  const getTargetCenter = () => {
    const rect = targetRef.current?.getBoundingClientRect()
    if (!rect) return null
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
  }

  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y)

  const onPointerDown = useCallback((e, itemId, itemRef) => {
    e.preventDefault()
    const rect = itemRef.current.getBoundingClientRect()
    offsetRef.current = {
      x: e.clientX - rect.left - rect.width / 2,
      y: e.clientY - rect.top - rect.height / 2,
    }
    setDragState({ x: e.clientX, y: e.clientY, snapped: false, itemId })
  }, [])

  const onPointerMove = useCallback((e) => {
    if (!dragState) return
    const center = getTargetCenter()
    const cursorPos = { x: e.clientX, y: e.clientY }
    const snapped = center ? dist(cursorPos, center) < SNAP_DISTANCE : false
    setDragState((s) => ({ ...s, x: e.clientX, y: e.clientY, snapped }))
  }, [dragState])

  const onPointerUp = useCallback(() => {
    if (!dragState) return
    if (dragState.snapped) {
      onSnap(dragState.itemId)
    }
    setDragState(null)
  }, [dragState, onSnap])

  const getOverlayStyle = () => {
    if (!dragState) return null
    if (dragState.snapped) {
      const center = getTargetCenter()
      if (center) {
        return {
          position: 'fixed',
          left: center.x,
          top: center.y,
          transform: 'translate(-50%, -50%) scale(1.05)',
          transition: 'left 0.15s, top 0.15s, transform 0.15s',
          pointerEvents: 'none',
          zIndex: 1000,
          filter: 'drop-shadow(0 0 12px rgba(255,220,0,0.9))',
        }
      }
    }
    return {
      position: 'fixed',
      left: dragState.x - offsetRef.current.x,
      top: dragState.y - offsetRef.current.y,
      transform: 'translate(-50%, -50%) scale(1.08)',
      transition: 'transform 0.1s',
      pointerEvents: 'none',
      zIndex: 1000,
    }
  }

  return { dragState, onPointerDown, onPointerMove, onPointerUp, getOverlayStyle }
}
