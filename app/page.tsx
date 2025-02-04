'use client'

import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import { Database } from './types/database.types'

type Tweet = Database['public']['Tables']['tweets']['Row']

export default function Home() {
  const [tweets, setTweets] = useState<Tweet[]>([])
  const [newTweet, setNewTweet] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    // システムのダークモード設定を検出
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true)
      document.documentElement.classList.add('dark')
    }

    // ダークモード設定の変更を監視
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => {
      setIsDarkMode(e.matches)
      if (e.matches) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
    mediaQuery.addEventListener('change', handleChange)

    fetchTweets()

    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    if (!isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    
    try {
      if (!newTweet.trim()) return

      const tweet = {
        content: newTweet,
        user_id: 'anonymous',
        likes: 0
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
        
        <button
          onClick={toggleDarkMode}
          className="mb-4 px-4 py-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          {isDarkMode ? '🌞 ライトモード' : '🌙 ダークモード'}
        </button>
        
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
          <button
            type="submit"
            className={`mt-2 px-4 py-2 rounded-full transition-colors text-white ${
              isLoading 
                ? 'opacity-50 cursor-not-allowed' 
                : 'bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700'
            }`}
            disabled={isLoading}
          >
            {isLoading ? '送信中...' : 'ツイートする'}
          </button>
        </form>

        {/* ツイート一覧 */}
        <div className="space-y-4">
          {tweets.map((tweet) => (
            <div 
              key={tweet.id} 
              className="p-4 border rounded-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
            >
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
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
