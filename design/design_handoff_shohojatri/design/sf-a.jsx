(()=>{
const {Button,IconButton,TextField,ChoiceCard,ChoiceGroup,LanguageToggle,Card,Icon,Chip,ChildCard,RiskBadge,BottomNav}=window.ShohojatriDesignSystem_1ff839;

const NAV=[{id:'home',label:'হোম',icon:'house'},{id:'scr',label:'স্ক্রিনিং',icon:'clipboard-list'},{id:'comp',label:'সহযাত্রী',icon:'heart-handshake'},{id:'me',label:'প্রোফাইল',icon:'user'}];
function HomeTop(){return <><StatusBar/>
  <header style={{flex:'none',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 16px 4px',minHeight:52}}>
    <img src="assets/shohojatri-wordmark-bn.png" alt="সহযাত্রী" style={{height:30,display:'block',marginLeft:4}}/>
    <LanguageToggle value="bn"/>
  </header></>;}
function Greeting(){return <div style={{marginBottom:12}}><h1 style={{font:'700 24px/1.45 var(--font-display)',margin:0,color:'var(--text-1)'}}>শুভ সকাল, ফারহানা</h1><p style={{margin:0,color:'var(--text-2)'}}>আজ রাফির জন্য কী দিয়ে শুরু করবেন?</p></div>;}
function SecHead({icon,tone,title,sub}){return <div style={{display:'flex',alignItems:'center',gap:10,margin:'0 0 10px'}}><Tile icon={icon} tone={tone} size={36}/><div style={{lineHeight:1.3}}><div style={{font:'700 19px/1.4 var(--font-display)',color:'var(--text-1)'}}>{title}</div><div style={{fontSize:14,color:'var(--text-2)'}}>{sub}</div></div></div>;}
function ScreenHero({compact}){
  return <div className="sf-hero">
    <img src="assets/shohojatri-mark.png" alt="" style={{position:'absolute',right:14,top:14,width:compact?48:60,opacity:.95}}/>
    <div style={{font:'700 21px/1.45 var(--font-display)',color:'var(--sj-navy)',paddingRight:64}}>স্ক্রিনিং শুরু করুন</div>
    <p style={{margin:'2px 0 10px',fontSize:15,lineHeight:1.6,color:'var(--text-1)',paddingRight:compact?52:64}}>কিছু প্রশ্ন আর ছোট গেমে রাফির বিকাশের একটা ছবি পাবেন। এটি রোগনির্ণয় নয় — সময় লাগে প্রায় ১৫ মিনিট।</p>
    <Button icon="play" iconRight="arrow-right">শুরু করুন</Button>
  </div>;
}
function PastRow({date,age,level,progress}){
  return <div className="sf-row">
    <Tile icon={progress?'hourglass':'file-text'} tone={progress?'warm':'sky'} size={40}/>
    <div style={{flex:1,minWidth:0,lineHeight:1.4}}><div style={{fontWeight:600}}>{date}</div><div style={{fontSize:14,color:'var(--text-2)'}}>{age}</div></div>
    {progress?<span style={{fontSize:14,fontWeight:600,color:'var(--sj-ink-amber)'}}>চালিয়ে যান</span>:<RiskBadge level={level} lang="bn" showBars={false}/>}
    <Icon name="chevron-right" size={18} style={{color:'var(--text-3)'}}/>
  </div>;
}
function AddChild({small}){
  return <div className="sf-add"><Tile icon="user-plus" tone="calm" size={small?40:44}/>
    <div style={{flex:1,lineHeight:1.45}}><div style={{fontWeight:600,color:'var(--sj-navy)'}}>আমার শিশুকে যোগ করুন</div>{small?null:<div style={{fontSize:14,color:'var(--text-2)'}}>রোগনির্ণয় হয়ে থাকলে — পরিবার, শিক্ষক আর চিকিৎসক মিলে অগ্রগতি দেখুন।</div>}</div>
    <Icon name="plus" size={20} style={{color:'var(--sj-navy)'}}/></div>;
}
function ScreenRow(){return <div className="sf-row" style={{background:'var(--sj-sky-50)',border:0}}><Tile icon="clipboard-list" tone="sky" size={40}/><div style={{flex:1,lineHeight:1.4}}><div style={{fontWeight:600,color:'var(--sj-navy)'}}>নতুন স্ক্রিনিং</div><div style={{fontSize:14,color:'var(--text-2)'}}>রোগনির্ণয় নয় · প্রায় ১৫ মিনিট</div></div><Icon name="arrow-right" size={18} style={{color:'var(--sj-navy)'}}/></div>;}
const LBL={fontSize:14,fontWeight:600,color:'var(--text-2)',margin:'10px 0 6px'};
function HomeWrap({children,nav}){return <><HomeTop/><div style={{flex:1,minHeight:0,overflow:'hidden',padding:'0 20px 0'}}><Greeting/>{children}</div><BottomNav items={NAV} value={nav||'home'} lang="bn"/></>;}

function HomeScreening(){return <HomeWrap>
  <SecHead icon="clipboard-list" tone="sky" title="স্ক্রিনিং" sub="রাফির বিকাশ বুঝতে"/>
  <ScreenHero/>
  <div style={LBL}>আগের স্ক্রিনিং</div>
  <div style={{display:'flex',flexDirection:'column',gap:8}}>
    <PastRow progress date="অসম্পূর্ণ · প্রশ্ন ৮/২০" age="গতকাল শুরু করেছিলেন"/>
    <PastRow date="১২ জুন ২০২৬" age="রাফি · ২ বছর ৬ মাস" level="moderate"/>
  </div>
  <div style={{height:1,background:'var(--border-1)',margin:'10px 0 8px'}}></div>
  <SecHead icon="heart-handshake" tone="calm" title="সহযাত্রী" sub="রোগনির্ণয়ের পরের পথচলা"/>
  <AddChild small/>
</HomeWrap>;}

function HomeCompanion(){return <HomeWrap nav="comp">
  <SecHead icon="heart-handshake" tone="calm" title="সহযাত্রী" sub="রাফির অগ্রগতি, সবাই মিলে"/>
  <div style={{display:'flex',flexDirection:'column',gap:10}}>
    <ChildCard lang="bn" name="রাফি" meta="২ বছর ১০ মাস · মিরপুর, ঢাকা" stats={[{value:'৩',label:'আজকের নোট'},{value:'২',label:'রিমাইন্ডার'},{value:'৪',label:'সহযাত্রী'}]} badge={<Chip label="নতুন নোট" tone="leaf" lang="bn"/>}/>
    <ChildCard lang="bn" name="আনিকা" meta="৬ বছর ১ মাস · আজ ১টি নতুন নোট"/>
    <AddChild small/>
  </div>
  <div style={{height:1,background:'var(--border-1)',margin:'14px 0 10px'}}></div>
  <SecHead icon="clipboard-list" tone="sky" title="স্ক্রিনিং" sub="বিকাশ নিয়ে প্রশ্ন থাকলে"/>
  <ScreenRow/>
</HomeWrap>;}

function HomeBoth(){return <HomeWrap>
  <SecHead icon="clipboard-list" tone="sky" title="স্ক্রিনিং" sub="রাফির বিকাশ বুঝতে"/>
  <ScreenHero compact/>
  <div style={{marginTop:8}}><PastRow date="১২ জুন ২০২৬" age="শেষ স্ক্রিনিং · রিপোর্ট দেখুন" level="moderate"/></div>
  <div style={{height:1,background:'var(--border-1)',margin:'16px 0 14px'}}></div>
  <SecHead icon="heart-handshake" tone="calm" title="সহযাত্রী" sub="রোগনির্ণয়ের পরের পথচলা"/>
  <ChildCard lang="bn" name="আনিকা" meta="৬ বছর ১ মাস · আজ ১টি নতুন নোট" badge={<Chip label="রুমানা আপা" icon="school" tone="sky" lang="bn"/>}/>
</HomeWrap>;}

function Details(){const W=['মা','বাবা','দাদি / নানি','অন্য কেউ'];
  return <><StatusBar/><FlowHeader title="স্ক্রিনিং"/>
  <Body footer={<Button size="lg" block iconRight="arrow-right">এগিয়ে যান</Button>}>
    <FlowStep i={0}/>
    <Title sub="ফলাফল বয়স অনুযায়ী মিলিয়ে দেখতে এগুলো লাগবে।">শিশুর সম্পর্কে একটু বলুন</Title>
    <div className="sf-form">
      <TextField label="শিশুর নাম" icon="smile" defaultValue="রাফি"/>
      <TextField label="জন্ম তারিখ" icon="calendar" defaultValue="১৫ ডিসেম্বর ২০২৩" hint="বয়স: ২ বছর ১০ মাস"/>
      <div><div style={{fontWeight:600,marginBottom:4}}>কে উত্তর দিচ্ছেন?</div><div style={{fontSize:14,color:'var(--text-2)',marginBottom:10}}>যিনি রাফির সাথে সবচেয়ে বেশি সময় কাটান।</div>
        <div style={{display:'flex',flexWrap:'wrap',gap:8}}>{W.map((w,i)=><Chip key={w} label={w} selected={i===0} onClick={()=>{}} lang="bn"/>)}</div></div>
    </div>
  </Body></>;}

function Consent(){const P=[
  ['compass','calm','এটি রোগনির্ণয় নয়','পরবর্তী পদক্ষেপ বোঝার একটা সহায়ক। চূড়ান্ত কথা বলবেন বিশেষজ্ঞ।'],
  ['smartphone','sky','ক্যামেরা ও মাইক শুধু এই ফোনে','ভিডিও কখনো আপলোড হয় না — বিশ্লেষণ এই ফোনেই হয়।'],
  ['trash-2','warm','যেকোনো সময় মুছে ফেলুন','উত্তর, ভিডিও, রিপোর্ট — সব আপনার হাতে।'],
  ['users','leaf','রিপোর্ট কে দেখবে, আপনি ঠিক করবেন','আপনি না পাঠালে কেউ দেখতে পাবে না।']];
  return <><StatusBar/><FlowHeader title="স্ক্রিনিং"/>
  <Body footer={<Button size="lg" block iconRight="arrow-right">রাজি, এগিয়ে যান</Button>}>
    <FlowStep i={1}/>
    <Title>শুরুর আগে চারটি কথা</Title>
    <div style={{display:'flex',flexDirection:'column',gap:14,margin:'6px 0 18px'}}>{P.map(([ic,t,h,d])=><div key={h} style={{display:'flex',gap:14,alignItems:'flex-start'}}><Tile icon={ic} tone={t} size={44}/><div style={{lineHeight:1.55}}><div style={{fontWeight:600}}>{h}</div><div style={{fontSize:15,color:'var(--text-2)'}}>{d}</div></div></div>)}</div>
    <ChoiceCard multi selected label="আমি পড়েছি এবং রাজি আছি" onSelect={()=>{}} lang="bn"/>
  </Body></>;}

const QOPTS=['হ্যাঁ, বেশিরভাগ সময়','মাঝে মাঝে','খুব কম','কখনো না','নিশ্চিত নই'].map((l,k)=>({value:'o'+k,label:l}));
const OTHER={label:'অন্য কিছু (লিখে দিন)',fieldLabel:'নিজের ভাষায় লিখুন',placeholder:'যেমন: টিভি চললে তাকায় না…'};
function QTop(){return <><StatusBar/>
  <header style={{flex:'none',display:'flex',alignItems:'center',gap:8,padding:'0 12px 4px 12px',minHeight:56}}>
    <IconButton icon="arrow-left" label="আগের প্রশ্ন"/>
    <div style={{flex:1}}>
      <div style={{display:'flex',justifyContent:'space-between',fontSize:14,fontWeight:600,marginBottom:6}}><span style={{color:'var(--sj-navy)'}}>প্রশ্ন ৫/২০</span><span style={{color:'var(--text-2)'}}>যোগাযোগ</span></div>
      <div className="sf-prog"><i style={{width:'25%'}}></i></div>
    </div>
    <IconButton icon="pause" label="থামুন" variant="soft" size="sm"/>
  </header></>;}
function QIllo(){return <div className="sf-illo" role="img" aria-label="ছবি: মা পেছন থেকে নাম ধরে ডাকছেন, শিশু খেলছে"><Tile icon="megaphone" tone="warm" size={44}/><span className="sf-wave"></span><Tile icon="baby" tone="calm" size={52}/><span className="sf-illo-tag">ছবি</span></div>;}
function QHead(){return <><QIllo/><h2 className="sf-q">রাফিকে নাম ধরে ডাকলে সে কি আপনার দিকে তাকায়?</h2><p style={{margin:'0 0 14px',fontSize:15,color:'var(--text-2)'}}>সঠিক বা ভুল উত্তর নেই — যা দেখেছেন সেটাই বেছে নিন।</p></>;}
function QFoot(){return <Button size="lg" block iconRight="arrow-right">পরের প্রশ্ন</Button>;}

function Question(){return <><QTop/><Body footer={<QFoot/>}><QHead/>
  <ChoiceGroup lang="bn" value="o1" options={QOPTS} other={OTHER}/></Body></>;}
function QuestionOther(){return <><QTop/><Body footer={<QFoot/>}>
  <h2 className="sf-q" style={{marginTop:4}}>রাফিকে নাম ধরে ডাকলে সে কি আপনার দিকে তাকায়?</h2>
  <p style={{margin:'0 0 14px',fontSize:15,color:'var(--text-2)'}}>সঠিক বা ভুল উত্তর নেই — যা দেখেছেন সেটাই বেছে নিন।</p>
  <ChoiceGroup lang="bn" value="__other__" options={QOPTS.slice(0,3)} other={OTHER} otherValue="খেলার সময় ডাকলে কখনো কখনো তাকায়, কার্টুন চললে একদমই না।"/>
</Body></>;}
function QuestionAI(){return <><QTop/><Body footer={<QFoot/>}>
  <h2 className="sf-q" style={{marginTop:4}}>রাফিকে নাম ধরে ডাকলে সে কি আপনার দিকে তাকায়?</h2>
  <div style={{fontSize:14,fontWeight:600,color:'var(--text-2)',margin:'6px 0 8px'}}>আপনার উত্তর</div>
  <div className="sf-quote">“খেলার সময় ডাকলে কখনো কখনো তাকায়, কার্টুন চললে একদমই না।”<button className="sf-link">লেখা বদলান</button></div>
  <div className="sf-ai">
    <div style={{display:'flex',alignItems:'center',gap:8,color:'var(--sj-ink-teal)',fontWeight:600,fontSize:14}}><Icon name="sparkles" size={18}/>সহযাত্রী বুঝে নিয়েছে</div>
    <div style={{font:'700 21px/1.5 var(--font-display)',color:'var(--text-1)',margin:'6px 0 4px'}}>আমরা বুঝেছি: <span style={{color:'var(--sj-navy)'}}>মাঝে মাঝে</span> — ঠিক আছে?</div>
    <p style={{margin:'0 0 14px',fontSize:15,color:'var(--text-2)'}}>আপনার লেখাটাও রিপোর্টে যোগ থাকবে।</p>
    <div style={{display:'flex',gap:8,flexWrap:'wrap'}}><Button icon="check">হ্যাঁ, ঠিক আছে</Button><Button variant="secondary" icon="pencil">বদলে দিন</Button></div>
  </div>
</Body></>;}

function Part2(){const A=[['ear','নাম ধরে ডাকা','১ মিনিট'],['hand','যেখানে দেখাই','২ মিনিট'],['person-standing','আমার মতো করো','২ মিনিট'],['eye','দেখো আর তাকাও','১ মিনিট · ঐচ্ছিক'],['blocks','ফ্রি প্লে','২ মিনিট']];
  return <><StatusBar/><FlowHeader title="দ্বিতীয় ভাগ"/>
  <Body footer={<Button size="lg" block iconRight="arrow-right">ক্যামেরা ঠিক করে নিই</Button>}>
    <FlowStep i={3}/>
    <Title sub="ফোনের ক্যামেরা রাফিকে দেখবে, আপনি পাশে থাকবেন।">এবার কয়েকটি ছোট গেম</Title>
    <div className="sf-list">{A.map(([ic,n,m],i)=><div key={n} className="sf-li"><span className="sf-num">{bn(i+1)}</span><Icon name={ic} size={20} style={{color:'var(--sj-ink-teal)'}}/><span style={{flex:1,fontWeight:600}}>{n}</span><span style={{fontSize:14,color:'var(--text-2)'}}>{m}</span></div>)}</div>
    <div style={{fontWeight:600,margin:'16px 0 8px'}}>যা লাগবে</div>
    <div style={{display:'flex',flexWrap:'wrap',gap:8}}><Chip label="একটা প্রিয় খেলনা" icon="toy-brick" tone="warm" lang="bn"/><Chip label="ভালো আলো" icon="sun" tone="warm" lang="bn"/><Chip label="শান্ত ঘর" icon="volume-x" tone="warm" lang="bn"/></div>
    <Card tone="calm" padding={14} style={{marginTop:16}}><div style={{display:'flex',gap:10,fontSize:15,lineHeight:1.6,color:'var(--sj-ink-teal)'}}><Icon name="skip-forward" size={20} style={{flex:'none',marginTop:3}}/><span>প্রতিটি গেম বাদ দেওয়া যায়। রাফি ক্লান্ত হলে থামুন — পরে আবার করা যাবে।</span></div></Card>
  </Body></>;}

Object.assign(window,{HomeScreening,HomeCompanion,HomeBoth,Details,Consent,Question,QuestionOther,QuestionAI,Part2});

})();
