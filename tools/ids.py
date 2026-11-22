import json, os, glob, collections
c = collections.Counter(); p = collections.Counter(); a = collections.Counter()
mods = []
for f in sorted(glob.glob("content/modules/*.json")):
    mods.append(json.load(open(f, encoding="utf-8")))
for m in mods:
    for L in m["lessons"]:
        for x in L.get("concepts", []): c[x]+=1
        for x in L.get("people", []): p[x]+=1
        for x in L.get("artworks", []): a[x]+=1
print("CONCEPTS", len(c)); print("\n".join(sorted(c)))
print("\nPEOPLE", len(p)); print("\n".join(sorted(p)))
print("\nARTWORKS", len(a)); print("\n".join(sorted(a)))
print("\nlessons total", sum(len(m["lessons"]) for m in mods))
