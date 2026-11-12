/* =========================================================
   The project tree on the home page.
   - Every shape in the canopy is a leaf. The 4 leaves with
     eyes are projects (in the order of js/projects.js).
   - Hover (or tap) a project leaf: its picture fills the leaf,
     the big number and name change, the glow takes its colour.
     Click (or tap again) to open the project.
   - Leaves lean away from the cursor; plain leaves fall off
     when clicked and grow back.
   Shapes are measured from the shape-tree in "reference photo"
   (x, y, width, height on a 420 x 288 canopy, starting at 40, 82).
   ========================================================= */
(function () {
  var canopy = document.getElementById("tCanopy");
  var stage = document.querySelector(".t-stage");
  if (!canopy || !window.PROJECTS) return;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var touch = window.matchMedia("(hover: none)").matches;

  // [shape, x, y, w, h, colour, project number (0-3) or -1]
  var LEAVES = [
    ["circle", 76, 117, 146, 146, "dark", 0],   // 01: a little smaller, same centre
    // little round leaves filling the space around 01
    ["circle", 62, 112, 20, 20, "lime", -1],
    ["circle", 90, 96, 16, 16, "cyan", -1],
    ["circle", 114, 88, 22, 22, "mint", -1],
    ["circle", 199, 123, 13, 13, "cyan", -1],
    ["circle", 79, 246, 13, 13, "mint", -1],
    ["pill", 153, 84, 24, 11, "cyan", -1],
    ["circle", 178, 84, 18, 18, "dark", -1],
    ["circle", 198, 84, 33, 33, "lime", -1],
    ["circle", 232, 84, 33, 33, "lime", -1],
    ["circle", 266, 84, 33, 33, "lime", -1],
    ["circle", 300, 84, 33, 33, "lime", -1],
    ["bowl", 214, 120, 124, 46, "cyan", -1],
    ["circle", 336, 86, 46, 46, "dark", -1],
    ["circle", 384, 103, 13, 13, "mint", -1],
    ["pill", 380, 121, 38, 12, "lime", -1],
    ["rect", 372, 136, 53, 27, "mint", -1],
    ["circle", 428, 155, 17, 17, "cyan", -1],
    ["rect", 438, 176, 9, 9, "lime", -1],
    ["diamond", 268, 128, 122, 122, "mint", 1],
    ["pill", 230, 168, 30, 62, "lime", -1],
    ["circle", 263, 205, 22, 22, "cyan", -1],
    ["dee", 396, 168, 62, 122, "dark", 2],
    ["rect", 372, 212, 19, 20, "lime", -1],
    ["circle", 340, 240, 52, 52, "peach", -1],
    ["pill", 205, 234, 38, 24, "mint", -1],
    ["rect", 246, 234, 56, 54, "dark", -1],
    ["pill", 150, 262, 94, 29, "cyan", -1],
    ["rect", 76, 262, 72, 52, "mint", -1],
    ["rect", 42, 214, 27, 26, "mint", -1],
    ["circle", 46, 193, 19, 19, "cyan", -1],
    ["pill", 50, 166, 12, 26, "lime", -1],
    ["pill", 44, 246, 30, 14, "lime", -1],
    ["pill", 54, 266, 17, 30, "dark", -1],
    ["circle", 88, 316, 54, 40, "cyan", -1],
    ["circle", 141, 349, 14, 14, "mint", -1],
    ["pill", 148, 295, 188, 70, "lime", 3],
    ["circle", 305, 266, 26, 26, "mint", -1],
    ["pill", 340, 318, 22, 46, "dark", -1],
    ["quarter", 364, 318, 38, 38, "mint", -1],
    ["rect", 340, 296, 82, 18, "dark", -1],
    ["circle", 426, 284, 14, 14, "cyan", -1]
  ];

  var projects = PROJECTS.slice(0, 4);
  var label = { num: document.getElementById("tNum"), title: document.getElementById("tTitle"), tag: document.getElementById("tTag"), go: document.getElementById("tGo") };
  var DEFAULT = { num: label.num.textContent.replace("_", ""), title: label.title.textContent, tag: label.tag.textContent, href: label.go.getAttribute("href"), go: label.go.textContent };
  if (touch) { DEFAULT.tag = DEFAULT.tag.replace("Hover", "Tap"); label.tag.textContent = DEFAULT.tag; }
  var leaves = [], eyes = [];
  var lastPointer = "";   // "mouse", "touch" or "pen", whichever was used last
  document.addEventListener("pointerdown", function (e) { lastPointer = e.pointerType; }, true);

  LEAVES.forEach(function (d, i) {
    var p = d[6] >= 0 ? projects[d[6]] : null;
    var el = document.createElement(p ? "a" : "span");
    el.className = "leaf " + d[0] + (p ? " proj" : " plain");
    el.style.left = ((d[1] - 40) / 420 * 100) + "%";
    el.style.top = ((d[2] - 82) / 288 * 100) + "%";
    el.style.width = (d[3] / 420 * 100) + "%";
    el.style.height = (d[4] / 288 * 100) + "%";
    el.style.setProperty("--c", "var(--leaf-" + d[5] + ")");

    var inner = document.createElement("span");
    inner.className = "leaf-in";
    inner.style.animationDelay = (reduce ? 0 : 120 + i * 28) + "ms";
    el.appendChild(inner);

    if (p) {
      var n = d[6] + 1;
      el.href = projectLink(p);
      el.setAttribute("aria-label", "Project " + n + ": " + p.title + ". " + p.tagline);
      var img = document.createElement("img");
      img.className = "leaf-img";
      img.src = projectImg(p, p.leaf || p.thumb || p.hero);
      if (p.leafHero) el.classList.add("hero-shot");
      img.alt = "";
      img.style.objectPosition = p.leafFocus || p.thumbFocus || "50% 50%";
      inner.appendChild(img);
      var ey = document.createElement("span");
      ey.className = "leaf-eyes";
      ey.innerHTML = "<i><b></b></i><i><b></b></i>";
      el.appendChild(ey);
      var num = document.createElement("span");
      num.className = "leaf-num";
      num.textContent = "0" + n;
      el.appendChild(num);
      el._p = p; el._n = n;
      eyes.push(el);

      // a mouse peeks on hover; a finger peeks on the first tap and opens on the second
      el.addEventListener("pointerenter", function (e) { if (e.pointerType === "mouse") show(el); });
      el.addEventListener("pointerleave", function (e) { if (e.pointerType === "mouse") hide(); });
      el.addEventListener("focus", function () { show(el); });
      el.addEventListener("blur", function () { hide(); });
      el.addEventListener("click", function (e) {
        if (lastPointer !== "mouse" && lastPointer !== "" && !el.classList.contains("on")) { e.preventDefault(); show(el); }
      });
    } else {
      el.setAttribute("aria-hidden", "true");
      el.addEventListener("click", function () { drop(el); });
    }
    canopy.appendChild(el);
    leaves.push(el);
  });

  /* ---------- the big label ---------- */
  var current = null;
  function setLabel(num, title, tag, href, go, colour) {
    if (label.num.textContent.replace("_", "") !== num) {
      label.num.innerHTML = '<span class="u">_</span>' + num;
      label.num.classList.remove("swap"); void label.num.offsetWidth; label.num.classList.add("swap");
    }
    label.title.textContent = title;
    label.tag.textContent = tag;
    label.go.href = href;
    label.go.textContent = go;
    label.num.style.color = colour || "";
    document.body.style.setProperty("--glow", colour || "#2F6B4E");
  }
  function show(el) {
    if (current && current !== el) current.classList.remove("on");
    current = el;
    el.classList.add("on");
    stage.classList.add("focus");
    var p = el._p;
    setLabel("0" + el._n, p.title, p.tagline, projectLink(p), (lastPointer && lastPointer !== "mouse") ? "Tap again to open →" : "View project →", p.color);
  }
  function hide() {
    if (current) current.classList.remove("on");
    current = null;
    stage.classList.remove("focus");
    setLabel(DEFAULT.num, DEFAULT.title, DEFAULT.tag, DEFAULT.href, DEFAULT.go, "");
  }
  // on touch screens, tapping anywhere else closes the peek
  document.addEventListener("click", function (e) {
    if (lastPointer !== "mouse" && current && !e.target.closest(".leaf.proj") && !e.target.closest(".t-go")) hide();
  });

  /* ---------- plain leaves fall off and grow back ---------- */
  function drop(el) {
    if (el.classList.contains("fall") || reduce) return;
    var r = el.getBoundingClientRect();
    var ground = document.querySelector(".t-ground").getBoundingClientRect().top;
    el.style.setProperty("--fall", Math.max(60, ground - r.bottom) + "px");
    el.style.setProperty("--dx", (Math.random() * 80 - 40).toFixed(0) + "px");
    el.style.setProperty("--spin", (Math.random() < .5 ? -1 : 1) * (90 + Math.random() * 160) + "deg");
    el.classList.add("fall");
    setTimeout(function () {
      el.classList.remove("fall");
      el.classList.remove("regrow"); void el.offsetWidth; el.classList.add("regrow");
      el.querySelector(".leaf-in").style.animationDelay = "0ms";
    }, 2600);
  }

  /* ---------- leaves lean away from the cursor, eyes follow it ---------- */
  var mouse = null, rects = [], ticking = false;
  function measure() {
    rects = leaves.map(function (el) {
      var b = el.getBoundingClientRect();
      return { x: b.left + b.width / 2, y: b.top + b.height / 2, s: Math.sqrt(b.width * b.height) };
    });
  }
  window.addEventListener("resize", measure);
  window.addEventListener("scroll", measure, { passive: true });
  setTimeout(measure, 300);

  document.addEventListener("pointermove", function (e) {
    if (e.pointerType !== "mouse") return;
    mouse = { x: e.clientX, y: e.clientY };
    if (!ticking) { ticking = true; requestAnimationFrame(frame); }
  });
  document.addEventListener("pointerleave", function () { mouse = null; frame(); });

  function frame() {
    ticking = false;
    if (!rects.length) measure();
    leaves.forEach(function (el, i) {
      if (reduce || !mouse || el.classList.contains("on")) { el.style.translate = ""; return; }
      var r = rects[i], dx = r.x - mouse.x, dy = r.y - mouse.y, d = Math.hypot(dx, dy) || 1;
      var reach = 120 + r.s * 0.6;
      if (d > reach) { el.style.translate = ""; return; }
      var push = (1 - d / reach) * Math.min(16, 6 + r.s * 0.06);
      el.style.translate = (dx / d * push).toFixed(1) + "px " + (dy / d * push).toFixed(1) + "px";
    });
    eyes.forEach(function (el) {
      el.querySelectorAll(".leaf-eyes i").forEach(function (eye) {
        var b = eye.getBoundingClientRect(), pu = eye.firstChild;
        if (!mouse) { pu.style.translate = "-50% -50%"; return; }
        var dx = mouse.x - (b.left + b.width / 2), dy = mouse.y - (b.top + b.height / 2), d = Math.hypot(dx, dy) || 1;
        var m = b.width * 0.2 * Math.min(1, d / 60);
        pu.style.translate = "calc(-50% + " + (dx / d * m).toFixed(1) + "px) calc(-50% + " + (dy / d * m).toFixed(1) + "px)";
      });
    });
  }

  // blink now and then
  if (!reduce) setInterval(function () {
    eyes.forEach(function (el) {
      if (Math.random() < 0.18) {
        el.classList.add("blink");
        setTimeout(function () { el.classList.remove("blink"); }, 140);
      }
    });
  }, 900);
})();
