// Kadro ekranı (oyuncu tablosu, oyuncu kartı) ve maç öncesi kadro seçimi.
const KADRO = (() => {
  const resimOnbellek = new Map();
  function resim(o, kulup, boy = 32) {
    const anahtar = o.id + kulup.forma + JSON.stringify(o.gorunus);
    if (!resimOnbellek.has(anahtar)) resimOnbellek.set(anahtar, KARAKTER.oyuncu(o, kulup).toDataURL());
    return `<img class="portre" src="${resimOnbellek.get(anahtar)}" width="${boy}" height="${boy}" alt="">`;
  }
  const SIRA = { KL: 0, DF: 1, OS: 2, FV: 3 };
  const KOKEN_KISA = { c: "CAR", s: "SİN", o: "ODX" };
  const sinif = (v) => (v >= 14 ? "iyi" : v <= 7 ? "kotu" : "");
  const kondSinif = (v) => (v >= 80 ? "iyi" : v < 60 ? "kotu" : "");

  function kulup() { return kulupBul(S.kulupId); }
  function takim() { return S.takimlar[S.kulupId]; }

  // ---------- Kadro tablosu ----------
  function listeAc(geri) {
    const t = takim(), k = kulup();
    const ilk11 = new Set(t.taktik.ilk11);
    const ozler = Object.keys(OZELLIK_KISA);
    const satirlar = t.kadro.slice().sort((a, b) => SIRA[a.mevki] - SIRA[b.mevki] || a.no - b.no).map((o) => `
      <tr data-id="${o.id}" class="${ilk11.has(o.id) ? "ilk11" : ""}">
        <td>${o.no}</td><td>${resim(o, k, 32)}</td>
        <td class="sol"><b>${kacir(DUNYA.adSoyad(o))}</b></td>
        <td>${o.mevki}</td><td>${o.yas}</td><td>${KOKEN_KISA[o.koken]}</td>
        <td><b>${Math.round(DUNYA.guc(o))}</b></td>
        <td class="${kondSinif(o.kondisyon)}">${o.kondisyon}</td>
        <td class="${o.moral >= 70 ? "iyi" : o.moral < 45 ? "kotu" : ""}">${o.moral}</td>
        <td>${o.maclar ? o.form.toFixed(1) : "–"}</td>
        ${ozler.map((z) => `<td class="${sinif(o.oz[z])}">${o.oz[z]}</td>`).join("")}
      </tr>`).join("");
    TAM.ac(`
      <div class="tam-baslik"><h2>Kadro</h2><span class="soluk">${kacir(k.ad)} · ${t.kadro.length} oyuncu · koyu satırlar ilk on bir</span>
        <button class="dugme ikincil" id="kadro-kapat">Kapat</button></div>
      <div class="tablo-kutu"><table class="tablo kadro-tablo">
        <thead><tr><th>No</th><th></th><th class="sol">Ad</th><th>Mevki</th><th>Yaş</th><th>Köken</th><th>Güç</th><th>Kond</th><th>Moral</th><th>Form</th>
          ${ozler.map((z) => `<th title="${OZELLIK_ADI[z]}">${OZELLIK_KISA[z]}</th>`).join("")}</tr></thead>
        <tbody>${satirlar}</tbody></table></div>`, geri, "genis");
    $("kadro-kapat").onclick = TAM.kapat;
    document.querySelectorAll(".kadro-tablo tbody tr").forEach((tr) => { tr.onclick = () => oyuncuKarti(tr.dataset.id); });
  }

  function oyuncuKarti(id) {
    const o = DUNYA.oyuncuBul(S, id), k = kulup();
    const moralYazi = o.moral >= 70 ? "Keyfi yerinde" : o.moral >= 45 ? "Normal" : "Morali bozuk";
    const ozler = Object.keys(OZELLIK_ADI).filter((z) => o.mevki === "KL" || z !== "kaleci");
    const cubuk = (z) => {
      const v = o.oz[z], g = Math.min(1, o.gelisim[z] || 0);
      return `<div class="oz-satir"><span>${OZELLIK_ADI[z]}</span><div class="oz-cubuk"><i style="width:${v * 5}%"></i></div><b class="${sinif(v)}">${v}</b>
        <div class="gelisim" title="Bir sonraki puana ilerleme"><i style="width:${Math.round(g * 100)}%"></i></div></div>`;
    };
    ARAYUZ.pencereAc(DUNYA.adSoyad(o), `
      <div class="oyuncu-karti">
        <div class="kart-sol">${resim(o, k, 96)}<p class="soluk">${kacir(k.kisa)} · No ${o.no}</p></div>
        <div class="kart-sag">
          <p>${MEVKI_ADI[o.mevki]} · ${o.yas} yaşında · ${KOKEN_ADI[o.koken]}</p>
          <p class="soluk">Güç ${Math.round(DUNYA.guc(o))} · Kondisyon ${o.kondisyon} · Moral ${o.moral} (${moralYazi})</p>
          <p class="soluk">${o.maclar} maç · ${o.gol} gol${o.maclar ? ` · son maç puanı ${o.form.toFixed(1)}` : ""}</p>
          <div class="oz-liste">${ozler.map(cubuk).join("")}</div>
        </div>
      </div>`, [{ yazi: "Kapat", fn: ARAYUZ.pencereKapat }]);
  }

  // ---------- Kadro seçimi ----------
  function secimAc(geri) {
    const t = takim(), k = kulup();
    const yerler = DIZILISLER[t.taktik.dizilis];
    const sec = (tur, deger, yazi, aktif) => `<button class="secenek" data-${tur}="${deger}" aria-pressed="${aktif}">${yazi}</button>`;
    const oyuncuSecenekleri = (yerMevki, seciliId) => t.kadro.slice().sort((a, b) => DUNYA.guc(b, yerMevki) - DUNYA.guc(a, yerMevki)).map((o) =>
      `<option value="${o.id}"${o.id === seciliId ? " selected" : ""}>${o.no} · ${kacir(o.soyad)} (${o.mevki}) · ${Math.round(DUNYA.guc(o, yerMevki))} · kond ${o.kondisyon}</option>`).join("");
    const satirlar = yerler.map((y, i) => {
      const o = DUNYA.oyuncuBul(S, t.taktik.ilk11[i]);
      const uyari = o && o.mevki !== y[0] ? `<span class="uyari-kucuk">mevkisi değil</span>` : o && o.kondisyon < 60 ? `<span class="uyari-kucuk">yorgun</span>` : "";
      return `<div class="yer-satir"><span class="yer-etiket">${y[0]}</span>${o ? resim(o, k, 32) : ""}<select data-yer="${i}">${oyuncuSecenekleri(y[0], t.taktik.ilk11[i])}</select>${uyari}</div>`;
    }).join("");
    const yedekler = t.kadro.filter((o) => !t.taktik.ilk11.includes(o.id)).sort((a, b) => SIRA[a.mevki] - SIRA[b.mevki]);
    TAM.ac(`
      <div class="tam-baslik"><h2>Kadro ve taktik</h2><span class="soluk">${kacir(k.ad)}</span><button class="dugme" id="secim-tamam">Tamam</button></div>
      <div class="secim-izgara">
        <div>
          <div class="ayar"><div class="ayar-baslik">Diziliş</div><div class="secenekler">${Object.keys(DIZILISLER).map((d) => sec("diz", d, d, d === t.taktik.dizilis)).join("")}</div></div>
          <div class="ayar"><div class="ayar-baslik">Oyun anlayışı</div><div class="secenekler">${Object.entries(ANLAYISLAR).map(([a, x]) => sec("anl", a, x.ad, a === t.taktik.anlayis)).join("")}</div></div>
          <div class="ayar"><div class="ayar-baslik">Yedekler</div><div class="yedek-liste">${yedekler.map((o) => `<span>${o.no} · ${kacir(o.soyad)} <i>${o.mevki}</i></span>`).join("")}</div></div>
          <button class="dugme ikincil" id="secim-eniyi">En iyi 11'i seç</button>
        </div>
        <div class="yerler">${satirlar}</div>
      </div>`, geri, "genis");
    const yenile = () => secimAc(geri);
    $("secim-tamam").onclick = () => { kaydet(true); TAM.kapat(); };
    $("secim-eniyi").onclick = () => { t.taktik.ilk11 = DUNYA.enIyi11(t.kadro, t.taktik.dizilis); yenile(); };
    document.querySelectorAll("[data-diz]").forEach((b) => { b.onclick = () => { t.taktik.dizilis = b.dataset.diz; t.taktik.ilk11 = DUNYA.yenidenYerlestir(t.kadro, t.taktik.ilk11, t.taktik.dizilis); yenile(); }; });
    document.querySelectorAll("[data-anl]").forEach((b) => { b.onclick = () => { t.taktik.anlayis = b.dataset.anl; yenile(); }; });
    document.querySelectorAll("[data-yer]").forEach((s) => {
      s.onchange = () => {
        const i = +s.dataset.yer, yeni = s.value;
        const eski = t.taktik.ilk11[i];
        const j = t.taktik.ilk11.indexOf(yeni);
        if (j >= 0) t.taktik.ilk11[j] = eski; // oyuncu başka yerdeyse yer değiştirirler
        t.taktik.ilk11[i] = yeni;
        yenile();
      };
    });
  }

  return { listeAc, secimAc, resim };
})();
