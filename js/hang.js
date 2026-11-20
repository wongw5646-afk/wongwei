/* =========================================================
   Home page: the 4 projects as badge cards hanging from a
   string with little clips (like a "meet the people" banner).
   - The string sags in a gentle curve; each card hangs from it
     with its own tilt and sways slightly.
   - Hover (or tap) a card: it straightens and flips over to a
     holographic back with the project details.
     Click (or tap again) to open the project.
   ========================================================= */
(function () {
  var line = document.getElementById("hangLine");
  if (!line || !window.PROJECTS) return;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var projects = PROJECTS.slice(0, 4);
  var NS = "http://www.w3.org/2000/svg";

  // where each card hangs along the string (0..1) and how it tilts
  var SPOTS = [
    { at: .14, tilt: -5, drop: 0 },
    { at: .38, tilt: 3, drop: 26 },
    { at: .62, tilt: -2, drop: 10 },
    { at: .86, tilt: 6, drop: 34 }
  ];
  var SAG = 0.16;   // how much the string sags in the middle (part of its length)

  // the string
  var svg = document.createElementNS(NS, "svg");
  svg.setAttribute("class", "hg-string");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("preserveAspectRatio", "none");
  var path = document.createElementNS(NS, "path");
  svg.appendChild(path);
  line.appendChild(svg);
  var spacer = document.createElement("div");   // keeps the scroll width on phones
  spacer.style.cssText = "height:1px;pointer-events:none";
  line.appendChild(spacer);

  var cards = projects.map(function (p, i) {
    var s = SPOTS[i];
    var a = document.createElement("a");
    a.className = "hg-card";
    a.href = projectLink(p);
    a.setAttribute("role", "listitem");
    a.setAttribute("aria-label", "Project 0" + (i + 1) + ": " + p.title + ". " + p.tagline);
    a.style.setProperty("--tilt", s.tilt + "deg");
    a.style.setProperty("--drop", s.drop + "px");
    a.style.setProperty("--delay", (i * -1.3) + "s");
    var img = projectImg(p, p.thumb || p.hero);
    a.innerHTML =
      '<span class="hg-clip" aria-hidden="true"></span>' +
      '<span class="hg-flip">' +
        '<span class="hg-face hg-front">' +
          '<span class="hg-top"><span class="hg-slot"></span></span>' +
          '<span class="hg-photo"><img alt="" loading="lazy"></span>' +
          '<span class="hg-name"></span>' +
          '<span class="hg-role"></span>' +
          '<span class="hg-row"><span class="hg-num">0' + (i + 1) + '</span><span class="hg-dot"></span></span>' +
        '</span>' +
        '<span class="hg-face hg-back">' +
          '<span class="hg-top"><span class="hg-slot"></span></span>' +
          '<span class="hg-bnum">0' + (i + 1) + '</span>' +
          '<span class="hg-bname"></span>' +
          '<span class="hg-btag"></span>' +
          '<span class="hg-meta"><span>Industrial design</span><span>Wentworth</span></span>' +
          '<span class="hg-go">View project →</span>' +
          '<span class="hg-code" aria-hidden="true"></span>' +
        '</span>' +
      '</span>';
    var im = a.querySelector(".hg-photo img");
    im.src = img;
    im.style.objectPosition = p.thumbFocus || "50% 50%";
    a.querySelector(".hg-name").textContent = p.title;
    a.querySelector(".hg-role").textContent = p.tagline || "";
    a.querySelector(".hg-bname").textContent = p.title;
    a.querySelector(".hg-btag").textContent = p.tagline || "";
    // a little pattern of squares on the back, like the QR code on the reference card
    var code = a.querySelector(".hg-code"), cells = "";
    for (var c = 0; c < 49; c++) cells += '<i' + (((c * 7 + i * 3 + (c >> 2)) % 3 === 0) ? ' class="on"' : '') + '></i>';
    code.innerHTML = cells;
    line.appendChild(a);
    return a;
  });

  // lay the string and cards out for the current width
  function layout() {
    // on phones the string is wider than the screen and you swipe sideways along it
    var w = Math.max(line.clientWidth, window.innerWidth < 760 ? 900 : 0), h = line.clientHeight;
    svg.style.width = w + "px";
    spacer.style.width = w + "px";
    var sag = w * SAG * 0.35;
    var y0 = 10;
    svg.setAttribute("viewBox", "0 0 " + w + " " + h);
    // string: a curve from edge to edge that sags in the middle
    path.setAttribute("d", "M0 " + y0 + " Q" + (w / 2) + " " + (y0 + sag * 2) + " " + w + " " + y0);
    cards.forEach(function (a, i) {
      var t = SPOTS[i].at;
      var x = t * w;
      var y = (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * (y0 + sag * 2) + t * t * y0;   // point on the curve
      a.style.left = x + "px";
      a.style.top = y + "px";
    });
  }
  window.addEventListener("resize", layout);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);
  layout();

  // touch: the first tap flips the card, the second opens the project
  var lastPointer = "";
  document.addEventListener("pointerdown", function (e) { lastPointer = e.pointerType; }, true);
  cards.forEach(function (a) {
    a.addEventListener("click", function (e) {
      if (lastPointer && lastPointer !== "mouse" && !a.classList.contains("flip")) {
        e.preventDefault();
        cards.forEach(function (b) { b.classList.remove("flip"); });
        a.classList.add("flip");
      }
    });
    a.addEventListener("pointerenter", function (e) { if (e.pointerType === "mouse") a.classList.add("flip"); });
    a.addEventListener("pointerleave", function (e) { if (e.pointerType === "mouse") a.classList.remove("flip"); });
    a.addEventListener("focus", function () { a.classList.add("flip"); });
    a.addEventListener("blur", function () { a.classList.remove("flip"); });
  });
  document.addEventListener("click", function (e) {
    if (!e.target.closest(".hg-card")) cards.forEach(function (b) { b.classList.remove("flip"); });
  });
  if (reduce) line.classList.add("still");
})();

/* glare follows the mouse across each card */
document.querySelectorAll(".hg-card").forEach(function (card) {
  card.addEventListener("pointermove", function (e) {
    var r = card.getBoundingClientRect();
    var x = ((e.clientX - r.left) / r.width) * 100, y = ((e.clientY - r.top) / r.height) * 100;
    card.querySelectorAll(".hg-face").forEach(function (f) {
      f.style.setProperty("--gx", (f.classList.contains("hg-back") ? 100 - x : x).toFixed(1) + "%");
      f.style.setProperty("--gy", y.toFixed(1) + "%");
    });
  });
  card.addEventListener("pointerleave", function () {
    card.querySelectorAll(".hg-face").forEach(function (f) { f.style.removeProperty("--gx"); f.style.removeProperty("--gy"); });
  });
});
