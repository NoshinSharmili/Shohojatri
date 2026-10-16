(()=>{
const {Button,IconButton,Icon,StateView,Skeleton,Card,Tabs}=window.ShohojatriDesignSystem_1ff839;
const tr=l=>(b,e)=>l==='en'?e:b;
function Phone({lang,title,children,foot}){const t=tr(lang);return <div lang={lang} className="st-phone">
  <div className="st-sbar"><span>{t('৯:৪১','9:41')}</span><span><Icon name="signal" size={16}/><Icon name="wifi" size={16}/><Icon name="battery-full" size={16}/></span></div>
  <header className="st-head"><IconButton icon="arrow-left" label={t('ফিরে যান','Back')}/><b>{title}</b><i></i></header>
  <div className="st-body">{children}</div>{foot?<div className="st-foot">{foot}</div>:null}</div>;}

/* skeleton shapes */
function SkLog(){return <div className="st-sk"><div className="st-skr"><Skeleton width={40} height={40} radius={999}/><div className="st-skc"><Skeleton width="45%" height={14}/><Skeleton width="30%" height={12}/></div></div><Skeleton width="90%" height={14}/><Skeleton width="70%" height={14}/></div>;}
function SkRow(){return <div className="st-sk"><div className="st-skr"><Skeleton width={44} height={44} radius={14}/><div className="st-skc"><Skeleton width="60%" height={14}/><Skeleton width="40%" height={12}/></div></div></div>;}
function SkCard(){return <div className="st-sk"><div className="st-skr"><Skeleton width={48} height={48} radius={14}/><div className="st-skc"><Skeleton width="55%" height={16}/><Skeleton width="40%" height={12}/></div></div><Skeleton width="80%" height={13}/><div style={{display:'flex',gap:8}}><Skeleton width={110} height={40} radius={999}/><Skeleton width={130} height={40} radius={999}/></div></div>;}
const SK={log:SkLog,row:SkRow,card:SkCard};
function Loading({lang,shape,n=4}){const S=SK[shape];return <div aria-busy="true" style={{display:'flex',flexDirection:'column',gap:12}}><span className="st-sr">{tr(lang)('লোড হচ্ছে…','Loading…')}</span>{Array.from({length:n}).map((_,i)=><S key={i}/>)}</div>;}

const LISTS=[
 {id:'tl',route:'/children/[id]/timeline',name:['টাইমলাইন','Timeline'],shape:'log',
  empty:[['এখনো কোনো লগ নেই','No log entries yet'],['রাফির দিনের ছোট একটা মুহূর্ত লিখে শুরু করুন — শিক্ষক ও ডাক্তারও এখানে যোগ করবেন।','Start with one small moment from Rafi’s day — teachers and doctors will add here too.'],['প্রথম লগ লিখুন','Write the first log'],'plus','notebook-pen'],
  error:[['টাইমলাইন খোলা যায়নি','Couldn’t load the timeline'],['সংযোগে সমস্যা — আপনার লেখা সব এন্ট্রি সংরক্ষিত আছে।','Connection problem — every entry you’ve written is safe.']]},
 {id:'dc',route:'/children/[id]/documents',name:['ডকুমেন্ট','Documents'],shape:'row',
  empty:[['এখনো কোনো ডকুমেন্ট নেই','No documents yet'],['প্রেসক্রিপশন, থেরাপি নোট বা স্কুলের রিপোর্টের ছবি তুলে রাখুন — সব এক জায়গায় থাকবে।','Snap prescriptions, therapy notes or school reports — everything in one place.'],['ডকুমেন্ট যোগ করুন','Add a document'],'upload','file-text'],
  error:[['ডকুমেন্টগুলো আনা যায়নি','Couldn’t load documents'],['সংযোগে সমস্যা — আপনার ফাইলগুলো নিরাপদে সংরক্ষিত আছে।','Connection problem — your files are stored safely.']]},
 {id:'rm',route:'/reminders',name:['রিমাইন্ডার','Reminders'],shape:'row',
  empty:[['আজ কোনো রিমাইন্ডার নেই','No reminders today'],['থেরাপি, ওষুধ বা অ্যাপয়েন্টমেন্টের সময় যোগ করুন — আমরা মনে করিয়ে দেব।','Add therapy, medicine or appointment times — we’ll remind you.'],['রিমাইন্ডার যোগ করুন','Add a reminder'],'bell-plus','bell'],
  error:[['রিমাইন্ডার আনা যায়নি','Couldn’t load reminders'],['সংযোগে সমস্যা — আপনার রিমাইন্ডারগুলো সংরক্ষিত আছে।','Connection problem — your reminders are saved.']]},
 {id:'sp',route:'/specialists',name:['কাছের বিশেষজ্ঞ','Specialists nearby'],shape:'card',
  empty:[['এই ধরনের কাছাকাছি কাউকে পাইনি','No one of this type nearby'],['অন্য ফিল্টার দেখুন বা পাশের বিভাগ বেছে নিন।','Try another filter or pick a nearby division.'],['ফিল্টার মুছুন','Clear filter'],'x','map-pin'],
  error:[['তালিকা আনা যায়নি','Couldn’t load the list'],['সংযোগে সমস্যা — একটু পরে আবার চেষ্টা করুন।','Connection problem — please try again in a moment.']]},
 {id:'sh',route:'/home · /screenings',name:['আগের স্ক্রিনিং','Past screenings'],shape:'row',
  empty:[['এখনো কোনো স্ক্রিনিং হয়নি','No screenings yet'],['প্রায় ১৫ মিনিটের প্রশ্ন আর খেলা — রাফির বেড়ে ওঠা নিয়ে প্রথম ধারণা পাবেন।','About 15 minutes of questions and play — an early picture of how Rafi is growing.'],['স্ক্রিনিং শুরু করুন','Start screening'],'arrow-right','clipboard-list'],
  error:[['স্ক্রিনিংগুলো আনা যায়নি','Couldn’t load screenings'],['সংযোগে সমস্যা — আপনার ফলাফল সংরক্ষিত আছে।','Connection problem — your results are saved.']]},
];
function ListState({lang,cfg,kind}){const t=tr(lang);const p=a=>lang==='en'?a[1]:a[0];
  let body;
  if(kind==='loading')body=<Loading lang={lang} shape={cfg.shape}/>;
  else if(kind==='empty'){const [ti,ms,ac,aic,ic]=cfg.empty;body=<div className="st-center"><StateView lang={lang} kind="empty" icon={ic} title={p(ti)} message={p(ms)} action={<Button lang={lang} variant={cfg.id==='sp'?'secondary':'primary'} icon={cfg.id==='sh'?undefined:aic} iconRight={cfg.id==='sh'?aic:undefined}>{p(ac)}</Button>}/></div>;}
  else {const [ti,ms]=cfg.error;body=<div className="st-center"><StateView lang={lang} kind="error" title={p(ti)} message={p(ms)} action={<Button lang={lang} variant="secondary" icon="refresh-cw">{t('আবার চেষ্টা করুন','Try again')}</Button>}/></div>;}
  return <Phone lang={lang} title={p(cfg.name)}>{body}</Phone>;}

/* camera permission */
function CamAsk({lang}){const t=tr(lang);return <Phone lang={lang} title={t('প্রস্তুতি','Get ready')} foot={<><Button lang={lang} size="lg" block icon="camera">{t('ক্যামেরা চালু করুন','Turn on camera')}</Button><Button lang={lang} variant="ghost" block>{t('পরে করব','Maybe later')}</Button></>}>
  <div style={{marginTop:12}}><span className="st-tile" style={{background:'var(--sj-sky-50)',color:'var(--sj-navy)'}}><Icon name="camera" size={30}/></span></div>
  <h1 className="st-title">{t('খেলার জন্য ক্যামেরা লাগবে','The games need your camera')}</h1>
  <p className="st-sub">{t('রাফি কীভাবে সাড়া দেয় তা দেখতে ফোনের পেছনের ক্যামেরা ব্যবহার হবে। পরের পর্দায় ফোন অনুমতি চাইবে।','We use the back camera to see how Rafi responds. Your phone will ask for permission on the next screen.')}</p>
  <Card padding={16}><div style={{display:'flex',flexDirection:'column',gap:14}}>
    {[['timer','শুধু খেলার সময় চালু থাকে','On only during the games'],['shield-check','ভিডিও শুধু আপনার অনুমতিতে সংরক্ষিত হয়','Videos are saved only with your permission'],['trash-2','যেকোনো সময় মুছে ফেলতে পারবেন','You can delete them any time']].map(([ic,b,e])=><div key={ic} className="st-li"><Icon name={ic} size={20} style={{color:'var(--sj-ink-teal)',flex:'none',marginTop:3}}/><span>{lang==='en'?e:b}</span></div>)}
  </div></Card>
</Phone>;}
function CamDenied({lang}){const t=tr(lang);return <Phone lang={lang} title={t('প্রস্তুতি','Get ready')} foot={<><Button lang={lang} size="lg" block icon="settings">{t('সেটিংস খুলুন','Open settings')}</Button><Button lang={lang} variant="secondary" block icon="refresh-cw">{t('আবার চেষ্টা করুন','Try again')}</Button><Button lang={lang} variant="ghost" block>{t('খেলা ছাড়াই ফলাফল দেখুন','See results without the games')}</Button></>}>
  <div style={{marginTop:8}}><span className="st-tile" style={{background:'var(--sj-amber-50)',color:'var(--sj-ink-amber)'}}><Icon name="camera-off" size={30}/></span></div>
  <h1 className="st-title">{t('ক্যামেরার অনুমতি বন্ধ আছে','Camera access is turned off')}</h1>
  <p className="st-sub">{t('কোনো সমস্যা নেই — প্রশ্নের উত্তরগুলো সংরক্ষিত আছে। খেলাগুলোর জন্য সেটিংসে ক্যামেরা চালু করতে পারেন।','No problem — your answers are saved. To play the games, you can turn the camera on in settings.')}</p>
  <Card tone="sky" padding={16}><ol className="st-steps">
    {[['ফোনের সেটিংস খুলুন','Open your phone’s settings'],['সহযাত্রী বা ব্রাউজার → অনুমতি','Shohojatri or your browser → Permissions'],['ক্যামেরা → অনুমতি দিন','Camera → Allow']].map(([b,e],i)=><li key={i} className="st-li" style={{alignItems:'center'}}><span className="st-num">{t(['১','২','৩'][i],String(i+1))}</span><span>{lang==='en'?e:b}</span></li>)}
  </ol></Card>
  <div className="st-note"><Icon name="info" size={16}/><span>{t('শুধু প্রশ্নের উত্তর দিয়ে পাওয়া ফলাফল কম নিশ্চিত হবে।','Results from the questions alone are less certain.')}</span></div>
</Phone>;}
function CamFail({lang}){const t=tr(lang);return <Phone lang={lang} title={t('প্রস্তুতি','Get ready')} foot={<><Button lang={lang} size="lg" block icon="refresh-cw">{t('আবার চেষ্টা করুন','Try again')}</Button><Button lang={lang} variant="ghost" block>{t('পরে করব','Maybe later')}</Button></>}>
  <div className="st-center"><StateView lang={lang} kind="error" icon="camera-off" title={t('ক্যামেরা চালু হচ্ছে না','The camera won’t start')} message={t('অন্য কোনো অ্যাপ হয়তো ক্যামেরা ব্যবহার করছে। সেটি বন্ধ করে আবার চেষ্টা করুন — আপনার অগ্রগতি সংরক্ষিত আছে।','Another app may be using the camera. Close it and try again — your progress is saved.')}/></div>
</Phone>;}

/* chat */
function ChatLoading({lang}){const t=tr(lang);return <Phone lang={lang} title={t('সহযাত্রী AI','Shohojatri AI')}>
  <div aria-busy="true" style={{display:'flex',flexDirection:'column',gap:16,paddingTop:8}}><span className="st-sr">{t('কথোপকথন লোড হচ্ছে…','Loading conversation…')}</span>
    <div className="st-bub u"><Skeleton width={210} height={48} radius="22px 22px 6px 22px"/></div>
    <div className="st-bub"><Skeleton width={32} height={32} radius={999}/><Skeleton width={260} height={110} radius="22px 22px 22px 6px"/></div>
    <div className="st-bub u"><Skeleton width={170} height={48} radius="22px 22px 6px 22px"/></div>
    <div className="st-bub"><Skeleton width={32} height={32} radius={999}/><Skeleton width={240} height={84} radius="22px 22px 22px 6px"/></div>
  </div></Phone>;}
function HistEmpty({lang}){const t=tr(lang);return <Phone lang={lang} title={t('আগের কথোপকথন','Past conversations')}>
  <div className="st-center"><StateView lang={lang} kind="empty" icon="message-circle" title={t('এখনো কোনো কথোপকথন নেই','No conversations yet')} message={t('রাফির বিষয়ে যা জানতে চান জিজ্ঞেস করুন — কথোপকথনগুলো এখানে থাকবে।','Ask anything about Rafi — your conversations will be kept here.')} action={<Button lang={lang} icon="sparkles">{t('জিজ্ঞেস করুন','Ask a question')}</Button>}/></div>
</Phone>;}
function HistError({lang}){const t=tr(lang);return <Phone lang={lang} title={t('আগের কথোপকথন','Past conversations')}>
  <div className="st-center"><StateView lang={lang} kind="error" title={t('কথোপকথনগুলো আনা যায়নি','Couldn’t load conversations')} message={t('সংযোগে সমস্যা — আপনার কথোপকথন সংরক্ষিত আছে।','Connection problem — your conversations are saved.')} action={<Button lang={lang} variant="secondary" icon="refresh-cw">{t('আবার চেষ্টা করুন','Try again')}</Button>}/></div>
</Phone>;}
Object.assign(window,{StCamAsk:CamAsk,StCamDenied:CamDenied,StCamFail:CamFail,StListState:ListState,StLISTS:LISTS,StChatLoading:ChatLoading,StHistEmpty:HistEmpty,StHistError:HistError});
})();
