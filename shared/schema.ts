import { z } from "zod";

export const insertPhotoSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  imageUrl: z.string().min(1),
  category: z.string().min(1),
  tags: z.array(z.string()).optional(),
  aiDescription: z.string().optional(),
  iso: z.number().optional(),
  aperture: z.string().optional(),
  camera: z.string().optional(),
  lens: z.string().optional(),
});

export const insertProfileSchema = z.object({
  name: z.string().min(1),
  title: z.string().min(1),
  bio: z.string().min(1),
  avatarUrl: z.string().min(1),
  github: z.string().optional(),
  linkedin: z.string().optional(),
});

export type Photo = z.infer<typeof insertPhotoSchema> & { id: number };
export type Profile = z.infer<typeof insertProfileSchema> & { id: number };
export type InsertPhoto = z.infer<typeof insertPhotoSchema>;
export type InsertProfile = z.infer<typeof insertProfileSchema>;