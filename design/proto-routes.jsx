(()=>{
const C=(n,p)=>React.createElement(window[n],p||{});
const P=(n,p)=>C('Phone',{children:C(n,p)});
const OB=(n,x)=>l=>C('ObPhone',{initialLang:l,children:p=>C(n,{...p,...(x||{})})});
const AC=(n,x)=>l=>C(n,{lang:l,...(x||{})});
const inStack=id=>(root,cur,stack)=>stack.includes(id)||stack.length<2?id:'pop';
const homeFor=(root,cur)=>['scr','entry'].includes(R[cur].g)?'home':'c-home';

const skipBack=(skip,fb)=>(root,cur,stack)=>{for(let j=stack.length-2;j>=0;j--)if(!skip.includes(stack[j]))return stack[j];return fb;};
const nb=(t,id,sel)=>[{s:sel||'.sj-bnav__item',t},id];
const TN=[nb('হোম|Home','t-home'),nb('শিশুরা|Children','t-kids'),nb('সহকারী|Assistant','t-ai'),nb('প্রোফাইল|Profile','t-me'),nb('হোম|Home','t-home-d','.sj-side__item'),nb('শিশুরা|Children','t-kids','.sj-side__item'),nb('সহকারী|Assistant','t-ai','.sj-side__item'),nb('প্রোফাইল|Profile','t-me','.sj-side__item'),[{s:'.sj-src'},'t-child']];
const SN=[nb('হোম|Home','sp-home'),nb('রোগী|Patients','sp-pts'),nb('সহকারী|Assistant','sp-ai'),nb('প্রোফাইল|Profile','sp-me'),[{s:'.sj-src'},'sp-chat']];
const SND=[nb('হোম|Home','sp-home-d','.sj-side__item'),nb('রোগীরা|Patients','sp-pts-d','.sj-side__item'),nb('অনুরোধ|Requests','sp-req-d','.sj-side__item'),nb('প্রোফাইল|Profile','sp-me-d','.sj-side__item'),[{s:'.sj-src'},'sp-chat-d']];
const R={
/* 1 · entry (bn + en) */
splash:{l:'০১ · স্প্ল্যাশ',g:'entry',en:1,r:OB('ObSplash'),links:[['শুরু করুন|Get started','role'],['লগ ইন করুন|Log in','login']]},
role:{l:'০২ · ভূমিকা বাছাই',g:'entry',en:1,r:OB('ObRole'),back:'splash',links:[['এখানে লগ ইন করুন|Log in here','login-sp'],['এগিয়ে যান|Continue',root=>/শিক্ষক|teacher/i.test(root.querySelector('.sj-choice--selected')?.textContent||'')?'login-t':'login']]},
'su-parent':{l:'০৩ক · সাইন আপ — অভিভাবক',g:'entry',en:1,r:OB('ObSignUp',{role:'parent'}),back:'role',links:[['অ্যাকাউন্ট খুলুন|Create account','home'],['লগ ইন করুন|Log in','login']]},
'su-teacher':{l:'০৩খ · সাইন আপ — শিক্ষক',g:'entry',en:1,r:OB('ObSignUp',{role:'teacher'}),back:'role',links:[['অ্যাকাউন্ট খুলুন|Create account','t-empty'],['লগ ইন করুন|Log in','login-t']]},
login:{l:'০৪ক · লগ ইন',g:'entry',en:1,r:OB('ObLogIn'),back:'splash',links:[['অ্যাকাউন্ট খুলুন|Create account','su-parent'],['ভুলে গেছেন|Forgot','npw'],[{s:'.sj-card--calm'},'npw'],['লগ ইন করুন|Log in','home']]},
'login-sp':{l:'০৪ক · লগ ইন — বিশেষজ্ঞ',g:'entry',en:1,r:OB('ObLogIn'),back:'role',links:[['অ্যাকাউন্ট খুলুন|Create account','su-parent'],['ভুলে গেছেন|Forgot','npw'],[{s:'.sj-card--calm'},'npw'],['লগ ইন করুন|Log in','npw']]},
npw:{l:'০৪খ · নতুন পাসওয়ার্ড',g:'entry',en:1,r:OB('ObNewPassword'),back:'login-sp',links:[['সেভ করে এগিয়ে যান|Save and continue','sp-home']]},

/* 2 · screening (bn) */
home:{l:'০১ক · অভিভাবকের হোম',g:'scr',r:()=>P('HomeScreening'),links:[[{s:'.sf-hero'},'details'],[{s:'.sf-add'},'w1'],[{s:'.sf-row',t:'অসম্পূর্ণ'},'q1'],[{s:'.sf-row'},'result']]},
's-comp':{l:'০১খ · হোম — শুধু সহযাত্রী',g:'scr',r:()=>P('HomeCompanion'),links:[[{s:'.sj-card'},'b1'],[{s:'.sf-add'},'w1'],[{s:'.sf-row'},'details']]},
's-both':{l:'০১গ · হোম — দুটোই',g:'scr',r:()=>P('HomeBoth'),links:[[{s:'.sf-hero'},'details'],[{s:'.sf-row'},'result'],[{s:'.sj-card'},'b1']]},
details:{l:'০২ · শিশুর তথ্য',g:'scr',r:()=>P('Details'),back:'home',close:'home',links:[['এগিয়ে যান','consent']]},
consent:{l:'০৩ · সম্মতি',g:'scr',r:()=>P('Consent'),back:'details',close:'home',links:[['রাজি, এগিয়ে যান','q1']]},
q1:{l:'০৪ক · প্রশ্ন — উত্তর বাছাই',g:'scr',r:()=>P('Question'),back:'consent',links:[['পরের প্রশ্ন','q2'],['থামুন','home']]},
q2:{l:'০৪খ · প্রশ্ন — অন্য কিছু',g:'scr',r:()=>P('QuestionOther'),back:'q1',links:[['পরের প্রশ্ন','q3'],['থামুন','home']]},
q3:{l:'০৪গ · প্রশ্ন — AI নিশ্চিতকরণ',g:'scr',r:()=>P('QuestionAI'),back:'q2',links:[['হ্যাঁ, ঠিক আছে','part2'],['পরের প্রশ্ন','part2'],['বদলে দিন','q2'],['লেখা বদলান','q2'],['থামুন','home']]},
part2:{l:'০৫ · দ্বিতীয় ভাগ: খেলা',g:'scr',r:()=>P('Part2'),back:'q3',close:'home',links:[['ক্যামেরা ঠিক করে নিই','setup']]},
setup:{l:'০৬ · ক্যামেরা প্রস্তুতি',g:'scr',r:()=>P('Setup'),back:'part2',close:'home',links:[['আবার দেখুন','cal'],['এভাবেই চালিয়ে যান','cal']]},
cal:{l:'০৭ · ক্যালিব্রেশন',g:'scr',r:()=>C('Calibration'),tap:'name-wait'},
'name-wait':{l:'০৮ক · নাম ধরে ডাকা — অপেক্ষা',g:'scr',r:()=>C('NameWait'),tap:'name-call',links:[['বাদ দিন','point-how'],['কিছু ভুল হয়েছে','setup']]},
'name-call':{l:'০৮খ · নাম ধরে ডাকা — এখন ডাকুন',g:'scr',r:()=>C('NameCall'),tap:'point-how',links:[['বাদ দিন','point-how'],['কিছু ভুল হয়েছে','setup']]},
'point-how':{l:'০৯ক · যেখানে দেখাই — কীভাবে',g:'scr',r:()=>P('PointChoice'),back:'name-call',close:'home',links:[['শুরু করুন','point-stim']]},
'point-stim':{l:'০৯খ · যেখানে দেখাই — নৌকা',g:'scr',r:()=>C('PointStim'),tap:'copy-demo'},
'copy-demo':{l:'১০ক · আমার মতো করো — তালি',g:'scr',r:()=>C('CopyDemo'),tap:'copy-turn'},
'copy-turn':{l:'১০খ · আমার মতো করো — রাফির পালা',g:'scr',r:()=>C('CopyTurn'),tap:'freeplay'},
look:{l:'১১ · দেখো আর তাকাও (ঐচ্ছিক)',g:'scr',r:()=>C('LookWatch'),tap:'freeplay'},
freeplay:{l:'১২ · ফ্রি প্লে',g:'scr',r:()=>P('FreePlay'),back:'copy-turn',close:'home',links:[['আগেই শেষ করুন','analysing']]},
analysing:{l:'১৩ · বিশ্লেষণ হচ্ছে',g:'scr',r:()=>C('Analysing'),tap:'result'},
result:{l:'R3 · ফলাফল — বাড়তি ঝুঁকি',g:'scr',r:()=>C('ResultScreen',{level:'elevated'}),back:'home'},
'result-low':{l:'R1 · ফলাফল — কম',g:'scr',r:()=>C('ResultScreen',{level:'low'}),back:'home'},
'result-mod':{l:'R2 · ফলাফল — মাঝারি',g:'scr',r:()=>C('ResultScreen',{level:'moderate'}),back:'home'},
'result-high':{l:'R4 · ফলাফল — উচ্চ',g:'scr',r:()=>C('ResultScreen',{level:'high'}),back:'home'},
share:{l:'S1 · শেয়ার শিট',g:'scr',r:()=>C('ShareSheet'),back:'result',close:'result',links:[['ডাক্তারের রিপোর্ট','dr-report'],['অভিভাবকের সারাংশ','p-report'],['লিংক এখনই বন্ধ','share-off'],['কপি','share-qr'],['QR দেখান','share-qr'],['WhatsApp','share-qr'],['শেয়ার করুন','share']]},
'share-qr':{l:'S2 · QR + কপি হয়েছে',g:'scr',r:()=>C('ShareQR'),back:'result',close:'share',links:[['QR ছবি সেভ','share'],['শেয়ার করুন','share']]},
'share-off':{l:'S3 · লিংক বন্ধ হয়েছে',g:'scr',r:()=>C('ShareRevoked'),back:'result',close:'result',links:[['নতুন লিংক','share'],['শেয়ার করুন','share']]},
'r-chat':{l:'C1 · ফলাফল নিয়ে চ্যাট',g:'scr',r:()=>C('ResultsChat'),back:'result',fb:'result',links:[['ডাক্তারকে কী জিজ্ঞেস','specialists'],['বাসায় কী খেলা','ac-actions'],['আবার কবে স্ক্রিনিং','details'],['রিপোর্ট: এর মানে কী','result'],['খেলা: নাম ধরে ডাকা','result'],[{s:'.rs-input'},'r-chat']]},
specialists:{l:'N1 · কাছের বিশেষজ্ঞ',g:'scr',r:()=>C('Specialists'),back:'result',links:[['বদলান','loc-off'],['ফিল্টার','loc-off'],['আমার অবস্থান','loc-off'],['রিপোর্ট পাঠান','share'],['কল করুন','specialists'],['পথ দেখুন','spec-desk']]},
'loc-off':{l:'N2 · লোকেশন বন্ধ',g:'scr',r:()=>C('LocationOff'),back:'specialists',fb:'specialists'},
'spec-desk':{l:'N3 · বিশেষজ্ঞ — ডেস্কটপ',g:'scr',k:'desk',r:()=>C('SpecialistsDesktop'),back:'specialists',fb:'specialists'},
'p-report':{l:'P1 · অভিভাবকের রিপোর্ট',g:'scr',k:'doc',src:'Parent Report.html',title:'অভিভাবকের রিপোর্ট',back:inStack('result')},
'dr-report':{l:'P2 · ডাক্তারের রিপোর্ট',g:'scr',k:'doc',src:'Doctor Report.html',title:'ডাক্তারের রিপোর্ট',back:inStack('result')},
'st-k1':{l:'K1 · ক্যামেরার অনুমতির আগে',g:'scr',en:1,r:AC('StCamAsk'),back:'part2',links:[['ক্যামেরা চালু করুন|Turn on camera','setup'],['পরে করব|Maybe later','part2']]},
'st-k2':{l:'K2 · ক্যামেরার অনুমতি বন্ধ',g:'scr',en:1,r:AC('StCamDenied'),back:'part2',links:[['সেটিংস খুলুন|Open settings','st-k1'],['আবার চেষ্টা|Try again','setup'],['খেলা ছাড়াই|without the games','result']]},
'st-k3':{l:'K3 · ক্যামেরা চালু হচ্ছে না',g:'scr',en:1,r:AC('StCamFail'),back:'part2',links:[['আবার চেষ্টা|Try again','setup'],['পরে করব|Maybe later','part2']]},

/* 3 · companion (bn) */
w1:{l:'W1 · শিশুর তথ্য',g:'cmp',r:()=>C('W1'),back:'home',close:'home',links:[['পরবর্তী','w2']]},
w2:{l:'W2 · রোগনির্ণয়',g:'cmp',r:()=>C('W2'),back:'w1',close:'home',links:[['পরবর্তী','w3a'],['পরে যোগ করব','w3a'],[{s:'.cm-pick'},'doc-pick']]},
w3a:{l:'W3 · বৈশিষ্ট্য — ১০টি অংশ',g:'cmp',r:()=>C('W3a'),back:'w2',close:'home',links:[['চালিয়ে যান','w3c'],[{s:'.cm-li'},'w3b']]},
w3b:{l:'W3.1 · অংশ ১ · যোগাযোগ',g:'cmp',r:()=>C('W3b'),back:'w3a',close:'home',links:[['পরবর্তী অংশ','w3c'],['বাদ দিন','w3c']]},
w3c:{l:'W3.4 · অংশ ৪ · “অন্য” খোলা',g:'cmp',r:()=>C('W3c'),back:'w3b',close:'home',links:[['পরবর্তী অংশ','w4'],['বাদ দিন','w4']]},
w4:{l:'W4 · কেয়ার টিম + আইডি',g:'cmp',r:()=>C('W4'),back:'w3c',close:'home',links:[['শেষ করুন','w5'],['পরে যোগ করব','w5'],['কপি',null],['শেয়ার','w4qr'],['QR','w4qr'],['আমন্ত্রণ','w4qr'],['দেখুন','b6']]},
w4qr:{l:'W4b · QR শিট',g:'cmp',r:()=>C('W4qr'),back:'w4',close:'w4',fb:'w4'},
w5:{l:'W5 · প্রোফাইল তৈরি হয়েছে',g:'cmp',r:()=>C('W5'),links:[['রাফির হোম দেখুন','b1'],['প্রথম লগ লিখুন','q-log1']]},
'c-home':{l:'H1 · সহযাত্রী হোম',g:'cmp',r:()=>C('Home'),links:[[{s:'.cm-body > .sj-card'},'b1'],['সব দেখুন','reminders'],[{s:'.cm-mini-act'},'activity'],[{s:'.cm-body .sj-card'},'reminders']]},
'q-log1':{l:'Q1 · দ্রুত লগ · বিষয়',g:'qlog',r:()=>C('LogSheet',{step:1}),close:'EXIT',back:'EXIT',links:[['পরবর্তী','q-log2']]},
'q-log2':{l:'Q2 · দ্রুত লগ · রেটিং ও নোট',g:'qlog',r:()=>C('LogSheet',{step:2}),close:'EXIT',back:'q-log1',links:[['সেভ করুন','q-saved']]},
'q-saved':{l:'Q3 · লগ সেভ হয়েছে',g:'cmp',r:()=>C('LogSaved'),close:'c-home',links:[['ফিরিয়ে নিন','q-log2'],[{s:'.cm-body > .sj-card'},'b1'],['সব দেখুন','reminders'],[{s:'.cm-mini-act'},'activity'],[{s:'.cm-body .sj-card'},'reminders']]},
reminders:{l:'R1 · রিমাইন্ডার সেন্টার',g:'cmp',r:()=>C('Reminders'),fb:'reminders',links:[['যোগ করুন','reminders'],['ক্যালেন্ডার','b4']]},
activity:{l:'A1 · অ্যাক্টিভিটি বিস্তারিত',g:'cmp',r:()=>C('ActivityDetail'),links:[['করেছি','activity-done'],['পরে করব','BACK'],['কেয়ার প্ল্যান','b4'],['ভাষার লগ','b2'],['সেভ করুন','activity']]},
'activity-done':{l:'A2 · করেছি',g:'cmp',r:()=>C('ActivityDone'),back:'activity',links:[['সেভ করুন','b2'],['শুধু শেষ','c-home']]},
'doc-pick':{l:'D1 · ডকুমেন্ট — ধরন ও উৎস',g:'cmp',r:()=>C('DocPick'),close:'BACK',links:[[{s:'.cm-li'},'doc-reading']]},
'doc-reading':{l:'D2 · পড়া হচ্ছে',g:'cmp',r:()=>C('DocReading'),back:'doc-pick',tap:'doc-review'},
'doc-review':{l:'D3 · মিলিয়ে দেখুন',g:'cmp',r:()=>C('DocReview'),back:'doc-pick',links:[['নিশ্চিত করুন','b5'],['শুধু ছবি','b5'],['আবার পড়ুন','doc-reading'],['বড় করুন','doc-review'],['সম্পাদনা','doc-review']]},
chat:{l:'C1 · সহযাত্রী AI চ্যাট',g:'cmp',r:()=>C('Chat'),links:[['স্ট্যাটাস রিপোর্ট','rep-sheet'],['এই সপ্তাহে কী বদলেছে','ac-convo'],['নোট বুঝিয়ে দিন','explain'],[{s:'.cm-mini-act'},'activity'],['ভয়েস','ac-voice'],['যোগ করুন','reminders'],['সম্পাদনা','reminders'],['বাদ দিন','chat'],['ঘুমের লগ','b2'],['প্রেসক্রিপশন','b5'],['গাইড','b4']]},
'rep-sheet':{l:'C2 · স্ট্যাটাস রিপোর্ট তৈরি',g:'cmp',r:()=>C('ReportSheet'),back:'chat',close:'chat',links:[['রিপোর্ট তৈরি করুন','status-report']]},
'status-report':{l:'C3 · স্ট্যাটাস রিপোর্ট',g:'cmp',r:()=>C('StatusReport'),back:'chat',links:[['পাঠান','chat'],['PDF','rep-page'],['শেয়ার করুন','rep-page'],[{s:'.sj-src',t:'লগ'},'b2'],['থেরাপি নোট','b5']]},
'rep-page':{l:'R3 · পুরো রিপোর্ট পাতা',g:'ai',k:'desk',w:900,en:1,r:AC('PrintReport'),links:[['প্রিন্ট|Print','rep-page'],['শেয়ার|Share','b6']]},
b1:{l:'B1 · ড্যাশবোর্ড — ওভারভিউ',g:'desk',k:'desk',r:()=>C('Overview'),links:[['এ নিয়ে প্রশ্ন করুন','b7'],['কিছু ভুল আছে','b2'],[{s:'a.asd',t:'টাইমলাইন'},'b2'],[{s:'a.asd',t:'সব'},'b4'],['রিপোর্ট আগে পাঠান','rep-page'],['জিজ্ঞেস করুন','b7'],[{s:'.sj-src',t:'লগ'},'b2'],['স্কুল নোট','b2'],['প্রেসক্রিপশন','b5'],[{s:'.cm-chg'},'b2'],[{s:'.cm-goal'},'b4']]},
b2:{l:'B2 · ড্যাশবোর্ড — টাইমলাইন',g:'desk',k:'desk',r:()=>C('Timeline'),links:[['সহজ করে বুঝিয়ে দিন','explain'],['মূল লেখা দেখুন',null],['নাসরিন আপার নোট','explain']]},
b3:{l:'B3 · ড্যাশবোর্ড — অগ্রগতি',g:'desk',k:'desk',r:()=>C('Progress'),links:[[{s:'.cm-goal'},'b4']]},
b4:{l:'B4 · ড্যাশবোর্ড — কেয়ার প্ল্যান',g:'desk',k:'desk',r:()=>C('CarePlan'),links:[[{s:'.cm-li'},'activity'],['পরিবর্তনের প্রস্তাব','b7'],['প্রেসক্রিপশন','b5']]},
b5:{l:'B5 · ড্যাশবোর্ড — ডকুমেন্ট',g:'desk',k:'desk',r:()=>C('Documents'),links:[['ডকুমেন্ট যোগ করুন','doc-pick'],['যুক্ত করুন','dr-report'],['এখন না','b5'],[{s:'.cm-pick'},null],[{s:'tbody tr'},'doc-review']]},
b6:{l:'B6 · ড্যাশবোর্ড — কেয়ার টিম',g:'desk',k:'desk',r:()=>C('CmCareTeam'),links:[['অনুমোদন দিন','b6'],['ফিরিয়ে দিন','b6'],['আইডি শেয়ার','w4qr'],['অনুমতি বদলান','b6']]},
b7:{l:'B7 · ড্যাশবোর্ড — চ্যাট',g:'desk',k:'desk',r:()=>C('DeskChat'),links:[['স্ট্যাটাস রিপোর্ট','rep-page'],['এই সপ্তাহে কী বদলেছে','ac-convo'],['নোট বুঝিয়ে দিন','explain'],['পাঠান','ac-convo'],['ভয়েস','ac-voice'],[{s:'.cm-mini-act'},'activity'],['যোগ করুন','reminders'],['সম্পাদনা','reminders'],['বাদ দিন','b7'],['ঘুমের লগ','b2'],['প্রেসক্রিপশন','b5'],['গাইড','b4']]},

/* 4 · AI assistant (bn + en) */
'm-home':{l:'E1 · অভিভাবকের হোম (AI প্রবেশপথ)',g:'ai',en:1,r:AC('MHome'),links:[[{s:'.cm-rep'},'m-overview']]},
'm-overview':{l:'E2 · রাফি · ওভারভিউ (মোবাইল)',g:'ai',en:1,r:AC('MOverview'),back:'m-home',links:[[{s:'.sj-tab',t:'টাইমলাইন|Timeline'},'b2'],[{s:'.sj-tab',t:'অগ্রগতি|Progress'},'b3'],[{s:'.sj-tab',t:'চ্যাট|Chat'},'ac-empty'],[{s:'.sj-tab'},'m-overview']]},
'ac-empty':{l:'C1 · AI — খালি অবস্থা',g:'ai',en:1,r:AC('Empty'),links:[['খেলতে পারি|play','ac-actions'],['কথা বলায়|talking','ac-convo'],['ঘুমের|sleep','ac-convo'],['ডাক্তার দেখানো|doctor visit','ac-thinking'],['রিপোর্ট দাও|status report','ac-repsetup']]},
'ac-voice':{l:'C1b · AI — ভয়েসে বলা',g:'ai',en:1,r:AC('Empty',{rec:true}),links:[['ভয়েসে বলুন|Voice input','ac-convo'],['খেলতে পারি|play','ac-actions'],['কথা বলায়|talking','ac-convo'],['ঘুমের|sleep','ac-convo'],['ডাক্তার দেখানো|doctor visit','ac-thinking'],['রিপোর্ট দাও|status report','ac-repsetup']]},
'ac-convo':{l:'C2 · AI — কথোপকথন',g:'ai',en:1,r:AC('Convo'),close:null,links:[['শিক্ষিকার নোট|Teacher’s note',null],['বন্ধ করুন|Close',null],['টাইমলাইনে দেখুন|View in timeline','b2'],['অভিভাবকের লগ|parent logs','b2'],['ডা. তানভীরের নোট|Dr. Tanvir','explain'],['থামান|Stop','ac-actions']]},
'ac-source':{l:'C3 · AI — সূত্র খোলা',g:'ai',en:1,r:AC('Convo',{sheet:true}),close:null,links:[['শিক্ষিকার নোট|Teacher’s note',null],['বন্ধ করুন|Close',null],['টাইমলাইনে দেখুন|View in timeline','b2'],['অভিভাবকের লগ|parent logs','b2'],['ডা. তানভীরের নোট|Dr. Tanvir','explain'],['থামান|Stop','ac-actions']]},
'ac-thinking':{l:'C4 · AI — রেকর্ড দেখছে',g:'ai',en:1,r:AC('Thinking'),tap:'b1'},
'ac-actions':{l:'C5 · AI — প্রস্তাবিত কাজ',g:'ai',en:1,r:AC('Actions'),links:[['পরিকল্পনায় যোগ করুন|Add to plan','b4'],['লগ করুন|Log it','b2'],['নিশ্চিত করুন|Confirm','reminders'],['সম্পাদনা|Edit','reminders'],['বাদ দিন|Dismiss','ac-actions'],['কেয়ার প্ল্যান|Care plan','b4'],['শিক্ষিকার নোট|Teacher','b2']]},
explain:{l:'C6 · নোট সহজ করে বুঝিয়ে দিন',g:'ai',en:1,r:AC('ExplainS'),links:[['অ্যাপয়েন্টমেন্ট|appointment','b1'],['ডা. তানভীরের নোট|Dr. Tanvir','b2']]},
'ac-repsetup':{l:'R1 · রিপোর্ট — কার জন্য, কতদিন',g:'ai',en:1,r:AC('RepSetupS'),links:[['রিপোর্ট তৈরি করুন|Create report','ac-repcard'],[{s:'.cm-pick'},null]]},
'ac-repcard':{l:'R2 · রিপোর্ট কার্ড',g:'ai',en:1,r:AC('RepCardS'),links:[['পুরো পাতা খুলুন|Open full page','rep-page'],['কেয়ার টিমকে পাঠান|Share with care team','b6'],[{s:'.sj-src',t:'লগ|logs'},'b2'],['থেরাপি নোট|therapy','b5'],['প্রেসক্রিপশন|Prescription','b5']]},
'ac-urgent':{l:'S1 · জরুরি (৯৯৯)',g:'ai',en:1,r:AC('UrgentS'),links:[['৯৯৯|999',null],['কল করুন|Call',null],[{s:'.ac-field'},'ac-urgent']]},
'ac-idk':{l:'S2 · তথ্য নেই',g:'ai',en:1,r:AC('Idk'),links:[['অ্যাপয়েন্টমেন্ট|appointment','b1'],['জিজ্ঞেস করুন|Ask','b7']]},
'ac-med':{l:'S3 · ওষুধের প্রশ্ন',g:'ai',en:1,r:AC('Med'),links:[['বার্তা|Message','b6'],['লগ করুন|Log the','q-log1']]},
'ac-history':{l:'H1 · আগের কথোপকথন',g:'ai',en:1,r:AC('History'),links:[[{s:'.ac-hi',t:'রিপোর্ট|Report'},'ac-repcard'],[{s:'.ac-hi',t:'ডাক্তারের নোট|doctor'},'explain'],[{s:'.ac-hi'},'ac-convo'],['নতুন|New','ac-empty'],[{s:'.ac-hsearch'},'ac-history']]},
'ac-offline':{l:'X1 · ইন্টারনেট নেই',g:'ai',en:1,r:AC('Offline'),tap:'ac-convo'},
'ac-aidown':{l:'X2 · সহযাত্রী AI অনুপলব্ধ',g:'ai',en:1,r:AC('AIDown'),links:[['আবার চেষ্টা|Try again','ac-convo'],['টাইমলাইন দেখুন|View timeline','b2']]},
'ac-d1':{l:'D1 · AI চ্যাট — ডেস্কটপ',g:'ai',k:'desk',en:1,r:AC('DeskChatA'),links:[['নিশ্চিত করুন|Confirm','reminders'],['লগ করুন|Log it','b2']]},
'ac-d2':{l:'D2 · AI চ্যাট খালি — ডেস্কটপ',g:'ai',k:'desk',en:1,r:AC('DeskEmptyA'),links:[[{s:'.ac-sq'},'ac-d1']]},
'ac-d3':{l:'D3 · ওভারভিউ + AI বোতাম — ডেস্কটপ',g:'ai',k:'desk',en:1,r:AC('DeskOverviewA'),links:[[{s:'.ac-fab'},'ac-d2']]},

/* 5 · teacher & specialist dashboards (bn + en) */
'login-t':{l:'T0 · লগ ইন — শিক্ষক',g:'tch',en:1,r:OB('ObLogIn'),back:'role',links:[['অ্যাকাউন্ট খুলুন|Create account','su-teacher'],['ভুলে গেছেন|Forgot','login-t'],[{s:'.sj-card--calm'},'login-sp'],['লগ ইন করুন|Log in','t-home']]},
't-home':{l:'T1 · শিক্ষকের হোম',g:'tch',en:1,r:l=>C('TeacherHome',{l}),links:TN},
't-home-d':{l:'T1d · শিক্ষকের হোম — ডেস্কটপ',g:'tch',en:1,rw:['TeacherHomeD','TeacherHome'],links:TN},
't-kids':{l:'T2 · আমার শিশুরা',g:'tch',en:1,r:l=>C('KidsM',{role:'teacher',l}),links:TN},
't-child':{l:'T3 · শিশুর প্রোফাইল (শিক্ষা)',g:'tch',en:1,r:l=>C('ProfileM',{role:'teacher',l}),back:skipBack(['t-note','t-chat','t-report','t-child'],'t-home'),links:[[{s:'.sj-src'},'t-chat'],...TN]},
't-note':{l:'T4 · ক্লাসের নোট যোগ',g:'tch',en:1,r:l=>C('NoteM',{role:'teacher',l}),links:TN},
't-chat':{l:'T5 · AI-কে জিজ্ঞেস (শিক্ষক)',g:'tch',en:1,r:l=>C('ChatM',{role:'teacher',l}),links:[['নোট হিসেবে যোগ করুন|Add as note','t-note'],['সম্পাদনা|Edit','t-note'],...TN]},
't-report':{l:'T6 · স্ট্যাটাস রিপোর্ট — শিক্ষকের জন্য',g:'tch',en:1,r:l=>C('ReportM',{role:'teacher',l}),links:TN},
't-ai':{l:'T7 · সহকারী — শিশু বাছাই',g:'tch',en:1,r:l=>C('AiPick',{role:'teacher',l}),links:TN},
't-me':{l:'T8 · শিক্ষকের প্রোফাইল',g:'tch',en:1,r:l=>C('MeM',{role:'teacher',l}),links:TN},
't-empty':{l:'T9 · খালি — এখনো শিশু নেই',g:'tch',en:1,r:l=>C('EmptyM',{role:'teacher',l}),links:TN},
't-loading':{l:'T10 · প্রোফাইল লোড হচ্ছে',g:'tch',en:1,r:l=>C('LoadingM',{role:'teacher',l}),tap:'t-child'},
'sp-home':{l:'S1 · বিশেষজ্ঞের হোম',g:'spc',en:1,r:l=>C('SpHomeM',{l}),links:SN},
'sp-pts':{l:'S2 · আমার রোগী',g:'spc',en:1,r:l=>C('KidsM',{role:'specialist',l}),links:SN},
'sp-child':{l:'S3 · রোগীর প্রোফাইল (ক্লিনিক্যাল)',g:'spc',en:1,r:l=>C('ProfileM',{role:'specialist',l}),back:skipBack(['sp-note','sp-chat','sp-report','sp-child'],'sp-home'),links:[[{s:'.sj-src'},'sp-chat'],...SN]},
'sp-note':{l:'S4 · ক্লিনিক্যাল নোট যোগ',g:'spc',en:1,r:l=>C('NoteM',{role:'specialist',l}),links:SN},
'sp-chat':{l:'S5 · AI-কে জিজ্ঞেস (বিশেষজ্ঞ)',g:'spc',en:1,r:l=>C('ChatM',{role:'specialist',l}),links:SN},
'sp-report':{l:'S6 · স্ট্যাটাস রিপোর্ট — ডাক্তারের জন্য',g:'spc',en:1,r:l=>C('ReportM',{role:'specialist',l}),links:SN},
'sp-ai':{l:'S7 · সহকারী — রোগী বাছাই',g:'spc',en:1,r:l=>C('AiPick',{role:'specialist',l}),links:SN},
'sp-me':{l:'S8 · বিশেষজ্ঞের প্রোফাইল',g:'spc',en:1,r:l=>C('MeM',{role:'specialist',l}),links:SN},
'sp-empty':{l:'S9 · খালি — এখনো রোগী নেই',g:'spc',en:1,r:l=>C('EmptyM',{role:'specialist',l}),links:SN},
'sp-loading':{l:'S10 · প্রোফাইল লোড হচ্ছে',g:'spc',en:1,r:l=>C('LoadingM',{role:'specialist',l}),tap:'sp-child'},
'sp-home-d':{l:'S1d · বিশেষজ্ঞের হোম — ডেস্কটপ',g:'spc',en:1,k:'desk',r:l=>C('SpHomeD',{l}),links:SND},
'sp-pts-d':{l:'S2d · রোগীর তালিকা — ডেস্কটপ',g:'spc',en:1,k:'desk',r:l=>C('SpHomeD',{l,pts:1}),links:SND},
'sp-child-d':{l:'S3d · প্রোফাইল — ডেস্কটপ',g:'spc',en:1,k:'desk',r:l=>C('SpChildD',{l}),back:skipBack(['sp-note-d','sp-chat-d','sp-report-d','sp-child-d'],'sp-home-d'),links:[[{s:'.sj-src'},'sp-chat-d'],...SND]},
'sp-note-d':{l:'S4d · ক্লিনিক্যাল নোট — ডেস্কটপ',g:'spc',en:1,k:'desk',r:l=>C('SpNoteD',{l}),links:SND},
'sp-chat-d':{l:'S5d · AI চ্যাট — ডেস্কটপ',g:'spc',en:1,k:'desk',r:l=>C('SpChatD',{l}),links:SND},
'sp-report-d':{l:'S6d · স্ট্যাটাস রিপোর্ট — ডেস্কটপ',g:'spc',en:1,k:'desk',w:900,r:l=>C('SpReportD',{l}),links:SND},
'sp-req-d':{l:'S7d · অ্যাক্সেসের অনুরোধ — ডেস্কটপ',g:'spc',en:1,k:'desk',r:l=>C('SpReqD',{l}),links:SND},
'sp-me-d':{l:'S8d · প্রোফাইল — ডেস্কটপ',g:'spc',en:1,k:'desk',r:l=>C('SpMeD',{l}),links:SND},
'sp-empty-d':{l:'S9d · খালি — ডেস্কটপ',g:'spc',en:1,k:'desk',r:l=>C('SpEmptyD',{l}),links:SND},
'sp-loading-d':{l:'S10d · লোড হচ্ছে — ডেস্কটপ',g:'spc',en:1,k:'desk',r:l=>C('SpLoadingD',{l}),tap:'sp-home-d'},
'dr-report-sp':{l:'P2 · স্ক্রিনিং রিপোর্ট (বিশেষজ্ঞ)',g:'spc',k:'doc',src:'Doctor Report.html',title:'স্ক্রিনিং রিপোর্ট',back:'pop'},

/* 6 · states (bn + en) */
'st-ch1':{l:'CH1 · থ্রেড লোড হচ্ছে',g:'st',en:1,r:AC('StChatLoading'),tap:'ac-convo'},
'st-ch2':{l:'CH2 · ইতিহাস খালি',g:'st',en:1,r:AC('StHistEmpty'),links:[['জিজ্ঞেস করুন|Ask','ac-empty']]},
'st-ch3':{l:'CH3 · ইতিহাস ত্রুটি',g:'st',en:1,r:AC('StHistError'),links:[['আবার চেষ্টা|Try again','ac-history']]},
map:{l:'ডেমো ম্যাপ',g:'map',r:()=>C('ProtoMap'),back:'splash'}
};
const narrow=()=>innerWidth<768;const mk=(x,l)=>Array.isArray(x)?C(x[0],{...x[1],l}):C(x,{l});
Object.keys(R).forEach(id=>{const S=R[id];if(!S.rw)return;const [d,m]=S.rw;S.r=l=>narrow()?mk(m,l):mk(d,l);Object.defineProperty(S,'k',{get(){return narrow()?undefined:'desk';},configurable:true});});
['result','result-low','result-mod','result-high'].forEach(k=>R[k].links=[['ডাক্তারকে রিপোর্ট দিন','dr-report'],['কাছের বিশেষজ্ঞ','specialists'],['ফলাফল নিয়ে প্রশ্ন','r-chat'],['শেয়ার করুন','share'],['আবার করুন','setup'],[{s:'.rs-foot'},'p-report'],[{s:'.rs-body > .sj-card'},'p-report']]);
const LIST_GO={tl:['q-log1','b2'],dc:['doc-pick','b5'],rm:['reminders','reminders'],sp:['specialists','specialists'],sh:['details','home']};
const KN={empty:'খালি',loading:'লোড হচ্ছে',error:'ত্রুটি'};
(window.StLISTS||[]).forEach(c=>['empty','loading','error'].forEach((k,j)=>{
  R['st-'+c.id+'-'+k]={l:c.id.toUpperCase()+(j+1)+' · '+c.name[0]+' — '+KN[k],g:'st',en:1,r:l=>C('StListState',{lang:l,cfg:c,kind:k}),
    tap:k==='loading'?LIST_GO[c.id][1]:undefined,
    links:[['আবার চেষ্টা|Try again',LIST_GO[c.id][1]],[{s:'.sj-btn'},LIST_GO[c.id][0]]]};
}));

const G=[
 [{s:'.sj-bnav__item',t:'হোম|Home'},homeFor],[{s:'.sj-bnav__item',t:'রাফি|Rafi'},'m-overview'],[{s:'.sj-bnav__item',t:'Chat'},'ac-empty'],[{s:'.sj-bnav__item',t:'চ্যাট'},'chat'],
 [{s:'.sj-bnav__item',t:'রিমাইন্ডার|Reminders'},'reminders'],[{s:'.sj-bnav__item',t:'স্ক্রিনিং'},'home'],[{s:'.sj-bnav__item',t:'সহযাত্রী'},'s-comp'],[{s:'.sj-bnav__item',t:'প্রোফাইল'},'home'],
 [{s:'.sj-side__item',t:'হোম|Home'},'c-home'],[{s:'.sj-side__item',t:'রাফি|Rafi'},'b1'],[{s:'.sj-side__item',t:'রিমাইন্ডার|Reminders'},'reminders'],[{s:'.sj-side__item',t:'অ্যাক্টিভিটি|Activities'},'activity'],[{s:'.sj-side__item',t:'সেটিংস|Settings'},'b6'],
 [{s:'.cm-dtabs .sj-tab',t:'ওভারভিউ|Overview'},'b1'],[{s:'.cm-dtabs .sj-tab',t:'টাইমলাইন|Timeline'},'b2'],[{s:'.cm-dtabs .sj-tab',t:'অগ্রগতি|Progress'},'b3'],[{s:'.cm-dtabs .sj-tab',t:'কেয়ার প্ল্যান|Care plan'},'b4'],[{s:'.cm-dtabs .sj-tab',t:'ডকুমেন্ট|Documents'},'b5'],[{s:'.cm-dtabs .sj-tab',t:'কেয়ার টিম|Care team'},'b6'],[{s:'.cm-dtabs .sj-tab',t:'চ্যাট|Chat'},'b7'],
 [{s:'.sf-ghost-ic'},'part2'],
 ['ফিরে যান|Back|আগের প্রশ্ন|চ্যাটে ফিরুন','BACK'],
 ['বন্ধ করুন|Close','CLOSE'],
 [{s:'.ac-field,.cm-input'},'ac-urgent'],
 ['আগের কথোপকথন|Past conversations','ac-history'],['নতুন কথোপকথন|New conversation','ac-empty'],
 ['ভয়েসে বলুন|Voice input','ac-voice'],
 ['দ্রুত লগ','q-log1'],['লগ লিখুন','q-log1'],
 ['স্ট্যাটাস রিপোর্ট|Status report','rep-page'],
 [{s:'.ac-fab'},'ac-empty'],
 ['ছবি যোগ করুন|Attach','doc-pick'],['ফাইল যোগ','doc-pick'],
 ['রিমাইন্ডার|Reminders','reminders']
];

const FLOWS=[
 {t:'১ · প্রবেশ',e:'Entry',ic:'log-in',start:'splash',ids:['splash','role','su-parent','su-teacher','login','home']},
 {t:'২ · স্ক্রিনিং',e:'Screening',ic:'clipboard-list',start:'home',ids:['home','details','consent','q1','q2','q3','part2','setup','cal','name-wait','name-call','point-how','point-stim','copy-demo','copy-turn','look','freeplay','analysing','result','p-report','dr-report','share','share-qr','share-off','r-chat','specialists','loc-off','spec-desk','result-low','result-mod','result-high','s-comp','s-both','st-k1','st-k2','st-k3']},
 {t:'৩ · সহযাত্রী',e:'Companion',ic:'heart-handshake',start:'home',ids:['w1','w2','w3a','w3b','w3c','w4','w4qr','w5','b1','b2','explain','b3','b4','b5','doc-pick','doc-reading','doc-review','b6','b7','q-log1','q-log2','q-saved','chat','rep-sheet','status-report','rep-page','ac-urgent','c-home','reminders','activity','activity-done']},
 {t:'৪ · সহযাত্রী AI',e:'Assistant',ic:'sparkles',start:'m-home',ids:['m-home','m-overview','ac-empty','ac-voice','ac-convo','ac-source','ac-thinking','ac-actions','explain','ac-repsetup','ac-repcard','ac-urgent','ac-idk','ac-med','ac-history','ac-offline','ac-aidown','ac-d1','ac-d2','ac-d3']},
 {t:'৫ · শিক্ষক ড্যাশবোর্ড',e:'Teacher dashboard',ic:'school',start:'role',ids:['role','login-t','su-teacher','t-home','t-home-d','t-kids','t-child','t-note','t-chat','t-report','t-ai','t-me','t-empty','t-loading']},
 {t:'৬ · বিশেষজ্ঞ ড্যাশবোর্ড',e:'Specialist dashboard',ic:'stethoscope',start:'sp-home',ids:['login-sp','npw','sp-home','sp-pts','sp-child','sp-note','sp-chat','sp-report','sp-ai','sp-me','sp-empty','sp-loading','dr-report-sp','sp-home-d','sp-pts-d','sp-child-d','sp-note-d','sp-chat-d','sp-report-d','sp-req-d','sp-me-d','sp-empty-d','sp-loading-d']},
 {t:'৭ · অ্যাডমিন (ডেস্কটপ)',e:'Admin',ic:'shield',start:null,note:'অ্যাডমিনের কোনো স্ক্রিন ডিজাইন করা নেই',ids:[],missing:['বিশেষজ্ঞের তালিকা','বিশেষজ্ঞ যোগ','এককালীন পাসওয়ার্ড']},
 {t:'৮ · অবস্থা (খালি · লোড · ত্রুটি)',e:'States',ic:'layers',start:'st-tl-empty',ids:Object.keys(R).filter(k=>/^st-(tl|dc|rm|sp|sh|ch)/.test(k))}
];
Object.assign(window,{PR:R,PG:G,PFLOWS:FLOWS});
})();
