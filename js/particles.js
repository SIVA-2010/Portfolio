/* ═══════════════════════════════════════════════
   PARTICLES.JS — Floating Particle System
═══════════════════════════════════════════════ */
(function(){
  const canvas = document.getElementById('particles-canvas');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];
  const COUNT = 90;

  function resize(){
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  class Particle {
    constructor(){
      this.reset(true);
    }
    reset(rand=false){
      this.x  = Math.random() * W;
      this.y  = rand ? Math.random() * H : H + 10;
      this.r  = Math.random() * 1.8 + 0.3;
      this.vx = (Math.random()-0.5) * 0.25;
      this.vy = -(Math.random() * 0.5 + 0.15);
      this.alpha = Math.random() * 0.5 + 0.1;
      this.life  = 1;
      this.decay = Math.random() * 0.0008 + 0.0003;
      // colour: cyan / red / white
      const pick = Math.random();
      if(pick < 0.4)       this.hue = '0,240,255';
      else if(pick < 0.65) this.hue = '255,0,60';
      else                 this.hue = '200,210,255';
    }
    update(){
      this.x += this.vx;
      this.y += this.vy;
      this.life -= this.decay;
      if(this.life <= 0 || this.y < -10) this.reset();
    }
    draw(){
      ctx.save();
      ctx.globalAlpha = this.life * this.alpha;
      ctx.fillStyle = `rgb(${this.hue})`;
      ctx.shadowColor = `rgba(${this.hue},0.6)`;
      ctx.shadowBlur  = 6;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI*2);
      ctx.fill();
      ctx.restore();
    }
  }

  for(let i=0;i<COUNT;i++) particles.push(new Particle());

  function loop(){
    ctx.clearRect(0,0,W,H);
    particles.forEach(p=>{ p.update(); p.draw(); });
    requestAnimationFrame(loop);
  }
  loop();
})();