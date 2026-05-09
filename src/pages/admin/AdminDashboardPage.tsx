import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Package, DollarSign, TrendingUp, Clock, ChevronDown, ChevronUp,
  CheckCircle, XCircle, Coffee, Truck, Search, Filter, LogOut, Send, Receipt,
  Star, Trash2, MessageSquare, UtensilsCrossed, Plus, ImageIcon, ToggleLeft, ToggleRight, Pencil, X
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import PageTransition from '@/components/layout/PageTransition';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import type { Tables } from '@/integrations/supabase/types';


type Order = Tables<'orders'>;
type MenuItemRow = Tables<'menu'>;

const STATUS_COLORS: Record<string, string> = {
  pending: 'border-l-yellow-500 bg-yellow-50',
  preparing: 'border-l-blue-500 bg-blue-50',
  ready: 'border-l-emerald-500 bg-emerald-50',
  completed: 'border-l-gray-400 bg-gray-50',
  cancelled: 'border-l-red-500 bg-red-50',
};

const PAYMENT_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  verified: 'bg-emerald-100 text-emerald-800',
  rejected: 'bg-red-100 text-red-800',
};

const ORDER_STATUSES = ['pending', 'preparing', 'ready', 'completed', 'cancelled'] as const;
const PAYMENT_STATUSES = ['pending', 'verified', 'rejected'] as const;

function generateBillMessage(order: Order): string {
  const items = Array.isArray(order.items) ? order.items : [];
  const itemLines = items
    .map((item: any) => `• ${item.name} × ${item.quantity} — ₹${(item.price * item.quantity).toFixed(0)}`)
    .join('\n');

  return [
    `🧾 *G-TOWN CAFE — Digital Bill*`,
    ``,
    `📋 Order: *${order.order_id}*`,
    `🪑 Table: ${order.table_number}`,
    `📅 ${new Date(order.created_at).toLocaleString()}`,
    ``,
    `*Items:*`,
    itemLines,
    ``,
    `Subtotal: ₹${Number(order.sub_total).toFixed(0)}`,
    `Tax (5%): ₹${Number(order.tax).toFixed(0)}`,
    `*Grand Total: ₹${Number(order.grand_total).toFixed(0)}*`,
    ``,
    `Payment: ${order.payment_status.toUpperCase()}`,
    order.claimed_utr ? `UTR: ${order.claimed_utr}` : '',
    ``,
    `Thank you for dining with us! ☕`,
  ].filter(Boolean).join('\n');
}

