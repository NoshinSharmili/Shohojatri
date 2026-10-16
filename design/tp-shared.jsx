(()=>{
const {Button,IconButton,TextField,Icon,Chip,Avatar,Toast,Tabs,SourceChip,LogEntryCard,RoleBadge,RiskBadge,ChatBubble,SuggestionCard,LanguageToggle,BottomNav,StateView}=window.ShohojatriDesignSystem_1ff839;
const R=r=>r==='teacher';
const RT=(role,a)=>(R(role)?'t-':'sp-')+a;

function TpHead({l,title,right}){return <header style={{flex:'none',display:'flex',alignItems:'center',gap:4,padding:'0 8px 4px',minHeight:56}}>
  <IconButton icon="arrow-left" label={tt(l,'ফিরে যান','Back')}/><div style={{flex:1,textAlign:'center',font:'600 17px var(--font-body)',color:'var(--text-1)'}}>{title}</div>{right||<span style={{width:48}}></span>}</header>;}
function RoleNav({role,l,value}){const t=R(role);return <div className="cm-navwrap"><BottomNav lang={l} value={value} items={[{id:'home',label:tt(l,'হোম','Home'),icon:'house'},{id:'kids',label:t?tt(l,'শিশুরা','Children'):tt(l,'রোগী','Patients'),icon:t?'users':'clipboard-list'},{id:'ai',label:tt(l,'সহকারী','Assistant'),icon:'sparkles'},{id:'me',label:tt(l,'প্রোফাইল','Profile'),icon:'user-round'}]}/></div>;}
function useTpToast(){const [t,setT]=React.useState(TPS.toast);React.useEffect(()=>{if(!TPS.toast)return;TPS.toast=null;const x=setTimeout(()=>setT(null),4000);return()=>clearTimeout(x);},[]);return [t,()=>setT(null)];}
function TpToast({l,desk}){const [t,close]=useTpToast();return t?<div className={desk?'tp-dtoast':'tp-toast'}><Toast lang={l} tone="success" title={t.t} message={t.m} onClose={close} closeLabel={tt(l,'লুকান','Hide')}/></div>:null;}

/* child card (teacher + specialist) */
function KidCard({k,l,role}){const i=ix(l);const t=R(role);
  return <div className="tp-kid" data-go={RT(role,'child')} data-child={k.id} role="button" aria-label={k.name[i]}>
    <div className="tp-kid-h"><KidAv k={k} l={l} size={52}/><div className="tp-kid-n"><b>{k.name[i]}<NewBadge k={k} l={l}/></b><span>{k.age[i]} · <span className="cm-idpill" style={{fontSize:12}}>{k.code}</span></span></div><Icon name="chevron-right" size={20} color="var(--text-3)"/></div>
    <div className="tp-kid-last"><Icon name="history" size={15}/>{k.last[i]}</div>
    {t?null:<div className="tp-kid-last"><Icon name="calendar-clock" size={15}/>{tt(l,'ফলো-আপ: ','Follow-up: ')}<b style={{color:'var(--text-1)',fontWeight:600}}>{k.next[i]}</b></div>}
    <div className="tp-kid-act"><span data-go={RT(role,'note')} data-child={k.id} className="tp-go"><Button size="sm" variant="secondary" icon="notebook-pen">{tt(l,'নোট লিখুন','Write note')}</Button></span><span data-go={RT(role,'chat')} data-child={k.id} className="tp-go"><Button size="sm" variant="secondary" icon="sparkles">{tt(l,'জিজ্ঞেস করুন','Ask')}</Button></span></div>
  </div>;}

/* request access + pending */
function ReqSection({l,role,compact}){const [sent,setSent]=React.useState(!!TPS.sent[role]);const [id,setId]=React.useState(TPS.sent[role]||'');
  const t=R(role);
  const send=()=>{const v=(id||'').trim()||'SJ-4H2PL';TPS.sent[role]=v;setId(v);setSent(true);};
  const again=()=>{TPS.sent[role]='';setId('');setSent(false);};
  return <div className="tp-sec">
    <div className="cm-panel">
      <h2 className="cm-h2" style={{fontSize:18}}><Icon name="user-round-plus" size={20}/>{tt(l,'শিশুর অ্যাক্সেস চান','Request access to a child')}</h2>
      {sent?<><div className="cm-note leaf"><Icon name="circle-check" size={18}/><span>{tt(l,'আইডি সঠিক হলে অভিভাবককে জানানো হয়েছে। তিনি অনুমোদন দিলে শিশুটি এখানে দেখা যাবে।','If the ID is correct, the parent has been notified. Once they approve, the child will appear here.')}</span></div>
        <span><Button size="sm" variant="ghost" icon="plus" onClick={again}>{tt(l,'আরেকটি অনুরোধ','Another request')}</Button></span></>:<>
        <p className="cm-sub" style={{fontSize:15}}>{tt(l,'অভিভাবকের কাছ থেকে শিশুর আইডি নিন। অনুমোদনের পর '+(t?'শিক্ষা-সংক্রান্ত':'ক্লিনিক্যাল')+' তথ্য দেখতে পাবেন।','Ask the parent for the Child ID. Once approved you’ll see '+(t?'education':'clinical')+' information.')}</p>
        <TextField lang={l} label={tt(l,'শিশুর আইডি','Child ID')} icon="id-card" placeholder={tt(l,'যেমন SJ-7K3QX','e.g. SJ-7K3QX')} value={id} onChange={v=>setId(v.toUpperCase())}/>
        <TextField lang={l} label={tt(l,'ছোট বার্তা','Short message')} optionalLabel={tt(l,'(ঐচ্ছিক)','(optional)')} multiline rows={2} defaultValue={t?tt(l,'আমি আলো বিশেষ বিদ্যালয়ে ওর শিক্ষিকা।','I’m their teacher at Alo Special School.'):tt(l,'আমি ওর ডেভেলপমেন্টাল পেডিয়াট্রিশিয়ান।','I’m their developmental paediatrician.')}/>
        <Button icon="send" onClick={send} block={!compact}>{tt(l,'অনুরোধ পাঠান','Send request')}</Button></>}
    </div>
    <h2 className="cm-h2" style={{fontSize:17}}><Icon name="hourglass" size={18}/>{tt(l,'অপেক্ষমাণ অনুরোধ','Pending requests')}</h2>
    <div className="cm-list">
      {sent?<div className="cm-li"><Tile icon="send" tone="sky" size={40}/><div className="cm-li-t"><b style={{fontFamily:"'Baloo Da 2',var(--font-display)",letterSpacing:'.03em'}}>{id}</b><span>{tt(l,'এইমাত্র পাঠানো','Sent just now')}</span></div><span className="cm-tag sky">{tt(l,'পাঠানো','Sent')}</span></div>:null}
      <div className="cm-li"><Tile icon="hourglass" tone="warm" size={40}/><div className="cm-li-t"><b>{t?tt(l,'মিম · SJ-4H2PL','Mim · SJ-4H2PL'):tt(l,'রিয়া · SJ-1TB6C','Ria · SJ-1TB6C')}</b><span>{tt(l,'২ দিন আগে পাঠানো','Sent 2 days ago')}</span></div><span className="cm-tag warm">{tt(l,'অপেক্ষমাণ','Pending')}</span></div>
      <div className="cm-li"><Tile icon="circle-x" tone="sky" size={40}/><div className="cm-li-t"><b style={{fontFamily:"'Baloo Da 2',var(--font-display)",letterSpacing:'.03em'}}>SJ-9QW2E</b><span>{tt(l,'অভিভাবক এখন অ্যাক্সেস দেননি। প্রয়োজনে সরাসরি কথা বলে আবার চেষ্টা করুন।','The parent hasn’t given access for now. Talk to them directly and try again if needed.')}</span></div><span className="cm-tag">{tt(l,'ফিরিয়ে দেওয়া','Declined')}</span></div>
    </div>
  </div>;}

/* profile pieces */
function ProfileHead({k,l,role}){const i=ix(l);return <div className="tp-phead">
  <div className="tp-phead-r"><KidAv k={k} l={l} size={64}/><div style={{flex:1,minWidth:0,display:'flex',flexDirection:'column',gap:4}}><h1>{k.name[i]}</h1><div className="tp-meta"><span>{k.age[i]}</span><span className="cm-idpill"><Icon name="id-card" size={14}/>{k.code}</span></div></div></div>
  <div className="tp-dx"><b>{k.dx[i]}</b> — {k.dxs[i]}</div>
  <div className="tp-teamrow"><TeamStack k={k} l={l}/><span>{k.team.map(m=>m[1+i]).join(' · ')}</span></div>
  <span className="tp-scope"><Icon name="lock" size={13}/>{R(role)?tt(l,'আপনার অ্যাক্সেস: শিক্ষা','Your access: education'):tt(l,'আপনার অ্যাক্সেস: ক্লিনিক্যাল','Your access: clinical')}</span>
</div>;}
function NowCard({k,l}){const i=ix(l);return <div className="cm-hero"><div className="cm-eyebrow"><Icon name="sparkles" size={16}/>{tt(l,'এখন '+k.name[0],k.name[1]+' now')}<span>{tt(l,'এআই সারাংশ · আজ সকাল ৮টা','AI summary · today 8 am')}</span></div>
  <ul className="tp-bul">{k.sum.map((s,j)=><li key={j}><span>{s[i]}</span><SourceChip lang={l} kind={s[2]} label={s[3+i]}/></li>)}</ul></div>;}
const FACT=[['message-circle','কীভাবে কথা বোঝায়','How they communicate','sky'],['zap','যা অস্থির করে','What unsettles','warm'],['heart-handshake','যা শান্ত করে','What calms','calm'],['star','শক্তি ও আগ্রহ','Strengths & interests','leaf']];
function Facts({k,l,four}){const i=ix(l);return <div className={'tp-facts'+(four?' four':'')}>{FACT.map((f,j)=><div key={j} className={'tp-fact '+f[3]}><b><Icon name={f[0]} size={15}/>{f[1+i]}</b><span>{k.facts[j][i]}</span></div>)}</div>;}
function GoalList({k,l}){const i=ix(l);return <div className="cm-list">{k.goals.map((g,j)=><div key={j} className="cm-goal"><div className="cm-goal-t"><span>{g[i]}</span><em>{dg(l,g[4])}%</em></div><Bar v={g[4]} tone={g[4]<40?'var(--sj-amber)':'var(--sj-leaf)'}/><div className="cm-goal-m"><span className="cm-tag">{g[2+i]}</span></div></div>)}</div>;}
function series(v,dir){const end=1+v/100*3.6,start=dir==='dn'?end+.9:dir==='flat'?end-.1:end-1.2;return [0,1,2,3,4,5,6,7].map(j=>Math.max(.4,Math.min(4.8,start+(end-start)*j/7+(j%2?.12:-.08))));}
function Charts({k,l,cols=1,w=320}){const i=ix(l);const dirs=[k.trend,k.trend==='dn'?'flat':'up'];
  return <div style={{display:'grid',gridTemplateColumns:`repeat(${cols},minmax(0,1fr))`,gap:12}}>{k.goals.slice(0,2).map((g,j)=>{const d=dirs[j];return <div key={j} className="cm-chart"><div className="cm-chart-h"><Tile icon={d==='dn'?'trending-down':'chart-line'} tone={d==='dn'?'warm':'calm'} size={32}/><b style={{fontSize:16}}>{g[2+i]}</b><Trend dir={d}>{d==='up'?tt(l,'বেড়েছে','Up'):d==='dn'?tt(l,'নজর দিন','Watch'):tt(l,'একই রকম','Steady')}</Trend></div><Spark data={series(g[4],d)} color={d==='dn'?'var(--sj-amber)':'var(--sj-teal)'} w={w} h={90}/><div className="cm-axis"><span>{tt(l,'৮ সপ্তাহ আগে','8 weeks ago')}</span><span>{tt(l,'এই সপ্তাহ','This week')}</span></div></div>;})}</div>;}
function Screening({k,l}){const i=ix(l);return <div className="cm-panel"><h2 className="cm-h2" style={{fontSize:17}}><Icon name="clipboard-list" size={18}/>{tt(l,'সংযুক্ত স্ক্রিনিং রিপোর্ট','Attached screening report')}</h2>
  <div className="tp-scr"><RiskBadge level={k.scr[0]} lang={l}/><b>{dg(l,k.scr[1])}/{dg(l,20)}</b><span>{tt(l,'স্ক্রিনিং · সেপ্টে ২০২৬','Screening · Sep 2026')}</span></div>
  <div style={{fontSize:13,color:'var(--text-2)'}}>{tt(l,'এটি রোগনির্ণয় নয় — অভিভাবক শেয়ার করেছেন।','Not a diagnosis — shared by the parent.')}</div>
  <span data-go="dr-report-sp" className="tp-goi"><Button size="sm" variant="secondary" icon="file-text">{tt(l,'পূর্ণ রিপোর্ট','Full report')}</Button></span></div>;}
function Meds({k,l}){const i=ix(l);return <div className="cm-panel"><h2 className="cm-h2" style={{fontSize:17}}><Icon name="pill" size={18}/>{tt(l,'ওষুধ (যেভাবে লেখা আছে)','Medication (as prescribed)')}</h2>
  {k.meds.length?k.meds.map((m,j)=><div key={j} className="tp-med"><Tile icon="pill" tone="sky" size={36}/><div>{m[i]}<span>{m[2+i]}</span></div></div>):<div style={{fontSize:15,color:'var(--text-2)'}}>{tt(l,'কোনো ওষুধ লেখা নেই।','No medication recorded.')}</div>}</div>;}
function ScrMini({k,l}){const i=ix(l);return <div className="cm-panel" style={{gap:10}}><h2 className="cm-h2" style={{fontSize:17}}><Icon name="clipboard-list" size={18}/>{tt(l,'স্ক্রিনিং রিপোর্ট','Screening report')}<a className="asd" data-go="dr-report-sp">{tt(l,'পূর্ণ রিপোর্ট','Full report')}</a></h2>
  <div className="tp-scr"><RiskBadge level={k.scr[0]} lang={l}/><b>{dg(l,k.scr[1])}/{dg(l,20)}</b><span>{tt(l,'সেপ্টে ২০২৬','Sep 2026')}</span></div></div>;}
function MedsMini({k,l}){const i=ix(l);return <div className="cm-panel" style={{gap:8}}><h2 className="cm-h2" style={{fontSize:17}}><Icon name="pill" size={18}/>{tt(l,'ওষুধ','Medication')}</h2>
  {k.meds.length?k.meds.slice(0,2).map((m,j)=><div key={j} style={{display:'flex',flexDirection:'column',gap:2}}><span style={{fontWeight:600}}>{m[i]}</span><span style={{fontSize:14,color:'var(--text-2)'}}>{m[2+i]}</span></div>):<div style={{fontSize:15,color:'var(--text-2)'}}>{tt(l,'কোনো ওষুধ লেখা নেই।','No medication recorded.')}</div>}</div>;}
function Timeline({k,l,filter}){const [f,setF]=React.useState('all');const list=allTl(k,l).filter(e=>f==='all'||e.role===f);
  return <div className="tp-sec">
    {filter?<Tabs lang={l} variant="pill" value={f} onChange={setF} items={[{id:'all',label:tt(l,'সব','All')},{id:'parent',label:tt(l,'অভিভাবক','Parent')},{id:'teacher',label:tt(l,'শিক্ষক','Teacher')},{id:'specialist',label:tt(l,'বিশেষজ্ঞ','Specialist')}]}/>:null}
    {list.length?list.map((e,j)=><div key={j} style={{position:'relative'}}>{e.isNew?<span className="cm-tag leaf" style={{position:'absolute',right:14,top:-8,zIndex:1}}><Icon name="sparkle" size={12}/>{tt(l,'নতুন','New')}</span>:null}<LogEntryCard lang={l} author={e.author} role={e.role} time={e.time} title={e.title||undefined} body={e.body} tags={(e.tags||[]).map(t=>({label:t,tone:'calm'}))}/></div>):<div className="cm-note"><Icon name="info" size={18}/><span>{tt(l,'এই ভূমিকা থেকে কোনো এন্ট্রি নেই।','No entries from this role.')}</span></div>}
  </div>;}

/* mobile child profile */
function ProfileM({role,l}){const k=curKid();const t=R(role);return <Phone><StatusBar/>
  <TpHead l={l} title={tt(l,'শিশুর প্রোফাইল','Child profile')} right={<LanguageToggle value={l}/>}/>
  <div className="cm-body">
    <ProfileHead k={k} l={l} role={role}/>
    <NowCard k={k} l={l}/>
    <section className="tp-sec"><h2 className="cm-h2"><Icon name="lightbulb" size={20}/>{tt(l,'দ্রুত জেনে নিন','Quick facts')}</h2><Facts k={k} l={l}/></section>
    {t?null:<>{k.scrAtt===0?null:<ScrMini k={k} l={l}/>}<MedsMini k={k} l={l}/></>}
    <section className="tp-sec"><h2 className="cm-h2"><Icon name="target" size={20}/>{tt(l,'চলমান লক্ষ্য','Active goals')}</h2><GoalList k={k} l={l}/></section>
    <section className="tp-sec"><h2 className="cm-h2"><Icon name="history" size={20}/>{tt(l,'সাম্প্রতিক টাইমলাইন','Recent timeline')}</h2><Timeline k={k} l={l}/></section>
  </div>
  <div className="cm-foot"><span data-go={RT(role,'note')} className="tp-go"><Button block size="lg" icon="notebook-pen">{t?tt(l,'ক্লাসের নোট যোগ করুন','Add class note'):tt(l,'ক্লিনিক্যাল নোট যোগ করুন','Add clinical note')}</Button></span><span data-go={RT(role,'chat')} className="tp-go"><Button block variant="secondary" icon="sparkles">{tt(l,'সহযাত্রী AI-কে জিজ্ঞেস করুন','Ask Shohojatri AI')}</Button></span></div>
  <TpToast l={l}/>
</Phone>;}

/* note form */
const FACES_EN=['Very hard','Hard','Okay','Good','Very good'];
function RateFaces({l,onChange,init=4}){const [v,setV]=React.useState(init);return <div className="cm-faces" role="radiogroup" aria-label={tt(l,'কেমন গেল','How did it go')}>{FACES.map(([ic,b],j)=><button key={j} type="button" role="radio" aria-checked={v===j+1} className={'cm-face'+(v===j+1?' on':'')} onClick={()=>{setV(j+1);onChange&&onChange(j+1);}}><Icon name={ic} size={26}/><span>{l==='en'?FACES_EN[j]:b}</span></button>)}</div>;}
function NoteForm({k,l,role}){const i=ix(l);const t=R(role);
  const F=t?[[tt(l,'অংশগ্রহণ','Participation'),tt(l,'সকালের বৃত্তে পুরো সময় বসে ছিল','Sat through the whole morning circle'),0],[tt(l,'যোগাযোগ','Communication'),tt(l,'ছবি কার্ড দেখিয়ে পানি চাইল','Asked for water with a picture card'),0],[tt(l,'আচরণ','Behaviour'),tt(l,'নাস্তার আগে হালকা আপত্তি','Mild protest before snack'),0],[tt(l,'যা কাজ করেছে','What worked'),tt(l,'২ মিনিটের সংকেত ও “আগে-তারপর” বোর্ড','2-minute warning and a first–then board'),1]]
    :[[tt(l,'সেশনের বিষয়','Session focus'),tt(l,'দুই শব্দের বাক্য ও পালা নেওয়া','Two-word phrases and turn-taking'),0],[tt(l,'লক্ষ্যে অগ্রগতি','Progress on goals'),tt(l,'পছন্দের খেলায় ৩ বার দুই শব্দ বলেছে','Used two words 3 times in preferred play'),1],[tt(l,'বাড়িতে করণীয়','Home actions'),tt(l,'বুদবুদ খেলায় “আরও বুদবুদ” মডেল করুন, রোজ ১০ মিনিট','Model “more bubbles” in bubble play, 10 min daily'),1]];
  React.useState(()=>{TPS.draft={lang:l,role:t?'teacher':'specialist',fields:F.map(f=>[f[0],f[1]]),domains:t?[tt(l,'সামাজিক','Social'),tt(l,'আচরণ','Behaviour')]:[tt(l,'ভাষা','Language')],free:'',vis:'team',goal:0,prog:'some',review:t?'':'2026-11-12'};});
  const d=TPS.draft||{domains:[],fields:[]};
  const [doms,setDoms]=React.useState(d.domains);const [goal,setGoal]=React.useState(0);const [prog,setProg]=React.useState('some');const [vis,setVis]=React.useState('team');
  const togD=x=>{const n=doms.includes(x)?doms.filter(y=>y!==x):[...doms,x];setDoms(n);if(TPS.draft)TPS.draft.domains=n;};
  return <div style={{display:'flex',flexDirection:'column',gap:18}}>
    <div className="cm-row"><KidAv k={k} l={l} size={44}/><div style={{flex:1}}><div style={{font:'700 18px var(--font-display)'}}>{k.name[i]}</div><div style={{fontSize:14,color:'var(--text-2)'}}>{tt(l,'আজ, ১৬ অক্টোবর','Today, 16 October')}</div></div><span className="cm-tag navy">{t?tt(l,'ক্লাস নোট','Class note'):tt(l,'ক্লিনিক্যাল নোট','Clinical note')}</span></div>
    {F.map((f,j)=><TextField key={j} lang={l} label={f[0]} multiline={!!f[2]} rows={2} defaultValue={f[1]} onChange={v=>{if(TPS.draft)TPS.draft.fields[j][1]=v;}}/>)}
    {t?null:<TextField lang={l} label={tt(l,'পরবর্তী রিভিউ','Next review')} type="date" icon="calendar" defaultValue="2026-11-12" onChange={v=>{if(TPS.draft)TPS.draft.review=v;}}/>}
    <div><div className="cm-label">{tt(l,'বিষয়','Domains')}</div><div className="cm-chips">{TP_DOMS.map(x=>{const lab=x[i];return <Chip key={lab} lang={l} label={lab} icon={doms.includes(lab)?undefined:x[2]} selected={doms.includes(lab)} onClick={()=>togD(lab)}/>;})}</div></div>
    {t?<div><div className="cm-label">{tt(l,'আজ কেমন গেল?','How did today go?')}</div><RateFaces l={l}/></div>:null}
    {true?<TextField lang={l} label={tt(l,'আরও কিছু','Anything else')} optionalLabel={tt(l,'(ঐচ্ছিক)','(optional)')} multiline rows={2} placeholder={tt(l,'নিজের ভাষায় লিখুন…','Write in your own words…')} onChange={v=>{if(TPS.draft)TPS.draft.free=v;}}/>:null}
    <div><div className="cm-label">{tt(l,'লক্ষ্যের সাথে যুক্ত করুন','Link to a goal')}{t?<i>{tt(l,'(ঐচ্ছিক)','(optional)')}</i>:null}</div>
      <div className="cm-chips" style={{marginBottom:10}}>{k.goals.map((g,j)=><Chip key={j} lang={l} label={g[i]} selected={goal===j} onClick={()=>setGoal(goal===j?-1:j)}/>)}</div>
      {goal>=0?<div className="rs-seg">{[['none',tt(l,'অগ্রগতি নেই','No progress')],['some',tt(l,'কিছুটা','Some')],['good',tt(l,'ভালো','Good')],['done',tt(l,'অর্জিত','Achieved')]].map(([x,lab])=><button key={x} type="button" className={prog===x?'on':''} onClick={()=>setProg(x)}>{lab}</button>)}</div>:null}</div>
    <div><div className="cm-label">{tt(l,'কারা দেখতে পাবেন','Who can see this')}</div><div style={{display:'flex',flexDirection:'column',gap:8}}>
      {[['team','users',tt(l,'কেয়ার টিম','Care team'),k.team.map(m=>m[1+i]).join(', ')],t?['me','lock',tt(l,'শুধু আমি','Only me'),tt(l,'ব্যক্তিগত নোট — কেউ দেখবেন না','Private — nobody else sees it')]:['clin','stethoscope',tt(l,'শুধু ক্লিনিক্যাল','Clinical only'),tt(l,'অভিভাবক ও শিক্ষক দেখবেন না','Hidden from parent and teacher')]].map(([x,ic,a,b])=><div key={x} role="radio" aria-checked={vis===x} className={'cm-pick'+(vis===x?' on':'')} onClick={()=>{setVis(x);if(TPS.draft)TPS.draft.vis=x;}}><span className="cm-radio"></span><Icon name={ic} size={20} color="var(--sj-navy)"/><div style={{flex:1}}><div style={{fontWeight:600}}>{a}</div><div style={{fontSize:14,color:'var(--text-2)'}}>{b}</div></div></div>)}
    </div></div>
  </div>;}
function NoteM({role,l}){const k=curKid();const t=R(role);return <Phone><StatusBar/>
  <header style={{flex:'none',display:'flex',alignItems:'center',gap:4,padding:'0 8px 4px',minHeight:56}}><IconButton icon="x" label={tt(l,'বন্ধ করুন','Close')}/><div style={{flex:1,textAlign:'center',font:'600 17px var(--font-body)'}}>{t?tt(l,'ক্লাসের নোট','Class note'):tt(l,'ক্লিনিক্যাল নোট','Clinical note')}</div><span style={{width:48}}></span></header>
  <div className="cm-body"><NoteForm k={k} l={l} role={role}/></div>
  <div className="cm-foot"><span data-go={RT(role,'child')} data-act="save" className="tp-go"><Button block size="lg" icon="check">{tt(l,'সেভ করুন','Save')}</Button></span></div>
</Phone>;}

/* chat */
function answer(k,l,role,q){const i=ix(l),n=k.name[i],g=k.gen[i];const G=k.goals.map(x=>x[i]+' — '+dg(l,x[4])+'%');
  if(R(role)){
    if(q===0)return {lead:tt(l,'আজ ১০ মিনিটের ছোট একটা কাজ চেষ্টা করে দেখতে পারেন:','You could try a short 10-minute activity today:'),pts:[tt(l,'লক্ষ্য: ','Goal: ')+G[0],tt(l,'আগ্রহ কাজে লাগান — ','Use their interests — ')+k.facts[3][i],tt(l,'শুরুর আগে ছবি দিয়ে “আগে … তারপর …” দেখান','Show a first–then picture before starting'),tt(l,'যেভাবে কথা বোঝায়: ','How they communicate: ')+k.facts[0][i]],src:[[tt(l,'কেয়ার প্ল্যান','Care plan'),'doc'],[k.sum[0][3+i],k.sum[0][2]]],x:'note'};
    if(q===1)return {lead:tt(l,'লগ অনুযায়ী যা অস্থির করে: ','From the logs, what unsettles '+n+': ')+k.facts[1][i]+tt(l,'।','.'),pts:[tt(l,'যা কাজ করেছে: ','What has worked: ')+k.facts[2][i],tt(l,'আগে থেকে সংকেত দিন — যেমন ২ মিনিট আগে','Give a heads-up — e.g. 2 minutes before'),tt(l,'শান্ত হলে ছোট প্রশংসা, চাপ দেবেন না','Brief praise once calm; no pressure')],src:[[tt(l,'শিক্ষিকার নোট','Teacher’s notes'),'report'],[tt(l,'অভিভাবকের লগ','Parent logs'),'log']],x:'note'};
    return {lead:tt(l,'এই মাসে '+g+' অগ্রগতি সংক্ষেপে:',n+'’s progress this month:'),pts:[k.sum[0][i],k.sum[1][i],...G],src:[[k.sum[0][3+i],k.sum[0][2]],[k.sum[1][3+i],k.sum[1][2]]],x:'report'};}
  if(q===0)return {lead:tt(l,'গত ফলো-আপের পর থেকে:','Since the last follow-up:'),pts:k.sum.map(s=>s[i]),src:k.sum.slice(0,3).map(s=>[s[3+i],s[2]])};
  if(q===1)return {lead:tt(l,'ফলো-আপের প্রস্তুতি — '+k.nextD[0],'Follow-up prep — '+k.nextD[1]),pts:[tt(l,'লক্ষ্য: ','Goals: ')+G.join('; '),tt(l,'ওষুধ: ','Medication: ')+(k.meds.length?k.meds[0][i]:tt(l,'নেই','none')),tt(l,'স্ক্রিনিং: ','Screening: ')+dg(l,k.scr[1])+'/'+dg(l,20),tt(l,'আলোচনা: ','Discuss: ')+k.mm[i]],src:[[tt(l,'টাইমলাইন','Timeline'),'log'],[tt(l,'স্ক্রিনিং রিপোর্ট','Screening report'),'doc']],x:'report'};
  return {lead:k.mm[i],pts:[],src:[[tt(l,'শিক্ষকের নোট','Teacher notes'),'report'],[tt(l,'অভিভাবকের লগ','Parent logs'),'log']]};}
function qs(k,l,role){const i=ix(l),n=k.name[i],g=k.gen[i];return R(role)?[tt(l,'আজ ক্লাসে '+g+' জন্য কোন কাজটা ভালো?','What activity suits '+n+' in class today?'),tt(l,n+' অস্থির হলে কী করলে শান্ত হয়?','What calms '+n+' when unsettled?'),tt(l,'এই মাসের অগ্রগতি সংক্ষেপে বলো','Summarise this month’s progress')]
  :[tt(l,'গত ফলো-আপের পর থেকে কী বদলেছে?','What changed since the last follow-up?'),tt(l,'ফলো-আপের প্রস্তুতি দাও','Prepare me for the follow-up'),tt(l,'শিক্ষক ও অভিভাবকের পর্যবেক্ষণে অমিল আছে কি?','Do teacher and parent observations differ?')];}
function ChatCore({k,l,role,desk}){const i=ix(l);const Q=qs(k,l,role);const [msgs,setMsgs]=React.useState([]);const [busy,setBusy]=React.useState(false);const [txt,setTxt]=React.useState('');const [hide,setHide]=React.useState({});const ref=React.useRef();
  React.useEffect(()=>{const el=ref.current;if(el)el.scrollTop=el.scrollHeight;},[msgs,busy]);
  const ask=(q,label)=>{if(busy)return;setMsgs(m=>[...m,{u:label}]);setBusy(true);setTimeout(()=>{setMsgs(m=>[...m,{a:answer(k,l,role,q),id:m.length}]);setBusy(false);},900);};
  const send=()=>{const v=txt.trim();if(!v)return;setTxt('');ask(R(role)?2:0,v);};
  const t=R(role);
  return <><div className="cm-thread" ref={ref} style={desk?{padding:'20px 32px'}:null}>
    <ChatBubble lang={l} from="assistant">{t?tt(l,'নমস্কার, নাসরিন আপা। আমি শুধু '+k.gen[0]+' রেকর্ড — অভিভাবকের লগ, ক্লাস নোট ও বিশেষজ্ঞের নোট — থেকে উত্তর দিই। নিচের একটা প্রশ্ন দিয়ে শুরু করতে পারেন।','Hello, Nasrin Apa. I only answer from '+k.gen[1]+' records — parent logs, class notes and specialist notes. Start with one of the questions below.')
      :tt(l,'ডা. তানভীর, '+k.gen[0]+' রেকর্ড থেকে সংক্ষিপ্ত, সূত্রসহ উত্তর দেব। এটি ক্লিনিক্যাল সিদ্ধান্তের বিকল্প নয়।','Dr. Tanvir, I’ll give concise, sourced answers from '+k.gen[1]+' records. Not a substitute for clinical judgement.')}</ChatBubble>
    {msgs.map((m,j)=>m.u?<ChatBubble key={j} lang={l} from="user">{m.u}</ChatBubble>:<React.Fragment key={j}>
      <ChatBubble lang={l} from="assistant" sourcesLabel={tt(l,'সূত্র','Sources')} sources={m.a.src.map(s=>({label:s[0],kind:s[1]}))}><div style={{display:'flex',flexDirection:'column',gap:6}}><span>{m.a.lead}</span>{m.a.pts.length?<ul style={{margin:0,paddingLeft:20,display:'flex',flexDirection:'column',gap:4}}>{m.a.pts.map((p,x)=><li key={x}>{p}</li>)}</ul>:null}</div></ChatBubble>
      {m.a.x==='note'&&!hide[j]?<div className="cm-act"><SuggestionCard lang={l} eyebrow={tt(l,'নোটের খসড়া — যাচাই করুন','Draft note — please review')} title={k.name[i]+' · '+k.goals[0][i]} body={m.a.pts[0]} labels={{confirm:tt(l,'নোট হিসেবে যোগ করুন','Add as note'),edit:tt(l,'সম্পাদনা','Edit'),dismiss:tt(l,'বাদ দিন','Dismiss')}} onDismiss={()=>setHide(h=>({...h,[j]:1}))}/></div>:null}
      {m.a.x==='report'?<div className="cm-act"><div className="cm-rep"><h3><Icon name="file-text" size={18}/>{t?tt(l,'স্ট্যাটাস রিপোর্ট · শিক্ষকের জন্য','Status report · for teachers'):tt(l,'স্ট্যাটাস রিপোর্ট · ডাক্তারের জন্য','Status report · for doctors')}</h3><p style={{fontSize:15,color:'var(--text-2)'}}>{tt(l,'১৬ সেপ্টে – ১৬ অক্টো · লক্ষ্য, পর্যবেক্ষণ, '+(t?'ক্লাসে যা কাজ করে':'ওষুধ ও আলোচনার বিষয়'),'16 Sep – 16 Oct · goals, observations, '+(t?'what works in class':'medication and discussion points'))}</p><span data-go={RT(role,'report')+(desk?'-d':'')} className="tp-goi"><Button size="sm" iconRight="arrow-right">{tt(l,'পুরো রিপোর্ট খুলুন','Open full report')}</Button></span></div></div>:null}
    </React.Fragment>)}
    {busy?<div className="tp-thinking"><Dots/>{tt(l,k.gen[0]+' রেকর্ড দেখছি…','Checking '+k.gen[1]+' records…')}</div>:null}
  </div>
  <div className="tp-chipsx">{Q.map((q,j)=><Chip key={j} lang={l} label={q} onClick={()=>ask(j,q)}/>)}</div>
  <div className={'tp-composer'+(desk?' d':'')}><input className="tp-inp" value={txt} onChange={e=>setTxt(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')send();}} placeholder={tt(l,k.gen[0]+' বিষয়ে প্রশ্ন লিখুন…','Ask about '+k.name[1]+'…')} aria-label={tt(l,'প্রশ্ন','Question')}/><IconButton icon="send" label={tt(l,'প্রশ্ন দিন','Ask')} onClick={send}/></div></>;}
function ChatHead({k,l,role}){const i=ix(l);return <div className="cm-chathead"><IconButton icon="arrow-left" label={tt(l,'ফিরে যান','Back')}/><span className="sj-tile" style={{width:40,height:40,background:'var(--sj-sky-50)',color:'var(--sj-navy)',borderRadius:12,display:'inline-flex',alignItems:'center',justifyContent:'center'}}><Icon name="sparkles" size={20}/></span><div style={{flex:1,minWidth:0}}><b>{tt(l,'সহযাত্রী AI · '+k.name[0],'Shohojatri AI · '+k.name[1])}</b><span>{tt(l,'শুধু '+k.gen[0]+' রেকর্ড থেকে','Only from '+k.gen[1]+' records')}</span></div><span data-go={RT(role,'report')} className="tp-goi"><Button size="sm" variant="secondary" icon="file-text">{tt(l,'রিপোর্ট','Report')}</Button></span></div>;}
function ChatM({role,l}){const k=curKid();return <Phone><StatusBar/><ChatHead k={k} l={l} role={role}/><ChatCore k={k} l={l} role={role}/></Phone>;}

/* status report */
function ReportDoc({k,l,role,sfx}){const i=ix(l);const t=R(role);const par=k.tl.find(e=>e[0]==='parent');
  return <>
    <div className="cm-row"><KidAv k={k} l={l} size={56}/><div style={{flex:1}}><h1 className="cm-h1" style={{fontSize:22}}>{tt(l,k.name[0]+' · স্ট্যাটাস রিপোর্ট',k.name[1]+' · Status report')}</h1><div style={{fontSize:14,color:'var(--text-2)'}}>{tt(l,'১৬ সেপ্টে – ১৬ অক্টো ২০২৬ · ','16 Sep – 16 Oct 2026 · ')}{t?tt(l,'শিক্ষকের জন্য','For teachers'):tt(l,'ডাক্তারের জন্য','For doctors')}</div></div></div>
    <div className="cm-hero"><div className="cm-eyebrow"><Icon name="sparkles" size={16}/>{tt(l,'সংক্ষেপে','In brief')}<span>{tt(l,'এআই খসড়া','AI draft')}</span></div><ul className="tp-bul">{k.sum.map((s,j)=><li key={j}><span>{s[i]}</span><SourceChip lang={l} kind={s[2]} label={s[3+i]}/></li>)}</ul></div>
    {t?<div className="cm-rep"><h3><Icon name="school" size={18}/>{tt(l,'ক্লাসে যা কাজ করে','What works in class')}</h3><p><b>{tt(l,'শান্ত করে: ','Calms: ')}</b>{k.facts[2][i]}</p><p><b>{tt(l,'আগ্রহ: ','Interests: ')}</b>{k.facts[3][i]}</p><p><b>{tt(l,'এড়িয়ে চলুন: ','Avoid: ')}</b>{k.facts[1][i]}</p></div>
      :<div className="cm-rep"><h3><Icon name="chart-line" size={18}/>{tt(l,'ক্ষেত্রভিত্তিক ট্রেন্ড','Domain trends')}</h3>{k.goals.map((g,j)=>{const d=j?(k.trend==='dn'?'flat':'up'):k.trend;return <div key={j} className="cm-dom"><span>{g[2+i]}</span><div style={{width:90}}><Spark data={series(g[4],d)} w={90} h={30} color={d==='dn'?'var(--sj-amber)':'var(--sj-teal)'}/></div><Trend dir={d}>{d==='up'?tt(l,'বেড়েছে','Up'):d==='dn'?tt(l,'নজর দিন','Watch'):tt(l,'একই','Steady')}</Trend></div>;})}</div>}
    <div className="cm-rep"><h3><Icon name="target" size={18}/>{tt(l,'লক্ষ্য','Goals')}</h3>{k.goals.map(g=><div key={g[0]} style={{display:'flex',flexDirection:'column',gap:4}}><div style={{display:'flex',fontSize:15}}><span style={{flex:1}}>{g[i]}</span><b style={{fontFamily:'var(--font-display)',color:'var(--sj-ink-leaf)'}}>{dg(l,g[4])}%</b></div><Bar v={g[4]} tone={g[4]<40?'var(--sj-amber)':'var(--sj-leaf)'}/></div>)}</div>
    {t?(par?<div className="cm-rep"><h3><Icon name="house" size={18}/>{tt(l,'বাড়ি থেকে','From home')}</h3><p>{par[7+i]}</p><div className="cm-srcs"><SourceChip lang={l} kind="log" label={par[1+i]+' · '+par[3+i]}/></div></div>:null)
      :<><div className="cm-rep"><h3><Icon name="pill" size={18}/>{tt(l,'ওষুধ','Medication')}</h3><p>{k.meds.length?k.meds[0][i]+' · '+tt(l,'২৮/৩০ দিন দেওয়া হয়েছে','given 28/30 days'):tt(l,'কোনো ওষুধ লেখা নেই।','None recorded.')}</p></div>
      <div className="cm-rep"><h3><Icon name="clipboard-list" size={18}/>{tt(l,'স্ক্রিনিং','Screening')}</h3><div className="tp-scr"><RiskBadge level={k.scr[0]} lang={l}/><b>{dg(l,k.scr[1])}/{dg(l,20)}</b></div></div>
      <div className="cm-rep"><h3><Icon name="git-compare" size={18}/>{tt(l,'পর্যবেক্ষণে অমিল','Observation differences')}</h3><p>{k.mm[i]}</p></div></>}
    <div className="rs-nodx"><Icon name="info" size={18}/><span>{tt(l,'এটি রোগনির্ণয় নয় — কেয়ার টিমের লগ থেকে তৈরি একটা সারাংশ।','This is not a diagnosis — a summary drawn from the care team’s logs.')}</span></div>
    <div style={{display:'flex',flexDirection:'column',gap:8}}><span data-go="BACK" className="tp-go"><Button block size="lg" icon="send">{tt(l,'কেয়ার টিমকে পাঠান','Share with care team')}</Button></span><span data-go={RT(role,'child')+(sfx||'')} className="tp-go"><Button block variant="secondary" icon="user-round">{tt(l,k.gen[0]+' প্রোফাইলে যান','Go to '+k.gen[1]+' profile')}</Button></span></div>
  </>;}
function ReportM({role,l}){const k=curKid();return <Phone><StatusBar/><TpHead l={l} title={tt(l,'স্ট্যাটাস রিপোর্ট','Status report')}/><div className="cm-body"><ReportDoc k={k} l={l} role={role}/></div></Phone>;}

/* assistant picker, children list, me */
function AiPick({role,l}){const t=R(role);const ids=t?TKIDS:SKIDS;return <Phone><StatusBar/>
  <div className="cm-top"><h1 className="cm-h1" style={{flex:1}}>{tt(l,'সহযাত্রী AI','Shohojatri AI')}</h1><LanguageToggle value={l}/></div>
  <div className="cm-body"><p className="cm-sub">{tt(l,'কার বিষয়ে জিজ্ঞেস করবেন? উত্তর আসবে শুধু ওই শিশুর রেকর্ড থেকে।','Who would you like to ask about? Answers come only from that child’s records.')}</p>
    <div className="cm-list">{ids.map(id=>{const k=KID[id];return <div key={id} className="cm-li tp-li-btn" data-go={RT(role,'chat')} data-child={id} role="button"><KidAv k={k} l={l} size={44}/><div className="cm-li-t"><b>{k.name[ix(l)]}</b><span>{k.last[ix(l)]}</span></div><NewBadge k={k} l={l}/><Icon name="chevron-right" size={20} color="var(--text-3)"/></div>;})}</div>
    <div className="cm-note"><Icon name="shield-check" size={18}/><span>{t?tt(l,'আপনার অ্যাক্সেস শিক্ষা-সংক্রান্ত — ওষুধ বা ক্লিনিক্যাল নোট AI দেখাবে না।','Your access is education-only — the AI won’t show medication or clinical notes.'):tt(l,'ক্লিনিক্যাল অ্যাক্সেস — অভিভাবক যা শেয়ার করেছেন সব দেখা যাবে।','Clinical access — everything the parent has shared is available.')}</span></div>
  </div><RoleNav role={role} l={l} value="ai"/></Phone>;}
function KidsM({role,l}){const t=R(role);const [q,setQ]=React.useState('');const [f,setF]=React.useState('all');
  const ids=(t?TKIDS:SKIDS).filter(id=>{const k=KID[id];if(q&&!(k.name[0]+k.name[1]+k.code).toLowerCase().includes(q.toLowerCase()))return false;if(f==='new')return k.newN>0;if(f==='wk')return ['ayan','ishan','mahi'].includes(id);return true;});
  return <Phone><StatusBar/>
  <div className="cm-top"><h1 className="cm-h1" style={{flex:1}}>{t?tt(l,'আমার শিশুরা','My children'):tt(l,'আমার রোগী','My patients')}</h1><LanguageToggle value={l}/></div>
  <div className="cm-body">
    <label className="tp-search"><Icon name="search" size={18}/><input value={q} onChange={e=>setQ(e.target.value)} placeholder={tt(l,'নাম বা আইডি খুঁজুন','Search name or ID')}/></label>
    <div className="cm-chips"><Chip lang={l} label={tt(l,'সব','All')} selected={f==='all'} onClick={()=>setF('all')}/>{t?null:<Chip lang={l} label={tt(l,'এই সপ্তাহে ফলো-আপ','Follow-up this week')} selected={f==='wk'} onClick={()=>setF('wk')}/>}<Chip lang={l} label={tt(l,'নতুন আপডেট','New updates')} selected={f==='new'} onClick={()=>setF('new')}/></div>
    {ids.length?ids.map(id=><KidCard key={id} k={KID[id]} l={l} role={role}/>):<StateView lang={l} kind="empty" icon="search" title={tt(l,'কাউকে পাওয়া যায়নি','No one found')} message={tt(l,'অন্য নাম বা আইডি দিয়ে খুঁজুন।','Try another name or ID.')}/>}
  </div><RoleNav role={role} l={l} value="kids"/></Phone>;}
function MeBody({role,l}){const t=R(role);return <>
  <div className="tp-me"><Avatar name={t?'নাসরিন':'তানভীর'} size={80}/><h1>{t?tt(l,'শিক্ষিকা নাসরিন আক্তার','Teacher Nasrin Akter'):tt(l,'ডা. তানভীর রহমান','Dr. Tanvir Rahman')}</h1>
    <div style={{display:'flex',gap:8,flexWrap:'wrap',justifyContent:'center'}}><RoleBadge lang={l} role={t?'teacher':'specialist'}/>{t?null:<span className="cm-tag leaf"><Icon name="badge-check" size={14}/>{tt(l,'যাচাইকৃত','Verified')}</span>}</div>
    <span className="cm-sub" style={{fontSize:15}}>{t?tt(l,'আলো বিশেষ বিদ্যালয়, ঢাকা','Alo Special School, Dhaka'):'Developmental Paediatrician · '+tt(l,'শিশু বিকাশ কেন্দ্র, ধানমন্ডি','Child Development Centre, Dhanmondi')}</span></div>
  <div className="cm-list">
    <div className="cm-li"><Icon name="languages" size={20} color="var(--sj-navy)"/><div className="cm-li-t"><b>{tt(l,'ভাষা','Language')}</b><span>{tt(l,'বাংলা','Bangla')}</span></div><LanguageToggle value={l}/></div>
    <div className="cm-li"><Icon name="bell" size={20} color="var(--sj-navy)"/><div className="cm-li-t"><b>{tt(l,'নতুন আপডেটের নোটিফিকেশন','New update notifications')}</b><span>{tt(l,'অভিভাবক বা টিম লগ করলে','When parents or team log')}</span></div><Sw on label={tt(l,'নোটিফিকেশন','Notifications')}/></div>
    <div className="cm-li"><Icon name="users" size={20} color="var(--sj-navy)"/><div className="cm-li-t"><b>{t?tt(l,'আমার শিশুরা','My children'):tt(l,'আমার রোগীরা','My patients')}</b><span>{t?tt(l,'৪ জন · শিক্ষা অ্যাক্সেস','4 · education access'):tt(l,'৬ জন · ক্লিনিক্যাল অ্যাক্সেস','6 · clinical access')}</span></div></div>
  </div>
  <span data-go="splash" className="tp-go"><Button block variant="secondary" icon="log-out">{tt(l,'লগ আউট','Log out')}</Button></span></>;}
function MeM({role,l}){return <Phone><StatusBar/><div className="cm-top"><h1 className="cm-h1" style={{flex:1}}>{tt(l,'প্রোফাইল','Profile')}</h1></div><div className="cm-body"><MeBody role={role} l={l}/></div><RoleNav role={role} l={l} value="me"/></Phone>;}

/* states */
function LoadingM({role,l}){return <Phone><StatusBar/><TpHead l={l} title={tt(l,'শিশুর প্রোফাইল','Child profile')}/><div className="cm-body" aria-busy="true">
  <div className="cm-row"><div className="sj-skel" style={{width:64,height:64,borderRadius:'50%'}}></div><div style={{flex:1,display:'flex',flexDirection:'column',gap:8}}><div className="sj-skel" style={{height:22,width:'50%'}}></div><div className="sj-skel" style={{height:14,width:'70%'}}></div></div></div>
  <div className="sj-skel" style={{height:150,borderRadius:22}}></div>
  <div className="tp-facts">{[1,2,3,4].map(j=><div key={j} className="sj-skel" style={{height:84,borderRadius:16}}></div>)}</div>
  {[1,2].map(j=><div key={j} className="tp-skel-card"><div className="sj-skel" style={{height:16,width:'40%'}}></div><div className="sj-skel" style={{height:12}}></div><div className="sj-skel" style={{height:12,width:'80%'}}></div></div>)}
  <div className="tp-thinking" style={{justifyContent:'center'}}><Dots/>{tt(l,'প্রোফাইল খোলা হচ্ছে…','Opening profile…')}</div>
</div></Phone>;}
function EmptyM({role,l}){const t=R(role);return <Phone><StatusBar/>
  <div className="cm-top"><img src={l==='en'?'assets/shohojatri-wordmark-en.png':LOGO} alt={tt(l,'সহযাত্রী','Shohojatri')} style={{height:34}}/><div style={{flex:1}}></div><LanguageToggle value={l}/></div>
  <div className="cm-body">
    <StateView lang={l} kind="empty" icon={t?'school':'stethoscope'} title={t?tt(l,'এখনো কোনো শিশু যুক্ত হয়নি','No children yet'):tt(l,'এখনো কোনো রোগী যুক্ত হয়নি','No patients yet')} message={tt(l,'অভিভাবকের কাছ থেকে শিশুর আইডি (যেমন SJ-7K3QX) নিন — আইডিটা তাঁর অ্যাপের কেয়ার টিম পাতায় আছে। নিচে আইডি দিয়ে অনুরোধ পাঠান; অভিভাবক অনুমোদন দিলেই শিশুটি এখানে আসবে।','Ask the parent for the Child ID (e.g. SJ-7K3QX) — it’s on the Care team page of their app. Send a request below; the child appears here once the parent approves.')}/>
    <ReqSection l={l} role={role}/>
  </div><RoleNav role={role} l={l} value="home"/></Phone>;}
Object.assign(window,{TpHead,RoleNav,TpToast,KidCard,ReqSection,ProfileHead,NowCard,Facts,GoalList,Charts,Screening,Meds,ScrMini,MedsMini,Timeline,ProfileM,NoteForm,NoteM,ChatCore,ChatHead,ChatM,ReportDoc,ReportM,AiPick,KidsM,MeBody,MeM,LoadingM,EmptyM,TP_series:series});
})();
