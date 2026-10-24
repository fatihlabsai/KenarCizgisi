// Grafik sayfalarını yükler ve 16×16 karoları çizer.
// Kenney sayfalarında karolar arasında 1 piksel boşluk var.
const KAYNAK = (() => {
  const T = 16, ARA = 1;
  const sayfalar = {};

  function yukle(ad, yol) {
    return new Promise((tamam, hata) => {
      const im = new Image();
      im.onload = () => { sayfalar[ad] = im; tamam(im); };
      im.onerror = () => hata(new Error("Grafik yüklenemedi: " + yol));
      im.src = yol;
    });
  }

  function hepsiniYukle() {
    return Promise.all([
      yukle("sehir", "assets/kenney/sehir.png"),
      yukle("ic", "assets/kenney/ic-mekan.png"),
      yukle("kar", "assets/kenney/karakter.png"),
    ]);
  }

  // Sayfadaki (s, r) karosunu ekrandaki (x, y) noktasına çizer.
  function karo(ctx, sayfa, s, r, x, y, ayna = false) {
    const im = sayfalar[sayfa];
    const sx = s * (T + ARA), sy = r * (T + ARA);
    if (!ayna) { ctx.drawImage(im, sx, sy, T, T, Math.round(x), Math.round(y), T, T); return; }
    ctx.save();
    ctx.translate(Math.round(x) + T, Math.round(y));
    ctx.scale(-1, 1);
    ctx.drawImage(im, sx, sy, T, T, 0, 0, T, T);
    ctx.restore();
  }

  // Bir alanı aynı karoyla döşer (karo biriminde).
  function doseme(ctx, sayfa, s, r, kx, ky, gen, yuk) {
    for (let y = 0; y < yuk; y++)
      for (let x = 0; x < gen; x++) karo(ctx, sayfa, s, r, (kx + x) * T, (ky + y) * T);
  }

  // Bir karoyu ayrı bir küçük tuvale kopyalar (boyamak için).
  function kopya(sayfa, s, r) {
    const c = document.createElement("canvas");
    c.width = c.height = T;
    c.getContext("2d").drawImage(sayfalar[sayfa], s * (T + ARA), r * (T + ARA), T, T, 0, 0, T, T);
    return c;
  }

  return { T, sayfalar, hepsiniYukle, karo, doseme, kopya };
})();
