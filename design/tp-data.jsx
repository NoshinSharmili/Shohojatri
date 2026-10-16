(()=>{
const tt=(l,b,e)=>l==='en'?e:b;
const dg=(l,n)=>l==='en'?String(n):bn(n);
/* team: [role, bnName, enName, bnIni, enIni] */
const TEAM_T=['teacher','নাসরিন আপা','Nasrin Apa','না','N'];
const TEAM_D=['specialist','ডা. তানভীর','Dr. Tanvir','ত','T'];
const K=[
{id:'rafi',code:'SJ-7K3QX',tone:'sky',ini:['রা','R'],name:['রাফি','Rafi'],gen:['রাফির',"Rafi's"],age:['৩ বছর ২ মাস','3 yrs 2 mo'],ageS:['৩ ব. ২ মা.','3y 2m'],
 dx:['অটিজম (ASD)','Autism (ASD)'],dxs:['ভাষা ও সামাজিক যোগাযোগে বাড়তি সহায়তা','Extra support with language and social communication'],
 newN:2,last:['শিক্ষিকার নোট · গতকাল','Teacher’s note · yesterday'],lastBy:'teacher',trend:'up',next:['১২ নভে','12 Nov'],nextD:['বুধবার, ১২ নভেম্বর · সকাল ১১:০০','Wed, 12 Nov · 11:00 am'],
 team:[['parent','সাবরিনা (মা)','Sabrina (mother)','সা','S'],TEAM_T,TEAM_D],teacher:1,spec:1,scr:['elevated',11],
 meds:[['Melatonin সিরাপ ১ মি.লি. — ঘুমের আগে','Melatonin syrup 1 ml — before sleep','ডা. তানভীর · ১৪ অক্টো','Dr. Tanvir · 14 Oct']],
 sum:[['নিজে থেকে একক শব্দে “আরও” বলছে — এই সপ্তাহে ৪ বার (আগে ১ বার)','Says “more” on his own — 4 times this week (1 before)','log','১২টি লগ','12 logs'],
  ['ক্লাসে পালা নিয়ে ব্লক খেলায় প্রায় ৩ মিনিট থাকছে','Stays ~3 min in turn-taking block play at school','report','স্কুল নোট · ১৩ অক্টো','School note · 13 Oct'],
  ['রুটিন বদলের সময় অস্থিরতা এখনো আছে, ২ মিনিটের সংকেতে কমে','Still unsettled at transitions; a 2-minute warning helps','report','শিক্ষিকার নোট','Teacher’s notes'],
  ['ঘুম দেরিতে (গড় রাত ১১:৪০) — নতুন সিরাপ শুরু হয়েছে','Late sleep (avg 11:40 pm) — new syrup started','doc','প্রেসক্রিপশন','Prescription']],
 facts:[['একক শব্দ, হাত ধরে টেনে নেওয়া, ছবি কার্ড','Single words, leading by hand, picture cards'],['হঠাৎ রুটিন বদল, জোরে ঘণ্টার শব্দ','Sudden routine changes, loud bells'],['নরম গান, শান্ত কোণ, চাপ দিয়ে জড়িয়ে ধরা','Soft songs, a quiet corner, firm hugs'],['বুদবুদ, পানি খেলা, গাড়ি সারি করে সাজানো','Bubbles, water play, lining up cars']],
 goals:[['চাওয়ার জন্য “আরও” বলা','Saying “more” to request','ভাষা','Language',70],['৩ মিনিট পালা নিয়ে খেলা','3 minutes of turn-taking play','সামাজিক','Social',55],['রাত ১০টার মধ্যে ঘুম','Asleep by 10 pm','ঘুম','Sleep',25]],
 tl:[['teacher','শিক্ষিকা নাসরিন','Teacher Nasrin','গতকাল · দুপুর ১২:০৫','Yesterday · 12:05 pm','ক্লাস নোট','Class note','ব্লক খেলায় পালা নিয়ে ~৩ মিনিট থেকেছে। নাস্তার আগে হালকা আপত্তি, ২ মিনিটের সংকেতে শান্ত।','Stayed ~3 min in turn-taking block play. Mild protest before snack; settled with a 2-minute warning.','সামাজিক','Social'],
  ['parent','সাবরিনা (মা)','Sabrina (mother)','১৪ অক্টো · বিকাল ১:২০','14 Oct · 1:20 pm','','','বুদবুদ ফুরিয়ে গেলে নিজে থেকে “আরও” বলল — দুইবার!','Said “more” on his own when the bubbles ran out — twice!','ভাষা','Language'],
  ['specialist','ডা. তানভীর রহমান','Dr. Tanvir Rahman','১০ অক্টো · সকাল ১১:৩০','10 Oct · 11:30 am','ক্লিনিক্যাল নোট','Clinical note','একক শব্দে চাওয়া ৫–৬টি। পছন্দের খেলায় দুই শব্দ মডেল করার পরামর্শ। ঘুমের জন্য Melatonin, ৪ সপ্তাহ পর রিভিউ।','5–6 consistent single-word requests. Model 2-word phrases in preferred play. Melatonin trial for sleep; review in 4 weeks.','ঘুম','Sleep']],
 mm:['স্কুলে রুটিন বদলে অস্থিরতা বেশি লেখা হয়েছে (সপ্তাহে ৪ বার), বাসার লগে ১ বার — বাসায় রুটিন বেশি নমনীয় হতে পারে।','School notes report more transition distress (4×/week) than home logs (1×) — home routine may be more flexible.']},
{id:'nusaiba',code:'SJ-3MF8R',tone:'calm',ini:['নু','N'],name:['নুসাইবা','Nusaiba'],gen:['নুসাইবার',"Nusaiba's"],age:['৪ বছর ৬ মাস','4 yrs 6 mo'],ageS:['৪ ব. ৬ মা.','4y 6m'],
 dx:['অটিজম (ASD)','Autism (ASD)'],dxs:['সামাজিক খেলা ও ইন্দ্রিয় সংবেদনশীলতায় সহায়তা','Support with social play and sensory sensitivity'],
 newN:0,last:['অভিভাবকের লগ · ২ দিন আগে','Parent log · 2 days ago'],lastBy:'parent',trend:'flat',next:['২৮ অক্টো','28 Oct'],nextD:['বুধবার, ২৮ অক্টোবর · দুপুর ১২:০০','Wed, 28 Oct · 12:00 pm'],
 team:[['parent','ফারহানা (মা)','Farhana (mother)','ফা','F'],TEAM_T,TEAM_D],teacher:1,spec:1,scr:['moderate',7],meds:[],
 sum:[['ছবি দেখে ৩–৪ শব্দের বাক্য বলছে','Uses 3–4 word sentences with pictures','log','৮টি লগ','8 logs'],['দলগত খেলায় এখনো পাশে বসে দেখে, যোগ দেয় কম','Still watches group play from the side, joins rarely','report','স্কুল নোট','School notes'],['হেডফোন পরলে অ্যাসেম্বলিতে থাকতে পারছে','Can stay in assembly with headphones','report','শিক্ষিকার নোট · ১২ অক্টো','Teacher’s note · 12 Oct']],
 facts:[['ছোট বাক্য, ছবি দেখিয়ে','Short sentences, pointing to pictures'],['ভিড়, জোরে শব্দ, আঠালো জিনিস','Crowds, loud noise, sticky textures'],['হেডফোন, ছবির বই, একা কিছুক্ষণ','Headphones, picture books, a little time alone'],['রং করা, পশুপাখির নাম, ধাঁধা','Colouring, animal names, puzzles']],
 goals:[['দলগত খেলায় ২ মিনিট যোগ দেওয়া','Joining group play for 2 minutes','সামাজিক','Social',40],['নিজে থেকে সাহায্য চাওয়া','Asking for help on her own','ভাষা','Language',60]],
 tl:[['parent','ফারহানা (মা)','Farhana (mother)','১৪ অক্টো','14 Oct','','','খালাতো বোনের সাথে ১০ মিনিট রং করল, নিজে থেকে রং চেয়ে নিল।','Coloured with her cousin for 10 minutes and asked for a crayon herself.','সামাজিক','Social'],
  ['teacher','শিক্ষিকা নাসরিন','Teacher Nasrin','১২ অক্টো','12 Oct','ক্লাস নোট','Class note','হেডফোন পরে পুরো অ্যাসেম্বলিতে ছিল। দলগত খেলায় দূর থেকে দেখেছে।','Stayed through assembly with headphones. Watched group play from a distance.','ইন্দ্রিয়','Sensory'],
  ['specialist','ডা. তানভীর রহমান','Dr. Tanvir Rahman','২৯ সেপ্টে','29 Sep','ক্লিনিক্যাল নোট','Clinical note','সংবেদনশীলতার জন্য ধীরে ধীরে অভ্যস্ত করানো চালিয়ে যান। ছোট দলে খেলা শুরু করুন।','Continue gradual sensory exposure. Start with small-group play.','ইন্দ্রিয়','Sensory']],
 mm:['উল্লেখযোগ্য অমিল নেই — দুই জায়গাতেই দলগত খেলায় যোগ কম।','No notable mismatch — both settings report limited group play.']},
{id:'ayan',code:'SJ-8PD2L',tone:'leaf',ini:['আ','A'],name:['আয়ান','Ayan'],gen:['আয়ানের',"Ayan's"],age:['৫ বছর ১ মাস','5 yrs 1 mo'],ageS:['৫ ব. ১ মা.','5y 1m'],
 dx:['অটিজম (ASD) · মনোযোগে সহায়তা','Autism (ASD) · attention support'],dxs:['মনোযোগ ধরে রাখা ও আবেগ সামলানোয় সহায়তা','Support with sustaining attention and managing feelings'],
 newN:2,last:['অভিভাবকের লগ · আজ','Parent log · today'],lastBy:'parent',trend:'dn',next:['আজ','Today'],nextD:['আজ · সকাল ১১:০০','Today · 11:00 am'],
 team:[['parent','কামরুল (বাবা)','Kamrul (father)','কা','K'],TEAM_T,TEAM_D],teacher:1,spec:1,scr:['high',15],meds:[],
 sum:[['এই সপ্তাহে কঠিন মুহূর্ত বেড়েছে — ৬ বার (আগে ৩ বার)','More hard moments this week — 6 (3 before)','log','৯টি লগ','9 logs'],['বেশিরভাগ বিকালে, ক্লান্ত বা ক্ষুধার্ত থাকলে','Mostly in the afternoon, when tired or hungry','log','অভিভাবকের লগ','Parent logs'],['টাইমার দিয়ে কাজ ভাগ করলে ৮ মিনিট বসে থাকছে','Sits for 8 minutes when tasks are split with a timer','report','স্কুল নোট','School notes']],
 facts:[['পুরো বাক্য, তবে উত্তেজিত হলে চুপ হয়ে যায়','Full sentences, goes quiet when overwhelmed'],['অপেক্ষা করা, খেলা হঠাৎ থামানো','Waiting, play stopped suddenly'],['টাইমার, দৌড়ানোর বিরতি, গভীর শ্বাস','Timers, running breaks, deep breaths'],['সংখ্যা, ট্রেন, লেগো দিয়ে বানানো','Numbers, trains, building with Lego']],
 goals:[['টাইমারে ১০ মিনিট বসে কাজ','10 minutes seated work with a timer','মনোযোগ','Attention',65],['রাগ হলে “বিরতি” কার্ড দেখানো','Showing the “break” card when upset','আচরণ','Behaviour',30]],
 tl:[['parent','কামরুল (বাবা)','Kamrul (father)','আজ · সকাল ৭:৪০','Today · 7:40 am','','','স্কুলে যাওয়ার আগে জুতা নিয়ে অনেক কান্না। টাইমার দেখানোর পর শান্ত।','Lots of crying over shoes before school. Calmed once shown the timer.','আচরণ','Behaviour'],
  ['teacher','শিক্ষিকা নাসরিন','Teacher Nasrin','১৪ অক্টো','14 Oct','ক্লাস নোট','Class note','টাইমার দিয়ে ৩ ভাগে কাজ — ৮ মিনিট বসে ছিল। দুপুরের পর মনোযোগ কম।','Task in 3 parts with a timer — seated 8 min. Attention drops after lunch.','মনোযোগ','Attention'],
  ['specialist','ডা. তানভীর রহমান','Dr. Tanvir Rahman','১৮ সেপ্টে','18 Sep','ক্লিনিক্যাল নোট','Clinical note','নিয়মিত চলাফেরার বিরতি ও ভিজ্যুয়াল টাইমার চালু করুন। ৪ সপ্তাহ পর রিভিউ।','Introduce scheduled movement breaks and a visual timer. Review in 4 weeks.','মনোযোগ','Attention']],
 mm:['বাসায় সকালে কঠিন মুহূর্ত বেশি, স্কুলে বিকালে — দিনের সময় অনুযায়ী ট্রিগার আলাদা হতে পারে।','Home reports hard mornings, school reports hard afternoons — triggers may differ by time of day.']},
{id:'tasnim',code:'SJ-5RT9W',tone:'warm',ini:['তা','T'],name:['তাসনিম','Tasnim'],gen:['তাসনিমের',"Tasnim's"],age:['৩ বছর ৯ মাস','3 yrs 9 mo'],ageS:['৩ ব. ৯ মা.','3y 9m'],
 dx:['ভাষা বিকাশে বিলম্ব','Speech and language delay'],dxs:['কথা বলা ও শব্দ শেখায় বাড়তি সহায়তা','Extra support with speech and new words'],
 newN:0,last:['শিক্ষিকার নোট · ৩ দিন আগে','Teacher’s note · 3 days ago'],lastBy:'teacher',trend:'up',next:['—','—'],nextD:['—','—'],
 team:[['parent','রুমা (মা)','Ruma (mother)','রু','R'],TEAM_T,['specialist','শিরিন (স্পিচ থেরাপিস্ট)','Shirin (speech therapist)','শি','S']],teacher:1,spec:0,scr:['low',3],meds:[],
 sum:[['নতুন ৮টি শব্দ বলছে এই মাসে','8 new words this month','log','৬টি লগ','6 logs'],['গানের সাথে অঙ্গভঙ্গি করে অংশ নিচ্ছে','Joins songs with actions','report','স্কুল নোট','School notes'],['বন্ধুদের নাম ধরে ডাকতে শুরু করেছে','Has started calling friends by name','report','শিক্ষিকার নোট · ১৩ অক্টো','Teacher’s note · 13 Oct']],
 facts:[['একক শব্দ, ইশারা, গান','Single words, gestures, songs'],['বুঝতে না পারলে বিরক্ত হয়','Frustrated when not understood'],['ধৈর্য ধরে অপেক্ষা, দুটো বিকল্প দেওয়া','Patient waiting, offering two choices'],['গান, নাচ, পুতুল খেলা','Songs, dancing, doll play']],
 goals:[['দুই শব্দ মিলিয়ে বলা','Combining two words','ভাষা','Language',45],['বন্ধুকে নাম ধরে ডাকা','Calling a friend by name','সামাজিক','Social',80]],
 tl:[['teacher','শিক্ষিকা নাসরিন','Teacher Nasrin','১৩ অক্টো','13 Oct','ক্লাস নোট','Class note','গানের সময় “আবার” বলে আরেকবার চাইল। মিমকে নাম ধরে ডাকল।','Asked for the song “again”. Called Mim by name.','ভাষা','Language'],
  ['parent','রুমা (মা)','Ruma (mother)','১১ অক্টো','11 Oct','','','বাজারে গিয়ে “মাছ”, “কলা” বলল।','Said “fish” and “banana” at the market.','ভাষা','Language'],
  ['specialist','শিরিন (স্পিচ থেরাপিস্ট)','Shirin (speech therapist)','৫ অক্টো','5 Oct','থেরাপি নোট','Therapy note','দুই শব্দের বাক্য মডেল করুন: “আরও পানি”, “মা এসো”।','Model two-word phrases: “more water”, “come mum”.','ভাষা','Language']],
 mm:['উল্লেখযোগ্য অমিল নেই।','No notable mismatch.']},
{id:'ishan',code:'SJ-2KX7N',tone:'sky',ini:['ই','I'],name:['ইশান','Ishan'],gen:['ইশানের',"Ishan's"],age:['৬ বছর','6 yrs'],ageS:['৬ ব.','6y'],
 dx:['অটিজম (ASD)','Autism (ASD)'],dxs:['ঘুম ও রুটিন মানিয়ে চলায় সহায়তা','Support with sleep and adapting to routines'],
 newN:0,last:['বিশেষজ্ঞের নোট · ৫ দিন আগে','Specialist note · 5 days ago'],lastBy:'specialist',trend:'up',next:['রবি, ১৮ অক্টো','Sun, 18 Oct'],nextD:['রবিবার, ১৮ অক্টোবর · সকাল ১০:৩০','Sun, 18 Oct · 10:30 am'],
 team:[['parent','লায়লা (মা)','Laila (mother)','লা','L'],['teacher','রুমানা আপা','Rumana Apa','রু','R'],TEAM_D],teacher:0,spec:1,scr:['elevated',12],scrAtt:0,
 meds:[['Melatonin ২ মি.গ্রা. — ঘুমের ৩০ মিনিট আগে','Melatonin 2 mg — 30 min before sleep','ডা. তানভীর · ২ সেপ্টে','Dr. Tanvir · 2 Sep']],
 sum:[['গড় ঘুম শুরু রাত ১০:১৫ — আগের মাসে ১১:৩০','Average sleep onset 10:15 pm — 11:30 pm last month','log','১৪টি ঘুমের লগ','14 sleep logs'],['স্কুলে নতুন রুটিনে ২ সপ্তাহে মানিয়ে নিয়েছে','Adapted to a new school routine in 2 weeks','report','স্কুল নোট','School notes'],['ওষুধ ২৯/৩০ দিন দেওয়া হয়েছে','Medication given 29/30 days','doc','প্রেসক্রিপশন','Prescription']],
 facts:[['পুরো বাক্য, একই প্রশ্ন বারবার','Full sentences, repeats questions'],['পরিকল্পনা বদল, অচেনা জায়গা','Changed plans, unfamiliar places'],['দিনের ছবি-সূচি, প্রিয় বই','Picture schedule, favourite book'],['মানচিত্র, পতাকা, সংখ্যা মনে রাখা','Maps, flags, remembering numbers']],
 goals:[['রাত ১০টার মধ্যে ঘুম','Asleep by 10 pm','ঘুম','Sleep',75],['পরিবর্তন জানলে শান্ত থাকা','Staying calm when told about a change','আচরণ','Behaviour',60]],
 tl:[['specialist','ডা. তানভীর রহমান','Dr. Tanvir Rahman','১১ অক্টো','11 Oct','ক্লিনিক্যাল নোট','Clinical note','ঘুম ভালো হচ্ছে। একই ডোজ চলবে। পরবর্তী রিভিউ ১৮ অক্টো।','Sleep improving. Continue same dose. Next review 18 Oct.','ঘুম','Sleep'],
  ['parent','লায়লা (মা)','Laila (mother)','৯ অক্টো','9 Oct','','','রাত ১০টায় ঘুমিয়েছে, মাঝরাতে ওঠেনি।','Asleep at 10 pm, didn’t wake at night.','ঘুম','Sleep'],
  ['teacher','রুমানা আপা','Rumana Apa','৭ অক্টো','7 Oct','ক্লাস নোট','Class note','ছবি-সূচি দেখে নতুন রুটিনে মানিয়ে নিয়েছে।','Settled into the new routine using the picture schedule.','রুটিন','Routine']],
 mm:['উল্লেখযোগ্য অমিল নেই — দুই জায়গাতেই উন্নতি।','No notable mismatch — both settings report progress.']},
{id:'mahi',code:'SJ-6WB4H',tone:'calm',ini:['মা','M'],name:['মাহি','Mahi'],gen:['মাহির',"Mahi's"],age:['২ বছর ১১ মাস','2 yrs 11 mo'],ageS:['২ ব. ১১ মা.','2y 11m'],
 dx:['মূল্যায়ন চলছে','Assessment in progress'],dxs:['স্ক্রিনিংয়ে মাঝারি ঝুঁকি — পরবর্তী মূল্যায়ন চলছে','Moderate likelihood on screening — further assessment ongoing'],
 newN:0,last:['অভিভাবকের লগ · ৪ দিন আগে','Parent log · 4 days ago'],lastBy:'parent',trend:'flat',next:['আজ','Today'],nextD:['আজ · বিকাল ৩:৩০','Today · 3:30 pm'],
 team:[['parent','শারমিন (মা)','Sharmin (mother)','শা','S'],TEAM_D],teacher:0,spec:1,scr:['moderate',6],meds:[],
 sum:[['নাম ধরে ডাকলে প্রায় অর্ধেক সময় সাড়া দেয়','Responds to name about half the time','log','৫টি লগ','5 logs'],['আঙুল দিয়ে দেখানো শুরু হয়নি এখনো','Not yet pointing to show','doc','স্ক্রিনিং রিপোর্ট','Screening report'],['ঘুম ও খাওয়া স্বাভাবিক','Sleep and eating as usual','log','অভিভাবকের লগ','Parent logs']],
 facts:[['শব্দ, হাসি, হাত ধরে টানা','Sounds, smiles, pulling by hand'],['চুল আঁচড়ানো, নতুন খাবার','Hair brushing, new foods'],['দোলনা, মায়ের কোলে গান','Swinging, songs on mum’s lap'],['বল, আলো জ্বলা খেলনা','Balls, light-up toys']],
 goals:[['নাম ধরে ডাকলে তাকানো','Looking when name is called','সামাজিক','Social',50],['জিনিস দেখাতে আঙুল তোলা','Pointing to show things','যোগাযোগ','Communication',20]],
 tl:[['parent','শারমিন (মা)','Sharmin (mother)','১২ অক্টো','12 Oct','','','বল খেলায় ৩ বার নাম ডাকলে তাকাল।','Looked when called by name 3 times during ball play.','সামাজিক','Social'],
  ['specialist','ডা. তানভীর রহমান','Dr. Tanvir Rahman','২ অক্টো','2 Oct','ক্লিনিক্যাল নোট','Clinical note','স্ক্রিনিং রিপোর্ট দেখা হয়েছে। বিস্তারিত মূল্যায়ন ১৬ অক্টো।','Screening report reviewed. Detailed assessment on 16 Oct.','মূল্যায়ন','Assessment'],
  ['parent','শারমিন (মা)','Sharmin (mother)','৩০ সেপ্টে','30 Sep','','','দোলনায় খুব খুশি, “আ-আ” শব্দ করছে।','Very happy on the swing, making “aa-aa” sounds.','খেলা','Play']],
 mm:['শিক্ষকের নোট নেই — তুলনা করা যাচ্ছে না।','No teacher notes — comparison not possible.']},
{id:'samir',code:'SJ-9QJ5T',tone:'warm',ini:['সা','S'],name:['সামির','Samir'],gen:['সামিরের',"Samir's"],age:['৪ বছর','4 yrs'],ageS:['৪ ব.','4y'],
 dx:['অটিজম (ASD) · ইন্দ্রিয় সংবেদনশীলতা','Autism (ASD) · sensory sensitivity'],dxs:['খাবার ও শব্দে সংবেদনশীলতায় সহায়তা','Support with food and sound sensitivity'],
 newN:1,last:['শিক্ষকের নোট · আজ','Teacher’s note · today'],lastBy:'teacher',trend:'dn',next:['৩ নভে','3 Nov'],nextD:['মঙ্গলবার, ৩ নভেম্বর · সকাল ১১:৩০','Tue, 3 Nov · 11:30 am'],
 team:[['parent','জাহিদ (বাবা)','Zahid (father)','জা','Z'],['teacher','রুমানা আপা','Rumana Apa','রু','R'],TEAM_D],teacher:0,spec:1,scr:['elevated',10],meds:[],
 sum:[['খাবারের তালিকা ৬টিতে নেমেছে (আগে ৯টি)','Accepted foods down to 6 (from 9)','log','৭টি লগ','7 logs'],['স্কুলে টিফিনের সময় কান্না বেড়েছে','More crying at school tiffin time','report','স্কুল নোট · আজ','School note · today'],['ইয়ারমাফ পরলে ক্লাসে থাকতে পারছে','Can stay in class wearing ear defenders','report','শিক্ষকের নোট','Teacher’s notes']],
 facts:[['ছোট বাক্য, ছবি কার্ড','Short sentences, picture cards'],['নতুন খাবার, ব্লেন্ডারের শব্দ','New foods, blender noise'],['ইয়ারমাফ, ভারী কম্বল','Ear defenders, weighted blanket'],['গাড়ি, চাকা, পানি ঢালা','Cars, wheels, pouring water']],
 goals:[['নতুন খাবার ছুঁয়ে দেখা','Touching a new food','খাবার','Eating',35],['টিফিনে বন্ধুদের সাথে বসা','Sitting with friends at tiffin','সামাজিক','Social',25]],
 tl:[['teacher','রুমানা আপা','Rumana Apa','আজ · দুপুর ১২:৩০','Today · 12:30 pm','ক্লাস নোট','Class note','টিফিনের সময় পাশের শিশুর খাবারের গন্ধে কান্না। আলাদা টেবিলে শান্ত।','Cried at tiffin from a classmate’s food smell. Calm at a separate table.','খাবার','Eating'],
  ['parent','জাহিদ (বাবা)','Zahid (father)','১২ অক্টো','12 Oct','','','ভাত আর ডিম ছাড়া কিছু খেতে চাইছে না।','Won’t eat anything except rice and egg.','খাবার','Eating'],
  ['specialist','ডা. তানভীর রহমান','Dr. Tanvir Rahman','২০ সেপ্টে','20 Sep','ক্লিনিক্যাল নোট','Clinical note','খাবার নিয়ে খেলা (ছোঁয়া, গন্ধ) — চাপ ছাড়া। অকুপেশনাল থেরাপি রেফারাল।','Food play (touch, smell) — no pressure. Occupational therapy referral.','খাবার','Eating']],
 mm:['স্কুলে টিফিনে কান্না, বাসায় খাবার প্রত্যাখ্যান — দুটোই খাবার ঘিরে; স্কুলে গন্ধ বাড়তি ট্রিগার মনে হচ্ছে।','School: crying at tiffin; home: food refusal — both food-related; smell seems an extra trigger at school.']}
];
const KID={};K.forEach(k=>KID[k.id]=k);
const TKIDS=['rafi','nusaiba','ayan','tasnim'],SKIDS=['rafi','nusaiba','ayan','ishan','mahi','samir'];
const ix=l=>l==='en'?1:0;
const TPS=window.TPS||{child:'rafi',notes:{},toast:null,draft:null,sent:{}};
const cur=()=>KID[TPS.child]||KID.rafi;
window.TPACT=function(act){
  if(act==='save'){const d=TPS.draft;if(!d)return;const c=TPS.child;const l=d.lang;const clin=d.role==='specialist';
    const parts=d.fields.filter(f=>f[1]&&f[1].trim()).map(f=>f[0]+': '+f[1].trim());
    const rm=/(\d+)-(\d+)-(\d+)/.exec(d.review||'');if(clin&&rm)parts.push(tt(l,'পরবর্তী রিভিউ: '+bn(+rm[3])+' '+['জানু','ফেব্রু','মার্চ','এপ্রি','মে','জুন','জুলা','আগ','সেপ্টে','অক্টো','নভে','ডিসে'][rm[2]-1],'Next review: '+(+rm[3])+' '+['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][rm[2]-1]));
    const body=parts.join(' · ')||(d.free||'').trim()||tt(l,'নোট যোগ হয়েছে','Note added');
    const n={role:d.role,author:clin?tt(l,'ডা. তানভীর রহমান (আপনি)','Dr. Tanvir Rahman (you)'):tt(l,'শিক্ষিকা নাসরিন (আপনি)','Teacher Nasrin (you)'),
      time:tt(l,'এইমাত্র','Just now'),title:clin?tt(l,'ক্লিনিক্যাল নোট','Clinical note'):tt(l,'ক্লাস নোট','Class note'),body:body+(d.free&&parts.length?' — '+d.free.trim():''),tags:d.domains.slice(),vis:d.vis,isNew:1};
    (TPS.notes[c]=TPS.notes[c]||[]).unshift(n);
    TPS.toast=clin?{t:tt(l,'নোট সেভ হয়েছে','Note saved'),m:d.vis==='clin'?tt(l,'শুধু ক্লিনিক্যাল টিম দেখতে পাবেন।','Visible to the clinical team only.'):tt(l,'অভিভাবককে জানানো হয়েছে।','The parent has been notified.')}
      :{t:tt(l,'ক্লাসের নোট সেভ হয়েছে','Class note saved'),m:d.vis==='me'?tt(l,'শুধু আপনি দেখতে পাবেন।','Only you can see it.'):tt(l,'কেয়ার টিম দেখতে পাবেন।','The care team can see it.')};
    TPS.draft=null;}
};
function KidAv({k,l,size=48}){const c={sky:['var(--sj-sky-50)','var(--sj-navy)'],calm:['var(--sj-teal-50)','var(--sj-ink-teal)'],leaf:['var(--sj-leaf-50)','var(--sj-ink-leaf)'],warm:['var(--sj-amber-50)','var(--sj-ink-amber)']}[k.tone];
  return <span className="tp-av" style={{width:size,height:size,background:c[0],color:c[1],fontSize:Math.round(size*.4)}} aria-hidden="true">{k.ini[ix(l)]}</span>;}
const ROLEC={parent:['var(--sj-teal-50)','var(--sj-ink-teal)'],teacher:['var(--sj-navy-50)','var(--sj-navy)'],specialist:['var(--sj-leaf-50)','var(--sj-ink-leaf)']};
function TeamStack({k,l}){return <span className="tp-team" aria-label={tt(l,'কেয়ার টিম','Care team')}>{k.team.map((m,i)=><span key={i} className="tp-av sm" title={m[1+ix(l)]} style={{background:ROLEC[m[0]][0],color:ROLEC[m[0]][1]}}>{m[3+ix(l)]}</span>)}</span>;}
function NewBadge({k,l}){return k.newN?<span className="cm-unread">{tt(l,bn(k.newN)+'টি নতুন',k.newN+' new')}</span>:null;}
function TrendTag({k,l}){const m={up:[tt(l,'উন্নতি হচ্ছে','Improving'),'up'],flat:[tt(l,'স্থিতিশীল','Stable'),'flat'],dn:[tt(l,'নজর দিন','Needs attention'),'dn']}[k.trend];return <Trend dir={m[1]}>{m[0]}</Trend>;}
const DOMS=[['ভাষা','Language','message-circle'],['সামাজিক','Social','users'],['খেলা','Play','blocks'],['আচরণ','Behaviour','heart'],['মনোযোগ','Attention','focus'],['ইন্দ্রিয়','Sensory','ear'],['খাবার','Eating','utensils'],['চলাফেরা','Movement','footprints']];
function allTl(k,l){const add=(TPS.notes[k.id]||[]).map(n=>({...n,isNew:1}));
  const base=k.tl.map(e=>({role:e[0],author:e[1+ix(l)],time:e[3+ix(l)],title:e[5+ix(l)],body:e[7+ix(l)],tags:[e[9+ix(l)]]}));return [...add,...base];}
Object.assign(window,{tt,dg,KIDS:K,KID,TKIDS,SKIDS,ix,TPS,curKid:cur,KidAv,TeamStack,NewBadge,TrendTag,TP_DOMS:DOMS,allTl,ROLEC});
window.TPS=TPS;
})();
