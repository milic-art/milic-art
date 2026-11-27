/* Milicenda: interacciones de Clocky + jueguito secreto.
   Necesita window.__mil = {er, xx, Oc, fx, kx, Jc, Ei} (lo expone el motor).
   No dibuja a Clocky: lo mueve y lo anima con transformaciones; los efectos salen de efectos_clocky_hoja. */
(function () {
  "use strict";
  var SHEET = window.__milSheet, META = {"manzana":{"x":0,"y":0,"w":8,"h":8,"ox":4,"oy":8,"frames":[{"x":0,"y":0}],"ms":200},"manzana_dorada":{"x":9,"y":0,"w":8,"h":8,"ox":4,"oy":8,"frames":[{"x":9,"y":0}],"ms":200},"pina":{"x":18,"y":0,"w":7,"h":9,"ox":3,"oy":9,"frames":[{"x":18,"y":0}],"ms":200},"petalo":{"x":26,"y":0,"w":5,"h":4,"ox":2,"oy":4,"frames":[{"x":26,"y":0},{"x":32,"y":0}],"ms":180},"petalo_lila":{"x":38,"y":0,"w":5,"h":4,"ox":2,"oy":4,"frames":[{"x":38,"y":0},{"x":44,"y":0}],"ms":180},"hoja":{"x":50,"y":0,"w":6,"h":4,"ox":3,"oy":4,"frames":[{"x":50,"y":0},{"x":57,"y":0}],"ms":220},"corazon":{"x":64,"y":0,"w":7,"h":6,"ox":3,"oy":6,"frames":[{"x":64,"y":0}],"ms":200},"estrellas":{"x":72,"y":0,"w":17,"h":9,"ox":8,"oy":9,"frames":[{"x":72,"y":0},{"x":90,"y":0},{"x":108,"y":0}],"ms":110},"estornudo":{"x":0,"y":10,"w":20,"h":12,"ox":10,"oy":12,"frames":[{"x":0,"y":10},{"x":21,"y":10},{"x":42,"y":10},{"x":63,"y":10}],"ms":110},"polen":{"x":84,"y":10,"w":3,"h":3,"ox":1,"oy":3,"frames":[{"x":84,"y":10},{"x":88,"y":10}],"ms":160},"chapoteo":{"x":0,"y":23,"w":24,"h":16,"ox":12,"oy":16,"frames":[{"x":0,"y":23},{"x":25,"y":23},{"x":50,"y":23},{"x":75,"y":23}],"ms":110},"onda":{"x":0,"y":40,"w":30,"h":10,"ox":15,"oy":10,"frames":[{"x":0,"y":40},{"x":31,"y":40},{"x":62,"y":40},{"x":93,"y":40}],"ms":180},"gota":{"x":124,"y":40,"w":3,"h":3,"ox":1,"oy":3,"frames":[{"x":124,"y":40}],"ms":200},"polvo":{"x":0,"y":51,"w":16,"h":8,"ox":8,"oy":8,"frames":[{"x":0,"y":51},{"x":17,"y":51},{"x":34,"y":51}],"ms":120},"ojitos":{"x":51,"y":51,"w":9,"h":4,"ox":4,"oy":4,"frames":[{"x":51,"y":51},{"x":61,"y":51}],"ms":250}}, SW = 128, SH = 59;
  var RM = !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
  var ABORT = { abort: 1 };
  var IDLE_MS = 22000;

  function M() { return window.__mil; }
  function q(s) { return document.querySelector(s); }
  function walker() { return q(".clocky-walker"); }
  function world() { var w = walker(); return w && w.parentElement; }
  function stage() { return q(".map-stage"); }
  function isP() {
    var m = M(), w = world();
    return !!(m && w) && Math.abs(parseFloat(w.style.width) - m.Ei(false).worldW) > 1;
  }
  function L() { return M().er[isP() ? "v" : "h"]; }
  function Z() { return M().Ei(isP()).z; }
  function rnd(a, b) { return a + Math.random() * (b - a); }

  /* ---------- estilos ---------- */
  var css = [
    ".mil-fx{position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;z-index:21}",
    ".mil-spr{position:absolute;left:0;top:0;background-image:url(" + SHEET + ");background-repeat:no-repeat;image-rendering:pixelated;will-change:transform}",
    ".map-stage[data-mil-noche=true] .mil-fx{filter:brightness(.82) saturate(.85)}",
    ".clocky-walker[data-paseo] .clocky-walk-inner{animation:.3s ease-in-out infinite clocky-step}",
    ".clocky-walker[data-mil] .clocky-walk-inner{transform-origin:50% 100%}",
    ".clocky-walker[data-mil=salto] .clocky-walk-inner{animation:mil-salto .7s ease-out both}",
    ".clocky-walker[data-mil=feliz] .clocky-walk-inner{animation:mil-feliz .45s ease-in-out 2 both}",
    ".clocky-walker[data-mil=carrera] .clocky-walk-inner{animation:mil-carrera .38s ease-in both}",
    ".clocky-walker[data-mil=mareo] .clocky-walk-inner{animation:mil-mareo .8s ease-in-out 2 both}",
    ".clocky-walker[data-mil=oler] .clocky-walk-inner{animation:mil-oler 1.1s ease-in-out both}",
    ".clocky-walker[data-mil=estornudo] .clocky-walk-inner{animation:mil-estornudo .7s cubic-bezier(.2,1.6,.4,1) both}",
    ".clocky-walker[data-mil=asomarse] .clocky-walk-inner{animation:mil-asomarse 1s ease-in-out both}",
    ".clocky-walker[data-mil=chapuzon] .clocky-walk-inner{animation:mil-chapuzon .6s ease-in-out both}",
    ".clocky-walker[data-mil=sacudirse] .clocky-walk-inner{animation:mil-sacudirse .12s linear 6 both}",
    ".clocky-walker[data-mil=esconderse] .clocky-walk-inner{animation:mil-esconderse .45s ease-in both}",
    ".clocky-walker[data-mil=escondido] .clocky-walk-inner{opacity:0}",
    ".clocky-walker[data-mil=espiar] .clocky-walk-inner{animation:mil-espiar 1.8s ease-in-out both}",
    ".clocky-walker[data-mil=salir] .clocky-walk-inner{animation:mil-salir .5s cubic-bezier(.2,1.5,.4,1) both}",
    ".clocky-walker[data-mil=tocar] .clocky-walk-inner{animation:mil-tocar .3s ease-in-out 3 both}",
    ".clocky-walker[data-mil=entrar] .clocky-walk-inner{animation:mil-entrar .5s ease-in both}",
    "@keyframes mil-salto{0%,100%{transform:none}25%{transform:scale(1.08,.9)}55%{transform:translateY(-22px) scale(.95,1.06)}85%{transform:scale(1.06,.94)}}",
    "@keyframes mil-feliz{0%,100%{transform:none}25%{transform:translateY(-8px) rotate(-7deg)}75%{transform:translateY(-8px) rotate(7deg)}}",
    "@keyframes mil-carrera{0%{transform:none}70%{transform:translateX(16px) scale(1.04,.97)}82%{transform:translateX(12px) scale(.84,1.1)}100%{transform:translateX(0)}}",
    "@keyframes mil-mareo{0%,100%{transform:rotate(0)}25%{transform:rotate(-6deg) translateX(-3px)}75%{transform:rotate(6deg) translateX(3px)}}",
    "@keyframes mil-oler{0%{transform:none}40%,85%{transform:translateX(7px) rotate(9deg)}100%{transform:translateX(5px) rotate(7deg)}}",
    "@keyframes mil-estornudo{0%{transform:translateX(5px) rotate(7deg)}25%{transform:translateX(2px) rotate(-4deg) scale(1.04,.96)}45%{transform:translateX(-12px) rotate(-12deg) scale(1.1,.9)}100%{transform:none}}",
    "@keyframes mil-asomarse{0%{transform:none}50%,100%{transform:translate(9px,3px) rotate(17deg)}}",
    "@keyframes mil-chapuzon{0%{transform:translate(9px,3px) rotate(17deg)}40%{transform:translate(12px,-10px) rotate(10deg)}70%{transform:translate(6px,2px) scale(1.06,.92)}100%{transform:none}}",
    "@keyframes mil-sacudirse{0%,100%{transform:rotate(0)}25%{transform:rotate(-5deg)}75%{transform:rotate(5deg)}}",
    "@keyframes mil-esconderse{0%{transform:none;opacity:1}40%{transform:translateY(-8px) scale(.95,1.05)}100%{transform:translateY(30%) scale(.4);opacity:0}}",
    "@keyframes mil-espiar{0%{transform:translateY(46%);clip-path:inset(0 0 52% 0);opacity:1}20%{transform:translateY(30%);clip-path:inset(0 0 40% 0)}40%{transform:translateY(30%) rotate(-8deg);clip-path:inset(0 0 40% 0)}70%{transform:translateY(30%) rotate(8deg);clip-path:inset(0 0 40% 0)}100%{transform:translateY(34%);clip-path:inset(0 0 42% 0)}}",
    "@keyframes mil-salir{0%{transform:translateY(30%) scale(.6);opacity:0}60%{transform:translateY(-10px) scale(1.05,.95);opacity:1}100%{transform:none;opacity:1}}",
    "@keyframes mil-tocar{0%,100%{transform:none}50%{transform:translateX(6px) rotate(5deg)}}",
    "@keyframes mil-entrar{0%{transform:none;opacity:1}100%{transform:translateX(8px) scale(.3);opacity:0}}",
    ".mil-puerta{position:absolute;background:none;border:0;padding:0;margin:0;cursor:pointer;z-index:15}",
    ".mil-puerta:focus-visible{outline:3px solid #e8874a;outline-offset:2px;border-radius:10px}",
    "@media (prefers-reduced-motion:reduce){.clocky-walker[data-mil] .clocky-walk-inner,.clocky-walker[data-paseo] .clocky-walk-inner{animation:none!important}}",
    /* jueguito */
    ".mil-juego{position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;background:#2e1b14b3;padding:16px}",
    ".mil-panel{background:#fbf3e4;color:#2e1b14;border:3px solid #2e1b14;border-radius:18px;box-shadow:0 5px 0 #4b3a2acc;width:min(560px,100%);padding:14px;font-family:inherit}",
    ".mil-top{display:flex;align-items:center;gap:10px;margin-bottom:10px}",
    ".mil-top h2{font-size:18px;font-weight:800;margin:0;flex:1;line-height:1.1}",
    ".mil-chip{border:2px solid #2e1b14;border-radius:999px;padding:3px 10px;font-weight:700;font-size:14px;background:#fffdf7;white-space:nowrap}",
    ".mil-btn{border:2px solid #2e1b14;border-radius:999px;padding:6px 14px;font-weight:800;font-size:15px;background:#fffdf7;color:#2e1b14;box-shadow:0 3px 0 #4b3a2acc;cursor:pointer}",
    ".mil-btn.prim{background:#b84a2c;color:#fffdf7}",
    ".mil-btn:focus-visible{outline:3px solid #e8874a;outline-offset:2px}",
    ".mil-cancha{position:relative;width:100%;aspect-ratio:4/3;border:3px solid #2e1b14;border-radius:10px;overflow:hidden;touch-action:none;cursor:none;background:#8fd2d2}",
    ".mil-cancha canvas{display:block;width:100%;height:100%;image-rendering:pixelated}",
    ".mil-cl{position:absolute;bottom:4%;width:26%;transform:translateX(-50%);pointer-events:none}",
    ".mil-cl>div{transform-origin:50% 100%}",
    ".mil-cl.come>div{animation:mil-come .22s ease-out}",
    ".mil-cl.ay>div{animation:mil-sacudirse .1s linear 4}",
    "@keyframes mil-come{50%{transform:scale(1.12,.9)}}",
    ".mil-msg{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;background:#fbf3e4e6;text-align:center;padding:12px}",
    ".mil-msg p{margin:0;font-weight:800;font-size:20px}",
    ".mil-msg small{font-size:14px;font-weight:600}",
    ".mil-pie{margin:8px 2px 0;font-size:13px;font-weight:600}"
  ].join("\n");
  var st = document.createElement("style");
  st.textContent = css;
  document.head.appendChild(st);

  /* ---------- partículas (efectos) ---------- */
  var layer = null, parts = [], raf = 0, last = 0;
  function getLayer() {
    var w = world();
    if (!w) return null;
    if (!layer || layer.parentElement !== w) {
      layer = document.createElement("div");
      layer.className = "mil-fx";
      w.appendChild(layer);
    }
    return layer;
  }
  function spawn(name, x, y, o) {
    o = o || {};
    var m = META[name], z = Z(), ly = getLayer();
    if (!m || !ly) return null;
    var el = document.createElement("div");
    el.className = "mil-spr";
    el.style.width = m.w * z + "px";
    el.style.height = m.h * z + "px";
    el.style.backgroundSize = SW * z + "px " + SH * z + "px";
    ly.appendChild(el);
    var p = { el: el, m: m, x: x, y: y, vx: o.vx || 0, vy: o.vy || 0, g: o.g || 0, ground: o.ground == null ? null : o.ground,
      bounce: o.bounce || 0, life: o.life || m.frames.length * m.ms, t: 0, loop: !!o.loop, fade: o.fade || 0,
      sway: o.sway || 0, z: z, flip: !!o.flip, onland: o.onland || null, delay: o.delay || 0 };
    if (p.delay) el.style.opacity = "0";
    frame(p, 0);
    put(p);
    parts.push(p);
    if (!raf) { last = performance.now(); raf = requestAnimationFrame(tick); }
    return p;
  }
  function frame(p, i) {
    var f = p.m.frames[i];
    p.el.style.backgroundPosition = (-f.x * p.z) + "px " + (-f.y * p.z) + "px";
  }
  function put(p) {
    var sx = p.sway ? Math.sin(p.t / 260 + p.sway) * 3 : 0;
    p.el.style.transform = "translate(" + Math.round(p.x + sx - p.m.ox) * p.z + "px," + Math.round(p.y - p.m.oy) * p.z + "px)" + (p.flip ? " scaleX(-1)" : "");
  }
  function tick(now) {
    var real = Math.max(0, Math.min(1000, now - last)), dt = Math.min(50, real);
    last = now;
    for (var i = parts.length - 1; i >= 0; i--) {
      var p = parts[i];
      if (p.delay > 0) { p.delay -= real; if (p.delay <= 0) p.el.style.opacity = ""; else continue; }
      p.t += real;
      var s = dt / 1000;
      p.vy += p.g * s; p.x += p.vx * s; p.y += p.vy * s;
      if (p.sway && p.ground == null) p.vx *= 0.98;
      if (p.ground != null && p.y >= p.ground && p.vy > 0) {
        p.y = p.ground;
        if (p.onland) { var f = p.onland; p.onland = null; f(p); }
        else if (p.bounce > 0.12) { p.vy = -p.vy * p.bounce; p.vx *= 0.6; p.bounce *= 0.55; }
        else { p.vy = 0; p.vx = 0; p.g = 0; p.sway = 0; }
      }
      var n = p.m.frames.length, fi = Math.floor(p.t / p.m.ms);
      frame(p, p.loop ? fi % n : Math.min(n - 1, fi));
      put(p);
      if (p.fade && p.t > p.life - p.fade) p.el.style.opacity = String(Math.max(0, (p.life - p.t) / p.fade));
      if (p.t >= p.life) { p.el.remove(); parts.splice(i, 1); }
    }
    raf = parts.length ? requestAnimationFrame(tick) : 0;
  }

  /* ---------- Clocky ---------- */
  var cur = { x: 0, y: 0 }, curDy = 0, busy = null;
  function sleep(tok, ms) {
    return new Promise(function (res, rej) {
      setTimeout(function () { if (tok.dead) rej(ABORT); else res(); }, ms);
    });
  }
  function wpos() {
    var w = walker(), lay = L();
    var l = parseFloat(w.style.left) || 0, tp = w.style.top || "";
    var m = /calc\(\s*([-\d.e]+)%\s*\+\s*([-\d.e]+)px\s*\)/.exec(tp);
    var pct = m ? parseFloat(m[1]) : (parseFloat(tp) || 0), dy = m ? parseFloat(m[2]) : 0;
    return { x: l * lay.lw / 100, y: pct * lay.lh / 100, dy: dy };
  }
  function setPos(x, y, dy) {
    var w = walker(), lay = L();
    w.style.left = (x / lay.lw * 100) + "%";
    w.style.top = "calc(" + (y / lay.lh * 100) + "% + " + dy + "px)";
  }
  function face(dir) {
    var j = walker() && walker().firstElementChild;
    if (j && !RM) j.style.transform = dir < 0 ? "scaleX(-1)" : "none";
  }
  function act(tok, name, ms) {
    var w = walker();
    if (RM) return sleep(tok, Math.min(ms, 400));
    w.removeAttribute("data-mil");
    void w.offsetWidth;
    w.setAttribute("data-mil", name);
    return sleep(tok, ms);
  }
  function route(a, b) {
    var m = M(), segs = m.xx(isP());
    var pa = m.Oc(segs, a), pb = m.Oc(segs, b), mid = m.fx(segs, pa, pb);
    return [a].concat(mid, [b]).filter(function (p, i, arr) {
      return i === 0 || Math.hypot(p.x - arr[i - 1].x, p.y - arr[i - 1].y) > 0.01;
    });
  }
  function plen(pts) { var s = 0; for (var i = 1; i < pts.length; i++) s += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y); return s; }
  function walk(tok, to, dyTo) {
    if (RM) return Promise.resolve();
    var pts = route({ x: cur.x, y: cur.y }, to), len = plen(pts), dy0 = curDy;
    if (len < 1) return Promise.resolve();
    var dur = M().Jc(len) * 1.1, w = walker(), t0 = performance.now();
    w.removeAttribute("data-mil");
    w.setAttribute("data-paseo", "true");
    return new Promise(function (res, rej) {
      function f(now) {
        if (tok.dead) { rej(ABORT); return; }
        var k = Math.min(1, (now - t0) / dur), r = M().kx(pts, k);
        cur = { x: r.p.x, y: r.p.y };
        curDy = dy0 + (dyTo - dy0) * k;
        setPos(cur.x, cur.y, curDy);
        if (Math.abs(r.dx) > 0.5) face(r.dx);
        if (k < 1) requestAnimationFrame(f);
        else { w.removeAttribute("data-paseo"); res(); }
      }
      requestAnimationFrame(f);
    });
  }
  function head() { return { x: cur.x, y: cur.y - 38 }; }

  /* ---------- rutinas ---------- */
  var R = {};
  R.frutal = async function (tok, t) {
    var side = cur.x < t.x ? -1 : 1, sx = t.x + side * (t.big ? 21 : 15), sy = t.y + 4;
    await walk(tok, { x: sx, y: sy }, 0);
    if (RM) { cur = { x: sx, y: sy }; }
    face(-side);
    var crown = t.y - (t.big ? 44 : 30);
    if (Math.random() < 0.5) {
      await act(tok, "salto", 700);
      spawn("hoja", t.x + rnd(-8, 8), crown, { vy: 6, g: 20, ground: t.y + 2, sway: rnd(0, 6), life: 2600, fade: 700 });
      spawn("manzana", t.x + rnd(-5, 5), crown, { g: 260, ground: sy - 1, bounce: 0.45, vx: side * 12, life: 3600, fade: 500 });
      await act(tok, "salto", 700);
      await sleep(tok, 250);
      spawn("corazon", sx, sy - 46, { vy: -14, life: 1400, fade: 500 });
      await act(tok, "feliz", 900);
    } else {
      await act(tok, "carrera", 380);
      var h = head();
      spawn("estrellas", h.x - side * 3, h.y - 4, { loop: true, life: 1900, fade: 300 });
      for (var i = 0; i < 2; i++) spawn("hoja", t.x + rnd(-10, 10), crown + rnd(-4, 4), { vy: 4, g: 18, ground: t.y + 2, sway: rnd(0, 6), life: 2800, fade: 700, delay: i * 200 });
      spawn("manzana", h.x - side * 2, crown, { g: 300, ground: h.y - 2, vx: 0, life: 4200, fade: 600, delay: 250,
        onland: function (p) { p.ground = sy - 1; p.vy = -80; p.vx = side * 28; p.bounce = 0.4; } });
      await act(tok, "mareo", 1650);
    }
    await sleep(tok, 250);
  };
  R.flor = async function (tok, t) {
    var side = cur.x < t.x ? -1 : 1, sx = t.x + side * 13, sy = t.y + 3;
    await walk(tok, { x: sx, y: sy }, 0);
    if (RM) { cur = { x: sx, y: sy }; }
    face(-side);
    for (var i = 0; i < 3; i++) spawn("polen", t.x + rnd(-3, 3), t.y - t.h * 0.7, { vy: -10, vx: side * 6, life: 900, fade: 400, delay: 250 + i * 260, sway: rnd(0, 6) });
    await act(tok, "oler", 1100);
    if (Math.random() < 0.7) {
      act(tok, "estornudo", 700);
      await sleep(tok, 170);
      spawn("estornudo", cur.x - side * 20, cur.y - 22, { flip: side > 0, vx: -side * 10 });
      for (var j = 0; j < 4; j++) {
        spawn(t.sun ? "polen" : (Math.random() < 0.5 ? "petalo" : "petalo_lila"), t.x + rnd(-3, 3), t.y - t.h * 0.6,
          { vx: -side * rnd(20, 55), vy: rnd(-55, -25), g: 70, ground: t.y + 3, sway: rnd(0, 6), life: 2200, fade: 600 });
      }
      await sleep(tok, 600);
    } else {
      spawn("corazon", cur.x, cur.y - 46, { vy: -14, life: 1400, fade: 500 });
      await act(tok, "feliz", 900);
    }
    await sleep(tok, 300);
  };
  function pondInfo() {
    var p = L().pond, big = !isP();
    return { cx: p[0], cy: p[1] + 1, rx: p[2] + 10, ry: p[3] + 5 };
  }
  R.estanque = async function (tok) {
    var P = pondInfo();
    var a = Math.atan2((cur.y - P.cy) / P.ry, (cur.x - P.cx) / P.rx);
    var stand = { x: P.cx + Math.cos(a) * (P.rx + 9), y: P.cy + Math.sin(a) * (P.ry + 6) + 3 };
    var wp = { x: P.cx + Math.cos(a) * (P.rx - 8), y: P.cy + Math.sin(a) * (P.ry - 5) };
    await walk(tok, stand, 0);
    if (RM) { cur = stand; }
    var dir = wp.x >= stand.x ? 1 : -1;
    face(dir);
    var snout = { x: cur.x + dir * 18, y: Math.max(wp.y, cur.y - 4) };
    await act(tok, "asomarse", 1000);
    spawn("onda", snout.x, snout.y + 3, { life: 720 });
    await sleep(tok, 300);
    act(tok, "chapuzon", 600);
    await sleep(tok, 280);
    spawn("chapoteo", snout.x, snout.y + 4, {});
    spawn("onda", snout.x, snout.y + 4, { delay: 200, life: 720 });
    for (var i = 0; i < 4; i++) spawn("gota", snout.x + rnd(-3, 3), snout.y - 4, { vx: rnd(-35, 35), vy: rnd(-90, -55), g: 260, ground: snout.y + 3, life: 800 });
    await sleep(tok, 450);
    act(tok, "sacudirse", 720);
    for (var k = 0; k < 5; k++) spawn("gota", cur.x + rnd(-8, 8), cur.y - rnd(14, 30), { vx: rnd(-50, 50), vy: rnd(-60, -20), g: 240, ground: cur.y + 1, life: 700, delay: k * 90 });
    await sleep(tok, 800);
  };
  R.tronco = async function (tok, t) {
    var sx = t.x + (cur.x < t.x ? -3 : 3), sy = t.y + 3;
    await walk(tok, { x: sx, y: sy }, 0);
    if (RM) { cur = { x: sx, y: sy }; }
    spawn("polvo", t.x, t.y + 2, {});
    await act(tok, "esconderse", 450);
    await act(tok, "escondido", 10);
    spawn("ojitos", t.x, t.y - 3, { loop: true, life: 1500, fade: 200 });
    await sleep(tok, 1500);
    await act(tok, "espiar", 1800);
    spawn("polvo", t.x, t.y + 2, {});
    await act(tok, "salir", 500);
    await sleep(tok, 200);
  };
  R.puerta = async function (tok, t) {
    await walk(tok, { x: t.x, y: t.y + 4 }, 0);
    if (RM) { cur = { x: t.x, y: t.y + 4 }; }
    face(1);
    await act(tok, "tocar", 900);
    spawn("polvo", t.x, t.y + 3, {});
    await act(tok, "entrar", 500);
    await act(tok, "escondido", 10);
    await juego();
    spawn("polvo", t.x, t.y + 3, {});
    await act(tok, "salir", 500);
  };
  function hojas(t) {
    var crown = t.y - (t.big ? 44 : 30);
    for (var i = 0; i < 4; i++) spawn("hoja", t.x + rnd(-12, 12), crown + rnd(-6, 6), { vy: 5, g: 16, ground: t.y + rnd(0, 4), sway: rnd(0, 6), life: 3000, fade: 800, delay: i * 180 });
  }

  async function run(kind, t) {
    var w = walker();
    if (!w || busy || !R[kind] || !M()) return;
    if (w.getAttribute("data-walking") === "true") return;
    var tok = { dead: false };
    busy = tok;
    var home = wpos(), homeL = w.style.left, homeT = w.style.top, j = w.firstElementChild, homeF = j ? j.style.transform : "";
    cur = { x: home.x, y: home.y };
    curDy = home.dy;
    try {
      await R[kind](tok, t);
      if (!tok.dead) { try { window.dispatchEvent(new CustomEvent("milicenda-secreto", { detail: { id: kind } })); } catch (e) {} }
      w.removeAttribute("data-mil");
      await walk(tok, { x: home.x, y: home.y }, home.dy);
    } catch (e) {
      if (e !== ABORT) console.warn("milicenda:", e);
    } finally {
      w.removeAttribute("data-mil");
      w.removeAttribute("data-paseo");
      if (!tok.dead) { w.style.left = homeL; w.style.top = homeT; if (j) j.style.transform = homeF; }
      busy = null;
      lastAct = performance.now();
    }
  }
  function abort() { if (busy) busy.dead = true; var w = walker(); if (w) { w.removeAttribute("data-mil"); w.removeAttribute("data-paseo"); } }

  /* ---------- qué se puede tocar ---------- */
  var cacheKey = null, cache = [];
  function targets() {
    var p = isP();
    if (cacheKey === p) return cache;
    var lay = L(), out = [];
    (lay.props || []).forEach(function (o) {
      var k = o.k;
      if (k === "arbol_grande_puerta") out.push({ kind: "puerta", x: o.x, y: o.y, hw: 20, h: 60 });
      else if (k.indexOf("bq_") === 0) {
        var ch = /_chico$/.test(k), sp = k.split("_")[1];
        if (sp !== "seco") out.push({ kind: sp === "frutal" ? "frutal" : "arbol", x: o.x, y: o.y, hw: ch ? 12 : 18, h: ch ? 46 : 66, big: !ch });
      } else if (/^(tronco|tocon)/.test(k)) out.push({ kind: "tronco", x: o.x, y: o.y, hw: 12, h: 14 });
      else if (/flores|maceta/.test(k)) out.push({ kind: "flor", x: o.x, y: o.y, hw: 9, h: 16 });
    });
    (lay.flores || []).forEach(function (o) { out.push({ kind: "flor", x: o.x, y: o.y, hw: 7, h: 13 }); });
    (lay.girasoles || []).forEach(function (o) { var g = /grande/.test(o.g || ""); out.push({ kind: "flor", sun: true, x: o.x, y: o.y, hw: 7, h: g ? 30 : 20 }); });
    cacheKey = p;
    cache = out;
    return out;
  }
  function hit(wx, wy) {
    var best = null;
    targets().forEach(function (t) {
      var sc = (t.kind === "arbol" ? 0 : 1000) + t.y;
      if (Math.abs(wx - t.x) <= t.hw && wy <= t.y + 3 && wy >= t.y - t.h && (!best || sc > best.sc)) { best = t; best.sc = sc; }
    });
    if (!best) {
      var P = pondInfo();
      if (Math.pow((wx - P.cx) / P.rx, 2) + Math.pow((wy - P.cy) / P.ry, 2) <= 1) best = { kind: "estanque", x: P.cx, y: P.cy };
    }
    return best;
  }
  function toWorld(cx, cy) {
    var r = world().getBoundingClientRect(), lay = L();
    return { x: (cx - r.left) / r.width * lay.lw, y: (cy - r.top) / r.height * lay.lh };
  }
  function onScreen(x, y) {
    var w = world(), s = stage();
    if (!w || !s) return false;
    var r = w.getBoundingClientRect(), sr = s.getBoundingClientRect(), lay = L();
    var cx = r.left + x / lay.lw * r.width, cy = r.top + y / lay.lh * r.height;
    return cx > sr.left + 40 && cx < sr.right - 40 && cy > sr.top + 60 && cy < sr.bottom - 40;
  }
  function doTarget(t) {
    if (t.kind === "arbol") { hojas(t); return; }
    run(t.kind, t);
  }

  /* ---------- toques ---------- */
  var down = null, lastAct = performance.now(), hooked = null;
  function hook() {
    var s = stage();
    if (!s || hooked === s) return;
    hooked = s;
    s.addEventListener("pointerdown", function (e) {
      lastAct = performance.now();
      down = (e.isPrimary && (e.pointerType !== "mouse" || e.button === 0)) ? { x: e.clientX, y: e.clientY, t: performance.now() } : null;
    }, true);
    s.addEventListener("pointerup", function (e) {
      var d = down;
      down = null;
      if (!d || !walker()) return;
      if (Math.hypot(e.clientX - d.x, e.clientY - d.y) > 7 || performance.now() - d.t > 650) return;
      if (e.target.closest && e.target.closest("button,a,[role=dialog]")) return;
      var p = toWorld(e.clientX, e.clientY), t = hit(p.x, p.y);
      if (t) doTarget(t);
    }, true);
    s.addEventListener("click", function (e) {
      var b = e.target.closest && e.target.closest("button");
      if (b && !b.classList.contains("mil-puerta") && !b.classList.contains("clocky-walker")) abort();
    }, true);
    s.addEventListener("pointermove", function (e) {
      if (e.pointerType !== "mouse" || down || !world()) return;
      if (e.target.closest && e.target.closest("button")) return;
      var p = toWorld(e.clientX, e.clientY);
      s.style.cursor = hit(p.x, p.y) ? "pointer" : "";
    });
    s.addEventListener("wheel", function () { lastAct = performance.now(); }, { passive: true });
  }
  ["keydown", "scroll"].forEach(function (ev) { window.addEventListener(ev, function () { lastAct = performance.now(); }, { passive: true }); });

  var mo = null, moW = null;
  function watchWalker() {
    var w = walker();
    if (!w || moW === w) return;
    moW = w;
    if (mo) mo.disconnect();
    mo = new MutationObserver(function () { if (w.getAttribute("data-walking") === "true") abort(); });
    mo.observe(w, { attributes: true, attributeFilter: ["data-walking"] });
  }

  /* puerta secreta: botón invisible sobre el árbol (sirve para teclado) */
  var door = null, doorKey = null;
  function doorBtn() {
    var w = world();
    if (!w) return;
    var t = null;
    targets().forEach(function (o) { if (o.kind === "puerta") t = o; });
    if (!t) return;
    var key = isP() + ":" + t.x;
    if (door && door.parentElement === w && doorKey === key) return;
    if (door) door.remove();
    var z = Z();
    door = document.createElement("button");
    door.type = "button";
    door.className = "mil-puerta";
    door.setAttribute("aria-label", "Un árbol con una puertita. Adentro hay un jueguito secreto.");
    door.style.left = (t.x - 14) * z + "px";
    door.style.top = (t.y - 34) * z + "px";
    door.style.width = 28 * z + "px";
    door.style.height = 36 * z + "px";
    door.addEventListener("click", function (e) { e.stopPropagation(); run("puerta", t); });
    w.appendChild(door);
    doorKey = key;
  }

  /* ---------- easter eggs al quedarse quieto ---------- */
  var nextIdle = IDLE_MS, sparkT = 0;
  setInterval(function () {
    if (!M() || !walker()) return;
    hook(); watchWalker(); doorBtn();
    var s = stage();
    if (s) s.setAttribute("data-mil-noche", /1b1840/.test(s.style.background || "") ? "true" : "false");
    if (document.visibilityState !== "visible" || RM) return;
    var now = performance.now();
    if (!busy && now - sparkT > 9000) {
      sparkT = now;
      targets().forEach(function (t) {
        if (t.kind === "puerta" && onScreen(t.x, t.y)) {
          for (var i = 0; i < 3; i++) spawn("polen", t.x + rnd(-10, 10), t.y - rnd(8, 30), { vy: -8, life: 900, fade: 400, delay: i * 300 });
        }
      });
    }
    if (busy || now - lastAct < nextIdle) return;
    if (walker().getAttribute("data-walking") === "true") return;
    var c = wpos(), opts = targets().filter(function (t) {
      return (t.kind === "frutal" || t.kind === "flor" || t.kind === "tronco") && Math.hypot(t.x - c.x, t.y - c.y) < 170 && onScreen(t.x, t.y);
    });
    var P = pondInfo();
    if (Math.hypot(P.cx - c.x, P.cy - c.y) < 190 && onScreen(P.cx, P.cy)) opts.push({ kind: "estanque", x: P.cx, y: P.cy }, { kind: "estanque", x: P.cx, y: P.cy });
    lastAct = now;
    nextIdle = IDLE_MS + Math.random() * 14000;
    if (opts.length) doTarget(opts[Math.floor(Math.random() * opts.length)]);
  }, 1000);

  /* ---------- jueguito: atrapar manzanas y pétalos ---------- */
  var img = new Image();
  img.src = SHEET;
  function juego() {
    return new Promise(function (resolve) {
      var GW = 160, GH = 120, DUR = 30;
      var prev = document.activeElement;
      var ov = document.createElement("div");
      ov.className = "mil-juego";
      ov.setAttribute("role", "dialog");
      ov.setAttribute("aria-modal", "true");
      ov.setAttribute("aria-labelledby", "mil-jt");
      ov.innerHTML = '<div class="mil-panel"><div class="mil-top"><h2 id="mil-jt">Atrapá manzanas con Clocky</h2>' +
        '<span class="mil-chip" aria-live="polite">Puntos <b class="mil-pts">0</b></span><span class="mil-chip"><b class="mil-t">30</b> s</span>' +
        '<button type="button" class="mil-btn mil-x" aria-label="Salir del juego">×</button></div>' +
        '<div class="mil-cancha"><canvas width="' + GW + '" height="' + GH + '"></canvas><div class="mil-cl"><div></div></div>' +
        '<div class="mil-msg"><p>¡Llueven manzanas!</p><small>Mové a Clocky con el dedo, el mouse o las flechas.<br>Manzana y pétalo: 1 · dorada: 3 · piña: −1</small>' +
        '<button type="button" class="mil-btn prim mil-go">Jugar</button></div></div>' +
        '<p class="mil-pie">Récord: <b class="mil-rec">0</b></p></div>';
      document.body.appendChild(ov);
      var cv = ov.querySelector("canvas"), g = cv.getContext("2d"), cancha = ov.querySelector(".mil-cancha");
      var cl = ov.querySelector(".mil-cl"), msg = ov.querySelector(".mil-msg");
      var ptsEl = ov.querySelector(".mil-pts"), tEl = ov.querySelector(".mil-t"), recEl = ov.querySelector(".mil-rec");
      var svg = walker() && walker().querySelector("svg");
      if (svg) cl.firstChild.appendChild(svg.cloneNode(true));
      g.imageSmoothingEnabled = false;
      var rec = 0;
      try { rec = parseInt(localStorage.getItem("milicenda-record-manzanas") || "0", 10) || 0; } catch (e) { rec = 0; }
      recEl.textContent = rec;
      var bg = document.createElement("canvas");
      bg.width = GW; bg.height = GH;
      (function paint(b) {
        var c = b.getContext("2d");
        var band = function (col, y, h) { c.fillStyle = col; c.fillRect(0, y, GW, h); };
        band("#8fd2d2", 0, 44); band("#c8ecdc", 44, 30);
        c.fillStyle = "#587a35";
        for (var x = 0; x < GW; x++) { var hh = 74 - Math.round(6 + 4 * Math.sin(x * 0.21) + 3 * Math.sin(x * 0.07 + 1)); c.fillRect(x, hh, 1, 92 - hh); }
        c.fillStyle = "#35563a";
        for (var x2 = 0; x2 < GW; x2++) { var h2 = 84 - Math.round(4 + 3 * Math.sin(x2 * 0.33 + 2)); c.fillRect(x2, h2, 1, 92 - h2); }
        band("#8aa23a", 92, 28); band("#bcc046", 92, 2);
        c.fillStyle = "#587a35";
        for (var i = 0; i < 40; i++) c.fillRect((i * 37) % GW, 96 + (i * 13) % 22, 2, 1);
        [[12, 98], [146, 100], [30, 110], [128, 112]].forEach(function (f) {
          c.fillStyle = "#2e1b14"; c.fillRect(f[0] - 2, f[1] - 2, 5, 5);
          c.fillStyle = "#f2c230"; c.fillRect(f[0] - 1, f[1] - 1, 3, 3);
          c.fillStyle = "#5a3322"; c.fillRect(f[0], f[1], 1, 1);
        });
      })(bg);
      var items = [], fx = [], score = 0, tLeft = DUR, playing = false, rafG = 0, lastT = 0, spawnT = 0;
      var px = GW / 2, target = GW / 2, faceR = true;
      function draw(name, x, y, fi) {
        var m = META[name], f = m.frames[(fi || 0) % m.frames.length];
        g.drawImage(img, f.x, f.y, m.w, m.h, Math.round(x - m.w / 2), Math.round(y - m.h / 2), m.w, m.h);
      }
      function place() {
        cl.style.left = (px / GW * 100) + "%";
        cl.firstChild.style.transform = faceR ? "none" : "scaleX(-1)";
      }
      function pulse(cls) { cl.classList.remove(cls); void cl.offsetWidth; cl.classList.add(cls); }
      function newItem() {
        var r = Math.random(), k = r < 0.5 ? "manzana" : r < 0.75 ? (Math.random() < 0.5 ? "petalo" : "petalo_lila") : r < 0.83 ? "manzana_dorada" : "pina";
        var lvl = 1 + (DUR - tLeft) / DUR;
        items.push({ k: k, x: rnd(8, GW - 8), y: -6, vy: (/petalo/.test(k) ? rnd(14, 20) : rnd(26, 40)) * lvl, ph: rnd(0, 6), t: 0 });
      }
      function loop(now) {
        var dt = Math.min(0.05, (now - lastT) / 1000);
        lastT = now;
        if (playing) {
          tLeft -= dt;
          spawnT -= dt;
          if (spawnT <= 0) { newItem(); spawnT = Math.max(0.32, 0.8 - (DUR - tLeft) * 0.015); }
          var dx = target - px, sp = 150 * dt;
          if (Math.abs(dx) > 0.5) { px += Math.max(-sp, Math.min(sp, dx)); faceR = dx > 0; }
          tEl.textContent = Math.max(0, Math.ceil(tLeft));
          if (tLeft <= 0) fin();
        }
        g.drawImage(bg, 0, 0);
        for (var i = items.length - 1; i >= 0; i--) {
          var it = items[i];
          it.t += dt; it.y += it.vy * dt;
          var x = it.x + (/petalo/.test(it.k) ? Math.sin(it.t * 3 + it.ph) * 5 : 0);
          var mouthY = GH - 30;
          if (playing && it.y > mouthY - 4 && it.y < mouthY + 8 && Math.abs(x - px) < 13) {
            items.splice(i, 1);
            if (it.k === "pina") { score = Math.max(0, score - 1); fx.push({ k: "estrellas", x: px, y: mouthY - 14, t: 0, life: 0.9 }); pulse("ay"); }
            else { score += it.k === "manzana_dorada" ? 3 : 1; fx.push({ k: it.k === "manzana_dorada" ? "corazon" : "polen", x: x, y: mouthY - 6, t: 0, life: 0.6, vy: -20 }); pulse("come"); }
            ptsEl.textContent = score;
            continue;
          }
          if (it.y > GH + 8) { items.splice(i, 1); continue; }
          draw(it.k, x, it.y, Math.floor(it.t * 6));
        }
        for (var j = fx.length - 1; j >= 0; j--) {
          var e = fx[j];
          e.t += dt; e.y += (e.vy || 0) * dt;
          if (e.t > e.life) { fx.splice(j, 1); continue; }
          draw(e.k, e.x, e.y, Math.floor(e.t * 9));
        }
        place();
        rafG = requestAnimationFrame(loop);
      }
      function start() {
        items = []; fx = []; score = 0; tLeft = DUR; spawnT = 0; playing = true;
        ptsEl.textContent = "0"; tEl.textContent = DUR;
        msg.style.display = "none";
        cancha.focus();
      }
      function fin() {
        playing = false;
        var nuevo = score > rec;
        if (nuevo) { rec = score; try { localStorage.setItem("milicenda-record-manzanas", String(rec)); } catch (e) { /* sin guardado */ } }
        recEl.textContent = rec;
        msg.innerHTML = "<p>¡Atrapaste " + score + "!</p><small>" + (nuevo ? "¡Récord nuevo!" : "Récord: " + rec) + "</small>" +
          '<div style="display:flex;gap:10px"><button type="button" class="mil-btn prim mil-go">Otra vez</button><button type="button" class="mil-btn mil-salir">Volver al mapa</button></div>';
        msg.style.display = "";
        msg.querySelector(".mil-go").addEventListener("click", start);
        msg.querySelector(".mil-salir").addEventListener("click", close);
        msg.querySelector(".mil-go").focus();
      }
      function close() {
        cancelAnimationFrame(rafG);
        document.removeEventListener("keydown", key, true);
        ov.remove();
        if (prev && prev.focus) try { prev.focus(); } catch (e) { /* nada */ }
        resolve();
      }
      function aim(e) {
        var r = cancha.getBoundingClientRect();
        target = Math.max(8, Math.min(GW - 8, (e.clientX - r.left) / r.width * GW));
      }
      function key(e) {
        if (e.key === "Escape") { e.preventDefault(); close(); return; }
        if (e.key === "ArrowLeft" || e.key === "a") { target = Math.max(8, px - 22); e.preventDefault(); }
        if (e.key === "ArrowRight" || e.key === "d") { target = Math.min(GW - 8, px + 22); e.preventDefault(); }
      }
      cancha.tabIndex = 0;
      cancha.setAttribute("aria-label", "Cancha del juego. Usá las flechas para mover a Clocky.");
      cancha.addEventListener("pointermove", aim);
      cancha.addEventListener("pointerdown", aim);
      document.addEventListener("keydown", key, true);
      ov.querySelector(".mil-x").addEventListener("click", close);
      msg.querySelector(".mil-go").addEventListener("click", start);
      ov.addEventListener("click", function (e) { if (e.target === ov) close(); });
      place();
      lastT = performance.now();
      rafG = requestAnimationFrame(loop);
      msg.querySelector(".mil-go").focus();
    });
  }
  window.__milici = { juego: juego, run: run, targets: targets, hit: hit };
})();
