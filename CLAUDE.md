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
  - Sıra index.html'de. Bağımlılıkları olanlar sonda: ... ekonomi, yasam, harita, oyun, ana.
- Dosyaların görevleri:
  - `veri.js`: isim listeleri (ülkelere göre), 10 kulüp, hazırlık maçları, dizilişler, oyun anlayışları.
  - `dunya.js`: kadro üretimi (kulüp başına 18 oyuncu), oyuncu gücü `guc(o, mevki)`, en iyi 11 seçimi.
  - `mac-motoru.js`: maçı dakika dakika oynatır. Olaylar ve Türkçe anlatım, taktik ve oyuncu değişikliği, bağırma, oyuncu puanları.
  - `sahne-mac.js`: 2D maç (448×256). Sıradan dakikalarda top orta alanda dolaşır, önemli anlarda atak canlandırılır.
  - `mac-ekrani.js`: skor tabelası, olay akışı, hız (×1/×2/×4), devre arası, maç sonu.
  - `antrenman.js`: 6 antrenman türü, etkileri (gelişim, kondisyon, moral) ve sahnede oynatılacak tekrarlar.
  - `sahne-antrenman.js`: ana menüde süs rondo; oyunda her türün kendi canlandırması.
  - `hafta.js`: gün akışı (sabah kulüp, akşam hayat), maç sonuçlarının işlenmesi, kafe dedikoduları. `TAM`: büyük kâğıt panel.
  - `kadro.js`: kadro tablosu, oyuncu kartı (sözleşme, sakatlık, uzatma düğmesi). Eski `secimAc` artık kullanılmıyor.
  - `taktik.js`: görsel taktik ekranı. Sahada dizilim, sürükle-bırak ya da tıkla-tıkla yer değiştirme, talimatlar, görevler, yedekler, rakip analizi. "onMac" (kayıtlı taktik) ve "mac" (maç içi) kipleri var.
  - `lig.js`: fikstür (3 devre, 27 hafta, kış arası), puan tablosu, gol krallığı, maçın oyunculara etkisi (`oyunculariIsle`), diğer lig maçları, baraj, yeni sezon, lig ekranı.
  - `yonetim.js`: sezon başı hedef ve bütçe toplantısı, maç sonrası güven, aylık kontrol (uyarı ve kovulma), sözleşme hatırlatmaları, sezon sonu ve yaz tatili.
  - `sozlesme.js`: oyuncuyla maaş ve süre pazarlığı (transfer, serbest, uzatma). Maaş bütçesi aşılamaz.
  - `transfer.js`: pencereler (temmuz–ağustos, ocak), teklif ve karşı teklif, serbest oyuncular, bize gelen teklifler, kulüpler arası transferler, transfer ekranı.
  - `basin.js`: cuma basın toplantısı (muhabir Mira Halvor).
  - `sehir.js`: Kalvar haritası. 4 bölge (lale, carsi, avlu, ova) ve 9 iç mekân (3 ev, kafe, lokanta, banka, emlak, eşya, galeri).
    - Bölgeler sadece veri: zemin, binalar (çatı + cephe), kapılar, ağaç/lamba/bank, engel ızgarası, bölge çıkışları, gezinti noktaları.
    - Binanın kapısına alttaki kaldırım karesinden girilir.
  - `sahne-dunya.js`: yürünebilir dünya. Sokakta 400×240, iç mekânda 280×168 görüş. `tamResim(bolgeId, ay)` bir bölgenin insansız tam resmini verir (gündüz sokak sahnesi ve harita için).
    - Hareket: oklar/WASD ya da fareyle tıklama (karo ızgarasında genişlik öncelikli yol bulma). Çarpışma ayak kutusuyla yapılır.
    - Kamera menajeri takip eder. Mevsime göre karanlık, lamba ve pencere ışıkları, yağmur.
    - Yürüyen insanlar ve yoldan geçen arabalar. E / Enter / Boşluk ile etkileşim.
  - `yasam.js`: akşam ve pazar akışı.
    - Saat: 1 gerçek saniye 2 oyun dakikası. Akşam 18:00'de, pazar 10:00'da evden başlar. 01:00'de zorla eve dönülür.
    - Mekânların açılış saatleri, kapılar, tanıdıklar ve konuşmalar, tanışma, uyku, ayna (görünüş değiştirme).
  - `harita.js`: M haritası (TAM paneli). Kalvar sekmesi dört bölgenin `tamResim` görüntüsü, mekân etiketleri, menajerin yeri (kırmızı nokta), mekân bilgisi ve açılış saatleri. Akşam dünyadayken araçla gitme (araba 10, bisiklet 20 dakika, `YASAM.git`). Ülke sekmesi: Sinistra, Carceria (pusula düzeninde şehirler, ligdeki kulüpler, yatırımlar), Odexia. M tuşu, alt çubuktaki ve akşam panelindeki "Harita (M)" düğmesi açar. Harita açıkken saat işlemez.
  - `ekonomi.js`: evler (kirala/satın al/taşın), mobilya (evde görünür), araba (bölgeler arası hızlı geçiş), banka (mevduat %0,4, kredi %1,5), yatırımlar (Tessel daire, Mirov arsa ve yazlık, kafe ortaklığı), ay başı gelir-gider, Hayatım ekranı.
  - `gazete.js`: pazar günü çıkan Sınır Postası.
  - `cizici.js`: etkin sahneyi kendi çözünürlüğünde (varsayılan 320×192) çizip tam sayı katıyla büyütür. "kapla" ana menü, "sigdir" oyun içi. `balon()` ve `ustCiz()` keskin yazı için.
  - `arayuz.js`: ekran geçişleri, açılır pencere, bildirim, `TARIH`, `para()`, Türkçe ek yardımcıları `ek(ad, "in"|"i"|"e"|"de"|"le"|"lik")` ve `sayiEk(n, ...)`.
  - `oyun.js`: oyun durumu `S`, yeni kariyer, kayıt yuvaları, eski kayıtların yükseltilmesi (`guncelDurum`), duraklatma, ayarlar, ana menü.
  - `depo.js`: kayıtlar. Masaüstünde `window.masaustu` köprüsünü, tarayıcıda localStorage'ı kullanır.
