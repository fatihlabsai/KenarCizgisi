// Menajerin akşamları ve pazarları: yürünebilir Kalvar'da saat, mekânlar, insanlar, konuşmalar, tanışma, uyku.
const YASAM = (() => {
  const sinirla = DUNYA.sinirla;
  const DAKIKA_HIZ = 2;         // gerçek saniye başına oyun dakikası
  const ACIK = { "ic:kafe": [8, 24], "ic:lokanta": [12, 23], "ic:banka": [9, 21], "ic:emlak": [9, 21], "ic:esya": [9, 21], "ic:galeri": [9, 21] };
  let zamanlayici = null, sonKayit = 0, diyalog = null;
  SAHNE_DUNYA.fareBagla($("tuval-oyun"));

  const gun = () => S.gun.dunya;
  const saatYazi = (dk) => `${String(Math.floor(dk / 60) % 24).padStart(2, "0")}:${String(Math.floor(dk % 60)).padStart(2, "0")}`;
  const ay = () => Number(S.tarih.slice(5, 7));
  const haftaGunu = () => HAFTA.haftaGunu(S.tarih);

  // ---------- Tanıdıklar ----------
  // 💡 Jovan Petri ve Lena Sorova, CARCERIA'daki 1982 gardiyanları; bugün emekliler.
  const TANIDIK = {
    mavro: { ad: "Mavro", rol: "kafeci", g: { ten: 1, sac: 4, sacRenk: 3, sakal: 4, ust: 5, ustRenk: 1, alt: 4, ayakkabi: 1 } },
    dora: { ad: "Dora", rol: "lokantaci", g: { ten: 0, sac: 5, sacRenk: 1, sakal: 0, ust: 0, ustRenk: 3, alt: 1, ayakkabi: 0 } },
    tamm: { ad: "Bay Tamm", rol: "bankaci", g: { ten: 0, sac: 2, sacRenk: 4, sakal: 2, ust: 3, ustRenk: 0, alt: 0, ayakkabi: 0 } },
    varga: { ad: "Ilse Varga", rol: "emlakci", g: { ten: 3, sac: 6, sacRenk: 2, sakal: 0, ust: 4, ustRenk: 5, alt: 3, ayakkabi: 2 } },
    usta: { ad: "Petri usta", rol: "esyaci", g: { ten: 1, sac: 0, sacRenk: 0, sakal: 3, ust: 5, ustRenk: 4, alt: 4, ayakkabi: 1 } },
    rado: { ad: "Rado Kask", rol: "galerici", g: { ten: 2, sac: 3, sacRenk: 3, sakal: 1, ust: 3, ustRenk: 2, alt: 2, ayakkabi: 0 } },
    halvor: { ad: "Mira Halvor", rol: "gazeteci", g: { ten: 0, sac: 7, sacRenk: 0, sakal: 0, ust: 1, ustRenk: 1, alt: 2, ayakkabi: 2 } },
    jovan: { ad: "Jovan Petri", rol: "emekli", g: { ten: 1, sac: 4, sacRenk: 4, sakal: 4, ust: 3, ustRenk: 1, alt: 3, ayakkabi: 1 } },
    lena: { ad: "Lena Sorova", rol: "komsu", g: { ten: 0, sac: 5, sacRenk: 4, sakal: 0, ust: 0, ustRenk: 0, alt: 0, ayakkabi: 0 } },
  };
  const resimOnbellek = new Map();
  const resim = (g, forma) => {
    const k = JSON.stringify(g) + (forma || "");
    if (!resimOnbellek.has(k)) {
      const t = KARAKTER.tarif(g);
      if (forma) Object.assign(t, { ust: [10, 0], ustRenk: forma });
      resimOnbellek.set(k, KARAKTER.yap(t));
    }
    return resimOnbellek.get(k);
  };

  // Bölgede bu saatte kimler var: tanıdıklar, oyuncular, taraftarlar, kasabalılar
  function insanlarHazirla(bolgeId) {
    const b = SEHIR.bolge(bolgeId);
    const dk = gun().saat, hg = haftaGunu();
    const rnd = KARAKTER.tohumlu(Number(S.tarih.replace(/-/g, "")) + bolgeId.length * 13);
    const liste = [];
    const tanidik = (id, x, y, ek = {}) => liste.push({ id, ad: TANIDIK[id].ad, img: resim(TANIDIK[id].g), x, y, tanidik: true, rol: TANIDIK[id].rol, ...ek });
    for (const p of b.insanlar || []) tanidik(p.id, p.x, p.y, { sabit: true });
    if (bolgeId === "ic:kafe" && (hg === 2 || hg === 4 || hg === 0)) tanidik("halvor", 11, 6, { sabit: true });
    if (bolgeId === "lale" && dk < 21 * 60) { tanidik("jovan", 6, 17, { sabit: true }); tanidik("lena", 28, 10, { gezer: true }); }
    if (bolgeId === "ova" && hg === 0) tanidik("jovan", 18, 12, { sabit: true });
    if (bolgeId === "carsi" && hg === 0) tanidik("halvor", 20, 18);
    // Tanışılan kişi bazı akşamlar kafede, pazarları ovada
    const tk = S.hayat.tanisma;
    if (tk && ((bolgeId === "ic:kafe" && rnd() < 0.45) || (bolgeId === "ova" && hg === 0))) liste.push({ id: "tanisma", ad: tk.ad, img: resim(tk.g), x: bolgeId === "ova" ? 26 : 8, y: bolgeId === "ova" ? 11 : 6, tanidik: true, rol: "tanisma", sabit: bolgeId !== "ova" });
    if (b.ic) return liste;
    // Oyuncularımızdan birkaçı çarşıda ve kafede
    const kadro = S.takimlar[S.kulupId].kadro.filter((o) => DUNYA.uygun(o) || o.sakatlik);
    const kulup = kulupBul(S.kulupId);
    if (bolgeId === "carsi" || bolgeId === "lale") {
      for (let i = 0; i < 2; i++) {
        const o = kadro[Math.floor(rnd() * kadro.length)];
        if (o && !liste.some((x) => x.oyuncu === o.id)) liste.push({ id: "o:" + o.id, oyuncu: o.id, ad: o.soyad, img: KARAKTER.oyuncu(o, { ...kulup, forma: renkSec(rnd) }), ...rastgeleNokta(b, rnd), tanidik: true, rol: "oyuncu" });
      }
    }
    // Taraftarlar (kulüp renginde) ve kasabalılar
    const kalabalik = { lale: 4, carsi: dk < 21 * 60 ? 8 : 4, avlu: 3, ova: 2 }[bolgeId] || 3;
    for (let i = 0; i < kalabalik; i++) {
      const g = KARAKTER.rastgeleGorunus(rnd);
      const taraftar = rnd() < (bolgeId === "avlu" ? 0.6 : 0.3);
      const koken = rnd() < 0.7 ? "c" : rnd() < 0.5 ? "s" : "o";
      const kadin = rnd() < 0.5;
      if (kadin) g.sakal = 0;
      const ad = kadin ? ISIMLER_K[koken][Math.floor(rnd() * ISIMLER_K[koken].length)] : ISIMLER[koken].ad[Math.floor(rnd() * ISIMLER[koken].ad.length)];
      // Taraftar kulüp formasıyla (bizim karakterler), kasabalı Urban paketinin yürüyen kasabalılarından (1 ve 5 kadın)
      const urban = taraftar ? null : kadin ? [1, 5][Math.floor(rnd() * 2)] : [0, 2, 3, 4][Math.floor(rnd() * 4)];
      liste.push({ id: "k" + i, ad, img: resim(g, taraftar ? kulup.forma : null), urban, ...rastgeleNokta(b, rnd), rol: taraftar ? "taraftar" : "kasabali", hiz: 22 + rnd() * 14 });
    }
    return liste;
  }
  const renkSec = (rnd) => ["#5a7d9a", "#6b6f78", "#8b5a7a", "#4a6a5a", "#9a7a4a"][Math.floor(rnd() * 5)];
  function rastgeleNokta(b, rnd) {
    const n = b.gezinti[Math.floor(rnd() * b.gezinti.length)];
    return { x: n[0], y: n[1] };
  }

  // ---------- Başlatma ----------
  // tur: "aksam" (kulüpten çıkış) ya da "pazar" (evden, sabah)
  function basla(tur) {
    const mac = S.maclar.find((m) => m.tarih === S.tarih && (m.ev === S.kulupId || m.dep === S.kulupId));
    let bolgeId = "avlu", konum = "kulupOnu", saat = 18 * 60;
    if (tur === "pazar") { bolgeId = S.ev.id; konum = "giris"; saat = 10 * 60; }
    else if (mac) { saat = mac.ev === S.kulupId ? 20 * 60 : 21 * 60 + 30; if (mac.ev !== S.kulupId) konum = "durak"; }
    S.gun.asama = "aksam";
    S.gun.dunya = { bolge: bolgeId, konum, saat, tur };
    kaydet(true);
    devam();
  }

  function devam() {
    if (!S.gun.dunya) { S.gun.dunya = { bolge: "avlu", konum: "kulupOnu", saat: 18 * 60, tur: "aksam" }; }
    const d = gun();
    bolgeGir(d.bolge, d.konum);
    if (zamanlayici) clearInterval(zamanlayici);
    zamanlayici = setInterval(tik, 250);
  }

  function bolgeGir(bolgeId, konum) {
    gun().bolge = bolgeId;
    const b = SEHIR.bolge(bolgeId);
    SAHNE_DUNYA.kur(bolgeId, {
      oyuncuResim: KARAKTER.gorunus(S.menajer.gorunus),
      konum,
      insanlar: insanlarHazirla(bolgeId),
      ekNesneler: b.ic ? (bolgeId.startsWith("ev:") ? EKONOMI.evEsyalari(bolgeId) : []) : EKONOMI.disEkler(bolgeId),
      saat: () => gun().saat, ay,
      yagmur: S.hayat.yagmur,
      olaylar: { kapi: kapiyaGel, cikis: bolgeCikisi, insan: konus, etkilesim },
    });
    CIZICI.goster($("tuval-oyun"), SAHNE_DUNYA, { mod: "sigdir", kap: document.querySelector(".oyun-sahne") });
    $("hud-yer").textContent = `${b.ad} · Kalvar`;
    diyalog = null;
    panelCiz();
  }

  // ---------- Saat ----------
  function tik() {
    if (!S || !S.gun.dunya || CIZICI.etkin() !== SAHNE_DUNYA) return;
    if (ARAYUZ.pencereAcik() || TAM.acik()) return;
    const d = gun();
    const once = d.saat;
    d.saat += DAKIKA_HIZ / 4;
    // Ovada yürümek stresi azaltır
    const b = SAHNE_DUNYA.bolge();
    if (b && b.huzur && Math.floor(d.saat / 10) !== Math.floor(once / 10)) S.menajer.stres = Math.max(0, S.menajer.stres - 1);
    if (once < 23 * 60 && d.saat >= 23 * 60 && !b.id.startsWith("ev:")) ARAYUZ.bildirim("Saat 23:00. Eve dönme vakti.");
    if (d.saat >= 25 * 60) { ARAYUZ.bildirim("Çok geç oldu. Eve dönüp sızdın."); uyu(true); return; }
    if (Date.now() - sonKayit > 10000) { const k = SAHNE_DUNYA.oyuncuKonum(); if (k) d.konum = { x: Math.round(k.x), y: Math.round(k.y) }; sonKayit = Date.now(); kaydet(true); }
    if (Math.floor(d.saat) % 5 === 0) saatYenile();
  }
  const saatEkle = (dk) => { gun().saat += dk; saatYenile(); };
  function saatYenile() { const el = $("yasam-saat"); if (el) el.textContent = saatYazi(gun().saat); }

  // ---------- Kapılar ve geçişler ----------
  function bolgeCikisi(c) {
    if (c.ic) { bolgeGir(c.hedef, c.nokta); return; }
    bolgeGir(c.hedef, c.giris);
  }

  function kapiyaGel(k) {
    const h = k.hedef;
    if (h.startsWith("ev:")) {
      if (S.ev.id === h) return bolgeGir(h, "giris");
      const ev = EKONOMI.ev(h);
      return mesaj(k.ad, ev ? `Kapı kilitli. ${ev.ad} ${ev.satis ? "satılık" : "kiralık"}. Varga Emlak'a sorabilirsin.` : "Kapı kilitli.");
    }
    if (h.startsWith("ic:")) {
      const [ac, kap] = ACIK[h] || [0, 24];
      const s = gun().saat / 60;
      if (s < ac || s >= kap) return mesaj(k.ad, `Kapalı. Açılış saatleri ${String(ac).padStart(2, "0")}:00–${String(kap % 24).padStart(2, "0")}:00.`);
      return bolgeGir(h, "giris");
    }
    if (h === "kulup") return mesaj("Kulüp binası", "Akşamları kulüp kapalı. Kapıdaki görevli başını sallıyor: \"Yarın sabah hocam.\"");
    if (h === "stad") return mesaj("Avlu Stadı", "Kapılar kilitli. Tribünün arkasında eski gözetleme kulesinin silueti görünüyor.");
    if (h.startsWith("komsu:")) return komsuKapisi(h.slice(6));
    mesaj(k.ad, "Kapı kilitli.");
  }

  function komsuKapisi(kim) {
    if (kim === "sorova") return konus({ id: "lena", ad: TANIDIK.lena.ad, rol: "komsu", tanidik: true }, "Kapıyı Lena Sorova açtı.");
    return konus({ id: "jovan", ad: TANIDIK.jovan.ad, rol: "emekli", tanidik: true }, "Kapıyı Jovan Petri açtı.");
  }

  // İç mekândaki şeyler: yatak, ayna, kafe masası, lokanta, gişeler
  function etkilesim(e) {
    if (e.tur === "yatak") return soru("Yatak", `Saat ${saatYazi(gun().saat)}. Yatıp günü bitirmek ister misin?`, [{ yazi: "Uyu", fn: () => uyu(false) }]);
    if (e.tur === "ayna") return aynaya();
    if (e.tur === "masa") return kafeMasasi();
    if (e.tur === "lokanta") return lokantaMasasi();
    if (["banka", "emlak", "esya", "galeri"].includes(e.tur)) return EKONOMI.panel(e.tur, () => panelCiz());
  }

  function kafeMasasi() {
    if (S.para < 14) return mesaj("Gözcü Kafe", "Cebinde çay parası bile yok.");
    soru("Gözcü Kafe", "Bir çay söyleyip oturmak bir saat sürer. ₡14.", [{ yazi: "Otur", fn: () => {
      S.para -= 14; S.menajer.stres = Math.max(0, S.menajer.stres - 8); S.menajer.enerji = Math.min(100, S.menajer.enerji + 4);
      saatEkle(60); HAFTA.hudYenile();
      mesaj("Gözcü Kafe", HAFTA.dedikodu());
    } }]);
  }

  function lokantaMasasi() {
    const secenekler = [];
    if (S.para >= 25) secenekler.push({ yazi: `Yalnız yemek ye (${para(25)}, 1 saat)`, fn: () => { S.para -= 25; S.menajer.enerji = Math.min(100, S.menajer.enerji + 8); saatEkle(60); HAFTA.hudYenile(); mesaj("Ovalı Lokantası", "Dora'nın kuzu güveci bugün de yerindeydi. Karnın doydu."); } });
    if (S.para >= 60) secenekler.push({ yazi: `Bir oyuncuyu yemeğe çağır (${para(60)}, 2 saat)`, fn: oyuncuSec });
    const tk = S.hayat.tanisma;
    if (tk && tk.iliski >= 30 && S.para >= 80 && !S.hayat.partner) secenekler.push({ yazi: `${tk.ad} ile akşam yemeği (${para(80)}, 2 saat)`, fn: () => { S.para -= 80; saatEkle(120); tk.iliski = Math.min(100, tk.iliski + 14); S.menajer.stres = Math.max(0, S.menajer.stres - 10); HAFTA.hudYenile(); mesaj("Ovalı Lokantası", `${tk.ad} ile uzun uzun konuştunuz. Saatin nasıl geçtiğini anlamadın.`); } });
    soru("Ovalı Lokantası", "Dora menüyü uzatıyor.", secenekler);
  }

  function oyuncuSec() {
    const kadro = S.takimlar[S.kulupId].kadro.slice().sort((a, b) => a.moral - b.moral);
    diyalog = { kim: "Kimi çağıracaksın?", metin: "", secenekler: kadro.slice(0, 8).map((o) => ({ yazi: `${o.soyad} · moral ${o.moral}`, fn: () => { saatEkle(120); mesaj("Ovalı Lokantası", HAFTA.yemegeCagir(o)); HAFTA.hudYenile(); } })) };
    panelCiz();
  }

  function aynaya() {
    const taslak = { ad: S.menajer.ad, soyad: S.menajer.soyad, gorunus: { ...S.menajer.gorunus } };
    const geri = () => { ARAYUZ.ekranGoster("ekran-oyun"); devam(); };
    GORUNUS_EKRANI.ac(taslak, { geri, devam: () => {
      S.menajer.gorunus = taslak.gorunus;
      const img = KARAKTER.gorunus(S.menajer.gorunus);
      SAHNE_DAIRE.menajerAyarla(img); SAHNE_SOKAK.menajerAyarla(img);
      kaydet(true); geri();
    } });
    $("gorunus-devam").textContent = "Tamam";
  }

  // ---------- Uyku ----------
  function uyu(zorla) {
    const d = gun();
    const konfor = EKONOMI.konfor();
    let enerji = d.saat <= 22 * 60 ? 25 : d.saat <= 23.5 * 60 ? 15 : 0;
    if (zorla) enerji = -12;
    S.menajer.enerji = sinirla(S.menajer.enerji + enerji + konfor.enerji, 0, 100);
    S.menajer.stres = sinirla(S.menajer.stres - konfor.stres, 0, 100);
    if (S.hayat.partner) S.menajer.stres = Math.max(0, S.menajer.stres - 3);
    bitir();
    HAFTA.gunuBitir();
  }
  function bitir() { if (zamanlayici) clearInterval(zamanlayici); zamanlayici = null; diyalog = null; delete S.gun.dunya; }

  // ---------- Konuşmalar ----------
  function sonMac() { const ms = S.maclar.filter((m) => m.ev === S.kulupId || m.dep === S.kulupId); return ms[ms.length - 1]; }
  function sonuc(m) { if (!m) return null; const biz = m.ev === S.kulupId; const a = biz ? m.evGol : m.depGol, b = biz ? m.depGol : m.evGol; return { a, b, fark: a - b, rakip: kulupBul(biz ? m.dep : m.ev) }; }
  const al = (a) => a[Math.floor(Math.random() * a.length)];

  function iliski(id, artis) {
    S.hayat.iliski[id] = sinirla((S.hayat.iliski[id] ?? 30) + artis, 0, 100);
    return S.hayat.iliski[id];
  }
  // Aynı gün aynı kişiyle ikinci konuşma ilişkiyi artırmaz
  function bugunKonustu(id) {
    S.hayat.konusulan ||= {};
    if (S.hayat.konusulan[id] === S.tarih) return true;
    S.hayat.konusulan[id] = S.tarih;
    return false;
  }

  function konus(p, giris) {
    const r = sonuc(sonMac());
    const soyad = S.menajer.soyad;
    const ilk = !bugunKonustu(p.id);
    let metin = "", secenekler = [];
    switch (p.rol) {
      case "taraftar":
        metin = !r ? al(["Hocam, bu sene bir şeyler olacak mı? Avluya her hafta geliyorum.", "Hazırlık maçlarına bakıp karar vermeyeceğim hocam, lig başlasın görelim."])
          : r.fark > 0 ? al([`Dünkü maç ne öyle hocam! ${r.rakip.kisa} karşısında ${r.a}-${r.b}, avlu yıkıldı.`, "Böyle devam hocam. Annem bile maç soruyor artık."])
          : r.fark < 0 ? al([`${r.rakip.kisa} maçını izlerken çayım soğudu hocam. ${r.a}-${r.b} olur mu?`, "Hocam ayıp oluyor ama bu oyunla zor. Biraz daha cesur olun."])
          : al(["Berabere de bir şeydir hocam. Ama evde kazanmamız lazım.", "Bir puan, bir puandır. Ama tribün daha fazlasını istiyor."]);
        if (ilk) S.itibar.taraftar = sinirla(S.itibar.taraftar + (r && r.fark < 0 ? 0 : 0.5), 0, 100);
        break;
      case "kasabali":
        metin = al([
          `Siz Kalvar Spor'un yeni hocası ${soyad} değil misiniz? Kolay gelsin.`,
          "Akşamları çarşı kalabalık oluyor. Eskiden bu saatte sokakta kimse kalmazdı.",
          "Belediye eski koğuşları kiraya verecekmiş diyorlar. Görelim.",
          r ? (r.fark >= 0 ? "Maçı radyodan dinledim, iyiydiniz." : "Maçı radyodan dinledim. Hakem de bizden değildi zaten.") : "Futboldan pek anlamam ama torunum sizi seviyor.",
          "Ova tarafında akşam yürüyüşü yapın hocam, kafayı boşaltır.",
        ]);
        if (ilk) S.itibar.sehir = sinirla(S.itibar.sehir + 0.5, 0, 100);
        break;
      case "oyuncu": {
        const o = DUNYA.oyuncuBul(S, p.oyuncu);
        metin = o.sakatlik ? `Hocam, ${o.sakatlik.tur} hâlâ sızlıyor ama ${o.sakatlik.gun} güne dönerim diyor doktor.` : o.moral >= 70 ? "Hocam iyi akşamlar. Kendimi çok iyi hissediyorum, sahada göreceksiniz." : o.moral < 45 ? "İyi akşamlar hocam... Kafam biraz karışık bu ara, kusura bakmayın." : "İyi akşamlar hocam. Yarın idmanda görüşürüz.";
        if (ilk) { o.moral = Math.min(100, o.moral + 2); iliski(o.id, 3); }
        break;
      }
      case "kafeci": metin = HAFTA.dedikodu(); if (ilk) iliski("mavro", 3); EKONOMI.kafeOrtakligiTeklif && EKONOMI.kafeOrtakligiTeklif(secenekler); break;
      case "lokantaci": metin = "Dora: \"Bugün kuzu güveç var hocam. Masaya geçin, getireyim.\""; if (ilk) iliski("dora", 2); break;
      case "bankaci": metin = "Bay Tamm gözlüğünü düzeltiyor: \"Hesap, kredi, ne isterseniz. Gişeye buyurun.\""; if (ilk) iliski("tamm", 2); break;
      case "emlakci": metin = "Ilse Varga: \"Kalvar'da ev aramak kolay değil ama elimde birkaç güzel yer var. Masaya gelin, göstereyim.\""; if (ilk) iliski("varga", 2); break;
      case "esyaci": metin = "Petri usta: \"Koltuk da var, yatak da. Hepsi Tessel'deki atölyeden, sağlam iş.\""; if (ilk) iliski("usta", 2); break;
      case "galerici": metin = "Rado Kask: \"Hocam, sizi böyle yürürken görmek bana dokunuyor. Gelin size bir araba bulalım.\""; if (ilk) iliski("rado", 2); break;
      case "gazeteci": {
        const kulis = gazeteciBilgisi();
        metin = `Mira Halvor not defterini kapatıyor: "${kulis}"`;
        if (ilk) { const i = iliski("halvor", 4); S.itibar.basin = sinirla(S.itibar.basin + 1, 0, 100); if (i >= 60) metin += " (Halvor sana artık güveniyor.)"; }
        break;
      }
      case "emekli": metin = `Jovan Petri: "${al([
        "Ben bu avluda yirmi yıl nöbet tuttum hocam. Şimdi aynı yerde gol sevinci duyuyorum. Hayat garip.",
        "1982 kışını hatırlarım. Kar dizimize çıkmıştı, kömür bitmişti. O zamanlar futbol mu? Avluda bez topla oynarlardı.",
        "Madenden gardiyanlığa, gardiyanlıktan emekliliğe. Bu ovada her şeyi gördüm. Sizin takımı da göreceğiz.",
        r && r.fark < 0 ? "Kaybettiniz diye üzülmeyin. Bu kasaba sabretmeyi bilir." : "Gençleri oynatın hocam. Kalvar'ın çocukları sahada olsun.",
      ])}"`; if (ilk) iliski("jovan", 3); break;
      case "komsu": metin = `Lena Sorova: "${al([
        "Sekiz yıl sınır karakolunda nöbet tuttum, sonra cezaevinde. Şimdi tek işim bu sokağın dedikodusu.",
        `Komşum futbol hocası olunca maçları dinlemeye başladım. ${r ? (r.fark >= 0 ? "Fena değildiniz." : "Daha çok çalışmalısınız.") : "Bakalım ne yapacaksınız."}`,
        "Gece geç geliyorsunuz, merdivenlerden duyuyorum. Uykunuza dikkat edin.",
      ])}"`; if (ilk) iliski("lena", 3); break;
      case "tanisma": return tanismaKonusmasi(p);
    }
    diyalog = { kim: p.ad, metin: (giris ? giris + " " : "") + metin, secenekler };
    panelCiz();
  }

  // Gazeteci, ilişki arttıkça gerçek kulis bilgisi verir
  function gazeteciBilgisi() {
    const i = S.hayat.iliski.halvor ?? 30;
    const sonraki = (() => { for (let g = 0; g < 7; g++) { const h = HAFTA.maci(TARIH.ekle(S.tarih, g)); if (h) return h; } return null; })();
    if (i >= 45 && sonraki) {
      const t = S.takimlar[sonraki.rakip];
      const sakat = t.kadro.filter((o) => !DUNYA.uygun(o));
      S.bilinen[sonraki.rakip] = t.taktik.dizilis;
      return sakat.length ? `${kulupBul(sonraki.rakip).kisa} cumartesi ${sakat.map((o) => o.soyad).join(" ve ")} olmadan çıkacak. Bunu benden duymadınız.` : `${kulupBul(sonraki.rakip).kisa} hocası ${t.taktik.dizilis} oynatacak. Antrenmanlarını izledim.`;
    }
    return al(["Bu hafta yazacak bir şeyiniz var mı hocam? Okurlar sizi merak ediyor.", "Başkan Dorsa'yla dün konuştum. Sizden memnun gibi, ama kim bilir.", "Sizin hakkınızda iyi şeyler yazmak isterim. Bana biraz malzeme verin."]);
  }

  // ---------- Rastgele tanışma ----------
  function tanismaDene(bolgeId) {
    if (S.hayat.tanisma || S.tarih < "2026-08-15") return null;
    if (!["ic:kafe", "carsi", "ova"].includes(bolgeId) || Math.random() > 0.05) return null;
    const koken = Math.random() < 0.5 ? "c" : Math.random() < 0.5 ? "s" : "o";
    const kadin = Math.random() < 0.5;
    const g = KARAKTER.rastgeleGorunus();
    if (kadin) g.sakal = 0;
    const ad = (kadin ? ISIMLER_K[koken] : ISIMLER[koken].ad)[Math.floor(Math.random() * 10)];
    const sehir = { c: "Carceria City", s: "Brennik", o: "Ardessa" }[koken];
    return { ad, g, koken, sehir, iliski: 8, tanisilan: S.tarih };
  }

  function tanismaKonusmasi(p) {
    const tk = S.hayat.tanisma;
    if (!tk) return;
    const ilk = !bugunKonustu("tanisma");
    if (ilk) tk.iliski = Math.min(100, tk.iliski + 6);
    const secenekler = [];
    let metin = tk.iliski < 25 ? `${tk.ad}: "Yine karşılaştık. Kalvar küçük bir yer, değil mi?"`
      : tk.iliski < 50 ? `${tk.ad}: "Maçı dinledim bu hafta. Futboldan anlamam ama sizin sesiniz radyoda çıktı."`
      : `${tk.ad}: "Bu akşam erken kalkmasan mı? Biraz daha konuşalım."`;
    if (S.hayat.partner) metin = `${tk.ad} gülümsüyor: "Geç kalma bu gece. Yarın idmanın var."`;
    else if (tk.iliski >= 60) secenekler.push({ yazi: "Bunun adını koyalım mı?", fn: () => { S.hayat.partner = true; S.gunluk.push({ tarih: S.tarih, metin: `${tk.ad} ile birliktesiniz` }); mesaj(tk.ad, `${tk.ad} bir süre sana bakıyor, sonra gülüyor: "Ben çoktan koymuştum."`); } });
    diyalog = { kim: tk.ad, metin, secenekler };
    panelCiz();
  }

  // ---------- Panel ----------
  function mesaj(kim, metin) { diyalog = { kim, metin, secenekler: [] }; panelCiz(); }
  function soru(kim, metin, secenekler) { diyalog = { kim, metin, secenekler }; panelCiz(); }

  function panelCiz() {
    if (!S || !S.gun.dunya) return;
    const d = gun();
    const b = SEHIR.bolge(d.bolge);
    const evde = d.bolge === S.ev.id;
    const dlg = diyalog ? `<div class="diyalog"><b>${kacir(diyalog.kim)}</b>${diyalog.metin ? `<p>${kacir(diyalog.metin)}</p>` : ""}
      <div class="dugme-dizi">${diyalog.secenekler.map((s, i) => `<button class="dugme ikincil" data-dlg="${i}">${kacir(s.yazi)}</button>`).join("")}<button class="dugme ikincil" id="dlg-kapat">Kapat</button></div></div>` : "";
    HAFTA.panel(`<h3><span id="yasam-saat">${saatYazi(d.saat)}</span> · ${kacir(b.ad)}</h3>
      <p class="soluk">${d.tur === "pazar" ? "Pazar, izin günü." : "Akşam, günün geri kalanı senin."} Oklar ya da WASD ile yürü, fareyle bir yere tıkla. Bir şeyin yanındayken E'ye bas.</p>
      ${dlg}
      ${evde ? `<p>Evindesin. Yatağa gidip uyuyabilirsin.</p>` : `<p class="soluk">Evin: ${kacir(S.ev.adres)}. 23:00'dan sonra eve dönmezsen ertesi gün yorgun olursun.</p>`}
      <div class="dugme-dizi"><button class="dugme ikincil" id="y-harita">Harita (M)</button><button class="dugme ikincil" id="y-hayat">Hayatım</button></div>`);
    if (diyalog) {
      document.querySelectorAll("#gundem [data-dlg]").forEach((btn) => { btn.onclick = () => { const s = diyalog.secenekler[+btn.dataset.dlg]; diyalog = null; s.fn(); if (!diyalog) panelCiz(); }; });
      $("dlg-kapat").onclick = () => { diyalog = null; panelCiz(); };
    }
    const hb = $("y-hayat"); if (hb) hb.onclick = () => EKONOMI.hayatim();
    const hr = $("y-harita"); if (hr) hr.onclick = () => HARITA.ac();
  }

  // Haritadan araçla gitmek: yol süresi kadar saat ilerler
  function git(bolgeId, konum, dk) { saatEkle(dk); bolgeGir(bolgeId, konum); }

  // Bölgeye girerken tanışma ihtimali
  const asilBolgeGir = bolgeGir;
  bolgeGir = function (bolgeId, konum) {
    const yeni = tanismaDene(bolgeId);
    if (yeni) S.hayat.tanisma = yeni;
    asilBolgeGir(bolgeId, konum);
    if (yeni) {
      mesaj(yeni.ad, `Biri yanına yaklaşıyor: "Pardon, siz buralı mısınız? Ben ${ek(yeni.sehir, "den")} yeni taşındım, ${bolgeId === "ova" ? "bu yol nereye çıkıyor" : "burada iyi bir çay nerede içilir"} bilmiyorum." Kısa bir sohbet oldu. Adı ${yeni.ad}.`);
      S.gunluk.push({ tarih: S.tarih, metin: `${yeni.ad} ile tanıştın` });
    }
  };

  return { basla, devam, bitir, uyu, git, TANIDIK, ACIK, saatYazi, panelCiz };
})();
