export async function getInstagramPosts() {
  try {
    const token = process.env.NEXT_PUBLIC_INSTAGRAM_TOKEN;
    
    if (!token) {
      console.error("Instagram token is not defined");
      return { error: "Instagram token is not defined", posts: [] };
    }
    
    // Instagram Graph API 호출
    const response = await fetch(
      `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp&access_token=${token}`
    );
    
    if (!response.ok) {
      throw new Error(`Instagram API 오류: ${response.status}`);
    }
    
    const data = await response.json();
    
    // 최대 6개의 최근 게시물만 반환
    return { 
      posts: data.data.slice(0, 6).map(post => ({
        id: post.id,
        caption: post.caption || "",
        mediaUrl: post.media_type === "VIDEO" ? post.thumbnail_url : post.media_url,
        permalink: post.permalink,
        timestamp: post.timestamp,
        mediaType: post.media_type
      })),
      error: null
    };
  } catch (error) {
    console.error("Instagram 데이터 가져오기 오류:", error);
    return { error: error.message, posts: [] };
  }
} 