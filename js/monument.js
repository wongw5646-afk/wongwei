/* =========================================================
   "Monument" scroll style for the project pages
   (inspired by the giant-word product landing pages).
   - Top of the page: the project name in giant letters across
     the whole width, with a cut-out of the product floating in
     front. Scrolling makes the product rise, turn and grow.
   - Every section heading becomes a huge word that slides
     sideways as you scroll past it.
   - Pictures fade up into place as they come into view.
   Turn it on for a page by adding data-mono="path/to/cutout.webp"
   to its <body>. Remove that to go back to the normal look.
   ========================================================= */
(function () {
  var body = document.body;
  var cutout = body.getAttribute("data-mono");
  if (!cutout) return;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  body.classList.add("mono");

  /* ---------- hero: giant word + floating product ---------- */
  var hero = document.querySelector(".case-hero");
  var title = hero && hero.querySelector(".case-title");
  var stage = document.createElement("div");
  stage.className = "mono-stage";
  if (hero && title) {
    var word = document.createElement("div");
    word.className = "mono-word";
    word.setAttribute("aria-hidden", "true");
    var t = title.textContent.trim();
    word.textContent = (t === t.toUpperCase()) ? t : t.toLowerCase();   // all-caps names like FIFI stay capital
    var prod = document.createElement("img");
    prod.className = "mono-product";
    prod.src = cutout;
    prod.alt = "";
    var num = (hero.querySelector(".burst span") || {}).textContent || "";
    var sub = hero.querySelector(".case-sub");
    var info = document.createElement("div");
    info.className = "mono-info";
    info.innerHTML = '<span class="mono-num"></span><p></p>';
    info.querySelector(".mono-num").textContent = num ? "/" + num.trim() : "";
    info.querySelector("p").textContent = sub ? sub.textContent : "";
    var hint = document.createElement("span");
    hint.className = "mono-scroll";
    hint.textContent = "Scroll";
    stage.appendChild(word);
    stage.appendChild(prod);
    stage.appendChild(info);
    stage.appendChild(hint);
    hero.appendChild(stage);
  }

  // make the giant word exactly fill the width of the page
  function fit() {
    if (!word) return;
    word.style.fontSize = "100px";
    var w = word.scrollWidth || 1;
    var target = stage.clientWidth * 0.985;
    // short words (like "fifi") would get too tall, so cap the height and centre them
    var size = Math.min(100 * target / w, window.innerHeight * 0.56);
    word.style.fontSize = size + "px";
    word.style.left = Math.max(stage.clientWidth * 0.0075, (stage.clientWidth - w * size / 100) / 2) + "px";
  }

  /* ---------- section headings become sliding giant words ---------- */
  var bands = [];
  document.querySelectorAll(".case-section").forEach(function (sec) {
    var h = sec.querySelector(".case-h");
    if (!h) return;
    var n = h.querySelector(".num");
    var text = (h.querySelector(".eat") || h).textContent.replace(n ? n.textContent : "", "").trim();
    var band = document.createElement("div");
    band.className = "mono-band";
    band.setAttribute("aria-hidden", "true");
    band.innerHTML = '<span class="mono-band-num"></span><div class="mono-band-word"></div>';
    band.querySelector(".mono-band-num").textContent = n ? n.textContent.trim() : "";
    band.querySelector(".mono-band-word").textContent = text.toLowerCase();
    sec.parentNode.insertBefore(band, sec);
    h.classList.add("mono-hidden-h");   // the real heading stays for screen readers
    bands.push(band);
  });

  /* ---------- pictures fade up into place ---------- */
  if (!reduce && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    document.querySelectorAll("main .zoom, main .card, main .case-panel, main .case-paper").forEach(function (el) {
      el.classList.add("mono-rise"); io.observe(el);
    });
  }

  /* ---------- scroll ---------- */
  var ticking = false;
  function frame() {
    ticking = false;
    var vh = window.innerHeight, vw = window.innerWidth;
    if (stage.isConnected && prod) {
      var p = Math.min(1, Math.max(0, window.scrollY / (vh * 0.9)));
      prod.style.transform = reduce ? "" :
        "translate(-50%, calc(-50% - " + (p * 32).toFixed(2) + "vh)) rotate(" + (p * 14 - 4).toFixed(2) + "deg) scale(" + (1 + p * 0.18).toFixed(3) + ")";
      word.style.transform = reduce ? "" : "translateY(" + (p * 12).toFixed(2) + "vh)";
      word.style.opacity = (1 - p * 0.6).toFixed(3);
      info.style.opacity = hint.style.opacity = (1 - p * 1.6).toFixed(3);
    }
    bands.forEach(function (b) {
      var r = b.getBoundingClientRect();
      if (r.bottom < -50 || r.top > vh + 50) return;
      var w = b.lastChild, tw = w.scrollWidth;
      var t = Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height)));   // 0 entering at the bottom -> 1 leaving at the top
      var from = vw * 0.45, to = Math.min(0, vw * 0.97 - tw) - vw * 0.12;
      w.style.transform = reduce ? "" : "translateX(" + (from + (to - from) * t).toFixed(1) + "px)";
    });
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", function () { fit(); frame(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { fit(); frame(); });
  fit(); frame();
})();
