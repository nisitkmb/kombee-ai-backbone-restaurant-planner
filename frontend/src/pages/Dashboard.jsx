import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { StatBlock, Panel, PanelHeader, Tag, LiveDot, MiniBar } from '../components/ui';
import { FEED_ITEMS } from '../lib/mockData';

const LAYERS = [
  { n:'01', label:'Use Case Classifier',    sub:'NLP intent detection',            lat:'12ms', active:true },
  { n:'02', label:'Task Complexity Engine', sub:'Token + semantic scoring (0–1)',   lat:'5ms'  },
  { n:'03', label:'Cost Policy Engine',     sub:'Daily budget gate',               lat:'3ms'  },
  { n:'04', label:'Risk & Compliance',      sub:'PII detection + safety filters',  lat:'8ms'  },
  { n:'05', label:'Context Builder',        sub:'RAG chunk injection + assembly',  lat:'45ms' },
  { n:'06', label:'Model Router',           sub:'Complexity → model selection',    lat:'2ms'  },
];

const GUARDS = [
  { name:'JSON Validator',       rate: 96.1 },
  { name:'Code Linter',          rate: 98.8 },
  { name:'Hallucination Detect', rate: 98.7 },
  { name:'Tool Call Validator',  rate: 99.5 },
  { name:'Self-Heal Loop (≤2)',  rate: 93.6 },
];

