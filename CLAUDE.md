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

## Durum (24.10.2026)
- Tasarım belgesinin ilk taslağı yazıldı, kod henüz yok.
- Sıradaki adım: grafik paketinin seçimi, ardından Aşama 0 (iskelet).
