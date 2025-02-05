import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const photos = pgTable("photos", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  imageUrl: text("image_url").notNull(),
  category: text("category").notNull(),
  tags: text("tags").array(),
  aiDescription: text("ai_description"),
  iso: integer("iso"),
  aperture: text("aperture"),
  camera: text("camera"),
  lens: text("lens"),
});

export const profile = pgTable("profile", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  title: text("title").notNull(),
  bio: text("bio").notNull(),
  avatarUrl: text("avatar_url").notNull(),
  github: text("github"),
  linkedin: text("linkedin"),
});

export const insertPhotoSchema = createInsertSchema(photos).omit({ id: true });
export const insertProfileSchema = createInsertSchema(profile).omit({ id: true });

export type Photo = typeof photos.$inferSelect;
export type Profile = typeof profile.$inferSelect;
export type InsertPhoto = z.infer<typeof insertPhotoSchema>;
export type InsertProfile = z.infer<typeof insertProfileSchema>;