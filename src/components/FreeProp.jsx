import { useRef, useState } from 'react'
import { useGameStore } from '../store/gameStore'

export function FreeProp({ prop }) {
  const { propPositions, setPropPos } = useGameStore()
  const ref = useRef(null)
  const offsetRef = useRef({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)

  const pos = propPositions[prop.id] || { x: 20, y: 20 }

  const onPointerDown = (e) => {
    e.preventDefault()
    offsetRef.current = {
      x: e.clientX - pos.x,
      y: e.clientY - pos.y,
    }
    setDragging(true)
    ref.current.setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e) => {
    if (!dragging) return
    setPropPos(prop.id, {
      x: e.clientX - offsetRef.current.x,
      y: e.clientY - offsetRef.current.y,
    })
  }

  const onPointerUp = () => setDragging(false)

  return (
    <img
      ref={ref}
      src={prop.image}
      alt={prop.name}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      style={{
        position: 'fixed',
        left: pos.x,
        top: pos.y,
        width: 80,
        cursor: dragging ? 'grabbing' : 'grab',
        userSelect: 'none',
        touchAction: 'none',
        zIndex: 500,
        filter: dragging ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.4))' : 'none',
      }}
    />
  )
}
