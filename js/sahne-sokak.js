// Deneme: Kalvar'da bir sokak. Menajerin oturduğu apartman, köşedeki kafe, geçen arabalar.
const SAHNE_SOKAK = (() => {
  const T = 16, G = 320, Y = 192;
  let arabalar = [], yayalar = [], menajer, sure = 0;

  // Bina: üstte çatı (yukarıdan görünüm), altta cephe.
  // cati: çatının başladığı sütun (0 kırmızı, 8 gri, 24 bej), duvar: cephe sütunu (0 tuğla, 4 gri, 8 bej)
  function bina(ctx, kx, ky, gen, catiYuk, katSay, cati, duvar) {
    for (let y = 0; y < catiYuk; y++)
      for (let x = 0; x < gen; x++) {
        const s = cati + (x === 0 ? 0 : x === gen - 1 ? 3 : 1 + (x % 2));
        const r = y === 0 ? 0 : y === catiYuk - 1 ? 3 : 1 + (y % 2);
        KAYNAK.karo(ctx, "sehir", s, r, (kx + x) * T, (ky + y) * T);
      }
    const cy = ky + catiYuk;
    for (let y = 0; y < katSay; y++)
      for (let x = 0; x < gen; x++) {
        const s = duvar + (x === 0 ? 0 : x === gen - 1 ? 3 : 2);
        const r = y === 0 ? 4 : y === katSay - 1 ? 9 : 5;
        KAYNAK.karo(ctx, "sehir", s, r, (kx + x) * T, (cy + y) * T);
      }
    return cy;
  }

  function kur() {
    const rnd = KARAKTER.tohumlu(7);
    // Kenney'de her arabanın iki çizimi var: 31–33. sütun sola, 34–36. sütun sağa bakıyor.
    // Satır: 16 yeşil, 20 gri, 24 turuncu. Üst şerit sola, alt şerit sağa gider.
    arabalar = [
      { x: -60, serit: "alt", hiz: 38, r: 16 },
      { x: 200, serit: "alt", hiz: 38, r: 20 },
      { x: 360, serit: "ust", hiz: -30, r: 24 },
    ];
    yayalar = [
      { x: 60, y: 118, hiz: 9, img: KARAKTER.yap({ ten: 2, ust: [6, 0], ustRenk: "#5a7d9a", sort: 0, ayakkabi: 0, sac: [23, 0] }) },
      { x: 250, y: 120, hiz: -7, img: KARAKTER.yap({ ten: 0, ust: [10, 0], ustRenk: "#8b5a7a", sort: 0, ayakkabi: 0, sac: [20, 0] }) },
    ];
    menajer = { x: 96, y: 116, img: KARAKTER.yap({ ten: 1, ust: [14, 5], sort: 0, ayakkabi: 0, sac: [19, 4], sakal: [21, 6] }) };
  }

  function guncelle(dt) {
    sure += dt;
    for (const a of arabalar) {
      a.x += a.hiz * dt;
      if (a.hiz > 0 && a.x > G + 20) a.x = -70 - Math.random() * 80;
      if (a.hiz < 0 && a.x < -70) a.x = G + 20 + Math.random() * 80;
    }
    for (const p of yayalar) {
      p.x += p.hiz * dt;
      if (p.x > G + 10) p.x = -10;
      if (p.x < -10) p.x = G + 10;
    }
  }

  function ciz(ctx) {
    // Zemin: kaldırım (0–7. satır), üç karoluk yol (8–10), alt kaldırım (11)
    KAYNAK.doseme(ctx, "sehir", 1, 20, 0, 0, G / T, 8);
    KAYNAK.doseme(ctx, "sehir", 11, 19, 0, 8, G / T, 3);
    for (let x = 0; x < G / T; x++) KAYNAK.karo(ctx, "sehir", 9, 19, x * T, 9 * T);
    KAYNAK.doseme(ctx, "sehir", 1, 20, 0, 11, G / T, 1);

    // Apartman (kırmızı tuğla), kafe (bej), gri iş hanı
    const a = bina(ctx, 1, 0, 7, 2, 5, 0, 0);
    for (let x = 0; x < 3; x++) for (let y = 0; y < 3; y++) KAYNAK.karo(ctx, "sehir", 25, 16, (2 + x * 2) * T, (a + y) * T + 2);
    KAYNAK.karo(ctx, "sehir", 20, 26, 4 * T, (a + 3) * T); KAYNAK.karo(ctx, "sehir", 20, 27, 4 * T, (a + 4) * T);

    const k = bina(ctx, 9, 1, 6, 2, 4, 24, 8);
    for (let x = 0; x < 6; x++) KAYNAK.karo(ctx, "sehir", 23 + (x % 4), 9, (9 + x) * T, (k + 1) * T);
    KAYNAK.karo(ctx, "sehir", 23, 21, 11 * T, (k + 2) * T); KAYNAK.karo(ctx, "sehir", 23, 22, 11 * T, (k + 3) * T);
    KAYNAK.karo(ctx, "sehir", 26, 16, 13 * T, (k + 2) * T);

    const g = bina(ctx, 16, 0, 4, 2, 5, 8, 4);
    for (let y = 0; y < 3; y++) { KAYNAK.karo(ctx, "sehir", 25, 19, 17 * T, (g + y) * T + 2); KAYNAK.karo(ctx, "sehir", 25, 19, 18 * T, (g + y) * T + 2); }

    // Sokak eşyaları
    KAYNAK.karo(ctx, "sehir", 1, 16, 8 * T, 5 * T); KAYNAK.karo(ctx, "sehir", 1, 17, 8 * T, 6 * T); KAYNAK.karo(ctx, "sehir", 1, 18, 8 * T, 7 * T);
    KAYNAK.karo(ctx, "sehir", 31, 11, 15 * T, 5 * T); KAYNAK.karo(ctx, "sehir", 31, 12, 15 * T, 6 * T);
    KAYNAK.karo(ctx, "sehir", 15, 14, 7 * T, 7 * T);
    KAYNAK.karo(ctx, "sehir", 16, 13, 15 * T, 7 * T);
    KAYNAK.karo(ctx, "sehir", 10, 18, 14 * T, 7 * T);

    // Yayalar ve menajer
    for (const p of [...yayalar, menajer].sort((a, b) => a.y - b.y)) {
      const zip = p.hiz ? Math.round(Math.abs(Math.sin(sure * 8 + p.x)) * 1) : 0;
      ctx.fillStyle = "rgba(0,0,0,0.2)"; ctx.fillRect(Math.round(p.x) - 4, Math.round(p.y) + 7, 8, 2);
      ctx.save();
      if (p.hiz > 0) { ctx.translate(Math.round(p.x) + 8, 0); ctx.scale(-1, 1); ctx.drawImage(p.img, 0, Math.round(p.y) - 8 - zip); }
      else ctx.drawImage(p.img, Math.round(p.x) - 8, Math.round(p.y) - 8 - zip);
      ctx.restore();
    }

    // Arabalar: çizim 3×2 karo, gövde alt karonun dibine oturuyor
    for (const c of arabalar) {
      const s = c.hiz > 0 ? 34 : 31;
      const ust = c.serit === "ust" ? 8 * T - 6 : 9 * T;
      for (let y = 0; y < 2; y++)
        for (let x = 0; x < 3; x++) KAYNAK.karo(ctx, "sehir", s + x, c.r + y, c.x + x * T, ust + y * T);
    }
  }

  function balon() { return { x: menajer.x, y: menajer.y - 12, metin: "Ev: Lale Sk. No 4, kira ₡620" }; }

  return { ad: "Sokak", alt: "Kalvar, Lale Sokak · Akşam", kur, guncelle, ciz, balon };
})();
