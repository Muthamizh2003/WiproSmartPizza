export const CardSkeleton = () => (
  <div className="card" style={{ overflow: 'hidden' }}>
    <div className="placeholder" style={{ height: 192, borderRadius: 0 }} />
    <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
      <div className="placeholder" style={{ height: 16, width: '75%' }} />
      <div className="placeholder" style={{ height: 16, width: '50%' }} />
      <div className="placeholder" style={{ height: 16, width: '100%' }} />
      <div className="placeholder" style={{ height: 36, width: '25%', marginTop: '0.5rem', borderRadius: 9999 }} />
    </div>
  </div>
)

export const TableSkeleton = ({ rows = 5 }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <div className="placeholder" style={{ height: 16, flex: 1 }} />
        <div className="placeholder" style={{ height: 16, width: 96 }} />
        <div className="placeholder" style={{ height: 16, width: 128 }} />
      </div>
    ))}
  </div>
)

export const StatsSkeleton = () => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="card">
        <div className="card-body">
          <div className="placeholder" style={{ height: 14, width: '50%', marginBottom: '0.75rem' }} />
          <div className="placeholder" style={{ height: 32, width: '35%' }} />
        </div>
      </div>
    ))}
  </div>
)

export const ProductGridSkeleton = () => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem' }}>
    {Array.from({ length: 8 }).map((_, i) => (
      <div key={i}><CardSkeleton /></div>
    ))}
  </div>
)
