import { useState } from 'react'
import { useSessionStore } from '../store/sessionStore'
import { useGameStore } from '../store/gameStore'
import { SLOTS } from '../data/slots'
import { COSTUMES } from '../data/costumes'
import styles from './HubScreen.module.css'
import dusty from '../styles/dustyBg.module.css'

const costumeById = Object.fromEntries(COSTUMES.map((c) => [c.id, c]))

export function HubScreen() {
  const nickname = useSessionStore((s) => s.nickname)
  const slots = useSessionStore((s) => s.slots)
  const openSlot = useSessionStore((s) => s.openSlot)
  const goToDressup = useSessionStore((s) => s.goToDressup)
  const resetSlots = useSessionStore((s) => s.resetSlots)
  const logout = useSessionStore((s) => s.logout)
  const resetBoard = useGameStore((s) => s.reset)
  const [resetting, setResetting] = useState(false)

  const clearedCount = Object.values(slots).filter(Boolean).length

  async function handleReset() {
    setResetting(true)
    try {
      await resetSlots()
    } finally {
      setResetting(false)
    }
  }

  function handleLogout() {
    resetBoard()
    logout()
  }

  return (
    <div className={`${styles.hub} ${dusty.dustyBg}`}>
      <img src="/logo.png" alt="NEED MORE CASH 2026 HBD CAFE" className={styles.logo} />
      <p className={styles.greeting}>{nickname}님,<br></br> 게임하고 캐릭터 의상을 모아보세요</p>
      <p className={styles.progress}>{clearedCount} / 6 획득</p>

      <div className={styles.grid}>
        {SLOTS.map((slot) => {
          const costumeId = slots[slot.id]
          const costume = costumeId ? costumeById[costumeId] : null
          const cleared = Boolean(costume)

          return (
            <button
              key={slot.id}
              className={[
                styles.tile,
                slot.special ? styles.golden : '',
                slot.disabled ? styles.disabled : '',
                cleared ? styles.cleared : '',
              ].join(' ')}
              onClick={() => !slot.disabled && !resetting && openSlot(slot.id)}
              disabled={slot.disabled || resetting}
            >
              {cleared ? (
                <img src={costume.image} alt={costume.name} className={styles.tileImg} />
              ) : (
                <span className={styles.tileMark}>?</span>
              )}
              <span className={styles.tileLabel}>
                {slot.disabled ? '준비중' : slot.label}
              </span>
            </button>
          )
        })}
      </div>

      <button className={styles.completeBtn} onClick={goToDressup}>캐릭터 코디하기</button>
      <button className={styles.logoutBtn} onClick={handleLogout}>로그아웃</button>

      {import.meta.env.DEV && (
        <button className={styles.devResetBtn} onClick={handleReset} disabled={resetting}>
          {resetting ? '초기화 중...' : '슬롯 비우기'}
        </button>
      )}
    </div>
  )
}
