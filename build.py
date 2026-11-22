#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
西方美学思想史 —— 内容构建管线

用法：
    python build.py            # 校验 + 打包
    python build.py --check    # 只校验，不写文件

输入：
    content/modules/mNN.json     模块与讲次结构（唯一权威：标题、提要、要点、编号）
    content/lessons/mNN-lNN.md   讲义正文（front-matter + Markdown）
    content/refs/*.json          概念、人物、流派、时间轴、原著、作品

输出：
    assets/js/data.js            window.WA = {...}
"""

import json
import os
import re
import sys
import html as htmllib
from datetime import datetime

import yaml
import markdown

ROOT = os.path.dirname(os.path.abspath(__file__))
C = lambda *p: os.path.join(ROOT, *p)

RULE = "=" * 60
errors = []
warns = []


def err(msg):
    errors.append(msg)


def warn(msg):
    warns.append(msg)


# ---------------------------------------------------------------- 读取
def load_json(path):
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        err("缺少文件：%s" % os.path.relpath(path, ROOT))
    except json.JSONDecodeError as e:
        err("JSON 语法错误 %s：第 %d 行第 %d 列 %s" % (os.path.relpath(path, ROOT), e.lineno, e.colno, e.msg))
    return None


def load_modules():
    mdir = C("content", "modules")
    mods = []
    for fn in sorted(os.listdir(mdir)):
        if not fn.endswith(".json"):
            continue
        m = load_json(os.path.join(mdir, fn))
        if not m:
            continue
        if m.get("id") != fn[:-5]:
            err("%s 的 id 与文件名不一致：%s" % (fn, m.get("id")))
        m["_file"] = fn
        mods.append(m)
    mods.sort(key=lambda x: x.get("no", 99))
    for i, m in enumerate(mods, 1):
        if m.get("no") != i:
            warn("模块编号不连续：%s 的 no=%s，实际顺序为 %d" % (m.get("id"), m.get("no"), i))
        for j, L in enumerate(m.get("lessons", []), 1):
            L["id"] = "%s-l%02d" % (m["id"], j)
            L["module"] = m["id"]
            L["module_no"] = m.get("no")
            L["order"] = j
            for k in ("title", "summary", "points"):
                if not L.get(k):
                    err("讲次 %s 缺少字段 %s" % (L["id"], k))
            L.setdefault("concepts", [])
            L.setdefault("people", [])
            L.setdefault("artworks", [])
            L.setdefault("readings", [])
            L["status"] = "outline"
    return mods


FRONT_RE = re.compile(r"^---\s*\n(.*?)\n---\s*\n", re.S)


def parse_front_matter(text):
    m = FRONT_RE.match(text)
    if not m:
        return {}, text
    try:
        meta = yaml.safe_load(m.group(1)) or {}
    except yaml.YAMLError as e:
        err("front-matter YAML 解析失败：%s" % e)
        meta = {}
    return meta, text[m.end():]


# ---------------------------------------------------------------- 自定义容器
CONTAINER_RE = re.compile(r"^:::[ \t]*([a-z]+)[ \t]*(.*)$", re.M)

CONTAINER_META = {
    "def": ("概念", "def-box"),
    "key": ("要点", "key-box"),
    "note": ("旁注", "note-box"),
    "quote": ("引文", "quote-box"),
    "fig": ("图", "fig-box"),
    "warn": ("辨析", "warn-box"),
}
CONTAINER_NAMES = {"def": "概念", "key": "要点", "note": "旁注", "quote": "引文", "fig": "图示", "warn": "辨析"}


def split_containers(text):
    """把 ::: 容器抽出来，避免 markdown 把内部当成普通段落。"""
    out = []
    lines = text.split("\n")
    i = 0
    buf = []

    while i < len(lines):
        line = lines[i]
        m = CONTAINER_RE.match(line)
        if m and m.group(1) in CONTAINER_META:
            if buf:
                out.append(("md", "\n".join(buf)))
                buf = []
            kind, arg = m.group(1), m.group(2).strip()
            body = []
            i += 1
            closed = False
            while i < len(lines):
                if lines[i].strip() == ":::":
                    closed = True
                    break
                body.append(lines[i])
                i += 1
            if not closed:
                err("容器 ::: %s 未闭合（参数：%s）" % (kind, arg))
            out.append(("box", (kind, arg, "\n".join(body).strip())))
            i += 1
        else:
            buf.append(line)
            i += 1
    if buf:
        out.append(("md", "\n".join(buf)))
    return out


MD = markdown.Markdown(
    extensions=["extra", "tables", "sane_lists", "nl2br"],
    output_format="html5",
)


def md2html(text):
    MD.reset()
    h = MD.convert(text)
    h = h.replace("<br />", "<br>")
    return h


def style_blockquote(h):
    """把 <blockquote><p>…<br>——出处</p></blockquote> 改成带 cite 的引文块。"""
    def repl(m):
        inner = m.group(1)
        cite = ""
        cm = re.search(r"<p>.*?——\s*([^<]+?)</p>", inner, re.S)
        if cm:
            cite = cm.group(1).strip()
            inner = re.sub(r"——\s*" + re.escape(cite), "", inner, count=1)
        return '<blockquote class="quote">%s%s</blockquote>' % (
            inner, ('<cite>——%s</cite>' % cite) if cite else "")
    return re.sub(r"<blockquote>(.*?)</blockquote>", repl, h, flags=re.S)


def render_containers(blocks):
    parts = []
    for typ, payload in blocks:
        if typ == "md":
            if not payload.strip():
                continue
            parts.append(style_blockquote(md2html(payload)))
        else:
            kind, arg, body = payload
            inner = style_blockquote(md2html(body)) if body else ""
            if kind == "def":
                parts.append(
                    '<aside class="box def"><div class="box-h"><span class="tag">概念</span>'
                    '<span class="box-t">%s</span></div><div class="box-b">%s</div></aside>'
                    % (htmllib.escape(arg), inner))
            elif kind == "key":
                parts.append(
                    '<aside class="box key"><div class="box-h"><span class="tag">要点</span>'
                    '<span class="box-t">%s</span></div><div class="box-b">%s</div></aside>'
                    % (htmllib.escape(arg or "本讲关键"), inner))
            elif kind == "note":
                parts.append(
                    '<aside class="box note"><div class="box-h"><span class="tag">旁注</span>'
                    '<span class="box-t">%s</span></div><div class="box-b">%s</div></aside>'
                    % (htmllib.escape(arg or "补充"), inner))
            elif kind == "warn":
                parts.append(
                    '<aside class="box warn"><div class="box-h"><span class="tag">辨析</span>'
                    '<span class="box-t">%s</span></div><div class="box-b">%s</div></aside>'
                    % (htmllib.escape(arg or "常见误解"), inner))
            elif kind == "quote":
                parts.append(
                    '<figure class="quote-fig"><blockquote class="quote">%s</blockquote>'
                    '<figcaption>%s</figcaption></figure>'
                    % (inner, htmllib.escape(arg)))
            elif kind == "fig":
                # 参数格式： 作品 id | 图注     或   图注
                arg = arg.strip()
                if "|" in arg:
                    aid, cap = [x.strip() for x in arg.split("|", 1)]
                else:
                    aid, cap = "", arg
                parts.append(render_figure(aid, cap))
    return "\n".join(parts)


def render_figure(aid, cap):
    fig_id = htmllib.escape(aid) if aid else ""
    return ('<figure class="diagram" data-art="%s">'
            '<div class="diagram-frame" data-art-figure="%s"></div>'
            '<figcaption>%s</figcaption></figure>') % (fig_id, fig_id, htmllib.escape(cap))


H2_RE = re.compile(r"<h2>(.*?)</h2>", re.S)


def build_toc_and_anchor(html):
    """给 h2 加 id，抽出目录。"""
    toc = []

    def repl(m):
        title = re.sub(r"<[^>]+>", "", m.group(1)).strip()
        slug = "s-%d" % (len(toc) + 1)
        toc.append({"id": slug, "title": title})
        return '<h2 id="%s">%s</h2>' % (slug, m.group(1))

    html = H2_RE.sub(repl, html)
    return html, toc


TAG_RE = re.compile(r"<[^>]+>")
WS_RE = re.compile(r"\s+")


def plain(html):
    return WS_RE.sub(" ", htmllib.unescape(TAG_RE.sub(" ", html))).strip()


# ---------------------------------------------------------------- 讲义
def load_lessons(mods):
    ldir = C("content", "lessons")
    by_id = {}
    if not os.path.isdir(ldir):
        err("缺少目录 content/lessons")
        return by_id

    index = {}
    for m in mods:
        for L in m["lessons"]:
            index[L["id"]] = L

    files = sorted(f for f in os.listdir(ldir) if f.endswith(".md") and not f.startswith("_"))
    for fn in files:
        lid = fn[:-3]
        path = os.path.join(ldir, fn)
        with open(path, "r", encoding="utf-8") as f:
            raw = f.read()
        meta, body = parse_front_matter(raw)
        if lid not in index:
            err("%s：文件名不对应任何讲次编号（应为 mNN-lNN.md）" % fn)
            continue
        L = index[lid]
        if meta.get("id") and meta["id"] != lid:
            err("%s：front-matter id=%s 与文件名不符" % (fn, meta["id"]))
        if meta.get("title") and meta["title"].strip() != L["title"].strip():
            warn("%s：front-matter 标题「%s」与 m 文件标题「%s」不一致，以结构文件为准"
                 % (fn, meta["title"], L["title"]))

        html = render_containers(split_containers(body))
        html, toc = build_toc_and_anchor(html)
        text = plain(html)

        if len(text) < 1200:
            err("%s：正文过短（%d 字），不足一讲" % (fn, len(text)))

        # 八段结构自检
        need = ["导入", "核心", "人物", "理论", "原著", "艺术", "联系", "总结"]
        heads = "".join(t["title"] for t in toc)
        missing = [n for n in need if n not in heads]
        if missing:
            warn("%s：八段结构中未见「%s」" % (fn, "、".join(missing)))

        L["status"] = "full"
        L["html"] = html
        L["toc"] = toc
        L["chars"] = len(text)
        L["minutes"] = max(6, round(len(text) / 380))
        L["concepts"] = list(dict.fromkeys(L["concepts"] + (meta.get("concepts") or [])))
        L["people"] = list(dict.fromkeys(L["people"] + (meta.get("people") or [])))
        L["artworks"] = list(dict.fromkeys(L["artworks"] + (meta.get("artworks") or [])))
        L["readings"] = list(dict.fromkeys(L["readings"] + (meta.get("readings") or [])))
        L["quote"] = (meta.get("quote") or "").strip()
        L["lead"] = (meta.get("lead") or L["summary"]).strip()
        by_id[lid] = L

    return by_id


# ---------------------------------------------------------------- 引用校验
def check_refs(mods, refs, lessons):
    def ids(key):
        return {x["id"] for x in refs.get(key, [])}

    cids, pids, rids, aids = ids("concepts"), ids("people"), ids("readings"), ids("artworks")

    def chk(kind, val, owner, pool):
        if val not in pool:
            (err if owner in lessons else warn)("%s 引用了不存在的%s：%s" % (owner, kind, val))

    for m in mods:
        for L in m["lessons"]:
            for c in L["concepts"]:
                chk("概念", c, L["id"], cids)
            for p in L["people"]:
                chk("人物", p, L["id"], pids)
            for r in L["readings"]:
                chk("原著", r, L["id"], rids)
            for a in L["artworks"]:
                chk("作品", a, L["id"], aids)

    # 必填字段
    need = {
        "concepts": ("term", "brief", "body", "source"),
        "people": ("name", "en", "years", "brief"),
        "readings": ("title", "author", "background", "core", "chapters", "order"),
        "artworks": ("title", "artist", "date", "form", "theory"),
        "schools": ("name", "period", "brief"),
        "timeline": ("year", "title", "text"),
    }
    for key, fields in need.items():
        for x in refs.get(key, []):
            for f in fields:
                if not x.get(f):
                    err("%s.%s 缺少字段 %s" % (key, x.get("id", "?"), f))

    # 反向索引：每个条目出现在哪些讲次
    rev = {}
    for m in mods:
        for L in m["lessons"]:
            for key in ("concepts", "people", "artworks", "readings"):
                for v in L.get(key, []):
                    rev.setdefault(v, [])
                    if L["id"] not in rev[v]:
                        rev[v].append(L["id"])
    for key in ("concepts", "people", "artworks", "readings"):
        for x in refs.get(key, []):
            x["where"] = rev.get(x["id"], [])
    return refs


# ---------------------------------------------------------------- 搜索索引
def build_index(mods, refs, lessons):
    idx = []

    def add(kind, ident, title, sub, body, href, extra=""):
        idx.append({
            "k": kind, "id": ident, "t": title, "s": sub,
            "b": (body or "")[:1500], "u": href, "x": extra,
        })

    for m in mods:
        for L in m["lessons"]:
            body = L["summary"] + " " + " ".join(L["points"])
            if L["id"] in lessons:
                body += " " + plain(lessons[L["id"]]["html"])[:2600]
            add("lesson", L["id"], L["title"], "第%d模块 · %s" % (m["no"], m["title"]),
                body, "#/lesson/" + L["id"], L.get("subtitle", ""))

    for c in refs.get("concepts", []):
        add("concept", c["id"], c["term"], c.get("en") or c.get("source", ""),
            (c.get("brief", "") + " " + c.get("body", "")), "#/concept/" + c["id"])

    for p in refs.get("people", []):
        add("person", p["id"], p["name"], "%s · %s" % (p.get("years", ""), p.get("school", "")),
            (p.get("brief", "") + " " + " ".join(p.get("tenets", []))), "#/person/" + p["id"])

    for r in refs.get("readings", []):
        add("reading", r["id"], r["title"], r.get("author", ""),
            (r.get("core", "") + " " + r.get("background", "")), "#/reading/" + r["id"])

    for a in refs.get("artworks", []):
        add("art", a["id"], a["title"], "%s · %s" % (a.get("artist", ""), a.get("date", "")),
            (a.get("theory", "") + " " + " ".join(a.get("form", []))), "#/artwork/" + a["id"])

    return idx


# ---------------------------------------------------------------- 输出
def main():
    check_only = "--check" in sys.argv

    mods = load_modules()
    refs = {k: (load_json(C("content", "refs", k + ".json")) or []) for k in
            ("concepts", "people", "schools", "timeline", "readings", "artworks")}
    lessons = load_lessons(mods)
    refs = check_refs(mods, refs, lessons)

    if errors:
        print(RULE)
        print("构建失败，共 %d 个错误：" % len(errors))
        for e in errors:
            print("  ✗ " + e)
        print(RULE)
        sys.exit(1)

    data = {
        "meta": {
            "title": "西方美学思想史",
            "subtitle": "从毕达哥拉斯到算法时代的美学通识课程",
            "built": datetime.now().strftime("%Y-%m-%d"),
            "modules": len(mods),
            "lessons": sum(len(m["lessons"]) for m in mods),
            "full": len(lessons),
            "chars": sum(l["chars"] for l in lessons.values()),
        },
        "modules": [
            dict(
                [(k, v) for k, v in m.items() if not k.startswith("_") and k != "lessons"],
                lessons=[
                    {k: v for k, v in L.items() if k not in ("html", "toc")}
                    for L in m["lessons"]
                ],
            )
            for m in mods
        ],
        "lessons": lessons,
        "concepts": refs["concepts"],
        "people": refs["people"],
        "schools": refs["schools"],
        "timeline": refs["timeline"],
        "readings": refs["readings"],
        "artworks": refs["artworks"],
        "index": build_index(mods, refs, lessons),
    }

    if check_only:
        print("校验通过。%d 模块 / %d 讲（其中 %d 讲已有正文，共 %d 字）"
              % (data["meta"]["modules"], data["meta"]["lessons"], data["meta"]["full"],
                 data["meta"]["chars"]))
        for w in warns[:40]:
            print("  ! " + w)
        return

    js = "window.WA = " + json.dumps(data, ensure_ascii=False, separators=(",", ":")) + ";\n"
    out = C("assets", "js", "data.js")
    with open(out, "w", encoding="utf-8", newline="\n") as f:
        f.write(js)

    print(RULE)
    print("构建完成 → assets/js/data.js  (%.1f KB)" % (len(js.encode("utf-8")) / 1024.0))
    print("  模块 %d ／ 讲次 %d ／ 已撰正文 %d 讲 ／ 正文共 %d 字"
          % (data["meta"]["modules"], data["meta"]["lessons"], data["meta"]["full"],
             data["meta"]["chars"]))
    print("  概念 %d ／ 人物 %d ／ 流派 %d ／ 时间轴 %d ／ 原著 %d ／ 作品 %d ／ 索引 %d 条"
          % (len(refs["concepts"]), len(refs["people"]), len(refs["schools"]),
             len(refs["timeline"]), len(refs["readings"]), len(refs["artworks"]),
             len(data["index"])))
    if warns:
        print("  提示（%d）：" % len(warns))
        for w in warns[:40]:
            print("    ! " + w)
    print(RULE)


if __name__ == "__main__":
    main()
