// Kalvar şehrinin haritası: bölgeler (sokaklar) ve iç mekânlar. Sadece veri; çizimi sahne-dunya.js yapar.
// Koordinatlar karo cinsinden (16 piksel). Sokaklar RPG Urban Pack ("urban" sayfası), iç mekânlar Roguelike Indoors ile çizilir.
// Binaların cephesi güneye bakar, kapıya alttaki kaldırımdan girilir.
const SEHIR = (() => {
  const Z = {
    tas: ["sehir", 3, 19], mavitas: ["sehir", 6, 19], // iç mekân zeminleri
    cim: ["urban", 1, 1], kaldirim: ["urban", 9, 1], bej: ["urban", 1, 4], asfalt: ["urban", 9, 16],
  };
  // Kenarlı alanların (3×3) sol üst köşesi: çim, bej taş, gri kaldırım, gri çatı, su
  const BLOK = { cim: [0, 0], bej: [0, 3], kaldirim: [8, 0], griCati: [8, 3], su: [8, 6] };

  function yeniBolge(id, ad, gen, yuk, zemin = "cim") {
    return {
      id, ad, gen, yuk, ic: false,
      zemin: Array.from({ length: yuk }, () => Array(gen).fill(Z[zemin])),
      engel: Array.from({ length: yuk }, () => Array(gen).fill(false)),
      yapilar: [], nesneler: [], kapilar: [], cikislar: [], isiklar: [], yollar: [], noktalar: {}, gezinti: [],
    };
  }
  const doldur = (b, x, y, w, h, z) => { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) if (b.zemin[j] && i >= 0 && i < b.gen) b.zemin[j][i] = Z[z] || z; };
  const engelle = (b, x, y, w = 1, h = 1) => { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) if (b.engel[j] && i >= 0 && i < b.gen) b.engel[j][i] = true; };

  // Kenarlı alan. Bölge boyunca uzanan kaldırımda yan kenarlar kapatılır.
  function alan(b, x, y, w, h, blok, { ust = true, alt = true, sol = true, sag = true } = {}) {
    const [c0, r0] = BLOK[blok];
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
      const c = c0 + (sol && i === 0 ? 0 : sag && i === w - 1 ? 2 : 1);
      const r = r0 + (ust && j === 0 ? 0 : alt && j === h - 1 ? 2 : 1);
      if (b.zemin[y + j] && x + i >= 0 && x + i < b.gen) b.zemin[y + j][x + i] = ["urban", c, r];
    }
    if (blok === "su") engelle(b, x, y, w, h);
  }
  const kaldirim = (b, y, h, ust, alt) => alan(b, 0, y, b.gen, h, "kaldirim", { ust, alt, sol: false, sag: false });

  // Üç karoluk yol: üst şeritte arabalar sola, alt şeritte sağa gider, ortada kesik çizgi. Geçitlerde yaya çizgileri.
  function yol(b, y, gecitler = []) {
    for (let i = 0; i < b.gen; i++) {
      b.zemin[y][i] = (i * 7 + y) % 5 === 0 ? ["urban", 9, 17] : Z.asfalt;
      b.zemin[y + 1][i] = ["urban", 1, 16];
      b.zemin[y + 2][i] = (i * 3 + y) % 7 === 0 ? ["urban", 9, 17] : Z.asfalt;
    }
    for (const x of gecitler) for (let j = 0; j < 3; j++) b.zemin[y + j][x] = ["urban", 0, 15 + j];
    b.yollar.push(y);
  }

  // Bina. cati: çatı satırı (en az 2). kat: kat sayısı; her kat bir satır, zemin katın üstünde bir silme var.
  // taban: kapının olduğu kaldırım satırı, binanın alt satırı bunun bir üstü.
  // tur: kirmizi / turuncu (çerçeveli tuğla), kirmiziSade / turuncuSade. kolon: köşelerde sütun.
  function bina(b, { x, taban = 9, gen, cati = 2, kat = 2, tur = "kirmizi", catiTur, kapi, pencere = "kare", kapiTur = "ahsap", tente, tabela, kolon = false, vitrin = false }) {
    const satirlar = [0, ...Array(Math.max(0, kat - 2)).fill(2), 1, 3];
    const y = taban - cati - satirlar.length;
    b.yapilar.push({
      tip: "bina", x, y, gen, cati, satirlar, tur, catiTur: catiTur || (tur.startsWith("kirmizi") ? "bej" : "griCati"),
      pencere, tente, tabela, kolon, vitrin, kapi: kapi && { ...kapi, tur: kapiTur },
    });
    engelle(b, x, y, gen, cati + satirlar.length);
    if (kapi) b.kapilar.push({ x: kapi.x, y: taban, ad: kapi.ad, hedef: kapi.hedef, bina: true });
  }

  // Ağaç türleri: 0 uzun, 1 kısa, 2 saksıda uzun, 3 saksıda kısa (iki karo); 4 çalı, 5 fidan, 6 yuvarlak ağaççık (tek karo).
  // İki karoluk ağaçta sadece gövde engeldir.
  function agac(b, x, y, tur = 0) { b.nesneler.push({ tip: "agac", x, y, tur }); engelle(b, x, tur >= 4 ? y : y + 1); }
  // Üç ağaçlık koru (3×3)
  function koru(b, x, y) { b.nesneler.push({ tip: "koru", x, y }); engelle(b, x, y + 1, 3, 2); }
  // Lamba iki karo boyunda, ayağı engel. "sokak": çift kollu, "park": yeşil fener
  function lamba(b, x, y, tur = "sokak") { b.nesneler.push({ tip: "lamba", x, y, tur }); engelle(b, x, y + 1); b.isiklar.push({ x: x * 16 + 8, y: y * 16 + 3, r: 36 }); }
  function bank(b, x, y, tur = "ahsap") { b.nesneler.push({ tip: "karo", x, y, karolar: [tur === "tas" ? [0, 10] : [7, 9]] }); engelle(b, x, y); }
  function karo(b, x, y, s, r, engel = true) { b.nesneler.push({ tip: "karo", x, y, karolar: [[s, r]] }); if (engel) engelle(b, x, y); }
  function uzun(b, x, y, s, r, yuk, engel = true) { b.nesneler.push({ tip: "dikey", x, y, s, r, yuk }); if (engel) engelle(b, x, y + yuk - 1); }
  // Çit: ahşap ya da tel
  function cit(b, x, y, gen, tur = "ahsap") {
    const r = tur === "tel" ? 13 : 14;
    for (let i = 0; i < gen; i++) karo(b, x + i, y, i === 0 ? 4 : i === gen - 1 ? 6 : 5, r);
  }
  // Park etmiş araba: önden görünüş, 2×2 karo
  function arabaPark(b, x, y, renk) { b.nesneler.push({ tip: "araba", x, y, renk }); engelle(b, x, y + 1, 2, 1); }
  function parkYeri(b, x, y) { b.zemin[y][x] = ["urban", 5, 16]; b.zemin[y][x + 1] = ["urban", 6, 16]; b.zemin[y + 1][x] = ["urban", 5, 17]; b.zemin[y + 1][x + 1] = ["urban", 6, 17]; }
  function cikis(b, kenar, hedef, giris) { b.cikislar.push({ kenar, hedef, giris }); }
  const nokta = (b, ad, x, y) => { b.noktalar[ad] = { x, y }; };

  // Ortak sokak düzeni: arkada bahçeler (0–8), kaldırım (9–10), yol (11–13), karşı kaldırım (14), alt alan (15–19)
  function sokak(b, gecitler, altZemin) {
    alan(b, 0, 0, b.gen, 9, "cim", { ust: false, sol: false, sag: false });
    kaldirim(b, 9, 2, false, true); yol(b, 11, gecitler); kaldirim(b, 14, 1, true, false);
    alan(b, 0, 15, b.gen, 5, altZemin, { alt: false, sol: false, sag: false });
  }

  // ---------- Lale Sokak ----------
  function lale() {
    const b = yeniBolge("lale", "Lale Sokak", 44, 20);
    sokak(b, [20, 38], "cim");
    alan(b, 0, 17, 44, 2, "bej", { sol: false, sag: false }); // parkın içinden geçen yol
    for (const [x, t] of [[1, 0], [5, 1], [9, 0], [14, 1], [18, 0], [22, 1], [26, 0], [30, 1], [34, 0], [38, 1], [42, 0]]) agac(b, x, 0, t);
    bina(b, { x: 2, gen: 7, cati: 3, kat: 3, tur: "kirmizi", kapi: { x: 5, ad: "Lale Sokak 4", hedef: "ev:daire" } });
    bina(b, { x: 11, gen: 6, kat: 4, tur: "turuncu", pencere: "kemer", kapiTur: "cift", kapi: { x: 13, ad: "Kavaklı Apartmanı", hedef: "ev:kavakli" }, tabela: "Kavaklı Apt." });
    bina(b, { x: 19, gen: 5, kat: 2, tur: "kirmiziSade", pencere: "kucuk", kapi: { x: 21, ad: "Petri'lerin evi", hedef: "komsu:petri" } });
    bina(b, { x: 26, gen: 6, cati: 3, kat: 2, tur: "turuncuSade", kapi: { x: 28, ad: "Sorova'nın evi", hedef: "komsu:sorova" } });
    bina(b, { x: 34, gen: 8, cati: 3, kat: 3, tur: "kirmizi", kolon: true, pencere: "kemer" });
    // Binaların arasında ağaçlar, kaldırımda lambalar
    for (const [x, t] of [[10, 1], [18, 6], [24, 1], [33, 4], [42, 1]]) agac(b, x, t >= 4 ? 7 : 6, t);
    for (const x of [9, 17, 25, 32, 43]) lamba(b, x, 9);
    karo(b, 15, 10, 8, 11); // posta kutusu
    // Park
    for (const [x, t] of [[3, 0], [8, 1], [14, 0], [18, 1], [24, 0], [33, 1], [38, 0], [41, 1]]) agac(b, x, 15, t);
    for (const [x, t] of [[1, 4], [7, 4], [16, 6], [23, 4], [31, 6], [40, 4]]) agac(b, x, 19, t);
    bank(b, 5, 16); bank(b, 11, 16); bank(b, 29, 16);
    lamba(b, 21, 15, "park"); lamba(b, 35, 15, "park");
    karo(b, 16, 16, 10, 9); // çöp kutusu
    nokta(b, "solGiris", 1, 10); nokta(b, "sagGiris", 42, 10);
    b.gezinti = [[3, 10], [12, 10], [22, 10], [33, 10], [41, 10], [6, 17], [14, 17], [20, 19], [28, 17], [36, 19]];
    cikis(b, "sol", "ova", "sagGiris"); cikis(b, "sag", "carsi", "solGiris");
    return b;
  }

  // ---------- Çarşı ----------
  function carsi() {
    const b = yeniBolge("carsi", "Çarşı", 48, 20);
    sokak(b, [12, 30], "bej");
    for (const [x, t] of [[1, 1], [5, 0], [9, 1], [13, 0], [17, 1], [21, 0], [25, 1], [29, 0], [33, 1], [37, 0], [41, 1], [45, 0]]) agac(b, x, 0, t);
    bina(b, { x: 1, gen: 6, kat: 3, tur: "turuncu", pencere: "kare", kapi: { x: 3, ad: "Gözcü Kafe", hedef: "ic:kafe" }, kapiTur: "dukkan", vitrin: true, tente: "yesil" });
    bina(b, { x: 8, gen: 6, kat: 3, tur: "kirmizi", pencere: "kucuk", kapi: { x: 10, ad: "Ovalı Lokantası", hedef: "ic:lokanta" }, kapiTur: "cift", vitrin: true, tente: "kirmizi" });
    bina(b, { x: 15, gen: 7, cati: 3, kat: 3, tur: "turuncu", kolon: true, pencere: "kemer", kapi: { x: 18, ad: "Kalvar Bankası", hedef: "ic:banka" }, kapiTur: "cam", tabela: "BANKA" });
    bina(b, { x: 23, gen: 5, kat: 3, tur: "kirmiziSade", pencere: "sivri", kapi: { x: 25, ad: "Varga Emlak", hedef: "ic:emlak" }, kapiTur: "dukkan", vitrin: true, tabela: "EMLAK" });
    bina(b, { x: 29, gen: 6, kat: 2, tur: "turuncuSade", kapi: { x: 31, ad: "Petri Eşya", hedef: "ic:esya" }, kapiTur: "cift", vitrin: true, tente: "turuncu" });
    // Oto galerinin önünde park yeri
    doldur(b, 36, 4, 7, 5, "asfalt"); alan(b, 36, 0, 7, 4, "cim", { ust: false, sol: false, sag: false });
    for (const [x, renk] of [[36, "kirmizi"], [38, "beyaz"], [40, "mavi"]]) { parkYeri(b, x, 5); arabaPark(b, x, 5, renk); }
    bina(b, { x: 43, gen: 4, kat: 2, tur: "turuncu", pencere: "genis", vitrin: true, kapi: { x: 44, ad: "Kask Oto Galeri", hedef: "ic:galeri" }, kapiTur: "cam", tabela: "OTO" });
    for (const x of [0, 7, 14, 22, 28, 35, 47]) lamba(b, x, 9);
    karo(b, 20, 10, 8, 11); karo(b, 27, 10, 8, 9); karo(b, 34, 10, 10, 9);
    // Meydan: havuz, banklar, saksıda ağaçlar, pazar tezgâhları, otobüs durağı
    alan(b, 21, 16, 5, 3, "su");
    bank(b, 19, 17, "tas"); bank(b, 27, 17, "tas");
    for (const [x, t] of [[4, 2], [12, 3], [33, 2], [42, 3]]) agac(b, x, 15, t);
    karo(b, 6, 17, 4, 11); karo(b, 7, 17, 5, 11); karo(b, 8, 17, 3, 10);
    karo(b, 36, 17, 6, 10); karo(b, 37, 17, 7, 11);
    lamba(b, 16, 15, "park"); lamba(b, 30, 15, "park");
    uzun(b, 45, 15, 4, 6, 2);
    nokta(b, "solGiris", 1, 10); nokta(b, "sagGiris", 46, 10);
    b.gezinti = [[2, 9], [10, 10], [18, 9], [26, 10], [33, 9], [44, 10], [6, 18], [15, 18], [19, 19], [30, 19], [40, 18]];
    cikis(b, "sol", "lale", "sagGiris"); cikis(b, "sag", "avlu", "solGiris");
    return b;
  }

  // ---------- Avlu Stadı önü ----------
  function avlu() {
    const b = yeniBolge("avlu", "Avlu Stadı", 48, 20);
    sokak(b, [8, 40], "cim");
    for (const [x, t] of [[1, 0], [5, 1], [30, 1], [34, 0], [43, 1], [46, 0]]) agac(b, x, 0, t);
    bina(b, { x: 1, gen: 6, kat: 3, tur: "kirmizi", kolon: true, pencere: "kare", kapi: { x: 3, ad: "Kalvar Spor kulüp binası", hedef: "kulup" }, kapiTur: "cam", tabela: "KALVAR SPOR" });
    // Stadyum: uzun cephe, ortada demir kapı; tribünlerin arasından saha görünür
    bina(b, { x: 9, gen: 20, cati: 5, kat: 3, tur: "turuncu", kolon: true, pencere: "kemer", catiTur: "saha", kapi: { x: 18, ad: "Avlu Stadı", hedef: "stad" }, kapiTur: "metal", tabela: "AVLU STADI" });
    // Eski cezaevinin duvarı ve gözetleme kulesi
    bina(b, { x: 31, gen: 16, kat: 2, tur: "turuncuSade", pencere: "yok" });
    bina(b, { x: 38, gen: 2, kat: 5, tur: "turuncu", pencere: "dar" });
    for (const x of [14, 24, 30, 36, 46]) lamba(b, x, 9);
    // Otobüs durağı: tabela ve bank
    uzun(b, 7, 8, 4, 6, 2); bank(b, 8, 8);
    cit(b, 16, 18, 12, "tel");
    for (const [x, t] of [[2, 0], [14, 1], [22, 0], [30, 1], [37, 0], [44, 1]]) agac(b, x, 15, t);
    for (const [x, t] of [[6, 4], [11, 6], [33, 4], [41, 6]]) agac(b, x, 19, t);
    nokta(b, "solGiris", 1, 10); nokta(b, "kulupOnu", 3, 10); nokta(b, "durak", 7, 10);
    b.gezinti = [[3, 10], [12, 10], [20, 9], [28, 10], [36, 9], [44, 10], [10, 17], [20, 16], [34, 17]];
    cikis(b, "sol", "carsi", "sagGiris");
    return b;
  }

  // ---------- Ova kenarı ----------
  function ova() {
    const b = yeniBolge("ova", "Ova kenarı", 44, 20, "cim");
    alan(b, 0, 8, 44, 3, "bej", { sol: false, sag: false }); // taş yol
    bina(b, { x: 4, taban: 7, gen: 6, kat: 2, tur: "kirmizi", kapi: { x: 6, ad: "Ova Yolu 12 (bahçeli ev)", hedef: "ev:bahceli" } });
    cit(b, 1, 7, 3); cit(b, 10, 7, 3);
    // Korular, gölet ve dağınık ağaçlar
    koru(b, 11, 0); koru(b, 16, 1); koru(b, 21, 2); koru(b, 31, 0); koru(b, 37, 2); koru(b, 39, 15); koru(b, 16, 16);
    alan(b, 27, 13, 10, 5, "su");
    // Meyve bahçesi: sıra sıra kısa ağaçlar, önünde ahşap çit
    for (const y of [13, 16]) for (const x of [2, 5, 9, 12]) agac(b, x, y, 1);
    cit(b, 1, 12, 5); cit(b, 9, 12, 5);
    for (const [x, y, t] of [[20, 14, 0], [27, 3, 1], [42, 1, 0], [24, 16, 0], [43, 12, 1]]) agac(b, x, y, t);
    for (const [x, y, t] of [[15, 12, 6], [38, 12, 4], [25, 6, 5], [2, 4, 6], [1, 1, 4], [14, 4, 4], [35, 6, 4], [21, 12, 5], [26, 18, 4], [37, 19, 6], [1, 19, 4], [7, 19, 6], [12, 19, 4]]) agac(b, x, y, t);
    bank(b, 17, 12); bank(b, 34, 7); bank(b, 30, 12); bank(b, 26, 15);
    lamba(b, 14, 6, "park"); lamba(b, 26, 6, "park"); lamba(b, 38, 6, "park");
    nokta(b, "sagGiris", 42, 10);
    b.gezinti = [[40, 10], [32, 9], [24, 11], [14, 10], [6, 11], [8, 16], [22, 17]];
    b.huzur = true; // burada yürümek stresi azaltır
    cikis(b, "sag", "lale", "solGiris");
    return b;
  }

  // ---------- İç mekânlar ----------
  // Odanın üst iki satırı duvar, alt kenarın ortasında çıkış kapısı
  function ic(id, ad, gen, yuk, zemin, esyalar, { cikisHedef, cikisNokta, insanlar = [] } = {}) {
    const b = yeniBolge(id, ad, gen, yuk, zemin);
    b.ic = true;
    for (let i = 0; i < gen; i++) { engelle(b, i, 0, 1, 2); }
    b.yapilar.push({ tip: "duvar", gen });
    for (const e of esyalar) {
      b.nesneler.push({ tip: "esya", x: e[0], y: e[1], s: e[2], r: e[3], ayna: e[5] });
      if (e[4] !== false) engelle(b, e[0], e[1]);
      if (e[6]) b.etkilesim = (b.etkilesim || []).concat({ x: e[0], y: e[1], ...e[6] });
    }
    const kx = Math.floor(gen / 2);
    b.kapilar.push({ x: kx, y: yuk - 1, ad: "Dışarı", hedef: "dis", cikis: true });
    b.cikisHedef = cikisHedef; b.cikisNokta = cikisNokta;
    nokta(b, "giris", kx, yuk - 2);
    b.insanlar = insanlar;
    return b;
  }

  // Ev içleri: hangi evde oturduğuna göre
  function evDaire() {
    return ic("ev:daire", "Evin · Lale Sokak 4", 12, 8, "tas", [
      [0, 2, 10, 12, true], [0, 3, 10, 13, true], [1, 2, 0, 12], [2, 2, 5, 12], [3, 2, 14, 14],
      [2, 4, 0, 0], [3, 4, 1, 0], [2, 5, 0, 1], [3, 5, 1, 1], [1, 4, 2, 2], [4, 4, 2, 2, true, true],
      [10, 2, 12, 6, true, false, { tur: "yatak", ad: "Yatak" }], [11, 1, 25, 8, true], [11, 2, 25, 9],
      [8, 5, 16, 8, false], [9, 5, 17, 8, false], [10, 5, 18, 8, false], [8, 6, 16, 9, false], [9, 6, 17, 9, false], [10, 6, 18, 9, false],
      [9, 5, 21, 4, true],
      [6, 0, 19, 12, false], [7, 0, 20, 12, false], [0, 6, 16, 0],
      [5, 2, 22, 15, true, false, { tur: "ayna", ad: "Ayna" }],
    ], { cikisHedef: "lale", cikisNokta: { x: 5, y: 10 } });
  }
  function evKavakli() {
    return ic("ev:kavakli", "Evin · Kavaklı Apartmanı", 14, 9, "tas", [
      [0, 2, 10, 12], [0, 3, 10, 13], [1, 2, 0, 12], [2, 2, 5, 12], [3, 2, 14, 14], [4, 2, 6, 12],
      [2, 5, 0, 0], [3, 5, 1, 0], [2, 6, 0, 1], [3, 6, 1, 1], [1, 5, 2, 2], [4, 5, 2, 2, true, true],
      [11, 2, 12, 6, true, false, { tur: "yatak", ad: "Yatak" }], [12, 2, 14, 6, true], [13, 1, 25, 8], [13, 2, 25, 9],
      [7, 5, 16, 10, false], [8, 5, 17, 10, false], [9, 5, 18, 10, false], [7, 6, 16, 11, false], [8, 6, 17, 11, false], [9, 6, 18, 11, false],
      [8, 5, 21, 4], [8, 7, 22, 4, true, true],
      [6, 0, 19, 13, false], [7, 0, 20, 13, false], [0, 7, 16, 0], [13, 7, 17, 0],
      [5, 2, 22, 15, true, false, { tur: "ayna", ad: "Ayna" }],
    ], { cikisHedef: "lale", cikisNokta: { x: 13, y: 10 } });
  }
  function evBahceli() {
    return ic("ev:bahceli", "Evin · Ova Yolu 12", 16, 10, "tas", [
      [0, 2, 10, 12], [0, 3, 10, 13], [1, 2, 0, 12], [2, 2, 5, 12], [3, 2, 14, 14], [4, 2, 6, 12], [5, 2, 7, 12],
      [2, 5, 0, 9], [3, 5, 1, 9], [4, 5, 2, 9], [2, 6, 0, 10], [3, 6, 1, 10], [4, 6, 2, 10],
      [13, 2, 12, 6, true, false, { tur: "yatak", ad: "Yatak" }], [14, 2, 14, 6], [15, 1, 25, 8], [15, 2, 25, 9],
      [9, 5, 16, 10, false], [10, 5, 17, 10, false], [11, 5, 18, 10, false], [9, 6, 16, 11, false], [10, 6, 17, 11, false], [11, 6, 18, 11, false],
      [10, 5, 21, 4], [12, 5, 22, 4], [8, 2, 23, 8], [9, 2, 24, 8],
      [7, 0, 19, 14, false], [8, 0, 20, 14, false], [0, 8, 16, 0], [15, 8, 17, 0], [6, 8, 16, 1],
      [6, 2, 22, 15, true, false, { tur: "ayna", ad: "Ayna" }],
    ], { cikisHedef: "ova", cikisNokta: { x: 6, y: 8 } });
  }

  function kafe() {
    return ic("ic:kafe", "Gözcü Kafe", 14, 8, "tas", [
      [1, 2, 0, 12], [2, 2, 5, 12], [3, 2, 4, 12], [4, 2, 6, 12], [5, 2, 0, 12],
      [2, 5, 3, 0, true, false, { tur: "masa", ad: "Masaya otur" }], [1, 5, 2, 2], [3, 5, 2, 2, true, true],
      [7, 4, 3, 0, true, false, { tur: "masa", ad: "Masaya otur" }], [6, 4, 2, 2], [8, 4, 2, 2, true, true],
      [11, 5, 3, 0, true, false, { tur: "masa", ad: "Masaya otur" }], [10, 5, 2, 2], [12, 5, 2, 2, true, true],
      [8, 0, 19, 12, false], [12, 0, 21, 12, false], [0, 6, 16, 0], [13, 6, 17, 0], [12, 2, 25, 9],
    ], { cikisHedef: "carsi", cikisNokta: { x: 3, y: 10 }, insanlar: [{ id: "mavro", x: 3, y: 3 }] });
  }
  function lokanta() {
    return ic("ic:lokanta", "Ovalı Lokantası", 14, 8, "tas", [
      [1, 2, 10, 12], [2, 2, 14, 14], [3, 2, 1, 12], [4, 2, 0, 12],
      [2, 5, 9, 9, true, false, { tur: "lokanta", ad: "Yemek ye" }], [3, 5, 10, 9], [1, 5, 2, 2], [4, 5, 2, 2, true, true],
      [8, 5, 9, 9, true, false, { tur: "lokanta", ad: "Yemek ye" }], [9, 5, 10, 9], [7, 5, 2, 2], [10, 5, 2, 2, true, true],
      [12, 2, 16, 0], [0, 6, 16, 0], [8, 0, 19, 12, false], [9, 0, 20, 12, false],
    ], { cikisHedef: "carsi", cikisNokta: { x: 10, y: 10 }, insanlar: [{ id: "dora", x: 6, y: 3 }] });
  }
  function banka() {
    return ic("ic:banka", "Kalvar Bankası", 12, 7, "mavitas", [
      [3, 3, 0, 15, true, false, { tur: "banka", ad: "Gişe" }], [4, 3, 1, 15], [5, 3, 1, 15], [6, 3, 0, 15, true, false, { tur: "banka", ad: "Gişe" }], [7, 3, 1, 15], [8, 3, 2, 15],
      [0, 5, 16, 0], [11, 5, 17, 0], [1, 2, 25, 8], [10, 2, 25, 8],
    ], { cikisHedef: "carsi", cikisNokta: { x: 18, y: 10 }, insanlar: [{ id: "tamm", x: 5, y: 2 }] });
  }
  function emlak() {
    return ic("ic:emlak", "Varga Emlak", 10, 7, "tas", [
      [4, 3, 0, 0, true, false, { tur: "emlak", ad: "Emlakçıyla konuş" }], [5, 3, 1, 0], [4, 4, 2, 2, true, true], [5, 4, 2, 2],
      [1, 2, 23, 10], [2, 2, 24, 10], [8, 2, 16, 0], [0, 5, 16, 1], [6, 0, 20, 13, false], [7, 0, 21, 13, false],
    ], { cikisHedef: "carsi", cikisNokta: { x: 25, y: 10 }, insanlar: [{ id: "varga", x: 4, y: 2 }] });
  }
  function esya() {
    return ic("ic:esya", "Petri Eşya", 12, 7, "tas", [
      [1, 3, 16, 10], [2, 3, 17, 10], [3, 3, 18, 10], [6, 2, 23, 8], [7, 2, 24, 8], [9, 3, 21, 4], [10, 3, 22, 4],
      [5, 4, 0, 15, true, false, { tur: "esya", ad: "Tezgâh" }], [6, 4, 1, 15], [1, 5, 16, 0], [10, 5, 17, 0],
    ], { cikisHedef: "carsi", cikisNokta: { x: 31, y: 10 }, insanlar: [{ id: "usta", x: 6, y: 3 }] });
  }
  function galeri() {
    return ic("ic:galeri", "Kask Oto Galeri", 10, 6, "mavitas", [
      [4, 3, 0, 0, true, false, { tur: "galeri", ad: "Galericiyle konuş" }], [5, 3, 1, 0], [1, 2, 25, 8], [8, 2, 16, 0], [0, 4, 16, 1],
    ], { cikisHedef: "carsi", cikisNokta: { x: 44, y: 10 }, insanlar: [{ id: "rado", x: 4, y: 2 }] });
  }

  let onbellek = null;
  function hepsi() {
    if (!onbellek) {
      onbellek = {};
      for (const b of [lale(), carsi(), avlu(), ova(), evDaire(), evKavakli(), evBahceli(), kafe(), lokanta(), banka(), emlak(), esya(), galeri()]) onbellek[b.id] = b;
    }
    return onbellek;
  }
  const bolge = (id) => hepsi()[id];

  // Bir bina kapısının iç mekânı nereye çıkar: iç mekânın kendi çıkış noktasıyla eşleşir
  return { hepsi, bolge, Z };
})();
