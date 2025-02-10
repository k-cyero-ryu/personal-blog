import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import {
  type Photo,
  type Profile,
  type InsertPhoto,
  type InsertProfile,
} from "@shared/schema";

const PHOTOS_FILE = path.join(process.cwd(), 'photos.json');
const PROFILE_FILE = path.join(process.cwd(), 'profile.json');

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

const defaultProfile: Profile = {
  id: 1,
  name: "Ronny Reyes Infante",
  title: "Professional Photographer",
  bio: "Capturing moments and creating memories through the lens.",
  avatarUrl: "/avatar.jpg",
  github: "https://github.com/ronnyreyes",
  linkedin: "https://linkedin.com/in/ronnyreyes",
};

const defaultPhotos: Photo[] = [];

export class FileStorage implements IStorage {
  async getAllPhotos(): Promise<Photo[]> {
    try {
      const data = await readFile(PHOTOS_FILE, 'utf-8');
      return JSON.parse(data);
    } catch {
      return defaultPhotos;
    }
  }

  async getPhotosByCategory(category: string): Promise<Photo[]> {
    const photos = await this.getAllPhotos();
    return photos.filter(photo => photo.category === category);
  }

  async getProfile(): Promise<Profile> {
    try {
      const data = await readFile(PROFILE_FILE, 'utf-8');
      return JSON.parse(data);
    } catch {
      return defaultProfile;
    }
  }

  async addPhoto(photo: InsertPhoto): Promise<Photo> {
    const photos = await this.getAllPhotos();
    const newPhoto = {
      ...photo,
      id: Math.max(0, ...photos.map(p => p.id)) + 1
    };
    photos.push(newPhoto);
    await writeFile(PHOTOS_FILE, JSON.stringify(photos, null, 2));
    return newPhoto;
  }

  async updateProfile(profileData: Partial<InsertProfile>): Promise<Profile> {
    const currentProfile = await this.getProfile();
    const updatedProfile = { ...currentProfile, ...profileData };
    await writeFile(PROFILE_FILE, JSON.stringify(updatedProfile, null, 2));
    return updatedProfile;
  }

  async updatePhoto(id: number, photoData: Partial<InsertPhoto>): Promise<Photo> {
    const photos = await this.getAllPhotos();
    const index = photos.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Photo not found');

    photos[index] = { ...photos[index], ...photoData };
    await writeFile(PHOTOS_FILE, JSON.stringify(photos, null, 2));
    return photos[index];
  }

  async deletePhoto(id: number): Promise<void> {
    const photos = await this.getAllPhotos();
    const filteredPhotos = photos.filter(p => p.id !== id);
    await writeFile(PHOTOS_FILE, JSON.stringify(filteredPhotos, null, 2));
  }

  async getPhotoById(id: number): Promise<Photo> {
    const photos = await this.getAllPhotos();
    const photo = photos.find(p => p.id === id);
    if (!photo) throw new Error('Photo not found');
    return photo;
  }
}

export const storage = new FileStorage();