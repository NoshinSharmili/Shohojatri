(()=>{
const {Button,IconButton,Icon,Chip,Avatar,LanguageToggle,Sidebar,RoleBadge,StateView,SourceChip}=window.ShohojatriDesignSystem_1ff839;
const LOGO_EN='assets/shohojatri-wordmark-en.png';
function RoleDesk({role,l,value,crumb,children}){const t=role==='teacher';const i=ix(l);
  return <div className="cm-desk tp-desk" lang={l}>
    <Sidebar lang={l} value={value} header={<img src={l==='en'?LOGO_EN:LOGO} alt={tt(l,'সহযাত্রী','Shohojatri')} style={{height:42,display:'block'}}/>}
      items={t?[{id:'home',label:tt(l,'হোম','Home'),icon:'house'},{id:'kids',label:tt(l,'শিশুরা','Children'),icon:'users',badge:dg(l,4)},{id:'ai',label:tt(l,'সহকারী','Assistant'),icon:'sparkles'},{id:'me',label:tt(l,'প্রোফাইল','Profile'),icon:'user-round'}]
        :[{id:'home',label:tt(l,'হোম','Home'),icon:'house'},{id:'kids',label:tt(l,'রোগীরা','Patients'),icon:'clipboard-list',badge:dg(l,6)},{id:'req',label:tt(l,'অনুরোধ','Requests'),icon:'user-round-plus',badge:dg(l,1)},{section:tt(l,'অ্যাকাউন্ট','Account')},{id:'me',label:tt(l,'প্রোফাইল','Profile'),icon:'user-round'}]}
      footer={<div style={{display:'flex',alignItems:'center',gap:10,padding:'12px 8px 0',borderTop:'1px solid var(--border-1)'}}><Avatar name={t?'নাসরিন':'তানভীর'} size={40}/><div style={{flex:1,minWidth:0}}><div style={{fontWeight:600,fontSize:15}}>{t?tt(l,'নাসরিন আক্তার','Nasrin Akter'):tt(l,'ডা. তানভীর রহমান','Dr. Tanvir Rahman')}</div><div style={{fontSize:13,color:'var(--text-3)'}}>{t?tt(l,'শিক্ষিকা · আলো বিশেষ বিদ্যালয়','Teacher · Alo Special School'):'Developmental Paediatrician'}</div></div></div>}/>
    <div className="cm-dmain">
      <div className="cm-dtop"><div className="cm-crumb tp-crumb">{crumb}</div><LanguageToggle value={l}/></div>
      {children}
    </div>
    <TpToast l={l} desk/>
  </div>;}

function Hello({l}){return <div className="tp-hello"><div className="cm-greet">{tt(l,'শুভ সকাল, নাসরিন আপা','Good morning, Nasrin Apa')}</div><h1 className="cm-h1">{tt(l,'আজ আপনার ক্লাস','Your class today')}</h1><span className="cm-sub"><Icon name="school" size={16}/>{tt(l,'আলো বিশেষ বিদ্যালয়, ঢাকা','Alo Special School, Dhaka')}</span></div>;}
function Today({l}){return <span className="tp-today"><Icon name="clipboard-pen" size={17}/>{tt(l,'আজ ৩ জনের নোট বাকি','3 notes due today')}</span>;}

function TeacherHome({l}){return <Phone><StatusBar/>
  <div className="cm-top"><img src={l==='en'?LOGO_EN:LOGO} alt={tt(l,'সহযাত্রী','Shohojatri')} style={{height:34}}/><div style={{flex:1}}></div><LanguageToggle value={l}/><span data-go="t-me" role="button" aria-label={tt(l,'প্রোফাইল','Profile')} style={{display:'inline-flex',cursor:'pointer'}}><Avatar name="নাসরিন" size={40}/></span></div>
  <div className="cm-body">
    <Hello l={l}/><Today l={l}/>
    <h2 className="cm-h2"><Icon name="users" size={20}/>{tt(l,'আমার শিশুরা','My children')}<a className="asd" data-go="t-kids">{tt(l,'সব দেখুন','See all')}</a></h2>
    {TKIDS.map(id=><KidCard key={id} k={KID[id]} l={l} role="teacher"/>)}
    <ReqSection l={l} role="teacher"/>
  </div>
  <RoleNav role="teacher" l={l} value="home"/><TpToast l={l}/></Phone>;}

function TeacherHomeD({l}){return <RoleDesk role="teacher" l={l} value="home" crumb={<b>{tt(l,'হোম','Home')}</b>}>
  <div className="tp-dgrid"><div className="cm-col">
    <div style={{display:'flex',alignItems:'flex-end',gap:16,flexWrap:'wrap'}}><div style={{flex:1}}><Hello l={l}/></div><Today l={l}/></div>
    <h2 className="cm-h2"><Icon name="users" size={20}/>{tt(l,'আমার শিশুরা','My children')}<span style={{font:'400 15px var(--font-body)',color:'var(--text-2)'}}>· {dg(l,4)}</span></h2>
    <div className="tp-kgrid">{TKIDS.map(id=><KidCard key={id} k={KID[id]} l={l} role="teacher"/>)}</div>
  </div><aside className="cm-col"><ReqSection l={l} role="teacher" compact/></aside></div>
</RoleDesk>;}

/* specialist */
const WK=['ayan','ishan','mahi'];
function Verified({l}){return <span className="cm-tag leaf"><Icon name="badge-check" size={14}/>{tt(l,'যাচাইকৃত','Verified')}</span>;}
function SpHello({l}){return <div className="tp-hello"><div className="cm-greet">{tt(l,'শুভ সকাল','Good morning')}</div><div style={{display:'flex',alignItems:'center',gap:10,flexWrap:'wrap'}}><h1 className="cm-h1">{tt(l,'ডা. তানভীর রহমান','Dr. Tanvir Rahman')}</h1><Verified l={l}/></div><span className="cm-sub"><Icon name="stethoscope" size={16}/>Developmental Paediatrician · {tt(l,'শিশু বিকাশ কেন্দ্র','Child Development Centre')}</span></div>;}
function Stats({l,m}){const S=[[tt(l,'মোট রোগী','Total patients'),6,'users'],[tt(l,'এই সপ্তাহে ফলো-আপ','Follow-ups this week'),3,'calendar-clock'],[tt(l,'নতুন আপডেট','New updates'),5,'bell-dot'],[tt(l,'অপেক্ষমাণ অনুরোধ','Pending requests'),1,'hourglass']];
  return <div className={'tp-stats'+(m?' m':'')}>{S.map(([a,n,ic],j)=><div key={j} className="cm-metric"><span style={{display:'flex',gap:6,alignItems:'center'}}><Icon name={ic} size={15}/>{a}</span><b>{dg(l,n)}</b></div>)}</div>;}
function useFilter(){const [q,setQ]=React.useState('');const [f,setF]=React.useState('all');
  const ids=SKIDS.filter(id=>{const k=KID[id];if(q&&!(k.name[0]+k.name[1]+k.code).toLowerCase().includes(q.toLowerCase()))return false;if(f==='wk')return WK.includes(id);if(f==='new')return k.newN>0;return true;});return {q,setQ,f,setF,ids};}
function FilterBar({l,F}){return <div className="cm-filters"><label className="tp-search" style={{flex:'1 1 220px'}}><Icon name="search" size={18}/><input value={F.q} onChange={e=>F.setQ(e.target.value)} placeholder={tt(l,'নাম বা আইডি খুঁজুন','Search name or ID')}/></label>
  <Chip lang={l} label={tt(l,'সব','All')} selected={F.f==='all'} onClick={()=>F.setF('all')}/><Chip lang={l} icon="calendar-clock" label={tt(l,'এই সপ্তাহে ফলো-আপ','Follow-up this week')} selected={F.f==='wk'} onClick={()=>F.setF('wk')}/><Chip lang={l} icon="bell-dot" label={tt(l,'নতুন আপডেট','New updates')} selected={F.f==='new'} onClick={()=>F.setF('new')}/></div>;}
function PtTable({l,ids}){const i=ix(l);const by={parent:tt(l,'অভিভাবক','Parent'),teacher:tt(l,'শিক্ষক','Teacher'),specialist:tt(l,'বিশেষজ্ঞ','Specialist')};
  if(!ids.length)return <StateView lang={l} kind="empty" icon="search" title={tt(l,'কাউকে পাওয়া যায়নি','No one found')} message={tt(l,'ফিল্টার বা খোঁজ বদলে দেখুন।','Try a different filter or search.')}/>;
  return <table className="cm-table tp-table"><thead><tr><th>{tt(l,'শিশু','Child')}</th><th>{tt(l,'রোগনির্ণয়','Diagnosis')}</th><th>{tt(l,'পরের ফলো-আপ','Next follow-up')}</th><th>{tt(l,'শেষ আপডেট','Last update')}</th><th>{tt(l,'প্রবণতা','Trend')}</th><th style={{textAlign:'right'}}>{tt(l,'কাজ','Actions')}</th></tr></thead>
  <tbody>{ids.map(id=>{const k=KID[id];return <tr key={id} data-go="sp-child-d" data-child={id}>
    <td><div className="tp-who"><KidAv k={k} l={l} size={36}/><div><b>{k.name[i]}</b><span className="tp-sub2">{k.ageS[i]} · <span style={{fontFamily:"'Baloo Da 2',var(--font-display)"}}>{k.code}</span></span></div></div></td>
    <td style={{maxWidth:140}}>{k.dx[i]}</td>
    <td><b style={{fontWeight:600,color:WK.includes(id)?'var(--sj-navy)':'var(--text-1)'}}>{k.next[i]}</b></td>
    <td><div style={{display:'flex',flexDirection:'column',gap:4,alignItems:'flex-start'}}><span className="tp-sub2">{by[k.lastBy]} · {k.last[i].split('·').pop().trim()}</span><NewBadge k={k} l={l}/></div></td>
    <td><TrendTag k={k} l={l}/></td>
    <td><div className="tp-rowact"><span data-go="sp-child-d" data-child={id}><IconButton size="sm" icon="eye" label={tt(l,'দেখুন','View')}/></span><span data-go="sp-note-d" data-child={id}><IconButton size="sm" icon="notebook-pen" label={tt(l,'নোট','Note')}/></span><span data-go="sp-chat-d" data-child={id}><IconButton size="sm" icon="sparkles" label="AI"/></span></div></td>
  </tr>;})}</tbody></table>;}
function TodayFU({l}){const i=ix(l);return <div className="cm-panel" style={{padding:'18px 0 6px',gap:0}}><h2 className="cm-h2" style={{fontSize:17,padding:'0 20px 8px'}}><Icon name="calendar-check" size={18}/>{tt(l,'আজকের ফলো-আপ','Today’s follow-ups')}</h2>
  {['ayan','mahi'].map(id=>{const k=KID[id];return <div key={id} className="cm-li tp-li-btn" data-go="sp-child-d" data-child={id} role="button" style={{padding:'10px 20px'}}><KidAv k={k} l={l} size={40}/><div className="cm-li-t"><b>{k.name[i]}</b><span>{k.nextD[i]}</span></div><Icon name="chevron-right" size={18} color="var(--text-3)"/></div>;})}</div>;}
function SharedReports({l}){const i=ix(l);return <div className="cm-panel" style={{padding:'18px 0 6px',gap:0}}><h2 className="cm-h2" style={{fontSize:17,padding:'0 20px 8px'}}><Icon name="file-text" size={18}/>{tt(l,'শেয়ার করা স্ক্রিনিং রিপোর্ট','Shared screening reports')}</h2>
  {['mahi','rafi','samir'].map((id,j)=>{const k=KID[id];return <div key={id} className="cm-li tp-li-btn" data-go="dr-report-sp" data-child={id} role="button" style={{padding:'10px 20px'}}><Tile icon="clipboard-list" tone="sky" size={40}/><div className="cm-li-t"><b>{k.name[i]} · {dg(l,k.scr[1])}/{dg(l,20)}</b><span>{[tt(l,'আজ শেয়ার করা','Shared today'),tt(l,'৩ দিন আগে','3 days ago'),tt(l,'১ সপ্তাহ আগে','1 week ago')][j]}</span></div>{j===0?<span className="cm-unread">{tt(l,'নতুন','New')}</span>:null}</div>;})}</div>;}

function SpHomeD({l,pts}){const F=useFilter();return <RoleDesk role="specialist" l={l} value={pts?'kids':'home'} crumb={<b>{pts?tt(l,'রোগীরা','Patients'):tt(l,'হোম','Home')}</b>}>
  <div className={pts?'cm-dcontent one':'tp-dgrid sp'}><div className="cm-col">
    {pts?null:<><SpHello l={l}/><Stats l={l}/></>}
    <div className="cm-panel"><h2 className="cm-h2" style={{fontSize:18}}><Icon name="clipboard-list" size={20}/>{tt(l,'রোগীর তালিকা','Patient list')}</h2><FilterBar l={l} F={F}/><PtTable l={l} ids={F.ids}/></div>
  </div>{pts?null:<aside className="cm-col"><TodayFU l={l}/><ReqSection l={l} role="specialist" compact/><SharedReports l={l}/></aside>}</div>
</RoleDesk>;}
function SpHelloM({l}){return <div className="tp-hello"><div style={{display:'flex',alignItems:'center',gap:10,flexWrap:'wrap'}}><h1 className="cm-h1">{tt(l,'শুভ সকাল, ডা. তানভীর','Good morning, Dr. Tanvir')}</h1><Verified l={l}/></div><span className="cm-sub"><Icon name="stethoscope" size={16}/>Developmental Paediatrician</span></div>;}
function SpHomeM({l}){return <Phone><StatusBar/>
  <div className="cm-top"><img src={l==='en'?LOGO_EN:LOGO} alt={tt(l,'সহযাত্রী','Shohojatri')} style={{height:34}}/><div style={{flex:1}}></div><LanguageToggle value={l}/><span data-go="sp-me" role="button" aria-label={tt(l,'প্রোফাইল','Profile')} style={{display:'inline-flex',cursor:'pointer'}}><Avatar name="তানভীর" size={40}/></span></div>
  <div className="cm-body">
    <SpHelloM l={l}/><span className="tp-today"><Icon name="calendar-check" size={17}/>{tt(l,'আজ ২টি ফলো-আপ','2 follow-ups today')}</span>
    <h2 className="cm-h2"><Icon name="clipboard-list" size={20}/>{tt(l,'আমার রোগী','My patients')}<a className="asd" data-go="sp-pts">{tt(l,'সব দেখুন','See all')}</a></h2>
    {SKIDS.map(id=><KidCard key={id} k={KID[id]} l={l} role="specialist"/>)}
    <ReqSection l={l} role="specialist"/>
  </div>
  <RoleNav role="specialist" l={l} value="home"/><TpToast l={l}/></Phone>;}
function Crumb({l,k,tail}){return <><a data-go="sp-pts-d">{tt(l,'রোগীরা','Patients')}</a><Icon name="chevron-right" size={16}/>{tail?<><a data-go="sp-child-d">{k.name[ix(l)]}</a><Icon name="chevron-right" size={16}/><b>{tail}</b></>:<b>{k.name[ix(l)]}</b>}</>;}
function NextFU({k,l}){const i=ix(l);return <div className="cm-panel"><h2 className="cm-h2" style={{fontSize:17}}><Icon name="calendar-check" size={18}/>{tt(l,'পরের ফলো-আপ','Next follow-up')}</h2><div style={{fontWeight:600}}>{k.nextD[i]}</div><div style={{fontSize:14,color:'var(--text-2)'}}>{tt(l,'শিশু বিকাশ কেন্দ্র, ধানমন্ডি','Child Development Centre, Dhanmondi')}</div></div>;}
function SpChildD({l}){const k=curKid();const i=ix(l);return <RoleDesk role="specialist" l={l} value="kids" crumb={<Crumb l={l} k={k}/>}>
  <div className="cm-dhead" style={{alignItems:'flex-start'}}><KidAv k={k} l={l} size={72}/><div style={{flex:1,minWidth:0,display:'flex',flexDirection:'column',gap:6}}><h1>{k.name[i]}</h1>
    <div className="cm-dmeta"><span>{k.age[i]}</span><span>·</span><span>{k.dx[i]}</span><span className="cm-idpill"><Icon name="id-card" size={14}/>{k.code}</span></div>
    <div className="tp-teamrow"><TeamStack k={k} l={l}/><span>{k.team.map(m=>m[1+i]).join(' · ')}</span><span className="tp-scope"><Icon name="lock" size={13}/>{tt(l,'আপনার অ্যাক্সেস: ক্লিনিক্যাল','Your access: clinical')}</span></div></div>
    <div style={{display:'flex',gap:8,flexWrap:'wrap',justifyContent:'flex-end',maxWidth:420}}><span data-go="sp-chat-d" className="tp-goi"><Button variant="secondary" icon="sparkles">{tt(l,'সহযাত্রী AI-কে জিজ্ঞেস করুন','Ask Shohojatri AI')}</Button></span><span data-go="sp-note-d" className="tp-goi"><Button icon="notebook-pen">{tt(l,'ক্লিনিক্যাল নোট যোগ করুন','Add clinical note')}</Button></span></div></div>
  <div className="tp-dgrid"><div className="cm-col">
    <div className="tp-dx">{k.dxs[i]}</div>
    <NowCard k={k} l={l}/>
    <h2 className="cm-h2"><Icon name="lightbulb" size={20}/>{tt(l,'দ্রুত জেনে নিন','Quick facts')}</h2><Facts k={k} l={l} four/>
    <h2 className="cm-h2"><Icon name="chart-line" size={20}/>{tt(l,'ক্ষেত্রভিত্তিক ট্রেন্ড','Domain trends')}</h2><Charts k={k} l={l} cols={2} w={300}/>
    <h2 className="cm-h2"><Icon name="history" size={20}/>{tt(l,'টাইমলাইন','Timeline')}</h2><Timeline k={k} l={l} filter/>
  </div><aside className="cm-col">{k.scrAtt===0?null:<Screening k={k} l={l}/>}<Meds k={k} l={l}/>
    <div className="cm-panel" style={{gap:0,padding:'18px 0 4px'}}><h2 className="cm-h2" style={{fontSize:17,padding:'0 20px 8px'}}><Icon name="target" size={18}/>{tt(l,'চলমান লক্ষ্য','Active goals')}</h2><div style={{borderTop:'1px solid var(--border-1)'}}><GoalList k={k} l={l}/></div></div>
    <NextFU k={k} l={l}/></aside></div>
</RoleDesk>;}
function SpNoteD({l}){const k=curKid();return <RoleDesk role="specialist" l={l} value="kids" crumb={<Crumb l={l} k={k} tail={tt(l,'ক্লিনিক্যাল নোট','Clinical note')}/>}>
  <div className="tp-dgrid"><div className="cm-panel" style={{padding:'24px 28px'}}><h1 className="cm-h1" style={{fontSize:22}}>{tt(l,'ক্লিনিক্যাল নোট যোগ করুন','Add clinical note')}</h1><NoteForm k={k} l={l} role="specialist"/>
    <div style={{display:'flex',gap:8,justifyContent:'flex-end',borderTop:'1px solid var(--border-1)',paddingTop:16}}><span data-go="sp-child-d" className="tp-goi"><Button variant="ghost">{tt(l,'বাতিল','Cancel')}</Button></span><span data-go="sp-child-d" data-act="save" className="tp-goi"><Button icon="check">{tt(l,'সেভ করুন','Save')}</Button></span></div></div>
  <aside className="cm-col"><NowCard k={k} l={l}/><div className="cm-panel" style={{gap:0,padding:'18px 0 4px'}}><h2 className="cm-h2" style={{fontSize:17,padding:'0 20px 8px'}}><Icon name="target" size={18}/>{tt(l,'চলমান লক্ষ্য','Active goals')}</h2><div style={{borderTop:'1px solid var(--border-1)'}}><GoalList k={k} l={l}/></div></div></aside></div>
</RoleDesk>;}
function SpChatD({l}){const k=curKid();const i=ix(l);return <RoleDesk role="specialist" l={l} value="kids" crumb={<Crumb l={l} k={k} tail={tt(l,'সহযাত্রী AI','Shohojatri AI')}/>}>
  <div className="cm-dchat"><div className="cm-dchat-main"><ChatCore k={k} l={l} role="specialist" desk/></div>
  <aside className="cm-dchat-aside" style={{overflowY:'auto'}}>
    <div className="cm-row"><KidAv k={k} l={l} size={48}/><div style={{flex:1}}><div style={{font:'700 18px var(--font-display)'}}>{k.name[i]}</div><div style={{fontSize:14,color:'var(--text-2)'}}>{k.ageS[i]} · {k.dx[i]}</div></div></div>
    <ul className="tp-bul">{k.sum.slice(0,3).map((s,j)=><li key={j} style={{fontSize:15}}><span>{s[i]}</span></li>)}</ul>
    <h2 className="cm-h2" style={{fontSize:16}}><Icon name="target" size={18}/>{tt(l,'লক্ষ্য','Goals')}</h2>
    {k.goals.map(g=><div key={g[0]} style={{display:'flex',flexDirection:'column',gap:4}}><div style={{display:'flex',fontSize:14}}><span style={{flex:1}}>{g[i]}</span><b style={{fontFamily:'var(--font-display)',color:'var(--sj-ink-leaf)'}}>{dg(l,g[4])}%</b></div><Bar v={g[4]} tone={g[4]<40?'var(--sj-amber)':'var(--sj-leaf)'}/></div>)}
    <div className="tp-scr"><RiskBadge level={k.scr[0]} lang={l}/></div>
    <span data-go="sp-report-d" className="tp-go"><Button block variant="secondary" icon="file-text">{tt(l,'স্ট্যাটাস রিপোর্ট','Status report')}</Button></span>
    <span data-go="sp-child-d" className="tp-go"><Button block variant="ghost" icon="user-round">{tt(l,'পুরো প্রোফাইল','Full profile')}</Button></span>
  </aside></div>
</RoleDesk>;}
const {RiskBadge}=window.ShohojatriDesignSystem_1ff839;
function SpReportD({l}){const k=curKid();return <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:12}}><div style={{width:900,display:'flex',alignItems:'center',gap:8}}><span data-go="BACK" className="tp-goi"><Button variant="ghost" icon="arrow-left">{tt(l,'ফিরে যান','Back')}</Button></span><div style={{flex:1}}></div><LanguageToggle value={l}/></div><div className="tp-docwrap" lang={l}><ReportDoc k={k} l={l} role="specialist" sfx="-d"/></div></div>;}
function SpReqD({l}){return <RoleDesk role="specialist" l={l} value="req" crumb={<b>{tt(l,'অনুরোধ','Requests')}</b>}><div className="cm-dcontent one"><div style={{maxWidth:640}}><ReqSection l={l} role="specialist" compact/></div></div></RoleDesk>;}
function SpMeD({l}){return <RoleDesk role="specialist" l={l} value="me" crumb={<b>{tt(l,'প্রোফাইল','Profile')}</b>}><div className="cm-dcontent one"><div style={{maxWidth:560,display:'flex',flexDirection:'column',gap:16}}><MeBody role="specialist" l={l}/></div></div></RoleDesk>;}
function SpEmptyD({l}){return <RoleDesk role="specialist" l={l} value="home" crumb={<b>{tt(l,'হোম','Home')}</b>}><div className="tp-dgrid"><div className="cm-col"><SpHello l={l}/><div className="cm-panel"><StateView lang={l} kind="empty" icon="stethoscope" title={tt(l,'এখনো কোনো রোগী যুক্ত হয়নি','No patients yet')} message={tt(l,'অভিভাবকের কাছ থেকে শিশুর আইডি (যেমন SJ-7K3QX) নিন — আইডিটা তাঁর অ্যাপের কেয়ার টিম পাতায় আছে। ডান দিকে আইডি দিয়ে অনুরোধ পাঠান; অনুমোদনের পর রোগী এখানে আসবে।','Ask the parent for the Child ID (e.g. SJ-7K3QX) — it’s on the Care team page of their app. Send a request on the right; the patient appears here once approved.')}/></div></div><aside className="cm-col"><ReqSection l={l} role="specialist" compact/></aside></div></RoleDesk>;}
function SpLoadingD({l}){return <RoleDesk role="specialist" l={l} value="home" crumb={<b>{tt(l,'হোম','Home')}</b>}><div className="cm-dcontent one" aria-busy="true"><div className="cm-col">
  <div className="sj-skel" style={{height:28,width:320}}></div><div className="tp-stats">{[1,2,3,4].map(j=><div key={j} className="sj-skel" style={{height:86,borderRadius:20}}></div>)}</div>
  <div className="cm-panel">{[1,2,3,4,5,6].map(j=><div key={j} className="cm-row"><div className="sj-skel" style={{width:40,height:40,borderRadius:'50%'}}></div><div className="sj-skel" style={{height:14,flex:1}}></div><div className="sj-skel" style={{height:14,width:120}}></div></div>)}</div>
  <div className="tp-thinking" style={{justifyContent:'center'}}><Dots/>{tt(l,'রোগীর তালিকা আনা হচ্ছে…','Loading patients…')}</div></div></div></RoleDesk>;}
Object.assign(window,{RoleDesk,TeacherHome,TeacherHomeD,SpHomeD,SpHomeM,SpChildD,SpNoteD,SpChatD,SpReportD,SpReqD,SpMeD,SpEmptyD,SpLoadingD});
})();
