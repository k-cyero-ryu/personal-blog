import { writeFile, readFile } from 'fs/promises';
import path from 'path';

const STORAGE_FILE = path.join(process.cwd(), 'blog-posts.json');

export type BlogPost = {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  imageUrl?: string;
  tags?: string[];
};

export const defaultBlogPosts: BlogPost[] = [
  {
    id: 1,
    title: "Welcome to My Photography Blog",
    content: "Hello everyone! This is where I'll be sharing my photography journey, latest shoots, and creative ideas.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: ["welcome", "photography"],
  },
];

export async function saveBlogPosts(posts: BlogPost[]): Promise<void> {
  await writeFile(STORAGE_FILE, JSON.stringify(posts, null, 2));
}

export async function loadBlogPosts(): Promise<BlogPost[]> {
  try {
    const data = await readFile(STORAGE_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.log('No saved blog posts found, using defaults');
    return defaultBlogPosts;
  }
}
