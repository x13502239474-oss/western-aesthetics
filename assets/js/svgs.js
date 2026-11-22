/* =========================================================
   西方美学思想史 —— 图示资源
   全部为手绘 SVG 示意图（构图／比例／结构分析），不使用任何照片
   ========================================================= */
(function () {
  "use strict";

  var INK = "#3b2a20", MID = "#7d6b57", GOLD = "#a8823f", GOLD2 = "#c2a05c";
  var FILL = "#f4eddd", FILL2 = "#e8dcc4", PAPER = "#fffdf8", RED = "#8d3b2c";

  function w(inner, h) {
    return '<svg viewBox="0 0 640 ' + (h || 400) + '" xmlns="http://www.w3.org/2000/svg" ' +
      'font-family="Palatino Linotype, Palatino, Georgia, serif">' +
      '<rect width="640" height="' + (h || 400) + '" fill="' + PAPER + '"/>' + inner + "</svg>";
  }
  function txt(x, y, s, o) {
    o = o || {};
    return '<text x="' + x + '" y="' + y + '" fill="' + (o.c || MID) + '" font-size="' + (o.s || 11) +
      '" text-anchor="' + (o.a || "start") + '" letter-spacing="' + (o.ls || 1) + '"' +
      (o.i ? ' font-style="italic"' : "") + ">" + s + "</text>";
  }
  function ln(x1, y1, x2, y2, o) {
    o = o || {};
    return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' +
      (o.c || INK) + '" stroke-width="' + (o.w || 1) + '"' + (o.d ? ' stroke-dasharray="' + o.d + '"' : "") + "/>";
  }
  function circ(cx, cy, r, o) {
    o = o || {};
    return '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + (o.f || "none") +
      '" stroke="' + (o.c || INK) + '" stroke-width="' + (o.w || 1) + '"' +
      (o.d ? ' stroke-dasharray="' + o.d + '"' : "") + "/>";
  }
  function path(d, o) {
    o = o || {};
    return '<path d="' + d + '" fill="' + (o.f || "none") + '" stroke="' + (o.c || INK) +
      '" stroke-width="' + (o.w || 1) + '"' + (o.d ? ' stroke-dasharray="' + o.d + '"' : "") +
      (o.cap ? ' stroke-linecap="round"' : "") + "/>";
  }
  function arrow(x1, y1, x2, y2, o) {
    o = o || {};
    var a = Math.atan2(y2 - y1, x2 - x1), s = o.s || 6;
    return ln(x1, y1, x2, y2, o) +
      path("M" + (x2 - s * Math.cos(a - .4)) + " " + (y2 - s * Math.sin(a - .4)) +
        "L" + x2 + " " + y2 + "L" + (x2 - s * Math.cos(a + .4)) + " " + (y2 - s * Math.sin(a + .4)),
        { c: o.c || INK, w: o.w || 1 });
  }
  function label(x, y, s) { return txt(x, y, s, { s: 10, c: GOLD, ls: 2 }); }

  var S = {};

  /* ---------- 首屏：神庙立面 ---------- */
  S.__hero = (function () {
    var s = "";
    // 台阶
    for (var i = 0; i < 3; i++) s += ln(70 - i * 8, 372 + i * 9, 570 + i * 8, 372 + i * 9, { c: GOLD2, w: 1.2 });
    // 柱
    for (var c = 0; c < 6; c++) {
      var x = 132 + c * 76;
      s += ln(x, 200, x, 366, { c: GOLD2, w: 1.1 });
      s += ln(x + 17, 200, x + 17, 366, { c: GOLD2, w: 1.1 });
      // 柱头
      s += path("M" + (x - 6) + " 200 H" + (x + 23) + " M" + (x - 3) + " 193 H" + (x + 20) + " M" + (x + 2) + " 186 H" + (x + 15), { c: GOLD, w: 1.1 });
      // 柱础
      s += ln(x - 5, 366, x + 22, 366, { c: GOLD, w: 1.2 });
      // 卷杀（柱身微凸）
      s += path("M" + (x + 8.5) + " 205 Q" + (x + 11) + " 285 " + (x + 8.5) + " 362", { c: GOLD2, w: .7, d: "2 4" });
    }
    // 额枋与檐部
    s += ln(112, 186, 528, 186, { c: GOLD, w: 1.4 });
    s += ln(108, 170, 532, 170, { c: GOLD, w: 1.4 });
    s += ln(112, 186, 112, 170, { c: GOLD, w: 1 });
    s += ln(528, 186, 528, 170, { c: GOLD, w: 1 });
    // 山花
    s += path("M108 170 L320 92 L532 170", { c: GOLD, w: 1.4 });
    s += path("M132 166 L320 104 L508 166", { c: GOLD2, w: .9 });
    // 装饰点
    for (var t = 0; t < 9; t++) s += circ(320 - 4 + t * 0.001, 158, 0, {});
    s += txt(320, 152, "ΑΘΗΝΑΙ", { a: "middle", s: 9, c: GOLD2, ls: 4 });
    s += txt(320, 386, "CLASSICA · MDCCL", { a: "middle", s: 9, c: GOLD2, ls: 5 });
    return '<svg viewBox="0 0 640 400" xmlns="http://www.w3.org/2000/svg" font-family="Palatino Linotype, Palatino, Georgia, serif">' + s + "</svg>";
  })();

  /* ---------- 1 米洛斯的维纳斯 ---------- */
  S["a-venus-de-milo"] = (function () {
    var s = "";
    // 八头身比例尺
    var top = 60, unit = 33;
    for (var i = 0; i <= 8; i++) {
      var y = top + i * unit;
      s += ln(120, y, 470, y, { c: GOLD2, w: .7, d: i === 8 ? "" : "2 5" });
      s += txt(74, y + 4, (8 - i) || "", { s: 9, c: GOLD, a: "middle" });
    }
    s += ln(78, top, 78, top + 8 * unit, { c: GOLD, w: 1 });
    s += label(46, 40, "八头身");
    // 身体轮廓（简化）
    s += path("M300 78 q-16 6 -20 22 q-3 14 6 22 q-22 8 -30 30 q-10 26 -6 52 q-6 40 -18 60 q-20 40 -12 62 q6 14 22 12 l30 -6 q14 -4 16 -18 q2 -18 -4 -34 q-4 -12 -2 -22 q6 -26 22 -40 q20 -18 24 -46 q4 -30 -14 -56 q-6 -10 -6 -20 q0 -12 -8 -18z",
      { f: FILL, c: INK, w: 1.3 });
    // 断臂处
    s += path("M280 122 l-26 10", { c: INK, w: 1.2 });
    s += circ(266, 130, 7, { f: FILL2, c: MID, w: .8 });
    s += txt(238, 134, "断臂", { s: 10, c: RED });
    // 重心与 S 轴
    s += path("M300 80 C282 160 330 230 296 300 C272 350 300 380 306 392", { c: GOLD, w: 1.6, d: "6 4" });
    s += ln(306, 392, 306, 240, { c: RED, w: .9, d: "3 4" });
    s += txt(312, 236, "重心垂线", { s: 10, c: RED });
    // 衣褶对角线
    s += path("M262 250 L338 330 M270 268 L346 344", { c: MID, w: .9 });
    s += label(120, 384, "S 形动态轴 · 对立式平衡");
    s += txt(470, 384, "石·约前 150—前 125", { s: 10, c: MID, a: "end" });
    return w(s);
  })();

  /* ---------- 2 拉奥孔 ---------- */
  S["a-laocoon"] = (function () {
    var s = "";
    // 三角形骨架
    s += path("M320 78 L150 344 L500 344 Z", { c: GOLD, w: 1.2, d: "7 5" });
    s += label(296, 60, "顶点：头部");
    // 三个人体（抽象）
    s += path("M320 90 q-14 4 -16 22 q-2 16 10 22 q-26 12 -34 44 q-10 34 4 62 q10 22 30 18 q16 -4 18 -22 q2 -18 -6 -34 q-6 -14 0 -22 q10 -14 26 -16 q18 -2 22 -18 q6 -22 -10 -38 q-8 -8 -8 -18 q0 -12 -12 -20z",
      { f: FILL, c: INK, w: 1.4 });
    s += path("M262 160 q-22 14 -28 44 q-8 34 6 60 q8 16 22 12 q10 -4 8 -18", { f: FILL2, c: MID, w: 1.1 });
    s += path("M386 170 q22 16 26 46 q6 32 -8 56 q-8 14 -22 10 q-10 -4 -6 -18", { f: FILL2, c: MID, w: 1.1 });
    // 螺旋箭头
    s += path("M300 300 C240 300 226 240 268 220 C306 202 352 214 366 248", { c: RED, w: 1.4 });
    s += arrow(360, 240, 366, 250, { c: RED, w: 1.2 });
    s += txt(196, 306, "躯干扭转：胸腔左旋", { s: 10, c: RED });
    // 张力标记
    s += ln(330, 150, 356, 148, { c: MID, w: .8, d: "2 3" });
    s += txt(360, 152, "颈部肌肉", { s: 9.5, c: MID });
    s += ln(302, 236, 336, 246, { c: MID, w: .8, d: "2 3" });
    s += txt(340, 250, "腹直肌张力", { s: 9.5, c: MID });
    s += txt(320, 372, "用肌肉与体块表达痛苦，面部保持节制", { s: 10, c: MID, a: "middle" });
    return w(s);
  })();

  /* ---------- 3 帕特农 ---------- */
  S["a-parthenon"] = (function () {
    var s = "";
    // 台基起拱（夸张）
    s += path("M60 330 Q320 316 580 330", { c: RED, w: 1.4 });
    s += txt(320, 348, "台基中线起拱（曲率放大）", { a: "middle", s: 10, c: RED });
    // 柱列
    for (var i = 0; i < 8; i++) {
      var x = 96 + i * 64, h = 168;
      s += path("M" + (x - 9) + " 316 q" + (9 + 3) + " " + (-h / 2) + " 0 " + (-h), { c: INK, w: 1 });
      s += path("M" + (x + 9) + " 316 q-3 " + (-h / 2) + " 0 " + (-h), { c: INK, w: 1 });
      s += ln(x - 11, 148, x + 11, 148, { c: GOLD, w: 1.2 });
      s += ln(x - 8, 156, x + 8, 156, { c: GOLD, w: 1 });
      s += ln(x - 11, 316, x + 11, 316, { c: GOLD, w: 1.2 });
      if (i === 0 || i === 7) {
        s += path("M" + (x - 14) + " 316 L" + (x - 12) + " 148", { c: RED, w: 1, d: "3 3" });
        s += txt(x + (i ? 16 : -18), 250, "角柱加粗", { s: 9, c: RED, a: i ? "start" : "end" });
      }
    }
    // 檐部与山花
    s += ln(76, 148, 564, 148, { c: GOLD, w: 1.5 });
    s += ln(76, 128, 564, 128, { c: GOLD, w: 1.5 });
    s += path("M76 128 L320 54 L564 128", { c: GOLD, w: 1.5 });
    s += path("M96 124 L320 66 L544 124", { c: GOLD2, w: 1 });
    // 角部矛盾标注
    s += circ(76, 148, 4, { f: RED, c: RED });
    s += txt(44, 118, "角部矛盾", { s: 9.5, c: RED });
    // 视线
    s += arrow(320, 384, 320, 356, { c: MID, w: .9, d: "3 3" });
    s += txt(320, 396, "观看者视高（8.8 米）", { a: "middle", s: 9.5, c: MID });
    return w(s);
  })();

  /* ---------- 4 雅典学院 ---------- */
  S["a-school-of-athens"] = (function () {
    var s = "", vx = 372, vy = 250;
    function arch(cx, w, top, bottom, sw) {
      var r = w / 2;
      return path("M" + (cx - r) + " " + bottom + " V" + (top + r) +
        " A" + r + " " + r + " 0 0 1 " + (cx + r) + " " + (top + r) + " V" + bottom,
        { c: INK, w: sw || 1.2 });
    }
    // 拱内暗部
    s += path("M302 300 V171 A70 70 0 0 1 442 171 V300 Z", { f: "#efe6d4", c: "none", w: 0 });
    // 三连拱
    s += arch(200, 118, 134, 300, 1.1);
    s += arch(372, 140, 101, 300, 1.5);
    s += arch(524, 118, 134, 300, 1.1);
    // 檐口
    s += ln(118, 92, 622, 92, { c: GOLD, w: 1.1 });
    s += ln(118, 84, 622, 84, { c: GOLD2, w: .8 });
    s += ln(141, 300, 583, 300, { c: INK, w: 1.1 });
    // 透视地砖
    for (var i = 0; i <= 10; i++) {
      s += ln(130 + i * 48, 300, -240 + i * 168, 400, { c: GOLD2, w: .55, d: "3 6" });
    }
    for (var j = 1; j <= 5; j++) {
      s += ln(50, 300 + Math.pow(j / 5, 1.6) * 100, 630, 300 + Math.pow(j / 5, 1.6) * 100, { c: GOLD2, w: .55, d: "3 6" });
    }
    // 台阶
    s += ln(300, 307, 444, 307, { c: MID, w: .9 });
    s += ln(314, 314, 430, 314, { c: MID, w: .9 });
    s += ln(328, 321, 416, 321, { c: MID, w: .9 });

    // 剪影人物
    function fig(x, base, h, fill, sw) {
      var ry = h * .3, rx = h * .155;
      return '<ellipse cx="' + x + '" cy="' + (base - ry - 1) + '" rx="' + rx + '" ry="' + ry +
        '" fill="' + (fill || FILL) + '" stroke="' + INK + '" stroke-width="' + (sw || .8) + '"/>' +
        circ(x, base - h * .68, h * .1, { f: fill || FILL, c: INK, w: sw || .8 });
    }
    // 左组
    [[172, 300, 62], [196, 300, 58], [220, 300, 60], [156, 308, 56], [240, 308, 54]].forEach(function (g) {
      s += fig(g[0], g[1], g[2], FILL2);
    });
    // 右组
    [[452, 300, 60], [476, 300, 58], [500, 300, 62], [524, 300, 56], [548, 308, 54], [488, 308, 52]].forEach(function (g) {
      s += fig(g[0], g[1], g[2], FILL2);
    });
    // 中央两位
    s += fig(356, 300, 72, "#f0e5cd", 1.1);
    s += fig(390, 300, 70, FILL, 1.1);
    s += ln(356, 264, 340, 226, { c: INK, w: 2, cap: 1 });
    s += ln(390, 264, 410, 288, { c: RED, w: 2, cap: 1 });
    // 前景赫拉克利特
    s += fig(108, 372, 78, "#e6d8bd", 1);

    // 视平线
    s += ln(50, vy, 630, vy, { c: RED, w: .9, d: "6 4" });
    s += txt(52, vy - 7, "视平线", { s: 9.5, c: RED });
    s += circ(vx, vy, 4, { f: "none", c: GOLD, w: 1.4 });
    s += circ(vx, vy, 1.4, { f: GOLD, c: GOLD });

    s += txt(152, 176, "左：毕达哥拉斯", { s: 9.5, c: MID });
    s += txt(508, 176, "右：欧几里得", { s: 9.5, c: MID, a: "middle" });
    s += txt(336, 222, "指上", { s: 9.5, c: INK, a: "end" });
    s += txt(420, 292, "按地", { s: 9.5, c: RED });
    s += txt(60, 394, "赫拉克利特（米开朗基罗像）", { s: 9, c: MID });
    s += txt(320, 40, "单点透视：所有后退线交于中央拱下的灭点", { a: "middle", s: 10, c: GOLD });
    return w(s);
  })();

  /* ---------- 5 圣特蕾莎的沉迷 ---------- */
  S["a-santa-teresa"] = (function () {
    var s = "";
    // 壁龛
    s += path("M180 360 V180 q0 -80 70 -80 q70 0 70 80 V360", { c: GOLD, w: 1.3 });
    s += path("M196 360 V184 q0 -70 54 -70 q54 0 54 70 V360", { c: GOLD2, w: .9 });
    // 隐蔽光源（右上）
    var lx = 520, ly = 96;
    s += circ(lx, ly, 9, { f: GOLD2, c: GOLD, w: 1 });
    for (var i = 0; i < 9; i++) {
      var a = Math.PI * 0.62 + i * 0.075;
      s += ln(lx + Math.cos(a) * 12, ly + Math.sin(a) * 12, lx + Math.cos(a) * 240, ly + Math.sin(a) * 240,
        { c: GOLD2, w: .8, d: "10 7" });
    }
    s += txt(520, 74, "隐蔽光源（窗外）", { s: 10, c: GOLD, a: "middle" });
    // 云与身体
    s += path("M200 300 q40 -34 90 -30 q30 -26 70 -12 q34 -6 46 16 q26 6 22 28 q-6 24 -42 24 l-120 -2 q-40 0 -66 -24z", { f: FILL2, c: MID, w: 1 });
    s += path("M262 292 q-10 -40 14 -58 q22 -16 44 -4 q20 12 16 36 q-4 22 -22 28 q-30 10 -52 -2z", { f: FILL, c: INK, w: 1.2 });
    // 天使与箭
    s += ln(360, 150, 316, 240, { c: RED, w: 1.8 });
    s += arrow(320, 232, 312, 250, { c: RED, w: 1.6 });
    s += txt(372, 148, "金箭", { s: 10, c: RED });
    // 衣褶旋转
    s += path("M210 328 q60 26 130 14 q50 -10 62 -34", { c: MID, w: 1.1 });
    s += path("M214 342 q66 30 140 16", { c: MID, w: .8, d: "4 4" });
    // 三角形总体构图
    s += path("M250 358 L306 100 L470 300", { c: GOLD, w: 1, d: "6 5" });
    s += label(258, 96, "构图主轴：由右上向左下的侵入");
    s += txt(320, 384, "雕塑 · 建筑 · 光线的整体艺术（bel composto）", { a: "middle", s: 10, c: MID });
    return w(s);
  })();

  /* ---------- 6 印象·日出 ---------- */
  S["a-impression-sunrise"] = (function () {
    var s = "";
    s += "<rect x='40' y='50' width='560' height='300' fill='" + FILL + "' stroke='" + INK + "' stroke-width='1'/>";
    // 天空 / 水
    s += ln(40, 196, 600, 196, { c: MID, w: 1 });
    s += txt(48, 70, "天空：冷灰蓝", { s: 10, c: MID });
    // 太阳
    s += circ(430, 160, 17, { f: "#d98b52", c: "#b96a33", w: 1 });
    s += txt(430, 132, "橙红日轮（高饱和度，直接并置）", { s: 9.5, c: "#a8562a", a: "middle" });
    // 反射
    for (var i = 0; i < 7; i++) {
      s += ln(404 + i * 8, 210 + i * 12, 460 - i * 5, 210 + i * 12, { c: "#d3a06a", w: 2.4 - i * 0.2 });
    }
    // 小舟与人物
    s += path("M196 232 l44 0 l-6 10 l-32 0z", { f: "#5b5a52", c: INK, w: .8 });
    s += ln(214, 232, 214, 212, { c: INK, w: 1.2 });
    s += txt(196, 262, "剪影：以深色小块压缩形体", { s: 9.5, c: MID });
    // 笔触示意
    var strokes = [[92, 250, 60], [120, 274, 44], [300, 300, 70], [470, 286, 54], [90, 160, 48], [200, 120, 40]];
    strokes.forEach(function (p) {
      s += path("M" + p[0] + " " + p[1] + " q" + (p[2] / 2) + " -6 " + p[2] + " 2", { c: "#8a9aa8", w: 3.2, cap: 1 });
    });
    // 互补对比标记
    s += circ(112, 196, 11, { c: GOLD, w: 1, d: "2 3" });
    s += txt(112, 232, "橙／蓝互补并置", { s: 9.5, c: GOLD, a: "middle" });
    s += txt(320, 372, "笔触的单位化：每一笔即一个视觉判断，不再有轮廓线", { a: "middle", s: 10, c: MID });
    return w(s);
  })();

  /* ---------- 7 亚维农少女 ---------- */
  S["a-avignon"] = (function () {
    var s = "";
    s += "<rect x='56' y='54' width='528' height='300' fill='" + FILL + "' stroke='" + INK + "' stroke-width='1'/>";
    // 面化分割
    var seg = ["M56 54 L240 54 L200 354 L56 354Z", "M240 54 L360 54 L340 354 L200 354Z",
      "M360 54 L470 54 L480 354 L340 354Z", "M470 54 L584 54 L584 354 L480 354Z"];
    seg.forEach(function (d, i) {
      s += path(d, { f: i % 2 ? FILL2 : "#f7f1e3", c: MID, w: 1 });
    });
    // 五个人物（几何化）
    var figs = [[132, 210], [210, 196], [300, 200], [400, 194], [504, 214]];
    figs.forEach(function (f, i) {
      var x = f[0], y = f[1];
      s += path("M" + x + " " + (y - 34) + " l26 0 l6 40 l-10 86 l-30 0 l-8 -86z", { f: FILL, c: INK, w: 1.1 });
      s += circ(x + 13, y - 46, 13, { f: FILL, c: INK, w: 1.1 });
      // 面具式五官
      s += ln(x + 5, y - 50, x + 11, y - 44, { c: INK, w: 1.2 });
      s += ln(x + 18, y - 50, x + 23, y - 44, { c: INK, w: 1.2 });
      s += ln(x + 10, y - 36, x + 18, y - 36, { c: INK, w: .9 });
    });
    // 伊比利亚/非洲面具式右二人
    s += txt(504, 372, "右侧二人：面具化的正面与侧面并置", { s: 9.5, c: RED, a: "end" });
    // 多视点箭头
    s += arrow(300, 120, 340, 108, { c: RED, w: 1 });
    s += arrow(300, 150, 262, 140, { c: RED, w: 1 });
    s += txt(306, 96, "同一面部同时给出正面与侧面", { s: 9.5, c: RED });
    // 背景棱面
    s += path("M56 300 L200 250 L340 268 L480 236 L584 262", { c: GOLD, w: 1, d: "6 4" });
    s += label(64, 330, "背景与人体共用同一套棱面");
    return w(s);
  })();

  /* ---------- 8 格尔尼卡 ---------- */
  S["a-guernica"] = (function () {
    var s = "";
    s += "<rect x='40' y='50' width='560' height='300' fill='#f6f3ec' stroke='" + INK + "' stroke-width='1'/>";
    // 三联分割
    s += ln(226, 50, 226, 350, { c: GOLD, w: 1, d: "5 4" });
    s += ln(414, 50, 414, 350, { c: GOLD, w: 1, d: "5 4" });
    s += txt(133, 68, "左：公牛与母亲", { s: 9.5, c: GOLD, a: "middle" });
    s += txt(320, 68, "中：马与灯", { s: 9.5, c: GOLD, a: "middle" });
    s += txt(507, 68, "右：举灯者与火", { s: 9.5, c: GOLD, a: "middle" });
    // 中央三角
    s += path("M320 82 L200 320 L440 320 Z", { c: INK, w: 1.2 });
    // 眼与灯
    s += path("M300 152 q20 -12 40 0 q-20 16 -40 0z", { f: FILL, c: INK, w: 1 });
    s += circ(320, 154, 4, { f: INK });
    s += ln(320, 104, 320, 140, { c: RED, w: 1.2 });
    s += txt(330, 122, "灯＝电灯泡，也是眼", { s: 9.5, c: RED });
    // 简化形体
    s += path("M96 300 q-10 -40 22 -52 q-8 -20 12 -26 q16 -4 20 14 q26 6 18 30 q-6 20 -30 24 q-24 4 -42 10z", { f: FILL2, c: INK, w: 1 });
    s += path("M430 300 q-6 -34 24 -40 q22 -4 26 16 q20 10 10 30 q-8 16 -34 8z", { f: FILL2, c: INK, w: 1 });
    // 黑白灰条
    var tones = ["#ffffff", "#e7e2d6", "#c9c1b1", "#a49a88", "#6d655a", "#3b2a20"];
    tones.forEach(function (c, i) {
      s += "<rect x='" + (44 + i * 26) + "' y='364' width='24' height='14' fill='" + c + "' stroke='" + MID + "' stroke-width='.6'/>";
    });
    s += txt(210, 376, "黑白灰：取消色彩的抒情性，只剩结构与惨叫", { s: 9.5, c: MID });
    return w(s);
  })();

  /* ---------- 9 构成第七号 ---------- */
  S["a-composition-vii"] = (function () {
    var s = "";
    s += "<rect x='44' y='46' width='552' height='308' fill='#fdfaf2' stroke='" + INK + "' stroke-width='1'/>";
    // 大色块
    s += path("M70 70 L250 60 L300 170 L150 220Z", { f: "#d9b56a", c: "none", w: 0 });
    s += path("M380 60 L560 80 L540 200 L400 180Z", { f: "#9e3d2f", c: "none", w: 0 });
    s += path("M300 240 L470 250 L440 330 L320 320Z", { f: "#6b7f8e", c: "none", w: 0 });
    s += path("M120 250 L240 262 L210 336 L110 320Z", { f: "#2f3b45", c: "none", w: 0 });
    // 黑线与圆
    s += path("M60 200 C200 150 260 240 380 180 S520 120 580 160", { c: INK, w: 4, cap: 1 });
    s += path("M120 330 C240 300 300 220 420 210", { c: INK, w: 3, cap: 1 });
    s += circ(250, 160, 40, { c: INK, w: 2.4 });
    s += circ(430, 250, 18, { f: INK, c: INK, w: 1 });
    s += circ(160, 120, 9, { f: RED, c: RED, w: 1 });
    // 力线
    s += arrow(96, 340, 300, 130, { c: RED, w: 1, d: "5 4" });
    s += txt(304, 128, "主对角线：重量由左下向右上抬升", { s: 9.5, c: RED });
    s += label(60, 40, "点·线·面·色：不指涉任何对象");
    s += txt(320, 380, "色彩与形状彼此抗衡，画面靠张力而非对称取得平衡", { a: "middle", s: 10, c: MID });
    return w(s);
  })();

  /* ---------- 10 百老汇爵士乐 ---------- */
  S["a-broadway-boogie-woogie"] = (function () {
    var s = "", cols = ["#e8c93f", "#d8563c", "#3a6ea8", "#e9e2cf"];
    s += "<rect x='56' y='44' width='528' height='312' fill='#fdfaf2' stroke='" + INK + "' stroke-width='1'/>";
    // 网格与色块
    for (var y = 0; y < 7; y++) {
      for (var x = 0; x < 9; x++) {
        if ((x * 3 + y * 5) % 4 === 0) {
          s += "<rect x='" + (66 + x * 56) + "' y='" + (54 + y * 40) + "' width='" + (14 + (x % 3) * 12) +
            "' height='" + (10 + (y % 2) * 8) + "' fill='" + cols[(x + y) % 4] + "'/>";
        }
      }
    }
    // 粗黑线（街道）
    s += ln(56, 176, 584, 176, { c: INK, w: 5 });
    s += ln(56, 296, 584, 296, { c: INK, w: 5 });
    s += ln(340, 44, 340, 356, { c: INK, w: 5 });
    s += ln(140, 44, 140, 356, { c: INK, w: 3 });
    // 节奏标记
    var beats = [0, 1, 0, 0, 1, 0, 1, 0];
    beats.forEach(function (b, i) {
      if (b) s += circ(96 + i * 60, 372, 4, { f: RED, c: RED });
    });
    s += txt(320, 392, "切分音的视觉对应：色块不等距，重音落在弱拍位置", { a: "middle", s: 10, c: MID });
    s += label(64, 36, "直线即城市，色块即爵士");
    return w(s);
  })();

  /* ---------- 11 英雄交响曲 ---------- */
  S["a-heroica"] = (function () {
    var s = "", y0 = 300;
    // 时间轴
    s += ln(60, y0, 590, y0, { c: INK, w: 1.4 });
    s += arrow(586, y0, 596, y0, { c: INK, w: 1.2 });
    s += txt(596, y0 + 18, "时间", { s: 10, c: MID, a: "end" });
    // 四乐章段落
    var seg = [[60, 200, "I  allegro con brio", "奏鸣曲式：展开部极长"],
      [200, 300, "II  葬礼进行曲", "c 小调"],
      [300, 420, "III 谐谑曲", "取代小步舞曲"],
      [420, 580, "IV 变奏终曲", "低音主题变奏"]];
    seg.forEach(function (g) {
      s += ln(g[0], y0, g[0], y0 - 18, { c: GOLD, w: 1 });
      s += "<rect x='" + (g[0] + 4) + "' y='" + (y0 + 8) + "' width='" + (g[1] - g[0] - 8) + "' height='26' fill='" + FILL + "' stroke='" + GOLD2 + "' stroke-width='.8'/>";
      s += txt(g[0] + 8, y0 + 25, g[2], { s: 9.5, c: INK });
      s += txt(g[0] + 8, y0 + 48, g[3], { s: 9, c: MID });
    });
    // 张力曲线
    s += path("M70 260 C130 200 170 180 196 236 C230 300 260 150 300 210 C340 270 380 200 420 240 C470 288 520 170 570 200",
      { c: RED, w: 1.8 });
    // 著名的「错音」
    s += circ(196, 236, 6, { f: RED, c: RED });
    s += txt(196, 214, "展开部前的提前进入（E♮）", { s: 9.5, c: RED, a: "middle" });
    s += label(64, 60, "张力曲线：期待—延迟—解决");
    s += txt(320, 380, "第一乐章长度与展开部的比例越界，是「形式破裂」的经典案例", { a: "middle", s: 10, c: MID });
    return w(s);
  })();

  /* ---------- 12 特里斯坦 ---------- */
  S["a-tristan"] = (function () {
    var s = "";
    var keys = ["F", "B", "D♯", "G♯"], ys = [140, 120, 104, 88];
    // 谱面横线
    for (var i = 0; i < 5; i++) s += ln(80, 96 + i * 12, 560, 96 + i * 12, { c: GOLD2, w: .6 });
    // 和弦音
    keys.forEach(function (k, i) {
      s += circ(150 + i * 42, ys[i], 6, { f: RED, c: RED });
      s += txt(150 + i * 42, ys[i] - 14, k, { s: 12, c: RED, a: "middle" });
    });
    s += txt(230, 60, "「特里斯坦和弦」：F–B–D♯–G♯", { s: 11, c: RED, a: "middle" });
    // 未解决的箭头
    s += path("M300 100 C360 100 380 150 420 150", { c: INK, w: 1.4 });
    s += path("M420 150 C460 150 480 120 520 120", { c: INK, w: 1.4, d: "5 4" });
    s += arrow(514, 118, 526, 120, { c: INK, w: 1.2 });
    s += txt(420, 176, "不断延宕的解决：属七 → 另一个属七", { s: 10, c: INK, a: "middle" });
    // 主导动机网格
    s += ln(80, 220, 560, 220, { c: GOLD, w: 1 });
    var mot = ["渴望", "目光", "魔药", "爱之死"];
    mot.forEach(function (m, i) {
      var x = 110 + i * 118;
      s += path("M" + x + " 250 q18 -22 36 0 q18 22 36 0", { c: GOLD, w: 1.4 });
      s += txt(x + 36, 274, m + "动机", { s: 9.5, c: MID, a: "middle" });
    });
    // 半音阶标记
    s += txt(320, 320, "半音化与持续转调：调性中心被抽空，张力无处落地", { a: "middle", s: 10, c: MID });
    s += label(80, 350, "歌剧《特里斯坦与伊索尔德》1865 年首演");
    s += txt(320, 380, "「总体艺术作品」的技术底座：音乐承担戏剧的全部内在动作", { a: "middle", s: 10, c: GOLD });
    return w(s);
  })();

  /* ---------- 13 巴塞罗那德国馆 ---------- */
  S["a-barcelona-pavilion"] = (function () {
    var s = "";
    // 基座
    s += "<rect x='90' y='70' width='460' height='260' fill='" + FILL + "' stroke='" + INK + "' stroke-width='1.2'/>";
    // 两片水池
    s += "<rect x='104' y='250' width='150' height='66' fill='#d7e0e2' stroke='" + GOLD + "' stroke-width='.9'/>";
    s += "<rect x='330' y='284' width='204' height='32' fill='#d7e0e2' stroke='" + GOLD + "' stroke-width='.9'/>";
    s += txt(110, 244, "水池（反射面）", { s: 9, c: GOLD });
    // 自由墙面
    s += ln(140, 86, 140, 232, { c: INK, w: 3 });
    s += ln(140, 160, 380, 160, { c: INK, w: 3 });
    s += ln(300, 86, 300, 160, { c: INK, w: 3 });
    s += ln(420, 160, 420, 316, { c: INK, w: 3 });
    s += ln(420, 210, 540, 210, { c: INK, w: 3 });
    // 玛瑙石墙
    s += "<rect x='300' y='86' width='16' height='74' fill='" + "#c9a86a" + "' stroke='" + GOLD + "' stroke-width='.8'/>";
    s += txt(322, 120, "玛瑙石墙", { s: 9, c: GOLD });
    // 八根十字柱
    for (var i = 0; i < 4; i++) {
      for (var j = 0; j < 2; j++) {
        var x = 180 + i * 96, y = 200 + j * 66;
        s += path("M" + x + " " + (y - 7) + " h14 M" + (x + 7) + " " + (y - 14) + " v28", { c: RED, w: 1.6 });
        s += circ(x + 7, y, 2, { f: RED, c: RED });
      }
    }
    s += txt(180, 330, "十字形钢柱（镀铬）脱离墙体承重", { s: 9.5, c: RED });
    // 屋顶
    s += "<rect x='90' y='70' width='460' height='10' fill='" + FILL2 + "' stroke='" + INK + "' stroke-width='1'/>";
    s += label(96, 58, "平面示意：墙不承重，空间由自由立板与屋面滑动而成");
    s += txt(320, 356, "「少即是多」：材料的精确交接替代装饰", { a: "middle", s: 10, c: MID });
    return w(s);
  })();

  /* ---------- 14 战舰波将金号 ---------- */
  S["a-battleship-potemkin"] = (function () {
    var s = "", y = 96, fw = 76, gap = 12;
    var shots = [
      ["全景", "人群下逃"],
      ["中景", "士兵踏步"],
      ["特写", "靴子与台阶"],
      ["特写", "撑伞的手"],
      ["近景", "母亲中弹"],
      ["特写", "婴儿车滑动"],
      ["大特写", "眼镜与血"],
      ["远景", "石狮跃起"]
    ];
    shots.forEach(function (sh, i) {
      var x = 40 + i * (fw + gap);
      s += "<rect x='" + x + "' y='" + y + "' width='" + fw + "' height='96' fill='" + FILL + "' stroke='" + INK + "' stroke-width='1'/>";
      s += txt(x + fw / 2, y + 20, sh[0], { s: 9.5, c: RED, a: "middle" });
      s += txt(x + fw / 2, y + 74, sh[1], { s: 8.6, c: MID, a: "middle" });
      // 画框内的对角线（运动方向）
      s += ln(x + 12, y + 34, x + fw - 12, y + 62, { c: GOLD2, w: .8, d: "4 4" });
      if (i < shots.length - 1) s += arrow(x + fw + 2, y + 48, x + fw + gap - 2, y + 48, { c: GOLD, w: 1 });
    });
    // 节奏条
    var dur = [4, 2, 1, 1, 3, 6, 2, 5];
    var bx = 40;
    dur.forEach(function (d) {
      var ww = d * 8;
      s += "<rect x='" + bx + "' y='220' width='" + ww + "' height='14' fill='" + (d > 3 ? "#d9c48c" : "#8d3b2c") + "' stroke='" + MID + "' stroke-width='.5'/>";
      bx += ww;
    });
    s += txt(40, 254, "镜头时长：短切制造撞击，长镜头（婴儿车）制造不可忍受的延宕", { s: 9.5, c: MID });
    // 敖德萨台阶剖面
    s += path("M60 360 L120 330 L180 302 L240 274 L300 246 L360 218", { c: INK, w: 1.2 });
    s += path("M360 218 L360 366 L60 366 Z", { f: FILL2, c: INK, w: 1, d: "5 4" });
    s += txt(66, 348, "敖德萨台阶：运动方向与屠杀方向相反", { s: 9.5, c: INK });
    s += label(40, 76, "蒙太奇序列：镜头 A + 镜头 B ≠ A 与 B 之和");
    return w(s);
  })();

  window.WA_SVG = S;
})();
