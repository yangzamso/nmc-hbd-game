import bcrypt from 'bcryptjs'
import { sql } from '../lib/db.js'
import { rowToSlots } from '../lib/slots.js'

// 로컬 개발용 — 현재 플레이어의 슬롯 전체를 초기화 (테스트 반복용)
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { nickname, password } = req.body || {}
  const name = (nickname || '').trim()

  const rows = await sql`SELECT * FROM players WHERE nickname = ${name}`
  if (rows.length === 0) return res.status(404).json({ error: '없는 닉네임입니다' })

  const match = await bcrypt.compare(password || '', rows[0].password_hash)
  if (!match) return res.status(401).json({ error: '인증에 실패했습니다' })

  const updated = await sql`
    UPDATE players
    SET slot1 = NULL, slot2 = NULL, slot3 = NULL, slot4 = NULL, slot5 = NULL, slot6 = NULL
    WHERE nickname = ${name}
    RETURNING *
  `
  res.status(200).json({ slots: rowToSlots(updated[0]) })
}
