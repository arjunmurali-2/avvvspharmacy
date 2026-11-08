import Link from 'next/link';
export function Crumbs({ trail }: { trail: { name: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="crumbs">
        <li><Link href="/">Store</Link></li>
        {trail.map((t, i) => (
          <li key={i}>{t.href && i < trail.length - 1 ? <Link href={t.href}>{t.name}</Link> : <span aria-current={i === trail.length - 1 ? 'page' : undefined}>{t.name}</span>}</li>
        ))}
      </ol>
    </nav>
  );
}
