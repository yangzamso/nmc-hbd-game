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

  function handleSubmit() {
    const unanswered = questions.some((q) => !isAnswered(q, answers[q.id]))
    if (unanswered) {
      setError('모든 문항에 답해주세요')
      return
    }

    const allCorrect = questions.every((q) => isCorrect(q, answers[q.id]))
    if (!allCorrect) {
      onFail()
      return
    }

    setError('')
    onClear()
  }

  return (
    <div className={styles.quiz}>
      {questions.map((q, qIndex) => (
        <div key={q.id} className={styles.question}>
          <p className={styles.questionText}>{qIndex + 1}. {q.question}</p>
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
                  {i + 1}) {opt}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
      {error && <p className={styles.error}>{error}</p>}
      <button className={styles.submitBtn} onClick={handleSubmit}>제출하기</button>
    </div>
  )
}
