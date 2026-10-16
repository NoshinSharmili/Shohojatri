(()=>{
const {Button,IconButton,TextField,Icon,Chip,Avatar,ChildCard,ReminderCard,ActivityCard,Sheet,Toast,Tabs,SourceChip,SuggestionCard}=window.ShohojatriDesignSystem_1ff839;
function HomeTop(){return <div className="cm-top"><img src={LOGO} alt="সহযাত্রী" style={{height:34}}/><div style={{flex:1}}></div><IconButton icon="bell" label="রিমাইন্ডার"/><Avatar name="সাবরিনা" size={40}/></div>;}
function HomeBody(){return <div className="cm-body">
  <div className="cm-greet">শুভ বিকাল, সাবরিনা</div>
  <ChildCard lang="bn" name="রাফি" meta="৩ বছর ২ মাস · মিরপুর, ঢাকা" badge={<span className="cm-idpill">SJ-7K3QX</span>}/>
  <h2 className="cm-h2"><Icon name="sun" size={20}/>আজ<a className="asd">সব দেখুন</a></h2>
  <div style={{display:'flex',flexDirection:'column',gap:10}}><ReminderCard lang="bn" kind="therapy" title="স্পিচ থেরাপি — শিশু বিকাশ কেন্দ্র" time="বিকাল ৪:০০"/><ReminderCard lang="bn" kind="activity" title="সন্ধ্যার হাঁটা — পার্কে" time="সন্ধ্যা ৬:০০"/></div>
  <h2 className="cm-h2"><Icon name="sparkles" size={20}/>চেষ্টা করে দেখতে পারেন</h2>
  <div className="cm-mini-act" style={{marginRight:0}}><Tile icon="wind" tone="calm" size={48}/><div style={{flex:1}}><b>বুদবুদ খেলায় পালা নেওয়া</b><span>১০ মিনিট · ঘরে · “আরও” বলার লক্ষ্য</span></div><IconButton icon="chevron-right" label="দেখুন"/></div>
</div>;}
function Home(){return <Phone><StatusBar/><HomeTop/><HomeBody/><button className="cm-fab" aria-label="দ্রুত লগ"><Icon name="plus" size={24}/>লগ</button><ParentNav value="home"/></Phone>;}
const DOMS=[['ভাষা','message-circle'],['সামাজিক','users'],['খেলা','blocks'],['আচরণ','heart'],['ঘুম','moon'],['খাবার','utensils'],['ইন্দ্রিয়','ear'],['চলাফেরা','footprints']];
function LogSheet({step}){
  return <Phone><StatusBar/><HomeTop/><HomeBody/><ParentNav value="home"/>
  <Sheet lang="bn" inline title="দ্রুত লগ" onClose={()=>{}} closeLabel="বন্ধ করুন" footer={step===1?<Button block size="lg" iconRight="arrow-right">পরবর্তী</Button>:<><Button block size="lg" icon="check">সেভ করুন</Button><span style={{textAlign:'center',fontSize:14,color:'var(--text-2)'}}>নাসরিন আপা ও ডা. তানভীর দেখতে পাবেন</span></>}>
    <div style={{display:'flex',flexDirection:'column',gap:16,color:'var(--text-1)'}}>
      <div style={{fontSize:14,fontWeight:600,color:'var(--text-2)'}}>ধাপ {bn(step)} / ২</div>
      {step===1?<><div className="cm-label" style={{margin:0}}>কোন বিষয়ে?</div><SelChips sel={['ভাষা','খেলা']}/></>:<>
        <div className="cm-chips"><Chip lang="bn" label="ভাষা" tone="calm"/><Chip lang="bn" label="খেলা" tone="calm"/></div>
        <div><div className="cm-label">আজ কেমন গেল?</div><Faces value={4}/></div>
        <TextField lang="bn" label="কী দেখলেন?" optionalLabel="(ঐচ্ছিক)" multiline rows={3} defaultValue="বুদবুদ ফুরিয়ে গেলে নিজে থেকে “আরও” বলল — দুইবার!"/>
        <div style={{display:'flex',gap:8}}><Button variant="secondary" size="sm" icon="camera">ছবি</Button><Button variant="secondary" size="sm" icon="mic">ভয়েস নোট</Button></div>
      </>}
    </div>
  </Sheet></Phone>;
}
function SelChips({sel}){const [s,setS]=React.useState(sel);return <div className="cm-chips">{DOMS.map(([d,ic])=><Chip key={d} lang="bn" label={d} icon={s.includes(d)?undefined:ic} selected={s.includes(d)} onClick={()=>setS(s.includes(d)?s.filter(x=>x!==d):[...s,d])}/>)}<Chip lang="bn" icon="pencil" label="অন্য (লিখুন)"/></div>;}
function LogSaved(){return <Phone><StatusBar/><HomeTop/><HomeBody/><div style={{position:'absolute',left:16,right:16,bottom:92,zIndex:6}}><Toast lang="bn" tone="success" title="লগ সেভ হয়েছে" message="ভাষা · খেলা — নাসরিন আপা ও ডা. তানভীর দেখতে পাবেন।" actionLabel="ফিরিয়ে নিন" onAction={()=>{}} onClose={()=>{}}/></div><ParentNav value="home"/></Phone>;}

function Reminders(){const [tab,setTab]=React.useState('today');return <Phone><StatusBar/>
  <div className="cm-top"><h1 className="cm-h1" style={{flex:1}}>রিমাইন্ডার</h1><IconButton icon="calendar" label="ক্যালেন্ডার"/></div>
  <div style={{padding:'0 20px 8px'}}><Tabs lang="bn" variant="pill" value={tab} onChange={setTab} items={[{id:'today',label:'আজ',count:'৩'},{id:'week',label:'এই সপ্তাহ'},{id:'all',label:'সব'}]}/></div>
  <div className="cm-body">
    <div className="cm-draft"><Tile icon="sparkles" tone="sky" size={40}/><div style={{flex:1}}><b>খসড়া: ঘুমের রুটিন, রাত ৮:৩০</b><span>চ্যাট থেকে এসেছে — যাচাই করুন</span></div><Button size="sm">যোগ করুন</Button></div>
    <div className="cm-rem-g">আজ · বুধবার, ১৫ অক্টোবর</div>
    <ReminderCard lang="bn" kind="medicine" title="মেলাটোনিন সিরাপ ১ মি.লি." time="সকাল ৮:০০ · দেওয়া হয়েছে" done/>
    <ReminderCard lang="bn" kind="therapy" title="স্পিচ থেরাপি — শিশু বিকাশ কেন্দ্র" time="বিকাল ৪:০০ · ৩০ মিনিট আগে মনে করাবে"/>
    <ReminderCard lang="bn" kind="activity" title="সন্ধ্যার হাঁটা — পার্কে" time="সন্ধ্যা ৬:০০"/>
    <div className="cm-rem-g">পরে · ১২ নভেম্বর</div>
    <ReminderCard lang="bn" kind="appointment" title="ফলো-আপ — ডা. তানভীর" time="সকাল ১১:০০ · প্রেসক্রিপশন থেকে"/>
  </div>
  <button className="cm-fab" aria-label="রিমাইন্ডার যোগ করুন"><Icon name="plus" size={24}/>নতুন</button>
  <ParentNav value="rem"/></Phone>;}

function ActivityDetail(){return <TallPhone><StatusBar/><MHead title="অ্যাক্টিভিটি" right={<IconButton icon="bookmark" label="সেভ করুন"/>}/>
  <div className="cm-tall">
    <div className="cm-hero" style={{alignItems:'flex-start'}}><Tile icon="wind" tone="calm" size={56}/><h1 className="cm-h1">বুদবুদ খেলায় পালা নেওয়া</h1>
      <div className="cm-chips"><span className="cm-tag sky"><Icon name="clock" size={14}/>১০ মিনিট</span><span className="cm-tag sky"><Icon name="house" size={14}/>ঘরে</span><span className="cm-tag sky"><Icon name="repeat" size={14}/>সপ্তাহে ৩ বার</span></div></div>
    <section style={{display:'flex',flexDirection:'column',gap:10}}><h2 className="cm-h2"><Icon name="sprout" size={20}/>কেন এটা সাহায্য করে</h2>
      <div className="cm-why"><span>বুদবুদ থামলে রাফির “আরও” বলার একটা স্বাভাবিক কারণ তৈরি হয়। এতে চাওয়া প্রকাশ আর পালা নেওয়া — দুটোই অনুশীলন হয়।</span><div className="cm-srcs"><SourceChip lang="bn" kind="doc" label="কেয়ার প্ল্যান · ডা. তানভীর"/><SourceChip lang="bn" kind="log" label="৬টি ভাষার লগ"/></div></div></section>
    <section style={{display:'flex',flexDirection:'column',gap:10}}><h2 className="cm-h2"><Icon name="package" size={20}/>যা লাগবে</h2>
      <div className="cm-grid2"><div className="cm-mat"><Icon name="wind" size={18}/>বুদবুদের বোতল</div><div className="cm-mat"><Icon name="armchair" size={18}/>বসার একটা জায়গা</div><div className="cm-mat"><Icon name="timer" size={18}/>১০ মিনিট সময়</div><div className="cm-mat"><Icon name="volume-x" size={18}/>শান্ত ঘর</div></div></section>
    <section style={{display:'flex',flexDirection:'column',gap:10}}><h2 className="cm-h2"><Icon name="list-ordered" size={20}/>ধাপ</h2>
      <div className="cm-list">{['রাফির মুখোমুখি, চোখের সমান উচ্চতায় বসুন।','কয়েকটা বুদবুদ উড়িয়ে থেমে যান, বোতলটা নিজের মুখের কাছে ধরুন।','অপেক্ষা করুন — ৫ সেকেন্ড। রাফি তাকালে, হাত বাড়ালে বা শব্দ করলে সেটাই উত্তর।','“আরও!” বলে মডেল করুন, তারপর আবার বুদবুদ দিন।','৫–৬ বার করুন। আগ্রহ কমলে আনন্দের সাথে শেষ করুন।'].map((s,i)=><div key={i} className="cm-step"><span className="cm-num">{bn(i+1)}</span><span>{s}</span></div>)}</div></section>
    <div className="cm-note warm"><Icon name="lightbulb" size={18}/><span>রাফি আগ্রহ না দেখালে জোর করবেন না — পরে আবার চেষ্টা করুন। ঘোরা বা গানের সাথেও এটা করা যায়।</span></div>
    <div style={{display:'flex',flexDirection:'column',gap:8}}><Button block size="lg" icon="check">করেছি</Button><Button block variant="ghost">পরে করব</Button></div>
  </div></TallPhone>;}
function ActivityDone(){return <Phone><StatusBar/><MHead title="অ্যাক্টিভিটি"/><div className="cm-body" style={{opacity:.5}}><div className="cm-hero"><h1 className="cm-h1">বুদবুদ খেলায় পালা নেওয়া</h1></div></div>
  <Sheet lang="bn" inline footer={<><Button block size="lg" icon="check">সেভ করুন</Button><Button block variant="ghost">শুধু শেষ হিসেবে রাখুন</Button></>}>
    <div style={{display:'flex',flexDirection:'column',gap:14,alignItems:'center',textAlign:'center',color:'var(--text-1)'}}>
      <span className="rs-star" style={{width:64,height:64}}><Icon name="star" size={32}/></span>
      <h2 style={{margin:0,font:'700 22px/1.45 var(--font-display)'}}>দারুণ! এই সপ্তাহে ২য় বার</h2>
      <span style={{color:'var(--text-2)'}}>কেমন গেল? এটা রাফির টাইমলাইনে লগ হিসেবে যাবে।</span>
      <div style={{width:'100%'}}><Faces value={5}/></div>
      <div style={{width:'100%',textAlign:'left'}}><TextField lang="bn" label="ছোট নোট" optionalLabel="(ঐচ্ছিক)" placeholder="যেমন: নিজে থেকে “আরও” বলল"/></div>
    </div></Sheet></Phone>;}
Object.assign(window,{Home,LogSheet,LogSaved,Reminders,ActivityDetail,ActivityDone});
})();
