import { useState } from 'react'
import styles from './CapsuleReveal.module.css'

// 모든 미니게임이 클리어 후 공유하는 캡슐 가챠 리빌 연출
export function CapsuleReveal({ costume, onConfirm }) {
  const [opened, setOpened] = useState(false)

  return (
    <div className={styles.overlay}>
      <div className={styles.stage}>
        {!opened ? (
          <button className={styles.capsule} onClick={() => setOpened(true)} aria-label="캡슐 열기">
            <span className={styles.capsuleTop} />
            <span className={styles.capsuleBottom} />
          </button>
        ) : (
          <div className={styles.reveal}>
            <img src={costume.image} alt={costume.name} className={styles.revealImg} />
            <p className={styles.revealName}>{costume.name} 획득!</p>
          </div>
        )}
      </div>
      {opened && (
        <button className={styles.confirmBtn} onClick={onConfirm}>확인</button>
      )}
    </div>
  )
}
