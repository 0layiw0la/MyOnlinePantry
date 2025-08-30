// lib/mongodb.ts
import { MongoClient } from "mongodb"

if (!process.env.MONGODB_URI) {
  throw new Error("Missing MONGODB_URI")
}

const uri: string = process.env.MONGODB_URI
console.log('MongoDB URI format check:', uri.startsWith('mongodb://') || uri.startsWith('mongodb+srv://') ? 'Valid format' : 'Invalid format')

const options = {}

let client: MongoClient
let clientPromise: Promise<MongoClient>

declare global {
  // This must be a `var` and not a `let / const`
  var _mongoClientPromise: Promise<MongoClient> | undefined
}

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options)
    global._mongoClientPromise = client.connect()
  }
  clientPromise = global._mongoClientPromise
} else {
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

export default clientPromise