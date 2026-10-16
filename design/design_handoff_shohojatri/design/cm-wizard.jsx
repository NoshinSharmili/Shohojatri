(()=>{
const {Button,IconButton,TextField,ChoiceGroup,Icon,Chip,Avatar,RoleBadge,Sheet,Toast,Card}=window.ShohojatriDesignSystem_1ff839;
function WFrame({title='প্রোফাইল তৈরি',children,foot,tall=true}){const P=tall?TallPhone:Phone;return <P><StatusBar/><MHead title={title} right={<IconButton icon="x" label="বন্ধ করুন"/>}/><div className={tall?'cm-tall':'cm-body'}>{children}</div>{foot?<div className="cm-foot">{foot}</div>:null}</P>;}
function W1(){return <WFrame foot={<Button block size="lg" iconRight="arrow-right">পরবর্তী</Button>}>
  <WStep i={0}/>
  <div><h1 className="sf-title">আপনার শিশুর সম্পর্কে বলুন</h1><p className="cm-sub">স্ক্রিনিং ছাড়াই প্রোফাইল তৈরি করা যায়। পরে যেকোনো তথ্য বদলাতে পারবেন।</p></div>
  <div className="cm-photo"><span className="cm-photo-c"><Icon name="camera" size={26}/></span><div><div style={{fontWeight:600}}>ছবি যোগ করুন <span style={{fontWeight:400,color:'var(--text-3)',fontSize:14}}>(ঐচ্ছিক)</span></div><div style={{fontSize:14,color:'var(--text-2)'}}>শুধু আপনার কেয়ার টিম দেখবে</div></div></div>
  <TextField lang="bn" label="শিশুর নাম" defaultValue="রাফি"/>
  <TextField lang="bn" label="ডাকনাম" optionalLabel="(ঐচ্ছিক)" placeholder="বাসায় যে নামে ডাকেন"/>
  <div style={{display:'flex',flexDirection:'column',gap:8}}><TextField lang="bn" label="জন্মতারিখ" icon="calendar" defaultValue="১২ আগস্ট ২০২৩"/><span className="cm-agechip"><Icon name="cake" size={14}/>বয়স: ৩ বছর ২ মাস</span></div>
  <Q label="লিঙ্গ"><div className="rs-seg"><button className="on">ছেলে</button><button>মেয়ে</button><button>বলতে চাই না</button></div></Q>
  <Q label="বাসায় কোন ভাষায় কথা হয়?"><ChipSet items={['বাংলা','ইংরেজি','সিলেটি','চাটগাঁইয়া']} sel={['বাংলা']} other/></Q>
  <TextField lang="bn" label="এলাকা" icon="map-pin" defaultValue="মিরপুর, ঢাকা"/>
</WFrame>;}
function W2(){return <WFrame foot={<><Button block size="lg" iconRight="arrow-right">পরবর্তী</Button><Button block variant="ghost">পরে যোগ করব</Button></>}>
  <WStep i={1}/>
  <div><h1 className="sf-title">রোগনির্ণয়ের তথ্য</h1><p className="cm-sub">যতটুকু জানেন ততটুকুই দিন — এতে কেয়ার টিম রাফিকে ভালো বুঝবে।</p></div>
  <Q label="বর্তমান অবস্থা"><ChoiceGroup lang="bn" value="asd" options={[{value:'asd',label:'অটিজম (ASD) নির্ণয় হয়েছে',icon:'clipboard-check'},{value:'eval',label:'মূল্যায়ন চলছে',icon:'hourglass'}]} other={{label:'অন্য (লিখুন)',placeholder:'নিজের ভাষায় লিখুন'}}/></Q>
  <TextField lang="bn" label="কে নির্ণয় করেছেন?" icon="stethoscope" defaultValue="ডা. তানভীর আহমেদ"/>
  <TextField lang="bn" label="কবে?" icon="calendar" defaultValue="মার্চ ২০২৫" hint="তখন রাফির বয়স ছিল ১ বছর ৭ মাস"/>
  <Q label="সাপোর্ট লেভেল" opt><ChipSet multi={false} items={['লেভেল ১','লেভেল ২','লেভেল ৩','জানি না']} sel={['লেভেল ২']}/></Q>
  <Q label="এখন কোন সাপোর্ট পাচ্ছে?"><ChipSet items={['স্পিচ থেরাপি','অকুপেশনাল থেরাপি','বিশেষ স্কুল','ABA','কিছু না']} sel={['স্পিচ থেরাপি','বিশেষ স্কুল']} other/></Q>
  <Q label="অন্য স্বাস্থ্য বিষয়" opt><ChipSet items={['ঘুম','খাবার বাছাই','খিঁচুনি','অ্যালার্জি','নেই']} sel={['ঘুম']} other/></Q>
  <button className="cm-pick" style={{borderStyle:'dashed'}}><Tile icon="file-plus" tone="sky" size={44}/><div style={{flex:1,textAlign:'left'}}><div style={{fontWeight:600}}>নির্ণয়ের রিপোর্ট যোগ করুন</div><div style={{fontSize:14,color:'var(--text-2)'}}>ছবি বা PDF · ঐচ্ছিক</div></div><Icon name="chevron-right" size={20}/></button>
</WFrame>;}
const SECS=['যোগাযোগ ও ভাষা','সামাজিক মেলামেশা','খেলা','ইন্দ্রিয় অনুভূতি','রুটিন ও পরিবর্তন','আবেগ ও শান্ত হওয়া','ঘুম','খাবার','চলাফেরা ও হাতের কাজ','শক্তি ও ভালো লাগা'];
const SIC=['message-circle','users','blocks','ear','repeat','heart','moon','utensils','hand','star'];
function W3a(){const st=[2,2,2,1,0,0,0,0,0,0];return <WFrame foot={<Button block size="lg" iconRight="arrow-right">অংশ ৪ চালিয়ে যান</Button>}>
  <WStep i={2} caption="৩ / ১০ অংশ শেষ"/>
  <div><h1 className="sf-title">রাফি কেমন — নিজের মতো করে</h1><p className="cm-sub">১০টি ছোট অংশ, প্রতিটি ১–২ মিনিট। যেকোনো অংশ বাদ দিতে বা পরে করতে পারেন।</p></div>
  <div className="cm-note"><Icon name="info" size={18}/><span>সঠিক বা ভুল উত্তর নেই — যা দেখেছেন সেটাই বেছে নিন।</span></div>
  <div className="cm-list">{SECS.map((s,i)=><div key={i} className="cm-li" style={{minHeight:56}}><span className={'cm-sec-n'+(st[i]===2?' done':st[i]===1?' cur':'')}>{st[i]===2?<Icon name="check" size={16}/>:bn(i+1)}</span><div className="cm-li-t"><b style={{fontWeight:st[i]===1?700:600}}>{s}</b></div>{st[i]===2?<span className="cm-tag leaf">হয়েছে</span>:st[i]===1?<span className="cm-tag navy">এখন</span>:<Icon name={SIC[i]} size={18} color="var(--text-3)"/>}</div>)}</div>
</WFrame>;}
function SecHead({n,ic}){return <div style={{display:'flex',alignItems:'center',gap:12}}><Tile icon={SIC[n-1]} tone="calm"/><div><div style={{fontSize:14,fontWeight:600,color:'var(--text-2)'}}>অংশ {bn(n)} / ১০</div><h1 className="sf-title" style={{margin:0}}>{SECS[n-1]}</h1></div></div>;}
function W3b(){return <WFrame foot={<><Button block size="lg" iconRight="arrow-right">পরবর্তী অংশ</Button><Button block variant="ghost">এই অংশ বাদ দিন</Button></>}>
  <WStep i={2} caption="অংশ ১ / ১০"/>
  <SecHead n={1}/>
  <Q label="রাফি কীভাবে কিছু চায়?"><ChipSet items={['হাত ধরে নিয়ে যায়','আঙুল দিয়ে দেখায়','একটা শব্দ বলে','দুই শব্দ বলে','ছবি/কার্ড দেখায়','কাঁদে']} sel={['হাত ধরে নিয়ে যায়','একটা শব্দ বলে']} other/></Q>
  <Q label="কতগুলো শব্দ বলে?"><ChipSet multi={false} items={['এখনও না','১–১০','১০–৫০','৫০-এর বেশি']} sel={['১০–৫০']}/></Q>
  <Q label="নাম ধরে ডাকলে"><ChipSet multi={false} items={['প্রায়ই সাড়া দেয়','মাঝে মাঝে','খুব কম']} sel={['মাঝে মাঝে']}/></Q>
  <Q label="শব্দ বা গান পুনরাবৃত্তি করে?"><ChipSet multi={false} items={['হ্যাঁ, প্রায়ই','কখনো কখনো','না']} sel={['হ্যাঁ, প্রায়ই']}/></Q>
</WFrame>;}
function W3c(){return <WFrame foot={<><Button block size="lg" iconRight="arrow-right">পরবর্তী অংশ</Button><Button block variant="ghost">এই অংশ বাদ দিন</Button></>}>
  <WStep i={2} caption="অংশ ৪ / ১০"/>
  <SecHead n={4}/>
  <div style={{display:'flex',flexDirection:'column',gap:10}}><Q label="কোন জিনিস রাফির কাছে কঠিন লাগে?"><ChipSet items={['জোরে শব্দ','ভিড়','কাপড়ের লেবেল','চুল কাটা','উজ্জ্বল আলো','নতুন খাবারের গন্ধ']} sel={['জোরে শব্দ','চুল কাটা','__o']} other/></Q>
  <TextField lang="bn" label="অন্য — লিখুন" defaultValue="প্রেশার কুকারের সিটি, ব্লেন্ডারের শব্দ" hint="রাফির নিজের ভাষায় যা দেখেছেন"/></div>
  <Q label="কোনগুলো ভালো লাগে?"><ChipSet items={['ঘোরা','পানি নিয়ে খেলা','শক্ত করে জড়িয়ে ধরা','গান','দোলনা']} sel={['ঘোরা','পানি নিয়ে খেলা','গান']} other/></Q>
  <Q label="কঠিন লাগলে রাফি কী করে?" opt><ChipSet items={['কান চেপে ধরে','সরে যায়','কাঁদে','হাত নাড়ে']} sel={['কান চেপে ধরে']} other/></Q>
</WFrame>;}
function W4(){const [cp,setCp]=React.useState(true);return <WFrame foot={<><Button block size="lg" iconRight="arrow-right">শেষ করুন</Button><Button block variant="ghost">পরে যোগ করব</Button></>}>
  <WStep i={3}/>
  <div><h1 className="sf-title">কেয়ার টিম যোগ করুন</h1><p className="cm-sub">শিক্ষক বা বিশেষজ্ঞ এই আইডি দিয়ে যোগ দেওয়ার অনুরোধ পাঠাবেন। আপনি অনুমোদন দিলে তবেই তাঁরা দেখতে পাবেন।</p></div>
  <div className="cm-id"><span style={{fontSize:14,fontWeight:600,color:'var(--text-2)'}}>রাফির চাইল্ড আইডি</span><span className="cm-id-code" aria-label="এস জে সাত কে তিন কিউ এক্স">SJ-7K3QX</span>
    <div className="cm-id-act"><button className={'cm-tbtn'+(cp?' on':'')} onClick={()=>setCp(!cp)}><Icon name={cp?'check':'copy'} size={22}/>{cp?'কপি হয়েছে':'কপি'}</button><button className="cm-tbtn"><Icon name="share-2" size={22}/>শেয়ার</button><button className="cm-tbtn"><Icon name="qr-code" size={22}/>QR</button></div></div>
  <h2 className="cm-h2"><Icon name="users" size={20}/>টিম</h2>
  <div className="cm-list">
    <div className="cm-li"><Avatar name="সাবরিনা" size={44}/><div className="cm-li-t"><b>আপনি · সাবরিনা</b><span>মালিক — সব দেখতে ও বদলাতে পারেন</span></div><RoleBadge lang="bn" role="parent"/></div>
    <div className="cm-li"><Avatar name="নাসরিন" size={44}/><div className="cm-li-t"><b>শিক্ষিকা নাসরিন</b><span>আলো বিশেষ স্কুল · আমন্ত্রণ পাঠানো হয়েছে</span></div><span className="cm-tag warm">অপেক্ষায়</span></div>
    <div className="cm-li"><Avatar name="তানভীর" size={44}/><div className="cm-li-t"><b>ডা. তানভীর আহমেদ</b><span>শিশু বিকাশ বিশেষজ্ঞ · অনুরোধ এসেছে</span></div><Button size="sm">দেখুন</Button></div>
  </div>
  <Button variant="secondary" icon="user-plus" block>ফোন নম্বর দিয়ে আমন্ত্রণ</Button>
</WFrame>;}
function W4qr(){return <Phone><StatusBar/><MHead title="প্রোফাইল তৈরি"/><div className="cm-body" style={{opacity:.5}}><WStep i={3}/><h1 className="sf-title">কেয়ার টিম যোগ করুন</h1></div>
  <Sheet lang="bn" inline title="QR দেখিয়ে যোগ করুন" onClose={()=>{}} closeLabel="বন্ধ করুন" footer={<><Button block icon="download">QR সেভ করুন</Button><Button block variant="secondary" icon="share-2">WhatsApp-এ পাঠান</Button></>}>
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:12,padding:'4px 0'}}><div className="rs-qrwrap"><QR size={196} seed={23}/></div><span className="cm-id-code" style={{fontSize:26}}>SJ-7K3QX</span><span style={{textAlign:'center',fontSize:15}}>নাসরিন আপা বা ডা. তানভীর তাঁদের সহযাত্রী অ্যাপ থেকে স্ক্যান করবেন। আপনি অনুমোদন না দেওয়া পর্যন্ত কিছুই দেখা যাবে না।</span></div>
  </Sheet></Phone>;}