- Kayıt: `%APPDATA%\KenarCizgisi\saves\kayit1..3.json` ve `ayarlar.json`. `KAYIT_SURUMU = 4`. Eski kayıtlar açılırken `guncelDurum` ile tamamlanır (kadro, sözleşme, lig, bütçe o an eklenir).
- **Oyun durumu (S):** tohum, kulupId, menajer (görünüş, enerji, stres), itibar (yönetim, taraftar), takimlar (kadro + taktik + butce), gun (asama: sabah/aksam, rapor, aksamSonuc), maclar, gazeteler, basin, bilinen (öğrenilen rakip dizilişleri), duyulanlar, gunluk.
  - v3 ile gelenler: lig (fikstür ve sonuçlar), hazirlik, serbest (bonservissiz oyuncular), transfer (gelen teklifler, geçmiş), hedef, sezonlar, ekKulupler (alt ligden çıkanlar), kovuldu, ev.kira / ev.kiraBaslangic.
  - v4 ile gelenler: hayat {iliski, tanisma, partner, araba, mobilya, yatirimlar, banka {mevduat, borc}, yagmur, konusulan}, itibar.sehir ve itibar.basin, ev.id ("ev:daire" ve diğerleri), gun.dunya {bolge, konum, saat, tur}.
  - Oyuncu: oz (7 özellik), kondisyon, moral, form, maas, bitis, sakatlik {gun, tur}, ceza (maç), sezon {mac, gol, asist, sari, kirmizi, puan}, gelisim, gorunus.
  - Taktik: dizilis, anlayis, talimat {hat, pres, pas, genislik}, gorev {kaptan, penalti, duran}, ilk11.
