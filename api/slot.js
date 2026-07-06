import bcrypt from 'bcryptjs'
import { sql } from '../lib/db.js'
import { rowToSlots } from '../lib/slots.js'

// 슬롯6(럭키드로우)은 이 엔드포인트로 갱신하지 않는다 — /api/admin-verify 전용 (docs/PRD 7절)
function updateSlotColumn(name, slotId, costumeId) {
  switch (slotId) {
    case 1: return sql`UPDATE players SET slot1 = ${costumeId} WHERE nickname = ${name} RETURNING *`
    case 2: return sql`UPDATE players SET slot2 = ${costumeId} WHERE nickname = ${name} RETURNING *`
    case 3: return sql`UPDATE players SET slot3 = ${costumeId} WHERE nickname = ${name} RETURNING *`
    case 4: return sql`UPDATE players SET slot4 = ${costumeId} WHERE nickname = ${name} RETURNING *`
    case 5: return sql`UPDATE players SET slot5 = ${costumeId} WHERE nickname = ${name} RETURNING *`
    default: return null
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { nickname, password, slotId, costumeId } = req.body || {}
  const name = (nickname || '').trim()

  if (![1, 2, 3, 4, 5].includes(slotId)) return res.status(400).json({ error: '잘못된 슬롯입니다' })

  const rows = await sql`SELECT * FROM players WHERE nickname = ${name}`
  if (rows.length === 0) return res.status(404).json({ error: '없는 닉네임입니다' })

  const match = await bcrypt.compare(password || '', rows[0].password_hash)
  if (!match) return res.status(401).json({ error: '인증에 실패했습니다' })

  const column = `slot${slotId}`
  if (rows[0][column]) {
    // 이미 클리어된 슬롯 — 그대로 반환 (덮어쓰지 않음)
    return res.status(200).json({ slots: rowToSlots(rows[0]) })
  }

  const updated = await updateSlotColumn(name, slotId, costumeId)
  res.status(200).json({ slots: rowToSlots(updated[0]) })
}
