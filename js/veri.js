// Sabit oyun verileri: isimler, kulüpler, dizilişler, hazırlık maçları.
// Kulüp ve kişi isimleri 💡 öneri (TASARIM.md 3.2).

// Her ülkenin isimleri kendine özgü bir ses taşır:
// Sinistra Latin/İtalyan, Odexia Yunan, Carceria karışık (iki tarafın insanlarıyla kuruldu).
const ISIMLER = {
  c: {
    ad: ["Jovan", "Felix", "Dorian", "Vasko", "Emil", "Otto", "Teo", "Milan", "Anton", "Viktor", "Oskar", "Rafael", "Lukas", "Adam", "Marek", "Pavel", "Stefan", "Tomas", "Noel", "Ivo", "Bruno", "Kasimir", "Leon", "Aron", "Matej", "Henrik", "Daniel", "Elias"],
    soyad: ["Kask", "Petri", "Varga", "Arden", "Sorov", "Brenn", "Kovac", "Lind", "Marr", "Novak", "Oren", "Rask", "Szabo", "Tamm", "Vell", "Weiss", "Zoller", "Halvor", "Drago", "Fenn", "Grubic", "Hollis", "Jarek", "Kessler", "Moravec", "Pell", "Stroud", "Vinter"],
  },
  s: {
    ad: ["Dario", "Luca", "Matteo", "Renzo", "Silvio", "Tullio", "Enzo", "Paolo", "Nico", "Fabio", "Carlo", "Elio", "Gino", "Leone", "Mauro", "Piero", "Sandro", "Valerio", "Aurelio", "Cesare", "Emiliano", "Ottavio", "Raffa", "Teodoro"],
    soyad: ["Ferrante", "Moretti", "Calvi", "Bellini", "Rossano", "Vitale", "Serra", "Donati", "Galli", "Ruggeri", "Testa", "Bassi", "Fabbri", "Leoni", "Mancuso", "Orsini", "Palma", "Cattaneo", "Verdi", "Lombardo", "Sartori", "Pace", "Riva", "Monti"],
  },
  o: {
    ad: ["Nikos", "Yannis", "Stavros", "Petros", "Kostas", "Dimitris", "Alexis", "Thanos", "Vasilis", "Manolis", "Christos", "Lefteris", "Panos", "Spiros", "Takis", "Giorgos", "Andreas", "Michalis", "Sotiris", "Fotis", "Iraklis", "Makis"],
    soyad: ["Kalaris", "Dounas", "Petridis", "Makris", "Stavrou", "Lekkas", "Vlachos", "Karras", "Mitsos", "Andreou", "Galanis", "Raptis", "Zervas", "Kouris", "Leontis", "Sarris", "Tsakos", "Melis", "Floros", "Dimou", "Kyriakos", "Nomikos"],
  },
};

// Kasabalılar için kadın isimleri (futbolcu listeleri sadece erkek isimleri)
const ISIMLER_K = {
  c: ["Lena", "Ilse", "Vesna", "Hana", "Klara", "Mila", "Rosa", "Ida", "Nora", "Petra", "Sasha", "Agnes", "Marta", "Jana"],
  s: ["Giulia", "Chiara", "Livia", "Serena", "Paola", "Bianca", "Nadia", "Elena", "Teresa", "Viola"],
  o: ["Eleni", "Katerina", "Sofia", "Ioanna", "Daphne", "Irini", "Thalia", "Zoe", "Anna", "Despina"],
};

const KOKEN_ADI = { c: "Karkeryan", s: "Sinistralı", o: "Odexialı" };
const MEMLEKET_KOKEN = { carceria: "c", sinistra: "s", odexia: "o" };

