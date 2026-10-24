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

  // tarif: { ten: 0–2, ust: [s, r], ustRenk, sort: satır, sortRenk, ayakkabi: satır, sac: [s, r], sakal: [s, r] }
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
    ekle(0, tarif.ten || 0);
    ekle(3, tarif.sort ?? 0, tarif.sortRenk);
    ekle(4, tarif.ayakkabi ?? 0);
    if (tarif.ust) ekle(tarif.ust[0], tarif.ust[1], tarif.ustRenk);
    if (tarif.sakal) ekle(tarif.sakal[0], tarif.sakal[1]);
    if (tarif.sac) ekle(tarif.sac[0], tarif.sac[1]);
    onbellek.set(anahtar, c);
    return c;
  }

  // Rastgele bir futbolcu: forma rengi kulüpten, gerisi kişiye özgü.
  const SACLAR = [[19, 0], [20, 0], [23, 0], [19, 4], [21, 4], [23, 4], [19, 5], [23, 5], [19, 8], [21, 8], [22, 0], [24, 4]];
  const SAKALLAR = [null, null, null, null, [19, 6], [21, 6], [19, 7]];
  function futbolcu(rnd, forma, sortRengi) {
    const al = (a) => a[Math.floor(rnd() * a.length)];
    return yap({
      ten: Math.floor(rnd() * 3),
      ust: [10, 0], ustRenk: forma,
      sort: 2, sortRenk: sortRengi,
      ayakkabi: 0,
      sac: al(SACLAR), sakal: al(SAKALLAR),
    });
  }

  // Basit, tekrarlanabilir rastgele sayı üreteci (aynı tohum → aynı sonuç).
  function tohumlu(tohum) {
    let s = tohum >>> 0;
    return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  }

  return { yap, futbolcu, tohumlu };
})();
