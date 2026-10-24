// Deneme: antrenman sahası. Ortada rondo, solda konilerle top sürme, kenarda teknik direktör.
const SAHNE_ANTRENMAN = (() => {
  const T = 16, G = 320, Y = 192;
  const FORMA = "#c8a640", SORT = "#2b2f3a";   // Kalvar Spor: hardal sarısı, lacivert
  const YELEK = "#d9532c";                      // ortadaki iki kişi turuncu yelekli
  let oyuncular = [], top, rondo, slalom, hoca, sure = 0, bagir = null;

  function kur() {
    const rnd = KARAKTER.tohumlu(1932);
    const merkez = { x: 172, y: 92 }, yaricap = 34;
    // Rondo: dışarıda beş kişi, ortada iki kişi
    const dis = [];
    for (let i = 0; i < 5; i++) {
      const a = -Math.PI / 2 + i * (Math.PI * 2 / 5);
      const x = merkez.x + Math.cos(a) * yaricap, y = merkez.y + Math.sin(a) * yaricap * 0.8;
      dis.push({ x, y, ev: { x, y }, img: KARAKTER.futbolcu(rnd, FORMA, SORT), ayna: Math.cos(a) > 0 });
    }
    const orta = [0, 1].map((i) => ({
      x: merkez.x - 6 + i * 12, y: merkez.y, img: KARAKTER.futbolcu(rnd, YELEK, SORT), ayna: false, hiz: 26 + i * 6,
    }));
    rondo = { dis, orta, sahip: 0, hedef: 1, t: 0, sure: 0.55, merkez };
    // Slalom: konilerin arasından top süren bir oyuncu
    slalom = { kisi: { x: 40, y: 150, img: KARAKTER.futbolcu(rnd, FORMA, SORT), ayna: false }, t: 0 };
    hoca = { x: 150, y: 168, img: KARAKTER.yap({ ten: 1, ust: [14, 5], sort: 0, ayakkabi: 0, sac: [19, 4], sakal: [21, 6] }), ayna: false };
    oyuncular = [...dis, ...orta, slalom.kisi, hoca];
    top = { x: dis[0].x, y: dis[0].y + 6, z: 0 };
  }

  function guncelle(dt) {
    sure += dt;
    // Pas: top bir oyuncudan diğerine yayla gider
    const r = rondo;
    r.t += dt / r.sure;
    const a = r.dis[r.sahip], b = r.dis[r.hedef];
    if (r.t >= 1) {
      r.sahip = r.hedef;
      let yeni;
      do { yeni = Math.floor(Math.random() * 5); } while (yeni === r.sahip);
      r.hedef = yeni; r.t = 0; r.sure = 0.45 + Math.random() * 0.3;
      // Ara sıra hoca bağırır
      if (Math.random() < 0.18) bagir = { metin: ["Tek dokunuş!", "Topu bekleme!", "Gözünü kaldır!", "Daha hızlı!"][Math.floor(Math.random() * 4)], kalan: 1.6 };
    } else {
      const t = r.t;
      top.x = a.x + (b.x - a.x) * t;
      top.y = a.y + 6 + (b.y - a.y) * t;
      top.z = Math.sin(t * Math.PI) * 3;
    }
    // Pası alacak olan oyuncu topa döner
    for (const o of r.dis) o.ayna = top.x > o.x;
    // Ortadaki ikili topun peşinden koşar
    r.orta.forEach((o, i) => {
      const hx = top.x + (i ? 8 : -8), hy = top.y - 6;
      const dx = hx - o.x, dy = hy - o.y, m = Math.hypot(dx, dy);
      if (m > 1) { o.x += (dx / m) * o.hiz * dt; o.y += (dy / m) * o.hiz * dt; o.ayna = dx > 0; o.kosuyor = true; }
      else o.kosuyor = false;
    });
    // Slalom: sağa doğru zikzak, sonra baştan
    const s = slalom;
    s.t += dt;
    const ilerleme = (s.t * 22) % 110;
    s.kisi.x = 34 + ilerleme;
    s.kisi.y = 148 + Math.sin(ilerleme / 10) * 7;
    s.kisi.ayna = true; s.kisi.kosuyor = true;
    if (bagir) { bagir.kalan -= dt; if (bagir.kalan <= 0) bagir = null; }
  }

  function saha(ctx) {
    KAYNAK.doseme(ctx, "sehir", 0, 24, 0, 0, G / T, Y / T);
    // Biçilmiş çim şeritleri
    ctx.fillStyle = "rgba(0,0,0,0.06)";
    for (let x = 16; x < 304; x += 32) ctx.fillRect(x, 24, 16, 144);
    // Çizgiler
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    const cizgi = (x, y, w, h) => ctx.fillRect(x, y, w, h);
    cizgi(16, 24, 288, 1); cizgi(16, 167, 288, 1); cizgi(16, 24, 1, 144); cizgi(303, 24, 1, 144);
    cizgi(160, 24, 1, 144);
    for (let a = 0; a < Math.PI * 2; a += 0.05) cizgi(Math.round(160 + Math.cos(a) * 22), Math.round(96 + Math.sin(a) * 22), 1, 1);
    cizgi(16, 64, 30, 1); cizgi(16, 127, 30, 1); cizgi(46, 64, 1, 64);   // ceza sahası
    // Kale
    ctx.fillStyle = "#f2f2f2"; ctx.fillRect(10, 84, 2, 24); ctx.fillRect(10, 84, 7, 2); ctx.fillRect(10, 106, 7, 2);
    ctx.fillStyle = "rgba(255,255,255,0.25)";
    for (let y = 86; y < 106; y += 3) ctx.fillRect(12, y, 5, 1);
  }

  function cevre(ctx) {
    // Üstte ağaçlar ve tel örgü, altta yedek kulübesi ve koniler
    for (let x = 0; x < G; x += T) KAYNAK.karo(ctx, "sehir", 17, 18, x, 4);
    [8, 40, 88, 232, 268, 300].forEach((x, i) => KAYNAK.karo(ctx, "sehir", 31 + (i % 3), 13, x - 8, 2));
    for (let i = 0; i < 6; i++) KAYNAK.karo(ctx, "sehir", 14, 18, 44 + i * 18, 142);
    KAYNAK.karo(ctx, "sehir", 15, 15, 196, 170); KAYNAK.karo(ctx, "sehir", 16, 15, 212, 170); KAYNAK.karo(ctx, "sehir", 17, 15, 228, 170);
    KAYNAK.karo(ctx, "sehir", 29, 8, 252, 170);   // su sebili
  }

  function golge(ctx, x, y) {
    ctx.fillStyle = "rgba(0,0,0,0.22)";
    ctx.fillRect(Math.round(x) - 5, Math.round(y) + 7, 10, 2);
    ctx.fillRect(Math.round(x) - 4, Math.round(y) + 9, 8, 1);
  }

  function ciz(ctx) {
    saha(ctx);
    cevre(ctx);
    // Arkadakiler önce çizilir
    const liste = [...oyuncular].sort((a, b) => a.y - b.y);
    for (const o of liste) {
      golge(ctx, o.x, o.y);
      const zip = o.kosuyor ? Math.round(Math.abs(Math.sin(sure * 14 + o.x)) * 1.5) : Math.round(Math.sin(sure * 3 + o.x) * 0.5);
      ctx.save();
      if (o.ayna) { ctx.translate(Math.round(o.x) + 8, 0); ctx.scale(-1, 1); ctx.drawImage(o.img, 0, Math.round(o.y) - 8 - zip); }
      else ctx.drawImage(o.img, Math.round(o.x) - 8, Math.round(o.y) - 8 - zip);
      ctx.restore();
    }
    // Top
    const tx = Math.round(top.x), ty = Math.round(top.y);
    ctx.fillStyle = "rgba(0,0,0,0.25)"; ctx.fillRect(tx - 1, ty + 2, 3, 1);
    ctx.fillStyle = "#ffffff"; ctx.fillRect(tx - 1, ty - Math.round(top.z) - 1, 3, 3);
    ctx.fillStyle = "#3a3a3a"; ctx.fillRect(tx, ty - Math.round(top.z), 1, 1);
    // Slalomdaki oyuncunun topu
    const sx = Math.round(slalom.kisi.x + 6), sy = Math.round(slalom.kisi.y + 7);
    ctx.fillStyle = "#ffffff"; ctx.fillRect(sx - 1, sy - 1, 3, 3); ctx.fillStyle = "#3a3a3a"; ctx.fillRect(sx, sy, 1, 1);
  }

  function balon() { return bagir ? { x: hoca.x, y: hoca.y - 12, metin: bagir.metin } : null; }

  return { ad: "Antrenman", alt: "Salı sabahı · Rondo ve top sürme", kur, guncelle, ciz, balon };
})();