function W5(){return <Phone bg="var(--sj-gradient-journey)"><StatusBar light/><div className="cm-brand">
  <span className="cm-markwrap"><img src="assets/shohojatri-mark.png" alt="" style={{width:84}}/></span>
  <h1>রাফির প্রোফাইল তৈরি হয়েছে</h1><p>এখন থেকে আমরা একসাথে রাফির ছোট ছোট অগ্রগতি লিখে রাখব।</p>
  <div className="cm-donelist"><div><Icon name="circle-check" size={20}/>শিশুর তথ্য ও রোগনির্ণয়</div><div><Icon name="circle-check" size={20}/>বৈশিষ্ট্য — ১০টির মধ্যে ৯টি অংশ</div><div><Icon name="circle-check" size={20}/>চাইল্ড আইডি SJ-7K3QX</div><div style={{color:'var(--text-2)'}}><Icon name="clock" size={20} color="var(--sj-ink-amber)"/>নাসরিন আপার অনুমোদন বাকি</div></div>
</div><div className="cm-foot" style={{background:'none'}}><Button block size="lg" variant="secondary" iconRight="arrow-right">রাফির হোম দেখুন</Button><button className="sf-link" style={{color:'#fff',alignSelf:'center'}}>প্রথম লগ লিখুন</button></div></Phone>;}
Object.assign(window,{W1,W2,W3a,W3b,W3c,W4,W4qr,W5});
})();
