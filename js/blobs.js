/* =========================================================
   Landing page: googly-eyed WORMS packed like Tetris pieces.
   On load they drop in from the top and stack from the bottom,
   then they stay in place, wiggle, blink and watch the cursor.
   ========================================================= */
(function () {
  var stage = document.getElementById("blobStage");
  var hero = stage.parentElement;

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var SVGNS = "http://www.w3.org/2000/svg";
  var TOP = 72;          // keep clear of the top bar
  var THICK = 0.84;      // worm thickness as a share of one grid square (1 = no gaps)
  var GIGGLES = ["hee hee!", "boop!", "that tickles!", "squish!", "eep!", "hi!", "wheee", "again!", "wiggle wiggle", "nom?", "hehe", "shh, I'm hiding"];

  var W, H, cell, cols, rows, ox, oy, grid, worms = [];
  var mouse = null;

  /* ---------- worm shapes (Tetris-style pieces) ----------
     Each is a list of grid squares in order from head to tail. */
  var BASE = {
    2: [[[0, 0], [1, 0]]],
    3: [[[0, 0], [1, 0], [2, 0]], [[0, 0], [1, 0], [1, 1]]],
    4: [[[0, 0], [1, 0], [2, 0], [3, 0]], [[0, 0], [1, 0], [2, 0], [2, 1]], [[0, 0], [1, 0], [1, 1], [2, 1]]],
    5: [[[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]], [[0, 0], [1, 0], [2, 0], [3, 0], [3, 1]],
        [[0, 1], [0, 0], [1, 0], [2, 0], [2, 1]], [[0, 0], [1, 0], [1, 1], [2, 1], [3, 1]],
        [[0, 0], [0, 1], [1, 1], [1, 2], [2, 2]]]
  };
  // every rotation and mirror image of each shape
  var SHAPES = {};
  Object.keys(BASE).forEach(function (len) {
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
        var key = t.join("|");
        if (!seen[key]) { seen[key] = 1; out.push(t); }
      }
    });
    SHAPES[len] = out;
  });

  function shuffle(a) {
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }

  /* ---------- the grid ---------- */
  function rectOf(sel, pad) {
    var e = hero.querySelector(sel);
    if (!e) return null;
    var hr = hero.getBoundingClientRect();
    var r;
    if (e.tagName === "H1" || e.classList.contains("subtitle")) {
      var range = document.createRange(); range.selectNodeContents(e); r = range.getBoundingClientRect();
    } else r = e.getBoundingClientRect();
    return { l: r.left - hr.left - pad, r: r.right - hr.left + pad, t: r.top - hr.top - pad, b: r.bottom - hr.top + pad };
  }

  function setupGrid() {
    W = hero.clientWidth; H = hero.clientHeight;
    var small = W < 640;
    cell = Math.max(52, Math.min(110, Math.min(W, H - TOP) / (small ? 6 : 7.5)));
    cols = Math.floor(W / cell);
    rows = Math.floor((H - TOP - 6) / cell);
    ox = (W - cols * cell) / 2;
    oy = H - rows * cell - 6;             // stack from the bottom, like Tetris
    grid = [];
    var blocks = [rectOf(".hero-text h1", 10), rectOf(".hero-text .subtitle", 10), rectOf(".poke", 0)].filter(Boolean);
    for (var y = 0; y < rows; y++) {
      grid.push([]);
      for (var x = 0; x < cols; x++) {
        var cl = ox + x * cell, ct = oy + y * cell;
        var blocked = blocks.some(function (b) { return cl < b.r && cl + cell > b.l && ct < b.b && ct + cell > b.t; });
        grid[y].push(blocked ? 2 : 0);   // 0 free, 1 worm, 2 keep clear
      }
    }
  }

  function fits(shape, ax, ay) {
    return shape.every(function (p) {
      var x = ax + p[0], y = ay + p[1];
      return y >= 0 && y < rows && x >= 0 && x < cols && grid[y][x] === 0;
    });
  }
  function claim(shape, ax, ay) {
    shape.forEach(function (p) { grid[ay + p[1]][ax + p[0]] = 1; });
    return shape.map(function (p) { return [ax + p[0], ay + p[1]]; });
  }

  // try to put a piece of this length so that it covers square (x, y)
  function tryPlaceAt(len, x, y) {
    var opts = shuffle(SHAPES[len].slice());
    for (var i = 0; i < opts.length; i++) {
      var s = opts[i];
      var anchors = shuffle(s.slice());
      for (var k = 0; k < anchors.length; k++) {
        var ax = x - anchors[k][0], ay = y - anchors[k][1];
        if (fits(s, ax, ay)) return claim(s, ax, ay);
      }
    }
    return null;
  }

  function layout() {
    setupGrid();
    var pieces = [];

    // 1) project worms first, long and spread apart
    PROJECTS.forEach(function (p, i) {
      var best = null, bestD = -1;
      for (var t = 0; t < 300; t++) {
        var len = Math.random() < 0.5 ? 5 : 4;
        var s = SHAPES[len][Math.floor(Math.random() * SHAPES[len].length)];
        var ax = Math.floor(Math.random() * cols), ay = Math.floor(Math.random() * rows);
        if (!fits(s, ax, ay)) continue;
        var cx = ax + 1.5, cy = ay + 1;
        var d = pieces.reduce(function (m, q) { return Math.min(m, Math.hypot(q.cx - cx, q.cy - cy)); }, 99);
        if (d > bestD) { bestD = d; best = { s: s, ax: ax, ay: ay, cx: cx, cy: cy }; }
        if (d > Math.max(cols, rows) / 2.2) break;
      }
      if (best) {
        var cells = claim(best.s, best.ax, best.ay);
        pieces.push({ cells: cells, project: p, number: i + 1, cx: best.cx, cy: best.cy });
      }
    });

    // 2) fill the rest, longest pieces first
    var free = [];
    for (var y = 0; y < rows; y++) for (var x = 0; x < cols; x++) if (grid[y][x] === 0) free.push([x, y]);
    shuffle(free).forEach(function (c) {
      if (grid[c[1]][c[0]] !== 0) return;
      var want = [5, 4, 4, 3, 3, 3, 2][Math.floor(Math.random() * 7)];
      for (var len = want; len >= 2; len--) {
        var cells = tryPlaceAt(len, c[0], c[1]);
        if (cells) { pieces.push({ cells: cells }); return; }
      }
      // a lonely square: a tiny round pea
      grid[c[1]][c[0]] = 1;
      pieces.push({ cells: [[c[0], c[1]]] });
    });
    return pieces;
  }

  /* ---------- drawing one worm ---------- */
  function el(tag, attrs, parent) {
    var e = document.createElementNS(SVGNS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }

  // a smooth path through square centres, with rounded bends
  function wormPath(pts) {
    if (pts.length === 1) return "M" + pts[0][0] + " " + pts[0][1] + " l0.01 0";
    // drop points in the middle of straight runs
    var p = [pts[0]];
    for (var i = 1; i < pts.length - 1; i++) {
      var a = pts[i - 1], b = pts[i], c = pts[i + 1];
      if ((b[0] - a[0]) * (c[1] - b[1]) !== (b[1] - a[1]) * (c[0] - b[0])) p.push(b);
    }
    p.push(pts[pts.length - 1]);
    var r = cell * 0.5, d = "M" + p[0][0] + " " + p[0][1];
    for (var j = 1; j < p.length - 1; j++) {
      var prev = p[j - 1], cur = p[j], next = p[j + 1];
      var inx = Math.sign(cur[0] - prev[0]), iny = Math.sign(cur[1] - prev[1]);
      var outx = Math.sign(next[0] - cur[0]), outy = Math.sign(next[1] - cur[1]);
      d += " L" + (cur[0] - inx * r) + " " + (cur[1] - iny * r);
      d += " Q" + cur[0] + " " + cur[1] + " " + (cur[0] + outx * r) + " " + (cur[1] + outy * r);
    }
    var last = p[p.length - 1];
    return d + " L" + last[0] + " " + last[1];
  }

  var BURST = (function () {
    var p = [], n = 12;
    for (var i = 0; i < n * 2; i++) {
      var a = (Math.PI * i) / n - Math.PI / 2, r = i % 2 ? 15 : 22;
      p.push((Math.cos(a) * r).toFixed(1) + " " + (Math.sin(a) * r).toFixed(1));
    }
    return "M" + p.join(" L") + "Z";
  })();

  function makeWorm(piece) {
    var xs = piece.cells.map(function (c) { return c[0]; }), ys = piece.cells.map(function (c) { return c[1]; });
    var minX = Math.min.apply(null, xs), maxX = Math.max.apply(null, xs);
    var minY = Math.min.apply(null, ys), maxY = Math.max.apply(null, ys);
    var w = (maxX - minX + 1) * cell, h = (maxY - minY + 1) * cell;
    var left = ox + minX * cell, top = oy + minY * cell;
    var pts = piece.cells.map(function (c) { return [(c[0] - minX + 0.5) * cell, (c[1] - minY + 0.5) * cell]; });
    var isPea = pts.length === 1;
    var p = piece.project;

    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "blob worm" + (p ? " is-project" : "") + (isPea ? " pea" : "");
    btn.setAttribute("aria-label", p ? "Project " + piece.number + ": " + p.title + ". Open project" : "A shy worm. Poke it");
    if (p) {
      var DEFAULTS = ["#E5533D", "#F2C230", "#4FAE5A", "#4A90E2"];
      btn.style.setProperty("--worm", p.color || DEFAULTS[(piece.number - 1) % DEFAULTS.length]);
    }
    if (isPea) { btn.tabIndex = -1; btn.setAttribute("aria-hidden", "true"); }
    btn.style.left = left + "px"; btn.style.top = top + "px";
    btn.style.width = w + "px"; btn.style.height = h + "px";

    var inner = document.createElement("div");
    inner.className = "blob-inner";
    inner.style.animationDelay = (-Math.random() * 4).toFixed(2) + "s";
    btn.appendChild(inner);

    var svg = el("svg", { viewBox: "0 0 " + w + " " + h, width: w, height: h, "aria-hidden": "true" }, inner);
    el("path", { d: wormPath(pts), class: "body", "stroke-width": (cell * (isPea ? 0.62 : THICK)).toFixed(1) }, svg);

    var eyes = [], pupils = [];
    if (!isPea) {
      // eyes on the head end, side by side, nudged toward the front
      var head = pts[0], neck = pts[1];
      var fx = Math.sign(head[0] - neck[0]), fy = Math.sign(head[1] - neck[1]);
      var er = cell * (0.11 + Math.random() * 0.025);
      var gap = er * 2 + cell * 0.05;
      var cx = head[0] + fx * cell * 0.1, cy = head[1] + fy * cell * 0.08 - (fx ? cell * 0.04 : 0);
      var lookA = Math.random() * Math.PI * 2;
      var eyesG = el("g", { class: "eyes" }, svg);
      [[cx - gap / 2, cy], [cx + gap / 2, cy + (Math.random() - 0.5) * cell * 0.04]].forEach(function (e, k) {
        var r = er * (k ? 1 + (Math.random() - 0.5) * 0.12 : 1);
        el("circle", { cx: e[0], cy: e[1], r: r, class: "eye-white" }, eyesG);
        var pr = r * 0.62, m = r - pr - 0.6;
        pupils.push(el("circle", { cx: e[0] + Math.cos(lookA) * m, cy: e[1] + Math.sin(lookA) * m, r: pr, class: "pupil" }, eyesG));
        eyes.push({ cx: e[0], cy: e[1], r: r });
      });
      var headX = head[0], headY = head[1];
      if (p) {
        // a hidden mouth under the eyes: opens when the apple comes near
        var mx = cx + fx * cell * 0.04, my = cy + cell * 0.2;
        var mouth = el("g", { class: "mouth", transform: "translate(" + mx.toFixed(1) + " " + my.toFixed(1) + ")" }, svg);
        var mg = el("g", { class: "mouth-in" }, mouth);
        el("ellipse", { cx: 0, cy: 0, rx: (cell * 0.13).toFixed(1), ry: (cell * 0.11).toFixed(1), class: "mouth-hole" }, mg);
        el("ellipse", { cx: 0, cy: (cell * 0.055).toFixed(1), rx: (cell * 0.07).toFixed(1), ry: (cell * 0.04).toFixed(1), class: "tongue" }, mg);
      }
    }

    if (p) {
      // orange number star on the tail
      var tail = pts[pts.length - 1];
      var holder = el("g", { transform: "translate(" + tail[0] + " " + (tail[1] - cell * 0.32) + ") scale(" + (cell / 80).toFixed(2) + ")" }, svg);
      var g = el("g", { class: "tag" }, holder);
      el("path", { d: BURST }, g);
      var tx = el("text", { "text-anchor": "middle", "dominant-baseline": "central", y: 1 }, g);
      tx.textContent = String(piece.number).padStart(2, "0");
    }

    stage.appendChild(btn);

    if (p && !isPea) {
      // the project name, written along the worm's body (shown on hover)
      // run the text the way you read: left to right, or top to bottom
      var first = pts[0], last = pts[pts.length - 1];
      var flip = last[0] < first[0] || (last[0] === first[0] && last[1] < first[1]);
      var tp = flip ? pts.slice().reverse() : pts;
      var pid = "wname-" + piece.number + "-" + Math.floor(Math.random() * 1e6);
      el("path", { id: pid, d: wormPath(tp), fill: "none", stroke: "none" }, svg);
      var name = el("text", { class: "name", "dominant-baseline": "central", "text-anchor": "middle" }, svg);
      var fs = cell * 0.36;
      name.setAttribute("font-size", fs.toFixed(1));
      var tpath = el("textPath", { href: "#" + pid, startOffset: flip ? "44%" : "56%" }, name);
      tpath.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#" + pid);
      tpath.textContent = p.title;
      // shrink long names so they fit between the eyes and the tail
      var room = (pts.length - 1) * cell * 0.74;
      var len = name.getComputedTextLength ? name.getComputedTextLength() : 0;
      if (len > room) name.setAttribute("font-size", Math.max(cell * 0.2, fs * room / len).toFixed(1));
    }
    var worm = {
      el: btn, project: p, eyes: eyes, pupils: pupils,
      left: left, top: top, w: w, h: h, x: left + w / 2, y: top + h / 2,
      row: maxY,
      headX: isPea ? 0 : left + headX, headY: isPea ? 0 : top + headY
    };
    bindWorm(worm);
    return worm;
  }

  /* ---------- build, with a Tetris drop ---------- */
  function build(animate) {
    hideName(shown);
    stopMunch();
    stage.innerHTML = "";
    worms = layout().map(makeWorm);
    if (!animate || reduceMotion || !stage.animate) return;
    worms.forEach(function (w) {
      var fall = -(w.top + w.h + 40);
      var delay = (rows - 1 - w.row) * 110 + Math.random() * 90;   // bottom rows land first
      w.el.animate([
        { transform: "translateY(" + fall + "px)", easing: "cubic-bezier(.55,0,.9,.4)" },
        { transform: "translateY(0) scale(1.08, .9)", offset: 0.72, easing: "ease-out" },
        { transform: "translateY(-6px) scale(.97, 1.03)", offset: 0.86, easing: "ease-in-out" },
        { transform: "none" }
      ], { duration: 650, delay: delay, fill: "backwards" });
    });
  }

  /* ---------- eyes follow the cursor ---------- */
  function lookLoop() {
    // coloured worms get hungry when the apple comes close to their head
    worms.forEach(function (w) {
      if (!w.project) return;
      var near = !!mouse && Math.hypot(mouse.x - w.headX, mouse.y - w.headY) < cell * 2.6;
      w.el.classList.toggle("hungry", near || w.el.classList.contains("munch"));
    });
    if (mouse) {
      worms.forEach(function (w) {
        w.eyes.forEach(function (e, k) {
          var tx = mouse.x - (w.left + e.cx), ty = mouse.y - (w.top + e.cy);
          var len = Math.hypot(tx, ty) || 1;
          var m = (e.r * 0.38 - 0.6) * Math.min(1, len / 40);
          w.pupils[k].setAttribute("cx", (e.cx + (tx / len) * m).toFixed(1));
          w.pupils[k].setAttribute("cy", (e.cy + (ty / len) * m).toFixed(1));
        });
      });
    }
    requestAnimationFrame(lookLoop);
  }
  hero.addEventListener("pointermove", function (ev) {
    if (ev.pointerType !== "mouse") return;
    var r = hero.getBoundingClientRect();
    mouse = { x: ev.clientX - r.left, y: ev.clientY - r.top };
  });
  hero.addEventListener("pointerleave", function () { mouse = null; });

  /* ---------- munching the apple cursor ----------
     On a coloured worm the apple gets eaten: 1 bite, 2 bites, core. */
  var munchTimers = [];
  function setApple(stage) {
    document.body.classList.remove("apple-1", "apple-2", "apple-3");
    if (stage) document.body.classList.add("apple-" + stage);
  }
  function startMunch(w) {
    stopMunch();
    w.el.classList.add("munch");
    setApple(1);
    munchTimers.push(setTimeout(function () { setApple(2); }, 700));
    munchTimers.push(setTimeout(function () {
      setApple(3);
      w.el.classList.add("full");
      say(w, ["yum!", "nom nom nom", "crunchy!", "more apples pls"][Math.floor(Math.random() * 4)], w.headX, w.headY - cell * 0.55);
    }, 1500));
  }
  function stopMunch() {
    munchTimers.forEach(clearTimeout);
    munchTimers = [];
    worms.forEach(function (w) { w.el.classList.remove("munch", "full"); });
    setApple(0); // the apple grows back
  }

  /* ---------- blinking and the odd wriggle ---------- */
  if (!reduceMotion) {
    setInterval(function () {
      worms.forEach(function (w) {
        if (w.eyes.length && Math.random() < 0.06) {
          w.el.classList.add("blink");
          setTimeout(function () { w.el.classList.remove("blink"); }, 140);
        }
      });
    }, 500);
    setInterval(function () {
      var w = worms[Math.floor(Math.random() * worms.length)];
      if (!w || w === shown) return;
      w.el.classList.add("hover");
      setTimeout(function () { if (!w.el.matches(":hover")) w.el.classList.remove("hover"); }, 900);
    }, 1800);
  }

  /* ---------- interactions ---------- */
  function bindWorm(w) {
    w.el.addEventListener("pointerenter", function (ev) {
      if (ev.pointerType !== "mouse") return;
      w.el.classList.add("hover");
      if (w.project) { showName(w); if (!reduceMotion) startMunch(w); }
    });
    w.el.addEventListener("pointerleave", function (ev) {
      if (ev.pointerType !== "mouse") return;
      w.el.classList.remove("hover");
      if (w.project) { stopMunch(); hideName(w); }
    });
    w.el.addEventListener("focus", function () { if (w.project) showName(w); });
    w.el.addEventListener("blur", function () { if (w.project) hideName(w); });
    var lastPointer = "mouse";
    w.el.addEventListener("pointerdown", function (ev) { lastPointer = ev.pointerType; });
    w.el.addEventListener("click", function () {
      if (!w.project) { squish(w); return; }
      // mouse and keyboard: go straight to the project
      // phones: first tap shows the name, second tap opens it
      if (lastPointer === "touch" && shown !== w) { showName(w); return; }
      goTo(w);
    });
  }

  function squish(w) {
    w.el.classList.remove("squish");
    void w.el.offsetWidth;
    w.el.classList.add("squish");
    setTimeout(function () { w.el.classList.remove("squish"); }, 600);
    say(w, GIGGLES[Math.floor(Math.random() * GIGGLES.length)], w.x, w.top - 10);
  }

  // a little speech bubble that floats up and fades
  function say(w, text, x, y) {
    var g = document.createElement("div");
    g.className = "giggle";
    g.setAttribute("aria-hidden", "true");
    g.textContent = text;
    g.style.left = x + "px";
    g.style.top = Math.max(TOP, y) + "px";
    hero.appendChild(g);
    setTimeout(function () { g.remove(); }, 1500);
  }

  /* ---------- project name written along the worm ---------- */
  var shown = null;
  function showName(w) {
    if (shown && shown !== w) shown.el.classList.remove("named");
    shown = w;
    w.el.classList.add("named");
  }
  function hideName(w) {
    if (!w || !shown || shown !== w) return;
    w.el.classList.remove("named");
    shown = null;
  }
  function goTo(w) { location.href = projectLink(w.project); }

  // tapping somewhere else on a phone hides the name again
  document.addEventListener("pointerdown", function (ev) {
    if (!shown) return;
    if (ev.target.closest && ev.target.closest(".blob.is-project") === shown.el) return;
    hideName(shown);
  });

  /* ---------- start ---------- */
  var lastW = 0, lastH = 0, resizeTimer;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      // phones change height when the address bar hides; only rebuild on real changes
      if (Math.abs(hero.clientWidth - lastW) < 2 && Math.abs(hero.clientHeight - lastH) < 80) return;
      lastW = hero.clientWidth; lastH = hero.clientHeight;
      build(false);
    }, 200);
  });

  function start() {
    lastW = hero.clientWidth; lastH = hero.clientHeight;
    build(true);
    requestAnimationFrame(lookLoop);
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(start); else start();
})();
