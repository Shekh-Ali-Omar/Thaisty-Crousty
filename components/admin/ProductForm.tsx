"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Image from "next/image";
import { Upload, X, Loader2, ImageIcon, Trash2 } from "lucide-react";
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

const ADMIN_CATEGORIES = ["crousty", "spicy", "sweet", "drink"] as const;

const productSchema = z.object({
  name: z.string().min(2, "Name is required"),
  price: z.number().positive("Price must be positive"),
  category: z.string().min(1, "Category is required"),
  description: z.string().optional(),
  is_available: z.boolean(),
  is_featured: z.boolean(),
});

type ProductFormValues = z.infer<typeof productSchema>;

type Props = {
  product?: Product;
  onSuccess: () => void;
  onCancel: () => void;
};

export function ProductForm({ product, onSuccess, onCancel }: Props) {
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState(product?.image ?? "");
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name ?? "",
      price: product ? Number(product.price) : 0,
      category: product?.category ?? "crousty",
      description: product?.description ?? "",
      is_available: product?.is_available ?? true,
      is_featured: product?.is_featured ?? false,
    },
  });

  const uploadImage = async (file: File) => {
    const supabase = createClient();
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${RESTAURANT_ID}/${crypto.randomUUID()}.${ext}`;
    
    setUploading(true);
    try {
      console.log("[STORAGE_DEBUG]: Attempting upload to path:", path);
      const uploadResult = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(path, file, { upsert: true });

      console.log("[STORAGE_DEBUG]: Upload result:", JSON.stringify(uploadResult, null, 2));

      if (uploadResult.error) throw uploadResult.error;

      const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
      console.log("[STORAGE_DEBUG]: Generated Public URL:", data.publicUrl);
      return data.publicUrl;
    } catch (err) {
      console.error("[STORAGE_DEBUG]: Caught error:", JSON.stringify(err, null, 2));
      throw err;
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
      setImageUrl(url);
    } catch (err) {
      console.error("[UPLOAD_ERROR]:", err);
      setError("Failed to upload image. Please check your connection and storage permissions.");
    }
  };

  const removeImage = () => {
    setImageUrl("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onSubmit = async (values: ProductFormValues) => {
    setError(null);
    const supabase = createClient();
    const payload = {
      restaurant_id: RESTAURANT_ID,
      name: values.name,
      price: values.price,
      category: values.category,
      description: values.description || null,
      is_available: values.is_available,
      is_featured: values.is_featured,
      image: imageUrl || null,
    };

    try {
      if (product) {
        const { error: err } = await supabase
          .from("products")
          .update(payload)
          .eq("id", product.id);
        if (err) throw err;
        await logAction('update', 'product', product.id, `Updated product: ${values.name}`);
      } else {
        const { data, error: err } = await supabase.from("products").insert(payload).select("id").single();
        if (err) throw err;
        await logAction('create', 'product', data.id, `Created new product: ${values.name}`);
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Failed to save product.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left: Image Upload & Preview */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <Label className="text-xs font-black uppercase tracking-widest text-muted">Product Visual</Label>
          <div 
            className={cn(
              "relative aspect-square rounded-[2rem] overflow-hidden border-2 border-dashed transition-all duration-500 group",
              imageUrl ? "border-primary/30" : "border-white/10 hover:border-primary/40 bg-white/5"
            )}
          >
            {imageUrl ? (
              <>
                <Image 
                  src={imageUrl} 
                  alt="Preview" 
                  fill 
                  className="object-cover transition-transform duration-700 group-hover:scale-105" 
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button 
                    type="button" 
                    variant="glass" 
                    size="icon" 
                    className="rounded-xl h-10 w-10 text-red-400"
                    onClick={removeImage}
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-muted p-6 text-center">
                {uploading ? (
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                ) : (
                  <>
                    <div className="h-16 w-16 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                      <ImageIcon className="h-8 w-8 group-hover:text-primary transition-colors" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">Upload Image</p>
                      <p className="text-[10px] uppercase font-black tracking-tighter opacity-50">PNG, JPG or WEBP</p>
                    </div>
                  </>
                )}
                <input 
                  type="file" 
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                  accept="image/*"
                  onChange={onFileChange}
                  disabled={uploading}
                  ref={fileInputRef}
                />
              </div>
            )}
          </div>
          {imageUrl && !uploading && (
            <p className="text-[9px] font-mono text-muted truncate bg-white/5 p-2 rounded-lg border border-white/5">
              {imageUrl}
            </p>
          )}
        </div>

        {/* Right: Product Details */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-muted ms-1">Name</Label>
              <Input id="name" {...register("name")} className="h-14 rounded-xl glass border-white/5 focus:border-primary/40" />
              {errors.name && <p className="text-xs text-red-400 font-bold ms-1">{errors.name.message}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="price" className="text-[10px] font-black uppercase tracking-widest text-muted ms-1">Price (DA)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                {...register("price", { valueAsNumber: true })}
                className="h-14 rounded-xl glass border-white/5 focus:border-primary/40"
              />
              {errors.price && <p className="text-xs text-red-400 font-bold ms-1">{errors.price.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category" className="text-[10px] font-black uppercase tracking-widest text-muted ms-1">Category</Label>
            <Select id="category" {...register("category")} className="h-14 rounded-xl glass border-white/5 focus:border-primary/40">
              {ADMIN_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-[10px] font-black uppercase tracking-widest text-muted ms-1">Description</Label>
            <Textarea 
              id="description" 
              {...register("description")} 
              className="min-h-[120px] rounded-2xl glass border-white/5 focus:border-primary/40 pt-4" 
              placeholder="Tell your customers why they'll love this item..."
            />
          </div>

          <div className="flex flex-wrap gap-8 py-2">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="is_available"
                {...register("is_available")}
                className="h-5 w-5 rounded-lg border-white/20 accent-primary cursor-pointer"
              />
              <Label htmlFor="is_available" className="cursor-pointer font-bold">Show in Menu</Label>
            </div>
            
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="is_featured"
                {...register("is_featured")}
                className="h-5 w-5 rounded-lg border-white/20 accent-primary cursor-pointer"
              />
              <Label htmlFor="is_featured" className="cursor-pointer font-bold">Featured Item</Label>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-bold text-sm">
          {error}
        </div>
      )}
      
      <div className="flex gap-4 pt-6 border-t border-white/5">
        <Button 
          type="button" 
          variant="glass" 
          onClick={onCancel} 
          className="h-14 flex-1 rounded-2xl font-bold"
        >
          Discard Changes
        </Button>
        <Button 
          type="submit" 
          disabled={isSubmitting || uploading} 
          className="h-14 flex-[2] rounded-2xl bg-primary text-black font-black shadow-[0_8px_30px_rgba(255,140,0,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
          {product ? "Update Premium Item" : "Create New Item"}
        </Button>
      </div>
    </form>
  );
}
