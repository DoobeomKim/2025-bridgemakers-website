'use client';

import { useEffect, useState } from 'react';

interface InstagramTestPost {
  id: string;
  media_type: string;
  media_url: string;
  permalink: string;
}

export default function InstagramTest() {
  const [data, setData] = useState<InstagramTestPost[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Instagram Graph API 직접 호출
        const token = process.env.NEXT_PUBLIC_INSTAGRAM_ACCESS_TOKEN;
        const fields = 'id,media_type,media_url,permalink';
        const url = `https://graph.instagram.com/me/media?fields=${fields}&access_token=${token}&limit=3`;
        
        const response = await fetch(url);
        const result = await response.json();

        if (result.error) {
          setError(result.error.message || 'Failed to fetch Instagram data');
          return;
        }

        setData(result.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="p-4 text-center">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="text-lg font-bold mb-4">Instagram API Test</h3>
      <div className="space-y-4">
        {data.map(post => (
          <div key={post.id} className="bg-white p-4 rounded shadow">
            {post.media_type === 'IMAGE' && (
              <img 
                src={post.media_url} 
                alt="Instagram post" 
                className="w-full h-48 object-cover rounded"
              />
            )}
            <a 
              href={post.permalink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="mt-2 text-blue-500 hover:underline block"
            >
              View on Instagram
            </a>
          </div>
        ))}
      </div>
    </div>
  );
} 