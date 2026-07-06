// 비밀번호 규칙(숫자 4자리, 반복/연속 패턴 금지) 검증 — docs/PRD-collection-game.md 4-1 참고
// 안내 문구에는 규칙을 노출하지 않고, 이 로직으로만 걸러낸다.
export function isWeakPassword(pw) {
  if (!/^\d{4}$/.test(pw)) return true

  const d = pw.split('').map(Number)

  const allSame = d.every((n) => n === d[0])
  if (allSame) return true

  const ascending = d.every((n, i) => i === 0 || n === d[i - 1] + 1)
  const descending = d.every((n, i) => i === 0 || n === d[i - 1] - 1)
  if (ascending || descending) return true

  const repeatingPair = d[0] === d[2] && d[1] === d[3]
  if (repeatingPair) return true

  return false
}
