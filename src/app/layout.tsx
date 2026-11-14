import type { Metadata, Viewport } from 'next';
import { Noto_Sans_Malayalam } from 'next/font/google';
import localFont from 'next/font/local';
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

// Castle T (URW), self-hosted, the same file as avvvs.com (web/) so the two sites read as one.
// Castle T has no rupee sign, so the variable carries the family alone (no generated fallback face):
// the stacks in tokens.css then hand "₹" and Malayalam to Noto Sans Malayalam, not to a serif.
const castle = localFont({
  src: [{ path: '../fonts/CastleT.woff2', weight: '400', style: 'normal' }],
  variable: '--font-castle', display: 'swap', adjustFontFallback: false,
});
const noto = Noto_Sans_Malayalam({ weight: ['400'], subsets: ['latin', 'malayalam'], variable: '--font-noto-ml', display: 'swap', adjustFontFallback: false });

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

export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover', colorScheme: 'light', themeColor: '#f7f9fc' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={`${castle.variable} ${noto.variable}`} suppressHydrationWarning>
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
