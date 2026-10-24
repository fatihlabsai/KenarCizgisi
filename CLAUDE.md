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

## Teknik
- HTML5 Canvas (sahneler) + HTML/CSS (menüler), derleme adımı olmayan vanilla JS.
  - `js/` altındaki klasik scriptler index.html'de sırayla yüklenir ve ortak global kapsamı paylaşır.
  - Sıra: kaynak, karakter, sahne-antrenman, sahne-sokak, sahne-daire, depo, cizici, arayuz, oyun, ana.
- Dosyaların görevleri:
  - `cizici.js`: etkin sahneyi 320×192'de çizip tam sayı katıyla büyütür. "kapla" kipi ana menü için, "sigdir" oyun ekranı için.
  - `arayuz.js`: ekran geçişleri, açılır pencere, bildirim, `TARIH` ve `para()` yardımcıları.
  - `oyun.js`: oyun durumu `S`, yeni kariyer, mektup, kayıt yuvaları (3 adet), duraklatma, ayarlar, ana menü.
  - `depo.js`: kayıtlar. Masaüstünde `window.masaustu` köprüsünü, tarayıcıda localStorage'ı kullanır.
- Kayıt: `%APPDATA%\KenarCizgisi\saves\kayit1..3.json` ve `ayarlar.json`. `KAYIT_SURUMU = 1`.
- Oyun 1 Temmuz 2026 Çarşamba başlar. Maaş her ayın 1'inde yatar. Başlangıçta para ₡1.840, maaş ₡2.400.
- Masaüstü: Electron 33.2.1 + electron-builder 25.1.8 (NSIS). `main.js` ve `preload.js` CARCERIA'dan uyarlandı.
- **Otomatik güncelleme** `fatihlabsai/KenarCizgisi_surumler` deposundan geliyor. Kurulu oyun 4 saniye sonra ve her 4 saatte bir denetliyor.
  - Yeni sürüm iner ve kurulmaya hazır olunca ana menüde "Şimdi kur" düğmesi çıkıyor.
- Geliştirme sürümünü açmak için `OYNA.bat`. Kurulum dosyası için `npx electron-builder --win nsis`, çıktısı `dist\KenarCizgisi Setup <sürüm>.exe`.
- **Electron testi:** `--remote-debugging-port` ile açılıp CDP üzerinden sayfada kod çalıştırılabilir.
  - `--user-data-dir` kayıt klasörünü değiştirmiyor. Testte yalnızca kullanılmayan bir yuvaya yazıp sonra silin.
  - İşlemi adıyla kapatırken dikkat: `electron.exe` CARCERIA'nın geliştirme sürümünü de kapatır.

## Grafikler
- Kenney Roguelike serisinin üç sayfası `assets/kenney/` altında: `sehir.png`, `ic-mekan.png`, `karakter.png`.
  - Karolar 16×16, aralarında 1 piksel boşluk var. Koordinatlar (sütun, satır) olarak yazılır.
  - Çizim: `KAYNAK.karo(ctx, sayfa, s, r, x, y)`.
- **Karakterler katmanlardan oluşur:** ten (0. sütun, satır 0–2), şort (3), ayakkabı (4), üst (6–17), saç ve sakal (19–26). Birleştirmeyi `KARAKTER.yap(tarif)` yapar.
  - Forma ve şort renkleri `boya()` ile kulüp rengine çevrilir. Futbolcu formasının temeli (10, 0) tişört karosu.
  - **Saçlar:** Her saç rengi 4×4'lük bir blok.
    - Bloklar: kahverengi (19,0), kızıl (23,0), sarı (19,4), siyah (23,4), beyaz (19,8).
    - Modelin yeri blok içinde aynı. Sakallar bloğun son satırında olduğu için sakal rengi saçı izliyor.
    - (0,2) ve (2–3, 0) gibi karolarda saç ve bıyık bir arada çizilmiş, bunlar katalogda yok.
  - **Üst giyim:** Renk grupları siyah (14,5), bej (10,5), turkuaz (10,0), turuncu (6,0), yeşil (6,5) ve lila (14,0). Her grupta aynı modeller aynı yerde. 4. satır ve 8–9. satırlar zırh görünümlü, kullanılmıyor.
  - `KARAKTER.KATALOG` seçenekleri tutar. Menajerin görünüşü sıra numaralarından oluşur (`S.menajer.gorunus`) ve `KARAKTER.gorunus(g)` ile çizilir.
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

## Yayın süreci (sadece kullanıcı "yayına al" deyince)
- Kod deposu `fatihlabsai/KenarCizgisi` (özel). Yayın deposu `fatihlabsai/KenarCizgisi_surumler` (herkese açık, sadece kurulum dosyaları ve README).
- **Adımlar:**
  1. `package.json` sürümünü artır.
  2. `build/release-notes.md` dosyasını Türkçe yaz.
  3. Gizli anahtar taraması yap: `git grep --cached -nIE "github_pat_|ghp_|BEGIN .*PRIVATE KEY"`
  4. Commit ve push.
  5. GH_TOKEN'ı Windows kullanıcı değişkeninden süreç içinde oku ve derleyip yayınla:
     ```powershell
     $env:GH_TOKEN = [Environment]::GetEnvironmentVariable('GH_TOKEN','User'); npx electron-builder --win nsis --publish always; Remove-Item Env:GH_TOKEN
     ```
     Token asla ekrana yazdırılmaz.
  6. Yayın sayfasının gövdesini notlarla GitHub API üzerinden PATCH'le.
  7. `https://github.com/fatihlabsai/KenarCizgisi_surumler/releases/latest/download/latest.yml` adresinin yeni sürümü gösterdiğini doğrula.
- GH_TOKEN, CARCERIA ile aynı ince ayarlı (fine-grained) anahtar. İzin listesinde iki sürümler deposu da var, Contents izni Read and write.
- Boş bir depoda sürüm oluşturulamıyor ("Repository is empty"). Bu yüzden yayın deposuna ilk kayıt olarak README eklendi.

## Durum (24.10.2026)
- **Yayında olan son sürüm v0.1.1 (ilk sürüm).** Kullanıcının bu sürümü GitHub'dan bir kez elle kurması gerekiyor, çünkü önceki yerel derlemelerde güncelleme ayarı yoktu.
- Tasarım belgesi yazıldı. Şehir ve kulüp isimleri konuldu (💡 öneri).
- Grafik denemesi kullanıcı tarafından onaylandı: arabalar düzeltildi, ev sadeleştirildi.
- **Aşama 0 bitti (v0.1.0):**
  - Ana menü (arkada antrenman sahası), yeni kariyer (ad, soyad, memleket), Kalvar Spor'un teklif mektubu.
  - Oyun ekranında ev, tarih ve para görünüyor. "Günü bitir" düğmesi var.
  - 3 kayıt yuvası, duraklatma (Esc), ayarlar (tam ekran), kapanırken otomatik kayıt.
  - Tarayıcıda ve Electron'da test edildi. Kurulum dosyası derlendi.
- **Karakter oluşturma (v0.1.1):** Yeni kariyer üç adımda ilerliyor: kimlik → görünüş (`js/gorunus.js`) → mektup.
  - Seçilebilenler: ten (5), saç (10, kel dahil), saç rengi (5), sakal (5), üst (6 model × 6 renk), pantolon (6), ayakkabı (3).
  - "Rastgele" düğmesi var. Geri dönünce girilen bilgiler korunuyor.
- Sıradaki adım: Aşama 1 (ilk dilim).
