'use client'

import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import { Database } from './types/database.types'

type Tweet = Database['public']['Tables']['tweets']['Row']

export default function Home() {
  const [tweets, setTweets] = useState<Tweet[]>([])
  const [newTweet, setNewTweet] = useState('')

  useEffect(() => {
    fetchTweets()
  }, [])

  async function fetchTweets() {
    const { data, error } = await supabase
      .from('tweets')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching tweets:', error)
      return
    }

    setTweets(data || [])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!newTweet.trim()) return

    const { error } = await supabase
      .from('tweets')
      .insert([
        {
          content: newTweet,
          user_id: 'temp-user-id', // 後で認証を実装する際に実際のユーザーIDに置き換えます
        },
      ])

    if (error) {
      console.error('Error creating tweet:', error)
      return
    }

    setNewTweet('')
    fetchTweets()
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Twitter Clone</h1>
      
      {/* Tweet投稿フォーム */}
      <form onSubmit={handleSubmit} className="mb-8">
        <textarea
          className="w-full p-2 border rounded-lg resize-none"
          rows={3}
          placeholder="いまどうしてる？"
          value={newTweet}
          onChange={(e) => setNewTweet(e.target.value)}
        />
        <button
          type="submit"
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
        >
          ツイートする
        </button>
      </form>

      {/* ツイート一覧 */}
      <div className="space-y-4">
        {tweets.map((tweet) => (
          <div key={tweet.id} className="p-4 border rounded-lg">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-2">
                  {new Date(tweet.created_at).toLocaleString()}
                </p>
                <p className="text-gray-900">{tweet.content}</p>
              </div>
              <button
                className="text-gray-400 hover:text-red-500"
                onClick={() => {/* いいね機能を実装予定 */}}
              >
                ♥ {tweet.likes || 0}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
