/**
 * Globe Lightning — rotating wireframe globe with lightning arcs
 * Line-art style, blue/gold brand colors, subtle and elegant.
 */
(function () {
  var canvas = document.getElementById('globe-canvas');
  if (!canvas) return;

  var ctx = canvas.getContext('2d');
  var BLUE = '#0085fb';
  var GOLD = '#f4b740';
  var WIRE = 'rgba(255, 255, 255, 0.18)';
  var DOT_COLOR = 'rgba(0, 133, 251, 0.8)';

  var width, height, dpr, cx, cy, radius;
  var rotation = 0;
  var animId;

  // City-like points spread across the globe (lat, lon in radians)
  var points = [
    { lat: 0.85, lon: -0.1 },    // London
    { lat: 0.84, lon: 0.04 },    // Paris
    { lat: 0.72, lon: -1.3 },    // New York
    { lat: 0.61, lon: -2.07 },   // San Francisco
    { lat: 0.62, lon: 2.42 },    // Tokyo
    { lat: -0.59, lon: 2.65 },   // Sydney
    { lat: 0.48, lon: 1.3 },     // Dubai
    { lat: 0.87, lon: 0.23 },    // Berlin
    { lat: -0.40, lon: -0.76 },  // São Paulo
    { lat: 0.28, lon: 1.28 },    // Mumbai
    { lat: 0.55, lon: -1.75 },   // Chicago
    { lat: 0.11, lon: 0.64 },    // Nairobi
    { lat: 0.76, lon: -0.22 },   // Amsterdam
    { lat: 0.39, lon: 1.92 },    // Singapore
    { lat: 0.82, lon: 0.42 },    // Warsaw
    { lat: -0.29, lon: 0.48 },   // Cape Town
    { lat: 0.70, lon: -1.55 },   // Toronto
    { lat: 0.34, lon: -1.95 },   // Mexico City
    { lat: -0.20, lon: -0.68 },  // Buenos Aires
    { lat: 0.25, lon: 2.07 },    // Bangkok
    { lat: 0.90, lon: 0.72 },    // Helsinki
    { lat: 0.73, lon: -0.55 },   // Dublin
    { lat: 0.65, lon: 0.75 },    // Istanbul
    { lat: 0.55, lon: 2.40 },    // Seoul
    { lat: -0.08, lon: 1.88 },   // Jakarta
    { lat: 0.42, lon: 0.22 },    // Lagos
    { lat: 0.80, lon: -1.90 },   // Vancouver
    { lat: -0.52, lon: 2.96 },   // Auckland
    { lat: 0.75, lon: 0.95 },    // Bucharest
    { lat: 0.18, lon: -1.38 },   // Bogota
    { lat: 0.60, lon: 1.55 },    // Hong Kong
    { lat: 0.35, lon: 0.55 },    // Riyadh
    // Additional Africa
    { lat: 0.53, lon: 0.05 },    // Algiers
    { lat: 0.20, lon: -0.01 },   // Accra
    { lat: 0.02, lon: 0.53 },    // Dar es Salaam
    { lat: -0.35, lon: 0.47 },   // Johannesburg
    { lat: 0.52, lon: 0.54 },    // Cairo
    { lat: 0.26, lon: 0.13 },    // Douala
    { lat: -0.23, lon: 0.55 },   // Maputo
    { lat: 0.16, lon: 0.65 },    // Addis Ababa
    // Additional South America
    { lat: -0.13, lon: -0.85 },  // Lima
    { lat: -0.55, lon: -1.22 },  // Santiago
    { lat: 0.07, lon: -1.17 },   // Quito
    { lat: -0.05, lon: -0.60 },  // Brasilia
    { lat: -0.45, lon: -0.85 },  // Asuncion
    { lat: 0.18, lon: -1.16 },   // Medellin
    // Additional Southeast Asia & Oceania
    { lat: 0.24, lon: 1.72 },    // Ho Chi Minh City
    { lat: 0.03, lon: 1.81 },    // Kuala Lumpur
    { lat: 0.26, lon: 1.48 },    // Yangon
    { lat: -0.14, lon: 1.96 },   // Bali
    { lat: 0.50, lon: 2.11 },    // Osaka
    { lat: 0.25, lon: 2.02 },    // Manila
    { lat: -0.30, lon: 2.53 },   // Melbourne
    { lat: -0.63, lon: 2.93 },   // Wellington
    // Additional North America & Europe
    { lat: 0.58, lon: -1.48 },   // Detroit
    { lat: 0.53, lon: -1.85 },   // Denver
    { lat: 0.47, lon: -1.38 },   // Atlanta
    { lat: 0.88, lon: -0.05 },   // Brussels
    { lat: 0.78, lon: 0.28 },    // Prague
    { lat: 0.64, lon: 0.41 },    // Rome
    { lat: 0.83, lon: 0.50 },    // Vilnius
    { lat: 0.93, lon: 0.44 },    // Stockholm
  ];

  // Lightning arcs — each arc has a source, target, progress, and lifecycle
  var arcs = [];
  var ARC_INTERVAL = 150; // ms between new arcs — very fast and busy
  var lastArcTime = 0;
  var MAX_ARCS = 20; // allow lots of simultaneous arcs

  function resize() {
    dpr = window.devicePixelRatio || 1;
    var rect = canvas.parentElement.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cx = width / 2;
    cy = height / 2;
    radius = Math.min(width, height) * 0.48;
  }

  // Project lat/lon to 2D with rotation
  function project(lat, lon) {
    var adjustedLon = lon + rotation;
    var x = Math.cos(lat) * Math.sin(adjustedLon);
    var y = Math.sin(lat);
    var z = Math.cos(lat) * Math.cos(adjustedLon);
    // Only show front-facing points
    return {
      x: cx + x * radius,
      y: cy - y * radius,
      z: z,
      visible: z > -0.1
    };
  }

  function drawGlobe() {
    // Outer circle
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Subtle fill
    var globeGrad = ctx.createRadialGradient(cx - radius * 0.3, cy - radius * 0.3, 0, cx, cy, radius);
    globeGrad.addColorStop(0, 'rgba(0, 133, 251, 0.03)');
    globeGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fillStyle = globeGrad;
    ctx.fill();

    // Longitude lines
    for (var i = 0; i < 12; i++) {
      var lon = (i / 12) * Math.PI * 2;
      ctx.beginPath();
      for (var j = 0; j <= 60; j++) {
        var lat = (j / 60) * Math.PI - Math.PI / 2;
        var p = project(lat, lon);
        var alpha = Math.max(0, p.z * 0.5 + 0.5);
        if (j === 0) {
          ctx.moveTo(p.x, p.y);
        } else {
          ctx.lineTo(p.x, p.y);
        }
      }
      ctx.strokeStyle = WIRE;
      ctx.lineWidth = 0.8;
      ctx.stroke();
    }

    // Latitude lines
    for (var i = 1; i < 6; i++) {
      var lat = (i / 6) * Math.PI - Math.PI / 2;
      ctx.beginPath();
      for (var j = 0; j <= 60; j++) {
        var lon = (j / 60) * Math.PI * 2;
        var p = project(lat, lon);
        if (j === 0) {
          ctx.moveTo(p.x, p.y);
        } else {
          ctx.lineTo(p.x, p.y);
        }
      }
      ctx.strokeStyle = WIRE;
      ctx.lineWidth = 0.8;
      ctx.stroke();
    }
  }

  function drawPoints() {
    for (var i = 0; i < points.length; i++) {
      var pt = points[i];
      var p = project(pt.lat, pt.lon);
      if (!p.visible) continue;

      var alpha = Math.max(0, p.z * 0.6 + 0.4);
      var pulse = 1 + Math.sin(rotation * 8 + i * 1.7) * 0.25;
      var dotSize = (2.5 + p.z * 1.5) * pulse;

      // Glow
      ctx.beginPath();
      ctx.arc(p.x, p.y, dotSize + 4, 0, Math.PI * 2);
      var glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, dotSize + 4);
      glow.addColorStop(0, 'rgba(0, 133, 251, 0.3)');
      glow.addColorStop(1, 'rgba(0, 133, 251, 0)');
      ctx.fillStyle = glow;
      ctx.globalAlpha = alpha;
      ctx.fill();

      // Dot
      ctx.beginPath();
      ctx.arc(p.x, p.y, dotSize, 0, Math.PI * 2);
      ctx.fillStyle = DOT_COLOR;
      ctx.globalAlpha = alpha;
      ctx.fill();

      ctx.globalAlpha = 1;
    }
  }

  function spawnArc(now) {
    if (now - lastArcTime < ARC_INTERVAL) return;
    if (arcs.length >= MAX_ARCS) return;
    lastArcTime = now;

    // Pick two visible points
    var visible = [];
    for (var i = 0; i < points.length; i++) {
      var p = project(points[i].lat, points[i].lon);
      if (p.visible && p.z > 0.05) visible.push(i);
    }
    if (visible.length < 2) return;

    // Spawn 2-4 arcs at once for bursts of activity
    var burstCount = 2 + Math.floor(Math.random() * 3);
    for (var n = 0; n < burstCount; n++) {
      if (arcs.length >= MAX_ARCS) break;
      var a = visible[Math.floor(Math.random() * visible.length)];
      var b;
      var attempts = 0;
      do {
        b = visible[Math.floor(Math.random() * visible.length)];
        attempts++;
      } while (b === a && attempts < 10);
      if (b === a) continue;

      arcs.push({
        from: a,
        to: b,
        progress: 0,
        speed: 0.018 + Math.random() * 0.014,
        fade: 1,
        useGold: Math.random() > 0.6,
      });
    }
  }

  function drawArcs() {
    for (var i = arcs.length - 1; i >= 0; i--) {
      var arc = arcs[i];
      var fromPt = points[arc.from];
      var toPt = points[arc.to];
      var pFrom = project(fromPt.lat, fromPt.lon);
      var pTo = project(toPt.lat, toPt.lon);

      if (!pFrom.visible || !pTo.visible) {
        arcs.splice(i, 1);
        continue;
      }

      arc.progress += arc.speed;

      // Fade out after arc completes
      if (arc.progress >= 1) {
        arc.fade -= 0.03;
        if (arc.fade <= 0) {
          arcs.splice(i, 1);
          continue;
        }
      }

      var drawProgress = Math.min(arc.progress, 1);

      // Arc path — lift off the surface via a control point
      var midX = (pFrom.x + pTo.x) / 2;
      var midY = (pFrom.y + pTo.y) / 2;
      var dx = pTo.x - pFrom.x;
      var dy = pTo.y - pFrom.y;
      var dist = Math.sqrt(dx * dx + dy * dy);
      // Control point perpendicular, lifted toward center
      var lift = dist * 0.3;
      var ctrlX = midX + (cy - midY) * lift / dist * 0.8;
      var ctrlY = midY - (cx - midX) * lift / dist * 0.3 - lift * 0.4;

      var color = arc.useGold ? GOLD : BLUE;
      var alpha = arc.fade * 0.7;

      // Draw the arc up to current progress
      ctx.beginPath();
      ctx.moveTo(pFrom.x, pFrom.y);

      // Step through the quadratic bezier
      var steps = 30;
      var drawSteps = Math.floor(steps * drawProgress);
      for (var s = 1; s <= drawSteps; s++) {
        var t = s / steps;
        var px = (1 - t) * (1 - t) * pFrom.x + 2 * (1 - t) * t * ctrlX + t * t * pTo.x;
        var py = (1 - t) * (1 - t) * pFrom.y + 2 * (1 - t) * t * ctrlY + t * t * pTo.y;
        ctx.lineTo(px, py);
      }

      ctx.strokeStyle = color;
      ctx.globalAlpha = alpha;
      ctx.lineWidth = 1.5;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Bright head of the arc
      if (drawProgress < 1) {
        var ht = drawProgress;
        var headX = (1 - ht) * (1 - ht) * pFrom.x + 2 * (1 - ht) * ht * ctrlX + ht * ht * pTo.x;
        var headY = (1 - ht) * (1 - ht) * pFrom.y + 2 * (1 - ht) * ht * ctrlY + ht * ht * pTo.y;

        ctx.beginPath();
        ctx.arc(headX, headY, 3, 0, Math.PI * 2);
        var headGlow = ctx.createRadialGradient(headX, headY, 0, headX, headY, 8);
        headGlow.addColorStop(0, color);
        headGlow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = headGlow;
        ctx.globalAlpha = alpha;
        ctx.fill();
      }

      // Flash at target when arc arrives
      if (arc.progress >= 1 && arc.fade > 0.8) {
        ctx.beginPath();
        ctx.arc(pTo.x, pTo.y, 6, 0, Math.PI * 2);
        var flashGlow = ctx.createRadialGradient(pTo.x, pTo.y, 0, pTo.x, pTo.y, 12);
        flashGlow.addColorStop(0, color);
        flashGlow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = flashGlow;
        ctx.globalAlpha = (arc.fade - 0.8) * 5 * 0.6;
        ctx.fill();
      }

      ctx.globalAlpha = 1;
    }
  }

  function animate(now) {
    ctx.clearRect(0, 0, width, height);

    rotation += 0.003; // slow rotation

    drawGlobe();
    drawPoints();
    spawnArc(now || 0);
    drawArcs();

    animId = requestAnimationFrame(animate);
  }

  function init() {
    resize();
    animate(0);

    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        cancelAnimationFrame(animId);
        resize();
        animate(0);
      }, 250);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
