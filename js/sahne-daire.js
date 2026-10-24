// Deneme: menajerin ilk evi. Kalvar'da kiralık, tek odalı küçük bir daire.
// Oda dört köşeye ayrılıyor: sol üstte mutfak, sağ üstte yatak, solda yemek masası, sağ altta oturma köşesi.
const SAHNE_DAIRE = (() => {
  const T = 16;
  let menajer, sure = 0;

  function kur() {
    menajer = { x: 10 * T + 8, y: 7 * T + 4, img: KARAKTER.yap({ ten: 1, ust: [10, 0], ustRenk: "#6b6f78", sort: 0, ayakkabi: 0, sac: [19, 4], sakal: [21, 6] }) };
  }

  function guncelle(dt) { sure += dt; }

  function ciz(ctx) {
    ctx.fillStyle = "#14161c"; ctx.fillRect(0, 0, 320, 192);
    // Oda: 12×8 karo; üstteki iki satır duvar, kalanı zemin
    const ox = 4, oy = 2, gen = 12, yuk = 8;
    KAYNAK.doseme(ctx, "sehir", 3, 19, ox, oy + 2, gen, yuk - 2);
    for (let x = 0; x < gen; x++) {
      KAYNAK.karo(ctx, "sehir", 9, 5, (ox + x) * T, oy * T);
      KAYNAK.karo(ctx, "sehir", 9, 9, (ox + x) * T, (oy + 1) * T);
    }
    ctx.fillStyle = "#3b3026";
    ctx.fillRect(ox * T - 3, oy * T - 3, gen * T + 6, 3); ctx.fillRect(ox * T - 3, (oy + yuk) * T, gen * T + 6, 3);
    ctx.fillRect(ox * T - 3, oy * T - 3, 3, yuk * T + 6); ctx.fillRect((ox + gen) * T, oy * T - 3, 3, yuk * T + 6);

    const k = (s, r, x, y, ayna) => KAYNAK.karo(ctx, "ic", s, r, (ox + x) * T, (oy + y) * T, ayna);

    // Mutfak (sol üst): buzdolabı, tezgâh, ocak; hepsi duvara dayalı
    k(10, 12, 0, 1); k(10, 13, 0, 2);
    k(0, 12, 1, 2); k(5, 12, 2, 2); k(14, 14, 3, 2);

    // Yemek masası (sol orta): iki kişilik masa, iki yanda sandalye
    k(0, 0, 2, 4); k(1, 0, 3, 4); k(0, 1, 2, 5); k(1, 1, 3, 5);
    k(2, 2, 1, 4); k(2, 2, 4, 4, true);

    // Yatak köşesi (sağ üst): dolap ve yatak
    k(25, 8, 11, 1); k(25, 9, 11, 2);
    k(12, 6, 10, 2);

    // Oturma köşesi (sağ alt): halı ve koltuk
    k(16, 8, 8, 6); k(17, 8, 9, 6); k(18, 8, 10, 6); k(16, 9, 8, 7); k(17, 9, 9, 7); k(18, 9, 10, 7);
    k(21, 4, 9, 6);

    // Süs: duvarda tablo, köşede saksı
    k(19, 12, 6, 0); k(20, 12, 7, 0);
    k(16, 0, 0, 7);

    // Menajer
    const zip = Math.round(Math.sin(sure * 2) * 0.5);
    ctx.fillStyle = "rgba(0,0,0,0.2)"; ctx.fillRect(menajer.x - 4, menajer.y + 7, 8, 2);
    ctx.drawImage(menajer.img, menajer.x - 8, menajer.y - 8 - zip);
  }

  // Balondaki yazıyı oyun belirler (hesap, maaş günü gibi)
  let metin = null;
  const metinAyarla = (fn) => { metin = fn; };
  const menajerAyarla = (img) => { if (menajer) menajer.img = img; };
  function balon() { return metin ? { x: menajer.x, y: menajer.y - 12, metin: metin() } : null; }

  return { ad: "Ev", alt: "Kalvar · Kiralık tek oda", kur, guncelle, ciz, balon, metinAyarla, menajerAyarla };
})();
