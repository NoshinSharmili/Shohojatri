(()=>{
const {Button,IconButton,Icon,Chip,Avatar,BottomNav,Tabs,ReminderCard,SourceChip,StateView,Skeleton}=window.ShohojatriDesignSystem_1ff839;
const NAV=lang=>{const t=tr(lang);return [{id:'home',label:t('হোম','Home'),icon:'house'},{id:'child',label:t('রাফি','Rafi'),icon:'sprout'},{id:'chat',label:t('চ্যাট','Chat'),icon:'message-circle'},{id:'rem',label:t('রিমাইন্ডার','Reminders'),icon:'bell',badge:lang==='en'?'2':'২'}];};
function Nav({lang,value}){return <div className="cm-navwrap"><BottomNav lang={lang} value={value} items={NAV(lang)}/></div>;}
function Fab({lang,style}){return <button className="ac-fab" style={style}><Icon name="sparkles" size={20}/>{tr(lang)('জিজ্ঞেস করুন','Ask')}</button>;}

function MHome({lang}){const t=tr(lang);return <APhone lang={lang}>
  <div className="cm-top"><img src={WM(lang)} alt={t('সহযাত্রী','Shohojatri')} style={{height:32,display:'block'}}/><div style={{flex:1}}></div><IconButton icon="bell" label={t('রিমাইন্ডার','Reminders')}/></div>
  <div className="ac-pad"><div className="cm-greet">{t('শুভ বিকাল, সাবরিনা','Good afternoon, Sabrina')}</div>
    <div className="cm-rep" style={{flexDirection:'row',alignItems:'center',gap:14}}><Avatar name={t('রাফি','Rafi')} size={56}/><div style={{flex:1}}><b style={{font:'700 20px/1.4 var(--font-display)'}}>{t('রাফি','Rafi')}</b><div style={{fontSize:14,color:'var(--text-2)'}}>{t('৩ বছর ২ মাস · আজ ২টি লগ','3 years 2 months · 2 logs today')}</div></div><Icon name="chevron-right" size={20} color="var(--text-3)"/></div>
    <h2 className="cm-h2"><Icon name="calendar-check" size={20}/>{t('আজ','Today')}</h2>
    <ReminderCard lang={lang} title={t('পালা করে খেলা · ১০ মিনিট','Turn-taking play · 10 min')} time={t('বিকেল ৫:০০','5:00 pm')} onToggle={()=>{}}/>
    <ReminderCard lang={lang} title={t('মেলাটোনিন সিরাপ','Melatonin syrup')} time={t('রাত ৯:৩০','9:30 pm')} onToggle={()=>{}}/>
  </div><Fab lang={lang}/><Nav lang={lang} value="home"/></APhone>;}
function MOverview({lang}){const t=tr(lang);return <APhone lang={lang}>
  <div className="cm-top" style={{paddingLeft:8}}><IconButton icon="arrow-left" label={t('ফিরে যান','Back')}/><Avatar name={t('রাফি','Rafi')} size={36}/><b style={{flex:1,font:'700 18px var(--font-display)'}}>{t('রাফি','Rafi')}</b></div>
  <div className="ac-mtabs"><Tabs lang={lang} value="ov" items={[{id:'ov',label:t('ওভারভিউ','Overview')},{id:'tl',label:t('টাইমলাইন','Timeline')},{id:'pg',label:t('অগ্রগতি','Progress')},{id:'ch',label:t('চ্যাট','Chat')}]}/></div>
  <div className="ac-pad">
    <div className="cm-hero"><div className="cm-eyebrow"><Icon name="sparkles" size={16}/>{t('এখন রাফি','Rafi right now')}<span>{t('আজ সকাল','This morning')}</span></div><p style={{fontSize:16}}>{t('এই সপ্তাহে রাফি ৪টি নতুন শব্দে চেয়েছে। ঘুম এখনো দেরিতে আসে।','Rafi asked with 4 new words this week. Sleep still starts late.')}</p></div>
    <h2 className="cm-h2"><Icon name="target" size={20}/>{t('চলমান লক্ষ্য','Active goals')}</h2><div className="cm-rep"><RepGoals lang={lang}/></div>
  </div><Fab lang={lang}/><Nav lang={lang} value="child"/></APhone>;}

const SUGG=[['blocks',['আজ রাফির সাথে কী খেলতে পারি?','What can I play with Rafi today?']],['message-circle',['এই সপ্তাহে রাফির কথা বলায় কী উন্নতি হয়েছে?','How has Rafi’s talking improved this week?']],['moon',['ঘুমের সমস্যার জন্য কী করতে পারি?','What can I do about his sleep?']],['calendar',['পরের ডাক্তার দেখানো কবে?','When is the next doctor visit?']],['file-text',['রাফির অবস্থার রিপোর্ট দাও','Make a status report for Rafi']]];
const TSUGG=[['users',['ক্লাসে পালা নেওয়ার কোন কৌশল কাজ করছে?','Which turn-taking strategies work in class?']],['house',['বাড়িতে এই সপ্তাহে কী অনুশীলন হয়েছে?','What did the family practise at home this week?']],['file-text',['শিক্ষকের জন্য মাসিক সারাংশ দাও','Make a monthly summary for school']]];
function Empty({lang,rec,role='parent'}){const t=tr(lang);const L=lang==='en'?1:0;const list=role==='teacher'?TSUGG:SUGG;return <APhone lang={lang}><AHead lang={lang} role={role}/>
  <div className="ac-empty"><div className="ac-hello"><span className="ac-big"><img src={MARK} alt=""/></span><h1>{t('রাফির বিষয়ে যা খুশি জিজ্ঞেস করুন','Ask anything about Rafi')}</h1>
    <div className="cm-note"><Icon name="shield-check" size={18}/><span>{t('আমি শুধু রাফির লগ, নোট ও ডকুমেন্ট থেকে উত্তর দিই। আমি ডাক্তার নই, রোগনির্ণয়ও করি না।','I answer only from Rafi’s logs, notes and documents. I’m not a doctor and I don’t diagnose.')}</span></div></div>
    <div className="ac-sugg">{list.map(([ic,q])=><button key={q[1]} className="ac-sq"><Icon name={ic} size={18}/>{q[L]}</button>)}</div></div>
  <Composer lang={lang} rec={rec}/></APhone>;}

function Convo({lang,sheet}){const t=tr(lang);const [open,setOpen]=React.useState(!!sheet);return <APhone lang={lang}><AHead lang={lang}/>
  <div className="ac-thread" style={open?{opacity:.5}:null}>
    <U lang={lang} time={t('বিকাল ৪:১০','4:10 pm')}>{t('এই সপ্তাহে রাফির কথা বলায় কী উন্নতি হয়েছে?','How has Rafi’s talking improved this week?')}</U>
    <A lang={lang} src={[S(lang,'log','শিক্ষিকার নোট · ১২ অক্টো','Teacher’s note · 12 Oct',()=>setOpen(true)),S(lang,'log','৬টি অভিভাবকের লগ','6 parent logs'),S(lang,'report','ডা. তানভীরের নোট','Dr. Tanvir’s note')]}>{t('এই সপ্তাহে রাফি নিজে থেকে ৪টি নতুন শব্দে চেয়েছে — “পানি”, “বল”, “আরও”, “না”। শিক্ষিকা নাসরিন লিখেছেন, ক্লাসে সে দুবার কেউ না বলতেই “আরও” বলেছে। ডা. তানভীর এমন চাওয়ার শব্দকেই প্রথম লক্ষ্য রেখেছিলেন, তাই এটা ভালো অগ্রগতি মনে হচ্ছে।','This week Rafi asked with 4 new words on his own — “water”, “ball”, “more”, “no”. Teacher Nasrin wrote that in class he said “more” twice without a prompt. Dr. Tanvir set asking words as the first goal, so this looks like good progress.')}</A>
    <U lang={lang} time={t('বিকাল ৪:১২','4:12 pm')}>{t('ঘুমের সমস্যার জন্য কী করতে পারি?','What can I do about his sleep?')}</U>
    <A lang={lang}>{t('গত ২ সপ্তাহের লগে রাফি গড়ে রাত ১১:৪০-এ ঘুমিয়েছে। যেদিন সন্ধ্যায় বাইরে হেঁটেছে, সেদিন','In the last 2 weeks of logs Rafi fell asleep at 11:40 pm on average. On days with an evening walk,')}<span className="ac-caret"></span></A>
    <button className="ac-stop"><Icon name="square" size={14}/>{t('থামান','Stop')}</button>
  </div><Composer lang={lang}/>{open?<SourceSheet lang={lang} onClose={()=>setOpen(false)}/>:null}</APhone>;}

function Thinking({lang}){const t=tr(lang);return <APhone lang={lang}><AHead lang={lang}/><div className="ac-thread">
  <U lang={lang} time={t('বিকাল ৪:২০','4:20 pm')}>{t('পরের ডাক্তার দেখানো কবে?','When is the next doctor visit?')}</U><Typing lang={lang}/></div><Composer lang={lang}/></APhone>;}

function Actions({lang}){const t=tr(lang);return <APhone lang={lang} tall><AHead lang={lang}/><div className="ac-thread">
  <U lang={lang} time={t('সকাল ৯:২০','9:20 am')}>{t('আজ সকালে রাফি নিজে “পানি” বলে চেয়েছে! আজ ওর সাথে কী খেলতে পারি?','This morning Rafi asked for “water” by himself! What can I play with him today?')}</U>
  <A lang={lang} src={[S(lang,'report','কেয়ার প্ল্যান','Care plan'),S(lang,'log','শিক্ষিকার নোট · ১২ অক্টো','Teacher’s note · 12 Oct')]}>{t('দারুণ খবর! আজকের জন্য পালা করে খেলা ভালো হতে পারে — ক্লাসেও এটা নিয়ে কাজ চলছে। প্রতিদিন একই সময়ে করলে রাফির জন্য সহজ হয়। নিচের খসড়াগুলো দেখে নিন:','Lovely news! Turn-taking play could be good today — his class is working on it too. Doing it at the same time each day makes it easier for Rafi. Please check these drafts:')}</A>
  <div className="ac-in"><Reminder lang={lang}/><Activity lang={lang}/><LogDraft lang={lang}/></div></div><Composer lang={lang}/></APhone>;}

function ExplainS({lang}){const t=tr(lang);return <APhone lang={lang} tall><AHead lang={lang}/><div className="ac-thread">
  <U lang={lang} time={t('রাত ৮:০৫','8:05 pm')}>{t('ডা. তানভীরের নোটটা সহজ করে বুঝিয়ে দিন','Please explain Dr. Tanvir’s note simply')}</U>
  <div className="ac-trow" style={{alignItems:'flex-start'}}><span className="ac-av"><img src={MARK} alt=""/></span><div style={{flex:1,minWidth:0}}><Explain lang={lang}/></div></div></div><Composer lang={lang}/></APhone>;}

function RepSetupS({lang}){const t=tr(lang);return <APhone lang={lang}><AHead lang={lang}/><div className="ac-thread">
  <U lang={lang} time={t('বিকাল ৫:৩০','5:30 pm')}>{t('রাফির অবস্থার রিপোর্ট দাও','Make a status report for Rafi')}</U>
  <A lang={lang}>{t('নিশ্চয়ই। রিপোর্টটা কার জন্য, আর কতদিনের?','Of course. Who is it for, and for which period?')}</A><div className="ac-in"><ReportSetup lang={lang}/></div></div><Composer lang={lang}/></APhone>;}
function RepCardS({lang}){const t=tr(lang);return <APhone lang={lang} tall><AHead lang={lang}/><div className="ac-thread">
  <A lang={lang}>{t('ডা. তানভীরের জন্য গত ১ মাসের রিপোর্ট তৈরি হয়েছে। পাঠানোর আগে একবার দেখে নিন।','Here’s the 1-month report for Dr. Tanvir. Please look it over before sharing.')}</A><div className="ac-in"><ReportCard lang={lang}/></div>
  <div className="rs-nodx" style={{marginLeft:44}}><Icon name="info" size={18}/><span>{t('এটি রোগনির্ণয় নয় — পরিবার ও টিমের লগ থেকে তৈরি একটা সারাংশ।','This is not a diagnosis — it’s a summary of family and team logs.')}</span></div></div><Composer lang={lang}/></APhone>;}

function UrgentS({lang}){const t=tr(lang);return <APhone lang={lang} tall><AHead lang={lang}/><div className="ac-thread">
  <U lang={lang} time={t('সন্ধ্যা ৭:৪২','7:42 pm')}>{t('রাফির হাত-পা হঠাৎ কাঁপছিল, চোখ উল্টে গিয়েছিল, ১-২ মিনিট। এখন খুব ঘুম ঘুম করছে।','Rafi’s arms and legs suddenly shook and his eyes rolled back for 1–2 minutes. Now he’s very drowsy.')}</U>
  <div className="ac-in" style={{marginLeft:0}}><Urgent lang={lang}/></div></div><Composer lang={lang}/></APhone>;}

function Idk({lang}){const t=tr(lang);return <APhone lang={lang}><AHead lang={lang}/><div className="ac-thread">
  <U lang={lang} time={t('দুপুর ১:০৫','1:05 pm')}>{t('রাফির কি গরুর দুধে অ্যালার্জি আছে?','Is Rafi allergic to cow’s milk?')}</U>
  <A lang={lang}>{t('রাফির রেকর্ডে অ্যালার্জি নিয়ে কিছু পাইনি, তাই নিশ্চিত করে বলতে পারছি না। কেয়ার টিমের কাউকে জিজ্ঞেস করে দেখতে পারেন:','I couldn’t find anything about allergies in Rafi’s records, so I can’t say for sure. You could ask someone on his care team:')}</A>
  <div className="ac-in"><CareTeam lang={lang}/><div><Chip lang={lang} icon="list-plus" label={t('পরের অ্যাপয়েন্টমেন্টের প্রশ্নে রাখুন','Add to next appointment questions')}/></div></div></div><Composer lang={lang}/></APhone>;}

function Med({lang}){const t=tr(lang);return <APhone lang={lang}><AHead lang={lang}/><div className="ac-thread">
  <U lang={lang} time={t('রাত ১০:১৫','10:15 pm')}>{t('মেলাটোনিন কি ২ মি.লি. করে দিতে পারি? ১ মি.লি.-তে ঘুম আসছে না।','Can I give 2 ml of melatonin? 1 ml isn’t helping him sleep.')}</U>
  <A lang={lang}>{t('ডোজ বদলানোর পরামর্শ আমি দিতে পারি না। প্রেসক্রিপশনে ঠিক যা লেখা আছে:','I can’t advise on changing a dose. Here is exactly what the prescription says:')}</A>
  <div className="ac-in"><MedCard lang={lang}/></div></div><Composer lang={lang}/></APhone>;}

function Teacher({lang}){const t=tr(lang);return <APhone lang={lang}><AHead lang={lang} role="teacher"/><div className="ac-thread">
  <U lang={lang} time={t('সকাল ১১:৩০','11:30 am')}>{t('ক্লাসে পালা নেওয়ার কোন কৌশল রাফির জন্য কাজ করছে?','Which turn-taking strategies are working for Rafi in class?')}</U>
  <A lang={lang} src={[S(lang,'log','আপনার ৫টি ক্লাস নোট','5 of your class notes'),S(lang,'log','বাড়ির লগ · শেয়ার করা','Home logs · shared')]}>{t('আপনার নোট অনুযায়ী “আমার পালা” ছবি-কার্ড আর ছোট টাইমার দিলে রাফি ৩ মিনিট পর্যন্ত থাকে। বাড়িতেও বিকেলে বল খেলায় একই কার্ড ব্যবহার হচ্ছে।','Your notes show Rafi stays up to 3 minutes with the “my turn” picture card and a short timer. The family uses the same card for ball play at home.')}</A>
  <U lang={lang} time={t('সকাল ১১:৩২','11:32 am')}>{t('ওর ওষুধ কী চলছে?','What medicine is he on?')}</U>
  <A lang={lang}>{t('ওষুধের তথ্য আপনার অ্যাক্সেসের বাইরে — এটা শুধু পরিবার ও ডাক্তার দেখতে পান। দরকার হলে রাফির মা সাবরিনাকে জিজ্ঞেস করতে পারেন।','Medicine details are outside your access — only the family and doctor can see them. If needed, you could ask Rafi’s mother, Sabrina.')}</A></div><Composer lang={lang}/></APhone>;}

function Specialist({lang}){const t=tr(lang);return <APhone lang={lang}><AHead lang={lang} role="specialist"/><div className="ac-thread">
  <U lang={lang} time={t('দুপুর ২:৪০','2:40 pm')}>{t('৩ অক্টোর পর থেকে ঘুম ও ভাষার সারাংশ','Summary of sleep and language since 3 Oct')}</U>
  <A lang={lang} src={[S(lang,'log','১৪টি ঘুমের লগ','14 sleep logs'),S(lang,'log','স্কুল লগ ×৫','School logs ×5'),S(lang,'doc','Rx · ৩ অক্টো','Rx · 3 Oct')]}><ul className="ac-ol" style={{gap:4}}>
    <li><b style={{minWidth:52}}>{t('ঘুম','Sleep')}</b>{t('শুরু গড় ২৩:৪০ (আগে ২৩:৫৫); মেলাটোনিন ১২/১৪ রাত','Onset avg 23:40 (prev. 23:55); melatonin 12/14 nights')}</li>
    <li><b style={{minWidth:52}}>{t('ভাষা','Lang.')}</b>{t('৪টি নতুন স্বতঃস্ফূর্ত mand; নামে সাড়া ~৬০%','4 new spontaneous mands; name response ~60%')}</li>
    <li><b style={{minWidth:52}}>{t('আচরণ','Beh.')}</b>{t('২টি meltdown — চুল কাটা, ভিড়; sensory trigger সম্ভাব্য','2 meltdowns — haircut, crowd; likely sensory triggers')}</li></ul></A>
  <div className="ac-in" style={{flexDirection:'row',flexWrap:'wrap',gap:8}}><Chip lang={lang} icon="file-text" label={t('ক্লিনিক্যাল রিপোর্ট','Clinical report')}/><Chip lang={lang} icon="chart-line" label={t('ঘুমের চার্ট','Sleep chart')}/></div></div><Composer lang={lang}/></APhone>;}

function History({lang}){const t=tr(lang);const G=[[t('আজ','Today'),[['message-circle',t('কথা বলায় উন্নতি','Progress in talking'),t('এই সপ্তাহে রাফি ৪টি নতুন শব্দে…','This week Rafi asked with 4 new words…'),t('৪:১০','4:10')],['file-text',t('ডা. তানভীরের জন্য রিপোর্ট','Report for Dr. Tanvir'),t('১ মাস · শেয়ার করা হয়েছে','1 month · shared'),t('৫:৩০','5:30')]]],[t('এই সপ্তাহ','This week'),[['moon',t('ঘুমের রুটিন','Bedtime routine'),t('আলো কমিয়ে একই ক্রমে রুটিন…','Dim the lights, same order each night…'),t('সোম','Mon')],['stethoscope',t('ডাক্তারের নোট বোঝা','Understanding the doctor’s note'),t('রাফি একই জিনিসের দিকে তাকানো শিখছে…','Rafi is starting to look at the same thing…'),t('রবি','Sun')]]],[t('আগে','Earlier'),[['blocks',t('বাড়িতে খেলার আইডিয়া','Play ideas at home'),t('বল গড়িয়ে পালা খেলা, ১০ মিনিট…','Roll-the-ball turn taking, 10 min…'),t('৫ অক্টো','5 Oct')],['pill',t('মেলাটোনিনের সময়','Melatonin timing'),t('প্রেসক্রিপশনে লেখা: ঘুমের ৩০ মিনিট আগে…','Prescription says: 30 min before sleep…'),t('৩ অক্টো','3 Oct')]]]];
  return <APhone lang={lang}><div className="ac-head"><IconButton icon="arrow-left" label={t('ফিরে যান','Back')}/><div className="ac-head-t"><b>{t('আগের কথোপকথন','Past conversations')}</b></div><Button size="sm" icon="square-pen">{t('নতুন','New')}</Button></div>
  <div className="ac-hsearch"><Icon name="search" size={18}/>{t('কথোপকথন খুঁজুন','Search conversations')}</div>
  <div style={{flex:1,overflow:'hidden'}}>{G.map(([g,items])=><div key={g}><div className="ac-hg">{g}</div>{items.map(([ic,ti,sn,d])=><div key={ti} className="ac-hi"><Tile icon={ic} tone={ic==='file-text'?'leaf':'sky'} size={40}/><div><b>{ti}</b><span>{sn}</span></div><em>{d}</em></div>)}</div>)}</div></APhone>;}

function Offline({lang}){const t=tr(lang);return <APhone lang={lang}><AHead lang={lang}/><div className="ac-banner"><Icon name="wifi-off" size={18}/><span>{t('ইন্টারনেট সংযোগ নেই। আপনার প্রশ্ন সংরক্ষিত আছে — সংযোগ ফিরলেই পাঠানো হবে।','No internet connection. Your question is saved — it will send when you’re back online.')}</span></div>
  <div className="ac-thread"><U lang={lang}>{t('আজ রাফির সাথে কী খেলতে পারি?','What can I play with Rafi today?')}</U><div className="ac-fail"><Icon name="clock" size={14}/>{t('পাঠানোর অপেক্ষায়','Waiting to send')}</div></div><Composer lang={lang}/></APhone>;}
function AIDown({lang}){const t=tr(lang);return <APhone lang={lang}><AHead lang={lang}/><div className="ac-thread">
  <U lang={lang} time={t('বিকাল ৩:০২','3:02 pm')}>{t('ঘুমের সমস্যার জন্য কী করতে পারি?','What can I do about his sleep?')}</U>
  <div className="ac-in"><div className="ac-errc"><Tile icon="cloud-off" tone="warm" size={44}/><b style={{font:'700 17px/1.45 var(--font-display)'}}>{t('সহযাত্রী AI এই মুহূর্তে উত্তর দিতে পারছে না','Shohojatri AI can’t answer right now')}</b><p className="ac-sm">{t('সমস্যাটা আমাদের দিকে। আপনার প্রশ্ন সংরক্ষিত আছে — একটু পরে আবার চেষ্টা করুন।','The problem is on our side. Your question is saved — please try again in a little while.')}</p><div className="ac-btns"><Button size="sm" icon="refresh-cw">{t('আবার চেষ্টা করুন','Try again')}</Button><Button size="sm" variant="ghost" icon="list">{t('টাইমলাইন দেখুন','View timeline')}</Button></div></div></div></div><Composer lang={lang} value={t('ঘুমের সমস্যার জন্য কী করতে পারি?','What can I do about his sleep?')}/></APhone>;}

Object.assign(window,{MHome,MOverview,Empty,Convo,Thinking,Actions,ExplainS,RepSetupS,RepCardS,UrgentS,Idk,Med,Teacher,Specialist,History,Offline,AIDown,Fab});
})();
