import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://nolpsrkubpcpeflormxu.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5vbHBzcmt1YnBjcGVmbG9ybXh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg2NTQ1ODYsImV4cCI6MjA1NDIzMDU4Nn0.qnOWL_r9RGUO7eJcn91qQ7RWAZeIkkkP8n80o-pOMgM'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testSupabase() {
  // テストツイートを投稿
  const { data: insertData, error: insertError } = await supabase
    .from('tweets')
    .insert([
      {
        content: 'Test tweet from Node.js',
        user_id: '00000000-0000-0000-0000-000000000000'
      }
    ])
    .select()

  if (insertError) {
    console.error('Error inserting tweet:', insertError)
  } else {
    console.log('Tweet inserted:', insertData)
  }

  // 投稿されたツイートを取得
  const { data: tweets, error: selectError } = await supabase
    .from('tweets')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5)

  if (selectError) {
    console.error('Error fetching tweets:', selectError)
  } else {
    console.log('Recent tweets:', tweets)
  }
}

testSupabase()
