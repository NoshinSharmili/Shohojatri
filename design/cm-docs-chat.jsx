(()=>{
const {Button,IconButton,TextField,Icon,Chip,Avatar,Sheet,Toast,SourceChip,ChatBubble,SuggestionCard,ActivityCard,RoleBadge}=window.ShohojatriDesignSystem_1ff839;
function Paper({hl=true}){return <div className="cm-doc"><div className="cm-paper" aria-label="প্রেসক্রিপশনের ছবি (নমুনা)">
  <i className="hd"></i><i style={{width:'40%',marginBottom:22}}></i>
  <i style={{width:'70%'}}></i><i style={{width:'45%',marginBottom:18}}></i>
  <i style={{width:'80%'}}></i><i style={{width:'35%',marginBottom:18}}></i>
  <i style={{width:'65%'}}></i><i style={{width:'50%'}}></i>
  {hl?<><span className="cm-hl" style={{left:10,top:62,width:190,height:36}}><b>১</b></span><span className="cm-hl" style={{left:10,top:104,width:120,height:22}}><b>২</b></span><span className="cm-hl bad" style={{left:10,top:136,width:215,height:36}}><b>৩</b></span><span className="cm-hl" style={{left:10,top:184,width:170,height:40}}><b>৪</b></span></>:null}
</div><div className="cm-doc-tag"><span className="cm-tag" style={{background:'#fff'}}><Icon name="image" size={14}/>প্রেসক্রিপশন · ১৪ অক্টো</span></div>
<div className="rs-mapctl"><IconButton icon="zoom-in" label="বড় করুন"/></div></div>;}
function DocPick(){const [t,setT]=React.useState('rx');return <Phone><StatusBar/><MHead title="ডকুমেন্ট"/><div className="cm-body" style={{opacity:.5}}><h1 className="cm-h1">রাফির ডকুমেন্ট</h1></div>
  <Sheet lang="bn" inline title="ডকুমেন্ট যোগ করুন" onClose={()=>{}} closeLabel="বন্ধ করুন">
    <div style={{display:'flex',flexDirection:'column',gap:16,color:'var(--text-1)'}}>
      <div><div className="cm-label">কী ধরনের?</div><div className="cm-chips">{[['rx','প্রেসক্রিপশন'],['th','থেরাপি রিপোর্ট'],['sc','স্কুল নোট'],['lb','টেস্ট রিপোর্ট']].map(([k,l])=><Chip key={k} lang="bn" label={l} selected={t===k} onClick={()=>setT(k)}/>)}<Chip lang="bn" icon="pencil" label="অন্য (লিখুন)"/></div></div>
      <div className="cm-list">
        <div className="cm-li"><Tile icon="camera" tone="sky" size={44}/><div className="cm-li-t"><b>ছবি তুলুন</b><span>সমতল জায়গায় রেখে, ভালো আলোতে</span></div><Icon name="chevron-right" size={20} color="var(--text-3)"/></div>
        <div className="cm-li"><Tile icon="images" tone="calm" size={44}/><div className="cm-li-t"><b>গ্যালারি থেকে</b><span>এক বা একাধিক ছবি</span></div><Icon name="chevron-right" size={20} color="var(--text-3)"/></div>
        <div className="cm-li"><Tile icon="file-text" tone="leaf" size={44}/><div className="cm-li-t"><b>PDF ফাইল</b><span>সর্বোচ্চ ১০ এমবি</span></div><Icon name="chevron-right" size={20} color="var(--text-3)"/></div>
      </div>
      <div className="cm-note"><Icon name="sparkles" size={18}/><span>আমরা ওষুধ, ডোজ ও তারিখ পড়ে দেখাব — সেভ করার আগে আপনি মিলিয়ে নেবেন।</span></div>
    </div></Sheet></Phone>;}
function DocReading(){return <Phone><StatusBar/><MHead title="পড়া হচ্ছে"/><Paper hl={false}/>
  <div className="cm-body" style={{paddingTop:20,alignItems:'center',textAlign:'center',gap:12}}><Dots/><h2 className="cm-h2">প্রেসক্রিপশনটা পড়ছি…</h2><p className="cm-sub">সাধারণত ১০–২০ সেকেন্ড লাগে। হাতের লেখা হলে একটু বেশি।</p>
  <div style={{width:'100%',display:'flex',flexDirection:'column',gap:10,marginTop:8}}>{[1,2,3].map(i=><div key={i} className="sj-skel" style={{height:56,borderRadius:14}}></div>)}</div></div></Phone>;}
function EF({n,label,value,asis,bad,empty,hint}){return <div className="cm-ef"><div className="cm-ef-h"><span className={'n'+(bad?' bad':'')}>{bn(n)}</span><span style={{flex:1}}>{label}{asis?<span className="cm-asis"> · লেখা অনুযায়ী</span>:null}</span>{bad?<span className="cm-unread"><Icon name="eye-off" size={13}/>পড়া যায়নি</span>:null}</div>
  <div className={'cm-ef-v'+(bad?' bad':'')+(empty?' empty':'')}><span>{value}</span><IconButton icon="pencil" label="সম্পাদনা"/></div>{hint?<span style={{fontSize:14,color:bad?'var(--sj-ink-amber)':'var(--text-2)'}}>{hint}</span>:null}</div>;}
function DocReview(){return <TallPhone><StatusBar/><MHead title="মিলিয়ে দেখুন" right={<IconButton icon="refresh-cw" label="আবার পড়ুন"/>}/><Paper/>
  <div className="cm-tall" style={{paddingTop:18}}>
    <div><h1 className="sf-title">যা পড়তে পেরেছি</h1><p className="cm-sub">ছবির নম্বরের সাথে প্রতিটি ঘর মিলিয়ে দেখুন। ভুল থাকলে ঠিক করে দিন।</p></div>
    <div className="cm-note warm"><Icon name="triangle-alert" size={18}/><span>একটি ঘর পড়া যায়নি — ছবি দেখে নিজে লিখুন, অথবা ফাঁকা রাখুন।</span></div>
    <div className="cm-list">
      <EF n={1} label="ওষুধের নাম" value="Melatonin সিরাপ"/>
      <EF n={2} label="ডোজ" asis value="১ মি.লি."/>
      <EF n={3} label="কতবার" bad value="ঘুমের … আগে ?" hint="“৩০ মিনিট” না “১ ঘণ্টা” — নিশ্চিত হতে পারিনি"/>
      <EF n={4} label="ফলো-আপ তারিখ" value="১২ নভেম্বর ২০২৬" hint="ডা. তানভীর আহমেদ"/>
    </div>
    <div className="cm-list"><div className="cm-li"><Icon name="bell" size={20} color="var(--sj-navy)"/><div className="cm-li-t"><b>প্রতিদিনের ওষুধের রিমাইন্ডার</b><span>রাত ৮:০০</span></div><Sw on label="ওষুধের রিমাইন্ডার"/></div><div className="cm-li"><Icon name="calendar-check" size={20} color="var(--sj-navy)"/><div className="cm-li-t"><b>ফলো-আপের রিমাইন্ডার</b><span>১ দিন আগে</span></div><Sw on label="ফলো-আপ রিমাইন্ডার"/></div></div>
    <div className="cm-note"><Icon name="info" size={18}/><span>ডোজ ঠিক যেভাবে লেখা আছে সেভাবেই রাখা হয়। কোনো সন্দেহ থাকলে ডাক্তারকে জিজ্ঞেস করুন।</span></div>
    <div style={{display:'flex',flexDirection:'column',gap:8}}><Button block size="lg" icon="check">নিশ্চিত করুন</Button><Button block variant="ghost">শুধু ছবি সেভ করুন</Button></div>
  </div></TallPhone>;}

function ChatTop(){return <><StatusBar/><div className="cm-chathead"><IconButton icon="arrow-left" label="ফিরে যান"/><span className="sj-tile" style={{width:40,height:40,background:'var(--sj-sky-50)',color:'var(--sj-navy)',borderRadius:12}}><Icon name="sparkles" size={20}/></span><div style={{flex:1}}><b>সহযাত্রী AI</b><span>রাফির লগ ও ডকুমেন্ট থেকে উত্তর দেয়</span></div><Button size="sm" variant="secondary" icon="file-text">স্ট্যাটাস রিপোর্ট</Button></div></>;}
function ChatThread(){return <><ChatBubble lang="bn" from="user" time="বিকাল ২:১০">রাফি রাতে অনেক দেরিতে ঘুমায়। কী করতে পারি?</ChatBubble>
  <ChatBubble lang="bn" from="assistant" sourcesLabel="সূত্র" sources={[{label:'৫টি ঘুমের লগ',kind:'log'},{label:'প্রেসক্রিপশন · ১৪ অক্টো',kind:'doc'},{label:'ঘুমের রুটিন গাইড',kind:'guide'}]}>গত ২ সপ্তাহের লগে দেখা যাচ্ছে রাফি গড়ে রাত ১১:৪০-এ ঘুমায়, আর যেদিন সন্ধ্যায় হেঁটেছে সেদিন একটু আগে ঘুমিয়েছে। ঘুমের ৩০ মিনিট আগে আলো কমিয়ে একই ক্রমে রুটিন — গোসল, গল্প, গান — চেষ্টা করে দেখতে পারেন। ডা. তানভীরের দেওয়া সিরাপও এই সময়েই।</ChatBubble>
  <div className="cm-act"><SuggestionCard lang="bn" eyebrow="রিমাইন্ডারের খসড়া — যাচাই করুন" title="ঘুমের রুটিন শুরু · রোজ রাত ৮:৩০" body="আলো কমানো → গোসল → গল্প → গান" labels={{confirm:'যোগ করুন',edit:'সম্পাদনা',dismiss:'বাদ দিন'}}/>
  <div className="cm-mini-act"><Tile icon="moon" tone="calm" size={44}/><div style={{flex:1}}><b>ছবিতে ঘুমের রুটিন</b><span>অ্যাক্টিভিটি · ১৫ মিনিট</span></div><IconButton icon="chevron-right" label="খুলুন"/></div></div></>;}
function Chat(){return <Phone><ChatTop/><div className="cm-thread"><ChatThread/></div>
  <div className="rs-chiprow" style={{paddingBottom:10}}><Chip lang="bn" label="এই সপ্তাহে কী বদলেছে?"/><Chip lang="bn" label="নাসরিন আপার নোট বুঝিয়ে দিন"/></div>
  <div className="cm-composer"><IconButton icon="paperclip" label="ফাইল যোগ"/><div className="cm-input">প্রশ্ন লিখুন…</div><IconButton icon="mic" label="ভয়েস"/></div></Phone>;}
function ReportSheet(){const [p,setP]=React.useState('m');return <Phone><ChatTop/><div className="cm-thread" style={{opacity:.5}}><ChatThread/></div>
  <Sheet lang="bn" inline title="স্ট্যাটাস রিপোর্ট তৈরি" onClose={()=>{}} closeLabel="বন্ধ করুন" footer={<Button block size="lg" icon="sparkles">রিপোর্ট তৈরি করুন</Button>}>
    <div style={{display:'flex',flexDirection:'column',gap:16,color:'var(--text-1)'}}>
      <div><div className="cm-label">কতদিনের?</div><div className="rs-seg">{[['w','২ সপ্তাহ'],['m','১ মাস'],['q','৩ মাস']].map(([k,l])=><button key={k} className={p===k?'on':''} onClick={()=>setP(k)}>{l}</button>)}</div></div>
      <div><div className="cm-label">কার জন্য?</div><ChipSet multi={false} items={['ডা. তানভীর','নাসরিন আপা','নিজের জন্য']} sel={['ডা. তানভীর']}/></div>
      <div><div className="cm-label">যা থাকবে</div><ChipSet items={['লক্ষ্যের অগ্রগতি','ঘুম','ওষুধ','খোলা প্রশ্ন','ছবি']} sel={['লক্ষ্যের অগ্রগতি','ঘুম','ওষুধ','খোলা প্রশ্ন']}/></div>
    </div></Sheet></Phone>;}
function DomRow({n,d,t,data}){return <div className="cm-dom"><span>{n}</span><div style={{width:90}}><Spark data={data} w={90} h={30} color={d==='dn'?'var(--sj-amber)':'var(--sj-teal)'}/></div><Trend dir={d}>{t}</Trend></div>;}
function StatusReport(){return <TallPhone><StatusBar/><MHead title="স্ট্যাটাস রিপোর্ট" right={<IconButton icon="share-2" label="শেয়ার করুন"/>}/>
  <div className="cm-tall">
    <div className="cm-row"><Avatar name="রাফি" size={56}/><div style={{flex:1}}><h1 className="cm-h1" style={{fontSize:22}}>রাফি · মাসিক রিপোর্ট</h1><div style={{fontSize:14,color:'var(--text-2)'}}>১৫ সেপ্টে – ১৫ অক্টো ২০২৬ · ডা. তানভীরের জন্য</div></div></div>
    <div className="cm-hero"><div className="cm-eyebrow"><Icon name="sparkles" size={16}/>সংক্ষেপে<span>এআই খসড়া · আপনি দেখেছেন</span></div><p>এই মাসে রাফি নিজে থেকে একক শব্দে চাওয়া বাড়িয়েছে, স্কুলে পালা নিয়ে খেলায় ৩ মিনিট পর্যন্ত থেকেছে। ঘুম এখনো দেরিতে, তবে হাঁটার দিনগুলোতে ভালো।</p><div className="cm-srcs"><SourceChip lang="bn" kind="log" label="৩৮টি লগ"/><SourceChip lang="bn" kind="report" label="২টি থেরাপি নোট"/></div></div>
    <div className="cm-rep"><h3><Icon name="chart-line" size={18}/>ক্ষেত্রভিত্তিক পরিবর্তন</h3>
      <DomRow n="ভাষা" d="up" t="বেড়েছে" data={[2,2.4,2.3,2.8,3,3.4]}/><DomRow n="সামাজিক" d="up" t="একটু বেড়েছে" data={[2.5,2.4,2.7,2.8,2.9,3.1]}/><DomRow n="ঘুম" d="flat" t="একই" data={[2,2.2,1.9,2.1,2.3,2.1]}/><DomRow n="আচরণ" d="dn" t="নজর দিন" data={[3.2,3,3.1,2.7,2.6,2.5]}/></div>
    <div className="cm-rep"><h3><Icon name="target" size={18}/>লক্ষ্য</h3>
      {[['চাওয়ার জন্য “আরও” বলা',70],['৩ মিনিট পালা নিয়ে খেলা',55],['রাত ১০টার মধ্যে ঘুম',25]].map(([g,v])=><div key={g} style={{display:'flex',flexDirection:'column',gap:4}}><div style={{display:'flex',fontSize:15}}><span style={{flex:1}}>{g}</span><b style={{fontFamily:'var(--font-display)',color:'var(--sj-ink-leaf)'}}>{bn(v)}%</b></div><Bar v={v}/></div>)}</div>
    <div className="cm-rep"><h3><Icon name="pill" size={18}/>ওষুধ</h3><p>Melatonin সিরাপ ১ মি.লি. — ঘুমের আগে · ২৮/৩০ দিন দেওয়া হয়েছে</p></div>
    <div className="cm-rep"><h3><Icon name="message-circle-question" size={18}/>ডাক্তারকে যা জিজ্ঞেস করতে চাই</h3><p>১. চুল কাটার সময় খুব অস্থির হয় — কী করা যায়?<br/>২. সিরাপের সময় ৩০ মিনিট না ১ ঘণ্টা আগে?</p></div>
    <div className="rs-nodx"><Icon name="info" size={18}/><span>এটি রোগনির্ণয় নয় — পরিবার ও টিমের লগ থেকে তৈরি একটা সারাংশ।</span></div>
    <div style={{display:'flex',flexDirection:'column',gap:8}}><Button block size="lg" icon="send">ডা. তানভীরকে পাঠান</Button><Button block variant="secondary" icon="download">PDF ডাউনলোড</Button></div>
  </div></TallPhone>;}
Object.assign(window,{DocPick,DocReading,DocReview,Chat,ReportSheet,StatusReport,ChatThread});
})();
