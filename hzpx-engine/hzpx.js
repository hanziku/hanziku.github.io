(() => {
  var __pow = Math.pow;

  // ../ptk/utils/bsearch.ts
  var bsearchgetter = (getter, obj) => {
    const len = parseInt(getter(0));
    let low = 1, high = len;
    while (low < high) {
      let mid = low + high >> 1;
      if (getter(mid) === obj) {
        while (mid > -1 && getter(mid - 1) === obj)
          mid--;
        return mid < len ? mid : len - 1;
      }
      getter(mid) < obj ? low = mid + 1 : high = mid;
    }
    return low < len ? low : len;
  };

  // ../ptk/utils/array.ts
  var intersect = (arr1, arr2) => {
    const out = [];
    let j = 0;
    for (let i = 0; i < arr1.length; i++) {
      let v = arr1[i];
      while (j < arr2.length) {
        if (arr2[j] >= v)
          break;
        j++;
      }
      if (v == arr2[j] && out[out.length - 1] !== v)
        out.push(v);
      if (j == arr2.length)
        break;
    }
    return out;
  };

  // ../ptk/utils/unpackintarray.ts
  var maxlen2 = 113 * 113;
  var maxlen3 = 113 * 113 * 113;
  var CodeStart = 14;
  var BYTE_MAX = 113;
  var BYTE1_MAX = 45;
  var BYTE2_MAX = 44 * BYTE_MAX + BYTE1_MAX;
  var BYTE2_START = 45;
  var BYTE3_START = 89;
  var BYTE4_START = 105;
  var BYTE5_START = 112;
  var BYTE3_MAX = 16 * BYTE_MAX * BYTE_MAX + BYTE2_MAX;
  var BYTE4_MAX = 6 * BYTE_MAX * BYTE_MAX * BYTE_MAX + BYTE3_MAX;
  var BYTE5_MAX = 2 * BYTE_MAX * BYTE_MAX * BYTE_MAX * BYTE_MAX + BYTE4_MAX;
  var SEP2DITEM = 127;
  var SEPARATOR2D = "\x7F";
  var unpack1 = (str) => {
    const arr = [];
    let i1;
    const count = Math.floor(str.length);
    for (let i = 0; i < count; i++) {
      i1 = str.charCodeAt(i * 3) - CodeStart;
      arr.push(i1);
    }
    return arr;
  };
  var unpack = (s, delta = false) => {
    let arr = [];
    let started = false;
    if (!s)
      return [];
    let o, i = 0, c = 0, prev = 0;
    while (i < s.length) {
      o = s.charCodeAt(i) - CodeStart;
      if (o < BYTE2_START) {
      } else if (o < BYTE3_START) {
        const i1 = s.charCodeAt(++i) - CodeStart;
        o -= BYTE2_START;
        o = o * BYTE_MAX + i1 + BYTE1_MAX;
      } else if (o < BYTE4_START) {
        const i2 = s.charCodeAt(++i) - CodeStart;
        const i1 = s.charCodeAt(++i) - CodeStart;
        o -= BYTE3_START;
        o = o * BYTE_MAX * BYTE_MAX + i2 * BYTE_MAX + i1 + BYTE2_MAX;
      } else if (o < BYTE5_START) {
        const i3 = s.charCodeAt(++i) - CodeStart;
        const i2 = s.charCodeAt(++i) - CodeStart;
        const i1 = s.charCodeAt(++i) - CodeStart;
        o -= BYTE4_START;
        o = o * BYTE_MAX * BYTE_MAX * BYTE_MAX + i3 * BYTE_MAX * BYTE_MAX + i2 * BYTE_MAX + i1 + BYTE3_MAX;
      } else if (o < SEP2DITEM) {
        const i4 = s.charCodeAt(++i) - CodeStart;
        const i3 = s.charCodeAt(++i) - CodeStart;
        const i2 = s.charCodeAt(++i) - CodeStart;
        const i1 = s.charCodeAt(++i) - CodeStart;
        o -= BYTE5_START;
        o = o * BYTE_MAX * BYTE_MAX * BYTE_MAX * BYTE_MAX + i4 * BYTE_MAX * BYTE_MAX * BYTE_MAX + i3 * BYTE_MAX * BYTE_MAX + i2 * BYTE_MAX + i1 + BYTE3_MAX;
      } else {
        throw new Error("exit max integer 0x7f," + o);
      }
      if (started) {
        arr[c] = o + (delta ? prev : 0);
        prev = arr[c];
        c++;
      } else {
        arr = new Array(o);
        started = true;
      }
      i++;
    }
    return arr;
  };

  // ../ptk/utils/packstr.ts
  var CodeStart2 = 14;
  var CodeEnd = 31;
  var MaxShared = CodeEnd - CodeStart2;
  var SEP = String.fromCharCode(CodeStart2);

  // ../ptk/utils/unicode.ts
  var splitUTF32 = (str) => {
    if (!str) {
      const empty = [];
      return empty;
    }
    let i = 0;
    const out = [];
    while (i < str.length) {
      const code = str.codePointAt(i) || 0;
      out.push(code);
      i++;
      if (code > 65535)
        i++;
    }
    return out;
  };
  var splitUTF32Char = (str) => splitUTF32(str).map((cp) => String.fromCodePoint(cp));
  var codePointLength = (str) => splitUTF32(str).length;

  // ../ptk/utils/stringarray.ts
  var StringArray = class {
    constructor(buf, sep) {
      this.buf = "";
      this.sep = "";
      this.linepos = [];
      this.buf = buf;
      this.sep = sep || "";
      this.buildLinepos();
    }
    buildLinepos() {
      let prev = -1, p = 0;
      while (p < this.buf.length) {
        const at = this.buf.indexOf("\n", prev);
        if (at == -1) {
          this.linepos.push(this.buf.length);
          break;
        } else {
          this.linepos.push(at + 1);
          prev = at + 1;
        }
      }
    }
    len() {
      return this.linepos.length;
    }
    get(idx) {
      if (idx < 1)
        return this.linepos.length.toString();
      else if (idx == 1) {
        return this.buf.slice(0, this.linepos[0] - 1);
      } else if (idx <= this.linepos.length) {
        return this.buf.slice(this.linepos[idx - 2], this.linepos[idx - 1] - 1);
      }
      return "";
    }
    find(pat) {
      const getter = this.get.bind(this);
      pat += this.sep;
      const at = bsearchgetter(getter, pat);
      const found = getter(at);
      return found.startsWith(pat) ? at : 0;
    }
    getValue(key) {
      const at = this.find(key);
      return at ? this.get(at).slice(key.length + this.sep.length) : "";
    }
  };

  // ../ptk/utils/cjk.ts
  var CJKRanges = {
    "BMP": [19968, 40869],
    "ExtA": [13312, 19967],
    "ExtB": [131072, 173823],
    "ExtC": [173824, 177983],
    "ExtD": [177984, 178207],
    "ExtE": [178208, 183983],
    "ExtF": [183984, 191456],
    "ExtG": [196608, 201546]
  };
  var CJKRangeName = (s) => {
    let cp = s;
    if (typeof s === "string") {
      const code = parseInt(s, 16);
      if (!isNaN(code)) {
        cp = code;
      } else {
        cp = s.codePointAt(0);
      }
    }
    for (let rangename in CJKRanges) {
      const [from, to] = CJKRanges[rangename];
      if (cp >= from && cp <= to)
        return rangename;
    }
  };

  // src/gwpacker.ts
  var NUMOFFSET = 10;
  var NEGATIVE = 4e3;
  var unpackGD = (str) => {
    if (!str)
      return "";
    const units = str.split(SEPARATOR2D);
    const arr = [];
    for (let i = 0; i < units.length; i++) {
      const s = units[i];
      const unit = [];
      let d = unpack1(s[0]);
      if (d[0] > NUMOFFSET) {
        const len = d[0] - NUMOFFSET;
        const name = unpackGID(s.slice(1, len + 1));
        const [x1, y1, x2, y2, sx, sy, sx2, sy2] = unpack(s.slice(len + 1)).map(UN);
        unit.push("99");
        unit.push(sx || "0", sy || "0", x1 || "0", y1 || "0", x2 || "0", y2 || "0", name);
        unit.push("0", sx2 || "0", sy2 || "0");
      } else {
        const st = d[0];
        const nums = Array.from(unpack(s.slice(1)).map(UN));
        unit.push(st, ...nums);
      }
      arr.push(unit.join(":"));
    }
    return arr.join("$");
  };
  var UN = (n) => {
    if (n > NEGATIVE)
      return -n + NEGATIVE;
    else
      n -= NUMOFFSET;
    return n;
  };
  var unpackGID = (gid) => {
    const cp = gid.codePointAt(0) || 0;
    let s = "";
    if (cp > 255) {
      const chars = splitUTF32Char(gid);
      s = "u" + cp.toString(16);
      if (chars.length > 1)
        s += (chars[1] !== "@" ? "-" : "") + gid.slice(chars[0].length);
    } else {
      return gid;
    }
    return s;
  };

  // src/gwfont.ts
  var cjkbmp;
  var cjkext;
  var gwcomp;
  var getGID = (id) => {
    let r = "";
    if (typeof id === "number")
      return ch2gid(id);
    else if (typeof id == "string") {
      if ((id.codePointAt(0) || 0) > 8192) {
        id = "u" + (id.codePointAt(0) || 0).toString(16);
      }
      return id.replace(/@\d+$/, "");
    }
    return "";
  };
  var ch2gid = (ch) => "u" + (typeof ch == "number" ? ch : ch?.codePointAt(0) || " ").toString(16);
  var getGlyph = (s) => {
    if (typeof s == "number")
      s = String.fromCodePoint(s);
    if (!s || typeof s == "string" && (s.codePointAt(0) || 0) > 255 && codePointLength(s) > 1) {
      return "";
    }
    const gid = getGID(s);
    const m = gid.match(/^u([\da-f]{4,5})$/);
    if (m) {
      const cp = parseInt(m[1], 16);
      if (cp >= 131072) {
        const gd = cjkext.get(cp - 131072 + 1);
        return unpackGD(gd);
      } else if (cp >= 13312 && cp < 40959) {
        const gd = cjkbmp.get(cp - 13312 + 1);
        return unpackGD(gd);
      }
    }
    return unpackGD(gwcomp.getValue(gid));
  };
  var depth = 0;
  var loadComponents = (data, compObj, countrefer = false) => {
    const entries = data.split("$");
    depth++;
    if (depth > 10) {
      console.log("too deep fetching", data);
      return;
    }
    for (let i = 0; i < entries.length; i++) {
      if (entries[i].slice(0, 3) == "99:") {
        let gid = entries[i].slice(entries[i].lastIndexOf(":") + 1);
        if (parseInt(gid).toString() == gid) {
          gid = entries[i].split(":")[7].replace(/@\d+$/, "");
        }
        const d = getGlyph(gid);
        if (!d) {
          console.log("glyph not found", gid);
        } else {
          if (countrefer) {
            if (!compObj[gid])
              compObj[gid] = 0;
            compObj[gid]++;
          } else {
            if (!compObj[gid])
              compObj[gid] = getGlyph(gid);
          }
          loadComponents(d, compObj, countrefer);
        }
      }
    }
    depth--;
  };
  function frameOf(gd, rawframe = "") {
    const entries = gd.split("$");
    let frames = [];
    let gid = "";
    for (let i = 0; i < entries.length; i++) {
      if (entries[i].slice(0, 3) === "99:") {
        const [m, a1, a2, x1, y1, x2, y2, id] = entries[i].split(":");
        const f = [parseInt(x1), parseInt(y1), parseInt(x2), parseInt(y2)];
        frames.push(f);
        gid = id;
      }
    }
    if (!rawframe && frames.length == 1) {
      frames = frameOf(getGlyph(gid));
    }
    return frames;
  }
  var gid2ch = (gid) => {
    if (gid[0] !== "u")
      return " ";
    let n = parseInt(gid.slice(1), 16);
    if (n < 32 || isNaN(n))
      n = 32;
    return String.fromCodePoint(n);
  };
  var deserializeGlyphUnit = (glyphdata) => glyphdata.split("$").filter((it) => it !== "0:0:0:0").map((item) => item.split(":"));
  var factorsOfGD = (gd, gid) => {
    const units = deserializeGlyphUnit(gd);
    let factors = [];
    if (units.length == 1 && units[0][0] === "99") {
      const compid = units[0][7];
      return factorsOfGD(getGlyph(compid), compid);
    }
    for (let i = 0; i < units.length; i++) {
      if (units[i][0] === "99") {
        factors.push(units[i][7]);
      }
    }
    return gid ? factors : factors.map(gid2ch).join("");
  };
  var componentsOf = (ch, returnid = false) => {
    const d = getGlyph(ch);
    return componentsOfGD(d, returnid).filter((it) => it !== ch);
  };
  var componentsOfGD = (d, returnid = false) => {
    const comps = {};
    loadComponents(d, comps);
    const out = Object.keys(comps);
    return returnid ? out : out.map(gid2ch);
  };
  var addFontData = (key, data) => {
    if (key == "gwcomp")
      gwcomp = new StringArray(data, "=");
    else if (key == "cjkbmp")
      cjkbmp = new StringArray(data);
    else if (key == "cjkext")
      cjkext = new StringArray(data);
    else
      throw "wrong font key";
  };
  var isFontReady = () => gwcomp && cjkbmp && cjkext;
  var loadFont = (comp, bmp, ext) => {
    addFontData("gwcomp", comp);
    addFontData("cjkbmp", bmp);
    addFontData("cjkext", ext);
    return { gwcomp, cjkbmp, cjkext };
  };

  // src/fontface.ts
  var fontfacedef = {};
  var addFontFace = (name, settings) => {
    fontfacedef[name] = settings;
  };
  var getFontFace = (name) => {
    return fontfacedef[name];
  };
  addFontFace("\u5B8B\u4F53", { kMinWidthY: 2, kMinWidthU: 2, kMinWidthT: 4.5, kWidth: 5 });
  addFontFace("\u7EC6\u5B8B\u4F53", { kMinWidthY: 2, kMinWidthU: 1, kMinWidthT: 3, kWidth: 5 });
  addFontFace("\u4E2D\u5B8B\u4F53", { kMinWidthY: 2, kMinWidthU: 2, kMinWidthT: 6, kWidth: 5 });
  addFontFace("\u7C97\u5B8B\u4F53", { kMinWidthY: 2.5, kMinWidthU: 2, kMinWidthT: 7, kWidth: 5 });
  addFontFace("\u7279\u5B8B\u4F53", { kMinWidthY: 3, kMinWidthU: 2, kMinWidthT: 8, kWidth: 5 });
  addFontFace("\u9ED1\u4F53", { hei: true, kWidth: 2 });
  addFontFace("\u7EC6\u9ED1\u4F53", { hei: true, kWidth: 1 });
  addFontFace("\u4E2D\u9ED1\u4F53", { hei: true, kWidth: 3 });
  addFontFace("\u7C97\u9ED1\u4F53", { hei: true, kWidth: 5 });
  addFontFace("\u7279\u9ED1\u4F53", { hei: true, kWidth: 7 });

  // ../../github/kage-engine/src/buhin.ts
  var Buhin = class {
    constructor() {
      this.hash = {};
    }
    set(name, data) {
      this.hash[name] = data;
    }
    search(name) {
      if (this.hash[name]) {
        return this.hash[name];
      }
      return "";
    }
    push(name, data) {
      this.set(name, data);
    }
  };

  // ../../github/kage-engine/src/polygons.ts
  var _Polygons = class {
    constructor() {
      this.array = [];
    }
    clear() {
      this.array = [];
    }
    push(polygon) {
      let minx = 200;
      let maxx = 0;
      let miny = 200;
      let maxy = 0;
      if (polygon.length < 3) {
        return;
      }
      polygon.floor();
      for (const { x, y } of polygon.array) {
        if (x < minx) {
          minx = x;
        }
        if (x > maxx) {
          maxx = x;
        }
        if (y < miny) {
          miny = y;
        }
        if (y > maxy) {
          maxy = y;
        }
        if (isNaN(x) || isNaN(y)) {
          return;
        }
      }
      if (minx !== maxx && miny !== maxy) {
        this.array.push(polygon);
      }
    }
    generateSVG(curve) {
      let buffer = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" baseProfile="full" viewBox="0 0 200 200" width="200" height="200">\n';
      if (curve) {
        for (const { array } of this.array) {
          let mode = "L";
          buffer += '<path d="';
          for (let j = 0; j < array.length; j++) {
            if (j === 0) {
              buffer += "M ";
            } else if (array[j].off) {
              buffer += "Q ";
              mode = "Q";
            } else if (mode === "Q" && !array[j - 1].off) {
              buffer += "L ";
            } else if (mode === "L" && j === 1) {
              buffer += "L ";
            }
            buffer += `${array[j].x},${array[j].y} `;
          }
          buffer += 'Z" fill="black" />\n';
        }
      } else {
        buffer += '<g fill="black">\n';
        buffer += this.array.map(({ array }) => `<polygon points="${array.map(({ x, y }) => `${x},${y} `).join("")}" />
`).join("");
        buffer += "</g>\n";
      }
      buffer += "</svg>\n";
      return buffer;
    }
    generateEPS() {
      let buffer = "";
      buffer += `%!PS-Adobe-3.0 EPSF-3.0
%%BoundingBox: 0 -208 1024 816
%%Pages: 0
%%Title: Kanji glyph
%%Creator: GlyphWiki powered by KAGE system
%%CreationDate: ${new Date().toString()}
%%EndComments
%%EndProlog
`;
      for (const { array } of this.array) {
        for (let j = 0; j < array.length; j++) {
          buffer += `${array[j].x * 5} ${1e3 - array[j].y * 5 - 200} `;
          if (j === 0) {
            buffer += "newpath\nmoveto\n";
          } else {
            buffer += "lineto\n";
          }
        }
        buffer += "closepath\nfill\n";
      }
      buffer += "%%EOF\n";
      return buffer;
    }
  };
  var Polygons = _Polygons;
  Symbol.iterator;
  (() => {
    if (typeof Symbol !== "undefined" && Symbol.iterator) {
      _Polygons.prototype[Symbol.iterator] = function() {
        return this.array[Symbol.iterator]();
      };
    }
  })();

  // ../../github/kage-engine/src/util.ts
  var hypot = Math.hypot ? Math.hypot.bind(Math) : (x, y) => Math.sqrt(x * x + y * y);
  function normalize([x, y], magnitude = 1) {
    if (x === 0 && y === 0) {
      return [1 / x === Infinity ? magnitude : -magnitude, 0];
    }
    const k = magnitude / hypot(x, y);
    return [x * k, y * k];
  }
  function quadraticBezier(p1, p2, p3, t) {
    const s = 1 - t;
    return s * s * p1 + 2 * (s * t) * p2 + t * t * p3;
  }
  function quadraticBezierDeriv(p1, p2, p3, t) {
    return 2 * (t * (p1 - 2 * p2 + p3) - p1 + p2);
  }
  function cubicBezier(p1, p2, p3, p4, t) {
    const s = 1 - t;
    return s * s * s * p1 + 3 * (s * s * t) * p2 + 3 * (s * t * t) * p3 + t * t * t * p4;
  }
  function cubicBezierDeriv(p1, p2, p3, p4, t) {
    return 3 * (t * (t * (-p1 + 3 * p2 - 3 * p3 + p4) + 2 * (p1 - 2 * p2 + p3)) - p1 + p2);
  }
  function ternarySearchMin(func, left, right, eps = 1e-5) {
    while (left + eps < right) {
      const x1 = left + (right - left) / 3;
      const x2 = right - (right - left) / 3;
      const y1 = func(x1);
      const y2 = func(x2);
      if (y1 < y2) {
        right = x2;
      } else {
        left = x1;
      }
    }
    return left + (right - left) / 2;
  }
  function round(v, rate = 1e8) {
    return Math.round(v * rate) / rate;
  }

  // ../../github/kage-engine/src/2d.ts
  function cross(x1, y1, x2, y2) {
    return x1 * y2 - x2 * y1;
  }
  function isCross(x11, y11, x12, y12, x21, y21, x22, y22) {
    const cross_1112_2122 = cross(x12 - x11, y12 - y11, x22 - x21, y22 - y21);
    if (isNaN(cross_1112_2122)) {
      return true;
    }
    if (cross_1112_2122 === 0) {
      return false;
    }
    const cross_1112_1121 = cross(x12 - x11, y12 - y11, x21 - x11, y21 - y11);
    const cross_1112_1122 = cross(x12 - x11, y12 - y11, x22 - x11, y22 - y11);
    const cross_2122_2111 = cross(x22 - x21, y22 - y21, x11 - x21, y11 - y21);
    const cross_2122_2112 = cross(x22 - x21, y22 - y21, x12 - x21, y12 - y21);
    return round(cross_1112_1121 * cross_1112_1122, 1e5) <= 0 && round(cross_2122_2111 * cross_2122_2112, 1e5) <= 0;
  }
  function isCrossBox(x1, y1, x2, y2, bx1, by1, bx2, by2) {
    if (isCross(x1, y1, x2, y2, bx1, by1, bx2, by1)) {
      return true;
    }
    if (isCross(x1, y1, x2, y2, bx2, by1, bx2, by2)) {
      return true;
    }
    if (isCross(x1, y1, x2, y2, bx1, by2, bx2, by2)) {
      return true;
    }
    if (isCross(x1, y1, x2, y2, bx1, by1, bx1, by2)) {
      return true;
    }
    return false;
  }

  // ../../github/kage-engine/src/stroke.ts
  function stretch(dp, sp, p, min, max) {
    let p1;
    let p2;
    let p3;
    let p4;
    if (p < sp + 100) {
      p1 = min;
      p3 = min;
      p2 = sp + 100;
      p4 = dp + 100;
    } else {
      p1 = sp + 100;
      p3 = dp + 100;
      p2 = max;
      p4 = max;
    }
    return Math.floor((p - p1) / (p2 - p1) * (p4 - p3) + p3);
  }
  var Stroke = class {
    constructor(data) {
      [
        this.a1_100,
        this.a2_100,
        this.a3_100,
        this.x1,
        this.y1,
        this.x2,
        this.y2,
        this.x3,
        this.y3,
        this.x4,
        this.y4
      ] = data;
      this.a1_opt = Math.floor(this.a1_100 / 100);
      this.a1_100 %= 100;
      this.a2_opt = Math.floor(this.a2_100 / 100);
      this.a2_100 %= 100;
      this.a2_opt_1 = this.a2_opt % 10;
      this.a2_opt_2 = Math.floor(this.a2_opt / 10) % 10;
      this.a2_opt_3 = Math.floor(this.a2_opt / 100);
      this.a3_opt = Math.floor(this.a3_100 / 100);
      this.a3_100 %= 100;
      this.a3_opt_1 = this.a3_opt % 10;
      this.a3_opt_2 = Math.floor(this.a3_opt / 10);
    }
    getControlSegments() {
      const res = [];
      const a1 = this.a1_opt === 0 ? this.a1_100 : 1;
      switch (a1) {
        case 0:
        case 8:
        case 9:
          break;
        case 6:
        case 7:
          res.unshift([this.x3, this.y3, this.x4, this.y4]);
        case 2:
        case 12:
        case 3:
        case 4:
          res.unshift([this.x2, this.y2, this.x3, this.y3]);
        default:
          res.unshift([this.x1, this.y1, this.x2, this.y2]);
      }
      return res;
    }
    isCross(bx1, by1, bx2, by2) {
      return this.getControlSegments().some(([x1, y1, x2, y2]) => isCross(x1, y1, x2, y2, bx1, by1, bx2, by2));
    }
    isCrossBox(bx1, by1, bx2, by2) {
      return this.getControlSegments().some(([x1, y1, x2, y2]) => isCrossBox(x1, y1, x2, y2, bx1, by1, bx2, by2));
    }
    stretch(sx, sx2, sy, sy2, bminX, bmaxX, bminY, bmaxY) {
      this.x1 = stretch(sx, sx2, this.x1, bminX, bmaxX);
      this.y1 = stretch(sy, sy2, this.y1, bminY, bmaxY);
      this.x2 = stretch(sx, sx2, this.x2, bminX, bmaxX);
      this.y2 = stretch(sy, sy2, this.y2, bminY, bmaxY);
      if (!(this.a1_100 === 99 && this.a1_opt === 0)) {
        this.x3 = stretch(sx, sx2, this.x3, bminX, bmaxX);
        this.y3 = stretch(sy, sy2, this.y3, bminY, bmaxY);
        this.x4 = stretch(sx, sx2, this.x4, bminX, bmaxX);
        this.y4 = stretch(sy, sy2, this.y4, bminY, bmaxY);
      }
    }
    getBox() {
      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;
      const a1 = this.a1_opt === 0 ? this.a1_100 : 6;
      switch (a1) {
        default:
          minX = Math.min(minX, this.x4);
          maxX = Math.max(maxX, this.x4);
          minY = Math.min(minY, this.y4);
          maxY = Math.max(maxY, this.y4);
        case 2:
        case 3:
        case 4:
          minX = Math.min(minX, this.x3);
          maxX = Math.max(maxX, this.x3);
          minY = Math.min(minY, this.y3);
          maxY = Math.max(maxY, this.y3);
        case 1:
        case 99:
          minX = Math.min(minX, this.x1, this.x2);
          maxX = Math.max(maxX, this.x1, this.x2);
          minY = Math.min(minY, this.y1, this.y2);
          maxY = Math.max(maxY, this.y1, this.y2);
        case 0:
      }
      return { minX, maxX, minY, maxY };
    }
  };

  // ../../github/kage-engine/src/curve.ts
  function divide_curve(x1, y1, sx1, sy1, x2, y2, curve) {
    const rate = 0.5;
    const cut = Math.floor(curve.length * rate);
    const cut_rate = cut / curve.length;
    const tx1 = x1 + (sx1 - x1) * cut_rate;
    const ty1 = y1 + (sy1 - y1) * cut_rate;
    const tx2 = sx1 + (x2 - sx1) * cut_rate;
    const ty2 = sy1 + (y2 - sy1) * cut_rate;
    const tx3 = tx1 + (tx2 - tx1) * cut_rate;
    const ty3 = ty1 + (ty2 - ty1) * cut_rate;
    return {
      index: cut,
      off: [[x1, y1, tx1, ty1, tx3, ty3], [tx3, ty3, tx2, ty2, x2, y2]]
    };
  }
  function find_offcurve(curve, sx, sy) {
    const [nx1, ny1] = curve[0];
    const [nx2, ny2] = curve[curve.length - 1];
    const area = 8;
    const minx = ternarySearchMin((tx) => curve.reduce((diff, p, i) => {
      const t = i / (curve.length - 1);
      const x = quadraticBezier(nx1, tx, nx2, t);
      return diff + __pow(p[0] - x, 2);
    }, 0), sx - area, sx + area);
    const miny = ternarySearchMin((ty) => curve.reduce((diff, p, i) => {
      const t = i / (curve.length - 1);
      const y = quadraticBezier(ny1, ty, ny2, t);
      return diff + __pow(p[1] - y, 2);
    }, 0), sy - area, sy + area);
    return [nx1, ny1, minx, miny, nx2, ny2];
  }
  function generateFattenCurve(x1, y1, sx1, sy1, sx2, sy2, x2, y2, kRate, widthFunc, normalize_ = normalize) {
    const curve = { left: [], right: [] };
    const isQuadratic = sx1 === sx2 && sy1 === sy2;
    let xFunc, yFunc, ixFunc, iyFunc;
    if (isQuadratic) {
      xFunc = (t) => quadraticBezier(x1, sx1, x2, t);
      yFunc = (t) => quadraticBezier(y1, sy1, y2, t);
      ixFunc = (t) => quadraticBezierDeriv(x1, sx1, x2, t);
      iyFunc = (t) => quadraticBezierDeriv(y1, sy1, y2, t);
    } else {
      xFunc = (t) => cubicBezier(x1, sx1, sx2, x2, t);
      yFunc = (t) => cubicBezier(y1, sy1, sy2, y2, t);
      ixFunc = (t) => cubicBezierDeriv(x1, sx1, sx2, x2, t);
      iyFunc = (t) => cubicBezierDeriv(y1, sy1, sy2, y2, t);
    }
    for (let tt = 0; tt <= 1e3; tt += kRate) {
      const t = tt / 1e3;
      const x = xFunc(t);
      const y = yFunc(t);
      const ix = ixFunc(t);
      const iy = iyFunc(t);
      const width = widthFunc(t);
      const [ia, ib] = normalize_([-iy, ix], width);
      curve.left.push([x - ia, y - ib]);
      curve.right.push([x + ia, y + ib]);
    }
    return curve;
  }

  // ../../github/kage-engine/src/polygon.ts
  var _Polygon = class {
    constructor(param) {
      this._precision = 10;
      this._array = [];
      if (param) {
        if (typeof param === "number") {
          for (let i = 0; i < param; i++) {
            this.push(0, 0, false);
          }
        } else {
          for (const { x, y, off } of param) {
            this.push(x, y, off);
          }
        }
      }
    }
    get array() {
      return this._array.map((_, i) => this.get(i));
    }
    get length() {
      return this._array.length;
    }
    push(x, y, off = false) {
      this._array.push(this.createInternalPoint(x, y, off));
    }
    pushPoint(point) {
      this.push(point.x, point.y, point.off);
    }
    set(index, x, y, off = false) {
      this._array[index] = this.createInternalPoint(x, y, off);
    }
    setPoint(index, point) {
      this.set(index, point.x, point.y, point.off);
    }
    get(index) {
      const { x, y, off } = this._array[index];
      if (this._precision === 0) {
        return { x, y, off };
      }
      return {
        x: x / this._precision,
        y: y / this._precision,
        off
      };
    }
    reverse() {
      this._array.reverse();
    }
    concat(poly) {
      if (this._precision !== poly._precision) {
        throw new TypeError("Cannot concat polygon's with different precisions");
      }
      this._array = this._array.concat(poly._array);
    }
    shift() {
      this._array.shift();
    }
    unshift(x, y, off = false) {
      this._array.unshift(this.createInternalPoint(x, y, off));
    }
    clone() {
      return new _Polygon(this.array);
    }
    createInternalPoint(x, y, off = false) {
      if (this._precision === 0) {
        return { x, y, off };
      }
      return {
        x: x * this._precision,
        y: y * this._precision,
        off
      };
    }
    translate(dx, dy) {
      if (this._precision !== 0) {
        dx *= this._precision;
        dy *= this._precision;
      }
      for (const point of this._array) {
        point.x += dx;
        point.y += dy;
      }
      return this;
    }
    reflectX() {
      for (const point of this._array) {
        point.x *= -1;
      }
      return this;
    }
    reflectY() {
      for (const point of this._array) {
        point.y *= -1;
      }
      return this;
    }
    rotate90() {
      for (const point of this._array) {
        const { x, y } = point;
        point.x = -y;
        point.y = x;
      }
      return this;
    }
    rotate180() {
      for (const point of this._array) {
        point.x *= -1;
        point.y *= -1;
      }
      return this;
    }
    rotate270() {
      for (const point of this._array) {
        const { x, y } = point;
        point.x = y;
        point.y = -x;
      }
      return this;
    }
    floor() {
      if (this._precision === 0) {
        return this;
      }
      for (const point of this._array) {
        const { x, y } = point;
        point.x = Math.floor(x);
        point.y = Math.floor(y);
      }
      return this;
    }
  };
  var Polygon = _Polygon;
  Symbol.iterator;
  (() => {
    if (typeof Symbol !== "undefined" && Symbol.iterator) {
      _Polygon.prototype[Symbol.iterator] = function() {
        let i = 0;
        return {
          next: () => {
            if (i < this._array.length) {
              return {
                done: false,
                value: this.get(i++)
              };
            }
            return { done: true, value: void 0 };
          }
        };
      };
    }
  })();

  // ../../github/kage-engine/src/pen.ts
  var Pen = class {
    constructor(x, y) {
      this.cos_theta = 1;
      this.sin_theta = 0;
      this.x = x;
      this.y = y;
    }
    setMatrix2(cos_theta, sin_theta) {
      this.cos_theta = cos_theta;
      this.sin_theta = sin_theta;
      return this;
    }
    setLeft(otherX, otherY) {
      const [dx, dy] = normalize([otherX - this.x, otherY - this.y]);
      this.setMatrix2(-dx, -dy);
      return this;
    }
    setRight(otherX, otherY) {
      const [dx, dy] = normalize([otherX - this.x, otherY - this.y]);
      this.setMatrix2(dx, dy);
      return this;
    }
    setUp(otherX, otherY) {
      const [dx, dy] = normalize([otherX - this.x, otherY - this.y]);
      this.setMatrix2(-dy, dx);
      return this;
    }
    setDown(otherX, otherY) {
      const [dx, dy] = normalize([otherX - this.x, otherY - this.y]);
      this.setMatrix2(dy, -dx);
      return this;
    }
    move(localDx, localDy) {
      ({ x: this.x, y: this.y } = this.getPoint(localDx, localDy));
      return this;
    }
    getPoint(localX, localY, off) {
      return {
        x: this.x + this.cos_theta * localX + -this.sin_theta * localY,
        y: this.y + this.sin_theta * localX + this.cos_theta * localY,
        off
      };
    }
    getPolygon(localPoints) {
      return new Polygon(localPoints.map(({ x, y, off }) => this.getPoint(x, y, off)));
    }
  };

  // ../../github/kage-engine/src/font/mincho/cd.ts
  function cdDrawCurveU(font, polygons, x1, y1, sx1, sy1, sx2, sy2, x2, y2, ta1, ta2, opt1, haneAdjustment, opt3, opt4) {
    const a1 = ta1;
    const a2 = ta2;
    const kMinWidthT = font.kMinWidthT - opt1 / 2;
    let delta1;
    switch (a1 % 100) {
      case 0:
      case 7:
      case 27:
        delta1 = -1 * font.kMinWidthY * 0.5;
        break;
      case 1:
      case 2:
      case 6:
      case 22:
      case 32:
        delta1 = 0;
        break;
      case 12:
        delta1 = font.kMinWidthY;
        break;
      default:
        return;
    }
    if (delta1 !== 0) {
      const [dx1, dy1] = x1 === sx1 && y1 === sy1 ? [0, delta1] : normalize([x1 - sx1, y1 - sy1], delta1);
      x1 += dx1;
      y1 += dy1;
    }
    let cornerOffset = 0;
    if ((a1 === 22 || a1 === 27) && a2 === 7 && kMinWidthT > 6) {
      const contourLength = hypot(sx1 - x1, sy1 - y1) + hypot(sx2 - sx1, sy2 - sy1) + hypot(x2 - sx2, y2 - sy2);
      if (contourLength < 100) {
        cornerOffset = (kMinWidthT - 6) * ((100 - contourLength) / 100);
        x1 += cornerOffset;
      }
    }
    let delta2;
    switch (a2 % 100) {
      case 0:
      case 1:
      case 7:
      case 9:
      case 15:
      case 14:
      case 17:
      case 5:
        delta2 = 0;
        break;
      case 8:
        delta2 = -1 * kMinWidthT * 0.5;
        break;
      default:
        delta2 = delta1;
        break;
    }
    if (delta2 !== 0) {
      const [dx2, dy2] = sx2 === x2 && sy2 === y2 ? [0, -delta2] : normalize([x2 - sx2, y2 - sy2], delta2);
      x2 += dx2;
      y2 += dy2;
    }
    const isQuadratic = sx1 === sx2 && sy1 === sy2;
    if (isQuadratic && font.kUseCurve) {
      const hosomi = 0.5;
      const deltadFunc = a1 === 7 && a2 === 0 ? (t) => __pow(t, hosomi) * 1.1 : a1 === 7 ? (t) => __pow(t, hosomi) : a2 === 7 ? (t) => __pow(1 - t, hosomi) : opt3 > 0 ? (t) => 1 - opt3 / 2 / (kMinWidthT - opt4 / 2) + opt3 / 2 / (kMinWidthT - opt4) * t : () => 1;
      const { left: curveL, right: curveR } = generateFattenCurve(x1, y1, sx1, sy1, sx1, sy1, x2, y2, 10, (t) => {
        let deltad = deltadFunc(t);
        if (deltad < 0.15) {
          deltad = 0.15;
        }
        return kMinWidthT * deltad;
      }, ([x, y], mag) => y === 0 ? [-mag, 0] : normalize([x, y], mag));
      const { off: [offL1, offL2], index: indexL } = divide_curve(x1, y1, sx1, sy1, x2, y2, curveL);
      const curveL1 = curveL.slice(0, indexL + 1);
      const curveL2 = curveL.slice(indexL);
      const { off: [offR1, offR2], index: indexR } = divide_curve(x1, y1, sx1, sy1, x2, y2, curveR);
      const ncl1 = find_offcurve(curveL1, offL1[2], offL1[3]);
      const ncl2 = find_offcurve(curveL2, offL2[2], offL2[3]);
      const poly = new Polygon([
        { x: ncl1[0], y: ncl1[1] },
        { x: ncl1[2], y: ncl1[3], off: true },
        { x: ncl1[4], y: ncl1[5] },
        { x: ncl2[2], y: ncl2[3], off: true },
        { x: ncl2[4], y: ncl2[5] }
      ]);
      const poly2 = new Polygon([
        { x: curveR[0][0], y: curveR[0][1] },
        {
          x: offR1[2] - (ncl1[2] - offL1[2]),
          y: offR1[3] - (ncl1[3] - offL1[3]),
          off: true
        },
        { x: curveR[indexR][0], y: curveR[indexR][1] },
        {
          x: offR2[2] - (ncl2[2] - offL2[2]),
          y: offR2[3] - (ncl2[3] - offL2[3]),
          off: true
        },
        { x: curveR[curveR.length - 1][0], y: curveR[curveR.length - 1][1] }
      ]);
      poly2.reverse();
      poly.concat(poly2);
      polygons.push(poly);
    } else {
      let hosomi = 0.5;
      if (hypot(x2 - x1, y2 - y1) < 50) {
        hosomi += 0.4 * (1 - hypot(x2 - x1, y2 - y1) / 50);
      }
      const deltadFunc = (a1 === 7 || a1 === 27) && a2 === 0 ? (t) => __pow(t, hosomi) * font.kL2RDfatten : a1 === 7 || a1 === 27 ? isQuadratic ? (t) => __pow(t, hosomi) : (t) => __pow(__pow(t, hosomi), 0.7) : a2 === 7 ? (t) => __pow(1 - t, hosomi) : isQuadratic && (opt3 > 0 || opt4 > 0) ? (t) => (font.kMinWidthT - opt3 / 2 - (opt4 - opt3) / 2 * t) / font.kMinWidthT : () => 1;
      const { left, right } = generateFattenCurve(x1, y1, sx1, sy1, sx2, sy2, x2, y2, font.kRate, (t) => {
        let deltad = deltadFunc(t);
        if (deltad < 0.15) {
          deltad = 0.15;
        }
        return kMinWidthT * deltad;
      }, ([x, y], mag) => round(x) === 0 && round(y) === 0 ? [-mag, 0] : normalize([x, y], mag));
      const poly = new Polygon();
      const poly2 = new Polygon();
      for (const [x, y] of left) {
        poly.push(x, y);
      }
      for (const [x, y] of right) {
        poly2.push(x, y);
      }
      if (a1 === 132 || a1 === 22 && (isQuadratic ? y1 > y2 : x1 > sx1)) {
        poly.floor();
        poly2.floor();
        for (let index = 0, length = poly2.length; index + 1 < length; index++) {
          const point1 = poly2.get(index);
          const point2 = poly2.get(index + 1);
          if (point1.y <= y1 && y1 <= point2.y) {
            const newx1 = point2.x + (point1.x - point2.x) * (y1 - point2.y) / (point1.y - point2.y);
            const newy1 = y1;
            const point3 = poly.get(0);
            const point4 = poly.get(1);
            const newx2 = a1 === 132 ? point3.x + (point4.x - point3.x) * (y1 - point3.y) / (point4.y - point3.y) : point3.x + (point4.x - point3.x + 1) * (y1 - point3.y) / (point4.y - point3.y);
            const newy2 = a1 === 132 ? y1 : y1 + 1;
            for (let i = 0; i < index; i++) {
              poly2.shift();
            }
            poly2.set(0, newx1, newy1);
            poly.unshift(newx2, newy2);
            break;
          }
        }
      }
      poly2.reverse();
      poly.concat(poly2);
      polygons.push(poly);
    }
    switch (a1) {
      case 12: {
        const pen1 = new Pen(x1, y1);
        if (x1 !== sx1) {
          pen1.setDown(sx1, sy1);
        }
        const poly = pen1.getPolygon([
          { x: -kMinWidthT, y: 0 },
          { x: +kMinWidthT, y: 0 },
          { x: -kMinWidthT, y: -kMinWidthT }
        ]);
        polygons.push(poly);
        break;
      }
      case 0: {
        if (y1 <= y2) {
          const pen1 = new Pen(x1, y1);
          if (x1 !== sx1) {
            pen1.setDown(sx1, sy1);
          }
          let type = Math.atan2(Math.abs(y1 - sy1), Math.abs(x1 - sx1)) / Math.PI * 2 - 0.4;
          if (type > 0) {
            type *= 2;
          } else {
            type *= 16;
          }
          const pm = type < 0 ? -1 : 1;
          const poly = pen1.getPolygon([
            { x: -kMinWidthT, y: 1 },
            { x: +kMinWidthT, y: 0 },
            { x: -pm * kMinWidthT, y: -font.kMinWidthY * Math.abs(type) }
          ]);
          polygons.push(poly);
          const move = type < 0 ? -type * font.kMinWidthY : 0;
          const poly2 = pen1.getPolygon(x1 === sx1 && y1 === sy1 ? [
            { x: kMinWidthT, y: -move },
            { x: kMinWidthT * 1.5, y: font.kMinWidthY - move },
            { x: kMinWidthT - 2, y: font.kMinWidthY * 2 + 1 }
          ] : [
            { x: kMinWidthT, y: -move },
            { x: kMinWidthT * 1.5, y: font.kMinWidthY - move * 1.2 },
            { x: kMinWidthT - 2, y: font.kMinWidthY * 2 - move * 0.8 + 1 }
          ]);
          polygons.push(poly2);
        } else {
          const pen1 = new Pen(x1, y1);
          if (x1 === sx1) {
            pen1.setMatrix2(0, 1);
          } else {
            pen1.setRight(sx1, sy1);
          }
          const poly = pen1.getPolygon([
            { x: 0, y: +kMinWidthT },
            { x: 0, y: -kMinWidthT },
            { x: -font.kMinWidthY, y: -kMinWidthT }
          ]);
          polygons.push(poly);
          const poly2 = pen1.getPolygon([
            { x: 0, y: +kMinWidthT },
            { x: +font.kMinWidthY, y: +kMinWidthT * 1.5 },
            { x: +font.kMinWidthY * 3, y: +kMinWidthT * 0.5 }
          ]);
          polygons.push(poly2);
        }
        break;
      }
      case 22:
      case 27: {
        const poly = new Pen(x1 - cornerOffset, y1).getPolygon([
          { x: -kMinWidthT, y: -font.kMinWidthY },
          { x: 0, y: -font.kMinWidthY - font.kWidth },
          { x: +kMinWidthT + font.kWidth, y: +font.kMinWidthY },
          { x: +kMinWidthT, y: +kMinWidthT - 1 }
        ].concat(a1 === 27 ? [
          { x: 0, y: +kMinWidthT + 2 },
          { x: 0, y: 0 }
        ] : [
          { x: -kMinWidthT, y: +kMinWidthT + 4 }
        ]));
        polygons.push(poly);
        break;
      }
    }
    switch (a2) {
      case 1:
      case 8:
      case 15: {
        const kMinWidthT2 = font.kMinWidthT - opt4 / 2;
        const pen2 = new Pen(x2, y2);
        if (sx2 === x2) {
          pen2.setMatrix2(0, 1);
        } else if (sy2 !== y2) {
          pen2.setLeft(sx2, sy2);
        }
        const poly = pen2.getPolygon(font.kUseCurve ? [
          { x: 0, y: -kMinWidthT2 },
          { x: +kMinWidthT2 * 0.9, y: -kMinWidthT2 * 0.9, off: true },
          { x: +kMinWidthT2, y: 0 },
          { x: +kMinWidthT2 * 0.9, y: +kMinWidthT2 * 0.9, off: true },
          { x: 0, y: +kMinWidthT2 }
        ] : [
          { x: 0, y: -kMinWidthT2 },
          { x: +kMinWidthT2 * 0.7, y: -kMinWidthT2 * 0.7 },
          { x: +kMinWidthT2, y: 0 },
          { x: +kMinWidthT2 * 0.7, y: +kMinWidthT2 * 0.7 },
          { x: 0, y: +kMinWidthT2 }
        ]);
        if (sx2 === x2) {
          poly.reverse();
        }
        polygons.push(poly);
        if (a2 === 15) {
          const pen2_r = new Pen(x2, y2);
          if (y1 >= y2) {
            pen2_r.setMatrix2(-1, 0);
          }
          const poly2 = pen2_r.getPolygon([
            { x: 0, y: -kMinWidthT + 1 },
            { x: 2, y: -kMinWidthT - font.kWidth * 5 },
            { x: 0, y: -kMinWidthT - font.kWidth * 5 },
            { x: -kMinWidthT, y: -kMinWidthT + 1 }
          ]);
          polygons.push(poly2);
        }
        break;
      }
      case 0:
        if (!(a1 === 7 || a1 === 27)) {
          break;
        }
      case 9: {
        let type = Math.atan2(Math.abs(y2 - sy2), Math.abs(x2 - sx2)) / Math.PI * 2 - 0.6;
        if (type > 0) {
          type *= 8;
        } else {
          type *= 3;
        }
        const pm = type < 0 ? -1 : 1;
        const pen2 = new Pen(x2, y2);
        if (sy2 === y2) {
          pen2.setMatrix2(1, 0);
        } else if (sx2 === x2) {
          pen2.setMatrix2(0, y2 > sy2 ? -1 : 1);
        } else {
          pen2.setLeft(sx2, sy2);
        }
        const poly = pen2.getPolygon([
          { x: 0, y: +kMinWidthT * font.kL2RDfatten },
          { x: 0, y: -kMinWidthT * font.kL2RDfatten },
          { x: Math.abs(type) * kMinWidthT * font.kL2RDfatten, y: pm * kMinWidthT * font.kL2RDfatten }
        ]);
        polygons.push(poly);
        break;
      }
      case 14: {
        const jumpFactor = kMinWidthT > 6 ? 6 / kMinWidthT : 1;
        const haneLength = font.kWidth * 4 * Math.min(1 - haneAdjustment / 10, __pow(kMinWidthT / font.kMinWidthT, 3)) * jumpFactor;
        const poly = new Pen(x2, y2).getPolygon([
          { x: 0, y: 0 },
          { x: 0, y: -kMinWidthT },
          { x: -haneLength, y: -kMinWidthT },
          { x: -haneLength, y: -kMinWidthT * 0.5 }
        ]);
        polygons.push(poly);
        break;
      }
    }
  }
  function cdDrawBezier(font, polygons, x1, y1, x2, y2, x3, y3, x4, y4, a1, a2, opt1, haneAdjustment, opt3, opt4) {
    cdDrawCurveU(font, polygons, x1, y1, x2, y2, x3, y3, x4, y4, a1, a2, opt1, haneAdjustment, opt3, opt4);
  }
  function cdDrawCurve(font, polygons, x1, y1, x2, y2, x3, y3, a1, a2, opt1, haneAdjustment, opt3, opt4) {
    cdDrawCurveU(font, polygons, x1, y1, x2, y2, x2, y2, x3, y3, a1, a2, opt1, haneAdjustment, opt3, opt4);
  }
  function cdDrawLine(font, polygons, tx1, ty1, tx2, ty2, ta1, ta2, opt1, urokoAdjustment, kakatoAdjustment) {
    const x1 = tx1;
    const y1 = ty1;
    const x2 = tx2;
    const y2 = ty2;
    const a1 = ta1;
    const a2 = ta2;
    const kMinWidthT = font.kMinWidthT - opt1 / 2;
    if (x1 === x2 || y1 !== y2 && (x1 > x2 || Math.abs(y2 - y1) >= Math.abs(x2 - x1) || a1 === 6 || a2 === 6)) {
      const [cosrad, sinrad] = x1 === x2 ? [0, 1] : normalize([x2 - x1, y2 - y1]);
      const pen1 = new Pen(x1, y1);
      const pen2 = new Pen(x2, y2);
      pen1.setMatrix2(sinrad, -cosrad);
      pen2.setMatrix2(sinrad, -cosrad);
      const poly0 = new Polygon(4);
      switch (a1) {
        case 0:
          poly0.setPoint(0, pen1.getPoint(kMinWidthT, font.kMinWidthY / 2));
          poly0.setPoint(3, pen1.getPoint(-kMinWidthT, -font.kMinWidthY / 2));
          break;
        case 1:
        case 6:
          poly0.setPoint(0, pen1.getPoint(kMinWidthT, 0));
          poly0.setPoint(3, pen1.getPoint(-kMinWidthT, 0));
          break;
        case 12:
          poly0.setPoint(0, pen1.getPoint(kMinWidthT, -font.kMinWidthY));
          poly0.setPoint(3, pen1.getPoint(-kMinWidthT, -font.kMinWidthY - kMinWidthT));
          break;
        case 22:
          if (x1 === x2) {
            poly0.set(0, x1 + kMinWidthT, y1);
            poly0.set(3, x1 - kMinWidthT, y1);
          } else {
            const v = x1 > x2 ? -1 : 1;
            poly0.set(0, x1 + (kMinWidthT + v) / sinrad, y1 + 1);
            poly0.set(3, x1 - kMinWidthT / sinrad, y1);
          }
          break;
        case 32:
          if (x1 === x2) {
            poly0.set(0, x1 + kMinWidthT, y1 - font.kMinWidthY);
            poly0.set(3, x1 - kMinWidthT, y1 - font.kMinWidthY);
          } else {
            poly0.set(0, x1 + kMinWidthT / sinrad, y1);
            poly0.set(3, x1 - kMinWidthT / sinrad, y1);
          }
          break;
      }
      switch (a2) {
        case 0:
          if (a1 === 6) {
            poly0.setPoint(1, pen2.getPoint(kMinWidthT, 0));
            poly0.setPoint(2, pen2.getPoint(-kMinWidthT, 0));
          } else {
            poly0.setPoint(1, pen2.getPoint(kMinWidthT, -kMinWidthT / 2));
            poly0.setPoint(2, pen2.getPoint(-kMinWidthT, kMinWidthT / 2));
          }
          break;
        case 5:
          if (x1 === x2) {
            break;
          }
        case 1:
          poly0.setPoint(1, pen2.getPoint(kMinWidthT, 0));
          poly0.setPoint(2, pen2.getPoint(-kMinWidthT, 0));
          break;
        case 13:
          poly0.setPoint(1, pen2.getPoint(kMinWidthT, font.kAdjustKakatoL[kakatoAdjustment]));
          poly0.setPoint(2, pen2.getPoint(-kMinWidthT, font.kAdjustKakatoL[kakatoAdjustment] + kMinWidthT));
          break;
        case 23:
          poly0.setPoint(1, pen2.getPoint(kMinWidthT, font.kAdjustKakatoR[kakatoAdjustment]));
          poly0.setPoint(2, pen2.getPoint(-kMinWidthT, font.kAdjustKakatoR[kakatoAdjustment] + kMinWidthT));
          break;
        case 24:
        case 32:
          if (x1 === x2) {
            poly0.set(1, x2 + kMinWidthT, y2 + font.kMinWidthY);
            poly0.set(2, x2 - kMinWidthT, y2 + font.kMinWidthY);
          } else {
            poly0.set(1, x2 + kMinWidthT / sinrad, y2);
            poly0.set(2, x2 - kMinWidthT / sinrad, y2);
          }
          break;
      }
      polygons.push(poly0);
      switch (a2) {
        case 24: {
          const poly = new Pen(x2, y2).getPolygon([
            { x: 0, y: +font.kMinWidthY },
            x1 === x2 ? { x: +kMinWidthT, y: -font.kMinWidthY * 3 } : { x: +kMinWidthT * 0.5, y: -font.kMinWidthY * 4 },
            { x: +kMinWidthT * 2, y: -font.kMinWidthY },
            { x: +kMinWidthT * 2, y: +font.kMinWidthY }
          ]);
          polygons.push(poly);
          break;
        }
        case 13:
          if (kakatoAdjustment === 4) {
            if (x1 === x2) {
              const poly = new Pen(x2, y2).getPolygon([
                { x: -kMinWidthT, y: -font.kMinWidthY * 3 },
                { x: -kMinWidthT * 2, y: 0 },
                { x: -font.kMinWidthY, y: +font.kMinWidthY * 5 },
                { x: +kMinWidthT, y: +font.kMinWidthY }
              ]);
              polygons.push(poly);
            } else {
              const m = x1 > x2 && y1 !== y2 ? Math.floor((x1 - x2) / (y2 - y1) * 3) : 0;
              const poly = new Pen(x2 + m, y2).getPolygon([
                { x: 0, y: -font.kMinWidthY * 5 },
                { x: -kMinWidthT * 2, y: 0 },
                { x: -font.kMinWidthY, y: +font.kMinWidthY * 5 },
                { x: +kMinWidthT, y: +font.kMinWidthY },
                { x: 0, y: 0 }
              ]);
              polygons.push(poly);
            }
          }
          break;
      }
      switch (a1) {
        case 22:
        case 27: {
          const poly = new Pen(x1, y1).getPolygon([
            { x: -kMinWidthT, y: -font.kMinWidthY },
            { x: 0, y: -font.kMinWidthY - font.kWidth },
            { x: +kMinWidthT + font.kWidth, y: +font.kMinWidthY }
          ].concat(x1 === x2 ? [
            { x: +kMinWidthT, y: +kMinWidthT },
            { x: -kMinWidthT, y: 0 }
          ] : a1 === 27 ? [
            { x: +kMinWidthT, y: +kMinWidthT - 1 },
            { x: 0, y: +kMinWidthT + 2 },
            { x: 0, y: 0 }
          ] : [
            { x: +kMinWidthT, y: +kMinWidthT - 1 },
            { x: -kMinWidthT, y: +kMinWidthT + 4 }
          ]));
          polygons.push(poly);
          break;
        }
        case 0: {
          const poly = pen1.getPolygon([
            { x: kMinWidthT, y: font.kMinWidthY * 0.5 },
            { x: kMinWidthT + kMinWidthT * 0.5, y: font.kMinWidthY * 0.5 + font.kMinWidthY },
            { x: kMinWidthT - 2, y: font.kMinWidthY * 0.5 + font.kMinWidthY * 2 + 1 }
          ]);
          if (x1 !== x2) {
            poly.set(2, x1 + (kMinWidthT - 2) * sinrad + (font.kMinWidthY * 0.5 + font.kMinWidthY * 2) * cosrad, y1 + (kMinWidthT + 1) * -cosrad + (font.kMinWidthY * 0.5 + font.kMinWidthY * 2) * sinrad);
          }
          polygons.push(poly);
          break;
        }
      }
      if (x1 === x2 && a2 === 1 || a1 === 6 && (a2 === 0 || x1 !== x2 && a2 === 5)) {
        const poly = new Polygon();
        if (font.kUseCurve) {
          poly.pushPoint(pen2.getPoint(kMinWidthT, 0));
          poly.push(x2 - cosrad * kMinWidthT * 0.9 + -sinrad * -kMinWidthT * 0.9, y2 + sinrad * kMinWidthT * 0.9 + cosrad * -kMinWidthT * 0.9, true);
          poly.pushPoint(pen2.getPoint(0, kMinWidthT));
          poly.pushPoint(pen2.getPoint(-kMinWidthT * 0.9, kMinWidthT * 0.9, true));
          poly.pushPoint(pen2.getPoint(-kMinWidthT, 0));
        } else {
          const r = x1 === x2 && (a1 === 6 && a2 === 0 || a2 === 1) ? 0.6 : 0.8;
          poly.pushPoint(pen2.getPoint(kMinWidthT, 0));
          poly.pushPoint(pen2.getPoint(kMinWidthT * 0.6, kMinWidthT * r));
          poly.pushPoint(pen2.getPoint(0, kMinWidthT));
          poly.pushPoint(pen2.getPoint(-kMinWidthT * 0.6, kMinWidthT * r));
          poly.pushPoint(pen2.getPoint(-kMinWidthT, 0));
        }
        if (x1 === x2 && (a1 === 6 && a2 === 0 || a2 === 1)) {
          poly.reverse();
        }
        polygons.push(poly);
        if (x1 !== x2 && a1 === 6 && a2 === 5) {
          const haneLength = font.kWidth * 5;
          const rv = x1 < x2 ? 1 : -1;
          const poly2 = pen2.getPolygon([
            { x: rv * (kMinWidthT - 1), y: 0 },
            { x: rv * (kMinWidthT + haneLength), y: 2 },
            { x: rv * (kMinWidthT + haneLength), y: 0 },
            { x: kMinWidthT - 1, y: -kMinWidthT }
          ]);
          polygons.push(poly2);
        }
      }
    } else if (y1 === y2 && a1 === 6) {
      const pen1_r = new Pen(x1, y1);
      const pen2_r = new Pen(x2, y2);
      const poly0 = new Polygon([
        pen1_r.getPoint(0, -kMinWidthT),
        pen2_r.getPoint(0, -kMinWidthT),
        pen2_r.getPoint(0, +kMinWidthT),
        pen1_r.getPoint(0, +kMinWidthT)
      ]);
      polygons.push(poly0);
      switch (a2) {
        case 1:
        case 0:
        case 5: {
          const pen2 = new Pen(x2, y2);
          if (x1 > x2) {
            pen2.setMatrix2(-1, 0);
          }
          const r = 0.6;
          const poly = pen2.getPolygon(font.kUseCurve ? [
            { x: 0, y: -kMinWidthT },
            { x: +kMinWidthT * 0.9, y: -kMinWidthT * 0.9, off: true },
            { x: +kMinWidthT, y: 0 },
            { x: +kMinWidthT * 0.9, y: +kMinWidthT * 0.9, off: true },
            { x: 0, y: +kMinWidthT }
          ] : [
            { x: 0, y: -kMinWidthT },
            { x: +kMinWidthT * r, y: -kMinWidthT * 0.6 },
            { x: +kMinWidthT, y: 0 },
            { x: +kMinWidthT * r, y: +kMinWidthT * 0.6 },
            { x: 0, y: +kMinWidthT }
          ]);
          if (x1 >= x2) {
            poly.reverse();
          }
          polygons.push(poly);
          if (a2 === 5) {
            const haneLength = font.kWidth * (4 * (1 - opt1 / font.kAdjustMageStep) + 1);
            const rv = x1 < x2 ? 1 : -1;
            const poly2 = pen2.getPolygon([
              { x: 0, y: rv * -kMinWidthT },
              { x: 2, y: rv * (-kMinWidthT - haneLength) },
              { x: 0, y: rv * (-kMinWidthT - haneLength) },
              { x: -kMinWidthT, y: rv * -kMinWidthT }
            ]);
            polygons.push(poly2);
          }
          break;
        }
      }
    } else {
      const [cosrad, sinrad] = y1 === y2 ? [1, 0] : normalize([x2 - x1, y2 - y1]);
      const pen1 = new Pen(x1, y1);
      const pen2 = new Pen(x2, y2);
      pen1.setMatrix2(cosrad, sinrad);
      pen2.setMatrix2(cosrad, sinrad);
      const poly = new Polygon([
        pen1.getPoint(0, -font.kMinWidthY),
        pen2.getPoint(0, -font.kMinWidthY),
        pen2.getPoint(0, font.kMinWidthY),
        pen1.getPoint(0, font.kMinWidthY)
      ]);
      polygons.push(poly);
      switch (a2) {
        case 0: {
          const urokoScale = (font.kMinWidthU / font.kMinWidthY - 1) / 4 + 1;
          const poly2 = pen2.getPolygon([
            { x: 0, y: -font.kMinWidthY },
            { x: -font.kAdjustUrokoX[urokoAdjustment] * urokoScale, y: 0 }
          ]);
          poly2.push(x2 - (cosrad - sinrad) * font.kAdjustUrokoX[urokoAdjustment] * urokoScale / 2, y2 - (sinrad + cosrad) * font.kAdjustUrokoY[urokoAdjustment] * urokoScale);
          polygons.push(poly2);
          break;
        }
      }
    }
  }

  // ../../github/kage-engine/src/font/mincho/index.ts
  function selectPolygonsRect(polygons, x1, y1, x2, y2) {
    return polygons.array.filter((polygon) => polygon.array.every(({ x, y }) => x1 <= x && x <= x2 && y1 <= y && y <= y2));
  }
  function dfDrawFont(font, polygons, {
    stroke: {
      a1_100,
      a2_100,
      a2_opt,
      a2_opt_1,
      a2_opt_2,
      a2_opt_3,
      a3_100,
      a3_opt,
      a3_opt_1,
      a3_opt_2,
      x1,
      y1,
      x2,
      y2,
      x3,
      y3,
      x4,
      y4
    },
    kirikuchiAdjustment,
    tateAdjustment,
    haneAdjustment,
    urokoAdjustment,
    kakatoAdjustment,
    mageAdjustment
  }) {
    switch (a1_100) {
      case 0:
        if (a2_100 === 98 && a2_opt === 0) {
          const dx = x1 + x2, dy = 0;
          for (const polygon of selectPolygonsRect(polygons, x1, y1, x2, y2)) {
            polygon.reflectX().translate(dx, dy).floor();
          }
        } else if (a2_100 === 97 && a2_opt === 0) {
          const dx = 0, dy = y1 + y2;
          for (const polygon of selectPolygonsRect(polygons, x1, y1, x2, y2)) {
            polygon.reflectY().translate(dx, dy).floor();
          }
        } else if (a2_100 === 99 && a2_opt === 0) {
          if (a3_100 === 1 && a3_opt === 0) {
            const dx = x1 + y2, dy = y1 - x1;
            for (const polygon of selectPolygonsRect(polygons, x1, y1, x2, y2)) {
              polygon.rotate90().translate(dx, dy).floor();
            }
          } else if (a3_100 === 2 && a3_opt === 0) {
            const dx = x1 + x2, dy = y1 + y2;
            for (const polygon of selectPolygonsRect(polygons, x1, y1, x2, y2)) {
              polygon.rotate180().translate(dx, dy).floor();
            }
          } else if (a3_100 === 3 && a3_opt === 0) {
            const dx = x1 - y1, dy = y2 + x1;
            for (const polygon of selectPolygonsRect(polygons, x1, y1, x2, y2)) {
              polygon.rotate270().translate(dx, dy).floor();
            }
          }
        }
        break;
      case 1: {
        if (a3_100 === 4) {
          const [dx1, dy1] = x1 === x2 && y1 === y2 ? [0, font.kMage] : normalize([x1 - x2, y1 - y2], font.kMage);
          const tx1 = x2 + dx1;
          const ty1 = y2 + dy1;
          cdDrawLine(font, polygons, x1, y1, tx1, ty1, a2_100 + a2_opt_1 * 100, 1, tateAdjustment, 0, 0);
          cdDrawCurve(font, polygons, tx1, ty1, x2, y2, x2 - font.kMage * ((font.kAdjustTateStep + 4 - tateAdjustment) / (font.kAdjustTateStep + 4)), y2, 1, 14, tateAdjustment % 10, haneAdjustment, Math.floor(tateAdjustment / 10), a3_opt_2);
        } else {
          cdDrawLine(font, polygons, x1, y1, x2, y2, a2_100 + a2_opt_1 * 100, a3_100, tateAdjustment, urokoAdjustment, kakatoAdjustment);
        }
        break;
      }
      case 2: {
        if (a3_100 === 4) {
          const [dx1, dy1] = x2 === x3 ? [0, -font.kMage] : y2 === y3 ? [-font.kMage, 0] : normalize([x2 - x3, y2 - y3], font.kMage);
          const tx1 = x3 + dx1;
          const ty1 = y3 + dy1;
          cdDrawCurve(font, polygons, x1, y1, x2, y2, tx1, ty1, a2_100 + kirikuchiAdjustment * 100, 0, a2_opt_2, 0, a2_opt_3, 0);
          cdDrawCurve(font, polygons, tx1, ty1, x3, y3, x3 - font.kMage, y3, 2, 14, a2_opt_2, haneAdjustment, 0, a3_opt_2);
        } else {
          cdDrawCurve(font, polygons, x1, y1, x2, y2, x3, y3, a2_100 + kirikuchiAdjustment * 100, a3_100 === 5 && a3_opt === 0 ? 15 : a3_100, a2_opt_2, a3_opt_1, a2_opt_3, a3_opt_2);
        }
        break;
      }
      case 3: {
        const [dx1, dy1] = x1 === x2 && y1 === y2 ? [0, font.kMage] : normalize([x1 - x2, y1 - y2], font.kMage);
        const tx1 = x2 + dx1;
        const ty1 = y2 + dy1;
        const [dx2, dy2] = x2 === x3 && y2 === y3 ? [0, -font.kMage] : normalize([x3 - x2, y3 - y2], font.kMage);
        const tx2 = x2 + dx2;
        const ty2 = y2 + dy2;
        cdDrawLine(font, polygons, x1, y1, tx1, ty1, a2_100 + a2_opt_1 * 100, 1, tateAdjustment, 0, 0);
        cdDrawCurve(font, polygons, tx1, ty1, x2, y2, tx2, ty2, 1, 1, 0, 0, tateAdjustment, mageAdjustment);
        if (!(a3_100 === 5 && a3_opt_1 === 0 && !(x2 < x3 && x3 - tx2 > 0 || x2 > x3 && tx2 - x3 > 0))) {
          const opt2 = a3_100 === 5 && a3_opt_1 === 0 ? 0 : a3_opt_1 + mageAdjustment * 10;
          cdDrawLine(font, polygons, tx2, ty2, x3, y3, 6, a3_100, mageAdjustment, opt2, opt2);
        }
        break;
      }
      case 12: {
        cdDrawCurve(font, polygons, x1, y1, x2, y2, x3, y3, a2_100 + a2_opt_1 * 100, 1, a2_opt_2, 0, a2_opt_3, 0);
        cdDrawLine(font, polygons, x3, y3, x4, y4, 6, a3_100, 0, a3_opt, a3_opt);
        break;
      }
      case 4: {
        let rate = hypot(x3 - x2, y3 - y2) / 120 * 6;
        if (rate > 6) {
          rate = 6;
        }
        const [dx1, dy1] = x1 === x2 && y1 === y2 ? [0, font.kMage * rate] : normalize([x1 - x2, y1 - y2], font.kMage * rate);
        const tx1 = x2 + dx1;
        const ty1 = y2 + dy1;
        const [dx2, dy2] = x2 === x3 && y2 === y3 ? [0, -font.kMage * rate] : normalize([x3 - x2, y3 - y2], font.kMage * rate);
        const tx2 = x2 + dx2;
        const ty2 = y2 + dy2;
        cdDrawLine(font, polygons, x1, y1, tx1, ty1, a2_100 + a2_opt_1 * 100, 1, a2_opt_2 + a2_opt_3 * 10, 0, 0);
        cdDrawCurve(font, polygons, tx1, ty1, x2, y2, tx2, ty2, 1, 1, 0, 0, 0, 0);
        if (!(a3_100 === 5 && a3_opt === 0 && x3 - tx2 <= 0)) {
          cdDrawLine(font, polygons, tx2, ty2, x3, y3, 6, a3_100, 0, a3_opt, a3_opt);
        }
        break;
      }
      case 6: {
        if (a3_100 === 4) {
          const [dx1, dy1] = x3 === x4 ? [0, -font.kMage] : y3 === y4 ? [-font.kMage, 0] : normalize([x3 - x4, y3 - y4], font.kMage);
          const tx1 = x4 + dx1;
          const ty1 = y4 + dy1;
          cdDrawBezier(font, polygons, x1, y1, x2, y2, x3, y3, tx1, ty1, a2_100 + a2_opt_1 * 100, 1, a2_opt_2, 0, a2_opt_3, 0);
          cdDrawCurve(font, polygons, tx1, ty1, x4, y4, x4 - font.kMage, y4, 1, 14, 0, haneAdjustment, 0, a3_opt_2);
        } else {
          cdDrawBezier(font, polygons, x1, y1, x2, y2, x3, y3, x4, y4, a2_100 + a2_opt_1 * 100, a3_100 === 5 && a3_opt === 0 ? 15 : a3_100, a2_opt_2, a3_opt_1, a2_opt_3, a3_opt_2);
        }
        break;
      }
      case 7: {
        cdDrawLine(font, polygons, x1, y1, x2, y2, a2_100 + a2_opt_1 * 100, 1, tateAdjustment, 0, 0);
        cdDrawCurve(font, polygons, x2, y2, x3, y3, x4, y4, 1, a3_100, tateAdjustment % 10, a3_opt_1, Math.floor(tateAdjustment / 10), a3_opt_2);
        break;
      }
      case 9:
        break;
      default:
        break;
    }
  }
  var Mincho = class {
    constructor() {
      this.shotai = 0 /* kMincho */;
      this.kRate = 100;
      this.kMinWidthY = 2;
      this.kMinWidthU = 2;
      this.kMinWidthT = 6;
      this.kWidth = 5;
      this.kKakato = 3;
      this.kL2RDfatten = 1.1;
      this.kMage = 10;
      this.kUseCurve = false;
      this.kAdjustKakatoL = [14, 9, 5, 2, 0];
      this.kAdjustKakatoR = [8, 6, 4, 2];
      this.kAdjustKakatoRangeX = 20;
      this.kAdjustKakatoRangeY = [1, 19, 24, 30];
      this.kAdjustKakatoStep = 3;
      this.kAdjustUrokoX = [24, 20, 16, 12];
      this.kAdjustUrokoY = [12, 11, 9, 8];
      this.kAdjustUrokoLength = [22, 36, 50];
      this.kAdjustUrokoLengthStep = 3;
      this.kAdjustUrokoLine = [22, 26, 30];
      this.kAdjustUroko2Step = 3;
      this.kAdjustUroko2Length = 40;
      this.kAdjustTateStep = 4;
      this.kAdjustMageStep = 5;
      this.setSize();
    }
    setSize(size) {
      if (size === 1) {
        this.kMinWidthY = 1.2;
        this.kMinWidthT = 3.6;
        this.kWidth = 3;
        this.kKakato = 1.8;
        this.kL2RDfatten = 1.1;
        this.kMage = 6;
        this.kUseCurve = false;
        this.kAdjustKakatoL = [8, 5, 3, 1, 0];
        this.kAdjustKakatoR = [4, 3, 2, 1];
        this.kAdjustKakatoRangeX = 12;
        this.kAdjustKakatoRangeY = [1, 11, 14, 18];
        this.kAdjustKakatoStep = 3;
        this.kAdjustUrokoX = [14, 12, 9, 7];
        this.kAdjustUrokoY = [7, 6, 5, 4];
        this.kAdjustUrokoLength = [13, 21, 30];
        this.kAdjustUrokoLengthStep = 3;
        this.kAdjustUrokoLine = [13, 15, 18];
      } else {
        this.kMinWidthY = 2;
        this.kMinWidthU = 2;
        this.kMinWidthT = 6;
        this.kWidth = 5;
        this.kKakato = 3;
        this.kL2RDfatten = 1.1;
        this.kMage = 10;
        this.kUseCurve = false;
        this.kAdjustKakatoL = [14, 9, 5, 2, 0];
        this.kAdjustKakatoR = [8, 6, 4, 2];
        this.kAdjustKakatoRangeX = 20;
        this.kAdjustKakatoRangeY = [1, 19, 24, 30];
        this.kAdjustKakatoStep = 3;
        this.kAdjustUrokoX = [24, 20, 16, 12];
        this.kAdjustUrokoY = [12, 11, 9, 8];
        this.kAdjustUrokoLength = [22, 36, 50];
        this.kAdjustUrokoLengthStep = 3;
        this.kAdjustUrokoLine = [22, 26, 30];
        this.kAdjustUroko2Step = 3;
        this.kAdjustUroko2Length = 40;
        this.kAdjustTateStep = 4;
        this.kAdjustMageStep = 5;
      }
    }
    getDrawers(strokesArray) {
      return this.adjustStrokes(strokesArray).map((adjStroke) => (polygons) => {
        dfDrawFont(this, polygons, adjStroke);
      });
    }
    adjustStrokes(strokesArray) {
      const adjustedStrokes = strokesArray.map((stroke) => {
        const { a2_opt_1, a2_opt_2, a2_opt_3, a3_opt, a3_opt_1, a3_opt_2 } = stroke;
        return {
          stroke,
          kirikuchiAdjustment: a2_opt_1,
          tateAdjustment: a2_opt_2 + a2_opt_3 * 10,
          haneAdjustment: a3_opt_1,
          urokoAdjustment: a3_opt,
          kakatoAdjustment: a3_opt,
          mageAdjustment: a3_opt_2
        };
      });
      this.adjustHane(adjustedStrokes);
      this.adjustMage(adjustedStrokes);
      this.adjustTate(adjustedStrokes);
      this.adjustKakato(adjustedStrokes);
      this.adjustUroko(adjustedStrokes);
      this.adjustUroko2(adjustedStrokes);
      this.adjustKirikuchi(adjustedStrokes);
      return adjustedStrokes;
    }
    adjustHane(adjStrokes) {
      const vertSegments = [];
      for (const { stroke } of adjStrokes) {
        if (stroke.a1_100 === 1 && stroke.a1_opt === 0 && stroke.x1 === stroke.x2) {
          vertSegments.push({
            stroke,
            x: stroke.x1,
            y1: stroke.y1,
            y2: stroke.y2
          });
        }
      }
      for (const adjStroke of adjStrokes) {
        const { stroke } = adjStroke;
        if ((stroke.a1_100 === 1 || stroke.a1_100 === 2 || stroke.a1_100 === 6) && stroke.a1_opt === 0 && stroke.a3_100 === 4 && stroke.a3_opt === 0) {
          let lpx;
          let lpy;
          if (stroke.a1_100 === 1) {
            lpx = stroke.x2;
            lpy = stroke.y2;
          } else if (stroke.a1_100 === 2) {
            lpx = stroke.x3;
            lpy = stroke.y3;
          } else {
            lpx = stroke.x4;
            lpy = stroke.y4;
          }
          let mn = Infinity;
          if (lpx + 18 < 100) {
            mn = lpx + 18;
          }
          for (const { stroke: stroke2, x, y1, y2 } of vertSegments) {
            if (stroke !== stroke2 && lpx - x < 100 && x < lpx && y1 <= lpy && y2 >= lpy) {
              mn = Math.min(mn, lpx - x);
            }
          }
          if (mn !== Infinity) {
            adjStroke.haneAdjustment += 7 - Math.floor(mn / 15);
          }
        }
      }
      return adjStrokes;
    }
    adjustMage(adjStrokes) {
      const horiSegments = [];
      for (const adjStroke of adjStrokes) {
        const { stroke } = adjStroke;
        if (stroke.a1_100 === 1 && stroke.a1_opt === 0 && stroke.y1 === stroke.y2) {
          horiSegments.push({
            stroke,
            adjStroke,
            isTarget: false,
            y: stroke.y2,
            x1: stroke.x1,
            x2: stroke.x2
          });
        } else if (stroke.a1_100 === 3 && stroke.a1_opt === 0 && stroke.y2 === stroke.y3) {
          horiSegments.push({
            stroke,
            adjStroke,
            isTarget: true,
            y: stroke.y2,
            x1: stroke.x2,
            x2: stroke.x3
          });
        }
      }
      for (const { adjStroke, stroke, isTarget, y, x1, x2 } of horiSegments) {
        if (isTarget) {
          for (const { stroke: stroke2, y: other_y, x1: other_x1, x2: other_x2 } of horiSegments) {
            if (stroke !== stroke2 && !(x1 + 1 > other_x2 || x2 - 1 < other_x1) && round(Math.abs(y - other_y)) < this.kMinWidthT * this.kAdjustMageStep) {
              adjStroke.mageAdjustment += this.kAdjustMageStep - Math.floor(Math.abs(y - other_y) / this.kMinWidthT);
              if (adjStroke.mageAdjustment > this.kAdjustMageStep) {
                adjStroke.mageAdjustment = this.kAdjustMageStep;
              }
            }
          }
        }
      }
      return adjStrokes;
    }
    adjustTate(adjStrokes) {
      const vertSegments = [];
      for (const adjStroke of adjStrokes) {
        const { stroke } = adjStroke;
        if ((stroke.a1_100 === 1 || stroke.a1_100 === 3 || stroke.a1_100 === 7) && stroke.a1_opt === 0 && stroke.x1 === stroke.x2) {
          vertSegments.push({
            stroke,
            adjStroke,
            x: stroke.x1,
            y1: stroke.y1,
            y2: stroke.y2
          });
        }
      }
      for (const { adjStroke, stroke, x, y1, y2 } of vertSegments) {
        for (const { stroke: stroke2, x: other_x, y1: other_y1, y2: other_y2 } of vertSegments) {
          if (stroke !== stroke2 && !(y1 + 1 > other_y2 || y2 - 1 < other_y1) && round(Math.abs(x - other_x)) < this.kMinWidthT * this.kAdjustTateStep) {
            adjStroke.tateAdjustment += this.kAdjustTateStep - Math.floor(Math.abs(x - other_x) / this.kMinWidthT);
            if (adjStroke.tateAdjustment > this.kAdjustTateStep || adjStroke.tateAdjustment === this.kAdjustTateStep && (stroke.a2_opt_1 !== 0 || stroke.a2_100 !== 0)) {
              adjStroke.tateAdjustment = this.kAdjustTateStep;
            }
          }
        }
      }
      return adjStrokes;
    }
    adjustKakato(adjStrokes) {
      for (const adjStroke of adjStrokes) {
        const { stroke } = adjStroke;
        if (stroke.a1_100 === 1 && stroke.a1_opt === 0 && (stroke.a3_100 === 13 || stroke.a3_100 === 23) && stroke.a3_opt === 0) {
          for (let k = 0; k < this.kAdjustKakatoStep; k++) {
            if (adjStrokes.some(({ stroke: stroke2 }) => stroke !== stroke2 && stroke2.isCrossBox(stroke.x2 - this.kAdjustKakatoRangeX / 2, stroke.y2 + this.kAdjustKakatoRangeY[k], stroke.x2 + this.kAdjustKakatoRangeX / 2, stroke.y2 + this.kAdjustKakatoRangeY[k + 1])) || round(stroke.y2 + this.kAdjustKakatoRangeY[k + 1]) > 200 || round(stroke.y2 - stroke.y1) < this.kAdjustKakatoRangeY[k + 1]) {
              adjStroke.kakatoAdjustment = 3 - k;
              break;
            }
          }
        }
      }
      return adjStrokes;
    }
    adjustUroko(adjStrokes) {
      for (const adjStroke of adjStrokes) {
        const { stroke } = adjStroke;
        if (stroke.a1_100 === 1 && stroke.a1_opt === 0 && stroke.a3_100 === 0 && stroke.a3_opt === 0) {
          for (let k = 0; k < this.kAdjustUrokoLengthStep; k++) {
            const [cosrad, sinrad] = stroke.y1 === stroke.y2 ? [1, 0] : stroke.x2 - stroke.x1 < 0 ? normalize([stroke.x1 - stroke.x2, stroke.y1 - stroke.y2]) : normalize([stroke.x2 - stroke.x1, stroke.y2 - stroke.y1]);
            const tx = stroke.x2 - this.kAdjustUrokoLine[k] * cosrad - 0.5 * sinrad;
            const ty = stroke.y2 - this.kAdjustUrokoLine[k] * sinrad - 0.5 * cosrad;
            const tlen = stroke.y1 === stroke.y2 ? stroke.x2 - stroke.x1 : hypot(stroke.y2 - stroke.y1, stroke.x2 - stroke.x1);
            if (round(tlen) < this.kAdjustUrokoLength[k] || adjStrokes.some(({ stroke: stroke2 }) => stroke !== stroke2 && stroke2.isCross(tx, ty, stroke.x2, stroke.y2))) {
              adjStroke.urokoAdjustment = this.kAdjustUrokoLengthStep - k;
              break;
            }
          }
        }
      }
      return adjStrokes;
    }
    adjustUroko2(adjStrokes) {
      const horiSegments = [];
      for (const adjStroke of adjStrokes) {
        const { stroke } = adjStroke;
        if (stroke.a1_100 === 1 && stroke.a1_opt === 0 && stroke.y1 === stroke.y2) {
          horiSegments.push({
            stroke,
            adjStroke,
            isTarget: stroke.a3_100 === 0 && stroke.a3_opt === 0 && adjStroke.urokoAdjustment === 0,
            y: stroke.y1,
            x1: stroke.x1,
            x2: stroke.x2
          });
        } else if (stroke.a1_100 === 3 && stroke.a1_opt === 0 && stroke.y2 === stroke.y3) {
          horiSegments.push({
            stroke,
            adjStroke,
            isTarget: false,
            y: stroke.y2,
            x1: stroke.x2,
            x2: stroke.x3
          });
        }
      }
      for (const { adjStroke, stroke, isTarget, y, x1, x2 } of horiSegments) {
        if (isTarget) {
          let pressure = 0;
          for (const { stroke: stroke2, y: other_y, x1: other_x1, x2: other_x2 } of horiSegments) {
            if (stroke !== stroke2 && !(x1 + 1 > other_x2 || x2 - 1 < other_x1) && round(Math.abs(y - other_y)) < this.kAdjustUroko2Length) {
              pressure += __pow(this.kAdjustUroko2Length - Math.abs(y - other_y), 1.1);
            }
          }
          adjStroke.urokoAdjustment = Math.min(Math.floor(pressure / this.kAdjustUroko2Length), this.kAdjustUroko2Step);
        }
      }
      return adjStrokes;
    }
    adjustKirikuchi(adjStrokes) {
      const horiSegments = [];
      for (const { stroke } of adjStrokes) {
        if (stroke.a1_100 === 1 && stroke.a1_opt === 0 && stroke.y1 === stroke.y2) {
          horiSegments.push({
            y: stroke.y1,
            x1: stroke.x1,
            x2: stroke.x2
          });
        }
      }
      for (const adjStroke of adjStrokes) {
        const { stroke } = adjStroke;
        if (stroke.a1_100 === 2 && stroke.a1_opt === 0 && stroke.a2_100 === 32 && stroke.a2_opt === 0 && stroke.x1 > stroke.x2 && stroke.y1 < stroke.y2 && horiSegments.some(({ y, x1, x2 }) => x1 < stroke.x1 && x2 > stroke.x1 && y === stroke.y1)) {
          adjStroke.kirikuchiAdjustment = 1;
        }
      }
      return adjStrokes;
    }
  };
  var mincho_default = Mincho;

  // ../../github/kage-engine/src/font/gothic/cd.ts
  function cdDrawCurveU2(font, polygons, x1, y1, sx1, sy1, sx2, sy2, x2, y2, _ta1, _ta2) {
    let a1 = _ta1;
    let a2 = _ta2;
    let delta1 = 0;
    switch (a1 % 10) {
      case 2:
        delta1 = font.kWidth;
        break;
      case 3:
        delta1 = font.kWidth * font.kKakato;
        break;
    }
    if (delta1 !== 0) {
      const [dx1, dy1] = x1 === sx1 && y1 === sy1 ? [0, delta1] : normalize([x1 - sx1, y1 - sy1], delta1);
      x1 += dx1;
      y1 += dy1;
    }
    let delta2 = 0;
    switch (a2 % 10) {
      case 2:
        delta2 = font.kWidth;
        break;
      case 3:
        delta2 = font.kWidth * font.kKakato;
        break;
    }
    if (delta2 !== 0) {
      const [dx2, dy2] = sx2 === x2 && sy2 === y2 ? [0, -delta2] : normalize([x2 - sx2, y2 - sy2], delta2);
      x2 += dx2;
      y2 += dy2;
    }
    const { left, right } = generateFattenCurve(x1, y1, sx1, sy1, sx2, sy2, x2, y2, font.kRate, () => font.kWidth, ([x, y], mag) => round(x) === 0 && round(y) === 0 ? [-mag, 0] : normalize([x, y], mag));
    const poly = new Polygon();
    const poly2 = new Polygon();
    for (const [x, y] of left) {
      poly.push(x, y);
    }
    for (const [x, y] of right) {
      poly2.push(x, y);
    }
    poly2.reverse();
    poly.concat(poly2);
    polygons.push(poly);
  }
  function cdDrawBezier2(font, polygons, x1, y1, x2, y2, x3, y3, x4, y4, a1, a2) {
    cdDrawCurveU2(font, polygons, x1, y1, x2, y2, x3, y3, x4, y4, a1, a2);
  }
  function cdDrawCurve2(font, polygons, x1, y1, x2, y2, x3, y3, a1, a2) {
    cdDrawCurveU2(font, polygons, x1, y1, x2, y2, x2, y2, x3, y3, a1, a2);
  }
  function cdDrawLine2(font, polygons, tx1, ty1, tx2, ty2, ta1, ta2) {
    let x1;
    let y1;
    let x2;
    let y2;
    let a1;
    let a2;
    if (tx1 === tx2 && ty1 > ty2 || tx1 > tx2) {
      x1 = tx2;
      y1 = ty2;
      x2 = tx1;
      y2 = ty1;
      a1 = ta2;
      a2 = ta1;
    } else {
      x1 = tx1;
      y1 = ty1;
      x2 = tx2;
      y2 = ty2;
      a1 = ta1;
      a2 = ta2;
    }
    const pen1 = new Pen(x1, y1);
    const pen2 = new Pen(x2, y2);
    if (x1 !== x2 || y1 !== y2) {
      pen1.setDown(x2, y2);
      pen2.setUp(x1, y1);
    }
    switch (a1 % 10) {
      case 2:
        pen1.move(0, -font.kWidth);
        break;
      case 3:
        pen1.move(0, -font.kWidth * font.kKakato);
        break;
    }
    switch (a2 % 10) {
      case 2:
        pen2.move(0, font.kWidth);
        break;
      case 3:
        pen2.move(0, font.kWidth * font.kKakato);
        break;
    }
    const poly = new Polygon([
      pen1.getPoint(font.kWidth, 0),
      pen2.getPoint(font.kWidth, 0),
      pen2.getPoint(-font.kWidth, 0),
      pen1.getPoint(-font.kWidth, 0)
    ]);
    if (tx1 === tx2) {
      poly.reverse();
    }
    polygons.push(poly);
  }

  // ../../github/kage-engine/src/font/gothic/index.ts
  function dfDrawFont2(font, polygons, {
    stroke: {
      a1_100,
      a2_100,
      a3_100,
      a3_opt,
      a3_opt_1,
      a3_opt_2,
      x1,
      y1,
      x2,
      y2,
      x3,
      y3,
      x4,
      y4
    },
    haneAdjustment,
    mageAdjustment
  }) {
    switch (a1_100) {
      case 0:
        break;
      case 1: {
        if (a3_100 === 4 && haneAdjustment === 0 && a3_opt_2 === 0) {
          const [dx1, dy1] = x1 === x2 && y1 === y2 ? [0, font.kMage] : normalize([x1 - x2, y1 - y2], font.kMage);
          const tx1 = x2 + dx1;
          const ty1 = y2 + dy1;
          cdDrawLine2(font, polygons, x1, y1, tx1, ty1, a2_100, 1);
          cdDrawCurve2(font, polygons, tx1, ty1, x2, y2, x2 - font.kMage * 2, y2 - font.kMage * 0.5, 1, 0);
        } else {
          cdDrawLine2(font, polygons, x1, y1, x2, y2, a2_100, a3_100);
        }
        break;
      }
      case 2:
      case 12: {
        if (a3_100 === 4 && haneAdjustment === 0 && a3_opt_2 === 0) {
          const [dx1, dy1] = x2 === x3 ? [0, -font.kMage] : y2 === y3 ? [-font.kMage, 0] : normalize([x2 - x3, y2 - y3], font.kMage);
          const tx1 = x3 + dx1;
          const ty1 = y3 + dy1;
          cdDrawCurve2(font, polygons, x1, y1, x2, y2, tx1, ty1, a2_100, 1);
          cdDrawCurve2(font, polygons, tx1, ty1, x3, y3, x3 - font.kMage * 2, y3 - font.kMage * 0.5, 1, 0);
        } else if (a3_100 === 5 && a3_opt === 0) {
          const tx1 = x3 + font.kMage;
          const ty1 = y3;
          const tx2 = tx1 + font.kMage * 0.5;
          const ty2 = y3 - font.kMage * 2;
          cdDrawCurve2(font, polygons, x1, y1, x2, y2, x3, y3, a2_100, 1);
          cdDrawCurve2(font, polygons, x3, y3, tx1, ty1, tx2, ty2, 1, 0);
        } else {
          cdDrawCurve2(font, polygons, x1, y1, x2, y2, x3, y3, a2_100, a3_100);
        }
        break;
      }
      case 3: {
        const [dx1, dy1] = x1 === x2 && y1 === y2 ? [0, font.kMage] : normalize([x1 - x2, y1 - y2], font.kMage);
        const tx1 = x2 + dx1;
        const ty1 = y2 + dy1;
        const [dx2, dy2] = x2 === x3 && y2 === y3 ? [0, -font.kMage] : normalize([x3 - x2, y3 - y2], font.kMage);
        const tx2 = x2 + dx2;
        const ty2 = y2 + dy2;
        cdDrawLine2(font, polygons, x1, y1, tx1, ty1, a2_100, 1);
        cdDrawCurve2(font, polygons, tx1, ty1, x2, y2, tx2, ty2, 1, 1);
        if (a3_100 === 5 && a3_opt_1 === 0 && mageAdjustment === 0) {
          const tx3 = x3 - font.kMage;
          const ty3 = y3;
          const tx4 = x3 + font.kMage * 0.5;
          const ty4 = y3 - font.kMage * 2;
          cdDrawLine2(font, polygons, tx2, ty2, tx3, ty3, 1, 1);
          cdDrawCurve2(font, polygons, tx3, ty3, x3, y3, tx4, ty4, 1, 0);
        } else {
          cdDrawLine2(font, polygons, tx2, ty2, x3, y3, 1, a3_100);
        }
        break;
      }
      case 6: {
        if (a3_100 === 5 && a3_opt === 0) {
          const tx1 = x4 - font.kMage;
          const ty1 = y4;
          const tx2 = x4 + font.kMage * 0.5;
          const ty2 = y4 - font.kMage * 2;
          cdDrawBezier2(font, polygons, x1, y1, x2, y2, x3, y3, tx1, ty1, a2_100, 1);
          cdDrawCurve2(font, polygons, tx1, ty1, x4, y4, tx2, ty2, 1, 0);
        } else {
          cdDrawBezier2(font, polygons, x1, y1, x2, y2, x3, y3, x4, y4, a2_100, a3_100);
        }
        break;
      }
      case 7: {
        cdDrawLine2(font, polygons, x1, y1, x2, y2, a2_100, 1);
        cdDrawCurve2(font, polygons, x2, y2, x3, y3, x4, y4, 1, a3_100);
        break;
      }
      case 9:
        break;
      default:
        break;
    }
  }
  var Gothic = class extends mincho_default {
    constructor() {
      super(...arguments);
      this.shotai = 1 /* kGothic */;
    }
    getDrawers(strokesArray) {
      return this.adjustStrokes(strokesArray).map((stroke) => (polygons) => {
        dfDrawFont2(this, polygons, stroke);
      });
    }
  };
  var gothic_default = Gothic;

  // ../../github/kage-engine/src/font/index.ts
  function select(shotai) {
    switch (shotai) {
      case 0 /* kMincho */:
        return new mincho_default();
      default:
        return new gothic_default();
    }
  }

  // ../../github/kage-engine/src/kage.ts
  var Kage = class {
    constructor(size) {
      this.kMincho = 0 /* kMincho */;
      this.kGothic = 1 /* kGothic */;
      this.kFont = select(0 /* kMincho */);
      this.stretch = stretch;
      this.kFont.setSize(size);
      this.kBuhin = new Buhin();
    }
    get kShotai() {
      return this.kFont.shotai;
    }
    set kShotai(shotai) {
      this.kFont = select(shotai);
    }
    get kUseCurve() {
      return this.kFont.kUseCurve;
    }
    set kUseCurve(value) {
      this.kFont.kUseCurve = value;
    }
    makeGlyph(polygons, buhin) {
      const glyphData = this.kBuhin.search(buhin);
      this.makeGlyph2(polygons, glyphData);
    }
    makeGlyph2(polygons, data) {
      if (data !== "") {
        const strokesArray = this.getEachStrokes(data);
        const drawers = this.kFont.getDrawers(strokesArray);
        for (const draw of drawers) {
          draw(polygons);
        }
      }
    }
    makeGlyph3(data) {
      const result = [];
      if (data !== "") {
        const strokesArray = this.getEachStrokes(data);
        const drawers = this.kFont.getDrawers(strokesArray);
        for (const draw of drawers) {
          const polygons = new Polygons();
          draw(polygons);
          result.push(polygons);
        }
      }
      return result;
    }
    makeGlyphSeparated(data) {
      const strokesArrays = data.map((subdata) => this.getEachStrokes(subdata));
      const drawers = this.kFont.getDrawers(strokesArrays.reduce((left, right) => left.concat(right), []));
      const polygons = new Polygons();
      let strokeIndex = 0;
      return strokesArrays.map(({ length: strokeCount }) => {
        const startIndex = polygons.array.length;
        for (const draw of drawers.slice(strokeIndex, strokeIndex + strokeCount)) {
          draw(polygons);
        }
        strokeIndex += strokeCount;
        const result = new Polygons();
        result.array = polygons.array.slice(startIndex);
        return result;
      });
    }
    getEachStrokes(glyphData) {
      let strokesArray = [];
      const strokes = glyphData.split("$");
      for (const stroke of strokes) {
        const columns = stroke.split(":");
        if (Math.floor(+columns[0]) !== 99) {
          strokesArray.push(new Stroke([
            Math.floor(+columns[0]),
            Math.floor(+columns[1]),
            Math.floor(+columns[2]),
            Math.floor(+columns[3]),
            Math.floor(+columns[4]),
            Math.floor(+columns[5]),
            Math.floor(+columns[6]),
            Math.floor(+columns[7]),
            Math.floor(+columns[8]),
            Math.floor(+columns[9]),
            Math.floor(+columns[10])
          ]));
        } else {
          const buhin = this.kBuhin.search(columns[7]);
          if (buhin !== "") {
            strokesArray = strokesArray.concat(this.getEachStrokesOfBuhin(buhin, Math.floor(+columns[3]), Math.floor(+columns[4]), Math.floor(+columns[5]), Math.floor(+columns[6]), Math.floor(+columns[1]), Math.floor(+columns[2]), Math.floor(+columns[9]), Math.floor(+columns[10])));
          }
        }
      }
      return strokesArray;
    }
    getEachStrokesOfBuhin(buhin, x1, y1, x2, y2, sx, sy, sx2, sy2) {
      const strokes = this.getEachStrokes(buhin);
      const box = this.getBox(strokes);
      if (sx !== 0 || sy !== 0) {
        if (sx > 100) {
          sx -= 200;
        } else {
          sx2 = 0;
          sy2 = 0;
        }
      }
      for (const stroke of strokes) {
        if (sx !== 0 || sy !== 0) {
          stroke.stretch(sx, sx2, sy, sy2, box.minX, box.maxX, box.minY, box.maxY);
        }
        stroke.x1 = x1 + stroke.x1 * (x2 - x1) / 200;
        stroke.y1 = y1 + stroke.y1 * (y2 - y1) / 200;
        stroke.x2 = x1 + stroke.x2 * (x2 - x1) / 200;
        stroke.y2 = y1 + stroke.y2 * (y2 - y1) / 200;
        stroke.x3 = x1 + stroke.x3 * (x2 - x1) / 200;
        stroke.y3 = y1 + stroke.y3 * (y2 - y1) / 200;
        stroke.x4 = x1 + stroke.x4 * (x2 - x1) / 200;
        stroke.y4 = y1 + stroke.y4 * (y2 - y1) / 200;
      }
      return strokes;
    }
    getBox(strokes) {
      let minX = 200;
      let minY = 200;
      let maxX = 0;
      let maxY = 0;
      for (const stroke of strokes) {
        const {
          minX: sminX,
          maxX: smaxX,
          minY: sminY,
          maxY: smaxY
        } = stroke.getBox();
        minX = Math.min(minX, sminX);
        maxX = Math.max(maxX, smaxX);
        minY = Math.min(minY, sminY);
        maxY = Math.max(maxY, smaxY);
      }
      return { minX, maxX, minY, maxY };
    }
  };
  Kage.Buhin = Buhin;
  Kage.Polygons = Polygons;

  // src/pinx.ts
  var autoPinx = (ch, base) => {
    if (ch == base || !base)
      return "";
    const f1 = factorsOfGD(getGlyph(ch), true);
    const f2 = factorsOfGD(getGlyph(base)).map((it) => UnifiedComps_UTF32[it] || it);
    const commonpart = intersect(f1, f2);
    const from = f2.filter((it) => commonpart.indexOf(it) == -1);
    const to = f1.filter((it) => commonpart.indexOf(it) == -1);
    if (from.length === 1 && to.length === 1) {
      return base + String.fromCodePoint(from) + String.fromCodePoint(to);
    }
    return "";
  };
  var splitPinx = (str, tryAutoIRE = false) => {
    const out = [];
    const chars = splitUTF32Char(str);
    let i = 0;
    let nesting = 0, ire = "";
    while (i < chars.length) {
      const gid = str;
      nesting && nesting--;
      const comps = componentsOf(chars[i]);
      if (~comps.indexOf(chars[i + 1])) {
        ire += chars[i] + chars[i + 1];
        nesting++;
        i++;
      } else {
        if (nesting) {
          ire += chars[i];
        } else {
          if (ire) {
            out.push(ire + chars[i]);
            ire = "";
          } else {
            let ch = chars[i];
            if (tryAutoIRE && !getGlyph(ch)) {
              ch = autoPinx(ch) || ch;
            }
            out.push(ch);
          }
        }
      }
      i++;
    }
    ire && out.push(ire);
    return out;
  };
  var validIRE = (ire) => codePointLength(ire) > 1 && splitPinx(ire).length == 1;

  // src/drawglyph.ts
  var pxe = new Kage();
  pxe.kUseCurve = true;
  var renderedComponents = [];
  var resizeSVG = (svg, size = 64) => svg.replace(/(width|height)=\"\d+\"/g, (m, m1, m2) => m1 + "=" + size);
  var patchSVG = (svg, patch) => svg.replace(/<svg /, "<svg " + patch + " ");
  var patchColor = (svg, color) => svg.replace(/fill="black"/g, 'fill="' + color + '"');
  var setKageOption = (opts, engine) => {
    engine = engine || pxe;
    const fontface = getFontFace(opts.fontface || "");
    if (fontface) {
      engine.kShotai = fontface.hei ? 1 : 0;
      for (let key in fontface)
        engine.kFont[key] = fontface[key];
    } else {
      engine.kShotai = opts.hei ? 1 : 0;
      engine.kFont.kWidth = opts.width || 5;
    }
  };
  var addFrameToSVG = (gd, svg) => {
    const frames = frameOf(gd);
    let framesvg = "";
    for (let i = 0; i < frames.length; i++) {
      const [x, y, x2, y2] = frames[i];
      const w = x2 - x, h = y2 - y;
      const color = "hsl(" + (i + 1) * 60 + " ,50%,30%)";
      framesvg += `<rect x=${x} y=${y} width=${w} height=${h} 
		 style="fill:none;stroke: ${color} ; stroke-width:${i + 1}" ></rect>`;
    }
    return appendToSVG(framesvg, svg);
  };
  var drawGlyph = (unicode, opts = {}) => {
    if (!unicode)
      return "";
    const components = {};
    const size = opts.size || 64;
    const alt = opts.alt || false;
    const color = opts.color || "black";
    const frame = opts.frame || false;
    let gid;
    let polygons = new Kage.Polygons();
    if (unicode.codePointAt(0) < 8192) {
      gid = unicode;
    } else {
      gid = "u" + unicode.codePointAt(0).toString(16);
    }
    const d = getGlyph(gid);
    if (!d)
      return unicode;
    loadComponents(d, components);
    for (let comp in components) {
      pxe.kBuhin.push(comp, components[comp]);
    }
    pxe.kBuhin.push(gid, d);
    renderedComponents.push(...Object.keys(components));
    setKageOption(opts, pxe);
    pxe.makeGlyph(polygons, gid);
    let svg = polygons.generateSVG(true);
    svg = opts.frame ? addFrameToSVG(d, svg) : svg;
    svg = patchSVG(svg, 'style="padding-top:0.2em" gid=' + gid + " title=" + unicode);
    if (color !== "black" && color)
      svg = patchColor(svg, color);
    return resizeSVG(svg, size);
  };
  var drawPinxChar = (ire, opts = {}) => {
    const chars = splitUTF32(ire);
    if (!validIRE(ire))
      return drawGlyphs(ire);
    let i = 0, polygons = new Kage.Polygons();
    const size = opts.size || 64;
    let appends = [];
    while (i < chars.length - 2) {
      const components = {};
      const d2 = getGlyph(chars[i]);
      pxe.kBuhin.push(ch2gid(chars[i]), d2);
      loadComponents(d2, components);
      let from, to, append;
      from = ch2gid(chars[i + 1] || "");
      to = ch2gid(chars[i + 2] || "");
      for (let c in components) {
        if (c.slice(0, from.length) == from) {
          let repl = getGlyph(to + c.slice(from.length));
          if (!repl)
            repl = getGlyph(to);
          pxe.kBuhin.push(c, repl);
          const comps = {};
          loadComponents(repl, comps);
          for (let c2 in comps)
            pxe.kBuhin.push(c2, comps[c2]);
        } else {
          pxe.kBuhin.push(c, components[c]);
        }
      }
      renderedComponents.push(...Object.keys(components));
      i += 2;
    }
    const d = getGlyph(chars[0]);
    pxe.kBuhin.push(ire, d);
    setKageOption(opts, pxe);
    pxe.makeGlyph(polygons, ire);
    let svg = polygons.generateSVG(true);
    appends.forEach((append) => svg = appendToSVG(append, svg));
    svg = opts.frame ? addFrameToSVG(d, svg) : svg;
    svg = patchSVG(svg, 'style="padding-top:0.2em" title=' + ire);
    if (opts.color !== "black" && opts.color)
      svg = patchColor(svg, opts.color);
    svg = resizeSVG(svg, size);
    return svg;
  };
  var drawPinx = (str, opts = {}) => {
    pxe = new Kage();
    pxe.kUseCurve = true;
    renderedComponents = [];
    const units = splitPinx(str, true);
    const out = [];
    for (let i = 0; i < units.length; i++) {
      const u = units[i];
      out.push(codePointLength(u) == 1 ? drawGlyph(u, opts) : drawPinxChar(u, opts));
    }
    return out;
  };

  // index.ts
  var inRange = (s, cjkranges) => {
    const rangename = CJKRangeName(s);
    return ~cjkranges.indexOf(rangename);
  };
  var replaceReg = /\07([^\07]+)\07/g;
  var extractReplacable = (html2, opts = {}) => {
    const pair = opts.pair || "\uFE3B\uFE3C";
    const cjk = opts.cjk || "ABCDEFG";
    const cjkranges = cjk.toUpperCase().split("").map((s) => "Ext" + s);
    let out = "", nreplace = 0;
    const toReplace = [];
    const getReplaceId = (s) => {
      const at = toReplace.indexOf(s);
      if (at == -1) {
        toReplace.push(s);
        return toReplace.length - 1;
      }
      return at;
    };
    html2 = html2.replace(/([\ud800-\udfff]{2})/g, function(m, sur) {
      if (inRange(sur, cjkranges)) {
        const id = getReplaceId(sur);
        return String.fromCharCode(7) + id.toString() + String.fromCharCode(7);
      } else {
        return sur;
      }
    });
    if (pair && pair.length == 2) {
      const [left, right] = splitUTF32Char(pair);
      const reg = new RegExp(left + "([^" + right + "]+)" + right, "g");
      html2 = html2.replace(reg, (m, m1) => {
        const id = getReplaceId(m1);
        return String.fromCharCode(7) + id.toString() + String.fromCharCode(7);
      });
    }
    return [html2, toReplace];
  };
  var inject = (ele, opts = {}) => {
    if (!onOff)
      return;
    const { color, fontSize } = window.getComputedStyle(ele);
    const size = parseInt(fontSize) * 1.1;
    const [text, replaces] = extractReplacable(ele.innerHTML, opts);
    ele.innerHTML = text.replace(replaceReg, (m, id) => drawPinx(replaces[parseInt(id)], { color, size }));
  };
  var injectByServiceWorker = async (ele, opts = {}) => {
    const { color, fontSize } = window.getComputedStyle(ele);
    const [text, replaces] = extractReplacable(ele.innerHTML, opts);
    const svgs = await chrome.runtime.sendMessage({ data: replaces });
    html.innerHTML = text.replace(replaceReg, (m, id) => svgs[parseInt(id)]);
  };
  var render = (ele, text = "") => {
    if (!ele)
      return;
    if (!onOff)
      return ele.innerText;
    if (!text)
      text = ele.innerText;
    const { color, fontSize } = window.getComputedStyle(ele);
    const size = parseInt(fontSize);
    ele.innerHTML = drawPinx(text, { color, size }).join("");
    return ele.innerText;
  };
  var ready = () => {
    return new Promise((resolve) => {
      let timer1 = setInterval(() => {
        if (isFontReady()) {
          clearInterval(timer1);
          resolve();
        }
      }, 100);
    });
  };
  var onOff = true;
  var onoff = (_onoff) => onOff = _onoff;
  var renderSelector = (selector = ".hzpx") => {
    const eles = document.querySelectorAll(selector);
    eles.forEach((ele) => {
      const t = ele.innerText;
      if (t.length < 20 && t.match(/^[\u3400-\u9fff\ud400-\udfff]+$/)) {
        Hzpx.render(ele);
      } else {
        Hzpx.inject(ele);
      }
    });
  };
  var Hzpx = { addFontData, ready, drawPinx, loadFont, inject, render, onoff };
  if (typeof window !== "undefined" && !window.Hzpx)
    window.Hzpx = Hzpx;
  setTimeout(async () => {
    await Hzpx.ready();
    renderSelector();
  }, 100);
  var hzpx_engine_default = Hzpx;
})();
