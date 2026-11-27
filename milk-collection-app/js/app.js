// ============ 1. SETUP & HELPERS ============
const $=i=>document.getElementById(i),app=$('app'),mn=h=>$('main').innerHTML=h;
const DR={fat:417,snf:278,hi:818.23};
let L=localStorage.L||'hi',U,C,F=[],S='M',cur='dash',EID=null,ES={},SG=0,mode='in',PA=0,RM=0;
const t=k=>T[k][L=='hi'?0:1],op=(a,f)=>a.map(f).join(''),sum=(a,k)=>a.reduce((s,x)=>s+(+x[k]||0),0);
const D0=()=>new Date(Date.now()-new Date().getTimezoneOffset()*6e4).toISOString().slice(0,10);let D=D0();
const col=n=>db.collection('centers/'+U.uid+'/'+n);
const rt=(f,s)=>{const r=C.rates;return +(f>=6?f*r.hi/100*(1+.05*(s-9)):(f*r.fat+s*r.snf)/100).toFixed(2)};
const srt=(x,y)=>(x.date+(x.shift=='M'?0:1)).localeCompare(y.date+(y.shift=='M'?0:1));
const ents=async(a,b)=>(await col('entries').where('date','>=',a).where('date','<=',b).get()).docs.map(d=>({id:d.id,...d.data()}));
const fl=async()=>F=(await col('farmers').get()).docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>a.name.localeCompare(b.name));
const tg=()=>`<div class=tg><button onclick="sd(-1)">◀</button><input type=date value="${D}" onchange="D=this.value;R()"><button onclick="sd(1)">▶</button><button class="${S=='M'?'on':''}" onclick="S='M';R()">☀ ${t('M')}</button><button class="${S=='E'?'on':''}" onclick="S='E';R()">🌙 ${t('E')}</button></div>`;
const sd=n=>{const d=new Date(D+'T00:00:00');d.setDate(d.getDate()+n);D=[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');R()};

// ============ 2. LOGIN / SIGN UP ============
const em=m=>m.replace(/\D/g,'')+'@milkapp.in';
function authV(){app.innerHTML=`<div class=auth><img src="assets/logo.png"><h2>Milk Collection Manager</h2><button class=sm onclick="L=L=='hi'?'en':'hi';localStorage.L=L;authV()">हिं / EN</button><div class=tg style=justify-content:center><button class="${mode=='in'?'on':''}" onclick="mode='in';authV()">Login</button><button class="${mode=='up'?'on':''}" onclick="mode='up';authV()">Sign up</button></div><div style=text-align:left>${mode=='up'?`<label>Sachiv name<input id=n></label><label>Address<input id=a></label><label>Samiti name<input id=s></label><label>Samiti code<input id=c></label>`:''}<label>Mobile number<input id=m type=tel maxlength=10></label><label>Password (min 6)<input id=p type=password></label><button style=width:100% onclick=sub()>${mode=='in'?'Login':'Create account'}</button><p id=er style=color:#c62828></p></div></div>`}
async function sub(){const v=i=>$(i)?$(i).value.trim():'',m=v('m'),p=v('p'),er=$('er');
if(m.replace(/\D/g,'').length!=10||p.length<6)return er.textContent='Enter 10-digit mobile and password (min 6)';
try{if(mode=='up'){if(!v('n')||!v('s')||!v('c'))return er.textContent='Fill all fields';SG=1;const r=await auth.createUserWithEmailAndPassword(em(m),p);await db.doc('centers/'+r.user.uid).set({sachiv:v('n'),mobile:m,addr:v('a'),samiti:v('s'),code:v('c'),rates:DR});SG=0;boot(r.user)}else await auth.signInWithEmailAndPassword(em(m),p)}
catch(e){SG=0;er.textContent=e.code=='auth/email-already-in-use'?'Mobile already registered':mode=='in'?'Wrong mobile or password':e.message}}
auth.onAuthStateChanged(u=>{if(SG)return;u?boot(u):authV()});
async function boot(u){U=u;C=(await db.doc('centers/'+u.uid).get()).data()||{};C.rates=C.rates||DR;shell();go('dash')}

// ============ 3. SIDE PANEL & NAVIGATION ============
function shell(){app.innerHTML=`<div id=shell><div id=side><img src="assets/logo.png"><b>${C.samiti}</b><small>Code ${C.code}</small>${op(['dash','entry','farmers','bill','profit','set'],k=>`<button class=nv id=n_${k} onclick="go('${k}')">${t(k)}</button>`)}<button onclick="L=L=='hi'?'en':'hi';localStorage.L=L;shell();go(cur)">हिं / EN</button><button class=x onclick="auth.signOut()">${t('out')}</button></div><main id=main></main></div>`}
const V={dash:dashV,entry:entryV,farmers:farV,bill:billV,profit:profV,set:setV},R=()=>V[cur]();
function go(k){cur=k;document.querySelectorAll('.nv').forEach(b=>b.classList.toggle('on',b.id=='n_'+k));V[k]()}

// ============ 4. DASHBOARD ============
function tbl(e,a){return `<div class=card><div class=tbl><table><tr><th>${t('farmer')}<th>${t('qty')}<th>Fat<th>SNF<th>Rate<th>₹${a?'<th>':''}</tr>${op(e,x=>`<tr><td>${x.fname}<td>${x.qty}<td>${x.fat||'-'}<td>${x.snf||'-'}<td>${x.rate}<td>${(+x.amt).toFixed(2)}${a?`<td><button class=sm onclick="ed('${x.id}')">✎</button> <button class="sm x" onclick="dl('${x.id}')">✕</button>`:''}</tr>`)}</table></div></div>`}
async function dashV(){mn(`<h2>${t('dash')}</h2><h3 style="margin:0 0 10px;color:#0d47a1">${L=='hi'?'स्वागत है,':'Welcome,'} ${C.sachiv}</h3>${tg()}<div id=dd></div>`);const e=(await ents(D,D)).filter(x=>x.shift==S),q=sum(e,'qty'),w=k=>{const z=e.filter(x=>x[k]),m=sum(z,'qty');return (z.reduce((s,x)=>s+x[k]*x.qty,0)/(m||1)).toFixed(2)};
$('dd').innerHTML=`<div class=g>${[['Farmers',new Set(e.map(x=>x.fid)).size],['Milk (kg)',q.toFixed(1)],['Avg Fat',w('fat')],['Avg SNF',w('snf')],['Amount ₹',sum(e,'amt').toFixed(2)]].map(([k,v])=>`<div class="card k">${k}<b>${v}</b></div>`).join('')}</div>`+tbl(e)}

// ============ 5. DAILY ENTRY ============
async function entryV(){RM=0;await fl();mn(`<h2>${t('entry')}</h2>${tg()}<div class=card><label>${t('farmer')}<select id=f>${op(F,x=>`<option value="${x.id}">${x.code||''} ${x.name}</option>`)}</select></label><div class=g><label>${t('qty')}<input id=q type=number step=any oninput=cl()></label><label>Fat %<input id=ft type=number step=any oninput="RM=0;cl()"></label><label>SNF %<input id=sn type=number step=any oninput="RM=0;cl()"></label></div><p id=rr></p><label>Rate ₹/kg<input id=rt type=number step=any oninput=ra()></label><label>${t('amt')}<input id=am type=number step=any></label><button onclick=sv()>${t('save')}</button></div><div id=el></div>`);ld()}
function cl(){const q=+$('q').value,f=+$('ft').value,s=+$('sn').value,ok=f&&s,cr=ok?rt(f,s):0,r=RM&&+$('rt').value?+$('rt').value:cr;$('rr').textContent=ok?'Chart rate ₹'+cr+'/kg'+(f<3||s<8?' ⚠ outside chart range':''):'';$('rt').value=r||'';if(q&&r)$('am').value=(r*q).toFixed(2)}
function ra(){RM=1;$('am').value=(+$('rt').value*+$('q').value).toFixed(2)}
async function ld(){const e=(await ents(D,D)).filter(x=>x.shift==S);ES={};e.forEach(x=>ES[x.id]=x);$('el').innerHTML=tbl(e,1)}
async function sv(){const q=+$('q').value,f=+$('ft').value,s=+$('sn').value,a=+$('am').value,x=F.find(y=>y.id==$('f').value);if(!x||!q||!a)return alert('Fill farmer, quantity and rate (or fat and SNF)');
if(!EID&&Object.values(ES).some(y=>y.fid==x.id)&&!confirm(L=='hi'?'इस किसान की प्रविष्टि इस पाली में पहले से है। फिर भी जोड़ें?':'Entry already exists for this farmer and shift. Add another?'))return;
const o={date:D,shift:S,fid:x.id,fname:x.name,qty:q,fat:f||0,snf:s||0,rate:+$('rt').value||(f&&s?rt(f,s):0),amt:a};await(EID?col('entries').doc(EID).set(o):col('entries').add(o));EID=null;const i=F.findIndex(y=>y.id==x.id);entryV().then(()=>{if(F.length){$('f').selectedIndex=(i+1)%F.length;$('q').focus()}})}
function ed(id){const x=ES[id];EID=id;$('f').value=x.fid;$('q').value=x.qty;$('ft').value=x.fat||'';$('sn').value=x.snf||'';$('am').value=x.amt;$('rt').value=x.rate;RM=1;scrollTo(0,0)}
async function dl(id){if(confirm('Delete?')){await col('entries').doc(id).delete();ld()}}

// ============ 6. FARMERS ============
async function farV(){await fl();mn(`<h2>${t('farmers')}</h2><div class=card><div class=g><label>${t('name')}<input id=fn></label><label>Code<input id=fc></label><label>Mobile<input id=fm type=tel></label></div><button onclick=af()>${t('add')}</button></div><div class=card><div class=tbl><table><tr><th>Code<th>${t('name')}<th>Mobile<th></tr>${op(F,x=>`<tr><td>${x.code||''}<td>${x.name}<td>${x.mobile||''}<td><button class=sm onclick="ef('${x.id}')">✎</button> <button class="sm x" onclick="df('${x.id}')">✕</button></tr>`)}</table></div></div>`)}
async function af(){const n=$('fn').value.trim();if(!n)return;await col('farmers').add({name:n,code:$('fc').value.trim(),mobile:$('fm').value.trim()});farV()}
async function ef(id){const x=F.find(y=>y.id==id),n=prompt('Name',x.name);if(!n)return;const c=prompt('Code',x.code||''),m=prompt('Mobile',x.mobile||'');await col('farmers').doc(id).update({name:n,code:c||'',mobile:m||''});farV()}
async function df(id){if(confirm('Delete farmer? Past entries stay.')){await col('farmers').doc(id).delete();farV()}}

// ============ 7. BILLING (PDF) ============
async function billV(){await fl();mn(`<h2>${t('bill')}</h2><div class=card><label>${t('farmer')}<select id=bf>${op(F,x=>`<option value="${x.id}">${x.code||''} ${x.name}</option>`)}</select></label><div class=g><label>From<input type=date id=b1 value="${D.slice(0,8)}01"></label><label>To<input type=date id=b2 value="${D}"></label><label>Advance ₹<input id=ba type=number value=0></label><label>Cattle feed / other ₹<input id=bd type=number value=0></label></div><div class=tg>${[['1–10',1,10],['11–20',11,20],['21–end',21,31]].map(([n,a,b])=>`<button onclick="sp(${a},${b})">${n}</button>`).join('')}<button onclick="sp(1,31)">Full month</button></div><button onclick=mk()>Generate bill</button> <button onclick=csv()>Report (Excel CSV)</button></div><div id=bl></div>`)}
async function mk(){const id=$('bf').value,a=$('b1').value,b=$('b2').value,f=F.find(x=>x.id==id);if(!f)return;const r=(await ents(a,b)).filter(x=>x.fid==id).sort(srt),q=sum(r,'qty'),s=sum(r,'amt'),ad=+$('ba').value,fd=+$('bd').value;
$('bl').innerHTML=`<div class=card id=bill><div style=text-align:center><img src="assets/logo.png" height=60><h2 style=margin:4px>${C.samiti}</h2><div>Code: ${C.code} • Sudha Dairy</div><h3 style="margin:8px 0;color:#0d47a1">MILK PAYMENT BILL</h3></div><div class=bh><div><b>Samiti / Sachiv</b><br>Sachiv: ${C.sachiv}<br>Contact: ${C.mobile}<br>${C.addr||''}</div><div><b>Farmer</b><br>Name: ${f.name}<br>Code: ${f.code||'-'}<br>Mobile: ${f.mobile||'-'}</div></div><p>Period: <b>${a}</b> – <b>${b}</b> &nbsp;|&nbsp; Bill date: ${D0()}</p><div class=tbl><table><tr><th>Date<th>Shift<th>Qty<th>Fat<th>SNF<th>Rate<th>₹</tr>${op(r,x=>`<tr><td>${x.date}<td>${x.shift=='M'?'Morning':'Evening'}<td>${x.qty}<td>${x.fat||'-'}<td>${x.snf||'-'}<td>${x.rate}<td>${(+x.amt).toFixed(2)}</tr>`)}<tr><th colspan=2>Total<th>${q.toFixed(2)}<th colspan=3><th>${s.toFixed(2)}</tr></table></div><table class=sum><tr><td>Total milk<td>${q.toFixed(2)} kg</tr><tr><td>Total amount<td>₹ ${s.toFixed(2)}</tr><tr><td>Less: Advance<td>− ₹ ${ad.toFixed(2)}</tr><tr><td>Less: Feed / other<td>− ₹ ${fd.toFixed(2)}</tr><tr class=net><td>Net payable<td>₹ ${(s-ad-fd).toFixed(2)}</tr></table><div class=sg><span>Farmer signature</span><span>Sachiv signature</span></div></div><button onclick=print()>⬇ Download PDF</button>`}
function sp(a,b){const m=D.slice(0,8),l=new Date(+D.slice(0,4),+D.slice(5,7),0).getDate();$('b1').value=m+String(a).padStart(2,'0');$('b2').value=m+String(Math.min(b,l)).padStart(2,'0')}
async function csv(){const a=$('b1').value,b=$('b2').value,r=(await ents(a,b)).sort(srt),s='Date,Shift,Farmer,Qty,Fat,SNF,Rate,Amount\n'+r.map(x=>[x.date,x.shift,'"'+x.fname+'"',x.qty,x.fat,x.snf,x.rate,x.amt].join(',')).join('\n'),l=document.createElement('a');l.href=URL.createObjectURL(new Blob(['\ufeff'+s],{type:'text/csv'}));l.download=`report_${a}_${b}.csv`;l.click()}

// ============ 8. PROFIT (BMC) ============
function profV(){mn(`<h2>${t('profit')}</h2>${tg()}<div class=card><b>BMC / Sudha Dairy</b><div class=g><label>${t('qty')}<input id=pq type=number step=any oninput=pc()></label><label>Fat %<input id=pf type=number step=any oninput=pc()></label><label>SNF %<input id=pn type=number step=any oninput=pc()></label></div><p id=pr></p><button onclick=pv()>${t('save')}</button></div><label>Month<input type=month id=pm value="${D.slice(0,7)}" onchange=pt()></label><div id=pl class="card tbl"></div>`);pt()}
function pc(){const q=+$('pq').value,f=+$('pf').value,s=+$('pn').value;PA=q&&f&&s?+(rt(f,s)*q).toFixed(2):0;$('pr').textContent=PA?'BMC rate ₹'+rt(f,s)+'/kg → ₹'+PA:''}
async function pv(){pc();await col('bmc').doc(D+S).set({date:D,shift:S,qty:+$('pq').value||0,fat:+$('pf').value||0,snf:+$('pn').value||0,amt:PA});PA=0;profV()}
async function pt(){const m=$('pm').value,b=(await col('bmc').where('date','>=',m+'-01').where('date','<=',m+'-31').get()).docs.map(d=>d.data()),e=await ents(m+'-01',m+'-31'),k={};b.forEach(x=>k[x.date+x.shift]=x);e.forEach(x=>{k[x.date+x.shift]=k[x.date+x.shift]||{date:x.date,shift:x.shift,qty:0,amt:0}});const a=Object.values(k).sort(srt);let tb=0,tf=0;
$('pl').innerHTML=`<table><tr><th>Date<th>Shift<th>BMC kg<th>BMC ₹<th>Farmers ₹<th>Profit<th></tr>${op(a,x=>{const f=sum(e.filter(y=>y.date==x.date&&y.shift==x.shift),'amt');tb+=x.amt;tf+=f;return `<tr><td>${x.date}<td>${x.shift}<td>${x.qty}<td>${x.amt}<td>${f.toFixed(2)}<td><b>${(x.amt-f).toFixed(2)}</b><td><button class=sm onclick="eb('${x.date}','${x.shift}',${x.qty||0},${x.fat||0},${x.snf||0})">✎</button>${x.fat===undefined?'':` <button class="sm x" onclick="db_('${x.date}','${x.shift}')">✕</button>`}</tr>`})}<tr><th colspan=3>Total<th>${tb.toFixed(2)}<th>${tf.toFixed(2)}<th>${(tb-tf).toFixed(2)}<th></tr></table>`}

// ============ 9. SETTINGS & BACKUP ============
function eb(d,s,q,f,n){D=d;S=s;profV();$('pq').value=q||'';$('pf').value=f||'';$('pn').value=n||'';pc();scrollTo(0,0)}
async function db_(d,s){if(confirm('Delete BMC entry?')){await col('bmc').doc(d+s).delete();pt()}}

function setV(){const r=C.rates;mn(`<h2>${t('set')}</h2><div class=card><p>${C.samiti} (${C.code})<br>${C.sachiv} • ${C.mobile}<br>${C.addr||''}</p><div class=g><label>Fat ₹/kg (3.0–5.9)<input id=r1 type=number step=any value=${r.fat}></label><label>SNF ₹/kg<input id=r2 type=number step=any value=${r.snf}></label><label>Fat ₹/kg (6.0+)<input id=r3 type=number step=any value=${r.hi}></label></div><button onclick=sr()>${t('save')}</button> <button onclick=bk()>⬇ Backup (all data)</button><p><small>Defaults: rate chart effective 10-07-2026</small></p></div>`)}
async function sr(){C.rates={fat:+$('r1').value,snf:+$('r2').value,hi:+$('r3').value};await db.doc('centers/'+U.uid).update({rates:C.rates});alert('Saved')}

async function bk(){const o={center:C};for(const n of['farmers','entries','bmc'])o[n]=(await col(n).get()).docs.map(d=>({id:d.id,...d.data()}));const l=document.createElement('a');l.href=URL.createObjectURL(new Blob([JSON.stringify(o,null,1)],{type:'application/json'}));l.download='backup_'+D0()+'.json';l.click()}
