import { useSessionStore } from '../store/sessionStore'
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

  const clearedCount = Object.values(slots).filter(Boolean).length

  return (
    <div className={`${styles.hub} ${dusty.dustyBg}`}>
      <img src="/logo.png" alt="NEED MORE CASH — 2026 HBD CAFE" className={styles.logo} />
      <p className={styles.greeting}>{nickname}님, 옷을 모아보세요!</p>
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
              onClick={() => !slot.disabled && openSlot(slot.id)}
              disabled={slot.disabled}
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

      {clearedCount === 6 && (
        <button className={styles.completeBtn} onClick={goToDressup}>코디하러 가기</button>
      )}
    </div>
  )
}
