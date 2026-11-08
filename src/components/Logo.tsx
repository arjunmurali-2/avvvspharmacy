/* eslint-disable @next/next/no-img-element */
// AVVVS's own marks, copied from web/public/brand. Shown in their true colours; never recoloured.
const LOCKUP = { src: '/brand/avvvs-since-1921.svg', w: 572.99, h: 126.77 };
export function AvvvsLockup({ height, className, alt = 'AVVVS, since 1921. Arya Vaidya Vilasini Vaidyasala' }: { height: number; className?: string; alt?: string }) {
  return <img src={LOCKUP.src} alt={alt} height={height} width={Math.round((height * LOCKUP.w) / LOCKUP.h)} className={className} />;
}
