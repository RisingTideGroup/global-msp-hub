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

export interface Category {
  id: string;
  name: string;
  display_name: string;
  display_order: number;
  is_active: boolean;
}

export const useLinks = () => {
  const [links, setLinks] = useState<Link[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLinks();
    fetchCategories();

    const linksChannel = supabase
      .channel("public_links_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "msp_hub_links" },
        () => {
          fetchLinks();
        }
      )
      .subscribe();

    const categoriesChannel = supabase
      .channel("public_categories_changes")
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
      .eq("is_active", true)
      .order("category")
      .order("display_order");

    if (!error && data) {
      setLinks(data);
    }
    setLoading(false);
  };

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from("msp_hub_categories")
      .select("*")
      .eq("is_active", true)
      .order("display_order");

    if (!error && data) {
      setCategories(data);
    }
  };

  const getLinksByCategory = (category: string) => {
    return links.filter((link) => link.category === category);
  };

  return { links, categories, loading, getLinksByCategory };
};
