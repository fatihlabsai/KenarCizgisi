// 2D maç sahnesi: maç motorunun olaylarını sahada canlandırır.
// Sıradan dakikalarda top orta alanda dolaşır; önemli anlarda (şut, gol) kısa bir atak oynatılır.
const SAHNE_MAC = (() => {
  const G = 448, Y = 256, T = 16;
  const PX = 16, PY = 42, PW = 416, PH = 180; // saha (çizgiler dahil)
  const { sinirla } = DUNYA;

  let m = null, kisiler = new Map(), top = null, seyirci = [], hocalar = [];
  let carpan = 1, sure = 0, pasZaman = 0, kutlama = 0, kutlayan = null, santraTakim = null;
  let bekleyenler = [], mesgulSay = 0, kontrol = null, etiket = null;
  let resimler = {};

  // ---------- Koordinatlar ----------
  const evSagda = () => m.devre === 1;
  const sagda = (k) => (k === "ev") === evSagda();
  const ekrana = (k, nx, ny) => ({ x: PX + (sagda(k) ? nx : 1 - nx) * PW, y: PY + ny * PH });
  const cerceve = (k, x, y) => { let nx = (x - PX) / PW; if (!sagda(k)) nx = 1 - nx; return { nx, ny: (y - PY) / PH }; };
  const takimOf = (k) => (k === "ev" ? m.ev : m.dep);
  const rakip = (k) => (k === "ev" ? "dep" : "ev");

  // Zamanlayıcı: oyun içi süreye göre bekler (hız çarpanından etkilenir)
  const bekle = (s) => new Promise((r) => bekleyenler.push({ kalan: s, r }));

  // ---------- Kurulum ----------
  function kur(mac, { menajerResim } = {}) {
    m = mac; kisiler = new Map(); bekleyenler = []; mesgulSay = 0; kutlama = 0; etiket = null;
    resimler = {};
    for (const k of ["ev", "dep"]) {
      const t = takimOf(k);
      for (const o of [...t.oyuncular.map((x) => x.o), ...t.yedekler]) resimler[o.id] = KARAKTER.oyuncu(o, t.k);
    }
    // Seyirciler: ev sahibinin renklerini giyenler biraz daha fazla
    const rnd = KARAKTER.tohumlu(m.ev.k.guc * 31 + m.dep.k.guc);
    const tipler = [];
    for (let i = 0; i < 26; i++) {
      const tarif = tarifeCevir(KARAKTER.rastgeleGorunus(rnd));
      const r = rnd();
      if (r < 0.45) Object.assign(tarif, { ust: [10, 0], ustRenk: m.ev.k.forma });
      else if (r < 0.6) Object.assign(tarif, { ust: [10, 0], ustRenk: m.dep.k.forma });
      tipler.push(KARAKTER.yap(tarif));
    }
    seyirci = [];
    for (let sira = 0; sira < 2; sira++)
      for (let x = 4 + sira * 6; x < G - 10; x += 12 + Math.floor(rnd() * 4))
        if (rnd() < 0.78) seyirci.push({ x, y: 4 + sira * 12, img: tipler[Math.floor(rnd() * tipler.length)], faz: rnd() * 6, evci: rnd() < 0.6 });
    seyirci.sort((a, b) => a.y - b.y);
    const evHoca = m.ev.insan && menajerResim ? menajerResim : KARAKTER.yap({ ten: 1, ust: [14, 5], sort: 0, sac: [19, 4] });
    const depHoca = m.dep.insan && menajerResim ? menajerResim : KARAKTER.yap({ ten: 0, ust: [16, 5], sort: 0, sac: [23, 4], sakal: [26, 7] });
    hocalar = [{ x: 150, y: 234, img: evHoca }, { x: 300, y: 234, img: depHoca, ayna: true }];
    top = { x: G / 2, y: PY + PH / 2, z: 0, sahip: null, ucus: null };
    santra("ev", true);
  }

  // Görünüş seçimlerinden çizim tarifine (seyirciler için)
  function tarifeCevir(g) {
    const K = KARAKTER.KATALOG;
    const sr = K.sacRenk[g.sacRenk], sac = K.sac[g.sac], sakal = K.sakal[g.sakal], ten = K.ten[g.ten], ur = K.ustRenk[g.ustRenk], ust = K.ust[g.ust];
    return {
      ten: ten.satir, tenRenk: ten.renk, sort: 0, sortRenk: K.alt[g.alt].renk, ayakkabi: 0,
      ust: [ur.s + ust.yer[0], ur.r + ust.yer[1]],
      sac: sac.yer && [sr.s + sac.yer[0], sr.r + sac.yer[1]],
      sakal: sakal.yer && [sr.s + sakal.yer[0], sr.r + sakal.yer[1]],
    };
  }

  // Sahadaki oyuncuları maç motoruyla eşitle (değişiklik, kırmızı kart)
  function esitle() {
    const varolan = new Set();
    for (const k of ["ev", "dep"]) {
      const t = takimOf(k);
      for (const x of MAC.sahada(t)) {
        varolan.add(x.o.id);
        let p = kisiler.get(x.o.id);
        if (!p) {
          const giris = { x: G / 2 + (k === "ev" ? -20 : 20), y: PY + PH + 4 };
          p = { id: x.o.id, o: x.o, k, x: giris.x, y: giris.y, ayna: false, kosu: false };
          if (!resimler[x.o.id]) resimler[x.o.id] = KARAKTER.oyuncu(x.o, t.k);
          kisiler.set(x.o.id, p);
        }
        p.yer = x.yer; p.slot = x.i;
      }
    }
    for (const id of [...kisiler.keys()]) if (!varolan.has(id)) { if (top.sahip === kisiler.get(id)) top.sahip = null; kisiler.delete(id); }
  }

  const takimKisileri = (k) => [...kisiler.values()].filter((p) => p.k === k);
  const kaleciOf = (k) => takimKisileri(k).find((p) => p.yer === "KL") || takimKisileri(k)[0];

  function santra(k, ilk) {
    santraTakim = k;
    esitle();
    for (const p of kisiler.values()) {
      const t = takimOf(p.k);
      const yer = DIZILISLER[t.dizilis][p.slot] || ["OS", 0.4, 0.5];
      const nx = Math.min(yer[1], 0.46);
      const s = ekrana(p.k, nx * 0.9, yer[2]);
      if (ilk) { p.x = s.x; p.y = s.y; }
    }
    const fv = takimKisileri(k).filter((p) => p.yer === "FV")[0] || takimKisileri(k).find((p) => p.yer === "OS");
    top.ucus = null; top.z = 0;
    top.x = G / 2; top.y = PY + PH / 2;
    if (fv) { fv.x = G / 2 + (sagda(k) ? -6 : 6); fv.y = PY + PH / 2; top.sahip = fv; }
    pasZaman = 0.8;
  }

  function devreDegis() { santra("dep", true); }

  // ---------- Hareket ----------
  function hedefler() {
    const sahipTakim = top.sahip ? top.sahip.k : top.ucus ? top.ucus.takim : m.top;
    for (const k of ["ev", "dep"]) {
      const t = takimOf(k);
      const b = cerceve(k, top.x, top.y);
      const sahibiz = sahipTakim === k;
      const kayma = (sinirla(b.nx, 0, 1) - 0.5) * 0.42;
      const itme = sahibiz ? 0.1 : -0.04;
      for (const p of takimKisileri(k)) {
        if (p.ozelHedef) { p.tx = p.ozelHedef.x; p.ty = p.ozelHedef.y; continue; }
        const yer = DIZILISLER[t.dizilis][p.slot] || ["OS", 0.4, 0.5];
        let nx, ny;
        if (p.yer === "KL") { nx = 0.035 + sinirla(b.nx, 0, 1) * 0.05; ny = 0.5 + (b.ny - 0.5) * 0.3; }
        else {
          nx = sinirla(yer[1] + kayma + itme, 0.06, 0.94);
          ny = sinirla(yer[2] + (b.ny - 0.5) * 0.3 * (1 - Math.abs(yer[2] - 0.5)), 0.04, 0.96);
        }
        if (santraTakim) nx = Math.min(nx, 0.47);
        const s = ekrana(k, nx, ny);
        p.tx = s.x; p.ty = s.y;
      }
      // Top bizde değilse en yakın oyuncu topa basar
      if (!sahibiz && !santraTakim) {
        let en = null, ed = 1e9;
        for (const p of takimKisileri(k)) {
          if (p.yer === "KL" || p.ozelHedef) continue;
          const d = Math.hypot(p.x - top.x, p.y - top.y);
          if (d < ed) { ed = d; en = p; }
        }
        if (en) { const aci = Math.atan2(en.y - top.y, en.x - top.x); en.tx = top.x + Math.cos(aci) * 7; en.ty = top.y + Math.sin(aci) * 5; }
      }
    }
  }

  function hareket(dt) {
    for (const p of kisiler.values()) {
      if (p === top.sahip && !p.ozelHedef && !santraTakim) {
        // Topu süren oyuncu yavaşça ileri gider
        const b = cerceve(p.k, p.x, p.y);
        const hedefX = ekrana(p.k, sinirla(b.nx + 0.02, 0, 0.72), b.ny).x;
        p.tx = hedefX; p.ty = p.y;
      }
      const dx = p.tx - p.x, dy = p.ty - p.y, d = Math.hypot(dx, dy);
      const hiz = (34 + p.o.oz.hiz * 1.7) * (p.ozelHedef ? 1.35 : 1) * dt;
      if (d > 0.6) {
        const adim = Math.min(d, hiz);
        p.x += (dx / d) * adim; p.y += (dy / d) * adim;
        p.kosu = d > 2;
        if (Math.abs(dx) > 0.5) p.ayna = dx < 0;
      } else p.kosu = false;
      if (!p.kosu) p.ayna = top.x < p.x;
    }
    // Top
    if (top.ucus) {
      const u = top.ucus;
      u.t += dt / u.sure;
      const t = Math.min(1, u.t);
      top.x = u.x0 + (u.x1 - u.x0) * t;
      top.y = u.y0 + (u.y1 - u.y0) * t;
      top.z = Math.sin(t * Math.PI) * u.h;
      if (u.t >= 1) { top.ucus = null; top.z = 0; if (u.alan) top.sahip = u.alan; u.bitti && u.bitti(); }
    } else if (top.sahip) {
      const p = top.sahip;
      top.x = p.x + (sagda(p.k) ? 5 : -5); top.y = p.y + 6; top.z = 0;
    }
  }

  // Bir oyuncudan diğerine pas (top uçarken alıcı da hareket edebilir)
  function pas(alan, { h = 3, hiz = 170, takim } = {}) {
    return new Promise((r) => {
      const x1 = alan.x + (sagda(alan.k) ? 5 : -5), y1 = alan.y + 6;
      const d = Math.hypot(x1 - top.x, y1 - top.y);
      top.ucus = { x0: top.x, y0: top.y, x1, y1, t: 0, sure: Math.max(0.15, d / hiz), h: Math.min(10, h + d / 40), alan, takim: takim || alan.k, bitti: r };
      top.sahip = null;
    });
  }

  // Topu bir noktaya gönder (şut, aut)
  function vur(x1, y1, { h = 4, hiz = 260, takim } = {}) {
    return new Promise((r) => {
      const d = Math.hypot(x1 - top.x, y1 - top.y);
      top.ucus = { x0: top.x, y0: top.y, x1, y1, t: 0, sure: Math.max(0.12, d / hiz), h, alan: null, takim, bitti: r };
      top.sahip = null;
    });
  }

  // Sıradan dakikalarda top orta alanda dolaşır
  function serbestOyun(dt) {
    if (top.ucus) return;
    if (santraTakim && top.sahip) {
      pasZaman -= dt;
      if (pasZaman <= 0) {
        const k = santraTakim; santraTakim = null;
        const arka = takimKisileri(k).filter((p) => p.yer === "OS");
        if (arka.length) pas(arka[Math.floor(Math.random() * arka.length)]);
      }
      return;
    }
    if (!top.sahip) {
      // Sahipsiz top: en yakın oyuncu alır
      let en = null, ed = 1e9;
      for (const p of kisiler.values()) { const d = Math.hypot(p.x - top.x, p.y - top.y); if (d < ed) { ed = d; en = p; } }
      if (en && ed < 10) top.sahip = en;
      return;
    }
    // Dakikanın sahibi değiştiyse top karşı takıma geçer
    if (top.sahip.k !== m.top) {
      let en = null, ed = 1e9;
      for (const p of takimKisileri(m.top)) { if (p.yer === "KL") continue; const d = Math.hypot(p.x - top.x, p.y - top.y); if (d < ed) { ed = d; en = p; } }
      if (en && ed < 26) { top.sahip = en; pasZaman = 0.6 + Math.random() * 0.6; }
      else if (en) { pas(en, { takim: m.top }); }
      return;
    }
    pasZaman -= dt;
    if (pasZaman > 0) return;
    pasZaman = 0.9 + Math.random() * 1.1;
    const p = top.sahip;
    const adaylar = takimKisileri(p.k).filter((q) => q !== p);
    if (!adaylar.length) return;
    // Topu ileri taşımayı sever ama ceza sahasına girmez: orası önemli anlara ayrılmış
    const ag = adaylar.map((q) => {
      const f = cerceve(q.k, q.x, q.y);
      const d = Math.hypot(q.x - p.x, q.y - p.y);
      let w = 1 / (1 + Math.abs(d - 55) / 30);
      if (f.nx > 0.72) w *= 0.15;
      if (q.yer === "KL") w *= 0.15;
      if (f.nx > cerceve(p.k, p.x, p.y).nx) w *= 1.4;
      return w;
    });
    let r = Math.random() * ag.reduce((a, b) => a + b, 0);
    let sec = adaylar[0];
    for (let i = 0; i < adaylar.length; i++) { if ((r -= ag[i]) <= 0) { sec = adaylar[i]; break; } }
    pas(sec);
  }

  // ---------- Önemli anlar ----------
  async function olayOynat(e) {
    if (!["gol", "kurtaris", "direk", "disari", "blok"].includes(e.tip)) return;
    mesgulSay++;
    try { await atakOynat(e); } finally { mesgulSay--; }
  }

  async function atakOynat(e) {
    esitle();
    santraTakim = null;
    const k = e.takim, d = rakip(k);
    const atan = kisiler.get(e.oyuncu.id);
    if (!atan) return;
    const asist = e.asist && kisiler.get(e.asist.id);
    const nokta = (nx, ny) => ekrana(k, nx, ny);
    const kanat = Math.random() < 0.5 ? 0.22 : 0.78;
    // 1) Top bizde değilse bir orta saha oyuncusu kapar
    if (!top.sahip || top.sahip.k !== k) {
      const os = takimKisileri(k).filter((p) => p.yer === "OS").sort((a, b) => Math.hypot(a.x - top.x, a.y - top.y) - Math.hypot(b.x - top.x, b.y - top.y))[0] || atan;
      if (top.ucus) await bekle(0.2);
      await pas(os, { takim: k, hiz: 220 });
    }
    // 2) Pası verecek oyuncu kanada ya da çizgiye koşar, top ona gider
    if (asist && asist !== top.sahip) {
      asist.ozelHedef = nokta(0.74, asist.yer === "OS" || asist.yer === "DF" ? kanat : 0.4 + Math.random() * 0.2);
      atan.ozelHedef = nokta(0.66, 0.5);
      await bekle(0.35);
      await pas(asist, { hiz: 200 });
    }
    // 3) Golcü ceza sahasına girer, pas ona gelir
    atan.ozelHedef = nokta(0.82 + Math.random() * 0.06, 0.38 + Math.random() * 0.24);
    await bekle(asist ? 0.45 : 0.6);
    if (top.sahip !== atan) await pas(atan, { hiz: 210, h: asist ? 6 : 3 });
    else await bekle(0.3);
    await bekle(0.15);
    // 4) Şut
    const kale = ekrana(k, 1, 0.5);
    const kenar = sagda(k) ? 1 : -1;
    const kaleci = kaleciOf(d);
    etiket = { metin: e.oyuncu.soyad, p: atan, sure: 1.4 };
    if (e.tip === "gol") {
      const y = PY + PH * (0.45 + Math.random() * 0.1);
      if (kaleci) kaleci.ozelHedef = { x: kaleci.x, y: y + (Math.random() < 0.5 ? -9 : 9) };
      await vur(kale.x + kenar * 5, y, { takim: k, hiz: 300 });
      kutlama = 2.4; kutlayan = k;
      atan.ozelHedef = ekrana(k, 0.92, atan.y < PY + PH / 2 ? 0.04 : 0.96);
      await bekle(2.2);
    } else if (e.tip === "kurtaris") {
      const y = PY + PH * (0.45 + Math.random() * 0.1);
      if (kaleci) kaleci.ozelHedef = { x: kaleci.x, y };
      await vur(kale.x - kenar * 6, y, { takim: k, hiz: 280 });
      if (kaleci) { top.sahip = kaleci; etiket = { metin: `${e.kaleci ? e.kaleci.soyad : ""} kurtardı`, p: kaleci, sure: 1.3 }; }
      await bekle(1.1);
    } else if (e.tip === "direk") {
      const y = PY + PH * (Math.random() < 0.5 ? 0.435 : 0.565);
      await vur(kale.x, y, { takim: k, hiz: 290, h: 5 });
      etiket = { metin: "Direk!", p: atan, sure: 1.2 };
      const geri = ekrana(k, 0.84, 0.5 + (Math.random() - 0.5) * 0.4);
      await vur(geri.x, geri.y, { hiz: 160, h: 4 });
      await bekle(0.5);
    } else if (e.tip === "disari") {
      const ust = Math.random() < 0.5;
      const y = PY + PH * (ust ? 0.36 + Math.random() * 0.05 : 0.59 + Math.random() * 0.05);
      await vur(kale.x + kenar * 12, y, { takim: k, hiz: 280, h: 7 });
      await bekle(0.8);
      if (kaleci) { top.x = kaleci.x; top.y = kaleci.y + 6; top.sahip = kaleci; }
      await bekle(0.4);
    } else if (e.tip === "blok") {
      const def = kisiler.get(e.defans && e.defans.id) || takimKisileri(d).find((p) => p.yer === "DF");
      if (def) def.ozelHedef = { x: (atan.x + kale.x) / 2, y: atan.y };
      await bekle(0.25);
      await vur((atan.x * 2 + kale.x) / 3, atan.y + 4, { hiz: 240, h: 2 });
      const korner = { x: kale.x, y: atan.y < PY + PH / 2 ? PY : PY + PH };
      await vur(korner.x, korner.y, { hiz: 170, h: 5 });
      await bekle(0.6);
    }
    for (const p of kisiler.values()) p.ozelHedef = null;
    if (e.tip === "gol") santra(d, false);
    else if (!top.sahip) {
      const kl = kaleciOf(d);
      if (kl) { top.x = kl.x; top.y = kl.y + 6; top.sahip = kl; }
    }
    pasZaman = 0.7;
  }

  // ---------- Döngü ----------
  function guncelle(dt0) {
    if (!m) return;
    const dt = dt0 * carpan;
    sure += dt;
    for (const b of bekleyenler) b.kalan -= dt;
    const biten = bekleyenler.filter((b) => b.kalan <= 0);
    bekleyenler = bekleyenler.filter((b) => b.kalan > 0);
    biten.forEach((b) => b.r());
    esitle();
    if (!mesgulSay) serbestOyun(dt);
    hedefler();
    hareket(dt);
    if (kutlama > 0) kutlama -= dt;
    if (etiket && (etiket.sure -= dt) <= 0) etiket = null;
    if (kontrol) kontrol(dt0);
  }

  // ---------- Çizim ----------
  function saha(ctx) {
    KAYNAK.doseme(ctx, "sehir", 0, 24, 0, 0, Math.ceil(G / T), Math.ceil(Y / T));
    // Tribün: beton basamaklar ve seyirciler
    KAYNAK.doseme(ctx, "sehir", 1, 20, 0, 0, Math.ceil(G / T), 2);
    ctx.fillStyle = "rgba(0,0,0,0.12)"; ctx.fillRect(0, 15, G, 1);
    for (const s of seyirci) {
      const zip = kutlama > 0 && (s.evci === (kutlayan === "ev")) ? Math.round(Math.abs(Math.sin(sure * 12 + s.faz)) * 3) : 0;
      ctx.drawImage(s.img, s.x, s.y - zip);
    }
    for (let x = 0; x < G; x += T) KAYNAK.karo(ctx, "sehir", 17, 18, x, 22);
    // Biçilmiş çim şeritleri
    ctx.fillStyle = "rgba(0,0,0,0.055)";
    for (let x = PX; x < PX + PW; x += 52) ctx.fillRect(x, PY, 26, PH);
    // Çizgiler
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    const c = (x, y, w, h) => ctx.fillRect(Math.round(x), Math.round(y), w, h);
    c(PX, PY, PW, 1); c(PX, PY + PH, PW + 1, 1); c(PX, PY, 1, PH); c(PX + PW, PY, 1, PH);
    c(PX + PW / 2, PY, 1, PH);
    for (let a = 0; a < Math.PI * 2; a += 0.04) c(PX + PW / 2 + Math.cos(a) * 24, PY + PH / 2 + Math.sin(a) * 24, 1, 1);
    const ceza = (sol) => {
      const x = sol ? PX : PX + PW - 62;
      c(x, PY + PH * 0.2, 62, 1); c(x, PY + PH * 0.8, 62, 1); c(sol ? x + 62 : x, PY + PH * 0.2, 1, PH * 0.6);
      const kx = sol ? PX : PX + PW - 22;
      c(kx, PY + PH * 0.36, 22, 1); c(kx, PY + PH * 0.64, 22, 1); c(sol ? kx + 22 : kx, PY + PH * 0.36, 1, PH * 0.28);
      c(sol ? PX + 42 : PX + PW - 42, PY + PH / 2, 1, 1);
    };
    ceza(true); ceza(false);
    // Kaleler
    const kale = (sol) => {
      const x = sol ? PX - 7 : PX + PW + 1;
      ctx.fillStyle = "rgba(255,255,255,0.28)";
      for (let y = PY + PH * 0.44; y < PY + PH * 0.56; y += 3) ctx.fillRect(x, Math.round(y), 6, 1);
      ctx.fillStyle = "#f4f4f4";
      ctx.fillRect(x, Math.round(PY + PH * 0.44) - 1, 7, 2); ctx.fillRect(x, Math.round(PY + PH * 0.56), 7, 2);
      ctx.fillRect(sol ? x : x + 5, Math.round(PY + PH * 0.44), 2, Math.round(PH * 0.12));
    };
    kale(true); kale(false);
    // Kenar: yedek kulübeleri
    for (let i = 0; i < 3; i++) { KAYNAK.karo(ctx, "sehir", 15 + i, 15, 100 + i * 16, 236); KAYNAK.karo(ctx, "sehir", 15 + i, 15, 316 + i * 16, 236); }
  }

  function kisiCiz(ctx, img, x, y, ayna, zip = 0) {
    ctx.fillStyle = "rgba(0,0,0,0.22)";
    ctx.fillRect(Math.round(x) - 5, Math.round(y) + 7, 10, 2);
    if (ayna) { ctx.save(); ctx.translate(Math.round(x) + 8, 0); ctx.scale(-1, 1); ctx.drawImage(img, 0, Math.round(y) - 8 - zip); ctx.restore(); }
    else ctx.drawImage(img, Math.round(x) - 8, Math.round(y) - 8 - zip);
  }

  function ciz(ctx) {
    if (!m) return;
    saha(ctx);
    const liste = [...kisiler.values()].sort((a, b) => a.y - b.y);
    for (const p of liste) {
      const zip = p.kosu ? Math.round(Math.abs(Math.sin(sure * 14 + p.x * 0.3)) * 1.5) : 0;
      kisiCiz(ctx, resimler[p.id], p.x, p.y, p.ayna, zip);
    }
    for (const h of hocalar) kisiCiz(ctx, h.img, h.x, h.y, h.ayna);
    // Top ve gölgesi
    const tx = Math.round(top.x), ty = Math.round(top.y);
    ctx.fillStyle = "rgba(0,0,0,0.28)"; ctx.fillRect(tx - 1, ty + 2, 3, 1);
    ctx.fillStyle = "#ffffff"; ctx.fillRect(tx - 1, ty - Math.round(top.z) - 1, 3, 3);
    ctx.fillStyle = "#3a3a3a"; ctx.fillRect(tx, ty - Math.round(top.z), 1, 1);
  }

  // Büyütülmüş tuvale: topu süren oyuncunun adı ve gol yazısı
  function ustCiz(ctx, o) {
    if (!m) return;
    const isim = etiket || (top.sahip ? { metin: top.sahip.o.soyad, p: top.sahip, sade: true } : null);
    if (isim && isim.p) {
      ctx.font = `${Math.round(6 * o)}px "Jersey 10", sans-serif`;
      ctx.textAlign = "center"; ctx.textBaseline = "bottom";
      const x = isim.p.x * o, y = (isim.p.y - 10) * o;
      ctx.fillStyle = "rgba(0,0,0,0.65)"; ctx.fillText(isim.metin, x + o * 0.6, y + o * 0.6);
      ctx.fillStyle = isim.sade ? "#efe6d2" : "#ffe27a"; ctx.fillText(isim.metin, x, y);
      ctx.textAlign = "left";
    }
    if (kutlama > 0) {
      const t = takimOf(kutlayan).k;
      ctx.font = `${Math.round(36 * o)}px "Jersey 10", sans-serif`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      const x = (G / 2) * o, y = (PY + PH / 2) * o;
      ctx.fillStyle = "#000"; ctx.fillText("GOL!", x + 3 * o, y + 3 * o);
      ctx.fillStyle = t.forma; ctx.fillText("GOL!", x, y);
      ctx.textAlign = "left";
    }
  }

  return {
    G, Y, kur, guncelle, ciz, ustCiz, olayOynat, santra, devreDegis,
    mesgul: () => mesgulSay > 0,
    hizAyarla: (h) => { carpan = h; },
    kontrolAyarla: (fn) => { kontrol = fn; },
    durdur: () => { m = null; kontrol = null; bekleyenler.forEach((b) => b.r()); bekleyenler = []; },
  };
})();
