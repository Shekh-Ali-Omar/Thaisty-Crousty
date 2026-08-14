import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Upload, X, Loader2, ImageIcon, Trash2, 
  CheckCircle2, Languages, DollarSign, Megaphone,
  Edit2, Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Product } from '@/lib/types';
import { RESTAURANT_ID, STORAGE_BUCKET } from '@/lib/constants';
import { supabase } from '../../../lib/supabase';
import { useLocale } from '@/components/locale-provider';
import { toast } from 'sonner';
import type { CategoryItem } from '@/lib/types';
import { logAction } from '@/lib/admin/activity';

const productSchema = z.object({
  name_en: z.string().min(2, "English name is required"),
  name_fr: z.string().optional(),
  name_ar: z.string().optional(),
  price: z.number().min(0, "Price must be non-negative"),
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

interface ProductFormModalProps {
  product?: Product | null;
  categories: CategoryItem[];
  onClose: () => void;
  onSuccess: () => void;
}

export function ProductFormModal({ product, categories, onClose, onSuccess }: ProductFormModalProps) {
  const { t, dir } = useLocale();
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState<string[]>(product?.images || (product?.image_url ? [product.image_url] : []));
  const [mainImage, setMainImage] = useState<string | null>(product?.image_url || null);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
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

    try {
      const url = await uploadImage(file);
      setImages((prev) => [...prev, url]);
      if (!mainImage) setMainImage(url);
      toast.success("Image uploaded successfully");
    } catch (err) {
      console.error("[UPLOAD_ERROR]:", err);
      toast.error("Failed to upload image");
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
    const primaryImg = mainImage || (images.length > 0 ? images[0] : null);
    const payload = {
      restaurant_id: RESTAURANT_ID,
      name: values.name_en, 
      name_en: values.name_en,
      name_fr: values.name_fr || null,
      name_ar: values.name_ar || null,
      price: values.price,
      original_price: values.original_price || null,
      discount_price: values.discount_price || null,
      category: values.category,
      description: values.description_en, 
      description_en: values.description_en || null,
      description_fr: values.description_fr || null,
      description_ar: values.description_ar || null,
      is_available: values.is_available,
      is_featured: values.is_featured,
      is_special_offer: values.is_special_offer,
      image: primaryImg,
      image_url: primaryImg,
      images: images,
    };

    try {
      if (product) {
        const { error: err } = await supabase
          .from("products")
          .update(payload)
          .eq("id", product.id);
        if (err) throw err;
        await logAction('update', 'product', product.id, `Updated product: ${payload.name}`);
        toast.success("Product updated successfully");
      } else {
        const { data: inserted, error: err } = await supabase.from("products").insert(payload).select().single();
        if (err) throw err;
        if (inserted) {
          await logAction('create', 'product', inserted.id, `Created product: ${payload.name}`);
        }
        toast.success("Product created successfully");
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Failed to save product.");
      toast.error("Operation failed");
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/90 backdrop-blur-xl"
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-5xl glass-strong rounded-[3rem] border border-white/10 shadow-2xl flex flex-col my-auto"
          dir={dir}
        >
          {/* Header */}
          <div className="p-8 border-b border-white/5 flex justify-between items-center shrink-0 bg-white/[0.02]">
            <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 text-primary">
                    {product ? <Edit2 className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
                </div>
                <div>
                    <h2 className="text-2xl font-black tracking-tighter uppercase">
                        {product ? t.admin.edit : t.admin.create_master}
                    </h2>
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em]">Menu Management Module</p>
                </div>
            </div>
            <button onClick={onClose} className="h-12 w-12 rounded-2xl hover:bg-white/5 flex items-center justify-center transition-colors">
                <X className="h-6 w-6 text-white/40" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-12 overflow-y-auto max-h-[70vh]">
            
            {/* 1. Images Section */}
            <section className="space-y-6">
                <div className="flex items-center gap-3">
                    <ImageIcon className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-black uppercase tracking-widest">{t.admin.gallery}</h3>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
                    {images.map((url, idx) => (
                        <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden glass border border-white/10 group">
                            <img src={url} alt={`Product ${idx}`} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-2">
                                <button 
                                    type="button"
                                    onClick={() => setMainImage(url)}
                                    className={`p-1.5 rounded-lg transition-colors ${mainImage === url ? "bg-primary text-black" : "bg-white/10 text-white hover:bg-white/20"}`}
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
                                    MASTER
                                </div>
                            )}
                        </div>
                    ))}
                    
                    <label className="relative aspect-square rounded-2xl border-2 border-dashed border-white/10 hover:border-primary/40 bg-white/5 transition-all cursor-pointer flex flex-col items-center justify-center gap-2 text-white/20 hover:text-primary group">
                        {uploading ? <Loader2 className="h-6 w-6 animate-spin text-primary" /> : <Upload className="h-6 w-6 group-hover:scale-110 transition-transform" />}
                        <span className="text-[8px] font-black uppercase tracking-widest">Add Image</span>
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

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* English */}
                    <div className="glass p-8 rounded-[2rem] border-white/5 space-y-4">
                        <span className="text-[10px] font-black uppercase bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full border border-blue-500/20">English (Primary)</span>
                        <div className="space-y-2 pt-4">
                            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Product Name</label>
                            <input {...register("name_en")} className="w-full bg-white/5 border border-white/10 rounded-xl h-12 px-4 text-white font-bold outline-none focus:border-primary/50 transition-all" placeholder="Crousty Classic" />
                            {errors.name_en && <p className="text-[10px] text-destructive font-bold">{errors.name_en.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Description</label>
                            <textarea {...register("description_en")} className="w-full bg-white/5 border border-white/10 rounded-xl min-h-[120px] p-4 text-white font-medium text-sm outline-none focus:border-primary/50 transition-all" placeholder="The original recipe..." />
                        </div>
                    </div>

                    {/* French */}
                    <div className="glass p-8 rounded-[2rem] border-white/5 space-y-4">
                        <span className="text-[10px] font-black uppercase bg-red-500/20 text-red-400 px-3 py-1 rounded-full border border-red-500/20">French</span>
                        <div className="space-y-2 pt-4">
                            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Nom du produit</label>
                            <input {...register("name_fr")} className="w-full bg-white/5 border border-white/10 rounded-xl h-12 px-4 text-white font-bold outline-none focus:border-primary/50 transition-all" placeholder="Crousty Classique" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Description</label>
                            <textarea {...register("description_fr")} className="w-full bg-white/5 border border-white/10 rounded-xl min-h-[120px] p-4 text-white font-medium text-sm outline-none focus:border-primary/50 transition-all" placeholder="La recette originale..." />
                        </div>
                    </div>

                    {/* Arabic */}
                    <div className="glass p-8 rounded-[2rem] border-white/5 space-y-4" dir="rtl">
                        <span className="text-[10px] font-black uppercase bg-green-500/20 text-green-400 px-3 py-1 rounded-full border border-green-500/20">العربية</span>
                        <div className="space-y-2 pt-4">
                            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 mr-1">اسم المنتج</label>
                            <input {...register("name_ar")} className="w-full bg-white/5 border border-white/10 rounded-xl h-12 px-4 text-white font-bold outline-none focus:border-primary/50 transition-all text-right" placeholder="كروستي كلاسيك" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 mr-1">الوصف</label>
                            <textarea {...register("description_ar")} className="w-full bg-white/5 border border-white/10 rounded-xl min-h-[120px] p-4 text-white font-medium text-sm outline-none focus:border-primary/50 transition-all text-right" placeholder="الوصفة الأصلية..." />
                        </div>
                    </div>
                </div>
            </section>

            <div className="h-px bg-white/5" />

            {/* 3. Pricing & Marketing Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <section className="space-y-8">
                    <div className="flex items-center gap-3">
                        <DollarSign className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-black uppercase tracking-widest">{t.admin.pricing_strategy}</h3>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Current Price (DZD)</label>
                            <input type="number" step="0.01" {...register("price", { valueAsNumber: true })} className="w-full bg-white/5 border border-white/10 rounded-xl h-14 px-6 text-white font-black text-xl outline-none focus:border-primary/50 transition-all" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Discount Price</label>
                            <input type="number" step="0.01" {...register("discount_price", { valueAsNumber: true })} className="w-full bg-white/5 border border-success/10 rounded-xl h-14 px-6 text-success font-black text-xl outline-none focus:border-success/50 transition-all" placeholder="Promo" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">{t.admin.category}</label>
                        <select {...register("category")} className="w-full bg-white/5 border border-white/10 rounded-xl h-14 px-6 text-white font-black uppercase tracking-widest outline-none focus:border-primary/50 transition-all appearance-none">
                            {categories.map((c) => (
                                <option key={c.slug} value={c.slug} className="bg-black">
                                    {c.name_en.toUpperCase()}
                                </option>
                            ))}
                            {categories.length === 0 && (
                                <option value="crousty" className="bg-black">CROUSTY (DEFAULT)</option>
                            )}
                        </select>
                    </div>
                </section>

                <section className="space-y-8">
                    <div className="flex items-center gap-3">
                        <Megaphone className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-black uppercase tracking-widest">{t.admin.marketing}</h3>
                    </div>
                    
                    <div className="glass p-8 rounded-[2rem] border-white/5 flex flex-col gap-6">
                        <label className="flex items-center justify-between group cursor-pointer">
                            <div className="flex flex-col">
                                <span className="font-bold text-white group-hover:text-primary transition-colors">Visible in Menu</span>
                                <span className="text-[10px] text-white/20 font-bold uppercase tracking-wider">Online Availability</span>
                            </div>
                            <input type="checkbox" {...register("is_available")} className="h-6 w-6 rounded-lg accent-primary" />
                        </label>

                        <label className="flex items-center justify-between group cursor-pointer">
                            <div className="flex flex-col">
                                <span className="font-bold text-white group-hover:text-primary transition-colors">Featured Item</span>
                                <span className="text-[10px] text-white/20 font-bold uppercase tracking-wider">Show on Carousel</span>
                            </div>
                            <input type="checkbox" {...register("is_featured")} className="h-6 w-6 rounded-lg accent-primary" />
                        </label>

                        <label className="flex items-center justify-between group cursor-pointer">
                            <div className="flex flex-col">
                                <span className="font-bold text-white group-hover:text-primary transition-colors">Special Offer</span>
                                <span className="text-[10px] text-white/20 font-bold uppercase tracking-wider">Apply Promo Badge</span>
                            </div>
                            <input type="checkbox" {...register("is_special_offer")} className="h-6 w-6 rounded-lg accent-primary" />
                        </label>
                    </div>
                </section>
            </div>

            {error && (
                <div className="p-6 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive font-black text-xs uppercase tracking-widest text-center">
                    {error}
                </div>
            )}
          </form>

          {/* Footer */}
          <div className="p-8 border-t border-white/5 bg-white/[0.02] flex gap-4 shrink-0 rounded-b-[3rem]">
            <button 
                type="button" 
                onClick={onClose}
                className="flex-1 h-16 rounded-2xl bg-white/5 text-white/40 font-black uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all border border-white/5"
            >
                {t.admin.discard}
            </button>
            <button 
                type="button"
                onClick={handleSubmit(onSubmit)}
                disabled={isSubmitting || uploading}
                className="flex-[2] h-16 rounded-2xl bg-primary text-black font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_15px_40px_rgba(255,140,0,0.3)] disabled:opacity-50 disabled:hover:scale-100"
            >
                <div className="flex items-center justify-center gap-3">
                    {(isSubmitting || uploading) && <Loader2 className="h-5 w-5 animate-spin" />}
                    <span>{product ? t.admin.commit_updates : t.admin.create_master}</span>
                </div>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
