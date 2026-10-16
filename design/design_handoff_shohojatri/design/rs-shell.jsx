(()=>{
const {Icon,IconButton}=window.ShohojatriDesignSystem_1ff839;
function TallPhone({children}){return <div lang="bn" style={{width:390,background:'var(--surface-page)',borderRadius:44,overflow:'hidden',boxShadow:'0 30px 80px rgba(0,60,120,.22),0 0 0 10px #0F2236',display:'flex',flexDirection:'column',position:'relative'}}>{children}</div>;}
function AppHeader({title,left='arrow-left',right}){return <header style={{flex:'none',display:'flex',alignItems:'center',gap:4,padding:'0 8px 4px',minHeight:56}}>
  <IconButton icon={left} label="ফিরে যান"/>
  <div style={{flex:1,textAlign:'center',font:'600 17px var(--font-body)',color:'var(--text-1)'}}>{title}</div>
  {right||<span style={{width:48}}></span>}
</header>;}
function Sec({title,icon,children,aside}){return <section className="rs-sec">
  <h2 className="rs-h2">{icon?<Icon name={icon} size={20}/>:null}<span>{title}</span>{aside?<span className="rs-h2-aside">{aside}</span>:null}</h2>{children}</section>;}
function QR({size=120,seed=11,fg='var(--sj-navy-deep)'}){
  const N=25;let s=seed;const r=()=>{s=(s*9301+49297)%233280;return s/233280;};
  const fin=(x,y)=>[[0,0],[18,0],[0,18]].some(([a,b])=>x>=a&&x<a+7&&y>=b&&y<b+7);
  const finOn=(x,y)=>{const [a,b]=[[0,0],[18,0],[0,18]].find(([a,b])=>x>=a&&x<a+7&&y>=b&&y<b+7);const i=x-a,j=y-b;return i===0||j===0||i===6||j===6||(i>=2&&i<=4&&j>=2&&j<=4);};
  const cells=[];for(let y=0;y<N;y++)for(let x=0;x<N;x++){const on=fin(x,y)?finOn(x,y):(x===7||y===7||x===17&&y<8||y===17&&x<8)?false:r()>.52;if(on)cells.push(<rect key={x+'-'+y} x={x} y={y} width="1" height="1"/>);}
  return <svg viewBox={`-2 -2 ${N+4} ${N+4}`} width={size} height={size} role="img" aria-label="QR কোড" style={{background:'#fff',borderRadius:8,display:'block'}}><g fill={fg} shapeRendering="crispEdges">{cells}</g></svg>;
}
function MapView({h=220,radius=0,pins=[],sel=0,you=[52,58],children}){
  return <div className="rs-map" style={{height:h,borderRadius:radius}} aria-label="মানচিত্র">
    <i className="rs-river"></i><i className="rs-park" style={{left:'8%',top:'12%',width:90,height:60}}></i><i className="rs-park" style={{right:'6%',bottom:'10%',width:120,height:70}}></i>
    <i className="rs-road" style={{left:0,right:0,top:'40%',height:10}}></i><i className="rs-road" style={{top:0,bottom:0,left:'34%',width:10}}></i><i className="rs-road thin" style={{top:0,bottom:0,left:'72%',width:6,transform:'rotate(8deg)'}}></i><i className="rs-road thin" style={{left:0,right:0,top:'74%',height:6,transform:'rotate(-4deg)'}}></i>
    {pins.map(([x,y,ic],i)=><span key={i} className={'rs-pin'+(i===sel?' on':'')} style={{left:x+'%',top:y+'%'}}><Icon name={ic} size={i===sel?20:16}/></span>)}
    <span className="rs-you" style={{left:you[0]+'%',top:you[1]+'%'}}></span>
    {children}
  </div>;
}
Object.assign(window,{TallPhone,AppHeader,Sec,QR,MapView});
})();
