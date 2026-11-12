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
