// Kalvar şehrinin haritası: bölgeler (sokaklar) ve iç mekânlar. Sadece veri; çizimi sahne-dunya.js yapar.
// Koordinatlar karo cinsinden (16 piksel). Binaların cephesi güneye bakar, kapıya alttaki kaldırımdan girilir.
const SEHIR = (() => {
  const Z = {
    cim: ["sehir", 0, 24], kaldirim: ["sehir", 1, 20], tas: ["sehir", 3, 19], mavitas: ["sehir", 6, 19],
    asfalt: ["sehir", 11, 19], serit: ["sehir", 9, 19], toprak: ["sehir", 4, 24], cakil: ["sehir", 2, 24], parke: ["sehir", 8, 24],
    yolUst: ["sehir", 11, 25], yolOrta: ["sehir", 11, 26], yolAlt: ["sehir", 11, 27],
    tarla: ["sehir", 32, 5], tarla2: ["sehir", 35, 5], ahsap: ["sehir", 3, 19],
  };
  // Bina türleri: çatı sütunu ve cephe sütunu (sehir sayfasında)
  const MALZEME = { tugla: { cati: 0, duvar: 0 }, gri: { cati: 8, duvar: 4 }, bej: { cati: 24, duvar: 8 }, beyaz: { cati: 16, duvar: 4 } };

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

  // Üç karoluk yol: ortası şeritli. Arabalar üst şeritte sola, alt şeritte sağa gider.
  function yol(b, y) {
    doldur(b, 0, y, b.gen, 3, "asfalt");
    for (let i = 0; i < b.gen; i++) b.zemin[y + 1][i] = Z.serit;
    b.yollar.push(y);
  }

  // Bina: kat = cephe satırı sayısı (en az 3). Kapı cephenin alt iki satırında.
  function bina(b, { x, y, gen, cati = 2, kat = 4, tur = "tugla", kapi, pencere = "ahsap", tente, tabela, kapiTur = "ahsap" }) {
    const m = MALZEME[tur];
    b.yapilar.push({ tip: "bina", x, y, gen, cati, kat, m, pencere, tente, tabela, kapi: kapi && { ...kapi, tur: kapiTur } });
    engelle(b, x, y, gen, cati + kat);
    if (kapi) b.kapilar.push({ x: kapi.x, y: y + cati + kat, ad: kapi.ad, hedef: kapi.hedef, bina: true });
  }

  // Ağaç iki karo boyunda; sadece gövdesi (alt karo) engeldir
  function agac(b, x, y, tur = 0) { b.nesneler.push({ tip: "agac", x, y, tur }); engelle(b, x, y + 1); }
  function lamba(b, x, y) { b.nesneler.push({ tip: "lamba", x, y }); engelle(b, x, y + 2); b.isiklar.push({ x: x * 16 + 12, y: y * 16 + 4, r: 34 }); }
  function bank(b, x, y) { b.nesneler.push({ tip: "karo", x, y, karolar: [[17, 15], [18, 15]], gen: 2 }); engelle(b, x, y, 2); b.noktalar.bank ||= []; b.noktalar.bank.push({ x: x + 1, y: y + 1 }); }
  function karo(b, x, y, s, r, engel = true) { b.nesneler.push({ tip: "karo", x, y, karolar: [[s, r]], gen: 1 }); if (engel) engelle(b, x, y); }
  function uzun(b, x, y, s, r, yuk, engel = true) { b.nesneler.push({ tip: "dikey", x, y, s, r, yuk }); if (engel) engelle(b, x, y + yuk - 1); }
  function park(b, x, y, gen, yuk) { b.yapilar.push({ tip: "park", x, y, gen, yuk }); }
  function cit(b, x, y, gen) { for (let i = 0; i < gen; i++) karo(b, x + i, y, 17, 18); }
  function arabaPark(b, x, y, renkSatir, sola = false) { b.nesneler.push({ tip: "araba", x, y, satir: renkSatir, sola }); engelle(b, x, y + 1, 3, 1); }
  function cikis(b, kenar, hedef, giris) { b.cikislar.push({ kenar, hedef, giris }); }
  const nokta = (b, ad, x, y) => { b.noktalar[ad] = { x, y }; };

  // ---------- Lale Sokak ----------
  function lale() {
    const b = yeniBolge("lale", "Lale Sokak", 44, 20);
    doldur(b, 0, 9, 44, 2, "kaldirim"); yol(b, 11); doldur(b, 0, 14, 44, 1, "kaldirim");
    for (let x = 1; x < 44; x += 5) agac(b, x, 0, x % 3);
    bina(b, { x: 2, y: 2, gen: 7, kat: 5, tur: "tugla", kapi: { x: 5, ad: "Lale Sokak 4", hedef: "ev:daire" } });
    bina(b, { x: 11, y: 3, gen: 6, kat: 4, tur: "bej", kapi: { x: 13, ad: "Kavaklı Apartmanı", hedef: "ev:kavakli" }, tabela: "Kavaklı Apt." });
    bina(b, { x: 19, y: 4, gen: 5, kat: 3, tur: "gri", kapi: { x: 21, ad: "Petri'lerin evi", hedef: "komsu:petri" } });
    bina(b, { x: 26, y: 3, gen: 6, kat: 4, tur: "tugla", kapi: { x: 28, ad: "Sorova'nın evi", hedef: "komsu:sorova" } });
    bina(b, { x: 34, y: 2, gen: 8, kat: 5, tur: "bej" });
    for (const x of [9, 17, 24, 33, 42]) lamba(b, x, 7);
    park(b, 2, 15, 18, 5);
    for (const [x, y, t] of [[3, 15, 0], [8, 16, 2], [14, 15, 1], [18, 16, 0], [24, 16, 2], [30, 15, 1], [38, 16, 0]]) agac(b, x, y, t);
    bank(b, 5, 18); bank(b, 11, 18); karo(b, 16, 18, 16, 13); karo(b, 22, 15, 15, 14);
    cit(b, 23, 18, 6); karo(b, 33, 15, 15, 13);
    arabaPark(b, 35, 8, 20);
    nokta(b, "solGiris", 1, 10); nokta(b, "sagGiris", 42, 10);
    b.gezinti = [[3, 10], [12, 10], [22, 10], [33, 10], [41, 10], [6, 17], [14, 17], [20, 19], [28, 17], [36, 19]];
    cikis(b, "sol", "ova", "sagGiris"); cikis(b, "sag", "carsi", "solGiris");
    return b;
  }

  // ---------- Çarşı ----------
  function carsi() {
    const b = yeniBolge("carsi", "Çarşı", 48, 20, "kaldirim");
    doldur(b, 0, 0, 48, 2, "cim"); yol(b, 11); doldur(b, 0, 15, 48, 5, "tas");
    for (let x = 0; x < 48; x += 4) agac(b, x, 0, (x / 4) % 3);
    bina(b, { x: 1, y: 3, gen: 6, kat: 4, tur: "bej", kapi: { x: 3, ad: "Gözcü Kafe", hedef: "ic:kafe" }, tente: "yesil", kapiTur: "cam" });
    bina(b, { x: 8, y: 3, gen: 6, kat: 4, tur: "tugla", kapi: { x: 10, ad: "Ovalı Lokantası", hedef: "ic:lokanta" }, tente: "turuncu" });
    bina(b, { x: 15, y: 2, gen: 7, kat: 5, tur: "gri", kapi: { x: 18, ad: "Kalvar Bankası", hedef: "ic:banka" }, pencere: "cam", kapiTur: "cam", tabela: "BANKA" });
    bina(b, { x: 23, y: 3, gen: 5, kat: 4, tur: "bej", kapi: { x: 25, ad: "Varga Emlak", hedef: "ic:emlak" }, tabela: "EMLAK" });
    bina(b, { x: 29, y: 3, gen: 6, kat: 4, tur: "tugla", kapi: { x: 31, ad: "Petri Eşya", hedef: "ic:esya" }, tente: "turuncu" });
    doldur(b, 36, 2, 12, 7, "parke");
    bina(b, { x: 43, y: 3, gen: 4, kat: 3, tur: "beyaz", kapi: { x: 44, ad: "Kask Oto Galeri", hedef: "ic:galeri" }, pencere: "cam", kapiTur: "cam", tabela: "OTO" });
    arabaPark(b, 36, 3, 16); arabaPark(b, 36, 6, 24); arabaPark(b, 40, 6, 20, true);
    karo(b, 9, 9, 10, 18); karo(b, 12, 9, 11, 18); karo(b, 28, 9, 12, 18);
    for (const x of [0, 7, 14, 22, 28, 35, 47]) lamba(b, x, 7);
    // Meydan: heykel, banklar, pazar tezgâhları
    karo(b, 22, 16, 35, 2); bank(b, 18, 17); bank(b, 25, 17);
    for (const [x, t] of [[4, 0], [12, 2], [33, 1], [42, 0]]) agac(b, x, 16, t);
    karo(b, 7, 16, 9, 18); karo(b, 8, 16, 10, 18); karo(b, 9, 16, 11, 18); karo(b, 36, 17, 12, 18); karo(b, 37, 17, 13, 18);
    uzun(b, 45, 15, 9, 14, 2);
    nokta(b, "solGiris", 1, 10); nokta(b, "sagGiris", 46, 10);
    b.gezinti = [[2, 9], [10, 10], [18, 9], [26, 10], [33, 9], [44, 10], [6, 18], [15, 18], [22, 18], [30, 19], [40, 18]];
    cikis(b, "sol", "lale", "sagGiris"); cikis(b, "sag", "avlu", "solGiris");
    return b;
  }

  // ---------- Avlu Stadı önü ----------
  function avlu() {
    const b = yeniBolge("avlu", "Avlu Stadı", 48, 20, "kaldirim");
    doldur(b, 0, 0, 48, 2, "cakil"); yol(b, 12); doldur(b, 0, 15, 48, 5, "cim");
    bina(b, { x: 1, y: 3, gen: 6, kat: 5, tur: "gri", kapi: { x: 3, ad: "Kalvar Spor kulüp binası", hedef: "kulup" }, tabela: "KALVAR SPOR" });
    // Stadyum: uzun gri duvar, ortada giriş kapısı
    bina(b, { x: 9, y: 2, gen: 20, cati: 3, kat: 4, tur: "gri", kapi: { x: 18, ad: "Avlu Stadı", hedef: "stad" }, pencere: "yok", tabela: "AVLU STADI", kapiTur: "cam" });
    // Eski cezaevi duvarı ve gözetleme kulesi
    bina(b, { x: 31, y: 4, gen: 16, cati: 1, kat: 3, tur: "gri", pencere: "yok" });
    bina(b, { x: 38, y: 0, gen: 2, cati: 2, kat: 6, tur: "gri", pencere: "kule" });
    karo(b, 33, 8, 9, 14); // eski cezaevi tabelası
    for (const x of [8, 24, 30, 36, 46]) lamba(b, x, 8);
    // Otobüs durağı
    uzun(b, 6, 14, 9, 14, 2); karo(b, 8, 15, 12, 15); bank(b, 9, 16);
    for (const [x, t] of [[2, 0], [14, 1], [22, 2], [30, 0], [37, 1], [44, 2]]) agac(b, x, 16, t);
    cit(b, 16, 18, 12);
    nokta(b, "solGiris", 1, 10); nokta(b, "kulupOnu", 3, 10); nokta(b, "durak", 7, 16);
    b.gezinti = [[3, 10], [12, 10], [20, 9], [28, 10], [36, 9], [44, 10], [10, 17], [20, 16], [34, 17]];
    cikis(b, "sol", "carsi", "sagGiris");
    return b;
  }

  // ---------- Ova kenarı ----------
  function ova() {
    const b = yeniBolge("ova", "Ova kenarı", 44, 20, "cim");
    // Toprak yol sağdan sola kıvrılarak gider
    for (let x = 0; x < 44; x++) {
      const y = 9 + Math.round(Math.sin(x / 6) * 2);
      b.zemin[y][x] = Z.yolUst; b.zemin[y + 1][x] = Z.yolOrta; b.zemin[y + 2][x] = Z.yolAlt;
    }
    bina(b, { x: 4, y: 1, gen: 6, kat: 4, tur: "tugla", kapi: { x: 6, ad: "Ova Yolu 12 (bahçeli ev)", hedef: "ev:bahceli" } });
    cit(b, 2, 7, 3); cit(b, 10, 7, 3);
    // Tarlalar
    doldur(b, 16, 1, 10, 5, "tarla"); doldur(b, 28, 14, 12, 5, "tarla");
    for (let x = 16; x < 26; x++) karo(b, x, 6, 20, 14, true);
    for (const [x, y, t] of [[1, 14, 0], [5, 15, 1], [10, 13, 2], [13, 16, 0], [20, 15, 1], [27, 2, 2], [31, 1, 0], [36, 3, 1], [40, 1, 2], [42, 14, 0]]) agac(b, x, y, t);
    bank(b, 18, 13); bank(b, 34, 8); karo(b, 24, 13, 16, 13);
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
