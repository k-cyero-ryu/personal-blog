import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Upload } from "lucide-react";

interface DragDropZoneProps {
  onFilesDrop: (files: FileList) => void;
}

export default function DragDropZone({ onFilesDrop }: DragDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length === 0) return;

    // Validate files are images and not too large
    for (let i = 0; i < files.length; i++) {
      if (!files[i].type.startsWith("image/")) {
        toast({
          title: "Invalid file type",
          description: "Please upload image files only",
          variant: "destructive",
        });
        return;
      }

      // Check file size (limit to 5MB)
      if (files[i].size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload images smaller than 5MB",
          variant: "destructive",
        });
        return;
      }
    }

    onFilesDrop(files);
  };

  return (
    <div
      className={cn(
        "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
        isDragging ? "border-primary bg-primary/10" : "border-muted-foreground/25"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
      <p className="text-muted-foreground">
        Drag and drop photos here to add them to your gallery
      </p>
      <p className="text-sm text-muted-foreground mt-2">
        Maximum file size: 5MB
      </p>
    </div>
  );
}