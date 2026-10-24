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
    for (const o of kadro) o.no = numaralar[o.mevki][say[o.mevki]++];
    return kadro;
  }

  // S.takimlar: her kulübün değişen bilgileri (kadro, taktik)
  function kur(S) {
    const rnd = KARAKTER.tohumlu(S.tohum);
    S.takimlar = {};
    for (const k of KULUPLER) {
      const kadro = kadroUret(rnd, k);
      const dizilis = k.guc >= 60 ? "4-3-3" : k.guc <= 50 ? "5-3-2" : sec(rnd, ["4-4-2", "4-4-2", "4-5-1"]);
      S.takimlar[k.id] = { kadro, taktik: { dizilis, anlayis: "dengeli", ilk11: enIyi11(kadro, dizilis) } };
    }
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
    const puan = (o, m) => guc(o, m) * (0.55 + 0.45 * o.kondisyon / 100);
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
    return null;
  };
  // Takımın ortalama gücü (ilk on bire göre)
  function takimGucu(S, id) {
    const t = S.takimlar[id];
    const yerler = DIZILISLER[t.taktik.dizilis];
    let top = 0;
    t.taktik.ilk11.forEach((oid, i) => { const o = t.kadro.find((x) => x.id === oid); if (o) top += guc(o, yerler[i][0]); });
    return top / yerler.length;
  }

  return { kur, guc, enIyi11, yenidenYerlestir, adSoyad, oyuncuBul, takimGucu, sinirla, gauss };
})();
