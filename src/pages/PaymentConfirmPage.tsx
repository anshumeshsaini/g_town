import { useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Upload, CheckCircle, ArrowLeft, AlertCircle } from 'lucide-react';
import PageTransition from '@/components/layout/PageTransition';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function PaymentConfirmPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { orderId, grandTotal, dbOrderId } = (location.state as {
    orderId?: string;
    grandTotal?: number;
    dbOrderId?: string;
  }) || {};

  const [utr, setUtr] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const utrValid = /^[0-9]{12}$/.test(utr);

  const handleFile = useCallback((f: File) => {
    if (f.size > 2 * 1024 * 1024) {
      setError('File must be under 2 MB');
      return;
    }
    if (!f.type.startsWith('image/')) {
      setError('Please upload an image');
      return;
    }
    setError('');
    setFile(f);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(f);
  }, []);

  const handleSubmit = async () => {
    if (!utrValid || !orderId) return;
    setSubmitting(true);

    try {
      let paymentProofUrl: string | null = null;

      // Upload payment proof if provided
      if (file) {
        const ext = file.name.split('.').pop() || 'jpg';
        const filePath = `${orderId}/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from('payment-proofs')
          .upload(filePath, file);
        if (uploadError) throw uploadError;
        paymentProofUrl = filePath;
      }

      // Update the order with UTR and payment proof
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          claimed_utr: utr,
          payment_proof_url: paymentProofUrl,
        })
        .eq('order_id', orderId);

      if (updateError) throw updateError;

      navigate('/order-success', { state: { orderId, grandTotal } });
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Submission failed', description: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  if (!orderId) {
    return (
      <PageTransition>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="font-body text-muted-foreground mb-4">No order found</p>
            <Button onClick={() => navigate('/menu')} variant="outline">Go to Menu</Button>
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
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground font-body text-sm mb-8 transition-colors"
          >
            <ArrowLeft size={16} /> Back
          </button>

          <h1 className="font-display text-3xl font-bold text-foreground mb-2">Confirm Payment</h1>
          <p className="font-body text-muted-foreground mb-8">
            Order <span className="font-semibold text-foreground">{orderId}</span> • ₹{grandTotal?.toFixed(0)}
          </p>

          <div className="mb-6">
            <label className="font-body text-sm font-medium text-foreground mb-2 block">UTR Number (12 digits)</label>
            <input
              type="text"
              maxLength={12}
              value={utr}
              onChange={(e) => setUtr(e.target.value.replace(/\D/g, ''))}
              placeholder="Enter 12-digit UTR"
              className={`w-full px-4 py-3 rounded-xl bg-card border font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-shadow ${
                utr.length === 12 && !utrValid ? 'border-destructive focus:ring-destructive/30' : 'border-border focus:ring-accent/30'
              }`}
            />
            {utr.length > 0 && utr.length < 12 && (
              <p className="text-xs text-muted-foreground mt-1 font-body">{12 - utr.length} digits remaining</p>
            )}
          </div>

          <div className="mb-8">
            <label className="font-body text-sm font-medium text-foreground mb-2 block">Payment Screenshot (optional)</label>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const f = e.dataTransfer.files[0];
                if (f) handleFile(f);
              }}
              className="relative border-2 border-dashed border-border rounded-2xl p-8 text-center hover:border-accent/50 transition-colors cursor-pointer"
              onClick={() => document.getElementById('fileInput')?.click()}
            >
              <input
                id="fileInput"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                }}
              />
              {preview ? (
                <div className="space-y-3">
                  <img src={preview} alt="Payment proof" className="max-h-48 mx-auto rounded-lg" />
                  <p className="font-body text-sm text-success flex items-center justify-center gap-1">
                    <CheckCircle size={14} /> Uploaded
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload size={32} className="mx-auto text-muted-foreground" />
                  <p className="font-body text-sm text-muted-foreground">Drag & drop or click to upload</p>
                  <p className="font-body text-xs text-muted-foreground">Max 2 MB</p>
                </div>
              )}
            </div>
            {error && (
              <p className="text-xs text-destructive mt-2 font-body flex items-center gap-1">
                <AlertCircle size={12} /> {error}
              </p>
            )}
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!utrValid || submitting}
            className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-body font-semibold"
          >
            {submitting ? (
              <motion.span animate={{ opacity: [1, 0.5, 1] }} transition={{ repeat: Infinity, duration: 1 }}>
                Submitting...
              </motion.span>
            ) : (
              'Submit Payment Proof'
            )}
          </Button>
        </div>
      </div>
    </PageTransition>
  );
}
