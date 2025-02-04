'use client'

import { useEffect, useState, useRef } from 'react'
import { supabase } from './lib/supabase'
import { Database } from './types/database.types'
import Image from 'next/image'

type Tweet = Database['public']['Tables']['tweets']['Row']

export default function Home() {
  const [tweets, setTweets] = useState<Tweet[]>([])
  const [newTweet, setNewTweet] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchTweets()
  }, [])

  async function fetchTweets() {
    try {
      console.log('Fetching tweets...')
      const { data, error } = await supabase
        .from('tweets')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching tweets:', error)
        setError(`Error fetching tweets: ${JSON.stringify(error)}`)
        return
      }

      console.log('Fetched tweets:', data)
      setTweets(data || [])
    } catch (e) {
      console.error('Exception fetching tweets:', e)
      setError(`Exception fetching tweets: ${e instanceof Error ? e.message : JSON.stringify(e)}`)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB制限
        setError('画像サイズは5MB以下にしてください')
        return
      }
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadImage = async (file: File) => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`
    const filePath = `${fileName}`

    const { data, error } = await supabase.storage
      .from('tweet-images')
      .upload(filePath, file)

    if (error) {
      throw error
    }

    const { data: { publicUrl } } = supabase.storage
      .from('tweet-images')
      .getPublicUrl(filePath)

    return publicUrl
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    
    try {
      if (!newTweet.trim()) return

      let image_url = null
      if (selectedImage) {
        image_url = await uploadImage(selectedImage)
      }

      const tweet = {
        content: newTweet,
        user_id: 'anonymous',
        likes: 0,
        image_url
      }
      console.log('Attempting to insert tweet:', tweet)

      const { data, error } = await supabase
        .from('tweets')
        .insert([tweet])
        .select()

      if (error) {
        console.error('Error creating tweet:', error)
        setError(`Error creating tweet: ${JSON.stringify(error)}`)
        return
      }

      console.log('Tweet created successfully:', data)
      setNewTweet('')
      setSelectedImage(null)
      setImagePreview(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      fetchTweets()
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : JSON.stringify(e)
      console.error('Exception creating tweet:', errorMessage)
      setError(`Exception creating tweet: ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-2xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          Twitter Clone
        </h1>
        
        {error && (
          <div className="px-4 py-3 rounded mb-4 bg-red-100 dark:bg-red-900 border-red-400 dark:border-red-700 text-red-700 dark:text-red-100 border">
            <pre className="whitespace-pre-wrap">{error}</pre>
          </div>
        )}

        {/* Tweet投稿フォーム */}
        <form onSubmit={handleSubmit} className="mb-8">
          <textarea
            className="w-full p-2 border rounded-lg resize-none bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            rows={3}
            placeholder="いまどうしてる？"
            value={newTweet}
            onChange={(e) => setNewTweet(e.target.value)}
            disabled={isLoading}
          />

          {/* 画像プレビュー */}
          {imagePreview && (
            <div className="mt-2 relative">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full max-h-64 object-contain rounded-lg"
              />
              <button
                type="button"
                onClick={() => {
                  setSelectedImage(null)
                  setImagePreview(null)
                  if (fileInputRef.current) {
                    fileInputRef.current.value = ''
                  }
                }}
                className="absolute top-2 right-2 bg-gray-800/50 text-white p-1 rounded-full hover:bg-gray-900/50"
              >
                ✕
              </button>
            </div>
          )}

          <div className="mt-2 flex items-center justify-between">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              ref={fileInputRef}
              className="text-sm text-gray-500 dark:text-gray-400
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                dark:file:bg-blue-900/50 dark:file:text-blue-200
                hover:file:bg-blue-100 dark:hover:file:bg-blue-900"
            />
            <button
              type="submit"
              className={`px-4 py-2 rounded-full transition-colors text-white ${
                isLoading 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700'
              }`}
              disabled={isLoading}
            >
              {isLoading ? '送信中...' : 'ツイートする'}
            </button>
          </div>
        </form>

        {/* ツイート一覧 */}
        <div className="space-y-4">
          {tweets.map((tweet) => (
            <div 
              key={tweet.id} 
              className="p-4 border rounded-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
            >
              <div className="flex flex-col">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm mb-2 text-gray-600 dark:text-gray-400">
                      {new Date(tweet.created_at).toLocaleString()}
                    </p>
                    <p className="text-gray-900 dark:text-white">
                      {tweet.content}
                    </p>
                  </div>
                  <button
                    className="transition-colors text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400"
                    onClick={() => {/* いいね機能を実装予定 */}}
                  >
                    ♥ {tweet.likes || 0}
                  </button>
                </div>
                {tweet.image_url && (
                  <div className="mt-3">
                    <img
                      src={tweet.image_url}
                      alt="Tweet image"
                      className="w-full max-h-96 object-contain rounded-lg"
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
