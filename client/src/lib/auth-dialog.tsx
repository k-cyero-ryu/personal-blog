import { createContext, useContext, useState, ReactNode } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "./auth";
import { useToast } from "@/hooks/use-toast";

interface AuthDialogContextType {
  openLoginDialog: () => void;
  closeLoginDialog: () => void;
}

const AuthDialogContext = createContext<AuthDialogContextType | null>(null);

export function AuthDialogProvider({ children }: { children: ReactNode }) {
  const [loginDialog, setLoginDialog] = useState(false);
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const { toast } = useToast();

  const handleLogin = () => {
    if (login(password)) {
      setLoginDialog(false);
      setPassword("");
      toast({
        title: "Success!",
        description: "Successfully logged in",
      });
    } else {
      toast({
        title: "Error",
        description: "Invalid password",
        variant: "destructive",
      });
    }
  };

  const openLoginDialog = () => setLoginDialog(true);
  const closeLoginDialog = () => {
    setLoginDialog(false);
    setPassword("");
  };

  return (
    <AuthDialogContext.Provider value={{ openLoginDialog, closeLoginDialog }}>
      {children}
      <Dialog open={loginDialog} onOpenChange={setLoginDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Admin Login</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleLogin();
                  }
                }}
                placeholder="Enter admin password"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeLoginDialog}>
              Cancel
            </Button>
            <Button onClick={handleLogin}>Login</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AuthDialogContext.Provider>
  );
}

export function useAuthDialog() {
  const context = useContext(AuthDialogContext);
  if (!context) {
    throw new Error("useAuthDialog must be used within an AuthDialogProvider");
  }
  return context;
}
