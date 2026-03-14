import { useState, useEffect, useRef } from 'react';
import { Panel, Tag, LiveDot } from '../components/ui';
import { LOG_ITEMS } from '../lib/mockData';

const LEVELS = ['ALL','INFO','OK','WARN','ERROR'];
const LC = { INFO:'var(--c-brand)', OK:'var(--c-green)', WARN:'var(--c-amber)', ERROR:'var(--c-red)', DEBUG:'var(--c-cyan)' };

export default function LogsPage() {
  const [logs, setLogs]     = useState(LOG_ITEMS);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [paused, setPaused] = useState(false);

  useEffect(()=>{
    if (paused) return;
    const t=setInterval(()=>{
      const item=LOG_ITEMS[Math.floor(Math.random()*LOG_ITEMS.length)];
      setLogs(p=>[{...item,id:Date.now(),ts:new Date().toISOString().replace('T',' ').slice(0,23)},...p.slice(0,199)]);
    },1900);
    return()=>clearInterval(t);
  },[paused]);

  const filtered = logs.filter(l=>{
    const ml = filter==='ALL'||l.level===filter;
    const ms = !search||l.msg.toLowerCase().includes(search.toLowerCase());
    return ml&&ms;
  });

  const exportLogs=()=>{
    const txt=filtered.map(l=>`[${l.ts}] ${l.level.padEnd(5)} ${l.msg}`).join('\n');
    const blob=new Blob([txt],{type:'text/plain'});
    const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='kombee-logs.txt';a.click();
  };

  return(
    <div style={{display:'flex',flexDirection:'column',gap:12}}>

      {/* Controls */}
      <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
        <div style={{display:'flex',gap:4}}>
          {LEVELS.map(l=>(
            <button key={l} onClick={()=>setFilter(l)} style={{
              padding:'5px 12px',borderRadius:4,fontSize:10,fontWeight:600,
              fontFamily:'var(--f-mono)',letterSpacing:'0.06em',cursor:'pointer',
              background:filter===l?(LC[l]?LC[l]+'20':'var(--c-bg-3)'):'var(--c-bg-1)',
              border:`1px solid ${filter===l?(LC[l]?LC[l]+'40':'var(--c-line-2)'):'var(--c-line)'}`,
              color:filter===l?(LC[l]||'var(--c-text-1)'):'var(--c-text-3)',
              transition:'all 0.1s',
            }}>
              {l}
            </button>
          ))}
        </div>
        <input className="input" style={{flex:1,maxWidth:280,height:32,fontSize:11}}
          placeholder="Search log messages..." value={search} onChange={e=>setSearch(e.target.value)}/>
        <div style={{marginLeft:'auto',display:'flex',gap:6}}>
          <button className="btn btn-ghost" style={{fontSize:11,padding:'5px 12px'}} onClick={()=>setPaused(p=>!p)}>
            {paused?'▶ Resume':'⏸ Pause'}
          </button>
          <button className="btn btn-ghost" style={{fontSize:11,padding:'5px 12px'}} onClick={exportLogs}>
            ↓ Export
          </button>
        </div>
      </div>

      {/* Log Panel */}
      <Panel>
        <div className="panel-header">
          <div>
            <div className="panel-title">System Log Stream</div>
            <div className="panel-sub">{filtered.length} entries · {filter} filter</div>
          </div>
          {!paused&&<LiveDot/>}
        </div>
        <div className="terminal" style={{borderRadius:0,border:'none',maxHeight:'calc(100vh - 220px)',padding:'8px 16px',background:'var(--c-terminal-bg)'}}>
          {filtered.map(log=>(
            <div key={log.id} style={{
              display:'grid',gridTemplateColumns:'190px 48px 1fr',gap:12,
              padding:'3px 0',borderBottom:'1px solid rgba(255,255,255,0.02)',
              animation:'fadein 0.15s ease both',alignItems:'baseline',
            }}>
              <span style={{fontFamily:'var(--f-mono)',fontSize:10,color:'var(--c-terminal-text)'}}>{log.ts}</span>
              <span style={{fontFamily:'var(--f-mono)',fontSize:10,fontWeight:600,color:LC[log.level]||'var(--c-terminal-text)',letterSpacing:'0.04em'}}>{log.level}</span>
              <span style={{fontSize:11,color:'var(--c-terminal-text)',lineHeight:1.5}}>{log.msg}</span>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}