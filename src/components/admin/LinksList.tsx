import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Link } from "@/pages/Admin";
import { Pencil, Trash2 } from "lucide-react";

interface LinksListProps {
  onEdit: (link: Link) => void;
  userRole: string | null;
}

export const LinksList = ({ onEdit, userRole }: LinksListProps) => {
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const canEdit = userRole === "admin" || userRole === "moderator";
  const canDelete = userRole === "admin";

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

  const handleDelete = async (id: string) => {
    if (!canDelete) {
      toast({
        variant: "destructive",
        title: "Permission denied",
        description: "Only admins can delete links.",
      });
      return;
    }

    if (!confirm("Are you sure you want to delete this link?")) return;

    const { error } = await supabase
      .from("msp_hub_links")
      .delete()
      .eq("id", id);

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
            {categoryLinks.map((link) => (
              <div
                key={link.id}
                className="flex items-center justify-between p-4 border border-brand-secondary rounded-lg hover:border-accent transition-colors"
              >
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
                  {canEdit && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(link)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                  {canDelete && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(link.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
