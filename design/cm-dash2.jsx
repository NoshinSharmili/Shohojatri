(()=>{
const {Button,IconButton,Icon,Chip,Avatar,Tabs,SourceChip,RoleBadge,RiskBadge,Card}=window.ShohojatriDesignSystem_1ff839;
function CarePlan(){return <Desk tab="cp"><div className="cm-dcontent"><div className="cm-col">
  <div className="cm-note"><Icon name="info" size={18}/><span>শেষ হালনাগাদ ১০ অক্টোবর, ডা. তানভীর। পরের রিভিউ ১২ নভেম্বর।</span></div>
  <h2 className="cm-h2"><Icon name="target" size={20}/>লক্ষ্য ও কৌশল</h2>
  <div className="cm-list">{[['চাওয়ার জন্য “আরও” বলা','ভাষা','পছন্দের খেলায় থেমে অপেক্ষা করুন, “আরও” মডেল করুন।','ঘরে · স্কুলে',70],['৩ মিনিট পালা নিয়ে খেলা','সামাজিক','“আমার পালা / তোমার পালা” কার্ড, টাইমার।','স্কুলে · থেরাপিতে',55],['রাত ১০টার মধ্যে ঘুম','ঘুম','৮:৩০-এ একই ক্রমে রুটিন, স্ক্রিন বন্ধ।','ঘরে',25]].map(([g,d,s,w,v])=><div key={g} className="cm-goal"><div className="cm-goal-t"><span>{g}</span><em>{bn(v)}%</em></div><div style={{fontSize:15,color:'var(--text-2)',lineHeight:1.6}}>{s}</div><Bar v={v} tone={v<40?'var(--sj-amber)':'var(--sj-leaf)'}/><div className="cm-goal-m"><span className="cm-tag">{d}</span><span>{w}</span></div></div>)}</div>
  <h2 className="cm-h2"><Icon name="calendar-days" size={20}/>সাপ্তাহিক সূচি</h2>
  <div className="cm-sched">{[['শনি',[['t','স্পিচ ৪:০০']]],['রবি',[['n','স্কুল ৯–১২'],['l','চেক-ইন']]],['সোম',[['n','স্কুল ৯–১২']]],['মঙ্গল',[['n','স্কুল ৯–১২'],['t','OT ৫:০০']]],['বুধ',[['n','স্কুল ৯–১২'],['t','স্পিচ ৪:০০']]],['বৃহঃ',[['n','স্কুল ৯–১২']]],['শুক্র',[['l','পার্কে খেলা']]]].map(([d,s])=><div key={d}><b>{d}</b>{s.map(([k,l],i)=><span key={i} className={'cm-slot '+k}>{l}</span>)}</div>)}</div>
  <h2 className="cm-h2"><Icon name="house" size={20}/>ঘরে করণীয়</h2>
  <div className="cm-list">{[['wind','বুদবুদ খেলায় পালা নেওয়া','সপ্তাহে ৩ বার · ১০ মিনিট','২ / ৩'],['moon','ছবিতে ঘুমের রুটিন','রোজ রাত ৮:৩০','৪ / ৭'],['footprints','সন্ধ্যার হাঁটা','রোজ · ২০ মিনিট','৫ / ৭']].map(([ic,t,s,n])=><div key={t} className="cm-li"><Tile icon={ic} tone="calm" size={44}/><div className="cm-li-t"><b>{t}</b><span>{s}</span></div><span className="cm-tag leaf">এই সপ্তাহে {n}</span><IconButton icon="chevron-right" label="খুলুন"/></div>)}</div>
</div><aside className="cm-col">
  <div className="cm-panel"><h2 className="cm-h2" style={{fontSize:17}}><Icon name="pill" size={18}/>ওষুধ</h2><div><div style={{fontWeight:600}}>Melatonin সিরাপ</div><div style={{fontSize:15,color:'var(--text-2)'}}>১ মি.লি. · ঘুমের আগে (লেখা অনুযায়ী)</div><div style={{fontSize:14,color:'var(--text-3)',marginTop:4}}>শুরু ১৪ অক্টো · ৪ সপ্তাহ পর রিভিউ</div></div><SourceChip lang="bn" kind="doc" label="প্রেসক্রিপশন · ১৪ অক্টো"/></div>
  <div className="cm-panel"><h2 className="cm-h2" style={{fontSize:17}}><Icon name="shield-check" size={18}/>যা এড়িয়ে চলবেন</h2><div style={{fontSize:15,lineHeight:1.65,display:'flex',flexDirection:'column',gap:6}}><span>· হঠাৎ জোরে শব্দ — আগে বলে দিন</span><span>· চুল কাটা — শান্ত সময়ে, পছন্দের গান চালিয়ে</span></div></div>
  <Button variant="secondary" icon="pencil">পরিবর্তনের প্রস্তাব দিন</Button>
</aside></div></Desk>;}

function Documents(){const [p,setP]=React.useState(0);return <Desk tab="dc" headRight={<Button icon="upload">ডকুমেন্ট যোগ করুন</Button>}><div className="cm-dcontent"><div className="cm-col">
  <div className="cm-filters"><Tabs lang="bn" variant="pill" value="all" items={[{id:'all',label:'সব',count:'৬'},{id:'rx',label:'প্রেসক্রিপশন'},{id:'th',label:'থেরাপি রিপোর্ট'},{id:'sc',label:'স্কুল নোট'},{id:'sj',label:'স্ক্রিনিং'}]}/></div>
  <div className="cm-panel" style={{padding:'6px 8px'}}><table className="cm-table"><thead><tr><th>ডকুমেন্ট</th><th>ধরন</th><th>যোগ করেছেন</th><th>তারিখ</th><th></th></tr></thead><tbody>
    {[['file-text','প্রেসক্রিপশন — ডা. তানভীর','প্রেসক্রিপশন','আপনি','১৪ অক্টো','leaf','যাচাই হয়েছে'],['notebook-pen','ক্লাস অগ্রগতি — সেপ্টেম্বর','স্কুল নোট','নাসরিন আপা','৩০ সেপ্টে'],['clipboard-list','স্পিচ থেরাপি মূল্যায়ন','থেরাপি রিপোর্ট','ডা. তানভীর','১০ সেপ্টে'],['file-text','রোগনির্ণয়ের রিপোর্ট','রিপোর্ট','আপনি','মার্চ ২০২৫'],['image','শ্রবণ পরীক্ষা','টেস্ট রিপোর্ট','আপনি','ফেব্রু ২০২৫','warm','১টি ঘর বাকি']].map(([ic,n,t,b,d,tone,st],i)=><tr key={i}><td><div className="cm-row"><Tile icon={ic} tone="sky" size={36}/><b style={{fontWeight:600}}>{n}</b></div></td><td>{t}</td><td>{b}</td><td>{d}</td><td>{st?<span className={'cm-tag '+tone}>{st}</span>:null}</td></tr>)}
  </tbody></table></div>
  <div className="cm-note"><Icon name="lock" size={18}/><span>ডকুমেন্ট শুধু তাঁরাই দেখেন যাঁদের আপনি “ডকুমেন্ট শেয়ার” অনুমতি দিয়েছেন।</span></div>
</div><aside className="cm-col">
  <div className="cm-panel"><div className="cm-row"><Tile icon="clipboard-list" tone="calm" size={44}/><div style={{flex:1}}><h2 className="cm-h2" style={{fontSize:17}}>সহযাত্রী স্ক্রিনিং রিপোর্ট যুক্ত করুন</h2><div style={{fontSize:14,color:'var(--text-2)'}}>ঐচ্ছিক · আগে এই অ্যাপে করা স্ক্রিনিং</div></div></div>
    {[['১৮ জানু ২০২৫','elevated','বয়স ১ বছর ৫ মাস · অভিভাবক'],['২ মে ২০২৪','moderate','বয়স ৯ মাস · অভিভাবক']].map(([d,l,m],i)=><button key={i} className={'cm-pick'+(p===i?' on':'')} onClick={()=>setP(i)} style={{textAlign:'left'}}><span className="cm-radio"></span><div style={{flex:1,display:'flex',flexDirection:'column',gap:4}}><b style={{fontWeight:600}}>{d}</b><span style={{fontSize:14,color:'var(--text-2)'}}>{m}</span><RiskBadge lang="bn" level={l}/></div></button>)}
    <div style={{fontSize:14,color:'var(--text-2)',lineHeight:1.6}}>যুক্ত করলে টিম রিপোর্টটি দেখতে পাবে। এটি রোগনির্ণয় নয়।</div>
    <div style={{display:'flex',gap:8}}><Button icon="paperclip">যুক্ত করুন</Button><Button variant="ghost">এখন না</Button></div></div>
</aside></div></Desk>;}

function CareTeam(){return <Desk tab="ct"><div className="cm-dcontent"><div className="cm-col">
  <h2 className="cm-h2"><Icon name="user-plus" size={20}/>অপেক্ষমাণ অনুরোধ</h2>
  <div className="cm-req"><div className="cm-row"><Avatar name="মাহমুদা" size={48}/><div className="cm-member-t"><b>মাহমুদা আক্তার <RoleBadge lang="bn" role="specialist" label="স্পিচ থেরাপিস্ট"/></b><span>শিশু বিকাশ কেন্দ্র · আইডি SJ-7K3QX দিয়ে অনুরোধ · ২ ঘণ্টা আগে</span></div></div>
    <div style={{fontSize:15,fontWeight:600,color:'var(--sj-ink-amber)'}}>কী কী দেখতে পারবেন</div>
    <div className="cm-scope"><Icon name="notebook-pen" size={20}/><div><b>লগ ও অগ্রগতি</b><span>সব সদস্যের জন্য সবসময় চালু</span></div><span className="cm-tag">সবসময়</span></div>
    <div className="cm-scope"><Icon name="pill" size={20}/><div><b>ওষুধ শেয়ার করুন</b><span>ওষুধের নাম, ডোজ ও সময়</span></div><Sw label="ওষুধ শেয়ার করুন"/></div>
    <div className="cm-scope"><Icon name="file-text" size={20}/><div><b>ডকুমেন্ট শেয়ার করুন</b><span>প্রেসক্রিপশন, রিপোর্ট ও স্কুল নোট</span></div><Sw on label="ডকুমেন্ট শেয়ার করুন"/></div>
    <div style={{display:'flex',gap:8}}><Button icon="check">অনুমোদন দিন</Button><Button variant="ghost">ফিরিয়ে দিন</Button></div></div>
  <h2 className="cm-h2"><Icon name="users" size={20}/>সদস্য<span style={{font:'400 15px var(--font-body)',color:'var(--text-2)'}}>· ৩ জন</span><a className="asd">আইডি শেয়ার করুন</a></h2>
  <div className="cm-list">{[['সাবরিনা','সাবরিনা হক (আপনি)','parent','মালিক · সব অনুমতি',null],['নাসরিন','শিক্ষিকা নাসরিন','teacher','আলো বিশেষ স্কুল · যোগ দিয়েছেন ২ এপ্রিল',[['file-text','ডকুমেন্ট']]],['তানভীর','ডা. তানভীর আহমেদ','specialist','শিশু বিকাশ বিশেষজ্ঞ · যোগ দিয়েছেন মার্চ ২০২৫',[['pill','ওষুধ'],['file-text','ডকুমেন্ট']]]].map(([a,n,r,s,sc])=><div key={n} className="cm-member"><Avatar name={a} size={48}/><div className="cm-member-t"><b>{n}<RoleBadge lang="bn" role={r}/></b><span>{s}</span></div><div className="cm-chips">{sc?sc.map(([ic,l])=><span key={l} className="cm-tag navy"><Icon name={ic} size={13}/>{l}</span>):null}</div>{sc?<IconButton icon="settings-2" label="অনুমতি বদলান"/>:<span style={{width:48}}></span>}</div>)}</div>
</div><aside className="cm-col">
  <div className="cm-panel"><h2 className="cm-h2" style={{fontSize:17}}><Icon name="history" size={18}/>কার্যকলাপ</h2><div>
    {[['user-plus','মাহমুদা আক্তার যোগ দেওয়ার অনুরোধ পাঠিয়েছেন','আজ, দুপুর ১:০২'],['eye','ডা. তানভীর প্রেসক্রিপশন দেখেছেন','গতকাল, রাত ৮:১৫'],['notebook-pen','নাসরিন আপা ক্লাস নোট লিখেছেন','১৩ অক্টো'],['shield-check','আপনি নাসরিন আপাকে ডকুমেন্ট দেখার অনুমতি দিয়েছেন','১০ অক্টো'],['share-2','আপনি চাইল্ড আইডি শেয়ার করেছেন','৯ অক্টো']].map(([ic,t,d],i)=><div key={i} className="cm-log"><Icon name={ic} size={16}/><div>{t}<em>{d}</em></div></div>)}</div></div>
</aside></div></Desk>;}

function DeskChat(){return <Desk tab="ch" headRight={<Button variant="secondary" icon="file-text">স্ট্যাটাস রিপোর্ট</Button>}><div style={{marginTop:16}}><div className="cm-dchat"><div className="cm-dchat-main"><div className="cm-thread" style={{padding:'20px 32px'}}><ChatThread/></div>
  <div style={{display:'flex',gap:8,padding:'0 32px 10px'}}><Chip lang="bn" label="এই সপ্তাহে কী বদলেছে?"/><Chip lang="bn" label="ডা. তানভীরের নোট বুঝিয়ে দিন"/><Chip lang="bn" label="স্ট্যাটাস রিপোর্ট বানাও"/></div>
  <div className="cm-composer" style={{padding:'12px 24px 16px'}}><IconButton icon="paperclip" label="ফাইল যোগ"/><div className="cm-input">রাফিকে নিয়ে প্রশ্ন লিখুন…</div><IconButton icon="mic" label="ভয়েস"/><IconButton icon="send" label="পাঠান"/></div></div>
  <aside className="cm-dchat-aside"><h2 className="cm-h2" style={{fontSize:17}}><Icon name="book-open" size={18}/>এই উত্তরের সূত্র</h2>
    {[['notebook-pen','৫টি ঘুমের লগ','১ – ১৪ অক্টো · আপনি'],['file-text','প্রেসক্রিপশন','১৪ অক্টো · ডা. তানভীর'],['book-open','ঘুমের রুটিন গাইড','সহযাত্রী লাইব্রেরি']].map(([ic,t,s])=><div key={t} className="cm-pick" style={{cursor:'default'}}><Tile icon={ic} tone="sky" size={36}/><div style={{flex:1}}><div style={{fontWeight:600,fontSize:15}}>{t}</div><div style={{fontSize:13,color:'var(--text-2)'}}>{s}</div></div></div>)}
    <div className="rs-nodx"><Icon name="info" size={18}/><span>সহযাত্রী AI চিকিৎসকের বিকল্প নয়। ওষুধ বা ডোজ নিয়ে ডা. তানভীরকে জিজ্ঞেস করুন।</span></div></aside></div></div></Desk>;}
Object.assign(window,{CarePlan,Documents,CareTeam,DeskChat});
})();
