# KENAR ÇİZGİSİ — proje notları (Claude için)

Piksel sanatlı futbol menajerliği oyunu. CARCERIA evreninde, 2026'da geçiyor. Oyun tasarımının tamamı `TASARIM.md` dosyasında. Bu dosya projeyi hangi bilgisayarda açarsan aç bağlamı bilmen için var, proje ilerledikçe güncel tut.

## Çalışma kuralları
- **Kullanıcıyla her zaman Türkçe konuş.** Mesajlar, özetler, sorular ve düğme yazıları Türkçe olmalı. Kullanıcı İngilizce okuyamıyor.
- **Kullanıcının kod tecrübesi yok.** Kodun tamamını Claude yazar. Kullanıcı fikir verir, test eder ve zevkiyle yön verir. Teknik terimleri sade dille açıkla.
- **Büyük yapısal kararlar önce kullanıcıya sorulur.** Örnekler: lig yapısı, takvim, yeni ana sistem. Temaya uyan küçük eklemeler sorulmadan yapılabilir, ama cevapta açıkça belirtilir.
- **Kanon kullanıcıya ait.** CARCERIA evreni ve kullanıcının hazırladığı Carceria tarihçesi (Word dosyası) esastır. Uydurulan yer, kişi ve olayları `TASARIM.md` içinde 💡 öneri olarak işaretle.
- **Para birimi ₡ (Caron).** Metinlerde "$" kullanma.
- **Görseller:**
  - Yapay zekâ ile üretilmiş görsel kesinlikle kullanılmaz.
  - Sadece ücretsiz ve gerçek sanatçıların çizdiği hazır grafikler kullanılır.
  - CARCERIA'nın kodla çizilmiş görsel tarzı kullanılmaz.
  - Farklı sanatçıların tarzları karıştırılmaz.
  - Her grafiğin kaynağı ve lisansı `KREDILER.md` dosyasına yazılır.
- **Metinler yapay zekâ kokmamalı.** Türk futbol kültürüne ve Carceria'ya özgü, insan elinden çıkmış gibi yazılır. Genel, şablon ve süslü cümleler yazılmaz.
- **Öğretici (tutorial) yok.** Oyun doğal akışla öğretilir (CARCERIA'daki tercih).
- **Bir aşama bitmeden sonraki aşamanın kodlamasına geçilmez.** Yol haritası `TASARIM.md` 9. bölümde.

## Dünya (kısa özet; ayrıntısı TASARIM.md 3. bölümde)
- Carceria 2026'da bağımsız bir ülke: 130 km², 100 binin üstünde nüfus, başkent Carceria City.
- 1932 suçlu anlaşması sürüyor ama artık zayıf.
- Komşular: batıda Sinistra, doğuda Odexia. İki ülke arasında eski bir husumet var.

## Teknik (planlanan)
- HTML5 Canvas (sahneler) + HTML/CSS (menüler), derleme adımı olmayan JavaScript.
- Electron ile Windows `.exe`. CARCERIA'nın kurulum ve yayın düzeni (`C:\Oyunlar\CARCERIA`) örnek alınır.

## Grafikler
- Kenney Roguelike serisinin üç sayfası `assets/kenney/` altında: `sehir.png`, `ic-mekan.png`, `karakter.png`.
  - Karolar 16×16, aralarında 1 piksel boşluk var. Koordinatlar (sütun, satır) olarak yazılır.
  - Çizim: `KAYNAK.karo(ctx, sayfa, s, r, x, y)`.
- **Karakterler katmanlardan oluşur:** ten (0. sütun, satır 0–2), şort (3), ayakkabı (4), üst (6–17), saç ve sakal (19–26). Birleştirmeyi `KARAKTER.yap(tarif)` yapar.
  - Forma ve şort renkleri `boya()` ile kulüp rengine çevrilir. Futbolcu formasının temeli (10, 0) tişört karosu.
- **Bilinen karolar:**
  - sehir: çim (0,24), kaldırım (1,20), bej zemin (3,19), asfalt (11,19), koni (14,18), tel örgü (17,18), lamba (1,16–18), ağaç ve çalılar (31–36, 10–13)
  - ic: mutfak (0–9, 12–17), tek kişilik yatak (8–15, 6–7), halı (16–18, 8–11), koltuk (21–22, 4–5)

## Tarayıcıda test
- `.claude/launch.json` git'e girmiyor. Sunucuyu `python -m http.server 8420` ile başlat, sonra `http://localhost:8420/index.html` adresini aç.
- Tarayıcı JS dosyalarını önbellekten verebilir. Değişiklikten sonra dosyaları `fetch(url, {cache: "reload"})` ile yenile.

## Git
- Yerel depo `main` dalında. Kimlik: `fatihlabsai <info@playpofly.com>` (CARCERIA ile aynı).
- GitHub deposu: `fatihlabsai/KenarCizgisi` (özel), `origin` olarak bağlı.
- **İki bilgisayar kuralı (CARCERIA'daki gibi):** Oturum başında `git pull`, iş bitince commit ve `git push`.
- Commit mesajlarının sonuna şunu ekle: `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`

## Durum (24.10.2026)
- Tasarım belgesi yazıldı. Şehir ve kulüp isimleri konuldu (💡 öneri).
- Grafik denemesi (`index.html`) hazır: antrenman sahası, sokak ve ev. Kullanıcının bakıp onaylaması bekleniyor.
- Sıradaki adım: Aşama 0, yani Electron, ana menü, kayıt ve `.exe`.
