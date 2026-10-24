// Kenney karakter parçalarını üst üste koyarak kişi oluşturur.
// Parçalar: ten (0. sütun), şort (3), ayakkabı (4), üst (6–17), saç ve sakal (19–26).
const KARAKTER = (() => {
  const T = 16;
  const onbellek = new Map();

  // "#c23b22" → [194, 59, 34]
  function hex(h) {
    const n = parseInt(h.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }

  // Bir parçayı, açık-koyu tonlarını koruyarak yeni renge boyar.
  function boya(tuval, renk) {
    const ctx = tuval.getContext("2d");
    const v = ctx.getImageData(0, 0, T, T), d = v.data;
    const [hr, hg, hb] = hex(renk);
    let en = 1, ek = 0;
    for (let i = 0; i < d.length; i += 4) {
      if (!d[i + 3]) continue;
      const l = d[i] * 0.3 + d[i + 1] * 0.59 + d[i + 2] * 0.11;
      en = Math.min(en, l / 255); ek = Math.max(ek, l / 255);
    }
    for (let i = 0; i < d.length; i += 4) {
      if (!d[i + 3]) continue;
      const l = (d[i] * 0.3 + d[i + 1] * 0.59 + d[i + 2] * 0.11) / 255;
      const t = ek > en ? (l - en) / (ek - en) : 0.5; // 0 koyu, 1 açık
      const k = 0.55 + t * 0.6;                      // koyuda %55, açıkta %115
      d[i] = Math.min(255, hr * k); d[i + 1] = Math.min(255, hg * k); d[i + 2] = Math.min(255, hb * k);
    }
    ctx.putImageData(v, 0, 0);
    return tuval;
  }

  // tarif: { ten: satır, tenRenk, sort: satır, sortRenk, ayakkabi: satır, ayakkabiRenk, ust: [s, r], ustRenk, sakal: [s, r], sac: [s, r] }
  function yap(tarif) {
    const anahtar = JSON.stringify(tarif);
    if (onbellek.has(anahtar)) return onbellek.get(anahtar);
    const c = document.createElement("canvas");
    c.width = c.height = T;
    const ctx = c.getContext("2d");
    const ekle = (s, r, renk) => {
      const p = KAYNAK.kopya("kar", s, r);
      ctx.drawImage(renk ? boya(p, renk) : p, 0, 0);
    };
    ekle(0, tarif.ten || 0, tarif.tenRenk);
    ekle(3, tarif.sort ?? 0, tarif.sortRenk);
    ekle(4, tarif.ayakkabi ?? 0, tarif.ayakkabiRenk);
    if (tarif.ust) ekle(tarif.ust[0], tarif.ust[1], tarif.ustRenk);
    if (tarif.sakal) ekle(tarif.sakal[0], tarif.sakal[1]);
    if (tarif.sac) ekle(tarif.sac[0], tarif.sac[1]);
    onbellek.set(anahtar, c);
    return c;
  }

  // ---------- Görünüş kataloğu ----------
  // Kenney'de her saç rengi 4×4'lük bir blok. Bloğun içindeki yeri saçın modelini belirliyor.
  // Sakallar her bloğun son satırında, böylece sakal rengi saç rengini izliyor.
  const KATALOG = {
    ten: [
      { ad: "Açık", satir: 0 },
      { ad: "Buğday", satir: 1 },
      { ad: "Esmer", satir: 2 },
      { ad: "Pembe", satir: 0, renk: "#f2c4a8" },
      { ad: "Koyu", satir: 2, renk: "#8a5a3c" },
    ],
    sacRenk: [
      { ad: "Kahverengi", s: 19, r: 0 },
      { ad: "Kızıl", s: 23, r: 0 },
      { ad: "Sarı", s: 19, r: 4 },
      { ad: "Siyah", s: 23, r: 4 },
      { ad: "Beyaz", s: 19, r: 8 },
    ],
    sac: [
      { ad: "Kel", yer: null },
      { ad: "Kısa", yer: [0, 0] },
      { ad: "Yana taralı", yer: [0, 1] },
      { ad: "Gür", yer: [2, 2] },
      { ad: "Seyrek", yer: [3, 2] },
      { ad: "Topuz", yer: [1, 2] },
      { ad: "Omuz boyu", yer: [1, 0] },
      { ad: "Uzun", yer: [2, 1] },
      { ad: "Örgülü", yer: [1, 1] },
      { ad: "Uzun örgülü", yer: [3, 1] },
    ],
    sakal: [
      { ad: "Yok", yer: null },
      { ad: "Kısa sakal", yer: [0, 3] },
      { ad: "Bıyık", yer: [1, 3] },
      { ad: "Keçi sakalı", yer: [2, 3] },
      { ad: "Gür sakal", yer: [3, 3] },
    ],
    // Üst giyim: model, renk grubunun sol üst köşesine göre konum. Her model altı renkte var.
    ust: [
      { ad: "Tişört", yer: [0, 0] },
      { ad: "V yaka", yer: [2, 0] },
      { ad: "Polo", yer: [2, 2] },
      { ad: "Ceket, beyaz içlik", yer: [2, 1] },
      { ad: "Ceket, krem içlik", yer: [3, 1] },
      { ad: "Atlet", yer: [0, 1] },
    ],
    ustRenk: [
      { ad: "Siyah", s: 14, r: 5 },
      { ad: "Bej", s: 10, r: 5 },
      { ad: "Turkuaz", s: 10, r: 0 },
      { ad: "Turuncu", s: 6, r: 0 },
      { ad: "Yeşil", s: 6, r: 5 },
      { ad: "Lila", s: 14, r: 0 },
    ],
    alt: [
      { ad: "Lacivert", renk: "#2b3550" },
      { ad: "Siyah", renk: "#26262b" },
      { ad: "Kot mavisi", renk: "#4a6a96" },
      { ad: "Gri", renk: "#6d6f75" },
      { ad: "Kahverengi", renk: "#6b4a32" },
      { ad: "Bej", renk: "#b9a27a" },
    ],
    ayakkabi: [
      { ad: "Siyah", renk: "#2a2a2e" },
      { ad: "Kahverengi", renk: "#6a4128" },
      { ad: "Beyaz", renk: "#e6e6e6" },
    ],
  };

  const VARSAYILAN = { ten: 1, sac: 1, sacRenk: 0, sakal: 0, ust: 3, ustRenk: 0, alt: 0, ayakkabi: 0 };

  // Görünüş seçimlerini (sıra numaraları) çizim tarifine çevirir
  function gorunustenTarif(g) {
    const sec = (ad) => KATALOG[ad][Math.min(KATALOG[ad].length - 1, Math.max(0, g[ad] ?? VARSAYILAN[ad]))];
    const ten = sec("ten"), sr = sec("sacRenk"), sac = sec("sac"), sakal = sec("sakal"), ust = sec("ust"), ur = sec("ustRenk");
    return {
      ten: ten.satir, tenRenk: ten.renk,
      sort: 0, sortRenk: sec("alt").renk,
      ayakkabi: 0, ayakkabiRenk: sec("ayakkabi").renk,
      ust: [ur.s + ust.yer[0], ur.r + ust.yer[1]],
      sac: sac.yer && [sr.s + sac.yer[0], sr.r + sac.yer[1]],
      sakal: sakal.yer && [sr.s + sakal.yer[0], sr.r + sakal.yer[1]],
    };
  }

  const gorunus = (g) => yap(gorunustenTarif(g || VARSAYILAN));

  function rastgeleGorunus(rnd = Math.random) {
    const g = {};
    for (const ad of Object.keys(VARSAYILAN)) g[ad] = Math.floor(rnd() * KATALOG[ad].length);
    if (rnd() < 0.5) g.sakal = 0; // sakalsız olanlar biraz daha sık
    return g;
  }

  // Rastgele bir futbolcu: forma rengi kulüpten, yüzü ve saçı kişiye özgü.
  function futbolcu(rnd, forma, sortRengi) {
    const al = (a) => a[Math.floor(rnd() * a.length)];
    const sr = al(KATALOG.sacRenk.slice(0, 4)), sac = al(KATALOG.sac.slice(0, 6)), sakal = rnd() < 0.7 ? KATALOG.sakal[0] : al(KATALOG.sakal);
    return yap({
      ten: Math.floor(rnd() * 3),
      ust: [10, 0], ustRenk: forma,
      sort: 2, sortRenk: sortRengi,
      ayakkabi: 0,
      sac: sac.yer && [sr.s + sac.yer[0], sr.r + sac.yer[1]],
      sakal: sakal.yer && [sr.s + sakal.yer[0], sr.r + sakal.yer[1]],
    });
  }

  // Kadrodaki bir oyuncunun formalı resmi. Kaleciler forma rengine göre koyu ya da yeşil giyer.
  // Kaleci forması saha oyuncularıyla karışmasın: açık yeşil, takımın kendi rengi yeşilse mavi
  function yesilMi(h) { const [r, g, b] = hex(h); return g > r + 25 && g > b; }
  function oyuncu(o, kulup) {
    const g = o.gorunus || {};
    const sec = (ad, v) => KATALOG[ad][Math.min(KATALOG[ad].length - 1, Math.max(0, v ?? 0))];
    const ten = sec("ten", g.ten), sr = sec("sacRenk", g.sacRenk), sac = sec("sac", g.sac), sakal = sec("sakal", g.sakal);
    const kaleci = o.mevki === "KL";
    const forma = kaleci ? (yesilMi(kulup.forma) ? "#3f8fd6" : "#8fd14f") : kulup.forma;
    return yap({
      ten: ten.satir, tenRenk: ten.renk,
      ust: [10, 0], ustRenk: forma,
      sort: 2, sortRenk: kaleci ? "#22252b" : kulup.sort,
      ayakkabi: 0,
      sac: sac.yer && [sr.s + sac.yer[0], sr.r + sac.yer[1]],
      sakal: sakal.yer && [sr.s + sakal.yer[0], sr.r + sakal.yer[1]],
    });
  }

  // Basit, tekrarlanabilir rastgele sayı üreteci (aynı tohum → aynı sonuç).
  function tohumlu(tohum) {
    let s = tohum >>> 0;
    return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  }

  return { yap, futbolcu, oyuncu, tohumlu, KATALOG, VARSAYILAN, gorunus, rastgeleGorunus, tarif: gorunustenTarif };
})();
