"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Image from "next/image";
import { Upload, Loader2, ImageIcon, Trash2, CheckCircle2, Languages, DollarSign, Megaphone } from "lucide-react";
import type { Product } from "@/lib/types";
import { RESTAURANT_ID, STORAGE_BUCKET } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { logAction } from "@/lib/admin/activity";
import { GlassCard } from "@/components/glass/GlassCard";
import { Badge } from "@/components/ui/badge";
import { useLocale } from "@/components/locale-provider";

const ADMIN_CATEGORIES = ["crousty", "spicy", "sweet", "drink"] as const;

const productSchema = z.object({
  name_en: z.string().min(2, "English name is required"),
  name_fr: z.string().optional(),
  name_ar: z.string().optional(),
  price: z.number().positive("Price must be positive"),
  original_price: z.number().nullable().optional(),
  discount_price: z.number().nullable().optional(),
  category: z.string().min(1, "Category is required"),
  description_en: z.string().optional(),
  description_fr: z.string().optional(),
  description_ar: z.string().optional(),
  is_available: z.boolean(),
  is_featured: z.boolean(),
  is_special_offer: z.boolean(),
});

type ProductFormValues = z.infer<typeof productSchema>;

type Props = {
  product?: Product;
  onSuccess: () => void;
  onCancel: () => void;
};

