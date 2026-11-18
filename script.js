/* ========= CONFIGURAÇÃO ========= */
const CONFIG = {
  whatsapp: "557182150425",   // número com DDI+DDD, sem símbolos (71 8215-0425)
  countdown: 5,                // segundos da tela de obrigado antes de abrir o WhatsApp
  webhook: "",                 // URL (Make, Zapier, n8n, RD Station...) que recebe cada lead em JSON. Ideal preencher!
  redirect: "whatsapp",        // "whatsapp" ou uma URL, ex: "obrigado.html"
  metaPixel: "",               // ID do Pixel da Meta (opcional)
  ga4: ""                      // ID do Google Analytics 4, ex: "G-XXXXXXXXXX" (opcional)
};
/* Rastreamento (só carrega se o ID estiver preenchido) */
(function(){
  if(CONFIG.ga4){const g=document.createElement("script");g.async=true;g.src="https://www.googletagmanager.com/gtag/js?id="+CONFIG.ga4;document.head.appendChild(g);
    window.dataLayer=window.dataLayer||[];window.gtag=function(){dataLayer.push(arguments)};gtag("js",new Date());gtag("config",CONFIG.ga4);}
  if(CONFIG.metaPixel){!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version="2.0";n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,"script","https://connect.facebook.net/en_US/fbevents.js");fbq("init",CONFIG.metaPixel);fbq("track","PageView");}
})();
const track=(n)=>{try{window.fbq&&fbq("track",n==="lead"?"Lead":"Contact");window.gtag&&gtag("event",n==="lead"?"generate_lead":"click_whatsapp")}catch(_){}};
const SOLVE = ["Captação de pacientes particulares","Tráfego pago","Atendimento pelo WhatsApp","Follow-up ativo","Confirmação e lembrete","CRM e rastreamento","Relatórios com métricas reais","Treinamento da equipe","Previsibilidade comercial","Consultas e cirurgias agendadas"];

const $ = id => document.getElementById(id);
/* Faixa infinita */
const t = document.getElementById("track");
const set = SOLVE.map(s => `<span>${s}</span>`).join("");
t.innerHTML = set + set + set + set;

/* Nav + reveal */
const nav = document.getElementById("nav");
addEventListener("scroll", () => nav.classList.toggle("s", scrollY > 40), {passive:true});
const io = new IntersectionObserver(e => e.forEach(x => x.isIntersecting && x.target.classList.add("on")), {threshold:.15});
document.querySelectorAll(".grid").forEach(g => [...g.children].forEach((c,i) => c.style.setProperty("--i", i)));
document.querySelectorAll("section h2, section .sub, #problema .sepl").forEach(el=>el.classList.add("rv"));
document.querySelectorAll(".rv").forEach(el => io.observe(el));
addEventListener("scroll", () => { $("bar").style.width = (scrollY / (document.documentElement.scrollHeight - innerHeight) * 100) + "%"; }, {passive:true});
document.querySelectorAll(".card").forEach(c => {
  c.addEventListener("mousemove", e => { const r = c.getBoundingClientRect(), x = (e.clientX-r.left)/r.width-.5, y = (e.clientY-r.top)/r.height-.5; c.style.transform = `perspective(700px) rotateY(${x*8}deg) rotateX(${-y*8}deg) translateY(-6px)`; });
  c.addEventListener("mouseleave", () => c.style.transform = "");
});

