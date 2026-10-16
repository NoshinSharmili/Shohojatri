(()=>{
const {Icon,IconButton,BottomNav,Sidebar,Avatar,LanguageToggle,Tabs,Button,Stepper}=window.ShohojatriDesignSystem_1ff839;
const LOGO='assets/shohojatri-wordmark-bn.png';
function Sw({on=false,label}){const [v,setV]=React.useState(on);return <button type="button" role="switch" aria-checked={v} aria-label={label} className={'cm-sw'+(v?' on':'')} onClick={()=>setV(!v)}></button>;}
const FACES=[['frown','খুব কঠিন'],['annoyed','কঠিন'],['meh','মোটামুটি'],['smile','ভালো'],['laugh','খুব ভালো']];
function Faces({value}){const [v,setV]=React.useState(value);return <div className="cm-faces" role="radiogroup" aria-label="কেমন গেল">{FACES.map(([ic,l],i)=><button key={i} type="button" role="radio" aria-checked={v===i+1} className={'cm-face'+(v===i+1?' on':'')} onClick={()=>setV(i+1)}><Icon name={ic} size={28}/><span>{l}</span></button>)}</div>;}
function Bar({v,tone='var(--sj-leaf)'}){return <div className="cm-bar" role="progressbar" aria-valuenow={v} aria-valuemin="0" aria-valuemax="100"><i style={{width:v+'%',background:tone}}></i></div>;}
function Spark({data,color='var(--sj-teal)',w=360,h=110,max=5,goal}){
  const n=data.length,px=i=>8+i*(w-16)/(n-1),py=v=>h-10-(v/max)*(h-20);
  const d=data.map((v,i)=>(i?'L':'M')+px(i).toFixed(1)+' '+py(v).toFixed(1)).join(' ');
  return <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} role="img" aria-label="ট্রেন্ড চার্ট" style={{display:'block'}}>
    {[1,2,3,4,5].map(g=><line key={g} x1="0" x2={w} y1={py(g)} y2={py(g)} stroke="var(--sj-n-100)" strokeWidth="1"/>)}
    {goal?<line x1="0" x2={w} y1={py(goal)} y2={py(goal)} stroke="var(--sj-amber)" strokeWidth="2" strokeDasharray="5 5"/>:null}
    <path d={d+` L${px(n-1)} ${h-10} L${px(0)} ${h-10}Z`} fill={color} opacity=".10"/>
    <path d={d} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    {data.map((v,i)=><circle key={i} cx={px(i)} cy={py(v)} r={i===n-1?5:3} fill={i===n-1?color:'#fff'} stroke={color} strokeWidth="2"/>)}
  </svg>;
}
function Trend({dir='up',children}){return <span className={'cm-trend '+dir}><Icon name={dir==='up'?'trending-up':dir==='dn'?'trending-down':'minus'} size={16}/>{children}</span>;}
function ParentNav({value='home'}){return <div className="cm-navwrap"><BottomNav lang="bn" value={value} items={[{id:'home',label:'হোম',icon:'house'},{id:'child',label:'রাফি',icon:'sprout'},{id:'chat',label:'চ্যাট',icon:'message-circle'},{id:'rem',label:'রিমাইন্ডার',icon:'bell',badge:'২'}]}/></div>;}
function MHead({title,left='arrow-left',right}){return <header style={{flex:'none',display:'flex',alignItems:'center',gap:4,padding:'0 8px 4px',minHeight:56}}>
  <IconButton icon={left} label="ফিরে যান"/><div style={{flex:1,textAlign:'center',font:'600 17px var(--font-body)',color:'var(--text-1)'}}>{title}</div>{right||<span style={{width:48}}></span>}</header>;}
const WZ=['শিশুর তথ্য','রোগনির্ণয়','বৈশিষ্ট্য','কেয়ার টিম'];
function WStep({i,caption}){return <div style={{marginBottom:2}}><Stepper lang="bn" steps={WZ} current={i} caption={caption}/></div>;}
function Q({label,opt,children}){return <div className="cm-q"><div className="cm-label">{label}{opt?<i>(ঐচ্ছিক)</i>:null}</div>{children}</div>;}
function ChipSet({items,sel=[],other,multi=true}){
  const {Chip}=window.ShohojatriDesignSystem_1ff839;const [s,setS]=React.useState(sel);
  const tog=x=>setS(multi?(s.includes(x)?s.filter(y=>y!==x):[...s,x]):[x]);
  return <div className="cm-chips">{items.map(x=><Chip key={x} lang="bn" label={x} selected={s.includes(x)} onClick={()=>tog(x)}/>)}{other?<Chip lang="bn" icon={s.includes('__o')?undefined:'pencil'} label="অন্য (লিখুন)" selected={s.includes('__o')} onClick={()=>tog('__o')}/>:null}</div>;
}
const TABS=[['ov','ওভারভিউ'],['tl','টাইমলাইন'],['pg','অগ্রগতি'],['cp','কেয়ার প্ল্যান'],['dc','ডকুমেন্ট'],['ct','কেয়ার টিম'],['ch','চ্যাট']];
function Desk({tab,children,headRight}){const {Button}=window.ShohojatriDesignSystem_1ff839;
  return <div className="cm-desk" lang="bn">
    <Sidebar lang="bn" value="rafi" header={<img src={LOGO} alt="সহযাত্রী" style={{height:42,display:'block'}}/>}
      items={[{id:'home',label:'হোম',icon:'house'},{section:'আমার শিশু'},{id:'rafi',label:'রাফি',icon:'sprout'},{section:'আরও'},{id:'rem',label:'রিমাইন্ডার',icon:'bell',badge:'২'},{id:'act',label:'অ্যাক্টিভিটি',icon:'blocks'},{id:'set',label:'সেটিংস',icon:'settings'}]}
      footer={<div style={{display:'flex',alignItems:'center',gap:10,padding:'12px 8px 0',borderTop:'1px solid var(--border-1)'}}><Avatar name="সাবরিনা" size={40}/><div style={{flex:1,minWidth:0}}><div style={{fontWeight:600,fontSize:15}}>সাবরিনা হক</div><div style={{fontSize:13,color:'var(--text-3)'}}>অভিভাবক · রাফির মা</div></div></div>}/>
    <div className="cm-dmain">
      <div className="cm-dtop"><div className="cm-crumb"><span>আমার শিশু</span><Icon name="chevron-right" size={16}/><b>রাফি</b></div><LanguageToggle value="bn"/><IconButton icon="bell" label="রিমাইন্ডার"/></div>
      <div className="cm-dhead"><Avatar name="রাফি" size={64}/><div style={{flex:1,minWidth:0,display:'flex',flexDirection:'column',gap:4}}><h1>রাফি</h1><div className="cm-dmeta"><span>৩ বছর ২ মাস</span><span>·</span><span>অটিজম (ASD)</span><span>·</span><span>মিরপুর, ঢাকা</span><span className="cm-idpill"><Icon name="id-card" size={14}/>SJ-7K3QX</span></div></div>{headRight||<><Button variant="secondary" icon="file-text">স্ট্যাটাস রিপোর্ট</Button><Button icon="notebook-pen">লগ লিখুন</Button></>}</div>
      <div className="cm-dtabs"><Tabs lang="bn" value={tab} items={TABS.map(([id,label])=>({id,label,count:id==='ct'?'১':undefined}))}/></div>
      {children}
    </div>
  </div>;
}
Object.assign(window,{Sw,Faces,FACES,Bar,Spark,Trend,ParentNav,MHead,WStep,Q,ChipSet,Desk,LOGO});
})();
