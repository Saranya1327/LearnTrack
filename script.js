const courses = [
  {id:"html", title:"HTML & CSS Essentials", category:"Web Development", icon:"</>", color:"#eeeaff", description:"Build the structure and style of websites.", lessons:5, progress:0, questions:[
    {q:"What does HTML stand for?", options:["Hyper Text Markup Language","High Transfer Machine Language","Home Tool Markup Language","Hyperlinks Text Management Language"], answer:0},
    {q:"Which tag creates a hyperlink?", options:["<link>","<a>","<href>","<url>"], answer:1},
    {q:"Which CSS property changes text color?", options:["font-style","background","color","text-weight"], answer:2},
    {q:"Which HTML tag is the largest standard heading?", options:["<head>","<h6>","<heading>","<h1>"], answer:3},
    {q:"Which CSS layout system is designed for one-dimensional layouts?", options:["Flexbox","SQL","HTML","JSON"], answer:0}
  ]},
  {id:"javascript", title:"JavaScript Fundamentals", category:"Programming", icon:"JS", color:"#fff4d8", description:"Make web pages interactive with JavaScript.", lessons:6, progress:0, questions:[
    {q:"Which keyword declares a block-scoped variable that can change?", options:["const","let","static","define"], answer:1},
    {q:"Which method selects an element by its ID?", options:["getElementById()","queryClass()","selectId()","findElement()"], answer:0},
    {q:"Which symbol is used for strict equality?", options:["=","==","===","!="], answer:2},
    {q:"Which event happens when a user clicks an element?", options:["changeText","hovered","submitOnly","click"], answer:3},
    {q:"Which method converts JSON text into a JavaScript value?", options:["JSON.parse()","JSON.stringify()","JSON.read()","parse.JSON()"], answer:0}
  ]},
  {id:"python", title:"Python Programming Basics", category:"Programming", icon:"Py", color:"#e3f5ff", description:"Explore variables, conditions, loops and functions.", lessons:5, progress:0, questions:[
    {q:"Which character starts a comment in Python?", options:["//","#","<!--","**"], answer:1},
    {q:"Which data type stores True or False?", options:["String","Integer","Boolean","List"], answer:2},
    {q:"Which keyword defines a function?", options:["function","func","define","def"], answer:3},
    {q:"What does len([1, 2, 3]) return?", options:["3","2","4","1"], answer:0},
    {q:"Which collection is ordered and changeable?", options:["Tuple","List","Set","Frozen set"], answer:1}
  ]}
];
let state = JSON.parse(localStorage.getItem("learntrack-state") || '{"progress":{},"scores":{},"certificates":[],"activity":[]}');
let currentCourse = null, questionIndex = 0, selectedAnswers = [], toastTimer;
function save(){localStorage.setItem("learntrack-state",JSON.stringify(state));}
function getProgress(course){return state.progress[course.id] || 0;}
function showToast(message){const toast=document.getElementById("toast");toast.textContent=message;toast.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove("show"),2600);}
function addActivity(title,detail){state.activity.unshift({title,detail,time:new Date().toLocaleDateString()});state.activity=state.activity.slice(0,6);save();}
function renderCourses(filter="all"){
 const list=document.getElementById("course-list");
 let visible=courses.filter(c=>filter==="all"||(filter==="completed"&&getProgress(c)===100)||(filter==="inprogress"&&getProgress(c)<100));
 if(!visible.length){list.innerHTML='<div class="empty">No courses here yet. Keep learning to see your progress!</div>';return;}
 list.innerHTML=visible.map(c=>{const p=getProgress(c);return `<article class="course-card"><div class="course-icon" style="background:${c.color}">${c.icon}</div><div class="course-info"><h3>${c.title}</h3><p>${c.category} · ${c.lessons} learning modules</p><div class="progress-line"><span style="width:${p}%"></span></div><div class="progress-meta"><span>${p===100?"Course completed":p===0?"Not started":"In progress"}</span><span>${p}%</span></div></div><button class="small-btn" onclick="openCourse('${c.id}')">${p===100?"Review":p===0?"Start":"Continue"}</button></article>`}).join("");
}
function renderActivity(){const el=document.getElementById("activity-list");if(!state.activity.length){el.innerHTML='<div class="empty">Your learning activity will appear here.<br>Start a course quiz to begin!</div>';return;}el.innerHTML=state.activity.slice(0,4).map(a=>`<div class="activity-item"><span class="activity-dot">✓</span><div><strong>${a.title}</strong><p>${a.detail}<br>${a.time}</p></div></div>`).join("");}
function renderStats(){document.getElementById("stat-enrolled").textContent=courses.length;document.getElementById("stat-completed").textContent=courses.filter(c=>getProgress(c)===100).length;const scores=Object.values(state.scores);document.getElementById("stat-score").textContent=scores.length?Math.round(scores.reduce((a,b)=>a+b,0)/scores.length)+"%":"—";document.getElementById("stat-certs").textContent=state.certificates.length;}
function renderCertificates(){const el=document.getElementById("certificate-list");if(!state.certificates.length){el.innerHTML='<div class="empty">No certificates yet. Complete a course quiz with at least 70% to earn your first certificate.</div>';return;}el.innerHTML=state.certificates.map(c=>`<article class="certificate"><div class="seal">✦</div><p>LEARNTRACK CERTIFICATE</p><h3>Certificate of Completion</h3><p>This certifies that <strong>${escapeHtml(c.name)}</strong> completed</p><h3>${escapeHtml(c.title)}</h3><p>Quiz score: <strong>${c.score}%</strong><br>Issued: ${escapeHtml(c.date)}</p><button class="primary-btn" onclick="printCertificate('${c.id}')">Print / Save PDF</button></article>`).join("");}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));}
function openCourse(id){currentCourse=courses.find(c=>c.id===id);questionIndex=0;selectedAnswers=[];document.getElementById("quiz-section").classList.remove("hidden");document.getElementById("certificate-section").classList.add("hidden");document.getElementById("quiz-title").textContent=currentCourse.title+" Quiz";document.getElementById("quiz-section").scrollIntoView({behavior:"smooth",block:"start"});renderQuestion();}
function renderQuestion(){const c=currentCourse,q=c.questions[questionIndex];document.getElementById("quiz-content").innerHTML=`<p class="question-count">QUESTION ${questionIndex+1} OF ${c.questions.length}</p><div class="progress-line"><span style="width:${((questionIndex+1)/c.questions.length)*100}%"></span></div><p class="question">${escapeHtml(q.q)}</p><form id="answer-form">${q.options.map((o,i)=>`<label class="answer-option"><input type="radio" name="answer" value="${i}" ${selectedAnswers[questionIndex]===i?"checked":""} required> ${escapeHtml(o)}</label>`).join("")}<button class="primary-btn" type="submit">${questionIndex===c.questions.length-1?"Submit quiz":"Next question →"}</button></form>`;document.getElementById("answer-form").addEventListener("submit",e=>{e.preventDefault();const picked=document.querySelector('input[name="answer"]:checked');if(!picked){showToast("Choose an answer first.");return;}selectedAnswers[questionIndex]=Number(picked.value);if(questionIndex<c.questions.length-1){questionIndex++;renderQuestion();}else finishQuiz();});}
function finishQuiz(){const c=currentCourse;const correct=c.questions.reduce((n,q,i)=>n+(q.answer===selectedAnswers[i]?1:0),0);const score=Math.round(correct/c.questions.length*100);state.scores[c.id]=score;const passed=score>=70;if(passed){state.progress[c.id]=100;if(!state.certificates.some(x=>x.id===c.id)){const name=prompt("Enter your name for the certificate:","Student");if(name&&name.trim())state.certificates.push({id:c.id,title:c.title,name:name.trim(),score,date:new Date().toLocaleDateString()});}else{const cert=state.certificates.find(x=>x.id===c.id);cert.score=score;}}else{state.progress[c.id]=Math.max(getProgress(c),Math.round((correct/c.questions.length)*80));}
 addActivity(c.title+" quiz",`Scored ${score}% · ${passed?"Passed":"Try again to reach 70%"}`);save();renderAll();document.getElementById("quiz-content").innerHTML=`<div class="result-box"><div style="font-size:34px">${passed?"🎉":"💪"}</div><h3>${score}%</h3><strong>${passed?"Great work! You passed.":"Keep practising!"}</strong><p>You answered ${correct} out of ${c.questions.length} questions correctly.<br>${passed?"Your course is marked complete. If you entered your name, your certificate is ready.":"You need at least 70% to pass. Review the course and try again."}</p><button class="primary-btn" onclick="openCourse('${c.id}')">Try again</button> <button class="small-btn" onclick="closeQuiz()">Back to dashboard</button></div>`;}
