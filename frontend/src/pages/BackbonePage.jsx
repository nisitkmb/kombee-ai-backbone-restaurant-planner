import { Panel, PanelHeader, Tag, MiniBar } from '../components/ui';

const LAYERS = [
  { name:'Classifier',       fn:'Intent detection via LangChain NLP',        lat:'12ms' },
  { name:'Complexity Engine',fn:'Token + semantic complexity scoring (0–1)',  lat:'5ms'  },
  { name:'Cost Policy',      fn:'Daily budget gate — cheapest valid model',   lat:'3ms'  },
  { name:'Risk Validator',   fn:'PII detection + content safety filters',     lat:'8ms'  },
  { name:'Context Builder',  fn:'RAG chunk injection + prompt assembly',      lat:'45ms' },
  { name:'Model Router',     fn:'Dynamic model selection by complexity score', lat:'2ms'  },
];

const MATRIX = [
  { task:'Multi-step reasoning', score:'> 0.85',   model:'gemini-2.0-flash', future:'// o1-preview',   toks:'4,200', tier:'red'  },
  { task:'Code generation',      score:'0.65–0.85',model:'gemini-2.0-flash', future:'// codestral',    toks:'2,800', tier:'amber' },
  { task:'RAG Q&A',              score:'0.40–0.65',model:'gemini-2.0-flash', future:'// claude-haiku', toks:'1,500', tier:'cyan'  },
  { task:'Classification',       score:'< 0.40',   model:'gemini-2.0-flash', future:'// gpt-4o-mini',  toks:'300',   tier:'dim'  },
];

const GUARDS = [
  { name:'JSON Validator',       type:'Schema enforcement',       fired:247, rate:96.1 },
  { name:'Code Linter',          type:'Syntax + compile check',   fired:84,  rate:98.8 },
  { name:'Hallucination Detect', type:'Semantic cross-reference', fired:31,  rate:98.7 },
  { name:'Tool Call Validator',  type:'Function signature check', fired:12,  rate:99.5 },
  { name:'Self-Heal Loop (≤2)',  type:'Auto-retry with repair',   fired:156, rate:93.6 },
];

const DB_TABLES = [
  { name:'users',         cols:'id, name, email, created_at',                rows:'10',       c:'var(--c-brand)' },
  { name:'products',      cols:'id, name, category, unit, price, sku',       rows:'50,000',   c:'var(--c-cyan)' },
  { name:'orders',        cols:'id, user_id, created_at, status, total',     rows:'20,000',   c:'var(--c-green)' },
  { name:'order_details', cols:'id, order_id, product_id, qty, unit_price',  rows:'~140,000', c:'var(--c-amber)' },
  { name:'stock',         cols:'user_id, product_id, qty, updated_at',       rows:'500,000',  c:'var(--c-red)' },
];

