// Oyun durumu, yeni kariyer, kayıt yuvaları ve oyun ekranı.
const KAYIT_SURUMU = 1;
const YUVA_SAYISI = 3;

let S = null; // oyunun tüm durumu; kayıt dosyasına olduğu gibi yazılır

const MEMLEKETLER = [
  { id: "carceria", ad: "Carceria", yazi: "Kalvar'da doğdun. Bu ovanın tozunu bilirsin." },
  { id: "sinistra", ad: "Sinistra", yazi: "Ferrano'dan geldin. Brennik seni sever, Ardessa pek sevmez." },
  { id: "odexia", ad: "Odexia", yazi: "Dorakos'tan geldin. Ardessa'da evindesin, Brennik'te misafir." },
];

function yeniDurum(ad, soyad, memleket, yuva, gorunus) {
  return {
    v: KAYIT_SURUMU,
    yuva,
    kayitZamani: 0,
    menajer: { ad, soyad, memleket, gorunus: { ...(gorunus || KARAKTER.VARSAYILAN) } },
    kulup: { id: "kalvar", ad: "Kalvar Spor", forma: "#c8a640", sort: "#2b2f3a" },
    ev: { adres: "Lale Sokak No 4", sehir: "Kalvar", kiraKulupten: 3 },
    tarih: "2026-07-01",
    para: 1840,
    maas: 2400,
  };
}

// ---------- Kayıt yuvaları ----------
const yuvaAdi = (n) => "kayit" + n;

async function yuvalariOku() {
  const liste = [];
  for (let n = 1; n <= YUVA_SAYISI; n++) {
    const k = await DEPO.oku(yuvaAdi(n));
    liste.push(k && k.v === KAYIT_SURUMU ? k : null);
  }
  return liste;
}

async function kaydet(sessiz = false) {
  if (!S) return false;
  S.kayitZamani = Date.now();
  const tamam = await DEPO.yaz(yuvaAdi(S.yuva), S);
  if (!sessiz) ARAYUZ.bildirim(tamam ? "Kaydedildi" : "Kaydedilemedi!");
  return tamam;
}

async function yukle(n) {
  const k = await DEPO.oku(yuvaAdi(n));
  if (!k || k.v !== KAYIT_SURUMU) { ARAYUZ.bildirim("Bu kayıt açılamadı"); return; }
  S = k;
  S.yuva = n;
  ARAYUZ.pencereKapat();
  oyunEkrani();
}

function yuvaSatiri(k, n, dugmeler) {
  if (!k) return `<div class="yuva yuva-bos"><div><b>Yuva ${n} · Boş</b></div><div>${dugmeler}</div></div>`;
  const ne = new Date(k.kayitZamani).toLocaleString("tr-TR", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });
  return `<div class="yuva"><div><b>${kacir(k.menajer.ad)} ${kacir(k.menajer.soyad)}</b>
    <span>${kacir(k.kulup.ad)} · ${TARIH.kisa(k.tarih)} · kaydedildi: ${ne}</span></div><div>${dugmeler}</div></div>`;
}

