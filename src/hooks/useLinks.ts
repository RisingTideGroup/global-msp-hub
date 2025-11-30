import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Link {
  id: string;
  title: string;
  url: string;
  description: string | null;
  logo_url: string | null;
  category: string;
  display_order: number;
  is_active: boolean;
}

export const useLinks = () => {
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLinks();

    const channel = supabase
      .channel("public_links_changes")
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
      .eq("is_active", true)
      .order("category")
      .order("display_order");

    if (!error && data) {
      setLinks(data);
    }
    setLoading(false);
  };

  const getLinksByCategory = (category: string) => {
    return links.filter((link) => link.category === category);
  };

  return { links, loading, getLinksByCategory };
};
