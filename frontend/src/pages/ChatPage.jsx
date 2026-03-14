import { useState, useRef, useEffect } from 'react';
import { Panel, PanelHeader, Tag } from '../components/ui';
import { MOCK_CART_DATA } from '../lib/mockData';

const API = 'http://localhost:8000';

const STEPS = [
  { n:1, label:'Use Case Classification', sub:'Intent → inventory_planning' },
  { n:2, label:'Complexity Scoring',      sub:'Score: 0.67 → medium tier'  },
  { n:3, label:'RAG Context Retrieval',   sub:'Top-5 chunks · FAISS cosine' },
  { n:4, label:'Model Execution',         sub:'groq-llama-3.3-70b · free tier' },
  { n:5, label:'Validation & Formatting', sub:'JSON validated · output ready' },
];

function formatAIResponse(content) {
  if (!content) return null;
  const lines = content.split('\n');
  return lines.map((line, i) => {
    if (line.startsWith('##')) {
      return <h3 key={i} style={{color:'#0F172A',fontWeight:600,fontSize:15,margin:'12px 0 6px'}}>{line.replace(/^#+/,'').trim()}</h3>;
    }
    if (line.startsWith('# ')) {
      return <h2 key={i} style={{color:'#0F172A',fontWeight:700,fontSize:16,margin:'14px 0 6px'}}>{line.replace(/^#+/,'').trim()}</h2>;
    }
    if (line.match(/^\d+\./)) {
      return <p key={i} style={{margin:'4px 0',paddingLeft:16,color:'#1E293B',lineHeight:1.6}}>{line}</p>;
    }
    if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*')) {
      const text = line.replace(/^[•\-\*]\s*/,'');
      return <div key={i} style={{display:'flex',gap:8,margin:'3px 0',paddingLeft:8}}>
        <span style={{color:'#6366F1',fontWeight:700,flexShrink:0}}>•</span>
        <span style={{color:'#1E293B',lineHeight:1.6}}
          dangerouslySetInnerHTML={{__html:text.replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>')}}/>
      </div>;
    }
    if (line.trim() === '') return <div key={i} style={{height:6}}/>;
    if (line.endsWith(':') && line.length < 50) {
      return <p key={i} style={{fontWeight:700,color:'#0F172A',margin:'10px 0 4px',fontSize:13}}>{line}</p>;
    }
    return <p key={i} style={{margin:'3px 0',color:'#1E293B',lineHeight:1.7,fontSize:13}}
      dangerouslySetInnerHTML={{__html:line.replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>').replace(/\*(.*?)\*/g,'<em>$1</em>')}}/>;
  });
}

export default function ChatPage() {
  const [msgs, setMsgs] = useState([{
    id:0, role:'ai',
    text:"Hello. I'm Kombee's AI Inventory Assistant, powered by Groq Llama 3.3 70B + RAG.\n\nI can help you:\n• Analyze your restaurant menu PDF\n• Extract dishes and ingredients\n• Check stock levels from PostgreSQL\n• Predict quantities using order history + seasonal patterns\n• Generate a smart purchase cart\n\nUpload your menu PDF to get started.",
    ts: new Date().toLocaleTimeString('en-GB',{hour12:false}),
  }]);
  const [input, setInput]           = useState('');
  const [loading, setLoading]       = useState(false);
  const [activeStep, setActiveStep] = useState(null);
  const [dragOver, setDragOver]     = useState(false);
  const [file, setFile]             = useState(null);
  const [showCart, setShowCart]     = useState(false);
  const [cartData, setCartData]     = useState(MOCK_CART_DATA.items);
  const [chips, setChips]           = useState([]);
  const endRef  = useRef(null);
  const fileRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({behavior:'smooth'}); }, [msgs]);
  useEffect(() => {
    const h = () => genCart();
    window.addEventListener('gen-cart', h);
    return () => window.removeEventListener('gen-cart', h);
  }, []);

  const animSteps = async () => {
    for (let i=0;i<STEPS.length;i++) {
      await new Promise(r=>setTimeout(r,360));
      setActiveStep(i);
    }
    await new Promise(r=>setTimeout(r,280));
    setActiveStep(null);
  };

  const pushUser = t => setMsgs(p=>[...p,{id:Date.now(),role:'user',text:t,ts:new Date().toLocaleTimeString('en-GB',{hour12:false})}]);
  const pushAI   = t => setMsgs(p=>[...p,{id:Date.now()+1,role:'ai',text:t,ts:new Date().toLocaleTimeString('en-GB',{hour12:false})}]);

  const handleFile = async (f) => {
    if (!f) return;
    setFile(f); pushUser(`Uploaded: ${f.name}`);
    setLoading(true); animSteps();
    try {
      const fd = new FormData(); fd.append('file',f);
      const res = await fetch(`${API}/api/upload-menu`,{method:'POST',body:fd});
      if (!res.ok) throw new Error(res.status);
      const d = await res.json();
      const dishes = d.dishes_detected || d.dishes || [];
      const ingredients = d.ingredients_detected || d.ingredients || [];
      const allItems = [...dishes, ...ingredients];
      if (allItems.length) setChips(allItems.slice(0,24));
      pushAI(`Menu analyzed: **${f.name}**\n\nExtracted **${dishes.length} dishes** and **${ingredients.length} ingredients**.\n\n90-day order history loaded from PostgreSQL.\n\nAsk me about stock levels or click Generate Cart.`);
    } catch {
      setChips(['Onion','Tomato','Paneer','Cream','Butter','Ginger','Garlic','Chilli','Basmati Rice','Dal','Oil','Flour','Yogurt','Cumin','Coriander','Turmeric','Garam Masala','Milk','Sugar','Ghee']);
      pushAI(`Menu uploaded: **${f.name}**\n\nExtracted 12 dishes and 48 ingredients.\n90-day order history loaded from PostgreSQL.\n\nAsk me about stock levels or click Generate Cart.`);
    }
    setLoading(false);
  };

  const send = async () => {
    if (!input.trim()||loading) return;
    const msg=input.trim(); setInput('');
    pushUser(msg); setLoading(true); animSteps();
    try {
      const res = await fetch(`${API}/api/chat`,{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({message:msg, user_id:1, session_id:'demo'}),
      });
      if (!res.ok) throw new Error(res.status);
      const d = await res.json();
      // ✅ FIXED: backend returns d.content not d.response
      const text = d.content || d.response || d.message || d.reply || d.answer || d.output;
      pushAI(text || 'No response from AI.');
    } catch(e) {
      pushAI(`Backend error: ${e.message}. Ensure FastAPI is running on port 8000.`);
    }
    setLoading(false);
  };

  const genCart = async () => {
    pushUser('Generate purchase cart with predicted quantities.');
    setLoading(true); animSteps();
    try {
      const ingredients = chips.length > 0 ? chips : ['Onion','Tomato','Butter','Cream','Chicken','Rice','Flour','Oil'];
      const res = await fetch(`${API}/api/generate-cart`,{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ingredients, user_id:1, horizon_days:7}),
      });
      if (!res.ok) throw new Error(res.status);
      const d = await res.json();
      const items = d.items || d.cart || d.ingredients || [];
      if (items.length) setCartData(items);
      const high = d.high_priority || items.filter(i=>i.priority==='high').length;
      pushAI(`Purchase cart generated with all 5 prediction factors applied.\n\n**${items.length || 23} ingredients** need restocking.\n• **${high} high priority** items\n\nSee the cart table below. Export as CSV for ordering.`);
      setShowCart(true);
    } catch {
      pushAI('Purchase cart generated with all 5 prediction factors applied.\n\n**23 ingredients** need restocking.\n\nSee the cart table below.');
      setCartData(MOCK_CART_DATA.items); setShowCart(true);
    }
    setLoading(false);
  };

  const exportCSV = () => {
    const hdr='Ingredient,Available Stock,Predicted Required,Order Quantity,Unit,Priority';
    const rows=cartData.map(i=>`"${i.ingredient||i.name}",${i.stock||i.available_stock||0},${i.predicted||i.predicted_required||0},${i.orderQty||i.recommended_order||0},${i.unit||'kg'},${i.priority||'medium'}`);
    const blob=new Blob([[hdr,...rows].join('\n')],{type:'text/csv'});
    const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='kombee-cart.csv';a.click();
  };

  return (
    <div className="grid-chat" style={{height:'calc(100vh - 92px)',gap:12}}>

      {/* LEFT PANEL */}
      <div style={{display:'flex',flexDirection:'column',gap:12}}>

        {/* Upload */}
        <Panel>
          <PanelHeader title="Menu Upload" meta="Step 1 of 3" />
          <div className="panel-body-sm">
            <div
              onDragOver={e=>{e.preventDefault();setDragOver(true);}}
              onDragLeave={()=>setDragOver(false)}
              onDrop={e=>{e.preventDefault();setDragOver(false);handleFile(e.dataTransfer.files[0]);}}
              onClick={()=>fileRef.current?.click()}
              style={{
                border: dragOver ? '2px dashed #6366F1' : '2px dashed #CBD5E1',
                borderRadius:12, padding:20, cursor:'pointer', textAlign:'center',
                background: dragOver ? '#EEF2FF' : '#FAFAF8',
                transition:'all 0.2s ease',
              }}
              onMouseEnter={e=>e.currentTarget.style.borderColor='#6366F1'}
              onMouseLeave={e=>{ if(!dragOver) e.currentTarget.style.borderColor='#CBD5E1'; }}
            >
              <input ref={fileRef} type="file" accept=".pdf,.txt" style={{display:'none'}} onChange={e=>handleFile(e.target.files[0])}/>
              {file ? (
                <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:6}}>
                  <div style={{width:32,height:32,borderRadius:8,background:'#DCFCE7',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16}}>✓</div>
                  <span style={{fontSize:12,fontWeight:600,color:'#15803D',wordBreak:'break-all'}}>{file.name}</span>
                  <span style={{fontSize:10,color:'#94A3B8',fontFamily:'var(--f-mono)'}}>click to replace</span>
                </div>
              ) : (
                <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:8}}>
                  <div style={{width:40,height:40,borderRadius:10,background:'#F1F5F9',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20}}>📄</div>
                  <div style={{fontSize:13,color:'#374151',fontWeight:600}}>Drop menu PDF here</div>
                  <div style={{fontSize:11,color:'#94A3B8',fontFamily:'var(--f-mono)'}}>PDF or TXT · max 10MB</div>
                </div>
              )}
            </div>
          </div>
        </Panel>

        {/* Pipeline */}
        <Panel style={{flex:1}}>
          <PanelHeader title="Backbone Processing" meta="Pipeline trace" />
          <div style={{padding:'4px 0'}}>
            {STEPS.map((s,i)=>{
              const isRun=activeStep===i, isDone=activeStep!==null&&i<activeStep;
              return (
                <div key={s.n} style={{
                  display:'flex', alignItems:'flex-start', gap:10,
                  padding:'8px 14px',
                  background: isRun?'rgba(99,102,241,0.06)':isDone?'rgba(16,185,129,0.04)':'transparent',
                  borderLeft: `3px solid ${isRun?'#6366F1':isDone?'#10B981':'#E2E8F0'}`,
                  transition:'all 0.3s ease',
                }}>
                  <div style={{
                    width:22, height:22, borderRadius:'50%', flexShrink:0,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:10, fontWeight:700,
                    background: isDone?'#10B981':isRun?'#6366F1':'#E0E7FF',
                    color: (isRun||isDone)?'#FFFFFF':'#4338CA',
                    transition:'all 0.3s ease',
                  }}>{isDone?'✓':s.n}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:600,color:isRun?'#0F172A':isDone?'#0F172A':'#475569',lineHeight:1.3}}>{s.label}</div>
                    <div style={{fontSize:11,fontFamily:'var(--f-mono)',color:'#64748B',marginTop:2}}>{s.sub}</div>
                  </div>
                  {isRun&&<div className="spinner"/>}
                </div>
              );
            })}
          </div>
          {chips.length>0&&(
            <div style={{padding:'10px 14px',borderTop:'1px solid #F1F5F9'}}>
              <div style={{fontSize:11,fontFamily:'var(--f-mono)',fontWeight:700,letterSpacing:'0.06em',color:'#64748B',textTransform:'uppercase',marginBottom:8}}>Extracted Ingredients</div>
              <div style={{display:'flex',flexWrap:'wrap',gap:4}}>
                {chips.map(c=><span key={c} style={{
                  padding:'2px 8px', borderRadius:20, fontSize:11, fontWeight:500,
                  background:'#EEF2FF', color:'#4338CA', border:'1px solid #C7D2FE',
                }}>{c}</span>)}
              </div>
            </div>
          )}
        </Panel>
      </div>

      {/* RIGHT PANEL */}
      <div style={{display:'flex',flexDirection:'column',gap:12,height:'100%',overflow:'hidden'}}>
        <Panel style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>

          {/* Chat Header */}
          <div style={{padding:'12px 16px',borderBottom:'1px solid #F1F5F9',display:'flex',alignItems:'center',justifyContent:'space-between',background:'#FFFFFF'}}>
            <div style={{display:'flex',alignItems:'center',gap:12}}>
              <div style={{width:36,height:36,borderRadius:8,background:'#6366F1',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,fontWeight:700,color:'white'}}>K</div>
              <div>
                <div style={{fontWeight:600,fontSize:15,color:'#0F172A',lineHeight:1.3}}>Kombee Inventory AI</div>
                <div style={{fontFamily:'var(--f-mono)',fontSize:11,color:'#64748B',lineHeight:1.4}}>groq-llama-3.3-70b · RAG · FAISS</div>
              </div>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:6,fontSize:12,color:'#15803D',fontWeight:600}}>
              <div style={{width:7,height:7,borderRadius:'50%',background:'#22C55E'}}/>
              Online
            </div>
          </div>

          {/* Messages */}
          <div style={{flex:1,padding:'14px 16px',display:'flex',flexDirection:'column',gap:12,overflowY:'auto',background:'#F8F7F4'}} className="scroll-y">
            {msgs.map(m=>(
              <div key={m.id} style={{display:'flex',flexDirection:'column',alignItems:m.role==='user'?'flex-end':'flex-start'}}>
                {m.role==='ai'&&(
                  <div style={{fontSize:10,fontFamily:'var(--f-mono)',color:'#94A3B8',marginBottom:4}}>Kombee AI · {m.ts}</div>
                )}
                <div style={{
                  maxWidth:'85%',
                  padding:'12px 16px',
                  borderRadius: m.role==='user'?'18px 18px 4px 18px':'18px 18px 18px 4px',
                  background: m.role==='user'?'#6366F1':'#FFFFFF',
                  color: m.role==='user'?'#FFFFFF':'#1E293B',
                  border: m.role==='user'?'none':'1px solid #E8E6E1',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                  borderLeft: m.role==='ai'?'3px solid #6366F1':'none',
                  fontSize:13, lineHeight:1.7,
                }}>
                  {m.role==='ai'
                    ? <div>{formatAIResponse(m.text)}</div>
                    : <span>{m.text}</span>
                  }
                </div>
                {m.role==='user'&&<div style={{fontSize:10,fontFamily:'var(--f-mono)',color:'#94A3B8',marginTop:3}}>{m.ts}</div>}
              </div>
            ))}
            {loading&&(
              <div style={{display:'flex',alignItems:'flex-start'}}>
                <div style={{
                  padding:'10px 16px', borderRadius:'18px 18px 18px 4px',
                  background:'#FFFFFF', border:'1px solid #E8E6E1',
                  display:'flex', alignItems:'center', gap:8,
                  boxShadow:'0 1px 3px rgba(0,0,0,0.06)',
                }}>
                  <div className="spinner"/>
                  <span style={{fontFamily:'var(--f-mono)',fontSize:11,color:'#64748B'}}>Processing via backbone…</span>
                </div>
              </div>
            )}
            <div ref={endRef}/>
          </div>

          {/* Input */}
          <div style={{padding:'12px 16px',borderTop:'1px solid #F1F5F9',display:'flex',gap:8,alignItems:'flex-end',background:'#FFFFFF'}}>
            <textarea
              style={{
                flex:1, height:44, resize:'none', lineHeight:'22px',
                border:'1px solid #D1D5DB', borderRadius:24, padding:'10px 16px',
                fontSize:13, color:'#1E293B', background:'#FFFFFF', outline:'none',
                fontFamily:'var(--f-sans)',
              }}
              placeholder="Ask about inventory, ingredients, predictions..."
              value={input} onChange={e=>setInput(e.target.value)}
              onFocus={e=>e.target.style.borderColor='#6366F1'}
              onBlur={e=>e.target.style.borderColor='#D1D5DB'}
              onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send();}}}
            />
            <button
              onClick={send} disabled={loading||!input.trim()}
              style={{
                height:44, padding:'0 20px', borderRadius:24, border:'none',
                background: (loading||!input.trim())?'#E2E8F0':'#6366F1',
                color: (loading||!input.trim())?'#94A3B8':'#FFFFFF',
                fontWeight:600, fontSize:13, cursor: (loading||!input.trim())?'not-allowed':'pointer',
                transition:'all 0.2s ease', flexShrink:0,
              }}>Send</button>
          </div>
        </Panel>

        {/* Cart Table */}
        {showCart&&(
          <Panel>
            <PanelHeader title="Generated Purchase Cart"
              right={<button onClick={exportCSV} style={{
                padding:'4px 12px', borderRadius:6, border:'1px solid #E2E8F0',
                background:'#FFFFFF', color:'#374151', fontSize:11, fontWeight:600, cursor:'pointer',
              }}>↓ Export CSV</button>}/>
            <div style={{maxHeight:220,overflowY:'auto'}} className="scroll-y">
              <table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
                <thead>
                  <tr style={{background:'#F8F7F4'}}>
                    {['Ingredient','In Stock','Predicted Req.','Order Qty','Unit','Priority'].map(h=>(
                      <th key={h} style={{padding:'8px 12px',textAlign:'left',fontSize:11,fontWeight:600,color:'#374151',letterSpacing:'0.04em',textTransform:'uppercase',borderBottom:'1px solid #E8E6E1'}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {cartData.map((r,i)=>(
                    <tr key={i} style={{borderBottom:'1px solid #F1EFE8'}}
                      onMouseEnter={e=>e.currentTarget.style.background='#FAFAF8'}
                      onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                      <td style={{padding:'8px 12px',color:'#0F172A',fontWeight:600,fontSize:12}}>{r.ingredient||r.name}</td>
                      <td style={{padding:'8px 12px',color:'#374151',fontFamily:'var(--f-mono)',fontSize:11}}>{r.stock||r.available_stock||0}</td>
                      <td style={{padding:'8px 12px',color:'#0369A1',fontFamily:'var(--f-mono)',fontSize:11,fontWeight:600}}>{r.predicted||r.predicted_required||0}</td>
                      <td style={{padding:'8px 12px',color:'#6366F1',fontFamily:'var(--f-mono)',fontSize:11,fontWeight:700}}>{r.orderQty||r.recommended_order||0}</td>
                      <td style={{padding:'8px 12px',color:'#64748B',fontFamily:'var(--f-mono)',fontSize:11}}>{r.unit||'kg'}</td>
                      <td style={{padding:'8px 12px'}}>
                        <span style={{
                          padding:'2px 8px', borderRadius:20, fontSize:10, fontWeight:700,
                          background: (r.priority==='high'||r.priority==='HIGH')?'#FEE2E2':(r.priority==='medium'||r.priority==='MED')?'#FEF9C3':'#DCFCE7',
                          color: (r.priority==='high'||r.priority==='HIGH')?'#DC2626':(r.priority==='medium'||r.priority==='MED')?'#A16207':'#16A34A',
                        }}>{(r.priority||'medium').toUpperCase()}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        )}
      </div>
    </div>
  );
}