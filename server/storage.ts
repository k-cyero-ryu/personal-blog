import {
  photos,
  profile,
  type Photo,
  type Profile,
  type InsertPhoto,
  type InsertProfile,
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getAllPhotos(): Promise<Photo[]>;
  getPhotosByCategory(category: string): Promise<Photo[]>;
  getProfile(): Promise<Profile>;
  addPhoto(photo: InsertPhoto): Promise<Photo>;
  updateProfile(profile: Partial<InsertProfile>): Promise<Profile>;
  updatePhoto(id: number, photo: Partial<InsertPhoto>): Promise<Photo>;
  deletePhoto(id: number): Promise<void>;
  getPhotoById(id: number): Promise<Photo>;
}

export class DatabaseStorage implements IStorage {
  async getAllPhotos(): Promise<Photo[]> {
    return await db.select().from(photos);
  }

  async getPhotosByCategory(category: string): Promise<Photo[]> {
    return await db.select().from(photos).where(eq(photos.category, category));
  }

  async getProfile(): Promise<Profile> {
    const [profileData] = await db.select().from(profile);
    return profileData;
  }

  async addPhoto(photo: InsertPhoto): Promise<Photo> {
    const [newPhoto] = await db.insert(photos).values(photo).returning();
    return newPhoto;
  }

  async updateProfile(profileData: Partial<InsertProfile>): Promise<Profile> {
    const [updatedProfile] = await db
      .update(profile)
      .set(profileData)
      .where(eq(profile.id, 1))
      .returning();
    return updatedProfile;
  }

  async updatePhoto(id: number, photoData: Partial<InsertPhoto>): Promise<Photo> {
    const [updatedPhoto] = await db
      .update(photos)
      .set(photoData)
      .where(eq(photos.id, id))
      .returning();
    return updatedPhoto;
  }

  async deletePhoto(id: number): Promise<void> {
    await db.delete(photos).where(eq(photos.id, id));
  }

  async getPhotoById(id: number): Promise<Photo> {
    const [photo] = await db.select().from(photos).where(eq(photos.id, id));
    return photo;
  }
}

export const storage = new DatabaseStorage();