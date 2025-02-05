import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPhotoSchema, insertProfileSchema } from "@shared/schema";
import { analyzePhoto } from "./services/openai";
import fs from "fs";

export function registerRoutes(app: Express): Server {
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

  app.post("/api/photos", async (req, res) => {
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

  app.patch("/api/photos/:id", async (req, res) => {
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

  app.delete("/api/photos/:id", async (req, res) => {
    try {
      await storage.deletePhoto(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      console.error('Photo deletion error:', error);
      res.status(500).json({ message: "Failed to delete photo" });
    }
  });

  app.get("/api/profile", async (_req, res) => {
    try {
      const profile = await storage.getProfile();
      res.json(profile);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  app.patch("/api/profile", async (req, res) => {
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

  const httpServer = createServer(app);
  return httpServer;
}