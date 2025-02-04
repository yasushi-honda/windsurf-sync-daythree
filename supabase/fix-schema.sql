-- 既存のテーブルを削除
drop table if exists tweets;

-- tweetsテーブルを再作成（user_idをtext型に変更）
create table tweets (
    id bigint generated by default as identity primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    content text not null,
    user_id text not null,  -- UUIDからtextに変更
    likes integer default 0
);

-- RLSポリシーを設定
alter table tweets enable row level security;

-- すべてのユーザーが読み取り可能
create policy "Tweets are viewable by everyone" on tweets
    for select using (true);

-- すべてのユーザーが作成可能（テスト用）
create policy "Anyone can create tweets" on tweets
    for insert with check (true);

-- テストデータを挿入
insert into tweets (content, user_id) values
    ('これはテストツイートです', 'anonymous'),
    ('Hello, World!', 'anonymous');
