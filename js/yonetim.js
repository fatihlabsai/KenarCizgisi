// Yönetim: sezon hedefi ve bütçe toplantısı, güven, aylık kontrol, sezon sonu değerlendirmesi, kovulma.
const YONETIM = (() => {
  const BASKAN = "Ilian Dorsa";
  const sinirla = DUNYA.sinirla;
  const HEDEFLER = [
    { sira: 1, ad: "Şampiyonluk", soz: "Bu kadroyla şampiyonluktan başka bir şey konuşmayacağız." },
    { sira: 3, ad: "İlk üç", soz: "Avrupa'yı bilmem ama ilk üçte olmamız şart." },
    { sira: 6, ad: "İlk altı", soz: "Tablonun üst yarısında görmek istiyorum bu takımı." },
    { sira: 9, ad: "Küme düşmemek", soz: "Açık konuşayım: baraja kalmayalım, yeter." },
  ];

  // Takımın güç sırasına göre yönetimin hedefi
  function hedefHesapla(S) {
    const sirali = S.lig.kulupler.slice().sort((a, b) => DUNYA.takimGucu(S, b) - DUNYA.takimGucu(S, a));
    const g = sirali.indexOf(S.kulupId) + 1;
    return g <= 1 ? HEDEFLER[0] : g <= 3 ? HEDEFLER[1] : g <= 6 ? HEDEFLER[2] : HEDEFLER[3];
  }

  // Sezon başı toplantısı: ilk lig maçından önceki hafta, bir kez
  function kontrol(S) {
    if (S.kovuldu || !S.lig || S.hedef && S.hedef.sezon === S.lig.sezon) return false;
    const ilk = S.lig.haftalar[0].tarih;
    if (S.tarih < TARIH.ekle(ilk, -6)) return false;
    const h = hedefHesapla(S);
    const t = S.takimlar[S.kulupId];
    S.hedef = { sezon: S.lig.sezon, sira: h.sira, ad: h.ad };
    const maaslar = t.kadro.reduce((a, o) => a + o.maas, 0);
    ARAYUZ.pencereAc(`Başkan ${BASKAN} seni çağırdı`, `
      <p>"${kacir(h.soz)}"</p>
      <div class="ayar"><div class="ayar-baslik">Sezon hedefi <span>${S.lig.sezon}</span></div><p class="buyuk-yazi">${kacir(h.ad)}</p></div>
      <div class="ayar"><div class="ayar-baslik">Transfer bütçesi</div><p class="buyuk-yazi">${para(t.butce.transfer)}</p></div>
      <div class="ayar"><div class="ayar-baslik">Maaş bütçesi <span>şu an ${para(maaslar)} / ay</span></div><p class="buyuk-yazi">${para(t.butce.maasLimit)} / ay</p></div>
      <p class="soluk">Yönetimin sana güveni: ${Math.round(S.itibar.yonetim)}. Hedefin çok gerisinde kalırsan bu sayı hızla düşer.</p>`,
      [{ yazi: "Anlaşıldı", fn: () => { ARAYUZ.pencereKapat(); kaydet(true); } }]);
    return true;
  }

  // Lig maçından sonra güven: beklenene göre ne kadar iyi ya da kötü
  function macSonrasi(S, biz, onlar) {
    const fark = DUNYA.takimGucu(S, biz.id) - DUNYA.takimGucu(S, onlar.id) + (biz.ev ? 3 : -3);
    const beklenen = 1 / (1 + Math.exp(-fark / 6));
    const sonuc = biz.gol > onlar.gol ? 1 : biz.gol === onlar.gol ? 0.5 : 0;
    S.itibar.yonetim = sinirla(S.itibar.yonetim + (sonuc - beklenen) * 9, 0, 100);
  }

  // Sözleşmesi bu sezon bitecek oyuncular: ocak, nisan ve mayısta hatırlatılır
  function sozlesmeHatirlat(S) {
    const ay = S.tarih.slice(5, 7);
    if (!["01", "04", "05"].includes(ay)) return;
    const sezonSonu = `${Number(S.tarih.slice(0, 4)) + (ay >= "07" ? 1 : 0)}-06-30`;
    const bitenler = S.takimlar[S.kulupId].kadro.filter((o) => o.bitis && o.bitis <= sezonSonu);
    if (!bitenler.length) return;
    S.gunluk.push({ tarih: S.tarih, metin: `Sözleşmesi bitecek ${bitenler.length} oyuncu var` });
    setTimeout(() => ARAYUZ.pencereAc("Sözleşmesi bitenler", `<p>Sportif direktör: "Hocam, şu oyuncuların sözleşmesi 30 Haziran'da bitiyor. Uzatmazsak yaz geldiğinde giderler."</p>
      <ul>${bitenler.map((o) => `<li>${kacir(DUNYA.adSoyad(o))} · ${o.mevki} · ${o.yas} yaşında · güç ${Math.round(DUNYA.guc(o))}</li>`).join("")}</ul>`,
      [{ yazi: "Sonra", ikincil: true, fn: ARAYUZ.pencereKapat }, { yazi: "Sözleşmelere bak", fn: () => { ARAYUZ.pencereKapat(); TRANSFER.ekran("kadrom"); } }]), 80);
  }

  // Her ayın başında: güven çok düşükse önce uyarı, sonra kovulma
  function aylik(S) {
    sozlesmeHatirlat(S);
    if (S.kovuldu || !S.lig || !S.lig.haftalar[0].maclar.some((m) => m.evGol != null)) return;
    const g = S.itibar.yonetim;
    if (g < 12) { kovul(S, `Yönetim kurulu dün akşam toplandı. Başkan ${BASKAN}: "Sonuçlar ortada. Yollarımızı ayırma kararı aldık."`); return; }
    if (g < 28) {
      S.gunluk.push({ tarih: S.tarih, metin: "Başkan uyardı" });
      setTimeout(() => ARAYUZ.pencereAc("Başkanın odasında", `<p>"Hocam, kimse sabırsız değil ama tribün konuşuyor. Bu ay toparlanmazsak ikimiz için de zor olacak."</p><p class="soluk">Yönetimin güveni: ${Math.round(g)}</p>`, [{ yazi: "Anlaşıldı", fn: ARAYUZ.pencereKapat }]), 50);
    }
  }

  function kovul(S, metin) {
    S.kovuldu = { tarih: S.tarih, metin };
    kaydet(true);
    kovulduEkrani();
  }

  function kovulduEkrani() {
    const tb = S.lig ? LIG.tablo(S) : [];
    const sira = tb.findIndex((r) => r.id === S.kulupId) + 1;
    const maclar = S.maclar.filter((m) => m.tur === "lig" && (m.ev === S.kulupId || m.dep === S.kulupId));
    const g = maclar.filter((m) => (m.ev === S.kulupId ? m.evGol > m.depGol : m.depGol > m.evGol)).length;
    TAM.ac(`<div class="tam-baslik"><h2>Görevden alındın</h2><span class="soluk">${TARIH.kisa(S.kovuldu.tarih)}</span></div>
      <p>${kacir(S.kovuldu.metin)}</p>
      <p>${kacir(kulupBul(S.kulupId).ad)} ile ${maclar.length} lig maçında ${g} galibiyet. Ligde ${sira || "?"}. sıradaydın.</p>
      <p class="soluk">Bu kariyer burada bitti. Yeni bir kariyere başlayabilirsin.</p>
      <div class="dugme-satiri"><button class="dugme" id="kovuldu-menu">Ana menüye dön</button></div>`, null);
    $("kovuldu-menu").onclick = () => { $("oyun-tam").hidden = true; S = null; menuyuKur(); };
  }

  // ---------- Sezon sonu ----------
  function sezonSonu() {
    const tb = LIG.tablo(S);
    const sira = tb.findIndex((r) => r.id === S.kulupId) + 1;
    const sampiyon = kulupBul(tb[0].id);
    const kral = LIG.golKralligi(S, 1)[0];
    const b = LIG.baraj(S);
    const sonKulup = kulupBul(b.son), gelen = kulupBul(b.gelen);
    const barajYazi = `${sonKulup.ad} ile Ova Ligi şampiyonu ${gelen.ad} barajda karşılaştı: ${b.evGol}-${b.depGol}${b.penaltilar ? ", penaltılarla" : ""}. ${b.kazanan === b.son ? `${sonKulup.kisa} ligde kaldı.` : `${gelen.ad} Carceria Ligi'ne yükseldi, ${sonKulup.kisa} düştü.`}`;
    const hedef = S.hedef || { sira: 9, ad: "Küme düşmemek" };
    let degerlendirme, kovuldu = false;
    if (b.son === S.kulupId && b.kazanan !== S.kulupId) { degerlendirme = `Takım küme düştü. Başkan ${BASKAN} sözleşmeni feshetti.`; kovuldu = true; }
    else if (sira <= hedef.sira) {
      S.itibar.yonetim = sinirla(S.itibar.yonetim + 18, 0, 100);
      S.maas += 300;
      degerlendirme = `Hedef tuttu (${hedef.ad}, ${sira}. sıra). Başkan memnun: maaşın ${para(S.maas)} oldu.`;
    } else if (sira > hedef.sira + 3 && S.itibar.yonetim < 40) { degerlendirme = `Hedefin (${hedef.ad}) çok gerisinde kaldın: ${sira}. sıra. Yönetim yolları ayırdı.`; kovuldu = true; }
    else {
      S.itibar.yonetim = sinirla(S.itibar.yonetim - 8, 0, 100);
      degerlendirme = `Hedef tutmadı (${hedef.ad}, ${sira}. sıra). Başkan bir şans daha veriyor ama sabrı sınırlı.`;
    }
    S.sezonlar ||= [];
    S.sezonlar.push({ sezon: S.lig.sezon, sira, sampiyon: sampiyon.id, puan: tb[sira - 1].P });
    S.lig.bitti = true;
    kaydet(true);
    HAFTA.sahneGoster(SAHNE_DAIRE);
    HAFTA.panel(`<h3>Sezon bitti</h3><p>${kacir(S.lig.sezon)} sezonu tamamlandı.</p>`);
    TAM.ac(`<div class="tam-baslik"><h2>${kacir(S.lig.sezon)} sezonu bitti</h2></div>
      <div class="sezon-ozeti">
        <p><b>Şampiyon:</b> ${kacir(sampiyon.ad)} (${tb[0].P} puan)</p>
        <p><b>${kacir(kulupBul(S.kulupId).kisa)}:</b> ${sira}. sıra, ${tb[sira - 1].P} puan · ${tb[sira - 1].G} galibiyet, ${tb[sira - 1].B} beraberlik, ${tb[sira - 1].M} yenilgi</p>
        ${kral ? `<p><b>Gol kralı:</b> ${kacir(DUNYA.adSoyad(kral.o))} (${kacir(kulupBul(kral.kid).kisa)}), ${kral.o.sezon.gol} gol</p>` : ""}
        <p><b>Baraj:</b> ${kacir(barajYazi)}</p>
        <p><b>Yönetim:</b> ${kacir(degerlendirme)}</p>
      </div>
      <div class="dugme-satiri"><button class="dugme" id="sezon-devam">${kovuldu ? "Devam" : "Yaz tatiline çık"}</button></div>`, null);
    $("sezon-devam").onclick = () => {
      if (kovuldu) { kovul(S, degerlendirme); return; }
      yazTatili(b);
    };
  }

  function yazTatili(b) {
    const ayrilanlar = LIG.yeniSezon(S, b);
    // Yeni sezonun ilk hazırlık maçından önceki pazartesi
    const ilkHazirlik = S.hazirlik[0].tarih;
    S.tarih = TARIH.ekle(ilkHazirlik, -5);
    for (const t of Object.values(S.takimlar)) for (const o of t.kadro) { o.kondisyon = 100; delete o.sakatlik; }
    S.menajer.enerji = 100; S.menajer.stres = 10;
    S.gun = { asama: "sabah" };
    S.bilinen = {};
    kaydet(true);
    TAM.ac(`<div class="tam-baslik"><h2>Yaz bitti</h2><span class="soluk">${TARIH.uzun(S.tarih)}</span></div>
      <p>Oyuncular izinden döndü. Yeni sezon ${TARIH.kisa(S.lig.haftalar[0].tarih)} tarihinde başlıyor.</p>
      ${ayrilanlar.length ? `<p><b>Kadrodaki değişiklikler:</b></p><ul>${ayrilanlar.map((x) => `<li>${kacir(x)}</li>`).join("")}</ul>` : "<p>Kadrodan kimse ayrılmadı.</p>"}
      <p class="soluk">Transfer dönemi 31 Ağustos'a kadar açık.</p>
      <div class="dugme-satiri"><button class="dugme" id="yaz-tamam">Antrenmanlara başla</button></div>`, () => HAFTA.goster());
    $("yaz-tamam").onclick = TAM.kapat;
  }

  return { kontrol, macSonrasi, aylik, sezonSonu, kovulduEkrani, hedefHesapla };
})();
