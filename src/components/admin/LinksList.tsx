import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Link } from "@/pages/Admin";
import { Pencil, Trash2, X, Search } from "lucide-react";
import { LinkForm } from "./LinkForm";

interface Category {
  id: string;
  name: string;
  display_name: string;
  display_order: number;
  is_active: boolean;
}

interface LinksListProps {
  userRole: string | null;
  currentUserId: string | null;
}

export const LinksList = ({ userRole, currentUserId }: LinksListProps) => {
  const [links, setLinks] = useState<Link[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const { toast } = useToast();

  // Role-based permissions (for all links)
  const isAdminOrMod = userRole === "admin" || userRole === "moderator";
  const isAdmin = userRole === "admin";

  useEffect(() => {
    fetchLinks();
    fetchCategories();

    const linksChannel = supabase
      .channel("msp_hub_links_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "msp_hub_links" },
        () => {
          fetchLinks();
        }
      )
      .subscribe();

    const categoriesChannel = supabase
      .channel("msp_hub_categories_admin_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "msp_hub_categories" },
        () => {
          fetchCategories();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(linksChannel);
      supabase.removeChannel(categoriesChannel);
    };
  }, []);

  const fetchLinks = async () => {
    const { data, error } = await supabase
      .from("msp_hub_links")
      .select("*")
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

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from("msp_hub_categories")
      .select("*")
      .order("display_order");

    if (!error && data) {
      setCategories(data);
    }
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

  // Filter links by search term and category
  const filteredLinks = links.filter((link) => {
    const matchesSearch = searchTerm === "" || 
      link.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      link.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (link.description?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = categoryFilter === "all" || link.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Group filtered links by category
  const groupedLinks = filteredLinks.reduce((acc, link) => {
    if (!acc[link.category]) {
      acc[link.category] = [];
    }
    acc[link.category].push(link);
    return acc;
  }, {} as Record<string, Link[]>);

  // Sort categories by display_order from the categories table
  const sortedCategories = categories
    .filter((cat) => groupedLinks[cat.name])
    .sort((a, b) => a.display_order - b.display_order);

  // Get category display name
  const getCategoryDisplayName = (categoryName: string) => {
    const category = categories.find((c) => c.name === categoryName);
    return category?.display_name || categoryName;
  };

  // Unique categories from links for the filter dropdown
  const uniqueLinkCategories = [...new Set(links.map((l) => l.category))];

  return (
    <div className="space-y-6">
      {/* Search and Filter Controls */}
      <div className="bg-white rounded-lg shadow-lg p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search links by title, URL, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {uniqueLinkCategories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {getCategoryDisplayName(cat)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {(searchTerm || categoryFilter !== "all") && (
          <p className="text-sm text-muted-foreground mt-2">
            Showing {filteredLinks.length} of {links.length} links
          </p>
        )}
      </div>

      {/* Links grouped by category */}
      {sortedCategories.length === 0 && (
        <p className="text-center text-muted-foreground py-8">
          No links found matching your filters.
        </p>
      )}
      {sortedCategories.map((category) => (
        <div key={category.id} className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-2xl font-bold text-brand-primary mb-4">
            {category.display_name}
          </h3>
          <div className="space-y-4">
            {groupedLinks[category.name].map((link) => {
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
