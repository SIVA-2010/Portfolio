/* ═══════════════════════════════════════════════
   PARALLAX.JS — Mouse Tilt, Hero BG Grid,
                 Skills Node Web, Contact BG
═══════════════════════════════════════════════ */
(function(){

  // ── Custom cursor tracker ─────────────────────
  document.addEventListener('mousemove', e=>{
    document.documentElement.style.setProperty('--cx', e.clientX+'px');
    document.documentElement.style.setProperty('--cy', e.clientY+'px');
  });

  // ── Hero BG grid ──────────────────────────────
  (function heroGrid(){
    const canvas = document.getElementById('hero-bg');
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    let W,H;

    function resize(){
      W=canvas.width=window.innerWidth;
      H=canvas.height=window.innerHeight;
    }
    resize();
    window.addEventListener('resize',resize);

    let ox=0,oy=0;
    document.addEventListener('mousemove',e=>{
      ox = (e.clientX/window.innerWidth -0.5)*20;
      oy = (e.clientY/window.innerHeight-0.5)*20;
    });

    let offX=0, offY=0;
    function draw(){
      requestAnimationFrame(draw);
      offX += (ox-offX)*0.06;
      offY += (oy-offY)*0.06;
      ctx.clearRect(0,0,W,H);

      // Grid
      const step=60;
      ctx.strokeStyle='rgba(0,240,255,0.05)';
      ctx.lineWidth=1;
      const startX = (offX%step)-step;
      const startY = (offY%step)-step;
      for(let x=startX;x<W+step;x+=step){
        ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke();
      }
      for(let y=startY;y<H+step;y+=step){
        ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke();
      }

      // Corner accent
      ctx.strokeStyle='rgba(255,0,60,0.12)';
      ctx.lineWidth=0.5;
      [[0,0],[W,0],[0,H],[W,H]].forEach(([cx,cy])=>{
        ctx.beginPath();
        ctx.arc(cx,cy,80+offX*0.5,0,Math.PI*2);
        ctx.stroke();
      });

      // Center crosshair
      ctx.strokeStyle='rgba(0,240,255,0.06)';
      ctx.lineWidth=0.8;
      ctx.beginPath(); ctx.moveTo(W/2+offX,0); ctx.lineTo(W/2+offX,H); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0,H/2+offY); ctx.lineTo(W,H/2+offY); ctx.stroke();
    }
    draw();
  })();

  // ── Workstation mouse tilt ────────────────────
  const ws = document.querySelector('.hero-workstation');
  const desk = document.querySelector('.desk');
  if(ws && desk){
    document.addEventListener('mousemove',e=>{
      const rx = (e.clientY/window.innerHeight - 0.5) * 8;
      const ry = (e.clientX/window.innerWidth  - 0.5) * -6;
      desk.style.transform = `rotateX(${12+rx}deg) rotateY(${ry}deg)`;
    });
  }

  // ── Holographic panel hover ───────────────────
  document.querySelectorAll('.holo-panel').forEach(panel=>{
    document.addEventListener('mousemove',e=>{
      const rect = panel.getBoundingClientRect();
      const cx   = rect.left + rect.width/2;
      const cy   = rect.top  + rect.height/2;
      const dist = Math.hypot(e.clientX-cx, e.clientY-cy);
      const glow = Math.max(0, 1 - dist/300);
      panel.style.boxShadow = `0 0 ${30+glow*40}px rgba(0,240,255,${0.05+glow*0.25})`;
    });
  });

  // ── Skills Node Web ───────────────────────────
  (function skillsWeb(){
    const canvas = document.getElementById('skills-canvas');
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    let W,H;

    const SKILLS = [
      // lang
      {name:'Python',    cat:'lang',  prof:90, color:'#00f0ff'},
      {name:'JavaScript',cat:'lang',  prof:85, color:'#00f0ff'},
      {name:'Java',      cat:'lang',  prof:72, color:'#00f0ff'},
      // web
      {name:'HTML5',     cat:'web',   prof:92, color:'#ff6600'},
      {name:'CSS3',      cat:'web',   prof:88, color:'#ff6600'},
      {name:'Angular',   cat:'web',   prof:80, color:'#ff6600'},
      // db
      {name:'SQL',       cat:'db',    prof:82, color:'#00ff88'},
      // tools
      {name:'Git',       cat:'tools', prof:85, color:'#ffd700'},
    ];

    let nodes = [];
    let mouse = {x:-999,y:-999};
    let animT = 0;

    function resize(){
      W = canvas.width  = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
      layoutNodes();
    }

    function layoutNodes(){
      const cols = 5;
      const totalRows = Math.ceil(SKILLS.length/cols);
      nodes = SKILLS.map((s,i)=>{
        const row  = Math.floor(i/cols);
        const colInRow = i % cols;
        const itemsInRow = (row < totalRows-1) ? cols : (SKILLS.length - row*cols);
        // Center each row: offset so items are centered horizontally
        const rowWidth = 0.76;
        const startX = 0.12 + (cols - itemsInRow) / (cols-1||1) * rowWidth * 0.5;
        const spacing = itemsInRow > 1 ? rowWidth / (itemsInRow-1) : 0;
        return {
          ...s,
          x: W*(startX + colInRow * spacing),
          y: H*(0.25 + (row/(totalRows||1))*0.50),
          baseX:0, baseY:0,
          vx:0, vy:0,
          hovered:false,
          r: 24 + s.prof*0.08,
        };
      });
      nodes.forEach(n=>{ n.baseX=n.x; n.baseY=n.y; });
    }

    canvas.addEventListener('mousemove',e=>{
      const rect=canvas.getBoundingClientRect();
      mouse.x=e.clientX-rect.left;
      mouse.y=e.clientY-rect.top;
    });
    canvas.addEventListener('mouseleave',()=>{ mouse.x=-999; mouse.y=-999; });

    function drawWeb(){
      // Draw connections
      nodes.forEach((a,i)=>{
        nodes.slice(i+1).forEach(b=>{
          const dist = Math.hypot(a.x-b.x, a.y-b.y);
          if(dist > 260) return;
          const mDist = Math.min(Math.hypot(mouse.x-a.x, mouse.y-a.y),
                                  Math.hypot(mouse.x-b.x, mouse.y-b.y));
          const glow = Math.max(0, 1 - mDist/150);
          const alpha = 0.08 + glow*0.35;
          const grad = ctx.createLinearGradient(a.x,a.y,b.x,b.y);
          grad.addColorStop(0,`${a.color}${Math.round(alpha*255).toString(16).padStart(2,'0')}`);
          grad.addColorStop(1,`${b.color}${Math.round(alpha*255).toString(16).padStart(2,'0')}`);
          ctx.strokeStyle = grad;
          ctx.lineWidth   = 0.6 + glow*1.5;
          ctx.shadowColor = a.color; ctx.shadowBlur = glow*10;
          ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
          ctx.shadowBlur=0;
        });
      });

      // Draw nodes
      nodes.forEach(n=>{
        const mDist = Math.hypot(mouse.x-n.x, mouse.y-n.y);
        n.hovered = mDist < n.r + 12;
        const pulse = 1 + Math.sin(animT*2 + n.x*0.01)*0.08;
        const r = n.r * (n.hovered ? 1.3 : pulse);
        const alpha = n.hovered ? 0.25 : 0.12;

        // Outer ring
        ctx.beginPath();
        ctx.arc(n.x, n.y, r+6, 0, Math.PI*2);
        ctx.strokeStyle = n.color;
        ctx.lineWidth   = 0.8;
        ctx.globalAlpha = 0.3 * (n.hovered?1:pulse);
        ctx.shadowColor = n.color; ctx.shadowBlur = n.hovered?20:8;
        ctx.stroke();
        ctx.shadowBlur=0;

        // Fill
        ctx.globalAlpha=1;
        ctx.beginPath();
        ctx.arc(n.x,n.y,r,0,Math.PI*2);
        ctx.fillStyle = `${n.color}${Math.round(alpha*255).toString(16).padStart(2,'0')}`;
        ctx.fill();
        ctx.strokeStyle=n.color; ctx.lineWidth=1.2;
        ctx.globalAlpha = n.hovered ? 0.9 : 0.55;
        ctx.stroke();

        // Label
        ctx.globalAlpha = n.hovered ? 1 : 0.7;
        ctx.fillStyle = n.hovered ? '#fff' : n.color;
        ctx.font = `${n.hovered?600:400} ${Math.round(r*0.38)}px 'Rajdhani', sans-serif`;
        ctx.textAlign='center'; ctx.textBaseline='middle';
        ctx.fillText(n.name, n.x, n.y);
      });
    }

    function loop(){
      requestAnimationFrame(loop);
      animT += 0.016;
      ctx.clearRect(0,0,W,H);
      drawWeb();
    }

    // Observe when section is visible
    const obs = new IntersectionObserver(entries=>{
      if(entries[0].isIntersecting){ resize(); loop(); obs.disconnect(); }
    },{threshold:0.1});
    obs.observe(canvas);
    window.addEventListener('resize',resize);
  })();

  // ── Contact background dawn gradient ──────────
  (function contactBG(){
    const canvas = document.getElementById('contact-bg');
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    let W,H,t=0;

    function resize(){ W=canvas.width=canvas.offsetWidth||window.innerWidth; H=canvas.height=canvas.offsetHeight||window.innerHeight; }
    resize();
    window.addEventListener('resize',resize);

    function draw(){
      requestAnimationFrame(draw);
      t+=0.003;
      ctx.clearRect(0,0,W,H);

      // Dawn gradient
      const g = ctx.createLinearGradient(0,0,0,H);
      g.addColorStop(0,'rgba(5,5,20,1)');
      g.addColorStop(0.5,'rgba(15,5,30,1)');
      g.addColorStop(1,'rgba(30,10,5,1)');
      ctx.fillStyle=g; ctx.fillRect(0,0,W,H);

      // Animated horizon glow
      const horizon = ctx.createRadialGradient(W/2,H,H*0.05, W/2,H,H*0.6);
      const hue = (Math.sin(t)*20+20);
      horizon.addColorStop(0,`hsla(${hue},100%,50%,0.07)`);
      horizon.addColorStop(1,'transparent');
      ctx.fillStyle=horizon; ctx.fillRect(0,0,W,H);

      // Stars
      ctx.fillStyle='rgba(255,255,255,0.5)';
      for(let i=0;i<60;i++){
        const sx=(Math.sin(i*12.7+t*0.1)*0.5+0.5)*W;
        const sy=(Math.cos(i*7.3)*0.5+0.5)*H*0.7;
        const pulse=Math.sin(t*3+i)*0.4+0.6;
        ctx.globalAlpha=pulse*0.5;
        ctx.beginPath(); ctx.arc(sx,sy,0.8,0,Math.PI*2); ctx.fill();
      }
      ctx.globalAlpha=1;

      // Web connections between contact icons (decorative)
      ctx.strokeStyle='rgba(0,240,255,0.05)';
      ctx.lineWidth=0.5;
      const pts=[[W*0.2,H*0.3],[W*0.4,H*0.5],[W*0.6,H*0.4],[W*0.8,H*0.55]];
      pts.forEach((p,i)=>{ if(i>0){ ctx.beginPath(); ctx.moveTo(pts[i-1][0],pts[i-1][1]); ctx.lineTo(p[0],p[1]); ctx.stroke(); } });
    }
    draw();
  })();

})();