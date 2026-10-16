(()=>{
const {Button,IconButton,Card,Icon,Chip,Sheet,Toast,ChatBubble,RiskBadge,LanguageToggle}=window.ShohojatriDesignSystem_1ff839;
const PINS=[[44,30,'stethoscope'],[68,22,'message-circle'],[22,62,'brain'],[80,66,'school']];
function Behind(){return <><StatusBar/><AppHeader title="রাফির ফলাফল" left="x" right={<IconButton icon="share-2" label="শেয়ার করুন"/>}/><div className="rs-body"><ResultTop d={RS.elevated} level="elevated"/></div></>;}
function LinkBox({off}){return <div className={'rs-link'+(off?' off':'')}><Icon name={off?'link-2-off':'link'} size={18}/><span>shohojatri.app/r/7KQ2-M9XA</span>{off?null:<Button size="sm" variant="secondary" icon="copy" lang="bn">কপি</Button>}</div>;}
function ShareSheet(){return <Phone><Behind/>
  <Sheet inline lang="bn" title="রিপোর্ট শেয়ার করুন" onClose={()=>{}} closeLabel="বন্ধ করুন" footer={<>
    <div style={{display:'flex',gap:10}}><div style={{flex:1.4}}><Button variant="primary" block icon="message-circle" lang="bn">WhatsApp-এ পাঠান</Button></div><div style={{flex:1}}><Button variant="secondary" block icon="qr-code" lang="bn">QR দেখান</Button></div></div>
    <button className="rs-revoke"><Icon name="link-2-off" size={18}/><span>লিংক এখনই বন্ধ করুন</span></button>
  </>}>
    <div style={{display:'flex',flexDirection:'column',gap:14}}>
      <p style={{margin:0}}>লিংক খুললেই ডাক্তার রিপোর্টটি দেখতে পারবেন — কোনো অ্যাপ লাগবে না। শুধু দেখা যাবে, বদলানো যাবে না।</p>
      <div className="rs-seg" role="radiogroup"><button className="on" aria-checked="true"><Icon name="stethoscope" size={16}/>ডাক্তারের রিপোর্ট</button><button aria-checked="false"><Icon name="heart" size={16}/>অভিভাবকের সারাংশ</button></div>
      <LinkBox/>
      <div><div className="rs-label">কতদিন খোলা থাকবে</div><div className="rs-chips"><Chip label="২৪ ঘণ্টা" onClick={()=>{}} lang="bn"/><Chip label="৭ দিন" selected onClick={()=>{}} lang="bn"/><Chip label="৩০ দিন" onClick={()=>{}} lang="bn"/></div>
      <div className="rs-hint"><Icon name="clock" size={16}/>২২ অক্টোবর, রাত ১১:৫৯-এ নিজে থেকেই বন্ধ হবে</div></div>
    </div>
  </Sheet></Phone>;}
function ShareQR(){return <Phone><Behind/>
  <div style={{position:'absolute',top:56,left:16,right:16,zIndex:120}}><Toast tone="success" title="লিংক কপি হয়েছে" message="এখন যেকোনো অ্যাপে পেস্ট করতে পারেন।" lang="bn"/></div>
  <Sheet inline lang="bn" title="QR স্ক্যান করতে দিন" onClose={()=>{}} closeLabel="বন্ধ করুন" footer={<Button variant="secondary" block icon="download" lang="bn">QR ছবি সেভ করুন</Button>}>
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:12,textAlign:'center'}}>
      <div className="rs-qrwrap"><QR size={200}/></div>
      <p style={{margin:0}}>ডাক্তারের ফোনের ক্যামেরা দিয়ে স্ক্যান করলেই রাফির রিপোর্ট খুলবে।</p>
      <div className="rs-hint" style={{justifyContent:'center'}}><Icon name="clock" size={16}/>৭ দিন খোলা থাকবে · ২২ অক্টোবর পর্যন্ত</div>
    </div>
  </Sheet></Phone>;}
function ShareRevoked(){return <Phone><Behind/>
  <Sheet inline lang="bn" title="লিংকটি বন্ধ হয়েছে" onClose={()=>{}} closeLabel="বন্ধ করুন" footer={<Button variant="primary" block icon="link" lang="bn">নতুন লিংক তৈরি করুন</Button>}>
    <div style={{display:'flex',flexDirection:'column',gap:14}}>
      <p style={{margin:0}}>এই লিংক দিয়ে এখন আর কেউ রিপোর্টটি খুলতে পারবেন না। রাফির রিপোর্ট আপনার ফোনে নিরাপদে আছে।</p>
      <LinkBox off/>
      <div className="rs-hint"><Icon name="eye" size={16}/>বন্ধ হওয়ার আগে লিংকটি ২ বার খোলা হয়েছিল</div>
    </div>
  </Sheet></Phone>;}

