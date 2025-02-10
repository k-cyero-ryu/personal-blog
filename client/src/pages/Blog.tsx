import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";

type BlogPost = {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  imageUrl?: string;
  tags?: string[];
};

export default function Blog() {
  const [editDialog, setEditDialog] = useState(false);
  const [currentPost, setCurrentPost] = useState<Partial<BlogPost>>({});
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: posts = [] } = useQuery<BlogPost[]>({
    queryKey: ["/api/blog-posts"],
  });

  const createPostMutation = useMutation({
    mutationFn: async (post: Omit<BlogPost, "id" | "createdAt" | "updatedAt">) => {
      const res = await apiRequest("POST", "/api/blog-posts", post);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog-posts"] });
      toast({
        title: "Success!",
        description: "Blog post created successfully",
      });
      setEditDialog(false);
      setCurrentPost({});
    },
  });

  const updatePostMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<BlogPost> }) => {
      const res = await apiRequest("PATCH", `/api/blog-posts/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog-posts"] });
      toast({
        title: "Success!",
        description: "Blog post updated successfully",
      });
      setEditDialog(false);
      setCurrentPost({});
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/blog-posts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog-posts"] });
      toast({
        title: "Success!",
        description: "Blog post deleted successfully",
      });
    },
  });

  const handleSave = () => {
    if (!currentPost.title || !currentPost.content) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (currentPost.id) {
      updatePostMutation.mutate({
        id: currentPost.id,
        data: {
          title: currentPost.title,
          content: currentPost.content,
          tags: currentPost.tags,
        },
      });
    } else {
      createPostMutation.mutate({
        title: currentPost.title,
        content: currentPost.content,
        tags: currentPost.tags || [],
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold font-montserrat text-foreground">Blog</h1>
        {isAuthenticated && (
          <Button
            onClick={() => {
              setCurrentPost({});
              setEditDialog(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Post
          </Button>
        )}
      </div>

      <div className="space-y-8">
        {posts.map((post) => (
          <Card key={post.id} className="border-border bg-background/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex justify-between items-start">
                <span className="text-foreground">{post.title}</span>
                {isAuthenticated && (
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setCurrentPost(post);
                        setEditDialog(true);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deletePostMutation.mutate(post.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </CardTitle>
              <div className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose prose-invert max-w-none">
                {post.content.split("\n").map((paragraph, index) => (
                  <p key={index} className="mb-4 text-foreground">{paragraph}</p>
                ))}
              </div>
              {post.tags && post.tags.length > 0 && (
                <div className="flex gap-2 mt-4">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-muted/50 rounded-md text-sm text-foreground/70"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={editDialog} onOpenChange={setEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {currentPost.id ? "Edit Post" : "New Post"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Title</label>
              <Input
                value={currentPost.title || ""}
                onChange={(e) =>
                  setCurrentPost((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="Enter post title"
                className="text-foreground"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Content</label>
              <Textarea
                value={currentPost.content || ""}
                onChange={(e) =>
                  setCurrentPost((prev) => ({ ...prev, content: e.target.value }))
                }
                placeholder="Write your post content here..."
                rows={10}
                className="text-foreground"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Tags (comma-separated)</label>
              <Input
                value={currentPost.tags?.join(", ") || ""}
                onChange={(e) =>
                  setCurrentPost((prev) => ({
                    ...prev,
                    tags: e.target.value.split(",").map((tag) => tag.trim()),
                  }))
                }
                placeholder="photography, nature, thoughts"
                className="text-foreground"
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