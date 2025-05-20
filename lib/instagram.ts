import axios from 'axios';

export interface InstagramMediaItem {
  id: string;
  media_type: string;
  media_url: string;
  thumbnail_url?: string;
}

export interface InstagramPost {
  id: string;
  media_type: string;
  media_url: string;
  permalink: string;
  caption?: string;
  timestamp: string;
  thumbnail_url?: string;
  children?: {
    data: InstagramMediaItem[];
  };
}

interface InstagramApiResponse {
  data: InstagramPost[];
  paging?: {
    cursors: {
      before: string;
      after: string;
    };
    next: string;
  };
}

class InstagramService {
  private static instance: InstagramService;
  private accessToken: string | undefined;

  private constructor() {
    this.accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
  }

  public static getInstance(): InstagramService {
    if (!InstagramService.instance) {
      InstagramService.instance = new InstagramService();
    }
    return InstagramService.instance;
  }

  public async getFeed(limit: number = 6): Promise<InstagramPost[]> {
    try {
      if (!this.accessToken) {
        return [];
      }

      const fields = 'id,media_type,media_url,permalink,caption,timestamp,thumbnail_url,children{media_type,media_url,thumbnail_url}';
      const url = `https://graph.instagram.com/me/media?fields=${fields}&access_token=${this.accessToken}&limit=${limit}`;

      const response = await axios.get<InstagramApiResponse>(url);
      
      if (!response.data.data) {
        return [];
      }

      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('[Instagram API] Error:', {
          status: error.response?.status,
          message: error.message
        });
      }
      return [];
    }
  }

  public async refreshToken(): Promise<string | null> {
    try {
      if (!this.accessToken) {
        return null;
      }

      const url = `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${this.accessToken}`;
      const response = await axios.get(url);
      
      return response.data.access_token;
    } catch (error) {
      console.error('[Instagram API] Token refresh error:', error);
      return null;
    }
  }
}

export const instagramService = InstagramService.getInstance(); 