function ResultsChat(){return <Phone>
  <StatusBar/>
  <header className="rs-chathead"><IconButton icon="arrow-left" label="ফিরে যান"/><img src="assets/shohojatri-mark.png" alt="" width="36" height="36"/><div style={{flex:1}}><b>ফলাফল নিয়ে প্রশ্ন</b><span>রাফির ১৫ অক্টোবরের রিপোর্ট</span></div><IconButton icon="more-vertical" label="আরও"/></header>
  <div className="rs-banner"><Icon name="info" size={18}/><span>আমি রিপোর্ট বুঝতে সাহায্য করি — এটি রোগনির্ণয় নয়। চিকিৎসার সিদ্ধান্ত ডাক্তারের সাথে নিন।</span></div>
  <div className="rs-thread">
    <ChatBubble from="user" lang="bn" time="৯:৪৩">৫২ মানে কি রাফির অটিজম আছে?</ChatBubble>
    <ChatBubble from="assistant" lang="bn" sourcesLabel="সূত্র" sources={[{label:'রিপোর্ট: এর মানে কী',kind:'report'},{label:'খেলা: নাম ধরে ডাকা',kind:'log'}]}>না, এই স্কোর দিয়ে সেটা বলা যায় না — শুধু একজন বিশেষজ্ঞ পুরো মূল্যায়ন করে বলতে পারেন। ৫২ মানে রাফির কিছু আচরণ, যেমন নাম ধরে ডাকলে সাড়া দেওয়া, বয়সের তুলনায় একটু আলাদা মনে হয়েছে। তাই একজন বিশেষজ্ঞকে দেখানো ভালো হবে বলে মনে হচ্ছে।</ChatBubble>
  </div>
  <div className="rs-suggest"><div className="rs-label" style={{padding:'0 20px'}}>আরও জিজ্ঞেস করতে পারেন</div><div className="rs-chiprow"><Chip label="ডাক্তারকে কী জিজ্ঞেস করব?" onClick={()=>{}} lang="bn"/><Chip label="বাসায় কী খেলা করতে পারি?" onClick={()=>{}} lang="bn"/><Chip label="আবার কবে স্ক্রিনিং করব?" onClick={()=>{}} lang="bn"/></div></div>
  <div className="rs-composer"><IconButton icon="mic" label="বলে লিখুন"/><div className="rs-input">আপনার প্রশ্ন লিখুন…</div><IconButton icon="send" variant="solid" label="পাঠান"/></div>
</Phone>;}

