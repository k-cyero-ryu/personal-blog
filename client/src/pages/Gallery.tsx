import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PhotoGrid from "@/components/gallery/PhotoGrid";
import DragDropZone from "@/components/gallery/DragDropZone";
import { useToast } from "@/hooks/use-toast";
import type { Photo, InsertPhoto } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useState } from "react";
import { Edit, Trash2 } from "lucide-react";

export default function Gallery() {
  const [uploadDialog, setUploadDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [newPhotoData, setNewPhotoData] = useState<Partial<InsertPhoto>>({
    category: "nature",
    title: "",
    description: "",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);

  const { data: photos, isLoading } = useQuery<Photo[]>({
    queryKey: ["/api/photos"],
  });
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const uploadMutation = useMutation({
    mutationFn: async (photo: InsertPhoto) => {
      const res = await apiRequest("POST", "/api/photos", photo);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to upload photo");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/photos"] });
      toast({
        title: "Success!",
        description: "Your photo has been added to the gallery",
        duration: 5000,
      });
      setUploadDialog(false);
      setNewPhotoData({
        category: "nature",
        title: "",
        description: "",
      });
      setImageFile(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
        duration: 5000,
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertPhoto> }) => {
      const res = await apiRequest("PATCH", `/api/photos/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/photos"] });
      toast({
        title: "Success!",
        description: "Photo details updated successfully",
        duration: 5000,
      });
      setEditDialog(false);
      setSelectedPhoto(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/photos/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/photos"] });
      toast({
        title: "Success!",
        description: "Photo deleted successfully",
        duration: 5000,
      });
      setDeleteDialog(false);
      setSelectedPhoto(null);
    },
  });

  const handleFilesDrop = async (files: FileList) => {
    const file = files[0];
    setImageFile(file);
    setNewPhotoData(prev => ({
      ...prev,
      title: file.name.split(".")[0],
    }));
    setUploadDialog(true);
  };

  const handleUpload = async () => {
    if (!imageFile || !newPhotoData.category || !newPhotoData.title) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const photo: InsertPhoto = {
        title: newPhotoData.title!,
        description: newPhotoData.description || "",
        imageUrl: reader.result as string,
        category: newPhotoData.category!,
        iso: 100,
        aperture: "f/2.8",
        camera: "Unknown",
        lens: "Unknown",
      };
      uploadMutation.mutate(photo);
    };
    reader.readAsDataURL(imageFile);
  };

  const handleEdit = (photo: Photo) => {
    setSelectedPhoto(photo);
    setEditDialog(true);
  };

  const handleDelete = (photo: Photo) => {
    setSelectedPhoto(photo);
    setDeleteDialog(true);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!photos) {
    return null;
  }

  const naturePhotos = photos.filter((photo) => photo.category === "nature");
  const fishingPhotos = photos.filter((photo) => photo.category === "fishing");

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <DragDropZone onFilesDrop={handleFilesDrop} />

      {/* Upload Dialog */}
      <Dialog open={uploadDialog} onOpenChange={setUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Photo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select
                value={newPhotoData.category}
                onValueChange={(value) =>
                  setNewPhotoData((prev) => ({ ...prev, category: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nature">Nature</SelectItem>
                  <SelectItem value="fishing">Fishing</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input
                value={newPhotoData.title}
                onChange={(e) =>
                  setNewPhotoData((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="Enter photo title"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={newPhotoData.description}
                onChange={(e) =>
                  setNewPhotoData((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="Enter photo description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpload}>Upload</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialog} onOpenChange={setEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Photo</DialogTitle>
          </DialogHeader>
          {selectedPhoto && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={selectedPhoto.title}
                  onChange={(e) =>
                    setSelectedPhoto((prev) => prev ? ({ ...prev, title: e.target.value }) : null)
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={selectedPhoto.description || ""}
                  onChange={(e) =>
                    setSelectedPhoto((prev) => prev ? ({ ...prev, description: e.target.value }) : null)
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">AI Description</label>
                <p className="text-sm text-muted-foreground">{selectedPhoto.aiDescription}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Tags</label>
                <p className="text-sm text-muted-foreground">
                  {selectedPhoto.tags?.join(", ") || "No tags"}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (selectedPhoto) {
                  updateMutation.mutate({
                    id: selectedPhoto.id,
                    data: {
                      title: selectedPhoto.title,
                      description: selectedPhoto.description,
                    },
                  });
                }
              }}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the photo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (selectedPhoto) {
                  deleteMutation.mutate(selectedPhoto.id);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Tabs defaultValue="nature" className="w-full">
        <TabsList className="grid w-full max-w-[400px] grid-cols-2 mb-8">
          <TabsTrigger value="nature">Nature</TabsTrigger>
          <TabsTrigger value="fishing">Fishing</TabsTrigger>
        </TabsList>
        <TabsContent value="nature">
          <PhotoGrid 
            photos={naturePhotos} 
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </TabsContent>
        <TabsContent value="fishing">
          <PhotoGrid 
            photos={fishingPhotos}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}