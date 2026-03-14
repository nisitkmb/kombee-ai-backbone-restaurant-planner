import { Panel, PanelHeader, StatBlock, MiniBar, Tag } from '../components/ui';

const DAYS=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const TOKENS=[{i:145,o:62},{i:112,o:48},{i:168,o:72},{i:155,o:66},{i:172,o:74},{i:230,o:98},{i:188,o:82}];
const LAT=[{l:'<200ms',n:9,c:'var(--c-green)'},{l:'200-500ms',n:34,c:'var(--c-green)'},{l:'500ms-1s',n:29,c:'var(--c-amber)'},{l:'1-2s',n:18,c:'var(--c-amber)'},{l:'2-5s',n:7,c:'var(--c-red)'},{l:'>5s',n:3,c:'var(--c-red)'}];
const TASKS=[{l:'Inventory Planning',v:38,c:'var(--c-brand)'},{l:'Menu Extraction',v:24,c:'var(--c-violet)'},{l:'Qty Prediction',v:19,c:'var(--c-cyan)'},{l:'Stock Lookup',v:12,c:'var(--c-green)'},{l:'General Q&A',v:7,c:'var(--c-amber)'}];

export default function AnalyticsPage() {
  const maxTok = Math.max(...TOKENS.map(d=>d.i+d.o));
  const maxLat = Math.max(...LAT.map(d=>d.n));

  return (
    <div style={{display:'flex',flexDirection:'column',gap:12}}>

      <div className="grid-4">
        <StatBlock label="Total Tokens" value="4.2M" delta="Input 2.1M · Output 2.1M" dir="up" accent="var(--c-brand)" delay={0} style={{borderTop: '2px solid #6366F1'}} />
        <StatBlock label="Avg Latency" value="847ms" delta="P95: 2.1s · P99: 4.8s" dir="up" accent="var(--c-cyan)" delay={50} style={{borderTop: '2px solid #3B82F6'}} />
        <StatBlock label="API Cost" value="$0.00" delta="Free tier active" dir="up" accent="var(--c-green)" delay={100} style={{borderTop: '2px solid #10B981'}} />
        <StatBlock label="Error Rate" value="0.8%" delta="↓ 0.3% from baseline" dir="up" accent="var(--c-amber)" delay={150} style={{borderTop: '2px solid #F59E0B'}} />
      </div>

      <div className="grid-2" style={{gap:12}}>
        {/* Token Usage */}
        <Panel>
          <PanelHeader title="Token Usage (Daily)" meta="Input vs Output tokens"
            right={
              <div style={{display:'flex',gap:12}}>
                {[{c:'var(--c-brand)',l:'Input'},{c:'var(--c-green)',l:'Output'}].map(i=>(
                  <div key={i.l} style={{display:'flex',alignItems:'center',gap:5,fontSize:10,color:'var(--c-text-3)'}}>
                    <span style={{width:8,height:8,borderRadius:2,background:i.c}}/>{i.l}
                  </div>
                ))}
              </div>
            }/>
          <div className="panel-body-sm">
            <div style={{display:'flex',alignItems:'flex-end',gap:4,height:100}}>
              {TOKENS.map((d,i)=>{
                const tot=d.i+d.o, ih=(d.i/maxTok)*88, oh=(d.o/maxTok)*88;
                return(
                  <div key={i} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:2}}>
                    <div style={{width:'100%',display:'flex',flexDirection:'column',gap:1,height:88,justifyContent:'flex-end'}}>
                      <div style={{height:ih,background:'var(--c-brand)',borderRadius:'2px 2px 0 0',opacity:0.8}}/>
                      <div style={{height:oh,background:'var(--c-green)',borderRadius:'2px 2px 0 0',opacity:0.7}}/>
                    </div>
                    <span style={{fontFamily:'var(--f-mono)',fontSize:9,color:'var(--c-text-4)'}}>{DAYS[i]}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </Panel>

        {/* Latency Distribution */}
        <Panel>
          <PanelHeader title="Latency Distribution" meta="Request response time buckets"/>
          <div className="panel-body-sm">
            <div style={{display:'flex',alignItems:'flex-end',gap:6,height:100}}>
              {LAT.map((b,i)=>{
                const h=(b.n/maxLat)*80;
                return(
                  <div key={i} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:4}}>
                    <span style={{fontFamily:'var(--f-mono)',fontSize:9,color:'var(--c-text-3)'}}>{b.n}</span>
                    <div style={{width:'100%',height:h,background:b.c,borderRadius:'2px 2px 0 0',opacity:0.8}}/>
                    <span style={{fontFamily:'var(--f-mono)',fontSize:8,color:'var(--c-text-4)',textAlign:'center',lineHeight:1.3}}>{b.l}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </Panel>
      </div>

      <div className="grid-3" style={{gap:12}}>
        {/* Cost by use case */}
        <Panel>
          <PanelHeader title="Cost by Use Case" meta="Token spend breakdown"/>
          <div className="panel-body">
            <CostDonut/>
          </div>
        </Panel>

        {/* Task Types */}
        <Panel>
          <PanelHeader title="Top Task Types" meta="Request distribution"/>
          <div className="panel-body-sm" style={{display:'flex',flexDirection:'column',gap:10}}>
            {TASKS.map(t=>(
              <div key={t.l}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                  <span style={{fontSize:11,color:'var(--c-text-2)'}}>{t.l}</span>
                  <span style={{fontFamily:'var(--f-mono)',fontSize:10,color:'var(--c-text-3)'}}>{t.v}%</span>
                </div>
                <MiniBar value={t.v} color={t.c}/>
              </div>
            ))}
          </div>
        </Panel>

        {/* Self-Heal */}
        <Panel>
          <PanelHeader title="Self-Heal Stats" meta="Auto-retry performance"/>
          <div className="panel-body">
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:16}}>
              {[{v:'156',l:'Retried',c:'#D97706'},{v:'146',l:'Healed',c:'#16A34A'}].map(s=>(
                <div key={s.l} style={{padding:'12px 8px',borderRadius:5,background:'var(--c-bg-3)',border:'1px solid var(--c-line)',textAlign:'center'}}>
                  <div style={{fontFamily:'var(--f-sans)',fontSize:24,fontWeight:700,color:s.c}}>{s.v}</div>
                  <div style={{fontFamily:'var(--f-mono)',fontSize:9,color:'var(--c-text-4)',textTransform:'uppercase',letterSpacing:'0.07em',marginTop:3}}>{s.l}</div>
                </div>
              ))}
            </div>
            {[{l:'Heal rate (retry 1)',v:78.2,c:'var(--c-green)'},{l:'Heal rate (retry 2)',v:93.6,c:'var(--c-brand)'}].map(r=>(
              <div key={r.l} style={{marginBottom:10}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                  <span style={{fontSize:11,color:'var(--c-text-2)'}}>{r.l}</span>
                  <span style={{fontFamily:'var(--f-mono)',fontSize:10,color:r.c}}>{r.v}%</span>
                </div>
                <MiniBar value={r.v} color={r.c}/>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}

function CostDonut(){
  const data=[
    {l:'Inventory 38%',v:38,c:'var(--c-brand)'},
    {l:'Extraction 24%',v:24,c:'var(--c-violet)'},
    {l:'Prediction 19%',v:19,c:'var(--c-cyan)'},
    {l:'Stock Lookup 12%',v:12,c:'var(--c-green)'},
    {l:'Other 7%',v:7,c:'var(--c-amber)'},
  ];
  const r=40,cx=50,cy=55,sw=14,circ=2*Math.PI*r;
  let off=0;
  return(
    <div style={{display:'flex',alignItems:'center',gap:16}}>
      <svg width={100} height={110} viewBox="0 0 100 110" style={{flexShrink:0}}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--c-line)" strokeWidth={sw}/>
        {data.map((d,i)=>{
          const dash=(d.v/100)*circ,gap=circ-dash;
          const el=<circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={d.c} strokeWidth={sw}
            strokeDasharray={`${dash} ${gap}`} strokeDashoffset={-off}
            style={{transform:'rotate(-90deg)',transformOrigin:`${cx}px ${cy}px`}}/>;
          off+=dash; return el;
        })}
        <text x={cx} y={cy-3} textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--c-text-1)" fontFamily="'Geist',sans-serif">$0.00</text>
        <text x={cx} y={cy+9} textAnchor="middle" fontSize="7" fill="var(--c-text-3)" fontFamily="'Geist Mono',monospace">FREE TIER</text>
      </svg>
      <div style={{display:'flex',flexDirection:'column',gap:6}}>
        {data.map(d=>(
          <div key={d.l} style={{display:'flex',alignItems:'center',gap:6,fontSize:10,color:'var(--c-text-2)'}}>
            <span style={{width:7,height:7,borderRadius:2,background:d.c,flexShrink:0}}/>{d.l}
          </div>
        ))}
      </div>
    </div>
  );
}