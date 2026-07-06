import { sql } from '../lib/db.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const nickname = (req.query.nickname || '').trim()
  if (!nickname) return res.status(400).json({ error: '닉네임이 필요합니다' })

  const rows = await sql`SELECT nickname FROM players WHERE nickname = ${nickname}`
  res.status(200).json({ exists: rows.length > 0 })
}
