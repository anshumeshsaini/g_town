import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { ArrowLeft, Clock } from 'lucide-react';
import PageTransition from '@/components/layout/PageTransition';
import { useCartStore } from '@/store/cartStore';
import { generateOrderId, generateUPIString } from '@/lib/whatsapp';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function CheckoutPage() {
  const { items, subtotal, tableNumber, setTableNumber, clearCart } = useCartStore();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [table, setTable] = useState(tableNumber?.toString() || '');
  const [phone, setPhone] = useState('');
  const [orderId] = useState(generateOrderId);
  const [step, setStep] = useState<'table' | 'qr'>('table');
  const [submitting, setSubmitting] = useState(false);
  const [dbOrderId, setDbOrderId] = useState<string | null>(null);

  const tax = subtotal() * 0.05;
  const grandTotal = subtotal() + tax;

  const handleTableSubmit = async () => {
    const num = parseInt(table);
    if (num < 1 || num > 50) return;
    if (!/^[6-9]\d{9}$/.test(phone)) {
      toast({ variant: 'destructive', title: 'Invalid phone', description: 'Enter a valid 10-digit Indian mobile number' });
      return;
    }
    setTableNumber(num);
    setSubmitting(true);

    // Insert order into Supabase
    const orderItems = items.map((i) => ({
      id: i.id,
      name: i.name,
      price: i.price,
      quantity: i.quantity,
      image_url: i.image_url,
    }));

    const { data, error } = await supabase
      .from('orders')
      .insert({
        order_id: orderId,
        table_number: num,
        items: orderItems,
        sub_total: subtotal(),
        tax,
        grand_total: grandTotal,
        customer_phone: phone,
        payment_qr_data: generateUPIString(grandTotal, orderId),
      })
      .select('id')
      .single();

    setSubmitting(false);

    if (error) {
      toast({ variant: 'destructive', title: 'Error placing order', description: error.message });
      return;
    }

    setDbOrderId(data.id);
    setStep('qr');
  };

  if (items.length === 0 && step === 'table') {
    return (
      <PageTransition>
        <div className="min-h-screen flex items-center justify-center px-6">
          <div className="text-center">
            <p className="font-body text-muted-foreground mb-4">Your cart is empty</p>
            <Button onClick={() => navigate('/menu')} variant="outline">Browse Menu</Button>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen pt-24 pb-20 px-6">
        <div className="max-w-lg mx-auto">
          <button
            onClick={() => (step === 'qr' ? setStep('table') : navigate(-1))}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground font-body text-sm mb-8 transition-colors"
          >
            <ArrowLeft size={16} /> Back
          </button>

          {step === 'table' ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="font-display text-3xl font-bold text-foreground mb-2">Checkout</h1>
              <p className="font-body text-muted-foreground mb-8">Enter your table number to proceed</p>

              <div className="bg-card rounded-2xl border border-border/50 p-6 mb-6 shadow-premium">
                <h3 className="font-display text-lg font-semibold mb-4">Order Summary</h3>
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between font-body text-sm py-2 border-b border-border/30 last:border-0">
                    <span className="text-muted-foreground">{item.name} × {item.quantity}</span>
                    <span className="font-semibold">₹{(item.price * item.quantity).toFixed(0)}</span>
                  </div>
                ))}
                <div className="mt-4 pt-3 border-t border-border space-y-1">
                  <div className="flex justify-between font-body text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>₹{subtotal().toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between font-body text-sm">
                    <span className="text-muted-foreground">Tax (5%)</span>
                    <span>₹{tax.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between font-display text-lg font-bold pt-2">
                    <span>Total</span>
                    <span className="text-gradient-gold">₹{grandTotal.toFixed(0)}</span>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <label className="font-body text-sm font-medium text-foreground mb-2 block">Table Number (1–50)</label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={table}
                  onChange={(e) => setTable(e.target.value)}
                  placeholder="Enter your table number"
                  className="w-full px-4 py-3 rounded-xl bg-card border border-border font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/30"
                />
              </div>

              <div className="mb-6">
                <label className="font-body text-sm font-medium text-foreground mb-2 block">WhatsApp Number</label>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-3 rounded-xl bg-muted border border-border font-body text-sm text-muted-foreground">+91</span>
                  <input
                    type="tel"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="10-digit mobile number"
                    className="flex-1 px-4 py-3 rounded-xl bg-card border border-border font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/30"
                  />
                </div>
              </div>

              <Button
                onClick={handleTableSubmit}
                disabled={!table || parseInt(table) < 1 || parseInt(table) > 50 || phone.length !== 10 || submitting}
                className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-body font-semibold"
              >
                {submitting ? 'Placing Order...' : 'Place Order & Generate QR'}
              </Button>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <p className="font-accent text-xl text-accent mb-1">Order</p>
              <h1 className="font-display text-3xl font-bold text-foreground mb-2">{orderId}</h1>
              <p className="font-body text-muted-foreground mb-8">Table {tableNumber} • Scan to pay</p>

              <div className="inline-block p-6 bg-card rounded-3xl border border-border shadow-premium-lg animate-pulse-soft">
                <QRCodeSVG
                  value={generateUPIString(grandTotal, orderId)}
                  size={220}
                  bgColor="transparent"
                  fgColor="hsl(18, 51%, 13%)"
                  level="H"
                />
              </div>

              <div className="mt-8">
                <p className="font-display text-3xl font-bold text-gradient-gold mb-2">₹{grandTotal.toFixed(0)}</p>
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <Clock size={14} />
                  <span className="font-body text-sm">Pay within 15 minutes</span>
                </div>
              </div>

              <Button
                onClick={() => {
                  clearCart();
                  navigate('/payment-confirm', { state: { orderId, grandTotal, tableNumber, dbOrderId } });
                }}
                className="mt-8 w-full h-12 rounded-xl bg-primary text-primary-foreground font-body font-semibold"
              >
                I've Paid — Enter UTR
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
