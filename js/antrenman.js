// Antrenman türleri ve etkileri. Sahnede görünen her tekrarın sonucu burada, oyuncuların özelliklerine göre belirlenir.
const ANTRENMAN = (() => {
  const { sinirla, gauss } = DUNYA;
  const TURLER = {
    pas: { ad: "Pas ve rondo", aciklama: "Dar alanda tek dokunuş pas. Pas ve teknik gelişir.", ozellik: ["pas", "teknik"], yorgunluk: 6 },
    sut: { ad: "Bitiricilik", aciklama: "Ceza sahası önünden şut. Şut ve teknik gelişir, kaleciler de çalışır.", ozellik: ["sut", "teknik"], yorgunluk: 6 },
    savunma: { ad: "Savunma hattı", aciklama: "Dörtlü savunmanın topla birlikte kayması. Savunma ve hız gelişir.", ozellik: ["savunma", "hiz"], yorgunluk: 7 },
    duran: { ad: "Duran top", aciklama: "Korner ve kafa çalışması. Şut ve savunma biraz gelişir, az yorar.", ozellik: ["sut", "savunma"], yorgunluk: 4, carpan: 0.7 },
    kondisyon: { ad: "Kondisyon", aciklama: "Koniler arası depar. Dayanıklılık ve hız gelişir ama oyuncular çok yorulur.", ozellik: ["dayaniklilik", "hiz"], yorgunluk: 13 },
    dinlenme: { ad: "Dinlenme", aciklama: "Hafif koşu ve esneme. Gelişme olmaz, oyuncular toparlanır.", ozellik: [], yorgunluk: -14 },
  };

  const al = (a, rnd = Math.random) => a[Math.floor(rnd() * a.length)];
  const ort = (o, oz) => (oz.length ? oz.reduce((t, k) => t + o.oz[k], 0) / oz.length : 10);
  const yasCarpani = (y) => (y <= 21 ? 1.5 : y <= 25 ? 1.15 : y <= 29 ? 0.85 : 0.5);

  function yap(S, tur) {
    const t = TURLER[tur];
    const kadro = S.takimlar[S.kulupId].kadro;
    const hocaF = S.menajer.enerji < 30 ? 0.8 : 1;
    // Her oyuncunun bugünkü performansı: ilgili özellikleri, kondisyonu ve biraz şans
    const perf = kadro.map((o) => {
      const oz = o.mevki === "KL" && (tur === "sut" || tur === "duran") ? ["kaleci"] : t.ozellik;
      return { o, p: ort(o, oz) + (o.kondisyon - 75) / 12 + gauss(Math.random) * 3 };
    }).sort((a, b) => b.p - a.p);
    const rapor = { tur, parlayan: [], kotu: [], gelisenler: [], tekrarlar: [] };
    if (tur !== "dinlenme") {
      rapor.parlayan = perf.slice(0, 2).map((x) => x.o.id);
      rapor.kotu = [perf[perf.length - 1].o.id];
    }
    perf.forEach((x, sira) => {
      const o = x.o;
      const iyilik = 1 - sira / perf.length; // 1 en iyi, 0 en kötü
      // Gelişim: birikir, 1'i geçince özellik bir puan artar
      const ozler = o.mevki === "KL" && (tur === "sut" || tur === "duran") ? ["kaleci"] : t.ozellik;
      for (const k of ozler) {
        o.gelisim[k] = (o.gelisim[k] || 0) + 0.13 * (t.carpan || 1) * yasCarpani(o.yas) * (0.7 + 0.6 * iyilik) * hocaF;
        if (o.gelisim[k] >= 1 && o.oz[k] < 20) { o.gelisim[k] -= 1; o.oz[k]++; rapor.gelisenler.push({ id: o.id, ozellik: k, yeni: o.oz[k] }); }
      }
      o.kondisyon = Math.round(sinirla(o.kondisyon - t.yorgunluk * (1.15 - o.oz.dayaniklilik / 40), 25, 100));
    });
    for (const id of rapor.parlayan) { const o = kadro.find((x) => x.id === id); o.moral = Math.min(100, o.moral + 3); }
    for (const id of rapor.kotu) { const o = kadro.find((x) => x.id === id); o.moral = Math.max(0, o.moral - 2); }
    rapor.tekrarlar = tekrarlar(tur, kadro);
    rapor.ortKond = Math.round(kadro.reduce((a, o) => a + o.kondisyon, 0) / kadro.length);
    return rapor;
  }

  // Sahnede oynatılacak tekrarlar (kim, ne oldu)
  function tekrarlar(tur, kadro) {
    const mevki = (m) => kadro.filter((o) => o.mevki === m);
    const karistir = (a) => a.map((x) => [Math.random(), x]).sort((p, q) => p[0] - q[0]).map((x) => x[1]);
    const kaleci = mevki("KL").sort((a, b) => b.oz.kaleci - a.oz.kaleci)[0];
    if (tur === "pas") {
      const kisiler = karistir(kadro.filter((o) => o.mevki !== "KL")).slice(0, 7);
      const kayiplar = [];
      for (let i = 0; i < 5; i++) {
        const o = kisiler.slice(0, 5).sort((a, b) => (a.oz.pas + a.oz.teknik) * Math.random() - (b.oz.pas + b.oz.teknik) * Math.random())[0];
        kayiplar.push({ oyuncu: o.id });
      }
      return { kisiler: kisiler.map((o) => o.id), kayiplar };
    }
    if (tur === "sut") {
      const atanlar = karistir([...mevki("FV"), ...mevki("OS").slice(0, 3)]).slice(0, 6);
      const atislar = [];
      for (let tur2 = 0; tur2 < 2; tur2++) for (const o of atanlar) {
        const isabet = Math.random() < sinirla(0.4 + (o.oz.sut - 10) * 0.04, 0.15, 0.85);
        const gol = isabet && Math.random() < sinirla(0.55 + (o.oz.sut - kaleci.oz.kaleci) * 0.05, 0.15, 0.85);
        atislar.push({ oyuncu: o.id, sonuc: gol ? "gol" : isabet ? "kurtaris" : "aut" });
      }
      return { kaleci: kaleci.id, atanlar: atanlar.map((o) => o.id), atislar };
    }
    if (tur === "duran") {
      const kullanan = kadro.filter((o) => o.mevki !== "KL").sort((a, b) => b.oz.pas - a.oz.pas)[0];
      const hucum = karistir([...mevki("FV"), ...mevki("DF")].filter((o) => o !== kullanan)).slice(0, 4);
      const savunma = karistir(mevki("DF").filter((o) => !hucum.includes(o) && o !== kullanan)).slice(0, 3);
      const kornerler = [];
      for (let i = 0; i < 6; i++) {
        const a = al(hucum), d = al(savunma.length ? savunma : hucum);
        const kazan = (a.oz.sut + a.oz.hiz * 0.5) * Math.random() > (d.oz.savunma + d.oz.hiz * 0.5) * Math.random();
        const gol = kazan && Math.random() < 0.45;
        kornerler.push({ oyuncu: kazan ? a.id : d.id, sonuc: !kazan ? "uzaklastirdi" : gol ? "gol" : "kurtaris" });
      }
      return { kaleci: kaleci.id, kullanan: kullanan.id, hucum: hucum.map((o) => o.id), savunma: savunma.map((o) => o.id), kornerler };
    }
    if (tur === "kondisyon") {
      const kosucular = karistir(kadro.filter((o) => o.mevki !== "KL")).slice(0, 8);
      const yarislar = [];
      for (let i = 0; i < 3; i++) {
        const sira = kosucular.map((o) => ({ id: o.id, p: o.oz.hiz * 0.6 + o.oz.dayaniklilik * (0.3 + i * 0.15) + o.kondisyon / 20 + Math.random() * 4 })).sort((a, b) => b.p - a.p);
        yarislar.push(sira.map((x) => x.id));
      }
      return { kosucular: kosucular.map((o) => o.id), yarislar };
    }
    if (tur === "savunma") {
      const defans = mevki("DF").sort((a, b) => b.oz.savunma - a.oz.savunma).slice(0, 4);
      const hucum = karistir([...mevki("FV"), ...mevki("OS")]).slice(0, 3);
      const denemeler = [];
      for (let i = 0; i < 7; i++) {
        const a = al(hucum), d = al(defans);
        const kesti = (d.oz.savunma + d.oz.hiz * 0.4) * (0.6 + Math.random()) > (a.oz.teknik + a.oz.hiz * 0.4) * (0.6 + Math.random());
        denemeler.push({ hucumcu: a.id, defans: d.id, sonuc: kesti ? "kesti" : "gecti" });
      }
      return { defans: defans.map((o) => o.id), hucum: hucum.map((o) => o.id), denemeler };
    }
    // Dinlenme: herkes hafif koşar
    return { kosucular: karistir(kadro).slice(0, 10).map((o) => o.id) };
  }

  return { TURLER, yap };
})();
