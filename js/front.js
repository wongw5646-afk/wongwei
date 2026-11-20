/* =========================================================
   Home page
   1) Cover: product cut-outs float in a cluster over the big
      PORTFOLIO word, with thin outline boxes and a tilted ring.
      They drift gently and shift a little with the mouse.
   2) Contents: tall colour-tinted strips, one per project and
      skill, alternating up and down, with big sideways numbers.
      Hover a strip to see the photo in full colour.
   To change which pictures float on the cover, edit COLLAGE.
   ========================================================= */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 1) cover collage ---------- */
  // src, then position (centre, % of the collage box), height (% of box), tilt, depth (how much it moves with the mouse)
  var COLLAGE = [
    { src: "images-web/vessel/vs-hero-lit.webp",    x: 39, y: 46, h: 88, r: -8,  d: 14, z: 2 },
    { src: "images-web/dugong/dg-final-2.webp",     x: 58, y: 64, h: 42, r: 10,  d: 26, z: 4 },
    { src: "images-web/whiddi/wh-cut-tight-screenshot-2026-10-05-at-12-59-49-pm.webp", x: 70, y: 36, h: 66, r: 14, d: 20, z: 3 },
    { src: "images-web/tooth-fairy/ff-hero-render.webp", x: 25, y: 70, h: 40, r: -12, d: 30, z: 5 },
    { src: "images-web/dugong/dg-obo-1.webp",       x: 52, y: 22, h: 24, r: -18, d: 34, z: 1 }
  ];
  var box = document.getElementById("pfCollage");
  if (box) {
    var NS = "http://www.w3.org/2000/svg";
    // thin outline squares, like the reference
    [[18, 14, 13, 18], [61, 30, 9, 10], [26, 58, 7, 9], [55, 72, 12, 14], [47, 56, 9, 11]].forEach(function (s) {
      var q = document.createElement("span");
      q.className = "pf-box";
      q.style.cssText = "left:" + s[0] + "%;top:" + s[1] + "%;width:" + s[2] + "%;height:" + s[3] + "%";
      box.appendChild(q);
    });
    // a tilted ring (an orbit) behind and in front of the objects
    var ring = document.createElementNS(NS, "svg");
    ring.setAttribute("class", "pf-ring");
    ring.setAttribute("viewBox", "0 0 100 60");
    ring.setAttribute("preserveAspectRatio", "none");
    ring.innerHTML = '<ellipse cx="50" cy="30" rx="46" ry="17" transform="rotate(-12 50 30)"/><ellipse class="r2" cx="50" cy="30" rx="40" ry="13.5" transform="rotate(-12 50 30)"/>';   // two Saturn-style rings
    box.appendChild(ring);
    var items = COLLAGE.map(function (c, i) {
      var im = document.createElement("img");
      im.className = "pf-obj";
      im.src = c.src; im.alt = "";
      im.style.cssText = "left:" + c.x + "%;top:" + c.y + "%;height:" + c.h + "%;z-index:" + c.z + ";--r:" + c.r + "deg;--delay:" + (i * -1.7) + "s";
      box.appendChild(im);
      return { el: im, d: c.d };
    });
    if (!reduce) {
      var mx = 0, my = 0, tick = false;
      window.addEventListener("pointermove", function (e) {
        mx = e.clientX / window.innerWidth - .5; my = e.clientY / window.innerHeight - .5;
        if (!tick) { tick = true; requestAnimationFrame(function () {
          tick = false;
          items.forEach(function (it) { it.el.style.translate = (mx * it.d).toFixed(1) + "px " + (my * it.d).toFixed(1) + "px"; });
        }); }
      });
    }
  }

  /* ---------- 2) contents strips ---------- */
  var row = document.getElementById("ctRow");
  if (row && window.PROJECTS) {
    var TINTS = ["#C792E8", "#F59A9A", "#FFD95A", "#86DDB9", "#93A9F0", "#F5B08A"];
    var STRIP = {   // which picture each strip shows (tall crop)
      whiddi: ["images-web/whiddi/screenshot-2026-08-24-at-11-26-13-pm.jpg", "88% 50%"],
      "tooth-fairy": ["images-web/tooth-fairy/toothyyyy-3.jpg", "45% 50%"],
      vessel: ["images-web/vessel/vs-final-2.jpg", "50% 50%"],
      dugong: ["images-web/dugong/leaf-dugong.jpg", "50% 50%", "zoom-out"]   // whole puzzle, zoomed out
    };
    var list = PROJECTS.slice(0, 4).map(function (p) {
      var s = STRIP[p.id] || [projectImg(p, p.thumb), p.thumbFocus || "50% 50%"];
      return { title: p.title, href: projectLink(p), img: s[0], pos: s[1], tag: p.tagline, fit: s[2] };
    });
    if (false) (window.SKILLS || []).forEach(function (k) {   // skills (CAD Renders, Photoshop) left out of the contents on purpose
      list.push({ title: k.title, href: k.page, img: "images-web/" + (k.thumb || (k.images[0] || {}).src || ""), pos: "50% 50%", tag: k.tagline });
    });
    list.forEach(function (it, i) {
      var up = i % 2 === 0;
      var a = document.createElement("a");
      a.className = "ct-item " + (up ? "up" : "down");
      a.href = it.href;
      a.style.setProperty("--c", TINTS[i % TINTS.length]);
      a.setAttribute("aria-label", (i + 1 < 10 ? "0" : "") + (i + 1) + " " + it.title + (it.tag ? ". " + it.tag : ""));
      var label = '<span class="ct-label"><span class="ct-name"></span><span class="ct-bar"></span><span class="ct-num">' + (i + 1 < 10 ? "0" : "") + (i + 1) + "</span></span>";
      var strip = '<span class="ct-strip"><img alt="" loading="lazy"></span>';
      a.innerHTML = up ? strip + label : label + strip;
      a.querySelector(".ct-name").textContent = it.title;
      var im = a.querySelector("img");
      im.src = it.img; im.style.objectPosition = it.pos;
      if (it.fit === "zoom-out") a.classList.add("ct-zoomout");
      row.appendChild(a);
    });
  }
})();