export function ProductForm({ product, onSuccess, onCancel }: Props) {
  const { t } = useLocale();
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState<string[]>(product?.images || (product?.image ? [product.image] : []));
  const [mainImage, setMainImage] = useState<string | null>(product?.image || null);
  const [error, setError] = useState<string | null>(null);


  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name_en: product?.name_en || product?.name || "",
      name_fr: product?.name_fr || "",
      name_ar: product?.name_ar || "",
      price: product ? Number(product.price) : 0,
      original_price: product?.original_price ? Number(product.original_price) : null,
      discount_price: product?.discount_price ? Number(product.discount_price) : null,
      category: product?.category ?? "crousty",
      description_en: product?.description_en || product?.description || "",
      description_fr: product?.description_fr || "",
      description_ar: product?.description_ar || "",
      is_available: product?.is_available ?? true,
      is_featured: product?.is_featured ?? false,
      is_special_offer: product?.is_special_offer ?? false,
    },
  });

  const uploadImage = async (file: File) => {
    const supabase = createClient();
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${RESTAURANT_ID}/${crypto.randomUUID()}.${ext}`;
    
    setUploading(true);
    try {
      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(path, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
      return data.publicUrl;
    } finally {
      setUploading(false);
    }
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    try {
      const url = await uploadImage(file);
      setImages((prev) => [...prev, url]);
      if (!mainImage) setMainImage(url);
    } catch (err) {
      console.error("[UPLOAD_ERROR]:", err);
      setError("Failed to upload image. Please check your connection and storage permissions.");
    }
  };

  const removeImage = (url: string) => {
    setImages((prev) => prev.filter((img) => img !== url));
    if (mainImage === url) {
      setMainImage(images.find((img) => img !== url) || null);
    }
  };

  const onSubmit = async (values: ProductFormValues) => {
    setError(null);
    const supabase = createClient();
    const payload = {
      restaurant_id: RESTAURANT_ID,
      name: values.name_en, // Fallback base field
      name_en: values.name_en,
      name_fr: values.name_fr || null,
      name_ar: values.name_ar || null,
      price: values.price,
      original_price: values.original_price || null,
      discount_price: values.discount_price || null,
      category: values.category,
      description: values.description_en, // Fallback base field
      description_en: values.description_en || null,
      description_fr: values.description_fr || null,
      description_ar: values.description_ar || null,
      is_available: values.is_available,
      is_featured: values.is_featured,
      is_special_offer: values.is_special_offer,
      image: mainImage || (images.length > 0 ? images[0] : null),
      images: images,
    };

    try {
      if (product) {
        const { error: err } = await supabase
          .from("products")
          .update(payload)
          .eq(product.id.includes("-") ? "id" : "id", product.id); // Guard for ID types
        if (err) throw err;
        await logAction('update', 'product', product.id, `Optimized product: ${values.name_en}`);
      } else {
        const { data, error: err } = await supabase.from("products").insert(payload).select("id").single();
        if (err) throw err;
        await logAction('create', 'product', data.id, `Created new product: ${values.name_en}`);
      }
      onSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save product.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-10">
      
      {/* 1. Images Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <ImageIcon className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-black uppercase tracking-widest">{t.admin.gallery}</h3>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
          {images.map((url, idx) => (
            <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden glass border border-white/10 group">
              <Image src={url} alt={`Product ${idx}`} fill className="object-cover" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-2">
                <button 
                  type="button"
                  onClick={() => setMainImage(url)}
                  className={cn(
                    "p-1.5 rounded-lg transition-colors",
                    mainImage === url ? "bg-primary text-black" : "bg-white/10 text-white hover:bg-white/20"
                  )}
                >
                  <CheckCircle2 className="h-4 w-4" />
                </button>
                <button 
                  type="button"
                  onClick={() => removeImage(url)}
                  className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/40 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              {mainImage === url && (
                <div className="absolute top-2 left-2 bg-primary text-black text-[8px] font-black uppercase px-2 py-0.5 rounded-md shadow-lg">
                  {t.admin.image}
                </div>
              )}
            </div>
          ))}
          
          <label className="relative aspect-square rounded-2xl border-2 border-dashed border-white/10 hover:border-primary/40 bg-white/5 transition-all cursor-pointer flex flex-col items-center justify-center gap-2 text-muted hover:text-primary group">
            {uploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Upload className="h-6 w-6 group-hover:scale-110 transition-transform" />}
            <span className="text-[10px] font-bold uppercase tracking-widest">{t.admin.addProduct}</span>
            <input type="file" className="hidden" accept="image/*" onChange={onFileChange} disabled={uploading} />
          </label>
        </div>
      </section>

      <div className="h-px bg-white/5" />

      {/* 2. Translations Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <Languages className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-black uppercase tracking-widest">{t.admin.multilingual}</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* English */}
          <GlassCard className="p-6 space-y-4 border-white/5">
            <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">English</Badge>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted ms-1">{t.admin.name}</Label>
              <Input {...register("name_en")} className="glass h-11" placeholder="Crousty Classic" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted ms-1">{t.product.description}</Label>
              <Textarea {...register("description_en")} className="glass min-h-[100px] text-sm" placeholder="The original recipe..." />
            </div>
          </GlassCard>

          {/* French */}
          <GlassCard className="p-6 space-y-4 border-white/5">
            <Badge className="bg-red-500/10 text-red-400 border-red-500/20">French</Badge>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted ms-1">Nom du produit</Label>
              <Input {...register("name_fr")} className="glass h-11" placeholder="Crousty Classique" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted ms-1">Description</Label>
              <Textarea {...register("description_fr")} className="glass min-h-[100px] text-sm" placeholder="La recette originale..." />
            </div>
          </GlassCard>

          {/* Arabic */}
          <GlassCard className="p-6 space-y-4 border-white/5" dir="rtl">
            <Badge className="bg-green-500/10 text-green-400 border-green-500/20">العربية</Badge>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted me-1">اسم المنتج</Label>
              <Input {...register("name_ar")} className="glass h-11 text-right" placeholder="كروستي كلاسيك" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted me-1">الوصف</Label>
              <Textarea {...register("description_ar")} className="glass min-h-[100px] text-sm text-right" placeholder="الوصفة الأصلية..." />
            </div>
          </GlassCard>
        </div>
      </section>

      <div className="h-px bg-white/5" />

      {/* 3. Pricing & Marketing Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Pricing */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <DollarSign className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-black uppercase tracking-widest">{t.admin.pricing_strategy}</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted ms-1">{t.admin.price}</Label>
              <Input type="number" step="0.01" {...register("price", { valueAsNumber: true })} className="glass h-12 text-lg font-black" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted ms-1">Original Price</Label>
              <Input type="number" step="0.01" {...register("original_price", { valueAsNumber: true })} className="glass h-12" placeholder="950" />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted ms-1">Active Discount Price</Label>
            <Input type="number" step="0.01" {...register("discount_price", { valueAsNumber: true })} className="glass h-14 text-xl font-black text-success border-success/20" placeholder="750" />
          </div>
          
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted ms-1">{t.admin.category}</Label>
            <Select {...register("category")} className="glass h-11">
              {ADMIN_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c.toUpperCase()}</option>
              ))}
            </Select>
          </div>
        </section>

        {/* Marketing Flags */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <Megaphone className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-black uppercase tracking-widest">{t.admin.marketing}</h3>
          </div>
          
          <GlassCard className="p-8 flex flex-col gap-6 border-white/5">
            <label className="flex items-center justify-between group cursor-pointer">
              <div className="flex flex-col">
                <span className="font-bold text-white group-hover:text-primary transition-colors">Visible in Menu</span>
                <span className="text-[10px] text-muted font-medium">Allow customers to order this item</span>
              </div>
              <input type="checkbox" {...register("is_available")} className="h-6 w-6 rounded-lg accent-primary" />
            </label>

            <label className="flex items-center justify-between group cursor-pointer">
              <div className="flex flex-col">
                <span className="font-bold text-white group-hover:text-primary transition-colors">Featured Item</span>
                <span className="text-[10px] text-muted font-medium">Highlight on the homepage carousel</span>
              </div>
              <input type="checkbox" {...register("is_featured")} className="h-6 w-6 rounded-lg accent-primary" />
            </label>

            <label className="flex items-center justify-between group cursor-pointer">
              <div className="flex flex-col">
                <span className="font-bold text-white group-hover:text-primary transition-colors">Special Offer</span>
                <span className="text-[10px] text-muted font-medium">Display premium burgundy badge</span>
              </div>
              <input type="checkbox" {...register("is_special_offer")} className="h-6 w-6 rounded-lg accent-primary" />
            </label>
          </GlassCard>
        </section>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-bold text-sm text-center">
          {error}
        </div>
      )}
      
      <div className="flex gap-4 pt-6 border-t border-white/5">
        <Button type="button" variant="glass" onClick={onCancel} className="h-14 flex-1 rounded-2xl font-bold">
          {t.admin.discard}
        </Button>
        <Button 
          type="submit" 
          disabled={isSubmitting || uploading} 
          className="h-14 flex-[2] rounded-2xl bg-primary text-black font-black text-lg shadow-[0_8px_30px_rgba(255,140,0,0.3)]"
        >
          {isSubmitting && <Loader2 className="h-5 w-5 animate-spin mr-2" />}
          {product ? t.admin.commit_updates : t.admin.create_master}
        </Button>
      </div>
    </form>
  );
}
