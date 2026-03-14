import { useState, useEffect } from 'react';
import { Panel, PanelHeader, MiniBar, Tag } from '../components/ui';

const TERM_LINES = [
  { l:'info', m:'FAISS index initialized · PersistentStore' },
  { l:'ok',   m:"Collection 'menu_docs' ready · 8,240 vectors" },
  { l:'ok',   m:"Collection 'ingredient_kb' ready · 3,190 vectors" },
  { l:'info', m:'Embedding model: text-embedding-004 · 768-dim' },
  { l:'ok',   m:'RAG pipeline active · k=5 · cosine similarity' },
];

const QUERIES = [
  { q:'What ingredients are in Paneer Tikka Masala?', coll:'menu_docs',    score:'0.912', k:5, ms:'21ms' },
  { q:'List all dishes containing tomatoes',           coll:'menu_docs',    score:'0.887', k:5, ms:'18ms' },
  { q:'Monthly order frequency for onions',            coll:'ingredient_kb',score:'0.843', k:4, ms:'31ms' },
  { q:'Seasonal demand for rice in summer',            coll:'ingredient_kb',score:'0.821', k:5, ms:'24ms' },
  { q:'Average daily usage of cooking oil',            coll:'ingredient_kb',score:'0.798', k:3, ms:'19ms' },
];

export default function RAGPage() {
  const [lines, setLines] = useState([]);
  const [cursor, setCursor] = useState(true);

  useEffect(()=>{
    TERM_LINES.forEach((l,i)=>setTimeout(()=>setLines(p=>[...p,l]),i*450));
    const t=setInterval(()=>setCursor(p=>!p),550);
    return()=>clearInterval(t);
  },[]);

  return(
    <div style={{display:'flex',flexDirection:'column',gap:12}}>

      <div className="grid-2" style={{gap:12}}>
        {/* Terminal */}
        <Panel>
          <div className="panel-header">
            <div><div className="panel-title">Ingestion Pipeline</div><div className="panel-sub">Document → Embed → Store</div></div>
            <Tag variant="green">Ready</Tag>
          </div>
          <div className="panel-body-sm">
            <div className="terminal" style={{minHeight:160}}>
              {lines.map((l,i)=>(
                <div key={i} style={{animation:'fadein 0.3s ease both'}}>
                  <span className="t-ts">[{new Date().toLocaleTimeString('en-GB',{hour12:false})}] </span>
                  <span className={l.l==='ok'?'t-ok':l.l==='warn'?'t-warn':'t-info'}>{l.l.toUpperCase()} </span>
                  <span className="t-hi">{l.m}</span>
                </div>
              ))}
              {lines.length>=TERM_LINES.length&&(
                <div style={{marginTop:2}}>
                  <span className="t-dim">$ </span>
                  <span className="t-info">awaiting document</span>
                  <span className="t-cursor" style={{opacity:cursor?1:0}}/>
                </div>
              )}
            </div>
          </div>
        </Panel>

        {/* Stats */}
        <Panel>
          <div className="panel-header"><div><div className="panel-title">Retrieval Performance</div><div className="panel-sub">Vector search metrics</div></div></div>
          <div className="panel-body-sm">
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:16}}>
              {[{v:'23ms',l:'AVG QUERY',c:'var(--c-brand)'},{v:'94.2%',l:'RELEVANCE',c:'var(--c-green)'},{v:'k=5',l:'TOP-K',c:'var(--c-violet)'},{v:'768',l:'DIMENSIONS',c:'var(--c-amber)'}].map(s=>(
                <div key={s.l} style={{padding:'10px',borderRadius:4,background:'var(--c-bg-3)',border:'1px solid var(--c-line)',textAlign:'center'}}>
                  <div style={{fontFamily:'var(--f-sans)',fontSize:20,fontWeight:700,color:s.c}}>{s.v}</div>
                  <div style={{fontFamily:'var(--f-mono)',fontSize:8,color:'var(--c-text-4)',textTransform:'uppercase',letterSpacing:'0.07em',marginTop:3}}>{s.l}</div>
                </div>
              ))}
            </div>
            {[{n:'menu_docs',v:8240,p:66,c:'var(--c-brand)'},{n:'ingredient_kb',v:3190,p:26,c:'var(--c-green)'},{n:'seasonal_data',v:1000,p:8,c:'var(--c-amber)'}].map(c=>(
              <div key={c.n} style={{marginBottom:10}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                  <span style={{fontFamily:'var(--f-mono)',fontSize:10,color:'var(--c-text-2)'}}>{c.n}</span>
                  <span style={{fontFamily:'var(--f-mono)',fontSize:10,color:'var(--c-text-4)'}}>{c.v.toLocaleString()} vec</span>
                </div>
                <MiniBar value={c.p} color={c.c}/>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      {/* Query Table */}
      <Panel>
        <div className="panel-header"><div><div className="panel-title">Recent Retrieval Queries</div><div className="panel-sub">Last 10 vector search operations</div></div></div>
        <table className="dt">
          <thead><tr><th>QUERY</th><th>COLLECTION</th><th>TOP SCORE</th><th>K</th><th>LATENCY</th></tr></thead>
          <tbody>
            {QUERIES.map((q,i)=>(
              <tr key={i} style={{animation:`fadeSlide 0.3s ease ${i*60}ms both`}}>
                <td style={{color:'var(--c-text-1)',maxWidth:360}}>{q.q}</td>
                <td><Tag variant="blue">{q.coll}</Tag></td>
                <td><span className="mono text-green">{q.score}</span></td>
                <td><span className="mono">{q.k}</span></td>
                <td><span className="mono text-cyan">{q.ms}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </div>
  );
}