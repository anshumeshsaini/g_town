const WHATSAPP_NUMBER = '919999999999';

export function getWhatsAppLink(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function getHelpLink(): string {
  return getWhatsAppLink('Hi G-TOWN, I need help with my order');
}

export function getOrderConfirmationLink(orderId: string, items: string): string {
  return getWhatsAppLink(
    `Hi G-TOWN! I just placed order ${orderId}. Items: ${items}. Awaiting confirmation.`
  );
}

export function generateOrderId(): string {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const rand = String(Math.floor(Math.random() * 999) + 1).padStart(3, '0');
  return `GT-${yy}${mm}${dd}-${rand}`;
}

export function generateUPIString(amount: number, orderId: string): string {
  const upiId = 'yourupi@okicici';
  const name = 'G-TOWN CAFE';
  return `upi://pay?pa=${upiId}&pn=${encodeURIComponent(name)}&am=${amount}&cu=INR&tn=Order${orderId}`;
}
