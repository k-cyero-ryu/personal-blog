import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPhotoSchema, insertProfileSchema } from "@shared/schema";
import { analyzePhoto } from "./services/openai";
import fs from "fs/promises";
import path from "path";

const PORTFOLIO_FILE = path.join(process.cwd(), 'portfolio-items.json');
const BLOG_POSTS_FILE = path.join(process.cwd(), 'blog-posts.json');

// Middleware to check if user is authenticated
const requireAuth = (req: Express.Request, res: Express.Response, next: Express.NextFunction) => {
  // Check if user is authenticated using the client-side auth token
  if (!req.headers.authorization) {
    return res.status(401).json({ message: "Unauthorized - No token provided" });
  }
  next();
};

export function registerRoutes(app: Express): Server {
  // Public routes
  app.get("/api/photos", async (_req, res) => {
    try {
      const photos = await storage.getAllPhotos();
      res.json(photos);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch photos" });
    }
  });

  app.get("/api/photos/:id", async (req, res) => {
    try {
      const photo = await storage.getPhotoById(parseInt(req.params.id));
      if (!photo) {
        return res.status(404).json({ message: "Photo not found" });
      }
      res.json(photo);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch photo" });
    }
  });

  app.get("/api/photos/category/:category", async (req, res) => {
    try {
      const photos = await storage.getPhotosByCategory(req.params.category);
      res.json(photos);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch photos by category" });
    }
  });

  // Protected routes - require authentication
  app.post("/api/photos", requireAuth, async (req, res) => {
    try {
      const result = insertPhotoSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          message: "Invalid photo data",
          errors: result.error.errors
        });
      }

      // Basic validation for base64 image size
      const base64String = req.body.imageUrl;
      if (base64String && base64String.length > 7 * 1024 * 1024) {
        return res.status(400).json({
          message: "Image file size too large. Please upload a smaller image (max 5MB)"
        });
      }

      // Analyze photo with OpenAI Vision
      const analysis = await analyzePhoto(base64String);

      const photoData = {
        ...result.data,
        aiDescription: analysis.description,
        tags: analysis.suggestedTags
      };

      const photo = await storage.addPhoto(photoData);
      res.status(201).json(photo);
    } catch (error) {
      console.error('Photo upload error:', error);
      res.status(500).json({ message: "Failed to upload photo" });
    }
  });

  app.patch("/api/photos/:id", requireAuth, async (req, res) => {
    try {
      const result = insertPhotoSchema.partial().safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          message: "Invalid photo data",
          errors: result.error.errors
        });
      }

      const photo = await storage.updatePhoto(parseInt(req.params.id), result.data);
      res.json(photo);
    } catch (error) {
      console.error('Photo update error:', error);
      res.status(500).json({ message: "Failed to update photo" });
    }
  });

  app.delete("/api/photos/:id", requireAuth, async (req, res) => {
    try {
      await storage.deletePhoto(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      console.error('Photo deletion error:', error);
      res.status(500).json({ message: "Failed to delete photo" });
    }
  });

  // Profile routes
  app.get("/api/profile", async (_req, res) => {
    try {
      const profile = await storage.getProfile();
      res.json(profile);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  app.patch("/api/profile", requireAuth, async (req, res) => {
    try {
      const result = insertProfileSchema.partial().safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          message: "Invalid profile data",
          errors: result.error.errors
        });
      }

      const updatedProfile = await storage.updateProfile(result.data);
      res.json(updatedProfile);
    } catch (error) {
      console.error('Profile update error:', error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Portfolio routes
  app.get("/api/portfolio-items", async (_req, res) => {
    try {
      const data = await fs.readFile(PORTFOLIO_FILE, 'utf-8');
      res.json(JSON.parse(data));
    } catch (error) {
      // If file doesn't exist, return default items
      const defaultItems = [{
        id: 1,
        name: "Photography Portfolio",
        description: "A modern photography portfolio showcasing nature, macro, and social photography with advanced image management.",
        technologies: ["React", "TypeScript", "Vite", "TailwindCSS", "shadcn/ui"],
        url: "https://portfolio.ronnyreyes.com",
        github: "https://github.com/ronnyreyes/portfolio",
      }];
      res.json(defaultItems);
    }
  });

  app.post("/api/portfolio-items", requireAuth, async (req, res) => {
    try {
      await fs.writeFile(PORTFOLIO_FILE, JSON.stringify(req.body, null, 2));
      res.status(200).json({ message: "Portfolio items saved successfully" });
    } catch (error) {
      console.error('Failed to save portfolio items:', error);
      res.status(500).json({ message: "Failed to save portfolio items" });
    }
  });

  // Blog routes
  app.get("/api/blog-posts", async (_req, res) => {
    try {
      const data = await fs.readFile(BLOG_POSTS_FILE, 'utf-8');
      res.json(JSON.parse(data));
    } catch (error) {
      // If file doesn't exist, return default posts
      const defaultPosts = [{
        id: 1,
        title: "Welcome to My Photography Blog",
        content: "Hello everyone! This is where I'll be sharing my photography journey, latest shoots, and creative ideas.",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: ["welcome", "photography"],
      }];
      res.json(defaultPosts);
    }
  });

  app.get("/api/blog-posts/:id", async (req, res) => {
    try {
      const data = await fs.readFile(BLOG_POSTS_FILE, 'utf-8');
      const posts = JSON.parse(data);
      const post = posts.find((p: any) => p.id === parseInt(req.params.id));
      if (!post) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      res.json(post);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch blog post" });
    }
  });

  app.post("/api/blog-posts", requireAuth, async (req, res) => {
    try {
      let posts = [];
      try {
        const data = await fs.readFile(BLOG_POSTS_FILE, 'utf-8');
        posts = JSON.parse(data);
      } catch (error) {
        posts = [];
      }

      const newPost = {
        ...req.body,
        id: posts.length > 0 ? Math.max(...posts.map((p: any) => p.id)) + 1 : 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      posts.push(newPost);
      await fs.writeFile(BLOG_POSTS_FILE, JSON.stringify(posts, null, 2));
      res.status(201).json(newPost);
    } catch (error) {
      console.error('Failed to create blog post:', error);
      res.status(500).json({ message: "Failed to create blog post" });
    }
  });

  app.patch("/api/blog-posts/:id", requireAuth, async (req, res) => {
    try {
      const data = await fs.readFile(BLOG_POSTS_FILE, 'utf-8');
      const posts = JSON.parse(data);
      const index = posts.findIndex((p: any) => p.id === parseInt(req.params.id));

      if (index === -1) {
        return res.status(404).json({ message: "Blog post not found" });
      }

      const updatedPost = {
        ...posts[index],
        ...req.body,
        updatedAt: new Date().toISOString(),
      };

      posts[index] = updatedPost;
      await fs.writeFile(BLOG_POSTS_FILE, JSON.stringify(posts, null, 2));
      res.json(updatedPost);
    } catch (error) {
      console.error('Failed to update blog post:', error);
      res.status(500).json({ message: "Failed to update blog post" });
    }
  });

  app.delete("/api/blog-posts/:id", requireAuth, async (req, res) => {
    try {
      const data = await fs.readFile(BLOG_POSTS_FILE, 'utf-8');
      const posts = JSON.parse(data);
      const filteredPosts = posts.filter((p: any) => p.id !== parseInt(req.params.id));
      await fs.writeFile(BLOG_POSTS_FILE, JSON.stringify(filteredPosts, null, 2));
      res.status(204).send();
    } catch (error) {
      console.error('Failed to delete blog post:', error);
      res.status(500).json({ message: "Failed to delete blog post" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}