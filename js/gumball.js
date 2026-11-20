/* =========================================================
   Home page gumball machine.
   Turn the crank (click the handle, the machine, or press the
   button): the balls shake, one drops down the chute, rolls out
   and opens into a project: its photo, number and name. The big
   label on the left changes to match. Click the open gumball
   (or "View project") to go to the project. Turn again for
   another one; it never gives the same project twice in a row.
   ========================================================= */
(function () {
  var wrap = document.getElementById("gum");
  if (!wrap || !window.PROJECTS) return;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var NS = "http://www.w3.org/2000/svg";
  var VW = 500, VH = 760;                      // machine drawing size
  var projects = PROJECTS.slice(0, 4);
  var BALL = ["#FF3D8B", "#0F1B3D", "#FFC2DA", "#A9BDF5", "#FFD45E", "#FFFFFF"];
  var PROJECT_BALL = ["#FF3D8B", "#FFC2DA", "#FFD45E", "#A9BDF5"];   // the colour each project's gumball comes out in

  function el(name, attrs, parent) {
    var e = document.createElementNS(NS, name);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }

  /* ---------- draw the machine ---------- */
  var box = document.createElement("div");
  box.className = "gum-machine";
  wrap.appendChild(box);
  var svg = el("svg", { viewBox: "0 0 " + VW + " " + VH, class: "gum-svg", "aria-hidden": "true" }, box);
  var defs = el("defs", {}, svg);
  var clip = el("clipPath", { id: "gumGlass" }, defs);
  el("circle", { cx: 250, cy: 275, r: 196 }, clip);

  // cap on top
  el("rect", { x: 205, y: 46, width: 90, height: 34, rx: 12, class: "g-pink" }, svg);
  el("circle", { cx: 250, cy: 40, r: 14, class: "g-navy" }, svg);
  // glass globe with the balls inside
  el("circle", { cx: 250, cy: 275, r: 200, class: "g-glass" }, svg);
  var balls = el("g", { class: "gum-balls", "clip-path": "url(#gumGlass)" }, svg);
  var inside = [];
  (function fill() {
    var r = 27, rows = 0;
    for (var y = 445; y > 165; y -= r * 1.72) {
      var off = (rows++ % 2) * r;
      for (var x = 60 + off; x < 450; x += r * 2.02) {
        var dx = x - 250, dy = y - 275;
        if (Math.hypot(dx, dy) > 196 - r * 0.6) continue;
        var jx = x + (Math.sin(x * 7.1 + y) * 4), jy = y + (Math.cos(x * 3.3 - y) * 3);
        var g = el("g", { class: "gum-ball" }, balls);
        var c = BALL[(Math.abs(Math.round(x * 13 + y * 7)) % BALL.length)];
        el("circle", { cx: jx, cy: jy, r: r, fill: c, class: c === "#FFFFFF" ? "g-white" : "" }, g);
        el("circle", { cx: jx - r * 0.35, cy: jy - r * 0.38, r: r * 0.22, class: "g-shine" }, g);
        g.style.setProperty("--d", (Math.round((x + y) % 7) * 30) + "ms");
        inside.push(g);
      }
    }
  })();
  // shine on the glass
  el("path", { d: "M118 170 A160 160 0 0 1 190 102", class: "g-glint" }, svg);
  el("path", { d: "M104 214 A160 160 0 0 1 110 196", class: "g-glint" }, svg);
  // collar and body
  el("rect", { x: 140, y: 458, width: 220, height: 34, rx: 14, class: "g-navy" }, svg);
  el("path", { d: "M160 492 H340 L384 712 H116 Z", class: "g-pink" }, svg);
  el("rect", { x: 100, y: 708, width: 300, height: 26, rx: 13, class: "g-navy" }, svg);
  // chute and its little door
  el("rect", { x: 205, y: 628, width: 90, height: 62, rx: 18, class: "g-navy" }, svg);
  el("path", { d: "M214 690 h72 v8 a8 8 0 0 1 -8 8 h-56 a8 8 0 0 1 -8 -8 z", class: "g-lip" }, svg);
  // the crank
  el("circle", { cx: 250, cy: 560, r: 44, class: "g-plate" }, svg);
  var crank = el("g", { class: "gum-crank" }, svg);
  el("rect", { x: 242, y: 520, width: 16, height: 80, rx: 8, class: "g-navy" }, crank);
  el("circle", { cx: 250, cy: 520, r: 13, class: "g-pink-knob" }, crank);
  el("circle", { cx: 250, cy: 560, r: 9, class: "g-white-dot" }, svg);

  // the button that turns the crank (sits over the handle) + a little hint
  var btn = document.createElement("button");
  btn.type = "button"; btn.className = "gum-crank-btn";
  btn.setAttribute("aria-label", "Turn the crank to get a project");
  box.appendChild(btn);
  var hint = document.createElement("span");
  hint.className = "gum-hint"; hint.setAttribute("aria-hidden", "true");
  hint.innerHTML = "turn me <i>↺</i>";
  box.appendChild(hint);

  // the gumball that comes out
  var out = document.createElement("a");
  out.className = "gum-out";
  out.innerHTML = '<span class="gum-skin"></span><img alt=""><span class="gum-tag"><b></b><em></em></span>';
  out.setAttribute("aria-live", "polite");
  box.appendChild(out);
  var outImg = out.querySelector("img"), outSkin = out.querySelector(".gum-skin");

  /* ---------- the big label on the left ---------- */
  var label = { num: document.getElementById("tNum"), title: document.getElementById("tTitle"), tag: document.getElementById("tTag"), go: document.getElementById("tGo") };
  function setLabel(num, title, tag, href, go) {
    if (label.num.textContent.replace("_", "") !== num) {
      label.num.innerHTML = '<span class="u">_</span>' + num;
      label.num.classList.remove("swap"); void label.num.offsetWidth; label.num.classList.add("swap");
    }
    label.title.textContent = title; label.tag.textContent = tag; label.go.href = href; label.go.textContent = go;
  }

  /* ---------- turning the crank ---------- */
  function pct(x, y, d) { return { left: ((x - d / 2) / VW * 100) + "%", top: ((y - d / 2) / VH * 100) + "%", width: (d / VW * 100) + "%" }; }
  var last = -1, busy = false, turns = 0;
  function turn() {
    if (busy) return;
    busy = true; turns++;
    wrap.classList.add("turned");
    var i; do { i = Math.floor(Math.random() * projects.length); } while (i === last && projects.length > 1);
    last = i;
    var p = projects[i];

    // put the old gumball away
    out.classList.remove("open");
    if (out.getAnimations) out.getAnimations().forEach(function (a) { a.cancel(); });
    out.style.opacity = "0";

    // crank spins, balls jiggle, one ball leaves the glass
    crank.classList.remove("spin"); void crank.getBoundingClientRect(); crank.classList.add("spin");
    balls.classList.remove("shake"); void balls.getBoundingClientRect(); balls.classList.add("shake");
    var gone = inside.filter(function (b) { return !b.classList.contains("gone"); });
    if (gone.length < 6) inside.forEach(function (b) { b.classList.remove("gone"); });   // refill when nearly empty
    gone.sort(function (a, b) { return b.getBBox().y - a.getBBox().y; });
    var take = gone[Math.floor(Math.random() * Math.min(5, gone.length))];
    setTimeout(function () { if (take) take.classList.add("gone"); }, reduce ? 0 : 450);

    // fill in the gumball for this project
    out.href = projectLink(p);
    out.setAttribute("aria-label", "Project 0" + (i + 1) + ": " + p.title + ". Open project");
    outImg.src = projectImg(p, p.leaf || p.thumb || p.hero);
    outImg.style.objectPosition = p.leafFocus || p.thumbFocus || "50% 50%";
    outSkin.style.background = PROJECT_BALL[i];
    out.querySelector(".gum-tag b").textContent = "0" + (i + 1);
    out.querySelector(".gum-tag em").textContent = p.title;

    var small = 58, big = window.innerWidth < 900 ? 300 : 280;
    var endX = window.innerWidth < 900 ? 250 : -40, endY = window.innerWidth < 900 ? 420 : 470;
    var frames = [
      Object.assign({ opacity: 0, offset: 0 }, pct(250, 630, small)),
      Object.assign({ opacity: 1, offset: 0.12 }, pct(250, 640, small)),
      Object.assign({ opacity: 1, offset: 0.30, easing: "ease-in" }, pct(250, 676, small)),     // drop into the chute
      Object.assign({ opacity: 1, offset: 0.38, easing: "ease-out" }, pct(250, 662, small)),    // little bounce
      Object.assign({ opacity: 1, offset: 0.46, easing: "ease-in" }, pct(250, 678, small)),
      Object.assign({ opacity: 1, offset: 0.66, easing: "cubic-bezier(.3,.7,.4,1)" }, pct(150, 735, small)),   // roll out
      Object.assign({ opacity: 1, offset: 1 }, pct(endX, endY, big))                           // pop open
    ];
    var finish = function () {
      Object.assign(out.style, pct(endX, endY, big)); out.style.opacity = "1";
      out.classList.add("open");
      setLabel("0" + (i + 1), p.title, p.tagline, projectLink(p), "View project →");
      busy = false;
    };
    if (reduce || !out.animate) { finish(); return; }
    setTimeout(function () {
      var a = out.animate(frames, { duration: 1500, fill: "forwards" });
      a.onfinish = finish;
    }, 520);
  }
  btn.addEventListener("click", turn);
  svg.addEventListener("click", turn);
})();