function SpecCard({s,compact}){return <div className="rs-spec">
  <div className="rs-spec-top"><Tile icon={s.ic} tone={s.on?'leaf':'sky'} size={44}/><div style={{flex:1,minWidth:0}}><b>{s.n}</b><span>{s.t}</span></div><span className="rs-dist">{s.d}</span></div>
  <div className="rs-spec-meta"><Icon name="map-pin" size={15}/><span>{s.org}</span></div>
  <div className="rs-spec-meta"><Icon name="clock" size={15}/><span>{s.h}</span></div>
  {s.on?<span className="rs-onbadge"><Icon name="badge-check" size={16}/>Shohojatri-তে আছেন · সরাসরি রিপোর্ট পাঠানো যাবে</span>:null}
  <div className="rs-spec-act"><Button variant="secondary" size="sm" icon="phone" lang="bn">কল করুন</Button>{s.on?<Button variant="ghost" size="sm" icon="send" lang="bn">রিপোর্ট পাঠান</Button>:<Button variant="ghost" size="sm" icon="navigation" lang="bn">পথ দেখুন</Button>}</div>
</div>;}
const FILTERS=['সব','শিশু বিকাশ','স্পিচ থেরাপি','শিশু মনোরোগ','অকুপেশনাল থেরাপি','বিশেষ স্কুল'];
function FilterChips({wrap}){return <div className={wrap?'rs-chips':'rs-chiprow'}>{FILTERS.map((f,i)=><Chip key={f} label={f} selected={i===0} onClick={()=>{}} lang="bn"/>)}</div>;}
function Specialists(){return <Phone>
  <StatusBar/><AppHeader title="কাছের বিশেষজ্ঞ" right={<IconButton icon="list-filter" label="ফিল্টার"/>}/>
  <MapView h={210} pins={PINS} sel={0}><div className="rs-mapctl"><IconButton icon="locate-fixed" variant="soft" size="sm" label="আমার অবস্থান"/></div></MapView>
  <div className="rs-loc"><Icon name="navigation" size={16}/><span>মিরপুর, ঢাকা · ৫ কিমির মধ্যে</span><button className="sf-link">বদলান</button></div>
  <FilterChips/>
  <div className="rs-speclist">{SPECS.slice(0,2).map(s=><SpecCard key={s.n} s={s}/>)}</div>
</Phone>;}
function LocationOff(){return <Phone>
  <StatusBar/><AppHeader title="কাছের বিশেষজ্ঞ"/>
  <div className="rs-body" style={{gap:18}}>
    <Card tone="sky" padding={18}><div style={{display:'flex',gap:14,alignItems:'flex-start'}}><Tile icon="map-pin-off" tone="sky"/><div><h2 className="rs-h2" style={{margin:'0 0 4px'}}>লোকেশন বন্ধ আছে</h2><p className="rs-p" style={{margin:'0 0 10px'}}>সমস্যা নেই — আপনার বিভাগ বেছে নিলে সেখানকার বিশেষজ্ঞ দেখাব।</p><Button variant="secondary" size="sm" icon="locate" lang="bn">লোকেশন চালু করুন</Button></div></div></Card>
    <div><div className="rs-label">বিভাগ</div><div className="rs-divs">{DIVISIONS.map((d,i)=><button key={d} className={i===0?'on':''} aria-pressed={i===0}>{i===0?<Icon name="check" size={16}/>:null}{d}</button>)}</div></div>
    <div><div className="rs-label">জেলা</div><button className="rs-select"><span>ঢাকা</span><Icon name="chevron-down" size={20}/></button></div>
  </div>
  <Body footer={<Button variant="primary" size="lg" block iconRight="arrow-right" lang="bn">ঢাকা জেলার বিশেষজ্ঞ দেখুন</Button>}><span></span></Body>
</Phone>;}

function SpecialistsDesktop(){return <div lang="bn" className="rs-desk">
  <header className="rs-dtop"><img src="assets/shohojatri-wordmark-bn.png" alt="সহযাত্রী" height="36"/><nav className="rs-crumb"><span>রাফির ফলাফল</span><Icon name="chevron-right" size={16}/><b>কাছের বিশেষজ্ঞ</b></nav><LanguageToggle value="bn"/></header>
  <div className="rs-dbody">
    <aside className="rs-dlist">
      <div><h1 className="sf-title" style={{margin:0}}>কাছের বিশেষজ্ঞ</h1><div className="rs-loc" style={{padding:'4px 0 0'}}><Icon name="navigation" size={16}/><span>মিরপুর, ঢাকা · ৫ কিমির মধ্যে · ১২টি পাওয়া গেছে</span><button className="sf-link">বদলান</button></div></div>
      <FilterChips wrap/>
      <div className="rs-dcards">{SPECS.map(s=><SpecCard key={s.n} s={s}/>)}</div>
    </aside>
    <div style={{flex:1,position:'relative',padding:'0 24px 24px 0'}}>
      <MapView h={704} radius={24} pins={PINS} sel={0} you={[50,56]}>
        <div className="rs-popup" style={{left:'calc(44% + 34px)',top:'calc(30% - 70px)'}}><b>ডা. নাসরিন আহমেদ</b><span>শিশু বিকাশ বিশেষজ্ঞ · ১.২ কিমি</span><span className="rs-onbadge" style={{margin:0}}><Icon name="badge-check" size={16}/>Shohojatri-তে আছেন</span><div style={{display:'flex',gap:8}}><Button variant="primary" size="sm" icon="phone" lang="bn">কল করুন</Button><Button variant="ghost" size="sm" icon="send" lang="bn">রিপোর্ট পাঠান</Button></div></div>
        <div className="rs-mapctl" style={{flexDirection:'column'}}><IconButton icon="plus" variant="soft" size="sm" label="জুম বাড়ান"/><IconButton icon="minus" variant="soft" size="sm" label="জুম কমান"/><IconButton icon="locate-fixed" variant="soft" size="sm" label="আমার অবস্থান"/></div>
      </MapView>
    </div>
  </div>
</div>;}
Object.assign(window,{ShareSheet,ShareQR,ShareRevoked,ResultsChat,Specialists,LocationOff,SpecialistsDesktop});
})();