function OrderCard({ order, onUpdateOrder, onUpdatePayment }: {
  order: Order;
  onUpdateOrder: (id: string, status: string) => void;
  onUpdatePayment: (id: string, status: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const items = Array.isArray(order.items) ? order.items : [];

  const handleSendBill = () => {
    const phone = order.customer_phone?.replace(/\D/g, '') || '';
    const fullPhone = phone.startsWith('91') ? phone : `91${phone}`;
    const message = generateBillMessage(order);
    window.open(`https://wa.me/${fullPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border-l-4 border border-border/50 shadow-premium overflow-hidden ${STATUS_COLORS[order.order_status] || ''}`}
    >
      <div
        className="p-4 cursor-pointer flex items-center justify-between"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-4 min-w-0">
          <div>
            <p className="font-display text-base font-bold text-foreground">{order.order_id}</p>
            <p className="font-body text-xs text-muted-foreground">
              Table {order.table_number} • {new Date(order.created_at).toLocaleTimeString()}
              {order.customer_phone && ` • 📞 ${order.customer_phone}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-2.5 py-1 rounded-full text-xs font-body font-semibold ${PAYMENT_COLORS[order.payment_status]}`}>
            {order.payment_status}
          </span>
          <span className="font-display font-bold text-foreground">₹{order.grand_total}</span>
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>

      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="border-t border-border/30 p-4 bg-card/80 space-y-4"
        >
          {/* Items */}
          <div>
            <p className="font-body text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Items</p>
            <div className="space-y-1">
              {items.map((item: any, i: number) => (
                <div key={i} className="flex justify-between font-body text-sm">
                  <span>{item.name} × {item.quantity}</span>
                  <span className="font-semibold">₹{(item.price * item.quantity).toFixed(0)}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between font-body text-sm mt-2 pt-2 border-t border-border/30">
              <span className="text-muted-foreground">Subtotal</span>
              <span>₹{order.sub_total}</span>
            </div>
            <div className="flex justify-between font-body text-sm">
              <span className="text-muted-foreground">Tax</span>
              <span>₹{order.tax}</span>
            </div>
            <div className="flex justify-between font-display font-bold mt-1">
              <span>Total</span>
              <span>₹{order.grand_total}</span>
            </div>
          </div>

          {/* UTR */}
          {order.claimed_utr && (
            <div>
              <p className="font-body text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">UTR</p>
              <p className="font-body text-sm font-mono">{order.claimed_utr}</p>
            </div>
          )}

          {/* Order Status Actions */}
          <div>
            <p className="font-body text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Order Status</p>
            <div className="flex flex-wrap gap-2">
              {ORDER_STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => onUpdateOrder(order.id, s)}
                  disabled={order.order_status === s}
                  className={`px-3 py-1.5 rounded-lg text-xs font-body font-semibold transition-all ${
                    order.order_status === s
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Payment Status Actions */}
          <div>
            <p className="font-body text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Payment Status</p>
            <div className="flex flex-wrap gap-2">
              {PAYMENT_STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => onUpdatePayment(order.id, s)}
                  disabled={order.payment_status === s}
                  className={`px-3 py-1.5 rounded-lg text-xs font-body font-semibold transition-all ${
                    order.payment_status === s
                      ? 'bg-accent text-accent-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Send Bill via WhatsApp */}
          <div className="pt-2 border-t border-border/30">
            <button
              onClick={handleSendBill}
              disabled={!order.customer_phone}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-success text-white font-body text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send size={14} />
              {order.customer_phone ? 'Send Bill via WhatsApp' : 'No phone number'}
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'orders' | 'reviews' | 'menu'>('orders');
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItemRow | null>(null);
  const [newItem, setNewItem] = useState({
    name: '', description: '', price: '', category: 'Snacks',
    image_url: '', is_signature: false, is_available: true,
  });

  // Check auth
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) navigate('/admin');
    });
  }, [navigate]);

  // Fetch orders
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Order[];
    },
    refetchInterval: 5000,
  });

  // Fetch reviews
  const { data: reviews = [], isLoading: reviewsLoading } = useQuery({
    queryKey: ['admin-reviews'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    refetchInterval: 10000,
  });

  // Fetch menu items
  const { data: menuItems = [], isLoading: menuLoading } = useQuery({
    queryKey: ['admin-menu'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('menu')
        .select('*')
        .order('category')
        .order('name');
      if (error) throw error;
      return data as MenuItemRow[];
    },
  });

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('admin-orders-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const handleUpdateOrderStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ order_status: status as any })
      .eq('id', id);
    if (error) {
      toast({ variant: 'destructive', title: 'Update failed', description: error.message });
    } else {
      toast({ title: 'Order updated', description: `Status → ${status}` });
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
    }
  };

  const handleUpdatePaymentStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ payment_status: status as any })
      .eq('id', id);
    if (error) {
      toast({ variant: 'destructive', title: 'Update failed', description: error.message });
    } else {
      toast({ title: 'Payment updated', description: `Status → ${status}` });
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
    }
  };

  const handleDeleteReview = async (id: string) => {
    const { error } = await supabase.from('reviews').delete().eq('id', id);
    if (error) {
      toast({ variant: 'destructive', title: 'Delete failed', description: error.message });
    } else {
      toast({ title: 'Review deleted' });
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
    }
  };

  const handleAddMenuItem = async () => {
    if (!newItem.name || !newItem.price) {
      toast({ variant: 'destructive', title: 'Name and price are required' });
      return;
    }
    const { error } = await supabase.from('menu').insert({
      name: newItem.name,
      description: newItem.description || null,
      price: parseFloat(newItem.price),
      category: newItem.category,
      image_url: newItem.image_url || null,
      is_signature: newItem.is_signature,
      is_available: newItem.is_available,
    });
    if (error) {
      toast({ variant: 'destructive', title: 'Failed to add item', description: error.message });
    } else {
      toast({ title: 'Menu item added' });
      setNewItem({ name: '', description: '', price: '', category: 'Snacks', image_url: '', is_signature: false, is_available: true });
      setShowAddMenu(false);
      queryClient.invalidateQueries({ queryKey: ['admin-menu'] });
      queryClient.invalidateQueries({ queryKey: ['menu'] });
    }
  };

  const handleDeleteMenuItem = async (id: string) => {
    if (!confirm('Delete this menu item?')) return;
    const { error } = await supabase.from('menu').delete().eq('id', id);
    if (error) {
      toast({ variant: 'destructive', title: 'Delete failed', description: error.message });
    } else {
      toast({ title: 'Menu item removed' });
      queryClient.invalidateQueries({ queryKey: ['admin-menu'] });
      queryClient.invalidateQueries({ queryKey: ['menu'] });
    }
  };

  const handleSaveEdit = async () => {
    if (!editingItem) return;
    const { error } = await supabase
      .from('menu')
      .update({
        name: editingItem.name,
        description: editingItem.description,
        price: editingItem.price,
        category: editingItem.category,
        image_url: editingItem.image_url,
        is_signature: editingItem.is_signature,
        is_available: editingItem.is_available,
      })
      .eq('id', editingItem.id);
    if (error) {
      toast({ variant: 'destructive', title: 'Update failed', description: error.message });
    } else {
      toast({ title: 'Menu item updated' });
      setEditingItem(null);
      queryClient.invalidateQueries({ queryKey: ['admin-menu'] });
      queryClient.invalidateQueries({ queryKey: ['menu'] });
    }
  };

  const handleToggleAvailability = async (id: string, current: boolean) => {
    const { error } = await supabase.from('menu').update({ is_available: !current }).eq('id', id);
    if (error) {
      toast({ variant: 'destructive', title: 'Update failed', description: error.message });
    } else {
      toast({ title: `Item ${!current ? 'available' : 'unavailable'}` });
      queryClient.invalidateQueries({ queryKey: ['admin-menu'] });
      queryClient.invalidateQueries({ queryKey: ['menu'] });
    }
  };

  const reviewAvg = reviews.length > 0
    ? (reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0';

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin');
  };

  // Stats
  const todayOrders = orders.filter(
    (o) => new Date(o.created_at).toDateString() === new Date().toDateString()
  );
  const todayRevenue = todayOrders
    .filter((o) => o.payment_status === 'verified')
    .reduce((sum, o) => sum + o.grand_total, 0);
  const avgOrder = todayOrders.length > 0 ? todayRevenue / Math.max(todayOrders.filter(o => o.payment_status === 'verified').length, 1) : 0;
  const pendingCount = orders.filter((o) => o.order_status === 'pending').length;

  const stats = [
    { label: 'Orders Today', value: String(todayOrders.length), icon: Package },
    { label: 'Revenue', value: `₹${todayRevenue.toLocaleString()}`, icon: DollarSign },
    { label: 'Avg. Order', value: `₹${avgOrder.toFixed(0)}`, icon: TrendingUp },
    { label: 'Pending', value: String(pendingCount), icon: Clock },
  ];

  // Filter
  const filtered = orders.filter((o) => {
    const matchStatus = statusFilter === 'all' || o.order_status === statusFilter;
    const matchSearch =
      !searchTerm ||
      o.order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.claimed_utr || '').includes(searchTerm);
    return matchStatus && matchSearch;
  });

  return (
    <PageTransition>
      <div className="min-h-screen pt-24 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-10">
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground">Dashboard</h1>
              <p className="font-body text-muted-foreground mt-1">Manage orders in real-time</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-success animate-pulse" />
                <span className="font-body text-sm text-muted-foreground">Live</span>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
                <LogOut size={14} /> Logout
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="bg-card rounded-2xl border border-border/50 p-5 shadow-premium"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center">
                    <s.icon size={18} className="text-accent" />
                  </div>
                </div>
                <p className="font-display text-2xl font-bold text-foreground">{s.value}</p>
                <p className="font-body text-xs text-muted-foreground mt-1">{s.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-5 py-2.5 rounded-xl font-body text-sm font-semibold transition-all ${
                activeTab === 'orders'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card border border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              <Package size={14} className="inline mr-2" />Orders
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-5 py-2.5 rounded-xl font-body text-sm font-semibold transition-all ${
                activeTab === 'reviews'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card border border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              <MessageSquare size={14} className="inline mr-2" />Reviews ({reviews.length})
            </button>
            <button
              onClick={() => setActiveTab('menu')}
              className={`px-5 py-2.5 rounded-xl font-body text-sm font-semibold transition-all ${
                activeTab === 'menu'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card border border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              <UtensilsCrossed size={14} className="inline mr-2" />Menu ({menuItems.length})
            </button>
          </div>

          {activeTab === 'orders' && (
            <>
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search by order ID or UTR..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border font-body text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
                  />
                </div>
                <div className="flex gap-2 overflow-x-auto">
                  {['all', ...ORDER_STATUSES].map((s) => (
                    <button
                      key={s}
                      onClick={() => setStatusFilter(s)}
                      className={`flex-shrink-0 px-4 py-2.5 rounded-xl font-body text-xs font-semibold transition-all ${
                        statusFilter === s
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-card border border-border text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-20 rounded-xl" />
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-20">
                  <Coffee size={48} className="mx-auto text-muted-foreground/30 mb-4" />
                  <p className="font-body text-muted-foreground">No orders found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filtered.map((order) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      onUpdateOrder={handleUpdateOrderStatus}
                      onUpdatePayment={handleUpdatePaymentStatus}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === 'reviews' && (
            <>
              <div className="bg-card rounded-2xl border border-border/50 p-5 shadow-premium mb-6 flex items-center gap-6">
                <div>
                  <p className="font-display text-3xl font-bold text-foreground">{reviewAvg}</p>
                  <div className="flex gap-0.5 mt-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={14} className={s <= Math.round(Number(reviewAvg)) ? 'text-accent fill-accent' : 'text-muted-foreground/20'} />
                    ))}
                  </div>
                </div>
                <div className="font-body text-sm text-muted-foreground">
                  {reviews.length} total reviews
                </div>
              </div>
              {reviewsLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-24 rounded-xl" />
                  ))}
                </div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-20">
                  <MessageSquare size={48} className="mx-auto text-muted-foreground/30 mb-4" />
                  <p className="font-body text-muted-foreground">No reviews yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {reviews.map((review: any) => (
                    <motion.div
                      key={review.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-card rounded-xl border border-border/50 p-4 shadow-premium"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                            <span className="font-display text-sm font-bold text-accent">
                              {(review.customer_name || 'G')[0].toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-body text-sm font-semibold text-foreground">
                              {review.customer_name || 'Guest'}
                            </p>
                            <div className="flex items-center gap-2">
                              <div className="flex gap-0.5">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <Star key={s} size={12} className={s <= review.rating ? 'text-accent fill-accent' : 'text-muted-foreground/20'} />
                                ))}
                              </div>
                              <span className="font-body text-xs text-muted-foreground">
                                {new Date(review.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-body text-xs text-muted-foreground bg-muted px-2 py-1 rounded-lg">
                            {review.order_id}
                          </span>
                          <button
                            onClick={() => handleDeleteReview(review.id)}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      {review.comment && (
                        <p className="font-body text-sm text-foreground/80 mt-3 pl-[52px]">
                          "{review.comment}"
                        </p>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === 'menu' && (
            <>
              <div className="flex items-center justify-between mb-6">
                <p className="font-body text-sm text-muted-foreground">{menuItems.length} items total</p>
                <Button onClick={() => setShowAddMenu(!showAddMenu)} className="gap-2">
                  <Plus size={14} /> Add Item
                </Button>
              </div>

              {showAddMenu && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-card rounded-2xl border border-border/50 p-5 shadow-premium mb-6 space-y-4"
                >
                  <h3 className="font-display text-lg font-bold text-foreground">New Menu Item</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-body text-xs font-semibold text-muted-foreground uppercase mb-1 block">Name *</label>
                      <Input value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} placeholder="Cappuccino" />
                    </div>
                    <div>
                      <label className="font-body text-xs font-semibold text-muted-foreground uppercase mb-1 block">Price (₹) *</label>
                      <Input type="number" value={newItem.price} onChange={(e) => setNewItem({ ...newItem, price: e.target.value })} placeholder="199" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="font-body text-xs font-semibold text-muted-foreground uppercase mb-1 block">Description</label>
                      <Input value={newItem.description} onChange={(e) => setNewItem({ ...newItem, description: e.target.value })} placeholder="Rich espresso with steamed milk..." />
                    </div>
                    <div>
                      <label className="font-body text-xs font-semibold text-muted-foreground uppercase mb-1 block">Category</label>
                      <Input
                        list="menu-categories-list"
                        value={newItem.category}
                        onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                        placeholder="Snacks, Pizza, Paneer..."
                      />
                      <datalist id="menu-categories-list">
                        {Array.from(new Set(menuItems.map((m) => m.category))).map((cat) => (
                          <option key={cat} value={cat} />
                        ))}
                      </datalist>
                    </div>
                    <div>
                      <label className="font-body text-xs font-semibold text-muted-foreground uppercase mb-1 block">Image URL</label>
                      <Input value={newItem.image_url} onChange={(e) => setNewItem({ ...newItem, image_url: e.target.value })} placeholder="https://..." />
                    </div>
                    <div className="flex items-center gap-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={newItem.is_signature} onChange={(e) => setNewItem({ ...newItem, is_signature: e.target.checked })} className="rounded" />
                        <span className="font-body text-sm">Signature</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={newItem.is_available} onChange={(e) => setNewItem({ ...newItem, is_available: e.target.checked })} className="rounded" />
                        <span className="font-body text-sm">Available</span>
                      </label>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button onClick={handleAddMenuItem}>Add to Menu</Button>
                    <Button variant="outline" onClick={() => setShowAddMenu(false)}>Cancel</Button>
                  </div>
                </motion.div>
              )}

              {menuLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 rounded-xl" />
                  ))}
                </div>
              ) : menuItems.length === 0 ? (
                <div className="text-center py-20">
                  <UtensilsCrossed size={48} className="mx-auto text-muted-foreground/30 mb-4" />
                  <p className="font-body text-muted-foreground">No menu items yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {menuItems.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex items-center gap-4 bg-card rounded-xl border border-border/50 p-4 shadow-premium ${!item.is_available ? 'opacity-50' : ''}`}
                    >
                      <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                        {item.image_url ? (
                          <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Coffee size={16} className="text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-display text-sm font-bold text-foreground truncate">{item.name}</p>
                          {item.is_signature && (
                            <span className="px-1.5 py-0.5 rounded-full bg-accent/10 text-accent text-[10px] font-body font-semibold">Signature</span>
                          )}
                        </div>
                        <p className="font-body text-xs text-muted-foreground">
                          {item.category.replace(/_/g, ' ')} • ₹{item.price}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleToggleAvailability(item.id, item.is_available)}
                          className={`p-2 rounded-lg transition-colors ${item.is_available ? 'text-success hover:bg-success/10' : 'text-muted-foreground hover:bg-muted'}`}
                          title={item.is_available ? 'Mark unavailable' : 'Mark available'}
                        >
                          {item.is_available ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                        </button>
                        <button
                          onClick={() => setEditingItem(item)}
                          className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                          title="Edit item"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteMenuItem(item.id)}
                          className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          title="Delete item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {editingItem && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setEditingItem(null)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-card rounded-2xl border border-border shadow-premium-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-xl font-bold">Edit Menu Item</h3>
              <button onClick={() => setEditingItem(null)} className="p-1 rounded-lg hover:bg-muted">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="font-body text-xs font-semibold text-muted-foreground uppercase mb-1 block">Name</label>
                <Input value={editingItem.name} onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-body text-xs font-semibold text-muted-foreground uppercase mb-1 block">Price (₹)</label>
                  <Input type="number" value={editingItem.price} onChange={(e) => setEditingItem({ ...editingItem, price: parseFloat(e.target.value) || 0 })} />
                </div>
                <div>
                  <label className="font-body text-xs font-semibold text-muted-foreground uppercase mb-1 block">Category</label>
                  <Input
                    list="menu-categories-list"
                    value={editingItem.category}
                    onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="font-body text-xs font-semibold text-muted-foreground uppercase mb-1 block">Description</label>
                <Input value={editingItem.description || ''} onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })} />
              </div>
              <div>
                <label className="font-body text-xs font-semibold text-muted-foreground uppercase mb-1 block">Image URL</label>
                <Input value={editingItem.image_url || ''} onChange={(e) => setEditingItem({ ...editingItem, image_url: e.target.value })} placeholder="https://..." />
                {editingItem.image_url && (
                  <img src={editingItem.image_url} alt="" className="mt-2 w-24 h-24 object-cover rounded-lg border border-border" />
                )}
              </div>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={editingItem.is_signature} onChange={(e) => setEditingItem({ ...editingItem, is_signature: e.target.checked })} className="rounded" />
                  <span className="font-body text-sm">Signature</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={editingItem.is_available} onChange={(e) => setEditingItem({ ...editingItem, is_available: e.target.checked })} className="rounded" />
                  <span className="font-body text-sm">Available</span>
                </label>
              </div>
              <div className="flex gap-2 pt-2">
                <Button onClick={handleSaveEdit} className="flex-1">Save Changes</Button>
                <Button variant="outline" onClick={() => setEditingItem(null)}>Cancel</Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </PageTransition>
  );
}