// Carceria Ligi. guc: kadronun ortalama kalitesi (yaklaşık 45–70). koken: oyuncuların nereli olduğu.
const KULUPLER = [
  { id: "kalvar", ad: "Kalvar Spor", kisa: "Kalvar", sehir: "Kalvar", stad: "Avlu Stadı", forma: "#c8a640", sort: "#2b2f3a", guc: 51, koken: { c: 0.7, s: 0.15, o: 0.15 } },
  { id: "city", ad: "Carceria City FK", kisa: "City", sehir: "Carceria City", stad: "Merkez Stadı", forma: "#8c1c2a", sort: "#f0f0f0", guc: 66, koken: { c: 0.6, s: 0.2, o: 0.2 } },
  { id: "dinamo", ad: "Dinamo Carceria", kisa: "Dinamo", sehir: "Carceria City", stad: "Gardiyanlar Sahası", forma: "#2a4f9a", sort: "#ffffff", guc: 63, koken: { c: 0.8, s: 0.1, o: 0.1 } },
  { id: "union", ad: "Union 32", kisa: "Union", sehir: "Carceria City", stad: "Otuz İki Parkı", forma: "#d24a2a", sort: "#1e1e1e", guc: 58, koken: { c: 0.75, s: 0.12, o: 0.13 } },
  { id: "brennik", ad: "Brennik Atletik", kisa: "Brennik", sehir: "Brennik", stad: "Batı Kapısı", forma: "#3d8a4a", sort: "#ffffff", guc: 57, koken: { c: 0.35, s: 0.6, o: 0.05 } },
  { id: "ardessa", ad: "Asteras Ardessa", kisa: "Asteras", sehir: "Ardessa", stad: "Asteras Sahası", forma: "#f0f0f0", sort: "#2a5aa8", guc: 56, koken: { c: 0.35, s: 0.05, o: 0.6 } },
  { id: "tessel", ad: "Tessel Lokomotiv", kisa: "Lokomotiv", sehir: "Tessel", stad: "Depo Sahası", forma: "#4a5560", sort: "#1d1d1d", guc: 54, koken: { c: 0.8, s: 0.1, o: 0.1 } },
  { id: "mirov", ad: "Mirov SK", kisa: "Mirov", sehir: "Mirov", stad: "Tepe Stadı", forma: "#2aa1a1", sort: "#ffffff", guc: 55, koken: { c: 0.6, s: 0.2, o: 0.2 } },
  { id: "kuzey", ad: "Kuzey Ovası FK", kisa: "Ova", sehir: "Kalvar çevresi", stad: "Harman Sahası", forma: "#e07a2a", sort: "#2b2f3a", guc: 47, koken: { c: 0.85, s: 0.08, o: 0.07 } },
  { id: "sentinel", ad: "Sentinel Carceria", kisa: "Sentinel", sehir: "Carceria City", stad: "Semt Sahası", forma: "#1f2a44", sort: "#c8c8c8", guc: 49, koken: { c: 0.8, s: 0.1, o: 0.1 } },
];
// Ligden düşenlerin yerine çıkan kulüpler kayıtta tutulur (S.ekKulupler)
const kulupBul = (id) => KULUPLER.find((k) => k.id === id) || (typeof S !== "undefined" && S && S.ekKulupler ? S.ekKulupler.find((k) => k.id === id) : null);

// Ova Ligi'nden (alt lig) çıkabilecek kulüpler: barajı kazanırsa Carceria Ligi'ne katılır
const ALT_LIG = [
  { id: "harman", ad: "Harman Gücü", kisa: "Harman", sehir: "Kalvar Ovası", stad: "Değirmen Sahası", forma: "#9a6b3a", sort: "#f0e6c8", guc: 46, koken: { c: 0.85, s: 0.08, o: 0.07 } },
  { id: "tesseldemir", ad: "Tessel Demirspor", kisa: "Demirspor", sehir: "Tessel", stad: "Atölye Sahası", forma: "#5d6b78", sort: "#e0b03a", guc: 47, koken: { c: 0.8, s: 0.1, o: 0.1 } },
  { id: "ardessayildiz", ad: "Ardessa Yıldızı", kisa: "Yıldız", sehir: "Ardessa", stad: "Liman Sahası", forma: "#2c6fb0", sort: "#ffffff", guc: 46, koken: { c: 0.4, s: 0.05, o: 0.55 } },
  { id: "brennikunion", ad: "Brennik Union", kisa: "B. Union", sehir: "Brennik", stad: "Sınır Sahası", forma: "#b23a48", sort: "#1e1e1e", guc: 46, koken: { c: 0.4, s: 0.55, o: 0.05 } },
];

// Kalvar Spor'un hazırlık maçları (lig fikstürü Aşama 2'de gelecek)
const HAZIRLIK = [
  { tarih: "2026-08-01", rakip: "tessel", ev: true },
  { tarih: "2026-08-08", rakip: "kuzey", ev: false },
  { tarih: "2026-08-15", rakip: "brennik", ev: true },
  { tarih: "2026-08-22", rakip: "mirov", ev: false },
];

