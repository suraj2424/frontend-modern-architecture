export interface Post{
    id: number;
    author: string;
    content: string;
    likes: number;
    isLiked: boolean;
}

export const posts: Post[] = [
  {
    "id": 1,
    "author": "Alex",
    "content": "Beautiful sunset today! 🌅",
    "likes": 42,
    "isLiked": false
  },
  {
    "id": 2,
    "author": "Jordan",
    "content": "Just finished reading an amazing book about web development! 📚",
    "likes": 28,
    "isLiked": true
  },
  {
    "id": 3,
    "author": "Sam",
    "content": "Coffee is the fuel that powers my code ☕💻",
    "likes": 156,
    "isLiked": false
  },
  {
    "id": 4,
    "author": "Taylor",
    "content": "Excited to learn about Server-Sent Events today!",
    "likes": 73,
    "isLiked": true
  },
  {
    "id": 5,
    "author": "Morgan",
    "content": "Debugging: the art of knowing you were wrong at every point before finding the actual error 🔍",
    "likes": 89,
    "isLiked": false
  },
  {
    "id": 6,
    "author": "Casey",
    "content": "Just deployed my first Next.js app! 🚀",
    "likes": 201,
    "isLiked": true
  },
  {
    "id": 7,
    "author": "Riley",
    "content": "TypeScript makes everything better. Fight me. ✨",
    "likes": 134,
    "isLiked": false
  },
  {
    "id": 8,
    "author": "Quinn",
    "content": "Anyone else excited about the new React features?",
    "likes": 67,
    "isLiked": true
  },
  {
    "id": 9,
    "author": "Avery",
    "content": "Late night coding session vibes 🌙",
    "likes": 45,
    "isLiked": false
  },
  {
    "id": 10,
    "author": "Drew",
    "content": "Remember to take breaks and stretch! Your body will thank you 💪",
    "likes": 312,
    "isLiked": true
  }
]