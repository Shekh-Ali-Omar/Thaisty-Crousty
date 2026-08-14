"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Trash2, RefreshCw, GripVertical } from "lucide-react";
import { AdminNav } from "@/components/admin/AdminNav";
import { GlassCard } from "@/components/glass/GlassCard";
import type { CategoryItem } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { logAction } from "@/lib/admin/activity";
import { useLocale } from "@/components/locale-provider";
import { toast } from "sonner";

export default function AdminCategoriesPage() {
  const { t } = useLocale();
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newCategory, setNewCategory] = useState({ id: "", name_en: "", name_fr: "", name_ar: "", sort_order: 0 });

  const load = useCallback(async () => {
    setLoading(true);
    try {
        const supabase = createClient();
        const { data, error } = await supabase.from("categories").select("*").order("sort_order");
        if (!error && data) {
          setCategories(data as CategoryItem[]);
        }
    } finally {
        setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleAdd = async () => {
    if (!newCategory.id || !newCategory.name_en || !newCategory.name_fr || !newCategory.name_ar) {
      toast.error("Please fill all fields.");
      return;
    }
    
    setSaving(true);
    const supabase = createClient();
    
    // Sort order will be at the end
    const sort_order = categories.length > 0 ? Math.max(...categories.map(c => c.sort_order)) + 1 : 1;

    const { data, error } = await supabase.from("categories").insert({
      id: newCategory.id.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
      name_en: newCategory.name_en,
      name_fr: newCategory.name_fr,
      name_ar: newCategory.name_ar,
      sort_order
    }).select().single();

    if (error) {
      toast.error("Error creating category: " + error.message);
    } else if (data) {
      toast.success("Category created!");
      setCategories([...categories, data as CategoryItem]);
      setNewCategory({ id: "", name_en: "", name_fr: "", name_ar: "", sort_order: 0 });
      // Log action
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await logAction('create', 'category', data.id, `Created category: ${data.id}`);
      }
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    
    const supabase = createClient();
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) {
      toast.error("Error deleting category: " + error.message);
    } else {
      toast.success("Category deleted.");
      setCategories(categories.filter(c => c.id !== id));
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await logAction('delete', 'category', id, `Deleted category: ${id}`);
      }
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === categories.length - 1) return;

    const newCategories = [...categories];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap
    const temp = newCategories[index];
    newCategories[index] = newCategories[targetIndex];
    newCategories[targetIndex] = temp;

    // Update sort_order locally
    const updated = newCategories.map((c, i) => ({ ...c, sort_order: i + 1 }));
    setCategories(updated);

    // Persist to DB
    const supabase = createClient();
    for (const cat of updated) {
      await supabase.from("categories").update({ sort_order: cat.sort_order }).eq("id", cat.id);
    }
  };

  return (
    <div className="flex flex-col gap-10 pb-20">
      <AdminNav />
      
      <div className="px-4 md:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-gradient">Categories</h1>
            <p className="text-muted font-medium">Manage product categories and menu ordering</p>
          </div>
          <Button onClick={load} variant="glass" size="icon" className="h-12 w-12 rounded-2xl">
            <RefreshCw className={loading ? "animate-spin" : ""} />
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {categories.map((cat, i) => (
              <GlassCard key={cat.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-white/5">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col gap-1 text-muted">
                    <button onClick={() => handleMove(i, 'up')} disabled={i === 0} className="hover:text-primary disabled:opacity-30">▲</button>
                    <button onClick={() => handleMove(i, 'down')} disabled={i === categories.length - 1} className="hover:text-primary disabled:opacity-30">▼</button>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{cat.id}</h3>
                    <div className="flex gap-4 text-xs text-muted mt-1">
                      <span>EN: {cat.name_en}</span>
                      <span>FR: {cat.name_fr}</span>
                      <span dir="rtl" className="font-arabic">AR: {cat.name_ar}</span>
                    </div>
                  </div>
                </div>
                <Button size="icon" variant="glass" className="h-10 w-10 text-red-400 shrink-0" onClick={() => handleDelete(cat.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </GlassCard>
            ))}
          </div>

          <div>
            <GlassCard strong className="p-6 border-primary/20 space-y-6 sticky top-8">
              <h3 className="text-xl font-black">New Category</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/80 uppercase">ID (Internal)</label>
                  <input
                    type="text"
                    value={newCategory.id}
                    onChange={e => setNewCategory({...newCategory, id: e.target.value})}
                    placeholder="e.g. burgers"
                    className="w-full bg-white/5 text-white p-3 rounded-xl border border-white/10"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/80 uppercase">English Name</label>
                  <input
                    type="text"
                    value={newCategory.name_en}
                    onChange={e => setNewCategory({...newCategory, name_en: e.target.value})}
                    placeholder="e.g. Burgers"
                    className="w-full bg-white/5 text-white p-3 rounded-xl border border-white/10"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/80 uppercase">French Name</label>
                  <input
                    type="text"
                    value={newCategory.name_fr}
                    onChange={e => setNewCategory({...newCategory, name_fr: e.target.value})}
                    placeholder="e.g. Les Burgers"
                    className="w-full bg-white/5 text-white p-3 rounded-xl border border-white/10"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/80 uppercase">Arabic Name</label>
                  <input
                    type="text"
                    dir="rtl"
                    value={newCategory.name_ar}
                    onChange={e => setNewCategory({...newCategory, name_ar: e.target.value})}
                    placeholder="برجر"
                    className="w-full bg-white/5 text-white p-3 rounded-xl border border-white/10 font-arabic"
                  />
                </div>
                <Button onClick={handleAdd} disabled={saving} className="w-full bg-primary text-black font-black py-6 rounded-xl mt-4">
                  {saving ? <RefreshCw className="animate-spin" /> : "Add Category"}
                </Button>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
}