/* Contador */
function tween(el,to,fmt=n=>Math.round(n),d=1200){const s=performance.now();(function f(t){const p=Math.min((t-s)/d,1),e=1-Math.pow(1-p,3);el.textContent=fmt(to*e);p<1&&requestAnimationFrame(f)})(s)}
const brl=n=>Math.round(n).toLocaleString("pt-BR",{style:"currency",currency:"BRL",maximumFractionDigits:0});
/* Calculadora */
function calc(){
  const L=+$("iL").value||0,C=+$("iC").value||0,P=+$("iP").value||0,T=+$("iT").value||0;
  const a=L*C/100*T,b=L*P/100*T,h=Math.round(L*C/100),f=Math.round(L*P/100);
  tween($("rA"),a,brl,600);tween($("rB"),b,brl,600);tween($("rN"),Math.max(b-a,0),brl,600);
  tween($("pH"),h,undefined,600);tween($("pF"),f,undefined,600);tween($("pE"),Math.max(f-h,0),undefined,600);tween($("rY"),Math.max(b-a,0)*12,brl,600);
  $("sA").textContent="Conversão atual: "+C.toLocaleString("pt-BR")+"%";
  $("sB").textContent="Conversão projetada: "+P.toLocaleString("pt-BR")+"%";
  $("sN").textContent="Com "+L+" contatos por mês, saindo de "+C+"% para "+P+"% de conversão.";
}
["iL","iC","iP","iT"].forEach(i=>$(i).addEventListener("input",calc)); calc();
/* Antes x depois (valores ilustrativos: edite aqui) */
const SIM={ticket:1200,bad:{leads:200,resp:.75,ag:.32,pac:.70},good:{leads:215,resp:.93,ag:.35,pac:.76}};
function funnel(c){const r=Math.round(c.leads*c.resp),a=Math.round(r*c.ag),p=Math.round(a*c.pac);return[["Leads captados",c.leads],["Leads atendidos a tempo",r],["Agendamentos",a],["Pacientes atendidos",p]]}
function runSim(){
  const max=SIM.good.leads, fb=funnel(SIM.bad), fg=funnel(SIM.good);
  const rows=f=>f.map(([l])=>`<div class="fr2"><span>${l}</span><div class="fb"><u><b>0</b></u></div></div>`).join("");
  $("fnBad").innerHTML=rows(fb); $("fnGood").innerHTML=rows(fg);
  [["fnBad",fb],["fnGood",fg]].forEach(([id,f])=>[...$(id).children].forEach((r,i)=>setTimeout(()=>{
    r.querySelector("u").style.width=Math.max(24,f[i][1]/max*100)+"%"; tween(r.querySelector("b"),f[i][1]);
  },150+i*260)));
  const rb=fb[3][1]*SIM.ticket, rg=fg[3][1]*SIM.ticket;
  tween($("rvBad"),rb,brl,1800); tween($("rvGood"),rg,brl,1800); tween($("gain"),rg-rb,n=>"+"+brl(n),1800);
}
$("simReplay").onclick=runSim;
new IntersectionObserver((e,o)=>e[0].isIntersecting&&(runSim(),o.disconnect()),{threshold:.25}).observe($("antes-depois"));

/* Máscara de telefone */
$("tel").addEventListener("input", e => {
  let v = e.target.value.replace(/\D/g,"").slice(0,11);
  v = v.length>10 ? v.replace(/(\d{2})(\d{5})(\d{4})/,"($1) $2-$3") : v.length>6 ? v.replace(/(\d{2})(\d{4})(\d{0,4})/,"($1) $2-$3") : v.length>2 ? v.replace(/(\d{2})(\d*)/,"($1) $2") : v;
  e.target.value = v;
});