function closeQuiz(){document.getElementById("quiz-section").classList.add("hidden");currentCourse=null;window.scrollTo({top:0,behavior:"smooth"});}
function printCertificate(id){
 const c=state.certificates.find(x=>x.id===id);if(!c)return;
 const w=window.open("","_blank","width=1100,height=800");
 if(!w){showToast("Allow pop-ups to print your certificate.");return;}
 w.document.write(`<!DOCTYPE html><html><head><title>LearnTrack Certificate</title><meta charset="UTF-8"><style>
 *{box-sizing:border-box}body{margin:0;background:#f4f5f8;font-family:Georgia,'Times New Roman',serif;color:#172b4d}.sheet{width:100%;min-height:100vh;padding:22px;display:grid;place-items:center}.cert{position:relative;background:#fff;width:100%;max-width:1400px;min-height:760px;padding:26px 48px 24px;border:5px solid #344f9a;outline:1px solid #344f9a;outline-offset:-13px;text-align:center;overflow:hidden}.watermark{position:absolute;z-index:0;left:0;right:0;top:220px;font:bold 260px Arial;color:#e9e9e9;opacity:.75;letter-spacing:-25px;pointer-events:none}.top{position:relative;z-index:1;display:flex;justify-content:space-between;align-items:center;min-height:145px}.partner{width:180px;height:100px;display:flex;flex-direction:column;align-items:center;justify-content:center;font:bold 17px Arial;color:#303030}.partner .mark{font-size:40px;line-height:1.1}.partner small{font-size:10px;letter-spacing:1px;margin-top:5px}.brand{font:bold 36px Arial,sans-serif;color:#202020;line-height:1}.brand-sub{font:12px Arial;color:#333;margin-top:6px}.main-title{position:relative;z-index:1;margin:12px 0 0;font-size:clamp(38px,5vw,66px);letter-spacing:3px;font-weight:normal}.subtitle{position:relative;z-index:1;font-size:29px;letter-spacing:2px;margin:4px 0 20px}.presented{position:relative;z-index:1;font-size:20px;font-weight:bold;margin:0 0 12px}.recipient{position:relative;z-index:1;font-size:clamp(30px,4vw,49px);font-style:italic;font-weight:bold;color:#214a7a;margin:0 auto 8px;max-width:90%;overflow-wrap:anywhere}.rule{position:relative;z-index:1;height:1px;background:#657a98;margin:0 8% 22px}.description{position:relative;z-index:1;text-align:left;font-size:clamp(16px,1.8vw,23px);font-weight:bold;line-height:1.45;margin:0 7% 38px;color:#282832}.highlight{color:#4d842c}.blue{color:#315b9e}.footer{position:relative;z-index:1;display:flex;align-items:flex-end;justify-content:space-between;gap:18px;margin-top:auto}.issuer{font:bold 20px Arial;color:#294b96;text-align:left;max-width:190px}.signature{flex:1;min-width:140px;text-align:center}.signature .sign{font:italic 30px cursive;color:#303030;height:50px}.signature .line{border-top:1px solid #344f9a;margin-bottom:6px}.signature strong{font-size:16px}.date{font:13px Arial;color:#555;margin-top:10px}
 @media print{ @page{size:A4 landscape;margin:7mm}body{background:#fff}.sheet{padding:0;min-height:0}.cert{max-width:none;min-height:185mm;height:185mm;border-width:4px;padding:20px 40px 20px;break-inside:avoid}.watermark{font-size:250px}.main-title{font-size:58px}.subtitle{font-size:27px}.recipient{font-size:43px}.description{font-size:20px;margin-bottom:25px}.partner{width:160px}.footer{gap:12px}button{display:none}}
 </style></head><body><div class="sheet"><div class="cert">
 <div class="watermark">LT</div>
 <div class="top">
   <div class="partner"><div class="mark">✦</div><div>LEARNTRACK</div><small>LEARNING PLATFORM</small></div>
   <div><div class="brand">LearnTrack</div><div class="brand-sub">Learn. Practice. Achieve.</div></div>
   <div class="partner"><div class="mark">⌘</div><div>SKILL ACHIEVEMENT</div><small>COURSE & QUIZ TRACKING</small></div>
 </div>
 <div class="main-title">CERTIFICATE</div><div class="subtitle">OF COMPLETION</div>
 <p class="presented">This certificate is proudly presented to</p>
 <div class="recipient">${escapeHtml(c.name)}</div>
 <div class="rule"></div>
 <p class="description">For successfully completing the course <span class="highlight">${escapeHtml(c.title)}</span> on the LearnTrack learning platform, achieving a quiz score of <span class="blue">${c.score}%</span>.</p>
 <div class="footer">
   <div class="issuer">LEARNTRACK<br><span style="font-size:12px;color:#555;font-weight:normal">COURSE COMPLETION</span></div>
   <div class="signature"><div class="sign">LearnTrack</div><div class="line"></div><strong>PLATFORM AUTHORITY</strong></div>
   <div class="signature"><div class="sign">${new Date().toLocaleDateString()}</div><div class="line"></div><strong>DATE ISSUED</strong></div>
 </div>
 <p class="date">Certificate generated digitally by LearnTrack · For learning demonstration purposes</p>
 <button onclick="window.print()">Print / Save as PDF</button>
 </div></div></body></html>`);
 w.document.close();
}
function setView(view){document.getElementById("page-title").textContent=({dashboard:"Dashboard",courses:"My Courses",quizzes:"Quizzes",certificates:"Certificates"})[view]||"Dashboard";document.getElementById("quiz-section").classList.add("hidden");document.getElementById("certificate-section").classList.toggle("hidden",view!=="certificates");document.querySelector(".welcome").classList.toggle("hidden",view!=="dashboard");document.querySelector(".stats").classList.toggle("hidden",view!=="dashboard");document.querySelector(".content-grid").classList.toggle("hidden",view==="certificates");if(view==="courses")renderCourses("all");else if(view==="quizzes")renderCourses("inprogress");else if(view==="dashboard")renderCourses("all");if(view==="certificates")renderCertificates();document.querySelectorAll(".nav-item").forEach(b=>b.classList.toggle("active",b.dataset.view===view));window.scrollTo({top:0,behavior:"smooth"});}
function renderAll(){renderCourses();renderActivity();renderStats();renderCertificates();}
document.querySelectorAll(".nav-item").forEach(b=>b.addEventListener("click",()=>setView(b.dataset.view)));
document.querySelectorAll("[data-go]").forEach(b=>b.addEventListener("click",()=>setView(b.dataset.go)));
document.getElementById("close-quiz").addEventListener("click",closeQuiz);
const savedName=localStorage.getItem("learntrack-name")||"Student";document.getElementById("profile-name").textContent=savedName;
if(savedName==="Student"){const name=prompt("Welcome to LearnTrack! What should we call you?","Student");if(name&&name.trim()){localStorage.setItem("learntrack-name",name.trim());document.getElementById("profile-name").textContent=name.trim();}}
renderAll();
