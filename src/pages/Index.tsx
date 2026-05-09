import { motion } from 'framer-motion';
import { ArrowUpRight, Star, Quote, Instagram } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import PageTransition from '@/components/layout/PageTransition';
import { supabase } from '@/integrations/supabase/client';
import heroImg from '@/assets/cafe-hero.jpg';
import ambianceImg from '@/assets/cafe-ambiance.jpg';

const SIGNATURES = [
  { n: '01', name: 'Single-Origin Espresso', notes: 'Cocoa · Brown sugar · Citrus peel', price: '249' },
  { n: '02', name: 'Burnt Honey Latte', notes: 'House-burnt honey, oat milk, sea salt', price: '299' },
  { n: '03', name: 'Sourdough Croissant', notes: 'Cultured butter, 72-hour ferment', price: '199' },
  { n: '04', name: 'Cold Brew Tonic', notes: '18-hour brew, tonic, orange', price: '279' },
];

const STEPS = [
  { k: 'one', title: 'Scan the dot.', body: 'A small QR sticker sits on every table and at the counter. One tap opens the menu.' },
  { k: 'two', title: 'Order from your seat.', body: 'No queue. No catching anyone’s eye. Pay with UPI in about twenty seconds.' },
  { k: 'three', title: 'We call your name.', body: 'A buzz on your phone — pick up at the counter, hot and exactly the way you wrote it.' },
];

