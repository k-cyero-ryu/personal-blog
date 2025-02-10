import { Link } from "wouter";
import { useAuth } from "@/lib/auth";
import { useAuthDialog } from "@/lib/auth-dialog";
import { Button } from "@/components/ui/button";
import { LogOut, Lock } from "lucide-react";

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const { openLoginDialog } = useAuthDialog();

  return (
    <nav className="bg-background border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {isAuthenticated ? (
            <Button
              variant="ghost"
              onClick={logout}
              className="text-xl font-montserrat font-bold hover:text-primary transition-colors p-0 h-auto flex items-center gap-2"
            >
              Ronny Reyes
              <LogOut className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              onClick={openLoginDialog}
              className="text-xl font-montserrat font-bold hover:text-primary transition-colors p-0 h-auto flex items-center gap-2"
            >
              Ronny Reyes
              <Lock className="w-4 h-4" />
            </Button>
          )}
          <div className="space-x-8">
            <Link href="/">
              <a className="font-open-sans text-foreground/80 hover:text-primary transition-colors">
                Home
              </a>
            </Link>
            <Link href="/gallery">
              <a className="font-open-sans text-foreground/80 hover:text-primary transition-colors">
                Gallery
              </a>
            </Link>
            <Link href="/blog">
              <a className="font-open-sans text-foreground/80 hover:text-primary transition-colors">
                Blog
              </a>
            </Link>
            <Link href="/portfolio">
              <a className="font-open-sans text-foreground/80 hover:text-primary transition-colors">
                Portfolio
              </a>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}