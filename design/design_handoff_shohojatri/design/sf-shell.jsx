(()=>{
const {Button,IconButton,TextField,ChoiceCard,ChoiceGroup,LanguageToggle,Card,Icon,Chip,ChildCard,RiskBadge,Stepper,BottomNav}=window.ShohojatriDesignSystem_1ff839;
const bn=n=>String(n).replace(/\d/g,d=>'০১২৩৪৫৬৭৮৯'[d]);

function Phone({bg,children}){
  return <div lang="bn" style={{width:390,height:844,background:bg||'var(--surface-page)',borderRadius:44,overflow:'hidden',boxShadow:'0 30px 80px rgba(0,60,120,.22),0 0 0 10px #0F2236',display:'flex',flexDirection:'column',position:'relative'}}>{children}</div>;
}
function StatusBar({light}){return <div style={{height:44,flex:'none',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 28px',font:'600 15px var(--font-body)',color:light?'#fff':'var(--text-1)',position:'relative',zIndex:2}}><span>৯:৪১</span><span style={{display:'flex',gap:6}}><Icon name="signal" size={16}/><Icon name="wifi" size={16}/><Icon name="battery-full" size={16}/></span></div>;}
function FlowHeader({title,right}){
  return <header style={{flex:'none',display:'flex',alignItems:'center',gap:4,padding:'0 12px 4px',minHeight:56}}>
    <IconButton icon="arrow-left" label="ফিরে যান"/>
    <div style={{flex:1,textAlign:'center',font:'600 16px var(--font-body)',color:'var(--text-2)'}}>{title}</div>
    {right||<IconButton icon="x" label="বন্ধ করুন"/>}
  </header>;
}
function Body({children,footer,pad}){
  return <><div style={{flex:1,minHeight:0,overflow:'hidden',padding:pad||'4px 20px 12px',display:'flex',flexDirection:'column'}}>{children}</div>
  {footer?<div style={{flex:'none',padding:'12px 20px 28px',background:'linear-gradient(180deg,rgba(250,251,248,0),var(--surface-page) 30%)',display:'flex',flexDirection:'column',gap:8}}>{footer}</div>:null}</>;
}
const FLOW=['তথ্য','সম্মতি','প্রশ্ন','গেম'];
function FlowStep({i}){return <div style={{marginBottom:16}}><Stepper steps={FLOW} current={i} lang="bn"/></div>;}
function Title({children,sub}){return <><h1 className="sf-title">{children}</h1>{sub?<p className="sf-sub">{sub}</p>:null}</>;}
function Tile({icon,tone='sky',size=48}){
  const c={sky:['var(--sj-sky-50)','var(--sj-navy)'],calm:['var(--sj-teal-50)','var(--sj-ink-teal)'],leaf:['var(--sj-leaf-50)','var(--sj-ink-leaf)'],warm:['var(--sj-amber-50)','var(--sj-ink-amber)']}[tone];
  return <span className="sj-tile" style={{width:size,height:size,background:c[0],color:c[1],flex:'none',display:'inline-flex',alignItems:'center',justifyContent:'center',borderRadius:14}}><Icon name={icon} size={Math.round(size*.46)}/></span>;
}
function Dots({light}){return <span className="sf-dots" aria-label="অপেক্ষা করুন"><i style={{background:'var(--sj-blue)'}}></i><i style={{background:'var(--sj-teal)'}}></i><i style={{background:'var(--sj-sprout)'}}></i></span>;}
function ParentPill({children,icon='info',dark}){return <div className={'sf-ppill'+(dark?' dark':'')}><Icon name={icon} size={16}/><span>{children}</span></div>;}

/* child-facing stage pieces */
function Character({pose='idle',scale=1,look=0}){
  return <div style={{transform:`scale(${scale})`,transformOrigin:'bottom center'}}><div className={'ch p-'+pose}>
    <div className="ch-body"></div>
    <div className="ch-arm l"></div><div className="ch-arm r"></div>
    <div className="ch-head"><span className="ch-eyes" style={{transform:`translateX(${look*6}px)`}}><i></i><i></i></span><span className="ch-cheek l"></span><span className="ch-cheek r"></span><span className="ch-smile"></span></div>
  </div></div>;
}
function Ball({size=76}){return <div className="toy-ball" style={{width:size,height:size}}></div>;}
function Boat(){return <div className="toy-boat"><div className="sail"></div><div className="mast"></div><div className="hull"></div></div>;}
function Hills(){return <div className="sf-hills"><i className="h1"></i><i className="h2"></i></div>;}
function Stage({children,top}){
  return <div style={{flex:1,position:'relative',background:'linear-gradient(180deg,#E8F4FA 0%,#F4FBF6 70%)',overflow:'hidden'}}>
    <Hills/>{children}
    <div style={{position:'absolute',top:52,left:16,right:16,display:'flex',justifyContent:'space-between',alignItems:'center',zIndex:3}}>{top||<span></span>}<button className="sf-ghost-ic" aria-label="থামান"><Icon name="pause" size={20}/></button></div>
  </div>;
}
Object.assign(window,{bn,Phone,StatusBar,FlowHeader,Body,FlowStep,Title,Tile,Dots,ParentPill,Character,Ball,Boat,Hills,Stage});

})();
