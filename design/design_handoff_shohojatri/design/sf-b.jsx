(()=>{
const {Button,IconButton,ChoiceCard,Card,Icon,Chip}=window.ShohojatriDesignSystem_1ff839;

function CamFeed({children,style}){return <div className="sf-cam" style={style}><div className="sf-cam-fig"><i className="hd"></i><i className="bd"></i></div>{children}</div>;}
function Check({ok,label,tip}){return <div className="sf-check"><span className={'sf-ck '+(ok?'ok':'fix')}><Icon name={ok?'check':'volume-2'} size={16}/></span><div style={{flex:1,lineHeight:1.5}}><div style={{fontWeight:600}}>{label}</div>{tip?<div style={{fontSize:15,color:'var(--sj-ink-amber)'}}>{tip}</div>:null}</div></div>;}

function Setup(){return <><StatusBar/><FlowHeader title="প্রস্তুতি দেখি"/>
  <Body footer={<><Button size="lg" block icon="refresh-cw">আবার দেখুন</Button><Button variant="ghost" block>এভাবেই চালিয়ে যান</Button></>}>
    <CamFeed style={{height:300,marginBottom:16}}>
      <div className="sf-facebox"><i></i><i></i><i></i><i></i></div>
      <span className="sf-live"><span></span><b style={{fontWeight:600}}>লাইভ · শুধু এই ফোনে</b></span>
    </CamFeed>
    <div style={{display:'flex',flexDirection:'column',gap:10}}>
      <Check ok label="আলো ঠিক আছে"/>
      <Check ok label="রাফির মুখ দেখা যাচ্ছে"/>
      <Check label="চারপাশে একটু শব্দ হচ্ছে" tip="টিভি বা গান বন্ধ করুন, তারপর “আবার দেখুন” চাপুন।"/>
    </div>
  </Body></>;}

function Calibration(){return <Phone bg="#E8F4FA"><Stage top={<span className="sf-camdot" aria-label="ক্যামেরা চালু"></span>}>
  <div className="cal-track"><i></i><i></i><i></i></div>
  <div className="cal-star"><Icon name="star" size={92} style={{fill:'var(--sj-amber)',color:'var(--sj-amber)'}}/></div>
</Stage></Phone>;}

function TrialDots({n=1}){return <div style={{display:'flex',alignItems:'center',gap:8,color:'#fff',fontWeight:600,fontSize:15}}><span>চেষ্টা {bn(n)}/৩</span>{[1,2,3].map(i=><span key={i} className={'sf-tdot'+(i<n?' done':i===n?' on':'')}></span>)}</div>;}
function NameFrame({children}){return <Phone bg="#0F2236"><StatusBar light/>
  <div style={{flex:1,position:'relative',display:'flex',flexDirection:'column'}}>
    <CamFeed style={{position:'absolute',inset:0,borderRadius:0}}></CamFeed>
    <div style={{position:'relative',zIndex:2,display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 20px'}}><TrialDots/><span className="sf-live dark"><span></span><b style={{fontWeight:600}}>রেকর্ড হচ্ছে</b></span></div>
    <div style={{flex:1,position:'relative',zIndex:2,display:'flex',alignItems:'flex-end',padding:'0 16px'}}>{children}</div>
    <div style={{position:'relative',zIndex:2,display:'flex',gap:10,padding:'16px 16px 30px'}}>
      <button className="sf-darkbtn"><Icon name="skip-forward" size={18}/>বাদ দিন</button>
      <button className="sf-darkbtn"><Icon name="circle-help" size={18}/>কিছু ভুল হয়েছে</button>
    </div>
  </div></Phone>;}
function NameWait(){return <NameFrame><div className="sf-msg calm"><Dots/><div className="big">রাফি খেলছে…</div><div className="sm">অপেক্ষা করুন — সময় হলে আমরা বলব।</div></div></NameFrame>;}
function NameCall(){return <NameFrame><div className="sf-msg go"><Icon name="ear" size={36}/><div className="huge">এখন একবার নাম ধরে ডাকুন</div><div className="sm">স্বাভাবিক স্বরে — “রাফি”</div></div></NameFrame>;}

function PointChoice(){return <><StatusBar/><FlowHeader title="গেম ২/৫"/>
  <Body footer={<Button size="lg" block iconRight="arrow-right">শুরু করুন</Button>}>
    <Title sub="রাফি কি আঙুল ধরে দেখানো জিনিসের দিকে তাকায় — সেটা দেখব।">যেখানে দেখাই</Title>
    <div style={{display:'flex',flexDirection:'column',gap:12}}>
      <ChoiceCard selected icon="smartphone" label="ফোনের স্ক্রিনে" description="একটা মজার চরিত্র খেলনার দিকে দেখাবে। ফোনটা রাফির সামনে রাখুন।" onSelect={()=>{}} lang="bn"/>
      <ChoiceCard icon="hand" label="আমার সাথে (লাইভ)" description="আপনি নিজে আঙুল দিয়ে ঘরের একটা খেলনা দেখাবেন, ফোন পাশ থেকে দেখবে।" onSelect={()=>{}} lang="bn"/>
    </div>
    <div className="sf-mini"><div className="sf-mini-stage"><div style={{transform:'scale(.42)',display:'flex',alignItems:'flex-end',gap:30}}><Ball size={70}/><Character pose="point-r" look={1}/><Boat/></div></div></div>
  </Body></>;}
function PointStim(){return <Phone bg="#E8F4FA"><Stage top={<span className="sf-camdot" aria-label="ক্যামেরা চালু"></span>}>
  <div className="stim-row"><div className="toy-l"><Ball/></div><Character pose="point-r" look={1}/><div className="toy-r glow"><Boat/></div></div>
</Stage></Phone>;}

const MOVES=[['clap','hand-metal','তালি'],['wave','hand','হাত নাড়া'],['up','arrow-up','হাত উপরে'],['head','smile','মাথা ছোঁয়া']];
function MoveStrip({cur}){return <div className="sf-moves">{MOVES.map(([id,ic,l])=><span key={id} className={id===cur?'on':''} aria-label={l}><Icon name={ic} size={18}/></span>)}</div>;}
function CopyDemo(){return <Phone bg="#E8F4FA"><Stage top={<span className="sf-camdot"></span>}>
  <div className="stim-center"><Character pose="clap" scale={1.25}/><div className="clap-burst"><i></i><i></i><i></i></div></div>
  <MoveStrip cur="clap"/>
</Stage></Phone>;}
function CopyTurn(){return <Phone bg="#E8F4FA"><Stage top={<ParentPill icon="eye">রাফির পালা — দেখছি…</ParentPill>}>
  <div className="stim-center"><div className="turn-ring"></div><Character pose="turn" scale={1.25}/></div>
  <MoveStrip cur="clap"/>
</Stage></Phone>;}

function LookWatch(){return <Phone bg="#0F2236"><div style={{flex:1,display:'flex',position:'relative'}}>
  <div className="lw-half social"><div style={{transform:'scale(.78)'}}><Character pose="wave" look={-.5}/></div></div>
  <div className="lw-half geo"><i className="g1"></i><i className="g2"></i><i className="g3"></i><i className="g4"></i></div>
  <div style={{position:'absolute',top:52,right:16,zIndex:3}}><button className="sf-ghost-ic" aria-label="থামান"><Icon name="pause" size={20}/></button></div>
  <span className="sf-camdot" style={{position:'absolute',top:66,left:22,zIndex:3}}></span>
</div></Phone>;}

function FreePlay(){const r=88,c=2*Math.PI*r,frac=84/120;
  return <><StatusBar/><FlowHeader title="গেম ৫/৫"/>
  <Body footer={<><Button size="lg" block variant="secondary" icon="square">আগেই শেষ করুন</Button></>}>
    <Title sub="ফোনটা পাশে দাঁড় করিয়ে রাখুন। যেভাবে সবসময় খেলেন, সেভাবেই খেলুন।">ফ্রি প্লে</Title>
    <div style={{display:'flex',justifyContent:'center',margin:'4px 0 14px'}}>
      <div style={{position:'relative',width:210,height:210}}>
        <svg width="210" height="210" viewBox="0 0 210 210" aria-hidden="true"><circle cx="105" cy="105" r={r} fill="none" stroke="var(--sj-teal-50)" strokeWidth="14"/><circle cx="105" cy="105" r={r} fill="none" stroke="var(--sj-teal)" strokeWidth="14" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c*(1-frac)} transform="rotate(-90 105 105)"/></svg>
        <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}><div style={{font:'700 48px/1 var(--font-display)',color:'var(--sj-navy)'}}>১:২৪</div><div style={{fontSize:14,color:'var(--text-2)',marginTop:6}}>বাকি আছে</div></div>
      </div>
    </div>
    <CamFeed style={{height:120}}><span className="sf-live"><span></span><b style={{fontWeight:600}}>রাফি ফ্রেমে আছে</b></span></CamFeed>
    <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:14}}><Chip label="কথা বলুন, গান গান" icon="music" tone="calm" lang="bn"/><Chip label="খেলনা ভাগ করুন" icon="toy-brick" tone="calm" lang="bn"/></div>
  </Body></>;}

