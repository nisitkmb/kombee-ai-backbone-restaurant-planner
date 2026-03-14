export function Panel({ children, style = {}, className = '' }) {
  return <div className={`panel ${className}`} style={style}>{children}</div>;
}

export function PanelHeader({ title, meta, right }) {
  return (
    <div className="panel-header" style={{ borderBottom: '1px solid var(--c-line)', paddingBottom: '12px' }}>
      <div>
        <div className="panel-title">{title}</div>
        {meta && <div className="panel-sub">{meta}</div>}
      </div>
      {right && <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>{right}</div>}
    </div>
  );
}

export function StatBlock({ label, value, delta, dir = 'up', accent, icon, delay = 0, style = {} }) {
  const accentStyle = accent ? { borderTop: `3px solid ${accent}` } : {};
  return (
    <div className="stat-block" style={{ animationDelay: `${delay}ms`, ...accentStyle, ...style }}>
      <div className="stat-label">
        <span>{label}</span>
        {icon && (
          <div style={{ 
            background: accent ? accent + '15' : 'var(--c-bg-4)', 
            borderRadius: '6px', 
            padding: '6px', 
            color: accent || 'var(--c-text-4)', 
            fontSize: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {icon}
          </div>
        )}
      </div>
      <div className="stat-value" style={{ fontSize: '36px', fontWeight: 700, marginTop: '4px' }}>{value}</div>
      {delta && <div className={`stat-delta ${dir}`} style={{ fontSize: '13px', color: 'var(--c-text-3)', marginTop: '2px' }}>{dir === 'up' ? '↑' : '↓'} {delta}</div>}
    </div>
  );
}

export function Tag({ children, variant = 'dim' }) {
  return <span className={`tag tag-${variant}`}>{children}</span>;
}

export function LiveDot() {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, fontFamily: 'var(--f-mono)', color: 'var(--c-green)' }}>
      <span className="dot dot-green" /> LIVE
    </span>
  );
}

export function SectionHead({ title, meta, right }) {
  return (
    <div className="sec-head">
      <div>
        <div className="sec-title">{title}</div>
        {meta && <div className="sec-meta">{meta}</div>}
      </div>
      {right}
    </div>
  );
}

export function MiniBar({ value, max = 100, color = 'var(--c-brand)' }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="bar-track" style={{ width: '100%', height: '6px', borderRadius: '3px' }}>
      <div className="bar-fill" style={{ width: `${pct}%`, background: color, height: '6px', borderRadius: '3px' }} />
    </div>
  );
}