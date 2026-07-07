import { useEffect, useRef, useState } from 'react'
import { COSTUMES } from '../data/costumes'
import styles from './CatchGame.module.css'

// 옷 5종 + 꽝 1칸 = 총 6칸 (룰렛과 동일 풀/재도전 로직 재사용, PRD 6절)
const ITEMS = [
  ...COSTUMES.filter((c) => c.id !== 'strawberry'),
  { id: 'blank', name: '꽝', image: null },
]
const FAST_TICK_MS = 260
const FAST_DURATION_MS = 1500
// 감속 구간 — 스텝마다 점점 느려짐 (합계 1800ms, 룰렛 DECEL_MS와 동일 페이싱)
const DECEL_STEPS_MS = [200, 260, 340, 440, 560]
const SETTLE_DELAY_MS = 1000

// 시작 시 "아저씨" 칸이 캐치존에 오도록 초기값 고정 (룰렛의 INITIAL_ROTATION과 동일 개념)
const AJUSSI_INDEX = ITEMS.findIndex((c) => c.id === 'ajussi')

// 슬롯4 낙하 캐치 — 옷이 위에서 아래로 순환하며 떨어지다가(START) STOP 시점에 캐치존에 걸린 옷이 결과.
// 룰렛(슬롯3)과 동일하게 미리 목표 칸을 정해두고, 그 칸에서 정확히 멈추도록 스텝을 스케줄링.
// 재도전/보상 로직도 룰렛과 동일: 이미 클리어된 슬롯은 원래 옷 그대로, 꽝/중복이면 재도전 안내.
export function CatchGame({ ownedIds, alreadyCleared, onResult }) {
  const [index, setIndex] = useState(AJUSSI_INDEX)
  const [dropKey, setDropKey] = useState(0)
  const [falling, setFalling] = useState(false)
  const [settling, setSettling] = useState(false)
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
    setDropKey((k) => k + 1)
  }

  function advance() {
    showIndex((indexRef.current + 1) % ITEMS.length)
  }

  function handleStart() {
    setRetryMsg('')
    setFalling(true)
    intervalRef.current = setInterval(advance, FAST_TICK_MS)

    const t0 = setTimeout(startDecel, FAST_DURATION_MS)
    timeoutsRef.current.push(t0)
  }

  function startDecel() {
    clearInterval(intervalRef.current)
    setFalling(false)
    setSettling(true)

    // 목표 칸을 미리 정하고, 감속 마지막 스텝에서 정확히 그 칸에 멈추도록 함
    // 이미 클리어된 슬롯(재도전)은 반드시 원래 옷에서 멈추도록 목표를 고정
    const targetIndex = alreadyCleared
      ? ITEMS.findIndex((c) => c.id === alreadyCleared)
      : Math.floor(Math.random() * ITEMS.length)

    let cumulative = 0
    DECEL_STEPS_MS.forEach((stepDelay, i) => {
      cumulative += stepDelay
      const isLast = i === DECEL_STEPS_MS.length - 1
      const t = setTimeout(() => {
        if (isLast) {
          showIndex(targetIndex)
        } else {
          advance()
        }
      }, cumulative)
      timeoutsRef.current.push(t)
    })

    const t1 = setTimeout(() => {
      setSettling(false)
      setShowingResult(true)

      const t2 = setTimeout(() => {
        setShowingResult(false)
        if (alreadyCleared) {
          onResult(alreadyCleared)
          return
        }
        const landed = ITEMS[targetIndex]
        if (landed.id === 'blank') {
          setRetryMsg('꽝! 다시 떨어뜨려주세요')
        } else if (ownedIds.includes(landed.id)) {
          setRetryMsg('이미 보유한 옷이에요! 다시 떨어뜨려주세요')
        } else {
          onResult(landed.id)
        }
      }, SETTLE_DELAY_MS)
      timeoutsRef.current.push(t2)
    }, cumulative)
    timeoutsRef.current.push(t1)
  }

  const current = ITEMS[index]
  const isDropping = falling || settling

  return (
    <div className={styles.catch}>
      <div className={styles.chute}>
        <div key={dropKey} className={styles.dropItem}>
          {current.id === 'blank' ? (
            <span className={styles.blankText}>꽝</span>
          ) : (
            <img src={current.image} alt={current.name} className={styles.dropImg} />
          )}
        </div>
        <div className={styles.catchZone} />
      </div>

      <p className={styles.duplicateMsg} style={{ visibility: retryMsg ? 'visible' : 'hidden' }}>
        {retryMsg || ' '}
      </p>

      <button
        className={styles.startBtn}
        onClick={handleStart}
        disabled={isDropping || showingResult}
        style={{ visibility: isDropping || showingResult ? 'hidden' : 'visible' }}
      >
        START
      </button>
    </div>
  )
}