function Analysing(){return <Phone bg="var(--surface-page)"><StatusBar/>
  <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',padding:'40px 28px 40px',textAlign:'center',background:'var(--sj-gradient-sky)'}}>
    <div className="an-scene" aria-hidden="true">
      <svg viewBox="0 0 300 220" width="300" height="220">
        <defs><linearGradient id="anh1" x1="0" x2="1"><stop offset="0" stopColor="#47AC8D"/><stop offset="1" stopColor="#8CC88A"/></linearGradient><linearGradient id="anh2" x1="0" x2="1"><stop offset="0" stopColor="#03B4BA"/><stop offset="1" stopColor="#3ABEB1"/></linearGradient></defs>
        <path d="M0 220 C40 120 120 110 170 150 C200 175 240 140 300 120 L300 220 Z" fill="url(#anh2)" opacity=".85"/>
        <path d="M0 220 C60 170 130 150 190 190 C230 214 270 190 300 180 L300 220 Z" fill="url(#anh1)"/>
        <path className="an-path" d="M70 220 C110 196 90 172 140 160 C190 148 170 120 210 104 C236 94 250 84 262 70" fill="none" stroke="#fff" strokeWidth="9" strokeLinecap="round"/>
      </svg>
      <div className="an-star"><Icon name="star" size={34} style={{fill:'var(--sj-amber)',color:'var(--sj-amber)'}}/></div>
    </div>
    <h1 className="sf-title" style={{margin:'28px 0 6px'}}>রাফির উত্তর আর গেম মিলিয়ে দেখছি…</h1>
    <p className="sf-sub" style={{marginBottom:20}}>এক-দুই মিনিট লাগবে। সব কাজ এই ফোনেই হচ্ছে।</p>
    <Dots/>
    <div style={{alignSelf:'stretch',display:'flex',flexDirection:'column',gap:10,marginTop:'auto',textAlign:'left'}}>
      {[['done','২০টি প্রশ্নের উত্তর'],['done','৫টি গেমের ভিডিও'],['now','রিপোর্ট তৈরি হচ্ছে']].map(([s,l])=><div key={l} style={{display:'flex',alignItems:'center',gap:10,fontWeight:600,color:s==='done'?'var(--sj-ink-leaf)':'var(--sj-navy)'}}><Icon name={s==='done'?'circle-check':'loader'} size={20} className={s==='now'?'an-spin':''}/>{l}</div>)}
    </div>
  </div></Phone>;}

Object.assign(window,{Setup,Calibration,NameWait,NameCall,PointChoice,PointStim,CopyDemo,CopyTurn,LookWatch,FreePlay,Analysing});

})();
