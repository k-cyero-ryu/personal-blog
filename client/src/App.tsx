import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Gallery from "@/pages/Gallery";
import Portfolio from "@/pages/Portfolio";
import Blog from "@/pages/Blog";
import Navbar from "@/components/layout/Navbar";
import { AuthContext, useAuthProvider } from "@/lib/auth";
import { AuthDialogProvider } from "@/lib/auth-dialog";

function App() {
  const auth = useAuthProvider();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={auth}>
        <AuthDialogProvider>
          <div className="min-h-screen bg-background">
            <Navbar />
            <main className="container mx-auto px-4 py-8">
              <Switch>
                <Route path="/" component={Home} />
                <Route path="/gallery" component={Gallery} />
                <Route path="/blog" component={Blog} />
                <Route path="/portfolio" component={Portfolio} />
                <Route component={NotFound} />
              </Switch>
            </main>
          </div>
          <Toaster />
        </AuthDialogProvider>
      </AuthContext.Provider>
    </QueryClientProvider>
  );
}

export default App;