export default function Dashboard() {
  const [feed, setFeed] = useState(FEED_ITEMS.slice(0, 10));
  const nav = useNavigate();

  useEffect(() => {
    const t = setInterval(() => {
      const item = FEED_ITEMS[Math.floor(Math.random() * FEED_ITEMS.length)];
      setFeed(prev => [{ ...item, id: Date.now(), ts: new Date().toLocaleTimeString('en-GB',{hour12:false}) }, ...prev.slice(0,11)]);
    }, 2600);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

      {/* KPI Row */}
      <div className="grid-4">
        <StatBlock label="Total Requests" value="24,831" delta="12.4% vs yesterday" dir="up" accent="var(--c-brand)" delay={0}
          icon="⚡" style={{borderTop: '2px solid #6366F1'}} />
        <StatBlock label="Avg Latency"    value="847ms"  delta="6.2% improved"      dir="up" accent="var(--c-cyan)"  delay={50}
          icon="⏱" style={{borderTop: '2px solid #3B82F6'}} />
        <StatBlock label="API Cost (USD)" value="$0.00"  delta="Free tier active"   dir="up" accent="var(--c-green)" delay={100}
          icon="$" style={{borderTop: '2px solid #10B981'}} />
        <StatBlock label="Validation Failures" value="23" delta="8 self-healed"    dir="up" accent="var(--c-amber)" delay={150}
          icon="⚠" style={{borderTop: '2px solid #F59E0B'}} />
      </div>

      {/* Main row */}
      <div className="grid-2-1" style={{ gap: 12 }}>

        {/* Pipeline + Guards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Architecture Panel */}
          <Panel>
            <PanelHeader title="Backbone Architecture" meta="AI Orchestrator Core — 6 active layers"
              right={<LiveDot />} />
            <div>
              {LAYERS.map((l, i) => (
                <div key={l.n} className={`pipe-row${l.active ? ' active' : ''}`}
                  style={{ 
                    animationDelay: `${i * 40}ms`, 
                    animation: 'fadeSlide 0.3s ease both',
                    cursor: 'pointer',
                    transition: 'background 0.2s ease'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
                  onMouseLeave={e => e.currentTarget.style.background = l.active ? 'rgba(99,102,241,0.05)' : ''}
                >
                  <div className={`pipe-num${l.active ? ' running' : ''}`} style={{
                    background: l.active ? '#EEF2FF' : 'var(--c-bg-4)',
                    color: l.active ? '#4338CA' : 'var(--c-text-3)',
                    borderRadius: '12px',
                    padding: '4px 8px',
                    minWidth: '24px'
                  }}>{l.n}</div>
                  <div style={{ flex: 1 }}>
                    <div className="pipe-label">{l.label}</div>
                    <div className="pipe-sub">{l.sub}</div>
                  </div>
                  <Tag variant="green" style={{
                    backgroundColor: '#DCFCE7',
                    color: '#15803D',
                    border: 'none',
                    fontWeight: 600,
                    fontSize: '11px',
                    padding: '2px 8px',
                    borderRadius: '20px'
                  }}>LIVE</Tag>
                  <span className="pipe-lat">{l.lat}</span>
                </div>
              ))}
            </div>
            {/* Guardrail footer */}
            <div style={{ padding: '12px 20px', borderTop: '1px solid var(--c-line)', background: 'var(--c-bg-3)', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 11, fontFamily: 'var(--f-sans)', color: '#CA8A04', fontWeight: 600, letterSpacing: '0.04em' }}>GUARDRAILS</span>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {['{} JSON',  '</> Linter', '⊘ Hallucination', '⚙ Tool Call', '↺ Self-Heal'].map(g => (
                  <span key={g} style={{ 
                    fontSize: 10, 
                    padding: '4px 12px', 
                    borderRadius: 20, 
                    background: 'var(--c-bg-1)', 
                    border: '1px solid var(--c-line)', 
                    color: 'var(--c-text-3)', 
                    fontFamily: 'var(--f-sans)',
                    fontWeight: 500
                  }}>{g}</span>
                ))}
              </div>
              <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--c-green)', fontFamily: 'var(--f-sans)', fontWeight: 600 }}>→ OUTPUT</span>
            </div>
          </Panel>

          {/* Guard pass rates */}
          <Panel>
            <PanelHeader title="Guardrail Pass Rates" meta="Last 24h · 530 checks total"
              right={<span style={{ fontSize: 10, fontFamily: 'var(--f-mono)', color: 'var(--c-amber)' }}>Self-Heal ON</span>} />
            <div className="panel-body-sm">
              {GUARDS.map((g, i) => (
                <div key={g.name} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}
                  className={`anim-${(i%4)+1}`} >
                  <span style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--c-text-2)', width: 160, flexShrink: 0 }}>{g.name}</span>
                  <div style={{ flex: 1 }}>
                    <MiniBar value={g.rate} color={g.rate > 95 ? 'var(--c-green)' : 'var(--c-amber)'} />
                  </div>
                  <span style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: g.rate > 95 ? 'var(--c-green)' : 'var(--c-amber)', width: 40, textAlign: 'right' }}>{g.rate}%</span>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        {/* Live Feed */}
        <Panel style={{ display: 'flex', flexDirection: 'column' }}>
          <PanelHeader title="Live Request Feed"
            meta="Real-time pipeline trace"
            right={<LiveDot />} />
          <div className="scroll-y" style={{ flex: 1, maxHeight: 520 }}>
            {feed.map(item => (
              <div key={item.id} className="feed-row">
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, paddingTop: 2 }}>
                  <span className={`dot ${item.status === 'PASS' ? 'dot-green' : item.status === 'HEAL' ? 'dot-amber' : 'dot-red'}`} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 500, fontSize: 12, color: 'var(--c-text-1)' }}>{item.task}</div>
                  <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--c-text-3)', marginTop: 2 }}>
                    {item.tokens} tok · {item.latency}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                  <Tag variant={item.status === 'PASS' ? 'green' : item.status === 'HEAL' ? 'amber' : 'red'}
                       style={{
                         backgroundColor: item.status === 'PASS' ? '#DCFCE7' : item.status === 'HEAL' ? '#FEF9C3' : '#DC2626',
                         color: item.status === 'PASS' ? '#15803D' : item.status === 'HEAL' ? '#A16207' : 'white',
                         border: 'none',
                         fontWeight: 600,
                         fontSize: '11px',
                         padding: '2px 8px',
                         borderRadius: '20px'
                       }}>
                    {item.status}
                  </Tag>
                  <span style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'var(--c-text-4)' }}>{item.ts}</span>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      {/* Bottom — charts row */}
      <div className="grid-3" style={{ gap: 12 }}>
        <Panel>
          <PanelHeader title="Request Volume (24h)" meta="req/hour" />
          <div className="panel-body-sm">
            <RequestChart />
          </div>
        </Panel>
        <Panel>
          <PanelHeader title="Model Distribution" meta="Routing split" />
          <div className="panel-body">
            <ModelSplit />
          </div>
        </Panel>
        <Panel>
          <PanelHeader title="Task Breakdown" meta="By use-case type" />
          <div className="panel-body-sm">
            <TaskBreakdown />
          </div>
        </Panel>
      </div>

      {/* CTA strip */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 20px', borderRadius: 6,
        background: 'rgba(99,102,241,0.06)',
        border: '1px solid rgba(99,102,241,0.18)',
      }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--c-text-1)' }}>Start inventory planning</div>
          <div style={{ fontSize: 11, color: 'var(--c-text-3)', marginTop: 2 }}>Upload a restaurant menu PDF to generate AI-powered ingredient predictions</div>
        </div>
        <button className="btn btn-primary" onClick={() => nav('/chat')}>Open Inventory Chat →</button>
      </div>
    </div>
  );
}

