(function () {
  "use strict";
  var D = document, root = D.documentElement;
  var I18N = window.I18N, PROJECTS = window.PROJECTS, TECH = window.TECH;

  /* ---------- tiny helpers ---------- */
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) {} return null; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function md(s) { return esc(s).replace(/`([^`]+)`/g, '<code class="mono ltr">$1</code>'); }
  var lang = store("rk-lang") === "he" ? "he" : "en";
  var activeTech = null;
  function T(o) { return (o && (o[lang] != null ? o[lang] : o.en)) || ""; }
  function L(o) { return (o && (o[lang] || o.en)) || []; }
  function tt(k) { return (I18N[lang] && I18N[lang][k]) || I18N.en[k] || ""; }
  var ICON_ARROW = '<svg class="arrow" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  var ICON_GH = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.87-1.37-3.87-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.78 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.8 1.19 1.83 1.19 3.09 0 4.42-2.69 5.39-5.25 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5z"/></svg>';
  var ICON_EXT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>';

  function byId(id) { return PROJECTS.filter(function (p) { return p.id === id; })[0]; }
  function techCount(id) { return PROJECTS.filter(function (p) { return p.stack && p.stack.indexOf(id) > -1; }).length; }
  function techLabel(id) { var l = id; TECH.forEach(function (g) { g.items.forEach(function (i) { if (i.id === id) l = i.label; }); }); return l; }
  function chipsHtml(tags) { return tags.map(function (t) { return '<span class="chip">' + esc(t) + "</span>"; }).join(""); }

  /* ---------- static texts ---------- */
  function applyStatic() {
    root.lang = lang; root.dir = lang === "he" ? "rtl" : "ltr";
    D.title = tt("meta.title");
    D.querySelectorAll("[data-i18n]").forEach(function (el) { el.textContent = tt(el.getAttribute("data-i18n")); });
    D.querySelectorAll("[data-i18n-html]").forEach(function (el) { el.innerHTML = tt(el.getAttribute("data-i18n-html")); });
    D.querySelectorAll("#langBtn [data-l]").forEach(function (s) { s.classList.toggle("cur", s.getAttribute("data-l") === lang); });
    var x = D.getElementById("dlgX"); if (x) x.setAttribute("aria-label", tt("dlg.close"));
    var n = D.getElementById("statProj"); if (n) n.textContent = PROJECTS.length;
  }

  /* ---------- tech stack ---------- */
  function icon(id) {
    var d = window.ICONS && window.ICONS[id]; if (!d) return "";
    return '<svg class="ti' + (d.s ? " s" : "") + '" viewBox="0 0 24 24" aria-hidden="true"><path d="' + (d.f || d.s) + '"/></svg>';
  }
  function renderTech() {
    D.getElementById("techgrid").innerHTML = TECH.map(function (g) {
      return '<div class="tgroup"><h3>' + esc(tt(g.g)) + '</h3><div class="tchips">' + g.items.map(function (i) {
        var n = techCount(i.id);
        var ic = icon(i.id);
        if (!n) return '<span class="tech off">' + ic + esc(i.label) + "</span>";
        return '<button type="button" class="tech" data-tech="' + i.id + '" aria-pressed="' + (activeTech === i.id) + '"' +
          ' title="' + esc(n === 1 ? tt("stack.n1") : n + " " + tt("stack.nn")) + '">' + ic + '<span>' + esc(i.label) + '</span><i class="n">' + n + "</i></button>";
      }).join("") + "</div></div>";
    }).join("");
  }

  /* ---------- filter (driven by the tech stack) ---------- */
  function applyFilter() {
    var bar = D.getElementById("filterbar");
    D.querySelectorAll(".tech[data-tech]").forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-tech") === activeTech); });
    D.querySelectorAll("[data-pid]").forEach(function (el) {
      var p = byId(el.getAttribute("data-pid"));
      var hit = !activeTech || (p.stack && p.stack.indexOf(activeTech) > -1);
      el.classList.toggle("dim", !hit);
      if (el.classList.contains("row")) {
        if (activeTech) { el.classList.toggle("open", hit); }
        var h = el.querySelector(".row-h"); if (h) h.setAttribute("aria-expanded", el.classList.contains("open"));
      }
    });
    if (activeTech) {
      bar.hidden = false;
      bar.innerHTML = '<span>' + esc(tt("filter.label")) + ' <b class="mono ltr">' + esc(techLabel(activeTech)) + '</b></span><button type="button" class="btn sm" data-clear>' + esc(tt("filter.clear")) + " &times;</button>";
    } else { bar.hidden = true; bar.innerHTML = ""; }
  }

  /* ---------- featured cards ---------- */
  function mediaTag(c) {
    if (c.type === "video") {
      return '<video muted loop playsinline preload="none" poster="' + c.poster + '" data-lazyvid style="object-position:' + (c.pos || "50% 0") + '"><source src="' + c.src + '.webm" type="video/webm"><source src="' + c.src + '.mp4" type="video/mp4"></video>';
    }
    return '<img src="' + c.src + '" alt="" decoding="async" style="object-position:' + (c.pos || "50% 50%") + '">';
  }
  function linkBtns(p, small) {
    var out = "", s = small ? " sm" : "";
    if (p.links && p.links.demo) out += '<a class="btn primary' + s + '" href="' + p.links.demo + '" target="_blank" rel="noopener">' + esc(tt("feat.demo")) + ICON_EXT + "</a>";
    if (p.links && p.links.repo) out += '<a class="btn' + s + '" href="' + p.links.repo + '" target="_blank" rel="noopener">' + ICON_GH + "<span>" + esc(tt("feat.repo")) + "</span></a>";
    return out;
  }
  function renderFeatured() {
    var list = PROJECTS.filter(function (p) { return p.featured; });
    D.getElementById("feat").innerHTML = list.map(function (p, i) {
      return '<article class="fcard rv" data-pid="' + p.id + '">' +
        '<button class="stage" type="button" data-open="' + p.id + '" aria-label="' + esc(tt("feat.peek") + ": " + T(p.name)) + '">' +
        mediaTag(p.cover) + '<span class="tag">' + esc(p.year) + '</span><span class="peek">' + esc(tt("feat.peek")) + " &rarr;</span></button>" +
        '<div class="fbody"><span class="fnum">0' + (i + 1) + " / FEATURED</span>" +
        "<h3>" + esc(T(p.name)) + (p.sub ? '<span class="sub">' + esc(T(p.sub)) + "</span>" : "") + "</h3>" +
        '<p class="one">' + esc(T(p.one)) + "</p>" +
        '<div class="facts">' + p.facts.map(function (f) { return "<div><b>" + esc(f.v) + "</b><span>" + esc(T(f.l)) + "</span></div>"; }).join("") + "</div>" +
        '<div class="factions"><button class="btn sm" type="button" data-open="' + p.id + '">' + esc(tt("feat.open")) + ICON_ARROW + "</button>" + linkBtns(p, true) + "</div></div></article>";
    }).join("");
  }

  /* ---------- other projects (accordion) ---------- */
  function renderRows() {
    var list = PROJECTS.filter(function (p) { return !p.featured; });
    var openIds = [].map.call(D.querySelectorAll(".row.open"), function (r) { return r.getAttribute("data-pid"); });
    D.getElementById("rows").innerHTML = list.map(function (p, i) {
      var open = openIds.indexOf(p.id) > -1;
      var hasLinks = p.links && (p.links.repo || p.links.demo);
      return '<div class="row' + (open ? " open" : "") + '" data-pid="' + p.id + '">' +
        '<button class="row-h" type="button" aria-expanded="' + open + '" aria-controls="rb-' + p.id + '">' +
        '<span class="i">' + String(i + 3).padStart(2, "0") + "</span>" +
        '<span class="t">' + esc(T(p.name)) + (p.kind ? '<small class="kind">' + esc(tt("kind." + p.kind)) + "</small>" : "") + "</span>" +
        '<span class="d">' + esc(T(p.one)) + "</span>" +
        '<span class="chips">' + chipsHtml(p.tags.slice(0, 3)) + "</span>" +
        '<span class="plus" aria-hidden="true"></span></button>' +
        '<div class="row-b" id="rb-' + p.id + '" role="region"><div><div class="row-in"><ul>' +
        L(p.bullets).map(function (b) { return "<li>" + esc(b) + "</li>"; }).join("") + "</ul>" +
        '<div class="chips">' + chipsHtml(p.tags) + "</div>" +
        ((p.media || hasLinks) ? '<div class="dlg-links">' +
          (p.media ? '<button class="btn primary sm" type="button" data-open="' + p.id + '">' + esc(tt("feat.open")) + ICON_ARROW + "</button>" : "") +
          linkBtns(p, true) + "</div>" : "") +
        "</div></div></div></div>";
    }).join("");
  }

  /* ---------- case study dialog ---------- */
  var dlg = D.getElementById("dlg"), dlgBody = D.getElementById("dlgBody"), lastFocus = null, currentId = null;
  function ul(items) { return "<ul>" + items.map(function (x) { return "<li>" + md(x) + "</li>"; }).join("") + "</ul>"; }
  function blk(titleKey, inner, cls) { return '<div class="blk' + (cls ? " " + cls : "") + '"><h3>' + esc(tt(titleKey)) + "</h3>" + inner + "</div>"; }
  function mainMedia(m) {
    if (m.type === "video") return '<video src="' + m.src + '.mp4" poster="' + m.poster + '" controls muted loop playsinline autoplay></video>';
    return '<img src="' + m.src + '" alt="' + esc(m.cap || "") + '">';
  }
  function openCase(id) {
    var p = byId(id); if (!p || !p.media) return;
    currentId = id; lastFocus = D.activeElement;
    D.getElementById("dlgPath").textContent = "~/projects/" + p.id;
    var cols1 = [], cols2 = [];
    if (p.what) cols1.push(blk("dlg.what", ul(L(p.what))));
    if (p.built) cols1.push(blk("dlg.built", ul(L(p.built))));
    if (p.hard) cols2.push(blk("dlg.hard", "<p>" + md(T(p.hard)) + "</p>"));
    if (p.next) cols2.push(blk("dlg.next", ul(L(p.next))));
    cols2.push(blk("dlg.stack", '<div class="chips">' + chipsHtml(p.tags) + "</div>"));
    dlgBody.innerHTML =
      '<header><h2 id="dlgTitle">' + esc(T(p.name)) + (p.sub ? '<span class="sub">' + esc(T(p.sub)) + "</span>" : "") + "</h2>" +
      (p.kind ? '<span class="kind-pill mono">' + esc(tt("kind." + p.kind)) + "</span>" : "") +
      '<p class="lede">' + esc(T(p.one)) + "</p></header>" +
      ((p.links && (p.links.demo || p.links.repo)) ? '<div class="dlg-links">' + linkBtns(p, false) + "</div>" : "") +
      (p.coldStart ? '<p class="note">' + esc(tt("dlg.cold")) + "</p>" : "") +
      '<div class="gal"><div class="gal-main" id="galMain">' + mainMedia(p.media[0]) + '</div><div class="gal-cap mono" id="galCap">' + esc(p.media[0].cap || "") + "</div>" +
      '<div class="thumbs" role="list">' + p.media.map(function (m, i) {
        return '<button class="th" type="button" role="listitem" data-i="' + i + '" aria-current="' + (i === 0) + '" aria-label="' + esc(m.cap || ("#" + (i + 1))) + '">' +
          (m.type === "video" ? '<span class="vid" style="background-image:url(' + m.poster + ')">&#9654;</span>' : '<img src="' + m.src + '" alt="" loading="lazy">') + "</button>";
      }).join("") + "</div></div>" +
      (p.problem ? blk("dlg.problem", "<p>" + md(T(p.problem)) + "</p>", "callout") : "") +
      (cols1.length ? '<div class="cols">' + cols1.join("") + "</div>" : "") +
      '<div class="cols">' + cols2.join("") + "</div>";
    dlgBody.querySelectorAll(".th").forEach(function (b) {
      b.addEventListener("click", function () {
        var i = +b.getAttribute("data-i"), m = p.media[i];
        D.getElementById("galMain").innerHTML = mainMedia(m);
        D.getElementById("galCap").textContent = m.cap || "";
        dlgBody.querySelectorAll(".th").forEach(function (o) { o.setAttribute("aria-current", o === b); });
      });
    });
    if (typeof dlg.showModal === "function") dlg.showModal(); else dlg.setAttribute("open", "");
    dlg.scrollTop = 0; D.body.style.overflow = "hidden";
    try { history.replaceState(null, "", "#" + id); } catch (e) {}
  }
  function closeCase() { if (dlg.open) dlg.close(); }
  dlg.addEventListener("close", function () {
    D.body.style.overflow = ""; dlgBody.innerHTML = ""; currentId = null;
    try { history.replaceState(null, "", location.pathname + location.search + "#projects"); } catch (e) {}
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  });
  dlg.addEventListener("click", function (e) { if (e.target === dlg) closeCase(); });
  D.getElementById("dlgX").addEventListener("click", closeCase);

  /* ---------- events ---------- */
  D.addEventListener("click", function (e) {
    var o = e.target.closest("[data-open]");
    if (o) { openCase(o.getAttribute("data-open")); return; }
    var t = e.target.closest(".tech[data-tech]");
    if (t) {
      var id = t.getAttribute("data-tech");
      activeTech = activeTech === id ? null : id;
      applyFilter();
      if (activeTech) { var s = D.getElementById("projects"); if (s) s.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" }); }
      return;
    }
    if (e.target.closest("[data-clear]")) { activeTech = null; applyFilter(); return; }
    var h = e.target.closest(".row-h");
    if (h) {
      var row = h.parentNode, open = !row.classList.contains("open");
      row.classList.toggle("open", open); h.setAttribute("aria-expanded", open);
    }
  });

  function reduceMotion() { return matchMedia("(prefers-reduced-motion: reduce)").matches; }
  D.getElementById("langBtn").addEventListener("click", function () {
    var swap = function () {
      lang = lang === "en" ? "he" : "en"; store("rk-lang", lang);
      var id = currentId;
      renderAll();
      if (id) openCase(id);
      root.classList.remove("lang-out");
    };
    if (reduceMotion()) { swap(); return; }
    root.classList.add("lang-out");
    setTimeout(swap, 180);
  });
  D.getElementById("themeBtn").addEventListener("click", function () {
    var cur = root.getAttribute("data-theme") || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    var next = cur === "dark" ? "light" : "dark";
    if (!reduceMotion()) { root.classList.add("theming"); setTimeout(function () { root.classList.remove("theming"); }, 600); }
    root.setAttribute("data-theme", next); store("rk-theme", next);
    var m = D.querySelector('meta[name="theme-color"]'); if (m) m.content = next === "dark" ? "#111518" : "#ece9e0";
  });

  /* ---------- reveal, progress, scrollspy, lazy video ---------- */
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var io = "IntersectionObserver" in window ? new IntersectionObserver(function (es) {
    es.forEach(function (en) {
      if (en.isIntersecting) en.target.classList.add("in");
      else if (en.boundingClientRect.top > 0) en.target.classList.remove("in"); /* left via bottom = scrolled back up */
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }) : null;
  function observeNew() {
    D.querySelectorAll(".rv").forEach(function (el) { if (io && !reduce) io.observe(el); else el.classList.add("in"); });
  }
  var vio = "IntersectionObserver" in window ? new IntersectionObserver(function (es) {
    es.forEach(function (en) {
      var v = en.target;
      if (en.isIntersecting && !reduce) { var pr = v.play(); if (pr && pr.catch) pr.catch(function () {}); } else v.pause();
    });
  }, { threshold: 0.35 }) : null;
  function observeVideos() { if (vio) D.querySelectorAll("[data-lazyvid]").forEach(function (v) { vio.observe(v); }); }

  var bar = D.getElementById("bar"), ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      var h = root.scrollHeight - innerHeight;
      bar.style.transform = "scaleX(" + (h > 0 ? Math.min(1, scrollY / h) : 0) + ")";
      ticking = false;
    });
  }
  addEventListener("scroll", onScroll, { passive: true });

  var links = [].slice.call(D.querySelectorAll(".nav a"));
  var ind = D.querySelector(".nav-ind"), navEl = D.querySelector(".nav"), curId = null;
  var ids = ["projects", "stack", "approach", "about", "contact"];
  function moveInd(instant) {
    if (!ind) return;
    var a = links.filter(function (l) { return l.classList.contains("on"); })[0];
    if (!a || navEl.offsetWidth === 0) { ind.style.opacity = 0; return; }
    if (instant) ind.style.transition = "none";
    ind.style.opacity = 1;
    ind.style.width = a.offsetWidth + "px";
    ind.style.transform = "translateX(" + a.offsetLeft + "px)";
    if (instant) { void ind.offsetWidth; ind.style.transition = ""; }
  }
  function spyUpdate() {
    var next = null, vh = innerHeight, atEnd = scrollY + vh >= D.documentElement.scrollHeight - 6;
    if (atEnd) next = "contact";
    else ids.forEach(function (id) { var el = D.getElementById(id); if (el && el.getBoundingClientRect().top <= vh * 0.4) next = id; });
    if (next === curId) return;
    curId = next;
    links.forEach(function (a) { a.classList.toggle("on", a.getAttribute("href") === "#" + next); });
    moveInd(false);
  }
  var spyT = false;
  addEventListener("scroll", function () { if (!spyT) { spyT = true; requestAnimationFrame(function () { spyT = false; spyUpdate(); }); } }, { passive: true });
  addEventListener("resize", function () { moveInd(true); spyUpdate(); });
  if (D.fonts && D.fonts.ready) D.fonts.ready.then(function () { moveInd(true); });

  /* ---------- go ---------- */
  function renderAll() {
    applyStatic(); renderTech(); renderFeatured(); renderRows(); applyFilter(); observeNew(); observeVideos();
    moveInd(true);
    requestAnimationFrame(function () { spyUpdate(); moveInd(true); });
  }
  D.getElementById("yr").textContent = new Date().getFullYear();
  renderAll(); onScroll(); spyUpdate();
  var hash = location.hash.slice(1);
  if (hash && byId(hash) && byId(hash).media) openCase(hash);
})();
