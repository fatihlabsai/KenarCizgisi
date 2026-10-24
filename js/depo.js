// Kayıt ve ayar dosyaları.
// Masaüstünde %APPDATA%\KenarCizgisi\saves altına, tarayıcı denemesinde localStorage'a yazılır.
const MASAUSTU = !!window.masaustu;

const DEPO = {
  async oku(ad) {
    if (MASAUSTU) return window.masaustu.oku(ad);
    try { const v = localStorage.getItem("kenar:" + ad); return v ? JSON.parse(v) : null; } catch (e) { return null; }
  },
  async yaz(ad, veri) {
    if (MASAUSTU) return window.masaustu.yaz(ad, veri);
    try { localStorage.setItem("kenar:" + ad, JSON.stringify(veri)); return true; } catch (e) { return false; }
  },
  async sil(ad) {
    if (MASAUSTU) return window.masaustu.sil(ad);
    try { localStorage.removeItem("kenar:" + ad); } catch (e) { /* yok say */ }
    return true;
  },
};

const AYARLAR = { tamEkran: false };

async function ayarlariYukle() {
  Object.assign(AYARLAR, (await DEPO.oku("ayarlar")) || {});
  if (MASAUSTU) AYARLAR.tamEkran = await window.masaustu.tamEkranMi();
}

const ayarlariKaydet = () => DEPO.yaz("ayarlar", { ...AYARLAR });

async function tamEkranAyarla(acik) {
  AYARLAR.tamEkran = !!acik;
  if (MASAUSTU) AYARLAR.tamEkran = await window.masaustu.tamEkran(acik);
  else {
    try {
      if (acik && !document.fullscreenElement) await document.documentElement.requestFullscreen();
      if (!acik && document.fullscreenElement) await document.exitFullscreen();
    } catch (e) { AYARLAR.tamEkran = !!document.fullscreenElement; }
  }
  await ayarlariKaydet();
}
