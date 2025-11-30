import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { useToast } from "@/hooks/use-toast";
import { Link } from "@/pages/Admin";

interface LinkFormProps {
  link: Link | null;
  onClose: () => void;
  userRole: string | null;
}

export const LinkForm = ({ link, onClose, userRole }: LinkFormProps) => {
  const [title, setTitle] = useState(link?.title || "");
  const [url, setUrl] = useState(link?.url || "");
  const [description, setDescription] = useState(link?.description || "");
  const [logoUrl, setLogoUrl] = useState(link?.logo_url || "");
  const [category, setCategory] = useState(link?.category || "community");
  const [displayOrder, setDisplayOrder] = useState(link?.display_order || 0);
  const [isActive, setIsActive] = useState(link?.is_active ?? true);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const isEditMode = !!link;
  const canEdit = userRole === "admin" || userRole === "moderator";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const linkData = {
      title,
      url,
      description: description || null,
      logo_url: logoUrl || null,
      category,
      display_order: displayOrder,
      is_active: isActive,
    };

    if (isEditMode) {
      if (!canEdit) {
        toast({
          variant: "destructive",
          title: "Permission denied",
          description: "Only admins and moderators can edit links.",
        });
        setLoading(false);
        return;
      }

      const { error } = await supabase
        .from("msp_hub_links")
        .update(linkData)
        .eq("id", link.id);

      if (error) {
        toast({
          variant: "destructive",
          title: "Update failed",
          description: error.message,
        });
      } else {
        toast({
          title: "Link updated",
          description: "The link has been updated successfully.",
        });
        onClose();
      }
    } else {
      const { data: userData } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from("msp_hub_links")
        .insert({
          ...linkData,
          created_by: userData.user?.id,
        });

      if (error) {
        toast({
          variant: "destructive",
          title: "Create failed",
          description: error.message,
        });
      } else {
        toast({
          title: "Link created",
          description: "The link has been created successfully.",
        });
        onClose();
      }
    }

    setLoading(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-brand-primary mb-4">
        {isEditMode ? "Edit Link" : "Add New Link"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="url">URL *</Label>
          <Input
            id="url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="logoUrl">Logo URL</Label>
          <Input
            id="logoUrl"
            type="url"
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="category">Category *</Label>
          <Input
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g., Community, Discord, YouTube"
            required
          />
        </div>

        <div>
          <Label htmlFor="displayOrder">Display Order</Label>
          <Input
            id="displayOrder"
            type="number"
            value={displayOrder}
            onChange={(e) => setDisplayOrder(parseInt(e.target.value))}
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isActive"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="rounded"
          />
          <Label htmlFor="isActive">Active</Label>
        </div>

        <div className="flex gap-2 pt-4">
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : isEditMode ? "Update" : "Create"}
          </Button>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};