/* Conversas reais animadas (troque pelos seus prints/textos reais) */
const CHATS=[
 {chip:"6h20 sem resposta",t:"Lead esperando 6h20",d:"Paciente pediu para agendar consulta e ficou horas sem retorno. Quando a resposta chega tarde, a intenção esfria e a oportunidade fica muito mais frágil.",day:"Segunda, 29 de maio",
  m:[["in","Olá, gostaria de agendar uma consulta com o doutor.","02:21"],["out","Bom dia, com quem eu falo?\n\nEssa semana o doutor tem disponibilidade na quinta-feira, às 16h.","08:41"],["out","Para eu fazer o agendamento, me passe os seguintes dados, por favor:\nNome\nData de nascimento\nCPF\nCelular\nEndereço","08:41"]]},
 {chip:"25 min de espera",t:"Preço sem condução",d:"O paciente pergunta o valor e recebe um número seco. Sem construir valor nem conduzir a conversa, ele pede desconto e a venda esfria.",day:"Hoje",
  m:[["in","E o valor da consulta também? Por favor.","15:26"],["out","Boa tarde.\nDesculpe a demora, eu estava em procedimento.","15:51"],["out","O valor da consulta presencial é de R$ 450.","15:51"],["in","Existe alguma forma de redução do valor?","15:52"],["out","A consulta particular acontece com atendimento personalizado, tempo dedicado e foco total no seu caso.","15:54"]]},
 {chip:"Resposta só no dia seguinte",t:"Contato que esfria",d:"A primeira mensagem fica sem retorno até o outro dia. Quando alguém responde, o paciente já perguntou o preço e o interesse não é mais o mesmo.",day:"Segunda-feira",
  m:[["in","Olá, gostaria de obter mais informações sobre o atendimento.","09:48"],["out","Bom dia.\nTudo bem? Aqui é o time comercial da clínica. Como podemos te ajudar?","07:03"],["in","Gostaria de saber o valor da consulta.","07:16"],["out","A primeira consulta presencial está em R$ 450, com direito a retorno em até 60 dias. Se for online, ela está em R$ 300.","07:23"]]}
];
let ci=0, run=0, auto;
const msgs=$("msgs"), dots=$("cDots");
CHATS.forEach(()=>dots.appendChild(document.createElement("span")));
function show(i){
  ci=(i+CHATS.length)%CHATS.length; const id=++run, c=CHATS[ci];
  clearTimeout(auto); msgs.innerHTML="";
  [...dots.children].forEach((d,k)=>d.classList.toggle("on",k===ci));
  const info=$("cInfo"); info.classList.remove("sw"); void info.offsetWidth; info.classList.add("sw");
  $("cChip").textContent=c.chip; $("cPrint").textContent="Print 0"+(ci+1); $("cTitle").textContent=c.t; $("cDesc").textContent=c.d;
  let t=300;
  const at=(ms,fn)=>setTimeout(()=>run===id&&fn(),ms);
  at(t,()=>{const d=document.createElement("div");d.className="dayl";d.textContent=c.day;msgs.appendChild(d)});
  c.m.forEach(([side,txt,hr])=>{
    t+=side==="out"?600:700;
    if(side==="out"){const T=t; at(T,()=>{const ty=document.createElement("div");ty.className="typing";ty.id="ty";ty.innerHTML="<b></b><b></b><b></b>";msgs.appendChild(ty)}); t+=1100; at(t,()=>$("ty")&&$("ty").remove());}
    at(t,()=>{const m=document.createElement("div");m.className="m "+(side==="in"?"lead":"out");m.innerHTML=txt.replace(/</g,"&lt;")+"<small>"+hr+"</small>";msgs.appendChild(m)});
  });
  auto=setTimeout(()=>run===id&&show(ci+1),t+4500);
}
$("cPrev").onclick=()=>show(ci-1); $("cNext").onclick=()=>show(ci+1);
new IntersectionObserver((e,o)=>e[0].isIntersecting&&(show(0),o.disconnect()),{threshold:.3}).observe($("conversas"));