// mod: "yukle" (kayıt aç) ya da "yeni" (yeni kariyer için yuva seç)
async function kayitPenceresi(mod, sonra) {
  const yuvalar = await yuvalariOku();
  const satirlar = yuvalar.map((k, i) => {
    const n = i + 1;
    if (mod === "yukle") return yuvaSatiri(k, n, k ? `<button class="dugme" data-yukle="${n}">Yükle</button> <button class="dugme ikincil" data-sil="${n}">Sil</button>` : "");
    return yuvaSatiri(k, n, `<button class="dugme${k ? " ikincil" : ""}" data-sec="${n}">${k ? "Üstüne yaz" : "Seç"}</button>`);
  }).join("");
  const geri = () => { ARAYUZ.pencereKapat(); if (mod === "yukle") menuyuKur(); };
  ARAYUZ.pencereAc(mod === "yukle" ? "Kayıtlar" : "Kayıt yuvası seç", `<div class="yuvalar">${satirlar}</div>`,
    [{ yazi: "Geri", ikincil: true, fn: geri }], { esc: geri });
  const govde = $("pencere-govde");
  govde.querySelectorAll("[data-yukle]").forEach((b) => { b.onclick = () => yukle(+b.dataset.yukle); });
  govde.querySelectorAll("[data-sec]").forEach((b) => { b.onclick = () => { ARAYUZ.pencereKapat(); sonra(+b.dataset.sec); }; });
  govde.querySelectorAll("[data-sil]").forEach((b) => {
    b.onclick = () => {
      const n = +b.dataset.sil;
      ARAYUZ.pencereAc("Kayıt silinsin mi?", `<p>Yuva ${n} silinecek. Bu geri alınamaz.</p>`, [
        { yazi: "Vazgeç", ikincil: true, fn: () => kayitPenceresi("yukle") },
        { yazi: "Sil", fn: async () => { await DEPO.sil(yuvaAdi(n)); kayitPenceresi("yukle"); } },
      ], { esc: () => kayitPenceresi("yukle") });
    };
  });
}

// ---------- Yeni kariyer ----------
// Adımlar: kimlik (ad, soyad, memleket) → görünüş → teklif mektubu → oyun
let secilenMemleket = null;
let taslak = null; // yeni kariyerde doldurulan bilgiler; geri dönünce kaybolmasın diye tutuluyor

function yeniKariyerEkrani(temizle = true) {
  ARAYUZ.ekranGoster("ekran-yeni");
  ARAYUZ.escYoksa = menuyuKur;
  CIZICI.durdur();
  if (temizle) { taslak = null; secilenMemleket = null; $("yeni-ad").value = ""; $("yeni-soyad").value = ""; }
  $("yeni-hata").textContent = "";
  const kutu = $("yeni-memleket");
  kutu.innerHTML = MEMLEKETLER.map((m) => `<button class="memleket" data-id="${m.id}" aria-pressed="${m.id === secilenMemleket}"><b>${m.ad}</b><span>${m.yazi}</span></button>`).join("");
  kutu.querySelectorAll(".memleket").forEach((b) => {
    b.onclick = () => {
      secilenMemleket = b.dataset.id;
      kutu.querySelectorAll(".memleket").forEach((x) => x.setAttribute("aria-pressed", x === b));
    };
  });
  $("yeni-ad").focus();
}

function adDuzelt(s) {
  const t = s.trim().replace(/\s+/g, " ");
  return t ? t.charAt(0).toLocaleUpperCase("tr-TR") + t.slice(1) : "";
}

function kimlikDevam() {
  const ad = adDuzelt($("yeni-ad").value), soyad = adDuzelt($("yeni-soyad").value);
  if (!ad || !soyad) { $("yeni-hata").textContent = "Adını ve soyadını yaz."; return; }
  if (!secilenMemleket) { $("yeni-hata").textContent = "Nereli olduğunu seç."; return; }
  taslak = { ...(taslak || {}), ad, soyad, memleket: secilenMemleket };
  gorunusAdimi();
}

function gorunusAdimi() {
  GORUNUS_EKRANI.ac(taslak, { geri: () => yeniKariyerEkrani(false), devam: basvur });
}

async function basvur() {
  const yuvalar = await yuvalariOku();
  const bos = yuvalar.findIndex((k) => !k);
  const devam = (n) => { S = yeniDurum(taslak.ad, taslak.soyad, taslak.memleket, n, taslak.gorunus); mektupEkrani(); };
  if (bos >= 0) devam(bos + 1);
  else kayitPenceresi("yeni", devam);
}

