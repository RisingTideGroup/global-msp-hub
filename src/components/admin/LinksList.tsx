import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Link } from "@/pages/Admin";
import { Pencil, Trash2, X } from "lucide-react";
import { LinkForm } from "./LinkForm";

interface LinksListProps {
  userRole: string | null;
  currentUserId: string | null;
}

export const LinksList = ({ userRole, currentUserId }: LinksListProps) => {
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { toast } = useToast();

  // Role-based permissions (for all links)
  const isAdminOrMod = userRole === "admin" || userRole === "moderator";
  const isAdmin = userRole === "admin";

  useEffect(() => {
    fetchLinks();

    const channel = supabase
      .channel("msp_hub_links_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "msp_hub_links" },
        () => {
          fetchLinks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchLinks = async () => {
    const { data, error } = await supabase
      .from("msp_hub_links")
      .select("*")
      .order("category")
      .order("display_order");

    if (error) {
      toast({
        variant: "destructive",
        title: "Error fetching links",
        description: error.message,
      });
    } else {
      setLinks(data || []);
    }
    setLoading(false);
  };

  const handleDelete = async (link: Link) => {
    const isOwner = link.created_by === currentUserId;
    if (!isAdmin && !isOwner) {
      toast({
        variant: "destructive",
        title: "Permission denied",
        description: "You can only delete links you created.",
      });
      return;
    }

    if (!confirm("Are you sure you want to delete this link?")) return;

    const { error } = await supabase
      .from("msp_hub_links")
      .delete()
      .eq("id", link.id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Delete failed",
        description: error.message,
      });
    } else {
      toast({
        title: "Link deleted",
        description: "The link has been deleted successfully.",
      });
    }
  };

  if (loading) {
    return <p className="text-center text-dark-text">Loading links...</p>;
  }

  const groupedLinks = links.reduce((acc, link) => {
    if (!acc[link.category]) {
      acc[link.category] = [];
    }
    acc[link.category].push(link);
    return acc;
  }, {} as Record<string, Link[]>);

  return (
    <div className="space-y-8">
      {Object.entries(groupedLinks).map(([category, categoryLinks]) => (
        <div key={category} className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-2xl font-bold text-brand-primary mb-4 capitalize">
            {category} Links
          </h3>
          <div className="space-y-4">
            {categoryLinks.map((link) => {
              const isOwner = link.created_by === currentUserId;
              const canEditLink = isAdminOrMod || isOwner;
              const canDeleteLink = isAdmin || isOwner;
              
              return (
              <div key={link.id}>
                {editingId === link.id ? (
                  <div className="border border-accent rounded-lg p-4 bg-white shadow-lg">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-bold text-brand-primary">Edit Link</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingId(null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <LinkForm 
                      link={link}
                      onClose={() => setEditingId(null)}
                      userRole={userRole}
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-4 border border-brand-secondary rounded-lg hover:border-accent transition-colors">
                    <div className="flex-1">
                      <h4 className="font-bold text-brand-primary">{link.title}</h4>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent hover:underline text-sm"
                      >
                        {link.url}
                      </a>
                      {link.description && (
                        <p className="text-dark-text text-sm mt-1">{link.description}</p>
                      )}
                      <div className="flex gap-2 mt-2">
                        <span className="text-xs text-dark-text">
                          Order: {link.display_order}
                        </span>
                        <span className={`text-xs ${link.is_active ? "text-green-600" : "text-red-600"}`}>
                          {link.is_active ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      {canEditLink && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingId(link.id)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}
                      {canDeleteLink && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(link)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
