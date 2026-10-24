// Sözleşme görüşmesi: oyuncuyla maaş ve süre pazarlığı (transfer, serbest oyuncu ya da uzatma).
const SOZLESME = (() => {
  const sinirla = DUNYA.sinirla;
  const maaslar = (kid) => S.takimlar[kid].kadro.reduce((a, o) => a + o.maas, 0);

  // Oyuncunun istediği maaş: gücü, yaşı, geldiği kulübün büyüklüğü ve morali
  function istek(o, tur, eskiKulup) {
    let m = DUNYA.maasIstegi(o);
    const biz = kulupBul(S.kulupId);
    if (tur === "transfer" && eskiKulup) m *= 1 + Math.max(-0.05, (kulupBul(eskiKulup).guc - biz.guc) / 60);
    if (tur === "uzatma") m = Math.max(o.maas, m) * (o.moral >= 70 ? 0.97 : o.moral < 45 ? 1.12 : 1.03);
    if (tur === "serbest") m *= 0.92;
    return Math.round(m / 10) * 10;
  }
  // Gençler kısa, yaşlılar uzun sözleşme ister
  const istenenSure = (o) => (o.yas <= 23 ? 2 : o.yas >= 30 ? 3 : 2);

  // sec: { o, tur: "transfer"|"serbest"|"uzatma", eskiKulup, bonservis, bitince(kabul) }
  function gorusme(sec) {
    const o = sec.o;
    const g = { istek: istek(o, sec.tur, sec.eskiKulup), teklif: 0, sure: istenenSure(o), sabir: 3, mesaj: "" };
    g.teklif = Math.round((g.istek * 0.9) / 10) * 10;
    // Sezonun bittiği yıl (temmuz–aralık arası bir sonraki yıl). 1 yıllık sözleşme bu sezonun sonunda biter.
    const yil = Number(S.tarih.slice(0, 4)) + (S.tarih.slice(5) >= "07-01" ? 1 : 0);
    const bitisYili = (sure) => yil + sure - 1;
    const eskiMaas = sec.tur === "uzatma" ? o.maas : 0;

    const ciz = () => {
      const toplam = maaslar(S.kulupId) - eskiMaas + g.teklif;
      const limit = S.takimlar[S.kulupId].butce.maasLimit;
      const asim = toplam > limit;
      ARAYUZ.pencereAc(`Sözleşme: ${DUNYA.adSoyad(o)}`, `
        <p class="soluk">${MEVKI_ADI[o.mevki]} · ${o.yas} yaşında · güç ${Math.round(DUNYA.guc(o))}${sec.bonservis ? ` · bonservis ${para(sec.bonservis)}` : ""}${sec.tur === "uzatma" ? ` · şu anki maaşı ${para(o.maas)}` : ""}</p>
        <p>Menajeri: "${kacir(g.mesaj || `Müvekkilim ayda ${para(g.istek)} istiyor. ${g.sure} yıllık bir sözleşme düşünüyor.`)}"</p>
        <div class="ayar"><div class="ayar-baslik">Aylık maaş</div>
          <div class="sayi-sec"><button class="secenek" data-m="-50">−50</button><button class="secenek" data-m="-10">−10</button>
            <b>${para(g.teklif)}</b><button class="secenek" data-m="10">+10</button><button class="secenek" data-m="50">+50</button></div></div>
        <div class="ayar"><div class="ayar-baslik">Süre</div><div class="secenekler">${[1, 2, 3].map((y) => `<button class="secenek" data-sure="${y}" aria-pressed="${g.sure === y}">${y} yıl · ${sayiEk(bitisYili(y), "e")} kadar</button>`).join("")}</div></div>
        <p class="${asim ? "uyari" : "soluk"}">Maaş bütçesi: ${para(toplam)} / ${para(limit)}${asim ? " · bütçe aşılıyor" : ""}</p>`,
        [{ yazi: "Vazgeç", ikincil: true, fn: () => { ARAYUZ.pencereKapat(); sec.bitince && sec.bitince(false); } },
         { yazi: "Teklif et", fn: () => { if (!asim) teklifEt(); else ARAYUZ.bildirim("Maaş bütçesini aşamazsın"); } }]);
      document.querySelectorAll("#pencere-govde [data-m]").forEach((b) => { b.onclick = () => { g.teklif = Math.max(50, g.teklif + +b.dataset.m); ciz(); }; });
      document.querySelectorAll("#pencere-govde [data-sure]").forEach((b) => { b.onclick = () => { g.sure = +b.dataset.sure; ciz(); }; });
    };

    const teklifEt = () => {
      const tercih = istenenSure(o);
      const gerekli = g.istek * (g.sure === tercih ? 1 : 1 + Math.abs(g.sure - tercih) * 0.05);
      if (g.teklif >= gerekli * 0.97) {
        o.maas = g.teklif;
        o.bitis = `${bitisYili(g.sure)}-06-30`;
        ARAYUZ.pencereKapat();
        ARAYUZ.bildirim(`${o.soyad} imzaladı: ${para(o.maas)} / ay, ${sayiEk(Number(o.bitis.slice(0, 4)), "e")} kadar`);
        sec.bitince && sec.bitince(true);
        return;
      }
      g.sabir--;
      if (g.sabir <= 0 || g.teklif < gerekli * 0.75) {
        ARAYUZ.pencereAc("Görüşme bitti", `<p>Menajeri: "${g.teklif < gerekli * 0.75 ? "Bu teklifle bizi oyalamayın." : "Anlaşamayacağız gibi görünüyor."}" Masadan kalktılar.</p>`,
          [{ yazi: "Tamam", fn: () => { ARAYUZ.pencereKapat(); sec.bitince && sec.bitince(false); } }]);
        if (sec.tur === "uzatma") o.moral = sinirla(o.moral - 6, 0, 100);
        return;
      }
      // Pazarlık: istek biraz iner
      g.istek = Math.round((g.istek * 0.97) / 10) * 10;
      g.mesaj = `Bu az. ${para(g.istek)} olursa ${g.sure === tercih ? "imzalarız" : `${tercih} yıllık olursa daha kolay anlaşırız`}.`;
      ciz();
    };
    ciz();
  }

  return { gorusme, istek };
})();
