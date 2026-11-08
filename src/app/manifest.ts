import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'AVVVS Ayur Store',
    short_name: 'Ayur Store',
    description: 'Ayurveda medicines from AVVVS, Kozhikode, since 1921.',
    start_url: '/',
    display: 'standalone',
    background_color: '#F4EFE5',
    theme_color: '#F4EFE5',
    icons: [{ src: '/brand/avvvs-mark.svg', sizes: 'any', type: 'image/svg+xml' }],
  };
}
