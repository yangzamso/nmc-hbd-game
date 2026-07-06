async function post(path, body) {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || '요청에 실패했습니다')
  return data
}

export async function checkNicknameExists(nickname) {
  const res = await fetch(`/api/exists?nickname=${encodeURIComponent(nickname)}`)
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || '요청에 실패했습니다')
  return data.exists
}

export function registerPlayer(nickname, password) {
  return post('/api/register', { nickname, password })
}

export function loginPlayer(nickname, password) {
  return post('/api/login', { nickname, password })
}

export function updateSlot(nickname, password, slotId, costumeId) {
  return post('/api/slot', { nickname, password, slotId, costumeId })
}

export function adminVerifySlot6(nickname, adminPassword) {
  return post('/api/admin-verify', { nickname, adminPassword })
}
