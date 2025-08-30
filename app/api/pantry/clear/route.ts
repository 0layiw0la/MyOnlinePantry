// app/api/pantry/clear/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'
import clientPromise from '@/lib/mongodb'

export async function DELETE(request: NextRequest) {
  try {
    console.log('Attempting to clear all pantry data...')
    const client: MongoClient = await clientPromise
    const db = client.db('pantry')
    const collection = db.collection('items')

    // Delete all documents in the collection
    const result = await collection.deleteMany({})
    
    console.log(`Deleted ${result.deletedCount} items from pantry`)
    
    return NextResponse.json({ 
      message: `Successfully deleted ${result.deletedCount} items from pantry`,
      deletedCount: result.deletedCount
    })
  } catch (error) {
    console.error('Error clearing pantry data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}