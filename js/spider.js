/* ═══════════════════════════════════════════════
   SPIDER.JS — Scroll-driven Spider with Morphing Forms
   Sections: hero→mechanical, about→neon outline,
   skills→network nodes, projects→armored,
   education→wireframe, internship→plasma,
   contact→particle dissolve
═══════════════════════════════════════════════ */
(function(){
  const canvas = document.getElementById('spider-canvas');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H;

  // ── State ─────────────────────────────────────
  let scrollY = 0;
  let scrollMax = 1;
  let scrollRatio = 0; // 0..1
  let mx = -999, my = -999; // mouse

  // Spider position
  let sx = 0, sy = 0;       // current drawn position
  let tx = 0, ty = 0;       // target position
  let morphT = 0;            // 0..1 blend between forms
  let currentSection = 0;    // 0-6 index
  let prevSection = 0;

  // Web trail
  const TRAIL_MAX = 120;
  let trail = [];

  // Particles for dissolve
  let dissolveParticles = [];
  let dissolving = false;
  let reforming  = false;

  // Section boundaries (set after DOM ready)
  let sectionMids = [];

  // ── Sections config ───────────────────────────
  const SECTIONS = [
    { id:'hero',       label:'MECHANICAL', color:'#00f0ff' },
    { id:'about',      label:'NEON',       color:'#ff003c' },
    { id:'skills',     label:'NETWORK',    color:'#b400ff' },
    { id:'projects',   label:'ARMORED',    color:'#00ff88' },
    { id:'education',  label:'WIREFRAME',  color:'#ffd700' },
    { id:'internship', label:'PLASMA',     color:'#ff6600' },
    { id:'contact',    label:'DISSOLVE',   color:'#ffffff' },
  ];

  function resize(){
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    computeSectionMids();
  }

  function computeSectionMids(){
    sectionMids = SECTIONS.map(s => {
      const el = document.getElementById(s.id);
      if(!el) return 0;
      const rect = el.getBoundingClientRect();
      return window.scrollY + rect.top + el.offsetHeight * 0.4;
    });
  }

  window.addEventListener('resize', resize);
  resize();
  window.addEventListener('scroll', () => {
    scrollY = window.scrollY;
    scrollMax = document.body.scrollHeight - window.innerHeight || 1;
    scrollRatio = Math.min(1, scrollY / scrollMax);
    updateSectionIndex();
    updateSpiderTarget();
  }, {passive:true});
  window.addEventListener('mousemove', e => { mx=e.clientX; my=e.clientY; });

  function updateSectionIndex(){
    let idx = 0;
    for(let i=0;i<sectionMids.length;i++){
      if(scrollY + H*0.5 >= sectionMids[i]) idx = i;
    }
    if(idx !== currentSection){
      prevSection = currentSection;
      currentSection = idx;
      morphT = 0;

      // Trigger dissolve on contact
      if(currentSection === 6 && !dissolving){
        startDissolve();
      }
      // Reform when leaving contact
      if(prevSection === 6 && currentSection < 6){
        startReform();
      }
    }
  }

  function updateSpiderTarget(){
    if(dissolving || dissolveParticles.length > 0 && currentSection===6) return;

    // Horizontal: snake across sections with oscillation
    const phase = scrollRatio * Math.PI * 6;
    const amp   = W * 0.28;
    tx = W/2 + Math.sin(phase) * amp;

    // Vertical: follows scroll + some offset
    ty = H * (0.15 + scrollRatio * 0.65);

    // Clamp
    tx = Math.max(80, Math.min(W-80, tx));
    ty = Math.max(80, Math.min(H-80, ty));
  }

  // ── Dissolve ──────────────────────────────────
  function startDissolve(){
    dissolving = true;
    dissolveParticles = [];
    for(let i=0;i<80;i++){
      dissolveParticles.push({
        x: sx, y: sy,
        vx:(Math.random()-0.5)*4,
        vy:(Math.random()-0.5)*4 - 1,
        life:1, decay:Math.random()*0.02+0.008,
        r:Math.random()*3+1,
        hue:`${255},${200+Math.floor(Math.random()*55)},${255}`,
      });
    }
    setTimeout(()=>{ dissolving=false; }, 2500);
  }

  function startReform(){
    reforming = true;
    // Rebuild from target
    dissolveParticles = dissolveParticles.map(p=>({
      ...p,
      vx:(tx - p.x)*0.04 + (Math.random()-0.5)*0.5,
      vy:(ty - p.y)*0.04 + (Math.random()-0.5)*0.5,
      life:1,
    }));
    setTimeout(()=>{ reforming=false; dissolveParticles=[]; }, 1500);
  }

  // ── Drawing utilities ─────────────────────────
  function lerp(a,b,t){ return a+(b-a)*t; }
  function easeOut(t){ return 1-(1-t)*(1-t); }

  function getColor(sec){
    return SECTIONS[Math.min(sec, SECTIONS.length-1)].color;
  }

  // ── Spider body drawing ───────────────────────
  // Each form is drawn at (0,0), then translated to (sx,sy)

  // Legs helper: draws 8 legs symmetrically
  function drawLegs(size, phase, style, glow){
    const legCount = 4; // 4 pairs
    const angles = [
      [-Math.PI*0.3, Math.PI*0.3],
      [-Math.PI*0.5, Math.PI*0.5],
      [-Math.PI*0.7, Math.PI*0.7],
      [-Math.PI*0.85, Math.PI*0.85],
    ];
    ctx.lineWidth = style === 'wireframe' ? 0.8 : 1.4;
    ctx.lineCap = 'round';

    angles.forEach(([la,ra],i)=>{
      const len1 = size * (0.9 + Math.sin(phase + i)*0.15);
      const len2 = size * (0.6 + Math.cos(phase + i)*0.1);
      const bend = Math.PI*0.25 + Math.sin(phase*0.7+i)*0.15;

      // Left leg
      const lx1 = Math.cos(la)*len1;
      const ly1 = Math.sin(la)*len1*0.5;
      const lx2 = lx1 + Math.cos(la+bend)*len2;
      const ly2 = ly1 + Math.sin(la+bend)*len2*0.4;
      ctx.beginPath();
      ctx.moveTo(0,0);
      ctx.quadraticCurveTo(lx1,ly1,lx2,ly2);
      ctx.stroke();

      // Right leg
      const rx1 = Math.cos(ra)*len1;
      const ry1 = Math.sin(ra)*len1*0.5;
      const rx2 = rx1 + Math.cos(ra-bend)*len2;
      const ry2 = ry1 + Math.sin(ra-bend)*len2*0.4;
      ctx.beginPath();
      ctx.moveTo(0,0);
      ctx.quadraticCurveTo(rx1,ry1,rx2,ry2);
      ctx.stroke();
    });
  }

  // ── Form 0: Mechanical ───────────────────────
  function drawMechanical(size, phase, alpha){
    ctx.globalAlpha = alpha;
    const c = '#00f0ff';
    ctx.strokeStyle = c;
    ctx.shadowColor  = c; ctx.shadowBlur = 14;

    // Abdomen (angular hexagon)
    ctx.fillStyle = 'rgba(0,240,255,0.08)';
    ctx.beginPath();
    for(let i=0;i<6;i++){
      const a = (i/6)*Math.PI*2 - Math.PI/2;
      const r = i%2===0 ? size*0.55 : size*0.45;
      i===0 ? ctx.moveTo(Math.cos(a)*r, Math.sin(a)*r)
            : ctx.lineTo(Math.cos(a)*r, Math.sin(a)*r);
    }
    ctx.closePath(); ctx.fill(); ctx.stroke();

    // Head (circle with visor)
    ctx.beginPath();
    ctx.arc(0,-size*0.35,size*0.22,0,Math.PI*2);
    ctx.stroke();
    // Visor line
    ctx.beginPath();
    ctx.moveTo(-size*0.12,-size*0.36);
    ctx.lineTo(size*0.12,-size*0.36);
    ctx.stroke();

    // Legs
    drawLegs(size*1.1, phase, 'mechanical', c);

    // Gear marks
    for(let i=0;i<4;i++){
      const a = (i/4)*Math.PI*2;
      ctx.beginPath();
      ctx.arc(Math.cos(a)*size*0.3, Math.sin(a)*size*0.3, 2, 0, Math.PI*2);
      ctx.fillStyle=c; ctx.fill();
    }
  }

  // ── Form 1: Neon Outline ─────────────────────
  function drawNeon(size, phase, alpha){
    ctx.globalAlpha = alpha;
    const c = '#ff003c';
    ctx.strokeStyle = c;
    ctx.shadowColor = c; ctx.shadowBlur = 20;
    ctx.lineWidth = 1.5;

    // Simple oval body
    ctx.beginPath();
    ctx.ellipse(0,0, size*0.3, size*0.45, 0,0,Math.PI*2);
    ctx.stroke();

    // Head
    ctx.beginPath();
    ctx.arc(0,-size*0.55, size*0.18, 0, Math.PI*2);
    ctx.stroke();

    // Eyes
    ctx.fillStyle=c;
    ctx.shadowBlur=12;
    [-size*0.07,size*0.07].forEach(ex=>{
      ctx.beginPath();
      ctx.arc(ex,-size*0.57,3,0,Math.PI*2);
      ctx.fill();
    });

    drawLegs(size, phase, 'neon', c);
  }

  // ── Form 2: Network Nodes ────────────────────
  function drawNetwork(size, phase, alpha){
    ctx.globalAlpha = alpha;
    const c = '#b400ff';
    ctx.strokeStyle = c; ctx.shadowColor = c; ctx.shadowBlur = 10;
    ctx.lineWidth = 0.8;

    // Nodes at key positions
    const nodes = [
      [0,0], [0,-size*0.5],
      [-size*0.3, size*0.1], [size*0.3, size*0.1],
      [-size*0.15,-size*0.28],[size*0.15,-size*0.28],
      [0, size*0.4],
      [-size*0.5, size*0.35],[size*0.5, size*0.35],
      [-size*0.7,-size*0.1],[size*0.7,-size*0.1],
    ];
    // Connections
    const connections = [[0,2],[0,3],[0,4],[0,5],[0,6],[1,4],[1,5],[2,7],[3,8],[2,9],[3,10],[4,1],[5,1]];
    connections.forEach(([a,b])=>{
      if(!nodes[a]||!nodes[b]) return;
      ctx.beginPath();
      ctx.moveTo(...nodes[a]);
      ctx.lineTo(...nodes[b]);
      ctx.stroke();
    });
    // Node dots
    ctx.fillStyle = c;
    nodes.forEach(([nx,ny],i)=>{
      const pulse = Math.sin(phase*2+i*0.8)*0.4+0.6;
      ctx.globalAlpha = alpha * pulse;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(nx,ny, i===0?5:3, 0, Math.PI*2);
      ctx.fill();
    });
    ctx.globalAlpha = alpha;

    drawLegs(size*0.9, phase, 'network', c);
  }

  // ── Form 3: Armored ──────────────────────────
  function drawArmored(size, phase, alpha){
    ctx.globalAlpha = alpha;
    const c = '#00ff88';
    ctx.strokeStyle = c; ctx.fillStyle='rgba(0,255,136,0.1)';
    ctx.shadowColor = c; ctx.shadowBlur = 10; ctx.lineWidth = 2;

    // Armored plates (overlapping rectangles)
    [
      [0,0,size*0.5,size*0.65],
      [0,-size*0.4,size*0.3,size*0.35],
    ].forEach(([cx,cy,hw,hh])=>{
      const corners = [[-hw,-hh],[hw,-hh],[hw,hh],[-hw,hh]];
      ctx.beginPath();
      corners.forEach(([px,py],i)=>
        i===0?ctx.moveTo(cx+px,cy+py):ctx.lineTo(cx+px,cy+py));
      ctx.closePath(); ctx.fill(); ctx.stroke();
    });

    // Visor slash
    ctx.beginPath();
    ctx.moveTo(-size*0.18,-size*0.44);
    ctx.lineTo(size*0.18,-size*0.44);
    ctx.stroke();

    drawLegs(size*1.05, phase, 'armored', c);
  }

  // ── Form 4: Wireframe ────────────────────────
  function drawWireframe(size, phase, alpha){
    ctx.globalAlpha = alpha;
    const c = '#ffd700';
    ctx.strokeStyle = c; ctx.shadowColor=c; ctx.shadowBlur=8;
    ctx.lineWidth=0.8; ctx.setLineDash([3,3]);

    // Wireframe sphere (latitude/longitude)
    for(let i=0;i<3;i++){
      const r = size*(0.2+i*0.15);
      ctx.beginPath(); ctx.arc(0,0,r,0,Math.PI*2); ctx.stroke();
    }
    for(let i=0;i<4;i++){
      const a = (i/4)*Math.PI;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a)*size*0.5, Math.sin(a)*size*0.5);
      ctx.lineTo(Math.cos(a+Math.PI)*size*0.5, Math.sin(a+Math.PI)*size*0.5);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    drawLegs(size, phase, 'wireframe', c);
  }

  // ── Form 5: Plasma ───────────────────────────
  function drawPlasma(size, phase, alpha){
    ctx.globalAlpha = alpha;
    const c = '#ff6600';
    ctx.strokeStyle=c; ctx.shadowColor=c; ctx.shadowBlur=22; ctx.lineWidth=1.5;

    // Wobbly plasma blob
    ctx.beginPath();
    const pts = 10;
    for(let i=0;i<=pts;i++){
      const a  = (i/pts)*Math.PI*2;
      const r  = size*0.38 + Math.sin(a*3+phase*2)*size*0.1 + Math.cos(a*5+phase)*size*0.05;
      const px = Math.cos(a)*r, py = Math.sin(a)*r;
      i===0 ? ctx.moveTo(px,py) : ctx.lineTo(px,py);
    }
    ctx.closePath();
    ctx.fillStyle='rgba(255,102,0,0.1)';
    ctx.fill(); ctx.stroke();

    // Energy arcs
    for(let i=0;i<3;i++){
      const a1=(phase+i*2)*0.5, a2=a1+0.8;
      const r=size*0.5+i*5;
      ctx.beginPath();
      ctx.arc(0,0,r,a1,a2);
      ctx.globalAlpha = alpha*(0.4+i*0.1);
      ctx.stroke();
    }
    ctx.globalAlpha = alpha;

    drawLegs(size*0.95, phase, 'plasma', c);
  }

  // ── Form selector ────────────────────────────
  function drawForm(form, size, phase, alpha){
    if(alpha <= 0) return;
    ctx.save();
    switch(form){
      case 0: drawMechanical(size,phase,alpha); break;
      case 1: drawNeon(size,phase,alpha);       break;
      case 2: drawNetwork(size,phase,alpha);    break;
      case 3: drawArmored(size,phase,alpha);    break;
      case 4: drawWireframe(size,phase,alpha);  break;
      case 5: drawPlasma(size,phase,alpha);     break;
    }
    ctx.restore();
  }

  // ── Web thread ───────────────────────────────
  function drawThread(){
    if(trail.length < 2) return;
    ctx.save();
    ctx.lineWidth = 0.6;
    ctx.setLineDash([2,6]);
    for(let i=1;i<trail.length;i++){
      const t = i/trail.length;
      const c = getColor(currentSection);
      ctx.strokeStyle = c;
      ctx.globalAlpha = t * 0.35;
      ctx.shadowColor = c; ctx.shadowBlur = 4;
      ctx.beginPath();
      ctx.moveTo(trail[i-1].x, trail[i-1].y);
      ctx.lineTo(trail[i].x,   trail[i].y);
      ctx.stroke();
    }
    ctx.setLineDash([]);
    ctx.restore();

    // Hanging thread from top
    if(scrollY < H*0.5){
      const topY = -10;
      ctx.save();
      ctx.strokeStyle = getColor(currentSection);
      ctx.globalAlpha = 0.3;
      ctx.lineWidth = 0.8;
      ctx.setLineDash([3,5]);
      ctx.beginPath();
      ctx.moveTo(sx, topY);
      ctx.lineTo(sx, sy);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }
  }

  // ── Dissolve particles draw ───────────────────
  function drawDissolve(dt){
    if(!dissolveParticles.length) return;
    dissolveParticles.forEach(p=>{
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.04; // gravity
      if(reforming){
        // Pull toward target
        const ddx = tx-p.x, ddy = ty-p.y;
        p.vx += ddx*0.005;
        p.vy += ddy*0.005;
        p.vx *= 0.95; p.vy *= 0.95;
      }
      p.life -= p.decay;

      ctx.save();
      ctx.globalAlpha = Math.max(0,p.life*0.8);
      ctx.fillStyle = `rgba(${p.hue},1)`;
      ctx.shadowColor = `rgba(${p.hue},0.8)`;
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      ctx.fill();
      ctx.restore();
    });
    dissolveParticles = dissolveParticles.filter(p=>p.life>0);
  }

  // ── Cursor proximity reaction ─────────────────
  function cursorReact(){
    if(mx<0) return;
    const dx = mx-sx, dy = my-sy;
    const dist = Math.sqrt(dx*dx+dy*dy);
    if(dist < 120){
      // Subtle repel
      const force = (1-(dist/120))*3;
      sx -= (dx/dist)*force;
      sy -= (dy/dist)*force;
    }
  }

  // ── Main loop ─────────────────────────────────
  let phase = 0;
  let lastT = performance.now();

  function animate(now){
    requestAnimationFrame(animate);
    const dt = Math.min((now-lastT)/1000, 0.05);
    lastT = now;
    phase += dt * 2.4;
    morphT = Math.min(1, morphT + dt*1.2);

    ctx.clearRect(0,0,W,H);

    const skip = currentSection===6 && !reforming && dissolveParticles.length>0;

    if(!skip){
      // Smooth follow
      sx += (tx-sx)*0.06;
      sy += (ty-sy)*0.06;

      // Cursor reaction
      cursorReact();

      // Trail
      if(Math.abs(sx-tx)>1 || Math.abs(sy-ty)>1){
        trail.push({x:sx,y:sy});
        if(trail.length>TRAIL_MAX) trail.shift();
      }

      drawThread();

      // Draw current and previous form with crossfade
      const size = 32;
      ctx.save();
      ctx.translate(sx, sy);

      if(currentSection < 6){
        const prevAlpha  = 1 - easeOut(morphT);
        const curAlpha   = easeOut(morphT);
        if(prevSection < 6 && prevAlpha > 0.01) drawForm(prevSection, size, phase, prevAlpha);
        drawForm(currentSection, size, phase, curAlpha);
      }
      ctx.restore();
    }

    // Dissolve particles
    if(dissolveParticles.length > 0) drawDissolve(dt);
  }

  requestAnimationFrame(animate);

  // Recompute on scroll-stop
  let resizeTimer;
  window.addEventListener('scroll',()=>{
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(computeSectionMids, 200);
  },{passive:true});

  // Init position
  setTimeout(()=>{
    sx = W*0.5; sy = H*0.2;
    tx = sx; ty = sy;
    trail = [];
    updateSectionIndex();
    updateSpiderTarget();
  }, 800);
})();