export const RESERVED_REGISTER_NICKNAMES = new Set([
  '차청일',
  '닛몰캐쉬',
  'needmorecash',
])

export function isReservedRegisterNickname(nickname = '') {
  return RESERVED_REGISTER_NICKNAMES.has(nickname.trim().toLowerCase())
}
