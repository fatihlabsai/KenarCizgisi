// Menajerin parası: evler, mobilya, araba, banka, yatırımlar ve "Hayatım" ekranı. Ay başında gelir-gider işlenir.
const EKONOMI = (() => {
  const sinirla = DUNYA.sinirla;
  // 💡 Ev, araba, mağaza ve marka isimleri öneri
  const EVLER = {
    "ev:daire": { ad: "Lale Sokak 4, tek oda", adres: "Lale Sokak No 4", bolge: "lale", kapi: { x: 5, y: 10 }, kira: 620, satis: null, konfor: 0 },
    "ev:kavakli": { ad: "Kavaklı Apartmanı, iki oda", adres: "Kavaklı Apt. Lale Sokak 9", bolge: "lale", kapi: { x: 13, y: 10 }, kira: 900, satis: 68000, konfor: 1 },
    "ev:bahceli": { ad: "Ova Yolu 12, bahçeli ev", adres: "Ova Yolu No 12", bolge: "ova", kapi: { x: 6, y: 8 }, kira: 1400, satis: 110000, konfor: 2 },
  };
  const ARABALAR = [
    { id: "bisiklet", ad: "Bisiklet", fiyat: 350, gider: 0, itibar: 0, sure: 15 },
    { id: "ova1300", ad: "Ova 1300 (ikinci el)", fiyat: 3800, gider: 60, itibar: 2, sure: 10, satir: 24 },
    { id: "brio", ad: "Ferrano Brio (ikinci el)", fiyat: 6900, gider: 85, itibar: 4, sure: 10, satir: 16 },
    { id: "delta", ad: "Tyrenna Delta (sıfır)", fiyat: 14500, gider: 120, itibar: 7, sure: 8, satir: 20 },
  ];
  // Mobilya: evde görünür, uyurken toparlanmayı artırır
  const MOBILYA = [
    { id: "saksi", ad: "Saksı çiçekleri", fiyat: 60, stres: 1, karo: [17, 0] },
    { id: "tablo", ad: "Kalvar Ovası tablosu", fiyat: 150, stres: 1, karo: [21, 12] },
    { id: "hali", ad: "Yün halı", fiyat: 180, stres: 1, karo: [16, 10], zemin: true },
    { id: "koltuk", ad: "Rahat koltuk", fiyat: 450, stres: 2, karo: [22, 4] },
    { id: "yatak", ad: "Yeni yatak", fiyat: 520, enerji: 5, karo: [14, 6] },
    { id: "piyano", ad: "İkinci el piyano", fiyat: 1900, stres: 3, karo: [23, 8], genis: true },
  ];
  // Her evde mobilyanın duracağı yer (karo)
  const YERLER = {
    "ev:daire": { saksi: [11, 7], tablo: [4, 0], hali: [2, 6], koltuk: [7, 3], yatak: [10, 3], piyano: [7, 6] },
    "ev:kavakli": { saksi: [12, 8], tablo: [10, 0], hali: [3, 7], koltuk: [10, 4], yatak: [11, 3], piyano: [5, 7] },
    "ev:bahceli": { saksi: [14, 8], tablo: [3, 0], hali: [3, 7], koltuk: [12, 6], yatak: [13, 3], piyano: [10, 8] },
  };
  const YATIRIMLAR = [
    { id: "tessel", ad: "Tessel'de kiralık daire", aciklama: "Kiraya verilir. Ayda yaklaşık ₡340 gelir, ara sıra tamir ya da ödemeyen kiracı.", fiyat: 26000, gelir: 340 },
    { id: "arsa", ad: "Mirov'da arsa", aciklama: "Gelir getirmez. Değeri her ay biraz oynar, uzun vadede artması beklenir.", fiyat: 12000, gelir: 0 },
    { id: "yazlik", ad: "Mirov'da yazlık", aciklama: "Yazın kiraya verilir (haziran–ağustos ayda ₡650). Değeri yavaşça artar.", fiyat: 60000, gelir: 0 },
  ];

  const ev = (id) => EVLER[id];
  const sahipMi = (id) => S.hayat.yatirimlar.some((y) => y.id === id);

  // ---------- Ev içi ve kapı önü ----------
  function evEsyalari(evId) {
    const yerler = YERLER[evId] || {};
    return S.hayat.mobilya.filter((m) => yerler[m]).map((m) => {
      const t = MOBILYA.find((x) => x.id === m), [x, y] = yerler[m];
      const n = { tip: "esya", x, y, s: t.karo[0], r: t.karo[1], zemin: t.zemin };
      return t.genis ? [n, { tip: "esya", x: x + 1, y, s: t.karo[0] + 1, r: t.karo[1] }] : [n];
    }).flat();
  }
  function disEkler(bolgeId) {
    const a = S.hayat.araba && ARABALAR.find((x) => x.id === S.hayat.araba);
    const e = EVLER[S.ev.id];
    if (!a || !e || e.bolge !== bolgeId) return [];
    if (!a.satir) return [{ tip: "karo", x: e.kapi.x + 1, y: e.kapi.y - 1, karolar: [[14, 24]] }];
    return [{ tip: "araba", x: e.kapi.x + 2, y: e.kapi.y - 1, satir: a.satir, sola: false }];
  }

  // Uykudaki toparlanma: evin konforu ve mobilya
  function konfor() {
    const e = EVLER[S.ev.id] || { konfor: 0 };
    let stres = e.konfor * 2, enerji = e.konfor * 3;
    for (const m of S.hayat.mobilya) { const t = MOBILYA.find((x) => x.id === m); if (t) { stres += t.stres || 0; enerji += t.enerji || 0; } }
    return { stres, enerji };
  }

  // ---------- Paneller ----------
  function panel(tur, geri) {
    ({ banka: bankaPanel, emlak: emlakPanel, esya: esyaPanel, galeri: galeriPanel })[tur](geri);
  }
  const kapat = (geri) => { ARAYUZ.pencereKapat(); kaydet(true); HAFTA.hudYenile(); geri && geri(); };
  const yetersiz = () => ARAYUZ.bildirim("Paran yetmiyor. Bankadan kredi çekebilirsin.");

  function emlakPanel(geri) {
    const evler = Object.entries(EVLER).map(([id, e]) => {
      const burada = S.ev.id === id;
      const sahip = sahipMi(id);
      return `<div class="yuva"><div><b>${kacir(e.ad)}${burada ? " · burada oturuyorsun" : ""}</b>
        <span>Kira ${para(e.kira)} / ay${e.satis ? ` · satış ${para(e.satis)}` : ""} · konfor ${"★".repeat(e.konfor + 1)}${sahip ? " · senin" : ""}</span></div>
        <div>${burada ? "" : `${sahip ? `<button class="dugme kucuk" data-tasin="${id}">Taşın</button>` : `<button class="dugme kucuk ikincil" data-kirala="${id}">Kirala</button>${e.satis ? ` <button class="dugme kucuk" data-al="${id}">Satın al</button>` : ""}`}`}</div></div>`;
    }).join("");
    const yat = YATIRIMLAR.map((y) => {
      const s = S.hayat.yatirimlar.find((x) => x.id === y.id);
      return `<div class="yuva"><div><b>${kacir(y.ad)}${s ? " · senin" : ""}</b><span>${kacir(y.aciklama)} ${s ? `Şu anki değeri ${para(s.deger)}.` : `Fiyatı ${para(y.fiyat)}.`}</span></div>
        <div>${s ? `<button class="dugme kucuk ikincil" data-sat="${y.id}">Sat</button>` : `<button class="dugme kucuk" data-yatir="${y.id}">Satın al</button>`}</div></div>`;
    }).join("");
    ARAYUZ.pencereAc("Varga Emlak", `<p class="soluk">Ilse Varga dosyaları açıyor. Taşınma masrafı ${para(150)}. Cebinde ${para(S.para)} var.</p>
      <div class="ayar"><div class="ayar-baslik">Evler</div><div class="yuvalar">${evler}</div></div>
      <div class="ayar"><div class="ayar-baslik">Yatırım</div><div class="yuvalar">${yat}</div></div>`, [{ yazi: "Kapat", fn: () => kapat(geri) }]);
    const g = $("pencere-govde");
    g.querySelectorAll("[data-kirala]").forEach((b) => { b.onclick = () => tasin(b.dataset.kirala, false, geri); });
    g.querySelectorAll("[data-al]").forEach((b) => { b.onclick = () => tasin(b.dataset.al, true, geri); });
    g.querySelectorAll("[data-tasin]").forEach((b) => { b.onclick = () => tasin(b.dataset.tasin, "sahip", geri); });
    g.querySelectorAll("[data-yatir]").forEach((b) => { b.onclick = () => yatirimAl(b.dataset.yatir, geri); });
    g.querySelectorAll("[data-sat]").forEach((b) => { b.onclick = () => yatirimSat(b.dataset.sat, geri); });
  }

  function tasin(id, satinAl, geri) {
    const e = EVLER[id];
    const bedel = 150 + (satinAl === true ? e.satis : 0);
    if (S.para < bedel) return yetersiz();
    S.para -= bedel;
    if (satinAl === true) S.hayat.yatirimlar.push({ id, ad: e.ad, deger: e.satis, ev: true });
    const sahip = satinAl === true || satinAl === "sahip";
    S.ev = { id, adres: e.adres, sehir: "Kalvar", kira: sahip ? 0 : e.kira, sahip };
    S.gunluk.push({ tarih: S.tarih, metin: `Taşındın: ${e.ad}${sahip ? " (senin)" : ""}` });
    S.itibar.sehir = sinirla(S.itibar.sehir + e.konfor * 2, 0, 100);
    ARAYUZ.bildirim(`Yeni evin: ${e.ad}`);
    emlakPanel(geri);
  }

  function yatirimAl(id, geri) {
    const y = YATIRIMLAR.find((x) => x.id === id);
    if (S.para < y.fiyat) return yetersiz();
    S.para -= y.fiyat;
    S.hayat.yatirimlar.push({ id, ad: y.ad, deger: y.fiyat, alis: S.tarih });
    S.gunluk.push({ tarih: S.tarih, metin: `Yatırım: ${y.ad} (${para(y.fiyat)})` });
    emlakPanel(geri);
  }
  function yatirimSat(id, geri) {
    const s = S.hayat.yatirimlar.find((x) => x.id === id);
    if (!s) return;
    if (S.ev.id === id) return ARAYUZ.bildirim("İçinde oturduğun evi satamazsın, önce taşın.");
    const tutar = Math.round(s.deger * 0.96 / 100) * 100;
    S.para += tutar;
    S.hayat.yatirimlar = S.hayat.yatirimlar.filter((x) => x !== s);
    S.gunluk.push({ tarih: S.tarih, metin: `Satıldı: ${s.ad} (${para(tutar)})` });
    emlakPanel(geri);
  }

  function esyaPanel(geri) {
    const liste = MOBILYA.map((m) => {
      const var_ = S.hayat.mobilya.includes(m.id);
      return `<div class="yuva"><div><b>${kacir(m.ad)}</b><span>${para(m.fiyat)} · ${m.enerji ? `uyurken +${m.enerji} enerji` : `evde stres −${m.stres}`}</span></div>
        <div>${var_ ? "Evinde" : `<button class="dugme kucuk" data-mob="${m.id}">Al</button>`}</div></div>`;
    }).join("");
    ARAYUZ.pencereAc("Petri Eşya", `<p class="soluk">Petri usta: "Aldığınızı yarın sabah eve bırakırız." Cebinde ${para(S.para)} var.</p><div class="yuvalar">${liste}</div>`, [{ yazi: "Kapat", fn: () => kapat(geri) }]);
    $("pencere-govde").querySelectorAll("[data-mob]").forEach((b) => {
      b.onclick = () => {
        const m = MOBILYA.find((x) => x.id === b.dataset.mob);
        if (S.para < m.fiyat) return yetersiz();
        S.para -= m.fiyat; S.hayat.mobilya.push(m.id);
        S.gunluk.push({ tarih: S.tarih, metin: `Eve ${m.ad.toLocaleLowerCase("tr-TR")} alındı` });
        esyaPanel(geri);
      };
    });
  }

  function galeriPanel(geri) {
    const simdiki = ARABALAR.find((a) => a.id === S.hayat.araba);
    const liste = ARABALAR.map((a) => `<div class="yuva"><div><b>${kacir(a.ad)}${simdiki === a ? " · senin" : ""}</b>
      <span>${para(a.fiyat)}${a.gider ? ` · bakım ve yakıt ayda ${para(a.gider)}` : ""} · bölgeler arası ${a.sure} dakika${a.itibar ? ` · şehirde itibar +${a.itibar}` : ""}</span></div>
      <div>${simdiki === a ? "" : `<button class="dugme kucuk" data-araba="${a.id}">Al</button>`}</div></div>`).join("");
    ARAYUZ.pencereAc("Kask Oto Galeri", `<p class="soluk">Rado Kask: "Eskisini de alırım, değerinin yüzde altmışından." Cebinde ${para(S.para)} var.</p><div class="yuvalar">${liste}</div>`, [{ yazi: "Kapat", fn: () => kapat(geri) }]);
    $("pencere-govde").querySelectorAll("[data-araba]").forEach((b) => {
      b.onclick = () => {
        const a = ARABALAR.find((x) => x.id === b.dataset.araba);
        const takas = simdiki ? Math.round(simdiki.fiyat * 0.6) : 0;
        if (S.para + takas < a.fiyat) return yetersiz();
        S.para += takas - a.fiyat;
        S.hayat.araba = a.id;
        S.itibar.sehir = sinirla(S.itibar.sehir + a.itibar - (simdiki ? simdiki.itibar : 0), 0, 100);
        S.gunluk.push({ tarih: S.tarih, metin: `${a.ad} alındı` });
        galeriPanel(geri);
      };
    });
  }

  const krediLimiti = () => Math.max(0, S.maas * 8 - S.hayat.banka.borc);
  function bankaPanel(geri) {
    const bk = S.hayat.banka;
    const tus = (veri, deger, yazi) => `<button class="secenek" data-${veri}="${deger}">${yazi}</button>`;
    ARAYUZ.pencereAc("Kalvar Bankası", `
      <p class="soluk">Bay Tamm: "Mevduata aylık %0,4 faiz veriyoruz. Kredinin faizi aylık %1,5, her ay taksitle ödenir."</p>
      <div class="ayar"><div class="ayar-baslik">Cüzdan <span>${para(S.para)}</span></div></div>
      <div class="ayar"><div class="ayar-baslik">Mevduat <span>${para(bk.mevduat)}</span></div>
        <div class="secenekler">${tus("yatir", 500, "₡500 yatır")}${tus("yatir", 2000, "₡2.000 yatır")}${tus("yatir", "hepsi", "Hepsini yatır")}${tus("cek", 500, "₡500 çek")}${tus("cek", "hepsi", "Hepsini çek")}</div></div>
      <div class="ayar"><div class="ayar-baslik">Kredi borcu <span>${para(bk.borc)}${bk.borc ? ` · aylık taksit ${para(taksit())}` : ""}</span></div>
        <div class="secenekler">${tus("kredi", 2000, "₡2.000 çek")}${tus("kredi", 10000, "₡10.000 çek")}${tus("kredi", "limit", `Limitin tamamı (${para(krediLimiti())})`)}${tus("ode", 1000, "₡1.000 öde")}${tus("ode", "hepsi", "Borcu kapat")}</div></div>`,
      [{ yazi: "Kapat", fn: () => kapat(geri) }]);
    const g = $("pencere-govde");
    const miktar = (v, en) => (v === "hepsi" || v === "limit" ? en : Math.min(+v, en));
    g.querySelectorAll("[data-yatir]").forEach((b) => { b.onclick = () => { const m = miktar(b.dataset.yatir, S.para); S.para -= m; bk.mevduat += m; bankaPanel(geri); }; });
    g.querySelectorAll("[data-cek]").forEach((b) => { b.onclick = () => { const m = miktar(b.dataset.cek, bk.mevduat); S.para += m; bk.mevduat -= m; bankaPanel(geri); }; });
    g.querySelectorAll("[data-kredi]").forEach((b) => { b.onclick = () => { const m = miktar(b.dataset.kredi, krediLimiti()); if (m <= 0) return ARAYUZ.bildirim("Kredi limitin doldu"); S.para += m; bk.borc += m; S.gunluk.push({ tarih: S.tarih, metin: `Kredi çekildi: ${para(m)}` }); bankaPanel(geri); }; });
    g.querySelectorAll("[data-ode]").forEach((b) => { b.onclick = () => { const m = Math.min(miktar(b.dataset.ode, bk.borc), S.para); S.para -= m; bk.borc -= m; bankaPanel(geri); }; });
  }
  const taksit = () => Math.min(S.hayat.banka.borc, Math.max(200, Math.round(S.hayat.banka.borc / 12)));

  // Mavro ile ilişki iyiyse kafeye ortaklık teklif eder
  function kafeOrtakligiTeklif(secenekler) {
    if (sahipMi("kafe") || (S.hayat.iliski.mavro ?? 30) < 45) return;
    secenekler.push({ yazi: `Kafeye ortak ol (${para(8000)}, %25)`, fn: () => {
      if (S.para < 8000) return yetersiz();
      S.para -= 8000;
      S.hayat.yatirimlar.push({ id: "kafe", ad: "Gözcü Kafe ortaklığı (%25)", deger: 8000, alis: S.tarih });
      S.gunluk.push({ tarih: S.tarih, metin: "Gözcü Kafe'ye ortak oldun" });
      HAFTA.hudYenile();
      ARAYUZ.bildirim("Artık Gözcü Kafe'nin dörtte biri senin");
    } });
  }

  // ---------- Ay başı ----------
  function aylik(S) {
    const h = S.hayat;
    if (!h) return;
    const satirlar = [];
    const a = ARABALAR.find((x) => x.id === h.araba);
    if (a && a.gider) { S.para -= a.gider; satirlar.push(`araba −${para(a.gider)}`); }
    if (h.banka.mevduat > 0) { const f = Math.round(h.banka.mevduat * 0.004); h.banka.mevduat += f; if (f) satirlar.push(`faiz +${para(f)}`); }
    if (h.banka.borc > 0) {
      h.banka.borc = Math.round(h.banka.borc * 1.015);
      const t = taksit();
      if (S.para >= t) { S.para -= t; h.banka.borc -= t; satirlar.push(`kredi taksiti −${para(t)}`); }
      else if (h.banka.mevduat >= t) { h.banka.mevduat -= t; h.banka.borc -= t; satirlar.push(`kredi taksiti mevduattan −${para(t)}`); }
      else { S.menajer.stres = sinirla(S.menajer.stres + 12, 0, 100); satirlar.push("kredi taksiti ödenemedi!"); }
      S.menajer.stres = sinirla(S.menajer.stres + 2, 0, 100);
    }
    const ay = Number(S.tarih.slice(5, 7));
    for (const y of h.yatirimlar) {
      if (y.id === "tessel") {
        const r = Math.random();
        if (r < 0.06) satirlar.push("Tessel'deki kiracı bu ay ödemedi");
        else if (r < 0.11) { S.para -= 400; satirlar.push("Tessel'deki dairede tamirat −₡400"); }
        else { S.para += 340; satirlar.push("Tessel kira geliri +₡340"); }
        y.deger = Math.round(y.deger * (1 + (Math.random() - 0.4) * 0.01));
      } else if (y.id === "arsa") y.deger = Math.round(y.deger * (1 + (Math.random() - 0.42) * 0.05));
      else if (y.id === "yazlik") {
        y.deger = Math.round(y.deger * (1 + (Math.random() - 0.4) * 0.012));
        if (ay >= 6 && ay <= 8) { S.para += 650; satirlar.push("Mirov yazlık kirası +₡650"); }
      } else if (y.id === "kafe") {
        // Kafenin kârı, avluda kazanılan maçlarla artar
        const gecenAy = TARIH.ekle(S.tarih, -31);
        const galibiyet = S.maclar.filter((m) => m.tarih >= gecenAy && m.ev === S.kulupId && m.evGol > m.depGol).length;
        const kar = Math.max(0, Math.round(90 + galibiyet * 45 + (Math.random() - 0.4) * 100));
        S.para += kar; satirlar.push(`Gözcü Kafe kâr payı +${para(kar)}`);
      } else if (y.ev && S.ev.id !== y.id) {
        // İçinde oturulmayan ev kiraya verilir
        const gelir = Math.round(EVLER[y.id].kira * 0.7);
        S.para += gelir; satirlar.push(`${EVLER[y.id].ad} kira geliri +${para(gelir)}`);
      }
    }
    // Arada bir yağmurlu bir ay
    h.yagmur = [10, 11, 12, 1, 2, 3].includes(ay) && Math.random() < 0.5;
    if (satirlar.length) { S.gunluk.push({ tarih: S.tarih, metin: "Ay başı: " + satirlar.join(", ") }); setTimeout(() => ARAYUZ.bildirim(satirlar.slice(0, 2).join(" · ")), 2200); }
  }

  // ---------- Hayatım ----------
  function hayatim() {
    const h = S.hayat, e = EVLER[S.ev.id];
    const a = ARABALAR.find((x) => x.id === h.araba);
    const cubuk = (ad, v) => `<div class="oz-satir"><span>${ad}</span><div class="oz-cubuk"><i style="width:${Math.round(v)}%"></i></div><b>${Math.round(v)}</b></div>`;
    const kisiler = [
      ...Object.entries(YASAM.TANIDIK).map(([id, t]) => [t.ad, h.iliski[id]]),
      ...S.takimlar[S.kulupId].kadro.filter((o) => h.iliski[o.id] != null).map((o) => [DUNYA.adSoyad(o), h.iliski[o.id]]),
    ].filter(([, v]) => v != null).sort((x, y) => y[1] - x[1]);
    const varlik = S.para + h.banka.mevduat + h.yatirimlar.reduce((t, y) => t + y.deger, 0) - h.banka.borc;
    TAM.ac(`<div class="tam-baslik"><h2>Hayatım</h2><span class="soluk">${kacir(S.menajer.ad)} ${kacir(S.menajer.soyad)}</span><button class="dugme ikincil" id="hayat-kapat">Kapat</button></div>
      <div class="hayat-izgara">
        <div>
          <div class="ayar"><div class="ayar-baslik">Para</div>
            <p>Cüzdan ${para(S.para)} · mevduat ${para(h.banka.mevduat)}${h.banka.borc ? ` · kredi borcu ${para(h.banka.borc)}` : ""}</p>
            <p class="soluk">Maaş ${para(S.maas)} / ay · toplam varlık ${para(varlik)}</p></div>
          <div class="ayar"><div class="ayar-baslik">Ev</div><p>${kacir(e ? e.ad : S.ev.adres)}${S.ev.sahip ? " · senin" : ` · kira ${para(S.ev.kira)}${S.ev.kiraBaslangic && S.tarih < S.ev.kiraBaslangic ? " (şimdilik kulüp ödüyor)" : ""}`}</p>
            <p class="soluk">${h.mobilya.length ? "Eşyalar: " + h.mobilya.map((m) => MOBILYA.find((x) => x.id === m).ad).join(", ") : "Evinde kulübün bıraktığı eşyalardan başka bir şey yok."}</p></div>
          <div class="ayar"><div class="ayar-baslik">Ulaşım</div><p>${a ? kacir(a.ad) : "Yürüyerek ve otobüsle"}</p></div>
          <div class="ayar"><div class="ayar-baslik">Yatırımlar</div>${h.yatirimlar.length ? `<ul>${h.yatirimlar.map((y) => `<li>${kacir(y.ad)} · ${para(y.deger)}</li>`).join("")}</ul>` : `<p class="soluk">Henüz yok. Varga Emlak'a ve Gözcü Kafe'ye uğra.</p>`}</div>
        </div>
        <div>
          <div class="ayar"><div class="ayar-baslik">İtibar</div><div class="oz-liste">
            ${cubuk("Yönetim", S.itibar.yonetim)}${cubuk("Taraftar", S.itibar.taraftar)}${cubuk("Şehir", S.itibar.sehir)}${cubuk("Basın", S.itibar.basin)}</div></div>
          <div class="ayar"><div class="ayar-baslik">İnsanlar</div>
            ${h.tanisma ? `<p><b>${kacir(h.tanisma.ad)}</b>${h.partner ? " · birlikte" : ` · ${ek(h.tanisma.sehir, "den")}, ${TARIH.kisa(h.tanisma.tanisilan)} tarihinde tanıştınız`}</p>${cubuk("Yakınlık", h.tanisma.iliski)}` : ""}
            ${kisiler.length ? `<div class="oz-liste">${kisiler.map(([ad, v]) => cubuk(kacir(ad), v)).join("")}</div>` : `<p class="soluk">Kalvar'da henüz kimseyi tanımıyorsun. Akşamları dolaş, insanlarla konuş.</p>`}</div>
        </div>
      </div>`, null);
    $("hayat-kapat").onclick = TAM.kapat;
  }

  return { ev, evEsyalari, disEkler, konfor, panel, aylik, hayatim, kafeOrtakligiTeklif, ARABALAR, EVLER };
})();
