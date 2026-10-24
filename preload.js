// Oyun sayfasına güvenli köprü: yalnızca kayıt, tam ekran, güncelleme ve çıkış
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("masaustu", {
  oku: (ad) => ipcRenderer.invoke("depo-oku", ad),
  yaz: (ad, veri) => ipcRenderer.invoke("depo-yaz", ad, veri),
  sil: (ad) => ipcRenderer.invoke("depo-sil", ad),
  tamEkran: (acik) => ipcRenderer.invoke("tam-ekran", acik),
  tamEkranMi: () => ipcRenderer.invoke("tam-ekran-mi"),
  surum: () => ipcRenderer.invoke("surum"),
  kayitKlasoru: () => ipcRenderer.invoke("kayit-klasoru"),
  guncellemeDurum: () => ipcRenderer.invoke("guncelleme-durum"),
  guncellemeKur: () => ipcRenderer.send("guncelleme-kur"),
  guncellemeDinle: (cb) => ipcRenderer.on("guncelleme", (e, d) => cb(d)),
  kapanirken: (cb) => ipcRenderer.on("kapaniyor", () => cb()),
  cik: () => ipcRenderer.send("cik"),
});
