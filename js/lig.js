// Carceria Ligi: 10 takım, 3 devre, 27 hafta. Fikstür, puan tablosu, maç sonuçlarının işlenmesi, sezon geçişi.
const LIG = (() => {
  const sinirla = DUNYA.sinirla;
  const cumartesi = (yil, ay, gun) => `${yil}-${String(ay).padStart(2, "0")}-${String(gun).padStart(2, "0")}`;

  // Sezonun ilk lig haftası: ağustosun son cumartesi
  function ilkHafta(yil) {
    const d = new Date(Date.UTC(yil, 7, 31));
    while (d.getUTCDay() !== 6) d.setUTCDate(d.getUTCDate() - 1);
    return d.toISOString().slice(0, 10);
  }

  // 27 cumartesi; aralık ortasından ocak başına üç hafta kış arası
  function tarihler(yil) {
    const sonuc = [];
    let t = ilkHafta(yil);
    const kisBas = cumartesiSonra(cumartesi(yil, 12, 17)), kisSon = TARIH.ekle(kisBas, 14);
    while (sonuc.length < 27) {
      if (!(t >= kisBas && t <= kisSon)) sonuc.push(t);
      t = TARIH.ekle(t, 7);
    }
    return { haftalar: sonuc, kisBas, kisSon };
  }
  function cumartesiSonra(s) { let t = s; while (new Date(t + "T00:00:00Z").getUTCDay() !== 6) t = TARIH.ekle(t, 1); return t; }

  // Daire yöntemiyle 9 haftalık devre; 2. devre ev-deplasman ters, 3. devre karışık
  function fiksturUret(S, kulupler, yil) {
    const ids = kulupler.slice();
    const rnd = KARAKTER.tohumlu(S.tohum + yil);
    for (let i = ids.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [ids[i], ids[j]] = [ids[j], ids[i]]; }
    const n = ids.length, devre = [];
    const dizi = ids.slice();
    for (let r = 0; r < n - 1; r++) {
      const maclar = [];
      for (let i = 0; i < n / 2; i++) {
        const a = dizi[i], b = dizi[n - 1 - i];
        maclar.push((r + i) % 2 === 0 ? [a, b] : [b, a]);
      }
      devre.push(maclar);
      dizi.splice(1, 0, dizi.pop());
    }
    const { haftalar, kisBas, kisSon } = tarihler(yil);
    const tum = [
      ...devre,
      ...devre.map((h) => h.map(([a, b]) => [b, a])),
      ...devre.map((h, r) => h.map(([a, b], i) => ((r + i) % 3 === 0 ? [b, a] : [a, b]))),
    ];
    return {
      sezon: `${yil}-${String((yil + 1) % 100).padStart(2, "0")}`,
      yil, kulupler: kulupler.slice(), kisBas, kisSon,
      haftalar: tum.map((maclar, i) => ({ no: i + 1, tarih: haftalar[i], maclar: maclar.map(([ev, dep]) => ({ ev, dep })) })),
      bitti: false,
    };
  }

  const hafta = (S, tarih) => S.lig && S.lig.haftalar.find((h) => h.tarih === tarih);
  function bizimMac(S, tarih) {
    const h = hafta(S, tarih);
    if (!h) return null;
    const m = h.maclar.find((x) => x.ev === S.kulupId || x.dep === S.kulupId);
    return m ? { tur: "lig", hafta: h.no, ev: m.ev === S.kulupId, rakip: m.ev === S.kulupId ? m.dep : m.ev, kayit: m } : null;
  }
  const kisArasi = (S, tarih) => S.lig && tarih >= S.lig.kisBas && tarih <= TARIH.ekle(S.lig.kisSon, 6);
  const sonHafta = (S) => S.lig.haftalar[S.lig.haftalar.length - 1];

  // ---------- Puan durumu ----------
  function tablo(S) {
    const satir = {};
    for (const id of S.lig.kulupler) satir[id] = { id, O: 0, G: 0, B: 0, M: 0, A: 0, Y: 0, P: 0, form: [] };
    for (const h of S.lig.haftalar) for (const m of h.maclar) {
      if (m.evGol == null) continue;
      const e = satir[m.ev], d = satir[m.dep];
      if (!e || !d) continue;
      e.O++; d.O++; e.A += m.evGol; e.Y += m.depGol; d.A += m.depGol; d.Y += m.evGol;
      if (m.evGol > m.depGol) { e.G++; d.M++; e.P += 3; e.form.push("G"); d.form.push("M"); }
      else if (m.evGol < m.depGol) { d.G++; e.M++; d.P += 3; e.form.push("M"); d.form.push("G"); }
      else { e.B++; d.B++; e.P++; d.P++; e.form.push("B"); d.form.push("B"); }
    }
    return Object.values(satir).sort((a, b) => b.P - a.P || (b.A - b.Y) - (a.A - a.Y) || b.A - a.A || a.id.localeCompare(b.id));
  }
  const sira = (S, id) => tablo(S).findIndex((r) => r.id === id) + 1;

  function golKralligi(S, n = 10) {
    const liste = [];
    for (const [kid, t] of Object.entries(S.takimlar)) for (const o of t.kadro) if (o.sezon && o.sezon.gol) liste.push({ o, kid });
    return liste.sort((a, b) => b.o.sezon.gol - a.o.sezon.gol || a.o.sezon.mac - b.o.sezon.mac).slice(0, n);
  }

  // ---------- Maç öncesi ve sonrası ----------
  // Yapay zekâ kulübü her maçtan önce sakat/cezalıları çıkarıp en iyi on biri seçer
  function yapayZekaKadro(S, id) {
    if (id === S.kulupId) return;
    const t = S.takimlar[id];
    t.taktik.ilk11 = DUNYA.enIyi11(t.kadro, t.taktik.dizilis);
    DUNYA.gorevleriTamamla(t.taktik, t.kadro);
  }

  // Bizim kadroda oynayamayacak biri varsa yerine en uygun oyuncu (maça çıkarken)
  function kadroDuzelt(S) {
    const t = S.takimlar[S.kulupId];
    const degisen = [];
    const yerler = DIZILISLER[t.taktik.dizilis];
    t.taktik.ilk11.forEach((id, i) => {
      const o = t.kadro.find((x) => x.id === id);
      if (o && DUNYA.uygun(o)) return;
      const aday = t.kadro.filter((x) => DUNYA.uygun(x) && !t.taktik.ilk11.includes(x.id)).sort((a, b) => DUNYA.guc(b, yerler[i][0]) - DUNYA.guc(a, yerler[i][0]))[0];
      if (aday) { degisen.push(`${o ? o.soyad : "?"} yerine ${aday.soyad}`); t.taktik.ilk11[i] = aday.id; }
    });
    DUNYA.gorevleriTamamla(t.taktik, t.kadro);
    return degisen;
  }

  // Maçın oyunculara etkisi: kondisyon, istatistik, kart cezası, sakatlık (iki takım için)
  function oyunculariIsle(S, m, puan) {
    const lig = m.tur === "lig";
    for (const t of [m.ev, m.dep]) {
      const kadro = S.takimlar[t.id].kadro;
      for (const id of t.oynayanlar) {
        const o = kadro.find((x) => x.id === id);
        if (!o) continue;
        const s = m.istat[id] || {};
        o.kondisyon = Math.round(t.kond[id]);
        o.maclar++;
        o.gol += s.gol || 0;
        o.form = puan[id] || 6;
        if (lig) {
          o.sezon ||= { mac: 0, gol: 0, asist: 0, sari: 0, kirmizi: 0, puan: 0 };
          o.sezon.mac++; o.sezon.gol += s.gol || 0; o.sezon.asist += s.asist || 0; o.sezon.puan += puan[id] || 6;
          const sari = t.sarilar[id] || 0;
          if (t.atilanlar.has(id)) { o.sezon.kirmizi++; o.ceza = (o.ceza || 0) + 1; }
          else if (sari) { o.sezon.sari += sari; if (o.sezon.sari % 4 === 0) o.ceza = (o.ceza || 0) + 1; }
        }
      }
      // Cezalı olup oynamayanların cezası bir maç düşer (sadece ligde)
      if (lig) for (const o of kadro) if (o.ceza > 0 && !t.oynayanlar.includes(o.id) && !o.yeniCeza) o.ceza--;
      for (const sk of t.sakatlar) { const o = kadro.find((x) => x.id === sk.id); if (o) o.sakatlik = { gun: sk.gun, tur: sk.tur }; }
    }
  }

  // Lig haftasının diğer maçları (bizimki dışındakiler)
  function digerMaclar(S, h) {
    for (const mk of h.maclar) {
      if (mk.evGol != null || mk.ev === S.kulupId || mk.dep === S.kulupId) continue;
      yapayZekaKadro(S, mk.ev); yapayZekaKadro(S, mk.dep);
      const m = MAC.hizliOyna(S, mk.ev, mk.dep, "lig");
      oyunculariIsle(S, m, MAC.puanlar(m));
      kaydet2(mk, m);
      S.maclar.push(macKaydi(S, m));
    }
  }
  function kaydet2(mk, m) { mk.evGol = m.ev.gol; mk.depGol = m.dep.gol; }
  function macKaydi(S, m) {
    return {
      tarih: S.tarih, ev: m.ev.id, dep: m.dep.id, evGol: m.ev.gol, depGol: m.dep.gol, tur: m.tur, hazirlik: m.tur !== "lig",
      goller: m.olaylar.filter((e) => e.tip === "gol").map((e) => ({ dk: e.dk, id: e.oyuncu.id, soyad: e.oyuncu.soyad, takim: e.takim, penalti: !!e.penalti })),
    };
  }

  // ---------- Sezon sonu ----------
  // Son sıradaki takım alt ligin şampiyonuyla baraj oynar
  function baraj(S) {
    const tb = tablo(S);
    const son = tb[tb.length - 1].id;
    const kullanilan = new Set([...(S.ekKulupler || []).map((k) => k.id), ...S.lig.kulupler]);
    const adaylar = ALT_LIG.filter((k) => !kullanilan.has(k.id));
    const gelen = adaylar[Math.floor(Math.random() * adaylar.length)] || { ...ALT_LIG[0], id: "alt" + Date.now().toString(36) };
    S.ekKulupler ||= [];
    if (!S.ekKulupler.some((k) => k.id === gelen.id)) S.ekKulupler.push({ ...gelen });
    if (!S.takimlar[gelen.id]) {
      const rnd = KARAKTER.tohumlu(S.tohum + 999);
      S.takimlar[gelen.id] = { kadro: [], taktik: null };
      DUNYA.kadroTamamla(S, gelen.id, rnd);
      const t = S.takimlar[gelen.id];
      t.kadro.forEach((o) => { o.yas = 19 + Math.floor(rnd() * 13); });
      t.taktik = DUNYA.yeniTaktik(t.kadro, "4-4-2");
      t.butce = DUNYA.ilkButce(kulupBul(gelen.id), t.kadro);
    }
    yapayZekaKadro(S, son); yapayZekaKadro(S, gelen.id);
    const m = MAC.hizliOyna(S, son, gelen.id, "baraj");
    // Berabere biterse penaltılar: güçlü olanın biraz daha şansı var
    let kazanan = m.ev.gol > m.dep.gol ? son : m.ev.gol < m.dep.gol ? gelen.id : (Math.random() < 0.55 ? son : gelen.id);
    const penaltilar = m.ev.gol === m.dep.gol;
    return { son, gelen: gelen.id, evGol: m.ev.gol, depGol: m.dep.gol, kazanan, penaltilar };
  }

  // Yeni sezon: yaşlar, sözleşmeler, emeklilik, kadroların tamamlanması, yeni fikstür
  function yeniSezon(S, barajSonuc) {
    const yil = S.lig.yil + 1;
    if (barajSonuc && barajSonuc.kazanan === barajSonuc.gelen) {
      S.lig.kulupler = S.lig.kulupler.filter((id) => id !== barajSonuc.son).concat(barajSonuc.gelen);
    }
    const bitis = `${yil}-06-30`;
    S.serbest ||= [];
    const ayrilanlar = [];
    for (const [kid, t] of Object.entries(S.takimlar)) {
      for (const o of t.kadro.slice()) {
        o.yas++;
        o.sezon = null; o.ceza = 0;
        // 33 yaşından sonra emeklilik ihtimali artar
        const emekli = o.yas >= 34 && Math.random() < (o.yas - 32) * 0.22;
        // Yapay zekâ kulüpleri sözleşmesi bitenlerin çoğuyla uzatır
        if (!emekli && kid !== S.kulupId && o.bitis && o.bitis <= bitis && Math.random() < (o.yas >= 31 ? 0.5 : 0.8)) {
          o.bitis = `${yil + 1 + Math.floor(Math.random() * 3)}-06-30`;
          o.maas = DUNYA.maasIstegi(o);
        }
        const bitti = o.bitis && o.bitis <= bitis;
        if (emekli || bitti) {
          t.kadro = t.kadro.filter((x) => x !== o);
          if (kid === S.kulupId) ayrilanlar.push(`${DUNYA.adSoyad(o)} ${emekli ? "futbolu bıraktı" : "sözleşmesi bittiği için ayrıldı"}`);
          if (!emekli) { o.bitis = null; o.maas = DUNYA.maasIstegi(o); S.serbest.push(o); }
        }
      }
      if (kid !== S.kulupId) DUNYA.kadroTamamla(S, kid);
      else {
        // Bizim kadro 18'in altına düştüyse altyapıdan gençler A takıma çıkar
        const once = t.kadro.length;
        DUNYA.kadroTamamla(S, kid);
        for (const o of t.kadro.slice(once)) ayrilanlar.push(`Altyapıdan A takıma: ${DUNYA.adSoyad(o)} (${o.mevki}, ${o.yas})`);
      }
      if (t.taktik) { t.taktik.ilk11 = DUNYA.enIyi11(t.kadro, t.taktik.dizilis); DUNYA.gorevleriTamamla(t.taktik, t.kadro); }
    }
    S.serbest = S.serbest.slice(-30);
    S.lig = fiksturUret(S, S.lig.kulupler, yil);
    S.hazirlik = hazirlikUret(S, yil);
    return ayrilanlar;
  }

  // Yeni sezonun dört hazırlık maçı (lig başlamadan önceki dört cumartesi)
  function hazirlikUret(S, yil) {
    const ilk = ilkHafta(yil);
    const rakipler = S.lig.kulupler.filter((id) => id !== S.kulupId).sort(() => Math.random() - 0.5).slice(0, 4);
    return rakipler.map((r, i) => ({ tarih: TARIH.ekle(ilk, -28 + i * 7), rakip: r, ev: i % 2 === 0 }));
  }

  // ---------- Ekran ----------
  function ekran(sekme = "tablo") {
    const tb = tablo(S);
    const kisa = (id) => kacir(kulupBul(id).kisa);
    const sekmeler = [["tablo", "Puan durumu"], ["fikstur", "Fikstür"], ["gol", "Gol krallığı"]]
      .map(([k, y]) => `<button class="secenek" data-sekme="${k}" aria-pressed="${k === sekme}">${y}</button>`).join("");
    let govde = "";
    if (sekme === "tablo") {
      govde = `<table class="tablo lig-tablo"><thead><tr><th>#</th><th class="sol">Takım</th><th>O</th><th>G</th><th>B</th><th>M</th><th>A</th><th>Y</th><th>Av</th><th>P</th><th>Form</th></tr></thead><tbody>
        ${tb.map((r, i) => `<tr class="${r.id === S.kulupId ? "bizim" : ""}${i === tb.length - 1 ? " dusme" : ""}${i === 0 ? " lider" : ""}">
          <td>${i + 1}</td><td class="sol"><span class="renk-kare" style="background:${kulupBul(r.id).forma}"></span>${kacir(kulupBul(r.id).ad)}</td>
          <td>${r.O}</td><td>${r.G}</td><td>${r.B}</td><td>${r.M}</td><td>${r.A}</td><td>${r.Y}</td><td>${r.A - r.Y}</td><td><b>${r.P}</b></td>
          <td class="form">${r.form.slice(-5).map((f) => `<i class="f-${f}">${f}</i>`).join("")}</td></tr>`).join("")}
        </tbody></table><p class="kucuk-yazi">1. sıra şampiyon. Son sıradaki takım Ova Ligi'nin şampiyonuyla baraj oynar.</p>`;
    } else if (sekme === "fikstur") {
      govde = `<div class="fikstur">${S.lig.haftalar.map((h) => `<div class="fikstur-hafta${h.maclar.some((m) => m.ev === S.kulupId || m.dep === S.kulupId) ? "" : ""}">
        <b>${h.no}. hafta</b> <span class="soluk">${TARIH.kisa(h.tarih)}</span>
        <ul>${h.maclar.map((m) => `<li class="${m.ev === S.kulupId || m.dep === S.kulupId ? "bizim" : ""}">${kisa(m.ev)} <b>${m.evGol != null ? `${m.evGol}-${m.depGol}` : "–"}</b> ${kisa(m.dep)}</li>`).join("")}</ul></div>`).join("")}</div>`;
    } else {
      const liste = golKralligi(S, 15);
      govde = liste.length ? `<table class="tablo"><thead><tr><th>#</th><th class="sol">Oyuncu</th><th class="sol">Kulüp</th><th>Maç</th><th>Gol</th><th>Asist</th></tr></thead><tbody>
        ${liste.map((x, i) => `<tr class="${x.kid === S.kulupId ? "bizim" : ""}"><td>${i + 1}</td><td class="sol">${kacir(DUNYA.adSoyad(x.o))}</td><td class="sol">${kisa(x.kid)}</td><td>${x.o.sezon.mac}</td><td><b>${x.o.sezon.gol}</b></td><td>${x.o.sezon.asist}</td></tr>`).join("")}
        </tbody></table>` : `<p class="soluk">Ligde henüz gol atılmadı.</p>`;
    }
    TAM.ac(`<div class="tam-baslik"><h2>Carceria Ligi</h2><span class="soluk">${S.lig.sezon} sezonu</span><div class="secenekler">${sekmeler}</div><button class="dugme ikincil" id="lig-kapat">Kapat</button></div>${govde}`, null, "genis");
    $("lig-kapat").onclick = TAM.kapat;
    document.querySelectorAll("[data-sekme]").forEach((b) => { b.onclick = () => ekran(b.dataset.sekme); });
  }

  return { fiksturUret, hafta, bizimMac, kisArasi, sonHafta, tablo, sira, golKralligi, yapayZekaKadro, kadroDuzelt, oyunculariIsle, digerMaclar, macKaydi, baraj, yeniSezon, hazirlikUret, ekran, ilkHafta };
})();
