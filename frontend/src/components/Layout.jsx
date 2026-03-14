import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';

const META = {
  '/dashboard': { title: 'Dashboard',      path: 'kombee-ai / dashboard' },
  '/backbone':  { title: 'AI Backbone',     path: 'kombee-ai / backbone' },
  '/chat':      { title: 'Inventory Chat',  path: 'kombee-ai / chat' },
  '/analytics': { title: 'Analytics',       path: 'kombee-ai / analytics' },
  '/models':    { title: 'Model Router',    path: 'kombee-ai / models' },
  '/rag':       { title: 'RAG Engine',      path: 'kombee-ai / rag' },
  '/logs':      { title: 'System Logs',     path: 'kombee-ai / logs' },
};

export default function Layout() {
  const { pathname } = useLocation();
  const nav = useNavigate();
  const meta = META[pathname] || { title: 'Kombee AI', path: 'kombee-ai' };
  const parts = meta.path.split(' / ');

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="canvas">
        {/* Topbar */}
        <header className="topbar">
          <div className="topbar-breadcrumb">
            {parts.map((p, i) => (
              <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {i > 0 && <span className="sep">/</span>}
                <span className={i === parts.length - 1 ? 'current' : ''} 
                      style={i === parts.length - 1 ? 
                        { fontSize: '20px', fontWeight: 600, color: 'var(--c-text-1)' } : 
                        { fontSize: '14px', fontWeight: 400, color: 'var(--c-text-4)' }
                      }>
                  {p}
                </span>
              </span>
            ))}
          </div>
          <div className="topbar-right">
            <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--c-text-4)' }}>
              {new Date().toLocaleTimeString('en-GB', { hour12: false })}
            </div>
            <div className="sys-status">
              <span className="dot dot-green" /> Nominal
            </div>
            {pathname === '/chat' && (
              <button className="btn btn-primary" style={{ fontSize: 11, padding: '5px 12px' }}
                onClick={() => window.dispatchEvent(new CustomEvent('gen-cart'))}>
                Generate Cart
              </button>
            )}
          </div>
        </header>

        {/* Page */}
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}