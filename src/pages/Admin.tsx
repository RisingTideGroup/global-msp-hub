import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { LinkForm } from "@/components/admin/LinkForm";
import { LinksList } from "@/components/admin/LinksList";
import { User } from "@supabase/supabase-js";
import { Plus, FolderKanban } from "lucide-react";

export interface Link {
  id: string;
  title: string;
  url: string;
  description: string | null;
  logo_url: string | null;
  category: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

const Admin = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingLink, setEditingLink] = useState<Link | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const initAuth = async () => {
      // First check if we have auth tokens in the URL hash (from redirect)
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');

      if (accessToken) {
        // Set the session from the tokens
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || '',
        });

        if (error) {
          console.error('Error setting session:', error);
          toast({
            title: "Authentication Error",
            description: error.message,
            variant: "destructive",
          });
        }

        // Clean up the URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }

      // Now check for existing session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setUser(session.user);
        fetchUserRole(session.user.id);
        setLoading(false);
      } else {
        const returnUrl = encodeURIComponent(window.location.origin + "/admin");
        window.location.href = `https://jobs.globalmsphub.org/auth?returnUrl=${returnUrl}`;
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserRole(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, toast]);

  const fetchUserRole = async (userId: string) => {
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .single();

    if (data && !error) {
      setUserRole(data.role);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingLink(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-secondary to-blue-50 flex items-center justify-center">
        <p className="text-brand-primary">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-secondary to-blue-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-brand-primary">Manage Links</h1>
            <p className="text-dark-text mt-2">
              Logged in as: {user?.email}
              {userRole && <span className="ml-2 text-accent font-semibold">({userRole})</span>}
            </p>
          </div>
          <div className="flex gap-2">
            {(userRole === "admin" || userRole === "moderator") && (
              <Button 
                variant="outline" 
                onClick={() => navigate("/admin/categories")} 
                className="flex items-center gap-2"
              >
                <FolderKanban className="h-4 w-4" />
                Manage Categories
              </Button>
            )}
            <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Link
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>

        {showForm && (
          <div className="mb-8">
            <LinkForm 
              link={editingLink} 
              onClose={handleFormClose} 
              userRole={userRole}
            />
          </div>
        )}

        <LinksList userRole={userRole} />
      </div>

      <Footer />
    </div>
  );
};

export default Admin;
