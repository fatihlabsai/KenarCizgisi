// Açılış: grafikleri ve yazı tipini yükle, sahneleri kur, ana menüyü aç.
(async () => {
  try {
    await Promise.all([KAYNAK.hepsiniYukle(), document.fonts.load('24px "Jersey 10"'), ayarlariYukle()]);
    [SAHNE_ANTRENMAN, SAHNE_SOKAK, SAHNE_DAIRE].forEach((s) => s.kur());
    menuyuKur();
  } catch (e) {
    document.body.insertAdjacentHTML("beforeend", `<p style="position:fixed;inset:20px;color:#e66">${kacir(e.message)}</p>`);
  }
})();