// Dizilişler: takım sağa doğru hücum ediyormuş gibi x (0 kendi kalesi → 1 rakip kalesi), y (0 üst → 1 alt)
const DIZILISLER = {
  "4-4-2": [["KL", 0.04, 0.5], ["DF", 0.22, 0.14], ["DF", 0.19, 0.38], ["DF", 0.19, 0.62], ["DF", 0.22, 0.86], ["OS", 0.45, 0.14], ["OS", 0.41, 0.39], ["OS", 0.41, 0.61], ["OS", 0.45, 0.86], ["FV", 0.66, 0.4], ["FV", 0.66, 0.6]],
  "4-3-3": [["KL", 0.04, 0.5], ["DF", 0.22, 0.14], ["DF", 0.19, 0.38], ["DF", 0.19, 0.62], ["DF", 0.22, 0.86], ["OS", 0.4, 0.28], ["OS", 0.37, 0.5], ["OS", 0.4, 0.72], ["FV", 0.66, 0.18], ["FV", 0.7, 0.5], ["FV", 0.66, 0.82]],
  "4-5-1": [["KL", 0.04, 0.5], ["DF", 0.22, 0.14], ["DF", 0.19, 0.38], ["DF", 0.19, 0.62], ["DF", 0.22, 0.86], ["OS", 0.36, 0.36], ["OS", 0.36, 0.64], ["OS", 0.5, 0.14], ["OS", 0.52, 0.5], ["OS", 0.5, 0.86], ["FV", 0.7, 0.5]],
  "5-3-2": [["KL", 0.04, 0.5], ["DF", 0.25, 0.1], ["DF", 0.19, 0.3], ["DF", 0.17, 0.5], ["DF", 0.19, 0.7], ["DF", 0.25, 0.9], ["OS", 0.42, 0.3], ["OS", 0.39, 0.5], ["OS", 0.42, 0.7], ["FV", 0.65, 0.4], ["FV", 0.65, 0.6]],
};

const ANLAYISLAR = {
  savunma: { ad: "Savunma", hucum: 0.88, savunma: 1.12 },
  dengeli: { ad: "Dengeli", hucum: 1, savunma: 1 },
  hucum: { ad: "Hücum", hucum: 1.12, savunma: 0.88 },
};

// Takım talimatları: maç motorundaki çarpanlar. Boş olanlar etkisiz.
const TALIMATLAR = {
  hat: { ad: "Savunma hattı", secenek: {
    geride: { ad: "Geride", aciklama: "Arkaya top yemezsin ama orta saha boşalır.", savunma: 1.07, orta: 0.97, hucum: 0.96, rakipIsabet: -0.03 },
    normal: { ad: "Normal", aciklama: "" },
    onde: { ad: "Önde", aciklama: "Rakibi sıkıştırırsın, arkaya atılan toplara açık kalırsın.", orta: 1.05, hucum: 1.03, savunma: 0.95, rakipIsabet: 0.05 },
  } },
  pres: { ad: "Pres", secenek: {
    az: { ad: "Az", aciklama: "Oyuncular daha az yorulur, rakip rahat oynar.", orta: 0.96, yorgunluk: 0.88 },
    normal: { ad: "Normal", aciklama: "" },
    yogun: { ad: "Yoğun", aciklama: "Top kazanırsın ama ikinci yarıda bacaklar ağırlaşır.", orta: 1.07, savunma: 1.02, yorgunluk: 1.22 },
  } },
  pas: { ad: "Pas", secenek: {
    kisa: { ad: "Kısa", aciklama: "Topa daha çok sahip olursun, atak yavaşlar.", orta: 1.05, hucum: 0.97 },
    karisik: { ad: "Karışık", aciklama: "" },
    uzun: { ad: "Uzun", aciklama: "Doğrudan oyun. Hızlı forvetlerin varsa işe yarar.", orta: 0.94, hucum: 1.03, hizBonus: true },
  } },
  genislik: { ad: "Genişlik", secenek: {
    dar: { ad: "Dar", aciklama: "Ortayı kapatırsın, kanatlardan az atak üretirsin.", savunma: 1.03, hucum: 0.98 },
    normal: { ad: "Normal", aciklama: "" },
    genis: { ad: "Geniş", aciklama: "Sahayı açarsın, arkada boşluk kalır.", hucum: 1.04, savunma: 0.97 },
  } },
};
const VARSAYILAN_TALIMAT = { hat: "normal", pres: "normal", pas: "karisik", genislik: "normal" };
const SAKATLIK_TURLERI = ["arka adale", "ayak bileği burkulması", "diz bağı zorlanması", "kasık", "baldır", "omuz çıkığı", "darbe"];

const MEVKI_ADI ={ KL: "Kaleci", DF: "Defans", OS: "Orta saha", FV: "Forvet" };
const OZELLIK_ADI = { hiz: "Hız", sut: "Şut", pas: "Pas", teknik: "Teknik", savunma: "Savunma", kaleci: "Kalecilik", dayaniklilik: "Dayanıklılık" };
const OZELLIK_KISA = { hiz: "Hız", sut: "Şut", pas: "Pas", teknik: "Tek", savunma: "Sav", kaleci: "Kal", dayaniklilik: "Day" };
