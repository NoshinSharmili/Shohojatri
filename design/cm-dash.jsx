(()=>{
const {Button,IconButton,Icon,Chip,Avatar,Tabs,SourceChip,LogEntryCard,RoleBadge,Card}=window.ShohojatriDesignSystem_1ff839;
const GOALS=[['চাওয়ার জন্য “আরও” বলা','ভাষা','নাসরিন আপা',70],['৩ মিনিট পালা নিয়ে খেলা','সামাজিক','ডা. তানভীর',55],['রাত ১০টার মধ্যে ঘুম','ঘুম','আপনি',25]];
function Goals(){return <div className="cm-list">{GOALS.map(([g,d,o,v])=><div key={g} className="cm-goal"><div className="cm-goal-t"><span>{g}</span><em>{bn(v)}%</em></div><Bar v={v} tone={v<40?'var(--sj-amber)':'var(--sj-leaf)'}/><div className="cm-goal-m"><span className="cm-tag">{d}</span><span>দেখছেন: {o}</span></div></div>)}</div>;}
function Overview(){return <Desk tab="ov"><div className="cm-dcontent"><div className="cm-col">
  <div className="cm-hero"><div className="cm-eyebrow"><Icon name="sparkles" size={16}/>এখন রাফি<span>এআই সারাংশ · আজ সকাল ৮টায় হালনাগাদ</span></div>
    <p>রাফি এই সপ্তাহে বুদবুদ ও পানি খেলায় নিজে থেকে <b>“আরও”</b> বলেছে ৪ বার — আগের সপ্তাহে ছিল ১ বার। স্কুলে নাসরিন আপার সাথে পালা নিয়ে ব্লক খেলায় প্রায় ৩ মিনিট থেকেছে। ঘুম এখনো দেরিতে (গড় রাত ১১:৪০), তবে যেদিন সন্ধ্যায় হেঁটেছে সেদিন আগে ঘুমিয়েছে মনে হচ্ছে।</p>
    <div className="cm-srcs"><SourceChip lang="bn" kind="log" label="১২টি লগ"/><SourceChip lang="bn" kind="report" label="স্কুল নোট · ১৩ অক্টো"/><SourceChip lang="bn" kind="doc" label="প্রেসক্রিপশন"/></div>
    <div style={{display:'flex',gap:8}}><Button size="sm" variant="secondary" icon="message-circle">এ নিয়ে প্রশ্ন করুন</Button><Button size="sm" variant="ghost" icon="flag">কিছু ভুল আছে</Button></div></div>
  <h2 className="cm-h2"><Icon name="activity" size={20}/>সাম্প্রতিক পরিবর্তন<a className="asd">টাইমলাইন</a></h2>
  <div className="cm-list">
    <div className="cm-chg"><Tile icon="trending-up" tone="leaf" size={40}/><div className="cm-chg-t">একক শব্দে চাওয়া বেড়েছে<span>ভাষা · ৪টি লগ · আপনি ও নাসরিন আপা</span></div><span className="cm-tag leaf">অগ্রগতি</span></div>
    <div className="cm-chg"><Tile icon="star" tone="warm" size={40}/><div className="cm-chg-t">প্রথমবার! অন্য শিশুর হাতে বল দিল<span>সামাজিক · স্কুল নোট · ১৩ অক্টো</span></div><span className="cm-tag warm">প্রথমবার</span></div>
    <div className="cm-chg"><Tile icon="pill" tone="sky" size={40}/><div className="cm-chg-t">নতুন ওষুধ যোগ হয়েছে — Melatonin সিরাপ<span>প্রেসক্রিপশন · ডা. তানভীর · ১৪ অক্টো</span></div><span className="cm-tag sky">কেয়ার প্ল্যান</span></div>
  </div>
  <h2 className="cm-h2"><Icon name="circle-help" size={20}/>খোলা প্রশ্ন</h2>
  <div className="cm-list">
    <div className="cm-chg"><Tile icon="scissors" tone="warm" size={40}/><div className="cm-chg-t">চুল কাটার সময় খুব অস্থির হয়<span>আপনি তুলেছেন · ৩ দিন আগে · ১টি উত্তর</span></div><Button size="sm" variant="secondary">ডা. তানভীরকে জিজ্ঞেস করুন</Button></div>
    <div className="cm-chg"><Tile icon="clock" tone="warm" size={40}/><div className="cm-chg-t">সিরাপ ঘুমের কতক্ষণ আগে?<span>ডকুমেন্ট থেকে — প্রেসক্রিপশনে পড়া যায়নি</span></div><Button size="sm" variant="secondary">জিজ্ঞেস করুন</Button></div>
  </div>
</div><aside className="cm-col">
  <div className="cm-panel"><h2 className="cm-h2" style={{fontSize:17}}><Icon name="calendar-check" size={18}/>পরের অ্যাপয়েন্টমেন্ট</h2>
    <div className="cm-appt"><div className="cm-date"><b>১২</b><span>নভেম্বর</span></div><div style={{flex:1}}><div style={{fontWeight:600}}>ফলো-আপ — ডা. তানভীর</div><div style={{fontSize:14,color:'var(--text-2)'}}>বুধবার, সকাল ১১:০০<br/>শিশু বিকাশ কেন্দ্র, ধানমন্ডি</div></div></div>
    <Button size="sm" variant="secondary" icon="file-text">রিপোর্ট আগে পাঠান</Button></div>
  <div className="cm-panel" style={{gap:0,padding:'18px 0 4px'}}><h2 className="cm-h2" style={{fontSize:17,padding:'0 20px 8px'}}><Icon name="target" size={18}/>লক্ষ্য<a className="asd">সব</a></h2><div style={{borderTop:'1px solid var(--border-1)'}}><Goals/></div></div>
  <div className="cm-panel"><h2 className="cm-h2" style={{fontSize:17}}><Icon name="sun" size={18}/>আজ</h2><div style={{fontSize:15,display:'flex',flexDirection:'column',gap:6}}><div className="cm-row"><Icon name="message-circle" size={16} color="var(--sj-ink-teal)"/>স্পিচ থেরাপি · বিকাল ৪:০০</div><div className="cm-row"><Icon name="footprints" size={16} color="var(--sj-ink-teal)"/>সন্ধ্যার হাঁটা · ৬:০০</div></div></div>
</aside></div></Desk>;}

function Explain({open}){const [o,setO]=React.useState(open);return o?<div className="cm-simple"><b><Icon name="sparkles" size={14}/>সহজ করে বললে</b><span>রাফি এখন ছোট ছোট খেলায় অন্যের সাথে পালা নিতে শিখছে। ক্লাসে নাসরিন আপা ছবি দেখিয়ে আগে বলে দেন এরপর কী হবে — এতে রাফি শান্ত থাকে। বাসায়ও খেলার আগে “আগে … তারপর …” বলে দেখতে পারেন।</span><div className="cm-srcs"><SourceChip lang="bn" kind="report" label="নাসরিন আপার নোট"/><button className="sf-link" onClick={()=>setO(false)}>মূল লেখা দেখুন</button></div></div>:<button className="cm-explain" onClick={()=>setO(true)}><Icon name="sparkles" size={16}/>সহজ করে বুঝিয়ে দিন</button>;}
function Timeline(){const [f,setF]=React.useState('all');return <Desk tab="tl"><div className="cm-dcontent"><div className="cm-col">
  <div className="cm-filters"><Tabs lang="bn" variant="pill" value={f} onChange={setF} items={[{id:'all',label:'সব'},{id:'p',label:'অভিভাবক'},{id:'t',label:'শিক্ষক'},{id:'s',label:'বিশেষজ্ঞ'}]}/><div style={{flex:1}}></div><Chip lang="bn" icon="calendar" label="গত ৩০ দিন"/></div>
  <div className="cm-filters"><ChipSet items={['ভাষা','সামাজিক','খেলা','আচরণ','ঘুম','খাবার']} sel={[]}/></div>
  <div className="cm-tlday">আজ</div>
  <LogEntryCard lang="bn" author="সাবরিনা (আপনি)" role="parent" time="বিকাল ১:২০" body="বুদবুদ ফুরিয়ে গেলে নিজে থেকে “আরও” বলল — দুইবার!" tags={[{label:'ভাষা',tone:'calm'},{label:'খেলা',tone:'calm'},{label:'ভালো',tone:'leaf'}]}/>
  <div className="cm-tlday">১৩ অক্টোবর</div>
  <LogEntryCard lang="bn" author="শিক্ষিকা নাসরিন" role="teacher" time="দুপুর ১২:০৫" title="ক্লাস নোট" body="Turn-taking during structured block play sustained ~3 min with visual schedule + first-then board. Transition to snack: mild protest, resolved with 2-min warning." tags={[{label:'সামাজিক',tone:'sky'},{label:'রুটিন',tone:'sky'}]} comments={<Explain open/>}/>
  <div className="cm-tlday">১০ অক্টোবর</div>
  <LogEntryCard lang="bn" author="ডা. তানভীর আহমেদ" role="specialist" time="সকাল ১১:৩০" title="মূল্যায়ন নোট" body="Emerging single-word mands (5–6 consistent). Recommend expanding to 2-word combinations via mand-model in preferred activities. Sleep onset latency high; trial melatonin 1 ml, review in 4 wks." tags={[{label:'ভাষা',tone:'leaf'},{label:'ঘুম',tone:'leaf'}]} comments={<Explain/>}/>
</div><aside className="cm-col">
  <div className="cm-panel"><h2 className="cm-h2" style={{fontSize:17}}><Icon name="chart-column" size={18}/>এই ৩০ দিনে</h2>
    {[['অভিভাবক','parent','২৪'],['শিক্ষক','teacher','৯'],['বিশেষজ্ঞ','specialist','৫']].map(([l,r,n])=><div key={r} className="cm-row" style={{justifyContent:'space-between'}}><RoleBadge lang="bn" role={r}/><b style={{fontFamily:'var(--font-display)',fontSize:18}}>{n}টি</b></div>)}</div>
  <Button block icon="notebook-pen">লগ লিখুন</Button>
</aside></div></Desk>;}

const CH=[['ভাষা','message-circle',[2,2.1,2.4,2.3,2.8,3,3.2,3.4],'up','বেড়েছে','var(--sj-teal)'],['সামাজিক','users',[2.4,2.5,2.4,2.7,2.8,2.8,2.9,3.1],'up','একটু বেড়েছে','var(--sj-blue)'],['ঘুম','moon',[2,2.3,2.1,1.9,2.1,2.4,2.2,2.1],'flat','একই রকম','var(--sj-leaf)'],['আচরণ ও শান্ত থাকা','heart',[3.3,3.2,3,3.1,2.9,2.7,2.6,2.5],'dn','নজর দিন','var(--sj-amber)']];
function Progress(){const [r,setR]=React.useState('8');return <Desk tab="pg"><div className="cm-dcontent one"><div className="cm-col">
  <div className="cm-filters"><h2 className="cm-h2" style={{flex:1}}><Icon name="chart-line" size={20}/>ক্ষেত্রভিত্তিক ট্রেন্ড<span style={{font:'400 15px var(--font-body)',color:'var(--text-2)'}}>— লগের গড় রেটিং (১–৫)</span></h2><Tabs lang="bn" variant="pill" value={r} onChange={setR} items={[{id:'4',label:'৪ সপ্তাহ'},{id:'8',label:'৮ সপ্তাহ'},{id:'24',label:'৬ মাস'}]}/></div>
  <div className="cm-charts">{CH.map(([n,ic,d,dir,t,c])=><div key={n} className="cm-chart"><div className="cm-chart-h"><Tile icon={ic} tone={dir==='dn'?'warm':'calm'} size={36}/><b>{n}</b><Trend dir={dir}>{t}</Trend></div><Spark data={d} color={c} w={420} h={120}/><div className="cm-axis"><span>২২ আগস্ট</span><span>এই সপ্তাহ</span></div></div>)}</div>
  <div style={{display:'grid',gridTemplateColumns:'minmax(0,1fr) minmax(0,1fr)',gap:24,alignItems:'start'}}>
    <div className="cm-col"><h2 className="cm-h2"><Icon name="target" size={20}/>লক্ষ্যের অগ্রগতি</h2><Goals/></div>
    <div className="cm-col"><h2 className="cm-h2"><Icon name="clipboard-check" size={20}/>সাপ্তাহিক চেক-ইন<span style={{font:'400 15px var(--font-body)',color:'var(--text-2)'}}>· রবিবার</span></h2>
      <div className="cm-metrics" style={{gridTemplateColumns:'1fr 1fr'}}>
        <div className="cm-metric"><span>নতুন শব্দ</span><b>৬টি</b><em className="cm-trend up">আগের সপ্তাহে ৩টি</em></div>
        <div className="cm-metric"><span>গড় ঘুম</span><b>৯ ঘ. ১০ মি.</b><em className="cm-trend flat">আগের মতোই</em></div>
        <div className="cm-metric"><span>কঠিন মুহূর্ত</span><b>৫ বার</b><em className="cm-trend dn">আগের সপ্তাহে ৩ বার</em></div>
        <div className="cm-metric"><span>করা অ্যাক্টিভিটি</span><b>৪ / ৬</b><em className="cm-trend up">৬৭%</em></div>
      </div>
      <div className="cm-note warm"><Icon name="lightbulb" size={18}/><span>কঠিন মুহূর্তগুলো বেশিরভাগ বিকালে, রুটিন বদলের সময় হয়েছে মনে হচ্ছে। নাসরিন আপার “আগে-তারপর” বোর্ড বাসায় চেষ্টা করে দেখতে পারেন।</span></div></div>
  </div>
</div></div></Desk>;}
Object.assign(window,{Overview,Timeline,Progress,Goals});
})();
