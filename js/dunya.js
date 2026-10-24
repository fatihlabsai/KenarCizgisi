// Dünyanın kurulması: kulüplerin kadroları, oyuncuların özellikleri ve güç hesapları.
const DUNYA = (() => {
  const sinirla = (v, a, b) => Math.max(a, Math.min(b, v));
  // Yaklaşık normal dağılım: çoğu değer -1 ile 1 arasında, ortalaması 0
  const gauss = (rnd) => (rnd() + rnd() + rnd() - 1.5) / 1.5;
  const sec = (rnd, a) => a[Math.floor(rnd() * a.length)];

  // Mevkiye göre özelliklerin ortalamadan farkı
  const PROFIL = {
    KL: { kaleci: 3, sut: -6, teknik: -3, savunma: -3, hiz: -2, pas: -2, dayaniklilik: 0 },
    DF: { kaleci: -9, sut: -3, teknik: -1, savunma: 3, hiz: 0, pas: 0, dayaniklilik: 1 },
    OS: { kaleci: -9, sut: 0, teknik: 1.5, savunma: 0, hiz: 0, pas: 2.5, dayaniklilik: 1 },
    FV: { kaleci: -9, sut: 3, teknik: 1, savunma: -3, hiz: 1.5, pas: -0.5, dayaniklilik: 0 },
  };
  // Bir oyuncunun belli bir mevkideki gücü hesaplanırken özelliklerin ağırlığı
  const AGIRLIK = {
    KL: { kaleci: 0.75, pas: 0.1, hiz: 0.05, dayaniklilik: 0.1 },
    DF: { savunma: 0.45, hiz: 0.2, pas: 0.15, teknik: 0.05, dayaniklilik: 0.15 },
    OS: { pas: 0.35, teknik: 0.25, dayaniklilik: 0.15, savunma: 0.1, sut: 0.1, hiz: 0.05 },
    FV: { sut: 0.4, teknik: 0.25, hiz: 0.2, pas: 0.05, dayaniklilik: 0.1 },
  };
  const KADRO_DUZENI = ["KL", "KL", "DF", "DF", "DF", "DF", "DF", "DF", "OS", "OS", "OS", "OS", "OS", "OS", "FV", "FV", "FV", "FV"];

  function kokenSec(rnd, dagilim) {
    let r = rnd();
    for (const [k, p] of Object.entries(dagilim)) { if ((r -= p) <= 0) return k; }
    return "c";
  }

  function oyuncuUret(rnd, kulup, mevki, sira, kullanilan) {
    const koken = kokenSec(rnd, kulup.koken);
    const liste = ISIMLER[koken];
    let soyad, deneme = 0;
    do { soyad = sec(rnd, liste.soyad); } while (kullanilan.has(soyad) && ++deneme < 20);
    kullanilan.add(soyad);
    const taban = kulup.guc / 5 + gauss(rnd) * 1.6;
    const oz = {};
    for (const [k, fark] of Object.entries(PROFIL[mevki])) oz[k] = Math.round(sinirla(taban + fark + gauss(rnd) * 2.2, 1, 20));
    const yas = 18 + Math.floor(rnd() * 16);
    return {
      id: `${kulup.id}-${sira}`,
      ad: sec(rnd, liste.ad), soyad, koken, yas, mevki, oz,
      kondisyon: Math.round(88 + rnd() * 12),
      moral: Math.round(55 + rnd() * 15),
      form: 0, maclar: 0, gol: 0,
      gelisim: {},
      gorunus: {
        ten: Math.floor(rnd() * 3),
        sac: 1 + Math.floor(rnd() * 6),
        sacRenk: Math.floor(rnd() * (yas > 30 ? 5 : 4)),
        sakal: rnd() < 0.7 ? 0 : 1 + Math.floor(rnd() * 4),
      },
    };
  }

  function kadroUret(rnd, kulup) {
    const kullanilan = new Set();
    const kadro = KADRO_DUZENI.map((m, i) => oyuncuUret(rnd, kulup, m, i, kullanilan));
    // Forma numaraları: kaleciler 1 ve 12, diğerleri mevki sırasıyla
    const numaralar = { KL: [1, 12], DF: [2, 3, 4, 5, 13, 15], OS: [6, 8, 10, 14, 16, 18], FV: [7, 9, 11, 17] };
    const say = { KL: 0, DF: 0, OS: 0, FV: 0 };
    for (const o of kadro) { o.no = numaralar[o.mevki][say[o.mevki]++]; sozlesmeVer(o, rnd, 2027 + Math.floor(rnd() * 3)); }
    return kadro;
  }

  // ---------- Sözleşme ve değer ----------
  // Değer (bonservis) ve maaş, oyuncunun gücüne ve yaşına göre. Carceria yarı profesyonel bir lig, rakamlar küçük.
  function deger(o) {
    const g = Math.max(0, guc(o) - 35);
    const yasF = o.yas <= 21 ? 1.35 : o.yas <= 25 ? 1.15 : o.yas <= 29 ? 1 : o.yas <= 31 ? 0.7 : 0.4;
    return Math.max(1000, Math.round((g * g * 26 * yasF) / 500) * 500);
  }
  const maasIstegi = (o) => Math.max(120, Math.round(((guc(o) - 28) * 17) / 10) * 10);
  function sozlesmeVer(o, rnd, bitisYili) {
    o.maas = Math.round((maasIstegi(o) * (0.85 + rnd() * 0.3)) / 10) * 10;
    o.bitis = `${bitisYili}-06-30`;
  }

  // Sakat ya da cezalı oyuncu maça çıkamaz
  const uygun = (o) => !(o.sakatlik && o.sakatlik.gun > 0) && !(o.ceza > 0);

  // S.takimlar: her kulübün değişen bilgileri (kadro, taktik, bütçe)
  function kur(S) {
    const rnd = KARAKTER.tohumlu(S.tohum);
    S.takimlar = {};
    for (const k of KULUPLER) {
      const kadro = kadroUret(rnd, k);
      const dizilis = k.guc >= 60 ? "4-3-3" : k.guc <= 50 ? "5-3-2" : sec(rnd, ["4-4-2", "4-4-2", "4-5-1"]);
      S.takimlar[k.id] = { kadro, taktik: yeniTaktik(kadro, dizilis), butce: ilkButce(k, kadro) };
    }
  }

  function yeniTaktik(kadro, dizilis) {
    const t = { dizilis, anlayis: "dengeli", talimat: { hat: "normal", pres: "normal", pas: "karisik", genislik: "normal" }, gorev: {}, ilk11: enIyi11(kadro, dizilis) };
    gorevleriTamamla(t, kadro);
    return t;
  }

  // Kaptan, penaltıcı, korner/frikik kullanıcısı: boşsa ya da sahada değilse en uygun oyuncu
  function gorevleriTamamla(t, kadro) {
    t.gorev ||= {};
    const sahada = kadro.filter((o) => t.ilk11.includes(o.id));
    if (!sahada.length) return;
    const en = (f) => sahada.slice().sort((a, b) => f(b) - f(a))[0].id;
    if (!t.ilk11.includes(t.gorev.kaptan)) t.gorev.kaptan = en((o) => o.yas * 2 + o.moral / 10);
    if (!t.ilk11.includes(t.gorev.penalti)) t.gorev.penalti = en((o) => (o.mevki === "KL" ? -99 : o.oz.sut + o.oz.teknik * 0.5));
    if (!t.ilk11.includes(t.gorev.duran)) t.gorev.duran = en((o) => (o.mevki === "KL" ? -99 : o.oz.pas + o.oz.teknik * 0.5));
  }

  function ilkButce(k, kadro) {
    const maaslar = kadro.reduce((a, o) => a + o.maas, 0);
    return { transfer: Math.round(((k.guc - 40) ** 2 * 85) / 1000) * 1000, maasLimit: Math.round((maaslar * 1.12) / 100) * 100 };
  }

  // Bonservisi olmayan oyuncular (sözleşmesi biten ya da kulüpsüz)
  function serbestUret(S, adet = 16) {
    const rnd = KARAKTER.tohumlu(S.tohum + 77);
    const sahte = { id: "serbest", guc: 46, koken: { c: 0.5, s: 0.25, o: 0.25 } };
    const kullanilan = new Set();
    const mevkiler = ["KL", "DF", "DF", "DF", "OS", "OS", "OS", "FV", "FV"];
    S.serbest = [];
    for (let i = 0; i < adet; i++) {
      const m = mevkiler[i % mevkiler.length];
      sahte.guc = 40 + rnd() * 18;
      const o = oyuncuUret(rnd, sahte, m, "s" + i + "-" + Math.floor(rnd() * 1e5), kullanilan);
      o.yas = Math.min(35, o.yas + Math.floor(rnd() * 5));
      o.no = 0; o.maas = maasIstegi(o); o.bitis = null;
      S.serbest.push(o);
    }
  }

  // Kadro 18'in altına düşerse gençlerden oyuncu eklenir (yapay zekâ kulüpleri için)
  function kadroTamamla(S, id, rnd = Math.random) {
    const t = S.takimlar[id], k = kulupBul(id);
    const kullanilan = new Set(t.kadro.map((o) => o.soyad));
    const say = (m) => t.kadro.filter((o) => o.mevki === m).length;
    const gerekli = { KL: 2, DF: 6, OS: 6, FV: 4 };
    for (const [m, n] of Object.entries(gerekli)) {
      while (say(m) < n) {
        const o = oyuncuUret(rnd, { ...k, guc: k.guc - 6 }, m, "g" + Date.now().toString(36) + Math.floor(rnd() * 1e6), kullanilan);
        o.yas = 17 + Math.floor(rnd() * 3);
        o.no = bosNumara(t.kadro);
        sozlesmeVer(o, rnd, Number(S.tarih.slice(0, 4)) + 2);
        t.kadro.push(o);
      }
    }
  }
  function bosNumara(kadro) {
    const dolu = new Set(kadro.map((o) => o.no));
    for (let n = 19; n < 99; n++) if (!dolu.has(n)) return n;
    return 99;
  }

  // Oyuncunun belli bir mevkideki gücü (0–100). Kendi mevkisi dışında oynarsa düşer.
  function guc(o, mevki = o.mevki) {
    let t = 0;
    for (const [k, a] of Object.entries(AGIRLIK[mevki])) t += o.oz[k] * a;
    let g = t * 5;
    if (mevki !== o.mevki) g *= mevki === "KL" || o.mevki === "KL" ? 0.35 : 0.8;
    return g;
  }

  // Dizilişin her yerine en uygun oyuncuyu yerleştirir (önce kaleci, sonra sırayla)
  function enIyi11(kadro, dizilis, haric = new Set()) {
    const yerler = DIZILISLER[dizilis];
    const secilen = new Array(yerler.length).fill(null);
    const kullanildi = new Set(haric);
    // Sakat ve cezalılar ancak başka kimse kalmadıysa seçilir
    const puan = (o, m) => guc(o, m) * (0.55 + 0.45 * o.kondisyon / 100) * (uygun(o) ? 1 : 0.01);
    const sira = yerler.map((y, i) => i).sort((a, b) => (yerler[a][0] === "KL" ? -1 : 0) - (yerler[b][0] === "KL" ? -1 : 0));
    for (const i of sira) {
      let en = null;
      for (const o of kadro) {
        if (kullanildi.has(o.id)) continue;
        if (!en || puan(o, yerler[i][0]) > puan(en, yerler[i][0])) en = o;
      }
      if (en) { secilen[i] = en.id; kullanildi.add(en.id); }
    }
    return secilen;
  }

  // Diziliş değişince mevcut on biri yeni yerlere en uygun şekilde dağıtır
  function yenidenYerlestir(kadro, ilk11, dizilis) {
    const oynayan = kadro.filter((o) => ilk11.includes(o.id));
    const yerlesik = enIyi11(oynayan, dizilis);
    return yerlesik.map((id, i) => id || enIyi11(kadro, dizilis)[i]);
  }

  const adSoyad = (o) => `${o.ad} ${o.soyad}`;
  const oyuncuBul = (S, id) => {
    for (const t of Object.values(S.takimlar)) { const o = t.kadro.find((x) => x.id === id); if (o) return o; }
    return (S.serbest || []).find((x) => x.id === id) || null;
  };
  // Takımın ortalama gücü (ilk on bire göre)
  function takimGucu(S, id) {
    const t = S.takimlar[id];
    const yerler = DIZILISLER[t.taktik.dizilis];
    let top = 0;
    t.taktik.ilk11.forEach((oid, i) => { const o = t.kadro.find((x) => x.id === oid); if (o) top += guc(o, yerler[i][0]); });
    return top / yerler.length;
  }

  // Haftalık doğal gelişim (her kulüp için): gençler maç ve idmanla kendiliğinden gelişir, 31'den sonra hız ve dayanıklılık düşer.
  // Bizim takımın antrenmanları bunun üstüne eklenir.
  const PASIF = { KL: ["kaleci", "kaleci", "pas"], DF: ["savunma", "hiz", "pas", "dayaniklilik"], OS: ["pas", "teknik", "dayaniklilik", "sut"], FV: ["sut", "teknik", "hiz"] };
  function haftalikGelisim(S) {
    for (const t of Object.values(S.takimlar)) for (const o of t.kadro) {
      const f = o.yas <= 20 ? 1 : o.yas <= 23 ? 0.7 : o.yas <= 27 ? 0.35 : o.yas <= 30 ? 0.1 : 0;
      if (f) {
        const liste = PASIF[o.mevki], k = liste[Math.floor(Math.random() * liste.length)];
        o.gelisim[k] = (o.gelisim[k] || 0) + 0.12 * f;
        if (o.gelisim[k] >= 1 && o.oz[k] < 20) { o.gelisim[k] -= 1; o.oz[k]++; }
      }
      if (o.yas >= 31 && Math.random() < 0.25) {
        const k = Math.random() < 0.6 ? "hiz" : "dayaniklilik";
        o.gelisim[k] = (o.gelisim[k] || 0) - 0.35;
        if (o.gelisim[k] <= -1) { o.gelisim[k] += 1; o.oz[k] = Math.max(1, o.oz[k] - 1); }
      }
    }
  }

  // Oyuncunun kulübü (serbestse null)
  function kulubu(S, id) {
    for (const [kid, t] of Object.entries(S.takimlar)) if (t.kadro.some((o) => o.id === id)) return kid;
    return null;
  }

  return {
    kur, guc, enIyi11, yenidenYerlestir, adSoyad, oyuncuBul, takimGucu, sinirla, gauss,
    deger, maasIstegi, sozlesmeVer, uygun, haftalikGelisim, yeniTaktik, gorevleriTamamla, ilkButce, serbestUret, kadroTamamla, bosNumara, kulubu, oyuncuUret,
  };
})();
