// ModelRouterPage.jsx
import { useState, useEffect } from 'react';
import { Panel, Tag, MiniBar, LiveDot } from '../components/ui';
import { ROUTING_LOG_ITEMS } from '../lib/mockData';

const MODELS = [
  { name:'Gemini 2.0 Flash', id:'gemini-2.0-flash',  role:'FREE TIER',   load:68,  active:true,  c:'var(--c-brand)' },
  { name:'GPT o1-preview',   id:'o1-preview',         role:'REASONING',   load:null,active:false, c:'var(--c-cyan)' },
  { name:'Claude Haiku 3.5', id:'claude-haiku-3-5',   role:'LIGHTWEIGHT', load:null,active:false, c:'var(--c-green)' },
  { name:'Codestral',        id:'codestral',           role:'CODING',      load:null,active:false, c:'var(--c-amber)' },
  { name:'GPT-4o mini',      id:'gpt-4o-mini',         role:'CHEAP',       load:null,active:false, c:'var(--c-red)' },
  { name:'Llama 3.3 70B',    id:'llama-3.3-70b',       role:'OSS',         load:null,active:false, c:'var(--c-violet)' },
];

export default function ModelRouterPage() {
  const [log, setLog] = useState(ROUTING_LOG_ITEMS.slice(0,10));
  useEffect(()=>{
    const t=setInterval(()=>{
      const item=ROUTING_LOG_ITEMS[Math.floor(Math.random()*ROUTING_LOG_ITEMS.length)];
      setLog(p=>[{...item,id:Date.now(),time:new Date().toLocaleTimeString('en-GB',{hour12:false})},...p.slice(0,14)]);
    },3000);
    return ()=>clearInterval(t);
  },[]);

  const dist=[{l:'Gemini 2.0',v:78,c:'var(--c-brand)'},{l:'Cache Hit',v:16,c:'var(--c-green)'},{l:'RAG Only',v:6,c:'var(--c-violet)'}];
  const r=40,cx=50,cy=50,sw=14,circ=2*Math.PI*r; let off=0;

  return(
    <div style={{display:'flex',flexDirection:'column',gap:12}}>

      {/* Model Grid */}
      <Panel>
        <div className="panel-header">
          <div><div className="panel-title">Registered Models</div><div className="panel-sub">1 active · 5 commented (free tier constraint)</div></div>
          <Tag variant="green">1 active</Tag>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8,padding:'12px'}}>
          {MODELS.map((m,i)=>(
            <div key={m.id} className={`model-card${m.active?' active-model':''}`}
              style={{animation:`fadeSlide 0.3s ease ${i*50}ms both`}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8}}>
                <div>
                  <div style={{fontWeight:600,fontSize:12,color:'var(--c-text-1)'}}>{m.name}</div>
                  <div style={{fontFamily:'var(--f-mono)',fontSize:9,color:m.c,marginTop:1}}>{m.id}</div>
                </div>
                {m.active?<span className="dot dot-green"/>:<span style={{fontSize:9,fontFamily:'var(--f-mono)',color:'var(--c-text-4)'}}>--</span>}
              </div>
              <div style={{fontFamily:'var(--f-mono)',fontSize:9,fontWeight:600,letterSpacing:'0.08em',color:m.active?m.c:'var(--c-text-4)',textTransform:'uppercase',marginBottom:8}}>
                {m.active?`ACTIVE · ${m.role}`:`COMMENTED · ${m.role}`}
              </div>
              {m.load!==null?(
                <div>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                    <span style={{fontSize:10,color:'var(--c-text-3)'}}>Load</span>
                    <span style={{fontFamily:'var(--f-mono)',fontSize:10,color:m.c}}>{m.load}%</span>
                  </div>
                  <MiniBar value={m.load} color={m.c}/>
                </div>
              ):<div className="bar-track"/>}
            </div>
          ))}
        </div>
      </Panel>

      {/* Log + Donut */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 260px',gap:12}}>
        <Panel>
          <div className="panel-header">
            <div><div className="panel-title">Routing Decision Log</div><div className="panel-sub">Real-time model selection trace</div></div>
            <LiveDot/>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'80px 150px 70px 1fr 70px 60px',padding:'7px 14px',borderBottom:'1px solid var(--c-line)',gap:10}}>
            {['TIME','TASK','SCORE','ROUTED TO','TOKENS','STATUS'].map(h=>(
              <span key={h} style={{fontFamily:'var(--f-mono)',fontSize:9,fontWeight:600,letterSpacing:'0.07em',color:'var(--c-text-4)',textTransform:'uppercase'}}>{h}</span>
            ))}
          </div>
          <div style={{maxHeight:360,overflowY:'auto'}} className="scroll-y">
            {log.map(item=>(
              <div key={item.id} style={{
                display:'grid',gridTemplateColumns:'80px 150px 70px 1fr 70px 60px',
                padding:'9px 14px',gap:10,alignItems:'center',
                borderBottom:'1px solid var(--c-line)',transition:'background 0.1s',
                animation:'fadeSlide 0.2s ease both',
              }}
                onMouseEnter={e=>e.currentTarget.style.background='var(--c-bg-3)'}
                onMouseLeave={e=>e.currentTarget.style.background=''}>
                <span style={{fontFamily:'var(--f-mono)',fontSize:10,color:'var(--c-text-4)'}}>{item.time}</span>
                <span style={{fontSize:11,color:'var(--c-text-2)',fontWeight:500}}>{item.task}</span>
                <span style={{fontFamily:'var(--f-mono)',fontSize:10,color:'var(--c-brand)'}}>{item.score}</span>
                <span style={{fontFamily:'var(--f-mono)',fontSize:10,color:'var(--c-cyan)'}}>{item.model}</span>
                <span style={{fontFamily:'var(--f-mono)',fontSize:10,color:'var(--c-text-3)'}}>{item.tokens}</span>
                <Tag variant={item.status==='PASS'?'green':'amber'}>{item.status}</Tag>
              </div>
            ))}
          </div>
        </Panel>

        <Panel>
          <div className="panel-header"><div><div className="panel-title">Routing Distribution</div><div className="panel-sub">Traffic split</div></div></div>
          <div className="panel-body" style={{display:'flex',flexDirection:'column',alignItems:'center',gap:16}}>
            <svg width={100} height={100} viewBox="0 0 100 100">
              <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--c-line)" strokeWidth={sw}/>
              {dist.map((d,i)=>{
                const dash=(d.v/100)*circ,gap=circ-dash;
                const el=<circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={d.c} strokeWidth={sw}
                  strokeDasharray={`${dash} ${gap}`} strokeDashoffset={-off}
                  style={{transform:'rotate(-90deg)',transformOrigin:`${cx}px ${cy}px`}}/>;
                off+=dash; return el;
              })}
              <text x={cx} y={cy-4} textAnchor="middle" fontSize="14" fontWeight="700" fill="var(--c-text-1)" fontFamily="'Geist',sans-serif">78%</text>
              <text x={cx} y={cy+9} textAnchor="middle" fontSize="7" fill="var(--c-text-3)" fontFamily="'Geist Mono',monospace">GEMINI</text>
            </svg>
            <div style={{width:'100%',display:'flex',flexDirection:'column',gap:8}}>
              {dist.map(d=>(
                <div key={d.l} style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                  <div style={{display:'flex',alignItems:'center',gap:6}}>
                    <span style={{width:8,height:8,borderRadius:2,background:d.c}}/><span style={{fontSize:11,color:'var(--c-text-2)'}}>{d.l}</span>
                  </div>
                  <span style={{fontFamily:'var(--f-mono)',fontSize:10,color:'var(--c-text-3)'}}>{d.v}%</span>
                </div>
              ))}
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}