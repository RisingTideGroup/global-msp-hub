import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { User } from "@supabase/supabase-js";
import { ArrowLeft, Plus, GripVertical, Pencil, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Category {
  id: string;
  name: string;
  display_name: string;
  display_order: number;
  is_active: boolean;
}

const CategoryManagement = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formName, setFormName] = useState("");
  const [formDisplayName, setFormDisplayName] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        fetchUserRole(session.user.id);
      } else {
        const returnUrl = encodeURIComponent(window.location.origin + "/admin/categories");
        window.location.href = `https://jobs.globalmsphub.org/auth?returnUrl=${returnUrl}`;
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserRole(session.user.id);
      } else {
        const returnUrl = encodeURIComponent(window.location.origin + "/admin/categories");
        window.location.href = `https://jobs.globalmsphub.org/auth?returnUrl=${returnUrl}`;
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (userRole) {
      fetchCategories();
    }
  }, [userRole]);

  const fetchUserRole = async (userId: string) => {
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .single();

    if (data && !error) {
      setUserRole(data.role);
      if (data.role !== "admin" && data.role !== "moderator") {
        toast({
          variant: "destructive",
          title: "Access denied",
          description: "You don't have permission to access this page.",
        });
        navigate("/");
      }
    }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const categoryData = {
      name: formName,
      display_name: formDisplayName,
      display_order: editingCategory ? editingCategory.display_order : categories.length,
    };

    if (editingCategory) {
      const { error } = await supabase
        .from("msp_hub_categories")
        .update(categoryData)
        .eq("id", editingCategory.id);

      if (error) {
        toast({
          variant: "destructive",
          title: "Update failed",
          description: error.message,
        });
      } else {
        toast({
          title: "Category updated",
          description: "The category has been updated successfully.",
        });
        resetForm();
        fetchCategories();
      }
    } else {
      const { error } = await supabase
        .from("msp_hub_categories")
        .insert(categoryData);

      if (error) {
        toast({
          variant: "destructive",
          title: "Create failed",
          description: error.message,
        });
      } else {
        toast({
          title: "Category created",
          description: "The category has been created successfully.",
        });
        resetForm();
        fetchCategories();
      }
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormName(category.name);
    setFormDisplayName(category.display_name);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;

    const { error } = await supabase
      .from("msp_hub_categories")
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
        title: "Category deleted",
        description: "The category has been deleted successfully.",
      });
      fetchCategories();
    }
  };

  const handleReorder = async (categoryId: string, direction: "up" | "down") => {
    const currentIndex = categories.findIndex(c => c.id === categoryId);
    if (
      (direction === "up" && currentIndex === 0) ||
      (direction === "down" && currentIndex === categories.length - 1)
    ) {
      return;
    }

    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    const current = categories[currentIndex];
    const target = categories[targetIndex];

    await Promise.all([
      supabase
        .from("msp_hub_categories")
        .update({ display_order: target.display_order })
        .eq("id", current.id),
      supabase
        .from("msp_hub_categories")
        .update({ display_order: current.display_order })
        .eq("id", target.id),
    ]);

    fetchCategories();
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingCategory(null);
    setFormName("");
    setFormDisplayName("");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
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
            <div className="flex items-center gap-4 mb-2">
              <Button variant="ghost" onClick={() => navigate("/admin")} className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Links
              </Button>
            </div>
            <h1 className="text-3xl font-bold text-brand-primary">Category Management</h1>
            <p className="text-dark-text mt-2">
              Logged in as: {user?.email}
              {userRole && <span className="ml-2 text-accent font-semibold">({userRole})</span>}
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Category
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>

        {showForm && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-brand-primary mb-4">
              {editingCategory ? "Edit Category" : "Add New Category"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Category Name (internal) *</Label>
                <Input
                  id="name"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g., community"
                  required
                  disabled={!!editingCategory}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Used internally and in links. Cannot be changed after creation.
                </p>
              </div>
              <div>
                <Label htmlFor="displayName">Display Name *</Label>
                <Input
                  id="displayName"
                  value={formDisplayName}
                  onChange={(e) => setFormDisplayName(e.target.value)}
                  placeholder="e.g., Community Resources"
                  required
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Shown to visitors on the landing page.
                </p>
              </div>
              <div className="flex gap-2">
                <Button type="submit">
                  {editingCategory ? "Update" : "Create"}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-brand-primary mb-4">Categories</h2>
          <div className="space-y-2">
            {categories.map((category, index) => (
              <div
                key={category.id}
                className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50"
              >
                <div className="flex flex-col gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleReorder(category.id, "up")}
                    disabled={index === 0}
                    className="h-6 px-2"
                  >
                    ↑
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleReorder(category.id, "down")}
                    disabled={index === categories.length - 1}
                    className="h-6 px-2"
                  >
                    ↓
                  </Button>
                </div>
                <GripVertical className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="font-semibold">{category.display_name}</p>
                  <p className="text-sm text-muted-foreground">Internal: {category.name}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Order: {category.display_order}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(category)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  {userRole === "admin" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(category.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CategoryManagement;
