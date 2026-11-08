export default function Loading() {
  return (
    <div className="wrap" aria-busy="true" aria-label="Loading">
      <div className="head"><div className="skeleton" style={{ height: 14, width: 160 }} /><div className="skeleton" style={{ height: 56, width: 'min(520px, 80%)' }} /></div>
      <ul className="grid" style={{ paddingBottom: 90 }}>
        {Array.from({ length: 8 }, (_, i) => <li key={i} style={{ display: 'grid', gap: 10 }}><div className="skeleton" style={{ aspectRatio: '4 / 5' }} /><div className="skeleton" style={{ height: 16, width: '70%' }} /><div className="skeleton" style={{ height: 14, width: '30%' }} /></li>)}
      </ul>
    </div>
  );
}