/* Formulário + qualificação + tela de obrigado */
const QUAL={ /* pontos por resposta (máx. 9). Edite aqui os critérios */
  fat:{"Até R$ 30 mil":0,"R$ 30 mil a R$ 70 mil":1,"R$ 70 mil a R$ 150 mil":2,"R$ 150 mil a R$ 300 mil":3,"Acima de R$ 300 mil":3},
  mkt:{"Sim, todos os dias":3,"Sim, toda semana":2,"Sim, de vez em quando":1,"Ainda não recebo":1},
  aten:{"Eu mesmo(a) atendo":3,"Secretária ou recepção atende":3,"Não tenho processo definido":3,"Equipe de atendimento":2,"Já tenho comercial estruturado":1},
  niveis:[[7,"Alta prioridade"],[4,"Média prioridade"],[0,"Em avaliação"]]
};
function qualify(d){
  const score=(QUAL.fat[d.faturamento]||0)+(QUAL.mkt[d.contatos_marketing]||0)+(QUAL.aten[d.atendimento]||0);
  return {score,qualificacao:QUAL.niveis.find(([min])=>score>=min)[1]};
}
const rules={
  nome:v=>v.trim().split(/\s+/).filter(Boolean).length>=2&&v.trim().length>=5,
  espec:v=>v.trim().length>=3,
  tel:v=>v.replace(/\D/g,"").length>=10,
  fat:v=>!!v, mkt:v=>!!v, aten:v=>!!v
};
function showThanks(d){
  const msg=`Olá! Sou ${d.nome} (${d.especialidade}) e preenchi o formulário da Fluxity.\nFaturamento: ${d.faturamento}\nContatos de marketing: ${d.contatos_marketing}\nAtendimento hoje: ${d.atendimento}\nPerfil: ${d.qualificacao} (${d.score}/9)`;
  const url=CONFIG.redirect==="whatsapp"?waLink(msg):CONFIG.redirect;
  const box=$("thx"), ring=$("thxRing"), total=CONFIG.countdown||5;
  box.hidden=false; document.body.classList.add("lock");
  $("thxGo").href=url;
  ring.style.animation="none"; void ring.getBoundingClientRect(); ring.style.animation=`thxring ${total}s linear forwards`;
  let n=total; $("thxN").textContent=n;
  const iv=setInterval(()=>{n--; if(n<=0){clearInterval(iv);location.href=url;} else $("thxN").textContent=n;},1000);
  $("thxGo").onclick=()=>clearInterval(iv);
}
document.querySelectorAll("#form input,#form select").forEach(el=>["input","change"].forEach(ev=>el.addEventListener(ev,()=>el.closest(".f").classList.remove("err"))));
$("form").addEventListener("submit",async e=>{
  e.preventDefault();
  let ok=true;
  Object.keys(rules).forEach(id=>{
    const valid=rules[id]($(id).value);
    $(id).closest(".f").classList.toggle("err",!valid);
    if(!valid) ok=false;
  });
  if(!ok){ const f=document.querySelector("#form .f.err input,#form .f.err select"); f&&f.focus({preventScroll:false}); return; }
  const q=new URLSearchParams(location.search), utm={};
  ["utm_source","utm_medium","utm_campaign","utm_content","utm_term","fbclid","gclid"].forEach(k=>q.get(k)&&(utm[k]=q.get(k)));
  const d={nome:$("nome").value.trim(),especialidade:$("espec").value.trim(),whatsapp:"+55 "+$("tel").value,
           faturamento:$("fat").value,contatos_marketing:$("mkt").value,atendimento:$("aten").value,...utm,origem:location.href,data:new Date().toISOString()};
  Object.assign(d,qualify(d));
  try{localStorage.setItem("fluxity_lead",JSON.stringify(d));}catch(_){}
  const btn=$("send"); btn.disabled=true; btn.textContent="Enviando...";
  if(CONFIG.webhook){
    const ctl=new AbortController(), to=setTimeout(()=>ctl.abort(),2500);
    try{await fetch(CONFIG.webhook,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(d),keepalive:true,signal:ctl.signal});}catch(_){}
    clearTimeout(to);
  }
  track("lead");
  showThanks(d);
});

const waLink = m => `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(m)}`;


/* Acolhimento: 4 a 6 de cada 10 contatos se perdem */
new IntersectionObserver((e,o)=>{
  if(!e[0].isIntersecting) return; o.disconnect();
  tween($("s1"),4,undefined,1500); tween($("s2"),6,undefined,1900);
  const u=document.querySelectorAll("#dots .rng-track u"); [["40%",0],["20%",.9],["40%",1.7]].forEach(([w,dl],i)=>{u[i].style.transitionDelay=dl+"s";u[i].style.width=w;});
},{threshold:.45}).observe($("ac"));

/* Carrossel de cards dos sócios */
(function(){
  const t=$("crTrack"),c=[...t.children],dots=[...document.querySelectorAll("#csDots i")];
  let i=0;
  function pos(){
    const n=c.length;
    c.forEach((e,idx)=>{
      const p=((idx-i+n+1)%n)-1, old=e._p; e._p=p;
      const wrap=old!==undefined&&Math.abs(p-old)>1;
      if(wrap) e.classList.add("jump");
      e.style.setProperty("--p",p);
      if(wrap){void e.offsetWidth; e.classList.remove("jump");}
    });
  }
  function go(k){
    i=(k+c.length)%c.length;
    c.forEach((e,j)=>e.classList.toggle("act",j===i));
    dots.forEach((d,j)=>{d.classList.remove("on");d.classList.toggle("done",j<i);if(j===i){void d.offsetWidth;d.classList.add("on")}});
    pos();
  }
  $("csDots").addEventListener("animationend",()=>go(i+1));
  dots.forEach((d,j)=>d.onclick=()=>go(j));
  $("csP").onclick=()=>go(i-1); $("csN2").onclick=()=>go(i+1);
  addEventListener("resize",pos);
  new IntersectionObserver((e,o)=>{if(e[0].isIntersecting){go(1);o.disconnect()}},{threshold:.3}).observe($("cr"));
  go(1);
})();

