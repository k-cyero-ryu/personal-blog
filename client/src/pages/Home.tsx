import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import type { Profile, InsertProfile } from "@shared/schema";
import { Github, Linkedin } from "lucide-react";
import { useState } from 'react';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";


const Home = () => {
  const [editAvatarOpen, setEditAvatarOpen] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const queryClient = useQueryClient();
  const { data: profile } = useQuery<Profile>({ queryKey: ["/api/profile"] });
  const { toast } = useToast();

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

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <Avatar className="w-48 h-48">
              <AvatarImage src={profile.avatarUrl} alt={profile.name} />
              <AvatarFallback>{profile.name[0]}</AvatarFallback>
            </Avatar>
            <div className="text-center md:text-left">
              <h1 className="text-4xl font-bold mb-2 font-montserrat text-[#2C3E50]">
                {profile.name}
              </h1>
              <h2 className="text-xl text-muted-foreground mb-4 font-open-sans">
                {profile.title}
              </h2>
              <p className="text-[#34495E] mb-4 font-open-sans leading-relaxed">
                {profile.bio}
              </p>
              <div className="flex gap-4 justify-center md:justify-start">
                <a
                  href={profile.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#2C3E50] hover:text-[#3498DB] transition-colors"
                >
                  <Github className="w-6 h-6" />
                </a>
                <a
                  href={profile.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#2C3E50] hover:text-[#3498DB] transition-colors"
                >
                  <Linkedin className="w-6 h-6" />
                </a>
              </div>
              <input type="file" onChange={handleAvatarChange} />
              <button onClick={handleAvatarUpdate}>Update Avatar</button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Home;