(()=>{
const DS=window.ShohojatriDesignSystem_1ff839;
const {Icon,Card,Chip,Button,Toast}=DS;
const R=window.PR,G=window.PG;

function ProtoMap(){return <Phone><StatusBar/><AppHeader title="ডেমো ম্যাপ"/>
  <div className="cm-body" style={{gap:14}}>
    <p className="cm-sub">যেকোনো অংশে সরাসরি যান — চিপে চাপ দিলে সেই স্ক্রিন খুলবে।</p>
    {window.PFLOWS.map(f=><Card key={f.e} padding={16}><div style={{display:'flex',flexDirection:'column',gap:10}}>
      <div style={{display:'flex',gap:12,alignItems:'center'}}><Tile icon={f.ic} tone="sky" size={40}/><div style={{flex:1,minWidth:0}}><h2 className="cm-h2" style={{fontSize:18}}>{f.t}</h2><div lang="en" style={{fontSize:13,color:'var(--text-2)'}}>{f.e}</div></div>
        {f.start?<span data-go={f.start}><Button size="sm" iconRight="arrow-right">শুরু</Button></span>:null}</div>
      {f.start?<div style={{fontSize:14,color:'var(--text-2)'}}>শুরু: <b style={{color:'var(--text-1)',fontWeight:600}}>{R[f.start].l}</b></div>:null}
      {f.note?<div className="cm-note warm"><Icon name="info" size={18}/><span>{f.note}</span></div>:null}
      <div className="cm-chips">{f.ids.map(id=><span key={id} data-go={id}><Chip lang="bn" label={R[id].l} onClick={()=>{}}/></span>)}{(f.missing||[]).map(m=><span key={m} className="cm-tag warm"><Icon name="circle-dashed" size={13}/>নেই · {m}</span>)}</div>
    </div></Card>)}
  </div></Phone>;}
window.ProtoMap=ProtoMap;

function DocView({src,title}){const ref=React.useRef();const [m,setM]=React.useState({w:900,h:1300});
  const measure=()=>{try{const d=ref.current.contentDocument.documentElement;setM({w:Math.max(d.scrollWidth,600),h:d.scrollHeight});}catch(e){}};
  const sc=390/m.w;
  return <Phone><StatusBar/><AppHeader title={title} right={<span style={{width:48}}></span>}/>
    <div className="pv-docscroll"><div style={{width:390,height:Math.ceil(m.h*sc),overflow:'hidden'}}>
      <iframe ref={ref} src={src} title={title} scrolling="no" onLoad={()=>{measure();setTimeout(measure,600);setTimeout(measure,1500);}} style={{width:m.w,height:m.h,border:0,transform:`scale(${sc})`,transformOrigin:'0 0',display:'block'}}></iframe>
    </div></div></Phone>;}

const CLICK='[data-go],.sj-chip,button,a,[role=button],[role=tab],[role=radio],.sf-hero,.sf-row,.sf-add,.cm-li,.cm-chg,.cm-mini-act,.cm-pick,.cm-goal,.cm-input,.ac-field,.rs-input,.ac-hi,.ac-hsearch,.rs-spec,.sj-card,.rs-foot,.cm-rep,tbody tr';
const CTL='.sj-chip,button,a,[role=button],[role=tab],[role=radio]';
const LIVE='[role=tab],[role=radio],[role=checkbox],[role=switch],[aria-pressed],.sj-chip,.cm-face,.sj-choice,.rs-seg button,.cm-tbtn,.cm-explain,.sj-lang__opt,.cm-pick,.cm-sw,.rs-divs button';
const norm=s=>(s||'').replace(/\s+/g,' ').trim();
const inc=(k,t)=>t.split('|').some(x=>k.includes(x));
function hit(rule,el,key){const m=rule[0];if(typeof m==='string')return el.matches(CTL)&&inc(key,m);if(m.s&&!el.matches(m.s))return false;if(m.t&&!inc(key,m.t))return false;return true;}

function parseHash(){const h=decodeURIComponent(location.hash.slice(1));const [id,l]=h.split('.');return {id:R[id]?id:'splash',lang:l==='en'?'en':'bn'};}
function useVp(){const [v,setV]=React.useState({w:innerWidth,h:innerHeight});React.useEffect(()=>{const f=()=>setV({w:innerWidth,h:innerHeight});addEventListener('resize',f);return()=>removeEventListener('resize',f);},[]);return v;}

function fixScroll(root){
  root.querySelectorAll('*').forEach(el=>{const s=el.style;if(s.overflow==='hidden'&&(s.flex||'').startsWith('1')&&s.position!=='relative'){s.overflowY='auto';s.overflowX='hidden';}});
  root.querySelectorAll('.ac-thread,.cm-thread,.rs-thread').forEach(t=>{if(!t.closest('.ac-phone.tall'))t.scrollTop=t.scrollHeight;});
}

function App(){
  const vp=useVp();const init=React.useMemo(parseHash,[]);
  const [st,setSt]=React.useState({stack:[init.id],lang:init.lang});
  const [msg,setMsg]=React.useState(null);
  const cur=st.stack[st.stack.length-1];const S=R[cur];const lang=S.en?st.lang:'bn';
  const ref=React.useRef();const stageRef=React.useRef();
  React.useEffect(()=>{history.replaceState(null,'','#'+cur+(st.lang==='en'?'.en':''));},[cur,st.lang]);
  React.useLayoutEffect(()=>{if(stageRef.current)stageRef.current.scrollTop=0;const r=ref.current;if(!r)return;fixScroll(r);const t=setTimeout(()=>fixScroll(r),300);return()=>clearTimeout(t);},[cur,lang]);
  React.useEffect(()=>{if(!msg)return;const t=setTimeout(()=>setMsg(null),2200);return()=>clearTimeout(t);},[msg]);

  const nav=(target,root)=>setSt(s=>{
    const top=s.stack[s.stack.length-1],T=R[top];let t=target;
    const res=x=>typeof x==='function'?x(root,top,s.stack):x;
    t=res(t);
    if(t==='BACK')t=res(T.back!==undefined?T.back:'pop');
    if(t==='CLOSE')t=res(T.close!==undefined&&T.close!==null?T.close:(T.back!==undefined?T.back:'pop'));
    if(t==='BACK')t='pop';
    if(t==='EXIT'){let k=s.stack.length-1;while(k>=0&&R[s.stack[k]].g===T.g)k--;return {...s,stack:k>=0?s.stack.slice(0,k+1):['c-home']};}
    if(t==='pop')return {...s,stack:s.stack.length>1?s.stack.slice(0,-1):[T.up||'splash']};
    if(!R[t]||t===top)return s;
    const i=s.stack.lastIndexOf(t);if(i>=0)return {...s,stack:s.stack.slice(0,i+1)};
    return {...s,stack:[...s.stack,t].slice(-40)};
  });

  const onClick=e=>{
    const root=ref.current;const stop=()=>{e.preventDefault();e.stopPropagation();};
    const dg=e.target.closest('[data-go]');if(dg&&root.contains(dg)){stop();nav(dg.dataset.go,root);return;}
    const lo=e.target.closest('.sj-lang__opt');
    if(lo){stop();const l=lo.getAttribute('lang');if(S.en)setSt(s=>({...s,lang:l}));else if(l==='en')setMsg('এই স্ক্রিনের ইংরেজি সংস্করণ এখনো ডিজাইন করা হয়নি');return;}
    if(e.target.classList&&e.target.classList.contains('sj-overlay')){if(S.close===null)return;stop();nav('CLOSE',root);return;}
    const chain=[];let el=e.target.closest(CLICK);while(el&&root.contains(el)){chain.push(el);el=el.parentElement&&el.parentElement.closest(CLICK);}
    const rules=[...(S.links||[]),...G];
    for(const c of chain){const key=norm((c.getAttribute('aria-label')||'')+' '+c.textContent);
      for(const r of rules){if(hit(r,c,key)){if(r[1]===null)return;stop();nav(r[1],root);return;}}}
    if(S.tap){stop();nav(S.tap,root);return;}
    const f=chain[0];if(f&&f.matches('button,a')&&!f.matches(LIVE)&&S.fb){stop();nav(S.fb,root);}
  };

  const desk=S.k==='desk';const mob=vp.w<600;
  const content=<React.Fragment key={cur+lang}>{S.k==='doc'?<DocView src={S.src} title={S.title}/>:S.r(lang)}</React.Fragment>;
  if(desk){const W=S.w||1280;const z=Math.min(1,(vp.w-(mob?0:48))/W);
    return <div ref={stageRef} className={'pv-stage desk'+(mob?' m':'')}><div ref={ref} className="pv-desk" style={{zoom:z,width:W}} onClickCapture={onClick}>{content}</div></div>;}
  const z=mob?Math.min(vp.w/390,vp.h/844):Math.min(1.2,(vp.h-48)/864,(vp.w-48)/410);
  return <div ref={stageRef} className={'pv-stage'+(mob?' m':'')}><div ref={ref} className="pv-dev" style={{zoom:z}} onClickCapture={onClick}>
    {content}
    {cur==='splash'?<span data-go="map" className="pv-mapbtn" role="button" aria-label="ডেমো ম্যাপ"><Icon name="map" size={18}/></span>:null}
    {msg?<div className="pv-toast"><Toast lang="bn" tone="info" title={msg}/></div>:null}
  </div></div>;
}
ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
})();