function mektupEkrani() {
  ARAYUZ.ekranGoster("ekran-mektup");
  ARAYUZ.escYoksa = () => { S = null; gorunusAdimi(); };
  $("mektup-tarih").textContent = "28 Haziran 2026";
  const m = S.menajer;
  $("mektup-metin").innerHTML = `
    <p>Sayın ${kacir(m.ad)} ${kacir(m.soyad)},</p>
    <p>Yönetim kurulumuz dün akşam toplandı ve teknik direktörlük için sizinle anlaşma kararı aldı.</p>
    <p>Bütçemiz büyük değil, bunu baştan söyleyeyim: aylık ${para(S.maas)} maaş, bir yıllık sözleşme. Lale Sokak'ta kulübün tuttuğu bir daire var. İlk üç ayın kirası bizden.</p>
    <p>Geçen sezonu dokuzuncu bitirdik. Taraftar küme düşmemek istiyor, ben biraz daha fazlasını.</p>
    <p>Antrenmanlar 6 Temmuz Pazartesi başlıyor.</p>
    <p class="imza">Avluda görüşmek üzere,<br>Ilian Dorsa<br><span class="soluk">Kalvar Spor Başkanı</span></p>`;
}

async function imzala() {
  await kaydet(true);
  oyunEkrani();
}

// ---------- Oyun ekranı ----------
function hudYenile() {
  $("hud-kulup").textContent = S.kulup.ad;
  $("hud-tarih").textContent = TARIH.uzun(S.tarih);
  $("hud-para").textContent = para(S.para);
  $("hud-yer").textContent = `${S.ev.adres} · ${S.ev.sehir}`;
}

function oyunEkrani() {
  ARAYUZ.ekranGoster("ekran-oyun");
  ARAYUZ.escYoksa = duraklat;
  SAHNE_DAIRE.metinAyarla(() => `Hesap: ${para(S.para)} · Maaşa ${TARIH.ayBasinaKalan(S.tarih)} gün var`);
  SAHNE_DAIRE.menajerAyarla(KARAKTER.gorunus(S.menajer.gorunus));
  CIZICI.goster($("tuval-oyun"), SAHNE_DAIRE, { mod: "sigdir", kap: document.querySelector(".oyun-orta") });
  hudYenile();
}

async function gunuBitir() {
  S.tarih = TARIH.ekle(S.tarih, 1);
  if (TARIH.ayinIlkGunu(S.tarih)) {
    S.para += S.maas;
    ARAYUZ.bildirim(`Maaş yattı: ${para(S.maas)}`);
  }
  hudYenile();
  await kaydet(true);
}

function duraklat() {
  ARAYUZ.pencereAc("Duraklatıldı", `<div class="duraklat-dugmeler">
      <button class="dugme" id="d-devam">Devam et</button>
      <button class="dugme ikincil" id="d-kaydet">Kaydet</button>
      <button class="dugme ikincil" id="d-ayar">Ayarlar</button>
      <button class="dugme ikincil" id="d-menu">Kaydet ve ana menüye dön</button>
    </div>`, []);
  $("d-devam").onclick = ARAYUZ.pencereKapat;
  $("d-kaydet").onclick = async () => { await kaydet(); ARAYUZ.pencereKapat(); };
  $("d-ayar").onclick = () => ayarlarPenceresi(duraklat);
  $("d-menu").onclick = async () => { await kaydet(true); S = null; ARAYUZ.pencereKapat(); menuyuKur(); };
}

