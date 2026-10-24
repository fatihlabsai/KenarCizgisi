// Karakter oluşturma ekranı: menajerin teni, saçı, sakalı ve kıyafeti.
const GORUNUS_EKRANI = (() => {
  // Renk kutucuklarında görünen tonlar (katalogdaki sırayla)
  const ORNEK = {
    ten: ["#e8c19c", "#c99b6e", "#8f6544", "#f2c4a8", "#6e4630"],
    sacRenk: ["#7a5230", "#c4621f", "#e3cf96", "#3a3a40", "#e8e8e8"],
    ustRenk: ["#3e3e44", "#b5a68a", "#3aa7a3", "#d8692c", "#7cb342", "#c6b4e0"],
  };
  // Sırasıyla ekranda görünen satırlar. "renk" satırları kutucuk, diğerleri ◂ ▸ seçici.
  const SATIRLAR = [
    { ad: "ten", yazi: "Ten", tur: "renk" },
    { ad: "sac", yazi: "Saç", tur: "ok" },
    { ad: "sacRenk", yazi: "Saç rengi", tur: "renk" },
    { ad: "sakal", yazi: "Sakal", tur: "ok" },
    { ad: "ust", yazi: "Üst", tur: "ok" },
    { ad: "ustRenk", yazi: "Üst rengi", tur: "renk" },
    { ad: "alt", yazi: "Pantolon", tur: "renk" },
    { ad: "ayakkabi", yazi: "Ayakkabı", tur: "renk" },
  ];

  let g = null, adSoyad = "";

  function ornekRenk(ad, i) {
    return ORNEK[ad] ? ORNEK[ad][i] : KARAKTER.KATALOG[ad][i].renk;
  }

  function onizlemeCiz() {
    const kisi = KARAKTER.gorunus(g);
    // Büyük önizleme: 28×28'lik küçük sahne, 10 kat büyütülmüş
    const b = $("gorunus-buyuk"), bc = b.getContext("2d");
    b.width = b.height = 280;
    bc.imageSmoothingEnabled = false;
    bc.save(); bc.scale(10, 10);
    for (let y = 0; y < 2; y++) for (let x = 0; x < 2; x++) KAYNAK.karo(bc, "sehir", 3, 19, x * 16 - 2, y * 16 - 2);
    bc.fillStyle = "rgba(0,0,0,0.18)"; bc.fillRect(9, 23, 10, 2);
    bc.drawImage(kisi, 6, 8);
    bc.restore();
    // Küçük önizleme: sahadaki gerçek boyutu
    const s = $("gorunus-saha"), sc = s.getContext("2d");
    s.width = 96; s.height = 72;
    sc.imageSmoothingEnabled = false;
    sc.save(); sc.scale(3, 3);
    for (let x = 0; x < 2; x++) for (let y = 0; y < 2; y++) KAYNAK.karo(sc, "sehir", 0, 24, x * 16, y * 16);
    sc.fillStyle = "rgba(255,255,255,0.8)"; sc.fillRect(0, 19, 32, 1);
    sc.fillStyle = "rgba(0,0,0,0.22)"; sc.fillRect(11, 15, 10, 2);
    sc.drawImage(kisi, 8, 0);
    sc.restore();
  }

  function secimleriCiz() {
    const kutu = $("gorunus-secimler");
    kutu.innerHTML = SATIRLAR.map(({ ad, yazi, tur }) => {
      const liste = KARAKTER.KATALOG[ad];
      if (tur === "ok") {
        return `<div class="secim"><span>${yazi}</span><div class="ok-secici">
          <button data-ad="${ad}" data-yon="-1" aria-label="Önceki">◂</button><b>${liste[g[ad]].ad}</b>
          <button data-ad="${ad}" data-yon="1" aria-label="Sonraki">▸</button></div></div>`;
      }
      const kutular = liste.map((o, i) => `<button class="renk" data-ad="${ad}" data-i="${i}" title="${o.ad}" aria-label="${o.ad}" aria-pressed="${g[ad] === i}" style="background:${ornekRenk(ad, i)}"></button>`).join("");
      return `<div class="secim"><span>${yazi}</span><div class="renkler">${kutular}</div></div>`;
    }).join("");
    kutu.querySelectorAll("[data-yon]").forEach((b) => {
      b.onclick = () => {
        const n = KARAKTER.KATALOG[b.dataset.ad].length;
        g[b.dataset.ad] = (g[b.dataset.ad] + +b.dataset.yon + n) % n;
        yenile();
      };
    });
    kutu.querySelectorAll("[data-i]").forEach((b) => { b.onclick = () => { g[b.dataset.ad] = +b.dataset.i; yenile(); }; });
  }

  function yenile() { secimleriCiz(); onizlemeCiz(); }

  // taslak: { ad, soyad, gorunus }; secenekler: { geri, devam }
  function ac(taslak, { geri, devam }) {
    if (!taslak.gorunus) taslak.gorunus = { ...KARAKTER.VARSAYILAN };
    g = taslak.gorunus;
    adSoyad = `${taslak.ad} ${taslak.soyad}`;
    ARAYUZ.ekranGoster("ekran-gorunus");
    ARAYUZ.escYoksa = geri;
    $("gorunus-ad").textContent = adSoyad;
    $("gorunus-geri").onclick = geri;
    $("gorunus-devam").onclick = devam;
    $("gorunus-rastgele").onclick = () => { Object.assign(g, KARAKTER.rastgeleGorunus()); yenile(); };
    yenile();
  }

  return { ac };
})();
