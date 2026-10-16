(()=>{
const {Button,IconButton,Card,Icon,ScoreGauge}=window.ShohojatriDesignSystem_1ff839;
function ResultTop({d,level}){return <div className="sf-hero rs-hero">
  <div className="rs-meta">রাফি · ২ বছর ১০ মাস · ১৫ অক্টোবর ২০২৬</div>
  <ScoreGauge value={d.score} max={100} thresholds={[25,45,65]} level={level} maxLabel="১০০-এর মধ্যে" width={230} lang="bn"/>
  <h1 className="rs-h1">{d.headline}</h1>
  {d.support?<p className="rs-support"><Icon name="hand-heart" size={18}/><span>{d.support}</span></p>:null}
</div>;}
function ResultScreen({level}){
  const d=RS[level];
  return <TallPhone>
    <StatusBar/>
    <AppHeader title="রাফির ফলাফল" left="x" right={<IconButton icon="share-2" label="শেয়ার করুন"/>}/>
    <div className="rs-body">
      <ResultTop d={d} level={level}/>
      <Card padding={18}>
        <h2 className="rs-h2"><Icon name="lightbulb" size={20}/><span>এর মানে কী</span></h2>
        <p className="rs-p">{d.meaning}</p>
        <div className="rs-nodx"><Icon name="info" size={18}/><span>এটি রোগনির্ণয় নয় — এটি পরবর্তী পদক্ষেপ বোঝার একটা সহায়ক।</span></div>
      </Card>
      <Sec title="যা লক্ষ্য করেছি" icon="search">
        <div className="sf-list">{d.observed.map(([ic,t,src],i)=><div key={i} className="rs-obs"><Tile icon={ic} tone="sky" size={40}/><div style={{flex:1,minWidth:0}}><div className="rs-obs-t">{t}</div><span className="rs-src">{src}</span></div></div>)}</div>
      </Sec>
      <Sec title="যা ভালো দেখেছি" icon="star">
        <div className="rs-strengths">{d.strengths.map((t,i)=><div key={i} className="rs-str"><span className="rs-star"><Icon name="star" size={16}/></span><span>{t}</span></div>)}</div>
      </Sec>
      <Sec title="এখন যা করতে পারেন" icon="footprints">
        <div className="sf-list">{d.next.map((t,i)=><div key={i} className="rs-step"><span className="sf-num">{bn(i+1)}</span><span>{t}</span></div>)}</div>
      </Sec>
      <div className="rs-conf">
        <Icon name="shield-check" size={20}/>
        <div><b>ফলাফলের নির্ভরযোগ্যতা: {d.conf[0]}</b><p>{d.conf[1]}</p>{d.conf[2]?<button className="sf-link">{d.conf[2]} →</button>:null}</div>
      </div>
      <div className="rs-actions">
        <Button variant="primary" size="lg" block icon="send" lang="bn">ডাক্তারকে রিপোর্ট দিন</Button>
        <Button variant="secondary" size="lg" block icon="map-pin" lang="bn">কাছের বিশেষজ্ঞ খুঁজুন</Button>
        <Button variant="ghost" block icon="message-circle-question" lang="bn">ফলাফল নিয়ে প্রশ্ন করুন</Button>
      </div>
      <div className="rs-foot">সহযাত্রী স্ক্রিনিং · রিপোর্ট নং SJ-২৬১০-৪৮২১</div>
    </div>
  </TallPhone>;
}
Object.assign(window,{ResultScreen,ResultTop});
})();
