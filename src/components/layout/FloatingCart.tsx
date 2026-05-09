import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';

export default function FloatingCart() {
  const totalItems = useCartStore((s) => s.totalItems());
  const subtotal = useCartStore((s) => s.subtotal());
  const openCart = useCartStore((s) => s.openCart);

  if (totalItems === 0) return null;

  return (
    <AnimatePresence>
      <motion.button
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        onClick={openCart}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 md:hidden flex items-center gap-3 px-6 py-3 rounded-full bg-primary text-primary-foreground shadow-premium-lg"
      >
        <ShoppingBag size={18} />
        <span className="font-body font-semibold text-sm">
          {totalItems} item{totalItems > 1 ? 's' : ''} · ₹{subtotal.toFixed(0)}
        </span>
      </motion.button>
    </AnimatePresence>
  );
}