// ---------- Ayarlar ----------
async function ayarlarPenceresi(geri) {
  const sec = (deger, yazi) => `<button class="secenek" data-tam="${deger}" aria-pressed="${AYARLAR.tamEkran === deger}">${yazi}</button>`;
  let klasor = "Tarayıcı denemesi: kayıtlar bu tarayıcıda saklanıyor.";
  let surum = "geliştirme";
  let guncelleme = "";
  if (MASAUSTU) {
    klasor = await window.masaustu.kayitKlasoru();
    surum = await window.masaustu.surum();
    const d = await window.masaustu.guncellemeDurum();
    guncelleme = {
      gelistirme: "Geliştirme sürümünde güncelleme denetlenmez.",
      kapali: "Otomatik güncelleme henüz açılmadı.",
      denetleniyor: "Denetleniyor…",
      guncel: "Oyun güncel.",
      var: `Yeni sürüm bulundu: ${d.surum}`,
      iniyor: `Yeni sürüm iniyor: %${d.yuzde || 0}`,
      hazir: `Sürüm ${d.surum} hazır. Oyunu kapatınca kurulacak.`,
      hata: "Güncelleme denetlenemedi.",
    }[d.durum] || "";
  }
  ARAYUZ.pencereAc("Ayarlar", `
    <div class="ayar"><div class="ayar-baslik">Ekran <span>Kısayol: F11</span></div>
      <div class="secenekler">${sec(false, "Pencere")}${sec(true, "Tam ekran")}</div></div>
    <div class="ayar"><div class="ayar-baslik">Kayıt klasörü</div><div class="kucuk-yazi">${kacir(klasor)}</div></div>
    <div class="ayar"><div class="ayar-baslik">Sürüm <span>${kacir(surum)}</span></div>${guncelleme ? `<div class="kucuk-yazi">${kacir(guncelleme)}</div>` : ""}</div>
    <div class="ayar"><div class="ayar-baslik">Emeği geçenler</div>
      <div class="kucuk-yazi">Grafikler: Kenney (kenney.nl) · Yazı tipi: Jersey 10, Sarah Cadigan-Fried</div></div>`,
    [{ yazi: "Geri", ikincil: true, fn: geri }], { esc: geri });
  $("pencere-govde").querySelectorAll("[data-tam]").forEach((b) => {
    b.onclick = async () => { await tamEkranAyarla(b.dataset.tam === "true"); ayarlarPenceresi(geri); };
  });
}

// ---------- Ana menü ----------
async function menuyuKur() {
  ARAYUZ.pencereKapat();
  ARAYUZ.ekranGoster("ekran-menu");
  ARAYUZ.escYoksa = null;
  CIZICI.goster($("tuval-menu"), SAHNE_ANTRENMAN, { mod: "kapla", kap: $("ekran-menu"), balon: false });

  const yuvalar = await yuvalariOku();
  const son = yuvalar.filter(Boolean).sort((a, b) => b.kayitZamani - a.kayitZamani)[0];
  const nav = $("menu-dugmeler");
  nav.innerHTML = "";
  const ekle = (yazi, fn, alt, kapali) => {
    const b = document.createElement("button");
    b.innerHTML = kacir(yazi) + (alt ? `<small>${kacir(alt)}</small>` : "");
    b.disabled = !!kapali;
    b.onclick = fn;
    nav.appendChild(b);
  };
  ekle("Devam et", () => son && yukle(son.yuva), son ? `${son.menajer.ad} ${son.menajer.soyad} · ${TARIH.kisa(son.tarih)}` : "", !son);
  ekle("Yeni kariyer", yeniKariyerEkrani);
  ekle("Kayıtlar", () => kayitPenceresi("yukle"), "", !yuvalar.some(Boolean));
  ekle("Ayarlar", () => ayarlarPenceresi(ARAYUZ.pencereKapat));
  if (MASAUSTU) ekle("Çıkış", () => window.masaustu.cik());
  $("menu-surum").textContent = MASAUSTU ? "v" + (await window.masaustu.surum()) : "tarayıcı denemesi";
}

// ---------- Düğmeler ----------
$("yeni-geri").onclick = menuyuKur;
$("yeni-devam").onclick = kimlikDevam;
["yeni-ad", "yeni-soyad"].forEach((id) => {
  $(id).addEventListener("keydown", (e) => { if (e.key === "Enter") kimlikDevam(); });
  $(id).addEventListener("input", () => { $("yeni-hata").textContent = ""; });
});
$("mektup-geri").onclick = () => { S = null; gorunusAdimi(); };
$("mektup-imza").onclick = imzala;
$("oyun-menu").onclick = duraklat;
$("oyun-gun").onclick = gunuBitir;

// Pencere kapatılırken oyun açıksa kaydet
if (MASAUSTU) window.masaustu.kapanirken(() => { if (S) kaydet(true); });
