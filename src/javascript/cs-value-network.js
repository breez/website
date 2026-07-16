/**
 * Case Studies — Value Network.
 * A network of teams held in a stable mesh: nodes sit on a jittered grid and
 * breathe gently around their home positions (so the structure holds rather
 * than dissolving), thin wires connect the mesh, and gold value-pulses travel
 * the links. Same line-art / blue + gold language as the globe.
 */
(function () {
  var canvas = document.getElementById('cs-network-canvas');
  if (!canvas) return;

  var ctx = canvas.getContext('2d');
  var BLUE = '#0085fb';
  var GOLD = '#f4b740';

  var W = 0, H = 0, dpr = 1, animId = null;
  var nodes = [], edges = [], pulses = [];
  var COLS = 5, ROWS = 4;
  var MAX_DIST = 180;
  var lastSpawn = 0;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function rand(a, b) { return a + Math.random() * (b - a); }

  function resize() {
    dpr = window.devicePixelRatio || 1;
    var rect = canvas.parentElement.getBoundingClientRect();
    if (!rect.width || !rect.height) { requestAnimationFrame(resize); return; }
    W = rect.width;
    H = rect.height;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    build();
  }

  // Lay nodes on a jittered grid and fix the mesh edges from their homes, so
  // the overall shape stays put while the nodes only breathe a little.
  function build() {
    var insetX = W * 0.09, insetY = H * 0.13;
    var cw = (W - 2 * insetX) / (COLS - 1);
    var ch = (H - 2 * insetY) / (ROWS - 1);
    MAX_DIST = Math.max(cw, ch) * 1.55;
    // Kept small so a breathing node (plus its glow) never touches the edge.
    var amp = Math.min(cw, ch) * 0.12;

    nodes = [];
    for (var r = 0; r < ROWS; r++) {
      for (var c = 0; c < COLS; c++) {
        var hx = insetX + c * cw + rand(-cw * 0.3, cw * 0.3);
        var hy = insetY + r * ch + rand(-ch * 0.3, ch * 0.3);
        nodes.push({
          hx: hx, hy: hy, x: hx, y: hy,
          ax: amp * rand(0.7, 1.3), ay: amp * rand(0.7, 1.3),
          fx: rand(0.00025, 0.0007), fy: rand(0.00025, 0.0007),
          px: rand(0, Math.PI * 2), py: rand(0, Math.PI * 2),
          r: rand(1.7, 3.1), ph: rand(0, Math.PI * 2)
        });
      }
    }

    // Fixed edges from home distances — the mesh never flickers.
    edges = [];
    for (var i = 0; i < nodes.length; i++) {
      for (var j = i + 1; j < nodes.length; j++) {
        var dx = nodes[i].hx - nodes[j].hx;
        var dy = nodes[i].hy - nodes[j].hy;
        if (Math.sqrt(dx * dx + dy * dy) < MAX_DIST) edges.push([i, j]);
      }
    }
  }

  function draw(now) {
    ctx.clearRect(0, 0, W, H);

    // Breathe each node gently around its home.
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      n.x = n.hx + n.ax * Math.sin(now * n.fx + n.px);
      n.y = n.hy + n.ay * Math.sin(now * n.fy + n.py);
    }

    // Mesh wires.
    ctx.lineWidth = 1;
    for (var e = 0; e < edges.length; e++) {
      var a = nodes[edges[e][0]], b = nodes[edges[e][1]];
      var dx = a.x - b.x, dy = a.y - b.y;
      var d = Math.sqrt(dx * dx + dy * dy);
      var o = (1 - Math.min(d / (MAX_DIST * 1.25), 1)) * 0.32 + 0.06;
      ctx.strokeStyle = 'rgba(255, 255, 255, ' + o.toFixed(3) + ')';
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }

    // Spawn a value-pulse along a random mesh edge.
    if (now - lastSpawn > 520 && edges.length) {
      var ed = edges[Math.floor(Math.random() * edges.length)];
      pulses.push({ a: ed[0], b: ed[1], start: now, dur: rand(1400, 2200) });
      lastSpawn = now;
    }

    // Travelling gold pulses.
    for (var p = pulses.length - 1; p >= 0; p--) {
      var pu = pulses[p];
      var t = (now - pu.start) / pu.dur;
      var na = nodes[pu.a], nb = nodes[pu.b];
      if (t >= 1 || !na || !nb) { pulses.splice(p, 1); continue; }
      var x = na.x + (nb.x - na.x) * t;
      var y = na.y + (nb.y - na.y) * t;
      var grd = ctx.createRadialGradient(x, y, 0, x, y, 8);
      grd.addColorStop(0, 'rgba(244, 183, 64, 0.85)');
      grd.addColorStop(1, 'rgba(244, 183, 64, 0)');
      ctx.beginPath();
      ctx.fillStyle = grd;
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.fillStyle = GOLD;
      ctx.arc(x, y, 1.9, 0, Math.PI * 2);
      ctx.fill();
    }

    // Nodes: soft blue glow + crisp core, breathing subtly.
    for (var q = 0; q < nodes.length; q++) {
      var nd = nodes[q];
      var glow = 0.5 + 0.5 * Math.sin(now * 0.001 + nd.ph);
      var g = ctx.createRadialGradient(nd.x, nd.y, 0, nd.x, nd.y, nd.r * 4.2);
      g.addColorStop(0, 'rgba(0, 133, 251, ' + (0.32 * glow + 0.12).toFixed(3) + ')');
      g.addColorStop(1, 'rgba(0, 133, 251, 0)');
      ctx.beginPath();
      ctx.fillStyle = g;
      ctx.arc(nd.x, nd.y, nd.r * 4.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.fillStyle = BLUE;
      ctx.arc(nd.x, nd.y, nd.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function loop(now) {
    draw(now || 0);
    animId = requestAnimationFrame(loop);
  }

  function init() {
    resize();
    if (reduce) { draw(0); return; }
    animId = requestAnimationFrame(loop);

    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        cancelAnimationFrame(animId);
        resize();
        animId = requestAnimationFrame(loop);
      }, 200);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
