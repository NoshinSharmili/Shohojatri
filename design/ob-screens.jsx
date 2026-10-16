(()=>{
const {Button,IconButton,TextField,ChoiceCard,LanguageToggle,Tabs,Card,Icon,RoleBadge}=window.ShohojatriDesignSystem_1ff839;

const T={
bn:{
  promise:'প্রথম চিন্তা থেকে দীর্ঘ পথচলা — শিশুর পাশে সবসময়',start:'শুরু করুন',haveAcc:'আগে থেকেই অ্যাকাউন্ট আছে?',login:'লগ ইন করুন',
  roleTitle:'আপনি কীভাবে যুক্ত হচ্ছেন?',roleSub:'আপনার ভূমিকা অনুযায়ী অ্যাপটি সাজিয়ে দেব।',
  parent:'অভিভাবক',parentD:'নিজের সন্তানের বিকাশ বুঝতে ও পাশে থাকতে',teacher:'বিশেষ বিদ্যালয়ের শিক্ষক',teacherD:'ক্লাসের শিশুদের অগ্রগতি পরিবারের সাথে ভাগ করতে',
  specQ:'আপনি কি বিশেষজ্ঞ?',specA:'আপনার অ্যাকাউন্ট সহযাত্রী তৈরি করে দেয়।',specLink:'এখানে লগ ইন করুন',next:'এগিয়ে যান',
  suTitle:'আপনার অ্যাকাউন্ট খুলুন',suSub:'মাত্র তিনটি তথ্য — এক মিনিটও লাগবে না।',name:'আপনার নাম',nameP:'যেমন: ফারহানা আক্তার',nameTP:'যেমন: রুমানা ইসলাম',
  phone:'ফোন',email:'ইমেইল',phoneL:'মোবাইল নম্বর',phoneP:'০১৭১২ ৩৪৫৬৭৮',emailL:'ইমেইল ঠিকানা',emailP:'যেমন: rumana@school.edu.bd',
  pw:'পাসওয়ার্ড',pwHint:'অন্তত ৮টি অক্ষর',school:'বিদ্যালয়ের নাম',schoolP:'যেমন: আলোর পথ বিশেষ বিদ্যালয়',create:'অ্যাকাউন্ট খুলুন',
  liTitle:'আবার স্বাগতম',liSub:'আপনার অ্যাকাউন্টে লগ ইন করুন।',idL:'মোবাইল নম্বর বা ইমেইল',idP:'০১৭১২ ৩৪৫৬৭৮',forgot:'পাসওয়ার্ড ভুলে গেছেন?',
  specNote:'বিশেষজ্ঞ? সহযাত্রী থেকে পাওয়া অস্থায়ী পাসওয়ার্ড দিয়ে লগ ইন করুন।',newHere:'নতুন?',
  npHi:'স্বাগতম, ডা. নাসরিন',npTitle:'নতুন পাসওয়ার্ড ঠিক করুন',npSub:'প্রথমবার লগ ইন করছেন — অস্থায়ী পাসওয়ার্ডটি বদলে নিজের একটি দিন।',
  npNew:'নতুন পাসওয়ার্ড',npConf:'আবার লিখুন',rules:['অন্তত ৮টি অক্ষর','অন্তত একটি সংখ্যা','দুটো পাসওয়ার্ড মিলেছে'],save:'সেভ করে এগিয়ে যান',specialist:'বিশেষজ্ঞ',back:'ফিরে যান'
},
en:{
  promise:'From the first worry to the long journey — always beside your child',start:'Get started',haveAcc:'Already have an account?',login:'Log in',
  roleTitle:'How are you joining?',roleSub:"We'll set up the app around your role.",
  parent:'Parent',parentD:"Understand and support your own child's growth",teacher:'Special-school teacher',teacherD:"Share your students' progress with their families",
  specQ:'Are you a specialist?',specA:'Your account is created by Shohojatri.',specLink:'Log in here',next:'Continue',
  suTitle:'Create your account',suSub:'Just three details — under a minute.',name:'Your name',nameP:'e.g. Farhana Akter',nameTP:'e.g. Rumana Islam',
  phone:'Phone',email:'Email',phoneL:'Mobile number',phoneP:'01712 345678',emailL:'Email address',emailP:'e.g. rumana@school.edu.bd',
  pw:'Password',pwHint:'At least 8 characters',school:'School name',schoolP:'e.g. Alor Poth Special School',create:'Create account',
  liTitle:'Welcome back',liSub:'Log in to your account.',idL:'Mobile number or email',idP:'01712 345678',forgot:'Forgot password?',
  specNote:'Specialist? Log in with the temporary password Shohojatri sent you.',newHere:'New here?',
  npHi:'Welcome, Dr. Nasrin',npTitle:'Set a new password',npSub:"It's your first login — replace the temporary password with your own.",
  npNew:'New password',npConf:'Type it again',rules:['At least 8 characters','At least one number','Both passwords match'],save:'Save and continue',specialist:'Specialist',back:'Back'
}};

function Phone({initialLang,children}){
  const [lang,setLang]=React.useState(initialLang);
  return <div lang={lang} style={{width:390,height:844,background:'var(--surface-page)',borderRadius:44,overflow:'hidden',boxShadow:'0 30px 80px rgba(0,60,120,.22),0 0 0 10px #0F2236',display:'flex',flexDirection:'column',position:'relative'}}>
    {children({lang,setLang,t:T[lang]})}
  </div>;
}
function StatusBar(){return <div style={{height:44,flex:'none',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 28px',font:'600 15px var(--font-body)',color:'var(--text-1)',position:'relative',zIndex:1}}><span>9:41</span><span style={{display:'flex',gap:6}}><Icon name="signal" size={16}/><Icon name="wifi" size={16}/><Icon name="battery-full" size={16}/></span></div>;}
function Header({lang,setLang,t,back}){
  return <header style={{flex:'none',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'4px 16px 8px',minHeight:56}}>
    {back?<IconButton icon="arrow-left" label={t.back}/>:<img src={lang==='en'?'assets/shohojatri-wordmark-en.png':'assets/shohojatri-wordmark-bn.png'} alt={lang==='en'?'Shohojatri':'সহযাত্রী'} style={{height:34,display:'block',marginLeft:4}}/>}
    <LanguageToggle value={lang} onChange={setLang}/>
  </header>;
}
function Body({children,footer}){
  return <><div style={{flex:1,minHeight:0,overflow:'hidden',padding:'8px 20px 16px'}}>{children}</div>
  {footer?<div style={{flex:'none',padding:'12px 20px 28px',background:'linear-gradient(180deg,rgba(250,251,248,0),var(--surface-page) 30%)',display:'flex',flexDirection:'column',gap:8}}>{footer}</div>:null}</>;
}
function Alt({q,a}){return <div className="ob-alt"><span>{q}</span><button className="ob-link">{a}</button></div>;}

function Splash({lang,setLang,t}){
  return <div style={{flex:1,display:'flex',flexDirection:'column',background:'var(--sj-gradient-sky)'}}>
    <StatusBar/>
    <div style={{display:'flex',justifyContent:'flex-end',padding:'4px 16px'}}><LanguageToggle value={lang} onChange={setLang}/></div>
    <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'0 32px',textAlign:'center',gap:24}}>
      <img src={lang==='en'?'assets/shohojatri-logo-en.png':'assets/shohojatri-logo.png'} alt={lang==='en'?'Shohojatri':'সহযাত্রী'} style={{width:230,display:'block'}}/>
      <p style={{margin:0,font:'600 22px/1.55 var(--font-display)',color:'var(--sj-navy)',textWrap:'balance'}}>{t.promise}</p>
    </div>
    <div style={{padding:'12px 20px 28px',display:'flex',flexDirection:'column',gap:8}}>
      <Button size="lg" block iconRight="arrow-right">{t.start}</Button>
      <Alt q={t.haveAcc} a={t.login}/>
    </div>
  </div>;
}

function Role(p){const {t}=p;const [r,setR]=React.useState('parent');
  return <><StatusBar/><Header {...p} back/>
  <Body footer={<Button size="lg" block iconRight="arrow-right">{t.next}</Button>}>
    <h1 className="ob-title">{t.roleTitle}</h1><p className="ob-sub">{t.roleSub}</p>
    <div style={{display:'flex',flexDirection:'column',gap:12}} role="radiogroup">
      <ChoiceCard icon="heart" label={t.parent} description={t.parentD} selected={r==='parent'} onSelect={()=>setR('parent')}/>
      <ChoiceCard icon="school" label={t.teacher} description={t.teacherD} selected={r==='teacher'} onSelect={()=>setR('teacher')}/>
    </div>
    <div style={{display:'flex',gap:12,alignItems:'flex-start',marginTop:28,padding:'16px 4px 0',borderTop:'1px solid var(--border-1)'}}>
      <span className="sj-tile" style={{background:'var(--sj-role-specialist-bg)',color:'var(--sj-role-specialist)',flex:'none'}}><Icon name="stethoscope" size={22}/></span>
      <div style={{fontSize:15,lineHeight:1.6,color:'var(--text-2)'}}><strong style={{color:'var(--text-1)',fontWeight:600}}>{t.specQ}</strong> {t.specA}<br/><button className="ob-link" style={{paddingLeft:0}}>{t.specLink}<Icon name="arrow-right" size={16} style={{marginLeft:4}}/></button></div>
    </div>
  </Body></>;
}

function SignUp(p){const {t,role}=p;const teacher=role==='teacher';const [via,setVia]=React.useState(teacher?'email':'phone');
  return <><StatusBar/><Header {...p} back/>
  <Body footer={<><Button size="lg" block>{t.create}</Button><Alt q={t.haveAcc} a={t.login}/></>}>
    <div style={{marginBottom:8}}><RoleBadge role={role} label={teacher?t.teacher:t.parent} lang={p.lang}/></div>
    <h1 className="ob-title">{t.suTitle}</h1>
    {!teacher&&<p className="ob-sub">{t.suSub}</p>}
    <div className="ob-form" style={teacher?{marginTop:12}:null}>
      <TextField label={t.name} icon="user" placeholder={teacher?t.nameTP:t.nameP}/>
      {teacher&&<TextField label={t.school} icon="school" placeholder={t.schoolP}/>}
      <div style={{display:'flex',flexDirection:'column',gap:10}}>
        <Tabs variant="pill" value={via} onChange={setVia} items={[{id:'phone',label:t.phone,icon:'phone'},{id:'email',label:t.email,icon:'mail'}]}/>
        {via==='phone'?<TextField key="ph" label={t.phoneL} type="tel" icon="phone" placeholder={t.phoneP}/>:<TextField key="em" label={t.emailL} type="email" icon="mail" placeholder={t.emailP}/>}
      </div>
      <TextField label={t.pw} type="password" icon="lock" hint={t.pwHint}/>
    </div>
  </Body></>;
}

function LogIn(p){const {t}=p;
  return <><StatusBar/><Header {...p}/>
  <Body footer={<><Button size="lg" block>{t.login}</Button><Alt q={t.newHere} a={t.create}/></>}>
    <h1 className="ob-title" style={{marginTop:12}}>{t.liTitle}</h1><p className="ob-sub">{t.liSub}</p>
    <div className="ob-form">
      <TextField label={t.idL} icon="user" placeholder={t.idP}/>
      <div><TextField label={t.pw} type="password" icon="lock"/><div style={{display:'flex',justifyContent:'flex-end'}}><button className="ob-link">{t.forgot}</button></div></div>
    </div>
    <Card tone="calm" padding={14} style={{marginTop:12}}><div style={{display:'flex',gap:10,fontSize:15,lineHeight:1.6,color:'var(--sj-ink-teal)'}}><Icon name="stethoscope" size={20} style={{flex:'none',marginTop:3}}/><span>{t.specNote}</span></div></Card>
  </Body></>;
}

function NewPassword(p){const {t}=p;const met=[true,true,false];
  return <><StatusBar/><Header {...p}/>
  <Body footer={<Button size="lg" block icon="check">{t.save}</Button>}>
    <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:6,flexWrap:'wrap'}}><RoleBadge role="specialist" label={t.specialist} lang={p.lang}/><span style={{fontWeight:600,color:'var(--sj-ink-leaf)'}}>{t.npHi}</span></div>
    <h1 className="ob-title">{t.npTitle}</h1><p className="ob-sub">{t.npSub}</p>
    <div className="ob-form">
      <TextField label={t.npNew} type="password" icon="lock" defaultValue="shohojatri24"/>
      <TextField label={t.npConf} type="password" icon="lock" defaultValue="shoho"/>
    </div>
    <ul style={{listStyle:'none',margin:'16px 0 0',padding:0,display:'flex',flexDirection:'column',gap:8}}>
      {t.rules.map((r,i)=><li key={i} style={{display:'flex',alignItems:'center',gap:10,fontSize:15,color:met[i]?'var(--sj-ink-leaf)':'var(--text-2)'}}><Icon name={met[i]?'circle-check':'circle'} size={20}/><span>{r}</span></li>)}
    </ul>
  </Body></>;
}
Object.assign(window,{ObPhone:Phone,ObSplash:Splash,ObRole:Role,ObSignUp:SignUp,ObLogIn:LogIn,ObNewPassword:NewPassword});
})();
