-- tweetsテーブルにimage_urlカラムを追加
alter table tweets
add column image_url text;

-- storageのバケットを作成
insert into storage.buckets (id, name, public) 
values ('tweet-images', 'tweet-images', true);

-- storageのポリシーを設定
create policy "Tweet images are publicly accessible"
on storage.objects for select
using ( bucket_id = 'tweet-images' );

create policy "Anyone can upload tweet images"
on storage.objects for insert
with check ( bucket_id = 'tweet-images' );
