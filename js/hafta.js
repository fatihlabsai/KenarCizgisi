// Haftanın akışı: her gün sabah kulüpte bir iş (antrenman, basın, maç, gazete), akşam menajerin hayatı.
const HAFTA = (() => {
  const GUN_ADI = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];
  const haftaGunu = (s) => new Date(s + "T00:00:00Z").getUTCDay();
  const ANTRENMAN_BASLANGIC = "2026-07-27";
  const KAFE = "Gözcü Kafe";
  const bizim = () => kulupBul(S.kulupId);
  const kadro = () => S.takimlar[S.kulupId].kadro;
  const oyuncu = (id) => DUNYA.oyuncuBul(S, id);
  const sinirla = DUNYA.sinirla;

  // ---------- Takvim ----------
  // Hazırlık listesinden sonra her cumartesi rastgele ama tekrarlanabilir bir hazırlık maçı
  function maci(tarih) {
    const h = HAZIRLIK.find((x) => x.tarih === tarih);
    if (h) return h;
    if (haftaGunu(tarih) !== 6 || tarih <= HAZIRLIK[HAZIRLIK.length - 1].tarih) return null;
    const digerleri = KULUPLER.filter((k) => k.id !== S.kulupId);
    const n = Number(tarih.replace(/-/g, "")) % digerleri.length;
    return { tarih, rakip: digerleri[n].id, ev: n % 2 === 0 };
  }

  function gundem() {
    const g = haftaGunu(S.tarih);
    if (S.tarih < ANTRENMAN_BASLANGIC) return { tur: "bos", baslik: "Kulüp kapalı", metin: `Oyuncular izinde. Antrenmanlar 27 Temmuz Pazartesi başlıyor.` };
    if (g === 6 && maci(S.tarih)) return { tur: "mac", mac: maci(S.tarih) };
    if (g === 5 && maci(TARIH.ekle(S.tarih, 1))) return { tur: "hazirlik", mac: maci(TARIH.ekle(S.tarih, 1)) };
    if (g === 0) return { tur: "gazete" };
    if (g >= 1 && g <= 5) return { tur: "antrenman" };
    return { tur: "bos", baslik: "Boş gün", metin: "Bugün kulüpte iş yok." };
  }

  const macBasligi = (h) => {
    const r = kulupBul(h.rakip), b = bizim();
    return h.ev ? `${b.ad} – ${r.ad}` : `${r.ad} – ${b.ad}`;
  };
  const macYeri = (h) => (h.ev ? bizim().stad : kulupBul(h.rakip).stad);

  // ---------- Gün değişimi ----------
  function gunBasla() {
    const g = haftaGunu(S.tarih);
    for (const t of Object.values(S.takimlar)) for (const o of t.kadro) o.kondisyon = Math.min(100, o.kondisyon + (g === 1 ? 12 : 5));
    S.menajer.enerji = Math.min(100, S.menajer.enerji + (S.menajer.stres > 75 ? 8 : 15));
    if (TARIH.ayinIlkGunu(S.tarih)) {
      S.para += S.maas;
      ARAYUZ.bildirim(`Maaş yattı: ${para(S.maas)}`);
      S.gunluk.push({ tarih: S.tarih, metin: `Maaş yattı: ${para(S.maas)}` });
    }
    S.gun = { asama: "sabah" };
  }

  async function gunuBitir() {
    S.tarih = TARIH.ekle(S.tarih, 1);
    gunBasla();
    await kaydet(true);
    goster();
  }

  // ---------- Ekran ----------
  function hudYenile() {
    $("hud-kulup").textContent = bizim().ad;
    $("hud-tarih").textContent = TARIH.uzun(S.tarih);
    $("hud-para").textContent = para(S.para);
    $("hud-enerji").style.width = S.menajer.enerji + "%";
    $("hud-stres").style.width = S.menajer.stres + "%";
    $("hud-enerji-yazi").textContent = Math.round(S.menajer.enerji);
    $("hud-stres-yazi").textContent = Math.round(S.menajer.stres);
    document.querySelector(".forma-rengi").style.background = bizim().forma;
    document.querySelector(".forma-rengi").style.boxShadow = `inset 0 -6px 0 ${bizim().sort}`;
  }

  function panel(html) { $("gundem").innerHTML = html; }
  const dugme = (id, yazi, ikincil) => `<button class="dugme${ikincil ? " ikincil" : ""}" id="${id}">${yazi}</button>`;
  const bagla = (id, fn) => { const b = $(id); if (b) b.onclick = fn; };

  function sahneGoster(sahne) {
    CIZICI.goster($("tuval-oyun"), sahne, { mod: "sigdir", kap: document.querySelector(".oyun-sahne") });
  }

  function goster() {
    ARAYUZ.ekranGoster("ekran-oyun");
    ARAYUZ.escYoksa = () => (TAM.acik() ? TAM.kapat() : duraklat());
    TAM.kapat();
    hudYenile();
    if (S.gun.asama === "aksam") return aksam();
    const gd = gundem();
    $("hud-yer").textContent = gd.tur === "mac" ? macYeri(gd.mac) : gd.tur === "antrenman" ? `${bizim().stad} · Antrenman sahası` : gd.tur === "hazirlik" ? `${bizim().stad} · Kulüp binası` : `${S.ev.adres} · ${S.ev.sehir}`;
    if (gd.tur === "antrenman") return antrenmanSabah();
    if (gd.tur === "hazirlik") return hazirlikGunu(gd.mac);
    if (gd.tur === "mac") return macGunu(gd.mac);
    if (gd.tur === "gazete") return gazeteGunu();
    sahneGoster(SAHNE_DAIRE);
    panel(`<h3>${gd.baslik}</h3><p>${gd.metin}</p><div class="dugme-satiri">${dugme("g-aksam", "Akşama geç ▸")}</div>`);
    bagla("g-aksam", aksamaGec);
  }

  function aksamaGec() { S.gun = { asama: "aksam" }; kaydet(true); goster(); }

  // ---------- Antrenman ----------
  function antrenmanSabah() {
    if (S.gun.rapor) return antrenmanRaporu(S.gun.rapor);
    sahneGoster(SAHNE_SOKAK);
    const ortK = Math.round(kadro().reduce((a, o) => a + o.kondisyon, 0) / kadro().length);
    const yorgun = S.menajer.enerji < 30 ? `<p class="uyari">Çok yorgunsun. Bugünkü antrenmandan alınan verim düşük olacak.</p>` : "";
    const turler = Object.entries(ANTRENMAN.TURLER).map(([k, t]) => `<button class="antrenman-sec" data-tur="${k}"><b>${t.ad}</b><span>${t.aciklama}</span></button>`).join("");
    panel(`<h3>${GUN_ADI[haftaGunu(S.tarih)]} antrenmanı</h3>
      <p class="soluk">Takımın ortalama kondisyonu: <b class="${ortK < 65 ? "kotu" : ""}">${ortK}</b></p>${yorgun}
      <div class="antrenmanlar">${turler}</div>`);
    $("gundem").querySelectorAll("[data-tur]").forEach((b) => { b.onclick = () => antrenmanBaslat(b.dataset.tur); });
  }

  function antrenmanBaslat(tur) {
    const rapor = ANTRENMAN.yap(S, tur);
    rapor.tarih = S.tarih;
    S.gun.rapor = rapor;
    S.menajer.enerji = Math.max(0, S.menajer.enerji - 15);
    kaydet(true);
    hudYenile();
    const kulup = bizim();
    const yelekKulup = { ...kulup, forma: "#d9532c" };
    const liste = [];
    ANTRENMAN_EKRANI.kayit = (metin) => {
      liste.unshift(metin);
      const ul = $("antrenman-kayit");
      if (ul) ul.innerHTML = liste.slice(0, 9).map((x) => `<li>${kacir(x)}</li>`).join("");
    };
    SAHNE_ANTRENMAN.baslat(rapor, {
      oyuncu, resim: (o) => KARAKTER.oyuncu(o, kulup), yelek: (o) => KARAKTER.oyuncu(o, yelekKulup),
      hocaResim: KARAKTER.gorunus(S.menajer.gorunus),
      bitince: () => { if (S.gun.rapor === rapor) antrenmanRaporu(rapor); },
    });
    SAHNE_ANTRENMAN.hizAyarla(1);
    sahneGoster(SAHNE_ANTRENMAN);
    $("hud-yer").textContent = `${kulup.stad} · Antrenman sahası`;
    panel(`<h3>${ANTRENMAN.TURLER[tur].ad}</h3><ul class="kayit-listesi" id="antrenman-kayit"><li class="soluk">Oyuncular ısınıyor…</li></ul>
      <div class="dugme-satiri">${dugme("a-hiz", "Hızlandır ×3", true)}${dugme("a-bitir", "Raporu gör")}</div>`);
    bagla("a-hiz", () => { SAHNE_ANTRENMAN.hizAyarla(3); $("a-hiz").disabled = true; });
    bagla("a-bitir", () => antrenmanRaporu(rapor));
  }

  function antrenmanRaporu(r) {
    ANTRENMAN_EKRANI.kayit = null;
    if (CIZICI.etkin() !== SAHNE_ANTRENMAN) sahneGoster(SAHNE_SOKAK);
    const ad = (id) => kacir(DUNYA.adSoyad(oyuncu(id)));
    const gel = r.gelisenler.length
      ? `<ul class="rapor-listesi">${r.gelisenler.map((g) => `<li class="iyi">${ad(g.id)}: ${OZELLIK_ADI[g.ozellik]} ${sayiEk(g.yeni, "e")} çıktı</li>`).join("")}</ul>`
      : `<p class="soluk">Bugün gözle görülür bir gelişme yok. Emek birikiyor.</p>`;
    const parlak = r.parlayan.length ? `<p><b>Öne çıkanlar:</b> ${r.parlayan.map(ad).join(", ")}</p>` : "";
    const kotu = r.kotu.length ? `<p><b>Kötü bir gün geçiren:</b> ${r.kotu.map(ad).join(", ")}</p>` : "";
    panel(`<h3>Antrenman raporu</h3><p class="soluk">${ANTRENMAN.TURLER[r.tur].ad}</p>${parlak}${kotu}
      <p><b>Gelişenler</b></p>${gel}
      <p>Takımın ortalama kondisyonu: <b class="${r.ortKond < 65 ? "kotu" : ""}">${r.ortKond}</b></p>
      <div class="dugme-satiri">${dugme("a-aksam", "Akşama geç ▸")}</div>`);
    bagla("a-aksam", aksamaGec);
  }

  // ---------- Cuma: basın ve kadro ----------
  function hazirlikGunu(h) {
    sahneGoster(SAHNE_SOKAK);
    const r = kulupBul(h.rakip);
    const basinYapildi = S.basin.some((b) => b.tarih === S.tarih);
    panel(`<h3>Yarın maç var</h3><p><b>${kacir(macBasligi(h))}</b><br><span class="soluk">Hazırlık maçı · ${kacir(macYeri(h))} · Cumartesi 17:00</span></p>
      ${rakipBilgisi(r)}
      <div class="dugme-dizi">
        ${dugme("h-basin", basinYapildi ? "Basın toplantısı yapıldı ✓" : "Basın toplantısına çık", true)}
        ${dugme("h-kadro", "Kadro ve taktik", true)}
      </div>
      <div class="dugme-satiri">${dugme("h-aksam", "Akşama geç ▸")}</div>`);
    if (basinYapildi) $("h-basin").disabled = true;
    bagla("h-basin", () => BASIN.ac(h, () => hazirlikGunu(h)));
    bagla("h-kadro", () => KADRO.secimAc(() => hazirlikGunu(h)));
    bagla("h-aksam", aksamaGec);
  }

  function rakipBilgisi(r) {
    const bizG = DUNYA.takimGucu(S, S.kulupId), onlarG = DUNYA.takimGucu(S, r.id);
    const fark = onlarG - bizG;
    const yorum = fark > 6 ? "Kâğıt üstünde bizden güçlüler." : fark < -6 ? "Kâğıt üstünde bizden zayıflar." : "Kâğıt üstünde denk iki takım.";
    const bilinen = S.bilinen[r.id];
    return `<p class="soluk">${yorum}${bilinen ? ` Duyduğuna göre ${bilinen} oynuyorlar.` : ""}</p>`;
  }

  // ---------- Cumartesi: maç ----------
  function macGunu(h) {
    const oynandi = S.maclar.find((x) => x.tarih === S.tarih && (x.ev === S.kulupId || x.dep === S.kulupId));
    sahneGoster(SAHNE_SOKAK);
    if (oynandi) {
      panel(`<h3>Maç bitti</h3><p><b>${kacir(kulupBul(oynandi.ev).kisa)} ${oynandi.evGol} - ${oynandi.depGol} ${kacir(kulupBul(oynandi.dep).kisa)}</b></p>
        <div class="dugme-satiri">${dugme("m-aksam", "Akşama geç ▸")}</div>`);
      bagla("m-aksam", aksamaGec);
      return;
    }
    const r = kulupBul(h.rakip);
    panel(`<h3>Maç günü</h3><p><b>${kacir(macBasligi(h))}</b><br><span class="soluk">Hazırlık maçı · ${kacir(macYeri(h))} · 17:00</span></p>
      ${rakipBilgisi(r)}
      <p class="soluk">Diziliş: ${S.takimlar[S.kulupId].taktik.dizilis} · ${ANLAYISLAR[S.takimlar[S.kulupId].taktik.anlayis].ad}</p>
      <div class="dugme-dizi">${dugme("m-kadro", "Kadro ve taktik", true)}</div>
      <div class="dugme-satiri">${dugme("m-cik", "Maça çık ▸")}</div>`);
    bagla("m-kadro", () => KADRO.secimAc(() => macGunu(h)));
    bagla("m-cik", () => {
      S.menajer.enerji = Math.max(0, S.menajer.enerji - 20);
      const evId = h.ev ? S.kulupId : h.rakip, depId = h.ev ? h.rakip : S.kulupId;
      MAC_EKRANI.ac(S, evId, depId, (m, puan) => { macSonuIsle(m, puan, h); goster(); });
    });
  }

  function macSonuIsle(m, puan, h) {
    const kayit = (mm) => ({
      tarih: S.tarih, ev: mm.ev.id, dep: mm.dep.id, evGol: mm.ev.gol, depGol: mm.dep.gol, hazirlik: true,
      goller: mm.olaylar.filter((e) => e.tip === "gol").map((e) => ({ dk: e.dk, id: e.oyuncu.id, soyad: e.oyuncu.soyad, takim: e.takim })),
    });
    S.maclar.push(kayit(m));
    for (const t of [m.ev, m.dep]) {
      for (const id of t.oynayanlar) {
        const o = oyuncu(id);
        if (!o) continue;
        o.kondisyon = Math.round(t.kond[id]);
        o.maclar++;
        o.gol += (m.istat[id] && m.istat[id].gol) || 0;
        o.form = puan[id] || 6;
      }
    }
    const biz = m.ev.insan ? m.ev : m.dep, onlar = m.ev.insan ? m.dep : m.ev;
    const sonuc = Math.sign(biz.gol - onlar.gol);
    for (const o of kadro()) {
      const oynadi = biz.oynayanlar.includes(o.id);
      o.moral = Math.round(sinirla(o.moral + (sonuc > 0 ? 6 : sonuc < 0 ? -5 : 1) + (oynadi ? ((puan[o.id] || 6) - 6.5) * 3 : -2), 0, 100));
    }
    S.itibar.taraftar = sinirla(S.itibar.taraftar + (sonuc > 0 ? 3 : sonuc < 0 ? -3 : 0), 0, 100);
    S.menajer.stres = sinirla(S.menajer.stres + (sonuc > 0 ? -8 : sonuc < 0 ? 10 : 2), 0, 100);
    S.gunluk.push({ tarih: S.tarih, metin: `${m.ev.k.kisa} ${m.ev.gol}-${m.dep.gol} ${m.dep.k.kisa}` });
    // Diğer kulüplerin hazırlık maçları da bugün oynanır
    const kalan = KULUPLER.map((k) => k.id).filter((id) => id !== m.ev.id && id !== m.dep.id);
    const rnd = KARAKTER.tohumlu(Number(S.tarih.replace(/-/g, "")));
    const karisik = kalan.map((id) => [rnd(), id]).sort((a, b) => a[0] - b[0]).map((x) => x[1]);
    for (let i = 0; i + 1 < karisik.length; i += 2) S.maclar.push(kayit(MAC.hizliOyna(S, karisik[i], karisik[i + 1])));
    S.gun = { asama: "aksam", sonMac: true };
    kaydet(true);
  }

  // ---------- Pazar: gazete ----------
  function gazeteGunu() {
    sahneGoster(SAHNE_DAIRE);
    let g = S.gazeteler.find((x) => x.tarih === S.tarih);
    if (!g) { g = GAZETE.yap(S); S.gazeteler.push(g); kaydet(true); }
    panel(`<h3>Pazar</h3><p>Kapının önüne <b>Sınır Postası</b> bırakılmış. Manşet:</p><p class="manset-kucuk">${kacir(g.manset)}</p>
      <p class="soluk">Bugün izin günü. Oyuncular dinleniyor.</p>
      <div class="dugme-dizi">${dugme("p-oku", "Gazeteyi oku", true)}</div>
      <div class="dugme-satiri">${dugme("p-aksam", "Akşama geç ▸")}</div>`);
    bagla("p-oku", () => GAZETE.goster(g));
    bagla("p-aksam", aksamaGec);
  }

  // ---------- Akşam ----------
  function aksam() {
    sahneGoster(SAHNE_DAIRE);
    $("hud-yer").textContent = `${S.ev.adres} · ${S.ev.sehir} · Akşam`;
    if (S.gun.aksamSonuc) {
      panel(`<h3>Akşam</h3><p>${S.gun.aksamSonuc}</p><div class="dugme-satiri">${dugme("ak-bitir", "Günü bitir ▸")}</div>`);
      bagla("ak-bitir", gunuBitir);
      return;
    }
    const secenek = (id, baslik, alt, kapali) => `<button class="antrenman-sec" id="${id}"${kapali ? " disabled" : ""}><b>${baslik}</b><span>${alt}</span></button>`;
    const yemekAdaylari = kadro().slice().sort((a, b) => a.moral - b.moral);
    panel(`<h3>Akşam</h3><p class="soluk">Günün geri kalanı senin.</p>
      <div class="antrenmanlar">
        ${secenek("ak-ev", "Evde dinlen", "Erkenden yat. Enerji toplarsın.")}
        ${secenek("ak-kafe", `${KAFE}'ye in`, `Bir çay, biraz sohbet. ${para(14)}. Stres azalır, kulağına bir şeyler çalınır.`, S.para < 14)}
        ${secenek("ak-yemek", "Bir oyuncuyu yemeğe çağır", `Lale Sokak'taki lokantada. ${para(60)}. Oyuncunun morali yükselir.`, S.para < 60)}
      </div>
      <div class="yemek-sec" id="yemek-sec" hidden>
        <select id="yemek-oyuncu">${yemekAdaylari.map((o) => `<option value="${o.id}">${o.no} · ${kacir(DUNYA.adSoyad(o))} · moral ${o.moral}</option>`).join("")}</select>
        ${dugme("yemek-git", "Çağır")}
      </div>`);
    bagla("ak-ev", () => aksamBitti(evdeDinlen()));
    bagla("ak-kafe", () => aksamBitti(kafeyeIn()));
    bagla("ak-yemek", () => { $("yemek-sec").hidden = false; });
    bagla("yemek-git", () => aksamBitti(yemegeCagir(oyuncu($("yemek-oyuncu").value))));
  }

  function aksamBitti(metin) { S.gun.aksamSonuc = metin; hudYenile(); kaydet(true); aksam(); }

  function evdeDinlen() {
    S.menajer.enerji = Math.min(100, S.menajer.enerji + 30);
    S.menajer.stres = Math.max(0, S.menajer.stres - 5);
    return "Erkenden yattın. Sabah kendini dinç hissedeceksin.";
  }

  function kafeyeIn() {
    S.para -= 14;
    S.menajer.enerji = Math.min(100, S.menajer.enerji + 5);
    S.menajer.stres = Math.max(0, S.menajer.stres - 8);
    return `${KAFE}'de bir köşeye oturdun. ${dedikodu()}`;
  }

  // Kafede kulağa çalınanlar. Rakiple ilgili olanlar işe yarar (dizilişini öğrenirsin), bu yüzden daha sık çıkar.
  function dedikodu() {
    const sonraki = (() => { for (let i = 0; i < 7; i++) { const h = maci(TARIH.ekle(S.tarih, i)); if (h) return h; } return null; })();
    const secenekler = [];
    if (sonraki) {
      const r = kulupBul(sonraki.rakip), t = S.takimlar[r.id];
      const enIyi = t.kadro.filter((o) => o.mevki === "FV").sort((a, b) => DUNYA.guc(b) - DUNYA.guc(a))[0];
      if (!S.bilinen[r.id]) secenekler.push({ id: "dizilis-" + r.id, agirlik: 4, fn: () => { S.bilinen[r.id] = t.taktik.dizilis; return `Yan masada ${r.kisa} taraftarları konuşuyor: "Bizim hoca ${t.taktik.dizilis} dışına çıkmaz." Bunu bir kenara yazdın.`; } });
      if (enIyi) secenekler.push({ id: "golcu-" + r.id, agirlik: 2, fn: () => `Kafenin sahibi Mavro, ${r.kisa} maçını soruyor: "${enIyi.soyad} denen çocuğa dikkat edin hocam. Geçen sezon bize iki tane attı."` });
      const bizdenBiri = kadro()[Math.floor(Math.random() * kadro().length)];
      secenekler.push({ id: "taraftar", agirlik: 1, fn: () => `Biri seni tanıdı: "Hocam, cumartesi ${sonraki.ev ? "avluda olacağız" : `${kulupBul(sonraki.rakip).sehir} yolundayız, otobüs ayarladık`}. Bu sene ${bizdenBiri.soyad} oynasın, çocuk iyi."` });
    }
    secenekler.push(
      { id: "tv", agirlik: 1, fn: () => "Televizyonda Sinistra liginin özeti var. Kafedekiler Valmora'daki transfer paralarına söyleniyor." },
      { id: "gardiyan", agirlik: 1, fn: () => "Masadaki yaşlı adam, avlunun eskiden nasıl olduğunu anlatıyor: \"Ben orada on iki yıl gardiyanlık yaptım. Şimdi orada top oynanıyor, kimin aklına gelirdi.\"" },
      { id: "kogus", agirlik: 1, fn: () => "Belediyenin eski koğuşları kiraya vereceği konuşuluyor. Mavro oraya ikinci bir kafe açmayı düşünüyormuş." },
      { id: "ardessa", agirlik: 1, fn: () => "İki emekli Brennik–Ardessa maçlarını konuşuyor. Biri, 1998'deki maçta sahaya polis girdiğini anlatıyor; öbürü 1997 olduğunu söylüyor." },
    );
    // Son duyulanlar tekrar etmesin
    S.duyulanlar ||= [];
    let havuz = secenekler.filter((s) => !S.duyulanlar.includes(s.id));
    if (!havuz.length) havuz = secenekler;
    let r = Math.random() * havuz.reduce((a, s) => a + s.agirlik, 0);
    const sec = havuz.find((s) => (r -= s.agirlik) <= 0) || havuz[0];
    S.duyulanlar = [sec.id, ...S.duyulanlar].slice(0, 3);
    return sec.fn();
  }

  function yemegeCagir(o) {
    S.para -= 60;
    S.menajer.stres = Math.max(0, S.menajer.stres - 6);
    S.menajer.enerji = Math.max(0, S.menajer.enerji - 5);
    const onceki = o.moral;
    o.moral = Math.min(100, o.moral + 12);
    const memleket = { c: "Kalvar", s: "Ferrano", o: "Dorakos" }[o.koken];
    const soz = o.yas <= 21 ? `"Annem ${memleket}'da maçları radyodan dinliyor hocam. Bunu duyunca çok sevinecek."`
      : onceki < 45 ? `"Son günlerde kafam biraz karışık hocam. Konuşmamız iyi geldi, sahada göreceksiniz."`
      : onceki > 70 ? `"Açık konuşayım hocam, burada mutluyum. Bu takım bir şeyler yapar."`
      : `"İlk kez bir hoca beni yemeğe çağırıyor. Sağ olun."`;
    return `${DUNYA.adSoyad(o)} ile Lale Sokak'taki lokantada yemek yediniz. ${soz} (Moral ${onceki} → ${o.moral})`;
  }

  return { goster, gunBasla, hudYenile, maci, macBasligi, macYeri, ANTRENMAN_BASLANGIC, haftaGunu, GUN_ADI };
})();

// Oyun ekranının üstüne açılan büyük kâğıt (kadro, basın, gazete)
const TAM = (() => {
  let geri = null;
  function ac(html, geriFn, sinif = "") {
    geri = geriFn;
    const el = $("oyun-tam-icerik");
    el.className = "kagit tam-kagit " + sinif;
    el.innerHTML = html;
    $("oyun-tam").hidden = false;
    el.scrollTop = 0;
  }
  function kapat() {
    if ($("oyun-tam").hidden) return;
    $("oyun-tam").hidden = true;
    const g = geri; geri = null;
    if (g) g();
  }
  return { ac, kapat, acik: () => !$("oyun-tam").hidden };
})();
