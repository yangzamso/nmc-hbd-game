import bcrypt from 'bcryptjs'
import { sql } from '../lib/db.js'
import { rowToSlots } from '../lib/slots.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { nickname, password } = req.body || {}
  const name = (nickname || '').trim()

  const rows = await sql`SELECT * FROM players WHERE nickname = ${name}`
  if (rows.length === 0) return res.status(404).json({ error: '없는 닉네임입니다' })

  const match = await bcrypt.compare(password || '', rows[0].password_hash)
  if (!match) return res.status(401).json({ error: '닉네임 또는 비밀번호가 틀렸습니다' })

  res.status(200).json({ slots: rowToSlots(rows[0]) })
}
