import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, Search, UtensilsCrossed, ArrowUpRight, ArrowLeft } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import PageTransition from '@/components/layout/PageTransition';
import { useCartStore } from '@/store/cartStore';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  image_url: string | null;
  is_signature: boolean;
  is_available: boolean;
}

const CATEGORY_EMOJI: Record<string, string> = {
  Snacks: '🍟', Salad: '🥗', 'Raita & Papad': '🥣', Rice: '🍚',
  'Tandoori Breads': '🫓', 'Tandoori Parathe': '🫓', 'A La Carte': '🍛',
  Dal: '🍲', Mushroom: '🍄', Chaap: '🍢', Paneer: '🧀',
  'South Indian': '🥘', 'Chinese & Italian': '🥡', Soup: '🍜',
  Shakes: '🥤', Pizza: '🍕', Burger: '🍔', Beverages: '☕',
  'Pav Bhaji': '🍞', 'Chhole Bhature': '🥖', Thali: '🍱',
};

function MenuCard({ item }: { item: MenuItem }) {
  const { items, addItem, updateQuantity } = useCartStore();
  const cartItem = items.find((i) => i.id === item.id);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative rounded-none overflow-hidden border border-foreground/10 hover:border-accent transition-all duration-500 aspect-square flex flex-col justify-end p-6"
    >
      {/* Background Image or Fallback */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-primary/5">
        {item.image_url ? (
          <>
            <img 
              src={item.image_url} 
              alt={item.name} 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
              loading="lazy" 
            />
            {/* Dark gradient overlay for readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 bg-paper flex items-center justify-center opacity-40 group-hover:opacity-100 transition-all duration-500">
             <span className="text-7xl">
              {CATEGORY_EMOJI[item.category] || '☕'}
            </span>
          </div>
        )}
      </div>

      {/* Floating Badge (Emoji) when image exists */}
      {item.image_url && (
        <div className="absolute top-4 right-4 z-10 text-2xl drop-shadow-lg">
          {CATEGORY_EMOJI[item.category] || '☕'}
        </div>
      )}

      {/* Content Layered on Top */}
      <div className="relative z-10 flex flex-col gap-4">
        {item.is_signature && (
          <div className="self-start font-body text-[9px] uppercase tracking-[0.2em] bg-accent text-accent-foreground px-2 py-0.5 shadow-lg">
            Signature Dish
          </div>
        )}
        
        <div>
          <h3 className={`font-display text-2xl md:text-3xl font-bold leading-tight group-hover:italic transition-all line-clamp-1 ${item.image_url ? 'text-white' : 'text-foreground'}`}>
            {item.name}
          </h3>
          {item.description && (
            <p className={`font-body text-[11px] mt-2 line-clamp-2 leading-relaxed ${item.image_url ? 'text-white/70' : 'text-muted-foreground'}`}>
              {item.description}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between mt-2 pt-4 border-t border-white/10">
          <p className={`font-display text-2xl font-black tabular-nums ${item.image_url ? 'text-accent' : 'text-accent'}`}>
            ₹{item.price}
          </p>
          
          {cartItem ? (
            <div className={`flex items-center gap-3 px-3 py-2 ${item.image_url ? 'bg-white/10 backdrop-blur-md' : 'bg-foreground/5'}`}>
              <button
                onClick={() => updateQuantity(item.id, cartItem.quantity - 1)}
                className={`${item.image_url ? 'text-white/60' : 'text-muted-foreground'} hover:text-accent transition-colors`}
              >
                <Minus size={14} />
              </button>
              <span className={`font-display font-bold text-base min-w-[20px] text-center ${item.image_url ? 'text-white' : 'text-foreground'}`}>
                {cartItem.quantity}
              </span>
              <button
                onClick={() => updateQuantity(item.id, cartItem.quantity + 1)}
                className={`${item.image_url ? 'text-white/60' : 'text-muted-foreground'} hover:text-accent transition-colors`}
              >
                <Plus size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={() =>
                addItem({
                  id: item.id,
                  name: item.name,
                  price: item.price,
                  image_url: item.image_url || undefined,
                })
              }
              className={`font-body text-[10px] font-bold uppercase tracking-widest border-b-2 border-accent pb-0.5 hover:text-accent transition-colors ${item.image_url ? 'text-white' : 'text-foreground'}`}
            >
              Add to cart
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function MenuSkeleton() {
  return (
    <div className="aspect-square bg-primary/5 border border-foreground/10 p-8 flex flex-col justify-end">
      <div className="space-y-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <div className="flex justify-between items-end pt-4 border-t border-foreground/5">
          <Skeleton className="h-8 w-1/4" />
          <Skeleton className="h-8 w-1/4" />
        </div>
      </div>
    </div>
  );
}

export default function MenuPage() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const { data: menuItems = [], isLoading } = useQuery({
    queryKey: ['menu'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('menu')
        .select('*')
        .eq('is_available', true)
        .order('category')
        .order('is_signature', { ascending: false });
      if (error) throw error;
      return data as MenuItem[];
    },
  });

  const categories = useMemo(() => {
    const map = new Map<string, number>();
    menuItems.forEach((i) => map.set(i.category, (map.get(i.category) || 0) + 1));
    return Array.from(map.entries()).map(([name, count]) => ({ name, count }));
  }, [menuItems]);

  const filtered = useMemo(() => {
    return menuItems.filter((item) => {
      const matchCategory = !activeCategory || item.category === activeCategory;
      const matchSearch =
        !search ||
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        (item.description || '').toLowerCase().includes(search.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [activeCategory, search, menuItems]);

  return (
    <PageTransition>
      <div className="pt-32 pb-20 px-6 min-h-screen bg-paper">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-end justify-between gap-12 mb-16 border-b border-foreground/10 pb-12">
            <div className="max-w-xl">
              <p className="font-accent text-3xl text-accent mb-4 -rotate-2 inline-block">our collection.</p>
              <h1 className="font-display text-6xl md:text-8xl font-black text-foreground leading-[0.8] tracking-tight">
                {activeCategory ? (
                  <>
                    <span className="block text-accent italic">{activeCategory}</span>
                  </>
                ) : (
                  <>
                    <span className="block">THE FULL</span>
                    <span className="block italic text-gradient-gold">MENU.</span>
                  </>
                )}
              </h1>
            </div>

            <div className="w-full md:w-80">
              <div className="relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search dishes..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-11 pr-4 py-4 bg-foreground/5 border border-foreground/10 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent transition-colors"
                />
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-0">
              {Array.from({ length: 8 }).map((_, i) => <MenuSkeleton key={i} />)}
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {!activeCategory && !search ? (
                <motion.div
                  key="categories"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-0"
                >
                  {categories.map((cat, i) => (
                    <motion.button
                      key={cat.name}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      onClick={() => setActiveCategory(cat.name)}
                      className="group relative aspect-square bg-primary/5 border border-foreground/10 hover:border-accent transition-all duration-500 p-8 flex flex-col items-center justify-center gap-6"
                    >
                      <span className="text-6xl group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-500">
                        {CATEGORY_EMOJI[cat.name] || '☕'}
                      </span>
                      <div className="text-center">
                        <h3 className="font-display text-xl md:text-2xl font-bold text-foreground leading-tight mb-2">
                          {cat.name}
                        </h3>
                        <p className="font-body text-[10px] uppercase tracking-[0.3em] text-muted-foreground group-hover:text-accent transition-colors">
                          {cat.count} items
                        </p>
                      </div>
                      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowUpRight size={20} className="text-accent" />
                      </div>
                    </motion.button>
                  ))}
                  {categories.length === 0 && (
                    <div className="col-span-full text-center py-40 border border-foreground/10">
                      <UtensilsCrossed size={48} className="mx-auto text-muted-foreground/20 mb-6" />
                      <p className="font-display text-2xl text-muted-foreground italic">The kitchen is preparing something special...</p>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div key="items" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {activeCategory && (
                    <button
                      onClick={() => setActiveCategory(null)}
                      className="mb-12 inline-flex items-center gap-3 font-body text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-accent transition-colors"
                    >
                      <ArrowLeft size={16} /> Back to all categories
                    </button>
                  )}
                  <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-0">
                    {filtered.map((item) => <MenuCard key={item.id} item={item} />)}
                  </motion.div>
                  {filtered.length === 0 && (
                    <div className="text-center py-40 border border-foreground/10">
                      <p className="font-display text-2xl text-muted-foreground italic">No matches found for your search.</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
