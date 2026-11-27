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
const SOLVE = ["IA para atendimento inicial","Equipe de vendedores","CRM e rastreamento","Aquisição multicanal","Gestão de tráfego pago","Social Selling","Social Media","Treinamento comercial","Reativação de pacientes","Metas e planejamento"];

const $ = id => document.getElementById(id);

/* O formulário aparece logo após a identificação das dores, antes da diferenciação. */
const contactSection = $("contato");
const differentiationSection = $("diferenciacao");
if(contactSection && differentiationSection){
  differentiationSection.before(contactSection);
}

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

/* Contador */
function tween(el,to,fmt=n=>Math.round(n),d=1200){const s=performance.now();(function f(t){const p=Math.min((t-s)/d,1),e=1-Math.pow(1-p,3);el.textContent=fmt(to*e);p<1&&requestAnimationFrame(f)})(s)}
const brl=n=>Math.round(n).toLocaleString("pt-BR",{style:"currency",currency:"BRL",maximumFractionDigits:0});
/* Máscara de telefone */
$("tel").addEventListener("input", e => {
  let v = e.target.value.replace(/\D/g,"").slice(0,11);
  v = v.length>10 ? v.replace(/(\d{2})(\d{5})(\d{4})/,"($1) $2-$3") : v.length>6 ? v.replace(/(\d{2})(\d{4})(\d{0,4})/,"($1) $2-$3") : v.length>2 ? v.replace(/(\d{2})(\d*)/,"($1) $2") : v;
  e.target.value = v;
});

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
  const msg=`Olá! Preenchi o formulário da LP da Fluxity e gostaria de agendar um diagnóstico comercial.\n\nNome: ${d.nome}\nEspecialidade: ${d.especialidade}\nWhatsApp: ${d.whatsapp}\nFaturamento: ${d.faturamento}\nContatos de marketing: ${d.contatos_marketing}\nAtendimento hoje: ${d.atendimento}\nPerfil: ${d.qualificacao} (${d.score}/9)`;
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
const ctaMessage = "Olá! Gostaria de saber mais sobre a Fluxity e agendar um diagnóstico comercial.";

document.querySelectorAll('a.btn[href="#contato"]').forEach(cta => {
  cta.href=waLink(ctaMessage);
});

/* Perguntas do diagnóstico: o último cartão explorado permanece selecionado. */
(function(){
  const hub=document.querySelector("#diferenciacao .hub");
  const copy=$("hubCopy");
  if(!hub||!copy) return;
  const cards=[...hub.querySelectorAll("[data-hub-card]")];
  const links=[...hub.querySelectorAll("[data-hub-link]")];
  const select=key=>{
    cards.forEach(card=>{
      const active=card.dataset.hubCard===key;
      card.classList.toggle("active",active);
      card.setAttribute("aria-pressed",active);
      if(active) copy.textContent=card.dataset.hubCopy;
    });
    links.forEach(link=>link.classList.toggle("active",link.dataset.hubLink===key));
  };
  cards.forEach(card=>{
    const activate=()=>select(card.dataset.hubCard);
    card.addEventListener("pointerenter",activate);
    card.addEventListener("click",activate);
    card.addEventListener("focus",activate);
    card.addEventListener("keydown",event=>{
      if(event.key!=="Enter"&&event.key!==" ") return;
      event.preventDefault(); activate();
    });
  });
  select("tratamentos");
})();


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

/* Profundidade: brilhos de fundo com paralaxe suave */
(function(){
  const secs=[...document.querySelectorAll("section")]; let tick=false;
  const upd=()=>{tick=false;const vh=innerHeight;secs.forEach(s=>{const r=s.getBoundingClientRect();if(r.bottom<-200||r.top>vh+200)return;s.style.setProperty("--py",((r.top+r.height/2-vh/2)*-.12).toFixed(1)+"px");const d=Math.min(1,Math.abs((r.top+r.height/2-vh/2)/(vh/2+r.height/2)));s.style.setProperty("--sc",(1-d*.06).toFixed(3));});};
  addEventListener("scroll",()=>{if(!tick){tick=true;requestAnimationFrame(upd);}},{passive:true}); upd();
})();

/* Contadores (hero e autoridade) */
document.querySelectorAll("[data-count]").forEach(el=>{
  const to=parseFloat(el.dataset.count), dec=+el.dataset.dec||0, pre=el.dataset.pre||"", suf=el.dataset.suf||"";
  const fmt=n=>pre+n.toLocaleString("pt-BR",{minimumFractionDigits:dec,maximumFractionDigits:dec})+suf;
  new IntersectionObserver((e,o)=>{ if(e[0].isIntersecting){ tween(el,to,fmt,1600); o.disconnect(); } },{threshold:.6}).observe(el);
});
