import { MessageCircle } from 'lucide-react';
import { getHelpLink } from '@/lib/whatsapp';

export default function FloatingWhatsApp() {
  return (
    <a
      href={getHelpLink()}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 group"
      aria-label="Chat with us on WhatsApp"
    >
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-success animate-ping opacity-20" />
        <div className="relative flex items-center justify-center w-14 h-14 rounded-full bg-success text-success-foreground shadow-premium-lg transition-transform duration-200 group-hover:scale-110">
          <MessageCircle size={26} />
        </div>
      </div>
      <span className="absolute bottom-full right-0 mb-2 px-3 py-1.5 rounded-lg bg-foreground text-background text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        Chat with us
      </span>
    </a>
  );
}
