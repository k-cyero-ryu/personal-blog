import { writeFile, readFile } from 'fs/promises';
import path from 'path';

const STORAGE_FILE = path.join(process.cwd(), 'portfolio-items.json');

export type PortfolioItem = {
  id: number;
  name: string;
  description: string;
  technologies: string[];
  url?: string;
  github?: string;
};

export const defaultPortfolioItems: PortfolioItem[] = [
  {
    id: 1,
    name: "Photography Portfolio",
    description: "A modern photography portfolio showcasing nature, macro, and social photography with advanced image management.",
    technologies: ["React", "TypeScript", "Vite", "TailwindCSS", "shadcn/ui"],
    url: "https://portfolio.ronnyreyes.com",
    github: "https://github.com/ronnyreyes/portfolio",
  },
];

export async function savePortfolioItems(items: PortfolioItem[]): Promise<void> {
  await writeFile(STORAGE_FILE, JSON.stringify(items, null, 2));
}

export async function loadPortfolioItems(): Promise<PortfolioItem[]> {
  try {
    const data = await readFile(STORAGE_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.log('No saved portfolio items found, using defaults');
    return defaultPortfolioItems;
  }
}
