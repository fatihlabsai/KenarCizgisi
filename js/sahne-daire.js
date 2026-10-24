// Deneme: menajerin ilk evi. Kalvar'da kiralık, tek odalı küçük bir daire.
const SAHNE_DAIRE = (() => {
  const T = 16;
  let menajer, sure = 0;

  function kur() {
    menajer = { x: 166, y: 112, img: KARAKTER.yap({ ten: 1, ust: [10, 0], ustRenk: "#6b6f78", sort: 0, ayakkabi: 0, sac: [19, 4], sakal: [21, 6] }) };
  }

  function guncelle(dt) { sure += dt; }

  function ciz(ctx) {
    ctx.fillStyle = "#14161c"; ctx.fillRect(0, 0, 320, 192);
    // Oda: 12×8 karo; üstte duvar, altta ahşap zemin
    const ox = 4, oy = 2, gen = 12, yuk = 8;
    KAYNAK.doseme(ctx, "sehir", 3, 19, ox, oy + 2, gen, yuk - 2);
    for (let x = 0; x < gen; x++) {
      KAYNAK.karo(ctx, "sehir", 9, 5, (ox + x) * T, oy * T);
      KAYNAK.karo(ctx, "sehir", 9, 9, (ox + x) * T, (oy + 1) * T);
    }
    // Çerçeve
    ctx.fillStyle = "#3b3026";
    ctx.fillRect(ox * T - 3, oy * T - 3, gen * T + 6, 3); ctx.fillRect(ox * T - 3, (oy + yuk) * T, gen * T + 6, 3);
    ctx.fillRect(ox * T - 3, oy * T - 3, 3, yuk * T + 6); ctx.fillRect((ox + gen) * T, oy * T - 3, 3, yuk * T + 6);

    const k = (s, r, x, y) => KAYNAK.karo(ctx, "ic", s, r, (ox + x) * T, (oy + y) * T);
    // Mutfak köşesi
    k(0, 12, 0, 2); k(5, 12, 1, 2); k(4, 12, 2, 2); k(14, 14, 3, 2); k(14, 15, 3, 3);
    k(10, 12, 4, 1); k(10, 13, 4, 2);
    // Yatak, dolap
    k(12, 6, 10, 2); k(21, 5, 9, 2); k(25, 8, 11, 1); k(25, 9, 11, 2);
    // Masa, sandalye
    k(0, 0, 4, 4); k(1, 0, 5, 4); k(0, 1, 4, 5); k(1, 1, 5, 5);
    k(2, 2, 3, 4); k(2, 3, 3, 5);
    // Halı ve koltuklar
    k(16, 8, 7, 5); k(17, 8, 8, 5); k(18, 8, 9, 5); k(16, 9, 7, 6); k(17, 9, 8, 6); k(18, 9, 9, 6);
    k(21, 4, 7, 5); k(22, 4, 9, 5);
    k(4, 6, 1, 6); k(5, 6, 2, 6);
    // Saksı, tablo
    k(16, 0, 0, 7); k(19, 12, 7, 0); k(20, 12, 8, 0);

    // Menajer
    const zip = Math.round(Math.sin(sure * 2) * 0.5);
    ctx.fillStyle = "rgba(0,0,0,0.2)"; ctx.fillRect(menajer.x - 4, menajer.y + 7, 8, 2);
    ctx.drawImage(menajer.img, menajer.x - 8, menajer.y - 8 - zip);
  }

  function balon() { return { x: menajer.x, y: menajer.y - 12, metin: "Hesap: ₡1.840 · Maaşa 9 gün var" }; }

  return { ad: "Ev", alt: "Kalvar · Kiralık tek oda", kur, guncelle, ciz, balon };
})();
