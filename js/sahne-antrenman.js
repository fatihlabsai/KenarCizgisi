// Antrenman sahası. Ana menüde süs olarak rondo oynar; oyunda seçilen antrenmanın tekrarlarını canlandırır.
// Türler: pas (rondo), sut (bitiricilik), duran (korner), kondisyon (depar), savunma (hat), dinlenme (hafif koşu).
const SAHNE_ANTRENMAN = (() => {
  const T = 16, G = 320, Y = 192;
  const KALE = { x: 12, y: 96 };
  let kisiler = [], top = null, hoca = null, sure = 0, bagir = null, balonlar = [];
  let mod = "rondo", veri = null, adimlar = [], bekleyen = null, bitince = null, carpan = 1, bitti = false;
  let rondo = null, slalom = null, kayitlar = [];

  // ---------- Yardımcılar ----------
  const kisi = (img, x, y, ek = {}) => ({ img, x, y, tx: x, ty: y, ayna: false, kosu: false, hiz: 40, ...ek });
  const git = (p, x, y, hiz) => { p.tx = x; p.ty = y; if (hiz) p.hiz = hiz; };
  const vardiMi = (p) => Math.hypot(p.tx - p.x, p.ty - p.y) < 1;

  function topAt(x1, y1, { h = 3, hiz = 150 } = {}) {
    const d = Math.hypot(x1 - top.x, y1 - top.y);
    top.ucus = { x0: top.x, y0: top.y, x1, y1, t: 0, sure: Math.max(0.12, d / hiz), h: h + d / 50 };
    top.sahip = null;
  }
  const topVardi = () => !top.ucus;

  function soyle(p, metin, sure = 1.4) { balonlar = balonlar.filter((b) => b.p !== p); balonlar.push({ p, metin, sure }); }
  function kaydet(metin) { kayitlar.unshift(metin); if (ANTRENMAN_EKRANI.kayit) ANTRENMAN_EKRANI.kayit(metin); }

  // ---------- Kurulum ----------
  // Ana menü için: tohumlu, rastgele Kalvar oyuncularıyla rondo
  function kur() {
    const rnd = KARAKTER.tohumlu(1932);
    const forma = "#c8a640", sort = "#2b2f3a";
    const resimler = [];
    for (let i = 0; i < 8; i++) resimler.push(KARAKTER.futbolcu(rnd, i >= 5 && i < 7 ? "#d9532c" : forma, sort));
    hoca = kisi(KARAKTER.yap({ ten: 1, ust: [14, 5], sort: 0, ayakkabi: 0, sac: [19, 4], sakal: [21, 6] }), 150, 170);
    rondoKur(resimler.slice(0, 5), resimler.slice(5, 7));
    slalom = { p: kisi(resimler[7], 40, 150), t: 0 };
    kisiler = [...rondo.dis, ...rondo.orta, slalom.p, hoca];
    mod = "rondo"; veri = null; bitince = null; bitti = false;
  }

  function rondoKur(disResim, ortaResim) {
    const merkez = { x: 172, y: 92 }, r = 34;
    const dis = disResim.map((img, i) => {
      const a = -Math.PI / 2 + i * (Math.PI * 2 / 5);
      return kisi(img, merkez.x + Math.cos(a) * r, merkez.y + Math.sin(a) * r * 0.8);
    });
    const orta = ortaResim.map((img, i) => kisi(img, merkez.x - 6 + i * 12, merkez.y, { hiz: 26 + i * 6 }));
    rondo = { dis, orta, sahip: 0, hedef: 1, t: 0, sure: 0.55, merkez, pasSay: 0 };
    top = { x: dis[0].x, y: dis[0].y + 6, z: 0 };
  }

  // Oyun içinde: rapordaki tekrarları gerçek oyuncularla oynat
  // secenekler: { oyuncu(id) → nesne, resim(o) → tuval, yelek(o) → tuval, hocaResim, bitince }
  function baslat(rapor, sec) {
    mod = rapor.tur === "pas" ? "rondo" : rapor.tur;
    veri = rapor.tekrarlar; bitince = sec.bitince; bitti = false; carpan = 1;
    kayitlar = []; balonlar = []; adimlar = []; bekleyen = null; slalom = null;
    hoca = kisi(sec.hocaResim, 150, 172);
    top = { x: 160, y: 96, z: 0, ucus: null, sahip: null };
    const o = sec.oyuncu, r = sec.resim;
    if (mod === "rondo") {
      const ids = veri.kisiler;
      rondoKur(ids.slice(0, 5).map((id) => r(o(id))), ids.slice(5, 7).map((id) => sec.yelek(o(id))));
      rondo.dis.forEach((p, i) => { p.o = o(ids[i]); });
      rondo.orta.forEach((p, i) => { p.o = o(ids[5 + i]); });
      rondo.kayiplar = veri.kayiplar.slice();
      kisiler = [...rondo.dis, ...rondo.orta, hoca];
    } else if (mod === "sut") {
      const kl = kisi(r(o(veri.kaleci)), KALE.x + 8, KALE.y, { o: o(veri.kaleci) });
      const sira = veri.atanlar.map((id, i) => kisi(r(o(id)), 110 + i * 14, 96 + (i % 2) * 8, { o: o(id), ayna: true }));
      veri.kl = kl; veri.sira = sira;
      kisiler = [kl, ...sira, hoca];
      adimlar = veri.atislar.map((a) => () => sutAdimi(a));
    } else if (mod === "duran") {
      const kl = kisi(r(o(veri.kaleci)), KALE.x + 8, KALE.y, { o: o(veri.kaleci) });
      const kul = kisi(r(o(veri.kullanan)), 20, 30, { o: o(veri.kullanan) });
      const huc = veri.hucum.map((id, i) => kisi(r(o(id)), 46 + (i % 2) * 14, 76 + i * 14, { o: o(id), ayna: true }));
      const sav = veri.savunma.map((id, i) => kisi(sec.yelek(o(id)), 34 + (i % 2) * 10, 82 + i * 16, { o: o(id) }));
      veri.kl = kl; veri.kul = kul; veri.huc = huc; veri.sav = sav;
      kisiler = [kl, kul, ...huc, ...sav, hoca];
      top.x = 22; top.y = 34;
      adimlar = veri.kornerler.map((k) => () => kornerAdimi(k));
    } else if (mod === "kondisyon" || mod === "dinlenme") {
      const kos = veri.kosucular.map((id, i) => kisi(r(o(id)), 40, 40 + i * (mod === "dinlenme" ? 12 : 15), { o: o(id) }));
      veri.kos = kos;
      kisiler = [...kos, hoca];
      top = { x: -20, y: -20, z: 0 };
      adimlar = mod === "dinlenme" ? [() => hafifKosu()] : veri.yarislar.map((s, i) => () => deparAdimi(s, i));
    } else if (mod === "savunma") {
      const def = veri.defans.map((id, i) => kisi(sec.yelek(o(id)), 66, 54 + i * 28, { o: o(id) }));
      const huc = veri.hucum.map((id, i) => kisi(r(o(id)), 118, 62 + i * 34, { o: o(id), ayna: true }));
      const kl = kisi(KARAKTER.oyuncu({ mevki: "KL", gorunus: {} }, kulupBul(S.kulupId)), KALE.x + 8, KALE.y);
      veri.def = def; veri.huc = huc; veri.kl = kl;
      kisiler = [kl, ...def, ...huc, hoca];
      top.sahip = huc[1];
      adimlar = veri.denemeler.map((d) => () => savunmaAdimi(d));
    }
    if (mod !== "rondo") sonrakiAdim();
  }

  // ---------- Adımlar (her tekrar kendi küçük sırasını oynatır) ----------
  // Bir adım, bir dizi alt adımdan oluşur: [{ sure | kosul, yap }]
  function sira(liste) { bekleyen = { liste, i: 0, sayac: 0 }; liste[0] && liste[0].yap && liste[0].yap(); }
  function sonrakiAdim() {
    if (!adimlar.length) {
      bekleyen = null;
      if (!bitti) { bitti = true; setTimeout(() => bitince && bitince(), 600); }
      return;
    }
    adimlar.shift()();
  }

  function sutAdimi(a) {
    const p = veri.sira.find((x) => x.o.id === a.oyuncu);
    const kl = veri.kl;
    const hedefY = KALE.y - 10 + Math.random() * 20;
    sira([
      { yap: () => { top.x = p.x - 5; top.y = p.y + 6; top.sahip = p; git(p, 62, KALE.y - 8 + Math.random() * 16, 55); } },
      { kosul: () => vardiMi(p) },
      { yap: () => {
          if (a.sonuc === "aut") topAt(KALE.x - 6, hedefY + (Math.random() < 0.5 ? -22 : 22), { hiz: 230, h: 6 });
          else topAt(KALE.x + (a.sonuc === "gol" ? -2 : 8), hedefY, { hiz: 240, h: 3 });
          git(kl, kl.x, a.sonuc === "gol" ? hedefY + (Math.random() < 0.5 ? -9 : 9) : hedefY, 70);
        } },
      { kosul: topVardi },
      { yap: () => {
          const s = { gol: "Gol!", kurtaris: `${kl.o.soyad} kurtardı`, aut: "Auta" }[a.sonuc];
          soyle(a.sonuc === "kurtaris" ? kl : p, a.sonuc === "kurtaris" ? s : `${p.o.soyad}: ${s}`);
          kaydet(`${p.o.soyad} · ${a.sonuc === "gol" ? "gol" : a.sonuc === "kurtaris" ? "kaleci kurtardı" : "aut"}`);
          const son = veri.sira[veri.sira.length - 1];
          veri.sira = veri.sira.filter((x) => x !== p).concat(p);
          git(p, son.x + 14 > 200 ? 110 : son.x + 14, 96 + (veri.sira.length % 2) * 8, 45);
          veri.sira.forEach((x, i) => { if (x !== p) git(x, 110 + i * 14, 96 + (i % 2) * 8, 30); });
          git(p, 110 + (veri.sira.length - 1) * 14, 96 + ((veri.sira.length - 1) % 2) * 8, 45);
        } },
      { sure: 0.9 },
      { yap: () => { top.x = -20; top.y = -20; git(kl, KALE.x + 8, KALE.y, 40); } },
    ]);
  }

  function kornerAdimi(k) {
    const kim = [...veri.huc, ...veri.sav].find((x) => x.o.id === k.oyuncu);
    const kl = veri.kl;
    const nokta = { x: 36 + Math.random() * 18, y: 84 + Math.random() * 24 };
    sira([
      { yap: () => { top.x = 22; top.y = 34; top.z = 0; [...veri.huc, ...veri.sav].forEach((p) => git(p, p.x + (Math.random() - 0.5) * 10, p.y + (Math.random() - 0.5) * 8, 30)); } },
      { sure: 0.5 },
      { yap: () => { topAt(nokta.x, nokta.y, { hiz: 120, h: 14 }); git(kim, nokta.x + 2, nokta.y - 4, 60); } },
      { kosul: topVardi },
      { yap: () => {
          if (k.sonuc === "gol") { topAt(KALE.x - 2, KALE.y - 6 + Math.random() * 12, { hiz: 200, h: 2 }); git(kl, kl.x, KALE.y + 10, 50); }
          else if (k.sonuc === "kurtaris") { topAt(kl.x, kl.y + 2, { hiz: 200, h: 2 }); }
          else topAt(nokta.x + 60, nokta.y - 40, { hiz: 160, h: 10 });
        } },
      { kosul: topVardi },
      { yap: () => {
          const s = k.sonuc === "gol" ? `${kim.o.soyad}: Gol!` : k.sonuc === "kurtaris" ? `${kl.o.soyad} kurtardı` : `${kim.o.soyad} uzaklaştırdı`;
          soyle(k.sonuc === "kurtaris" ? kl : kim, s);
          kaydet(k.sonuc === "gol" ? `${kim.o.soyad} kafayla gol` : k.sonuc === "kurtaris" ? `${kim.o.soyad} kafa vurdu, kaleci kurtardı` : `${kim.o.soyad} topu uzaklaştırdı`);
        } },
      { sure: 1 },
      { yap: () => { git(kl, KALE.x + 8, KALE.y, 40); top.x = 22; top.y = 34; } },
    ]);
  }

  function deparAdimi(sira2, i) {
    const kos = veri.kos;
    const hedefX = i % 2 === 0 ? 280 : 40;
    sira([
      { sure: 0.6 },
      { yap: () => {
          sira2.forEach((id, s) => { const p = kos.find((x) => x.o.id === id); git(p, hedefX, p.y, 95 - s * 5); });
        } },
      { kosul: () => kos.every(vardiMi) },
      { yap: () => {
          const birinci = kos.find((x) => x.o.id === sira2[0]);
          const sonuncu = kos.find((x) => x.o.id === sira2[sira2.length - 1]);
          soyle(birinci, `${birinci.o.soyad} birinci`);
          soyle(sonuncu, "Biraz daha!", 1.1);
          kaydet(`${i + 1}. depar: ${birinci.o.soyad} birinci, ${sonuncu.o.soyad} sonuncu`);
        } },
      { sure: 1.1 },
    ]);
  }

  function hafifKosu() {
    const kos = veri.kos;
    sira([
      { yap: () => kos.forEach((p, i) => git(p, 250, 40 + i * 12, 24 + Math.random() * 6)) },
      { kosul: () => kos.every(vardiMi) },
      { yap: () => { soyle(hoca, "Yavaş, kendinizi zorlamayın"); kaydet("Hafif koşu ve esneme"); kos.forEach((p, i) => git(p, 60, 40 + i * 12, 24)); } },
      { kosul: () => kos.every(vardiMi) },
    ]);
  }

  function savunmaAdimi(d) {
    const a = veri.huc.find((x) => x.o.id === d.hucumcu);
    const df = veri.def.find((x) => x.o.id === d.defans);
    sira([
      { yap: () => { veri.huc.forEach((p, i) => git(p, 118, 62 + i * 34, 30)); } },
      { kosul: () => veri.huc.every(vardiMi) },
      { yap: () => { if (top.sahip !== a) { topAt(a.x - 5, a.y + 6, { hiz: 140 }); } } },
      { kosul: topVardi },
      { yap: () => { top.sahip = a; git(a, 70, a.y + (df.y - a.y) * 0.3, 55); git(df, 80, a.y, 60); } },
      { kosul: () => Math.abs(a.x - df.x) < 14 || vardiMi(a) },
      { yap: () => {
          if (d.sonuc === "kesti") { top.sahip = df; git(a, 90, a.y, 30); soyle(df, `${df.o.soyad} araya girdi`); kaydet(`${df.o.soyad}, ${ek(a.o.soyad, "i")} durdurdu`); }
          else { git(a, 36, KALE.y + (a.y - KALE.y) * 0.3, 60); soyle(a, `${a.o.soyad} arkaya sarktı`); kaydet(`${a.o.soyad} savunmanın arkasına geçti`); }
        } },
      { kosul: () => d.sonuc === "kesti" || vardiMi(a) },
      { yap: () => { if (d.sonuc === "gecti") topAt(KALE.x - 2, KALE.y - 6 + Math.random() * 12, { hiz: 230 }); } },
      { sure: 1 },
      { yap: () => { veri.def.forEach((p, i) => git(p, 66, 54 + i * 28, 35)); top.sahip = null; top.x = veri.huc[1].x - 5; top.y = veri.huc[1].y + 6; top.sahip = veri.huc[1]; } },
    ]);
  }

  // ---------- Güncelleme ----------
  function guncelle(dt0) {
    const dt = dt0 * carpan;
    sure += dt;
    // Sıradaki alt adım
    if (bekleyen) {
      const s = bekleyen.liste[bekleyen.i];
      let gec = false;
      if (s.sure != null) { bekleyen.sayac += dt; gec = bekleyen.sayac >= s.sure; }
      else if (s.kosul) gec = s.kosul();
      else gec = true;
      if (gec) {
        bekleyen.i++; bekleyen.sayac = 0;
        const yeni = bekleyen.liste[bekleyen.i];
        if (!yeni) { bekleyen = null; sonrakiAdim(); }
        else if (yeni.yap) yeni.yap();
      }
    }
    if (mod === "rondo" && rondo) rondoGuncelle(dt);
    if (slalom) slalomGuncelle(dt);
    // Kişileri hedeflerine yürüt
    for (const p of kisiler) {
      if (mod === "rondo" && (rondo.dis.includes(p) || rondo.orta.includes(p) || (slalom && p === slalom.p))) continue;
      const dx = p.tx - p.x, dy = p.ty - p.y, d = Math.hypot(dx, dy);
      if (d > 0.5) { const adim = Math.min(d, p.hiz * dt); p.x += (dx / d) * adim; p.y += (dy / d) * adim; p.kosu = true; if (Math.abs(dx) > 0.3) p.ayna = dx > 0; }
      else p.kosu = false;
    }
    // Top
    if (top.ucus) {
      const u = top.ucus; u.t += dt / u.sure;
      const t = Math.min(1, u.t);
      top.x = u.x0 + (u.x1 - u.x0) * t; top.y = u.y0 + (u.y1 - u.y0) * t; top.z = Math.sin(t * Math.PI) * u.h;
      if (u.t >= 1) { top.ucus = null; top.z = 0; }
    } else if (top.sahip) { top.x = top.sahip.x + (top.sahip.ayna ? 5 : -5); top.y = top.sahip.y + 6; }
    if (bagir) { bagir.kalan -= dt; if (bagir.kalan <= 0) bagir = null; }
    balonlar.forEach((b) => (b.sure -= dt));
    balonlar = balonlar.filter((b) => b.sure > 0);
    if (Math.random() < dt * 0.06 && !bagir) bagir = { metin: ["Tek dokunuş!", "Topu bekleme!", "Gözünü kaldır!", "Daha hızlı!", "Konuşun birbirinizle!"][Math.floor(Math.random() * 5)], kalan: 1.6 };
  }

  function rondoGuncelle(dt) {
    const r = rondo;
    r.t += dt / r.sure;
    const a = r.dis[r.sahip], b = r.dis[r.hedef];
    if (r.kesildi) {
      r.kesildi -= dt;
      if (r.kesildi <= 0) { r.kesildi = 0; r.t = 0; }
      return;
    }
    if (r.t >= 1) {
      r.sahip = r.hedef;
      r.pasSay++;
      let yeni;
      do { yeni = Math.floor(Math.random() * 5); } while (yeni === r.sahip);
      r.hedef = yeni; r.t = 0; r.sure = 0.45 + Math.random() * 0.3;
      // Oyunda: belli aralıklarla biri topu kaptırır
      if (r.kayiplar && r.pasSay % 6 === 0) {
        const k = r.kayiplar.shift();
        if (k) {
          const p = r.dis.find((x) => x.o && x.o.id === k.oyuncu) || r.dis[r.sahip];
          r.sahip = r.dis.indexOf(p);
          soyle(p, `${p.o.soyad} kaptırdı`);
          kaydet(`${p.o.soyad} topu kaptırdı`);
          r.kesildi = 0.9;
          top.x = r.orta[0].x + 5; top.y = r.orta[0].y + 6;
        } else if (!bitti) { bitti = true; setTimeout(() => bitince && bitince(), 600); }
      }
    } else {
      const t = r.t;
      top.x = a.x + (b.x - a.x) * t; top.y = a.y + 6 + (b.y - a.y) * t; top.z = Math.sin(t * Math.PI) * 3;
    }
    for (const o of r.dis) o.ayna = top.x > o.x;
    r.orta.forEach((o, i) => {
      const hx = top.x + (i ? 8 : -8), hy = top.y - 6;
      const dx = hx - o.x, dy = hy - o.y, m = Math.hypot(dx, dy);
      if (m > 1) { o.x += (dx / m) * o.hiz * dt; o.y += (dy / m) * o.hiz * dt; o.ayna = dx > 0; o.kosu = true; } else o.kosu = false;
    });
  }

  function slalomGuncelle(dt) {
    const s = slalom; s.t += dt;
    const ilerleme = (s.t * 22) % 110;
    s.p.x = 34 + ilerleme; s.p.y = 148 + Math.sin(ilerleme / 10) * 7; s.p.ayna = true; s.p.kosu = true;
  }

  // ---------- Çizim ----------
  function saha(ctx) {
    KAYNAK.doseme(ctx, "sehir", 0, 24, 0, 0, G / T, Y / T);
    ctx.fillStyle = "rgba(0,0,0,0.06)";
    for (let x = 16; x < 304; x += 32) ctx.fillRect(x, 24, 16, 144);
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    const c = (x, y, w, h) => ctx.fillRect(x, y, w, h);
    c(16, 24, 288, 1); c(16, 167, 288, 1); c(16, 24, 1, 144); c(303, 24, 1, 144); c(160, 24, 1, 144);
    for (let a = 0; a < Math.PI * 2; a += 0.05) c(Math.round(160 + Math.cos(a) * 22), Math.round(96 + Math.sin(a) * 22), 1, 1);
    c(16, 64, 30, 1); c(16, 127, 30, 1); c(46, 64, 1, 64);
    ctx.fillStyle = "#f2f2f2"; ctx.fillRect(10, 84, 2, 24); ctx.fillRect(10, 84, 7, 2); ctx.fillRect(10, 106, 7, 2);
    ctx.fillStyle = "rgba(255,255,255,0.25)";
    for (let y = 86; y < 106; y += 3) ctx.fillRect(12, y, 5, 1);
    for (let x = 0; x < G; x += T) KAYNAK.karo(ctx, "sehir", 17, 18, x, 4);
    [8, 40, 88, 232, 268, 300].forEach((x, i) => KAYNAK.karo(ctx, "sehir", 31 + (i % 3), 13, x - 8, 2));
    if (mod === "rondo" && !veri) for (let i = 0; i < 6; i++) KAYNAK.karo(ctx, "sehir", 14, 18, 44 + i * 18, 142);
    if (mod === "kondisyon") for (let i = 0; i < 8; i++) { KAYNAK.karo(ctx, "sehir", 14, 18, 32, 32 + i * 15); KAYNAK.karo(ctx, "sehir", 14, 18, 288, 32 + i * 15); }
    KAYNAK.karo(ctx, "sehir", 15, 15, 196, 170); KAYNAK.karo(ctx, "sehir", 16, 15, 212, 170); KAYNAK.karo(ctx, "sehir", 17, 15, 228, 170);
    KAYNAK.karo(ctx, "sehir", 29, 8, 252, 170);
  }

  function ciz(ctx) {
    saha(ctx);
    for (const o of [...kisiler].sort((a, b) => a.y - b.y)) {
      ctx.fillStyle = "rgba(0,0,0,0.22)";
      ctx.fillRect(Math.round(o.x) - 5, Math.round(o.y) + 7, 10, 2);
      const zip = o.kosu ? Math.round(Math.abs(Math.sin(sure * 14 + o.x)) * 1.5) : Math.round(Math.sin(sure * 3 + o.x) * 0.5);
      ctx.save();
      if (o.ayna) { ctx.translate(Math.round(o.x) + 8, 0); ctx.scale(-1, 1); ctx.drawImage(o.img, 0, Math.round(o.y) - 8 - zip); }
      else ctx.drawImage(o.img, Math.round(o.x) - 8, Math.round(o.y) - 8 - zip);
      ctx.restore();
    }
    const tx = Math.round(top.x), ty = Math.round(top.y);
    ctx.fillStyle = "rgba(0,0,0,0.25)"; ctx.fillRect(tx - 1, ty + 2, 3, 1);
    ctx.fillStyle = "#ffffff"; ctx.fillRect(tx - 1, ty - Math.round(top.z) - 1, 3, 3);
    ctx.fillStyle = "#3a3a3a"; ctx.fillRect(tx, ty - Math.round(top.z), 1, 1);
    if (slalom) {
      const sx = Math.round(slalom.p.x + 6), sy = Math.round(slalom.p.y + 7);
      ctx.fillStyle = "#ffffff"; ctx.fillRect(sx - 1, sy - 1, 3, 3); ctx.fillStyle = "#3a3a3a"; ctx.fillRect(sx, sy, 1, 1);
    }
  }

  function balon() {
    const b = balonlar.map((x) => ({ x: x.p.x, y: x.p.y - 12, metin: x.metin }));
    if (bagir && hoca) b.push({ x: hoca.x, y: hoca.y - 12, metin: bagir.metin });
    return b;
  }

  return {
    ad: "Antrenman", alt: "Salı sabahı · Rondo ve top sürme",
    kur, baslat, guncelle, ciz, balon,
    hizAyarla: (h) => { carpan = h; },
    bittiMi: () => bitti,
  };
})();

// Antrenman ekranının sahneye kayıt düşmesi için (hafta.js doldurur)
const ANTRENMAN_EKRANI = { kayit: null };
