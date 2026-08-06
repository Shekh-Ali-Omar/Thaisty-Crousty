import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Plus, Search, RefreshCw, Filter, 
  ArrowUpDown, Package, LayoutGrid, List
} from 'lucide-react';
import { supabase, getPublicImageUrl } from '../../../lib/supabase';
import { useLocale } from '@/components/locale-provider';
import { ProductCard } from './ProductCard';
import { ProductFormModal } from './ProductFormModal';
import { Product } from '@/lib/types';
import { toast } from 'sonner';

const CATEGORIES = ["all", "crousty", "spicy", "sweet", "drink"];

export function ProductManager() {
  const { t, locale, dir } = useLocale();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'newest'>('name');
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const mapProducts = useCallback((data: any[]) => {
    return data.map(p => ({
        ...p,
        image_url: getPublicImageUrl(p.image),
        images: Array.isArray(p.images) ? p.images.map((img: string) => getPublicImageUrl(img)) : []
    })) as Product[];
  }, []);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (!error && data) {
          setProducts(mapProducts(data));
        }
    } finally {
        setLoading(false);
    }
  }, [mapProducts]);

  useEffect(() => {
    loadProducts();

    const channel = supabase
      .channel('products-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        (payload) => {
          console.log('Product change detected:', payload);
          if (payload.eventType === 'INSERT') {
            const mapped = mapProducts([payload.new])[0];
            setProducts(prev => [mapped, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            const mapped = mapProducts([payload.new])[0];
            setProducts(prev => prev.map(p => p.id === payload.new.id ? mapped : p));
          } else if (payload.eventType === 'DELETE') {
            setProducts(prev => prev.filter(p => p.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadProducts, mapProducts]);

  const handleDelete = async (product: Product) => {
    if (!window.confirm(`Are you sure you want to delete "${product.name_en || product.name}"?`)) return;

    try {
        const { error } = await supabase.from('products').delete().eq('id', product.id);
        if (error) throw error;
        toast.success("Product deleted successfully");
    } catch (e) {
        toast.error("Failed to delete product");
    }
  };

  const filteredAndSortedProducts = useMemo(() => {
    return products
      .filter(p => {
        const name = (p[`name_${locale}` as keyof Product] || p.name || '').toString().toLowerCase();
        const matchesSearch = name.includes(searchQuery.toLowerCase()) || p.category.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        if (sortBy === 'name') {
            const nameA = (a[`name_${locale}` as keyof Product] || a.name || '').toString();
            const nameB = (b[`name_${locale}` as keyof Product] || b.name || '').toString();
            return nameA.localeCompare(nameB);
        }
        if (sortBy === 'price') return Number(a.price) - Number(b.price);
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      });
  }, [products, searchQuery, categoryFilter, sortBy, locale]);

  return (
    <div className="space-y-8 pb-20">
      {/* Action Bar */}
      <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
        <div className="flex flex-1 gap-4 w-full">
            <div className="relative flex-1 group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20 group-focus-within:text-primary transition-colors" />
                <input 
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search master menu..."
                    className="w-full bg-white/5 border border-white/10 rounded-[2rem] h-16 pl-16 pr-8 text-white font-bold outline-none focus:border-primary/50 transition-all"
                />
            </div>
            <button 
                onClick={loadProducts}
                className="h-16 w-16 rounded-[2rem] glass flex items-center justify-center hover:bg-white/5 transition-all text-primary"
            >
                <RefreshCw className={`h-6 w-6 ${loading ? 'animate-spin' : ''}`} />
            </button>
        </div>

        <div className="flex items-center gap-4 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0">
            <div className="flex items-center gap-2 p-2 bg-white/5 rounded-2xl border border-white/10 shrink-0">
                {CATEGORIES.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setCategoryFilter(cat)}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${categoryFilter === cat ? 'bg-primary text-black' : 'text-white/40 hover:text-white'}`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="h-14 bg-white/5 border border-white/10 rounded-2xl px-6 text-[10px] font-black uppercase tracking-widest text-white/60 outline-none appearance-none cursor-pointer"
            >
                <option value="name" className="bg-black">Sort by Name</option>
                <option value="price" className="bg-black">Sort by Price</option>
                <option value="newest" className="bg-black">Sort by Newest</option>
            </select>

            <button 
                onClick={() => {
                    setEditingProduct(null);
                    setIsFormOpen(true);
                }}
                className="h-16 px-8 rounded-[2rem] bg-primary text-black font-black uppercase tracking-widest flex items-center gap-3 shadow-[0_10px_30px_rgba(255,140,0,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all shrink-0"
            >
                <Plus className="h-5 w-5" /> Add Master Product
            </button>
        </div>
      </div>

      {/* Grid */}
      {loading && products.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[50vh] opacity-20">
            <RefreshCw className="h-16 w-16 animate-spin mb-6" />
            <p className="font-black uppercase tracking-widest">Synchronizing Catalog...</p>
        </div>
      ) : filteredAndSortedProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[50vh] opacity-20 border-2 border-dashed border-white/5 rounded-[4rem]">
            <Package className="h-20 w-20 mb-6" />
            <p className="font-black uppercase tracking-widest">No products found matching criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredAndSortedProducts.map(product => (
                <ProductCard 
                    key={product.id} 
                    product={product} 
                    onEdit={(p) => {
                        setEditingProduct(p);
                        setIsFormOpen(true);
                    }}
                    onDelete={handleDelete}
                />
            ))}
        </div>
      )}

      {/* Footer Info */}
      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.4em] text-white/10 pt-10 border-t border-white/5">
          <span>Global Menu Catalog</span>
          <span>{filteredAndSortedProducts.length} Items Displayed</span>
          <span>Supabase Realtime Sync active</span>
      </div>

      {/* Modal */}
      {isFormOpen && (
        <ProductFormModal 
            product={editingProduct} 
            onClose={() => setIsFormOpen(false)}
            onSuccess={() => {
                setIsFormOpen(false);
                loadProducts();
            }}
        />
      )}
    </div>
  );
}