export default function Index() {
  const { data: reviews = [] } = useQuery({
    queryKey: ['landing-reviews'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .gte('rating', 4)
        .order('created_at', { ascending: false })
        .limit(6);
      if (error) throw error;
      return data;
    },
  });

  const avg = reviews.length
    ? (reviews.reduce((s: number, r: any) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <PageTransition>
      {/* ============ HERO — editorial split ============ */}
      <section className="relative">
        <div className="grid grid-cols-12 min-h-[92vh]">
          {/* Left — text */}
          <div className="col-span-12 lg:col-span-7 relative px-6 sm:px-10 lg:px-16 pt-20 pb-16 flex flex-col justify-between">
            {/* tiny meta row */}
            <div className="flex items-center gap-4 text-[11px] uppercase tracking-[0.25em] text-muted-foreground font-body">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                Open · 8 AM – 11 PM
              </span>
              <span className="hidden sm:inline">No 24 · Indiranagar, BLR</span>
            </div>

            <div className="my-12 lg:my-0">
              <p className="font-accent text-3xl text-secondary mb-4 -rotate-2 inline-block">
                a little café, run mostly by you.
              </p>
              <h1 className="font-display font-bold text-foreground leading-[0.85] tracking-tight">
                <span className="block text-[18vw] sm:text-[14vw] lg:text-[11vw]">Order it</span>
                <span className="block text-[18vw] sm:text-[14vw] lg:text-[11vw] italic text-gradient-gold -mt-2">your way.</span>
              </h1>
              <p className="font-body text-foreground/70 text-base sm:text-lg mt-8 max-w-md leading-relaxed">
                G-TOWN is a waiter-less café. You pick. You pay. You pick up. We just make
                very, very good coffee — and leave you alone unless you wave.
              </p>
            </div>

            <div className="flex flex-wrap items-end gap-6">
              <Link
                to="/menu"
                className="group inline-flex items-center gap-3 bg-foreground text-background px-7 py-4 font-body font-semibold text-sm tracking-wide hover:bg-primary transition-colors"
              >
                Open the menu
                <ArrowUpRight size={18} className="group-hover:rotate-45 transition-transform" />
              </Link>
              <div className="font-body text-xs text-muted-foreground max-w-[180px] leading-relaxed">
                <span className="text-foreground font-semibold">No app.</span> No download. Just a QR
                and your phone.
              </div>
            </div>
          </div>

          {/* Right — image */}
          <div className="col-span-12 lg:col-span-5 relative bg-primary/5 min-h-[60vh] lg:min-h-full">
            <img
              src={heroImg}
              alt="Barista pouring milk into a latte at G-TOWN café counter"
              className="absolute inset-0 w-full h-full object-cover"
              width={1080}
              height={1920}
            />
            {/* sticker / tape */}
            <div className="absolute top-6 right-6 sm:top-10 sm:right-10 rotate-6 bg-accent text-accent-foreground px-4 py-3 shadow-premium-lg font-body font-bold text-xs uppercase tracking-widest">
              Brewed today
              <div className="font-accent text-2xl normal-case tracking-normal -mt-1">at 6:42 am</div>
            </div>
            {/* corner caption */}
            <div className="absolute bottom-6 left-6 bg-background/90 backdrop-blur-sm px-3 py-2 font-body text-[10px] uppercase tracking-[0.2em] text-foreground">
              cup #00471 / today
            </div>
          </div>
        </div>

        {/* Marquee strip */}
        <div className="border-y border-foreground bg-foreground text-background overflow-hidden">
          <div className="flex gap-12 py-4 whitespace-nowrap animate-[marquee_30s_linear_infinite] font-display italic text-xl sm:text-2xl">
            {Array.from({ length: 8 }).map((_, i) => (
              <span key={i} className="flex items-center gap-12">
                <span>scan.</span>
                <span className="text-accent">·</span>
                <span>sip.</span>
                <span className="text-accent">·</span>
                <span>stay a while.</span>
                <span className="text-accent">·</span>
                <span>no queues.</span>
                <span className="text-accent">·</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ============ HOW IT WORKS — zine style ============ */}
      <section className="px-6 sm:px-10 lg:px-16 py-24 lg:py-32 max-w-7xl mx-auto">
        <div className="grid grid-cols-12 gap-y-12 gap-x-8">
          <div className="col-span-12 lg:col-span-4">
            <p className="font-body text-xs uppercase tracking-[0.3em] text-accent mb-4">
              §01 — How it works
            </p>
            <h2 className="font-display text-5xl lg:text-6xl font-bold text-foreground leading-[0.95]">
              Three taps. <br />
              <span className="italic font-accent text-secondary text-4xl lg:text-5xl">
                that&rsquo;s it, really.
              </span>
            </h2>
          </div>

          <div className="col-span-12 lg:col-span-8 space-y-10">
            {STEPS.map((s, i) => (
              <motion.div
                key={s.k}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="grid grid-cols-12 gap-4 items-baseline border-t border-border pt-6"
              >
                <div className="col-span-2 font-accent text-4xl text-accent">{s.k}.</div>
                <div className="col-span-10 sm:col-span-7">
                  <h3 className="font-display text-2xl font-semibold text-foreground">{s.title}</h3>
                  <p className="font-body text-muted-foreground mt-2">{s.body}</p>
                </div>
                <div className="hidden sm:block col-span-3 font-body text-[10px] uppercase tracking-[0.25em] text-muted-foreground text-right">
                  step {String(i + 1).padStart(2, '0')} / 03
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ SIGNATURES — list, not cards ============ */}
      <section className="bg-primary text-primary-foreground px-6 sm:px-10 lg:px-16 py-24 lg:py-32">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between flex-wrap gap-6 mb-12">
            <div>
              <p className="font-body text-xs uppercase tracking-[0.3em] text-accent mb-3">
                §02 — On the menu
              </p>
              <h2 className="font-display text-5xl lg:text-6xl font-bold leading-[0.95]">
                Things people <br />
                keep coming back for.
              </h2>
            </div>
            <Link
              to="/menu"
              className="font-body text-sm uppercase tracking-widest border-b border-accent pb-1 hover:text-accent transition-colors"
            >
              See the full menu →
            </Link>
          </div>

          <ul className="divide-y divide-primary-foreground/15">
            {SIGNATURES.map((it) => (
              <li
                key={it.n}
                className="grid grid-cols-12 gap-4 py-8 items-center group hover:bg-primary-foreground/5 -mx-4 px-4 transition-colors"
              >
                <span className="col-span-2 sm:col-span-1 font-accent text-2xl text-accent">{it.n}</span>
                <div className="col-span-7 sm:col-span-7">
                  <h3 className="font-display text-2xl sm:text-3xl font-semibold group-hover:italic transition-all">
                    {it.name}
                  </h3>
                  <p className="font-body text-sm text-primary-foreground/60 mt-1">{it.notes}</p>
                </div>
                <span className="col-span-3 sm:col-span-4 text-right font-display text-2xl sm:text-3xl font-bold text-accent tabular-nums">
                  ₹{it.price}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ============ AMBIANCE — image + asymmetric text ============ */}
      <section className="px-6 sm:px-10 lg:px-16 py-24 lg:py-32 max-w-7xl mx-auto">
        <div className="grid grid-cols-12 gap-8 items-center">
          <div className="col-span-12 lg:col-span-7 relative">
            <img
              src={ambianceImg}
              alt="Inside G-TOWN café — exposed brick, hanging plants, warm light, people working"
              loading="lazy"
              width={1024}
              height={1024}
              className="w-full aspect-[4/3] object-cover"
            />
            {/* film-strip caption */}
            <div className="absolute -bottom-4 -left-4 bg-background border border-border px-4 py-2 shadow-premium font-body text-[10px] uppercase tracking-[0.25em]">
              roll 03 · frame 12
            </div>
            <div className="absolute -top-4 -right-4 bg-accent text-accent-foreground w-20 h-20 rounded-full flex items-center justify-center font-display font-bold text-sm rotate-12 shadow-premium-lg">
              wifi <br /> goes brr
            </div>
          </div>

          <div className="col-span-12 lg:col-span-5 lg:pl-8">
            <p className="font-body text-xs uppercase tracking-[0.3em] text-accent mb-4">
              §03 — The room
            </p>
            <h2 className="font-display text-5xl font-bold text-foreground leading-[0.95] mb-6">
              Built like your <br />
              <span className="italic">favourite</span> notebook.
            </h2>
            <p className="font-body text-muted-foreground leading-relaxed mb-8">
              Wood that&rsquo;s been here longer than us. Light that does most of the design work.
              Plants we genuinely water. Chairs you can sit in for four hours and not regret.
            </p>
            <ul className="grid grid-cols-2 gap-y-4 gap-x-6 font-body text-sm">
              {[
                ['42', 'seats inside'],
                ['12', 'plants (alive)'],
                ['1 GBPS', 'wi-fi, free'],
                ['always', 'lo-fi & jazz'],
              ].map(([v, l]) => (
                <li key={l} className="flex items-baseline gap-3">
                  <span className="font-display text-2xl font-bold text-foreground tabular-nums">{v}</span>
                  <span className="text-muted-foreground">{l}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ============ REVIEWS — clipped postcards ============ */}
      {reviews.length > 0 && (
        <section className="bg-muted/40 px-6 sm:px-10 lg:px-16 py-24 lg:py-32">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between flex-wrap gap-6 mb-12">
              <div>
                <p className="font-body text-xs uppercase tracking-[0.3em] text-accent mb-3">
                  §04 — From the table
                </p>
                <h2 className="font-display text-5xl lg:text-6xl font-bold text-foreground leading-[0.95]">
                  What guests <br />
                  scribble back.
                </h2>
              </div>
              {avg && (
                <div className="flex items-center gap-3">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={18}
                        className={s <= Math.round(Number(avg)) ? 'text-accent fill-accent' : 'text-muted-foreground/30'}
                      />
                    ))}
                  </div>
                  <span className="font-display text-2xl font-bold">{avg}</span>
                  <span className="font-body text-sm text-muted-foreground">/ {reviews.length} guests</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reviews.map((r: any, i: number) => (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  style={{ transform: `rotate(${(i % 2 === 0 ? -1 : 1) * 0.6}deg)` }}
                  className="bg-card border border-border p-6 shadow-premium hover:rotate-0 hover:shadow-premium-lg transition-all"
                >
                  <Quote size={24} className="text-accent mb-3" />
                  <div className="flex gap-0.5 mb-3">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={12}
                        className={s <= r.rating ? 'text-accent fill-accent' : 'text-muted-foreground/20'}
                      />
                    ))}
                  </div>
                  {r.comment && (
                    <p className="font-accent text-xl text-foreground/90 mb-4 leading-snug">
                      &ldquo;{r.comment}&rdquo;
                    </p>
                  )}
                  <div className="flex items-center justify-between border-t border-border pt-3">
                    <p className="font-body text-sm font-semibold text-foreground">
                      — {r.customer_name || 'Guest'}
                    </p>
                    <p className="font-body text-[10px] uppercase tracking-widest text-muted-foreground">
                      {new Date(r.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============ FINAL CTA ============ */}
      <section className="px-6 sm:px-10 lg:px-16 py-24 lg:py-32 max-w-7xl mx-auto text-center">
        <p className="font-accent text-3xl text-accent mb-4 -rotate-1 inline-block">come in, hi.</p>
        <h2 className="font-display text-6xl sm:text-7xl lg:text-[10rem] font-bold text-foreground leading-[0.85] tracking-tight">
          your table&rsquo;s <br />
          <span className="italic text-gradient-gold">ready.</span>
        </h2>
        <Link
          to="/menu"
          className="mt-12 inline-flex items-center gap-3 bg-foreground text-background px-8 py-5 font-body font-semibold text-sm uppercase tracking-widest hover:bg-primary transition-colors"
        >
          Start ordering <ArrowUpRight size={18} />
        </Link>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="border-t border-foreground/10 px-6 sm:px-10 lg:px-16 py-12">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 font-body text-sm">
          <div>
            <p className="font-display text-2xl font-bold">G-TOWN</p>
            <p className="font-accent text-base text-secondary -mt-1">café</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-2">Find us</p>
            <p className="text-foreground">No 24, 12th Main</p>
            <p className="text-muted-foreground">Indiranagar, Bangalore</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-2">Hours</p>
            <p className="text-foreground">Every day</p>
            <p className="text-muted-foreground">8 AM – 11 PM</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-2">Say hi</p>
            <a href="https://instagram.com" className="inline-flex items-center gap-2 text-foreground hover:text-accent">
              <Instagram size={14} /> @gtown.cafe
            </a>
          </div>
        </div>
        <p className="max-w-7xl mx-auto mt-12 pt-6 border-t border-border font-body text-[10px] uppercase tracking-[0.3em] text-muted-foreground flex justify-between">
          <span>© {new Date().getFullYear()} G-TOWN</span>
          <span>brewed with care, served by you</span>
        </p>
      </footer>
    </PageTransition>
  );
}
