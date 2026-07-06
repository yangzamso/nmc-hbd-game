import { useEffect, useState } from 'react'
import styles from './CardFlipGame.module.css'

// 실제 사진 소재로 교체 예정 — 지금은 placeholder 텍스트 (docs/PRD-collection-game.md 6절)
const CARD_LABELS = ['야바위 라이토', '류헤이', '머큐리', '파란정장', '아저씨']

function shuffle(array) {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function buildDeck() {
  return shuffle(
    CARD_LABELS.flatMap((label, i) => [
      { key: `${i}-a`, label },
      { key: `${i}-b`, label },
    ])
  )
}

export function CardFlipGame({ onClear }) {
  const [deck] = useState(buildDeck)
  const [flipped, setFlipped] = useState([])
  const [matched, setMatched] = useState([])
  const [locked, setLocked] = useState(false)

  useEffect(() => {
    if (matched.length === deck.length) onClear()
  }, [matched, deck.length, onClear])

  function handleCardClick(index) {
    if (locked || flipped.includes(index) || matched.includes(index)) return

    const next = [...flipped, index]
    setFlipped(next)
    if (next.length < 2) return

    setLocked(true)
    const [a, b] = next
    if (deck[a].label === deck[b].label) {
      setTimeout(() => {
        setMatched((m) => [...m, a, b])
        setFlipped([])
        setLocked(false)
      }, 400)
    } else {
      setTimeout(() => {
        setFlipped([])
        setLocked(false)
      }, 700)
    }
  }

  return (
    <div className={styles.grid}>
      {deck.map((card, index) => {
        const isMatched = matched.includes(index)
        const isFaceUp = isMatched || flipped.includes(index)
        return (
          <button
            key={card.key}
            className={[styles.card, isFaceUp ? styles.faceUp : '', isMatched ? styles.matched : ''].join(' ')}
            onClick={() => handleCardClick(index)}
          >
            {isFaceUp ? card.label : '?'}
          </button>
        )
      })}
    </div>
  )
}
