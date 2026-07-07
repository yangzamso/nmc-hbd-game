import { useState } from 'react'
import { pickQuizSet } from '../data/quizQuestions'
import styles from './QuizGame.module.css'

function normalize(str) {
  return (str || '').replace(/\s+/g, '')
}

function isAnswered(q, value) {
  if (q.type === 'text') {
    return Array.isArray(value) && q.blanks.every((_, i) => normalize(value[i]).length > 0)
  }
  return value !== undefined
}

function isCorrect(q, value) {
  if (q.type === 'text') {
    if (!Array.isArray(value)) return false
    return q.blanks.every((blank, i) => normalize(value[i]) === normalize(blank))
  }
  return value === q.answerIndex
}

export function QuizGame({ onClear, onFail }) {
  const [questions] = useState(pickQuizSet)
  const [answers, setAnswers] = useState({})
  const [error, setError] = useState('')
  const [index, setIndex] = useState(0)

  const q = questions[index]
  const isLast = index === questions.length - 1

  function selectOption(qId, optionIndex) {
    setAnswers((prev) => ({ ...prev, [qId]: optionIndex }))
  }

  function setBlankAnswer(qId, blankIndex, value) {
    setAnswers((prev) => {
      const next = Array.isArray(prev[qId]) ? [...prev[qId]] : []
      next[blankIndex] = value
      return { ...prev, [qId]: next }
    })
  }

  function goPrev() {
    setError('')
    setIndex((i) => Math.max(0, i - 1))
  }

  function goNext() {
    if (!isAnswered(q, answers[q.id])) {
      setError('정답을 입력해주세요')
      return
    }
    setError('')
    setIndex((i) => i + 1)
  }

  function handleSubmit() {
    if (!isAnswered(q, answers[q.id])) {
      setError('정답을 입력해주세요')
      return
    }

    const allCorrect = questions.every((qq) => isCorrect(qq, answers[qq.id]))
    if (!allCorrect) {
      onFail()
      return
    }

    setError('')
    onClear()
  }

  return (
    <div className={styles.quiz}>
      <p className={styles.progress}>{index + 1} / {questions.length}</p>

      <div key={q.id} className={styles.question}>
        <div className={styles.questionHead}>
          <span className={styles.questionBadge}>{index + 1}</span>
          <p className={styles.questionText}>{q.question}</p>
        </div>

        {q.excerpt && <p className={styles.excerpt}>{q.excerpt}</p>}

        {q.type === 'text' ? (
          <div className={styles.blanks}>
            {q.blanks.map((_, i) => (
              <input
                key={i}
                className={styles.textInput}
                type="text"
                value={(answers[q.id] && answers[q.id][i]) || ''}
                onChange={(e) => setBlankAnswer(q.id, i, e.target.value)}
                placeholder={q.blanks.length > 1 ? `빈칸 ${i + 1} 정답` : '정답 입력'}
              />
            ))}
          </div>
        ) : (
          <div className={styles.options}>
            {q.options.map((opt, i) => (
              <button
                key={i}
                className={`${styles.option} ${answers[q.id] === i ? styles.selected : ''}`}
                onClick={() => selectOption(q.id, i)}
              >
                <span className={styles.optionBadge}>{String.fromCharCode(65 + i)}</span>
                <span className={styles.optionText}>{opt}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.nav}>
        {index > 0 && (
          <button className={styles.prevBtn} onClick={goPrev}>이전</button>
        )}
        {isLast ? (
          <button className={styles.submitBtn} onClick={handleSubmit}>제출하기</button>
        ) : (
          <button className={styles.submitBtn} onClick={goNext}>다음</button>
        )}
      </div>
    </div>
  )
}
