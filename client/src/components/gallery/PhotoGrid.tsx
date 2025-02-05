import type { Photo } from "@shared/schema";
import PhotoCard from "./PhotoCard";

interface PhotoGridProps {
  photos: Photo[];
  onEdit?: (photo: Photo) => void;
  onDelete?: (photo: Photo) => void;
}

export default function PhotoGrid({ photos, onEdit, onDelete }: PhotoGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {photos.map((photo) => (
        <PhotoCard 
          key={photo.id} 
          photo={photo} 
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}