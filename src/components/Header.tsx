import { Building, LogOut, Settings } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

export const Header = () => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <header className="bg-white/90 backdrop-blur-sm border-b border-brand-secondary sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-accent to-primary-gradient rounded-lg flex items-center justify-center">
              <Building className="h-6 w-6 text-white" />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2">
              <h1 className="text-lg sm:text-2xl font-bold text-brand-primary">Global MSP Hub</h1>
              <p className="text-xs sm:text-sm text-dark-text hidden lg:block">Your Gateway to MSP/MSSP/TSP Resources</p>
            </div>
          </Link>
          
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <Link to="/admin">
                  <Button variant="outline" size="sm">Manage Links</Button>
                </Link>
                <a href="https://jobs.globalmsphub.org/settings" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </a>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <a href={`https://jobs.globalmsphub.org/auth?returnUrl=${encodeURIComponent(typeof window !== 'undefined' ? window.location.origin + "/admin" : "")}`}>
                <Button variant="outline" size="sm">Login</Button>
              </a>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
