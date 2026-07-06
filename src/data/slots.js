// 컬렉션 허브 6슬롯 정의 — docs/PRD-collection-game.md 참고
export const SLOTS = [
  { id: 1, game: 'card',      label: '카드 뒤집기' },
  { id: 2, game: 'quiz',      label: '퀴즈' },
  { id: 3, game: 'roulette',  label: '룰렛' },
  { id: 4, game: 'catch',     label: '낙하 캐치' },
  { id: 5, game: 'shake',     label: '흔들기',     disabled: true }, // 개발 보류 (기획만 존재)
  { id: 6, game: 'lucky',     label: '럭키드로우', special: true },  // 포토카드 구매 전용 (딸기)
]

export const EMPTY_SLOTS = { 1: null, 2: null, 3: null, 4: null, 5: null, 6: null }
