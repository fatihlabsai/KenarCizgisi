// Sınır Postası: Carceria'nın haftalık gazetesi. Her pazar haftanın olaylarından yazılır.
const GAZETE = (() => {
  const al = (a) => a[Math.floor(Math.random() * a.length)];
  const SEHIRDEN = [
    { baslik: "Eski koğuşlar müze mi olacak?", metin: "Kalvar Cezaevi'nin boşalan kuzey kanadı için müze projesi yeniden gündemde. Belediye, avlunun stadyuma ayrılan kısmına dokunulmayacağını söyledi." },
    { baslik: "Ovada hasat bitiyor", metin: "Kalvar Ovası'nda buğday hasadı bu hafta tamamlanıyor. Tessel yolunda akşam saatlerinde biçerdöver kuyrukları oluşuyor." },
    { baslik: "Maç günü otobüsleri", metin: "Carceria City–Kalvar otobüs seferleri cumartesi günleri maç saatine göre ayarlanacak. Son sefer 19.40'ta." },
    { baslik: "Gözcü Kafe televizyonu dışarı çıkarıyor", metin: "Lale Sokak'taki Gözcü Kafe'nin sahibi Mavro, deplasman maçlarını kaldırıma koyacağı televizyondan yayınlayacağını duyurdu." },
    { baslik: "Cezaevi doluluğu yine düştü", metin: "Bakanlık, Kalvar'daki cezaevinin doluluk oranını yüzde 41 olarak açıkladı. Rakam on yıldır her yıl biraz daha düşüyor." },
    { baslik: "Lale Sokak'ta kaldırım çalışması", metin: "Belediye ekipleri Lale Sokak'ın kaldırımlarını yeniliyor. Çalışmanın iki hafta sürmesi bekleniyor." },
    { baslik: "Ardessa'da iki dilli tabela imzası", metin: "Ardessa'da sokak tabelalarının iki dilde yazılması için başlatılan imza kampanyası üç bine ulaştı." },
    { baslik: "Brennik sınır kapısında yoğunluk", metin: "Yaz sonu tatilcileri Brennik sınır kapısında uzun kuyruklara neden oluyor. Gümrük, ek memur görevlendirdi." },
  ];
  const OKUR = [
    "Avlunun güney tribününe bir gölgelik yapılsın. Ağustos güneşinde doksan dakika çekilmiyor. — Kalvar'dan bir emekli",
    "Kalvar Spor'un formaları neden hep geç geliyor? Oğlum iki yıldır geçen sezonun formasını giyiyor. — L. Petri, Kalvar",
    "Yeni hocaya bir şans verelim. Her gelen hoca ilk ayda kovulmasın. — Tessel'den bir okur",
    "Cumartesi maçlarında stadyumun önüne park edilen arabalar yüzünden ambulans geçemiyor. Belediye nerede? — Avlu Sokak sakinleri",
  ];
  const HAVA = ["açık", "açık", "parçalı bulutlu", "akşamüstü sağanak", "rüzgârlı"];

  function yap(S) {
    const dun = TARIH.ekle(S.tarih, -1);
    const bizim = kulupBul(S.kulupId);
    const menajer = S.menajer;
    const mac = S.maclar.find((m) => m.tarih === dun && (m.ev === S.kulupId || m.dep === S.kulupId));
    const digerleri = S.maclar.filter((m) => m.tarih === dun && m !== mac);
    const basin = S.basin.filter((b) => b.tarih >= TARIH.ekle(S.tarih, -7)).pop();
    const ilkMac = S.maclar.filter((m) => m.ev === S.kulupId || m.dep === S.kulupId).length === 1;
    const g = { tarih: S.tarih, sayi: 2214 + S.gazeteler.length, haberler: [] };

    if (mac) {
      const bizEv = mac.ev === S.kulupId;
      const bizG = bizEv ? mac.evGol : mac.depGol, onlarG = bizEv ? mac.depGol : mac.evGol;
      const rakip = kulupBul(bizEv ? mac.dep : mac.ev);
      const skor = `${mac.evGol}-${mac.depGol}`;
      const fark = bizG - onlarG;
      const yerde = bizEv ? "Avlu'da" : `${rakip.sehir} deplasmanında`;
      if (fark >= 3) g.manset = bizEv ? "AVLUDA GOL YAĞMURU" : `${bizim.kisa.toLocaleUpperCase("tr-TR")} DEPLASMANDA ESTİ`;
      else if (fark > 0) g.manset = ilkMac ? "YENİ HOCAYA İLK GÜLÜMSEME" : `${bizim.kisa.toLocaleUpperCase("tr-TR")} YÜZ GÜLDÜRDÜ`;
      else if (fark === 0) g.manset = ilkMac ? "İLK SINAVDA BERABERLİK" : `${yerde.toLocaleUpperCase("tr-TR")} KAZANAN ÇIKMADI`;
      else if (fark <= -3) g.manset = bizEv ? "AVLUDA SOĞUK DUŞ" : "DEPLASMANDA AĞIR YENİLGİ";
      else g.manset = ilkMac ? "YENİ HOCAYA SOĞUK KARŞILAMA" : `${bizim.kisa.toLocaleUpperCase("tr-TR")} YİNE TAKILDI`;

      const ev = kulupBul(mac.ev), dep = kulupBul(mac.dep);
      g.spot = `Hazırlık maçında ${ev.ad} ile ${dep.ad} karşılaştı: ${skor}. ${fark > 0 ? `Teknik direktör ${menajer.ad} ${menajer.soyad} yönetimindeki ${bizim.kisa} sahadan galip ayrıldı.` : fark === 0 ? "İki takım puanları paylaştı." : `${bizim.kisa}, ${menajer.soyad} yönetiminde sahadan mağlup ayrıldı.`}`;

      const liste = (a) => (a.length > 1 ? a.slice(0, -1).join(", ") + " ve " + a[a.length - 1] : a[0]);
      const golYazi = (taraf, kulup) => {
        const g = mac.goller.filter((x) => x.takim === taraf).map((x) => `${x.soyad} (${x.dk}')`);
        return g.length ? `${ek(kulup.kisa, "in")} ${g.length > 1 ? "gollerini" : "golünü"} ${liste(g)} attı.` : "";
      };
      let metin = mac.goller.length ? `${[golYazi("ev", ev), golYazi("dep", dep)].filter(Boolean).join(" ")} ` : "Doksan dakikada gol sesi çıkmadı. ";
      if (basin) {
        const once = `Cuma günkü basın toplantısında "${basin.alinti}" diyen ${menajer.soyad}`;
        if (basin.tip === "iddiali") metin += fark > 0 ? `${once}, sözünün arkasında durdu.` : fark < 0 ? `${once} için hafta sonu beklendiği gibi geçmedi. Tribünden yükselen ıslıklar dikkat çekti.` : `${once}, istediğini tam alamadı.`;
        else if (basin.tip === "elestirel") metin += `${once}, maçtan sonra yönetime yine seslendi. Başkan Ilian Dorsa'nın konuya nasıl yaklaşacağı merak ediliyor.`;
        else metin += `${once}, sonucu sakin karşıladı.`;
      } else metin += `${menajer.soyad}, maç öncesi basın toplantısına katılmadı.`;
      g.haberler.push({ baslik: "Maçın hikâyesi", metin, ana: true });
    } else {
      g.manset = "YENİ SEZONA GERİ SAYIM";
      g.spot = `Carceria Ligi'nde yeni sezon 29 Ağustos'ta başlıyor. Kulüpler hazırlık maçlarıyla kadrolarını deniyor.`;
      g.haberler.push({ baslik: "Kalvar'da yeni dönem", metin: `Kalvar Spor'un yeni teknik direktörü ${menajer.ad} ${menajer.soyad} antrenmanlara başladı. Kulüp, geçen sezonu dokuzuncu sırada bitirmişti.`, ana: true });
    }

    // Kulis: büyük kulüplerden biri bir oyuncuya göz koymuş
    const alici = kulupBul(al(["city", "dinamo", "union"]));
    const kaynakId = Math.random() < 0.5 ? S.kulupId : al(KULUPLER.filter((k) => k.id !== alici.id && k.id !== S.kulupId)).id;
    const yildiz = S.takimlar[kaynakId].kadro.slice().sort((a, b) => DUNYA.guc(b) - DUNYA.guc(a))[Math.floor(Math.random() * 3)];
    const bedel = Math.max(5000, Math.round(((DUNYA.guc(yildiz) - 40) * 900) / 500) * 500);
    g.haberler.push({ baslik: "Kulis", metin: `${alici.kisa} cephesinin ${kulupBul(kaynakId).kisa} forması giyen ${DUNYA.adSoyad(yildiz)} için harekete geçtiği konuşuluyor. Kulislerde ${para(bedel)} telaffuz ediliyor.` });

    // Şehirden
    const kullanilan = new Set(S.gazeteler.flatMap((x) => x.haberler.map((h) => h.baslik)));
    const aday = SEHIRDEN.filter((h) => !kullanilan.has(h.baslik));
    const sehir = al(aday.length ? aday : SEHIRDEN);
    g.haberler.push({ baslik: sehir.baslik, metin: sehir.metin, sehir: true });

    g.diger = digerleri.map((m) => `${kulupBul(m.ev).kisa} ${m.evGol}-${m.depGol} ${kulupBul(m.dep).kisa}`);
    g.okur = al(OKUR);
    g.hava = `Kalvar ${24 + Math.floor(Math.random() * 8)}°, ${al(HAVA)}`;
    return g;
  }

  function goster(g) {
    const ana = g.haberler.find((h) => h.ana);
    const yan = g.haberler.filter((h) => !h.ana);
    TAM.ac(`
      <div class="gazete">
        <div class="gazete-ust"><span>Sayı ${g.sayi}</span><span>${TARIH.uzun(g.tarih)}</span><span>₡1,50</span></div>
        <h1 class="gazete-ad">SINIR POSTASI</h1>
        <p class="gazete-alt">Carceria'nın haftalık gazetesi · Carceria City, Kalvar, Brennik, Ardessa, Tessel, Mirov</p>
        <h2 class="gazete-manset">${kacir(g.manset)}</h2>
        <p class="gazete-spot">${kacir(g.spot)}</p>
        <div class="gazete-sutunlar">
          <div>${ana ? `<h3>${kacir(ana.baslik)}</h3><p>${kacir(ana.metin)}</p>` : ""}
            ${yan.filter((h) => h.sehir).map((h) => `<h3>Şehirden: ${kacir(h.baslik)}</h3><p>${kacir(h.metin)}</p>`).join("")}
            <h3>Okurdan</h3><p class="okur">"${kacir(g.okur)}"</p></div>
          <div>
            ${g.diger && g.diger.length ? `<h3>Hazırlık maçları</h3><ul>${g.diger.map((d) => `<li>${kacir(d)}</li>`).join("")}</ul>` : ""}
            ${yan.filter((h) => !h.sehir).map((h) => `<h3>${kacir(h.baslik)}</h3><p>${kacir(h.metin)}</p>`).join("")}
            <h3>Hava</h3><p>${kacir(g.hava)}</p>
            <h3>Lig</h3><p>Carceria Ligi'nde yeni sezon 29 Ağustos'ta başlıyor.</p>
          </div>
        </div>
        <div class="dugme-satiri"><button class="dugme" id="gazete-kapat">Gazeteyi katla</button></div>
      </div>`, null, "gazete-kagit");
    $("gazete-kapat").onclick = TAM.kapat;
  }

  return { yap, goster };
})();