- **Takvim:** Yeni kariyer 27 Temmuz 2026 Pazartesi başlar. Pzt–Per antrenman, Cuma basın ve kadro, Cumartesi maç, Pazar gazete ve izin.
  - Gündüz kulüp işleri panelden yapılır. "Akşama geç" ile Kalvar'da yürünebilir akşam başlar (yasam.js). Pazar "Dışarı çık" ile evden 10:00'da başlar.
  - Akşamın yerleri: kafe (₡14, 1 saat, dedikodu), lokanta (yalnız ₡25 ya da oyuncuyla ₡60), ev (yatak = günü bitir, ayna), banka, emlak, eşya, galeri, komşu kapıları, ova (stresi azaltır).
  - Hazırlık maçları: 1, 8, 15, 22 Ağustos (sonraki sezonlarda `LIG.hazirlikUret`).
  - **Lig:** 29 Ağustos 2026'dan 20 Mart 2027'ye 27 hafta. Kış arası 19 Aralık–2 Ocak. Sezon bitince baraj, değerlendirme ve yaz tatili. Yeni sezon temmuzun son pazartesi başlar.
  - Maaş her ayın 1'inde yatar. Başlangıçta para ₡1.840, maaş ₡2.400. Kira (₡620) 1 Kasım 2026'dan itibaren maaştan düşer. Hedef tutarsa maaş +₡300.
  - Yönetim güveni 28'in altına düşerse ay başında uyarı gelir, 12'nin altına düşerse kovulursun. Küme düşmek de kovulmak demek.
- **Maç motoru dengesi (Aşama 2):** Ligin bütün eşleşmelerinde maç başına ~3,0 gol, %22 beraberlik, maç başına ~0,25 penaltı, takım başına ~0,2 sakatlık. City–Ova ~3,4–0,6.
  - Talimatların etkisi küçük ama gerçek: önde hat maçı açar, yoğun pres kazandırır ama yorar (maç sonu kondisyon 76 yerine 71).
- **Gelişim dengesi:** Antrenman katsayısı 0.032 (eskiden 0.13, takım bir buçuk sezonda 61'den 85'e çıkıyordu).
  - Bütün kulüplere pazartesi günleri `DUNYA.haftalikGelisim` uygulanıyor. Gençler gelişiyor, 31 yaşından sonra hız ve dayanıklılık düşüyor.
  - Test: bir buçuk sezonda Kalvar 60'tan 64'e, rakipler 1–4 puan arttı.
  - Deneme betiği: `veri, karakter, dunya, mac-motoru` dosyaları Node `vm` ile yüklenip `MAC.hizliOyna` çağrılıyor. Atak olasılığı `0.165 * oran ** 0.9`.
- **Otomatik oynatma testi:** Tarayıcıda bir bot (`window.oto(gün)`) düğmelere basarak günleri geçirir. Maçlarda "Sonuca geç"i kullanır, akşamları `YASAM.uyu(false)` ile günü bitirir. Uzun koşular arka planda başlatılıp `otoBitti`/`otoLog` ile izlenir, çünkü tek çağrı 45 saniyeyi geçemez.
- Masaüstü: Electron 33.2.1 + electron-builder 25.1.8 (NSIS). `main.js` ve `preload.js` CARCERIA'dan uyarlandı.
- **Otomatik güncelleme** `fatihlabsai/KenarCizgisi_surumler` deposundan geliyor. Kurulu oyun 4 saniye sonra ve her 4 saatte bir denetliyor.
  - Yeni sürüm iner ve kurulmaya hazır olunca ana menüde "Şimdi kur" düğmesi çıkıyor.
- Geliştirme sürümünü açmak için `OYNA.bat`. Kurulum dosyası için `npx electron-builder --win nsis`, çıktısı `dist\KenarCizgisi Setup <sürüm>.exe`.
- **Electron testi:** `--remote-debugging-port` ile açılıp CDP üzerinden sayfada kod çalıştırılabilir.
  - `--user-data-dir` kayıt klasörünü değiştirmiyor, test gerçek kayıt klasörünü kullanır. **Kullanıcının gerçek kayıtları orada (kayit1, kayit2, kayit3).** Testte bunlar sadece okunur.
    - Testte yalnızca `kayittest` adlı yuvaya yazıp sonra silin (`yeniDurum(..., "test")`).
    - `kayit1..3` yuvalarına asla yazmayın.
  - İşlemi adıyla kapatırken dikkat: `electron.exe` CARCERIA'nın geliştirme sürümünü de kapatır.

