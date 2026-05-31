import fs from 'fs'
import path from 'path'
import { NextResponse } from 'next/server'

const DB_FILE = path.join(process.cwd(), 'src/lib/mock-db.json')

export async function GET() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf8')
      return NextResponse.json(JSON.parse(content))
    }
    return NextResponse.json({})
  } catch (err) {
    return NextResponse.json({ erro: err.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const mockDb = await request.json()
    fs.writeFileSync(DB_FILE, JSON.stringify(mockDb, null, 2), 'utf8')
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ erro: err.message }, { status: 500 })
  }
}
