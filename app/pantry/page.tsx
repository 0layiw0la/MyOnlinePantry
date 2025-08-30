// app/pantry/page.tsx
'use client'

import { useState, useEffect, FormEvent } from 'react'
import Head from 'next/head'
import { useAuthState } from 'react-firebase-hooks/auth'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Logo from '@/app/assets/logo.png';
import { auth } from '@/lib/firebase' // Adjust path to your Firebase config

interface PantryItem {
  _id: string
  name: string
  dateAdded: string
  createdAt: string
  userId: string
}

export default function Pantry() {
  const [user, loading, error] = useAuthState(auth)
  const router = useRouter();
  const [pantryItems, setPantryItems] = useState<PantryItem[]>([])
  const [loadingItems, setLoadingItems] = useState<boolean>(true)
  const [itemName, setItemName] = useState<string>('')
  const [isAdding, setIsAdding] = useState<boolean>(false)

  // Fetch pantry items when user is loaded
  useEffect(() => {
    if (user?.uid) {
      fetchPantryItems()
    } else if (!loading && !user) {
      // User is not authenticated
      setLoadingItems(false)
    }
  }, [user, loading])

  const fetchPantryItems = async (): Promise<void> => {
    if (!user?.uid) return
    
    try {
      setLoadingItems(true)
      const response = await fetch(`/api/pantry?userId=${user.uid}`)
      if (response.ok) {
        const items: PantryItem[] = await response.json()
        setPantryItems(items)
      } else {
        console.error('Failed to fetch pantry items')
      }
    } catch (error) {
      console.error('Error fetching pantry items:', error)
    } finally {
      setLoadingItems(false)
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    
    if (!user?.uid) {
      alert('Please log in to add items')
      return
    }
    
    if (!itemName.trim()) {
      alert('Please enter an item name')
      return
    }

    try {
      setIsAdding(true)
      const response = await fetch('/api/pantry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: itemName.trim(),
          dateAdded: new Date().toISOString(),
          userId: user.uid
        })
      })

      if (response.ok) {
        const newItem: PantryItem = await response.json()
        setPantryItems(prev => [...prev, newItem])
        setItemName('')
      } else {
        console.error('Failed to add pantry item')
        alert('Failed to add item to pantry')
      }
    } catch (error) {
      console.error('Error adding pantry item:', error)
      alert('Error adding item to pantry')
    } finally {
      setIsAdding(false)
    }
  }

  const handleDelete = async (itemId: string): Promise<void> => {
    if (!confirm('Are you sure you want to delete this item?')) {
      return
    }

    try {
      const response = await fetch(`/api/pantry?id=${itemId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setPantryItems(prev => prev.filter(item => item._id !== itemId))
      } else {
        console.error('Failed to delete pantry item')
        alert('Failed to delete item')
      }
    } catch (error) {
      console.error('Error deleting pantry item:', error)
      alert('Error deleting item')
    }
  }

  const calculateDaysInPantry = (dateAdded: string): number => {
    const today = new Date()
    const addedDate = new Date(dateAdded)
    const diffTime = Math.abs(today.getTime() - addedDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center py-8">
          <div className="text-gray-500">Loading...</div>
        </div>
      </div>
    )
  }

  // Show login prompt if not authenticated
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center py-8">
          <div className="text-gray-500">Please log in to access your pantry.</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl bg">
      <Head>
        <title>My Pantry</title>
        <meta name="description" content="Simple pantry management" />
      </Head>

      <div className="w-full flex justify-between mb-5"> 
        <Image
        src={Logo} 
        width={35} 
        height={35} 
        alt='logo'>
        </Image>
        
        <button
          onClick={() => router.push('/home')}
          className="bg-[#254635] hover:brightness-150 hover:cursor-pointer text-white px-4 py-1 rounded-lg shadow h-[34px]"
        >
          Home
        </button>
        </div>
      <p className="text-center text-[#254635] text-bold mb-5 text-2xl">Welcome to your pantry</p>

    <div className='rounded-lg bg-white'>
      {/* Add Item Form */}
      <div className=" p-4 ">
        <form onSubmit={handleSubmit} className="flex gap-4">
          <input
            type="text"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            className="flex-1 px-4 py-2 border focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter item name (e.g., Rice, Tomatoes, Bread)"
            disabled={isAdding}
          />
          <button
            type="submit"
            disabled={isAdding}
            className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 hover:cursor-pointer disabled:cursor-not-allowed"
          >
            {isAdding ? 'Adding...' : 'Add'}
          </button>
        </form>
      </div>

      {/* Pantry Items Display */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Pantry Items ({pantryItems.length})
          </h2>
          
          {loadingItems ? (
            <div className="text-center py-8">
              <div className="text-gray-500">Loading pantry items...</div>
            </div>
          ) : pantryItems.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500">Your pantry is empty. Add some items!</div>
            </div>
          ) : (
            <div className="space-y-3">
              {pantryItems.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
                >
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 capitalize">
                      {item.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {calculateDaysInPantry(item.dateAdded)} day{calculateDaysInPantry(item.dateAdded) !== 1 ? 's' : ''} in pantry
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="px-4 py-2 text-red-600 hover:bg-red-50 hover:cursor-pointer rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  )
}