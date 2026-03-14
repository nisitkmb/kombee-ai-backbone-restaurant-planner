import { NavLink } from 'react-router-dom';

const NAV = [
  { group: 'CORE', links: [
    { to: '/dashboard', label: 'Dashboard',      Icon: DashIcon },
    { to: '/backbone',  label: 'AI Backbone',     Icon: BackboneIcon },
    { to: '/chat',      label: 'Inventory Chat',  Icon: ChatIcon, live: true },
  ]},
  { group: 'OBSERVE', links: [
    { to: '/analytics', label: 'Analytics',       Icon: AnalyticsIcon },
    { to: '/models',    label: 'Model Router',    Icon: RouterIcon },
  ]},
  { group: 'SYSTEM', links: [
    { to: '/rag',       label: 'RAG Engine',      Icon: RagIcon },
    { to: '/logs',      label: 'System Logs',     Icon: LogsIcon },
  ]},
];

export default function Sidebar() {
  return (
    <aside className="rail">
      {/* Logo */}
      <div className="rail-logo">
        <div className="rail-logo-mark">K</div>
        <div>
          <div className="rail-logo-name">Kombee AI</div>
          <div className="rail-logo-ver">backbone · v2.0</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
        {NAV.map(({ group, links }) => (
          <div key={group} className="rail-section" style={{ padding: '12px 4px 8px' }}>
            <div className="rail-section-label">{group}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {links.map(({ to, label, Icon, live }) => (
                <NavLink key={to} to={to}
                  className={({ isActive }) => `rail-link${isActive ? ' active' : ''}`}
                >
                  <Icon />
                  <span style={{ flex: 1 }}>{label}</span>
                  {live && <span className="rail-badge">LIVE</span>}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Status */}
      <div className="rail-status">
        <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--c-text-4)', marginBottom: 6 }}>
          Services
        </div>
        {[
          { label: 'Groq · Llama 3.3', ok: true },
          { label: 'FAISS · 12,430 vec', ok: true },
          { label: 'PostgreSQL · 50K', ok: true },
        ].map(s => (
          <div key={s.label} className="rail-status-row">
            <span className={`dot ${s.ok ? 'dot-green' : 'dot-red'}`} />
            {s.label}
          </div>
        ))}
      </div>
    </aside>
  );
}

/* ── SVG Icons ── */
function DashIcon() {
  return <svg className="rail-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
    <rect x="2" y="2" width="5" height="5" rx="1"/><rect x="9" y="2" width="5" height="5" rx="1"/>
    <rect x="2" y="9" width="5" height="5" rx="1"/><rect x="9" y="9" width="5" height="5" rx="1"/>
  </svg>;
}
function BackboneIcon() {
  return <svg className="rail-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
    <circle cx="8" cy="8" r="2"/><path d="M8 2v2M8 12v2M2 8h2M12 8h2"/>
    <path d="m3.5 3.5 1.4 1.4M11.1 11.1l1.4 1.4M11.1 4.9l1.4-1.4M3.5 12.5l1.4-1.4"/>
  </svg>;
}
function ChatIcon() {
  return <svg className="rail-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
    <path d="M14 9.33A5.33 5.33 0 0 1 8 14H3l1-2A5.33 5.33 0 1 1 14 9.33z"/>
  </svg>;
}
function AnalyticsIcon() {
  return <svg className="rail-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
    <polyline points="2,12 5,8 8,10 11,5 14,7"/>
    <line x1="2" y1="14" x2="14" y2="14"/>
  </svg>;
}
function RouterIcon() {
  return <svg className="rail-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
    <path d="M2 8h12M8 2l4 6-4 6"/>
    <circle cx="3" cy="8" r="1.5"/><circle cx="13" cy="8" r="1.5"/>
  </svg>;
}
function RagIcon() {
  return <svg className="rail-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
    <ellipse cx="8" cy="4" rx="5" ry="2"/>
    <path d="M3 4v4c0 1.1 2.24 2 5 2s5-.9 5-2V4"/>
    <path d="M3 8v4c0 1.1 2.24 2 5 2s5-.9 5-2V8"/>
  </svg>;
}
function LogsIcon() {
  return <svg className="rail-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
    <path d="M4 2h6l3 3v9H4z"/><path d="M10 2v3h3"/>
    <line x1="6" y1="7" x2="11" y2="7"/><line x1="6" y1="10" x2="11" y2="10"/>
  </svg>;
}