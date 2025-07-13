document.addEventListener('DOMContentLoaded',()=>{const $=id=>document.getElementById(id);
const plusSound=$('plusSound'),minusSound=$('minusSound'),trashSound=$('resetSound');
let soundOn=localStorage.getItem('baldesSound')==='1';$('soundToggle').textContent=soundOn?'🔊':'🔈';
$('soundToggle').onclick=()=>{soundOn=!soundOn;localStorage.setItem('baldesSound',soundOn?'1':'0');$('soundToggle').textContent=soundOn?'🔊':'🔈';};
const safePlay=a=>{if(soundOn){a.currentTime=0;a.play().catch(()=>{});}};
const root=document.documentElement;const setTheme=t=>{root.setAttribute('data-theme',t);localStorage.setItem('baldesTheme',t);$('toggleTheme').textContent=t==='dark'?'🌙':'☀️';};
setTheme(localStorage.getItem('baldesTheme')||'dark');$('toggleTheme').onclick=()=>setTheme(root.getAttribute('data-theme')==='dark'?'light':'dark');
let state={people:[],obs:[]};const save=()=>localStorage.setItem('baldesState',JSON.stringify(state));
const load=()=>{const d=localStorage.getItem('baldesState');if(d)state=JSON.parse(d);};load();
const BEERS=['Amstel 1L','Skol 1L','Amstel 600ml','Budweiser 600ml','Heineken 600ml','Spaten 600ml','Skol 600ml','Tijuca 600ml','Bud Long','GT long','Heineken long','Ice','Stella long'];
function renderPeople(){const list=$('peopleList');list.innerHTML='';state.people.forEach((p,pidx)=>{const wrap=document.createElement('div');wrap.className='person';
const head=document.createElement('div');head.className='person-header';const h3=document.createElement('h3');h3.textContent=(p.open?'▼ ':'▶ ')+p.name;head.appendChild(h3);wrap.appendChild(head);
const body=document.createElement('div');body.className='person-body';if(!p.open)body.classList.add('hidden');
const selWrap=document.createElement('div');selWrap.className='select-wrapper';const sel=document.createElement('select');BEERS.forEach(b=>{const o=document.createElement('option');o.value=o.text=b;sel.appendChild(o);});
const addB=document.createElement('button');addB.textContent='Adicionar';addB.className='btn-plus';addB.onclick=()=>{if(!p.beers.some(x=>x.name===sel.value)){p.beers.push({name:sel.value,pending:0,confirmed:0});save();renderPeople();}};
selWrap.append(sel,addB);body.appendChild(selWrap);
p.beers.forEach((b,bidx)=>{const line=document.createElement('div');line.className='beer';line.innerHTML=`<strong>${b.name}</strong> <span style="color:orange;">⏳ ${b.pending}</span> / <span style="color:limegreen;">✅ ${b.confirmed}</span>`;
const plus=document.createElement('button');plus.textContent='+';plus.className='btn-plus';plus.onclick=()=>{b.pending++;save();renderPeople();};
const minus=document.createElement('button');minus.textContent='−';minus.className='btn-minus';minus.onclick=()=>{if(!confirm('Remover 1 balde?'))return;if(b.pending>0)b.pending--;else if(b.confirmed>0)b.confirmed--;safePlay(minusSound);navigator.vibrate?.(100);save();renderPeople();renderHistory();};
const conf=document.createElement('button');conf.textContent='✔️';conf.className='btn-plus';conf.onclick=()=>{const moved=b.pending;b.confirmed+=b.pending;b.pending=0;if(moved>0)safePlay(plusSound);save();renderPeople();renderHistory();};
const del=document.createElement('button');del.textContent='🗑️';del.className='btn-del';del.onclick=()=>{if(!confirm('Excluir esta cerveja?\n(Todos os baldes pendentes e confirmados serão perdidos)'))return;if(!confirm('Tem certeza MESMO? Essa ação não pode ser desfeita.'))return;p.beers.splice(bidx,1);save();renderPeople();renderHistory();};
line.append(plus,minus,conf,del);body.appendChild(line);});
wrap.appendChild(body);head.onclick=()=>{p.open=!p.open;save();renderPeople();};list.appendChild(wrap);});}
function renderHistory(){const div=$('historyList');const arr=state.people.map(p=>({name:p.name,total:p.beers.reduce((s,b)=>s+b.confirmed,0)})).sort((a,b)=>b.total-a.total);
div.innerHTML=`<h3>Total: ${arr.reduce((s,x)=>s+x.total,0)} baldes</h3>`;arr.forEach(o=>{const d=document.createElement('div');d.textContent=`${o.name}: ${o.total}`;div.appendChild(d);});}
function renderObs(){const ul=$('obsList');ul.innerHTML='';state.obs.forEach(o=>{const li=document.createElement('li');li.textContent=`${o.text} (${o.time})`;ul.appendChild(li);});}
function renderAll(){renderPeople();renderHistory();renderObs();}
$('addPerson').onclick=()=>{const name=$('personName').value.trim();if(!name)return;state.people.push({name,beers:[],open:true});$('personName').value='';save();renderPeople();};
$('historyToggle').onclick=()=>$('historySection').classList.toggle('hidden');$('addObs').onclick=()=>{const txt=$('obsText').value.trim();if(!txt)return;state.obs.unshift({text:txt,time:new Date().toLocaleString()});$('obsText').value='';save();renderObs();};
$('resetAll').onclick=()=>{if(!confirm('Apagar TODOS os dados?'))return;state={people:[],obs:[]};save();renderAll();safePlay(trashSound);};
$('shareWA').onclick=()=>{const hist=state.people.map(p=>`${p.name}: ${p.beers.reduce((s,b)=>s+b.confirmed,0)} baldes`).join('\n');const obs=state.obs.length?state.obs.map(o=>`• ${o.text} (${o.time})`).join('\n'):'Nenhuma observação';const msg=`*Histórico de Baldes*\n${hist}\n\n*Observações*\n${obs}`;window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`,'_blank');};
renderAll();});

const obsHeader = document.getElementById("obsHeader");
const obsBody = document.getElementById("obsBody");
if (obsHeader && obsBody) {
  obsHeader.addEventListener("click", () => {
    obsBody.classList.toggle("show");
  });
}

/* ==== Comando de voz + API GPT ==== */
const API_URL = "https://controle-baldes-api.vercel.app/api/comando";  // troque se seu domínio for outro

const voiceBtn = document.getElementById("voiceBtn");
if (voiceBtn && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)) {
  const recog = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recog.lang = "pt-BR";

  voiceBtn.addEventListener("click", () => {
    recog.start();
    voiceBtn.classList.add("listening");
  });

  recog.addEventListener("end", () => {
    voiceBtn.classList.remove("listening");
  });

  recog.addEventListener("result", async (e) => {
    const frase = e.results[0][0].transcript;
    try {
      const resposta = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mensagem: frase })
      });
      const data = await resposta.json();
      const json = typeof data === "string" ? JSON.parse(data) : data;

      if (json.acao === "adicionar_balde") {
        // Procura a pessoa já cadastrada
        let pessoa = pessoas.find(p => p.name.toLowerCase() === json.pessoa.toLowerCase());
        if (!pessoa) {
          // cria se não existir
          pessoa = adicionarPessoa(json.pessoa);   // *use sua função existente*
        }
        adicionarBalde(pessoa.id, json.cerveja);    // *use sua função existente*
        alert(`Balde de ${json.cerveja} adicionado para ${json.pessoa}`);
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao processar comando por voz.");
    }
  });
} else {
  console.warn("Reconhecimento de voz não suportado neste navegador.");
}
