export interface User {
  userId: string;
  username: string;
  email: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface Meme {
  memeId: string;
  userId: string;
  imageUrl: string;
  caption: string;
  tags: string[];
  viralityScore: number;
  mood: string;
  likesCount: number;
  createdAt: string;
}

export interface Like {
  userId: string;
  memeId: string;
  createdAt: string;
}

export interface Comment {
  commentId: string;
  memeId: string;
  userId: string;
  username: string;
  avatarUrl: string;
  text: string;
  createdAt: string;
}
