/* =========================================================
   "Projects" button in the top bar: hover it (or tap it on a
   phone) and a little menu drops down with every project from
   js/projects.js. Clicking "Projects" itself still opens the
   projects page.
   ========================================================= */
(function () {
  if (!window.PROJECTS) return;
  document.querySelectorAll(".topbar .nav").forEach(function (nav) {
    var link = Array.prototype.find.call(nav.querySelectorAll("a"), function (a) {
      return /projects\.html$/.test(a.getAttribute("href") || "");
    });
    if (!link) return;

    var wrap = document.createElement("div");
    wrap.className = "nav-drop";
    link.parentNode.insertBefore(wrap, link);
    wrap.appendChild(link);
    link.setAttribute("aria-haspopup", "true");
    link.setAttribute("aria-expanded", "false");
    link.insertAdjacentHTML("beforeend", '<span class="nav-caret" aria-hidden="true"></span>');

    var menu = document.createElement("div");
    menu.className = "nav-menu";
    menu.setAttribute("role", "menu");
    PROJECTS.forEach(function (p, i) {
      var a = document.createElement("a");
      a.href = projectLink(p);
      a.setAttribute("role", "menuitem");
      a.style.setProperty("--pc", p.color || "var(--accent)");
      var img = projectImg(p, p.thumb || p.hero);
      a.innerHTML =
        '<span class="nm-thumb"><img src="' + img + '" alt="" loading="lazy" style="object-position:' + (p.thumbFocus || "50% 50%") + '"></span>' +
        '<span class="nm-text"><span class="nm-num">0' + (i + 1) + '</span><span class="nm-title"></span><span class="nm-tag"></span></span>';
      a.querySelector(".nm-title").textContent = p.title;
      a.querySelector(".nm-tag").textContent = p.tagline || "";
      menu.appendChild(a);
    });
    // extra skill pages (CAD Renders, Photoshop...) from window.SKILLS in js/projects.js
    if (window.SKILLS && SKILLS.length) {
      var lab = document.createElement("span");
      lab.className = "nm-label";
      lab.textContent = "Skills";
      menu.appendChild(lab);
      SKILLS.forEach(function (s) {
        var a = document.createElement("a");
        a.href = s.page;
        a.setAttribute("role", "menuitem");
        a.style.setProperty("--pc", "var(--accent)");
        var thumb = s.thumb
          ? '<span class="nm-thumb"><img src="images-web/' + s.thumb + '" alt="" loading="lazy"></span>'
          : '<span class="nm-thumb nm-initials">' + (s.initials || s.title.slice(0, 2)) + '</span>';
        a.innerHTML = thumb + '<span class="nm-text"><span class="nm-title"></span><span class="nm-tag"></span></span>';
        a.querySelector(".nm-title").textContent = s.title;
        a.querySelector(".nm-tag").textContent = s.tagline || "";
        menu.appendChild(a);
      });
    }
    wrap.appendChild(menu);

    function open() { wrap.classList.add("open"); link.setAttribute("aria-expanded", "true"); }
    function close() { wrap.classList.remove("open"); link.setAttribute("aria-expanded", "false"); }
    var t;
    wrap.addEventListener("pointerenter", function (e) { if (e.pointerType === "mouse") { clearTimeout(t); open(); } });
    wrap.addEventListener("pointerleave", function (e) { if (e.pointerType === "mouse") t = setTimeout(close, 180); });
    wrap.addEventListener("focusin", open);
    wrap.addEventListener("focusout", function () { setTimeout(function () { if (!wrap.contains(document.activeElement)) close(); }, 0); });
    // phones: first tap on "Projects" opens the menu, a second tap goes to the projects page
    var lastPointer = "";
    link.addEventListener("pointerdown", function (e) { lastPointer = e.pointerType; });
    link.addEventListener("click", function (e) {
      if (lastPointer && lastPointer !== "mouse" && !wrap.classList.contains("open")) { e.preventDefault(); open(); }
    });
    document.addEventListener("click", function (e) { if (!wrap.contains(e.target)) close(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") { close(); } });
  });
})();

/* "paper white" filter: turns the light grey photo background of
   product shots into the same white as the square they sit on. */
(function () {
  if (document.getElementById("pw")) return;
  var d = document.createElement("div");
  d.setAttribute("aria-hidden", "true");
  d.style.cssText = "position:absolute;width:0;height:0;overflow:hidden";
  d.innerHTML = '<svg width="0" height="0"><filter id="pw" color-interpolation-filters="sRGB"><feComponentTransfer>' +
    ["R", "G", "B"].map(function (c) { return '<feFunc' + c + ' type="table" tableValues="0.0 0.025 0.05 0.075 0.1 0.125 0.15 0.175 0.2 0.225 0.25 0.275 0.3 0.325 0.35 0.375 0.4 0.425 0.45 0.475 0.5 0.525 0.55 0.575 0.6 0.625 0.65 0.675 0.7 0.725 0.75 0.775 0.8 0.825 0.85 0.875 0.9 1 1 1 1"/>'; }).join("") +
    '</feComponentTransfer></filter></svg>';
  document.body.appendChild(d);
})();