function RequestChart() {
  const pts = [320,580,820,650,420,740,900,680,510,760,850,620,480,700,930,700,560,810,760,680,590,870,940,820];
  const W = 340, H = 64;
  const max = Math.max(...pts), min = Math.min(...pts);
  const path = pts.map((v,i) => {
    const x = (i/(pts.length-1))*W;
    const y = H - ((v-min)/(max-min))*H;
    return `${i===0?'M':'L'}${x},${y}`;
  }).join(' ');
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H+16}`} style={{overflow:'visible'}}>
      <defs>
        <linearGradient id="rg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--c-brand)" stopOpacity="0.2"/>
          <stop offset="100%" stopColor="var(--c-brand)" stopOpacity="0"/>
        </linearGradient>
      </defs>
      {[0.25,0.5,0.75].map(v=>(
        <line key={v} x1="0" y1={H*(1-v)} x2={W} y2={H*(1-v)} stroke="var(--c-line)" strokeWidth="1"/>
      ))}
      <path d={`${path} L${W},${H} L0,${H}Z`} fill="url(#rg)"/>
      <path d={path} fill="none" stroke="var(--c-brand)" strokeWidth="1.5" strokeLinejoin="round"/>
      {['0:00','6:00','12:00','18:00','24:00'].map((l,i)=>(
        <text key={i} x={(i/4)*W} y={H+13} fontSize="8" fill="var(--c-text-4)" textAnchor="middle" fontFamily="'Geist Mono',monospace">{l}</text>
      ))}
    </svg>
  );
}

function ModelSplit() {
  const data = [
    { l:'Gemini 2.0', v:78, c:'var(--c-brand)' },
    { l:'Cache Hit',  v:16, c:'var(--c-green)' },
    { l:'RAG Only',   v:6,  c:'var(--c-violet)' },
  ];
  const r=40, cx=50, cy=50, sw=14, circ=2*Math.PI*r;
  let off=0;
  return (
    <div style={{display:'flex',alignItems:'center',gap:20}}>
      <svg width={100} height={100} viewBox="0 0 100 100" style={{flexShrink:0}}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--c-line)" strokeWidth={sw}/>
        {data.map((d,i)=>{
          const dash=(d.v/100)*circ, gap=circ-dash;
          const el=<circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={d.c} strokeWidth={sw}
            strokeDasharray={`${dash} ${gap}`} strokeDashoffset={-off}
            style={{transform:'rotate(-90deg)',transformOrigin:`${cx}px ${cy}px`}}/>;
          off+=dash; return el;
        })}
        <text x={cx} y={cy-4} textAnchor="middle" fontSize="14" fontWeight="700" fill="var(--c-text-1)" fontFamily="'Geist',sans-serif">78%</text>
        <text x={cx} y={cy+9} textAnchor="middle" fontSize="7" fill="var(--c-text-3)" fontFamily="'Geist Mono',monospace">GEMINI</text>
      </svg>
      <div style={{display:'flex',flexDirection:'column',gap:8}}>
        {data.map(d=>(
          <div key={d.l} style={{display:'flex',alignItems:'center',gap:8}}>
            <span style={{width:8,height:8,borderRadius:2,background:d.c,flexShrink:0}}/>
            <span style={{fontSize:11,color:'var(--c-text-2)'}}>{d.l}</span>
            <span style={{fontFamily:'var(--f-mono)',fontSize:11,color:'var(--c-text-3)',marginLeft:'auto'}}>{d.v}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TaskBreakdown() {
  const items = [
    { l:'Inventory Planning', v:38, c:'var(--c-brand)' },
    { l:'Menu Extraction',    v:24, c:'var(--c-violet)' },
    { l:'Qty Prediction',     v:19, c:'var(--c-cyan)' },
    { l:'Stock Lookup',       v:12, c:'var(--c-green)' },
    { l:'General Q&A',        v:7,  c:'var(--c-amber)' },
  ];
  return (
    <div style={{display:'flex',flexDirection:'column',gap:10}}>
      {items.map(item=>(
        <div key={item.l}>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
            <span style={{fontSize:11,color:'var(--c-text-2)'}}>{item.l}</span>
            <span style={{fontFamily:'var(--f-mono)',fontSize:10,color:'var(--c-text-3)'}}>{item.v}%</span>
          </div>
          <MiniBar value={item.v} color={item.c}/>
        </div>
      ))}
    </div>
  );
}