import { createClient } from '@/lib/supabase/client';
import type { CategoryItem } from '@/lib/types';

export async function fetchCategories(): Promise<CategoryItem[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true });
    
  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
  return data as CategoryItem[];
}
