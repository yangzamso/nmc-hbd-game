import { useState } from 'react'
import { useSessionStore } from '../store/sessionStore'
import { SLOTS } from '../data/slots'
import { COSTUMES } from '../data/costumes'
import { CapsuleReveal } from '../components/common/CapsuleReveal'
import styles from './GameScreen.module.css'
import dusty from '../styles/dustyBg.module.css'

const costumeById = Object.fromEntries(COSTUMES.map((c) => [c.id, c]))

// 0단계 스켈레톤 — 슬롯별 실제 게임은 3~5단계에서 이 자리를 대체한다.
// 슬롯6(럭키드로우)의 정식 관리자 확인 UI는 5단계에서 만들며, 지금은 임시로 prompt()를 사용한다.
export function GameScreen() {
  const activeSlotId = useSessionStore((s) => s.activeSlotId)
  const backToHub = useSessionStore((s) => s.backToHub)
  const clearSlot = useSessionStore((s) => s.clearSlot)
  const adminClearSlot6 = useSessionStore((s) => s.adminClearSlot6)
  const getRandomUnownedFromPool = useSessionStore((s) => s.getRandomUnownedFromPool)
  const [reward, setReward] = useState(null)
  const [error, setError] = useState('')

  const slot = SLOTS.find((s) => s.id === activeSlotId)

  async function handleTestClear() {
    setError('')
    if (slot.special) {
      const adminPassword = window.prompt('관리자 비밀번호 (임시 테스트용 — 5단계에서 정식 UI로 교체)')
      if (!adminPassword) return
      try {
        await adminClearSlot6(adminPassword)
        setReward('strawberry')
      } catch (e) {
        setError(e.message)
      }
      return
    }
    const costumeId = getRandomUnownedFromPool()
    if (!costumeId) return
    setReward(costumeId)
  }

  async function handleConfirmReveal() {
    if (!slot.special) {
      await clearSlot(slot.id, reward)
    }
    setReward(null)
    backToHub()
  }

  if (reward) {
    return <CapsuleReveal costume={costumeById[reward]} onConfirm={handleConfirmReveal} />
  }

  return (
    <div className={`${styles.screen} ${dusty.dustyBg}`}>
      <button className={styles.backBtn} onClick={backToHub}>← 허브로</button>
      <h2 className={styles.title}>{slot?.label}</h2>
      <p className={styles.notice}>게임 화면 준비 중 (0단계 스켈레톤)</p>
      {error && <p className={styles.notice}>{error}</p>}
      <button className={styles.testClearBtn} onClick={handleTestClear}>테스트 클리어</button>
    </div>
  )
}
