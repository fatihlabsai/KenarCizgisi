// M haritası: Kalvar'ın bölgeleri ve mekânları, menajerin yeri, ülke haritası.
// Akşamları dünyadayken bir mekâna tıklayıp arabayla oraya gidilebilir. Harita açıkken saat işlemez (TAM paneli).
const HARITA = (() => {
  // Yürüyüş sırası: batıdan doğuya. Bölgelerin kenarından bir sonrakine geçilir.
  const SIRA = ["ova", "lale", "carsi", "avlu"];
  const BOLGE_NOT = {
    lale: "Evinin olduğu sokak. Karşıda park, akşamları komşular bankta oturur.",
    carsi: "Kafe, lokanta, banka ve dükkânlar. Meydanda pazar tezgâhları kurulur.",
    avlu: "Kulüp binası ve Avlu Stadı. Eski cezaevinin duvarı hâlâ ayakta.",
    ova: "Kasabanın bittiği yer. Göletin kenarında yürümek kafanı dağıtır.",
  };
  // Haritada kısa adlar ve bilgi
  const YER = {
    "ev:daire": { ad: "Lale Sokak 4" },
    "ev:kavakli": { ad: "Kavaklı Apt." },
    "ev:bahceli": { ad: "Ova Yolu 12" },
    "ic:kafe": { ad: "Gözcü Kafe", kisa: "Kafe", not: "Çay ve dedikodu. Kulağına rakiplerle ilgili bir şeyler çalınabilir." },
    "ic:lokanta": { ad: "Ovalı Lokantası", kisa: "Lokanta", not: "Dora'nın yemekleri. Bir oyuncunu yemeğe çağırabilirsin." },
    "ic:banka": { ad: "Kalvar Bankası", kisa: "Banka", not: "Mevduat ve kredi." },
    "ic:emlak": { ad: "Varga Emlak", kisa: "Emlakçı", not: "Kiralık ve satılık evler, yatırımlar." },
    "ic:esya": { ad: "Petri Eşya", kisa: "Eşyacı", not: "Mobilya. Aldığın eşya evinde durur." },
    "ic:galeri": { ad: "Kask Oto Galeri", kisa: "Galeri", not: "Bisiklet ve ikinci el arabalar." },
    kulup: { ad: "Kulüp binası", not: "Kalvar Spor'un binası. Gündüz buradasın, akşamları kapalı." },
    stad: { ad: "Avlu Stadı", not: "Kalvar Spor iç saha maçlarını cumartesi burada oynar." },
    "komsu:petri": { ad: "Jovan Petri", not: "Emekli Jovan Petri'nin evi." },
    "komsu:sorova": { ad: "Lena Sorova", not: "Lena Sorova'nın evi." },
  };
  const iki = (n) => String(n % 24).padStart(2, "0");
  let sekme = "kalvar", secili = null, resimler = {}, resimAy = 0;

  const dunyada = () => S && S.gun && S.gun.dunya && CIZICI.etkin() === SAHNE_DUNYA;
  const arac = () => S && S.hayat && S.hayat.araba;
  function resim(id) {
    const ay = Number(S.tarih.slice(5, 7));
    if (ay !== resimAy) { resimler = {}; resimAy = ay; }
    return resimler[id] || (resimler[id] = SAHNE_DUNYA.tamResim(id, ay));
  }

  // Menajer nerede: sokaktaysa kendi yeri, bir binanın içindeyse o binanın kapısı
  function konum() {
    if (!dunyada()) return null;
    const b = SAHNE_DUNYA.bolge();
    if (!b.ic) { const k = SAHNE_DUNYA.oyuncuKonum(); return { bolge: b.id, x: k.x + 0.5, y: k.y + 0.5 }; }
    if (!b.cikisHedef) return null;
    return { bolge: b.cikisHedef, x: b.cikisNokta.x + 0.5, y: b.cikisNokta.y - 0.5, icinde: b.ad };
  }

  function ac() {
    if (!S) return;
    secili = null; sekme = "kalvar";
    ciz();
  }

  function ciz() {
    const sekmeler = [["kalvar", "Kalvar"], ["ulke", "Carceria ve komşuları"]]
      .map(([id, ad]) => `<button class="secenek" data-sekme="${id}" aria-pressed="${sekme === id}">${ad}</button>`).join("");
    TAM.ac(`<div class="tam-baslik"><h2>Harita</h2><div class="secenekler">${sekmeler}</div><button class="dugme ikincil" id="harita-kapat">Kapat (M)</button></div>
      <div id="harita-govde"></div>`, null, "genis");
    document.querySelectorAll("[data-sekme]").forEach((d) => { d.onclick = () => { sekme = d.dataset.sekme; secili = null; ciz(); }; });
    $("harita-kapat").onclick = () => TAM.kapat();
    if (sekme === "kalvar") kalvar(); else ulke();
  }

  // ---------- Kalvar ----------
  function kalvar() {
    const g = $("harita-govde"), k = konum();
    const hucreler = SIRA.map((id) => {
      const b = SEHIR.bolge(id);
      const yuzde = (x, y) => `left:${(x / b.gen) * 100}%;top:${(y / b.yuk) * 100}%`;
      const pinler = b.kapilar.filter((kp) => kp.bina && YER[kp.hedef]).map((kp) => {
        const evim = kp.hedef === S.ev.id;
        return `<button class="harita-pin${evim ? " ev" : ""}${secili && secili.hedef === kp.hedef ? " secili" : ""}" style="${yuzde(kp.x + 0.5, kp.y - 1.6)}" data-yer="${kp.hedef}" data-bolge="${id}">${evim ? "Evin" : YER[kp.hedef].kisa || YER[kp.hedef].ad}</button>`;
      }).join("");
      const cikislar = b.cikislar.map((c) => `<span class="harita-cikis ${c.kenar}">${c.kenar === "sol" ? "◂ " : ""}${kacir(SEHIR.bolge(c.hedef).ad)}${c.kenar === "sag" ? " ▸" : ""}</span>`).join("");
      const sen = k && k.bolge === id ? `<i class="harita-sen" style="${yuzde(k.x, k.y)}" title="Buradasın"></i>` : "";
      return `<div class="harita-hucre"><button class="harita-bolge-ad${secili && secili.bolge === id && !secili.hedef ? " secili" : ""}" data-bolgead="${id}">${kacir(b.ad)}${k && k.bolge === id ? " · buradasın" : ""}</button>
        <div class="harita-bolge" data-resim="${id}">${pinler}${cikislar}${sen}</div></div>`;
    }).join("");
    g.innerHTML = `<div class="harita-izgara">${hucreler}</div><div class="harita-bilgi" id="harita-bilgi">${bilgi()}</div>`;
    g.querySelectorAll("[data-resim]").forEach((el) => el.prepend(resim(el.dataset.resim)));
    g.querySelectorAll("[data-yer]").forEach((el) => { el.onclick = () => { secili = { bolge: el.dataset.bolge, hedef: el.dataset.yer }; kalvar(); }; });
    g.querySelectorAll("[data-bolgead]").forEach((el) => { el.onclick = () => { secili = { bolge: el.dataset.bolgead }; kalvar(); }; });
    const git = $("harita-git"); if (git) git.onclick = gitTikla;
  }

  // Seçilen yerin bilgisi ve gitme düğmesi
  function bilgi() {
    const k = konum();
    if (!secili) return `<p class="soluk">${k ? (k.icinde ? `Şu an ${kacir(k.icinde)} içindesin. ` : "") + "Kırmızı nokta senin yerin. " : ""}Bir yere tıkla, bilgisi burada çıkar.${arac() && k ? " Araban varsa oraya gidebilirsin." : ""}</p>`;
    const b = SEHIR.bolge(secili.bolge);
    let baslik = b.ad, metin = BOLGE_NOT[b.id], ek = "";
    if (secili.hedef) {
      const h = secili.hedef, y = YER[h];
      baslik = h === S.ev.id ? `Evin · ${y.ad}` : y.ad;
      metin = y.not || "";
      if (h.startsWith("ev:")) {
        const ev = EKONOMI.ev(h);
        if (h === S.ev.id) metin = `${ev.ad}. Yatağında uyuyunca gün biter.`;
        else metin = `${ev.ad}. Kirası ayda ${para(ev.kira)}${ev.satis ? `, satış fiyatı ${para(ev.satis)}` : ""}. Varga Emlak'tan sorabilirsin.`;
      }
      const saat = YASAM.ACIK[h];
      if (saat) {
        const acikMi = dunyada() && S.gun.dunya.saat / 60 >= saat[0] && S.gun.dunya.saat / 60 < saat[1];
        ek += `<p>Açık: ${iki(saat[0])}:00–${iki(saat[1])}:00${dunyada() ? (acikMi ? " · şu an açık" : " · şu an kapalı") : ""}</p>`;
      }
      const ic = SEHIR.bolge(h);
      const kimler = ic && (ic.insanlar || []).map((p) => YASAM.TANIDIK[p.id] && YASAM.TANIDIK[p.id].ad).filter(Boolean);
      if (kimler && kimler.length) ek += `<p class="soluk">Orada: ${kimler.join(", ")}</p>`;
    }
    // Gitmek
    let dugme = "";
    if (dunyada() && k) {
      const fark = Math.abs(SIRA.indexOf(k.bolge) - SIRA.indexOf(b.id));
      if (fark === 0 && !secili.hedef) dugme = `<p class="soluk">Bu bölgedesin.</p>`;
      else if (fark === 0) dugme = `<p class="soluk">Bu sokakta, yürüyerek gidebilirsin.</p>`;
      else if (arac()) {
        const bisiklet = S.hayat.araba === "bisiklet";
        dugme = `<button class="dugme" id="harita-git">${bisiklet ? "Bisikletle" : "Arabayla"} git (${bisiklet ? 20 : 10} dakika)</button>`;
      } else dugme = `<p class="soluk">Araban yok. Yürüyerek ${fark === 1 ? "bir" : fark === 2 ? "iki" : "üç"} sokak öte, bölgenin kenarından geçilir.</p>`;
    }
    return `<h3>${kacir(baslik)}</h3><p>${kacir(metin)}</p>${ek}${dugme}`;
  }

  function gitTikla() {
    const b = SEHIR.bolge(secili.bolge);
    let hedef = Object.keys(b.noktalar).find((n) => /Giris$/.test(n));
    if (secili.hedef) { const kp = b.kapilar.find((x) => x.hedef === secili.hedef); hedef = { x: kp.x, y: kp.y }; }
    const dk = S.hayat.araba === "bisiklet" ? 20 : 10;
    TAM.kapat();
    YASAM.git(b.id, hedef, dk);
  }

  // ---------- Ülke ----------
  // 💡 Şehirlerin yerleri TASARIM.md 3.1'deki notlara göre. Kalvar kuzeyde, Brennik batıda, Ardessa doğuda, Tessel güneyde, Mirov kuzeydoğuda.
  const CARCERIA = [
    ["", "Kalvar", "Mirov"],
    ["Brennik", "Carceria City", "Ardessa"],
    ["", "Tessel", ""],
  ];
  const SEHIR_NOT = {
    "Carceria City": "Başkent. Eski merkez cezaevi şehrin ortasında.", Kalvar: "Ovanın ortasında. Avlu Stadı eski cezaevinin avlusunda.",
    Brennik: "Sinistra'dan katılan bölge.", Ardessa: "Odexia'dan katılan bölge, iki dil konuşulur.",
    Tessel: "Nehir kenarında sanayi kasabası, demiryolu deposu.", Mirov: "Tepelerde, yazlıkların kasabası.",
  };
  const KOMSU = {
    sinistra: { ad: "Sinistra", yon: "Batı · yeşil ve ormanlık", sehirler: [["Valmora", "Başkent"], ["Corvessa", "Nehir limanı"], ["Lucerno", "Üniversite şehri"], ["Montelago", "Göl kıyısı"], ["Santaro", "Ova ve tarım"], ["Ferrano", "Maden şehri, Carceria sınırında"]] },
    odexia: { ad: "Odexia", yon: "Doğu · turuncu ve dağlık", sehirler: [["Dorakos", "Carceria sınırında"], ["Tyrenna", "Başkent"], ["Kastrion", "Eski kale şehri"], ["Melitha", "Göl kıyısı"], ["Varnessa", "Dağ eteğinde sanayi"], ["Pelion", "Kuzeyde dağ kasabası"]] },
  };

  function ulke() {
    const kulupler = [...KULUPLER, ...(S.ekKulupler || [])];
    const ligde = new Set(S.lig ? S.lig.kulupler : KULUPLER.map((k) => k.id));
    const yatirim = (sehir) => S.hayat.yatirimlar.filter((y) => (sehir === "Tessel" && y.id === "tessel") || (sehir === "Mirov" && (y.id === "arsa" || y.id === "yazlik")));
    const hucre = (ad) => {
      if (!ad) return `<div></div>`;
      const burada = ad === "Kalvar";
      const kl = kulupler.filter((k) => (k.sehir === ad || k.sehir.startsWith(ad + " ")) && ligde.has(k.id)).map((k) => `<span class="harita-kulup" style="--forma:${k.forma}">${kacir(k.kisa)}</span>`).join("");
      const yt = yatirim(ad).length ? `<span class="harita-yatirim">yatırımın var</span>` : "";
      return `<div class="harita-sehir${burada ? " burada" : ""}"><b>${ad}</b>${burada ? " <span class='harita-etiket'>buradasın</span>" : ""}<small>${SEHIR_NOT[ad]}</small><div>${kl}${yt}</div></div>`;
    };
    const komsu = (u) => `<div class="harita-ulke komsu"><h3>${u.ad}</h3><p class="soluk">${u.yon}</p>
      <ul>${u.sehirler.map(([a, n]) => `<li><b>${a}</b> <small>${n}</small></li>`).join("")}</ul></div>`;
    $("harita-govde").innerHTML = `<div class="harita-ulkeler">
      ${komsu(KOMSU.sinistra)}
      <div class="harita-sinir">sınır</div>
      <div class="harita-ulke carceria"><h3>Carceria</h3><p class="soluk">130 km² · başkent Carceria City</p>
        <div class="harita-pusula">${CARCERIA.flat().map(hucre).join("")}</div></div>
      <div class="harita-sinir">sınır</div>
      ${komsu(KOMSU.odexia)}
    </div>
    <p class="soluk">Şimdilik sadece Kalvar'da dolaşabilirsin. Renkli etiketler Carceria Ligi'ndeki kulüpler.</p>`;
  }

  // M tuşu: oyun ekranındayken haritayı açar ya da kapatır
  addEventListener("keydown", (e) => {
    if (e.key !== "m" && e.key !== "M") return;
    if (!S || $("ekran-oyun").hidden || ARAYUZ.pencereAcik() || /INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName)) return;
    if (TAM.acik()) { if ($("harita-govde")) TAM.kapat(); return; }
    e.preventDefault();
    ac();
  });

  return { ac };
})();
