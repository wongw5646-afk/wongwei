/* =========================================================
   Project process page. Reads ?p=<id> and builds everything
   from js/projects.js
   ========================================================= */
(function () {
  var main = document.getElementById("main");
  var params = new URLSearchParams(location.search);
  var project = findProject(params.get("p")) || null;

  if (!project) {
    main.innerHTML =
      '<div class="not-found"><h1>Oops, that leaf fell off!</h1>' +
      '<p>That project could not be found.</p><a class="btn accent" href="index.html">Back home</a></div>';
    return;
  }

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var stages = project.stages;
  var current = -1;
  var visited = new Set();
  var SPACING = 170, UP_Y = 92, DOWN_Y = 160, PAD = 70;

  document.title = project.title + " · Wei Yi Wong";

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function img(src) { return projectImg(project, src); }
  function isEmpty(s) { return !s.notes && !(s.images && s.images.length); }

  var sprout =
    '<svg viewBox="0 0 30 30" aria-hidden="true"><path d="M15 28 V14" stroke="#1B1B1D" stroke-width="3" stroke-linecap="round"/>' +
    '<path d="M15 16 C 6 16, 4 9, 5 6 C 11 6, 15 10, 15 16z" fill="#1B1B1D"/>' +
    '<path d="M15 14 C 22 14, 26 8, 25 4 C 19 4, 15 8, 15 14z" fill="#1B1B1D"/></svg>';
  var star =
    '<svg viewBox="0 0 30 30" aria-hidden="true"><path d="M15 1 L18 9 L26 6 L23 14 L29 18 L21 20 L22 28 L15 23 L8 28 L9 20 L1 18 L7 14 L4 6 L12 9Z" fill="#F5873A"/></svg>';
  // the little grey blob that walks along the path
  var WALKER =
    '<svg viewBox="0 0 60 52"><path d="M6 30 C 4 12, 22 2, 34 4 C 50 6, 58 20, 54 36 C 52 46, 44 50, 30 50 C 14 50, 7 42, 6 30Z" fill="#9A9DA4"/>' +
    '<circle cx="34" cy="20" r="6" fill="#fff"/><circle cx="36.4" cy="20" r="3.8" fill="#1B1B1D"/>' +
    '<circle cx="47" cy="21" r="5.6" fill="#fff"/><circle cx="49.2" cy="21" r="3.5" fill="#1B1B1D"/></svg>';

  /* ---------- page skeleton ---------- */
  var growing = project.status === "growing";
  main.innerHTML =
    '<section class="p-hero">' +
      "<div>" +
        "<h1>" + esc(project.title) + "</h1>" +
        '<p class="summary">' + esc(project.summary) + "</p>" +
        '<span class="badge' + (growing ? " growing" : "") + '">' + (growing ? sprout + "Still growing" : star + "Finished") + "</span>" +
      "</div>" +
      '<button class="hero-frame" type="button" id="heroBtn" aria-label="View larger: ' + esc(project.heroAlt || project.title) + '">' +
        '<img src="' + esc(img(project.hero)) + '" alt="' + esc(project.heroAlt || project.title) + '">' +
      "</button>" +
    "</section>" +

    '<section class="journey-wrap" id="journey" aria-labelledby="journeyTitle">' +
      '<h2 class="journey-title" id="journeyTitle">The journey</h2>' +
      '<p class="journey-hint">tap a bubble, or use ← → keys</p>' +
      '<div class="journey-scroll" id="journeyScroll">' +
        '<div class="journey" id="journeyPath"></div>' +
      "</div>" +
      '<div class="progress" aria-hidden="true">' +
        '<div class="progress-track"><div class="progress-fill" id="progFill"></div></div>' +
        '<span class="progress-text" id="progText"></span>' +
      "</div>" +
    "</section>" +

    '<section class="panel" id="panel" aria-live="polite"></section>' +

    '<nav class="end-row" aria-label="More projects">' +
      '<a class="btn ghost" href="projects.html">← Back to all projects</a>' +
      '<a class="btn accent" id="nextProject" href="#">Next project →</a>' +
    "</nav>";

  /* ---------- the winding path ---------- */
  var path = document.getElementById("journeyPath");
  var scroller = document.getElementById("journeyScroll");
  var pts = stages.map(function (s, i) {
    return { x: PAD + i * SPACING, y: i % 2 === 0 ? DOWN_Y : UP_Y };
  });
  var totalW = PAD * 2 + (stages.length - 1) * SPACING;
  path.style.width = totalW + "px";
  path.style.height = "250px";

  // smooth curve through all bubbles, starting and ending off to the sides
  var all = [{ x: 0, y: DOWN_Y + 20 }].concat(pts, [{ x: totalW, y: pts[pts.length - 1].y === UP_Y ? UP_Y - 20 : DOWN_Y + 20 }]);
  var d = "M" + all[0].x + " " + all[0].y;
  for (var i = 0; i < all.length - 1; i++) {
    var p0 = all[i - 1] || all[i], p1 = all[i], p2 = all[i + 1], p3 = all[i + 2] || p2;
    d += " C" + (p1.x + (p2.x - p0.x) / 6) + " " + (p1.y + (p2.y - p0.y) / 6) + " " +
      (p2.x - (p3.x - p1.x) / 6) + " " + (p2.y - (p3.y - p1.y) / 6) + " " + p2.x + " " + p2.y;
  }
  path.innerHTML =
    '<svg class="trail" viewBox="0 0 ' + totalW + ' 250" aria-hidden="true">' +
      '<path class="trail-back" d="' + d + '"/>' +
      '<path class="trail-progress" id="trailProg" d="' + d + '"/>' +
      '<path class="trail-dots" d="' + d + '"/>' +
    "</svg>";

  var trailProg = document.getElementById("trailProg");
  var trailLen = trailProg.getTotalLength();
  trailProg.style.strokeDasharray = trailLen;
  trailProg.style.strokeDashoffset = trailLen;
  trailProg.style.transition = "stroke-dashoffset .8s ease";

  var bubbles = stages.map(function (s, i) {
    var b = document.createElement("button");
    b.type = "button";
    var soon = isEmpty(s);
    b.className = "stage-bubble" + (soon ? " soon" : "");
    b.style.left = pts[i].x + "px";
    b.style.top = pts[i].y + "px";
    b.setAttribute("aria-label", "Stage " + (i + 1) + ": " + s.name + (soon ? " (coming soon)" : ""));
    b.innerHTML = '<span aria-hidden="true">' + (soon ? "…" : i + 1) + "</span>" +
      '<span class="label" aria-hidden="true">' + esc(soon ? s.name + " · soon" : s.name) + "</span>" +
      '<span class="tick" aria-hidden="true">✓</span>';
    b.addEventListener("click", function () { go(i, true); });
    path.appendChild(b);
    return b;
  });

  var walker = document.createElement("div");
  walker.className = "walker";
  walker.setAttribute("aria-hidden", "true");
  walker.innerHTML = WALKER;
  path.appendChild(walker);

  /* ---------- the stage panel ---------- */
  var panel = document.getElementById("panel");

  function renderPanel(i) {
    var s = stages[i];
    var soon = isEmpty(s);
    var h = '<div class="panel-card">' +
      '<div class="panel-head"><div>' +
        '<span class="stage-num">Stage ' + (i + 1) + " of " + stages.length + "</span>" +
        "<h2>" + esc(s.name) + "</h2></div>" +
        '<div class="panel-nav">' +
          '<button class="btn ghost" type="button" data-step="-1"' + (i === 0 ? " disabled" : "") + ' aria-label="Previous stage">← Back</button>' +
          '<button class="btn accent" type="button" data-step="1"' + (i === stages.length - 1 ? " disabled" : "") + ' aria-label="Next stage">Next →</button>' +
        "</div>" +
      "</div>";

    if (soon) {
      h += '<div class="soon-box" style="margin-top:20px">🌱 This part is still growing. Check back soon!</div>';
    } else {
      if (s.notes) h += '<p class="panel-notes">' + esc(s.notes) + "</p>";

      if (s.compare) {
        var c = s.compare;
        h += '<div class="compare-wrap"><h3>Drag to compare</h3>' +
          '<div class="compare" style="--pos:50%">' +
            '<img src="' + esc(img(c.before)) + '" alt="Before: ' + esc(c.beforeLabel || "before") + '" loading="lazy">' +
            '<img class="after" src="' + esc(img(c.after)) + '" alt="After: ' + esc(c.afterLabel || "after") + '" loading="lazy">' +
            '<span class="handle" aria-hidden="true"></span>' +
            '<span class="tag l">' + esc(c.beforeLabel || "before") + "</span>" +
            '<span class="tag r">' + esc(c.afterLabel || "after") + "</span>" +
            '<input type="range" min="0" max="100" value="50" aria-label="Before and after slider">' +
          "</div></div>";
      }

      var imgs = s.images || [];
      if (s.versions && imgs.length > 1) {
        h += '<div class="versions"><span>Versions:</span>' + imgs.map(function (im, k) {
          return '<button class="btn" type="button" data-open="' + k + '" aria-label="Open version ' + (k + 1) + ": " + esc(im.caption) + '">v' + (k + 1) + "</button>";
        }).join("") + "</div>";
      }

      h += '<div class="gallery">' + imgs.map(function (im, k) {
        return '<figure class="g-item">' +
          '<button class="g-btn" type="button" data-open="' + k + '" aria-label="View larger: ' + esc(im.alt || im.caption) + '">' +
            (s.versions ? '<span class="g-ver" aria-hidden="true">v' + (k + 1) + "</span>" : "") +
            '<img src="' + esc(img(im.src)) + '" alt="' + esc(im.alt || im.caption) + '" loading="lazy">' +
          "</button>" +
          "<figcaption>" + esc(im.caption) + "</figcaption></figure>";
      }).join("") + "</div>";
    }
    h += "</div>";
    panel.innerHTML = h;

    panel.querySelectorAll("[data-step]").forEach(function (btn) {
      btn.addEventListener("click", function () { go(i + Number(btn.dataset.step), false); });
    });
    panel.querySelectorAll("[data-open]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        openLightbox(s.images.map(function (im) { return { src: img(im.src), caption: im.caption, alt: im.alt || im.caption }; }), Number(btn.dataset.open), btn);
      });
    });
    var range = panel.querySelector(".compare input");
    if (range) range.addEventListener("input", function () {
      range.parentElement.style.setProperty("--pos", range.value + "%");
    });
  }

  /* ---------- moving between stages ---------- */
  function go(i, fromBubble) {
    if (i < 0 || i >= stages.length || i === current) return;
    current = i;
    visited.add(i);
    bubbles.forEach(function (b, k) {
      b.classList.toggle("active", k === i);
      b.classList.toggle("visited", visited.has(k) && k !== i);
      if (k === i) b.setAttribute("aria-current", "step"); else b.removeAttribute("aria-current");
    });

    walker.style.left = pts[i].x + "px";
    walker.style.top = pts[i].y + "px";
    walker.style.transform = "translate(-50%, -128%) scaleX(" + (pts[i].x >= (walker._lastX || 0) ? 1 : -1) + ")";
    walker._lastX = pts[i].x;
    if (!reduceMotion) {
      walker.classList.add("walking");
      clearTimeout(walker._t);
      walker._t = setTimeout(function () { walker.classList.remove("walking"); }, 800);
    }

    // keep the bubble in view on small screens
    var target = pts[i].x - scroller.clientWidth / 2;
    scroller.scrollTo({ left: Math.max(0, target), behavior: reduceMotion ? "auto" : "smooth" });

    // progress
    var frac = visited.size / stages.length;
    document.getElementById("progFill").style.width = frac * 100 + "%";
    document.getElementById("progText").textContent = visited.size + " / " + stages.length;
    var furthest = Math.max.apply(null, Array.from(visited));
    var along = stages.length > 1 ? (PAD + furthest * SPACING) / totalW : 1;
    trailProg.style.strokeDashoffset = trailLen * (1 - along);

    renderPanel(i);
    history.replaceState(null, "", "#stage-" + (i + 1));
    if (!fromBubble) {
      var btn = panel.querySelector('[data-step="' + (i === stages.length - 1 ? -1 : 1) + '"]');
      if (btn && document.activeElement && document.activeElement.closest && document.activeElement.closest(".panel")) btn.focus({ preventScroll: true });
    }
  }

  document.addEventListener("keydown", function (ev) {
    if (lb.classList.contains("open")) return;
    var t = ev.target;
    if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return;
    if (ev.key === "ArrowRight") { go(current + 1, false); }
    if (ev.key === "ArrowLeft") { go(current - 1, false); }
  });

  /* ---------- lightbox ---------- */
  var lb = document.getElementById("lightbox");
  var lbImg = document.getElementById("lbImg");
  var lbCaption = document.getElementById("lbCaption");
  var lbCount = document.getElementById("lbCount");
  var lbPrev = lb.querySelector(".lb-prev"), lbNext = lb.querySelector(".lb-next"), lbClose = lb.querySelector(".lb-close");
  var lbList = [], lbIndex = 0, lbReturn = null;

  function openLightbox(list, index, returnTo) {
    lbList = list; lbReturn = returnTo;
    lb.classList.add("open");
    document.body.style.overflow = "hidden";
    showLb(index);
    lbClose.focus();
  }
  function showLb(i) {
    lbIndex = (i + lbList.length) % lbList.length;
    var it = lbList[lbIndex];
    lbImg.src = it.src;
    lbImg.alt = it.alt || it.caption || "";
    lbCaption.textContent = it.caption || "";
    lbCount.textContent = lbList.length > 1 ? (lbIndex + 1) + "/" + lbList.length : "";
    lbPrev.hidden = lbNext.hidden = lbList.length < 2;
  }
  function closeLb() {
    lb.classList.remove("open");
    document.body.style.overflow = "";
    if (lbReturn) lbReturn.focus({ preventScroll: true });
  }
  lbPrev.addEventListener("click", function () { showLb(lbIndex - 1); });
  lbNext.addEventListener("click", function () { showLb(lbIndex + 1); });
  lbClose.addEventListener("click", closeLb);
  lb.addEventListener("click", function (ev) { if (ev.target === lb) closeLb(); });
  document.addEventListener("keydown", function (ev) {
    if (!lb.classList.contains("open")) return;
    if (ev.key === "Escape") closeLb();
    else if (ev.key === "ArrowRight") showLb(lbIndex + 1);
    else if (ev.key === "ArrowLeft") showLb(lbIndex - 1);
    else if (ev.key === "Tab") {
      // keep keyboard focus inside the viewer
      var f = [lbClose, lbPrev, lbNext].filter(function (b) { return !b.hidden; });
      var at = f.indexOf(document.activeElement);
      ev.preventDefault();
      f[(at + (ev.shiftKey ? -1 : 1) + f.length) % f.length].focus();
    }
  });
  // swipe on phones
  var sx = null;
  lb.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener("touchend", function (e) {
    if (sx == null) return;
    var dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 50) showLb(lbIndex + (dx < 0 ? 1 : -1));
    sx = null;
  });

  var heroBtn = document.getElementById("heroBtn");
  heroBtn.addEventListener("click", function () {
    openLightbox([{ src: img(project.hero), caption: project.title, alt: project.heroAlt }], 0, heroBtn);
  });

  /* ---------- next project ---------- */
  var idx = PROJECTS.indexOf(project);
  var next = PROJECTS[(idx + 1) % PROJECTS.length];
  var nextLink = document.getElementById("nextProject");
  nextLink.href = projectLink(next);
  nextLink.textContent = "Next: " + next.title + " →";

  /* ---------- start on the stage in the URL, or the first ---------- */
  var m = location.hash.match(/stage-(\d+)/);
  var start = m ? Math.min(stages.length, Math.max(1, Number(m[1]))) - 1 : 0;
  go(start, true);
})();
