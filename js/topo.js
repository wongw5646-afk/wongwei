/* =========================================================
   The home page map: topographic lines, drawn like a
   fine-line tattoo, filling the whole page behind the text.
   Each of the 4 projects is its own hill; the top rings of
   every project hill are always hot pink so they stand out.
   - Hover (or tap) a hill: all its rings turn pink, the project
     photo appears at the summit, and the big number and name
     on the left change. Click (or tap again) to open it.
   - The land is a few smooth hills plus a little seeded noise,
     so the lines look hand-drawn but are the same every visit.
     Edit PEAKS below to move the hills (x and y are 0..1 of the
     page width and height; sizes are parts of the page height).
   - On phones the map is a block under the text instead.
   ========================================================= */
(function () {
  var svg = document.getElementById("topo");
  var stage = document.querySelector(".t-stage");
  if (!svg || !window.PROJECTS) return;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var touch = window.matchMedia("(hover: none)").matches;
  var NS = "http://www.w3.org/2000/svg", XL = "http://www.w3.org/1999/xlink";

  // project hills (desktop, full page): x, y as 0..1 of the page; h height; sx, sy spread (x page height); a tilt
  var PEAKS_WIDE = [
    { x: .19, y: .47, h: 1.00, sx: .17, sy: .13, a: 0.4,  lx: 1,  ly: -1 },   // 01 left, between the name and the big number
    { x: .45, y: .25, h: 0.93, sx: .17, sy: .14, a: -0.3, lx: 1,  ly: -1 },   // 02 top middle
    { x: .84, y: .36, h: 0.97, sx: .17, sy: .20, a: 0.2,  lx: -1, ly: 1 },    // 03 right
    { x: .57, y: .74, h: 0.90, sx: .21, sy: .14, a: -0.4, lx: 1,  ly: 1 }     // 04 bottom middle
  ];
  // small hills between them on the full page
  var HILLS_WIDE = [
    { x: .31, y: .78, h: .36, sx: .10, sy: .08 }, { x: .66, y: .48, h: .38, sx: .09, sy: .08 },
    { x: .97, y: .80, h: .36, sx: .10, sy: .10 }, { x: .07, y: .12, h: .30, sx: .09, sy: .08 },
    { x: .27, y: .10, h: .30, sx: .08, sy: .07 }, { x: .64, y: .08, h: .28, sx: .09, sy: .06 },
    { x: .80, y: .94, h: .30, sx: .10, sy: .06 }, { x: .05, y: .88, h: .30, sx: .09, sy: .08 }
  ];
  // phones and narrow windows: a squarer block under the text
  var PEAKS_BLOCK = [
    { x: .25, y: .36, h: 1.00, sx: .19, sy: .15, a: 0.5,  lx: -1, ly: -1 },
    { x: .61, y: .26, h: 0.93, sx: .15, sy: .12, a: -0.3, lx: 1,  ly: -1 },
    { x: .79, y: .62, h: 0.97, sx: .16, sy: .19, a: 0.2,  lx: -1, ly: 1 },
    { x: .43, y: .74, h: 0.90, sx: .20, sy: .13, a: -0.4, lx: -1, ly: 1 }
  ];
  // small hills with no project, so the land feels real (same units)
  var HILLS = [
    { x: .52, y: .52, h: .40, sx: .11, sy: .09 }, { x: .95, y: .20, h: .36, sx: .09, sy: .08 },
    { x: .12, y: .78, h: .34, sx: .12, sy: .10 }, { x: .18, y: .22, h: .30, sx: .10, sy: .10 },
    { x: .72, y: .95, h: .30, sx: .12, sy: .07 }, { x: .30, y: .58, h: .28, sx: .09, sy: .08 }
  ];
  var LEVELS = 22, PINK_TOP = 5;   // number of contour heights; how many top rings of each project hill stay pink

  /* ---------- seeded value noise ---------- */
  var seed = 7;
  function rnd() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
  var NG = 40, noiseGrid = [];
  for (var i = 0; i < (NG + 1) * (NG + 1); i++) noiseGrid.push(rnd());
  function smooth(t) { return t * t * (3 - 2 * t); }
  function noise(x, y) {
    x = Math.max(0, Math.min(NG - .001, x)); y = Math.max(0, Math.min(NG - .001, y));
    var xi = Math.floor(x), yi = Math.floor(y), xf = smooth(x - xi), yf = smooth(y - yi);
    var a = noiseGrid[yi * (NG + 1) + xi], b = noiseGrid[yi * (NG + 1) + xi + 1];
    var c = noiseGrid[(yi + 1) * (NG + 1) + xi], d = noiseGrid[(yi + 1) * (NG + 1) + xi + 1];
    return a + (b - a) * xf + (c - a) * yf + (a - b - c + d) * xf * yf;
  }

  function el(name, attrs, parent) {
    var e = document.createElementNS(NS, name);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }

  /* ---------- hover / tap, and the big label on the left ---------- */
  var label = { num: document.getElementById("tNum"), title: document.getElementById("tTitle"), tag: document.getElementById("tTag"), go: document.getElementById("tGo") };
  var DEFAULT = { num: label.num.textContent.replace("_", ""), title: label.title.textContent, tag: label.tag.textContent, href: label.go.getAttribute("href"), go: label.go.textContent };
  if (touch) { DEFAULT.tag = DEFAULT.tag.replace("Hover", "Tap"); label.tag.textContent = DEFAULT.tag; }
  var lastPointer = "", current = null;
  document.addEventListener("pointerdown", function (e) { lastPointer = e.pointerType; }, true);
  function setLabel(num, title, tag, href, go) {
    if (label.num.textContent.replace("_", "") !== num) {
      label.num.innerHTML = '<span class="u">_</span>' + num;
      label.num.classList.remove("swap"); void label.num.offsetWidth; label.num.classList.add("swap");
    }
    label.title.textContent = title; label.tag.textContent = tag; label.go.href = href; label.go.textContent = go;
  }
  function show(a) {
    if (current && current !== a) current.classList.remove("on");
    current = a; a.classList.add("on"); stage.classList.add("focus"); svg.classList.add("focus");
    var p = a._p;
    setLabel("0" + a._n, p.title, p.tagline, projectLink(p), (lastPointer && lastPointer !== "mouse") ? "Tap again to open →" : "View project →");
  }
  function hide() {
    if (current) current.classList.remove("on");
    current = null; stage.classList.remove("focus"); svg.classList.remove("focus");
    setLabel(DEFAULT.num, DEFAULT.title, DEFAULT.tag, DEFAULT.href, DEFAULT.go);
  }
  document.addEventListener("click", function (e) {
    if (lastPointer !== "mouse" && current && !e.target.closest(".topo-peak") && !e.target.closest(".t-go")) hide();
  });

  /* ---------- build the map for the current size ---------- */
  var built = false;
  function build() {
    var wide = window.matchMedia("(min-width: 900px)").matches;
    var box = svg.parentNode.getBoundingClientRect();
    var H = 800, W = wide ? Math.round(H * Math.max(1.1, Math.min(2.6, box.width / Math.max(1, box.height)))) : 1000;
    var STEP = 5, S = H;                         // S: one "page height" in drawing units
    var PEAKS = (wide ? PEAKS_WIDE : PEAKS_BLOCK).map(function (p) {
      return { x: p.x * W, y: p.y * H, h: p.h, sx: p.sx * S, sy: p.sy * S, a: p.a, lx: p.lx, ly: p.ly };
    });
    var hills = (wide ? HILLS_WIDE : HILLS).map(function (p) { return { x: p.x * W, y: p.y * H, h: p.h, sx: p.sx * S, sy: p.sy * S, a: 0 }; });

    function bump(p, x, y) {
      var dx = x - p.x, dy = y - p.y, ca = Math.cos(p.a), sa = Math.sin(p.a);
      var u = (dx * ca + dy * sa) / p.sx, v = (-dx * sa + dy * ca) / p.sy;
      return p.h * Math.exp(-(u * u + v * v) * 0.9);
    }
    function height(x, y) {
      var wx = x + (noise(x / S * 5, y / S * 5) - 0.5) * 70;
      var wy = y + (noise(x / S * 5 + 9, y / S * 5 + 4) - 0.5) * 70;
      var top = 0, sum = 0, k, b;
      for (k = 0; k < PEAKS.length; k++) { b = bump(PEAKS[k], wx, wy); top = Math.max(top, b); sum += b; }
      var z = top + (sum - top) * 0.2;
      for (k = 0; k < hills.length; k++) z += bump(hills[k], wx, wy) * (1 - top);
      z += noise(x / S * 9 + 3, y / S * 9 + 1) * 0.16;   // gentle rolling ground everywhere
      return z;
    }

    var NX = Math.round(W / STEP) + 1, NY = Math.round(H / STEP) + 1, F = new Float32Array(NX * NY), max = 0, min = 9;
    for (var gy = 0; gy < NY; gy++) for (var gx = 0; gx < NX; gx++) {
      var v = height(gx * STEP, gy * STEP); F[gy * NX + gx] = v; if (v > max) max = v; if (v < min) min = v;
    }

    function contours(level) {
      var segs = {}, pts = {};
      function pt(ax, ay, bx, by) {
        var k = ax + "," + ay + "|" + bx + "," + by;
        if (!pts[k]) {
          var va = F[ay * NX + ax], vb = F[by * NX + bx], t = (level - va) / (vb - va);
          pts[k] = [(ax + (bx - ax) * t) * STEP, (ay + (by - ay) * t) * STEP];
        }
        return k;
      }
      function link(a, b) { (segs[a] = segs[a] || []).push(b); (segs[b] = segs[b] || []).push(a); }
      for (var y = 0; y < NY - 1; y++) for (var x = 0; x < NX - 1; x++) {
        var tl = F[y * NX + x] > level, tr = F[y * NX + x + 1] > level, br = F[(y + 1) * NX + x + 1] > level, bl = F[(y + 1) * NX + x] > level;
        var c = (tl ? 8 : 0) | (tr ? 4 : 0) | (br ? 2 : 0) | (bl ? 1 : 0);
        if (c === 0 || c === 15) continue;
        var T = pt.bind(null, x, y, x + 1, y), R = pt.bind(null, x + 1, y, x + 1, y + 1),
            B = pt.bind(null, x, y + 1, x + 1, y + 1), L = pt.bind(null, x, y, x, y + 1);
        switch (c) {
          case 1: case 14: link(L(), B()); break;
          case 2: case 13: link(B(), R()); break;
          case 3: case 12: link(L(), R()); break;
          case 4: case 11: link(T(), R()); break;
          case 6: case 9: link(T(), B()); break;
          case 7: case 8: link(L(), T()); break;
          case 5: link(L(), T()); link(B(), R()); break;
          case 10: link(T(), R()); link(L(), B()); break;
        }
      }
      var seen = {}, out = [];
      function walk(start) {
        var line = [start], prev = null, cur = start; seen[start] = 1;
        for (;;) {
          var nx = (segs[cur] || []).filter(function (n) { return n !== prev && !seen[n]; })[0];
          if (!nx) break;
          seen[nx] = 1; line.push(nx); prev = cur; cur = nx;
        }
        var closed = (segs[cur] || []).indexOf(start) >= 0 && line.length > 2;
        if (line.length > 4) out.push({ pts: line.map(function (k) { return pts[k]; }), closed: closed });
      }
      var keys = Object.keys(segs);
      keys.forEach(function (k) { if (!seen[k] && segs[k].length === 1) walk(k); });   // lines that run off the page
      keys.forEach(function (k) { if (!seen[k]) walk(k); });                            // closed rings
      return out;
    }
    function chaikin(p, closed) {
      for (var it = 0; it < 2; it++) {
        var q = closed ? [] : [p[0]], n = closed ? p.length : p.length - 1;
        for (var i = 0; i < n; i++) {
          var a = p[i], b = p[(i + 1) % p.length];
          q.push([a[0] * .75 + b[0] * .25, a[1] * .75 + b[1] * .25], [a[0] * .25 + b[0] * .75, a[1] * .25 + b[1] * .75]);
        }
        if (!closed) q.push(p[p.length - 1]);
        p = q;
      }
      return p;
    }
    function inside(poly, x, y) {
      var c = false;
      for (var i = 0, j = poly.length - 1; i < poly.length; j = i++) {
        var a = poly[i], b = poly[j];
        if ((a[1] > y) !== (b[1] > y) && x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]) c = !c;
      }
      return c;
    }
    function area(poly) { var s = 0; for (var i = 0, j = poly.length - 1; i < poly.length; j = i++) s += (poly[j][0] + poly[i][0]) * (poly[j][1] - poly[i][1]); return Math.abs(s / 2); }
    function d(poly, closed) { return "M" + poly.map(function (p) { return p[0].toFixed(1) + " " + p[1].toFixed(1); }).join("L") + (closed ? "Z" : ""); }

    /* ---------- draw ---------- */
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    svg.setAttribute("preserveAspectRatio", wide ? "xMidYMid slice" : "xMidYMid meet");
    var projects = PROJECTS.slice(0, 4);
    var defs = el("defs", {}, svg);
    var shared = el("g", { class: "topo-lines" }, svg);
    var groups = projects.map(function (p, i) {
      var a = el("a", { class: "topo-peak", href: projectLink(p), "data-i": i }, svg);
      a.setAttribute("aria-label", "Project 0" + (i + 1) + ": " + p.title + ". " + p.tagline);
      a._lines = el("g", { class: "topo-lines" }, a); a._p = p; a._n = i + 1; a._best = 0; a._rings = [];
      return a;
    });
    var all = [];
    for (var lv = 1; lv <= LEVELS; lv++) {
      var level = min + (max - min) * lv / (LEVELS + 1);
      contours(level).forEach(function (c) {
        var poly = chaikin(c.pts, c.closed), owners = [];
        if (c.closed) PEAKS.forEach(function (pk, i) { if (inside(poly, pk.x, pk.y)) owners.push(i); });
        var own = owners.length === 1 ? groups[owners[0]] : null;
        var path = el("path", { d: d(poly, c.closed), class: lv % 4 === 0 ? "idx" : "" }, own ? own._lines : shared);
        path.style.setProperty("--lv", lv);
        all.push(path);
        if (own) {
          own._rings.push({ lv: lv, path: path });
          var A = area(poly);   // the biggest ring that belongs to one hill becomes its hover area
          if (A > own._best) { own._best = A; own._hitD = d(poly, true); own._r = Math.sqrt(A / Math.PI); }
        }
      });
    }

    groups.forEach(function (a, i) {
      var pk = PEAKS[i], p = a._p;
      // the top rings of each project hill stay hot pink
      a._rings.sort(function (x, y) { return y.lv - x.lv; }).slice(0, PINK_TOP).forEach(function (r) { r.path.classList.add("top"); });
      var hit = el("path", { d: a._hitD || "", class: "topo-hit" });
      a.insertBefore(hit, a.firstChild);
      var r = wide ? 150 : 125;   // the photo that pops up on hover (radius, in drawing units)
      var lr = 62;                // how far the label sits from the summit
      var clip = el("clipPath", { id: "topoClip" + i }, defs);
      el("circle", { cx: pk.x, cy: pk.y, r: r }, clip);
      var ph = el("g", { class: "topo-photo" }, a);
      el("circle", { cx: pk.x, cy: pk.y, r: r + 7, class: "topo-photo-bg" }, ph);
      var src = projectImg(p, p.leaf || p.thumb || p.hero);
      var im = el("image", { x: pk.x - r, y: pk.y - r, width: r * 2, height: r * 2, "clip-path": "url(#topoClip" + i + ")", preserveAspectRatio: "xMidYMid slice", href: src }, ph);
      im.setAttributeNS(XL, "href", src);
      el("circle", { cx: pk.x, cy: pk.y, r: r + 2, class: "topo-photo-ring" }, ph);
      var mark = el("g", { class: "topo-mark" }, a);
      el("path", { d: "M" + pk.x + " " + (pk.y - 9) + "L" + (pk.x + 8) + " " + (pk.y + 5) + "L" + (pk.x - 8) + " " + (pk.y + 5) + "Z" }, mark);
      el("circle", { cx: pk.x, cy: pk.y + 1, r: 1.8, class: "dot" }, mark);
      var lx = pk.x + pk.lx * (lr + 40), ly = pk.y + pk.ly * (lr * 0.75 + 34);
      var lab = el("g", { class: "topo-label" }, a);
      el("path", { d: "M" + (pk.x + pk.lx * 12) + " " + (pk.y + pk.ly * 10) + "L" + lx + " " + ly + "h" + (pk.lx * 26), class: "lead" }, lab);
      var tx = lx + pk.lx * 34, anchor = pk.lx > 0 ? "start" : "end";
      var t1 = el("text", { x: tx, y: ly - 4, "text-anchor": anchor, class: "num" }, lab); t1.textContent = "0" + (i + 1);
      var t2 = el("text", { x: tx, y: ly + 20, "text-anchor": anchor, class: "name" }, lab); t2.textContent = p.title.toUpperCase();

      a.addEventListener("pointerenter", function (e) { if (e.pointerType === "mouse") show(a); });
      a.addEventListener("pointerleave", function (e) { if (e.pointerType === "mouse") hide(); });
      a.addEventListener("focus", function () { show(a); });
      a.addEventListener("blur", hide);
      a.addEventListener("click", function (e) {
        if (lastPointer !== "mouse" && lastPointer !== "" && !a.classList.contains("on")) { e.preventDefault(); show(a); }
      });
    });

    // compass, like a map (bottom right, clear of the text)
    var deco = el("g", { class: "topo-deco", "aria-hidden": "true" }, svg);
    var cx = W - 60, cy = H - 70;
    el("path", { d: "M" + cx + " " + (cy - 14) + " L" + (cx + 8) + " " + (cy + 12) + " L" + cx + " " + (cy + 6) + " L" + (cx - 8) + " " + (cy + 12) + " Z", class: "fill" }, deco);
    el("circle", { cx: cx, cy: cy, r: 22 }, deco);
    var n = el("text", { x: cx, y: cy - 30, "text-anchor": "middle" }, deco); n.textContent = "N";

    // draw the lines in the first time, like a needle going around
    if (!built && !reduce) {
      all.forEach(function (p) {
        var L = p.getTotalLength ? p.getTotalLength() : 0;
        p.style.strokeDasharray = L; p.style.strokeDashoffset = L;
      });
      svg.getBoundingClientRect();
      requestAnimationFrame(function () {
        svg.classList.add("drawn");
        requestAnimationFrame(function () { all.forEach(function (p) { p.style.strokeDashoffset = "0"; }); });
      });
      setTimeout(function () { all.forEach(function (p) { p.style.strokeDasharray = "none"; }); }, 2400 + LEVELS * 55 + 600);
    } else svg.classList.add("drawn", "still");
    built = true;
    current = null;
  }

  build();
  // rebuild when the window shape changes a lot (desktop <-> phone, or a much wider/taller window)
  var lastShape = "", timer = 0;
  function shape() { var b = svg.parentNode.getBoundingClientRect(); return (window.innerWidth >= 900 ? "w" : "b") + Math.round(b.width / Math.max(1, b.height) * 5); }
  lastShape = shape();
  window.addEventListener("resize", function () {
    clearTimeout(timer);
    timer = setTimeout(function () { var s = shape(); if (s !== lastShape) { lastShape = s; build(); } }, 250);
  });
})();
