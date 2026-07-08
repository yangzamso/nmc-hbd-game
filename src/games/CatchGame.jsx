import { useEffect, useRef, useState } from 'react'
import { COSTUMES, CHARACTER_CROP, getCostumeDisplaySize } from '../data/costumes'
import styles from './CatchGame.module.css'

// 옷 5종 + 꽝 1칸 = 총 6칸 (룰렛과 동일 풀/재도전 로직 재사용, PRD 6절)
const ITEMS = [
  ...COSTUMES.filter((c) => c.id !== 'strawberry'),
  { id: 'blank', name: '꽝', image: null },
]
const TICK_MS = 110 // 옷이 바뀌는 간격 (제자리에서 빠르게 순환)
const SETTLE_DELAY_MS = 800

// 시작 시 "아저씨" 칸이 보이도록 초기값 고정
const AJUSSI_INDEX = ITEMS.findIndex((c) => c.id === 'ajussi')

// .characterImg의 실제 표시 너비(CSS)와 동일해야 옷 배율이 캐릭터와 일치함
const CHAR_IMG_W = 140
const CHAR_NAT_W = CHARACTER_CROP.x2 - CHARACTER_CROP.x1
const CHAR_SCALE = CHAR_IMG_W / CHAR_NAT_W

// 슬롯4 캐치캐치 — 캐릭터 위에 옷이 입혀진 채로 제자리에서 빠르게 순환 전환되고,
// START로 시작해 STOP을 누르는 순간 그 시점에 캐릭터가 입고 있던 옷이 결과로 확정된다.
// 재도전/보상 로직은 룰렛(슬롯3)과 동일: 꽝/중복이면 재도전, 새 옷이면 캡슐 가챠로 확정.
// 이미 클리어된 슬롯(재도전)은 정지 타이밍과 무관하게 항상 원래 옷으로 스냅되어 확정된다.
export function CatchGame({ ownedIds, alreadyCleared, onResult }) {
  const [index, setIndex] = useState(AJUSSI_INDEX)
  const [swapKey, setSwapKey] = useState(0)
  const [started, setStarted] = useState(false)
  const [running, setRunning] = useState(false)
  const [showingResult, setShowingResult] = useState(false)
  const [retryMsg, setRetryMsg] = useState('')
  const intervalRef = useRef(null)
  const timeoutsRef = useRef([])
  const indexRef = useRef(AJUSSI_INDEX)

  useEffect(() => () => {
    clearInterval(intervalRef.current)
    timeoutsRef.current.forEach(clearTimeout)
  }, [])

  function showIndex(nextIndex) {
    indexRef.current = nextIndex
    setIndex(nextIndex)
    setSwapKey((k) => k + 1)
  }

  function handleStart() {
    setRetryMsg('')
    setStarted(true)
    setRunning(true)
    intervalRef.current = setInterval(() => {
      showIndex((indexRef.current + 1) % ITEMS.length)
    }, TICK_MS)
  }

  function handleStop() {
    clearInterval(intervalRef.current)
    setRunning(false)

    // 재도전(이미 클리어된 슬롯)은 정지 타이밍과 무관하게 원래 옷 칸으로 스냅
    if (alreadyCleared) {
      showIndex(ITEMS.findIndex((c) => c.id === alreadyCleared))
    }

    setShowingResult(true)
    const landedId = alreadyCleared || ITEMS[indexRef.current].id

    const t = setTimeout(() => {
      setShowingResult(false)
      if (alreadyCleared) {
        onResult(alreadyCleared)
        return
      }
      if (landedId === 'blank') {
        setRetryMsg('꽝! 다시 도전해주세요')
      } else if (ownedIds.includes(landedId)) {
        setRetryMsg('이미 보유한 옷이에요! 다시 도전해주세요')
      } else {
        onResult(landedId)
      }
    }, SETTLE_DELAY_MS)
    timeoutsRef.current.push(t)
  }

  const current = ITEMS[index]
  const currentSize = current.id !== 'blank' ? getCostumeDisplaySize(current, CHAR_SCALE) : null

  return (
    <div className={styles.catch}>
      <div className={styles.stage}>
        <img src="/items/character_base.png" alt="닛몰캐쉬" className={styles.characterImg} draggable={false} />
        {started && (
          <div key={swapKey} className={styles.wornItem}>
            {current.id === 'blank' ? (
              <span className={styles.blankText}>꽝</span>
            ) : (
              <img
                src={current.image}
                alt={current.name}
                className={styles.wornImg}
                style={{ width: currentSize.w, height: currentSize.h }}
              />
            )}
          </div>
        )}
      </div>

      <p className={styles.duplicateMsg} style={{ visibility: retryMsg ? 'visible' : 'hidden' }}>
        {retryMsg || ' '}
      </p>

      {!running && !showingResult && (
        <button className={styles.startBtn} onClick={handleStart}>START</button>
      )}
      {running && (
        <button className={styles.stopBtn} onClick={handleStop}>STOP</button>
      )}
      {!running && showingResult && (
        <button className={styles.startBtn} style={{ visibility: 'hidden' }}>START</button>
      )}
    </div>
  )
}
