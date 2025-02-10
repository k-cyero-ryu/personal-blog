import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Profile, InsertProfile } from "@shared/schema";
import { Github, Linkedin } from "lucide-react";
import { useState } from 'react';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { useAuthDialog } from "@/lib/auth-dialog";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";

const Home = () => {
  const [editAvatarOpen, setEditAvatarOpen] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const queryClient = useQueryClient();
  const { data: profile } = useQuery<Profile>({ queryKey: ["/api/profile"] });
  const { data: blogPosts = [] } = useQuery<any[]>({ queryKey: ["/api/blog-posts"] });
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const { openLoginDialog } = useAuthDialog();

  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<InsertProfile>) => {
      const res = await apiRequest("PATCH", "/api/profile", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      toast({
        title: "Success!",
        description: "Profile picture updated successfully",
        duration: 5000,
      });
      setEditAvatarOpen(false);
      setAvatarFile(null);
    },
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setAvatarFile(e.target.files[0]);
    }
  };

  const handleAvatarUpdate = async () => {
    if (!avatarFile) return;

    if (!isAuthenticated) {
      openLoginDialog();
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      updateProfileMutation.mutate({
        avatarUrl: reader.result as string
      });
    };
    reader.readAsDataURL(avatarFile);
  };

  if (!profile) {
    return null;
  }

  // Get the latest 4 blog posts
  const latestPosts = [...blogPosts]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Card className="mb-8 border-border bg-background/50 backdrop-blur-sm">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <Avatar className="w-48 h-48 ring-2 ring-border">
              <AvatarImage src={profile.avatarUrl} alt={profile.name} />
              <AvatarFallback>{profile.name[0]}</AvatarFallback>
            </Avatar>
            <div className="text-center md:text-left">
              <h1 className="text-4xl font-bold mb-2 font-montserrat text-foreground">
                {profile.name}
              </h1>
              <h2 className="text-xl text-muted-foreground mb-4 font-open-sans">
                {profile.title}
              </h2>
              <p className="text-foreground/80 mb-4 font-open-sans leading-relaxed">
                {profile.bio}
              </p>
              <div className="flex gap-4 justify-center md:justify-start">
                <a
                  href={profile.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground/80 hover:text-primary transition-colors"
                >
                  <Github className="w-6 h-6" />
                </a>
                <a
                  href={profile.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground/80 hover:text-primary transition-colors"
                >
                  <Linkedin className="w-6 h-6" />
                </a>
              </div>
              {isAuthenticated && (
                <>
                  <input type="file" onChange={handleAvatarChange} />
                  <button onClick={handleAvatarUpdate}>Update Avatar</button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Latest Blog Posts Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold font-montserrat text-foreground">Latest Blog Posts</h2>
          <Link href="/blog">
            <a className="text-primary hover:underline">View all posts</a>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {latestPosts.map((post) => (
            <Card key={post.id} className="hover:shadow-lg transition-shadow border-border bg-background/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-montserrat text-foreground">
                  {post.title}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                </p>
              </CardHeader>
              <CardContent>
                <p className="text-foreground/80 line-clamp-3 font-open-sans">
                  {post.content}
                </p>
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {post.tags.map((tag: string) => (
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
      </div>
    </div>
  );
};

export default Home;