export default function BackbonePage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

      {/* Layers + Guards row */}
      <div className="grid-2" style={{ gap: 12 }}>

        {/* Core Layers */}
        <Panel>
          <PanelHeader title="Orchestrator Core Layers" meta="All 6 layers operational"
            right={<Tag variant="green" style={{backgroundColor: '#16A34A', color: 'white', border: 'none'}}>GROQ ACTIVE</Tag>} />
          <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 50px 60px', padding: '7px 14px', borderBottom: '1px solid var(--c-line)', gap: 12 }}>
            {['LAYER','FUNCTION','STATUS','LATENCY'].map(h => (
              <span key={h} style={{ fontFamily: 'var(--f-mono)', fontSize: 9, fontWeight: 600, letterSpacing: '0.08em', color: 'var(--c-text-4)', textTransform: 'uppercase' }}>{h}</span>
            ))}
          </div>
          {LAYERS.map((l, i) => (
            <div key={l.name} style={{
              display: 'grid', gridTemplateColumns: '120px 1fr 50px 60px',
              padding: '10px 14px', gap: 12, alignItems: 'center',
              borderBottom: '1px solid var(--c-line)',
              transition: 'background 0.1s', cursor: 'default',
              animation: `fadeSlide 0.3s ease ${i*40}ms both`,
            }}
              onMouseEnter={e => e.currentTarget.style.background='var(--c-bg-3)'}
              onMouseLeave={e => e.currentTarget.style.background=''}
            >
              <span style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--c-brand)', fontWeight: 600 }}>{l.name}</span>
              <span style={{ fontSize: 11, color: 'var(--c-text-2)', lineHeight: 1.4 }}>{l.fn}</span>
              <Tag variant="green" style={{
                padding: '2px 8px',
                backgroundColor: '#DCFCE7',
                color: '#15803D',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontWeight: 600,
                fontSize: '11px',
                borderRadius: '20px'
              }}>
                <span style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: '#15803D',
                  animation: 'pulse-dot 2s infinite'
                }}></span>
                LIVE
              </Tag>
              <span style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--c-green)' }}>{l.lat}</span>
            </div>
          ))}
        </Panel>

        {/* Guardrails */}
        <Panel>
          <PanelHeader title="Validation & Guardrail Layer" meta="Self-healing enabled · max 2 retries"
            right={<Tag variant="amber">Self-Heal ON</Tag>} />
          <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr 50px 80px', padding: '7px 14px', borderBottom: '1px solid var(--c-line)', gap: 12 }}>
            {['GUARD','TYPE','FIRED','PASS RATE'].map(h => (
              <span key={h} style={{ fontFamily: 'var(--f-mono)', fontSize: 9, fontWeight: 600, letterSpacing: '0.08em', color: 'var(--c-text-4)', textTransform: 'uppercase' }}>{h}</span>
            ))}
          </div>
          {GUARDS.map((g, i) => (
            <div key={g.name} style={{
              display: 'grid', gridTemplateColumns: '160px 1fr 50px 80px',
              padding: '10px 14px', gap: 12, alignItems: 'center',
              borderBottom: '1px solid var(--c-line)', transition: 'background 0.1s',
              animation: `fadeSlide 0.3s ease ${i*40}ms both`,
            }}
              onMouseEnter={e => e.currentTarget.style.background='var(--c-bg-3)'}
              onMouseLeave={e => e.currentTarget.style.background=''}
            >
              <span style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--c-text-1)', fontWeight: 600 }}>{g.name}</span>
              <span style={{ fontSize: 11, color: 'var(--c-text-3)' }}>{g.type}</span>
              <span style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--c-text-3)', textAlign: 'center' }}>{g.fired}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <MiniBar value={g.rate} color={g.rate > 95 ? 'var(--c-green)' : 'var(--c-amber)'} />
                </div>
                <span style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: g.rate > 95 ? 'var(--c-green)' : 'var(--c-amber)', width: 36, textAlign: 'right' }}>{g.rate}%</span>
              </div>
            </div>
          ))}
        </Panel>
      </div>

      {/* Routing Matrix */}
      <Panel>
        <PanelHeader title="Model Routing Strategy Matrix" meta="Complexity score → model selection"
          right={<Tag variant="blue">Gemini Active</Tag>} />
        <table className="dt">
          <thead>
            <tr><th>TASK TYPE</th><th>COMPLEXITY SCORE</th><th>ACTIVE MODEL</th><th>FUTURE MODEL</th><th>AVG TOKENS</th><th>COST TIER</th></tr>
          </thead>
          <tbody>
            {MATRIX.map((r, i) => (
              <tr key={i}>
                <td style={{ color: 'var(--c-text-1)', fontWeight: 500 }}>{r.task}</td>
                <td><span className="mono">{r.score}</span></td>
                <td><span className="mono text-blue">{r.model}</span></td>
                <td><span className="mono text-3">{r.future}</span></td>
                <td><span className="mono">{r.toks}</span></td>
                <td><Tag variant={r.tier}>{r.tier.toUpperCase()}</Tag></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>

      {/* RAG + DB */}
      <div className="grid-2" style={{ gap: 12 }}>

        {/* RAG Pipeline */}
        <Panel>
          <PanelHeader title="RAG Pipeline" meta="Document → Embedding → Vector Store → Retrieval" />
          <div className="panel-body-sm">
            {[
              { icon:'📄', step:'Document Ingestion',  sub:'PDF → PyMuPDF → raw text',            c:'var(--c-brand)' },
              { icon:'✂️', step:'Text Splitting',       sub:'LangChain chunk=512 overlap=50',      c:'var(--c-cyan)' },
              { icon:'🧠', step:'Embedding',            sub:'text-embedding-004 · 768 dimensions', c:'var(--c-green)' },
              { icon:'💾', step:'FAISS Store',          sub:'Local vector index · cosine similarity', c:'var(--c-amber)' },
              { icon:'🔍', step:'Retriever',            sub:'Top-K=5 · similarity threshold',     c:'var(--c-violet)' },
            ].map((s, i) => (
              <div key={s.step}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
                  borderRadius: 5, background: 'var(--c-bg-1)', border: '1px solid var(--c-line)',
                  marginBottom: 4, transition: 'all 0.15s',
                  animation: `fadeSlide 0.3s ease ${i*60}ms both`,
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = s.c + '44'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--c-line)'; }}
                >
                  <span style={{ fontSize: 16, width: 24, textAlign: 'center', flexShrink: 0 }}>{s.icon}</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 12, color: 'var(--c-text-1)' }}>{s.step}</div>
                    <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--c-text-3)', marginTop: 1 }}>{s.sub}</div>
                  </div>
                </div>
                {i < 4 && <div style={{ width: 1, height: 6, background: 'var(--c-line)', margin: '0 22px 4px' }} />}
              </div>
            ))}

            <div style={{ marginTop: 12, padding: '12px', borderRadius: 5, background: 'var(--c-bg-3)', border: '1px solid var(--c-line)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, textAlign: 'center', marginBottom: 12 }}>
                {[{v:'12,430',l:'Vectors',c:'var(--c-brand)'},{v:'768',l:'Dims',c:'var(--c-amber)'},{v:'3',l:'Collections',c:'var(--c-green)'},{v:'23ms',l:'Avg Query',c:'var(--c-cyan)'}].map(s=>(
                  <div key={s.l}>
                    <div style={{fontWeight:700,fontSize:18,color:s.c,fontFamily:'var(--f-sans)'}}>{s.v}</div>
                    <div style={{fontFamily:'var(--f-mono)',fontSize:9,color:'var(--c-text-4)',textTransform:'uppercase',letterSpacing:'0.07em',marginTop:2}}>{s.l}</div>
                  </div>
                ))}
              </div>
              {[{n:'menu_docs',v:8240,p:66},{n:'ingredient_kb',v:3190,p:26},{n:'seasonal_data',v:1000,p:8}].map(c=>(
                <div key={c.n} style={{marginBottom:8}}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:3}}>
                    <span style={{fontFamily:'var(--f-mono)',fontSize:10,color:'var(--c-text-2)'}}>{c.n}</span>
                    <span style={{fontFamily:'var(--f-mono)',fontSize:10,color:'var(--c-text-4)'}}>{c.v.toLocaleString()} vec</span>
                  </div>
                  <MiniBar value={c.p} />
                </div>
              ))}
            </div>
          </div>
        </Panel>

        {/* DB Schema + Prediction */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Panel>
            <PanelHeader title="Database Schema" meta="PostgreSQL · 5 tables · ~210K+ rows" />
            <div className="panel-body-sm" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {DB_TABLES.map((t, i) => (
                <div key={t.name} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '9px 12px',
                  borderRadius: 5, background: 'var(--c-bg-1)', border: '1px solid var(--c-line)',
                  transition: 'all 0.15s',
                  animation: `fadeSlide 0.3s ease ${i*60}ms both`,
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = t.c + '44'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--c-line)'; }}
                >
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: t.c, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, fontWeight: 600, color: t.c }}>{t.name}</div>
                    <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'var(--c-text-3)', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.cols}</div>
                  </div>
                  <span style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--c-text-3)', flexShrink: 0 }}>{t.rows}</span>
                </div>
              ))}
            </div>
          </Panel>

          <Panel>
            <PanelHeader title="Prediction Algorithm" meta="5-factor purchase quantity engine" />
            <div className="panel-body-sm">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 6, marginBottom: 10 }}>
                {[
                  { l:'Avg Daily',    f:'÷ 90 days',      c:'var(--c-brand)' },
                  { l:'Weekend',      f:'× 1.42',         c:'var(--c-cyan)' },
                  { l:'Seasonal',     f:'× factor[cat]',  c:'var(--c-green)' },
                  { l:'Time of Day',  f:'× 1.15',         c:'var(--c-amber)' },
                  { l:'User Behav.',  f:'× 1.10',         c:'var(--c-violet)' },
                ].map((f,i)=>(
                  <div key={f.l} style={{padding:'8px',borderRadius:4,background:'var(--c-bg-1)',border:'1px solid var(--c-line)',textAlign:'center'}}>
                    <div style={{fontFamily:'var(--f-mono)',fontSize:9,color:f.c,fontWeight:600,marginBottom:3}}>{f.f}</div>
                    <div style={{fontSize:10,color:'var(--c-text-2)',lineHeight:1.3}}>{f.l}</div>
                  </div>
                ))}
              </div>
              <div style={{padding:'8px 10px',borderRadius:4,background:'var(--c-bg-1)',border:'1px solid var(--c-line)',fontFamily:'var(--f-mono)',fontSize:10,lineHeight:1.8}}>
                <span style={{color:'var(--c-text-3)'}}>predicted_7d = </span>
                <span style={{color:'var(--c-cyan)'}}>user_behaviour</span>
                <span style={{color:'var(--c-text-3)'}}> × 7 × </span>
                <span style={{color:'var(--c-amber)'}}>1.20</span>
                <span style={{color:'var(--c-text-3)'}}> (safety stock)</span><br/>
                <span style={{color:'var(--c-text-3)'}}>order_qty = </span>
                <span style={{color:'var(--c-green)'}}>max</span>
                <span style={{color:'var(--c-text-3)'}}>(0, predicted_7d − current_stock)</span>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}