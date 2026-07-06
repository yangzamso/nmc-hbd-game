import bcrypt from 'bcryptjs'
import { sql } from '../lib/db.js'
import { rowToSlots } from '../lib/slots.js'
import { isWeakPassword } from '../src/utils/password.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { nickname, password } = req.body || {}
  const name = (nickname || '').trim()

  if (!name) return res.status(400).json({ error: '닉네임을 입력해주세요' })
  if (isWeakPassword(password)) return res.status(400).json({ error: '비밀번호를 다시 설정해주세요' })

  const existing = await sql`SELECT nickname FROM players WHERE nickname = ${name}`
  if (existing.length > 0) return res.status(409).json({ error: '이미 존재하는 닉네임입니다' })

  const passwordHash = await bcrypt.hash(password, 10)
  const rows = await sql`
    INSERT INTO players (nickname, password_hash)
    VALUES (${name}, ${passwordHash})
    RETURNING *
  `
  res.status(200).json({ slots: rowToSlots(rows[0]) })
}
