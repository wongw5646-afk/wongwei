/* =========================================================
   Little googly-eyed worms on the page.

   1) EATING worms: put one at the end of a word, inside a span.eat:
        <span class="eat">Overview<span class="deco-worm" data-eat="1"></span></span>
      The worm sits right after the last letter, chomps on it, takes
      two round bites out of it and drops crumbs.

   2) RESTING worms, placed by a class (w-onLine, w-topRight, w-peekLeft):
        <span class="deco-worm w-onLine" data-len="3-4" data-cell="30" data-flat="1"></span>
      - data-len   how many squares long (a number, or a range like 2-4)
      - data-cell  size of one square in pixels (default 30)
      - data-flat  "1" = lie flat in a straight line
   Eyes follow the cursor, they blink, and they giggle when poked.
   ========================================================= */
(function () {
  var SVGNS = "http://www.w3.org/2000/svg";
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var GIGGLES = ["hee hee!", "boop!", "hi!", "eep!", "that tickles!", "wiggle wiggle", "shh, I'm reading", "nom?"];
  var NOMS = ["nom nom", "tasty word!", "crunchy!", "mmm letters", "just one more bite"];

  var BASE = {
    2: [[[0, 0], [1, 0]]],
    3: [[[0, 0], [1, 0], [2, 0]], [[0, 0], [1, 0], [1, 1]]],
    4: [[[0, 0], [1, 0], [2, 0], [3, 0]], [[0, 0], [1, 0], [2, 0], [2, 1]], [[0, 0], [1, 0], [1, 1], [2, 1]]],
    5: [[[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]], [[0, 0], [1, 0], [2, 0], [3, 0], [3, 1]],
        [[0, 1], [0, 0], [1, 0], [2, 0], [2, 1]], [[0, 0], [1, 0], [1, 1], [2, 1], [3, 1]]]
  };
  function variants(len) {
    var seen = {}, out = [];
    BASE[len].forEach(function (s) {
      for (var m = 0; m < 2; m++) for (var r = 0; r < 4; r++) {
        var t = s.map(function (p) {
          var x = m ? -p[0] : p[0], y = p[1];
          for (var k = 0; k < r; k++) { var tmp = x; x = -y; y = tmp; }
          return [x, y];
        });
        var mx = Math.min.apply(null, t.map(function (p) { return p[0]; }));
        var my = Math.min.apply(null, t.map(function (p) { return p[1]; }));
        t = t.map(function (p) { return [p[0] - mx, p[1] - my]; });
        if (t.some(function (p) { return p[1] > 1; })) continue;   // keep them low and long
        var key = t.join("|");
        if (!seen[key]) { seen[key] = 1; out.push(t); }
      }
    });
    return out;
  }

  function el(tag, attrs, parent) {
    var e = document.createElementNS(SVGNS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }

  // smooth worm line through square centres, rounded at the bends
  function wormPath(pts, cell) {
    var p = [pts[0]];
    for (var i = 1; i < pts.length - 1; i++) {
      var a = pts[i - 1], b = pts[i], c = pts[i + 1];
      if ((b[0] - a[0]) * (c[1] - b[1]) !== (b[1] - a[1]) * (c[0] - b[0])) p.push(b);
    }
    p.push(pts[pts.length - 1]);
    var r = cell * 0.5, d = "M" + p[0][0] + " " + p[0][1];
    for (var j = 1; j < p.length - 1; j++) {
      var pr = p[j - 1], cu = p[j], nx = p[j + 1];
      var ix = Math.sign(cu[0] - pr[0]), iy = Math.sign(cu[1] - pr[1]);
      var ox = Math.sign(nx[0] - cu[0]), oy = Math.sign(nx[1] - cu[1]);
      d += " L" + (cu[0] - ix * r) + " " + (cu[1] - iy * r) + " Q" + cu[0] + " " + cu[1] + " " + (cu[0] + ox * r) + " " + (cu[1] + oy * r);
    }
    var last = p[p.length - 1];
    return d + " L" + last[0] + " " + last[1];
  }

  function draw(host, shape, cell) {
    var cols = Math.max.apply(null, shape.map(function (p) { return p[0]; })) + 1;
    var rows = Math.max.apply(null, shape.map(function (p) { return p[1]; })) + 1;
    var w = cols * cell, h = rows * cell;
    var pts = shape.map(function (p) { return [(p[0] + 0.5) * cell, (p[1] + 0.5) * cell]; });
    host.setAttribute("aria-hidden", "true");
    host.style.width = w + "px";
    host.style.height = h + "px";
    host.innerHTML = "";
    var svg = el("svg", { width: w, height: h, viewBox: "0 0 " + w + " " + h }, null);
    var wig = el("g", { class: "wig" }, svg);
    wig.style.animationDelay = (-Math.random() * 4).toFixed(2) + "s";
    el("path", { d: wormPath(pts, cell), class: "body", "stroke-width": (cell * 0.84).toFixed(1) }, wig);
    host.appendChild(svg);
    return { svg: svg, wig: wig, pts: pts };
  }

  function giggle(host, list) {
    host.classList.remove("squish"); void host.offsetWidth; host.classList.add("squish");
    setTimeout(function () { host.classList.remove("squish"); }, 600);
    var b = host.getBoundingClientRect();
    var g = document.createElement("div");
    g.className = "giggle";
    g.textContent = list[Math.floor(Math.random() * list.length)];
    g.style.position = "absolute";
    g.style.left = (b.left + b.width / 2 + window.scrollX) + "px";
    g.style.top = (b.top + window.scrollY - 34) + "px";
    document.body.appendChild(g);
    setTimeout(function () { g.remove(); }, 1500);
  }

  var lookers = [], all = [], eaters = [];

  /* ---------- 1) worms eating the last letter of a word ---------- */
  function setupEater(host) {
    var wrap = host.parentElement;
    // wrap the last letter in <span class="bite">
    var text = null;
    for (var n = host.previousSibling; n; n = n.previousSibling) {
      if (n.nodeType === 3 && n.nodeValue.trim()) { text = n; break; }
    }
    if (!text) return;
    var s = text.nodeValue.replace(/\s+$/, "");
    var bite = document.createElement("span");
    bite.className = "bite";
    bite.textContent = s.slice(-1);
    text.nodeValue = s.slice(0, -1);
    wrap.insertBefore(bite, host);

    // crumbs falling from the bite
    var crumbs = [0, 1, 2].map(function (i) {
      var c = document.createElement("span");
      c.className = "crumb";
      c.setAttribute("aria-hidden", "true");
      c.style.setProperty("--dx", (-.05 - i * .07).toFixed(2) + "em");
      c.style.animationDelay = (i * 0.45).toFixed(2) + "s";
      wrap.appendChild(c);
      return c;
    });

    host.classList.add("eater");
    var e = { host: host, wrap: wrap, bite: bite, crumbs: crumbs, tailUp: host.dataset.flat === "1" ? false : Math.random() < 0.5, len: +host.dataset.len || 3 + (Math.random() < 0.4 ? 1 : 0) };
    eaters.push(e);
    all.push(e);
    host.addEventListener("click", function () { giggle(host, NOMS); });
    host.style.pointerEvents = "none";
  }

  // build or rebuild an eating worm to fit the current word size
  function layoutEater(e) {
    var fs = parseFloat(getComputedStyle(e.wrap).fontSize);
    var cell = Math.max(18, Math.round(fs * 0.56));
    // head on the LEFT, facing the letter; tail may curl up at the far end
    var shape = [];
    for (var i = 0; i < e.len; i++) shape.push([i, 1]);
    if (e.tailUp) shape.push([e.len - 1, 0]);
    var d = draw(e.host, shape, cell);
    var head = d.pts[0];

    // mouth at the front of the head, chomping on the letter
    var mouth = el("g", { transform: "translate(" + (head[0] - cell * 0.2).toFixed(1) + " " + (head[1] + cell * 0.08).toFixed(1) + ")" }, d.wig);
    var mi = el("g", { class: "mouth-in" }, mouth);
    el("ellipse", { cx: 0, cy: 0, rx: (cell * 0.17).toFixed(1), ry: (cell * 0.16).toFixed(1), class: "mouth-hole" }, mi);
    el("ellipse", { cx: (cell * 0.02).toFixed(1), cy: (cell * 0.08).toFixed(1), rx: (cell * 0.09).toFixed(1), ry: (cell * 0.05).toFixed(1), class: "tongue" }, mi);
    // eyes above, glancing down at their snack
    var eyesG = el("g", { class: "eyes" }, d.wig);
    var er = cell * 0.13, ex = head[0] + cell * 0.12, ey = head[1] - cell * 0.2;
    [[ex - er * 1.15, ey], [ex + er * 1.15, ey]].forEach(function (p) {
      el("circle", { cx: p[0], cy: p[1], r: er, class: "eye-white" }, eyesG);
      el("circle", { cx: p[0] - er * 0.32, cy: p[1] + er * 0.22, r: er * 0.6, class: "pupil" }, eyesG);
    });

    // line the head up with the bitten letter
    var bx = e.bite.offsetLeft + e.bite.offsetWidth;          // right edge of the letter
    var by = e.bite.offsetTop + e.bite.offsetHeight * 0.56;     // middle of the letter
    var rowY = (shape[0][1] + 0.5) * cell;
    e.host.style.left = (bx - cell * 0.42) + "px";
    e.host.style.top = (by - rowY) + "px";
    e.crumbs.forEach(function (c, i) {
      c.style.left = (bx - fs * 0.08 - i * fs * 0.03) + "px";
      c.style.top = (by + fs * 0.12) + "px";
    });
  }

  /* ---------- 3) crawling worms: wiggle their way around the edge of
     the picture they sit on (turn off with data-crawl="0") ---------- */
  var crawlers = [];
  function setupCrawler(host, len, cell) {
    var L = len * cell, A = cell * 0.16;               // body length, wave height
    var w = L + cell, h = cell + A * 2 + 4;
    host.setAttribute("aria-hidden", "true");
    host.classList.add("crawl");
    host.style.width = w + "px";
    host.style.height = h + "px";
    host.innerHTML = "";
    var svg = el("svg", { width: w, height: h, viewBox: "0 0 " + w + " " + h }, null);
    var g = el("g", {}, svg);
    var body = el("path", { class: "body", "stroke-width": (cell * 0.84).toFixed(1) }, g);
    var eyesG = el("g", { class: "eyes" }, g);
    var er = cell * 0.12;
    [-1, 1].forEach(function (s, k) {
      var r = er * (k ? 1.08 : 1);
      el("circle", { cx: 0, cy: s * er * 1.15, r: r, class: "eye-white" }, eyesG);
      el("circle", { cx: r * 0.35, cy: s * er * 1.15, r: r * 0.62, class: "pupil" }, eyesG);
    });
    host.appendChild(svg);
    var c = { host: host, body: body, eyes: eyesG, L: L, A: A, cell: cell, mid: h / 2, phase: Math.random() * 6, anim: null };
    host.addEventListener("click", function () { giggle(host, GIGGLES); });
    crawlers.push(c);
    all.push(c);
    route(c);
    if (window.ResizeObserver) new ResizeObserver(function () { route(c); }).observe(host.parentElement);
  }

  // rounded box just outside the picture's edge; the worm follows it clockwise
  function route(c) {
    var p = c.host.parentElement, W = p.offsetWidth, H = p.offsetHeight;
    if (!W || !H) return;
    var o = c.cell * 0.32;                                         // sit on the edge, mostly outside it
    var R = Math.min(34 + o, W / 2, H / 2), x0 = -o, y0 = -o, x1 = W + o, y1 = H + o;
    var d = "M" + (x0 + R) + " " + y0 + " H" + (x1 - R) + " A" + R + " " + R + " 0 0 1 " + x1 + " " + (y0 + R) +
            " V" + (y1 - R) + " A" + R + " " + R + " 0 0 1 " + (x1 - R) + " " + y1 +
            " H" + (x0 + R) + " A" + R + " " + R + " 0 0 1 " + x0 + " " + (y1 - R) +
            " V" + (y0 + R) + " A" + R + " " + R + " 0 0 1 " + (x0 + R) + " " + y0 + " Z";
    var s = c.host.style;
    s.left = "0px"; s.top = "0px"; s.right = "auto"; s.bottom = "auto"; s.transform = "none";
    s.offsetPath = "path('" + d + "')";
    s.offsetRotate = "auto";
    var per = 2 * (W + H + 4 * o) - (8 - 2 * Math.PI) * R;
    var keep = c.anim ? c.anim.effect.getComputedTiming().progress || 0 : Math.random();
    if (c.anim) c.anim.cancel();
    if (reduceMotion) { s.offsetDistance = (keep * 100) + "%"; return; }
    c.anim = c.host.animate([{ offsetDistance: "0%" }, { offsetDistance: "100%" }],
      { duration: per / 26 * 1000, iterations: Infinity });            // about 26px a second
    c.anim.currentTime = keep * per / 26 * 1000;
  }

  // the body ripples like a real worm as it goes
  function wave(c, t) {
    var n = 14, pts = [], x0 = c.cell / 2;
    for (var i = 0; i <= n; i++) {
      var u = i / n, x = x0 + u * (c.L - c.cell * 0.2);
      var y = c.mid + Math.sin(u * Math.PI * 2.2 - t * 5 + c.phase) * c.A * (0.4 + 0.6 * Math.sin(u * Math.PI));
      pts.push(x.toFixed(1) + " " + y.toFixed(1));
    }
    c.body.setAttribute("d", "M" + pts.join(" L"));
    var head = pts[n].split(" ");
    c.eyes.setAttribute("transform", "translate(" + (+head[0] - c.cell * 0.02).toFixed(1) + " " + head[1] + ")");
  }

  /* ---------- 2) resting worms ---------- */
  function setupResting(host) {
    var cell = +host.dataset.cell || 30;
    var lenSpec = (host.dataset.len || "2-4").split("-").map(Number);
    var len = lenSpec[0] + Math.floor(Math.random() * ((lenSpec[1] || lenSpec[0]) - lenSpec[0] + 1));
    len = Math.max(2, Math.min(5, len));
    if (host.dataset.crawl !== "0" && "offsetPath" in host.style) { setupCrawler(host, Math.max(3, len), cell); return; }
    var shape;
    if (host.dataset.flat === "1") {
      shape = []; for (var i = 0; i < len; i++) shape.push([i, 0]);
      if (Math.random() < 0.5) shape.reverse();
    } else {
      var opts = variants(len);
      shape = opts[Math.floor(Math.random() * opts.length)];
    }
    var d = draw(host, shape, cell);
    var head = d.pts[0], neck = d.pts[1];
    var fx = Math.sign(head[0] - neck[0]), fy = Math.sign(head[1] - neck[1]);
    var er = cell * 0.12, gap = er * 2 + cell * 0.05;
    var cx = head[0] + fx * cell * 0.1, cy = head[1] + fy * cell * 0.08 - (fx ? cell * 0.04 : 0);
    var eyesG = el("g", { class: "eyes" }, d.wig);
    var eyes = [], pupils = [];
    [[cx - gap / 2, cy], [cx + gap / 2, cy]].forEach(function (p, k) {
      var r = er * (k ? 1.08 : 1);
      el("circle", { cx: p[0], cy: p[1], r: r, class: "eye-white" }, eyesG);
      var a = Math.random() * Math.PI * 2, m = r * 0.38 - 0.4;
      pupils.push(el("circle", { cx: p[0] + Math.cos(a) * m, cy: p[1] + Math.sin(a) * m, r: r * 0.62, class: "pupil" }, eyesG));
      eyes.push({ cx: p[0], cy: p[1], r: r });
    });
    host.addEventListener("click", function () { giggle(host, GIGGLES); });
    var w = { host: host, eyes: eyes, pupils: pupils };
    lookers.push(w);
    all.push(w);
  }

  document.querySelectorAll(".deco-worm").forEach(function (host) {
    if (host.dataset.eat) setupEater(host); else setupResting(host);
  });
  if (!all.length) return;

  function layoutAll() { eaters.forEach(layoutEater); }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(layoutAll); else layoutAll();
  layoutAll();
  var rt;
  window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(layoutAll, 120); });

  // resting worms' eyes follow the cursor
  var mouse = null, ticking = false;
  document.addEventListener("pointermove", function (ev) {
    if (ev.pointerType !== "mouse") return;
    mouse = { x: ev.clientX, y: ev.clientY };
    if (!ticking) { ticking = true; requestAnimationFrame(look); }
  });
  function look() {
    ticking = false;
    lookers.forEach(function (w) {
      var b = w.host.getBoundingClientRect();
      if (b.bottom < -50 || b.top > innerHeight + 50) return;
      w.eyes.forEach(function (e, k) {
        var tx = mouse.x - (b.left + e.cx), ty = mouse.y - (b.top + e.cy);
        var len = Math.hypot(tx, ty) || 1, m = (e.r * 0.38 - 0.4) * Math.min(1, len / 40);
        w.pupils[k].setAttribute("cx", (e.cx + tx / len * m).toFixed(1));
        w.pupils[k].setAttribute("cy", (e.cy + ty / len * m).toFixed(1));
      });
    });
  }

  crawlers.forEach(function (c) { wave(c, 0); });
  if (reduceMotion) { eaters.forEach(function (e) { e.host.classList.add("full"); }); return; }

  if (crawlers.length) (function tick(ms) {
    crawlers.forEach(function (c) {
      var b = c.host.getBoundingClientRect();
      if (b.bottom > -80 && b.top < innerHeight + 80) wave(c, ms / 1000);
    });
    requestAnimationFrame(tick);
  })(0);

  // eaters chomp in bursts, then rest a moment, each on its own rhythm
  eaters.forEach(function (e) {
    function cycle() {
      e.host.classList.remove("full");
      e.crumbs.forEach(function (c) { c.style.visibility = "visible"; });
      setTimeout(function () {
        e.host.classList.add("full");
        e.crumbs.forEach(function (c) { c.style.visibility = "hidden"; });
        setTimeout(cycle, 1800 + Math.random() * 2200);
      }, 1400 + Math.random() * 900);
    }
    setTimeout(cycle, Math.random() * 2000);
  });

  // blinking, and the odd wriggle
  setInterval(function () {
    all.forEach(function (w) {
      if (Math.random() < 0.07) {
        w.host.classList.add("blink");
        setTimeout(function () { w.host.classList.remove("blink"); }, 140);
      }
    });
  }, 500);
  setInterval(function () {
    if (!lookers.length) return;
    var w = lookers[Math.floor(Math.random() * lookers.length)];
    w.host.classList.add("wriggle");
    setTimeout(function () { w.host.classList.remove("wriggle"); }, 900);
  }, 2200);
})();
