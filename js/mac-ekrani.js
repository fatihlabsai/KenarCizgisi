// Maç ekranı: skor tabelası, olay akışı, hız, taktik, değişiklik ve kenardan bağırma.
const MAC_EKRANI = (() => {
  const DAKIKA = 0.5;                // ×1 hızda bir dakika kaç saniye sürer
  const ONEMLI = ["gol", "kurtaris", "direk", "disari", "blok"];
  let m = null, bizK = null, hiz = 1, birikim = 0, isleniyor = false, duraklat = false, bitti = false, bitince = null;
  let gorunenSkor = { ev: 0, dep: 0 };
  let sonPuan = null;

  const biz = () => (bizK === "ev" ? m.ev : m.dep);

  function ac(S, evId, depId, cb) {
    m = MAC.yeni(S, evId, depId);
    bizK = m.ev.insan ? "ev" : "dep";
    bitince = cb; bitti = false; duraklat = false; isleniyor = false; birikim = 0; hiz = 1;
    gorunenSkor = { ev: 0, dep: 0 };
    ARAYUZ.ekranGoster("ekran-mac");
    ARAYUZ.escYoksa = taktikPenceresi;
    $("sb-ev-ad").textContent = m.ev.k.ad;
    $("sb-dep-ad").textContent = m.dep.k.ad;
    $("sb-ev-renk").style.background = m.ev.k.forma;
    $("sb-dep-renk").style.background = m.dep.k.forma;
    $("mac-akis").innerHTML = "";
    m.olaylar.forEach(akisEkle);
    SAHNE_MAC.kur(m, { menajerResim: KARAKTER.gorunus(S.menajer.gorunus) });
    SAHNE_MAC.hizAyarla(hiz);
    SAHNE_MAC.kontrolAyarla(tik);
    CIZICI.goster($("tuval-mac"), SAHNE_MAC, { mod: "sigdir", kap: document.querySelector(".mac-sahne") });
    hizDugmeleri();
    tabela();
  }

  // ---------- Akış ----------
  function tik(dt) {
    if (!m || bitti || duraklat || ARAYUZ.pencereAcik()) return;
    if (isleniyor || SAHNE_MAC.mesgul()) return;
    if (m.bitti) { sonEkrani(); return; }
    if (m.devreArasi) { devreArasi(); return; }
    birikim += dt * hiz;
    if (birikim < DAKIKA) return;
    birikim = 0;
    const yeni = MAC.dakikaOyna(m);
    const onemli = yeni.filter((e) => ONEMLI.includes(e.tip));
    yeni.filter((e) => !ONEMLI.includes(e.tip)).forEach(akisEkle);
    tabela();
    if (onemli.length) isle(onemli);
  }

  async function isle(liste) {
    isleniyor = true;
    for (const e of liste) {
      await SAHNE_MAC.olayOynat(e);
      if (!m) return;
      if (e.tip === "gol") gorunenSkor[e.takim]++;
      akisEkle(e);
      tabela();
    }
    isleniyor = false;
  }

  function akisEkle(e) {
    if (!e || !e.metin) return;
    const li = document.createElement("li");
    li.className = "akis-" + e.tip + (e.takim ? " akis-" + e.takim : "");
    li.textContent = e.metin;
    $("mac-akis").prepend(li);
  }

  function tabela() {
    if (!m) return;
    $("sb-skor").textContent = `${gorunenSkor.ev} - ${gorunenSkor.dep}`;
    $("sb-dk").textContent = m.bitti ? "Bitti" : m.devreArasi ? "Devre" : MAC.dakikaYazi(m) + "'";
    const top = m.ev.sahip + m.dep.sahip || 1;
    const satir = (ad, a, b) => `<div class="ist-satir"><b>${a}</b><span>${ad}</span><b>${b}</b></div>`;
    $("mac-istat").innerHTML =
      satir("Topla oynama", "%" + Math.round(m.ev.sahip / top * 100), "%" + Math.round(m.dep.sahip / top * 100)) +
      satir("Şut", m.ev.sut, m.dep.sut) +
      satir("İsabetli şut", m.ev.isabet, m.dep.isabet) +
      satir("Sarı kart", Object.values(m.ev.sarilar).reduce((a, b) => a + b, 0), Object.values(m.dep.sarilar).reduce((a, b) => a + b, 0));
    const t = biz();
    $("mac-bagir").disabled = t.bagirDevre === m.devre || m.bitti;
  }

  function hizDugmeleri() {
    const kutu = $("mac-hiz");
    kutu.innerHTML = [1, 2, 4].map((h) => `<button class="secenek" data-hiz="${h}" aria-pressed="${h === hiz}">×${h}</button>`).join("");
    kutu.querySelectorAll("button").forEach((b) => { b.onclick = () => { hiz = +b.dataset.hiz; SAHNE_MAC.hizAyarla(hiz); hizDugmeleri(); }; });
  }

  // ---------- Devre arası ve maç sonu ----------
  function devreArasi() {
    duraklat = true;
    m.devreArasi = false;
    tabela();
    ARAYUZ.pencereAc("Devre arası", `<p class="buyuk-skor">${kacir(m.ev.k.kisa)} ${gorunenSkor.ev} - ${gorunenSkor.dep} ${kacir(m.dep.k.kisa)}</p>${$("mac-istat").innerHTML}`, [
      { yazi: "Taktik", ikincil: true, fn: () => taktikPenceresi(devreArasiDevam, "Devre arası") },
      { yazi: "İkinci yarı", fn: devreArasiDevam },
    ], { esc: devreArasiDevam });
  }

  function devreArasiDevam() {
    ARAYUZ.pencereKapat();
    SAHNE_MAC.devreDegis();
    akisEkle({ metin: "İkinci yarı başladı.", tip: "baslangic" });
    duraklat = false;
  }

  function sonucaGec() {
    if (bitti) return;
    const once = m.olaylar.length;
    MAC.sonucaGec(m);
    m.olaylar.slice(once).forEach(akisEkle);
    gorunenSkor = { ev: m.ev.gol, dep: m.dep.gol };
    tabela();
    sonEkrani();
  }

  function sonEkrani() {
    if (bitti) return;
    bitti = true;
    tabela();
    const puan = MAC.puanlar(m);
    const t = biz();
    const goller = m.olaylar.filter((e) => e.tip === "gol").map((e) => `<li>${e.dk}' ${kacir(e.oyuncu.soyad)} <span class="soluk">(${kacir((e.takim === "ev" ? m.ev : m.dep).k.kisa)})</span></li>`).join("") || "<li class='soluk'>Gol yok</li>";
    const satirlar = t.oynayanlar.map(oyuncuHer).filter(Boolean)
      .sort((a, b) => puan[b.id] - puan[a.id])
      .map((o) => `<tr><td>${o.no}</td><td>${kacir(DUNYA.adSoyad(o))}</td><td>${t.yerOf[o.id]}</td><td><b class="puan ${puan[o.id] >= 7.5 ? "iyi" : puan[o.id] < 6 ? "kotu" : ""}">${puan[o.id].toFixed(1)}</b></td></tr>`).join("");
    const enIyi = Object.entries(puan).sort((a, b) => b[1] - a[1])[0];
    const enIyiO = enIyi && oyuncuHer(enIyi[0]);
    ARAYUZ.pencereAc("Maç sonu", `
      <p class="buyuk-skor">${kacir(m.ev.k.ad)} ${m.ev.gol} - ${m.dep.gol} ${kacir(m.dep.k.ad)}</p>
      <div class="mac-sonu">
        <div><h3>Goller</h3><ul class="gol-listesi">${goller}</ul>
          ${enIyiO ? `<h3>Maçın oyuncusu</h3><p>${kacir(DUNYA.adSoyad(enIyiO))} · ${enIyi[1].toFixed(1)}</p>` : ""}
          <div class="mac-sonu-istat">${$("mac-istat").innerHTML}</div></div>
        <div><h3>${kacir(t.k.kisa)} oyuncu puanları</h3><table class="tablo"><tbody>${satirlar}</tbody></table></div>
      </div>`, [{ yazi: "Devam", fn: kapat }], { esc: kapat });
    sonPuan = puan;
  }

  function oyuncuHer(id) { return DUNYA.oyuncuBul(S, id); }

  function kapat() {
    ARAYUZ.pencereKapat();
    const mac = m, puan = sonPuan;
    SAHNE_MAC.durdur();
    CIZICI.durdur();
    m = null;
    if (bitince) bitince(mac, puan);
  }

  // ---------- Kenardan müdahale ----------
  function taktikPenceresi(geri, baslik = "Taktik") {
    if (!m || bitti) return;
    const t = biz();
    const kapat2 = typeof geri === "function" ? geri : ARAYUZ.pencereKapat;
    const sec = (tur, deger, yazi, aktif) => `<button class="secenek" data-${tur}="${deger}" aria-pressed="${aktif}">${yazi}</button>`;
    const sahadakiler = MAC.sahada(t).map((x) => x.o);
    const kalan = 3 - t.degisiklik;
    const kondRenk = (k) => (k >= 70 ? "iyi" : k >= 45 ? "" : "kotu");
    ARAYUZ.pencereAc(baslik, `
      <div class="ayar"><div class="ayar-baslik">Diziliş</div><div class="secenekler">${Object.keys(DIZILISLER).map((d) => sec("diz", d, d, d === t.dizilis)).join("")}</div></div>
      <div class="ayar"><div class="ayar-baslik">Oyun anlayışı</div><div class="secenekler">${Object.entries(ANLAYISLAR).map(([k, a]) => sec("anl", k, a.ad, k === t.anlayis)).join("")}</div></div>
      <div class="ayar"><div class="ayar-baslik">Oyuncu değişikliği <span>${kalan} hak kaldı</span></div>
        ${kalan > 0 && t.yedekler.length ? `<div class="degisiklik">
          <select id="t-cikan">${sahadakiler.map((o) => `<option value="${o.id}">${o.no} · ${kacir(o.soyad)} (${t.yerOf[o.id]}) · kondisyon ${Math.round(t.kond[o.id])}</option>`).join("")}</select>
          <span>yerine</span>
          <select id="t-giren">${t.yedekler.map((o) => `<option value="${o.id}">${o.no} · ${kacir(o.soyad)} (${o.mevki})</option>`).join("")}</select>
          <button class="dugme" id="t-degis">Değiştir</button></div>` : ""}
        <div class="kond-listesi">${sahadakiler.map((o) => `<span class="kond ${kondRenk(t.kond[o.id])}">${kacir(o.soyad)} ${Math.round(t.kond[o.id])}</span>`).join("")}</div>
      </div>`, [{ yazi: typeof geri === "function" ? "İkinci yarıya başla" : "Maça dön", fn: kapat2 }], { esc: kapat2 });
    const govde = $("pencere-govde");
    govde.querySelectorAll("[data-diz]").forEach((b) => { b.onclick = () => { MAC.taktikDegis(m, t, { dizilis: b.dataset.diz }); akisEkle(m.olaylar[m.olaylar.length - 1]); taktikPenceresi(geri, baslik); }; });
    govde.querySelectorAll("[data-anl]").forEach((b) => { b.onclick = () => { MAC.taktikDegis(m, t, { anlayis: b.dataset.anl }); akisEkle(m.olaylar[m.olaylar.length - 1]); taktikPenceresi(geri, baslik); }; });
    const d = $("t-degis");
    if (d) d.onclick = () => {
      if (MAC.degistir(m, t, $("t-cikan").value, $("t-giren").value)) akisEkle(m.olaylar[m.olaylar.length - 1]);
      taktikPenceresi(geri, baslik);
    };
  }

  function bagirPenceresi() {
    if (!m || bitti) return;
    const t = biz();
    const dugmeler = Object.entries(MAC.BAGIRISLAR).map(([k, b]) => `<button class="dugme ikincil bagir-secenek" data-tur="${k}">"${b.yazi}"</button>`).join("");
    ARAYUZ.pencereAc("Kenardan bağır", `<p class="soluk">Her yarıda bir kez. Etkisi on dakika kadar sürer.</p><div class="duraklat-dugmeler">${dugmeler}</div>`, [{ yazi: "Vazgeç", ikincil: true, fn: ARAYUZ.pencereKapat }]);
    $("pencere-govde").querySelectorAll("[data-tur]").forEach((b) => {
      b.onclick = () => { if (MAC.bagir(m, t, b.dataset.tur)) akisEkle(m.olaylar[m.olaylar.length - 1]); ARAYUZ.pencereKapat(); tabela(); };
    });
  }

  $("mac-taktik").onclick = () => taktikPenceresi();
  $("mac-bagir").onclick = bagirPenceresi;
  $("mac-sonuc").onclick = () => {
    ARAYUZ.pencereAc("Sonuca geçilsin mi?", "<p>Maçın kalanı izlenmeden oynanacak.</p>", [
      { yazi: "Vazgeç", ikincil: true, fn: ARAYUZ.pencereKapat },
      { yazi: "Sonuca geç", fn: () => { ARAYUZ.pencereKapat(); sonucaGec(); } },
    ]);
  };

  return { ac };
})();
