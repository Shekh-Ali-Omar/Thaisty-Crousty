"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Product } from "@/lib/types";
import { RESTAURANT_ID, STORAGE_BUCKET } from "@/lib/constants";

const ADMIN_CATEGORIES = ["crousty", "spicy", "sweet", "drink"] as const;
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

const productSchema = z.object({
  name: z.string().min(2),
  price: z.number().positive(),
  category: z.string(),
  is_available: z.boolean(),
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

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name ?? "",
      price: product ? Number(product.price) : 0,
      category: product?.category ?? "other",
      is_available: product?.is_available ?? true,
    },
  });

  const uploadImage = async (file: File) => {
    const supabase = createClient();
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${RESTAURANT_ID}/${crypto.randomUUID()}.${ext}`;
    setUploading(true);
    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(path, file, { upsert: true });
    setUploading(false);
    if (uploadError) throw uploadError;
    const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
    return data.publicUrl;
  };

  const onSubmit = async (values: ProductFormValues) => {
    setError(null);
    const supabase = createClient();
    const payload = {
      restaurant_id: RESTAURANT_ID,
      name: values.name,
      price: values.price,
      category: values.category,
      is_available: values.is_available,
      image: imageUrl || null,
    };

    if (product) {
      const { error: err } = await supabase
        .from("products")
        .update(payload)
        .eq("id", product.id);
      if (err) {
        setError(err.message);
        return;
      }
    } else {
      const { error: err } = await supabase.from("products").insert(payload);
      if (err) {
        setError(err.message);
        return;
      }
    }
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input id="name" {...register("name")} className="mt-1" />
      </div>
      <div>
        <Label htmlFor="price">Price (DA)</Label>
        <Input
          id="price"
          type="number"
          step="0.01"
          {...register("price", { valueAsNumber: true })}
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="category">Category</Label>
        <Select id="category" {...register("category")} className="mt-1">
          {ADMIN_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="is_available"
          {...register("is_available")}
          className="h-5 w-5 rounded border-white/20"
        />
        <Label htmlFor="is_available">Available</Label>
      </div>
      <div>
        <Label htmlFor="image">Image</Label>
        <Input
          id="image"
          type="file"
          accept="image/*"
          className="mt-1"
          disabled={uploading}
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            try {
              const url = await uploadImage(file);
              setImageUrl(url);
            } catch (err) {
              setError(err instanceof Error ? err.message : "Upload failed");
            }
          }}
        />
        {imageUrl && (
          <p className="mt-1 truncate text-xs text-muted">{imageUrl}</p>
        )}
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <div className="flex gap-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting || uploading}>
          Save
        </Button>
      </div>
    </form>
  );
}
