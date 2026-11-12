/* =========================================================
   Case-study pages (like fifi.html):
   - click any picture to see it big (← → keys, Esc to close)
   - "Next project" link
   ========================================================= */
(function () {
  var items = Array.prototype.slice.call(document.querySelectorAll("button.zoom"));
  var lb = document.getElementById("lightbox");
  var lbImg = document.getElementById("lbImg");
  var lbCap = document.getElementById("lbCaption");
  var lbCount = document.getElementById("lbCount");
  var prev = lb.querySelector(".lb-prev"), next = lb.querySelector(".lb-next"), close = lb.querySelector(".lb-close");
  var at = 0, back = null;

  function show(i) {
    at = (i + items.length) % items.length;
    var b = items[at], im = b.querySelector("img");
    lbImg.src = im.src;
    lbImg.alt = im.alt;
    lbCap.textContent = b.dataset.cap || im.alt;
    lbCount.textContent = (at + 1) + "/" + items.length;
  }
  function open(i, from) {
    back = from;
    lb.classList.add("open");
    document.body.style.overflow = "hidden";
    show(i);
    close.focus();
  }
  function shut() {
    lb.classList.remove("open");
    document.body.style.overflow = "";
    if (back) back.focus({ preventScroll: true });
  }

  items.forEach(function (b, i) { b.addEventListener("click", function () { open(i, b); }); });
  prev.addEventListener("click", function () { show(at - 1); });
  next.addEventListener("click", function () { show(at + 1); });
  close.addEventListener("click", shut);
  lb.addEventListener("click", function (e) { if (e.target === lb) shut(); });
  document.addEventListener("keydown", function (e) {
    if (!lb.classList.contains("open")) return;
    if (e.key === "Escape") shut();
    else if (e.key === "ArrowRight") show(at + 1);
    else if (e.key === "ArrowLeft") show(at - 1);
    else if (e.key === "Tab") {
      e.preventDefault();
      var f = [close, prev, next], k = f.indexOf(document.activeElement);
      f[(k + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
    }
  });

  // "Next project" goes to whichever project comes after this one in js/projects.js
  var link = document.getElementById("nextProject");
  if (link && window.PROJECTS) {
    var here = location.pathname.split("/").pop();
    var idx = PROJECTS.findIndex(function (p) { return p.page === here; });
    if (idx > -1) {
      var n = PROJECTS[(idx + 1) % PROJECTS.length];
      link.href = projectLink(n);
      link.textContent = "Next: " + n.title + " →";
    }
  }
})();
