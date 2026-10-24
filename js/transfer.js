// Transfer: pencereler, oyuncu arama, teklif, satış teklifleri, serbest oyuncular, kulüpler arası transferler.
const TRANSFER = (() => {
  const sinirla = DUNYA.sinirla;
  const KADRO_UST = 25, KADRO_ALT = 16;

  // Yaz penceresi 1 Temmuz–31 Ağustos, kış penceresi ocak ayı
  function acik(tarih = S.tarih) {
    const ay = tarih.slice(5, 7);
    return ay === "07" || ay === "08" || ay === "01";
  }
  const bizim = () => S.takimlar[S.kulupId];

  // Satıcı kulübün kabul edeceği en düşük bedel: önemli oyuncu daha pahalı
  function istenen(kid, o) {
    const t = S.takimlar[kid];
    const sira = t.kadro.slice().sort((a, b) => DUNYA.guc(b) - DUNYA.guc(a)).indexOf(o);
    const onem = sira < 3 ? 0.4 : sira < 8 ? 0.2 : 0.05;
    const sozlesme = o.bitis && o.bitis <= `${S.tarih.slice(0, 4)}-12-31` ? -0.25 : 0; // sözleşmesi bitmek üzereyse ucuz
    return Math.round((DUNYA.deger(o) * (1 + onem + sozlesme)) / 500) * 500;
  }

  // ---------- Oyuncu almak ----------
  function teklifVer(o, kid, miktar, sonra) {
    if (!acik()) { ARAYUZ.bildirim("Transfer dönemi kapalı"); return; }
    const t = bizim();
    if (t.kadro.length >= KADRO_UST) { ARAYUZ.bildirim(`Kadro dolu (en fazla ${KADRO_UST} oyuncu)`); return; }
    if (miktar > t.butce.transfer) { ARAYUZ.bildirim("Transfer bütçesi yetmiyor"); return; }
    const sat = S.takimlar[kid];
    const k = kulupBul(kid);
    const min = istenen(kid, o);
    if (sat.kadro.length <= KADRO_ALT) return cevap(`${k.kisa}: "Kadromuz zaten dar, kimseyi bırakamayız."`, sonra);
    if (miktar >= min) {
      ARAYUZ.pencereAc("Teklif kabul edildi", `<p>${kacir(k.ad)}, ${para(miktar)} teklifini kabul etti. Şimdi oyuncuyla sözleşme konuşulacak.</p>`, [
        { yazi: "Görüşmeye başla", fn: () => SOZLESME.gorusme({ o, tur: "transfer", eskiKulup: kid, bonservis: miktar, bitince: (ok) => { if (ok) tamamla(o, kid, S.kulupId, miktar); sonra && sonra(); } }) },
      ]);
    } else if (miktar >= min * 0.8) {
      ARAYUZ.pencereAc("Karşı teklif", `<p>${kacir(k.kisa)}: "${kacir(o.soyad)} için ${para(min)} altına konuşmayız."</p>`, [
        { yazi: "Vazgeç", ikincil: true, fn: () => { ARAYUZ.pencereKapat(); sonra && sonra(); } },
        { yazi: `${para(min)} öde`, fn: () => teklifVer(o, kid, min, sonra) },
      ]);
    } else cevap(`${k.kisa} teklifi geri çevirdi: "Ciddi bir teklif bekliyoruz."`, sonra);
  }
  const cevap = (metin, sonra) => ARAYUZ.pencereAc("Cevap geldi", `<p>${kacir(metin)}</p>`, [{ yazi: "Tamam", fn: () => { ARAYUZ.pencereKapat(); sonra && sonra(); } }]);

  function serbestAl(o, sonra) {
    const t = bizim();
    if (t.kadro.length >= KADRO_UST) { ARAYUZ.bildirim(`Kadro dolu (en fazla ${KADRO_UST} oyuncu)`); return; }
    SOZLESME.gorusme({ o, tur: "serbest", bitince: (ok) => { if (ok) tamamla(o, null, S.kulupId, 0); sonra && sonra(); } });
  }

  // Oyuncuyu bir kulüpten (ya da serbestten) diğerine taşır
  function tamamla(o, kimden, kime, bedel) {
    if (kimden) S.takimlar[kimden].kadro = S.takimlar[kimden].kadro.filter((x) => x !== o);
    else S.serbest = S.serbest.filter((x) => x !== o);
    const hedef = S.takimlar[kime];
    o.no = DUNYA.bosNumara(hedef.kadro);
    o.moral = Math.max(o.moral, 65);
    delete o.sezon;
    hedef.kadro.push(o);
    if (bedel) { hedef.butce.transfer -= bedel; if (kimden) S.takimlar[kimden].butce.transfer += bedel; }
    for (const kid of [kimden, kime]) if (kid && kid !== S.kulupId) {
      S.takimlar[kid].taktik.ilk11 = DUNYA.enIyi11(S.takimlar[kid].kadro, S.takimlar[kid].taktik.dizilis);
      DUNYA.gorevleriTamamla(S.takimlar[kid].taktik, S.takimlar[kid].kadro);
    }
    if (kimden === S.kulupId) {
      const t = bizim();
      t.taktik.ilk11 = t.taktik.ilk11.map((id) => (id === o.id ? null : id));
      t.taktik.ilk11 = t.taktik.ilk11.map((id, i) => id || DUNYA.enIyi11(t.kadro, t.taktik.dizilis, new Set(t.taktik.ilk11.filter(Boolean)))[i]);
      DUNYA.gorevleriTamamla(t.taktik, t.kadro);
    }
    S.transfer.gecmis.push({ tarih: S.tarih, id: o.id, ad: DUNYA.adSoyad(o), kimden, kime, bedel });
    if (kime === S.kulupId || kimden === S.kulupId) S.gunluk.push({ tarih: S.tarih, metin: `Transfer: ${DUNYA.adSoyad(o)} ${kime === S.kulupId ? "geldi" : "gitti"}${bedel ? ` (${para(bedel)})` : ""}` });
    kaydet(true);
  }

  // ---------- Her gün ----------
  function gunluk() {
    if (!acik()) { S.transfer.gelen = []; return; }
    // Eski teklifler düşer
    S.transfer.gelen = S.transfer.gelen.filter((x) => x.bitis >= S.tarih);
    // Büyük kulüpler zaman zaman bizim oyunculara teklif yapar
    if (Math.random() < 0.07) {
      const bizimKadro = bizim().kadro.slice().sort((a, b) => DUNYA.guc(b) - DUNYA.guc(a)).slice(0, 8);
      const o = bizimKadro[Math.floor(Math.random() * bizimKadro.length)];
      const alicilar = S.lig.kulupler.filter((id) => id !== S.kulupId && kulupBul(id).guc > kulupBul(S.kulupId).guc + 3 && S.takimlar[id].kadro.length < 23);
      if (o && alicilar.length && !S.transfer.gelen.some((x) => x.id === o.id)) {
        const alici = alicilar[Math.floor(Math.random() * alicilar.length)];
        const miktar = Math.round((DUNYA.deger(o) * (0.85 + Math.random() * 0.45)) / 500) * 500;
        if (miktar <= S.takimlar[alici].butce.transfer) {
          S.transfer.gelen.push({ id: o.id, alici, miktar, bitis: TARIH.ekle(S.tarih, 5) });
          setTimeout(() => ARAYUZ.bildirim(`${kulupBul(alici).kisa}, ${o.soyad} için ${para(miktar)} teklif etti`), 400);
        }
      }
    }
    // Pazartesileri kulüpler kendi aralarında transfer yapar
    if (HAFTA.haftaGunu(S.tarih) === 1) yapayZekaTransferleri();
  }

  function yapayZekaTransferleri() {
    const kulupler = S.lig.kulupler.filter((id) => id !== S.kulupId);
    for (let i = 0; i < 3; i++) {
      if (Math.random() < 0.4) continue;
      const alici = kulupler[Math.floor(Math.random() * kulupler.length)];
      const ta = S.takimlar[alici];
      if (ta.kadro.length >= 22) continue;
      const saticilar = kulupler.filter((id) => id !== alici && kulupBul(id).guc < kulupBul(alici).guc && S.takimlar[id].kadro.length > 17);
      if (!saticilar.length) continue;
      const satici = saticilar[Math.floor(Math.random() * saticilar.length)];
      const aday = S.takimlar[satici].kadro.filter((o) => DUNYA.guc(o) > DUNYA.takimGucu(S, alici) - 7 && o.yas < 31).sort((a, b) => DUNYA.guc(b) - DUNYA.guc(a))[0];
      if (!aday) continue;
      const bedel = istenen(satici, aday);
      if (bedel > ta.butce.transfer) continue;
      aday.maas = Math.round((aday.maas * 1.15) / 10) * 10;
      tamamla(aday, satici, alici, bedel);
    }
    // Serbest oyunculardan da ara sıra biri bir kulübe gider
    if (S.serbest.length && Math.random() < 0.3) {
      const o = S.serbest.sort((a, b) => DUNYA.guc(b) - DUNYA.guc(a))[0];
      const kid = kulupler.filter((id) => S.takimlar[id].kadro.length < 20).sort(() => Math.random() - 0.5)[0];
      if (kid) { o.bitis = `${Number(S.tarih.slice(0, 4)) + 1}-06-30`; tamamla(o, null, kid, 0); }
    }
  }

  function gelenCevapla(i, kabul) {
    const x = S.transfer.gelen[i];
    if (!x) return;
    const o = DUNYA.oyuncuBul(S, x.id);
    S.transfer.gelen.splice(i, 1);
    if (kabul && o) {
      if (bizim().kadro.length <= KADRO_ALT) { ARAYUZ.bildirim(`Kadro ${KADRO_ALT} oyuncunun altına düşemez`); return; }
      tamamla(o, S.kulupId, x.alici, x.miktar);
      ARAYUZ.bildirim(`${o.soyad}, ${kulupBul(x.alici).kisa} yolcusu: +${para(x.miktar)}`);
    } else if (o) {
      o.moral = sinirla(o.moral - (x.miktar > DUNYA.deger(o) ? 4 : 1), 0, 100);
    }
    kaydet(true);
  }

  // ---------- Ekran ----------
  let filtre = { mevki: "hepsi", sekme: "ara" };
  function ekran(sekme) {
    if (sekme) filtre.sekme = sekme;
    const t = bizim(), k = kulupBul(S.kulupId);
    const maaslar = t.kadro.reduce((a, o) => a + o.maas, 0);
    const sekmeler = [["ara", "Oyuncu ara"], ["serbest", "Serbest oyuncular"], ["gelen", `Gelen teklifler${S.transfer.gelen.length ? ` (${S.transfer.gelen.length})` : ""}`], ["kadrom", "Sözleşmeler"]]
      .map(([x, y]) => `<button class="secenek" data-sekme="${x}" aria-pressed="${x === filtre.sekme}">${y}</button>`).join("");
    const mevkiler = ["hepsi", "KL", "DF", "OS", "FV"].map((m) => `<button class="secenek" data-mevki="${m}" aria-pressed="${filtre.mevki === m}">${m === "hepsi" ? "Hepsi" : m}</button>`).join("");
    const uygunM = (o) => filtre.mevki === "hepsi" || o.mevki === filtre.mevki;
    const satir = (o, kid, dugme) => `<tr><td>${KADRO.resim(o, kid ? kulupBul(kid) : { forma: "#8d877a", sort: "#2b2f3a" }, 24)}</td><td class="sol"><b>${kacir(DUNYA.adSoyad(o))}</b></td>
      <td>${o.mevki}</td><td>${o.yas}</td><td><b>${Math.round(DUNYA.guc(o))}</b></td><td class="sol">${kid ? kacir(kulupBul(kid).kisa) : "Serbest"}</td>
      <td>${kid ? para(DUNYA.deger(o)) : "–"}</td><td>${para(o.maas)}</td><td>${o.bitis ? o.bitis.slice(0, 4) : "–"}</td><td>${dugme}</td></tr>`;
    const bas = `<thead><tr><th></th><th class="sol">Oyuncu</th><th>Mevki</th><th>Yaş</th><th>Güç</th><th class="sol">Kulüp</th><th>Değer</th><th>Maaş</th><th>Bitiş</th><th></th></tr></thead>`;
    let govde = "";
    if (filtre.sekme === "ara") {
      const liste = [];
      for (const kid of S.lig.kulupler) if (kid !== S.kulupId) for (const o of S.takimlar[kid].kadro) if (uygunM(o)) liste.push({ o, kid });
      liste.sort((a, b) => DUNYA.guc(b.o) - DUNYA.guc(a.o));
      govde = `<div class="secenekler">${mevkiler}</div><div class="tablo-kutu kisa"><table class="tablo">${bas}<tbody>${liste.slice(0, 60).map((x) => satir(x.o, x.kid, `<button class="dugme kucuk" data-teklif="${x.o.id}" data-kulup="${x.kid}">Teklif</button>`)).join("")}</tbody></table></div>`;
    } else if (filtre.sekme === "serbest") {
      const liste = S.serbest.filter(uygunM).sort((a, b) => DUNYA.guc(b) - DUNYA.guc(a));
      govde = `<div class="secenekler">${mevkiler}</div><p class="kucuk-yazi">Bonservis ödenmez, sadece maaş konuşulur.</p><div class="tablo-kutu kisa"><table class="tablo">${bas}<tbody>${liste.map((o) => satir(o, null, `<button class="dugme kucuk" data-serbest="${o.id}">Görüş</button>`)).join("")}</tbody></table></div>`;
    } else if (filtre.sekme === "gelen") {
      govde = S.transfer.gelen.length ? `<div class="gelen-liste">${S.transfer.gelen.map((x, i) => { const o = DUNYA.oyuncuBul(S, x.id); return `<div class="yuva"><div><b>${kacir(kulupBul(x.alici).ad)} · ${kacir(DUNYA.adSoyad(o))}</b><span>Teklif: ${para(x.miktar)} · oyuncunun değeri ${para(DUNYA.deger(o))} · ${TARIH.kisa(x.bitis)} tarihine kadar geçerli</span></div>
        <div><button class="dugme ikincil" data-red="${i}">Reddet</button> <button class="dugme" data-kabul="${i}">Kabul et</button></div></div>`; }).join("")}</div>` : `<p class="soluk">Şu an oyuncuların için teklif yok.</p>`;
    } else {
      const liste = t.kadro.slice().sort((a, b) => (a.bitis || "").localeCompare(b.bitis || ""));
      govde = `<div class="tablo-kutu kisa"><table class="tablo">${bas}<tbody>${liste.map((o) => satir(o, S.kulupId, `<button class="dugme kucuk ikincil" data-uzat="${o.id}">Uzat</button>`)).join("")}</tbody></table></div>`;
    }
    TAM.ac(`<div class="tam-baslik"><h2>Transfer</h2><span class="${acik() ? "iyi" : "kotu"}">${acik() ? "Dönem açık" : "Dönem kapalı · yazın ve ocakta açılır"}</span><button class="dugme ikincil" id="tr-kapat">Kapat</button></div>
      <div class="butce"><span>Transfer bütçesi <b>${para(t.butce.transfer)}</b></span><span>Maaşlar <b>${para(maaslar)} / ${para(t.butce.maasLimit)}</b></span><span>Kadro <b>${t.kadro.length} / ${KADRO_UST}</b></span></div>
      <div class="secenekler sekmeler">${sekmeler}</div>${govde}`, null, "genis");
    const kok = $("oyun-tam-icerik");
    $("tr-kapat").onclick = TAM.kapat;
    kok.querySelectorAll("[data-sekme]").forEach((b) => { b.onclick = () => ekran(b.dataset.sekme); });
    kok.querySelectorAll("[data-mevki]").forEach((b) => { b.onclick = () => { filtre.mevki = b.dataset.mevki; ekran(); }; });
    kok.querySelectorAll("[data-teklif]").forEach((b) => { b.onclick = () => teklifPenceresi(DUNYA.oyuncuBul(S, b.dataset.teklif), b.dataset.kulup); });
    kok.querySelectorAll("[data-serbest]").forEach((b) => { b.onclick = () => serbestAl(DUNYA.oyuncuBul(S, b.dataset.serbest), () => ekran()); });
    kok.querySelectorAll("[data-kabul]").forEach((b) => { b.onclick = () => { gelenCevapla(+b.dataset.kabul, true); ekran(); }; });
    kok.querySelectorAll("[data-red]").forEach((b) => { b.onclick = () => { gelenCevapla(+b.dataset.red, false); ekran(); }; });
    kok.querySelectorAll("[data-uzat]").forEach((b) => { b.onclick = () => SOZLESME.gorusme({ o: DUNYA.oyuncuBul(S, b.dataset.uzat), tur: "uzatma", bitince: () => { kaydet(true); ekran(); } }); });
  }

  function teklifPenceresi(o, kid) {
    if (!acik()) { ARAYUZ.bildirim("Transfer dönemi kapalı"); return; }
    let miktar = Math.round(DUNYA.deger(o) / 500) * 500;
    const ciz = () => {
      ARAYUZ.pencereAc(`Teklif: ${DUNYA.adSoyad(o)}`, `
        <p class="soluk">${kacir(kulupBul(kid).ad)} · ${MEVKI_ADI[o.mevki]} · ${o.yas} yaşında · güç ${Math.round(DUNYA.guc(o))} · değeri ${para(DUNYA.deger(o))}</p>
        <div class="ayar"><div class="ayar-baslik">Bonservis teklifi <span>bütçen ${para(bizim().butce.transfer)}</span></div>
          <div class="sayi-sec"><button class="secenek" data-m="-1000">−1.000</button><button class="secenek" data-m="-500">−500</button><b>${para(miktar)}</b>
          <button class="secenek" data-m="500">+500</button><button class="secenek" data-m="1000">+1.000</button></div></div>`,
        [{ yazi: "Vazgeç", ikincil: true, fn: ARAYUZ.pencereKapat }, { yazi: "Teklifi gönder", fn: () => teklifVer(o, kid, miktar, () => ekran()) }]);
      document.querySelectorAll("#pencere-govde [data-m]").forEach((b) => { b.onclick = () => { miktar = Math.max(500, miktar + +b.dataset.m); ciz(); }; });
    };
    ciz();
  }

  return { acik, gunluk, ekran, tamamla, istenen, teklifVer };
})();
