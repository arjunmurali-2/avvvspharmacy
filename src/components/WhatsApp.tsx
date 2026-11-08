'use client';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CONTACT } from '@/lib/site';
import { ChatIcon } from './Icons';

export function WhatsApp() {
  const path = usePathname();
  // the page address is only known in the browser; render the plain link first so hydration matches
  const [href, setHref] = useState(`https://wa.me/${CONTACT.whatsapp}`);
  useEffect(() => {
    setHref(`https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(`Hello AVVVS, I have a question (${window.location.origin}${path}).`)}`);
  }, [path]);
  return (
    <a className="wa" href={href} target="_blank" rel="noopener noreferrer" aria-label="Ask the pharmacy on WhatsApp">
      <ChatIcon /><span>Ask the pharmacy</span>
    </a>
  );
}
