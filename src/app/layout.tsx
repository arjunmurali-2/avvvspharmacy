import type { Metadata, Viewport } from 'next';
import { Gloock, Noto_Sans_Malayalam } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { StoreProvider } from '@/components/StoreProvider';
import { CartDrawer } from '@/components/Cart';
import { CookieConsent } from '@/components/CookieConsent';
import { Analytics } from '@/components/Analytics';
import { WhatsApp } from '@/components/WhatsApp';
import { JsonLd } from '@/components/JsonLd';
import { ANIM_BOOT, Motion } from '@/components/Motion';
import { SITE_URL, ORG, organizationLd } from '@/lib/site';

const gloock = Gloock({ weight: '400', subsets: ['latin'], variable: '--font-gloock', display: 'swap' });
const noto = Noto_Sans_Malayalam({ weight: ['400', '500', '600'], subsets: ['latin', 'malayalam'], variable: '--font-noto-ml', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: 'AVVVS Ayur Store · Ayurveda medicines online from Kozhikode', template: '%s · AVVVS Ayur Store' },
  description: `Buy authentic Ayurveda medicines online from ${ORG.name} (AVVVS), Kozhikode, since ${ORG.founded}: kashayam, arishtam, thailam, choornam, lehyam and more, made in our own GMP-certified factory.`,
  applicationName: 'AVVVS Ayur Store',
  alternates: { canonical: '/' },
  formatDetection: { telephone: false, address: false, email: false },
  openGraph: { type: 'website', siteName: 'AVVVS Ayur Store', locale: 'en_IN', url: '/' },
  twitter: { card: 'summary_large_image', site: '@avvvsglobal' },
  icons: { icon: '/brand/avvvs-mark.svg' },
  verification: { google: process.env.NEXT_PUBLIC_GSC_VERIFICATION || undefined },
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover', colorScheme: 'light', themeColor: '#F4EFE5' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={`${gloock.variable} ${noto.variable}`} suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: ANIM_BOOT }} /></head>
      <body suppressHydrationWarning>
        <a href="#main" className="skip">Skip to content</a>
        <StoreProvider>
          <Motion>
          <Header />
          <main id="main">{children}</main>
          <Footer />
          <CartDrawer />
          <WhatsApp />
          </Motion>
        </StoreProvider>
        <CookieConsent />
        <Analytics />
        <JsonLd data={organizationLd()} />
      </body>
    </html>
  );
}
