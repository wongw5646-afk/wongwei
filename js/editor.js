/* =========================================================
   EDIT MODE: arrange pictures yourself, a bit like InDesign.

   Open a page with ?edit on the end of the address:
       fifi.html?edit      about.html?edit      project.html?p=whiddi&edit

   Every picture has a FRAME (the box) and the PICTURE inside it.

   FRAME (click a picture once; orange outline)
     - drag it to move it
     - drag a corner to resize the box (crops or shows more of the picture)
     - hold Shift while dragging a corner to scale the box AND picture together
     - arrow keys nudge it (Shift = bigger steps), + / - scale it

   PICTURE INSIDE (double-click a picture; white outline)
     - drag to slide the picture around inside its frame
     - drag a corner, or scroll, to zoom the picture in or out
     - arrow keys slide it, + / - zoom it
     - double-click again or press Esc to go back to the frame

   Then click "Save layout": a layout.js file downloads. Put it in the js
   folder (replacing the old one) and upload it. Edits only apply on wide
   screens (900px and up); phones keep the simple stacked layout.
   ========================================================= */
(function () {
  var MIN_W = 900;
  var SEL = ".case .zoom, .case-panel, .ab-photo, .hero-frame, .g-btn";

  var page = location.pathname.split("/").pop() || "index.html";
  var params = new URLSearchParams(location.search);
  if (params.get("p")) page += "?p=" + params.get("p");
  var editing = params.has("edit");

  var fileLayout = (window.SITE_LAYOUT && window.SITE_LAYOUT[page]) || {};
  var draft = null;
  try { draft = JSON.parse(localStorage.getItem("layout:" + page) || "null"); } catch (e) {}
  var layout = JSON.parse(JSON.stringify(editing && draft ? draft : fileLayout));

  var handles = [];          // built in edit mode
  var selected = null;       // the selected item {el, key, img}
  var contentMode = false;   // false = frame, true = picture inside

  /* ---------- find the pictures and give each a stable name ---------- */
  function items() {
    var seen = {};
    return Array.prototype.slice.call(document.querySelectorAll(SEL)).filter(function (el) {
      // a white panel moves as one piece, together with the pictures inside it
      return !el.closest(".lightbox") && !(el.parentElement && el.parentElement.closest(".case-panel"));
    }).map(function (el) {
      var imgs = el.tagName === "IMG" ? [el] : el.querySelectorAll("img");
      var first = imgs[0];
      var base = first && first.getAttribute("src") ? first.getAttribute("src").split("/").pop() : (el.className || "box").split(" ")[0];
      seen[base] = (seen[base] || 0) + 1;
      // only single pictures (not white panels) can have the picture-inside adjusted
      var img = imgs.length === 1 && !el.classList.contains("case-panel") ? first : null;
      return { el: el, key: base + "#" + seen[base], img: img };
    });
  }
  function itemFor(el) {
    var list = items();
    for (var i = 0; i < list.length; i++) if (list[i].el === el) return list[i];
    return null;
  }

  function clearStyle(it) {
    var s = it.el.style;
    s.transform = s.zIndex = s.transformOrigin = s.width = s.height = s.maxWidth = s.overflow = s.aspectRatio = "";
    if (it.img) {
      var i = it.img.style;
      i.width = i.height = i.objectFit = i.transform = i.transformOrigin = i.aspectRatio = i.maxWidth = "";
    }
  }

  function style(it) {
    var v = layout[it.key];
    if (!v || innerWidth < MIN_W) { clearStyle(it); return; }
    var el = it.el, vw = innerWidth / 100, s = v.s || 1;
    if (getComputedStyle(el).position === "static") el.style.position = "relative";
    el.style.transformOrigin = "0 0";
    el.style.transform = "translate(" + ((v.x || 0) * vw).toFixed(1) + "px," + ((v.y || 0) * vw).toFixed(1) + "px) scale(" + s + ")";
    el.style.zIndex = v.z || 5;
    if (v.w) {
      el.style.width = (v.w * vw).toFixed(1) + "px";
      el.style.height = (v.h * vw).toFixed(1) + "px";
      el.style.maxWidth = "none";
      el.style.aspectRatio = "auto";
      el.style.overflow = "hidden";
    } else {
      el.style.width = el.style.height = el.style.maxWidth = el.style.aspectRatio = el.style.overflow = "";
    }
    if (it.img && (v.w || v.cz || v.cx || v.cy)) {
      var im = it.img.style;
      im.width = "100%"; im.height = "100%"; im.maxWidth = "none";
      im.objectFit = "cover"; im.aspectRatio = "auto";
      im.transformOrigin = "50% 50%";
      im.transform = "translate(" + (v.cx || 0) + "%," + (v.cy || 0) + "%) scale(" + (v.cz || 1) + ")";
    } else if (it.img) {
      var j = it.img.style;
      j.width = j.height = j.maxWidth = j.objectFit = j.aspectRatio = j.transform = j.transformOrigin = "";
    }
  }

  function apply() {
    items().forEach(function (it) {
      it.el.dataset.editKey = it.key;
      style(it);
    });
    if (editing) placeHandles();
  }

  // pages like project.html redraw their galleries: re-apply after changes
  var mo = new MutationObserver(function () { clearTimeout(mo.t); mo.t = setTimeout(apply, 30); });
  mo.observe(document.body, { childList: true, subtree: true });
  window.addEventListener("resize", function () { clearTimeout(apply.t); apply.t = setTimeout(apply, 80); });
  window.addEventListener("load", apply);

  if (!editing) { apply(); return; }

  /* ================== edit mode ================== */
  document.body.classList.add("editing");

  ["nw", "ne", "sw", "se"].forEach(function (c) {
    var h = document.createElement("div");
    h.className = "edit-handle";
    h.dataset.c = c;
    document.body.appendChild(h);
    handles.push(h);
  });

  var bar = document.createElement("div");
  bar.className = "edit-bar";
  bar.innerHTML =
    '<span class="edit-msg"></span>' +
    '<button type="button" data-act="inside">Adjust picture inside</button>' +
    '<button type="button" data-act="fit">Fit picture</button>' +
    '<button type="button" data-act="front">Bring to front</button>' +
    '<button type="button" data-act="reset">Reset picture</button>' +
    '<button type="button" data-act="resetall">Reset all</button>' +
    '<button type="button" data-act="save" class="edit-save">Save layout</button>' +
    '<a href="' + location.pathname + (params.get("p") ? "?p=" + params.get("p") : "") + '">Done</a>';
  document.body.appendChild(bar);
  var msg = bar.querySelector(".edit-msg");
  var insideBtn = bar.querySelector('[data-act="inside"]');

  function say(t) { msg.textContent = t; }
  function tooNarrow() { return innerWidth < MIN_W; }
  function hint() {
    if (tooNarrow()) return say("Make the window wider (at least 900px) to edit the desktop layout.");
    if (!selected) return say("Click a picture to select its frame. Double-click to adjust the picture inside.");
    if (contentMode) return say("Picture inside: drag to slide it, drag a corner or scroll to zoom. Esc = back to frame.");
    say("Frame: drag to move, drag a corner to resize the box (Shift = scale everything).");
  }

  function val(it) {
    if (!layout[it.key]) layout[it.key] = { x: 0, y: 0, s: 1 };
    var v = layout[it.key];
    if (v.s == null) v.s = 1;
    return v;
  }
  // give the frame a fixed size the first time it is cropped or its picture is adjusted
  function lockSize(it) {
    var v = val(it);
    if (v.w) return v;
    var r = it.el.getBoundingClientRect(), vw = innerWidth / 100;
    v.w = +(r.width / v.s / vw).toFixed(2);
    v.h = +(r.height / v.s / vw).toFixed(2);
    return v;
  }
  function keepDraft() {
    try { localStorage.setItem("layout:" + page, JSON.stringify(layout)); } catch (e) {}
  }

  function setMode(inside) {
    contentMode = !!(inside && selected && selected.img);
    document.body.classList.toggle("edit-inside", contentMode);
    insideBtn.textContent = contentMode ? "Back to frame" : "Adjust picture inside";
    placeHandles(); hint();
  }
  function select(it) {
    if (selected) selected.el.classList.remove("edit-selected");
    selected = it;
    if (it) it.el.classList.add("edit-selected");
    setMode(false);
  }
  function placeHandles() {
    if (!handles.length) return;
    var show = selected && selected.el.isConnected && !tooNarrow();
    var r = show ? selected.el.getBoundingClientRect() : null;
    handles.forEach(function (h) {
      if (!show) { h.style.display = "none"; return; }
      var c = h.dataset.c;
      h.style.display = "block";
      h.classList.toggle("inside", contentMode);
      h.style.left = ((c.indexOf("w") > -1 ? r.left : r.right) - 11) + "px";
      h.style.top = ((c.indexOf("n") > -1 ? r.top : r.bottom) - 11) + "px";
    });
  }
  window.addEventListener("scroll", placeHandles, { passive: true });

  // while editing, clicking a picture must not open the big viewer
  document.addEventListener("click", function (e) {
    if (e.target.closest(".edit-bar")) return;
    if (e.target.closest("[data-edit-key]")) { e.preventDefault(); e.stopPropagation(); }
  }, true);

  document.addEventListener("dblclick", function (e) {
    var el = e.target.closest("[data-edit-key]");
    if (!el || tooNarrow()) return;
    e.preventDefault();
    var it = itemFor(el);
    if (!selected || selected.el !== el) select(it);
    if (!it.img) return say("This is a panel with several pictures; you can move and resize the panel itself.");
    setMode(!contentMode);
  }, true);

  var drag = null;
  document.addEventListener("pointerdown", function (e) {
    if (tooNarrow() || e.button !== 0) return;
    var vw = innerWidth / 100;
    if (e.target.classList.contains("edit-handle")) {
      var c = e.target.dataset.c;
      var mode = contentMode ? "zoom" : (e.shiftKey ? "scale" : "frame");
      var v = mode === "frame" || mode === "zoom" ? lockSize(selected) : val(selected);
      drag = { mode: mode, c: c, it: selected, sx: e.clientX, sy: e.clientY, r: selected.el.getBoundingClientRect(), v0: Object.assign({}, v), vw: vw };
    } else {
      var el = e.target.closest("[data-edit-key]");
      if (!el) { if (!e.target.closest(".edit-bar")) select(null); return; }
      if (!selected || selected.el !== el) select(itemFor(el));
      var pan = contentMode;
      if (pan) lockSize(selected);
      drag = { mode: pan ? "pan" : "move", it: selected, sx: e.clientX, sy: e.clientY, r: selected.el.getBoundingClientRect(), v0: Object.assign({}, val(selected)), vw: vw };
    }
    e.preventDefault();
    document.body.classList.add("edit-dragging");
  }, true);

  document.addEventListener("pointermove", function (e) {
    if (!drag) return;
    var it = drag.it, v = val(it), v0 = drag.v0, vw = drag.vw, r = drag.r;
    var dx = e.clientX - drag.sx, dy = e.clientY - drag.sy;
    var c = drag.c || "", west = c.indexOf("w") > -1, north = c.indexOf("n") > -1;
    var s = v0.s || 1;

    if (drag.mode === "move") {
      v.x = +((v0.x || 0) + dx / vw).toFixed(2);
      v.y = +((v0.y || 0) + dy / vw).toFixed(2);
    } else if (drag.mode === "frame") {
      // resize the box only; the picture inside stays put and gets cropped / revealed
      var du = dx / (vw * s), dv = dy / (vw * s);
      var w = Math.max(2, west ? v0.w - du : v0.w + du);
      var h = Math.max(2, north ? v0.h - dv : v0.h + dv);
      if (west) v.x = +((v0.x || 0) + (v0.w - w) * s).toFixed(2);
      if (north) v.y = +((v0.y || 0) + (v0.h - h) * s).toFixed(2);
      v.w = +w.toFixed(2); v.h = +h.toFixed(2);
    } else if (drag.mode === "scale") {
      // Shift: scale frame and picture together, keeping the opposite corner still
      var nw = Math.max(20, r.width + (west ? -dx : dx));
      v.s = +Math.min(4, Math.max(0.2, s * nw / r.width)).toFixed(3);
      var k = v.s / s;
      if (west) v.x = +((v0.x || 0) + (r.width - r.width * k) / vw).toFixed(2);
      if (north) v.y = +((v0.y || 0) + (r.height - r.height * k) / vw).toFixed(2);
    } else if (drag.mode === "pan") {
      v.cx = +((v0.cx || 0) + dx / r.width * 100).toFixed(2);
      v.cy = +((v0.cy || 0) + dy / r.height * 100).toFixed(2);
    } else if (drag.mode === "zoom") {
      var out = west ? -dx : dx;
      v.cz = +Math.min(8, Math.max(0.2, (v0.cz || 1) * (r.width + out * 2) / r.width)).toFixed(3);
    }
    style(it);
    placeHandles();
  });

  document.addEventListener("pointerup", function () {
    if (!drag) return;
    drag = null;
    document.body.classList.remove("edit-dragging");
    keepDraft();
    say("Not saved to the site yet. Click \"Save layout\" when you're happy.");
  });

  // scroll to zoom the picture inside its frame
  document.addEventListener("wheel", function (e) {
    if (!contentMode || !selected || !e.target.closest(".edit-selected")) return;
    e.preventDefault();
    var v = lockSize(selected);
    v.cz = +Math.min(8, Math.max(0.2, (v.cz || 1) * Math.exp(-e.deltaY * 0.0015))).toFixed(3);
    style(selected); keepDraft();
  }, { passive: false });

  document.addEventListener("keydown", function (e) {
    if (!selected || tooNarrow()) return;
    if (e.key === "Escape") { if (contentMode) setMode(false); else select(null); return; }
    var step = e.shiftKey ? 1 : 0.1, v;
    if (contentMode) {
      v = lockSize(selected);
      var pstep = e.shiftKey ? 5 : 1;
      if (e.key === "ArrowLeft") v.cx = (v.cx || 0) - pstep;
      else if (e.key === "ArrowRight") v.cx = (v.cx || 0) + pstep;
      else if (e.key === "ArrowUp") v.cy = (v.cy || 0) - pstep;
      else if (e.key === "ArrowDown") v.cy = (v.cy || 0) + pstep;
      else if (e.key === "+" || e.key === "=") v.cz = Math.min(8, (v.cz || 1) * 1.05);
      else if (e.key === "-" || e.key === "_") v.cz = Math.max(0.2, (v.cz || 1) / 1.05);
      else return;
    } else {
      v = val(selected);
      if (e.key === "ArrowLeft") v.x -= step;
      else if (e.key === "ArrowRight") v.x += step;
      else if (e.key === "ArrowUp") v.y -= step;
      else if (e.key === "ArrowDown") v.y += step;
      else if (e.key === "+" || e.key === "=") v.s = Math.min(4, v.s * 1.03);
      else if (e.key === "-" || e.key === "_") v.s = Math.max(0.2, v.s / 1.03);
      else return;
    }
    e.preventDefault();
    ["x", "y", "cx", "cy"].forEach(function (k) { if (v[k] != null) v[k] = +(+v[k]).toFixed(2); });
    ["s", "cz"].forEach(function (k) { if (v[k] != null) v[k] = +(+v[k]).toFixed(3); });
    style(selected); placeHandles(); keepDraft();
  });

  bar.addEventListener("click", function (e) {
    var act = e.target.dataset && e.target.dataset.act;
    if (!act) return;
    if (act === "save") return save();
    if (act === "resetall") {
      if (!confirm("Put every picture on this page back where it started?")) return;
      layout = {}; setMode(false); apply(); keepDraft(); return;
    }
    if (!selected) return say("Click a picture first.");
    var v = val(selected);
    if (act === "inside") {
      if (!selected.img) return say("This is a panel with several pictures; you can move and resize the panel itself.");
      setMode(!contentMode);
    } else if (act === "fit") {
      delete v.cx; delete v.cy; delete v.cz;
      say("Picture fitted back into its frame.");
    } else if (act === "front") {
      var top = Object.keys(layout).reduce(function (m, k) { return Math.max(m, layout[k].z || 5); }, 5);
      v.z = top + 1;
    } else if (act === "reset") {
      delete layout[selected.key];
      clearStyle(selected);
      setMode(false);
    }
    style(selected); placeHandles(); keepDraft();
  });

  // Save: write every page's layout into one layout.js file and download it
  function save() {
    var all = JSON.parse(JSON.stringify(window.SITE_LAYOUT || {}));
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (k.indexOf("layout:") === 0) all[k.slice(7)] = JSON.parse(localStorage.getItem(k));
      }
    } catch (e) {}
    all[page] = layout;
    Object.keys(all).forEach(function (p) { if (!Object.keys(all[p]).length) delete all[p]; });
    var text =
      "/* Picture positions and sizes, made in edit mode (add ?edit to a page address).\n" +
      "   x, y = how far the frame moved; w, h = frame size; s = overall scale;\n" +
      "   cx, cy, cz = how the picture is slid and zoomed inside its frame.\n" +
      "   x, y, w, h are in % of the window width. */\n" +
      "window.SITE_LAYOUT = " + JSON.stringify(all, null, 2) + ";\n";
    window.__layoutText = text;   // lets Claude read it straight from the browser pane
    var a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([text], { type: "text/javascript" }));
    a.download = "layout.js";
    document.body.appendChild(a); a.click(); a.remove();
    say("Saved! layout.js went to your Downloads. Put it in the js folder (or ask Claude to), then upload.");
  }

  apply();
  hint();
})();
