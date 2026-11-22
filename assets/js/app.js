/* =========================================================
   西方美学思想史 —— 站点逻辑
   纯原生 JS，hash 路由，localStorage 记录书签与阅读位置
   ========================================================= */
(function () {
  "use strict";

  var D = window.WA || { modules: [], lessons: {}, concepts: [], people: [], schools: [], timeline: [], readings: [], artworks: [], index: [] };
  var SVG = window.WA_SVG || {};

  /* ---------------- 基础工具 ---------------- */
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function esc(s) {
    return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function ic(name, cls) {
    return '<svg class="' + (cls || "") + '" width="14" height="14" aria-hidden="true"><use href="#' + name + '"/></svg>';
  }
  var ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];

  /* ---------------- 索引 ---------------- */
  var FLAT = [], BYID = {}, BMOD = {};
  D.modules.forEach(function (m) {
    BMOD[m.id] = m;
    m.lessons.forEach(function (L, i) {
      L._m = m; L._i = i;
      FLAT.push(L); BYID[L.id] = L;
    });
  });
  var CID = {}, PID = {}, AID = {}, RID = {};
  D.concepts.forEach(function (c) { CID[c.id] = c; });
  D.people.forEach(function (p) { PID[p.id] = p; });
  D.artworks.forEach(function (a) { AID[a.id] = a; });
  D.readings.forEach(function (r) { RID[r.id] = r; });

  function full(L) { return L && D.lessons[L.id]; }
  function prevOf(L) { var i = FLAT.indexOf(L); return i > 0 ? FLAT[i - 1] : null; }
  function nextOf(L) { var i = FLAT.indexOf(L); return i >= 0 && i < FLAT.length - 1 ? FLAT[i + 1] : null; }
  function peopleLine(p) { return (p.years || "") + (p.school ? " · " + p.school : ""); }

  /* ---------------- 本地存储 ---------------- */
  var K = { fav: "wa:fav", mark: "wa:marks", recent: "wa:recent", last: "wa:last", pos: "wa:pos" };
  var Store = {
    read: function (k, d) {
      try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; }
    },
    write: function (k, v) {
      try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; }
    },
    favs: function () { return Store.read(K.fav, []); },
    isFav: function (id) { return Store.favs().indexOf(id) >= 0; },
    toggleFav: function (id) {
      var a = Store.favs(), i = a.indexOf(id);
      if (i >= 0) a.splice(i, 1); else a.unshift(id);
      Store.write(K.fav, a); return i < 0;
    },
    marks: function () { return Store.read(K.mark, []); },
    addMark: function (o) {
      var a = Store.marks();
      a = a.filter(function (x) { return !(x.id === o.id && Math.abs(x.r - o.r) < 0.02); });
      a.unshift(o); Store.write(K.mark, a.slice(0, 200));
    },
    delMark: function (t) {
      Store.write(K.mark, Store.marks().filter(function (x) { return x.t !== t; }));
    },
    recents: function () { return Store.read(K.recent, []); },
    touch: function (id) {
      var a = Store.recents().filter(function (x) { return x.id !== id; });
      a.unshift({ id: id, t: Date.now() });
      Store.write(K.recent, a.slice(0, 60));
      Store.write(K.last, id);
    },
    last: function () { return Store.read(K.last, ""); },
    pos: function () { return Store.read(K.pos, {}); },
    setPos: function (id, r) {
      var p = Store.pos(); p[id] = { r: r, t: Date.now() };
      var ks = Object.keys(p);
      if (ks.length > 120) { ks.sort(function (a, b) { return p[a].t - p[b].t; }).slice(0, 30).forEach(function (k) { delete p[k]; }); }
      Store.write(K.pos, p);
    }
  };
  function fmtDate(t) {
    var d = new Date(t), p = function (n) { return (n < 10 ? "0" : "") + n; };
    return d.getFullYear() + "·" + p(d.getMonth() + 1) + "·" + p(d.getDate()) + " " + p(d.getHours()) + ":" + p(d.getMinutes());
  }
  function readMark(id) {
    var r = Store.recents().filter(function (x) { return x.id === id; })[0];
    return r ? r.t : 0;
  }

  /* ---------------- 装饰片段 ---------------- */
  function band() {
    return '<svg class="meander" viewBox="0 0 640 13" preserveAspectRatio="none" aria-hidden="true">' +
      '<rect width="640" height="13" fill="url(#pat-key)"/></svg>';
  }
  function monogram(name) {
    var s = String(name || "?").trim();
    var ch = s.length > 1 && /[A-Za-z]/.test(s[0]) ? s[0].toUpperCase() : s.slice(0, 1);
    return '<span class="monogram">' + esc(ch) + "</span>";
  }
  function statusBadge(L) {
    var f = full(L);
    if (!f) return '<span class="st">纲要</span>';
    if (readMark(L.id)) return '<span class="st read">已读</span>';
    return '<span class="st full">正文</span>';
  }

  /* ---------------- 首页 ---------------- */
  function vHome() {
    var meta = D.meta || {};
    var lastId = Store.last(), last = lastId ? BYID[lastId] : null;
    var h = "";

    h += '<section class="hero"><div class="wrap hero-in">' +
      '<div><span class="kicker">Academia Aestheticae</span>' +
      "<h1>西方美学思想史</h1>" +
      '<div class="latin">Historia Aestheticae Occidentalis · 从毕达哥拉斯到算法时代</div>' +
      '<p class="lead">十个模块、' + (meta.lessons || 96) + " 讲，把朱立元主编《西方美学史》的知识框架、朱光潜《西方美学史》的比较视野与黑格尔《美学》的原著细读，重编成一条可以从零走到底的路线：先立概念，再看历史，最后回到作品与争论本身。</p>" +
      '<div class="hero-acts"><a class="btn" href="#/lesson/' + (FLAT[0] ? FLAT[0].id : "") + '">开始第一讲 ' + ic("i-right") + "</a>" +
      '<a class="btn btn-ghost" href="#/course">完整目录</a>' +
      '<a class="btn btn-ghost" href="#/timeline">思想史时间轴</a></div>' +
      '<div class="hero-stats">' +
      "<div><b>" + (meta.modules || 10) + "</b><span>模块</span></div>" +
      "<div><b>" + (meta.lessons || 96) + "</b><span>讲次</span></div>" +
      "<div><b>" + D.concepts.length + "</b><span>概念词条</span></div>" +
      "<div><b>" + D.people.length + "</b><span>人物索引</span></div>" +
      "<div><b>" + (Math.round((meta.chars || 0) / 1000)) + "k</b><span>正文字数</span></div>" +
      "</div></div>" +
      '<div class="hero-art">' + (SVG.__hero || "") + "</div></div></section>";

    if (last) {
      var lp = Store.pos()[last.id];
      h += '<section class="wrap" style="padding-top:28px"><a class="cont-card" href="#/lesson/' + last.id + '">' +
        '<span class="lbl">继续阅读</span><div class="bd"><h3>' + esc(last.title) + "</h3>" +
        "<p>第" + last._m.no + "模块 · " + esc(last._m.title) + (lp && lp.r > .03 ? " ／ 上次读到 " + Math.round(lp.r * 100) + "%" : " ／ 上次停在这里") + "</p></div>" +
        '<span class="btn btn-ghost btn-sm">接着读 ' + ic("i-right") + "</span></a></section>";
    }

    h += '<section class="section"><div class="wrap">' +
      '<div class="sec-head"><h2><span class="num">I</span>课程总览</h2>' +
      '<span class="sub">十模块 · 由概念到历史，再由历史回到作品</span></div>' +
      '<div class="mods">';
    D.modules.forEach(function (m) {
      var done = m.lessons.filter(function (L) { return readMark(L.id); }).length;
      var fullN = m.lessons.filter(function (L) { return !!full(L); }).length;
      h += '<a class="mod-card" href="#/course#' + m.id + '">' +
        '<div class="n">MODVLVS ' + ROMAN[m.no - 1] + "</div>" +
        "<h3>" + esc(m.title) + "</h3>" +
        '<div class="lat">' + esc(m.latin) + "</div>" +
        '<div class="tagline">' + esc(m.tagline) + "</div>" +
        '<div class="foot"><span>' + esc(m.period) + "</span>" +
        '<span class="dots" title="' + m.lessons.length + " 讲，其中 " + fullN + ' 讲已撰正文">' +
        m.lessons.map(function (L) { return '<i class="' + (readMark(L.id) ? "done" : "") + '"></i>'; }).join("") +
        "</span></div></a>";
    });
    h += "</div></div></section>";

    // 时间轴
    var picks = [], step = Math.max(1, Math.floor(D.timeline.length / 13));
    D.timeline.forEach(function (e, i) { if (i % step === 0) picks.push(e); });
    h += '<section class="section"><div class="wrap">' +
      '<div class="sec-head"><h2><span class="num">II</span>思想史时间轴</h2>' +
      '<a class="sub" href="#/timeline">查看完整 ' + D.timeline.length + " 条 →</a></div>" +
      '<div class="tl-strip">';
    picks.slice(0, 14).forEach(function (e) {
      h += '<a class="tl-item" href="#/timeline"><div class="y">' + esc(e.label) + '</div><div class="t">' + esc(e.title) + "</div></a>";
    });
    h += "</div></div></section>";

    // 人物
    var feat = ["p-plato", "p-aristotle", "p-plotinus", "p-augustine", "p-aquinas", "p-hume",
      "p-burke", "p-baumgarten", "p-kant", "p-hegel", "p-nietzsche", "p-heidegger"]
      .map(function (id) { return PID[id]; }).filter(Boolean);
    h += '<section class="section"><div class="wrap">' +
      '<div class="sec-head"><h2><span class="num">III</span>重要哲学家</h2>' +
      '<a class="sub" href="#/people">全部 ' + D.people.length + " 位 →</a></div>" +
      '<div class="people-grid">';
    feat.forEach(function (p) {
      h += '<a class="person-card" href="#/person/' + p.id + '">' + monogram(p.name) +
        "<div><div class=\"nm\">" + esc(p.name) + '</div><div class="yr">' + esc(p.years) + "</div>" +
        '<div class="rl">' + esc(p.role || p.school) + "</div></div></a>";
    });
    h += "</div></div></section>";

    // 原著与赏析
    h += '<section class="section"><div class="wrap"><div class="sec-head"><h2><span class="num">IV</span>两处入口</h2>' +
      '<span class="sub">原著区读文本，赏析区看形式</span></div>' +
      '<div class="grid-cards">' +
      '<a class="card" href="#/readings"><h4>经典原著阅读区</h4><div class="en">Fontes</div>' +
      "<p>" + D.readings.length + " 部核心著作：写作背景、核心思想、重要概念、代表章节、与美学史的关系、阅读顺序。区分原著观点与编者解释。</p>" +
      '<div class="meta"><span>' + D.readings.map(function (r) { return r.author; }).slice(0, 4).join(" · ") + " …</span></div></a>" +
      '<a class="card" href="#/artworks"><h4>艺术作品赏析区</h4><div class="en">Opera</div>' +
      "<p>" + D.artworks.length + " 件作品的形式分析：构图、比例、笔触、光线、结构、镜头。每件附手绘构图示意图，可放大查看。</p>" +
      '<div class="meta"><span>雕塑 · 建筑 · 绘画 · 音乐 · 电影</span></div></a>' +
      '<a class="card" href="#/concepts"><h4>重要概念词典</h4><div class="en">Lexicon</div>' +
      "<p>" + D.concepts.length + " 个词条，每条给出定义、辨析与出处，并标出它在哪几讲出现。</p>" +
      '<div class="meta"><span>按问题域与首字母检索</span></div></a>' +
      "</div></div></section>";

    return h;
  }

  /* ---------------- 课程目录 ---------------- */
  function vCourse() {
    var h = '<div class="page"><div class="wrap">';
    h += '<div class="detail-hero"><span class="kicker">Curriculum</span><h1>完整课程目录</h1>' +
      '<p class="lead">十个模块按「先立地基，再走历史，最后回到作品与争论」的顺序编排。标注「正文」的讲次已撰写完整讲义（八段结构：导入／核心知识／代表人物／理论解析／经典原著／艺术案例／思想联系／总结）；标注「纲要」的讲次已具备完整提要与要点，正文分批撰写中。</p></div>';
    h += '<div class="course-list">';
    D.modules.forEach(function (m) {
      var open = m.no === 1 ? " open" : "";
      var fullN = m.lessons.filter(function (L) { return !!full(L); }).length;
      h += '<div class="acc' + open + '" id="' + m.id + '">' +
        '<div class="acc-h"><span class="n">' + ROMAN[m.no - 1] + "</span>" +
        "<h3>" + esc(m.title) + '<span class="lat" style="font-size:12px;color:var(--muted-2);font-style:italic;margin-left:10px">' + esc(m.latin) + "</span></h3>" +
        '<span class="meta">' + m.lessons.length + " 讲 · " + (fullN === m.lessons.length ? "全部有正文" : fullN + " 讲有正文") + "</span>" +
        '<span class="caret">' + ic("i-right") + "</span></div>" +
        '<div class="acc-b">' +
        '<p class="small muted" style="margin:6px 14px 12px">' + esc(m.intro) + "</p>";
      m.lessons.forEach(function (L, i) {
        h += '<a class="les-row" href="#/lesson/' + L.id + '">' +
          '<span class="no">' + ("0" + (i + 1)).slice(-2) + "</span>" +
          '<span class="ti">' + esc(L.title) + '<span class="su">' + esc(L.summary) + "</span></span>" +
          statusBadge(L) + "</a>";
      });
      h += "</div></div>";
    });
    h += "</div></div></div>";
    return h;
  }

  /* ---------------- 讲次页 ---------------- */
  function vLesson(id) {
    var L = BYID[id];
    if (!L) return vMissing("找不到这一讲");

    var f = full(L);
    var m = L._m;
    var h = '<div class="page"><div class="wrap lesson-layout">';

    // 左导航
    h += '<aside class="lnav" id="lnav"><h4>课程导航</h4>';
    D.modules.forEach(function (mm) {
      var cur = mm.id === m.id;
      h += '<div class="mod' + (cur ? " cur" : "") + '"><a href="#/course#' + mm.id + '"><span class="rn">' + ROMAN[mm.no - 1] + "</span>" + esc(mm.title) + "</a>";
      if (cur) {
        h += "<ul>";
        mm.lessons.forEach(function (LL) {
          h += '<li class="' + (LL.id === id ? "cur" : "") + '"><a href="#/lesson/' + LL.id + '">' + esc(LL.title) +
            (readMark(LL.id) ? '<span class="dot">●</span>' : "") + "</a></li>";
        });
        h += "</ul>";
      }
      h += "</div>";
    });
    h += "</aside>";

    // 正文
    h += '<article class="lesson-main"><div class="art-head">' +
      '<div class="crumb"><a href="#/">首页</a><span>/</span><a href="#/course">课程</a><span>/</span>' +
      '<a href="#/course#' + m.id + '">第' + m.no + "模块 " + esc(m.title) + "</a></div>" +
      "<h1>" + esc(L.title) + "</h1>" +
      (L.subtitle ? '<div class="sub">' + esc(L.subtitle) + "</div>" : "") +
      '<div class="art-meta"><span>第 ' + ("0" + (L._i + 1)).slice(-2) + " 讲</span><span class='sp'>·</span>" +
      (f ? "<span>" + f.chars + " 字</span><span class='sp'>·</span><span>约 " + f.minutes + " 分钟</span>" : "<span>正文撰写中</span>") +
      (f ? "<span class='sp'>·</span><span>" + (L.status === "full" ? "完整讲义" : "纲要") + "</span>" : "") +
      '<span class="sp">·</span><span>' + esc(m.period) + "</span></div>" +
      '<div class="readbar">' +
      '<button class="tool" data-act="fav" data-id="' + L.id + '">' + (Store.isFav(L.id) ? ic("i-star-fill") + "<span>已收藏</span>" : ic("i-star") + "<span>收藏本讲</span>") + "</button>" +
      '<button class="tool" data-act="mark" data-id="' + L.id + '">' + ic("i-mark") + "<span>在此处加书签</span></button>" +
      '<button class="tool" data-act="lnav">' + ic("i-menu") + "<span>目录</span></button>" +
      "</div></div>";

    if (f) {
      h += '<div class="art-lead">' + esc(L.lead || L.summary) + "</div>";
      h += '<div class="article" id="articleBody">' + f.html + "</div>";
    } else {
      h += '<div class="art-lead">' + esc(L.summary) + "</div>";
      h += '<div class="article"><aside class="box note"><div class="box-h"><span class="tag">进度</span>' +
        '<span class="box-t">本讲正文撰写中</span></div><div class="box-b"><p>本讲的提要与要点已经确定，完整讲义（导入／核心知识／代表人物／理论解析／经典原著／艺术案例／思想联系／总结）正在分批撰写。下列骨架可供先读，相关概念与人物现已在词典中可查。</p></div></aside>';
      h += "<h2>本讲要点</h2><ul>" + L.points.map(function (p) { return "<li>" + esc(p) + "</li>"; }).join("") + "</ul>";
      if (L.concepts.length) {
        h += "<h2>涉及概念</h2><ul>" + L.concepts.filter(function (c) { return CID[c]; }).map(function (c) {
          return '<li><a href="#/concept/' + c + '">' + esc(CID[c].term) + "</a>：" + esc(CID[c].brief) + "</li>";
        }).join("") + "</ul>";
      }
      h += "</div>";
    }

    // 上下讲
    var p = prevOf(L), n = nextOf(L);
    h += '<div class="pager">' +
      (p ? '<a href="#/lesson/' + p.id + '"><div class="dir">← 上一讲</div><div class="ti">' + esc(p.title) + "</div></a>" : '<a class="empty"></a>') +
      (n ? '<a class="next" href="#/lesson/' + n.id + '"><div class="dir">下一讲 →</div><div class="ti">' + esc(n.title) + "</div></a>" : '<a class="empty"></a>') +
      "</div></article>";

    // 右栏
    h += '<aside class="laside">';
    if (f && f.toc && f.toc.length) {
      h += '<div class="grp"><h5>本讲目录<span>' + f.toc.length + "</span></h5><ul class=\"toc\">" +
        f.toc.map(function (t) { return '<li><a href="#s" data-anchor="' + t.id + '">' + esc(t.title) + "</a></li>"; }).join("") + "</ul></div>";
    }
    if (L.concepts.length) {
      h += '<div class="grp"><h5>关键概念<span>' + L.concepts.length + "</span></h5><ul>";
      L.concepts.forEach(function (c) {
        if (!CID[c]) return;
        h += '<li><a href="#/concept/' + c + '"><span class="t">' + esc(CID[c].term) + '</span><span class="s">' + esc(CID[c].en || "") + "</span></a></li>";
      });
      h += "</ul></div>";
    }
    if (L.people.length) {
      h += '<div class="grp"><h5>相关人物<span>' + L.people.length + "</span></h5><ul>";
      L.people.forEach(function (p2) {
        if (!PID[p2]) return;
        h += '<li><a href="#/person/' + p2 + '"><span class="t">' + esc(PID[p2].name) + '</span><span class="s">' + esc(peopleLine(PID[p2])) + "</span></a></li>";
      });
      h += "</ul></div>";
    }
    if (L.readings.length) {
      h += '<div class="grp"><h5>经典原著</h5><ul>';
      L.readings.forEach(function (r) {
        if (!RID[r]) return;
        h += '<li><a href="#/reading/' + r + '"><span class="t">' + esc(RID[r].title) + '</span><span class="s">' + esc(RID[r].author) + "</span></a></li>";
      });
      h += "</ul></div>";
    }
    if (L.artworks.length) {
      h += '<div class="grp"><h5>艺术作品</h5><ul>';
      L.artworks.forEach(function (a) {
        if (!AID[a]) return;
        h += '<li><a href="#/artwork/' + a + '"><span class="t">' + esc(AID[a].title) + '</span><span class="s">' + esc(AID[a].artist) + "</span></a></li>";
      });
      h += "</ul></div>";
    }
    h += "</aside></div></div>";
    return h;
  }

  /* ---------------- 时间轴 ---------------- */
  function vTimeline() {
    var h = '<div class="page"><div class="wrap narrow" style="max-width:900px">';
    h += '<div class="detail-hero"><span class="kicker">Chronologia</span><h1>美学思想史时间轴</h1>' +
      '<p class="lead">从公元前六世纪毕达哥拉斯学派的和谐论，到 2020 年代的生成式艺术争论。每一条都标注它为何在美学史上值得记住，而不只是「某年某人写了某书」。</p></div>';
    var eras = [], map = {};
    D.timeline.forEach(function (e) {
      if (!map[e.era]) { map[e.era] = []; eras.push(e.era); }
      map[e.era].push(e);
    });
    eras.forEach(function (er) {
      h += '<div class="tl-era"><h3>' + esc(er) + "</h3><div class=\"tl-list\">";
      map[er].forEach(function (e) {
        h += '<div class="tl-ev"><div class="yr">' + esc(e.label) + "</div><h4>" + esc(e.title) + "</h4><p>" + esc(e.text);
        if (e.lesson && BYID[e.lesson]) h += ' <a class="les" href="#/lesson/' + e.lesson + '">关联讲次 →</a>';
        h += "</p></div>";
      });
      h += "</div></div>";
    });
    h += "</div></div>";
    return h;
  }

  /* ---------------- 原著 ---------------- */
  function vReadings() {
    var list = D.readings.slice().sort(function (a, b) { return a.order - b.order; });
    var h = '<div class="page"><div class="wrap">';
    h += '<div class="detail-hero"><span class="kicker">Fontes</span><h1>经典原著阅读区</h1>' +
      '<p class="lead">' + D.readings.length + " 部著作，按由易到难排为阅读顺序。每部给出写作背景、核心思想、重要概念、代表章节、与美学史其他环节的关系。原著引文与编者解释在版式上分开：引文用带引号的独立块并注明篇目，解释一律用正文行文，不用引号冒充原文。</p></div>";
    list.forEach(function (r) {
      h += '<a class="shelf-item" style="text-decoration:none" href="#/reading/' + r.id + '">' +
        '<span class="monogram" style="font-size:13px">' + ("0" + r.order).slice(-2) + "</span>" +
        '<div class="bd"><div style="font-size:16px">' + esc(r.title) + '<span class="muted small"> · ' + esc(r.author) + "</span></div>" +
        '<div class="sn">' + esc(r.core).slice(0, 88) + "…</div></div>" +
        '<span class="st ' + (r.level === "必读" ? "full" : "") + '">' + esc(r.level) + "</span></a>";
    });
    h += "</div></div>";
    return h;
  }

  function vReading(id) {
    var r = RID[id];
    if (!r) return vMissing("找不到这部著作");
    var h = '<div class="page"><div class="wrap">';
    h += '<div class="detail-hero"><div class="crumb"><a href="#/readings">原著区</a><span>/</span><span>' + esc(r.author) + "</span></div>" +
      "<h1>" + esc(r.title) + '</h1><div class="en">' + esc(r.author) + " · " + esc(r.written) + "</div>" +
      '<p class="lead">' + esc(r.core) + "</p>" +
      '<div class="art-meta"><span>推荐顺序 第 ' + r.order + " 部</span><span class='sp'>·</span><span>" + esc(r.level) + "</span>" +
      (r.translator ? "<span class='sp'>·</span><span>" + esc(r.translator) + "</span>" : "") + "</div></div>";
    h += '<div class="detail-grid"><div>';
    h += '<div class="field-block"><h3>写作背景</h3><p>' + esc(r.background) + "</p></div>";
    h += '<div class="field-block"><h3>核心思想</h3><p>' + esc(r.core) + "</p></div>";
    h += '<div class="field-block"><h3>代表性章节</h3><dl class="kv">' +
      (r.chapters || []).map(function (c) { return "<dt>" + esc(c.t) + "</dt><dd>" + esc(c.note) + "</dd>"; }).join("") + "</dl></div>";
    if (r.quote) {
      h += '<div class="field-block"><h3>原文与解释</h3><figure class="quote-fig"><blockquote class="quote"><p>' +
        esc(r.quote) + "</p></blockquote><figcaption>" + esc(r.quote_src || "") + "</figcaption></figure>" +
        "<p class=\"small muted\">以上为原文；紧随其后的解释属于本课程编写者的理解，不是原典原话。</p></div>";
    }
    h += '<div class="field-block"><h3>与美学史的联系</h3><p>' + esc(r.link) + "</p></div>";
    h += "</div><aside class=\"laside\">";
    h += '<div class="grp"><h5>重要概念</h5><ul>' + (r.concepts || []).filter(function (c) { return CID[c]; }).map(function (c) {
      return '<li><a href="#/concept/' + c + '"><span class="t">' + esc(CID[c].term) + '</span><span class="s">' + esc(CID[c].brief).slice(0, 26) + "…</span></a></li>";
    }).join("") + "</ul></div>";
    if (r.author_id && PID[r.author_id]) {
      h += '<div class="grp"><h5>作者</h5><a class="person-card" href="#/person/' + r.author_id + '">' + monogram(PID[r.author_id].name) +
        '<div><div class="nm">' + esc(PID[r.author_id].name) + '</div><div class="yr">' + esc(PID[r.author_id].years) + "</div></div></a></div>";
    }
    var where = FLAT.filter(function (L) { return (L.readings || []).indexOf(id) >= 0; });
    if (where.length) {
      h += '<div class="grp"><h5>相关讲次</h5><ul>' + where.map(function (L) {
        return '<li><a href="#/lesson/' + L.id + '"><span class="t">' + esc(L.title) + '</span><span class="s">第' + L._m.no + "模块</span></a></li>";
      }).join("") + "</ul></div>";
    }
    h += "</aside></div></div>";
    return h;
  }

  /* ---------------- 作品 ---------------- */
  function vArtworks() {
    var h = '<div class="page"><div class="wrap">';
    h += '<div class="detail-hero"><span class="kicker">Opera</span><h1>艺术作品赏析</h1>' +
      '<p class="lead">这里不做「作者生平 + 创作年代 + 名作地位」的介绍，而是把每件作品拆成可观的形式：构图轴线、比例关系、笔触单位、光源方向、结构受力、镜头切分。图示为手绘构图示意，点击可放大。</p></div>';
    h += '<div class="art-grid">';
    D.artworks.forEach(function (a) {
      h += '<a class="card" href="#/artwork/' + a.id + '">' +
        '<div style="border:1px solid var(--rule);margin:-4px -4px 16px">' + (SVG[a.id] ? SVG[a.id].replace("<svg ", '<svg style="width:100%;height:auto;display:block" ') : "") + "</div>" +
        "<h4>" + esc(a.title) + '</h4><div class="en">' + esc(a.artist) + " · " + esc(a.date) + "</div>" +
        '<div class="meta"><span>' + esc(a.medium) + "</span></div></a>";
    });
    h += "</div></div></div>";
    return h;
  }

  function vArtwork(id) {
    var a = AID[id];
    if (!a) return vMissing("找不到这件作品");
    var h = '<div class="page"><div class="wrap">';
    h += '<div class="detail-hero"><div class="crumb"><a href="#/artworks">赏析区</a><span>/</span><span>' + esc(a.medium) + "</span></div>" +
      "<h1>" + esc(a.title) + '</h1><div class="en">' + esc(a.artist) + " · " + esc(a.date) + "</div>" +
      '<div class="art-meta"><span>' + esc(a.medium) + "</span>" + (a.size ? "<span class='sp'>·</span><span>" + esc(a.size) + "</span>" : "") +
      (a.place ? "<span class='sp'>·</span><span>" + esc(a.place) + "</span>" : "") + "</div></div>";
    h += '<div class="detail-grid"><div>';
    h += '<figure class="diagram"><div class="diagram-frame" data-art-figure="' + a.id + '"></div>' +
      "<figcaption>" + esc(a.title) + " · 构图与结构示意（手绘，非原作复制）</figcaption></figure>";
    h += '<div class="field-block"><h3>形式分析</h3><ul>' +
      (a.form || []).map(function (f) { return "<li>" + esc(f) + "</li>"; }).join("") + "</ul></div>";
    h += '<div class="field-block"><h3>理论对应</h3><p>' + esc(a.theory) + "</p></div>";
    if (a.note) h += '<div class="field-block"><p class="small muted">' + esc(a.note) + "</p></div>";
    h += "</div><aside class=\"laside\">";
    h += '<div class="grp"><h5>相关概念</h5><ul>' + (a.concepts || []).filter(function (c) { return CID[c]; }).map(function (c) {
      return '<li><a href="#/concept/' + c + '"><span class="t">' + esc(CID[c].term) + '</span><span class="s">' + esc(CID[c].brief).slice(0, 26) + "…</span></a></li>";
    }).join("") + "</ul></div>";
    var where = FLAT.filter(function (L) { return (L.artworks || []).indexOf(id) >= 0; });
    if (where.length) {
      h += '<div class="grp"><h5>相关讲次</h5><ul>' + where.map(function (L) {
        return '<li><a href="#/lesson/' + L.id + '"><span class="t">' + esc(L.title) + '</span><span class="s">第' + L._m.no + "模块</span></a></li>";
      }).join("") + "</ul></div>";
    }
    h += "</aside></div></div>";
    return h;
  }

  /* ---------------- 概念词典 ---------------- */
  var FIELDS = ["全部", "范畴", "本体论", "认识论", "心理学", "艺术理论", "批评术语", "社会学", "当代议题"];
  function vConcepts(q, field, letter) {
    q = q || ""; field = field || "全部"; letter = letter || "";
    var h = '<div class="page"><div class="wrap">';
    h += '<div class="detail-hero"><span class="kicker">Lexicon</span><h1>重要概念词典</h1>' +
      '<p class="lead">' + D.concepts.length + ' 个词条。每个词条给出定义、与相邻概念的辨析、以及出处；页脚列出它出现在哪几讲，可以直接跳读。</p></div>';
    h += '<div class="filter-row"><input type="search" id="cfilter" placeholder="筛选概念（中文或英文）…" value="' + esc(q) + '">' +
      '<span class="small muted">' + D.concepts.length + " 条</span></div>";
    h += '<div class="chips" id="fchips">' + FIELDS.map(function (f) {
      return '<button class="chip' + (f === field ? " on" : "") + '" data-field="' + f + '">' + f + "</button>";
    }).join("") + "</div>";
    var letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    var has = {};
    D.concepts.forEach(function (c) { if (c.en) has[(c.en[0] || "").toUpperCase()] = 1; });
    h += '<div class="alpha" id="alpha"><button data-letter="" class="' + (letter ? "" : "on") + '">全部</button>' +
      letters.map(function (l) {
        return '<button data-letter="' + l + '" class="' + (letter === l ? "on" : "") + '"' + (has[l] ? "" : " disabled") + ">" + l + "</button>";
      }).join("") + "</div>";
    h += '<div id="clist"><div class="grid-cards">';
    h += D.concepts.map(function (c) {
      return '<a class="card" href="#/concept/' + c.id + '" data-c="' + esc((c.term + " " + (c.en || "") + " " + (c.field || "")).toLowerCase()) + '" data-field="' + esc(c.field) + '" data-l="' + esc((c.en || "")[0] ? (c.en || "")[0].toUpperCase() : "") + '">' +
        "<h4>" + esc(c.term) + '</h4><div class="en">' + esc(c.en || "") + "</div>" +
        "<p>" + esc(c.brief) + '</p><div class="meta"><span>' + esc(c.field) + "</span><span>·</span><span>" + (c.where || []).length + " 讲引用</span></div></a>";
    }).join("");
    h += "</div></div></div></div>";
    return h;
  }

  function vConcept(id) {
    var c = CID[id];
    if (!c) return vMissing("找不到这个概念");
    var h = '<div class="page"><div class="wrap">';
    h += '<div class="detail-hero"><div class="crumb"><a href="#/concepts">概念词典</a><span>/</span><span>' + esc(c.field) + "</span></div>" +
      "<h1>" + esc(c.term) + '</h1><div class="en">' + esc(c.en || "") + (c.grk ? " · " + esc(c.grk) : "") + "</div>" +
      '<p class="lead">' + esc(c.brief) + "</p>" +
      '<div class="art-meta"><span>出处</span><span class="sp">·</span><span>' + esc(c.source) + "</span></div></div>";
    h += '<div class="detail-grid"><div>';
    h += '<div class="field-block"><h3>释义与辨析</h3><p>' + esc(c.body) + "</p></div>";
    var rel = D.concepts.filter(function (x) { return x.field === c.field && x.id !== c.id; }).slice(0, 6);
    if (rel.length) {
      h += '<div class="field-block"><h3>同一问题域的其他概念</h3><div class="chips">' +
        rel.map(function (x) { return '<a class="chip" href="#/concept/' + x.id + '">' + esc(x.term) + "</a>"; }).join("") + "</div></div>";
    }
    var ps = [];
    D.people.forEach(function (p) { if ((p.concepts || []).indexOf(c.id) >= 0) ps.push(p); });
    if (ps.length) {
      h += '<div class="field-block"><h3>相关人物</h3><div class="grid-cards">' + ps.slice(0, 6).map(function (p) {
        return '<a class="person-card" href="#/person/' + p.id + '">' + monogram(p.name) +
          '<div><div class="nm">' + esc(p.name) + '</div><div class="yr">' + esc(p.years) + "</div></div></a>";
      }).join("") + "</div></div>";
    }
    h += "</div><aside class=\"laside\">";
    if ((c.where || []).length) {
      h += '<div class="grp"><h5>出现在这些讲次</h5><ul>' + c.where.map(function (lid) {
        var L = BYID[lid]; if (!L) return "";
        return '<li><a href="#/lesson/' + lid + '"><span class="t">' + esc(L.title) + '</span><span class="s">第' + L._m.no + "模块 · 第" + (L._i + 1) + "讲</span></a></li>";
      }).join("") + "</ul></div>";
    }
    h += "</aside></div></div>";
    return h;
  }

  /* ---------------- 人物与流派 ---------------- */
  function vPeople(q, school) {
    q = q || ""; school = school || "";
    var h = '<div class="page"><div class="wrap">';
    h += '<div class="detail-hero"><span class="kicker">Personae</span><h1>哲学家与美学流派</h1>' +
      '<p class="lead">' + D.people.length + " 位人物与 " + D.schools.length + " 个流派。人物条目写思想贡献而非轶事；流派条目列出核心主张与代表人物。</p></div>";
    h += '<div class="filter-row"><input type="search" id="pfilter" placeholder="筛选人物（姓名／英文名／流派）…" value="' + esc(q) + '"></div>';
    h += '<div class="chips" id="schips"><button class="chip' + (school ? "" : " on") + '" data-school="">全部</button>' +
      D.schools.map(function (s) {
        return '<button class="chip' + (school === s.id ? " on" : "") + '" data-school="' + s.id + '">' + esc(s.name) + "</button>";
      }).join("") + "</div>";
    h += '<div class="grid-cards" id="plist">';
    h += D.people.map(function (p) {
      var inSchool = school ? (D.schools.filter(function (s) { return s.id === school; })[0] || { figures: [] }).figures.indexOf(p.id) >= 0 : true;
      return '<a class="person-card" href="#/person/' + p.id + '" data-p="' + esc((p.name + " " + (p.en || "") + " " + (p.school || "") + " " + (p.role || "")).toLowerCase()) + '" data-in="' + (inSchool ? "1" : "0") + '" style="flex-direction:column;gap:8px">' +
        "<div style=\"display:flex;gap:12px;align-items:center\">" + monogram(p.name) +
        '<div><div class="nm">' + esc(p.name) + '</div><div class="yr">' + esc(p.years) + "</div></div></div>" +
        '<div class="rl">' + esc(p.role) + " · " + esc(p.school) + "</div>" +
        '<div class="rl" style="color:var(--muted)">' + esc(p.brief).slice(0, 62) + "…</div></a>";
    }).join("");
    h += "</div>";
    h += '<div class="sec-head" style="margin-top:48px"><h2><span class="num">§</span>流派索引</h2></div><div class="grid-cards">';
    D.schools.forEach(function (s) {
      h += '<div class="card" id="' + s.id + '"><h4>' + esc(s.name) + '</h4><div class="en">' + esc(s.en || "") + "</div>" +
        '<div class="meta"><span>' + esc(s.period) + "</span><span>·</span><span>" + esc(s.region) + "</span></div>" +
        "<p>" + esc(s.brief) + "</p><ul style=\"margin:10px 0 0;padding-left:1.1em;font-size:13.4px;color:var(--ink-3)\">" +
        (s.tenets || []).map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("") + "</ul>" +
        '<div class="chips" style="margin:12px 0 0">' + (s.figures || []).filter(function (f) { return PID[f]; }).map(function (f) {
          return '<a class="chip" href="#/person/' + f + '">' + esc(PID[f].name) + "</a>";
        }).join("") + "</div></div>";
    });
    h += "</div></div></div>";
    return h;
  }

  function vPerson(id) {
    var p = PID[id];
    if (!p) return vMissing("找不到这位人物");
    var h = '<div class="page"><div class="wrap">';
    h += '<div class="detail-hero"><div class="crumb"><a href="#/people">人物索引</a><span>/</span><span>' + esc(p.school) + "</span></div>" +
      "<h1>" + esc(p.name) + '</h1><div class="en">' + esc(p.en) + " · " + esc(p.years) + " · " + esc(p.place) + "</div>" +
      '<div class="art-meta"><span>' + esc(p.role) + "</span><span class='sp'>·</span><span>" + esc(p.school) + "</span></div></div>";
    h += '<div class="detail-grid"><div>';
    h += '<div class="field-block"><h3>思想贡献</h3><p>' + esc(p.brief) + "</p></div>";
    if ((p.tenets || []).length) {
      h += '<div class="field-block"><h3>核心命题</h3><ul>' + p.tenets.map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("") + "</ul></div>";
    }
    if ((p.works || []).length) {
      h += '<div class="field-block"><h3>代表作</h3><ul>' + p.works.map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("") + "</ul></div>";
    }
    h += "</div><aside class=\"laside\">";
    if ((p.concepts || []).length) {
      h += '<div class="grp"><h5>相关概念</h5><ul>' + p.concepts.filter(function (c) { return CID[c]; }).map(function (c) {
        return '<li><a href="#/concept/' + c + '"><span class="t">' + esc(CID[c].term) + '</span><span class="s">' + esc(CID[c].brief).slice(0, 24) + "…</span></a></li>";
      }).join("") + "</ul></div>";
    }
    var where = FLAT.filter(function (L) { return (L.people || []).indexOf(id) >= 0; });
    if (where.length) {
      h += '<div class="grp"><h5>出现于</h5><ul>' + where.map(function (L) {
        return '<li><a href="#/lesson/' + L.id + '"><span class="t">' + esc(L.title) + '</span><span class="s">第' + L._m.no + "模块</span></a></li>";
      }).join("") + "</ul></div>";
    }
    h += "</aside></div></div>";
    return h;
  }

  /* ---------------- 书签页 ---------------- */
  function vShelf() {
    var favs = Store.favs(), marks = Store.marks(), rec = Store.recents(), pos = Store.pos();
    var h = '<div class="page"><div class="wrap narrow" style="max-width:860px">';
    h += '<div class="detail-hero"><span class="kicker">Marginalia</span><h1>我的书签</h1>' +
      '<p class="lead">收藏、书签与阅读记录只存在这台设备的浏览器里，不上传、不统计成绩。它们的作用是让你下次打开时接着上次的位置，不是用来衡量进度。</p></div>';
    h += '<div class="tabs" id="shelfTabs"><button class="on" data-t="fav">收藏 ' + favs.length + "</button>" +
      '<button data-t="mark">书签 ' + marks.length + '</button><button data-t="rec">阅读记录 ' + rec.length + "</button></div>";

    h += '<div data-panel="fav">';
    if (!favs.length) h += '<div class="empty-note">还没有收藏。在任意讲次页面点「收藏本讲」即可。</div>';
    favs.forEach(function (id) {
      var L = BYID[id]; if (!L) return;
      h += '<div class="shelf-item"><div class="bd"><a href="#/lesson/' + id + '" style="font-size:15px">' + esc(L.title) + "</a>" +
        '<div class="sn">第' + L._m.no + "模块 · " + esc(L._m.title) + "</div></div>" +
        '<button class="rm" data-unfav="' + id + '">取消收藏</button></div>';
    });
    h += "</div>";

    h += '<div data-panel="mark" hidden>';
    if (!marks.length) h += '<div class="empty-note">还没有书签。在讲次页读到某处，点「在此处加书签」会记下位置与该处所在的小节。</div>';
    marks.forEach(function (m) {
      h += '<div class="shelf-item"><div class="bd"><a href="#/lesson/' + m.id + '" data-goto="' + m.r + '" style="font-size:15px">' + esc(m.title) + "</a>" +
        '<div class="sn">' + esc(m.note || "") + " ／ 位置 " + Math.round(m.r * 100) + "%</div></div>" +
        "<time>" + fmtDate(m.t) + "</time>" +
        '<button class="rm" data-delmark="' + m.t + '">删除</button></div>';
    });
    h += "</div>";

    h += '<div data-panel="rec" hidden>';
    if (!rec.length) h += '<div class="empty-note">还没有阅读记录。打开任意讲次即会记录。</div>';
    rec.forEach(function (r) {
      var L = BYID[r.id]; if (!L) return;
      var p = pos[r.id];
      h += '<div class="shelf-item"><div class="bd"><a href="#/lesson/' + r.id + '" style="font-size:15px">' + esc(L.title) + "</a>" +
        '<div class="sn">第' + L._m.no + "模块 · " + esc(L._m.title) + (p && p.r > .02 ? " ／ 读到 " + Math.round(p.r * 100) + "%" : "") + "</div></div>" +
        "<time>" + fmtDate(r.t) + "</time></div>";
    });
    h += "</div></div></div>";
    return h;
  }

  /* ---------------- 体例说明 ---------------- */
  function vAbout() {
    return '<div class="page"><div class="wrap narrow">' +
      '<div class="detail-hero"><span class="kicker">De Methodo</span><h1>体例与引文说明</h1>' +
      '<p class="lead">这一页交代三件事：课程依据什么资料编写、引文怎么处理、以及哪些地方是编者的判断而非原典结论。</p></div>' +
      '<div class="article">' +
      "<h2>一、资料依据</h2>" +
      "<p>课程以三部书为主要理论依据：朱立元主编《西方美学史》（高等教育出版社，2018 年 8 月第 2 版，马克思主义理论研究和建设工程重点教材）建立通史框架；朱光潜《西方美学史》（人民文学出版社）提供另一条解释线索，尤其在希腊、启蒙与德国古典三段，两位作者的取舍与评价常不一致，课程在关键处并列呈现；黑格尔《美学》（汉译世界学术名著丛书）作为经典原著细读的底本，第一卷的「全书序论」与「序论」是全课程引用最密集的文本。</p>" +
      "<p>三部书的知识体系被重新编排，而不是照搬目录：朱光潜本以「美的本质—形象思维—典型—浪漫主义与现实主义」收束，朱立元本按编年推进并单列现当代，黑格尔则以艺术类型与门类系统统摄艺术史。课程把三者折成两条线——问题线（美是什么、审美判断如何可能、艺术与真理）与历史线（希腊到当代），每一讲同时落在两条线上。</p>" +
      "<h2>二、引文规则</h2>" +
      "<p>黑格尔的引文逐字核自《美学》汉译电子文本，标到卷次与篇目位置，不标页码。其余原典（柏拉图、亚里士多德、休谟、博克、康德、席勒、尼采、海德格尔、杜威等）的引文只取较有把握的通行中译，标注篇名与章节；凡不能确证逐字的地方，一律写成转述并注明「大意是」，绝不把转述伪装成原文。课程不使用虚构的页码、卷次或版次。</p>" +
      "<p>研究者的解释与原典观点分开处理：解释性文字一律用正文行文，不与引文混排；涉及学界分歧时写明「研究者通常认为」「朱光潜指出」「朱立元主编本强调」，并尽量给出分歧的实质所在。</p>" +
      "<h2>三、图示的性质</h2>" +
      "<p>赏析区的全部图示为手绘 SVG 示意图，用于标出构图轴线、比例分割、光源方向、结构受力与镜头切分，<strong>不是原作的复制或照片</strong>。它们的作用是把文字里的空间描述变成可核对的位置关系，因此允许夸张（例如帕特农的台基起拱曲率被放大），凡夸张处均在图中注明。</p>" +
      "<h2>四、讲次的两种状态</h2>" +
      "<p>标注「正文」的讲次已写满八段结构；标注「纲要」的讲次已确定提要与要点，正文分批撰写。这样做是为了先把十个模块的骨架与交叉引用定下来，避免边写边改结构。</p>" +
      "<h2>五、这个站点不做什么</h2>" +
      "<p>没有习题、测验、打卡、积分、排行榜与学习计划。阅读记录与书签只为本机使用，保存在浏览器 localStorage 中，可随时删除。</p>" +
      "</div></div></div>";
  }

  /* ---------------- 搜索 ---------------- */
  var KIND_NAME = { lesson: "讲次", concept: "概念", person: "人物", reading: "原著", art: "作品" };
  function vMissing(msg) {
    return '<div class="page"><div class="wrap narrow center" style="padding:80px 0">' +
      '<h1 style="font-size:24px;letter-spacing:.08em">' + esc(msg || "页面不存在") + "</h1>" +
      '<p class="muted">可能是链接有误，或该条目尚未建立。</p>' +
      '<p><a class="btn btn-ghost" href="#/">回到首页</a></p></div></div>';
  }

  function doSearch(q) {
    var box = $("#searchRes");
    var terms = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
    if (!terms.length) {
      box.innerHTML = '<div class="search-empty">输入关键词：人物（康德）、概念（崇高）、原著（诗学）、作品（格尔尼卡）或任意正文词语。</div>';
      return;
    }
    var hits = [];
    D.index.forEach(function (it) {
      var t = (it.t || "").toLowerCase(), s = (it.s || "").toLowerCase(), b = (it.b || "").toLowerCase();
      var score = 0, ok = true;
      terms.forEach(function (w) {
        var sc = 0;
        if (t.indexOf(w) >= 0) sc += 100 + (t.indexOf(w) === 0 ? 40 : 0);
        if (s.indexOf(w) >= 0) sc += 30;
        if (b.indexOf(w) >= 0) sc += 8;
        if (!sc) ok = false;
        score += sc;
      });
      if (ok) hits.push({ it: it, score: score });
    });
    hits.sort(function (a, b) { return b.score - a.score; });
    if (!hits.length) {
      box.innerHTML = '<div class="search-empty">没有匹配结果。试试更短的词，或换用另一个译名。</div>';
      return;
    }
    var byKind = {};
    hits.forEach(function (h) { (byKind[h.it.k] = byKind[h.it.k] || []).push(h.it); });
    var html = "", n = 0;
    ["lesson", "concept", "person", "reading", "art"].forEach(function (k) {
      var arr = (byKind[k] || []).slice(0, k === "lesson" ? 10 : 6);
      if (!arr.length) return;
      html += '<div class="sr-kind">' + KIND_NAME[k] + " · " + (byKind[k] || []).length + "</div>";
      arr.forEach(function (it) {
        n++;
        var title = esc(it.t);
        terms.forEach(function (w) {
          if (w.length > 1) title = title.replace(new RegExp("(" + w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "gi"), "<mark>$1</mark>");
        });
        html += '<a class="sr' + (n === 1 ? " act" : "") + '" href="' + it.u + '">' +
          '<div class="t">' + title + '</div><div class="s">' + esc(it.s || "") + "</div></a>";
      });
    });
    box.innerHTML = html;
  }

  /* ---------------- 灯箱 ---------------- */
  var LBCAP = "";
  function openLB(artId, cap) {
    var svg = SVG[artId];
    if (!svg) return;
    $("#lbBody").innerHTML = '<div id="lbSvg">' + svg + "</div>";
    LBCAP = cap || "";
    $("#lbCap").textContent = LBCAP;
    $("#lightbox").classList.add("on");
    document.body.style.overflow = "hidden";
    var inner = $("#lbSvg");
    if (inner) inner.style.transform = "scale(1)";
    lbScale = 1;
  }
  var lbScale = 1;
  function applyZoom(f) {
    var el = $("#lbSvg");
    if (!el) return;
    el.style.transform = "scale(" + (lbScale = Math.min(3.5, Math.max(.6, f))) + ")";
  }
  function closeLB() {
    $("#lightbox").classList.remove("on");
    document.body.style.overflow = "";
  }

  /* ---------------- 路由 ---------------- */
  var app = $("#app");
  var cur = { view: "", id: "" };

  function parseHash() {
    var h = location.hash.replace(/^#\/?/, "");
    var anchor = "";
    var ai = h.indexOf("#");
    if (ai >= 0) { anchor = h.slice(ai + 1); h = h.slice(0, ai); }
    var qi = h.indexOf("?");
    var qs = "";
    if (qi >= 0) { qs = h.slice(qi + 1); h = h.slice(0, qi); }
    var parts = h.split("/").filter(Boolean);
    var q = {};
    qs.split("&").forEach(function (kv) {
      if (!kv) return;
      var i = kv.indexOf("=");
      q[decodeURIComponent(kv.slice(0, i))] = decodeURIComponent(kv.slice(i + 1).replace(/\+/g, " "));
    });
    return { parts: parts, q: q, anchor: anchor };
  }

  function route() {
    var r = parseHash(), p = r.parts, q = r.q;
    var html = "", view = p[0] || "home";

    if (view === "home") html = vHome();
    else if (view === "course") html = vCourse();
    else if (view === "lesson") html = vLesson(p[1]);
    else if (view === "timeline") html = vTimeline();
    else if (view === "readings") html = vReadings();
    else if (view === "reading") html = vReading(p[1]);
    else if (view === "artworks") html = vArtworks();
    else if (view === "artwork") html = vArtwork(p[1]);
    else if (view === "concepts") html = vConcepts(q.q, q.field, q.letter);
    else if (view === "concept") html = vConcept(p[1]);
    else if (view === "people") html = vPeople(q.q, q.school);
    else if (view === "person") html = vPerson(p[1]);
    else if (view === "shelf") html = vShelf();
    else if (view === "about") html = vAbout();
    else html = vMissing("页面不存在");

    app.innerHTML = html;
    cur = { view: view, id: p[1] || "" };
    document.title = (view === "lesson" && BYID[p[1]] ? BYID[p[1]].title + " · " : "") + "西方美学思想史";
    window.onscroll = null;
    window.scrollTo(0, 0);

    // 顶栏高亮
    $$("#topnav a").forEach(function (a) {
      a.classList.toggle("on", a.getAttribute("data-nav") === view ||
        (view === "concept" && a.getAttribute("data-nav") === "concepts") ||
        (view === "person" && a.getAttribute("data-nav") === "people") ||
        (view === "reading" && a.getAttribute("data-nav") === "readings") ||
        (view === "artwork" && a.getAttribute("data-nav") === "artworks") ||
        (view === "lesson" && a.getAttribute("data-nav") === "course"));
    });
    $("#topnav").classList.remove("on");

    afterRender(r);
  }

  function afterRender(r) {
    // 注入 SVG 图示
    $$("[data-art-figure]").forEach(function (el) {
      var id = el.getAttribute("data-art-figure");
      if (id && SVG[id]) {
        el.innerHTML = SVG[id];
      } else if (id) {
        el.innerHTML = '<div class="center muted small" style="padding:40px 10px">图示待补：' + esc(id) + "</div>";
        el.style.cursor = "default";
      } else {
        var fg = el.closest("figure");
        if (fg) fg.style.display = "none"; else el.style.display = "none";
      }
    });

    // 目录锚点
    $$("[data-anchor]").forEach(function (a) {
      a.addEventListener("click", function (e) {
        e.preventDefault();
        var t = document.getElementById(a.getAttribute("data-anchor"));
        if (t) {
          var y = t.getBoundingClientRect().top + window.pageYOffset - 78;
          window.scrollTo({ top: y, behavior: "smooth" });
        }
      });
    });

    if (cur.view === "lesson") initLessonView();
    if (cur.view === "course" && r.anchor) {
      var acc = document.getElementById(r.anchor);
      if (acc) {
        acc.classList.add("open");
        setTimeout(function () {
          var y = acc.getBoundingClientRect().top + window.pageYOffset - 80;
          window.scrollTo({ top: y, behavior: "smooth" });
        }, 40);
      }
    }
    if (cur.view === "concepts") initConceptFilter(r.q);
    if (cur.view === "people") initPeopleFilter(r.q);
    if (cur.view === "shelf") initShelf();
    if (cur.view === "course") initAccordions();
    if (cur.view === "home" || cur.view === "course") { /* 无额外 */ }
  }

  /* ---------------- 讲次页交互 ---------------- */
  var saveTimer = null;
  function initLessonView() {
    Store.touch(cur.id);

    // 恢复阅读位置
    var pos = Store.pos()[cur.id];
    if (pos && pos.r > 0.03) {
      requestAnimationFrame(function () {
        var max = document.documentElement.scrollHeight - window.innerHeight;
        window.scrollTo(0, Math.min(max, pos.r * max));
      });
    }

    // 滚动保存 + 书签记录当前位置
    window.onscroll = function () {
      if (saveTimer) clearTimeout(saveTimer);
      saveTimer = setTimeout(function () {
        var max = document.documentElement.scrollHeight - window.innerHeight;
        if (max > 200) Store.setPos(cur.id, Math.min(1, Math.max(0, window.pageYOffset / max)));
      }, 500);
    };
  }

  function currentHeading() {
    var hs = $$("#articleBody h2, #articleBody h3");
    var y = window.pageYOffset + 120, curT = "";
    hs.forEach(function (h) { if (h.getBoundingClientRect().top + window.pageYOffset <= y) curT = h.textContent; });
    return curT;
  }

  /* ---------------- 交互绑定（事件委托） ---------------- */
  document.addEventListener("click", function (e) {
    var t = e.target;

    // 顶部菜单
    if (t.closest("#btnMenu")) { $("#topnav").classList.toggle("on"); return; }
    if (t.closest("#btnSearch")) { openSearch(); return; }

    // 收藏
    var fav = t.closest('[data-act="fav"]');
    if (fav) {
      var id = fav.getAttribute("data-id");
      var on = Store.toggleFav(id);
      fav.classList.toggle("on", on);
      fav.innerHTML = (on ? ic("i-star-fill") + "<span>已收藏</span>" : ic("i-star") + "<span>收藏本讲</span>");
      return;
    }
    // 加书签
    var mk = t.closest('[data-act="mark"]');
    if (mk) {
      var lid = mk.getAttribute("data-id"), L = BYID[lid];
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var r = max > 0 ? Math.min(1, window.pageYOffset / max) : 0;
      Store.addMark({ id: lid, title: L ? L.title : lid, r: r, note: currentHeading() || "开篇", t: Date.now() });
      mk.classList.add("on");
      mk.innerHTML = ic("i-mark-fill") + "<span>已记录此处</span>";
      setTimeout(function () {
        mk.classList.remove("on");
        mk.innerHTML = ic("i-mark") + "<span>在此处加书签</span>";
      }, 1600);
      return;
    }
    // 移动端目录
    if (t.closest('[data-act="lnav"]')) { var n = $("#lnav"); if (n) n.classList.toggle("on"); return; }

    // 灯箱
    var fr = t.closest("[data-art-figure]");
    if (fr && cur.view !== "lesson") { /* 讲次页里的图示也可放大 */ }
    if (fr) {
      var aid = fr.getAttribute("data-art-figure");
      if (aid && SVG[aid]) {
        var cap = "";
        var fig = fr.closest("figure");
        if (fig) { var c = fig.querySelector("figcaption"); if (c) cap = c.textContent; }
        openLB(aid, cap);
        return;
      }
    }
    if (t.closest("#lbClose")) { closeLB(); return; }
    if (t.id === "lightbox") { closeLB(); return; }
    var zb = t.closest("[data-z]");
    if (zb) {
      var z = zb.getAttribute("data-z");
      applyZoom(z === "in" ? lbScale + .25 : z === "out" ? lbScale - .25 : 1);
      return;
    }

    // 书签页
    var uf = t.closest("[data-unfav]");
    if (uf) { Store.toggleFav(uf.getAttribute("data-unfav")); route(); return; }
    var dm = t.closest("[data-delmark]");
    if (dm) { Store.delMark(Number(dm.getAttribute("data-delmark"))); route(); return; }
    var tb = t.closest("#shelfTabs button");
    if (tb) {
      $$("#shelfTabs button").forEach(function (b) { b.classList.remove("on"); });
      tb.classList.add("on");
      $$("[data-panel]").forEach(function (pn) { pn.hidden = pn.getAttribute("data-panel") !== tb.getAttribute("data-t"); });
      return;
    }
    // 书签跳转到比例位置
    var gt = t.closest("[data-goto]");
    if (gt) {
      var ratio = parseFloat(gt.getAttribute("data-goto"));
      setTimeout(function () {
        var max = document.documentElement.scrollHeight - window.innerHeight;
        window.scrollTo(0, ratio * max);
      }, 300);
    }
  });

  // 折叠模块
  function initAccordions() {
    $$(".acc-h").forEach(function (hd) {
      hd.addEventListener("click", function () {
        hd.parentNode.classList.toggle("open");
      });
    });
  }

  /* ---------------- 词典筛选 ---------------- */
  function initConceptFilter(q) {
    var inp = $("#cfilter");
    if (!inp) return;
    var field = "全部", letter = q.letter || "";
    var chips = $("#fchips"), alpha = $("#alpha");
    if (chips) chips.addEventListener("click", function (e) {
      var b = e.target.closest("[data-field]");
      if (!b) return;
      field = b.getAttribute("data-field");
      $$("#fchips .chip").forEach(function (x) { x.classList.toggle("on", x === b); });
      apply();
    });
    if (alpha) alpha.addEventListener("click", function (e) {
      var b = e.target.closest("[data-letter]");
      if (!b || b.disabled) return;
      letter = b.getAttribute("data-letter");
      $$("#alpha button").forEach(function (x) { x.classList.toggle("on", x === b); });
      apply();
    });
    function apply() {
      var v = (inp.value || "").trim().toLowerCase();
      $$("#clist .card").forEach(function (c) {
        var okQ = !v || c.getAttribute("data-c").indexOf(v) >= 0;
        var okF = field === "全部" || c.getAttribute("data-field") === field;
        var okL = !letter || c.getAttribute("data-l") === letter;
        c.style.display = (okQ && okF && okL) ? "" : "none";
      });
    }
    inp.addEventListener("input", apply);
    if (letter) apply();
  }

  /* ---------------- 人物筛选 ---------------- */
  function initPeopleFilter(q) {
    var inp = $("#pfilter"), chips = $("#schips");
    if (!inp) return;
    var school = q.school || "";
    function apply() {
      var v = (inp.value || "").trim().toLowerCase();
      $$("#plist .person-card").forEach(function (c) {
        var okQ = !v || c.getAttribute("data-p").indexOf(v) >= 0;
        var okS = !school || c.getAttribute("data-in") === "1";
        c.style.display = (okQ && okS) ? "" : "none";
      });
    }
    if (chips) chips.addEventListener("click", function (e) {
      var b = e.target.closest("[data-school]");
      if (!b) return;
      school = b.getAttribute("data-school");
      $$("#schips .chip").forEach(function (x) { x.classList.toggle("on", x === b); });
      apply();
    });
    inp.addEventListener("input", apply);
    if (school) apply();
  }

  function initShelf() { /* 面板切换由事件委托处理 */ }

  /* ---------------- 搜索层 ---------------- */
  function openSearch() {
    $("#searchOverlay").classList.add("on");
    var i = $("#searchInput");
    i.value = "";
    doSearch("");
    setTimeout(function () { i.focus(); }, 30);
  }
  function closeSearch() {
    $("#searchOverlay").classList.remove("on");
  }
  var searchTimer = null;
  document.addEventListener("input", function (e) {
    if (e.target.id === "searchInput") {
      var v = e.target.value;
      if (searchTimer) clearTimeout(searchTimer);
      searchTimer = setTimeout(function () { doSearch(v); }, 90);
    }
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { closeSearch(); closeLB(); return; }
    if (e.key === "/" && !/(input|textarea)/i.test(document.activeElement.tagName)) {
      e.preventDefault(); openSearch(); return;
    }
    if (!$("#searchOverlay").classList.contains("on")) return;
    var items = $$("#searchRes .sr");
    if (!items.length) return;
    var act = items.findIndex ? items.findIndex(function (x) { return x.classList.contains("act"); }) : -1;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      var n1 = items[(act + 1) % items.length];
      items.forEach(function (x) { x.classList.remove("act"); }); n1.classList.add("act"); n1.scrollIntoView({ block: "nearest" });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      var n2 = items[(act - 1 + items.length) % items.length];
      items.forEach(function (x) { x.classList.remove("act"); }); n2.classList.add("act"); n2.scrollIntoView({ block: "nearest" });
    } else if (e.key === "Enter") {
      var sel = items[act] || items[0];
      if (sel) { location.hash = sel.getAttribute("href").slice(1); closeSearch(); }
    }
  });
  document.addEventListener("click", function (e) {
    if (e.target.id === "searchOverlay") closeSearch();
    var a = e.target.closest("#searchRes .sr");
    if (a) closeSearch();
  });

  window.addEventListener("hashchange", route);
  route();
  window.addEventListener("resize", function () {
    if (window.innerWidth > 900) {
      var n = $("#lnav"); if (n) n.classList.remove("on");
    }
  });
})();
