import React from 'react';
import { Product } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import { resolveProductImageUrl } from '@/lib/image';
import { useLocale } from '@/components/locale-provider';
import { Edit2, Trash2, Star, Tag, XCircle } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export function ProductCard({ product, onEdit, onDelete }: ProductCardProps) {
  const { t, locale } = useLocale();

  // Determine localized name and description
  const name = product[`name_${locale}` as keyof Product] || product.name || '';
  const description = product[`description_${locale}` as keyof Product] || product.description || '';
  const imageUrl = resolveProductImageUrl(product.image_url || product.image);

  return (
    <div className="glass p-6 rounded-[2.5rem] border border-white/5 group hover:border-primary/20 transition-all flex flex-col h-full">
      <div className="relative aspect-square rounded-2xl bg-white/5 mb-6 overflow-hidden shrink-0">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={name as string} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/5 italic text-xs uppercase tracking-widest font-black">
            No Image Master
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
            {!product.is_available && (
                <div className="bg-destructive text-white text-[8px] font-black uppercase px-2 py-1 rounded-lg shadow-xl flex items-center gap-1">
                    <XCircle className="h-3 w-3" /> Offline
                </div>
            )}
            {product.is_featured && (
                <div className="bg-primary text-black text-[8px] font-black uppercase px-2 py-1 rounded-lg shadow-xl flex items-center gap-1">
                    <Star className="h-3 w-3 fill-black" /> Featured
                </div>
            )}
            {product.is_special_offer && (
                <div className="bg-purple-600 text-white text-[8px] font-black uppercase px-2 py-1 rounded-lg shadow-xl flex items-center gap-1">
                    <Tag className="h-3 w-3" /> Special
                </div>
            )}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
                <h4 className="font-black text-white text-lg leading-tight uppercase tracking-tighter line-clamp-1">{name as string}</h4>
                <p className="text-[10px] text-primary font-black uppercase tracking-widest mt-1">{product.category}</p>
            </div>
            <div className="text-right ml-2 shrink-0">
                {product.discount_price ? (
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] text-white/20 line-through font-bold">{formatPrice(Number(product.price))}</span>
                        <span className="font-black text-success text-lg">{formatPrice(Number(product.discount_price))}</span>
                    </div>
                ) : (
                    <span className="font-black text-white text-lg">{formatPrice(Number(product.price))}</span>
                )}
            </div>
        </div>

        <p className="text-xs text-white/40 font-medium line-clamp-2 leading-relaxed mb-6">
            {description as string}
        </p>

        <div className="mt-auto flex gap-3 pt-6 border-t border-white/5 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
            <button 
                onClick={() => onEdit(product)}
                className="flex-1 flex items-center justify-center gap-2 h-12 rounded-xl bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition-all border border-white/5"
            >
                <Edit2 className="h-4 w-4" /> 
                <span className="text-[10px] font-black uppercase tracking-widest">{t.admin.edit}</span>
            </button>
            <button 
                onClick={() => onDelete(product)}
                className="h-12 w-12 flex items-center justify-center rounded-xl bg-destructive/10 text-destructive/60 hover:bg-destructive/20 hover:text-destructive transition-all border border-destructive/5"
            >
                <Trash2 className="h-4 w-4" />
            </button>
        </div>
      </div>
    </div>
  );
}
