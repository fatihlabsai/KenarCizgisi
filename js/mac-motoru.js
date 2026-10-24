// Maç motoru: maçı dakika dakika oynatır, olayları ve anlatımı üretir. Çizimle ilgilenmez.
const MAC = (() => {
  const { guc, sinirla } = DUNYA;
  const al = (a) => a[Math.floor(Math.random() * a.length)];

  function agirlikliSec(liste, w) {
    const top = liste.reduce((s, x) => s + w(x), 0);
    let r = Math.random() * top;
    for (const x of liste) { if ((r -= w(x)) <= 0) return x; }
    return liste[liste.length - 1];
  }

  // ---------- Takımlar ----------
  function takim(S, id, ev) {
    const k = kulupBul(id), t = S.takimlar[id];
    const yerler = DIZILISLER[t.taktik.dizilis];
    const oyuncular = t.taktik.ilk11
      .map((oid, i) => ({ o: t.kadro.find((x) => x.id === oid), yer: yerler[i][0], i }))
      .filter((x) => x.o);
    return {
      id, k, ev, insan: id === S.kulupId,
      dizilis: t.taktik.dizilis, anlayis: t.taktik.anlayis,
      talimat: { ...VARSAYILAN_TALIMAT, ...(t.taktik.talimat || {}) },
      gorev: { ...(t.taktik.gorev || {}) },
      oyuncular,
      yedekler: t.kadro.filter((o) => !t.taktik.ilk11.includes(o.id) && DUNYA.uygun(o)),
      sakatlar: [],
      oynayanlar: oyuncular.map((x) => x.o.id), // maça giren herkes (puan için)
      yerOf: Object.fromEntries(oyuncular.map((x) => [x.o.id, x.yer])),
      atilanlar: new Set(), // kırmızı kart görenler
      kond: Object.fromEntries(t.kadro.map((o) => [o.id, o.kondisyon])),
      gol: 0, sut: 0, isabet: 0, sahip: 0, degisiklik: 0,
      sarilar: {}, bagir: null, bagirDevre: 0,
    };
  }

  const sahada = (t) => t.oyuncular.filter((x) => !x.kirmizi && !x.disarida);

  // Talimatların toplam etkisi: her talimatın seçili seçeneğindeki çarpanlar çarpılır
  function talimatEtkisi(t) {
    const e = { hucum: 1, orta: 1, savunma: 1, yorgunluk: 1, rakipIsabet: 0 };
    for (const [k, v] of Object.entries(t.talimat || {})) {
      const s = TALIMATLAR[k] && TALIMATLAR[k].secenek[v];
      if (!s) continue;
      for (const z of ["hucum", "orta", "savunma", "yorgunluk"]) if (s[z]) e[z] *= s[z];
      if (s.rakipIsabet) e.rakipIsabet += s.rakipIsabet;
      if (s.hizBonus) {
        const fv = sahada(t).filter((x) => x.yer === "FV");
        const hiz = fv.length ? fv.reduce((a, x) => a + x.o.oz.hiz, 0) / fv.length : 10;
        e.hucum *= 1 + (hiz - 11) * 0.012;
      }
    }
    return e;
  }

  function cizgiler(t, dk) {
    const top = { KL: 0, DF: 0, OS: 0, FV: 0 };
    const kaptanSahada = sahada(t).some((x) => x.o.id === t.gorev.kaptan);
    for (const x of sahada(t)) {
      const kond = t.kond[x.o.id];
      const moral = 0.92 + 0.16 * (x.o.moral / 100) + (kaptanSahada ? 0.012 : 0);
      top[x.yer] += guc(x.o, x.yer) * (0.6 + 0.4 * kond / 100) * moral;
    }
    const a = ANLAYISLAR[t.anlayis];
    const b = t.bagir && t.bagir.bitis > dk ? t.bagir : {};
    const ti = talimatEtkisi(t);
    const evF = t.ev ? 1.04 : 1;
    return {
      hucum: (top.FV + 0.45 * top.OS + 0.1 * top.DF) * a.hucum * evF * (b.hucum || 1) * ti.hucum,
      orta: (top.OS + 0.3 * top.FV + 0.3 * top.DF) * evF * (b.orta || 1) * ti.orta,
      savunma: (top.DF + 0.4 * top.OS + 0.1 * top.FV) * a.savunma * evF * (b.savunma || 1) * ti.savunma,
      rakipIsabet: ti.rakipIsabet,
    };
  }

  // ---------- Maç ----------
  // tur: "lig" ya da "hazirlik" (kart cezaları sadece ligde sayılır)
  function yeni(S, evId, depId, tur = "hazirlik") {
    const m = {
      tur,
      ev: takim(S, evId, true), dep: takim(S, depId, false),
      dk: 0, devre: 1,
      uzatma: [1 + Math.floor(Math.random() * 3), 2 + Math.floor(Math.random() * 4)],
      olaylar: [], istat: {}, bitti: false, top: "ev",
    };
    olay(m, { tip: "baslangic" });
    return m;
  }

  const dakikaYazi = (m) => (m.devre === 1 && m.dk > 45 ? `45+${m.dk - 45}` : m.devre === 2 && m.dk > 90 ? `90+${m.dk - 90}` : String(m.dk));
  const skor = (m) => `${m.ev.k.kisa} ${m.ev.gol}-${m.dep.gol} ${m.dep.k.kisa}`;
  const ist = (m, o) => (m.istat[o.id] ||= { gol: 0, asist: 0, sut: 0, kurtaris: 0, kart: 0 });

  function olay(m, e) {
    e.dk = dakikaYazi(m);
    e.skor = skor(m);
    e.metin = yorum(m, e);
    m.olaylar.push(e);
    return e;
  }

  function dakikaOyna(m) {
    if (m.bitti) return [];
    const once = m.olaylar.length;
    m.dk++;
    // Yorgunluk: dayanıklılığı düşük olan ve hücum oynayan takım daha çok yorulur
    for (const t of [m.ev, m.dep]) {
      const f = (t.anlayis === "hucum" ? 1.12 : t.anlayis === "savunma" ? 0.92 : 1) * talimatEtkisi(t).yorgunluk;
      for (const x of sahada(t)) t.kond[x.o.id] = Math.max(5, t.kond[x.o.id] - (0.14 + (20 - x.o.oz.dayaniklilik) * 0.011) * f);
      // Sakatlık: yorgun oyuncu daha kolay sakatlanır
      if (Math.random() < 0.0022) sakatlik(m, t);
    }
    yapayZeka(m, m.ev); yapayZeka(m, m.dep);

    const ce = cizgiler(m.ev, m.dk), cd = cizgiler(m.dep, m.dk);
    const pEv = ce.orta ** 1.6 / (ce.orta ** 1.6 + cd.orta ** 1.6);
    const evde = Math.random() < pEv;
    const A = evde ? m.ev : m.dep, D = evde ? m.dep : m.ev;
    const ca = evde ? ce : cd, cdf = evde ? cd : ce;
    A.sahip++;
    m.top = evde ? "ev" : "dep";

    const oran = ca.hucum / (cdf.savunma * 0.72);
    if (Math.random() < 0.165 * oran ** 0.9) atak(m, A, D, oran, cdf.rakipIsabet);
    if (Math.random() < 0.014) kart(m, D);

    const devreSonu = m.devre === 1 ? 45 + m.uzatma[0] : 90 + m.uzatma[1];
    if (m.dk >= devreSonu) {
      if (m.devre === 1) { olay(m, { tip: "devre" }); m.devre = 2; m.dk = 45; m.devreArasi = true; }
      else { olay(m, { tip: "bitis" }); m.bitti = true; }
    }
    return m.olaylar.slice(once);
  }

  function atak(m, A, D, oran, rakipIsabet = 0) {
    const oy = sahada(A).filter((x) => x.yer !== "KL");
    if (!oy.length) return;
    const kaleci = sahada(D).find((x) => x.yer === "KL") || sahada(D)[0];
    const defans = al(sahada(D).filter((x) => x.yer === "DF").concat(sahada(D))).o;
    // Penaltı: atakların küçük bir kısmı ceza sahasında faulle biter, penaltıyı görevli oyuncu kullanır
    const penalti = Math.random() < 0.014;
    const gorevli = (id) => oy.find((x) => x.o.id === id);
    let atan, asist = null, duran = false;
    if (penalti) atan = gorevli(A.gorev.penalti) || agirlikliSec(oy, (x) => x.o.oz.sut);
    else {
      atan = agirlikliSec(oy, (x) => ({ FV: 3, OS: 1.4, DF: 0.35 }[x.yer] * (x.o.oz.sut + 3)));
      const digerleri = oy.filter((x) => x !== atan);
      // Atakların bir kısmı duran toptan gelir: ortayı görevli oyuncu yapar
      const duranci = gorevli(A.gorev.duran);
      if (duranci && duranci !== atan && Math.random() < 0.16) { asist = duranci; duran = true; }
      else if (digerleri.length && Math.random() < 0.7) asist = agirlikliSec(digerleri, (x) => ({ FV: 1.4, OS: 2.2, DF: 0.7 }[x.yer] * (x.o.oz.pas + 2)));
    }
    A.sut++;
    ist(m, atan.o).sut++;
    const s = atan.o.oz;
    const isabetP = penalti ? 0.86 : sinirla(0.36 + (s.sut - 10) * 0.015 + (oran - 1) * 0.04 + rakipIsabet, 0.15, 0.75);
    const e = { takim: A.ev ? "ev" : "dep", oyuncu: atan.o, asist: asist && asist.o, kaleci: kaleci && kaleci.o, defans, penalti, duran };
    if (penalti && Math.random() < 0.3) kartVer(m, D, sahada(D).find((x) => x.o.id === defans.id) || sahada(D)[0]);
    if (Math.random() < isabetP) {
      A.isabet++;
      const kal = kaleci ? (kaleci.yer === "KL" ? kaleci.o.oz.kaleci : 2) * (0.6 + 0.4 * D.kond[kaleci.o.id] / 100) : 2;
      const golP = penalti ? sinirla(0.72 + (s.sut - kal) * 0.015, 0.55, 0.88) : sinirla(0.47 * ((s.sut + s.teknik * 0.5) / (kal * 1.5 + 1)) ** 0.45, 0.15, 0.7);
      if (Math.random() < golP) {
        A.gol++;
        ist(m, atan.o).gol++;
        if (asist) ist(m, asist.o).asist++;
        e.tip = "gol";
      } else {
        e.tip = "kurtaris";
        if (kaleci) ist(m, kaleci.o).kurtaris++;
      }
    } else {
      const r = Math.random();
      e.tip = r < 0.1 ? "direk" : r < 0.32 && !penalti ? "blok" : "disari";
    }
    olay(m, e);
  }

  function kart(m, D) {
    const aday = sahada(D).filter((x) => x.yer !== "KL");
    if (!aday.length) return;
    kartVer(m, D, agirlikliSec(aday, (y) => (y.yer === "DF" ? 2 : 1) * (22 - y.o.oz.teknik)));
  }

  function kartVer(m, D, x) {
    if (!x) return;
    D.sarilar[x.o.id] = (D.sarilar[x.o.id] || 0) + 1;
    ist(m, x.o).kart++;
    if (D.sarilar[x.o.id] >= 2) { x.kirmizi = true; D.atilanlar.add(x.o.id); olay(m, { tip: "kirmizi", takim: D.ev ? "ev" : "dep", oyuncu: x.o }); }
    else olay(m, { tip: "kart", takim: D.ev ? "ev" : "dep", oyuncu: x.o });
  }

  // Sakatlanan oyuncu çıkar; değişiklik hakkı ve aynı mevkide yedek varsa yerine biri girer
  function sakatlik(m, t) {
    const aday = sahada(t);
    if (!aday.length) return;
    const x = agirlikliSec(aday, (y) => (y.yer === "KL" ? 0.3 : 1) * (115 - t.kond[y.o.id]));
    const tur = al(SAKATLIK_TURLERI);
    const gun = 3 + Math.floor(Math.random() ** 2 * 38);
    t.sakatlar.push({ id: x.o.id, tur, gun });
    olay(m, { tip: "sakatlik", takim: t.ev ? "ev" : "dep", oyuncu: x.o, tur });
    const yedek = t.yedekler.filter((o) => o.mevki === x.yer).sort((a, b) => guc(b) - guc(a))[0] || t.yedekler.sort((a, b) => guc(b, x.yer) - guc(a, x.yer))[0];
    if (!(t.degisiklik < 3 && yedek && degistir(m, t, x.o.id, yedek.id))) { x.disarida = true; olay(m, { tip: "eksik", takim: t.ev ? "ev" : "dep", oyuncu: x.o }); }
  }

  // Sahadaki iki oyuncunun yerini değiştir (taktik ekranından)
  function yerDegistir(m, t, id1, id2) {
    const a = t.oyuncular.find((x) => x.o.id === id1), b = t.oyuncular.find((x) => x.o.id === id2);
    if (!a || !b) return false;
    [a.i, b.i] = [b.i, a.i];
    [a.yer, b.yer] = [b.yer, a.yer];
    t.yerOf[a.o.id] = a.yer; t.yerOf[b.o.id] = b.yer;
    olay(m, { tip: "yer", takim: t.ev ? "ev" : "dep", oyuncu: a.o, diger: b.o });
    return true;
  }

  // Rakip takımın hocası: skora göre anlayışını ve oyuncularını değiştirir
  function yapayZeka(m, t) {
    if (t.insan || m.devre !== 2) return;
    const fark = (t.ev ? m.ev.gol - m.dep.gol : m.dep.gol - m.ev.gol);
    if (m.dk === 60 || m.dk === 75) {
      const yeniA = fark < 0 ? "hucum" : fark >= 2 ? "savunma" : "dengeli";
      if (yeniA !== t.anlayis) taktikDegis(m, t, { anlayis: yeniA }, true);
    }
    if ((m.dk === 64 || m.dk === 74 || m.dk === 82) && t.degisiklik < 3) {
      const yorgun = sahada(t).filter((x) => x.yer !== "KL").sort((a, b) => t.kond[a.o.id] - t.kond[b.o.id])[0];
      const yedek = yorgun && t.yedekler.filter((o) => o.mevki === yorgun.yer).sort((a, b) => guc(b) - guc(a))[0];
      if (yorgun && yedek && t.kond[yorgun.o.id] < 75) degistir(m, t, yorgun.o.id, yedek.id);
    }
  }

  // ---------- Kenardan müdahale ----------
  function taktikDegis(m, t, { dizilis, anlayis, talimat }, sessiz) {
    if (talimat) {
      const [k, v] = Object.entries(talimat)[0];
      t.talimat = { ...t.talimat, [k]: v };
      olay(m, { tip: "talimat", takim: t.ev ? "ev" : "dep", talimat: k, secenek: v });
      return;
    }
    if (anlayis) t.anlayis = anlayis;
    if (dizilis && dizilis !== t.dizilis) {
      t.dizilis = dizilis;
      const oyuncular = sahada(t).map((x) => x.o);
      const yer = DIZILISLER[dizilis];
      const yeniDizi = DUNYA.enIyi11(oyuncular, dizilis);
      const kirmizilar = t.oyuncular.filter((x) => x.kirmizi);
      t.oyuncular = yeniDizi.map((id, i) => (id ? { o: oyuncular.find((o) => o.id === id), yer: yer[i][0], i } : null)).filter(Boolean).concat(kirmizilar);
    }
    if (!sessiz) olay(m, { tip: "taktik", takim: t.ev ? "ev" : "dep", dizilis: t.dizilis, anlayis: t.anlayis });
    else if (anlayis) olay(m, { tip: "taktik", takim: t.ev ? "ev" : "dep", dizilis: t.dizilis, anlayis: t.anlayis });
  }

  function degistir(m, t, cikanId, girenId) {
    if (t.degisiklik >= 3) return false;
    const x = t.oyuncular.find((y) => y.o.id === cikanId && !y.kirmizi);
    const giren = t.yedekler.find((o) => o.id === girenId);
    if (!x || !giren) return false;
    const cikan = x.o;
    x.o = giren;
    t.yedekler = t.yedekler.filter((o) => o.id !== girenId);
    t.oynayanlar.push(giren.id);
    t.yerOf[giren.id] = x.yer;
    t.degisiklik++;
    olay(m, { tip: "degisiklik", takim: t.ev ? "ev" : "dep", oyuncu: giren, cikan });
    return true;
  }

  const BAGIRISLAR = {
    bas: { yazi: "Öne çıkın, bastırın!", hucum: 1.12, savunma: 0.94 },
    sakin: { yazi: "Sakin olun, topu tutun!", savunma: 1.08, orta: 1.06 },
    aferin: { yazi: "Aferin çocuklar, böyle devam!", hucum: 1.05, orta: 1.05 },
  };
  function bagir(m, t, tur) {
    if (t.bagirDevre === m.devre) return false;
    t.bagirDevre = m.devre;
    t.bagir = { ...BAGIRISLAR[tur], bitis: m.dk + 10 };
    olay(m, { tip: "bagir", takim: t.ev ? "ev" : "dep", tur });
    return true;
  }

  // ---------- Sonuç ----------
  function sonucaGec(m) { let g = 0; while (!m.bitti && g++ < 200) { m.devreArasi = false; dakikaOyna(m); } }

  // Oyuncu puanları (4.0–10.0)
  function puanlar(m) {
    const p = {};
    for (const t of [m.ev, m.dep]) {
      const atilan = t.gol, yenen = t === m.ev ? m.dep.gol : m.ev.gol;
      const sonuc = atilan > yenen ? 0.35 : atilan < yenen ? -0.35 : 0;
      for (const id of t.oynayanlar) {
        const yer = t.yerOf[id] || "OS";
        const s = m.istat[id] || { gol: 0, asist: 0, sut: 0, kurtaris: 0, kart: 0 };
        let puan = 6.2 + sonuc + s.gol * 1.0 + s.asist * 0.55 + s.kurtaris * 0.25 - s.kart * 0.3 + (Math.random() - 0.5) * 1.1;
        if (yer === "DF" || yer === "KL") puan -= Math.min(1.5, yenen * 0.3);
        if (yer === "FV" && s.sut === 0) puan -= 0.3;
        if (t.atilanlar.has(id)) puan -= 1.2;
        p[id] = Math.round(sinirla(puan, 4, 10) * 10) / 10;
      }
    }
    return p;
  }

  // İzlenmeyen maçlar için: baştan sona hızlıca oyna
  function hizliOyna(S, evId, depId, tur) {
    const m = yeni(S, evId, depId, tur);
    sonucaGec(m);
    return m;
  }

  // ---------- Anlatım ----------
  function yorum(m, e) {
    const T = (k) => (k === "ev" ? m.ev : m.dep).k.kisa;
    const n = (o) => (o ? o.soyad : "");
    const dk = e.dk + "'";
    if (e.penalti) {
      if (e.tip === "gol") return `${dk} GOL! Penaltıda ${n(e.oyuncu)} hata yapmadı. ${e.skor}`;
      if (e.tip === "kurtaris") return `${dk} Penaltı! ${n(e.kaleci)}, ${ek(n(e.oyuncu), "in")} vuruşunu çıkardı!`;
      return `${dk} Penaltı kaçtı! ${n(e.oyuncu)} topu ${e.tip === "direk" ? "direğe" : "dışarı"} gönderdi.`;
    }
    if (e.duran && e.tip === "gol") return `${dk} GOL! ${ek(n(e.asist), "in")} kornerinde ${n(e.oyuncu)} kafayı vurdu. ${e.skor}`;
    if (e.duran && e.tip === "kurtaris") return `${dk} ${ek(n(e.asist), "in")} frikiğinde ${ek(n(e.oyuncu), "in")} kafasını ${n(e.kaleci)} tuttu.`;
    switch (e.tip) {
      case "sakatlik": return `${dk} ${n(e.oyuncu)} yerde kaldı. Sağlık ekibi sahada: ${e.tur}.`;
      case "eksik": return `${dk} ${n(e.oyuncu)} devam edemiyor ve değişiklik hakkı yok. ${T(e.takim)} eksik kaldı.`;
      case "talimat": return `${dk} ${T(e.takim)} kenarından yeni talimat: ${TALIMATLAR[e.talimat].ad.toLocaleLowerCase("tr-TR")} ${TALIMATLAR[e.talimat].secenek[e.secenek].ad.toLocaleLowerCase("tr-TR")}.`;
      case "yer": return `${dk} ${T(e.takim)} kenarından işaret: ${n(e.oyuncu)} ile ${n(e.diger)} yer değiştirdi.`;
      case "baslangic": return `Hakem düdüğü çaldı, maç başladı. ${m.ev.k.ad} – ${m.dep.k.ad}, ${m.ev.k.stad}.`;
      case "devre": return `İlk yarı bitti: ${e.skor}.`;
      case "bitis": return `Maç bitti: ${e.skor}.`;
      case "gol": return al(e.asist ? [
        `${dk} GOL! ${n(e.asist)} pası çıkardı, ${n(e.oyuncu)} vurdu, top ağlarda. ${e.skor}`,
        `${dk} GOL! ${ek(n(e.asist), "in")} ortasında ${n(e.oyuncu)} kafayı vurdu. ${e.skor}`,
        `${dk} GOL! ${n(e.asist)} ile ${n(e.oyuncu)} verkaç yaptı, son vuruş ${ek(n(e.oyuncu), "in")}. ${e.skor}`,
      ] : [
        `${dk} GOL! ${n(e.oyuncu)} ceza sahası dışından vurdu, top köşeye gitti. ${e.skor}`,
        `${dk} GOL! ${n(e.oyuncu)} savunmadan seken topu boş kaleye itti. ${e.skor}`,
        `${dk} GOL! ${n(e.oyuncu)} kaleciyle karşı karşıya kaldı ve hata yapmadı. ${e.skor}`,
      ]);
      case "kurtaris": return al([
        `${dk} ${n(e.oyuncu)} uzaktan denedi, ${n(e.kaleci)} uzanıp çeldi.`,
        `${dk} ${n(e.oyuncu)} kaleciyle karşı karşıya, ${n(e.kaleci)} geçit vermedi.`,
        e.asist ? `${dk} ${n(e.asist)} ortaladı, ${ek(n(e.oyuncu), "in")} kafasını ${n(e.kaleci)} kontrol etti.` : `${dk} ${ek(n(e.oyuncu), "in")} sert şutunu ${n(e.kaleci)} iki hamlede tuttu.`,
      ]);
      case "direk": return al([
        `${dk} Direk! ${ek(n(e.oyuncu), "in")} şutu direkten döndü.`,
        `${dk} ${n(e.oyuncu)} vurdu, top üst direğe çarpıp oyun alanına döndü.`,
      ]);
      case "blok": return al([
        `${dk} ${ek(n(e.oyuncu), "in")} şutu ${ek(n(e.defans), "e")} çarptı, top kornere gitti.`,
        `${dk} ${n(e.oyuncu)} vurmak istedi, ${n(e.defans)} son anda araya girdi.`,
      ]);
      case "disari": return al([
        `${dk} ${n(e.oyuncu)} vurdu, top yan direğin yanından auta gitti.`,
        `${dk} ${ek(n(e.oyuncu), "in")} şutu üstten auta.`,
        `${dk} ${n(e.oyuncu)} iyi yerdeydi ama topu çerçeveye gönderemedi.`,
      ]);
      case "kart": return al([`${dk} ${n(e.oyuncu)} sarı kart gördü.`, `${dk} Hakem ${ek(n(e.oyuncu), "e")} sarı kartı gösterdi. Sert bir müdahale.`]);
      case "kirmizi": return `${dk} ${n(e.oyuncu)} ikinci sarıdan oyun dışında! ${T(e.takim)} 10 kişi kaldı.`;
      case "degisiklik": return `${dk} ${T(e.takim)} değişiklik yaptı: ${n(e.cikan)} çıktı, ${n(e.oyuncu)} girdi.`;
      case "taktik": return `${dk} ${T(e.takim)} oyununu değiştirdi: ${e.dizilis}, ${ANLAYISLAR[e.anlayis].ad.toLocaleLowerCase("tr-TR")}.`;
      case "bagir": return `${dk} ${T(e.takim)} kenarından bir ses: "${BAGIRISLAR[e.tur].yazi}"`;
    }
    return "";
  }

  return { yeni, dakikaOyna, dakikaYazi, sonucaGec, puanlar, hizliOyna, taktikDegis, degistir, yerDegistir, bagir, sahada, talimatEtkisi, BAGIRISLAR };
})();
