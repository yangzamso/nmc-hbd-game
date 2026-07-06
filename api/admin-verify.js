import { sql } from '../lib/db.js'
import { rowToSlots } from '../lib/slots.js'

// 슬롯6(럭키드로우) 전용 — ADMIN_PASSWORD는 서버 환경변수로만 존재하며 클라이언트로 절대 전달되지 않는다
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { nickname, adminPassword } = req.body || {}
  const name = (nickname || '').trim()

  if (!process.env.ADMIN_PASSWORD) {
    return res.status(500).json({ error: '관리자 비밀번호가 설정되지 않았습니다' })
  }
  if (adminPassword !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: '관리자 비밀번호가 틀렸습니다' })
  }

  const rows = await sql`SELECT * FROM players WHERE nickname = ${name}`
  if (rows.length === 0) return res.status(404).json({ error: '없는 닉네임입니다' })

  if (rows[0].slot6) {
    return res.status(200).json({ slots: rowToSlots(rows[0]) })
  }

  const updated = await sql`UPDATE players SET slot6 = 'strawberry' WHERE nickname = ${name} RETURNING *`
  res.status(200).json({ slots: rowToSlots(updated[0]) })
}