/* Carrossel: rolagem lateral (touchpad/mouse), arrastar e deslizar no celular */
(function(){
  const box=$("cr"); let lock=false, acc=0, sx=null;
  const step=d=>{ if(lock) return; lock=true; (d>0?$("csN2"):$("csP")).click(); setTimeout(()=>lock=false,650); };
  box.addEventListener("wheel",e=>{
    const h=Math.abs(e.deltaX)>Math.abs(e.deltaY)?e.deltaX:(e.shiftKey?e.deltaY:0);
    if(!h) return;
    e.preventDefault();
    acc+=h; if(Math.abs(acc)>25){ step(acc); acc=0; }
  },{passive:false});
  box.addEventListener("pointerdown",e=>{sx=e.clientX});
  addEventListener("pointerup",e=>{ if(sx===null) return; const d=sx-e.clientX; sx=null; if(Math.abs(d)>50) step(d); });
})();



/* Clicar num card lateral traz ele para o centro */
(function(){
  const box=$("cr"), dots=[...document.querySelectorAll("#csDots i")]; let px=0;
  box.addEventListener("pointerdown",e=>{px=e.clientX});
  [...$("crTrack").children].forEach((el,k)=>el.addEventListener("click",e=>{ if(!el.classList.contains("act")&&Math.abs(e.clientX-px)<8) dots[k].click(); }));
})();

/* Rolagem suave com inércia (só mouse/touchpad no desktop) */
(function(){
  if(matchMedia("(prefers-reduced-motion: reduce)").matches||matchMedia("(pointer:coarse)").matches) return;
  let target=scrollY,cur=scrollY,raf=null;
  const max=()=>document.documentElement.scrollHeight-innerHeight;
  const loop=()=>{
    cur+=(target-cur)*.1;
    if(Math.abs(target-cur)<.5){cur=target;scrollTo({top:cur,left:0,behavior:"instant"});raf=null;return;}
    scrollTo({top:cur,left:0,behavior:"instant"});raf=requestAnimationFrame(loop);
  };
  addEventListener("wheel",e=>{
    if(document.body.classList.contains("lock")||e.defaultPrevented||e.ctrlKey||e.shiftKey||Math.abs(e.deltaX)>Math.abs(e.deltaY)) return;
    
    e.preventDefault();
    let d=e.deltaY; if(e.deltaMode===1) d*=32; else if(e.deltaMode===2) d*=innerHeight;
    const base=raf?target:scrollY; if(!raf) cur=scrollY;
    target=Math.max(0,Math.min(max(),base+d));
    if(!raf) raf=requestAnimationFrame(loop);
  },{passive:false});
  addEventListener("scroll",()=>{ if(!raf){cur=target=scrollY;} },{passive:true});
})();
/* Ponto que acompanha o mouse com atraso */
(function(){
  if(matchMedia("(pointer:coarse)").matches||matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const d=document.createElement("div"); d.className="cdot"; d.setAttribute("aria-hidden","true"); document.body.appendChild(d);
  let x=0,y=0,tx=0,ty=0,shown=false;
  addEventListener("mousemove",e=>{tx=e.clientX;ty=e.clientY;if(!shown){x=tx;y=ty;shown=true;d.style.opacity=1;}},{passive:true});
  document.addEventListener("mouseleave",()=>{d.style.opacity=0;shown=false;});
  
  (function loop(){x+=(tx-x)*.15;y+=(ty-y)*.15;d.style.transform=`translate3d(${x}px,${y}px,0) translate(-50%,-50%)`;requestAnimationFrame(loop);})();
})();

/* "Ver detalhes" dos serviços */
document.querySelectorAll(".sv-m").forEach(b=>b.addEventListener("click",()=>{const c=b.closest(".sv-c"),o=c.classList.toggle("open");b.setAttribute("aria-expanded",o);}));

/* Profundidade: brilhos de fundo com paralaxe suave */
(function(){
  const secs=[...document.querySelectorAll("section")]; let tick=false;
  const upd=()=>{tick=false;const vh=innerHeight;secs.forEach(s=>{const r=s.getBoundingClientRect();if(r.bottom<-200||r.top>vh+200)return;s.style.setProperty("--py",((r.top+r.height/2-vh/2)*-.12).toFixed(1)+"px");const d=Math.min(1,Math.abs((r.top+r.height/2-vh/2)/(vh/2+r.height/2)));s.style.setProperty("--sc",(1-d*.06).toFixed(3));});};
  addEventListener("scroll",()=>{if(!tick){tick=true;requestAnimationFrame(upd);}},{passive:true}); upd();
})();
