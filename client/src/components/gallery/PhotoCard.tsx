import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Edit, Trash2 } from "lucide-react";
import { useState } from "react";
import type { Photo } from "@shared/schema";

interface PhotoCardProps {
  photo: Photo;
  onEdit?: (photo: Photo) => void;
  onDelete?: (photo: Photo) => void;
}

export default function PhotoCard({ photo, onEdit, onDelete }: PhotoCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Card
        className="overflow-hidden group relative cursor-pointer hover:shadow-lg transition-shadow"
        onClick={() => setIsOpen(true)}
      >
        <div className="aspect-w-3 aspect-h-2">
          <img
            src={photo.imageUrl}
            alt={photo.title}
            className="object-cover w-full h-full"
          />
        </div>
        <CardHeader className="p-4">
          <CardTitle className="text-lg font-montserrat text-[#2C3E50]">
            {photo.title}
          </CardTitle>
        </CardHeader>

        {/* Edit/Delete buttons that show on hover */}
        <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {onEdit && (
            <Button
              variant="secondary"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(photo);
              }}
              className="bg-white/90 hover:bg-white shadow-md"
            >
              <Edit className="h-4 w-4" />
              <span className="sr-only">Edit</span>
            </Button>
          )}
          {onDelete && (
            <Button
              variant="secondary"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(photo);
              }}
              className="bg-white/90 hover:bg-white shadow-md"
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Delete</span>
            </Button>
          )}
        </div>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="absolute right-4 top-4 z-50 bg-white/90 hover:bg-white shadow-md"
          >
            <X className="h-6 w-6" />
            <span className="sr-only">Close</span>
          </Button>
          <DialogHeader>
            <DialogTitle className="text-2xl font-montserrat text-[#2C3E50]">
              {photo.title}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <img
              src={photo.imageUrl}
              alt={photo.title}
              className="w-full rounded-lg"
            />
            <div className="space-y-4">
              {photo.description && (
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-[#34495E] font-open-sans">{photo.description}</p>
                </div>
              )}
              {photo.aiDescription && (
                <div>
                  <h3 className="font-semibold mb-2">AI Analysis</h3>
                  <p className="text-[#34495E] font-open-sans">{photo.aiDescription}</p>
                </div>
              )}
              {photo.tags && photo.tags.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {photo.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-muted rounded-md text-sm text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 font-roboto-mono text-sm text-[#34495E]">
                <div>
                  <strong>Camera:</strong> {photo.camera || 'Not specified'}
                </div>
                <div>
                  <strong>Lens:</strong> {photo.lens || 'Not specified'}
                </div>
                <div>
                  <strong>ISO:</strong> {photo.iso || 'Not specified'}
                </div>
                <div>
                  <strong>Aperture:</strong> {photo.aperture || 'Not specified'}
                </div>
                <div>
                  <strong>Category:</strong> {photo.category}
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}