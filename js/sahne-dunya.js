// Yürünebilir dünya: bir bölgeyi (sokak ya da iç mekân) çizer, menajeri yürütür, insanları ve arabaları dolaştırır.
// Klavye: oklar / WASD ile yürü, E / Enter / Boşluk ile etkileşim. Fare: tıklanan yere yürü.
const SAHNE_DUNYA = (() => {
  const T = 16;
  // Sokakta geniş görüş, iç mekânda yakın görüş (iç mekân daha büyük görünsün diye)
  let G = 400, Y = 240;
  let b = null, zeminTuval = null, oyuncu = null, insanlar = [], arabalar = [], kamera = { x: 0, y: 0 }, ekler = [];
  let sure = 0, yagmur = [], yagiyor = false, yakin = null, cb = {}, saatFn = () => 20 * 60, ayFn = () => 8, kilit = false;
  const tuslar = new Set();
  const onbellek = new Map();

  // ---------- Kurulum ----------
  // sec: { oyuncuResim, konum: {x,y} karo ya da nokta adı, insanlar: [{id, ad, img, x, y, sabit, gezer}], saat(), ay(), yagmur, olaylar: {kapi, insan, etkilesim, cikis} }
  function kur(bolgeId, sec) {
    b = SEHIR.bolge(bolgeId);
    G = b.ic ? 280 : 400; Y = b.ic ? 168 : 240; API.G = G; API.Y = Y;
    zeminTuval = onbellek.get(bolgeId) || onCizim(b);
    onbellek.set(bolgeId, zeminTuval);
    cb = sec.olaylar || {};
    saatFn = sec.saat || saatFn; ayFn = sec.ay || ayFn;
    let k = sec.konum;
    if (typeof k === "string") k = b.noktalar[k] || { x: 2, y: 2 };
    oyuncu = { x: k.x * T + 8, y: k.y * T + 8, img: sec.oyuncuResim, ayna: false, kosu: false, yol: [], hedef: null };
    insanlar = (sec.insanlar || []).map((p) => ({ ...p, x: p.x * T + 8, y: p.y * T + 8, yol: [], bekle: Math.random() * 2, ayna: Math.random() < 0.5, kosu: false }));
    arabalar = [];
    const renk = () => TRAFIK_RENK[Math.floor(Math.random() * TRAFIK_RENK.length)];
    // Üst şerit sola, alt şerit sağa. Aynı şeritteki arabalar aynı hızda gider, birbirinin içinden geçmez.
    for (const y of b.yollar) {
      const sol = -26 - Math.random() * 8, sag = 30 + Math.random() * 8, ara = b.gen * T / 2;
      for (let i = 0; i < 2; i++) {
        arabalar.push({ x: i * ara + Math.random() * 120, serit: 0, y, hiz: sol, renk: renk() });
        arabalar.push({ x: i * ara + Math.random() * 120, serit: 1, y, hiz: sag, renk: renk() });
      }
    }
    yagiyor = !!sec.yagmur && !b.ic;
    yagmur = yagiyor ? Array.from({ length: 90 }, () => ({ x: Math.random() * G, y: Math.random() * Y, h: 60 + Math.random() * 60 })) : [];
    // Kayda bağlı ek eşyalar (satın alınan mobilya, kapıdaki araba): engel sayılmaz, sadece çizilir
    ekler = sec.ekNesneler || [];
    yakin = null; kilit = false;
    kameraGuncelle(true);
  }

  // Bölgenin değişmeyen kısmı (zemin, park, binalar, duvarlar) bir kez çizilir
  function onCizim(b) {
    const c = document.createElement("canvas");
    c.width = b.gen * T; c.height = b.yuk * T;
    const ctx = c.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    for (let y = 0; y < b.yuk; y++) for (let x = 0; x < b.gen; x++) { const z = b.zemin[y][x]; KAYNAK.karo(ctx, z[0], z[1], z[2], x * T, y * T); }
    for (const yp of b.yapilar) {
      if (yp.tip === "bina") binaCiz(ctx, yp);
      else if (yp.tip === "duvar") {
        for (let x = 0; x < b.gen; x++) { KAYNAK.karo(ctx, "sehir", 9, 5, x * T, 0); KAYNAK.karo(ctx, "sehir", 9, 9, x * T, T); }
      }
    }
    // Yerde duran eşyalar (halı, tablo) önce çizilir
    for (const n of b.nesneler) if (n.tip === "esya" && !b.engel[n.y][n.x]) KAYNAK.karo(ctx, "ic", n.s, n.r, n.x * T, n.y * T, n.ayna);
    if (b.ic) {
      const kx = Math.floor(b.gen / 2);
      ctx.fillStyle = "#6b4a32"; ctx.fillRect(kx * T + 2, (b.yuk - 1) * T + 6, T - 4, 10);
      ctx.fillStyle = "#3b3026"; ctx.fillRect(0, 0, c.width, 2); ctx.fillRect(0, c.height - 2, c.width, 2); ctx.fillRect(0, 0, 2, c.height); ctx.fillRect(c.width - 2, 0, 2, c.height);
    }
    return c;
  }

  // ---------- RPG Urban Pack parçaları ----------
  const U = (ctx, s, r, x, y, ayna) => KAYNAK.karo(ctx, "urban", s, r, x, y, ayna);
  // Cephe: sol kenar sütunu ve satır başlangıcı. Satırlar: 0 saçak, 1 kat silmesi, 2 düz duvar, 3 zemin kat.
  const CEPHE = { kirmizi: { s: 17, r: 0 }, turuncu: { s: 17, r: 4 }, kirmiziSade: { s: 20, r: 0 }, turuncuSade: { s: 20, r: 4 } };
  // Pencereler: [bej çerçeve (kırmızı tuğla), gri çerçeve (turuncu tuğla)]
  const PENCERE = {
    kare: [[13, 13], [13, 16]], kemer: [[12, 12], [12, 15]], sivri: [[13, 12], [13, 15]],
    kucuk: [[12, 13], [12, 16]], genis: [[12, 14], [12, 17]], dar: [[11, 12], [11, 15]],
  };
  const KAPI = { ahsap: [13, 10], cift: [14, 10], cam: [15, 10], dukkan: [14, 9], metal: [15, 12] };
  // Tente renkleri: paketteki yeşil tentenin tonu kaydırılır
  const TENTE = { yesil: "none", kirmizi: "hue-rotate(205deg) saturate(1.3)", turuncu: "hue-rotate(235deg) saturate(1.4) brightness(1.1)" };
  // Araba renkleri: taksi ve kırmızı paketten, diğerleri kırmızının tonu kaydırılarak
  const ARABA = {
    taksi: { kaynak: "taksi", filtre: "none" }, kirmizi: { kaynak: "kirmizi", filtre: "none" },
    mavi: { kaynak: "kirmizi", filtre: "hue-rotate(215deg) saturate(0.8)" }, yesil: { kaynak: "kirmizi", filtre: "hue-rotate(120deg) saturate(0.6) brightness(0.9)" },
    beyaz: { kaynak: "kirmizi", filtre: "grayscale(1) brightness(1.55)" }, gri: { kaynak: "kirmizi", filtre: "grayscale(1) brightness(1.05)" },
    siyah: { kaynak: "kirmizi", filtre: "grayscale(1) brightness(0.6)" },
  };
  const TRAFIK_RENK = ["taksi", "taksi", "kirmizi", "mavi", "beyaz", "gri", "siyah", "yesil"];
  // Önden görünüş (park etmiş, 2×2) ve yukarıdan görünüş (yolda giden, 1×2; 90° döndürülür)
  const ARABA_KARO = { taksi: { on: [15, 14], ust: [17, 14] }, kirmizi: { on: [15, 16], ust: [17, 16] } };
  const resimler = new Map();
  function filtreli(anahtar, gen, yuk, cizFn) {
    if (!resimler.has(anahtar)) {
      const c = document.createElement("canvas"); c.width = gen; c.height = yuk;
      const x = c.getContext("2d"); x.imageSmoothingEnabled = false; cizFn(x);
      resimler.set(anahtar, c);
    }
    return resimler.get(anahtar);
  }
  // Ton kaydırılmış tek bir karo ya da karo grubu
  function boyali(s, r, gen, yuk, filtre) {
    return filtreli(`k${s},${r},${gen},${yuk},${filtre}`, gen * T, yuk * T, (x) => {
      const ara = document.createElement("canvas"); ara.width = gen * T; ara.height = yuk * T;
      const ac = ara.getContext("2d");
      for (let j = 0; j < yuk; j++) for (let i = 0; i < gen; i++) U(ac, s + i, r + j, i * T, j * T);
      x.filter = filtre; x.drawImage(ara, 0, 0); x.filter = "none";
    });
  }
  // yon: "on" park etmiş, "sag" / "sol" yolda giden
  function arabaResmi(renk, yon) {
    const a = ARABA[renk] || ARABA.kirmizi, k = ARABA_KARO[a.kaynak];
    if (yon === "on") return boyali(k.on[0], k.on[1], 2, 2, a.filtre);
    const dik = boyali(k.ust[0], k.ust[1], 1, 2, a.filtre); // burnu aşağı bakıyor
    return filtreli(`a${renk},${yon}`, 2 * T, T, (x) => {
      if (yon === "sag") { x.translate(0, T); x.rotate(-Math.PI / 2); }
      else { x.translate(2 * T, 0); x.rotate(Math.PI / 2); }
      x.drawImage(dik, 0, 0);
    });
  }

  function binaCiz(ctx, bn) {
    const { x, y, gen, cati, satirlar } = bn;
    const n = satirlar.length, cy = y + cati, zy = cy + n - 1;
    const k = (s, r, px, py) => U(ctx, s, r, px * T, py * T);
    // Düz çatı (kenarlı)
    const [c0, r0] = bn.catiTur === "bej" ? [0, 3] : [8, 3];
    const blok = (bs, br, bx, by, w, h) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) k(bs + (i === 0 ? 0 : i === w - 1 ? 2 : 1), br + (j === 0 ? 0 : j === h - 1 ? 2 : 1), bx + i, by + j); };
    blok(c0, r0, x, y, gen, cati);
    // Stadyum: tribünlerin ortasında çim saha
    if (bn.catiTur === "saha") blok(0, 0, x + 1, y + 1, gen - 2, cati - 2);
    else if (gen >= 6 && cati >= 3) U(ctx, 9, 12, (x + 1 + (x * 3) % (gen - 3)) * T, (y + 1) * T - 4); // çatıda klima
    // Cephe
    const c = CEPHE[bn.tur];
    for (let j = 0; j < n; j++) for (let i = 0; i < gen; i++) {
      if (bn.kolon && (i === 0 || i === gen - 1)) { k(16, c.r + (j === 0 ? 0 : j === n - 1 ? 3 : 1 + (j % 2)), x + i, cy + j); continue; }
      const a = bn.kolon ? 1 : 0;
      k(c.s + (i === a ? 0 : i === gen - 1 - a ? 2 : 1), c.r + satirlar[j], x + i, cy + j);
    }
    // Pencereler: gece yanacak olanlar kaydedilir
    bn.pencereler = [];
    const gri = bn.tur.startsWith("turuncu") ? 1 : 0;
    const pen = (s, r, px, py) => { k(s, r, px, py); bn.pencereler.push({ x: px * T + 8, y: py * T + 8 }); };
    const sutunlar = [];
    if (gen <= 2) for (let i = 0; i < gen; i++) sutunlar.push(i);
    else for (let i = 1; i < gen - 1; i++) if (gen <= 6 || Math.min(i, gen - 1 - i) % 2 === 1) sutunlar.push(i);
    const kapiI = bn.kapi ? bn.kapi.x - x : -1;
    if (bn.pencere !== "yok") {
      const [ps, pr] = PENCERE[bn.pencere][gri], [ds, dr] = PENCERE.dar[gri];
      for (let j = 0; j < n - 1; j++) {
        if (satirlar[j] === 1) continue; // silme satırında pencere yok
        for (const i of sutunlar) if (!(bn.kolon && (i === 0 || i === gen - 1))) pen(ps, pr, x + i, cy + j);
        if (bn.kolon) { pen(ds, dr, x, cy + j); pen(ds, dr, x + gen - 1, cy + j); }
      }
    }
    // Zemin kat: dükkânlarda vitrin camı, evlerde pencere
    if (bn.vitrin) {
      const bas = bn.kolon ? 2 : 1, son = gen - (bn.kolon ? 3 : 2);
      let p = [];
      const bitir = () => { p.forEach((i, t) => pen(p.length === 1 ? 9 : t === 0 ? 8 : t === p.length - 1 ? 10 : 9, 14, x + i, zy)); p = []; };
      for (let i = bas; i <= son; i++) { if (i === kapiI) bitir(); else p.push(i); }
      bitir();
    } else if (bn.pencere !== "yok" && n > 2) {
      const tur = bn.pencere === "kemer" || bn.pencere === "sivri" ? "kare" : bn.pencere;
      const [ps, pr] = PENCERE[tur][gri];
      for (const i of sutunlar) if (Math.abs(i - kapiI) > 0 && !(bn.kolon && (i === 0 || i === gen - 1))) pen(ps, pr, x + i, zy);
    }
    if (bn.tente) {
      const t = boyali(4, 12, 3, 1, TENTE[bn.tente] || "none");
      const bas = bn.kolon ? 1 : 0, son = gen - 1 - bas;
      for (let i = bas; i <= son; i++) {
        const parca = i === bas ? 0 : i === son ? 2 : 1;
        ctx.drawImage(t, parca * T, 0, T, T, (x + i) * T, (zy - 1) * T + 6, T, T);
      }
    }
    if (bn.kapi) { const [ks, kr] = KAPI[bn.kapi.tur] || KAPI.ahsap; k(ks, kr, bn.kapi.x, zy); }
  }

  // ---------- Hareket ----------
  const karoMu = (px, py) => {
    const tx = Math.floor(px / T), ty = Math.floor(py / T);
    if (tx < 0 || ty < 0 || tx >= b.gen || ty >= b.yuk) return true;
    return b.engel[ty][tx];
  };
  // Ayak kutusu: karakterin merkezinin biraz altı
  const carpar = (x, y) => karoMu(x - 4, y + 4) || karoMu(x + 4, y + 4) || karoMu(x - 4, y + 7) || karoMu(x + 4, y + 7);

  function yuru(p, dx, dy, hiz, dt) {
    if (!dx && !dy) { p.kosu = false; return false; }
    const d = Math.hypot(dx, dy);
    const ax = (dx / d) * hiz * dt, ay = (dy / d) * hiz * dt;
    let hareket = false;
    // Her ekseni ayrı dene: duvara çarpınca kayarak ilerler
    if (!carpar(p.x + ax, p.y)) { p.x += ax; hareket = true; }
    if (!carpar(p.x, p.y + ay)) { p.y += ay; hareket = true; }
    p.kosu = hareket;
    if (Math.abs(ax) > 0.01) p.ayna = ax > 0;
    return hareket;
  }

  // Karo ızgarasında en kısa yol (genişlik öncelikli arama)
  function yolBul(sx, sy, hx, hy) {
    const gen = b.gen, yuk = b.yuk;
    const bas = [Math.floor(sx / T), Math.floor(sy / T)];
    let hedef = [Math.max(0, Math.min(gen - 1, Math.floor(hx / T))), Math.max(0, Math.min(yuk - 1, Math.floor(hy / T)))];
    if (b.engel[hedef[1]][hedef[0]]) {
      // Hedef engelse en yakın boş komşu
      let en = null, ed = 1e9;
      for (let j = -2; j <= 2; j++) for (let i = -2; i <= 2; i++) {
        const x = hedef[0] + i, y = hedef[1] + j;
        if (x < 0 || y < 0 || x >= gen || y >= yuk || b.engel[y][x]) continue;
        const d = Math.abs(i) + Math.abs(j) + (j > 0 ? -0.5 : 0);
        if (d < ed) { ed = d; en = [x, y]; }
      }
      if (!en) return [];
      hedef = en;
    }
    const geldi = new Map([[bas[0] + "," + bas[1], null]]);
    const kuyruk = [bas];
    while (kuyruk.length) {
      const [x, y] = kuyruk.shift();
      if (x === hedef[0] && y === hedef[1]) break;
      for (const [i, j] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + i, ny = y + j, k = nx + "," + ny;
        if (nx < 0 || ny < 0 || nx >= gen || ny >= yuk || b.engel[ny][nx] || geldi.has(k)) continue;
        geldi.set(k, [x, y]); kuyruk.push([nx, ny]);
      }
    }
    const yol = [];
    let k = hedef[0] + "," + hedef[1];
    if (!geldi.has(k)) return [];
    let c = hedef;
    while (c) { yol.unshift({ x: c[0] * T + 8, y: c[1] * T + 4 }); c = geldi.get(c[0] + "," + c[1]); }
    yol.shift();
    return yol;
  }

  function yolTakip(p, hiz, dt) {
    if (!p.yol.length) return false;
    const n = p.yol[0];
    const dx = n.x - p.x, dy = n.y - p.y;
    if (Math.hypot(dx, dy) < 2) { p.yol.shift(); if (!p.yol.length) { p.kosu = false; return "vardi"; } return true; }
    const d = Math.hypot(dx, dy), adim = Math.min(d, hiz * dt);
    p.x += (dx / d) * adim; p.y += (dy / d) * adim; p.kosu = true;
    if (Math.abs(dx) > 0.3) p.ayna = dx > 0;
    p.yon = Math.abs(dx) >= Math.abs(dy) ? "yan" : dy > 0 ? "asagi" : "yukari";
    return true;
  }

  // ---------- Etkileşim ----------
  function etkilesimler() {
    const liste = [];
    for (const k of b.kapilar) liste.push({ tur: k.cikis ? "cikis" : "kapi", x: k.x * T + 8, y: k.y * T + 6, ad: k.ad, veri: k });
    for (const e of b.etkilesim || []) liste.push({ tur: "etkilesim", x: e.x * T + 8, y: (e.y + 1) * T + 6, ad: e.ad, veri: e });
    for (const p of insanlar) if (p.konusur !== false) liste.push({ tur: "insan", x: p.x, y: p.y, ad: p.ad, veri: p });
    return liste;
  }

  function yakinBul() {
    let en = null, ed = 22;
    for (const e of etkilesimler()) {
      const d = Math.hypot(e.x - oyuncu.x, e.y - (oyuncu.y + 4));
      if (d < ed) { ed = d; en = e; }
    }
    return en;
  }

  function etkiles(e = yakin) {
    if (!e || kilit) return;
    if (e.tur === "kapi" && cb.kapi) cb.kapi(e.veri);
    else if (e.tur === "cikis" && cb.cikis) cb.cikis({ ic: true, hedef: b.cikisHedef, nokta: b.cikisNokta });
    else if (e.tur === "insan" && cb.insan) { const p = e.veri; p.yol = []; p.bekle = 6; p.ayna = oyuncu.x > p.x; p.yon = "yan"; cb.insan(p); }
    else if (e.tur === "etkilesim" && cb.etkilesim) cb.etkilesim(e.veri);
  }

  // Tıklanan noktaya yürü; tıklanan şey bir kapı ya da kişiyse varınca etkileş
  function tikla(lx, ly) {
    if (!b || kilit) return;
    const wx = lx + kamera.x, wy = ly + kamera.y;
    let hedefEtk = null;
    for (const e of etkilesimler()) if (Math.hypot(e.x - wx, e.y - 6 - wy) < 12) hedefEtk = e;
    const hx = hedefEtk ? hedefEtk.x : wx, hy = hedefEtk ? hedefEtk.y : wy;
    oyuncu.yol = yolBul(oyuncu.x, oyuncu.y + 6, hx, hy);
    oyuncu.hedef = hedefEtk;
  }

  // ---------- Güncelleme ----------
  function guncelle(dt) {
    if (!b) return;
    sure += dt;
    // Oyuncu
    let dx = 0, dy = 0;
    if (!kilit) {
      if (tuslar.has("ArrowLeft") || tuslar.has("a")) dx -= 1;
      if (tuslar.has("ArrowRight") || tuslar.has("d")) dx += 1;
      if (tuslar.has("ArrowUp") || tuslar.has("w")) dy -= 1;
      if (tuslar.has("ArrowDown") || tuslar.has("s")) dy += 1;
    }
    if (dx || dy) { oyuncu.yol = []; oyuncu.hedef = null; yuru(oyuncu, dx, dy, 72, dt); }
    else if (oyuncu.yol.length && !kilit) {
      const r = yolTakip(oyuncu, 72, dt);
      if (r === "vardi" && oyuncu.hedef) { const h = oyuncu.hedef; oyuncu.hedef = null; etkiles(h); }
    } else oyuncu.kosu = false;
    // Bölge kenarı: komşu bölgeye geçiş
    if (!b.ic && !kilit) for (const c of b.cikislar) {
      if ((c.kenar === "sol" && oyuncu.x < 6) || (c.kenar === "sag" && oyuncu.x > b.gen * T - 6)) { kilit = true; cb.cikis && cb.cikis(c); break; }
    }
    // İç mekânda kapı karesine basınca dışarı
    if (b.ic && !kilit) {
      const k = b.kapilar[0];
      if (Math.floor(oyuncu.x / T) === k.x && Math.floor((oyuncu.y + 6) / T) === k.y && (dy > 0 || !oyuncu.yol.length && oyuncu.kosu)) etkiles({ tur: "cikis", veri: k });
    }
    yakin = kilit ? null : yakinBul();
    // İnsanlar
    for (const p of insanlar) {
      if (p.bekle > 0) { p.bekle -= dt; p.kosu = false; continue; }
      if (p.sabit) continue;
      if (!p.yol.length) {
        const n = b.gezinti[Math.floor(Math.random() * b.gezinti.length)];
        if (n) p.yol = yolBul(p.x, p.y + 6, n[0] * T + 8, n[1] * T + 8);
        p.bekle = 1 + Math.random() * 4;
        continue;
      }
      if (yolTakip(p, p.hiz || 30, dt) === "vardi") p.bekle = 2 + Math.random() * 6;
    }
    // Arabalar
    const tur = b.gen * T + 110;
    for (const a of arabalar) {
      a.x += a.hiz * dt;
      if (a.hiz > 0 && a.x > b.gen * T + 30) a.x -= tur;
      if (a.hiz < 0 && a.x < -80) a.x += tur;
    }
    for (const r of yagmur) { r.y += r.h * dt * 3; r.x -= r.h * dt * 0.5; if (r.y > Y) { r.y = -4; r.x = Math.random() * (G + 40); } }
    kameraGuncelle();
  }

  function kameraGuncelle(hemen) {
    const genP = b.gen * T, yukP = b.yuk * T;
    const hx = genP <= G ? (genP - G) / 2 : Math.max(0, Math.min(genP - G, oyuncu.x - G / 2));
    const hy = yukP <= Y ? (yukP - Y) / 2 : Math.max(0, Math.min(yukP - Y, oyuncu.y - Y / 2));
    if (hemen) { kamera.x = hx; kamera.y = hy; }
    else { kamera.x += (hx - kamera.x) * 0.18; kamera.y += (hy - kamera.y) * 0.18; }
    kamera.x = Math.round(kamera.x); kamera.y = Math.round(kamera.y);
  }

  // ---------- Çizim ----------
  function kisiCiz(ctx, p) {
    const x = Math.round(p.x - kamera.x), y = Math.round(p.y - kamera.y);
    const zip = p.kosu ? Math.round(Math.abs(Math.sin(sure * 12 + p.x * 0.2)) * 1.5) : 0;
    ctx.fillStyle = "rgba(0,0,0,0.22)"; ctx.fillRect(x - 5, y + 7, 10, 2);
    // Urban kasabalıları: dört yön, yürürken iki adım karesi. Sütun 23 sola, 24 öne, 25 arkaya bakar.
    if (p.urban != null) {
      const yon = p.yon || "asagi";
      const s = yon === "yan" ? 23 : yon === "yukari" ? 25 : 24;
      const kare = p.kosu ? 1 + (Math.floor(sure * 6 + p.urban) % 2) : 0;
      U(ctx, s, p.urban * 3 + kare, x - 8, y - 8, yon === "yan" && p.ayna);
      return;
    }
    if (p.ayna) { ctx.save(); ctx.translate(x + 8, 0); ctx.scale(-1, 1); ctx.drawImage(p.img, 0, y - 8 - zip); ctx.restore(); }
    else ctx.drawImage(p.img, x - 8, y - 8 - zip);
  }

  // Gece karanlığı: mevsime göre güneş batışı
  function karanlik() {
    if (b.ic) return 0;
    const ay = ayFn(), saat = saatFn() / 60;
    const batis = ay >= 5 && ay <= 8 ? 20.5 : ay === 4 || ay === 9 ? 19.3 : ay === 3 || ay === 10 ? 18.3 : 17.3;
    const dogus = ay >= 5 && ay <= 8 ? 5.5 : 7.3;
    if (saat < dogus) return 0.62;
    const t = Math.max(0, Math.min(1, (saat - (batis - 0.8)) / 1.6));
    return t * 0.62 + (yagiyor ? 0.12 : 0);
  }

  function ciz(ctx) {
    if (!b) return;
    ctx.fillStyle = "#14161c"; ctx.fillRect(0, 0, G, Y);
    ctx.drawImage(zeminTuval, -kamera.x, -kamera.y);
    const ox = -kamera.x, oy = -kamera.y;
    // Sıralı çizim: nesneler ve insanlar ayak hizasına göre
    const liste = [];
    for (const n of b.nesneler) {
      if (n.tip === "esya" && !b.engel[n.y][n.x]) continue;
      liste.push({ y: tabanY(n), ciz: () => nesneCiz(ctx, n, ox, oy) });
    }
    // Yoldaki arabalar: üst şerit yolun ilk satırında, alt şerit üçüncü satırında
    for (const a of arabalar) {
      const ust = (a.serit === 0 ? a.y : a.y + 2) * T;
      liste.push({ y: ust + T, ciz: () => ctx.drawImage(arabaResmi(a.renk, a.hiz > 0 ? "sag" : "sol"), Math.round(a.x + ox), ust + oy) });
    }
    for (const n of ekler) liste.push({ y: tabanY(n) - (n.zemin ? 100 : 0), ciz: () => nesneCiz(ctx, n, ox, oy) });
    for (const p of insanlar) liste.push({ y: p.y + 8, ciz: () => kisiCiz(ctx, p) });
    liste.push({ y: oyuncu.y + 8, ciz: () => kisiCiz(ctx, oyuncu) });
    liste.sort((a, c) => a.y - c.y).forEach((x) => x.ciz());
    // Karanlık ve ışıklar
    const k = karanlik();
    if (k > 0.02) {
      ctx.fillStyle = `rgba(14,18,48,${k})`; ctx.fillRect(0, 0, G, Y);
      ctx.save(); ctx.globalCompositeOperation = "lighter";
      const isik = (x, y, r, a) => {
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, `rgba(255,214,140,${a})`); g.addColorStop(1, "rgba(255,214,140,0)");
        ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2);
      };
      for (const l of b.isiklar) isik(l.x + ox, l.y + oy, l.r, 0.38 * k / 0.62);
      for (const bn of b.yapilar) if (bn.pencereler) bn.pencereler.forEach((p, i) => { if ((i * 7 + bn.x) % 3 !== 0) isik(p.x + ox, p.y + oy, 7, 0.5 * k / 0.62); });
      ctx.restore();
    }
    if (yagiyor) {
      ctx.strokeStyle = "rgba(190,210,255,0.45)"; ctx.lineWidth = 1; ctx.beginPath();
      for (const r of yagmur) { ctx.moveTo(r.x, r.y); ctx.lineTo(r.x - 2, r.y + 5); }
      ctx.stroke();
    }
  }

  // Ağaçlar: [yaz, sonbahar]; iki karoluklarda üst ve alt karo
  const AGAC = [
    [[16, 8, 16, 9], [16, 11, 16, 12]], [[17, 8, 17, 9], [17, 11, 17, 12]],
    [[16, 8, 16, 10], [16, 11, 16, 13]], [[17, 8, 17, 10], [17, 11, 17, 13]],
    [[22, 8], [22, 11]], [[22, 9], [22, 12]], [[22, 10], [22, 13]],
  ];
  const sonbahar = () => { const a = ayFn(); return a === 10 || a === 11; };
  const tabanY = (n) => (n.y + ({ agac: n.tur >= 4 ? 1 : 2, koru: 3, lamba: 2, araba: 2 }[n.tip] || (n.tip === "dikey" ? n.yuk : 1))) * T;

  function nesneCiz(ctx, n, ox, oy) {
    const x = n.x * T + ox, y = n.y * T + oy;
    if (n.tip === "agac") { const a = AGAC[n.tur % AGAC.length][sonbahar() ? 1 : 0]; U(ctx, a[0], a[1], x, y); if (a[2]) U(ctx, a[2], a[3], x, y + T); }
    else if (n.tip === "koru") { const r = sonbahar() ? 11 : 8; for (let j = 0; j < 3; j++) for (let i = 0; i < 3; i++) U(ctx, 18 + i, r + j, x + i * T, y + j * T); }
    else if (n.tip === "lamba") { const s = n.tur === "park" ? 7 : 3; U(ctx, s, 6, x, y); U(ctx, s, 7, x, y + T); }
    else if (n.tip === "dikey") { for (let j = 0; j < n.yuk; j++) U(ctx, n.s, n.r + j, x, y + j * T); }
    else if (n.tip === "karo") n.karolar.forEach(([s, r], i) => KAYNAK.karo(ctx, n.sayfa || "urban", s, r, x + i * T, y));
    else if (n.tip === "araba") ctx.drawImage(arabaResmi(n.renk, "on"), Math.round(x), Math.round(y));
    else if (n.tip === "esya") KAYNAK.karo(ctx, "ic", n.s, n.r, x, y, n.ayna);
  }

  // Büyütülmüş tuvale: tabelalar, yakındaki şeyin adı, insan isimleri
  function ustCiz(ctx, o) {
    if (!b) return;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.font = `${Math.round(6 * o)}px "Jersey 10", sans-serif`;
    for (const bn of b.yapilar) if (bn.tabela) {
      // Tabela zemin katın üstündeki silmede durur
      const x = (bn.x + bn.gen / 2) * T - kamera.x, y = (bn.y + bn.cati + bn.satirlar.length - 2 + 0.5) * T - kamera.y;
      const w = ctx.measureText(bn.tabela).width / o + 8;
      ctx.fillStyle = "#22201c"; ctx.fillRect((x - w / 2) * o, (y - 5) * o, w * o, 10 * o);
      ctx.fillStyle = "#efe6d2"; ctx.fillText(bn.tabela, x * o, y * o + o * 0.5);
    }
    for (const p of insanlar) if (Math.hypot(p.x - oyuncu.x, p.y - oyuncu.y) < 60 && p.ad) {
      ctx.fillStyle = "rgba(0,0,0,0.6)"; ctx.fillText(p.ad, (p.x - kamera.x) * o + o * 0.6, (p.y - kamera.y - 13) * o + o * 0.6);
      ctx.fillStyle = p.tanidik ? "#ffe27a" : "#efe6d2"; ctx.fillText(p.ad, (p.x - kamera.x) * o, (p.y - kamera.y - 13) * o);
    }
    ctx.textAlign = "left";
    if (yakin) CIZICI.konusma(ctx, { x: yakin.x - kamera.x, y: yakin.y - kamera.y - (yakin.tur === "insan" ? 20 : 12), metin: `E · ${yakin.ad}`, renk: "#c8a640" }, o);
  }

  // ---------- Girdi ----------
  addEventListener("keydown", (e) => {
    if (!b || CIZICI.etkin() !== API || ARAYUZ.pencereAcik() || TAM.acik() || /INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName)) return;
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "w", "a", "s", "d"].includes(k)) { tuslar.add(k); e.preventDefault(); }
    if (["e", "Enter", " "].includes(k) && !e.repeat) { e.preventDefault(); etkiles(); }
  });
  addEventListener("keyup", (e) => { tuslar.delete(e.key.length === 1 ? e.key.toLowerCase() : e.key); });
  addEventListener("blur", () => tuslar.clear());

  function fareBagla(tuval) {
    tuval.addEventListener("click", (e) => {
      if (CIZICI.etkin() !== API) return;
      const r = tuval.getBoundingClientRect();
      tikla((e.clientX - r.left) * (G / r.width), (e.clientY - r.top) * (Y / r.height));
    });
  }

  // Bir bölgenin insansız tam resmi: zemin, binalar ve sokak eşyaları (gündüz sahnesi ve harita için)
  function tamResim(bolgeId, ay) {
    const eski = ayFn;
    if (ay) ayFn = () => ay; // ağaçların mevsimi
    try { return tamCiz(bolgeId); } finally { ayFn = eski; }
  }
  function tamCiz(bolgeId) {
    const bb = SEHIR.bolge(bolgeId);
    const zemin = onbellek.get(bolgeId) || onCizim(bb);
    onbellek.set(bolgeId, zemin);
    const c = document.createElement("canvas");
    c.width = zemin.width; c.height = zemin.height;
    const ctx = c.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(zemin, 0, 0);
    bb.nesneler.filter((n) => !(n.tip === "esya" && !bb.engel[n.y][n.x])).sort((a, c) => tabanY(a) - tabanY(c)).forEach((n) => nesneCiz(ctx, n, 0, 0));
    return c;
  }

  const API = {
    G, Y, kur, guncelle, ciz, ustCiz, fareBagla, etkiles, tikla, tamResim, arabaResmi,
    kilitle: (v) => { kilit = v; if (v) tuslar.clear(); },
    bolge: () => b, oyuncuKonum: () => oyuncu && { x: oyuncu.x / T - 0.5, y: oyuncu.y / T - 0.5 },
    insanlar: () => insanlar, yakin: () => yakin,
    oyuncuResmi: (img) => { if (oyuncu) oyuncu.img = img; },
  };
  return API;
})();
