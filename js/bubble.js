/* =========================================================
   Home landing: a bubbly PORTFOLIO cloud, drawn in code
   (inspired by Wei Yi's own sketch, not a copy of it).
   - A lumpy cloud made of overlapping bubbles, thick outline,
     little dark bumps, and a pink "sticker" shadow.
   - PORTFOLIO in a melty bubble font with drips that slowly grow.
   - Two droplet buddies on top whose eyes follow the mouse
     and blink now and then.
   - Little rings bobbing around the cloud.
   ========================================================= */
(function () {
  var host = document.getElementById("bbArt");
  if (!host) return;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var NS = "http://www.w3.org/2000/svg";
  function el(name, attrs, parent) {
    var e = document.createElementNS(NS, name);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }

  var INK = "#0A1430", FILL = "#FFF4F8", PINK = "#FF3D8B";
  var svg = el("svg", { viewBox: "0 0 1000 760", class: "bb-svg", role: "img", "aria-label": "Portfolio" }, host);

  // the cloud: overlapping bubbles (x, y, radius)
  var PUFFS = [[300, 430, 165], [455, 330, 190], [650, 300, 165], [790, 420, 150], [585, 500, 185], [380, 520, 150], [210, 440, 115], [860, 330, 100], [690, 560, 120]];
  // little dark bumps poking out from behind the cloud
  var BUMPS = [[118, 395, 42], [905, 245, 40], [300, 668, 44], [762, 650, 40], [560, 128, 30]];

  var shadow = el("g", { class: "bb-shadow", transform: "translate(0 26)" }, svg);
  PUFFS.forEach(function (c) { el("circle", { cx: c[0], cy: c[1], r: c[2] + 14, fill: PINK }, shadow); });

  var back = el("g", {}, svg);
  BUMPS.forEach(function (c) { el("circle", { cx: c[0], cy: c[1], r: c[2], fill: INK }, back); });
  PUFFS.forEach(function (c) { el("circle", { cx: c[0], cy: c[1], r: c[2] + 14, fill: INK }, back); });   // outline
  var front = el("g", {}, svg);
  PUFFS.forEach(function (c) { el("circle", { cx: c[0], cy: c[1], r: c[2], fill: FILL }, front); });     // fill
  // a soft shine on the cloud
  el("path", { d: "M300 330 Q330 270 400 250", fill: "none", stroke: "#FFFFFF", "stroke-width": 16, "stroke-linecap": "round", opacity: .9 }, front);
  el("circle", { cx: 425, cy: 238, r: 8, fill: "#FFFFFF" }, front);

  // drips under the word: rounded drops that slowly stretch
  var drips = el("g", { class: "bb-drips" }, svg);
  [[262, 540, 46], [470, 540, 70], [652, 540, 54], [786, 540, 38]].forEach(function (d, i) {
    var g = el("g", { class: "bb-drip", style: "--dl:" + (i * -1.3) + "s;transform-origin:" + d[0] + "px " + d[1] + "px" }, drips);
    el("rect", { x: d[0] - 11, y: d[1] - 10, width: 22, height: d[2], rx: 11, fill: INK }, g);
    el("circle", { cx: d[0], cy: d[1] + d[2] - 6, r: 15, fill: INK }, g);
    el("circle", { cx: d[0] - 4, cy: d[1] + d[2] - 10, r: 4, fill: "#FFFFFF", opacity: .7 }, g);
  });

  // the word
  var word = el("text", { x: 500, y: 545, "text-anchor": "middle", class: "bb-word", textLength: 640, lengthAdjust: "spacingAndGlyphs" }, svg);
  word.textContent = "PORTFOLIO";

  // two droplet buddies on top of the cloud
  var eyes = [];
  [[430, 262, 1, -8], [590, 250, .78, 6]].forEach(function (b, i) {
    var g = el("g", { class: "bb-buddy", transform: "translate(" + b[0] + " " + b[1] + ") scale(" + b[2] + ") rotate(" + b[3] + ")", style: "--dl:" + (i * -.9) + "s" }, svg);
    var inner = el("g", { class: "bb-buddy-in" }, g);
    el("path", { d: "M0 -88 C 30 -40 58 -6 58 30 C 58 66 30 88 0 88 C -30 88 -58 66 -58 30 C -58 -6 -30 -40 0 -88 Z", fill: FILL, stroke: INK, "stroke-width": 12, "stroke-linejoin": "round" }, inner);
    el("ellipse", { cx: -24, cy: 6, rx: 9, ry: 14, fill: "#FFFFFF", opacity: .9, transform: "rotate(-20 -24 6)" }, inner);
    [[-18, 30], [18, 30]].forEach(function (e) {
      var eye = el("g", { class: "bb-eye" }, inner);
      el("ellipse", { cx: e[0], cy: e[1], rx: 13, ry: 15, fill: "#FFFFFF", stroke: INK, "stroke-width": 5 }, eye);
      var pupil = el("circle", { cx: e[0], cy: e[1] + 2, r: 7, fill: INK }, eye);
      eyes.push({ g: eye, pupil: pupil, x: e[0], y: e[1] + 2 });
    });
    el("path", { d: "M-10 56 Q0 64 10 56", fill: "none", stroke: INK, "stroke-width": 5, "stroke-linecap": "round" }, inner);   // little smile
    el("ellipse", { cx: -36, cy: 50, rx: 9, ry: 5, fill: PINK, opacity: .6 }, inner);   // cheeks
    el("ellipse", { cx: 36, cy: 50, rx: 9, ry: 5, fill: PINK, opacity: .6 }, inner);
  });

  // little rings floating around the cloud
  var rings = el("g", { class: "bb-rings" }, svg);
  [[150, 250, 16], [70, 560, 24], [120, 690, 12], [880, 120, 14], [950, 480, 22], [860, 690, 16], [640, 60, 18], [330, 120, 10], [960, 620, 10]].forEach(function (r, i) {
    el("circle", { cx: r[0], cy: r[1], r: r[2], fill: "none", stroke: i % 3 === 0 ? PINK : "#FFFFFF", "stroke-width": 7, class: "bb-ring", style: "--dl:" + (i * -.7) + "s;transform-origin:" + r[0] + "px " + r[1] + "px" }, rings);
  });

  /* eyes follow the mouse (or a finger) */
  if (!reduce) {
    var mx = null, my = null, tick = false;
    function look() {
      tick = false;
      eyes.forEach(function (e) {
        if (mx === null) { e.pupil.setAttribute("transform", ""); return; }
        var b = e.g.getBoundingClientRect(), cx = b.left + b.width / 2, cy = b.top + b.height / 2;
        var dx = mx - cx, dy = my - cy, d = Math.hypot(dx, dy) || 1, m = Math.min(6, d / 30);
        e.pupil.setAttribute("transform", "translate(" + (dx / d * m).toFixed(1) + " " + (dy / d * m).toFixed(1) + ")");
      });
    }
    window.addEventListener("pointermove", function (ev) { mx = ev.clientX; my = ev.clientY; if (!tick) { tick = true; requestAnimationFrame(look); } });
    // blink every few seconds
    setInterval(function () {
      eyes.forEach(function (e) { e.g.classList.add("blink"); });
      setTimeout(function () { eyes.forEach(function (e) { e.g.classList.remove("blink"); }); }, 160);
    }, 3200);
  }
})();
