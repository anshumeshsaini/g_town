import { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Home, MessageCircle, RefreshCw, Star, Send } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import PageTransition from '@/components/layout/PageTransition';
import { getOrderConfirmationLink } from '@/lib/whatsapp';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const STEPS = ['pending', 'preparing', 'ready', 'completed'] as const;
const STEP_LABELS: Record<string, string> = {
  pending: 'Order Placed',
  preparing: 'Preparing',
  ready: 'Ready for Pickup',
  completed: 'Completed',
};

export default function OrderSuccessPage() {
  const location = useLocation();
  const { toast } = useToast();
  const { orderId, grandTotal } = (location.state as { orderId?: string; grandTotal?: number }) || {};

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [reviewerName, setReviewerName] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const { data: order } = useQuery({
    queryKey: ['order-status', orderId],
    queryFn: async () => {
      if (!orderId) return null;
      const { data, error } = await supabase
        .from('orders')
        .select('order_status, payment_status, customer_phone')
        .eq('order_id', orderId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!orderId,
    refetchInterval: 3000,
  });

  const currentStep = STEPS.indexOf(order?.order_status as any);

  const handleSubmitReview = async () => {
    if (rating === 0) {
      toast({ variant: 'destructive', title: 'Please select a rating' });
      return;
    }
    setSubmittingReview(true);
    const { error } = await supabase.from('reviews').insert({
      order_id: orderId || 'walk-in',
      rating,
      comment: comment.trim() || null,
      customer_name: reviewerName.trim() || null,
      customer_phone: order?.customer_phone || null,
    });
    setSubmittingReview(false);
    if (error) {
      toast({ variant: 'destructive', title: 'Failed to submit review', description: error.message });
    } else {
      setReviewSubmitted(true);
      toast({ title: 'Thank you! ✨', description: 'Your review has been submitted.' });
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center px-6 py-20">
        <div className="max-w-md w-full text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
            className="w-24 h-24 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-8"
          >
            <CheckCircle size={48} className="text-success" />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <p className="font-accent text-xl text-accent mb-1">Thank you!</p>
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">Order Confirmed</h1>
            {orderId && (
              <p className="font-body text-muted-foreground mb-1">
                Order ID: <span className="font-semibold text-foreground">{orderId}</span>
              </p>
            )}
            {grandTotal && (
              <p className="font-display text-2xl font-bold text-gradient-gold mt-2">₹{grandTotal.toFixed(0)}</p>
            )}
            {order?.payment_status && (
              <p className={`font-body text-sm mt-2 ${
                order.payment_status === 'verified' ? 'text-success' :
                order.payment_status === 'rejected' ? 'text-destructive' : 'text-muted-foreground'
              }`}>
                Payment: {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
              </p>
            )}
          </motion.div>

          {/* Order Status Tracker */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-10 bg-card rounded-2xl border border-border/50 p-6 shadow-premium"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg font-semibold">Order Status</h3>
              <RefreshCw size={14} className="text-muted-foreground animate-spin" />
            </div>
            <div className="space-y-4">
              {STEPS.map((step, i) => (
                <div key={step} className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                      i <= currentStep
                        ? 'bg-success text-success-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {i <= currentStep ? '✓' : i + 1}
                  </div>
                  <span
                    className={`font-body text-sm ${
                      i <= currentStep ? 'text-foreground font-semibold' : 'text-muted-foreground'
                    }`}
                  >
                    {STEP_LABELS[step]}
                  </span>
                  {i === currentStep && i < STEPS.length - 1 && (
                    <span className="ml-auto text-xs font-body text-accent animate-pulse">Current</span>
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Review Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="mt-6 bg-card rounded-2xl border border-border/50 p-6 shadow-premium text-left"
          >
            <h3 className="font-display text-lg font-semibold text-foreground mb-1">Rate Your Experience</h3>
            <p className="font-body text-xs text-muted-foreground mb-4">Your feedback helps us serve you better</p>

            {reviewSubmitted ? (
              <div className="text-center py-4">
                <div className="flex justify-center gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={24} className={s <= rating ? 'text-accent fill-accent' : 'text-muted'} />
                  ))}
                </div>
                <p className="font-body text-sm text-success font-semibold">Thank you for your review! ✨</p>
              </div>
            ) : (
              <>
                {/* Star Rating */}
                <div className="flex justify-center gap-2 mb-4">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      onClick={() => setRating(s)}
                      onMouseEnter={() => setHoverRating(s)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        size={32}
                        className={`transition-colors ${
                          s <= (hoverRating || rating)
                            ? 'text-accent fill-accent'
                            : 'text-muted-foreground/30'
                        }`}
                      />
                    </button>
                  ))}
                </div>

                {/* Name */}
                <input
                  type="text"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  placeholder="Your name (optional)"
                  maxLength={50}
                  className="w-full px-4 py-2.5 rounded-xl bg-background border border-border font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 mb-3"
                />

                {/* Comment */}
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tell us about your experience..."
                  maxLength={500}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl bg-background border border-border font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 resize-none mb-3"
                />

                <button
                  onClick={handleSubmitReview}
                  disabled={rating === 0 || submittingReview}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-accent-foreground font-body text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Send size={14} />
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </>
            )}
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="mt-8 flex flex-col sm:flex-row gap-3 justify-center"
          >
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-body font-semibold text-sm"
            >
              <Home size={16} /> Back to Home
            </Link>
            {orderId && (
              <a
                href={getOrderConfirmationLink(orderId, 'My order')}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-border text-foreground font-body font-medium text-sm hover:bg-muted transition-colors"
              >
                <MessageCircle size={16} /> WhatsApp Update
              </a>
            )}
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}
