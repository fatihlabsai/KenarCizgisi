// KENAR ÇİZGİSİ — masaüstü (Electron) ana süreci
// Pencereyi açar, kayıt dosyalarını yazar/okur, tam ekranı ve otomatik güncellemeyi yönetir.
const { app, BrowserWindow, ipcMain, Menu } = require("electron");
const path = require("path");
const fs = require("fs");

const kayitKlasoru = () => path.join(app.getPath("userData"), "saves");
const gecerliAd = (n) => typeof n === "string" && /^[a-z0-9_-]{1,32}$/i.test(n);
const dosya = (n) => path.join(kayitKlasoru(), n + ".json");

function oku(n) {
  try { return JSON.parse(fs.readFileSync(dosya(n), "utf8")); } catch (e) { return null; }
}

let pencere = null;
let kapanabilir = false;

function pencereAc() {
  const ayar = oku("ayarlar") || {};
  pencere = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 640,
    title: "Kenar Çizgisi",
    backgroundColor: "#1b1d22",
    autoHideMenuBar: true,
    fullscreen: !!ayar.tamEkran,
    icon: path.join(__dirname, "build", "icon.png"),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, "preload.js"),
    },
  });
  Menu.setApplicationMenu(null);
  pencere.loadFile(path.join(__dirname, "index.html"));
  // Kapatılırken oyuna otomatik kayıt için en fazla 2 saniye ver
  pencere.on("close", (e) => {
    if (kapanabilir) return;
    e.preventDefault();
    pencere.webContents.send("kapaniyor");
    setTimeout(() => { kapanabilir = true; if (pencere && !pencere.isDestroyed()) pencere.close(); }, 2000);
  });
  pencere.webContents.on("before-input-event", (e, girdi) => {
    if (girdi.type === "keyDown" && girdi.key === "F11") { pencere.setFullScreen(!pencere.isFullScreen()); e.preventDefault(); }
  });
}

// Kayıt dosyaları: %APPDATA%\KenarCizgisi\saves\<ad>.json
ipcMain.handle("depo-oku", (e, n) => (gecerliAd(n) ? oku(n) : null));
ipcMain.handle("depo-yaz", (e, n, veri) => {
  if (!gecerliAd(n)) return false;
  fs.mkdirSync(kayitKlasoru(), { recursive: true });
  const gecici = dosya(n) + ".tmp";
  fs.writeFileSync(gecici, JSON.stringify(veri));
  fs.renameSync(gecici, dosya(n));
  return true;
});
ipcMain.handle("depo-sil", (e, n) => {
  if (gecerliAd(n)) { try { fs.unlinkSync(dosya(n)); } catch (err) { /* yoksa sorun değil */ } }
  return true;
});

// ---------- Otomatik güncelleme ----------
// Yayın deposu henüz tanımlı değil. Tanımlanınca kurulu oyun yeni sürümü kendisi indirir.
let guncelleyici = null;
let sonDurum = { durum: "yok" };

function durumGonder(d) {
  sonDurum = d;
  if (pencere && !pencere.isDestroyed()) pencere.webContents.send("guncelleme", d);
}

function guncellemeKur() {
  if (!app.isPackaged) { sonDurum = { durum: "gelistirme" }; return; }
  if (!fs.existsSync(path.join(process.resourcesPath, "app-update.yml"))) { sonDurum = { durum: "kapali" }; return; }
  try { guncelleyici = require("electron-updater").autoUpdater; } catch (e) { sonDurum = { durum: "hata", mesaj: "Güncelleme modülü yüklenemedi." }; return; }
  guncelleyici.autoDownload = true;
  guncelleyici.autoInstallOnAppQuit = true;
  guncelleyici.on("checking-for-update", () => durumGonder({ durum: "denetleniyor" }));
  guncelleyici.on("update-not-available", () => durumGonder({ durum: "guncel", surum: app.getVersion() }));
  guncelleyici.on("update-available", (i) => durumGonder({ durum: "var", surum: i.version }));
  guncelleyici.on("download-progress", (p) => durumGonder({ ...sonDurum, durum: "iniyor", yuzde: Math.round(p.percent || 0) }));
  guncelleyici.on("update-downloaded", (i) => durumGonder({ durum: "hazir", surum: i.version }));
  guncelleyici.on("error", (err) => durumGonder({ durum: "hata", mesaj: String((err && err.message) || err).slice(0, 200) }));
  const denetle = () => guncelleyici.checkForUpdates().catch(() => {});
  setTimeout(denetle, 4000);
  setInterval(denetle, 4 * 60 * 60 * 1000);
}

ipcMain.handle("guncelleme-durum", () => sonDurum);
ipcMain.on("guncelleme-kur", () => { if (guncelleyici && sonDurum.durum === "hazir") { kapanabilir = true; guncelleyici.quitAndInstall(true, true); } });

ipcMain.handle("tam-ekran", (e, acik) => { pencere.setFullScreen(!!acik); return pencere.isFullScreen(); });
ipcMain.handle("tam-ekran-mi", () => pencere.isFullScreen());
ipcMain.handle("surum", () => app.getVersion());
ipcMain.handle("kayit-klasoru", () => kayitKlasoru());
ipcMain.on("cik", () => { kapanabilir = true; app.quit(); });

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on("second-instance", () => { if (pencere) { if (pencere.isMinimized()) pencere.restore(); pencere.focus(); } });
  app.whenReady().then(() => { pencereAc(); guncellemeKur(); });
  app.on("window-all-closed", () => app.quit());
}
