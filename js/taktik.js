// Görsel taktik ekranı: sahada dizilim, sürükle-bırak, talimatlar, görevler, yedekler, rakip analizi.
// İki kipte çalışır: "onMac" (kulübün kayıtlı taktiği) ve "mac" (oynanan maçtaki takım).
const TAKTIK = (() => {
  let ayar = null;   // { mod, geri, rakip, m, t, olaylar }
  let secili = null; // tıklayarak seçme: { tur: "slot"|"yedek", deger }

  const GOREVLER = { kaptan: "Kaptan", penalti: "Penaltıcı", duran: "Korner ve frikik" };
  const ROZET = { kaptan: "K", penalti: "P", duran: "D" };

  // ---------- Model: iki kip için ortak görünüm ----------
  function model() {
    if (ayar.mod === "mac") {
      const t = ayar.t;
      const yerler = DIZILISLER[t.dizilis];
      const ilk11 = yerler.map((y, i) => { const x = MAC.sahada(t).find((z) => z.i === i); return x ? x.o.id : null; });
      return {
        kulup: t.k, dizilis: t.dizilis, anlayis: t.anlayis, talimat: t.talimat, gorev: t.gorev,
        ilk11, kadro: [...MAC.sahada(t).map((x) => x.o), ...t.yedekler],
        yedekler: t.yedekler, kond: (o) => Math.round(t.kond[o.id]), degisiklikKalan: 3 - t.degisiklik,
      };
    }
    const tk = S.takimlar[S.kulupId];
    const t = tk.taktik;
    t.talimat = { ...VARSAYILAN_TALIMAT, ...(t.talimat || {}) };
    DUNYA.gorevleriTamamla(t, tk.kadro);
    return {
      kulup: kulupBul(S.kulupId), dizilis: t.dizilis, anlayis: t.anlayis, talimat: t.talimat, gorev: t.gorev,
      ilk11: t.ilk11, kadro: tk.kadro, yedekler: tk.kadro.filter((o) => !t.ilk11.includes(o.id)),
      kond: (o) => o.kondisyon, degisiklikKalan: null,
    };
  }
  const oyuncu = (md, id) => md.kadro.find((o) => o.id === id) || DUNYA.oyuncuBul(S, id);

  // ---------- Değişiklikler ----------
  function islem(fn) {
    const once = ayar.m ? ayar.m.olaylar.length : 0;
    fn();
    if (ayar.m && ayar.olaylar) ayar.m.olaylar.slice(once).forEach(ayar.olaylar);
    if (ayar.mod === "onMac") kaydet(true);
    secili = null;
    ciz();
  }

  function slotTakas(i, j) {
    if (i === j) return;
    const md = model();
    islem(() => {
      if (ayar.mod === "mac") MAC.yerDegistir(ayar.m, ayar.t, md.ilk11[i], md.ilk11[j]);
      else { const a = md.ilk11; [a[i], a[j]] = [a[j], a[i]]; }
    });
  }

  function yedekGir(yedekId, i) {
    const md = model();
    const o = oyuncu(md, yedekId);
    if (!DUNYA.uygun(o)) { ARAYUZ.bildirim(`${o.soyad} ${o.ceza > 0 ? "cezalı" : "sakat"}, oynayamaz`); return; }
    if (ayar.mod === "mac") {
      if (md.degisiklikKalan <= 0) { ARAYUZ.bildirim("Değişiklik hakkın kalmadı"); return; }
      if (!md.ilk11[i]) return;
      islem(() => MAC.degistir(ayar.m, ayar.t, md.ilk11[i], yedekId));
    } else islem(() => { md.ilk11[i] = yedekId; });
  }

  function dizilisSec(d) {
    islem(() => {
      if (ayar.mod === "mac") MAC.taktikDegis(ayar.m, ayar.t, { dizilis: d });
      else { const t = S.takimlar[S.kulupId].taktik; t.dizilis = d; t.ilk11 = DUNYA.yenidenYerlestir(S.takimlar[S.kulupId].kadro, t.ilk11, d); }
    });
  }

  function anlayisSec(a) {
    islem(() => {
      if (ayar.mod === "mac") MAC.taktikDegis(ayar.m, ayar.t, { anlayis: a });
      else S.takimlar[S.kulupId].taktik.anlayis = a;
    });
  }

  function talimatSec(k, v) {
    islem(() => {
      if (ayar.mod === "mac") MAC.taktikDegis(ayar.m, ayar.t, { talimat: { [k]: v } });
      else S.takimlar[S.kulupId].taktik.talimat[k] = v;
    });
  }

  function gorevSec(k, id) { islem(() => { model().gorev[k] = id; }); }

  // ---------- Çizim ----------
  // Saha dikey: kendi kalemiz altta, rakip kalesi üstte
  const konum = (x, y) => ({ top: 4 + (1 - x / 0.76) * 84, left: 7 + y * 86 });

  function tokenHtml(md, o, i, yer) {
    const k = md.kond(o);
    const mevkiDisi = o.mevki !== yer;
    const rozetler = Object.entries(ROZET).filter(([g]) => md.gorev[g] === o.id).map(([, r]) => `<i class="rozet">${r}</i>`).join("");
    const uyari = !DUNYA.uygun(o) ? `<em class="tk-uyari">${o.ceza > 0 ? "CEZALI" : "SAKAT"}</em>` : mevkiDisi ? `<em class="tk-uyari">MEVKİ DIŞI</em>` : "";
    return `<div class="tk-oyuncu${secili && secili.tur === "slot" && secili.deger === i ? " secili" : ""}${mevkiDisi ? " disi" : ""}" draggable="true" data-slot="${i}" title="${kacir(DUNYA.adSoyad(o))} · ${MEVKI_ADI[o.mevki]} · güç ${Math.round(DUNYA.guc(o, yer))}">
      <div class="tk-resim">${KADRO.resim(o, md.kulup, 40)}<span class="tk-no">${o.no}</span>${rozetler ? `<span class="rozetler">${rozetler}</span>` : ""}</div>
      <b>${kacir(o.soyad)}</b>
      <span class="tk-kond"><i style="width:${k}%" class="${k < 60 ? "dusuk" : k < 80 ? "orta" : ""}"></i></span>
      <span class="tk-yer">${yer}</span>${uyari}
    </div>`;
  }

  function sahaHtml(md) {
    const yerler = DIZILISLER[md.dizilis];
    const tokenlar = yerler.map((y, i) => {
      const p = konum(y[1], y[2]);
      const o = md.ilk11[i] ? oyuncu(md, md.ilk11[i]) : null;
      return `<div class="tk-yuva" style="top:${p.top}%;left:${p.left}%">${o ? tokenHtml(md, o, i, y[0]) : `<div class="tk-bos" data-slot="${i}">${y[0]}</div>`}</div>`;
    }).join("");
    return `<div class="taktik-saha" id="tk-saha"><div class="saha-cizgi orta"></div><div class="saha-cizgi daire"></div>
      <div class="saha-cizgi ceza ust"></div><div class="saha-cizgi ceza alt"></div>${tokenlar}</div>`;
  }

  function rakipHtml() {
    if (!ayar.rakip) return "";
    const r = kulupBul(ayar.rakip);
    const d = S.bilinen && S.bilinen[r.id];
    const noktalar = d ? DIZILISLER[d].map((y) => { const p = konum(y[1], y[2]); return `<i style="top:${100 - p.top}%;left:${p.left}%;background:${r.forma}"></i>`; }).join("") : `<span class="soru-isareti">?</span>`;
    return `<div class="ayar"><div class="ayar-baslik">Rakip: ${kacir(r.kisa)} <span>${d ? d : "dizilişi bilinmiyor"}</span></div>
      <div class="mini-saha">${noktalar}</div>${d ? "" : `<p class="kucuk-yazi">Gözcü Kafe'de kulağına bir şeyler çalınabilir.</p>`}</div>`;
  }

  function ciz() {
    const md = model();
    const sec = (veri, deger, yazi, aktif, ipucu = "") => `<button class="secenek" ${veri}="${deger}" aria-pressed="${aktif}"${ipucu ? ` title="${kacir(ipucu)}"` : ""}>${yazi}</button>`;
    const talimatlar = Object.entries(TALIMATLAR).map(([k, t]) => {
      const secilen = t.secenek[md.talimat[k]];
      return `<div class="talimat"><span>${t.ad}</span><div class="secenekler">${Object.entries(t.secenek).map(([v, s]) => sec(`data-tal="${k}" data-v`, v, s.ad, md.talimat[k] === v, s.aciklama)).join("")}</div>
        ${secilen && secilen.aciklama ? `<p class="kucuk-yazi">${kacir(secilen.aciklama)}</p>` : ""}</div>`;
    }).join("");
    const sahadakiler = md.ilk11.filter(Boolean).map((id) => oyuncu(md, id));
    const gorevler = Object.entries(GOREVLER).map(([k, ad]) => `<label class="gorev"><span>${ad}</span><select data-gorev="${k}">${sahadakiler.map((o) => `<option value="${o.id}"${md.gorev[k] === o.id ? " selected" : ""}>${o.no} · ${kacir(o.soyad)}</option>`).join("")}</select></label>`).join("");
    const SIRA = { KL: 0, DF: 1, OS: 2, FV: 3 };
    const yedekler = md.yedekler.slice().sort((a, b) => SIRA[a.mevki] - SIRA[b.mevki] || DUNYA.guc(b) - DUNYA.guc(a)).map((o) => {
      const uygunDegil = !DUNYA.uygun(o);
      return `<div class="tk-yedek${uygunDegil ? " uygun-degil" : ""}${secili && secili.tur === "yedek" && secili.deger === o.id ? " secili" : ""}" draggable="${!uygunDegil}" data-yedek="${o.id}">
        ${KADRO.resim(o, md.kulup, 24)}<span>${o.no}</span><b>${kacir(o.soyad)}</b><i>${o.mevki}</i><span>${Math.round(DUNYA.guc(o))}</span>
        <span class="${md.kond(o) < 60 ? "kotu" : ""}">${md.kond(o)}</span>${uygunDegil ? `<em>${o.ceza > 0 ? "cezalı" : `sakat · ${o.sakatlik.gun} gün`}</em>` : ""}</div>`;
    }).join("");
    const baslik = ayar.mod === "mac" ? `Taktik · ${MAC.dakikaYazi(ayar.m)}'` : "Taktik";
    const degisiklik = ayar.mod === "mac" ? `<span class="soluk">${md.degisiklikKalan} değişiklik hakkı</span>` : "";
    $("oyun-tam-icerik").className = "kagit tam-kagit taktik-kagit";
    $("oyun-tam-icerik").innerHTML = `
      <div class="tam-baslik"><h2>${baslik}</h2><span class="soluk">${kacir(md.kulup.ad)}</span>${degisiklik}
        ${ayar.mod === "onMac" ? `<button class="dugme ikincil" id="tk-eniyi">En iyi 11</button>` : ""}
        <button class="dugme" id="tk-tamam">${ayar.mod === "mac" ? (ayar.devreArasi ? "İkinci yarıya başla" : "Maça dön") : "Tamam"}</button></div>
      <div class="taktik-izgara">
        <div class="taktik-sol">${sahaHtml(md)}<p class="kucuk-yazi">Yer değiştirmek için bir oyuncuyu diğerinin üstüne sürükle ya da sırayla ikisine tıkla. Yedekten sahaya da aynı şekilde.</p></div>
        <div class="taktik-sag">
          <div class="ayar"><div class="ayar-baslik">Diziliş</div><div class="secenekler">${Object.keys(DIZILISLER).map((d) => sec("data-diz", d, d, d === md.dizilis)).join("")}</div></div>
          <div class="ayar"><div class="ayar-baslik">Oyun anlayışı</div><div class="secenekler">${Object.entries(ANLAYISLAR).map(([a, x]) => sec("data-anl", a, x.ad, a === md.anlayis)).join("")}</div></div>
          <div class="ayar"><div class="ayar-baslik">Takım talimatları</div>${talimatlar}</div>
          <div class="ayar"><div class="ayar-baslik">Görevler</div><div class="gorevler">${gorevler}</div></div>
          <div class="ayar"><div class="ayar-baslik">Yedekler</div><div class="tk-yedekler">${yedekler}</div></div>
          ${rakipHtml()}
        </div>
      </div>`;
    baglantilar();
  }

  function baglantilar() {
    const kok = $("oyun-tam-icerik");
    $("tk-tamam").onclick = TAM.kapat;
    if ($("tk-eniyi")) $("tk-eniyi").onclick = () => islem(() => { const t = S.takimlar[S.kulupId].taktik; t.ilk11 = DUNYA.enIyi11(S.takimlar[S.kulupId].kadro, t.dizilis); });
    kok.querySelectorAll("[data-diz]").forEach((b) => { b.onclick = () => dizilisSec(b.dataset.diz); });
    kok.querySelectorAll("[data-anl]").forEach((b) => { b.onclick = () => anlayisSec(b.dataset.anl); });
    kok.querySelectorAll("[data-tal]").forEach((b) => { b.onclick = () => talimatSec(b.dataset.tal, b.dataset.v); });
    kok.querySelectorAll("[data-gorev]").forEach((s) => { s.onchange = () => gorevSec(s.dataset.gorev, s.value); });
    // Sürükle-bırak
    const tasi = (el, veri) => el.addEventListener("dragstart", (e) => { e.dataTransfer.setData("text/plain", veri); e.dataTransfer.effectAllowed = "move"; el.classList.add("suruklenen"); });
    kok.querySelectorAll(".tk-oyuncu").forEach((el) => tasi(el, "slot:" + el.dataset.slot));
    kok.querySelectorAll(".tk-yedek[draggable=true]").forEach((el) => tasi(el, "yedek:" + el.dataset.yedek));
    kok.querySelectorAll("[data-slot]").forEach((el) => {
      el.addEventListener("dragover", (e) => { e.preventDefault(); el.classList.add("hedef"); });
      el.addEventListener("dragleave", () => el.classList.remove("hedef"));
      el.addEventListener("drop", (e) => {
        e.preventDefault();
        const [tur, deger] = e.dataTransfer.getData("text/plain").split(":");
        const i = +el.dataset.slot;
        if (tur === "slot") slotTakas(+deger, i); else if (tur === "yedek") yedekGir(deger, i);
      });
      // Tıklayarak: önce birini seç, sonra hedefe tıkla
      el.addEventListener("click", () => {
        const i = +el.dataset.slot;
        if (secili && secili.tur === "slot") slotTakas(secili.deger, i);
        else if (secili && secili.tur === "yedek") yedekGir(secili.deger, i);
        else { secili = { tur: "slot", deger: i }; ciz(); }
      });
    });
    kok.querySelectorAll(".tk-yedek").forEach((el) => {
      el.addEventListener("click", () => { secili = secili && secili.deger === el.dataset.yedek ? null : { tur: "yedek", deger: el.dataset.yedek }; ciz(); });
    });
  }

  // secenekler: { mod: "onMac"|"mac", geri, rakip, m, t, olaylar(e), devreArasi }
  function ac(sec) {
    ayar = { mod: "onMac", ...sec };
    secili = null;
    TAM.ac("", () => { const g = ayar.geri; ayar = null; if (g) g(); }, "taktik-kagit");
    ciz();
  }

  return { ac, acik: () => !!ayar };
})();
