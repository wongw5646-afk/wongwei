/* =========================================================
   Skill pages (cad-renders.html, photoshop.html).
   The page's <body data-skill="..."> picks the skill from
   window.SKILLS in js/projects.js and fills in the gallery.
   The giant pink heading slides as you scroll, and pictures
   fade up into place. Click a picture to see it big.
   ========================================================= */
(function () {
  var id = document.body.getAttribute("data-skill");
  var s = (window.SKILLS || []).find(function (k) { return k.id === id; });
  if (!s) return;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.getElementById("skTitle").textContent = s.title;
  document.getElementById("skWord").textContent = s.title.toLowerCase();
  document.getElementById("skTag").textContent = s.tagline || "";
  var pics = s.images.filter(function (im) { return im.src; });
  document.getElementById("skCount").textContent = pics.length ? (pics.length < 10 ? "0" : "") + pics.length + " pieces" : "";

  var grid = document.getElementById("skGrid");
  if (!pics.length) {
    grid.outerHTML = '<p class="sk-empty">Work coming soon.</p>';
  } else {
    s.images.forEach(function (im) {
      if (im.label) {   // a small heading between groups, e.g. "From my projects"
        var h = document.createElement("h2");
        h.className = "sk-label";
        h.textContent = im.label;
        grid.appendChild(h);
        return;
      }
      var b = document.createElement("button");
      b.type = "button";
      b.className = "zoom sk-item" + (im.wide ? " wide" : "");
      b.dataset.cap = im.caption || "";
      b.innerHTML = '<img loading="lazy" alt=""><span class="sk-cap"></span>';
      b.querySelector("img").src = "images-web/" + im.src;
      b.querySelector("img").alt = im.caption || s.title;
      b.querySelector(".sk-cap").textContent = im.caption || "";
      if (im.hover) {   // a second picture that shows while the mouse is over the tile
        var h2 = document.createElement("img");
        h2.className = "sk-hover"; h2.alt = ""; h2.src = "images-web/" + im.hover; h2.loading = "eager";   // load early so the first hover is smooth
        b.classList.add("has-hover");
        b.insertBefore(h2, b.querySelector(".sk-cap"));
      }
      grid.appendChild(b);
    });
  }

  // pictures fade up into place
  if (!reduce && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    document.querySelectorAll(".sk-item").forEach(function (el) { el.classList.add("mono-rise"); io.observe(el); });
  }

  // the giant word slides as you scroll
  var word = document.getElementById("skWord"), ticking = false;
  function frame() {
    ticking = false;
    if (reduce) return;
    var t = Math.min(1, window.scrollY / (window.innerHeight * 1.2));
    var over = Math.max(0, word.scrollWidth - window.innerWidth * 0.96);
    word.style.transform = "translateX(" + (-(over + window.innerWidth * 0.1) * t).toFixed(1) + "px)";
  }
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }, { passive: true });
})();

/* fill the space around each picture with the colour of its own corner, so tiles look seamless */
document.querySelectorAll(".sk-item img").forEach(function (img) {
  function tint() {
    try {
      var c = document.createElement("canvas"); c.width = c.height = 1;
      var x = c.getContext("2d"); x.drawImage(img, 2, 2, 1, 1, 0, 0, 1, 1);
      var d = x.getImageData(0, 0, 1, 1).data;
      img.style.setProperty("--tile", "rgb(" + d[0] + "," + d[1] + "," + d[2] + ")");
    } catch (e) {}
  }
  if (img.complete && img.naturalWidth) tint(); else img.addEventListener("load", tint);
});