## Grafikler
- Kenney Roguelike serisinin üç sayfası `assets/kenney/` altında: `sehir.png`, `ic-mekan.png`, `karakter.png`.
- **Sokaklar RPG Urban Pack ile çiziliyor** (`assets/kenney/urban.png`, sayfa adı "urban"). Kullanıcı Aşama 4'te bunu seçti.
  - `sehir.png` artık sadece iç mekân zeminlerinde, maç ve antrenman sahnelerinde kullanılıyor.
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
- **Urban karoları (sütun, satır):**
  - Kenarlı 3×3 alanlar (sol üst köşe): çim (0,0), bej taş (0,3), gri kaldırım (8,0), gri çatı (8,3), su (8,6). `SEHIR` içindeki `alan()` kenarları seçer.
  - Asfalt düz (9,16)/(9,17), kesik orta çizgi (1,16), yaya geçidi (0,15–17), park kutusu (5–6,16–17).
  - Cephe: kırmızı tuğla 17–19 / turuncu tuğla 17–19 sütunları (satır 0–3 ve 4–7), sade türleri 20–22, köşe sütunu 16. Satırlar: 0 saçak, 1 kat silmesi, 2 düz duvar, 3 zemin kat.
  - Pencereler bej çerçeve (11–13, 12–14), gri çerçeve (11–13, 15–17). Kapılar (13–15, 9–10), demir kapı (15,12). Vitrin camı (8–10,14). Tente (4–6,12, yeşil; diğer renkler ton kaydırma).
  - Ağaçlar (16–17, 8–10), sonbahar (16–17, 11–13), tek karoluk çalı ve fidan (22, 8–13), koru 3×3 (18–20, 8–10 / 11–13).
  - Lamba (3,6–7), park feneri (7,6–7), durak tabelası (4,6–7), banklar (7,9) ve (0,10), çöp (9–10, 9–10), posta kutusu (8,11), çitler (4–6,13 tel; 4–6,14 ahşap).
  - Arabalar: önden (15–16, 14–17), yukarıdan (17, 14–17; burnu aşağı). Yolda giden arabalar 90° döndürülüyor (`SAHNE_DUNYA.arabaResmi`).
  - Kasabalılar 23–26. sütunlar, kişi başına 3 satır (duruş + iki adım). 23 sola, 24 öne, 25 arkaya bakar, 26 sola bakanın aynası. 1 ve 5 kadın.
- **Eski sayfanın bilinen karoları:**
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
- **Yayında olan son sürüm v0.4.0 (Kalvar).**
- Aşama 0, karakter oluşturma, Aşama 1 (v0.2.0) ve Aşama 2 (v0.3.0) bitti.
- Kullanıcının v0.3.0 geri bildirimi: "Yaşayan bir dünya hissi alamadım, yürüyemiyoruz, dünya genişleyebilir." Aşama 3 bunun üzerine kuruldu.
- **Aşama 3 bitti (v0.4.0, yayında):**
  - Yürünebilir Kalvar: Lale Sokak, Çarşı, Avlu Stadı önü, Ova kenarı ve 9 iç mekân.
  - Akşam saati, gece ışıkları, yağmur, yürüyen insanlar, arabalar.
  - Tanıdıklar ve konuşmalar: taraftarlar maç sonucuna göre konuşur, oyuncular moraline göre. Gazeteci ilişki arttıkça gerçek kulis verir.
  - Rastgele tanışma ve partner.
  - Ev (3 ev), mobilya, araba, banka, yatırımlar, Hayatım ekranı, 4 itibar.
  - Gazete menajerin hayatını da haber yapıyor.
- 💡 Bu aşamada eklenenler:
  - İsimler: Ovalı Lokantası (Dora), Kalvar Bankası (Bay Tamm), Varga Emlak (Ilse Varga), Petri Eşya (Petri usta), Kask Oto Galeri (Rado Kask), araba markaları (Ova, Ferrano, Tyrenna).
  - **Kanon önerisi:** CARCERIA'nın 1982 gardiyanları Jovan Petri ve Lena Sorova bugün Lale Sokak'ta yaşayan emekliler. Kullanıcının onayı gerekiyor.
- Kullanıcının v0.4.0 geri bildirimi:
  - "Ev vb. yapıların görüntüleri çok kötü."
  - "M'ye basınca açılan bir harita olsun."
  - İkisi de Aşama 4'ün ilk işi olarak listede (TASARIM.md 9.4).
- **Aşama 4 başladı (plan onaylandı, TASARIM.md 9.5):**
  - 1. iş bitti: Kalvar RPG Urban Pack ile yeniden kuruldu.
  - 2. iş bitti: M haritası (Kalvar ve ülke). Eski "Arabayla git…" listesinin yerini aldı.
  - İkisi de henüz yayınlanmadı.
  - Sıradaki iş: Carceria City (TASARIM.md 9.5, madde 1).
