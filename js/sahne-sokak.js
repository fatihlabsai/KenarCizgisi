// Gündüz sokak sahnesi: Lale Sokak'ın bir parçası. Menajerin oturduğu apartman, karşıda park, geçen arabalar ve yayalar.
// Zemin ve binalar yürünebilir şehrin aynısı (SAHNE_DUNYA.tamResim), üstüne arabalar ve insanlar çizilir.
const SAHNE_SOKAK = (() => {
  const T = 16, G = 320, Y = 192;
  const OX = 0, OY = 3 * T; // Lale Sokak'ın 3–14. satırları görünür
  let arabalar = [], yayalar = [], menajer, sure = 0, resim = null, resimAy = 0;

  function kur() {
    // Üst şerit (11. satır) sola, alt şerit (13. satır) sağa gider
    arabalar = [
      { x: -40, satir: 13, hiz: 36, renk: "taksi" },
      { x: 190, satir: 13, hiz: 36, renk: "mavi" },
      { x: 300, satir: 11, hiz: -30, renk: "kirmizi" },
    ];
    // Yayalar: Urban paketinin yürüyen kasabalıları (kare satırı = kişi × 3)
    yayalar = [
      { x: 40, y: 9.4, hiz: 11, kisi: 1 },
      { x: 270, y: 10.1, hiz: -9, kisi: 2 },
    ];
    menajer = { x: 5 * T + 8, y: 10 * T + 4, img: KARAKTER.yap({ ten: 1, ust: [14, 5], sort: 0, ayakkabi: 0, sac: [19, 4], sakal: [21, 6] }) };
  }

  function guncelle(dt) {
    sure += dt;
    for (const a of arabalar) {
      a.x += a.hiz * dt;
      if (a.hiz > 0 && a.x > G + 20) a.x -= G + 100;
      if (a.hiz < 0 && a.x < -60) a.x += G + 100;
    }
    for (const p of yayalar) {
      p.x += p.hiz * dt;
      if (p.x > G + 10) p.x = -10;
      if (p.x < -10) p.x = G + 10;
    }
  }

  function ciz(ctx) {
    // Ağaçlar mevsime göre: ay değişince resim yeniden çizilir
    const ay = S ? Number(S.tarih.slice(5, 7)) : 8;
    if (!resim || ay !== resimAy) { resim = SAHNE_DUNYA.tamResim("lale", ay); resimAy = ay; }
    ctx.drawImage(resim, -OX, -OY);

    const kisiler = [
      ...yayalar.map((p) => ({ ayak: p.y * T + 8 - OY, ciz: () => {
        const kare = 1 + (Math.floor(sure * 6 + p.kisi) % 2);
        KAYNAK.karo(ctx, "urban", 23, p.kisi * 3 + kare, Math.round(p.x) - 8, Math.round(p.y * T - OY) - 8, p.hiz > 0);
      } })),
      { ayak: menajer.y + 8 - OY, ciz: () => ctx.drawImage(menajer.img, menajer.x - 8 - OX, menajer.y - 8 - OY) },
      ...arabalar.map((a) => ({ ayak: (a.satir + 1) * T - OY, ciz: () => ctx.drawImage(SAHNE_DUNYA.arabaResmi(a.renk, a.hiz > 0 ? "sag" : "sol"), Math.round(a.x), a.satir * T - OY) })),
    ];
    for (const k of kisiler.sort((a, b) => a.ayak - b.ayak)) k.ciz();
  }

  function balon() { return null; }
  const menajerAyarla = (img) => { if (menajer) menajer.img = img; };

  return { ad: "Sokak", alt: "Kalvar, Lale Sokak", kur, guncelle, ciz, balon, menajerAyarla };
})();
