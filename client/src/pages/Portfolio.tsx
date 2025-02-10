import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, Github, Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

type PortfolioItem = {
  id: number;
  name: string;
  description: string;
  technologies: string[];
  url?: string;
  github?: string;
};

export default function Portfolio() {
  const [editMode, setEditMode] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [currentItem, setCurrentItem] = useState<Partial<PortfolioItem>>({});
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  // Fetch portfolio items
  const { data: portfolioItems = [] } = useQuery<PortfolioItem[]>({
    queryKey: ['/api/portfolio-items'],
    queryFn: async () => {
      const response = await fetch('/api/portfolio-items');
      if (!response.ok) throw new Error('Failed to fetch portfolio items');
      return response.json();
    },
  });

  // Save portfolio items mutation
  const savePortfolioMutation = useMutation({
    mutationFn: async (items: PortfolioItem[]) => {
      const res = await apiRequest("POST", "/api/portfolio-items", items);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/portfolio-items'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save portfolio items",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    if (!currentItem.name || !currentItem.description) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    let updatedItems;
    if (currentItem.id) {
      // Edit existing item
      updatedItems = portfolioItems.map(item =>
        item.id === currentItem.id ? { ...item, ...currentItem } : item
      );
    } else {
      // Add new item
      const newItem = {
        ...currentItem,
        id: Math.max(0, ...portfolioItems.map(item => item.id)) + 1,
        technologies: currentItem.technologies || [],
      } as PortfolioItem;

      updatedItems = [...portfolioItems, newItem];
    }

    savePortfolioMutation.mutate(updatedItems);
    setEditDialog(false);
    setCurrentItem({});
    toast({
      title: "Success!",
      description: currentItem.id ? "Portfolio item updated" : "Portfolio item added",
    });
  };

  const handleDelete = (id: number) => {
    const updatedItems = portfolioItems.filter(item => item.id !== id);
    savePortfolioMutation.mutate(updatedItems);
    toast({
      title: "Success!",
      description: "Portfolio item deleted",
    });
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold font-montserrat text-foreground">My Projects</h1>
        {isAuthenticated && (
          <Button 
            variant="outline" 
            onClick={() => setEditMode(!editMode)}
          >
            {editMode ? "View Mode" : "Edit Mode"}
          </Button>
        )}
      </div>

      {isAuthenticated && editMode && (
        <Button 
          className="mb-6"
          onClick={() => {
            setCurrentItem({});
            setEditDialog(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Project
        </Button>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {portfolioItems.map((item) => (
          <Card key={item.id} className="flex flex-col border-border bg-background/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl font-montserrat text-foreground flex justify-between items-start">
                {item.name}
                {isAuthenticated && editMode && (
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setCurrentItem(item);
                        setEditDialog(true);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <p className="text-foreground mb-4 font-open-sans">
                {item.description}
              </p>
              <div className="mb-4">
                <h3 className="font-semibold mb-2 text-foreground">Technologies</h3>
                <div className="flex flex-wrap gap-2">
                  {item.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="px-2 py-1 bg-muted/50 rounded-md text-sm text-foreground/70"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex gap-4 mt-auto">
                {item.url && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                    asChild
                  >
                    <a href={item.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4" />
                      Visit Project
                    </a>
                  </Button>
                )}
                {item.github && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                    asChild
                  >
                    <a href={item.github} target="_blank" rel="noopener noreferrer">
                      <Github className="w-4 h-4" />
                      View Code
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialog} onOpenChange={setEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {currentItem.id ? "Edit Project" : "Add Project"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Project Name</label>
              <Input
                value={currentItem.name || ""}
                onChange={(e) =>
                  setCurrentItem((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Enter project name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={currentItem.description || ""}
                onChange={(e) =>
                  setCurrentItem((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="Enter project description"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Technologies (comma-separated)</label>
              <Input
                value={currentItem.technologies?.join(", ") || ""}
                onChange={(e) =>
                  setCurrentItem((prev) => ({
                    ...prev,
                    technologies: e.target.value.split(",").map((tech) => tech.trim()),
                  }))
                }
                placeholder="React, TypeScript, Vite"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Project URL</label>
              <Input
                value={currentItem.url || ""}
                onChange={(e) =>
                  setCurrentItem((prev) => ({ ...prev, url: e.target.value }))
                }
                placeholder="https://your-project.com"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">GitHub URL</label>
              <Input
                value={currentItem.github || ""}
                onChange={(e) =>
                  setCurrentItem((prev) => ({ ...prev, github: e.target.value }))
                }
                placeholder="https://github.com/username/project"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}