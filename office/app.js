(function () {
  "use strict";

  /* ---------- tabs ---------- */
  var tabs = Array.prototype.slice.call(document.querySelectorAll(".tab"));
  var panels = {
    map: "p-map", meeting: "p-meeting", work: "p-work",
    status: "p-status", memo: "p-memo"
  };
  var current = "map";

  function showTab(name) {
    if (!panels[name]) return;
    current = name;
    tabs.forEach(function (t) {
      var on = t.getAttribute("aria-controls") === panels[name];
      t.setAttribute("aria-selected", on ? "true" : "false");
    });
    Object.keys(panels).forEach(function (k) {
      var el = document.getElementById(panels[k]);
      var on = k === name;
      el.hidden = !on;
      el.classList.toggle("active", on);
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  tabs.forEach(function (t) {
    t.addEventListener("click", function () {
      var name = Object.keys(panels).filter(function (k) {
        return panels[k] === t.getAttribute("aria-controls");
      })[0];
      showTab(name);
    });
  });

  /* ---------- motion toggle ---------- */
  var map = document.getElementById("map");
  var motionBtn = document.getElementById("motionBtn");
  var motionState = document.getElementById("motionState");
  var motionOn = true;
  try {
    var saved = localStorage.getItem("nyawoong-office-motion");
    if (saved === "off") motionOn = false;
  } catch (e) {}
  function applyMotion() {
    map.classList.toggle("motion", motionOn);
    motionBtn.classList.toggle("on", motionOn);
    motionBtn.classList.toggle("off", !motionOn);
    motionBtn.setAttribute("aria-pressed", motionOn ? "true" : "false");
    motionState.textContent = motionOn ? "ON" : "OFF";
  }
  applyMotion();
  motionBtn.addEventListener("click", function () {
    motionOn = !motionOn;
    applyMotion();
    try { localStorage.setItem("nyawoong-office-motion", motionOn ? "on" : "off"); } catch (e) {}
  });

  /* ---------- sheet ---------- */
  var sheetWrap = document.getElementById("sheetWrap");
  var sheetKicker = document.getElementById("sheetKicker");
  var sheetTitle = document.getElementById("sheetTitle");
  var sheetDesc = document.getElementById("sheetDesc");
  var sheetRows = document.getElementById("sheetRows");
  var sheetNote = document.getElementById("sheetNote");
  var sheetLinks = document.getElementById("sheetLinks");

  function openSheet(id) {
    var p = PARTS[id];
    if (!p) return;
    sheetKicker.textContent = p.kicker;
    sheetTitle.textContent = p.icon + " " + p.title;
    sheetDesc.textContent = p.desc;
    sheetRows.innerHTML = p.rows.map(function (r) {
      return '<div class="row"><span class="k">' + r[0] + '</span><span class="v">' + r[1] + '</span></div>';
    }).join("");
    sheetNote.textContent = p.note || "";
    sheetNote.hidden = !p.note;

    sheetLinks.innerHTML = "";
    (p.links || []).forEach(function (l) {
      if (l[2].indexOf("tab:") === 0) {
        var b = document.createElement("button");
        b.type = "button";
        b.innerHTML = '<span>' + l[0] + '</span><span class="s">' + l[1] + '</span>';
        b.addEventListener("click", function () {
          closeSheet();
          showTab(l[2].slice(4));
        });
        sheetLinks.appendChild(b);
      } else {
        var a = document.createElement("a");
        a.href = l[2];
        a.target = "_blank";
        a.rel = "noopener";
        a.innerHTML = '<span>' + l[0] + '</span><span class="s">' + l[1] + ' ↗</span>';
        sheetLinks.appendChild(a);
      }
    });

    sheetWrap.hidden = false;
    document.body.style.overflow = "hidden";
    document.getElementById("sheet").scrollTop = 0;
    document.getElementById("sheetClose").focus({ preventScroll: true });
  }
  function closeSheet() {
    sheetWrap.hidden = true;
    document.body.style.overflow = "";
  }
  Array.prototype.forEach.call(document.querySelectorAll(".hot[data-part]"), function (b) {
    b.addEventListener("click", function () { openSheet(b.getAttribute("data-part")); });
  });
  document.getElementById("sheetClose").addEventListener("click", closeSheet);
  sheetWrap.addEventListener("click", function (e) {
    if (e.target === sheetWrap) closeSheet();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !sheetWrap.hidden) closeSheet();
  });

  /* ---------- agenda ---------- */
  var agendaList = document.getElementById("agendaList");
  agendaList.innerHTML = AGENDA.map(function (a) {
    return '<article class="agenda' + (a.urgent ? " urgent" : "") + '">' +
      '<div class="ag-top">' +
        '<span class="ag-ico">' + a.icon + '</span>' +
        '<span class="tag' + (a.urgent ? " warn" : "") + '">' + a.tag + '</span>' +
        '<span class="ag-date">' + a.date + '</span>' +
      '</div>' +
      '<h3>' + a.title + '</h3>' +
      '<p>' + a.body + '</p>' +
      '<div class="ask">' + a.ask + '</div>' +
    '</article>';
  }).join("");

  /* ---------- routines ---------- */
  var routineList = document.getElementById("routineList");
  routineList.innerHTML = ROUTINES.map(function (r) {
    var wait = r.state !== "가동 중";
    return '<article class="routine">' +
      '<span class="r-ico">' + r.icon + '</span>' +
      '<div class="r-body">' +
        '<div class="r-hd"><h3>' + r.name + '</h3><span class="when' + (wait ? " wait" : "") + '">' + r.when + '</span></div>' +
        '<p>' + r.desc + '</p>' +
      '</div>' +
    '</article>';
  }).join("");

  /* ---------- stats ---------- */
  var statCards = document.getElementById("statCards");
  var stats = [
    ["24", "배포 완료 사이트"],
    ["10", "쿠팡 실용템"],
    ["2", "스레드 이미지 세트"],
    ["5", "결정 대기 안건"]
  ];
  statCards.innerHTML = stats.map(function (s) {
    return '<div class="stat"><b>' + s[0] + '</b><span>' + s[1] + '</span></div>';
  }).join("");

  /* ---------- sites ---------- */
  var siteList = document.getElementById("siteList");
  siteList.innerHTML = SITES.map(function (s) {
    return '<a class="site" href="' + BASE + s[2] + '/" target="_blank" rel="noopener">' +
      '<span class="nm">' + s[0] + '</span>' +
      '<span class="ty">' + s[1] + '</span>' +
      '<span class="go">↗</span>' +
    '</a>';
  }).join("");

  /* ---------- memo ---------- */
  var KEY = "nyawoong-office-notes-v1";
  var memoList = document.getElementById("memoList");
  var memoInput = document.getElementById("memoInput");
  var memoEmpty = document.getElementById("memoEmpty");

  function loadNotes() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return null;
      var arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr : null;
    } catch (e) { return null; }
  }
  function saveNotes(arr) {
    try { localStorage.setItem(KEY, JSON.stringify(arr)); } catch (e) {}
  }
  var notes = loadNotes();
  if (!notes) {
    notes = DEFAULT_NOTES.map(function (n) {
      return { text: n.text, pinned: !!n.pinned, at: Date.now() };
    });
    saveNotes(notes);
  }

  function fmt(ts) {
    var d = new Date(ts);
    if (!ts || isNaN(d.getTime())) return "";
    var p = function (n) { return n < 10 ? "0" + n : "" + n; };
    return (d.getMonth() + 1) + "/" + d.getDate() + " " + p(d.getHours()) + ":" + p(d.getMinutes());
  }

  function renderNotes() {
    memoList.innerHTML = "";
    if (!notes.length) { memoEmpty.hidden = false; return; }
    memoEmpty.hidden = true;
    notes.forEach(function (n, i) {
      var d = document.createElement("div");
      d.className = "memo" + (n.pinned ? " pinned" : "");

      var span = document.createElement("div");
      span.className = "txt";
      span.appendChild(document.createTextNode(n.text));

      var meta = document.createElement("div");
      meta.className = "meta";
      if (n.pinned) {
        var pin = document.createElement("span");
        pin.className = "pin";
        pin.textContent = "📌 고정";
        meta.appendChild(pin);
      }
      var t = document.createElement("time");
      t.textContent = fmt(n.at);
      meta.appendChild(t);
      span.appendChild(meta);
      d.appendChild(span);

      if (!n.pinned) {
        var btn = document.createElement("button");
        btn.className = "del";
        btn.type = "button";
        btn.setAttribute("aria-label", "메모 삭제");
        btn.textContent = "✕";
        btn.addEventListener("click", function () {
          notes.splice(i, 1);
          saveNotes(notes);
          renderNotes();
        });
        d.appendChild(btn);
      }
      memoList.appendChild(d);
    });
  }
  renderNotes();

  document.getElementById("memoForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var v = memoInput.value.trim();
    if (!v) return;
    notes.unshift({ text: v, pinned: false, at: Date.now() });
    saveNotes(notes);
    memoInput.value = "";
    renderNotes();
    memoInput.focus();
  });

  /* ---------- long-press / touch: keep badges tappable ---------- */
  document.addEventListener("gesturestart", function (e) { e.preventDefault(); });
})();
