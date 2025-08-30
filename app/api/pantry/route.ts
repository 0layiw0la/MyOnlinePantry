// app/api/pantry/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { ObjectId, MongoClient, WithId } from 'mongodb'
import clientPromise from '@/lib/mongodb'

interface PantryItemData {
  name: string
  dateAdded: string
  createdAt: string
  userId: string
}

type PantryItem = WithId<PantryItemData>

export async function GET(request: NextRequest) {
  try {
    const client: MongoClient = await clientPromise
    const db = client.db('pantry')
    const collection = db.collection<PantryItemData>('items')

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    const items = await collection.find({ userId }).sort({ dateAdded: -1 }).toArray()
    return NextResponse.json(items)
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const client: MongoClient = await clientPromise
    const db = client.db('pantry')
    const collection = db.collection<PantryItemData>('items')

    const { name, dateAdded, userId }: { name?: string; dateAdded?: string; userId?: string } =
      await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }
    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Item name is required' }, { status: 400 })
    }

    const newItem: PantryItemData = {
      name: name.trim().toLowerCase(),
      dateAdded: dateAdded || new Date().toISOString(),
      createdAt: new Date().toISOString(),
      userId,
    }

    const result = await collection.insertOne(newItem)
    const createdItem = await collection.findOne({ _id: result.insertedId })

    if (!createdItem) {
      return NextResponse.json({ error: 'Failed to create item' }, { status: 500 })
    }

    return NextResponse.json(createdItem, { status: 201 })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const client: MongoClient = await clientPromise
    const db = client.db('pantry')
    const collection = db.collection<PantryItemData>('items')

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 })
    }

    const result = await collection.deleteOne({ _id: new ObjectId(id) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Item deleted successfully' })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
