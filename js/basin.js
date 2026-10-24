// Cuma basın toplantısı: Sınır Postası muhabiri bir soru sorar, verilen cevap takımı, taraftarı ve yönetimi etkiler.
const BASIN = (() => {
  const MUHABIR = "Mira Halvor";
  const sinirla = DUNYA.sinirla;

  function sonMacimiz() {
    const ms = S.maclar.filter((m) => m.ev === S.kulupId || m.dep === S.kulupId);
    return ms[ms.length - 1] || null;
  }

  // etki: { taraftar, yonetim, moral, stres, forvetMoral }
  function soruHazirla(h) {
    const rakip = kulupBul(h.rakip);
    const son = sonMacimiz();
    if (!son) {
      return {
        soru: `Hocam, yarın Kalvar'daki ilk maçınız, rakip ${rakip.ad}. Tribüne gelecek taraftara ne söylersiniz?`,
        cevaplar: [
          { tip: "iddiali", yazi: "Avlu dolsun. Hazırlık maçı da olsa kazanmak için oynayacağız.", etki: { taraftar: 5, moral: 3, stres: 3 }, tepki: "Halvor not alırken gülümsüyor. \"Bunu manşete taşıyabilirim hocam.\"" },
          { tip: "temkinli", yazi: "Sonuçtan çok oyuna bakacağım. Kadroyu tanımak için iyi bir fırsat.", etki: { yonetim: 2 }, tepki: "Halvor başını sallıyor. \"Temkinli bir başlangıç.\"" },
          { tip: "elestirel", yazi: "Kadroda eksikler var. Yönetimden takviye bekliyorum.", etki: { yonetim: -6, moral: -3, taraftar: 2 }, tepki: "Salonda kısa bir sessizlik. Halvor kalemini hızlandırıyor." },
        ],
      };
    }
    const bizEv = son.ev === S.kulupId;
    const bizGol = bizEv ? son.evGol : son.depGol, onlarGol = bizEv ? son.depGol : son.evGol;
    const oRakip = kulupBul(bizEv ? son.dep : son.ev);
    const skor = `${bizGol}-${onlarGol}`;
    if (bizGol < onlarGol) {
      return {
        soru: `Geçen hafta ${oRakip.kisa} karşısında ${skor} yenildiniz. Takımda bir sorun mu var?`,
        cevaplar: [
          { tip: "temkinli", yazi: "Hazırlık dönemindeyiz, panik yok.", etki: { stres: -3 }, tepki: "Halvor pek ikna olmuş görünmüyor ama bir şey demiyor." },
          { tip: "sorumluluk", yazi: "Hata bende. Bu hafta düzelteceğiz.", etki: { taraftar: 3, moral: 2, yonetim: 1 }, tepki: "\"Sorumluluğu üstlenen bir hoca, Kalvar'da az görülür,\" diyor Halvor." },
          { tip: "elestirel", yazi: "Bazı oyuncular sahada sorumluluk almadı.", etki: { moral: -5, yonetim: 2 }, tepki: "Arka sırada oturan kulüp sözcüsü yüzünü buruşturuyor." },
        ],
      };
    }
    if (bizGol > onlarGol) {
      return {
        soru: `${sayiEk(onlarGol, "lik").replace(/^\d+/, skor)} galibiyetten sonra beklenti yükseldi. Bu kadro üst sıraları zorlar mı?`,
        cevaplar: [
          { tip: "temkinli", yazi: "Ayağımız yere bassın, daha hazırlık dönemindeyiz.", etki: { yonetim: 2 }, tepki: "Halvor not alıyor. \"Akıllıca.\"" },
          { tip: "iddiali", yazi: "Neden olmasın? Bu takım her şeyi yapar.", etki: { taraftar: 5, moral: 3, stres: 4 }, tepki: "Halvor kaşlarını kaldırıyor. \"Bunu yazacağım, haberiniz olsun.\"" },
          { tip: "elestirel", yazi: "Takviye gelirse, evet.", etki: { yonetim: -4, taraftar: 1 }, tepki: "Halvor gülüyor. \"Başkan Dorsa bunu okuyunca ne der acaba?\"" },
        ],
      };
    }
    return {
      soru: `${oRakip.kisa} ile ${skor} berabere kaldınız. Hücum hattından memnun musunuz?`,
      cevaplar: [
        { tip: "temkinli", yazi: "Pozisyona girdik, goller gelecek.", etki: {}, tepki: "Halvor omuz silkiyor." },
        { tip: "elestirel", yazi: "Değilim. Bu hafta bitiricilik çalışacağız.", etki: { forvetMoral: -4, taraftar: 2 }, tepki: "\"Forvetleriniz bunu okuyacak hocam,\" diyor Halvor." },
        { tip: "iddiali", yazi: "Forvetlerime güveniyorum.", etki: { forvetMoral: 5 }, tepki: "Halvor not alıyor." },
      ],
    };
  }

  function uygula(etki) {
    if (etki.taraftar) S.itibar.taraftar = sinirla(S.itibar.taraftar + etki.taraftar, 0, 100);
    if (etki.yonetim) S.itibar.yonetim = sinirla(S.itibar.yonetim + etki.yonetim, 0, 100);
    if (etki.stres) S.menajer.stres = sinirla(S.menajer.stres + etki.stres, 0, 100);
    for (const o of S.takimlar[S.kulupId].kadro) {
      if (etki.moral) o.moral = sinirla(o.moral + etki.moral, 0, 100);
      if (etki.forvetMoral && o.mevki === "FV") o.moral = sinirla(o.moral + etki.forvetMoral, 0, 100);
    }
  }

  function ac(h, geri) {
    const s = soruHazirla(h);
    TAM.ac(`
      <div class="tam-baslik"><h2>Basın toplantısı</h2><span class="soluk">${kacir(kulupBul(S.kulupId).stad)} · basın odası</span></div>
      <p class="soru"><b>${MUHABIR}, Sınır Postası:</b> "${kacir(s.soru)}"</p>
      <div class="cevaplar">${s.cevaplar.map((c, i) => `<button class="antrenman-sec" data-i="${i}"><b>"${kacir(c.yazi)}"</b></button>`).join("")}</div>
      <p class="soluk">Ne söylersen gazetede çıkacak.</p>`, geri);
    document.querySelectorAll(".cevaplar [data-i]").forEach((b) => {
      b.onclick = () => {
        const c = s.cevaplar[+b.dataset.i];
        uygula(c.etki);
        S.menajer.enerji = Math.max(0, S.menajer.enerji - 8);
        S.basin.push({ tarih: S.tarih, tip: c.tip, alinti: c.yazi, soru: s.soru });
        kaydet(true);
        HAFTA.hudYenile();
        $("oyun-tam-icerik").innerHTML = `
          <div class="tam-baslik"><h2>Basın toplantısı</h2></div>
          <p class="soru"><b>Sen:</b> "${kacir(c.yazi)}"</p>
          <p>${kacir(c.tepki)}</p>
          <div class="dugme-satiri"><button class="dugme" id="basin-bitti">Toplantıdan çık</button></div>`;
        $("basin-bitti").onclick = TAM.kapat;
      };
    });
  }

  return { ac };
})();
