/* ═══════════════════════════════════════════════
   MAIN.JS — Init, Preloader, Nav, Scroll,
             Reveal, Code Editor, Hero Animations
═══════════════════════════════════════════════ */
(function(){

  // ── Preloader ──────────────────────────────────
  (function preloader(){
    const overlay  = document.getElementById('preloader');
    const fill     = document.getElementById('pre-fill');
    const pCanvas  = document.getElementById('preloader-canvas');
    const ctx      = pCanvas.getContext('2d');
    let   W,H,t=0,done=false;

    pCanvas.width  = W = window.innerWidth;
    pCanvas.height = H = window.innerHeight;

    // Animate spider web on preloader
    function drawPreloaderWeb(){
      ctx.clearRect(0,0,W,H);
      const cx=W/2, cy=H/2;
      const spokes=8, rings=5;
      ctx.strokeStyle='rgba(0,240,255,0.07)';
      ctx.lineWidth=0.8;
      for(let s=0;s<spokes;s++){
        const a=(s/spokes)*Math.PI*2 + t*0.1;
        ctx.beginPath();
        ctx.moveTo(cx,cy);
        ctx.lineTo(cx+Math.cos(a)*Math.min(W,H)*0.6,
                   cy+Math.sin(a)*Math.min(W,H)*0.6);
        ctx.stroke();
      }
      for(let r=1;r<=rings;r++){
        ctx.beginPath();
        for(let s=0;s<spokes;s++){
          const a  = (s/spokes)*Math.PI*2 + t*0.1;
          const ra = ((s+1)/spokes)*Math.PI*2 + t*0.1;
          const rx = cx+Math.cos(a)*r*(Math.min(W,H)/(rings*1.8));
          const ry = cy+Math.sin(a)*r*(Math.min(W,H)/(rings*1.8));
          s===0 ? ctx.moveTo(rx,ry) : ctx.lineTo(rx,ry);
        }
        ctx.closePath(); ctx.stroke();
      }
    }

    let pct=0;
    const interval = setInterval(()=>{
      pct = Math.min(100, pct + Math.random()*12+4);
      fill.style.width = pct+'%';
      if(pct>=100){
        clearInterval(interval);
        setTimeout(()=>{
          overlay.classList.add('hidden');
          done=true;
        }, 300);
      }
    }, 100);

    function loop(){
      if(done) return;
      requestAnimationFrame(loop);
      t+=0.02;
      drawPreloaderWeb();
    }
    loop();
  })();

  // ── Hero name typing animation ─────────────────
  (function heroTyping(){
    const el = document.getElementById('typed-name');
    if(!el) return;
    const text = 'Hi, I am Sivahari G';
    let i = 0;
    function typeChar(){
      if(i <= text.length){
        el.textContent = text.slice(0, i);
        i++;
        setTimeout(typeChar, 80 + Math.random()*40);
      }
    }
    // Start after preloader finishes (~2s)
    setTimeout(typeChar, 2200);
  })();

  // ── Scroll progress + nav ──────────────────────
  const scrollBar = document.getElementById('scroll-bar');
  const navbar    = document.getElementById('navbar');

  window.addEventListener('scroll',()=>{
    const max = document.body.scrollHeight - window.innerHeight;
    scrollBar.style.width = (window.scrollY/max*100)+'%';
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  },{passive:true});

  // ── Mobile nav burger ──────────────────────────
  const burger    = document.getElementById('nav-burger');
  const navLinks  = document.querySelector('.nav-links');
  burger?.addEventListener('click',()=>{
    navLinks.classList.toggle('open');
  });
  navLinks?.querySelectorAll('a').forEach(a=>{
    a.addEventListener('click',()=> navLinks.classList.remove('open'));
  });

  // ── Reveal on scroll ──────────────────────────
  const reveals = document.querySelectorAll('.reveal');
  const revObs  = new IntersectionObserver((entries)=>{
    entries.forEach((e,i)=>{
      if(e.isIntersecting){
        // Stagger by sibling index
        const siblings = [...e.target.closest('.container, .timeline, .contact-grid')
                         ?.querySelectorAll('.reveal') ?? []];
        const idx = siblings.indexOf(e.target);
        e.target.style.transitionDelay = (idx*0.08)+'s';
        e.target.classList.add('visible');
        revObs.unobserve(e.target);
      }
    });
  },{threshold:0.12, rootMargin:'0px 0px -60px 0px'});
  reveals.forEach(el=>revObs.observe(el));

  // ── Timeline line grow ────────────────────────
  const tlLine = document.getElementById('tl-line');
  if(tlLine){
    const tObs = new IntersectionObserver(entries=>{
      if(entries[0].isIntersecting){
        const section = document.getElementById('education');
        tlLine.style.height = section ? section.offsetHeight*0.82+'px' : '600px';
      }
    },{threshold:0.1});
    tObs.observe(document.getElementById('education'));
  }

  // ── Animated code editor ──────────────────────
  (function codeEditor(){
    const el = document.getElementById('code-anim');
    if(!el) return;
    const lines = [
      '<span style="color:#b400ff">const</span> <span style="color:#00f0ff">portfolio</span> = {',
      '  name: <span style="color:#00ff88">"Sivahari G"</span>,',
      '  role: <span style="color:#00ff88">"Full Stack Dev"</span>,',
      '  skills: [<span style="color:#ffd700">...</span>],',
      '};',
      '',
      '<span style="color:#b400ff">function</span> <span style="color:#ff6600">buildFuture</span>() {',
      '  <span style="color:#b400ff">return</span> <span style="color:#00f0ff">portfolio</span>',
      '    .skills.map(<span style="color:#ff6600">s</span> => <span style="color:#00ff88">`✓ ${s}`</span>);',
      '}',
    ];
    let li=0, ci=0;
    el.innerHTML='';
    let div=document.createElement('div');
    el.appendChild(div);

    function type(){
      if(li>=lines.length){ setTimeout(()=>{ el.innerHTML=''; li=0;ci=0; div=document.createElement('div'); el.appendChild(div); type(); },2000); return; }
      const line=lines[li];
      if(ci<=line.length){
        div.innerHTML=line.slice(0,ci)+'<span style="border-right:1px solid #00f0ff;animation:blink 0.7s infinite"></span>';
        ci++;
        setTimeout(type,20+Math.random()*15);
      } else {
        li++; ci=0;
        div=document.createElement('div');
        el.appendChild(div);
        setTimeout(type,40);
      }
    }
    setTimeout(type,2000);
    // Blink style
    const s=document.createElement('style');
    s.textContent='@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}';
    document.head.appendChild(s);
  })();

  // ── Mini chart animation ──────────────────────
  (function miniChart(){
    const el = document.getElementById('chart-anim');
    if(!el) return;
    const bars=[60,80,45,90,70,55,85,65];
    el.innerHTML='';
    bars.forEach((h,i)=>{
      const bar=document.createElement('div');
      bar.className='fm-chart-bar';
      bar.style.cssText=`width:${100/bars.length-3}%;height:${h}%;animation:barFill ${0.8+i*0.1}s ${i*0.08}s cubic-bezier(0.23,1,0.32,1) both`;
      el.appendChild(bar);
    });
    el.style.cssText='display:flex;align-items:flex-end;gap:3%;height:100%;padding:6px';
  })();

  // ── Terminal animation ────────────────────────
  (function terminal(){
    const el=document.getElementById('terminal-anim');
    if(!el) return;
    const cmds=[
      {t:'$ npm install',c:'#00ff88'},
      {t:'Installing...',c:'#888'},
      {t:'✓ Done',c:'#00f0ff'},
      {t:'$ python app.py',c:'#00ff88'},
      {t:'Server: 3000',c:'#ffd700'},
      {t:'[Angular] Live',c:'#ff6600'},
    ];
    let i=0;
    function addLine(){
      if(i>=cmds.length){ el.innerHTML=''; i=0; }
      const d=document.createElement('div');
      d.className='t-line';
      d.style.color=cmds[i].c;
      d.textContent=cmds[i].t;
      el.appendChild(d);
      i++;
      setTimeout(addLine, 1000+Math.random()*600);
    }
    setTimeout(addLine,2500);
  })();

  // ── Keyboard key generator ────────────────────
  (function keyboard(){
    [['keys-r1',15],['keys-r2',14],['keys-r3',13]].forEach(([id,n])=>{
      const el=document.getElementById(id);
      if(!el) return;
      for(let i=0;i<n;i++){
        const k=document.createElement('div');
        k.className='key';
        el.appendChild(k);
      }
    });
  })();

  // ── Orbiting tech icons ───────────────────────
  (function orbitIcons(){
    const container=document.getElementById('orbit-icons');
    if(!container) return;
    const icons=['⚛','🐍','☕','🔥','📊','🌐','⚡','🎯'];
    icons.forEach((ic,i)=>{
      const el=document.createElement('div');
      el.className='orbit-icon';
      el.textContent=ic;
      const angle=(i/icons.length)*360;
      const radius=130;
      el.style.cssText=`
        left:50%; top:50%;
        transform:translate(-50%,-50%) rotate(${angle}deg) translateX(${radius}px) rotate(-${angle}deg);
        animation:orbitSpin ${8+i*0.5}s linear infinite;
        animation-delay:${-i*(8/icons.length)}s;
      `;
      container.appendChild(el);
    });
    const style=document.createElement('style');
    style.textContent=`
      @keyframes orbitSpin {
        from { transform:translate(-50%,-50%) rotate(var(--start,0deg)) translateX(130px) rotate(calc(-1*var(--start,0deg))); }
        to   { transform:translate(-50%,-50%) rotate(calc(var(--start,0deg) + 360deg)) translateX(130px) rotate(calc(-1*(var(--start,0deg) + 360deg))); }
      }
    `;
    // Simpler: just rotate the container
    container.style.animation='spinRing 20s linear infinite';
    document.head.appendChild(style);
  })();

  // ── Animated sys stats ────────────────────────
  (function sysStats(){
    const cpuEl    = document.getElementById('cpu-val');
    const commitEl = document.getElementById('commit-val');
    if(cpuEl) setInterval(()=>{ cpuEl.textContent=(42+Math.floor(Math.random()*30))+'%'; },1200);
    if(commitEl){ let c=247; commitEl.textContent=c; setInterval(()=>{ if(Math.random()>0.97){ c++; commitEl.textContent=c; } },3000); }
  })();

  // ── Active nav highlight ──────────────────────
  (function activeNav(){
    const sections=document.querySelectorAll('section[id]');
    const links=document.querySelectorAll('.nav-links a');
    const obs=new IntersectionObserver(entries=>{
      entries.forEach(e=>{
        if(e.isIntersecting){
          links.forEach(l=>{
            l.style.color = l.getAttribute('href')==='#'+e.target.id ? 'var(--neon-cyan)' : '';
          });
        }
      });
    },{threshold:0.4});
    sections.forEach(s=>obs.observe(s));
  })();

})();